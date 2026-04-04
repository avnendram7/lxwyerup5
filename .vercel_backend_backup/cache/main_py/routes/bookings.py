from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timedelta
import uuid
from models.booking import Booking, BookingCreate
from services.database import db
from routes.auth import get_current_user
from .notifications import create_notification

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/guest", response_model=dict)
async def create_guest_booking(booking_data: dict):
    """Create a booking without authentication (for first-time users)"""
    booking_id = str(uuid.uuid4())
    
    booking_doc = {
        'id': booking_id,
        'fullName': booking_data.get('fullName'),
        'email': booking_data.get('email'),
        'phone': booking_data.get('phone'),
        'consultationType': booking_data.get('consultationType'),
        'date': booking_data.get('date'),
        'time': booking_data.get('time'),
        'description': booking_data.get('description', ''),
        'amount': booking_data.get('amount'),
        'status': booking_data.get('status', 'confirmed'),
        'payment_status': booking_data.get('payment_status', 'paid'),
        'payment_method': booking_data.get('payment_method', 'card'),
        'card_last_four': booking_data.get('card_last_four', ''),
        'created_at': datetime.utcnow().isoformat(),
        'client_id': None  # Will be linked when user signs up
    }
    
    await db.bookings.insert_one(booking_doc)
    return {'id': booking_id, 'message': 'Booking created successfully'}


