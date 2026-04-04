from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import Optional
import uuid


class CaseCreate(BaseModel):
    title: str
    case_number: str
    description: str
    status: str = 'active'
    client_name: str = "Unknown Client"
    case_type: str = "General"
    next_hearing: str = None
    court: str = None
    lawyer_name: Optional[str] = None
    updates: list = []


class Case(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    title: str
    case_number: Optional[str] = None
    description: str
    status: str
    client_name: str = "Unknown Client"
    case_type: str = "General"
    next_hearing: str = None
    court: str = None
    lawyer_name: Optional[str] = None
    updates: list[dict] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
