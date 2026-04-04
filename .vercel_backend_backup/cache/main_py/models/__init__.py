# Models Package
from .user import User, UserCreate, UserLogin, TokenResponse
from .case import Case, CaseCreate
from .document import Document, DocumentCreate
from .chat import ChatMessage, ChatResponse
from .booking import Booking, BookingCreate
from .waitlist import Waitlist, WaitlistCreate
from .lawyer_application import LawyerApplication, LawyerApplicationCreate, AdminLogin

__all__ = [
    'User', 'UserCreate', 'UserLogin', 'TokenResponse',
    'Case', 'CaseCreate',
    'Document', 'DocumentCreate',
    'ChatMessage', 'ChatResponse',
    'Booking', 'BookingCreate',
    'Waitlist', 'WaitlistCreate',
    'LawyerApplication', 'LawyerApplicationCreate', 'AdminLogin'
]
