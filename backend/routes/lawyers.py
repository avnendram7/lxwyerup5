from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from models.user import User
from models.lawyer_application import LawyerApplication, LawyerApplicationCreate
from services.database import db
from services.auth import hash_password

router = APIRouter(prefix="/lawyers", tags=["Lawyers"])


@router.get("")
async def get_lawyers():
    """Get all approved lawyers for the browse page"""
    lawyers = await db.users.find(
        {'user_type': 'lawyer', 'is_approved': True},
        {'password': 0}
    ).to_list(100)
    
    for lawyer in lawyers:
        if isinstance(lawyer.get('created_at'), str):
            dt_str = lawyer['created_at'].replace('Z', '+00:00') if lawyer['created_at'].endswith('Z') else lawyer['created_at']
            lawyer['created_at'] = datetime.fromisoformat(dt_str)
        # Convert _id to id string
        lawyer['id'] = str(lawyer.pop('_id'))
    
    return lawyers


@router.post("/applications")
async def submit_lawyer_application(application: LawyerApplicationCreate):
    """Submit a lawyer application"""
    # Check if email already exists
    existing = await db.lawyer_applications.find_one({'email': application.email})
    if existing:
        raise HTTPException(status_code=400, detail='An application with this email already exists')
    
    existing_user = await db.users.find_one({'email': application.email})
    if existing_user:
        raise HTTPException(status_code=400, detail='A user with this email already exists')
    
    # Create application
    app_data = LawyerApplication(
        name=application.name,
        email=application.email,
        phone=application.phone,
        password_hash=hash_password(application.password),
        photo=application.photo,
        bar_council_number=application.bar_council_number,
        specialization=application.specialization,
        experience=application.experience,
        cases_won=application.cases_won,
        state=application.state,
        city=application.city,
        court=application.court,
        education=application.education,
        languages=application.languages,
        fee_range=application.fee_range,
        bio=application.bio,
        lawyer_type=application.lawyer_type,
        office_address=application.office_address,
        law_firm_id=application.law_firm_id,
        law_firm_name=application.law_firm_name,
        practice_start_date=application.practice_start_date,
        education_details=application.education_details
    )
    
    await db.lawyer_applications.insert_one(app_data.model_dump())
    return {'message': 'Application submitted successfully', 'id': app_data.id}


from fastapi import UploadFile, File, Depends
from services.auth import get_current_user
import shutil
import os
import uuid

@router.post("/me/photo")
async def upload_profile_photo(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """Upload profile photo for the current user"""
    # Create uploads directory if not exists (although server.py does this, good to be safe or use the defined path)
    UPLOAD_DIR = "uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{user['id']}_{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Construct URL (assuming server runs on localhost:8000 or relative path)
    # in production this should be a full URL or relative to static mount
    photo_url = f"/uploads/{filename}"
    
    # Check edit limit
    current_count = user.get('photo_edit_count', 0)
    if current_count >= 3:
        raise HTTPException(status_code=400, detail="You have reached the limit of 3 profile photo updates.")

    # Update user in database
    await db.users.update_one(
        {'id': user['id']},
        {
            '$set': {'photo': photo_url},
            '$inc': {'photo_edit_count': 1}
        }
    )
    
    return {'photo_url': photo_url, 'photo_edit_count': current_count + 1}


from pydantic import BaseModel

class BioUpdate(BaseModel):
    bio: str

@router.put("/me/bio")
async def update_bio(data: BioUpdate, user: dict = Depends(get_current_user)):
    """Update lawyer bio with 3-time limit"""
    # Check word limit
    word_count = len(data.bio.strip().split())
    if word_count > 300:
        raise HTTPException(status_code=400, detail=f"Bio exceeds the 300-word limit. Current count: {word_count}")
        
    await db.users.update_one(
        {'id': user['id']},
        {
            '$set': {'bio': data.bio},
            '$inc': {'bio_edit_count': 1}
        }
    )
    
    return {'message': 'Bio updated successfully', 'bio': data.bio, 'bio_edit_count': current_count + 1}
