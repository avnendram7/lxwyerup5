from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
import uuid
from typing import Optional


class BookingCreate(BaseModel):
    """Fields accepted from the client when creating a booking."""
    lawyer_id: str
    lawyer_name: str = ""        # sent by frontend from selectedLawyer.name
    lawyer_photo: str = ""       # sent by frontend from selectedLawyer.photo
    date: str
    time: str
    description: str
    price: float = 0.0
    consultation_fee: float = 0.0   # the lawyer's listed fee (even for free trials)
    amount: float = 0.0             # alias used by some flows
    duration_minutes: int = 30
    consultation_type: str = "video"
    status: str = "pending"


class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    lawyer_id: str
    lawyer_name: str = ""
    lawyer_photo: str = ""
    consultation_fee: float = 0.0   # lawyer's listed fee (preserved even for free-trial bookings)
    date: str
    time: str
    description: str
    price: float = 0.0
    meet_link: str = ""
    duration_minutes: int = 30
    is_free_trial: bool = False
    consultation_type: str = "video"
    location: str = ""
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # ── Reschedule handshake fields ─────────────────────────────────────────
    proposed_date: Optional[str] = None       # new date proposed by either party
    proposed_time: Optional[str] = None       # new time proposed by either party
    reschedule_by: Optional[str] = None       # "lawyer" or "user"
    reschedule_deadline: Optional[datetime] = None  # auto-cancel after this time
