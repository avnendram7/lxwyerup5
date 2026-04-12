"""
scheduler.py — background job that auto-cancels bookings whose reschedule
deadline has passed without either party accepting the new time.

Runs as an asyncio task every 60 seconds.
"""

import asyncio
from datetime import datetime, timedelta
from services.database import db
from routes.notifications import create_notification


async def auto_cancel_expired_reschedules():
    """Find bookings in a reschedule-pending state whose deadline has passed and cancel them."""
    pending_statuses = ['rescheduled_by_lawyer', 'rescheduled_by_user']
    now_iso = datetime.utcnow().isoformat()

    expired = await db.bookings.find({
        'status': {'$in': pending_statuses},
        'reschedule_deadline': {'$lt': now_iso, '$ne': None},
    }).to_list(100)

    for booking in expired:
        booking_id = booking.get('id')
        if not booking_id:
            continue

        await db.bookings.update_one(
            {'id': booking_id},
            {'$set': {
                'status': 'cancelled',
                'cancel_reason': 'Reschedule deadline expired — appointment auto-cancelled',
                'proposed_date': None,
                'proposed_time': None,
                'reschedule_by': None,
                'reschedule_deadline': None,
            }}
        )

        # Notify both parties
        who_initiated = booking.get('reschedule_by', 'lawyer')
        client_id = booking.get('client_id')
        lawyer_id = booking.get('lawyer_id')

        if client_id:
            await create_notification(
                user_id=client_id,
                title="❌ Appointment Auto-Cancelled",
                message="The reschedule window expired without agreement. Your appointment has been automatically cancelled.",
                n_type="booking_cancelled",
                related_id=booking_id
            )
        if lawyer_id:
            await create_notification(
                user_id=lawyer_id,
                title="❌ Appointment Auto-Cancelled",
                message="The reschedule window expired without agreement. The appointment has been automatically cancelled.",
                n_type="booking_cancelled",
                related_id=booking_id
            )

        print(f"[Scheduler] Auto-cancelled booking {booking_id} (deadline expired, initiated by {who_initiated})")


async def process_missed_appointments():
    """Find bookings where time has passed and they are still pending/confirmed. Give lawyer strikes (+ disables at 3)."""
    active_statuses = ['pending', 'confirmed']
    
    # We load active ones
    active_bookings = await db.bookings.find({
        'status': {'$in': active_statuses}
    }).to_list(1000)
    
    now_ist = datetime.utcnow() + timedelta(hours=5, minutes=30)
    
    for booking in active_bookings:
        date_str = booking.get('date')
        time_str = booking.get('time')
        if not date_str or not time_str:
            continue
            
        try:
            dt_str = f"{date_str} {time_str}"
            try:
                appt_time = datetime.strptime(dt_str.strip(), "%Y-%m-%d %H:%M")
            except ValueError:
                appt_time = datetime.strptime(dt_str.strip(), "%Y-%m-%d %I:%M %p")
                
            # Check if current time is past the appointment + 60 minutes
            if appt_time + timedelta(minutes=60) < now_ist:
                booking_id = booking.get('id')
                lawyer_id = booking.get('lawyer_id')
                client_id = booking.get('client_id')
                
                # 1. Update booking
                await db.bookings.update_one(
                    {'id': booking_id},
                    {'$set': {
                        'status': 'missed_refunded',
                        'cancel_reason': 'Lawyer unavailable - missed appointment time.'
                    }}
                )
                
                # 2. Notify client
                if client_id:
                    await create_notification(
                        user_id=client_id,
                        title="Appointment Missed & Refunded",
                        message="We're sorry. The time for your appointment has passed. Your money will be refunded.",
                        n_type="booking_missed",
                        related_id=booking_id
                    )
                
                # 3. Penalize Lawyer
                if lawyer_id:
                    lawyer_doc = await db.users.find_one({'id': lawyer_id})
                    if lawyer_doc:
                        missed_count = lawyer_doc.get('missed_appointments', 0) + 1
                        
                        update_fields = {'missed_appointments': missed_count}
                        
                        if missed_count >= 3:
                            update_fields['status'] = 'suspended'
                            update_fields['account_status'] = 'temporarily_disabled'
                            warning_title = "Account Suspended"
                            warning_msg = "Your account has been temporarily disabled due to 3 missed appointments."
                        else:
                            warning_title = "⚠️ Warning: Missed Appointment"
                            warning_msg = f"You missed an appointment. We accept this only 3 times before your account is temporarily disabled. (Strike {missed_count}/3)"
                            
                        await db.users.update_one({'id': lawyer_id}, {'$set': update_fields})
                        
                        await create_notification(
                            user_id=lawyer_id,
                            title=warning_title,
                            message=warning_msg,
                            n_type="system_warning",
                            related_id=booking_id
                        )
                        print(f"[Scheduler] Marked {booking_id} as missed. Lawyer {lawyer_id} has {missed_count} strikes.")
                        
        except Exception as e:
            # Skip invalid dates or parsing errors
            pass


async def run_scheduler():
    """Infinite loop — checks every 60 seconds for expired reschedule deadlines."""
    print("[Scheduler] Auto-cancel scheduler started.")
    while True:
        try:
            await auto_cancel_expired_reschedules()
        except Exception as e:
            print(f"[Scheduler] Error during auto-cancel check: {e}")
            
        try:
            await process_missed_appointments()
        except Exception as e:
            print(f"[Scheduler] Error during missed appointment check: {e}")
            
        await asyncio.sleep(60)
