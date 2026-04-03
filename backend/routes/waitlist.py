from fastapi import APIRouter, HTTPException, BackgroundTasks
from models.waitlist import Waitlist, WaitlistCreate
from services.database import db
from services.email_service import send_waitlist_notification

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])


@router.post("", response_model=Waitlist)
async def join_waitlist(waitlist_data: WaitlistCreate, background_tasks: BackgroundTasks):
    """Join the waitlist"""
    existing = await db.waitlist.find_one({'email': waitlist_data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    waitlist_obj = Waitlist(**waitlist_data.model_dump())
    
    doc = waitlist_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.waitlist.insert_one(doc)
    
    # Trigger email notification in background
    background_tasks.add_task(
        send_waitlist_notification,
        name=waitlist_data.full_name,
        email=waitlist_data.email,
        message=waitlist_data.message
    )
    
    return waitlist_obj
