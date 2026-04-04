# Routes Package
from .auth import router as auth_router
from .cases import router as cases_router
from .documents import router as documents_router
from .chat import router as chat_router
from .bookings import router as bookings_router
from .lawyers import router as lawyers_router
from .lawfirms import router as lawfirms_router
from .waitlist import router as waitlist_router
from .admin import router as admin_router
from .firm_lawyers import router as firm_lawyers_router
from .firm_clients import router as firm_clients_router
from .dashboard import router as dashboard_router
from .auth_google import router as auth_google_router
from .messages import router as messages_router
from .network import router as network_router
from .events import router as events_router
from .notifications import router as notifications_router
from .otp import router as otp_router
from .billing import router as billing_router
from .legal_chat import router as legal_chat_router
from .sos import router as sos_router

__all__ = [
    'auth_router',
    'cases_router', 
    'documents_router',
    'chat_router',
    'bookings_router',
    'lawyers_router',
    'lawfirms_router',
    'waitlist_router',
    'admin_router',
    'firm_lawyers_router',
    'firm_clients_router',
    'dashboard_router',
    'auth_google_router',
    'messages_router',
    'network_router',
    'events_router',
    'notifications_router',
    'otp_router',
    'billing_router',
    'legal_chat_router',
    'sos_router'
]
