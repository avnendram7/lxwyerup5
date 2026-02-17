from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import User, UserCreate, UserLogin, TokenResponse
from services.auth import hash_password, verify_password, create_token, decode_token, get_current_user
from services.database import db

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def register_user(user_data: UserCreate):
    """Register a new user - shared logic"""
    existing = await db.users.find_one(
        {'email': user_data.email, 'user_type': user_data.user_type}, 
        {'_id': 0}
    )
    if existing:
        raise HTTPException(status_code=400, detail='User already exists')
    
    user_dict = user_data.model_dump()
    hashed_pwd = hash_password(user_dict.pop('password'))
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['password'] = hashed_pwd
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    token = create_token(user_obj.id, user_obj.user_type)
    user_response = user_obj.model_dump()
    
    return {'token': token, 'user': user_response}


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    return await register_user(user_data)


@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    """Sign up a new user (alias for register)"""
    return await register_user(user_data)


@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    """Login user"""
    user = await db.users.find_one(
        {'email': login_data.email, 'user_type': login_data.user_type}, 
        {'_id': 0}
    )
    if not user:
        # Check if they have a pending application
        if login_data.user_type == 'lawyer':
            application = await db.lawyer_applications.find_one({'email': login_data.email})
            if application:
                # Verify password
                pwd_hash = application.get('password_hash')
                if pwd_hash and verify_password(login_data.password, pwd_hash):
                    status = application.get('status', 'pending')
                    if status == 'pending':
                        raise HTTPException(status_code=403, detail='Your application is pending approval')
                    elif status == 'rejected':
                        raise HTTPException(status_code=403, detail='Your application was rejected')
        
        elif login_data.user_type == 'law_firm':
             # Note: Law firm apps use 'contact_email'
            application = await db.lawfirm_applications.find_one({'contact_email': login_data.email})
            if application:
                # Verify password
                pwd_hash = application.get('password_hash')
                if pwd_hash and verify_password(login_data.password, pwd_hash):
                    status = application.get('status', 'pending')
                    if status == 'pending':
                        raise HTTPException(status_code=403, detail='Your application is pending approval')
                    elif status == 'rejected':
                        raise HTTPException(status_code=403, detail='Your application was rejected')

        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    # Check both password fields (password_hash for lawyers, password for regular users)
    password_field = user.get('password_hash') or user.get('password')
    if not password_field or not verify_password(login_data.password, password_field):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    # Check if firm_lawyer is active
    if login_data.user_type == 'firm_lawyer' and not user.get('is_active', True):
        raise HTTPException(status_code=403, detail='Account is deactivated. Contact your firm manager.')
    
    token = create_token(user['id'], user['user_type'])
    user_response = {k: v for k, v in user.items() if k not in ['password', 'password_hash']}
    
    return {'token': token, 'user': user_response}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return {k: v for k, v in current_user.items() if k != 'password'}
