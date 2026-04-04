from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.notification import Notification
from services.database import db
from routes.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[Notification])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get notifications for the current user"""
    notifications = await db.notifications.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).to_list(50)
    
    return notifications

@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a notification as read"""
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user["id"]},
        {"$set": {"is_read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"success": True}

async def create_notification(user_id: str, title: str, message: str, n_type: str, related_id: str = None):
    """Helper function to create a notification"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=n_type,
        related_id=related_id
    )
    await db.notifications.insert_one(notification.model_dump())