@router.post("", response_model=Booking)
async def create_booking(booking_data: BookingCreate, current_user: dict = Depends(get_current_user)):
    """Create a new booking"""
    if current_user.get('user_type') != 'client':
        raise HTTPException(status_code=403, detail='Only clients can book consultations')
    
    # Check for free trial eligibility
    previous_bookings_count = await db.bookings.count_documents({
        "client_id": current_user['id'],
        "is_free_trial": True
    })
    
    is_free_trial = False
    price = booking_data.price
    from datetime import timedelta
    
    # CONFLICT CHECKING
    try:
        # Parse booking start time
        # Handle time formats "HH:MM" or "HH:MM AM/PM"
        time_str = booking_data.time.strip()
        date_str = booking_data.date
        
        try:
             # Try 24hr format first
             start_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        except ValueError:
             # Try 12hr format
             start_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %I:%M %p")
             
        end_dt = start_dt + timedelta(minutes=booking_data.duration_minutes)
        
        # Check against Events
        conflict_event = await db.events.find_one({
            "lawyer_id": booking_data.lawyer_id,
            "start_time": {"$lt": end_dt.isoformat()},
            "end_time": {"$gt": start_dt.isoformat()}
        })
        
        if conflict_event:
            raise HTTPException(status_code=400, detail="Lawyer is not available at this time (Calendar Conflict)")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error checking conflicts: {e}")
        # If date parsing fails, proceed but log the warning
        pass

    if previous_bookings_count < 3:
        is_free_trial = True
        price = 0.0
    else:
        # Pricing logic based on duration
        if price == 0.0:
            if booking_data.duration_minutes <= 30:
                price = 500.0
            elif booking_data.duration_minutes <= 60:
                price = 1000.0
            else:
                price = 1500.0

    # Determine Location based on Consultation Type
    location = ""
    meet_link = ""
    
    if booking_data.consultation_type == 'video':
        meet_link = f"https://meet.google.com/{uuid.uuid4().hex[:3]}-{uuid.uuid4().hex[:4]}-{uuid.uuid4().hex[:3]}"
        location = "Google Meet"
    elif booking_data.consultation_type == 'audio':
        location = "831216968" # Dummy number as requested
    elif booking_data.consultation_type == 'in_person':
        # Fetch Lawyer's Address
        lawyer = await db.users.find_one({"id": booking_data.lawyer_id})
        if lawyer and 'office_address' in lawyer:
            location = lawyer['office_address']
        elif lawyer and 'city' in lawyer:
            location = f"{lawyer['city']}, {lawyer.get('state', '')}"
        else:
            location = "Lawyer's Office (Address pending)"
            
    booking_dict = booking_data.model_dump()
    booking_dict['client_id'] = current_user['id']
    booking_dict['price'] = price
    booking_dict['meet_link'] = meet_link
    booking_dict['location'] = location
    booking_dict['is_free_trial'] = is_free_trial
    booking_dict['status'] = booking_data.status or 'pending'

    # ── Store lawyer name + photo at creation (reliable, no later lookup needed) ──
    # Prefer name from request; fall back to DB lookup
    if not booking_dict.get('lawyer_name'):
        lawyer_doc = await db.users.find_one({'id': booking_data.lawyer_id}, {'_id': 0, 'full_name': 1, 'photo': 1, 'consultation_fee': 1})
        if not lawyer_doc:
            from bson import ObjectId
            try:
                lawyer_doc = await db.users.find_one({'_id': ObjectId(booking_data.lawyer_id)}, {'_id': 0, 'full_name': 1, 'photo': 1, 'consultation_fee': 1})
            except Exception:
                lawyer_doc = None
        if lawyer_doc:
            booking_dict['lawyer_name'] = lawyer_doc.get('full_name', '')
            ph = lawyer_doc.get('photo', '')
            if ph and not ph.startswith('http') and not ph.startswith('data:'):
                ph = f"http://localhost:8000{ph if ph.startswith('/') else '/' + ph}"
            booking_dict['lawyer_photo'] = ph
            # Store lawyer's listed fee separately from actual price paid
            if not booking_dict.get('consultation_fee') or booking_dict['consultation_fee'] == 0:
                booking_dict['consultation_fee'] = lawyer_doc.get('consultation_fee', 0) or booking_data.amount or 0

    # If consultation_fee still not set, use amount sent from frontend
    if not booking_dict.get('consultation_fee') or booking_dict['consultation_fee'] == 0:
        booking_dict['consultation_fee'] = booking_data.amount or booking_data.price or 0

    booking_obj = Booking(**booking_dict)

    doc = booking_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()

    await db.bookings.insert_one(doc)

    # ── Notify Lawyer — resolve canonical id (booking stores ObjectId string) ──
    lawyer_notif_id = booking_data.lawyer_id
    try:
        from bson import ObjectId as ObjId
        # First try: booking.lawyer_id IS already the lawyer's UUID id field
        lawyer_notif_doc = await db.users.find_one({'id': booking_data.lawyer_id}, {'_id': 0, 'id': 1})
        if not lawyer_notif_doc:
            # Second try: it's a MongoDB ObjectId string, resolve to UUID id field
            lawyer_notif_doc = await db.users.find_one({'_id': ObjId(booking_data.lawyer_id)}, {'_id': 0, 'id': 1})
        if lawyer_notif_doc and lawyer_notif_doc.get('id'):
            lawyer_notif_id = lawyer_notif_doc['id']
    except Exception as ne:
        print(f"Notification lawyer id resolve error: {ne}")

    await create_notification(
        user_id=lawyer_notif_id,
        title="New Consultation Request",
        message=f"You have a new consultation request for {booking_data.date} at {booking_data.time}.",
        n_type="booking_request",
        related_id=booking_obj.id
    )

    return booking_obj


