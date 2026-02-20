from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime, timezone
import uuid


class LawyerApplicationCreate(BaseModel):
    office_address: Optional[str] = None
    name: str
    email: EmailStr
    phone: str
    password: str
    photo: Optional[str] = None
    bar_council_number: str
    specialization: str
    experience: int
    cases_won: int = 0
    state: str
    city: str
    court: str
    education: str
    languages: List[str]
    fee_range: str
    bio: str
    lawyer_type: str = 'independent'  # independent, law_firm
    law_firm_id: Optional[str] = None
    law_firm_name: Optional[str] = None
    practice_start_date: Optional[str] = None
    education_details: Optional[dict] = None


class LawyerApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    password_hash: str
    office_address: Optional[str] = None
    photo: Optional[str] = None
    bar_council_number: str
    specialization: str
    experience: int
    cases_won: int = 0
    state: str
    city: str
    court: str
    education: str
    languages: List[str]
    fee_range: str
    bio: str
    status: str = 'pending'  # pending, approved, rejected
    lawyer_type: str = 'independent'
    law_firm_id: Optional[str] = None
    law_firm_name: Optional[str] = None
    practice_start_date: Optional[str] = None
    education_details: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AdminLogin(BaseModel):
    email: EmailStr
    password: str
