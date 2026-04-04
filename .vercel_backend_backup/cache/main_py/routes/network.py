from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from datetime import datetime, timezone
import uuid

from models.network import NetworkMessage, NetworkMessageCreate
from models.user import User
from services.database import db
from routes.auth import get_current_user

router = APIRouter(prefix="/network", tags=["Network"])

@router.post("/messages")
async def send_network_message(
    message_data: NetworkMessageCreate,
    state: str = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Send a message to the user's state network"""
    # If state is explicitly provided via query (e.g., from Admin Dashboard), use it.
    # Otherwise fallback to the user's own state, or default to Delhi.
    user_state = state if state else current_user.get("state")
    
    # Fallback to Delhi if no state (e.g., legacy users or manual testing)
    if not user_state:
         user_state = "Delhi"

    new_message = NetworkMessage(
        sender_id=current_user["id"],
        sender_name=current_user.get("full_name", "Unknown Lawyer"),
        sender_type=current_user.get("user_type", "lawyer"),
        state=user_state,
        content=message_data.content,
        file_url=message_data.file_url,
        file_name=message_data.file_name,
        file_type=message_data.file_type
    )
    
    # Add sender photo for frontend display - OPTIONAL: Add to model if needed persistent, 
    # but for now we can just rely on joining user data or client fetching profile.
    # Actually, saving it in message is easier for historical context, but data duplication.
    # Let's just return it in the response for immediate UI update.
    
    msg_dict = new_message.model_dump()
    result = await db.network_messages.insert_one(msg_dict)
    
    # Return enriched data for frontend
    msg_dict['_id'] = str(result.inserted_id)
    msg_dict['sender_photo'] = current_user.get('photo')
    msg_dict['sender_unique_id'] = current_user.get('unique_id')
    
    return {"message": "Message sent", "data": msg_dict}

@router.get("/messages", response_model=List[dict])
async def get_network_messages(
    state: str = Query(None),
    current_user: dict = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100)
):
    """Get messages for the user's state network with sender details"""
    user_state = state if state else current_user.get("state")
    
    if not user_state or user_state == "All States":
        # Note: If admin selects "All States", it might be useful to not filter
        # But for now let's fall back to "Delhi" if really missing, though we can support "All States"
        if user_state == "All States":
            cursor = db.network_messages.find({}).sort("timestamp", -1).limit(limit)
        else:
            user_state = "Delhi"
            cursor = db.network_messages.find({"state": user_state}).sort("timestamp", -1).limit(limit)
    else:
        cursor = db.network_messages.find({"state": user_state}).sort("timestamp", -1).limit(limit)
        
    messages = await cursor.to_list(length=limit)
    
    # Enrich messages with sender details (photo, unique_id)
    # This is inefficient for large scale w/o cache, but fine for now.
    sender_ids = list(set(msg['sender_id'] for msg in messages))
    users = await db.users.find({'id': {'$in': sender_ids}}).to_list(length=len(sender_ids))
    user_map = {u['id']: u for u in users}
    
    result = []
    for msg in messages:
        if "_id" in msg:
            del msg["_id"]
        
        sender = user_map.get(msg['sender_id'])
        if sender:
            msg['sender_photo'] = sender.get('photo')
            msg['sender_unique_id'] = sender.get('unique_id')
            msg['sender_bio'] = sender.get('bio') # For profile view
            msg['sender_specialization'] = sender.get('specialization')
            msg['sender_education'] = sender.get('education') # Added education for profile view
        
        result.append(msg)
        
    return result
