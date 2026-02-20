from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from datetime import datetime, timezone
import uuid
import os
from pydantic import BaseModel
from typing import Optional, List

from models.lawyer_application import AdminLogin
from services.database import db
from services.auth import create_admin_token, verify_admin_token

router = APIRouter(prefix="/admin", tags=["Admin"])
security = HTTPBearer()

# Admin credentials from environment
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@lxwyerup.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')


def get_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to verify admin token"""
    return verify_admin_token(credentials.credentials)


@router.post("/login")
async def admin_login(login: AdminLogin):
    """Admin login"""
    if login.email != ADMIN_EMAIL or login.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    token = create_admin_token(login.email)
    return {'token': token, 'message': 'Login successful'}


@router.get("/lawyer-applications")
async def get_lawyer_applications(admin: dict = Depends(get_admin)):
    """Get all lawyer applications"""
    applications = await db.lawyer_applications.find({}).to_list(1000)
    
    # Convert ObjectId to string
    for app in applications:
        app['_id'] = str(app['_id'])
    
    # Calculate stats
    stats = {
        'pending': len([a for a in applications if a.get('status') == 'pending']),
        'approved': len([a for a in applications if a.get('status') == 'approved']),
        'rejected': len([a for a in applications if a.get('status') == 'rejected'])
    }
    
    return {'applications': applications, 'stats': stats}


@router.put("/lawyer-applications/{app_id}/approve")
async def approve_lawyer_application(app_id: str, admin: dict = Depends(get_admin)):
    """Approve a lawyer application"""
    try:
        # Find application
        application = await db.lawyer_applications.find_one({'_id': ObjectId(app_id)})
        if not application:
            raise HTTPException(status_code=404, detail='Application not found')
        
        if application.get('status') != 'pending':
            raise HTTPException(status_code=400, detail='Application already processed')
        
        # Create lawyer user account
        from services.id_generator import generate_unique_id
        unique_id = await generate_unique_id('lawyer')

        # Update application status
        await db.lawyer_applications.update_one(
            {'_id': ObjectId(app_id)},
            {'$set': {'status': 'approved', 'unique_id': unique_id}}
        )
        
        # Create lawyer user account
        from services.id_generator import generate_unique_id
        unique_id = await generate_unique_id('lawyer')

        user_data = {
            'id': str(uuid.uuid4()),
            'unique_id': unique_id,
            'email': application['email'],
            'password': application.get('password_hash') or application.get('password'),
            'full_name': application.get('full_name') or application.get('name'),
            'user_type': 'lawyer',
            'phone': application['phone'],
            'created_at': datetime.now(timezone.utc).isoformat(),
            'is_approved': True,
            # Lawyer specific fields
            'photo': application.get('photo'),
            'bar_council_number': application.get('bar_council_number'),
            'specialization': application.get('specialization'),
            'experience_years': application.get('experience_years') or application.get('experience'),
            'cases_won': application.get('cases_won', 0),
            'state': application.get('state'),
            'city': application.get('city'),
            'court': application.get('court', ''),
            'education': application.get('education'),
            'languages': application.get('languages', []),
            'fee_range': application.get('fee_range', '₹5,000 - ₹15,000'),
            'bio': application.get('bio', 'Experienced lawyer'),
            'office_address': application.get('office_address'),
            'rating': 4.5,
            'is_verified': True,
            'practice_start_date': application.get('practice_start_date'),
            'education_details': application.get('education_details')
        }
        
        await db.users.insert_one(user_data)
        
        return {'message': 'Application approved successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to approve application: {str(e)}')


@router.put("/lawyer-applications/{app_id}/reject")
async def reject_lawyer_application(app_id: str, admin: dict = Depends(get_admin)):
    """Reject a lawyer application"""
    try:
        # Find application
        application = await db.lawyer_applications.find_one({'_id': ObjectId(app_id)})
        if not application:
            raise HTTPException(status_code=404, detail='Application not found')
        
        if application.get('status') != 'pending':
            raise HTTPException(status_code=400, detail='Application already processed')
        
        # Update application status
        await db.lawyer_applications.update_one(
            {'_id': ObjectId(app_id)},
            {'$set': {'status': 'rejected'}}
        )
        
        return {'message': 'Application rejected'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to reject application: {str(e)}')
    
    return {'message': 'Application rejected'}


# Law Firm Application endpoints
@router.get("/lawfirm-applications")
async def get_lawfirm_applications(admin: dict = Depends(get_admin)):
    """Get all law firm applications"""
    applications = await db.lawfirm_applications.find({}).to_list(1000)
    
    # Convert ObjectId to string
    for app in applications:
        app['_id'] = str(app['_id'])
    
    # Calculate stats
    stats = {
        'pending': len([a for a in applications if a.get('status') == 'pending']),
        'approved': len([a for a in applications if a.get('status') == 'approved']),
        'rejected': len([a for a in applications if a.get('status') == 'rejected'])
    }
    
    return {'applications': applications, 'stats': stats}


@router.put("/lawfirm-applications/{app_id}/approve")
async def approve_lawfirm_application(app_id: str, admin: dict = Depends(get_admin)):
    """Approve a law firm application"""
    # Find application
    application = await db.lawfirm_applications.find_one({'_id': ObjectId(app_id)})
    if not application:
        raise HTTPException(status_code=404, detail='Application not found')
    
    if application.get('status') != 'pending':
        raise HTTPException(status_code=400, detail='Application already processed')
    
    # Create law firm user account
    from services.id_generator import generate_unique_id
    unique_id = await generate_unique_id('law_firm')

    # Update application status
    await db.lawfirm_applications.update_one(
        {'_id': ObjectId(app_id)},
        {'$set': {'status': 'approved', 'unique_id': unique_id}}
    )

    user_data = {
        'id': str(uuid.uuid4()),
        'unique_id': unique_id,
        'email': application['contact_email'],
        'password_hash': application['password_hash'],
        'full_name': application['contact_name'],
        'firm_name': application['firm_name'],
        'user_type': 'law_firm',
        'phone': application['contact_phone'],
        'created_at': datetime.now(timezone.utc),
        # Law firm specific fields
        'registration_number': application['registration_number'],
        'established_year': application['established_year'],
        'website': application.get('website'),
        'contact_designation': application.get('contact_designation'),
        'address': application.get('address'),
        'city': application['city'],
        'state': application['state'],
        'pincode': application.get('pincode'),
        'practice_areas': application['practice_areas'],
        'total_lawyers': application['total_lawyers'],
        'total_staff': application.get('total_staff', 0),
        'description': application['description'],
        'achievements': application.get('achievements'),
        'is_verified': True
    }
    
    await db.users.insert_one(user_data)
    
    return {'message': 'Law firm application approved successfully'}


@router.put("/lawfirm-applications/{app_id}/reject")
async def reject_lawfirm_application(app_id: str, admin: dict = Depends(get_admin)):
    """Reject a law firm application"""
    # Find application
    application = await db.lawfirm_applications.find_one({'_id': ObjectId(app_id)})
    if not application:
        raise HTTPException(status_code=404, detail='Application not found')
    
    if application.get('status') != 'pending':
        raise HTTPException(status_code=400, detail='Application already processed')
    
    # Update application status
    await db.lawfirm_applications.update_one(
        {'_id': ObjectId(app_id)},
        {'$set': {'status': 'rejected'}}
    )
    
    return {'message': 'Law firm application rejected'}


class StateUpdate(BaseModel):
    state: str

@router.get("/lawyers", response_model=dict)
async def get_all_lawyers(admin: dict = Depends(get_admin)):
    """Get all approved lawyers"""
    lawyers = await db.users.find({'user_type': 'lawyer'}).to_list(1000)
    
    # Clean up data for frontend
    for lawyer in lawyers:
        if '_id' in lawyer:
            lawyer['_id'] = str(lawyer['_id'])
        if 'password' in lawyer:
            del lawyer['password']
            
    return {'lawyers': lawyers}


@router.put("/lawyers/{lawyer_id}/state")
async def update_lawyer_state(lawyer_id: str, state_data: StateUpdate, admin: dict = Depends(get_admin)):
    """Update a lawyer's state"""
    try:
        # We use the custom 'id' (UUID string) in our users collection usually
        # But we should check both or be consistent.
        # Based on approve_lawyer_application, we set 'id' to str(uuid.uuid4())
        
        result = await db.users.update_one(
            {'id': lawyer_id},
            {'$set': {'state': state_data.state}}
        )
        
        if result.matched_count == 0:
            # Try by _id just in case
            try:
                result = await db.users.update_one(
                    {'_id': ObjectId(lawyer_id)},
                    {'$set': {'state': state_data.state}}
                )
            except:
                pass
                
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail='Lawyer not found')
            
        return {'message': f'State updated to {state_data.state}'}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f'Failed to update state: {str(e)}')

@router.get("/users", response_model=dict)
async def get_users(admin: dict = Depends(get_admin)):
    """Get all registered users (clients)"""
    users = await db.users.find({'user_type': 'client'}).sort('created_at', -1).to_list(1000)
    
    # Clean up data for frontend
    for user in users:
        if '_id' in user:
            user['_id'] = str(user['_id'])
        if 'password' in user:
            del user['password']
            
    return {'users': users}
