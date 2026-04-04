from fastapi import APIRouter, HTTPException, Depends
from models.sos import (
    SOSMissedCall, SOSMissedCallDispute, SOSMissedCallResolve,
    SOSSession, SOSSessionRequest, SOSSessionStatusUpdate, SOSTranscriptMessage, SOSTranscriptAdd
)
from services.database import db
from fastapi.security import HTTPAuthorizationCredentials
from services.auth import get_current_user, verify_admin_token, security
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/sos", tags=["SOS Features"])

def get_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to verify admin token"""
    return verify_admin_token(credentials.credentials)

# ── Missed Call Routes ────────────────────────────────────────────────────────

@router.post("/missed-calls")
async def log_missed_call(lawyer_id: str, client_id: str = None, user: dict = Depends(get_current_user)):
    """Log a missed call for an SOS Lawyer."""
    lawyer = await db.users.find_one({'id': lawyer_id, 'user_type': 'lawyer'})
    if not lawyer or 'sos' not in lawyer.get('application_type', []):
        raise HTTPException(status_code=400, detail="Target is not an active SOS Lawyer")

    previous_misses = await db.sos_missed_calls.count_documents({
        'lawyer_id': lawyer_id,
        'status': {'$in': ['pending', 'disputed', 'penalized']}
    })

    record = SOSMissedCall(lawyer_id=lawyer_id, client_id=client_id)
    if previous_misses > 0:
        record.status = 'penalized'

    await db.sos_missed_calls.insert_one(record.model_dump())
    return {"message": "Missed call logged", "status": record.status, "id": record.id}

@router.get("/my-missed-calls")
async def get_my_missed_calls(user: dict = Depends(get_current_user)):
    """Lawyer fetch their missed calls & penalties"""
    if user['user_type'] != 'lawyer':
        raise HTTPException(status_code=403, detail="Only lawyers can access this")

    calls = await db.sos_missed_calls.find({'lawyer_id': user['id']}).sort('call_timestamp', -1).to_list(100)
    for c in calls:
        c['_id'] = str(c['_id'])
    return {"missed_calls": calls}

@router.post("/missed-calls/{call_id}/dispute")
async def dispute_missed_call(call_id: str, dispute: SOSMissedCallDispute, user: dict = Depends(get_current_user)):
    """Lawyer submits a reason + proof for missing a call"""
    call = await db.sos_missed_calls.find_one({'id': call_id, 'lawyer_id': user['id']})
    if not call:
        raise HTTPException(status_code=404, detail="Missed call record not found")

    if call['status'] not in ['pending', 'penalized']:
        raise HTTPException(status_code=400, detail=f"Cannot dispute a call with status {call['status']}")

    await db.sos_missed_calls.update_one(
        {'id': call_id},
        {'$set': {
            'status': 'disputed',
            'dispute_reason': dispute.dispute_reason,
            'dispute_file_url': dispute.dispute_file_url,
            'disputed_at': datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Dispute submitted successfully"}

@router.get("/admin/disputes")
async def get_all_disputes(admin: dict = Depends(get_admin)):
    """Admin view all disputed missed calls"""
    disputes = await db.sos_missed_calls.find({'status': 'disputed'}).sort('disputed_at', -1).to_list(100)
    for d in disputes:
        d['_id'] = str(d['_id'])
    return {"disputes": disputes}

@router.put("/admin/missed-calls/{call_id}/resolve")
async def resolve_dispute(call_id: str, resolve: SOSMissedCallResolve, admin: dict = Depends(get_admin)):
    """Admin resolves a dispute: waive penalty or enforce it"""
    call = await db.sos_missed_calls.find_one({'id': call_id})
    if not call:
        raise HTTPException(status_code=404, detail="Missed call record not found")

    new_status = 'waived' if resolve.action == 'waive' else 'penalized'

    await db.sos_missed_calls.update_one(
        {'id': call_id},
        {'$set': {
            'status': new_status,
            'resolved_by_admin_id': admin['id'],
            'resolved_at': datetime.now(timezone.utc).isoformat(),
            'admin_notes': resolve.admin_notes
        }}
    )
    return {"message": f"Dispute resolved. Status set to {new_status}"}

# ── SOS Session Routes ────────────────────────────────────────────────────────

@router.post("/request")
async def create_sos_request(req: SOSSessionRequest):
    """
    User submits SOS emergency request.
    Finds best matching SOS lawyer in their state/city.
    Creates a session and returns matched lawyer info.
    """
    # Find SOS lawyers matching state (and ideally city)
    query = {
        'user_type': 'lawyer',
        'application_type': {'$in': ['sos']},
        'status': 'approved',
        'state': {'$regex': req.user_state, '$options': 'i'}
    }
    lawyers = await db.users.find(query).to_list(50)

    # Also try searching lawyer_applications collection
    if not lawyers:
        lawyers = await db.lawyer_applications.find({
            'application_type': {'$in': ['sos']},
            'status': 'approved',
            'state': {'$regex': req.user_state, '$options': 'i'}
        }).to_list(50)

    # Issue-type matching by specialization
    issue_map = {
        'criminal': ['criminal', 'bail', 'defense'],
        'family': ['family', 'divorce', 'domestic'],
        'civil': ['property', 'civil', 'land'],
        'cyber': ['cyber', 'fraud', 'it'],
        'traffic': ['traffic', 'accident', 'motor']
    }
    preferred_keywords = issue_map.get(req.issue_type.lower(), [])

    # Rank lawyers — prefer ones whose specialization matches issue type and city
    def score(l):
        spec = (l.get('specialization') or '').lower()
        city = (l.get('city') or '').lower()
        s = 0
        for kw in preferred_keywords:
            if kw in spec:
                s += 10
        if req.user_city.lower() in city:
            s += 5
        return s

    if lawyers:
        lawyers.sort(key=score, reverse=True)
        best = lawyers[0]
        session = SOSSession(
            user_phone=req.user_phone,
            user_name=req.user_name,
            user_state=req.user_state,
            user_city=req.user_city,
            issue_type=req.issue_type,
            matched_lawyer_id=str(best.get('_id', best.get('id', ''))),
            matched_lawyer_name=best.get('full_name') or best.get('name'),
            matched_lawyer_phone=best.get('phone'),
            matched_lawyer_specialization=best.get('specialization'),
            status='matched',
            connected_at=datetime.now(timezone.utc).isoformat(),
            transcript=[
                SOSTranscriptMessage(
                    sender='system',
                    sender_name='LxwyerUp SOS',
                    text=f"Emergency session started. User needs help with: {req.issue_type}. Location: {req.user_city}, {req.user_state}."
                ).model_dump()
            ]
        )
        await db.sos_sessions.insert_one(session.model_dump())
        return {
            "session_id": session.id,
            "status": "matched",
            "lawyer": {
                "name": session.matched_lawyer_name,
                "phone": session.matched_lawyer_phone,
                "specialization": session.matched_lawyer_specialization,
            }
        }
    else:
        # No lawyer found — still create the session for monitoring
        session = SOSSession(
            user_phone=req.user_phone,
            user_name=req.user_name,
            user_state=req.user_state,
            user_city=req.user_city,
            issue_type=req.issue_type,
            status='no_lawyer',
        )
        await db.sos_sessions.insert_one(session.model_dump())
        return {
            "session_id": session.id,
            "status": "no_lawyer",
            "message": "No SOS lawyer is currently available in your area. We have logged your request — our team will call you back within 5 minutes."
        }

@router.get("/sessions")
async def get_sos_sessions(admin: dict = Depends(get_admin)):
    """Admin: get all SOS sessions."""
    sessions = await db.sos_sessions.find().sort('created_at', -1).to_list(200)
    for s in sessions:
        s['_id'] = str(s['_id'])
    return {"sessions": sessions}

@router.get("/sessions/{session_id}")
async def get_sos_session(session_id: str, admin: dict = Depends(get_admin)):
    """Admin: full detail of a specific SOS session."""
    session = await db.sos_sessions.find_one({'id': session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session['_id'] = str(session['_id'])
    return {"session": session}

@router.patch("/sessions/{session_id}/status")
async def update_sos_session_status(session_id: str, update: SOSSessionStatusUpdate, admin: dict = Depends(get_admin)):
    """Admin: update session status and/or notes."""
    update_data = {"status": update.status}
    if update.admin_notes:
        update_data["admin_notes"] = update.admin_notes
    if update.status == "completed":
        update_data["ended_at"] = datetime.now(timezone.utc).isoformat()

    result = await db.sos_sessions.update_one({'id': session_id}, {'$set': update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session updated"}

@router.post("/sessions/{session_id}/transcript")
async def add_transcript_message(session_id: str, msg: SOSTranscriptAdd, admin: dict = Depends(get_admin)):
    """Admin: append a message to the session transcript."""
    session = await db.sos_sessions.find_one({'id': session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    new_msg = SOSTranscriptMessage(sender=msg.sender, sender_name=msg.sender_name, text=msg.text).model_dump()
    await db.sos_sessions.update_one({'id': session_id}, {'$push': {'transcript': new_msg}})
    return {"message": "Transcript updated"}

@router.get("/admin/overview")
async def get_monitor_overview(admin: dict = Depends(get_admin)):
    """Admin: stats overview for the monitor dashboard."""
    total_sessions = await db.sos_sessions.count_documents({})
    active = await db.sos_sessions.count_documents({'status': {'$in': ['matched', 'active', 'searching']}})
    completed = await db.sos_sessions.count_documents({'status': 'completed'})
    no_lawyer = await db.sos_sessions.count_documents({'status': 'no_lawyer'})
    disputes = await db.sos_missed_calls.count_documents({'status': 'disputed'})
    total_lawyers = await db.users.count_documents({'user_type': 'lawyer', 'status': 'approved'})
    sos_lawyers = await db.users.count_documents({'user_type': 'lawyer', 'status': 'approved', 'application_type': {'$in': ['sos']}})
    total_users = await db.users.count_documents({'user_type': 'user'})
    return {
        "total_sessions": total_sessions,
        "active_sessions": active,
        "completed_sessions": completed,
        "no_lawyer_sessions": no_lawyer,
        "disputed_missed_calls": disputes,
        "total_lawyers": total_lawyers,
        "sos_lawyers": sos_lawyers,
        "total_users": total_users
    }


@router.post("/missed-calls")
async def log_missed_call(lawyer_id: str, client_id: str = None, user: dict = Depends(get_current_user)):
    """Log a missed call for an SOS Lawyer. (Typically triggered by communication service)"""
    # Verify lawyer exists & is an SOS lawyer
    lawyer = await db.users.find_one({'id': lawyer_id, 'user_type': 'lawyer'})
    if not lawyer or 'sos' not in lawyer.get('application_type', []):
        raise HTTPException(status_code=400, detail="Target is not an active SOS Lawyer")

    # Check previous missed calls
    previous_misses = await db.sos_missed_calls.count_documents({
        'lawyer_id': lawyer_id,
        'status': {'$in': ['pending', 'disputed', 'penalized']}
    })

    record = SOSMissedCall(lawyer_id=lawyer_id, client_id=client_id)
    
    # Policy: penalty applies if more than 1 missed call
    if previous_misses > 0:
        record.status = 'penalized'
        
    await db.sos_missed_calls.insert_one(record.model_dump())
    return {"message": "Missed call logged", "status": record.status, "id": record.id}

@router.get("/my-missed-calls")
async def get_my_missed_calls(user: dict = Depends(get_current_user)):
    """Lawyer fetch their missed calls & penalties"""
    if user['user_type'] != 'lawyer':
        raise HTTPException(status_code=403, detail="Only lawyers can access this")
        
    calls = await db.sos_missed_calls.find({'lawyer_id': user['id']}).sort('call_timestamp', -1).to_list(100)
    for c in calls:
        c['_id'] = str(c['_id'])
    return {"missed_calls": calls}

@router.post("/missed-calls/{call_id}/dispute")
async def dispute_missed_call(call_id: str, dispute: SOSMissedCallDispute, user: dict = Depends(get_current_user)):
    """Lawyer submits a reason + proof for missing a call"""
    call = await db.sos_missed_calls.find_one({'id': call_id, 'lawyer_id': user['id']})
    if not call:
        raise HTTPException(status_code=404, detail="Missed call record not found")
        
    if call['status'] not in ['pending', 'penalized']:
        raise HTTPException(status_code=400, detail=f"Cannot dispute a call with status {call['status']}")

    await db.sos_missed_calls.update_one(
        {'id': call_id},
        {'$set': {
            'status': 'disputed',
            'dispute_reason': dispute.dispute_reason,
            'dispute_file_url': dispute.dispute_file_url,
            'disputed_at': datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Dispute submitted successfully"}

@router.get("/admin/disputes")
async def get_all_disputes(admin: dict = Depends(get_admin)):
    """Admin view all disputed missed calls"""
    disputes = await db.sos_missed_calls.find({'status': 'disputed'}).sort('disputed_at', -1).to_list(100)
    for d in disputes:
        d['_id'] = str(d['_id'])
    return {"disputes": disputes}

@router.put("/admin/missed-calls/{call_id}/resolve")
async def resolve_dispute(call_id: str, resolve: SOSMissedCallResolve, admin: dict = Depends(get_admin)):
    """Admin resolves a dispute: waive penalty or enforce it"""
    call = await db.sos_missed_calls.find_one({'id': call_id})
    if not call:
        raise HTTPException(status_code=404, detail="Missed call record not found")
        
    new_status = 'waived' if resolve.action == 'waive' else 'penalized'
    
    await db.sos_missed_calls.update_one(
        {'id': call_id},
        {'$set': {
            'status': new_status,
            'resolved_by_admin_id': admin['id'],
            'resolved_at': datetime.now(timezone.utc).isoformat(),
            'admin_notes': resolve.admin_notes
        }}
    )
    return {"message": f"Dispute resolved. Status set to {new_status}"}
