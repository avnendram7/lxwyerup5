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
            'detailed_court_experience': application.get('detailed_court_experience', []),
            'primary_court': application.get('primary_court', ''),
            'education': application.get('education'),
            'languages': application.get('languages', []),
            'fee_range': application.get('fee_range', ''),
            'charge_30min': application.get('charge_30min', ''),
            'charge_60min': application.get('charge_60min', ''),
            'bio': application.get('bio', 'Experienced lawyer'),
            'office_address': application.get('office_address'),
            'rating': 4.5,
            'is_verified': True,
            'practice_start_date': application.get('practice_start_date'),
            'education_details': application.get('education_details'),
            'bar_council_photo': application.get('bar_council_photo'),
            'college_degree_photo': application.get('college_degree_photo'),
            'office_address_photo': application.get('office_address_photo'),
            'aadhar_card_photo': application.get('aadhar_card_photo'),
            'aadhar_card_front': application.get('aadhar_card_front'),
            'aadhar_card_back': application.get('aadhar_card_back'),
            'pan_card': application.get('pan_card'),
            'application_type': application.get('application_type', ['normal']),
            'sos_locations': application.get('sos_locations', []),
            'sos_matters': application.get('sos_matters', []),
            'sos_terms_accepted': application.get('sos_terms_accepted', False)
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


# Firm Lawyer Applications (submitted via LawyerApplication when law_firm type selected)
@router.get("/firm-lawyer-applications")
async def get_firm_lawyer_applications_admin(admin: dict = Depends(get_admin)):
    """Get all firm lawyer applications — visible in admin dashboard and monitor"""
    applications = await db.firm_lawyer_applications.find({}, {'_id': 0, 'password_hash': 0}).sort('created_at', -1).to_list(1000)
    stats = {
        'pending': len([a for a in applications if a.get('status') == 'pending']),
        'approved': len([a for a in applications if a.get('status') == 'approved']),
        'rejected': len([a for a in applications if a.get('status') == 'rejected'])
    }
    return {'applications': applications, 'stats': stats}


@router.put("/firm-lawyer-applications/{app_id}/approve")
async def admin_approve_firm_lawyer(app_id: str, admin: dict = Depends(get_admin)):
    """Admin approve a firm lawyer application"""
    from datetime import datetime, timezone
    await db.firm_lawyer_applications.update_one(
        {'id': app_id},
        {'$set': {'status': 'approved', 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    return {'message': 'Firm lawyer application approved'}


@router.put("/firm-lawyer-applications/{app_id}/reject")
async def admin_reject_firm_lawyer(app_id: str, admin: dict = Depends(get_admin)):
    """Admin reject a firm lawyer application"""
    from datetime import datetime, timezone
    await db.firm_lawyer_applications.update_one(
        {'id': app_id},
        {'$set': {'status': 'rejected', 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    return {'message': 'Firm lawyer application rejected'}


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
    users = await db.users.find({'user_type': {'$in': ['client', 'user']}}).sort('created_at', -1).to_list(1000)
    
    # Clean up data for frontend
    for user in users:
        if '_id' in user:
            user['_id'] = str(user['_id'])
        if 'password' in user:
            del user['password']
            
    return {'users': users}


@router.get("/bookings", response_model=dict)
async def get_all_bookings(admin: dict = Depends(get_admin)):
    """Get all bookings across all users — for Monitor Dashboard."""
    bookings = await db.bookings.find({}).sort('created_at', -1).to_list(1000)

    for b in bookings:
        b['_id'] = str(b.get('_id', ''))
        if 'password' in b:
            del b['password']

        # Enrich with user name if possible
        if b.get('user_id') and not b.get('user_name'):
            u = await db.users.find_one({'id': b['user_id']}, {'full_name': 1, 'email': 1})
            if u:
                b['user_name'] = u.get('full_name') or u.get('email')

        # Enrich with lawyer name if possible
        if b.get('lawyer_id') and not b.get('lawyer_name'):
            l = await db.users.find_one({'id': b['lawyer_id']}, {'full_name': 1})
            if l:
                b['lawyer_name'] = l.get('full_name')

    return {'bookings': bookings}

@router.get("/deactivation-requests", response_model=dict)
async def get_deactivation_requests(admin: dict = Depends(get_admin)):
    """Get all pending deactivation requests from lawyers"""
    pipeline = [
        {
            '$match': {
                'user_type': 'lawyer',
                'deactivation_request.status': 'pending'
            }
        },
        {
            '$project': {
                '_id': 1,
                'id': 1,
                'full_name': 1,
                'email': 1,
                'phone': 1,
                'deactivation_request': 1
            }
        }
    ]
    
    requests = await db.users.aggregate(pipeline).to_list(1000)
    
    # Clean up data for frontend
    for req in requests:
        if '_id' in req:
            req['_id'] = str(req['_id'])
            
    return {'requests': requests}

@router.put("/deactivation-requests/{user_id}/approve", response_model=dict)
async def approve_deactivation_request(user_id: str, admin: dict = Depends(get_admin)):
    """Approve a lawyer's deactivation request"""
    try:
        # Find the lawyer with a pending request
        lawyer = await db.users.find_one({
            'id': user_id, 
            'user_type': 'lawyer',
            'deactivation_request.status': 'pending'
        })
        
        if not lawyer:
            raise HTTPException(status_code=404, detail="Pending deactivation request not found for this user")
            
        # Update user status
        await db.users.update_one(
            {'id': user_id},
            {
                '$set': {
                    'account_status': 'deactivated',
                    'is_approved': False, # Hide from public listings
                    'deactivation_request.status': 'approved',
                    'deactivation_request.approved_at': datetime.now().isoformat()
                }
            }
        )
        
        return {'message': 'Deactivation request approved successfully'}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f'Failed to approve deactivation request: {str(e)}')

class LawyerTypeUpdate(BaseModel):
    application_type: List[str]

@router.patch("/lawyers/{lawyer_id}/type")
async def update_lawyer_type(lawyer_id: str, body: LawyerTypeUpdate, admin: dict = Depends(get_admin)):
    """Admin override: update a lawyer's application_type (normal/sos/both)"""
    valid = {'normal', 'sos'}
    if not all(t in valid for t in body.application_type):
        raise HTTPException(status_code=400, detail='application_type values must be "normal" and/or "sos"')
    try:
        # Update both the users collection and the lawyer_applications collection
        result = await db.users.update_one(
            {'id': lawyer_id},
            {'$set': {'application_type': body.application_type}}
        )
        if result.matched_count == 0:
            try:
                result = await db.users.update_one(
                    {'_id': ObjectId(lawyer_id)},
                    {'$set': {'application_type': body.application_type}}
                )
            except Exception:
                pass
        # Also update in the applications collection
        try:
            await db.lawyer_applications.update_one(
                {'$or': [{'id': lawyer_id}, {'_id': ObjectId(lawyer_id) if len(lawyer_id) == 24 else None}]},
                {'$set': {'application_type': body.application_type}}
            )
        except Exception:
            pass
        return {'message': f'Lawyer type updated to {body.application_type}'}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f'Failed to update type: {str(e)}')
