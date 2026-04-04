from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    receiver_id: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read: bool = False
    pre_appointment: bool = False  # True if sent during confirmed-booking waiting period
