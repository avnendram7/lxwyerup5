from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timezone
from models.case import Case, CaseCreate
from services.database import db
from routes.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post("", response_model=Case)
async def create_case(case_data: CaseCreate, current_user: dict = Depends(get_current_user)):
    """Create a new case"""
    case_dict = case_data.model_dump()
    # Use client_id to be consistent with bookings schema
    case_dict['client_id'] = current_user['id']
    case_dict['user_id'] = current_user['id']  # Keep both for backward compat
    case_dict['client_name'] = current_user.get('full_name') or current_user.get('name', '')
    case_dict['status'] = case_dict.get('status', 'pending')
    case_obj = Case(**case_dict)
    
    doc = case_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    doc['client_id'] = current_user['id']
    doc['client_name'] = current_user.get('full_name') or current_user.get('name', '')
    
    await db.cases.insert_one(doc)
    return case_obj


@router.get("")
async def get_cases(current_user: dict = Depends(get_current_user)):
    """Get cases for current user"""
    uid = current_user['id']
    # Search by all possible field names (client_id, user_id, lawyer_id)
    query = {"$or": [
        {"client_id": uid},
        {"user_id": uid},
        {"lawyer_id": uid}
    ]}
    cases = await db.cases.find(query, {'_id': 0}).to_list(200)

    def _safe_dt(val):
        """Convert any date string to isoformat string safely."""
        if val is None:
            return None
        if isinstance(val, datetime):
            return val.isoformat()
        if isinstance(val, str):
            return val
        return str(val)

    result = []
    for case in cases:
        case['created_at'] = _safe_dt(case.get('created_at'))
        case['updated_at'] = _safe_dt(case.get('updated_at'))
        case.setdefault('description', '')
        case.setdefault('status', 'active')
        case.setdefault('title', 'Untitled Case')
        case.setdefault('case_type', 'General')
        case.setdefault('updates', [])
        result.append(case)

    return result


@router.get("/{case_id}", response_model=Case)
async def get_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific case"""
    case = await db.cases.find_one({'id': case_id}, {'_id': 0})
    if not case:
        raise HTTPException(status_code=404, detail='Case not found')
    
    if isinstance(case['created_at'], str):
        dt_str = case['created_at'].replace('Z', '+00:00') if case['created_at'].endswith('Z') else case['created_at']
        case['created_at'] = datetime.fromisoformat(dt_str)
    if isinstance(case['updated_at'], str):
        dt_str = case['updated_at'].replace('Z', '+00:00') if case['updated_at'].endswith('Z') else case['updated_at']
        case['updated_at'] = datetime.fromisoformat(dt_str)
    
    return case


class CaseUpdatePayload(BaseModel):
    title: str
    description: str


@router.patch("/{case_id}/updates")
async def add_case_update(case_id: str, payload: CaseUpdatePayload, current_user: dict = Depends(get_current_user)):
    """Append a lawyer update to an existing case's timeline"""
    case = await db.cases.find_one({'id': case_id}, {'_id': 0})
    if not case:
        raise HTTPException(status_code=404, detail='Case not found')

    new_update = {
        "title": payload.title,
        "description": payload.description,
        "date": datetime.now(timezone.utc).isoformat(),
        "author": current_user.get('name', current_user.get('full_name', 'Lawyer'))
    }

    now = datetime.now(timezone.utc).isoformat()
    await db.cases.update_one(
        {'id': case_id},
        {
            '$push': {'updates': new_update},
            '$set': {'updated_at': now}
        }
    )

    return {"success": True, "update": new_update}


@router.patch("/{case_id}/assign-lawyer")
async def assign_lawyer_to_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Assign the current lawyer to the case"""
    case = await db.cases.find_one({'id': case_id}, {'_id': 0})
    if not case:
        raise HTTPException(status_code=404, detail='Case not found')

    lawyer_name = current_user.get('name') or current_user.get('full_name', 'Unknown Lawyer')
    now = datetime.now(timezone.utc).isoformat()
    await db.cases.update_one(
        {'id': case_id},
        {'$set': {'lawyer_name': lawyer_name, 'lawyer_id': current_user['id'], 'updated_at': now}}
    )
    return {"success": True, "lawyer_name": lawyer_name}

