from fastapi import APIRouter, HTTPException, Body
from google.oauth2 import id_token
from google.auth.transport import requests
from services.database import db
from services.auth import create_token
from services.id_generator import generate_unique_id
from models.user import User, TokenResponse
from datetime import datetime, timezone
import os
import uuid

router = APIRouter(prefix="/auth", tags=["Google Authentication"])

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID")


@router.post("/google", response_model=TokenResponse)
async def google_login(token: str = Body(..., embed=True)):
    """
    Verify Google ID Token and login/register user.
    No user_type needed — auto-detected from existing accounts.
    New users default to 'client'.
    """
    try:
        id_info = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID if GOOGLE_CLIENT_ID != "YOUR_GOOGLE_CLIENT_ID" else None,
        )

        email = id_info["email"].lower().strip()
        name = id_info.get("name", "")
        picture = id_info.get("picture", "")

        # ── 1. Check main users collection
        user = await db.users.find_one({"email": email})
        if user:
            await db.users.update_one({"email": email}, {"$set": {"picture": picture}})
            stored_type = user.get("user_type", "client")
            token_out = create_token(user["id"], stored_type)
            user_response = {k: v for k, v in user.items() if k not in ("password", "password_hash", "_id")}
            user_response["picture"] = picture
            return {"token": token_out, "user": user_response}

        # ── 2. Check firm_clients collection
        firm_client = await db.firm_clients.find_one({"email": email})
        if firm_client:
            import os as _os
            from jose import jwt as _jwt
            client_id = firm_client.get("id", str(firm_client.get("_id", "")))
            token_data = {
                "email": email,
                "role": "firm_client",
                "client_id": client_id,
                "law_firm_id": firm_client.get("law_firm_id", ""),
            }
            token_out = _jwt.encode(token_data, _os.environ.get("JWT_SECRET", "secret"), algorithm="HS256")
            user_response = {k: v for k, v in firm_client.items() if k not in ("password", "_id")}
            user_response["user_type"] = "firm_client"
            user_response["picture"] = picture
            return {"token": token_out, "user": user_response}

        # ── 3. Check if email is already in any application (block Google auto-signup)
        if await db.lawyer_applications.find_one({"email": email}):
            raise HTTPException(
                status_code=400,
                detail="This email already has a pending Lawyer application. Please use email/password login."
            )
        if await db.lawfirm_applications.find_one({"contact_email": email}):
            raise HTTPException(
                status_code=400,
                detail="This email already has a pending Law Firm application. Please use email/password login."
            )

        # ── 4. Register new client
        user_id = str(uuid.uuid4())
        new_user = {
            "id": user_id,
            "email": email,
            "full_name": name,
            "picture": picture,
            "user_type": "client",
            "unique_id": await generate_unique_id("client"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True,
            "auth_provider": "google",
        }

        await db.users.insert_one(new_user)
        token_out = create_token(user_id, "client")
        new_user.pop("_id", None)
        return {"token": token_out, "user": new_user}

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google Login Failed: {str(e)}")
