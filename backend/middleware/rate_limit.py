"""
Rate Limiting Middleware for LxwyerUp API.

Limits:
  - General API: 120 requests / 60 seconds per IP
  - SOS requests: 5 requests / 60 seconds per IP  (prevent abuse on paid service)
  - Auth/Login:   10 requests / 300 seconds per IP (already also in security.py)
  - AI/Chat:      30 requests / 60 seconds per IP  (expensive AI calls)

When a limit is exceeded the client receives HTTP 429 with a Retry-After header.
All counters are in-memory and reset on server restart — suitable for
Vercel serverless (resets per cold-start) and single-instance deploys.
"""
import time
import os
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

# ── Config (overridable via env vars) ─────────────────────────────────────────
GENERAL_LIMIT   = int(os.environ.get("RL_GENERAL_LIMIT",  "120"))  # reqs
GENERAL_WINDOW  = int(os.environ.get("RL_GENERAL_WINDOW", "60"))   # seconds
SOS_LIMIT       = int(os.environ.get("RL_SOS_LIMIT",      "5"))
SOS_WINDOW      = int(os.environ.get("RL_SOS_WINDOW",     "60"))
AI_LIMIT        = int(os.environ.get("RL_AI_LIMIT",       "30"))
AI_WINDOW       = int(os.environ.get("RL_AI_WINDOW",      "60"))

# Route prefixes → (limit, window_seconds) overrides
_ROUTE_LIMITS: list[tuple[str, int, int]] = [
    ("/api/sos",        SOS_LIMIT,  SOS_WINDOW),
    ("/api/legal-chat", AI_LIMIT,   AI_WINDOW),
    ("/api/ai",         AI_LIMIT,   AI_WINDOW),
]

# ip → list of timestamps
_counters: dict[str, list[float]] = defaultdict(list)


def _get_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_limit(ip: str, bucket: str, limit: int, window: int) -> tuple[bool, int]:
    """
    Returns (allowed, retry_after_seconds).
    Cleans old timestamps inside the window on each call.
    """
    key = f"{ip}:{bucket}"
    now = time.time()
    timestamps = _counters[key]
    # Prune entries outside the window
    _counters[key] = [t for t in timestamps if now - t < window]
    if len(_counters[key]) >= limit:
        oldest = _counters[key][0]
        retry_after = int(window - (now - oldest)) + 1
        return False, retry_after
    _counters[key].append(now)
    return True, 0


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Only rate-limit API routes
        path = request.url.path
        if not path.startswith("/api"):
            return await call_next(request)

        # Skip OPTIONS (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        ip = _get_ip(request)

        # ── Route-specific limits ──────────────────────────────────────────────
        for prefix, lim, win in _ROUTE_LIMITS:
            if path.startswith(prefix):
                allowed, retry = _check_limit(ip, prefix, lim, win)
                if not allowed:
                    return JSONResponse(
                        status_code=429,
                        headers={"Retry-After": str(retry)},
                        content={
                            "detail": f"Too many requests. Please wait {retry} seconds before trying again.",
                            "code": "RATE_LIMITED",
                            "retry_after": retry,
                        },
                    )
                break  # only apply first matching rule

        # ── General limit ──────────────────────────────────────────────────────
        allowed, retry = _check_limit(ip, "general", GENERAL_LIMIT, GENERAL_WINDOW)
        if not allowed:
            return JSONResponse(
                status_code=429,
                headers={"Retry-After": str(retry)},
                content={
                    "detail": f"Rate limit exceeded. Try again in {retry} seconds.",
                    "code": "RATE_LIMITED",
                    "retry_after": retry,
                },
            )

        return await call_next(request)
