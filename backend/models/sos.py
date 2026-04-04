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
    sos_type: Literal['sos_talk', 'sos_full'] = 'sos_talk'

    matched_lawyer_id: Optional[str] = None
    matched_lawyer_name: Optional[str] = None
    matched_lawyer_phone: Optional[str] = None
    matched_lawyer_specialization: Optional[str] = None

    status: Literal['searching', 'matched', 'active', 'completed', 'flagged', 'no_lawyer', 'cancelled_otp'] = 'searching'

    # Billing
    base_amount: int = 300          # 300 for talk, 1100 for full
    billing_ticks: int = 0          # number of extra 30-min blocks (full SOS only)
    total_billed: int = 300         # dynamically updated
    amount_paid: int = 0
    payment_id: Optional[str] = None

    # OTP presence verification
    current_otp: Optional[str] = None
    otp_expires_at: Optional[str] = None
    otp_confirmed_user: bool = False
    otp_confirmed_lawyer: bool = False

    # Decline tracking
    declined_lawyer_ids: List[str] = []

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
    sos_type: Literal['sos_talk', 'sos_full'] = 'sos_talk'

class SOSSessionStatusUpdate(BaseModel):
    status: Literal['searching', 'matched', 'active', 'completed', 'flagged', 'no_lawyer', 'cancelled_otp']
    admin_notes: Optional[str] = None

class SOSOtpVerify(BaseModel):
    otp: str
    party: Literal['user', 'lawyer']

class SOSBillingTick(BaseModel):
    session_id: str

class SOSToggleType(BaseModel):
    sos_type: Literal['sos_talk', 'sos_full']

class SOSTranscriptAdd(BaseModel):
    sender: str
    sender_name: str
    text: str
