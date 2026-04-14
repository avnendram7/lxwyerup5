#!/usr/bin/env python3
"""
Full-profile demo seed:
  - Kavya Aggarwal (Client)
  - Adv Kartik Singh (Normal Lawyer)
  - Adv Kartik Singh (Signature Lawyer)
  - Adv Kartik Singh (SOS Lawyer)

All passwords: DemoPassword123!
"""
import asyncio
import os
import sys
import uuid
from pathlib import Path
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

from dotenv import load_dotenv
load_dotenv(ROOT_DIR / '.env')

from services.auth import hash_password
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME   = os.environ.get('DB_NAME', 'test_database')
client    = AsyncIOMotorClient(MONGO_URL)
db        = client[DB_NAME]

PASS_HASH = hash_password("DemoPassword123!")
NOW       = datetime.now(timezone.utc)

# ──────────────────────────────────────────────
# IDs
# ──────────────────────────────────────────────
CLIENT_ID    = "demo_kavya_client"
NORMAL_ID    = "demo_kartik_normal"
SIG_ID       = "demo_kartik_signature"
SOS_ID       = "demo_kartik_sos"

# ──────────────────────────────────────────────
# Shared rich profile data for Adv Kartik Singh
# ──────────────────────────────────────────────
ACHIEVEMENTS = [
    {
        "id": "ach_1",
        "title": "National Award for Best Criminal Law Advocate",
        "date": "2023",
        "year": "2023",
        "description": "Felicitated by the Bar Council of India for outstanding contribution to criminal jurisprudence.",
        "photo": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400",
    },
    {
        "id": "ach_2",
        "title": "Landmark Supreme Court Verdict — Privacy Rights Case",
        "date": "2022",
        "year": "2022",
        "description": "Successfully argued a class-action case at the Supreme Court that reshaped digital privacy law in India.",
        "photo": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400",
    },
    {
        "id": "ach_3",
        "title": "500+ Pro Bono Hours — Access to Justice Initiative",
        "date": "2021",
        "year": "2021",
        "description": "Awarded Pro Bono Champion designation for providing free legal representation to underserved communities.",
        "photo": "https://images.unsplash.com/photo-1505664124967-17b2b73bc3fa?auto=format&fit=crop&q=80&w=400",
    },
    {
        "id": "ach_4",
        "title": "Multi-Crore Corporate Dispute Settlement",
        "date": "2020",
        "year": "2020",
        "description": "Led legal strategy for a ₹180 Cr cross-border M&A dispute, achieving a full client victory.",
        "photo": "https://images.unsplash.com/photo-1618060932014-4deda4932554?auto=format&fit=crop&q=80&w=400",
    },
]

EDUCATION_DETAILS = {
    "degree": "Master of Laws (LL.M.) – International Commercial Law",
    "institution": "National Law School of India University (NLSIU), Bangalore",
    "year": "2012",
    "undergraduate": "B.A. LL.B (Hons.) – Government Law College, Mumbai, 2010",
}

BASE_PROFILE = {
    "password":              PASS_HASH,
    "full_name":             "Adv Kartik Singh",
    "user_type":             "lawyer",
    "phone":                 "+91 9876543211",
    "is_approved":           True,
    "status":                "approved",
    "bar_council_number":    "MH/1234/2012",
    "experience":            12,
    "experience_years":      12,
    "cases_won":             187,
    "education":             "LL.M. – National Law School of India University (NLSIU)",
    "education_details":     EDUCATION_DETAILS,
    "languages":             ["English", "Hindi", "Marathi"],
    "court":                 ["Bombay High Court", "Supreme Court of India", "Delhi High Court"],
    "primary_court":         "Bombay High Court",
    "detailed_court_experience": [
        {"court": "Bombay High Court",      "years": 10, "role": "Senior Advocate"},
        {"court": "Supreme Court of India", "years":  6, "role": "Appearing Counsel"},
        {"court": "Delhi High Court",        "years":  4, "role": "Appearing Counsel"},
    ],
    "catchphrase":           "Your rights, relentlessly defended.",
    "bio":                   (
        "Adv Kartik Singh is a seasoned legal professional with over 12 years of distinguished practice spanning "
        "civil litigation, corporate advisory, and high-stakes criminal defence. A graduate of the National Law School "
        "of India University, Adv Singh has successfully argued more than 187 cases across the Bombay High Court, "
        "Delhi High Court, and the Supreme Court of India.\n\n"
        "His practice is built on a philosophy of thorough preparation, strategic aggression, and client-first advocacy. "
        "He has been recognised nationally for his landmark contributions to privacy law and corporate jurisprudence, "
        "and is a proud recipient of the Bar Council of India's National Award for Best Criminal Law Advocate (2023).\n\n"
        "Whether you face a complex corporate dispute, a criminal charge, or a sensitive family matter — "
        "Adv Kartik Singh brings unmatched dedication and legal acumen to your side."
    ),
    "achievements":          ACHIEVEMENTS,
    "practice_start_date":   "2012-06-01",
    "consultation_preferences": "both",
    "created_at":            (NOW - timedelta(days=540)).isoformat(),
}


