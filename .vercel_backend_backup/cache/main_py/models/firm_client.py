from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class FirmClientApplication(BaseModel):
    """Model for firm client applications"""
    id: str = Field(default_factory=lambda: __import__('uuid').uuid4().hex)
    full_name: str
    email: EmailStr
    password: str  # Will be hashed before storing
    phone: str
    company_name: Optional[str] = None
    case_type: str  # civil, criminal, corporate, family, etc.
    case_description: str
    law_firm_id: str
    law_firm_name: str
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None  # manager email
    rejection_reason: Optional[str] = None

class FirmClient(BaseModel):
    """Model for approved firm clients"""
    id: str = Field(default_factory=lambda: __import__('uuid').uuid4().hex)
    full_name: str
    email: EmailStr
    password: str  # hashed
    phone: str
    company_name: Optional[str] = None
    case_type: str
    case_description: str
    law_firm_id: str
    law_firm_name: str
    assigned_lawyer_id: Optional[str] = None
    assigned_lawyer_name: Optional[str] = None
    status: str = "active"  # active, inactive, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class ClientCaseUpdate(BaseModel):
    """Model for case progress updates"""
    id: str = Field(default_factory=lambda: __import__('uuid').uuid4().hex)
    client_id: str
    law_firm_id: str
    update_type: str  # meeting_scheduled, document_submitted, hearing_date, progress_update
    title: str
    description: str
    created_by: str  # lawyer or manager email
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FirmClientLogin(BaseModel):
    """Login credentials for firm clients"""
    email: EmailStr
    password: str
