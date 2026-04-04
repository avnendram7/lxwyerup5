from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import List, Optional
import uuid


class DocumentCreate(BaseModel):
    case_id: str
    title: str
    file_url: str
    file_type: str


class Document(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    case_id: str
    user_id: str
    title: str
    file_url: str
    file_type: str
    file_size: Optional[int] = None
    shared_with: List[str] = Field(default_factory=list) # List of user IDs
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