async def delete_old():
    ids = [CLIENT_ID, NORMAL_ID, SIG_ID, SOS_ID]
    await db.users.delete_many({"id": {"$in": ids}})
    await db.cases.delete_many({"id": {"$regex": "^demo_kartik_"}})
    await db.bookings.delete_many({"id": {"$regex": "^demo_kartik_"}})
    await db.notifications.delete_many({"id": {"$regex": "^demo_kartik_"}})
    await db.events.delete_many({"id": {"$regex": "^demo_kartik_"}})
    await db.billing.delete_many({"id": {"$regex": "^demo_kartik_"}})
    print("🗑  Cleared old demo data.")


async def seed_users():
    # 1. Kavya Aggarwal — Client
    await db.users.insert_one({
        "id":         CLIENT_ID,
        "email":      "kavya@lexwyerup.com",
        "password":   PASS_HASH,
        "full_name":  "Kavya Aggarwal",
        "user_type":  "client",
        "phone":      "+91 9988776655",
        "city":       "Delhi",
        "state":      "Delhi",
        "created_at": NOW.isoformat(),
    })
    print("✅ Created: Kavya Aggarwal (client)")

    # 2. Adv Kartik Singh — Normal Lawyer
    await db.users.insert_one({
        **BASE_PROFILE,
        "id":              NORMAL_ID,
        "email":           "adv.kartik@lexwyerup.com",
        "specialization":  "Civil Law",
        "secondarySpecializations": ["Corporate Law", "Property Law"],
        "fee_range":       "2500-5000",
        "city":            "Mumbai",
        "state":           "Maharashtra",
        "office_address":  "802, High Court Chambers, Fort, Mumbai – 400 001",
        "application_type": ["normal"],
        "rating":          4.9,
        "reviews_count":   134,
    })
    print("✅ Created: Adv Kartik Singh — Normal")

    # 3. Adv Kartik Singh — Signature Lawyer
    await db.users.insert_one({
        **BASE_PROFILE,
        "id":              SIG_ID,
        "email":           "signature.kartik@lexwyerup.com",
        "specialization":  "Tax Law",
        "secondarySpecializations": ["Intellectual Property", "Corporate Law"],
        "fee_range":       "10000-20000",
        "city":            "New Delhi",
        "state":           "Delhi",
        "office_address":  "Penthouse 1, Supreme Court Advocates Suite, Bhagwan Das Road, New Delhi – 110 001",
        "application_type": ["normal"],
        "isSignature":     True,
        "firm":            "Singh & Associates — Signature Chambers",
        "rating":          5.0,
        "reviews_count":   212,
        "consultation_preferences": "both",
    })
    print("✅ Created: Adv Kartik Singh — Signature")

    # 4. Adv Kartik Singh — SOS Lawyer
    await db.users.insert_one({
        **BASE_PROFILE,
        "id":              SOS_ID,
        "email":           "sos.kartik@lexwyerup.com",
        "specialization":  "Criminal Law",
        "secondarySpecializations": ["Family Law", "Bail & Custody"],
        "fee_range":       "3000-8000",
        "city":            "Bangalore",
        "state":           "Karnataka",
        "office_address":  "District Court Rd, Near Police HQ, Shivajinagar, Bangalore – 560 001",
        "application_type": ["sos"],
        "sos_locations":   ["Bangalore Central", "Koramangala", "Whitefield"],
        "sos_matters":     ["Bail", "Police Station Visit", "Medical Emergency", "Domestic Violence"],
        "sos_terms_accepted": True,
        "sos_type":        "sos_full",
        "charge_30min":    3000,
        "charge_60min":    5500,
        "rating":          4.8,
        "reviews_count":   89,
        "consultation_preferences": "video",
    })
    print("✅ Created: Adv Kartik Singh — SOS")


