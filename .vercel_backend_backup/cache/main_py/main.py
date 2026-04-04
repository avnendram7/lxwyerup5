import sys
import os
import traceback
from pathlib import Path

# Add backend directory to path for imports
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

class DynamicDispatcher:
    def __init__(self):
        self.handler = None
        self.error_trace = None

    async def __call__(self, scope, receive, send):
        if self.handler:
            await self.handler(scope, receive, send)
        else:
            if scope["type"] == "http":
                await send({
                    'type': 'http.response.start',
                    'status': 500,
                    'headers': [(b'content-type', b'text/plain')],
                })
                await send({
                    'type': 'http.response.body',
                    'body': f"Startup Crash:\n{self.error_trace}".encode('utf-8'),
                })
            else:
                pass

app = DynamicDispatcher()

try:
    from fastapi import FastAPI, APIRouter
    from fastapi.staticfiles import StaticFiles
    from dotenv import load_dotenv
    from starlette.middleware.cors import CORSMiddleware
    import logging

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
    real_app = FastAPI(title="Lxwyer Up API")

    # Create a router with the /api prefix
    api_router = APIRouter(prefix="/api")

    # Root endpoints
    @real_app.get("/")
    async def root_redirect():
        return {"message": "Welcome to Lxwyer Up API", "status": "online", "docs": "/docs", "health": "/api/health"}

    @api_router.get("/")
    async def root():
        return {"message": "Lxwyer Up API", "status": "online"}

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
    real_app.include_router(api_router)

    # Mount uploads directory to serve files
    try:
        uploads_dir = ROOT_DIR / "uploads"
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
        real_app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
    except Exception:
        pass

    _cors_origins_raw = os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    _cors_origins = [o.strip() for o in _cors_origins_raw.split(",") if o.strip()]

    real_app.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_origins=_cors_origins,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
        expose_headers=["X-Request-ID"],
        max_age=600,
    )

    real_app.add_middleware(IPGuardMiddleware)
    real_app.add_middleware(SecurityMiddleware)

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)

    import asyncio

    _IS_VERCEL = os.environ.get("VERCEL") == "1"

    @real_app.on_event("startup")
    async def startup_event():
        if not _IS_VERCEL:
            from services.scheduler import run_scheduler
            asyncio.create_task(run_scheduler())

    @real_app.on_event("shutdown")
    async def shutdown_db_client():
        await close_db()

    app.handler = real_app

except Exception as e:
    app.error_trace = traceback.format_exc()
    print("FATAL ERROR IN FASTAPI INIT:\n", app.error_trace)
