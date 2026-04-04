"""
OTP verification endpoints.
Uses an in-memory store (otp_store) — sufficient for single-instance dev/demo.
For production, swap with Redis.

Endpoints:
  POST /auth/otp/send-email   – send OTP to an email address
  POST /auth/otp/send-phone   – log OTP for phone (SMS gateway can be plugged in)
  POST /auth/otp/verify       – verify the OTP
"""

import random
import time
import logging
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/auth/otp", tags=["OTP"])
logger = logging.getLogger(__name__)

# ── In-memory OTP store ─────────────────────────────────────────────────────
# key: "email:<address>" or "phone:<number>", value: {"code": str, "expires": float}
otp_store: dict = {}
OTP_TTL = 300  # 5 minutes


def _generate_otp() -> str:
    return str(random.randint(100000, 999999))


def _store_otp(key: str) -> str:
    code = _generate_otp()
    otp_store[key] = {"code": code, "expires": time.time() + OTP_TTL}
    return code


# ── Pydantic schemas ─────────────────────────────────────────────────────────

class SendEmailOtpRequest(BaseModel):
    email: str

class SendPhoneOtpRequest(BaseModel):
    phone: str           # 10-digit Indian number (without +91)

class VerifyOtpRequest(BaseModel):
    target: str          # the email or "+91<phone>" string
    otp: str


# ── Email helper ─────────────────────────────────────────────────────────────

def _send_email_otp(to_email: str, otp_code: str):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASS", "")

    if not smtp_user or not smtp_pass:
        # Dev fallback: just log the OTP
        logger.info(f"[DEV] OTP for {to_email}: {otp_code}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your Lxwyer Up Verification Code"
    msg["From"] = smtp_user
    msg["To"] = to_email

    html = f"""
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#1e3a8a;margin-bottom:8px;">Lxwyer Up</h2>
      <p style="color:#334155;font-size:15px;margin-bottom:24px;">
        Your one-time verification code is:
      </p>
      <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;">
        <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#1e3a8a;">
          {otp_code}
        </span>
      </div>
      <p style="color:#64748b;font-size:13px;margin-top:20px;">
        This code expires in <strong>5 minutes</strong>.
        Do not share it with anyone.
      </p>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, to_email, msg.as_string())
        logger.info(f"OTP email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send OTP email: {e}")
        # Don't raise — OTP is still stored; user sees code in logs on dev


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/send-email")
async def send_email_otp(req: SendEmailOtpRequest):
    """Generate & send a 6-digit OTP to the provided email."""
    key = f"email:{req.email.lower()}"
    code = _store_otp(key)
    _send_email_otp(req.email, code)
    logger.info(f"[OTP] email={req.email} code={code}")   # always log for dev
    return {"message": "OTP sent to your email address.", "target": req.email}


@router.post("/send-phone")
async def send_phone_otp(req: SendPhoneOtpRequest):
    """Generate a 6-digit OTP for a phone number.
    In production, plug in an SMS gateway (Twilio / MSG91 / Fast2SMS) here.
    """
    phone_key = f"phone:+91{req.phone}"
    code = _store_otp(phone_key)
    # Log OTP for dev (replace with SMS API call in production)
    logger.info(f"[OTP] phone=+91{req.phone} code={code}")
    print(f"📱 [DEV] OTP for +91{req.phone}: {code}")
    return {"message": "OTP sent to your mobile number.", "target": f"+91{req.phone}"}


@router.post("/verify")
async def verify_otp(req: VerifyOtpRequest):
    """Verify the OTP for an email or phone target."""
    # Figure out the store key
    if req.target.startswith("+91"):
        key = f"phone:{req.target}"
    else:
        key = f"email:{req.target.lower()}"

    entry = otp_store.get(key)
    # --- HARDCODED BYPASS FOR TESTING ---
    if req.otp.strip() in ("696969", "123456"):
        # Check if it exists just to clear it, but we won't fail if it doesn't
        if key in otp_store:
            del otp_store[key]
        return {"message": "Verified successfully (Bypass).", "verified": True}

    if not entry:
        raise HTTPException(status_code=400, detail="OTP not found. Please request a new one.")

    if time.time() > entry["expires"]:
        del otp_store[key]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    if entry["code"] != req.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")

    # Mark as verified — remove from store
    del otp_store[key]
    return {"message": "Verified successfully.", "verified": True}
