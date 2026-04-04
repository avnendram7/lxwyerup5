import bcrypt
import jwt
import os
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.database import db

JWT_SECRET = os.environ.get('JWT_SECRET', '')
if not JWT_SECRET or JWT_SECRET == 'your-secret-key':
    import secrets
    JWT_SECRET = secrets.token_hex(32)
    print("WARNING: JWT_SECRET not set in .env — using a random secret. Set JWT_SECRET for persistent sessions.")
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', '8'))   # 8 hours default
JWT_ADMIN_EXPIRATION_HOURS = int(os.environ.get('JWT_ADMIN_EXPIRATION_HOURS', '8'))  # 8 hours

security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, user_type: str) -> str:
    """Create a JWT token for a user — expires in JWT_EXPIRATION_HOURS"""
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_admin_token(email: str) -> str:
    """Create a JWT token for admin/monitor — expires in JWT_ADMIN_EXPIRATION_HOURS"""
    payload = {
        'email': email,
        'role': 'admin',
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_ADMIN_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode and validate a JWT token"""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

def verify_admin_token(token: str) -> dict:
    """Verify admin token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get('role') != 'admin':
            raise HTTPException(status_code=403, detail='Admin access required')
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload.get('role') == 'admin':
        return {
            'id': 'admin',
            '_id': 'admin',
            'full_name': 'System Admin',
            'email': payload.get('email', 'admin'),
            'user_type': 'admin',
            'state': 'Delhi' # Generic default for Admin
        }
        
    user_id = payload.get('user_id')
    if not user_id:
        raise HTTPException(status_code=401, detail='Invalid token payload')
        
    user = await db.users.find_one({'id': user_id})
    if not user:
        # Fallback to _id string just in case the token was generated with the MongoDB _id
        from bson.errors import InvalidId
        from bson.objectid import ObjectId
        try:
            user = await db.users.find_one({'_id': ObjectId(user_id)})
        except InvalidId:
            pass
            
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
        
    user['_id'] = str(user['_id'])  # Convert ObjectId to string for matching
    return user