async def seed_cases_bookings():
    now = NOW

    # ── Cases linked from Kavya's perspective ──────────────────────────
    case_docs = [
        {
            "id":          "demo_kartik_case_1",
            "client_id":   CLIENT_ID,
            "client_name": "Kavya Aggarwal",
            "lawyer_id":   NORMAL_ID,
            "lawyer_name": "Adv Kartik Singh",
            "case_type":   "Civil Law",
            "title":       "Property Dispute Settlement — Bandra Plot",
            "description": "Resolution of commercial property boundary dispute for ancestral plot in Bandra, Mumbai.",
            "status":      "active",
            "court":       "Bombay High Court",
            "next_hearing": (now + timedelta(days=14)).isoformat(),
            "created_at":  (now - timedelta(days=60)).isoformat(),
            "updated_at":  now.isoformat(),
        },
        {
            "id":          "demo_kartik_case_2",
            "client_id":   CLIENT_ID,
            "client_name": "Kavya Aggarwal",
            "lawyer_id":   SIG_ID,
            "lawyer_name": "Adv Kartik Singh",
            "case_type":   "Tax Law",
            "title":       "Corporate Tax Structuring — Aggarwal Ventures Ltd.",
            "description": "High-level advisory on international tax structuring and transfer pricing compliance.",
            "status":      "active",
            "court":       "Income Tax Appellate Tribunal",
            "next_hearing": (now + timedelta(days=5)).isoformat(),
            "created_at":  (now - timedelta(days=10)).isoformat(),
            "updated_at":  now.isoformat(),
        },
        {
            "id":          "demo_kartik_case_3",
            "client_id":   CLIENT_ID,
            "client_name": "Kavya Aggarwal",
            "lawyer_id":   SOS_ID,
            "lawyer_name": "Adv Kartik Singh",
            "case_type":   "Criminal Law",
            "title":       "FIR Response — Wrongful Arrest Defence",
            "description": "Emergency defence engagement for a wrongful FIR filed against family employee.",
            "status":      "resolved",
            "court":       "Sessions Court, Bangalore",
            "next_hearing": None,
            "created_at":  (now - timedelta(days=30)).isoformat(),
            "updated_at":  (now - timedelta(days=5)).isoformat(),
        },
    ]

    # ── Cases from Lawyer dashboard perspective ──────────────────────────
    # Extra clients for the lawyers to make dashboards feel full
    extra_cases = [
        {
            "id": "demo_kartik_case_4",
            "client_id": "dummy_user_1",
            "client_name": "Rahul Sharma",
            "lawyer_id": NORMAL_ID,
            "lawyer_name": "Adv Kartik Singh",
            "case_type": "Property Law",
            "title": "Title Deed Verification — Pune",
            "description": "Verification and legal opinion on disputed title deed for residential property.",
            "status": "active",
            "court": "Civil Court Pune",
            "next_hearing": (now + timedelta(days=8)).isoformat(),
            "created_at":  (now - timedelta(days=20)).isoformat(),
            "updated_at":  now.isoformat(),
        },
        {
            "id": "demo_kartik_case_5",
            "client_id": "dummy_user_2",
            "client_name": "Siya Mehta",
            "lawyer_id": NORMAL_ID,
            "lawyer_name": "Adv Kartik Singh",
            "case_type": "Corporate Law",
            "title": "Employment Contract Dispute — TechStart Inc.",
            "description": "Non-compete clause enforceability challenge for a senior executive.",
            "status": "active",
            "court": "Labour Court, Mumbai",
            "next_hearing": (now + timedelta(days=21)).isoformat(),
            "created_at":  (now - timedelta(days=45)).isoformat(),
            "updated_at":  now.isoformat(),
        },
        {
            "id": "demo_kartik_case_6",
            "client_id": "dummy_user_3",
            "client_name": "Priya Iyer",
            "lawyer_id": SIG_ID,
            "lawyer_name": "Adv Kartik Singh",
            "case_type": "Intellectual Property",
            "title": "Patent Infringement — MedTech Product",
            "description": "High-value patent infringement suit against a pharmaceutical company.",
            "status": "active",
            "court": "Delhi High Court",
            "next_hearing": (now + timedelta(days=3)).isoformat(),
            "created_at":  (now - timedelta(days=15)).isoformat(),
            "updated_at":  now.isoformat(),
        },
        {
            "id": "demo_kartik_case_7",
            "client_id": "dummy_user_4",
            "client_name": "Anil Kapoor",
            "lawyer_id": SOS_ID,
            "lawyer_name": "Adv Kartik Singh",
            "case_type": "Criminal Law",
            "title": "Bail Application — Section 302 IPC",
            "description": "Urgent bail hearing for client wrongfully accused under IPC Section 302.",
            "status": "active",
            "court": "High Court of Karnataka",
            "next_hearing": (now + timedelta(days=2)).isoformat(),
            "created_at":  (now - timedelta(days=3)).isoformat(),
            "updated_at":  now.isoformat(),
        },
    ]

    await db.cases.insert_many(case_docs + extra_cases)
    print(f"✅ Inserted {len(case_docs) + len(extra_cases)} cases")

    # ── Bookings ──────────────────────────────────────────────────────────
    booking_docs = [
        # Kavya → Normal Kartik (upcoming confirmed)
        {
            "id":               "demo_kartik_bk_1",
            "client_id":        CLIENT_ID,
            "client_name":      "Kavya Aggarwal",
            "lawyer_id":        NORMAL_ID,
            "lawyer_name":      "Adv Kartik Singh",
            "date":             (now + timedelta(days=2)).strftime("%Y-%m-%d"),
            "time":             "11:00 AM",
            "description":      "Strategy review for Bandra property case",
            "consultation_type": "video",
            "meet_link":        "https://meet.google.com/xyz-abcd-efg",
            "location":         "Google Meet",
            "status":           "confirmed",
            "amount":           2500,
            "price":            2500,
            "created_at":       now.isoformat(),
            "payment_status":   "paid",
        },
        # Kavya → Signature Kartik (upcoming confirmed)
        {
            "id":               "demo_kartik_bk_2",
            "client_id":        CLIENT_ID,
            "client_name":      "Kavya Aggarwal",
            "lawyer_id":        SIG_ID,
            "lawyer_name":      "Adv Kartik Singh",
            "date":             (now + timedelta(days=4)).strftime("%Y-%m-%d"),
            "time":             "02:00 PM",
            "description":      "Priority consultation: Tax structuring board review",
            "consultation_type": "in_person",
            "location":         "Penthouse 1, Supreme Court Advocates Suite, New Delhi",
            "status":           "confirmed",
            "amount":           10000,
            "price":            10000,
            "created_at":       now.isoformat(),
            "payment_status":   "paid",
        },
        # Kavya → SOS Kartik (completed)
        {
            "id":               "demo_kartik_bk_3",
            "client_id":        CLIENT_ID,
            "client_name":      "Kavya Aggarwal",
            "lawyer_id":        SOS_ID,
            "lawyer_name":      "Adv Kartik Singh",
            "date":             (now - timedelta(days=1)).strftime("%Y-%m-%d"),
            "time":             "09:30 PM",
            "description":      "Emergency SOS advisory call",
            "consultation_type": "video",
            "meet_link":        "https://meet.google.com/sos-emcy-call",
            "location":         "Google Meet",
            "status":           "completed",
            "amount":           3000,
            "price":            3000,
            "created_at":       (now - timedelta(days=1)).isoformat(),
            "payment_status":   "paid",
        },
        # Extra pending booking on Normal lawyer (from another client)
        {
            "id":               "demo_kartik_bk_4",
            "client_id":        "dummy_user_1",
            "client_name":      "Rahul Sharma",
            "lawyer_id":        NORMAL_ID,
            "lawyer_name":      "Adv Kartik Singh",
            "date":             (now + timedelta(days=1)).strftime("%Y-%m-%d"),
            "time":             "03:00 PM",
            "description":      "Title deed verification consultation",
            "consultation_type": "in_person",
            "location":         "802, High Court Chambers, Fort, Mumbai",
            "status":           "pending",
            "amount":           3500,
            "price":            3500,
            "created_at":       now.isoformat(),
            "payment_status":   "paid",
        },
        # Completed booking for billing data
        {
            "id":               "demo_kartik_bk_5",
            "client_id":        "dummy_user_2",
            "client_name":      "Siya Mehta",
            "lawyer_id":        NORMAL_ID,
            "lawyer_name":      "Adv Kartik Singh",
            "date":             (now - timedelta(days=10)).strftime("%Y-%m-%d"),
            "time":             "11:00 AM",
            "description":      "Employment dispute initial consultation",
            "consultation_type": "video",
            "meet_link":        "https://meet.google.com/emp-dispute-x",
            "location":         "Google Meet",
            "status":           "completed",
            "amount":           2500,
            "price":            2500,
            "created_at":       (now - timedelta(days=10)).isoformat(),
            "payment_status":   "paid",
        },
        # Pending SOS booking
        {
            "id":               "demo_kartik_bk_6",
            "client_id":        "dummy_user_4",
            "client_name":      "Anil Kapoor",
            "lawyer_id":        SOS_ID,
            "lawyer_name":      "Adv Kartik Singh",
            "date":             (now + timedelta(days=1)).strftime("%Y-%m-%d"),
            "time":             "07:00 AM",
            "description":      "Urgent bail hearing prep",
            "consultation_type": "video",
            "meet_link":        "https://meet.google.com/bail-hearing-abc",
            "location":         "Google Meet",
            "status":           "pending",
            "amount":           5500,
            "price":            5500,
            "created_at":       now.isoformat(),
            "payment_status":   "paid",
        },
    ]

    await db.bookings.insert_many(booking_docs)
    print(f"✅ Inserted {len(booking_docs)} bookings")


