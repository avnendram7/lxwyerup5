from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Any
from datetime import datetime, timezone
import uuid

from models.event import Event
from services.database import db
from routes.auth import get_current_user

router = APIRouter(prefix="/events", tags=["Events"])


def _parse_iso_datetime(s: str) -> datetime:
    """Parse ISO datetime string; handle 'Z' suffix for UTC."""
    if not s:
        raise ValueError("Empty datetime")
    s = s.strip().replace("Z", "+00:00")
    return datetime.fromisoformat(s)


@router.post("", response_model=Event)
async def create_event(
    body: Any = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """Create a new event (blocks time). Accepts title, type, start_time, end_time, description as ISO strings."""
    try:
        if current_user.get('user_type') not in ['lawyer', 'firm_lawyer']:
            raise HTTPException(status_code=403, detail='Only lawyers can create events')

        # Accept both Pydantic model (if sent as JSON object) and raw dict
        if hasattr(body, 'model_dump'):
            data = body.model_dump()
        elif isinstance(body, dict):
            data = body
        else:
            raise HTTPException(status_code=422, detail='Invalid request body')

        title = (data.get('title') or '').strip()
        if not title:
            raise HTTPException(status_code=422, detail='title is required')

        event_type = (data.get('type') or 'meeting').strip().lower()
        if event_type not in ('meeting', 'personal', 'hearing'):
            event_type = 'meeting'

        start_raw = data.get('start_time')
        end_raw = data.get('end_time')
        if start_raw is None or start_raw == '' or end_raw is None or end_raw == '':
            raise HTTPException(status_code=422, detail='start_time and end_time are required')

        def to_datetime(v):
            if isinstance(v, datetime):
                return v
            if isinstance(v, (int, float)):
                return datetime.fromtimestamp(v / 1000.0 if v > 1e12 else v, tz=timezone.utc)
            if isinstance(v, str):
                return _parse_iso_datetime(v)
            raise ValueError(f'Unsupported date value: {type(v)}')

        try:
            start_time = to_datetime(start_raw)
            end_time = to_datetime(end_raw)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f'Invalid date format: {str(e)}')

        if end_time <= start_time:
            raise HTTPException(status_code=422, detail='end_time must be after start_time')

        description = (data.get('description') or '').strip() or None
        lawyer_id = current_user['id']
        event_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc)

        doc = {
            'id': event_id,
            'lawyer_id': lawyer_id,
            'title': title,
            'type': event_type,
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
            'description': description,
            'case_id': data.get('case_id'),
            'created_at': created_at.isoformat(),
        }
        doc = {k: v for k, v in doc.items() if v is not None}

        await db.events.insert_one(doc)

        # Return in same shape as Event model (with datetime objects for response_model)
        return Event(
            id=event_id,
            lawyer_id=lawyer_id,
            title=title,
            type=event_type,
            start_time=start_time,
            end_time=end_time,
            description=description,
            case_id=data.get('case_id'),
            created_at=created_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error creating event: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create event: {str(e)}")

@router.get("", response_model=List[Event])
async def get_events(current_user: dict = Depends(get_current_user)):
    """Get events for current user"""
    user_id = current_user['id']
    
    # Fetch events where lawyer_id is user_id
    events = await db.events.find({"lawyer_id": user_id}).to_list(100)
    
    for event in events:
         if isinstance(event.get('start_time'), str):
            dt_str = event['start_time'].replace('Z', '+00:00') if event['start_time'].endswith('Z') else event['start_time']
            event['start_time'] = datetime.fromisoformat(dt_str)
         if isinstance(event.get('end_time'), str):
            dt_str = event['end_time'].replace('Z', '+00:00') if event['end_time'].endswith('Z') else event['end_time']
            event['end_time'] = datetime.fromisoformat(dt_str)
         if isinstance(event.get('created_at'), str):
            dt_str = event['created_at'].replace('Z', '+00:00') if event['created_at'].endswith('Z') else event['created_at']
            event['created_at'] = datetime.fromisoformat(dt_str)

    return events

@router.delete("/{event_id}")
async def delete_event(event_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an event"""
    result = await db.events.delete_one({
        "id": event_id,
        "lawyer_id": current_user['id']
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found or unauthorized")
        
    return {"message": "Event deleted successfully"}
