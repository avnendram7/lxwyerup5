from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime, timezone
import uuid
from services.database import db
from routes.auth import get_current_user
from models.message import Message, MessageCreate

router = APIRouter(prefix="/messages", tags=["Messages"])


async def _get_messaging_permission(user_id: str, other_user_id: str) -> dict:
    """
    Core messaging eligibility logic.
    Returns: { allowed: bool, reason: str, quota_left: int }
      quota_left = -1 means unlimited
      quota_left = 0  means used up (1 pre-appt msg already sent)
      quota_left = 1  means can send 1 pre-appointment message
    """
    # 1. Check if there's a case with approved status between these two users
    approved_case = await db.cases.find_one({
        "$or": [
            {"client_id": user_id, "lawyer_id": other_user_id, "status": "approved"},
            {"user_id": user_id, "lawyer_id": other_user_id, "status": "approved"},
            {"client_id": other_user_id, "lawyer_id": user_id, "status": "approved"},
            {"user_id": other_user_id, "lawyer_id": user_id, "status": "approved"},
        ]
    })
    if approved_case:
        return {"allowed": True, "reason": "Case approved — full messaging enabled", "quota_left": -1}

    # 2. Check if there's a confirmed booking between these two users
    confirmed_booking = await db.bookings.find_one({
        "$or": [
            {"client_id": user_id, "lawyer_id": other_user_id, "status": "confirmed"},
            {"client_id": other_user_id, "lawyer_id": user_id, "status": "confirmed"},
        ]
    })
    if confirmed_booking:
        # Count messages already sent in this thread by user_id (the requester's perspective)
        sent_count = await db.messages.count_documents({
            "sender_id": user_id,
            "receiver_id": other_user_id,
            "pre_appointment": True,
        })
        # Lawyer can always reply freely once user sends a message
        received_count = await db.messages.count_documents({
            "sender_id": other_user_id,
            "receiver_id": user_id,
        })

        # If the caller is the lawyer side, check the client's quota tracker (not the lawyer)
        # Lawyers can reply freely when appointment is confirmed
        lawyer_booking = await db.bookings.find_one({
            "lawyer_id": user_id,
            "$or": [
                {"client_id": other_user_id, "status": "confirmed"},
            ]
        })
        if lawyer_booking:
            # Caller is the lawyer — they can respond freely
            return {"allowed": True, "reason": "Lawyer can respond to pre-appointment messages freely", "quota_left": -1}

        quota_left = max(0, 1 - sent_count)
        if quota_left > 0:
            return {"allowed": True, "reason": "1 pre-appointment message allowed", "quota_left": quota_left}
        else:
            return {"allowed": False, "reason": "Pre-appointment message quota used. Awaiting case approval for full messaging.", "quota_left": 0}

    return {"allowed": False, "reason": "No confirmed booking or approved case found.", "quota_left": 0}


@router.get("/can-message/{other_user_id}")
async def can_message(other_user_id: str, current_user: dict = Depends(get_current_user)):
    """Check if current user can message another user, and how many messages are allowed."""
    user_id = current_user['id']
    return await _get_messaging_permission(user_id, other_user_id)


