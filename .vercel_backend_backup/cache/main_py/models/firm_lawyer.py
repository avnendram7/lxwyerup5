from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid


class FirmLawyerCreate(BaseModel):
    """Model for creating a firm lawyer by manager"""
    full_name: str
    email: EmailStr
    password: str
    phone: str
    specialization: str
    experience_years: int = 1
    bar_council_number: Optional[str] = None
    languages: Optional[List[str]] = ["Hindi", "English"]


class FirmLawyerLogin(BaseModel):
    """Login model for firm lawyers"""
    email: EmailStr
    password: str
    user_type: str = "firm_lawyer"


class FirmLawyerResponse(BaseModel):
    """Response model for firm lawyer"""
    id: str
    full_name: str
    email: str
    phone: str
    specialization: str
    experience_years: int
    firm_id: str
    firm_name: str
    user_type: str = "firm_lawyer"
    is_active: bool = True
    created_at: datetime


class TaskCreate(BaseModel):
    """Model for creating a task for firm lawyer"""
    title: str
    description: str
    assigned_to: str  # firm_lawyer_id
    priority: str = "medium"  # high, medium, low
    due_date: Optional[str] = None
    case_id: Optional[str] = None
    case_name: Optional[str] = None


class TaskResponse(BaseModel):
    """Response model for task"""
    id: str
    title: str
    description: str
    assigned_to: str
    assigned_by: str
    priority: str
    status: str  # pending, in_progress, completed
    due_date: Optional[str]
    case_id: Optional[str]
    case_name: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime] = None
