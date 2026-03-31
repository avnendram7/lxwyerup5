from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
import sys

# Add backend directory to path for imports
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

load_dotenv(ROOT_DIR / '.env')

# Import routes
from routes import (
    auth_router,
    cases_router,
    documents_router,
    chat_router,
    bookings_router,
    lawyers_router,
    lawfirms_router,
    waitlist_router,
    admin_router,
    firm_lawyers_router,
    firm_clients_router,
    dashboard_router,
    auth_google_router,
    messages_router,
    network_router,
    events_router,
    notifications_router,
    otp_router,
    billing_router,
    legal_chat_router,
    sos_router
)
from routes.monitor import router as monitor_router
from routes.smart_match import router as smart_match_router
from middleware import IPGuardMiddleware
from middleware.security import SecurityMiddleware

from services.database import close_db
from models.lawyer_application import LawyerApplicationCreate
from routes.lawfirms import LawFirmApplicationCreate
from routes.firm_lawyers import FirmLawyerApplicationCreate

# Create the main app
app = FastAPI(title="Lxwyer Up API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Root endpoints
@api_router.get("/")
async def root():
    return {"message": "Lxwyer Up API"}


@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Lxwyer Up API"}


# Include all route modules
api_router.include_router(auth_router)
api_router.include_router(auth_google_router)
api_router.include_router(cases_router)
api_router.include_router(documents_router)
api_router.include_router(chat_router)
api_router.include_router(bookings_router)
api_router.include_router(lawyers_router)
api_router.include_router(lawfirms_router)
api_router.include_router(waitlist_router)
api_router.include_router(admin_router)
api_router.include_router(firm_lawyers_router)
api_router.include_router(firm_clients_router)
api_router.include_router(dashboard_router)
api_router.include_router(messages_router)
api_router.include_router(network_router)
api_router.include_router(events_router)
api_router.include_router(notifications_router)
api_router.include_router(otp_router)
api_router.include_router(billing_router)
api_router.include_router(legal_chat_router)
api_router.include_router(sos_router)
api_router.include_router(monitor_router)
api_router.include_router(smart_match_router)

# Legacy endpoint for lawyer applications (for backward compatibility)
# These are already included via their respective routers, but if we need specific paths:
# The routers are already included above with prefixes.
# api_router.include_router(lawyers_router) adds /api/lawyers/...
# To support /api/lawyer-applications, we should add a redirect or specific route wrapper.

from routes.lawyers import submit_lawyer_application
@api_router.post("/lawyer-applications")
async def submit_lawyer_application_legacy(application: LawyerApplicationCreate):
    return await submit_lawyer_application(application)

from routes.lawfirms import submit_lawfirm_application
@api_router.post("/lawfirm-applications")
async def submit_lawfirm_application_legacy(application: LawFirmApplicationCreate):
    return await submit_lawfirm_application(application)

from routes.firm_lawyers import submit_firm_lawyer_application
@api_router.post("/firm-lawyer-applications")
async def submit_firm_lawyer_application_legacy(application: FirmLawyerApplicationCreate):
    return await submit_firm_lawyer_application(application)

# Include the router in the main app
app.include_router(api_router)

# Mount uploads directory to serve files
# On Vercel (read-only filesystem) this will be skipped gracefully
try:
    uploads_dir = ROOT_DIR / "uploads"
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
except Exception:
    pass  # Vercel serverless: filesystem is read-only, uploads served via cloud storage

# CORS — restrict to known origins in production
# Update ALLOWED_ORIGIN env var when you go live
_cors_origins_raw = os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
_cors_origins = [o.strip() for o in _cors_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_cors_origins,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
    expose_headers=["X-Request-ID"],
    max_age=600,
)

# IP Guard — restrict /api/admin/* and /api/monitor/* to localhost only.
app.add_middleware(IPGuardMiddleware)

# Security headers, brute-force lockout, request size limits
app.add_middleware(SecurityMiddleware)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


import asyncio

# VERCEL env var is automatically set to "1" on Vercel
_IS_VERCEL = os.environ.get("VERCEL") == "1"

@app.on_event("startup")
async def startup_event():
    # Background scheduler cannot run in Vercel serverless (no persistent process)
    if not _IS_VERCEL:
        from services.scheduler import run_scheduler
        asyncio.create_task(run_scheduler())

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db()