@router.get("/eligible-contacts")
async def get_eligible_contacts(current_user: dict = Depends(get_current_user)):
    """
    Returns all users/lawyers this user is eligible to message based on bookings/cases.
    Used to seed the contacts sidebar even before any messages are sent.
    """
    user_id = current_user['id']
    contacts = {}

    # Find all confirmed or completed bookings
    bookings_cursor = db.bookings.find({
        "$or": [
            {"client_id": user_id, "status": {"$in": ["confirmed", "completed"]}},
            {"lawyer_id": user_id, "status": {"$in": ["confirmed", "completed"]}},
        ]
    })
    async for b in bookings_cursor:
        # Determine the other person's ID
        if b.get("client_id") == user_id:
            other_id = b.get("lawyer_id")
            # Look up lawyer
            other = await db.lawyers.find_one({"id": other_id}) or await db.users.find_one({"id": other_id})
            name = other.get("full_name") if other else b.get("lawyer_name", "Lawyer")
        else:
            other_id = b.get("client_id") or b.get("user_id")
            other = await db.users.find_one({"id": other_id})
            name = other.get("full_name") if other else b.get("user_name", b.get("client_name", "Client"))

        if other_id and other_id not in contacts:
            perm = await _get_messaging_permission(user_id, other_id)
            contacts[other_id] = {
                "id": other_id,
                "other_user_id": other_id,
                "name": name or "Unknown",
                "avatar": (name or "?")[0].upper(),
                "online": False,
                "message": "Tap to send a message",
                "timestamp": b.get("created_at", datetime.now(timezone.utc).isoformat()),
                "unread": 0,
                "messaging_permission": perm,
                "booking_status": b.get("status"),
            }

    # Also find approved cases
    cases_cursor = db.cases.find({
        "$or": [
            {"client_id": user_id, "status": "approved"},
            {"user_id": user_id, "status": "approved"},
            {"lawyer_id": user_id, "status": "approved"},
        ]
    })
    async for c in cases_cursor:
        if c.get("lawyer_id") == user_id:
            other_id = c.get("client_id") or c.get("user_id")
            other = await db.users.find_one({"id": other_id})
            name = other.get("full_name") if other else c.get("client_name", "Client")
        else:
            other_id = c.get("lawyer_id")
            other = await db.lawyers.find_one({"id": other_id}) or await db.users.find_one({"id": other_id})
            name = other.get("full_name") if other else c.get("lawyer_name", "Lawyer")

        if other_id and other_id not in contacts:
            contacts[other_id] = {
                "id": other_id,
                "other_user_id": other_id,
                "name": name or "Unknown",
                "avatar": (name or "?")[0].upper(),
                "online": False,
                "message": "Case approved — messaging enabled",
                "timestamp": c.get("created_at", datetime.now(timezone.utc).isoformat()),
                "unread": 0,
                "messaging_permission": {"allowed": True, "reason": "Case approved", "quota_left": -1},
                "booking_status": "approved",
            }

    return list(contacts.values())


@router.get("/recents")
async def get_recent_conversations(current_user: dict = Depends(get_current_user)):
    """Fetch recent conversations (contacts with actual message history)."""
    user_id = current_user['id']

    pipeline = [
        {"$match": {"$or": [{"sender_id": user_id}, {"receiver_id": user_id}]}},
        {"$sort": {"timestamp": -1}},
        {
            "$group": {
                "_id": {
                    "$cond": [
                        {"$eq": ["$sender_id", user_id]},
                        "$receiver_id",
                        "$sender_id"
                    ]
                },
                "last_message": {"$first": "$$ROOT"}
            }
        },
        {"$replaceRoot": {"newRoot": "$last_message"}},
        {"$sort": {"timestamp": -1}}
    ]

    recent_messages = await db.messages.aggregate(pipeline).to_list(length=20)

    conversations = []
    for msg in recent_messages:
        other_user_id = msg['receiver_id'] if msg['sender_id'] == user_id else msg['sender_id']

        other_user = await db.users.find_one({"id": other_user_id})
        if not other_user:
            other_user = await db.lawyers.find_one({"id": other_user_id})

        name = other_user.get('full_name', 'Unknown User') if other_user else 'Unknown User'

        # Count unread messages
        unread = await db.messages.count_documents({
            "sender_id": other_user_id,
            "receiver_id": user_id,
            "read": False
        })

        # Get messaging permission
        perm = await _get_messaging_permission(user_id, other_user_id)

        conversations.append({
            "id": other_user_id,
            "other_user_id": other_user_id,
            "name": name,
            "message": msg['content'],
            "timestamp": msg['timestamp'],
            "unread": unread,
            "avatar": name[0].upper() if name else '?',
            "online": False,
            "messaging_permission": perm,
        })

    return conversations


@router.get("/{other_user_id}")
async def get_conversation(other_user_id: str, current_user: dict = Depends(get_current_user)):
    """Fetch conversation history with a specific user."""
    user_id = current_user['id']

    messages = await db.messages.find({
        "$or": [
            {"sender_id": user_id, "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": user_id}
        ]
    }, {"_id": 0}).sort("timestamp", 1).to_list(length=200)

    # Mark messages as read
    await db.messages.update_many(
        {"sender_id": other_user_id, "receiver_id": user_id, "read": False},
        {"$set": {"read": True}}
    )

    return messages


@router.post("", response_model=Message)
async def send_message(message_data: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Send a message — enforces booking/case-based quota."""
    user_id = current_user['id']
    receiver_id = message_data.receiver_id

    # Check eligibility
    perm = await _get_messaging_permission(user_id, receiver_id)

    if not perm["allowed"]:
        raise HTTPException(
            status_code=403,
            detail=perm["reason"]
        )

    # Determine if this is a pre-appointment message
    is_pre_appointment = perm["quota_left"] == 1

    new_message = Message(
        sender_id=user_id,
        receiver_id=receiver_id,
        content=message_data.content,
        pre_appointment=is_pre_appointment if is_pre_appointment else False,
    )

    await db.messages.insert_one(new_message.model_dump())
    return new_message