@router.get("", response_model=List[Booking])
async def get_bookings(current_user: dict = Depends(get_current_user)):
    """Get bookings for current user"""
    print(f"DEBUG - get_bookings - Current User ID: {current_user['id']}")
    if current_user['id'].startswith("dummy_") or current_user['id'] == "73bad559-643c-4ec2-bd7c-c769171efaa2":
        # Return dummy bookings for dummy users
        dummy_booking_1 = {
            'id': 'dummy_booking_1',
            'client_id': 'dummy_client_1',
            'lawyer_id': current_user['id'],
            'client_name': 'Sarah Jenkins',
            'date': (datetime.utcnow() + timedelta(days=2)).strftime('%Y-%m-%d'),
            'time': '14:30',
            'description': 'Needs assistance with property dispute and contract review.',
            'price': 500.0,
            'status': 'pending',
            'payment_status': 'paid',
            'consultation_type': 'video',
            'created_at': datetime.utcnow()
        }
        dummy_booking_2 = {
            'id': 'dummy_booking_2',
            'client_id': 'dummy_client_2',
            'lawyer_id': current_user['id'],
            'client_name': 'Michael Chen',
            'date': (datetime.utcnow() + timedelta(days=5)).strftime('%Y-%m-%d'),
            'time': '10:00',
            'description': 'Initial consultation for tech startup incorporation.',
            'price': 1000.0,
            'status': 'pending',
            'payment_status': 'paid',
            'consultation_type': 'in_person',
            'created_at': datetime.utcnow()
        }
        bookings = [dummy_booking_1, dummy_booking_2]
    else:
        from bson import ObjectId as ObjId
        uid = current_user['id']
        if current_user['user_type'] == 'client':
            # Try searching by 'client_id' field (UUID or ObjectId string)
            bookings = await db.bookings.find({'client_id': uid}, {'_id': 0}).to_list(100)
            if not bookings:
                try:
                    bookings = await db.bookings.find({'client_id': str(ObjId(uid))}, {'_id': 0}).to_list(100)
                except Exception:
                    bookings = []
        else:
            # For lawyers: also try ObjectId form since GET /lawyers converts _id → id
            bookings = await db.bookings.find({'lawyer_id': uid}, {'_id': 0}).to_list(100)
            # Also find bookings where lawyer_id was stored as the ObjectId string of THIS lawyer
            try:
                lawyer_doc = await db.users.find_one({'id': uid}, {'_id': 1})
                if lawyer_doc:
                    oid_str = str(lawyer_doc['_id'])
                    if oid_str != uid:
                        extra = await db.bookings.find({'lawyer_id': oid_str}, {'_id': 0}).to_list(100)
                        existing_ids = {b['id'] for b in bookings}
                        bookings += [b for b in extra if b['id'] not in existing_ids]
            except Exception as e:
                print(f'ObjectId lookup error: {e}')
    
    from bson import ObjectId

    for booking in bookings:
        if isinstance(booking.get('created_at'), str):
            dt_str = booking['created_at'].replace('Z', '+00:00') if booking['created_at'].endswith('Z') else booking['created_at']
            booking['created_at'] = datetime.fromisoformat(dt_str)

        # ── Helper: find user by id or _id ──────────────────────────────────
        async def find_user(uid: str, fields: dict):
            """Try 'id' field first (custom UUID), then MongoDB ObjectId."""
            user = await db.users.find_one({'id': uid}, fields)
            if not user:
                try:
                    user = await db.users.find_one({'_id': ObjectId(uid)}, fields)
                except Exception:
                    pass
            return user

        # ── Enrich with client name for lawyer view ──────────────────────────
        if current_user['user_type'] == 'lawyer' and booking.get('client_id') and not booking.get('client_name'):
            client = await find_user(booking['client_id'], {'_id': 0, 'full_name': 1, 'email': 1, 'photo': 1})
            if client:
                booking['client_name'] = client.get('full_name') or client.get('email', 'Client')
                if client.get('photo'):
                    booking['client_photo'] = client['photo']

        # ── Enrich with lawyer name + photo for client view ──────────────────
        if current_user['user_type'] == 'client' and booking.get('lawyer_id') and not booking.get('lawyer_name'):
            lawyer = await find_user(booking['lawyer_id'], {'_id': 0, 'full_name': 1, 'email': 1, 'photo': 1})
            if lawyer:
                booking['lawyer_name'] = lawyer.get('full_name') or lawyer.get('email', 'Your Lawyer')
                if lawyer.get('photo'):
                    # Return absolute URL if it's a relative path
                    ph = lawyer['photo']
                    if ph and not ph.startswith('http') and not ph.startswith('data:'):
                        ph = f"http://localhost:8000{ph if ph.startswith('/') else '/' + ph}"
                    booking['lawyer_photo'] = ph

        # ── Normalise location text ──────────────────────────────────────────
        if booking.get('consultation_type') == 'video' and booking.get('location') in ('Google Meet', 'google meet', '', None):
            booking['location'] = 'Video Call'

        # ── Ensure price is always a number ─────────────────────────────────
        if booking.get('price') is None:
            booking['price'] = 0

    return bookings