async def seed_notifications():
    notif_docs = [
        {
            "id":        "demo_kartik_n1",
            "user_id":   NORMAL_ID,
            "title":     "New Booking Confirmed",
            "message":   "Kavya Aggarwal has booked a Video consultation for tomorrow at 11:00 AM.",
            "type":      "booking",
            "is_read":   False,
            "created_at": (NOW - timedelta(hours=2)).isoformat(),
        },
        {
            "id":        "demo_kartik_n2",
            "user_id":   NORMAL_ID,
            "title":     "Hearing Reminder",
            "message":   "Your hearing in 'Property Dispute Settlement — Bandra Plot' is in 14 days.",
            "type":      "reminder",
            "is_read":   False,
            "created_at": (NOW - timedelta(hours=5)).isoformat(),
        },
        {
            "id":        "demo_kartik_n3",
            "user_id":   SIG_ID,
            "title":     "New Booking Confirmed",
            "message":   "Kavya Aggarwal has booked a Priority In-Person consultation on Day+4.",
            "type":      "booking",
            "is_read":   False,
            "created_at": (NOW - timedelta(hours=1)).isoformat(),
        },
        {
            "id":        "demo_kartik_n4",
            "user_id":   SOS_ID,
            "title":     "Pending Booking Request",
            "message":   "Anil Kapoor needs an urgent bail prep consultation at 7:00 AM tomorrow.",
            "type":      "booking",
            "is_read":   False,
            "created_at": NOW.isoformat(),
        },
        {
            "id":        "demo_kartik_n5",
            "user_id":   CLIENT_ID,
            "title":     "Consultation Confirmed!",
            "message":   "Your consultation with Adv Kartik Singh is confirmed for Day+2 at 11:00 AM.",
            "type":      "booking",
            "is_read":   False,
            "created_at": NOW.isoformat(),
        },
    ]
    await db.notifications.insert_many(notif_docs)
    print(f"✅ Inserted {len(notif_docs)} notifications")


