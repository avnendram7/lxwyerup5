"""
Security middleware for LxwyerUp API.
Combines:
  - Security response headers (CSP, HSTS, X-Frame, X-Content-Type, etc.)
  - Request body size limit (1MB default, 10MB for upload routes)
  - Brute-force / login attempt tracker with in-memory lockout
"""
import time
import os
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

# ── Config ────────────────────────────────────────────────────────────────────
MAX_BODY_BYTES        = int(os.environ.get("MAX_BODY_BYTES", 1 * 1024 * 1024))       # 1 MB default
UPLOAD_MAX_BODY_BYTES = int(os.environ.get("UPLOAD_MAX_BODY_BYTES", 10 * 1024 * 1024))  # 10 MB for uploads
UPLOAD_PATHS          = ("/api/lawyer-applications", "/api/lawfirm-applications",
                         "/api/firm-lawyer-applications", "/api/lawyers/application",
                         "/api/lawfirms/application", "/api/firm-lawyers/application",
                         "/api/documents")

# Brute force: max attempts per window
MAX_LOGIN_ATTEMPTS = int(os.environ.get("MAX_LOGIN_ATTEMPTS", "10"))
LOGIN_WINDOW_SECS  = int(os.environ.get("LOGIN_WINDOW_SECS", "300"))  # 5 minutes
LOGIN_LOCKOUT_SECS = int(os.environ.get("LOGIN_LOCKOUT_SECS", "900"))  # 15 minutes
LOGIN_PATHS        = ("/api/auth/login", "/api/admin/login", "/api/monitor/login",
                      "/api/auth/register", "/api/auth/google")

_login_attempts: dict[str, list[float]] = defaultdict(list)  # ip -> [timestamps]
_lockouts: dict[str, float] = {}   # ip -> lockout_until_timestamp

# ── Security headers ─────────────────────────────────────────────────────────
HSTS_MAX_AGE = 31536000  # 1 year

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Strict-Transport-Security": f"max-age={HSTS_MAX_AGE}; includeSubDomains",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://accounts.google.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https://accounts.google.com; "
        "frame-src https://accounts.google.com; "
        "object-src 'none';"
    ),
}


def _get_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        path   = request.url.path
        method = request.method
        ip     = _get_ip(request)
        now    = time.time()

        # ── 1. Brute-force lockout check ──────────────────────────────────────
        if any(path.startswith(p) for p in LOGIN_PATHS) and method == "POST":
            # Check lockout
            if ip in _lockouts:
                if now < _lockouts[ip]:
                    remaining = int(_lockouts[ip] - now)
                    return JSONResponse(
                        status_code=429,
                        content={"detail": f"Too many attempts. Try again in {remaining}s.", "code": "LOCKED_OUT"},
                    )
                else:
                    del _lockouts[ip]
                    _login_attempts[ip] = []

            # Clean old attempts
            _login_attempts[ip] = [t for t in _login_attempts[ip] if now - t < LOGIN_WINDOW_SECS]

        # ── 2. Request body size guard ────────────────────────────────────────
        if method in ("POST", "PUT", "PATCH"):
            content_length = request.headers.get("content-length")
            if content_length:
                limit = UPLOAD_MAX_BODY_BYTES if any(path.startswith(p) for p in UPLOAD_PATHS) else MAX_BODY_BYTES
                if int(content_length) > limit:
                    return JSONResponse(
                        status_code=413,
                        content={"detail": f"Request body too large (max {limit // 1024}KB).", "code": "BODY_TOO_LARGE"},
                    )

        # ── 3. Call next ──────────────────────────────────────────────────────
        response = await call_next(request)

        # ── 4. Track failed logins for brute-force ────────────────────────────
        if any(path.startswith(p) for p in LOGIN_PATHS) and method == "POST":
            if response.status_code in (401, 403, 422):
                _login_attempts[ip].append(now)
                if len(_login_attempts[ip]) >= MAX_LOGIN_ATTEMPTS:
                    _lockouts[ip] = now + LOGIN_LOCKOUT_SECS
                    _login_attempts[ip] = []

        # ── 5. Apply security headers to every response ───────────────────────
        for header, value in SECURITY_HEADERS.items():
            response.headers[header] = value

        # Remove server fingerprinting headers
        try:
            del response.headers["server"]
        except KeyError:
            pass
        try:
            del response.headers["x-powered-by"]
        except KeyError:
            pass

        return response