@router.patch("/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    status: str = None,           # from query param: ?status=confirmed
    payload: dict = None,         # from JSON body: {"status": "confirmed"}
):
    """Update booking status (lawyers only). Accepts status via query param OR JSON body."""
    from fastapi import Body
    if current_user['user_type'] != 'lawyer':
        raise HTTPException(status_code=403, detail='Only lawyers can update booking status')
    
    # Resolve status from query param or body
    resolved_status = status
    if not resolved_status and payload and 'status' in payload:
        resolved_status = payload['status']
    if not resolved_status:
        raise HTTPException(status_code=422, detail='status is required')

    # ── Find booking by id, then verify lawyer owns it (handles ObjectId/UUID mismatch) ──
    booking = await db.bookings.find_one({'id': booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')

    # Check the lawyer owns this booking — lawyer_id may be UUID or ObjectId string
    lawyer_uid = current_user['id']
    lawyer_oid_str = None
    try:
        from bson import ObjectId as ObjId
        lawyer_doc = await db.users.find_one({'id': lawyer_uid}, {'_id': 1})
        if lawyer_doc:
            lawyer_oid_str = str(lawyer_doc['_id'])
    except Exception:
        pass

    if booking.get('lawyer_id') not in (lawyer_uid, lawyer_oid_str):
        raise HTTPException(status_code=403, detail='Not authorized to update this booking')

    await db.bookings.update_one({'id': booking_id}, {'$set': {'status': resolved_status}})

    # Notify client about status change
    if booking.get('client_id'):
        status_labels = {
            'confirmed': ('Consultation Accepted ✓', 'confirmed'),
            'cancelled': ('Consultation Declined', 'declined'),
            'rescheduled': ('Consultation Rescheduled 📅', 'rescheduled'),
        }
        title, label = status_labels.get(resolved_status, (f"Consultation {resolved_status.capitalize()}", resolved_status))
        message = f"Your consultation on {booking['date']} at {booking.get('time', '')} has been {label}."
        await create_notification(
            user_id=booking['client_id'],
            title=title,
            message=message,
            n_type=f"booking_{resolved_status}",
            related_id=booking_id
        )

    return {'success': True, 'status': resolved_status}

@router.patch("/{booking_id}/reschedule")
async def reschedule_booking(booking_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    """Lawyer reschedules a booking — stores proposed slot and 12-hr deadline for the user to respond."""
    date = body.get('date')
    time = body.get('time')
    if not date or not time:
        raise HTTPException(status_code=422, detail='date and time are required')
    if current_user['user_type'] != 'lawyer':
        raise HTTPException(status_code=403, detail='Only lawyers can reschedule consultations')

    booking = await db.bookings.find_one({'id': booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')

    lawyer_uid = current_user['id']
    lawyer_oid_str = None
    try:
        from bson import ObjectId as ObjId
        ldoc = await db.users.find_one({'id': lawyer_uid}, {'_id': 1})
        if ldoc:
            lawyer_oid_str = str(ldoc['_id'])
    except Exception:
        pass
    if booking.get('lawyer_id') not in (lawyer_uid, lawyer_oid_str):
        raise HTTPException(status_code=403, detail='Not authorized')

    deadline = datetime.utcnow() + timedelta(hours=12)

    await db.bookings.update_one({'id': booking_id}, {'$set': {
        'status': 'rescheduled_by_lawyer',
        'proposed_date': date,
        'proposed_time': time,
        'reschedule_by': 'lawyer',
        'reschedule_deadline': deadline.isoformat(),
    }})

    if booking.get('client_id'):
        await create_notification(
            user_id=booking['client_id'],
            title="📅 Lawyer Rescheduled Your Appointment",
            message=f"Your lawyer proposed a new time: {date} at {time}. Please accept or suggest another time within 12 hours.",
            n_type="booking_rescheduled_by_lawyer",
            related_id=booking_id
        )

    return {'success': True, 'reschedule_deadline': deadline.isoformat()}


@router.post("/{booking_id}/reschedule-response")
async def user_reschedule_response(booking_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    """User responds to lawyer's reschedule: 'accept' or 'counter' with a new date/time."""
    if current_user['user_type'] != 'client':
        raise HTTPException(status_code=403, detail='Only clients can respond to reschedule requests')

    action = body.get('action')  # "accept" or "counter"
    if action not in ('accept', 'counter'):
        raise HTTPException(status_code=422, detail='action must be "accept" or "counter"')

    booking = await db.bookings.find_one({'id': booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')
    if booking.get('client_id') != current_user['id']:
        raise HTTPException(status_code=403, detail='Not authorized')
    if booking.get('status') != 'rescheduled_by_lawyer':
        raise HTTPException(status_code=400, detail='Booking is not awaiting your response')

    # Check deadline not expired
    deadline_str = booking.get('reschedule_deadline')
    if deadline_str:
        try:
            dl = datetime.fromisoformat(deadline_str.replace('Z', '+00:00')) if isinstance(deadline_str, str) else deadline_str
            if dl.replace(tzinfo=None) < datetime.utcnow():
                raise HTTPException(status_code=400, detail='Response deadline has passed — booking auto-cancelled')
        except HTTPException:
            raise
        except Exception:
            pass

    # Resolve lawyer notification id
    lawyer_notif_id = booking.get('lawyer_id')
    try:
        from bson import ObjectId as ObjId
        ldoc = await db.users.find_one({'id': lawyer_notif_id}, {'_id': 0, 'id': 1})
        if ldoc:
            lawyer_notif_id = ldoc['id']
    except Exception:
        pass

    if action == 'accept':
        # Accept lawyer's proposed time
        new_date = booking.get('proposed_date') or booking.get('date')
        new_time = booking.get('proposed_time') or booking.get('time')
        await db.bookings.update_one({'id': booking_id}, {'$set': {
            'status': 'confirmed',
            'date': new_date,
            'time': new_time,
            'proposed_date': None,
            'proposed_time': None,
            'reschedule_by': None,
            'reschedule_deadline': None,
        }})
        await create_notification(
            user_id=lawyer_notif_id,
            title="✅ Client Accepted Reschedule",
            message=f"Your client accepted the rescheduled time: {new_date} at {new_time}.",
            n_type="reschedule_accepted",
            related_id=booking_id
        )
        return {'success': True, 'action': 'accepted', 'date': new_date, 'time': new_time}

    else:  # counter
        new_date = body.get('date')
        new_time = body.get('time')
        if not new_date or not new_time:
            raise HTTPException(status_code=422, detail='date and time are required for counter-proposal')

        deadline = datetime.utcnow() + timedelta(hours=12)
        await db.bookings.update_one({'id': booking_id}, {'$set': {
            'status': 'rescheduled_by_user',
            'proposed_date': new_date,
            'proposed_time': new_time,
            'reschedule_by': 'user',
            'reschedule_deadline': deadline.isoformat(),
        }})
        await create_notification(
            user_id=lawyer_notif_id,
            title="🔄 Client Proposed New Time",
            message=f"Your client suggested a new appointment time: {new_date} at {new_time}. Please accept or decline within 12 hours.",
            n_type="reschedule_counter_by_user",
            related_id=booking_id
        )
        return {'success': True, 'action': 'counter', 'reschedule_deadline': deadline.isoformat()}


@router.post("/{booking_id}/lawyer-reschedule-response")
async def lawyer_reschedule_response(booking_id: str, body: dict, current_user: dict = Depends(get_current_user)):
    """Lawyer responds to user's counter-proposal: 'accept' or 'reject'."""
    if current_user['user_type'] != 'lawyer':
        raise HTTPException(status_code=403, detail='Only lawyers can respond here')

    action = body.get('action')
    if action not in ('accept', 'reject'):
        raise HTTPException(status_code=422, detail='action must be "accept" or "reject"')

    booking = await db.bookings.find_one({'id': booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')

    lawyer_uid = current_user['id']
    lawyer_oid_str = None
    try:
        from bson import ObjectId as ObjId
        ldoc = await db.users.find_one({'id': lawyer_uid}, {'_id': 1})
        if ldoc:
            lawyer_oid_str = str(ldoc['_id'])
    except Exception:
        pass
    if booking.get('lawyer_id') not in (lawyer_uid, lawyer_oid_str):
        raise HTTPException(status_code=403, detail='Not authorized')
    if booking.get('status') != 'rescheduled_by_user':
        raise HTTPException(status_code=400, detail='No pending counter-proposal from user')

    client_id = booking.get('client_id')

    if action == 'accept':
        new_date = booking.get('proposed_date') or booking.get('date')
        new_time = booking.get('proposed_time') or booking.get('time')
        await db.bookings.update_one({'id': booking_id}, {'$set': {
            'status': 'confirmed',
            'date': new_date,
            'time': new_time,
            'proposed_date': None,
            'proposed_time': None,
            'reschedule_by': None,
            'reschedule_deadline': None,
        }})
        if client_id:
            await create_notification(
                user_id=client_id,
                title="✅ Appointment Confirmed",
                message=f"Your lawyer accepted your proposed time: {new_date} at {new_time}. Your appointment is confirmed!",
                n_type="reschedule_accepted",
                related_id=booking_id
            )
        return {'success': True, 'action': 'accepted', 'date': new_date, 'time': new_time}

    else:  # reject → cancel
        await db.bookings.update_one({'id': booking_id}, {'$set': {
            'status': 'cancelled',
            'cancel_reason': 'Reschedule not agreed upon',
            'proposed_date': None,
            'proposed_time': None,
            'reschedule_by': None,
            'reschedule_deadline': None,
        }})
        if client_id:
            await create_notification(
                user_id=client_id,
                title="❌ Appointment Cancelled",
                message="Your lawyer could not agree on a new time. The appointment has been cancelled.",
                n_type="booking_cancelled",
                related_id=booking_id
            )
        return {'success': True, 'action': 'rejected'}



@router.patch("/{booking_id}/cancel")
async def cancel_booking(booking_id: str, reason: str = "", current_user: dict = Depends(get_current_user)):
    """Cancel a booking (lawyers or clients)"""
    booking = await db.bookings.find_one({'id': booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')

    uid = current_user['id']
    oid_str = None
    try:
        from bson import ObjectId as ObjId
        udoc = await db.users.find_one({'id': uid}, {'_id': 1})
        if udoc:
            oid_str = str(udoc['_id'])
    except Exception:
        pass

    if current_user['user_type'] == 'lawyer':
        if booking.get('lawyer_id') not in (uid, oid_str):
            raise HTTPException(status_code=403, detail='Not authorized')
    else:
        if booking.get('client_id') not in (uid, oid_str):
            raise HTTPException(status_code=403, detail='Not authorized')

    await db.bookings.update_one({'id': booking_id}, {'$set': {'status': 'cancelled', 'cancel_reason': reason}})

    # Notify the other party
    target_id = booking.get('client_id') if current_user['user_type'] == 'lawyer' else booking.get('lawyer_id')
    if target_id:
        await create_notification(
            user_id=target_id,
            title="Consultation Cancelled",
            message=f"Consultation for {booking['date']} has been cancelled.{' Reason: ' + reason if reason else ''}",
            n_type="booking_cancelled",
            related_id=booking_id
        )

    return {'success': True}


@router.post("/{booking_id}/review")
async def submit_review(booking_id: str, review: dict, current_user: dict = Depends(get_current_user)):
    """Submit a star rating and review for a completed booking"""
    rating = review.get('rating')
    comment = review.get('comment', '')

    if not rating or not (1 <= int(rating) <= 5):
        raise HTTPException(status_code=422, detail='Rating must be between 1 and 5')

    booking = await db.bookings.find_one({'id': booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')

    # Save review to booking
    await db.bookings.update_one(
        {'id': booking_id},
        {'$set': {
            'review': {
                'rating': int(rating),
                'comment': comment,
                'reviewed_at': datetime.utcnow().isoformat(),
                'reviewer_name': current_user.get('full_name', 'Client')
            }
        }}
    )

    # Recalculate lawyer's average rating
    lawyer_id = booking.get('lawyer_id')
    if lawyer_id:
        all_reviewed = await db.bookings.find(
            {'lawyer_id': lawyer_id, 'review.rating': {'$exists': True}},
            {'review.rating': 1}
        ).to_list(1000)
        if all_reviewed:
            avg = sum(r['review']['rating'] for r in all_reviewed) / len(all_reviewed)
            await db.users.update_one(
                {'id': lawyer_id},
                {'$set': {'rating': round(avg, 1), 'total_reviews': len(all_reviewed)}}
            )

    return {'success': True, 'message': 'Review submitted successfully'}
