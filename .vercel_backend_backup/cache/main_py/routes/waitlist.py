from fastapi import APIRouter, HTTPException
from models.waitlist import Waitlist, WaitlistCreate
from services.database import db

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])


@router.post("", response_model=Waitlist)
async def join_waitlist(waitlist_data: WaitlistCreate):
    """Join the waitlist"""
    existing = await db.waitlist.find_one({'email': waitlist_data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    waitlist_obj = Waitlist(**waitlist_data.model_dump())
    
    doc = waitlist_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.waitlist.insert_one(doc)
    return waitlist_obj
