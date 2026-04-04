from fastapi import APIRouter, HTTPException, Body
from google.oauth2 import id_token
from google.auth.transport import requests
from services.database import db
from services.auth import create_token
from models.user import User, TokenResponse
from datetime import datetime, timezone
import os
import uuid

router = APIRouter(prefix="/auth", tags=["Google Authentication"])

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID')

@router.post("/google", response_model=TokenResponse)
async def google_login(token: str = Body(..., embed=True), user_type: str = Body(..., embed=True)):
    """
    Verify Google ID Token and login/register user.
    """
    try:
        # Verify the token
        # Note: In production, you must specify the CLIENT_ID to verify the audience.
        # For now, we are permissive if env var is not set effectively.
        id_info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID if GOOGLE_CLIENT_ID != 'YOUR_GOOGLE_CLIENT_ID' else None)
        
        email = id_info['email']
        name = id_info.get('name', '')
        picture = id_info.get('picture', '')
        
        # Check if user exists
        user = await db.users.find_one({'email': email})
        
        if user:
            # Login existing user
            # Update user info if needed (e.g. picture)
            await db.users.update_one({'email': email}, {'$set': {'picture': picture}})
            
            # Use existing user data
            user_id = user['id']
            # If existing user has different type, we might want to handle that. 
            # For now, we trust the existing type or update it? 
            # Better to keep existing type unless explicitly migrating.
            # But the token creation needs the type.
            stored_user_type = user.get('user_type', user_type)
            
            token = create_token(user_id, stored_user_type)
            
            # Return user data without sensitive info
            user_response = {k: v for k, v in user.items() if k not in ['password', 'password_hash']}
            user_response['picture'] = picture # Ensure picture is in response
            
            return {'token': token, 'user': user_response}
            
        else:
            # Register new user
            user_id = str(uuid.uuid4())
            new_user = {
                "id": user_id,
                "email": email,
                "full_name": name,
                "picture": picture,
                "user_type": user_type,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "is_active": True,
                "auth_provider": "google"
            }
            
            await db.users.insert_one(new_user)
            
            token = create_token(user_id, user_type)
            
            return {'token': token, 'user': new_user}
            
    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google Login Failed: {str(e)}")
