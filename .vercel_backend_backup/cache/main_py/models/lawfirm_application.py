from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime, timezone
import uuid


class LawFirmApplicationCreate(BaseModel):
    firm_name: str
    registration_number: str
    established_year: int
    website: Optional[str] = None
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    contact_designation: Optional[str] = None
    password: str
    address: Optional[str] = None
    city: str
    state: str
    pincode: Optional[str] = None
    practice_areas: List[str]
    total_lawyers: int
    total_staff: int = 0
    description: str
    achievements: Optional[str] = None


class LawFirmApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    firm_name: str
    registration_number: str
    established_year: int
    website: Optional[str] = None
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    contact_designation: Optional[str] = None
    password_hash: str
    address: Optional[str] = None
    city: str
    state: str
    pincode: Optional[str] = None
    practice_areas: List[str]
    total_lawyers: int
    total_staff: int = 0
    description: str
    achievements: Optional[str] = None
    status: str = 'pending'  # pending, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
