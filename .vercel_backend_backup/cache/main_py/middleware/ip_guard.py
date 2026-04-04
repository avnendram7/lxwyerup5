"""
IP Guard Middleware
Blocks all /api/admin/* and /api/monitor/* requests unless they
originate from an allowed IP (localhost by default).

To allow additional IPs (e.g. a second machine), add them to the
ADMIN_ALLOWED_IPS environment variable as a comma-separated list:
  ADMIN_ALLOWED_IPS=127.0.0.1,::1,192.168.1.42
"""
import os
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

# Default: localhost only.
# Set ADMIN_ALLOWED_IPS=* in production (Vercel) to allow all IPs,
# or provide a comma-separated list of specific IPs.
_raw = os.environ.get("ADMIN_ALLOWED_IPS", "127.0.0.1,::1,localhost")
_ALLOW_ALL_IPS: bool = _raw.strip() == "*"
ALLOWED_IPS: set[str] = set() if _ALLOW_ALL_IPS else {ip.strip() for ip in _raw.split(",") if ip.strip()}

# Routes that require local-only access
PROTECTED_PREFIXES = ("/api/admin", "/api/monitor")


def _get_client_ip(request: Request) -> str:
    """
    Read the real client IP, honouring X-Forwarded-For when behind a proxy.
    Returns the first (leftmost) IP in the chain — that's the original client.
    """
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client:
        return request.client.host
    return ""


class IPGuardMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Only check admin / monitor routes
        if any(path.startswith(prefix) for prefix in PROTECTED_PREFIXES):
            # If * is set, allow everyone (production/Vercel mode)
            if not _ALLOW_ALL_IPS:
                client_ip = _get_client_ip(request)
                if client_ip not in ALLOWED_IPS:
                    return JSONResponse(
                        status_code=403,
                        content={
                            "detail": "Access restricted to authorised networks.",
                            "code": "IP_NOT_ALLOWED",
                        },
                    )

        return await call_next(request)
