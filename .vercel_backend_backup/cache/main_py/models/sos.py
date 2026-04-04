from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal, List
from datetime import datetime, timezone
import uuid

class SOSMissedCall(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lawyer_id: str
    client_id: Optional[str] = None
    call_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: Literal['pending', 'disputed', 'penalized', 'waived'] = 'pending'
    penalty_amount: int = 250
    dispute_reason: Optional[str] = None
    dispute_file_url: Optional[str] = None
    disputed_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    resolved_by_admin_id: Optional[str] = None
    admin_notes: Optional[str] = None

class SOSMissedCallDispute(BaseModel):
    dispute_reason: str
    dispute_file_url: Optional[str] = None

class SOSMissedCallResolve(BaseModel):
    action: Literal['penalize', 'waive']
    admin_notes: Optional[str] = None

# ── SOS Session (Emergency Booking) ──────────────────────────────────────────

class SOSTranscriptMessage(BaseModel):
    sender: str  # 'user' | 'lawyer' | 'system'
    sender_name: str
    text: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SOSSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_phone: str
    user_name: Optional[str] = None
    user_state: str
    user_city: str
    issue_type: str
    matched_lawyer_id: Optional[str] = None
    matched_lawyer_name: Optional[str] = None
    matched_lawyer_phone: Optional[str] = None
    matched_lawyer_specialization: Optional[str] = None
    status: Literal['searching', 'matched', 'active', 'completed', 'flagged', 'no_lawyer'] = 'searching'
    amount_paid: int = 299
    payment_id: Optional[str] = None
    transcript: List[SOSTranscriptMessage] = []
    admin_notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    connected_at: Optional[str] = None
    ended_at: Optional[str] = None

class SOSSessionRequest(BaseModel):
    user_phone: str
    user_name: Optional[str] = None
    user_state: str
    user_city: str
    issue_type: str

class SOSSessionStatusUpdate(BaseModel):
    status: Literal['searching', 'matched', 'active', 'completed', 'flagged', 'no_lawyer']
    admin_notes: Optional[str] = None

class SOSTranscriptAdd(BaseModel):
    sender: str
    sender_name: str
    text: str