async def seed_events():
    event_docs = [
        {
            "id":          "demo_kartik_ev1",
            "user_id":     NORMAL_ID,
            "title":       "Bombay HC Hearing — Bandra Property",
            "type":        "hearing",
            "start_time":  (NOW + timedelta(days=14, hours=10)).isoformat(),
            "end_time":    (NOW + timedelta(days=14, hours=12)).isoformat(),
            "description": "Main hearing for the property boundary dispute.",
            "created_at":  NOW.isoformat(),
        },
        {
            "id":          "demo_kartik_ev2",
            "user_id":     NORMAL_ID,
            "title":       "Client Meeting — Siya Mehta",
            "type":        "meeting",
            "start_time":  (NOW + timedelta(days=3, hours=15)).isoformat(),
            "end_time":    (NOW + timedelta(days=3, hours=16)).isoformat(),
            "description": "Review employment case strategy ahead of next hearing.",
            "created_at":  NOW.isoformat(),
        },
        {
            "id":          "demo_kartik_ev3",
            "user_id":     SIG_ID,
            "title":       "ITAT Hearing — Aggarwal Ventures",
            "type":        "hearing",
            "start_time":  (NOW + timedelta(days=5, hours=11)).isoformat(),
            "end_time":    (NOW + timedelta(days=5, hours=13)).isoformat(),
            "description": "Income Tax Appellate Tribunal hearing on transfer pricing.",
            "created_at":  NOW.isoformat(),
        },
        {
            "id":          "demo_kartik_ev4",
            "user_id":     SIG_ID,
            "title":       "Delhi HC Hearing — Patent Infringement",
            "type":        "hearing",
            "start_time":  (NOW + timedelta(days=3, hours=9)).isoformat(),
            "end_time":    (NOW + timedelta(days=3, hours=11)).isoformat(),
            "description": "Patent infringement interim injunction application.",
            "created_at":  NOW.isoformat(),
        },
        {
            "id":          "demo_kartik_ev5",
            "user_id":     SOS_ID,
            "title":       "Karnataka HC Bail Hearing — Anil Kapoor",
            "type":        "hearing",
            "start_time":  (NOW + timedelta(days=2, hours=10)).isoformat(),
            "end_time":    (NOW + timedelta(days=2, hours=11, minutes=30)).isoformat(),
            "description": "Urgent bail application hearing under IPC 302.",
            "created_at":  NOW.isoformat(),
        },
    ]
    await db.events.insert_many(event_docs)
    print(f"✅ Inserted {len(event_docs)} events")


