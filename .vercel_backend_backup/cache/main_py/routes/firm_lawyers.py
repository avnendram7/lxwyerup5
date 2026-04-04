from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timezone
from services.database import db
from services.auth import hash_password, verify_password, create_token
from models.firm_lawyer import FirmLawyerCreate, FirmLawyerLogin, TaskCreate
from pydantic import BaseModel, EmailStr
import uuid

router = APIRouter(prefix="/firm-lawyers", tags=["Firm Lawyers"])


# Pydantic model for firm lawyer application
class FirmLawyerApplicationCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    firm_id: str
    firm_name: str
    specialization: str
    experience_years: int = 1
    bar_council_number: Optional[str] = None
    education: Optional[str] = None
    languages: Optional[List[str]] = ["Hindi", "English"]
    bio: Optional[str] = None


@router.post("/login")
async def firm_lawyer_login(login_data: FirmLawyerLogin):
    """Login for firm lawyers"""
    user = await db.users.find_one(
        {'email': login_data.email, 'user_type': 'firm_lawyer'},
        {'_id': 0}
    )
    
    if not user:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    password_field = user.get('password_hash') or user.get('password')
    if not password_field or not verify_password(login_data.password, password_field):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    if not user.get('is_active', True):
        raise HTTPException(status_code=403, detail='Account is deactivated')
    
    token = create_token(user['id'], user['user_type'])
    user_response = {k: v for k, v in user.items() if k not in ['password', 'password_hash']}
    
    return {'token': token, 'user': user_response}


