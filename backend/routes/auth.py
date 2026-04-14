from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import User, UserCreate, UserLogin, TokenResponse
from services.auth import hash_password, verify_password, create_token, decode_token, get_current_user
from services.database import db

router = APIRouter(prefix="/auth", tags=["Authentication"])


# --------------------------------------------------------------------------- #
#  Shared helper: check whether an email is taken across ALL collections
# --------------------------------------------------------------------------- #
async def _email_taken_globally(email: str) -> str | None:
    """
    Returns a human-readable message if the email already exists in ANY
    collection, otherwise returns None.

    Collections checked:
      users               → client / lawyer / law_firm / firm_lawyer
      firm_clients        → firm_client accounts
      firm_client_applications → pending firm-client applications
      lawyer_applications → pending lawyer applications
      lawfirm_applications → pending law-firm applications
      firm_lawyer_applications → pending firm-lawyer applications
    """
    email_lower = email.lower().strip()

    if await db.users.find_one({"email": email_lower}):
        return "This email is already registered. Please log in instead."
    if await db.firm_clients.find_one({"email": email_lower}):
        return "This email is already registered as a Firm Client. Please log in instead."
    if await db.firm_client_applications.find_one({"email": email_lower}):
        return "This email already has a pending Firm Client application."
    if await db.lawyer_applications.find_one({"email": email_lower}):
        return "This email already has a pending Lawyer application."
    if await db.lawfirm_applications.find_one({"contact_email": email_lower}):
        return "This email already has a pending Law Firm application."
    if await db.firm_lawyer_applications.find_one({"email": email_lower}):
        return "This email already has a pending Firm Lawyer application."

    return None


async def register_user(user_data: UserCreate):
    """Register a new client user — shared logic."""
    email = user_data.email.lower().strip()

    taken_msg = await _email_taken_globally(email)
    if taken_msg:
        raise HTTPException(status_code=400, detail=taken_msg)

    user_dict = user_data.model_dump()
    user_dict["email"] = email
    hashed_pwd = hash_password(user_dict.pop("password"))
    user_obj = User(**user_dict)

    doc = user_obj.model_dump()

    from services.id_generator import generate_unique_id
    doc["unique_id"] = await generate_unique_id(user_obj.user_type)
    doc["password"] = hashed_pwd
    doc["created_at"] = doc["created_at"].isoformat()

    await db.users.insert_one(doc)

    token = create_token(user_obj.id, user_obj.user_type)
    user_response = user_obj.model_dump()

    return {"token": token, "user": user_response}


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    return await register_user(user_data)


@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    """Sign up a new user (alias for register)"""
    return await register_user(user_data)


# --------------------------------------------------------------------------- #
#  Unified login — auto-detects user type from email
# --------------------------------------------------------------------------- #
@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    """
    Unified login endpoint.  Only email + password are required.
    user_type is auto-detected by searching all collections.
    """
    email = login_data.email.lower().strip()

    EXCLUDED_FIELDS = {
        "password", "password_hash",
        "aadhar_card_photo", "bar_certificate",
        "firm_registration_doc", "degree_certificate",
    }

    def _strip(user: dict) -> dict:
        result = {}
        for k, v in user.items():
            if k in EXCLUDED_FIELDS:
                continue
            if isinstance(v, str) and len(v) > 10240 and v.startswith("data:"):
                continue
            result[k] = v
        return result

    # ── 1. Search main users collection (client / lawyer / law_firm / firm_lawyer)
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if user:
        from services.auth import verify_password as vp
        pw_field = user.get("password_hash") or user.get("password")
        if not pw_field or not vp(login_data.password, pw_field):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if user.get("user_type") == "firm_lawyer" and not user.get("is_active", True):
            raise HTTPException(
                status_code=403,
                detail="Account is deactivated. Contact your firm manager."
            )

        # Pending lawyer / law_firm check
        if user.get("user_type") == "lawyer":
            app = await db.lawyer_applications.find_one({"email": email})
            if app and app.get("status") == "pending":
                raise HTTPException(status_code=403, detail="Your application is pending approval")

        token = create_token(user["id"], user["user_type"])
        return {"token": token, "user": _strip(user)}

    # ── 2. Search firm_clients collection
    from passlib.context import CryptContext
    pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

    firm_client = await db.firm_clients.find_one({"email": email})
    if firm_client:
        if not pwd_ctx.verify(login_data.password, firm_client.get("password", "")):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if firm_client.get("status") == "pending_approval":
            raise HTTPException(status_code=403, detail="Your account is pending admin approval.")
        if firm_client.get("status") == "rejected":
            raise HTTPException(status_code=403, detail="Your account was rejected. Contact support.")

        import os
        from jose import jwt as _jwt
        client_id = firm_client.get("id", str(firm_client.get("_id", "")))
        token_data = {
            "email": firm_client["email"],
            "role": "firm_client",
            "client_id": client_id,
            "law_firm_id": firm_client.get("law_firm_id", ""),
        }
        token = _jwt.encode(token_data, os.environ.get("JWT_SECRET", "secret"), algorithm="HS256")
        response_user = {k: v for k, v in firm_client.items()
                         if k not in ("password", "_id")}
        response_user["user_type"] = "firm_client"
        return {"token": token, "user": response_user}

    # ── 3. Check pending lawyer / law_firm applications (preserved from old logic)
    lawyer_app = await db.lawyer_applications.find_one({"email": email})
    if lawyer_app:
        pw_hash = lawyer_app.get("password_hash")
        if pw_hash and verify_password(login_data.password, pw_hash):
            status = lawyer_app.get("status", "pending")
            if status == "pending":
                raise HTTPException(status_code=403, detail="Your application is pending approval")
            elif status == "rejected":
                raise HTTPException(status_code=403, detail="Your application was rejected")

    lawfirm_app = await db.lawfirm_applications.find_one({"contact_email": email})
    if lawfirm_app:
        pw_hash = lawfirm_app.get("password_hash")
        if pw_hash and verify_password(login_data.password, pw_hash):
            status = lawfirm_app.get("status", "pending")
            if status == "pending":
                raise HTTPException(status_code=403, detail="Your application is pending approval")
            elif status == "rejected":
                raise HTTPException(status_code=403, detail="Your application was rejected")

    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return {k: v for k, v in current_user.items() if k != "password"}


@router.put("/me")
async def update_me(update_data: dict = Body(...), current_user: dict = Depends(get_current_user)):
    """Update current user's profile fields."""
    allowed_fields = {"full_name", "phone", "bio", "photo", "achievements"}
    update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    await db.users.update_one({"id": current_user["id"]}, {"$set": update_fields})
    updated = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "password": 0})
    return updated


from fastapi import UploadFile, File
import os
import uuid


@router.post("/upload-image")
async def upload_general_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload a general image (e.g. for achievements) and return its URL."""
    UPLOAD_DIR = "uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_extension = os.path.splitext(file.filename)[1]
    filename = f"img_{current_user['id']}_{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    contents: bytes = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB.")

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    return {"url": f"/uploads/{filename}"}
