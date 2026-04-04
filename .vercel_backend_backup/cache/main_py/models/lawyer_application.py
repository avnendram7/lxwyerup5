from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List, Union
from datetime import datetime, timezone
import uuid


class LawyerApplicationCreate(BaseModel):
    office_address: Optional[Union[str, List[str]]] = None
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
    court: Union[str, List[str]]
    detailed_court_experience: Optional[List[dict]] = None
    primary_court: Optional[str] = None
    education: str
    languages: List[str]
    fee_range: str
    bio: str
    lawyer_type: str = 'independent'  # independent, law_firm
    law_firm_id: Optional[str] = None
    law_firm_name: Optional[str] = None
    practice_start_date: Optional[str] = None
    education_details: Optional[dict] = None
    bar_council_photo: Optional[str] = None
    college_degree_photo: Optional[str] = None
    office_address_photo: Optional[str] = None
    aadhar_card_photo: Optional[str] = None
    aadhar_card_front: Optional[str] = None
    aadhar_card_back: Optional[str] = None
    pan_card: Optional[str] = None
    application_type: List[str] = Field(default_factory=lambda: ["normal"]) # normal, sos
    sos_locations: Optional[List[str]] = None
    sos_matters: Optional[List[str]] = None
    sos_terms_accepted: Optional[bool] = None


class LawyerApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    password_hash: str
    office_address: Optional[Union[str, List[str]]] = None
    photo: Optional[str] = None
    bar_council_number: str
    specialization: str
    experience: int
    cases_won: int = 0
    state: str
    city: str
    court: Union[str, List[str]]
    detailed_court_experience: Optional[List[dict]] = None
    primary_court: Optional[str] = None
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
    bar_council_photo: Optional[str] = None
    college_degree_photo: Optional[str] = None
    office_address_photo: Optional[str] = None
    aadhar_card_photo: Optional[str] = None
    aadhar_card_front: Optional[str] = None
    aadhar_card_back: Optional[str] = None
    pan_card: Optional[str] = None
    application_type: List[str] = Field(default_factory=lambda: ["normal"])
    sos_locations: Optional[List[str]] = None
    sos_matters: Optional[List[str]] = None
    sos_terms_accepted: Optional[bool] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    email: EmailStr
    password: str
