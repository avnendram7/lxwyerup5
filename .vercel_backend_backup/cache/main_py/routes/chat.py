from fastapi import APIRouter, Depends
import uuid
from datetime import datetime, timezone
from models.chat import ChatMessage, ChatResponse
from services.database import db
from services.chat_service import send_chat_message, generate_guest_session_id
from routes.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def chat(chat_msg: ChatMessage, current_user: dict = Depends(get_current_user)):
    """Send a message to AI assistant (authenticated)"""
    session_id = current_user['id']
    
    response = await send_chat_message(
        message=chat_msg.message,
        session_id=session_id,
        system_prompt=chat_msg.system_prompt
    )
    
    # Save to chat history
    chat_history = {
        'id': str(uuid.uuid4()),
        'user_id': current_user['id'],
        'session_id': session_id,
        'message': chat_msg.message,
        'response': response,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }
    await db.chat_history.insert_one(chat_history)
    
    return {'response': response, 'session_id': session_id}


@router.post("/guest", response_model=ChatResponse)
async def guest_chat(chat_msg: ChatMessage):
    """Send a message to AI assistant (no authentication required)"""
    session_id = chat_msg.session_id if chat_msg.session_id else generate_guest_session_id()
    
    response = await send_chat_message(
        message=chat_msg.message,
        session_id=session_id,
        system_prompt=chat_msg.system_prompt
    )
    
    return {'response': response, 'session_id': session_id}


@router.get("/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    """Get chat history for current user"""
    history = await db.chat_history.find(
        {'user_id': current_user['id']},
        {'_id': 0}
    ).sort('timestamp', -1).limit(50).to_list(50)
    return history
