from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    user_type: Literal['client', 'lawyer', 'law_firm']
    phone: Optional[str] = None
    firm_name: Optional[str] = None
    practice_start_date: Optional[str] = None
    education_details: Optional[dict] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    user_type: Literal['client', 'lawyer', 'law_firm']


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    user_type: Literal['client', 'lawyer', 'law_firm']
    phone: Optional[str] = None
    firm_name: Optional[str] = None
    practice_start_date: Optional[str] = None
    education_details: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TokenResponse(BaseModel):
    token: str
    user: dict
