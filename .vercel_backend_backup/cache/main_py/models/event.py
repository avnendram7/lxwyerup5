from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
import uuid
from typing import Optional

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lawyer_id: str
    title: str
    type: str  # hearing, personal, meeting
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    case_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    title: str
    type: str
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    case_id: Optional[str] = None