async def seed_billing():
    billing_docs = [
        {
            "id":          "demo_kartik_bill_1",
            "lawyer_id":   NORMAL_ID,
            "client_id":   CLIENT_ID,
            "client_name": "Kavya Aggarwal",
            "booking_id":  "demo_kartik_bk_1",
            "amount":      2500,
            "status":      "paid",
            "created_at":  NOW.isoformat(),
        },
        {
            "id":          "demo_kartik_bill_2",
            "lawyer_id":   NORMAL_ID,
            "client_id":   "dummy_user_2",
            "client_name": "Siya Mehta",
            "booking_id":  "demo_kartik_bk_5",
            "amount":      2500,
            "status":      "paid",
            "created_at":  (NOW - timedelta(days=10)).isoformat(),
        },
        {
            "id":          "demo_kartik_bill_3",
            "lawyer_id":   SIG_ID,
            "client_id":   CLIENT_ID,
            "client_name": "Kavya Aggarwal",
            "booking_id":  "demo_kartik_bk_2",
            "amount":      10000,
            "status":      "paid",
            "created_at":  NOW.isoformat(),
        },
        {
            "id":          "demo_kartik_bill_4",
            "lawyer_id":   SOS_ID,
            "client_id":   CLIENT_ID,
            "client_name": "Kavya Aggarwal",
            "booking_id":  "demo_kartik_bk_3",
            "amount":      3000,
            "status":      "paid",
            "created_at":  (NOW - timedelta(days=1)).isoformat(),
        },
    ]
    await db.billing.insert_many(billing_docs)
    print(f"✅ Inserted {len(billing_docs)} billing records")


async def main():
    print("=" * 60)
    print("  LxwyerUp — Kartik Singh & Kavya Aggarwal Demo Seed")
    print("=" * 60)
    try:
        await delete_old()
        await seed_users()
        await seed_cases_bookings()
        await seed_notifications()
        await seed_events()
        await seed_billing()

        print()
        print("=" * 60)
        print("  ✅ ALL DONE — Login Credentials")
        print("=" * 60)
        print()
        print("  👤 Kavya Aggarwal (Client)")
        print("     Email:    kavya@lexwyerup.com")
        print("     Password: DemoPassword123!")
        print("     Login at: /login  (select Client)")
        print()
        print("  ⚖️  Adv Kartik Singh — Normal Lawyer")
        print("     Email:    adv.kartik@lexwyerup.com")
        print("     Password: DemoPassword123!")
        print("     Login at: /lawyer-login")
        print()
        print("  🏆 Adv Kartik Singh — Signature Lawyer")
        print("     Email:    signature.kartik@lexwyerup.com")
        print("     Password: DemoPassword123!")
        print("     Login at: /lawyer-login")
        print()
        print("  🆘 Adv Kartik Singh — SOS Lawyer")
        print("     Email:    sos.kartik@lexwyerup.com")
        print("     Password: DemoPassword123!")
        print("     Login at: /lawyer-login")
        print()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n❌ ERROR: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
