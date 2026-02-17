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
    admin_router,
    firm_lawyers_router,
    firm_clients_router,
    dashboard_router,
    auth_google_router,
    messages_router,
    network_router,
    events_router,
    notifications_router
)
from services.database import close_db

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

# Legacy endpoint for lawyer applications (for backward compatibility)
from routes.lawyers import submit_lawyer_application
api_router.post("/lawyer-applications")(submit_lawyer_application)

# Legacy endpoint for lawfirm applications (for backward compatibility)
from routes.lawfirms import submit_lawfirm_application
api_router.post("/lawfirm-applications")(submit_lawfirm_application)

# Legacy endpoint for firm lawyer applications
from routes.firm_lawyers import submit_firm_lawyer_application
api_router.post("/firm-lawyer-applications")(submit_firm_lawyer_application)

# Include the router in the main app
app.include_router(api_router)

# Mount uploads directory to serve files
if not os.path.exists(ROOT_DIR / "uploads"):
    os.makedirs(ROOT_DIR / "uploads")
app.mount("/uploads", StaticFiles(directory=ROOT_DIR / "uploads"), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db()