# Firm Lawyer Applications endpoints
@router.post("/applications")
async def submit_firm_lawyer_application(application: FirmLawyerApplicationCreate):
    """Submit a firm lawyer application"""
    # Check if email already exists in users
    existing_user = await db.users.find_one({'email': application.email})
    if existing_user:
        raise HTTPException(status_code=400, detail='A user with this email already exists')
    
    # Check if application already exists
    existing_app = await db.firm_lawyer_applications.find_one({'email': application.email})
    if existing_app:
        raise HTTPException(status_code=400, detail='An application with this email already exists')
    
    # Create application
    app_id = str(uuid.uuid4())
    app_data = {
        'id': app_id,
        'full_name': application.full_name,
        'email': application.email,
        'phone': application.phone,
        'password_hash': hash_password(application.password),
        'firm_id': application.firm_id,
        'firm_name': application.firm_name,
        'specialization': application.specialization,
        'experience_years': application.experience_years,
        'bar_council_number': application.bar_council_number,
        'education': application.education,
        'languages': application.languages,
        'bio': application.bio,
        'status': 'pending',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.firm_lawyer_applications.insert_one(app_data)
    return {'message': 'Application submitted successfully', 'id': app_id}


@router.get("/applications")
async def get_firm_lawyer_applications():
    """Get all firm lawyer applications (for admin)"""
    applications = await db.firm_lawyer_applications.find(
        {},
        {'_id': 0, 'password_hash': 0}
    ).sort('created_at', -1).to_list(100)
    return applications



@router.get("/applications/by-firm/{firm_id}")
async def get_firm_applications_by_firm(firm_id: str, filter_status: str = None):
    """Get lawyer applications for a specific law firm (for firm manager dashboard)"""
    query = {"firm_id": firm_id}
    if filter_status:
        query["status"] = filter_status
    applications = await db.firm_lawyer_applications.find(
        query,
        {"_id": 0, "password_hash": 0}
    ).sort("created_at", -1).to_list(100)
    return applications

@router.put("/applications/{app_id}/status")
async def update_firm_lawyer_application_status(app_id: str, status: str):
    """Update firm lawyer application status (approve/reject)"""
    if status not in ['approved', 'rejected', 'pending']:
        raise HTTPException(status_code=400, detail='Invalid status')
    
    application = await db.firm_lawyer_applications.find_one({'id': app_id})
    if not application:
        raise HTTPException(status_code=404, detail='Application not found')
    
    # Update application status
    await db.firm_lawyer_applications.update_one(
        {'id': app_id},
        {'$set': {'status': status, 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    # If approved, create the user account
    if status == 'approved':
        lawyer_id = str(uuid.uuid4())
        lawyer_doc = {
            'id': lawyer_id,
            'full_name': application['full_name'],
            'email': application['email'],
            'password_hash': application['password_hash'],
            'phone': application['phone'],
            'firm_id': application['firm_id'],
            'firm_name': application['firm_name'],
            'specialization': application['specialization'],
            'experience_years': application.get('experience_years', 1),
            'bar_council_number': application.get('bar_council_number'),
            'education': application.get('education'),
            'languages': application.get('languages', ['Hindi', 'English']),
            'bio': application.get('bio'),
            'user_type': 'firm_lawyer',
            'is_active': True,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'tasks_completed': 0,
            'cases_assigned': 0,
            'rating': 4.5
        }
        await db.users.insert_one(lawyer_doc)
        return {'message': 'Application approved and lawyer account created', 'lawyer_id': lawyer_id}
    
    return {'message': f'Application {status}'}


@router.post("")
async def create_firm_lawyer(lawyer_data: FirmLawyerCreate, firm_id: str, firm_name: str):
    """Create a new firm lawyer (called by manager)"""
    # Check if email already exists
    existing = await db.users.find_one({'email': lawyer_data.email})
    if existing:
        raise HTTPException(status_code=400, detail='A user with this email already exists')
    
    lawyer_id = str(uuid.uuid4())
    lawyer_doc = {
        'id': lawyer_id,
        'full_name': lawyer_data.full_name,
        'email': lawyer_data.email,
        'password_hash': hash_password(lawyer_data.password),
        'phone': lawyer_data.phone,
        'specialization': lawyer_data.specialization,
        'experience_years': lawyer_data.experience_years,
        'bar_council_number': lawyer_data.bar_council_number,
        'languages': lawyer_data.languages,
        'firm_id': firm_id,
        'firm_name': firm_name,
        'user_type': 'firm_lawyer',
        'is_active': True,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'tasks_completed': 0,
        'cases_assigned': 0,
        'rating': 4.5
    }
    
    await db.users.insert_one(lawyer_doc)
    
    # Don't return password
    del lawyer_doc['password_hash']
    return lawyer_doc


@router.get("/by-firm/{firm_id}")
async def get_firm_lawyers(firm_id: str):
    """Get all lawyers belonging to a firm"""
    lawyers = await db.users.find(
        {'firm_id': firm_id, 'user_type': 'firm_lawyer'},
        {'_id': 0, 'password_hash': 0, 'password': 0}
    ).to_list(100)
    return lawyers


@router.get("/{lawyer_id}")
async def get_firm_lawyer(lawyer_id: str):
    """Get a specific firm lawyer"""
    lawyer = await db.users.find_one(
        {'id': lawyer_id, 'user_type': 'firm_lawyer'},
        {'_id': 0, 'password_hash': 0, 'password': 0}
    )
    if not lawyer:
        raise HTTPException(status_code=404, detail='Lawyer not found')
    return lawyer


@router.put("/{lawyer_id}/status")
async def update_lawyer_status(lawyer_id: str, is_active: bool):
    """Activate or deactivate a firm lawyer"""
    result = await db.users.update_one(
        {'id': lawyer_id, 'user_type': 'firm_lawyer'},
        {'$set': {'is_active': is_active}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail='Lawyer not found')
    return {'message': f'Lawyer {"activated" if is_active else "deactivated"} successfully'}


@router.delete("/{lawyer_id}")
async def delete_firm_lawyer(lawyer_id: str):
    """Delete a firm lawyer"""
    result = await db.users.delete_one({'id': lawyer_id, 'user_type': 'firm_lawyer'})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Lawyer not found')
    return {'message': 'Lawyer deleted successfully'}


# Tasks endpoints
@router.post("/tasks")
async def create_task(task_data: TaskCreate, assigned_by: str):
    """Create a task for a firm lawyer"""
    task_id = str(uuid.uuid4())
    task_doc = {
        'id': task_id,
        'title': task_data.title,
        'description': task_data.description,
        'assigned_to': task_data.assigned_to,
        'assigned_by': assigned_by,
        'priority': task_data.priority,
        'status': 'pending',
        'due_date': task_data.due_date,
        'case_id': task_data.case_id,
        'case_name': task_data.case_name,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'completed_at': None
    }
    
    await db.firm_tasks.insert_one(task_doc)
    return task_doc


@router.get("/tasks/by-lawyer/{lawyer_id}")
async def get_lawyer_tasks(lawyer_id: str):
    """Get all tasks for a firm lawyer"""
    tasks = await db.firm_tasks.find(
        {'assigned_to': lawyer_id},
        {'_id': 0}
    ).sort('created_at', -1).to_list(100)
    return tasks


@router.get("/tasks/by-firm/{firm_id}")
async def get_firm_tasks(firm_id: str):
    """Get all tasks for a firm (all lawyers)"""
    # First get all lawyers in the firm
    lawyers = await db.users.find(
        {'firm_id': firm_id, 'user_type': 'firm_lawyer'},
        {'id': 1, '_id': 0}
    ).to_list(100)
    
    lawyer_ids = [lawyer['id'] for lawyer in lawyers]
    
    tasks = await db.firm_tasks.find(
        {'assigned_to': {'$in': lawyer_ids}},
        {'_id': 0}
    ).sort('created_at', -1).to_list(500)
    return tasks


@router.put("/tasks/{task_id}/status")
async def update_task_status(task_id: str, status: str):
    """Update task status"""
    update_data = {'status': status}
    if status == 'completed':
        update_data['completed_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.firm_tasks.update_one(
        {'id': task_id},
        {'$set': update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail='Task not found')
    return {'message': 'Task status updated'}


# Reporting endpoints
@router.get("/reports/firm/{firm_id}")
async def get_firm_report(firm_id: str):
    """Get comprehensive report for a firm manager"""
    # Get all lawyers
    lawyers = await db.users.find(
        {'firm_id': firm_id, 'user_type': 'firm_lawyer'},
        {'_id': 0, 'password_hash': 0, 'password': 0}
    ).to_list(100)
    
    lawyer_ids = [lawyer['id'] for lawyer in lawyers]
    
    # Get all tasks
    tasks = await db.firm_tasks.find(
        {'assigned_to': {'$in': lawyer_ids}},
        {'_id': 0}
    ).to_list(500)
    
    # Calculate stats
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t.get('status') == 'completed'])
    pending_tasks = len([t for t in tasks if t.get('status') == 'pending'])
    in_progress_tasks = len([t for t in tasks if t.get('status') == 'in_progress'])
    
    # Lawyer performance
    lawyer_stats = []
    for lawyer in lawyers:
        lawyer_tasks = [t for t in tasks if t.get('assigned_to') == lawyer['id']]
        lawyer_completed = len([t for t in lawyer_tasks if t.get('status') == 'completed'])
        lawyer_stats.append({
            'id': lawyer['id'],
            'name': lawyer['full_name'],
            'specialization': lawyer.get('specialization', 'General'),
            'total_tasks': len(lawyer_tasks),
            'completed_tasks': lawyer_completed,
            'completion_rate': round((lawyer_completed / len(lawyer_tasks) * 100) if lawyer_tasks else 0, 1),
            'rating': lawyer.get('rating', 4.5)
        })
    
    return {
        'total_lawyers': len(lawyers),
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'in_progress_tasks': in_progress_tasks,
        'completion_rate': round((completed_tasks / total_tasks * 100) if total_tasks else 0, 1),
        'lawyer_stats': lawyer_stats,
        'lawyers': lawyers
    }
