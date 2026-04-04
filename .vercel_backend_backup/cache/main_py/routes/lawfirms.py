from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from services.database import db
from services.auth import hash_password

from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid

router = APIRouter(prefix="/lawfirms", tags=["Law Firms"])


# Pydantic models for law firm applications
class LawFirmApplicationCreate(BaseModel):
    firm_name: str
    registration_number: str
    established_year: int
    website: Optional[str] = None
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    contact_designation: Optional[str] = None
    password: str
    address: Optional[str] = None
    city: str
    state: str
    court: Optional[str] = None
    pincode: Optional[str] = None
    practice_areas: list
    total_lawyers: int
    total_staff: int = 0
    description: str
    achievements: Optional[str] = None
    subscription_plan: Optional[str] = None
    billing_cycle: Optional[str] = None
    subscription_amount: Optional[float] = None


@router.get("")
async def get_lawfirms():
    """Get all approved law firms"""
    lawfirms = await db.users.find(
        {'user_type': 'law_firm'},
        {'_id': 0, 'password': 0, 'password_hash': 0}
    ).to_list(100)
    return lawfirms


@router.post("/applications")
async def submit_lawfirm_application(application: LawFirmApplicationCreate):
    """Submit a law firm application"""
    # Check if email already exists
    existing = await db.lawfirm_applications.find_one({'contact_email': application.contact_email})
    if existing:
        raise HTTPException(status_code=400, detail='An application with this email already exists')
    
    existing_user = await db.users.find_one({'email': application.contact_email})
    if existing_user:
        raise HTTPException(status_code=400, detail='A user with this email already exists')
    
    # Create application
    app_data = {
        'id': str(uuid.uuid4()),
        'firm_name': application.firm_name,
        'registration_number': application.registration_number,
        'established_year': application.established_year,
        'website': application.website,
        'contact_name': application.contact_name,
        'contact_email': application.contact_email,
        'contact_phone': application.contact_phone,
        'contact_designation': application.contact_designation,
        'password_hash': hash_password(application.password),
        'address': application.address,
        'city': application.city,
        'state': application.state,
        'court': application.court,
        'pincode': application.pincode,
        'practice_areas': application.practice_areas,
        'total_lawyers': application.total_lawyers,
        'total_staff': application.total_staff,
        'description': application.description,
        'achievements': application.achievements,
        'subscription_plan': application.subscription_plan,
        'billing_cycle': application.billing_cycle,
        'subscription_amount': application.subscription_amount,
        'status': 'pending',
        'created_at': datetime.utcnow()
    }
    
    await db.lawfirm_applications.insert_one(app_data)
    return {'message': 'Application submitted successfully', 'id': app_data['id']}
