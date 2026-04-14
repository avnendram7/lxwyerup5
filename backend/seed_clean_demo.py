"""
Clean up all duplicate demo users and re-insert with a single consistent set.
Password for all accounts: Demo@123
"""
import asyncio
import os
import sys
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
mclient   = AsyncIOMotorClient(MONGO_URL)
db        = mclient[DB_NAME]

PASSWORD  = "Demo@123"
PASS_HASH = hash_password(PASSWORD)
NOW       = datetime.now(timezone.utc)

CLIENT_ID = "kavya_demo_001"
NORMAL_ID = "kartik_normal_001"
SIG_ID    = "kartik_sig_001"
SOS_ID    = "kartik_sos_001"

ACHIEVEMENTS = [
    {"id": "a1", "title": "National Award — Best Criminal Law Advocate 2023", "date": "2023", "year": "2023",
     "description": "Felicitated by the Bar Council of India for outstanding contribution to criminal jurisprudence.",
     "photo": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400"},
    {"id": "a2", "title": "Landmark Supreme Court Verdict — Privacy Rights Case", "date": "2022", "year": "2022",
     "description": "Successfully argued a class-action case reshaping digital privacy law in India.",
     "photo": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400"},
    {"id": "a3", "title": "500+ Pro Bono Hours — Access to Justice Initiative", "date": "2021", "year": "2021",
     "description": "Awarded Pro Bono Champion designation for free legal representation to underserved communities.",
     "photo": "https://images.unsplash.com/photo-1505664124967-17b2b73bc3fa?auto=format&fit=crop&q=80&w=400"},
    {"id": "a4", "title": "₹180 Cr Corporate Dispute Settlement Victory", "date": "2020", "year": "2020",
     "description": "Led legal strategy for a cross-border M&A dispute achieving full client victory.",
     "photo": "https://images.unsplash.com/photo-1618060932014-4deda4932554?auto=format&fit=crop&q=80&w=400"},
]

BASE = {
    "password": PASS_HASH,
    "full_name": "Adv Kartik Singh",
    "user_type": "lawyer",
    "phone": "+91 9876543211",
    "is_approved": True,
    "status": "approved",
    "bar_council_number": "MH/1234/2012",
    "experience": 12,
    "experience_years": 12,
    "cases_won": 187,
    "education": "LL.M. — National Law School of India University (NLSIU)",
    "education_details": {
        "degree": "Master of Laws (LL.M.) – International Commercial Law",
        "institution": "National Law School of India University (NLSIU), Bangalore",
        "year": "2012",
        "undergraduate": "B.A. LL.B (Hons.) — Government Law College, Mumbai, 2010",
    },
    "languages": ["English", "Hindi", "Marathi"],
    "court": ["Bombay High Court", "Supreme Court of India", "Delhi High Court"],
    "primary_court": "Bombay High Court",
    "detailed_court_experience": [
        {"court": "Bombay High Court", "years": 10, "role": "Senior Advocate"},
        {"court": "Supreme Court of India", "years": 6, "role": "Appearing Counsel"},
        {"court": "Delhi High Court", "years": 4, "role": "Appearing Counsel"},
    ],
    "catchphrase": "Your rights, relentlessly defended.",
    "bio": (
        "Adv Kartik Singh is a seasoned legal professional with over 12 years of distinguished practice. "
        "A graduate of the National Law School of India University, he has successfully argued more than 187 cases "
        "across the Bombay High Court, Delhi High Court, and the Supreme Court of India.\n\n"
        "His practice is built on thorough preparation, strategic aggression, and client-first advocacy. "
        "He has been recognised nationally for landmark contributions to privacy law and corporate jurisprudence, "
        "and is a proud recipient of the Bar Council of India's National Award for Best Criminal Law Advocate (2023).\n\n"
        "Whether you face a corporate dispute, a criminal charge, or a sensitive family matter — "
        "Adv Kartik Singh brings unmatched dedication and legal acumen to your side."
    ),
    "achievements": ACHIEVEMENTS,
    "practice_start_date": "2012-06-01",
    "consultation_preferences": "both",
    "rating": 4.9,
    "reviews_count": 134,
    "created_at": (NOW - timedelta(days=540)).isoformat(),
}


async def purge():
    """Delete ALL demo/test accounts by email pattern."""
    emails = [
        "kavya@lexwyerup.com",
        "adv.kartik@lexwyerup.com",
        "signature.kartik@lexwyerup.com",
        "sos.kartik@lexwyerup.com",
    ]
    old_ids = [
        "demo_client_kavya", "demo_lawyer_kartik", "demo_lawyer_signature_kartik",
        "demo_lawyer_sos_kartik", "demo_kavya_client", "demo_kartik_normal",
        "demo_kartik_signature", "demo_kartik_sos",
        CLIENT_ID, NORMAL_ID, SIG_ID, SOS_ID,
    ]
    r = await db.users.delete_many({"$or": [{"email": {"$in": emails}}, {"id": {"$in": old_ids}}]})
    print(f"🗑  Deleted {r.deleted_count} old user(s)")

    await db.cases.delete_many({"id": {"$regex": "^demo_"}})
    await db.bookings.delete_many({"id": {"$regex": "^demo_"}})
    await db.notifications.delete_many({"id": {"$regex": "^demo_"}})
    await db.events.delete_many({"id": {"$regex": "^demo_"}})
    await db.billing.delete_many({"id": {"$regex": "^demo_"}})
    print("🗑  Cleared old cases/bookings/events/billing")


async def insert_users():
    await db.users.insert_one({
        "id": CLIENT_ID, "email": "kavya@lexwyerup.com", "password": PASS_HASH,
        "full_name": "Kavya Aggarwal", "user_type": "client",
        "phone": "+91 9988776655", "city": "Delhi", "state": "Delhi",
        "created_at": NOW.isoformat(),
    })
    print("✅  Kavya Aggarwal (client)")

    await db.users.insert_one({
        **BASE, "id": NORMAL_ID, "email": "adv.kartik@lexwyerup.com",
        "specialization": "Civil Law",
        "secondarySpecializations": ["Corporate Law", "Property Law"],
        "fee_range": "2500-5000",
        "city": "Mumbai", "state": "Maharashtra",
        "office_address": "802, High Court Chambers, Fort, Mumbai – 400 001",
        "application_type": ["normal"],
    })
    print("✅  Adv Kartik Singh — Normal Lawyer")

    await db.users.insert_one({
        **BASE, "id": SIG_ID, "email": "signature.kartik@lexwyerup.com",
        "specialization": "Tax Law",
        "secondarySpecializations": ["Intellectual Property", "Corporate Law"],
        "fee_range": "10000-20000",
        "city": "New Delhi", "state": "Delhi",
        "office_address": "Penthouse 1, Supreme Court Advocates Suite, Bhagwan Das Road, New Delhi – 110 001",
        "application_type": ["normal"],
        "isSignature": True,
        "firm": "Singh & Associates — Signature Chambers",
        "rating": 5.0, "reviews_count": 212,
    })
    print("✅  Adv Kartik Singh — Signature Lawyer")

    await db.users.insert_one({
        **BASE, "id": SOS_ID, "email": "sos.kartik@lexwyerup.com",
        "specialization": "Criminal Law",
        "secondarySpecializations": ["Family Law", "Bail & Custody"],
        "fee_range": "3000-8000",
        "city": "Bangalore", "state": "Karnataka",
        "office_address": "District Court Rd, Near Police HQ, Shivajinagar, Bangalore – 560 001",
        "application_type": ["sos"],
        "sos_locations": ["Bangalore Central", "Koramangala", "Whitefield"],
        "sos_matters": ["Bail", "Police Station Visit", "Medical Emergency", "Domestic Violence"],
        "sos_terms_accepted": True,
        "sos_type": "sos_full",
        "charge_30min": 3000, "charge_60min": 5500,
        "consultation_preferences": "video",
        "rating": 4.8, "reviews_count": 89,
    })
    print("✅  Adv Kartik Singh — SOS Lawyer")


async def insert_data():
    now = NOW
    cases = [
        {"id": "demo_case_c1", "client_id": CLIENT_ID, "client_name": "Kavya Aggarwal",
         "lawyer_id": NORMAL_ID, "lawyer_name": "Adv Kartik Singh",
         "case_type": "Civil Law", "title": "Property Dispute Settlement — Bandra Plot",
         "description": "Commercial property boundary dispute for ancestral plot in Bandra, Mumbai.",
         "status": "active", "court": "Bombay High Court",
         "next_hearing": (now + timedelta(days=14)).isoformat(),
         "created_at": (now - timedelta(days=60)).isoformat(), "updated_at": now.isoformat()},
        {"id": "demo_case_c2", "client_id": CLIENT_ID, "client_name": "Kavya Aggarwal",
         "lawyer_id": SIG_ID, "lawyer_name": "Adv Kartik Singh",
         "case_type": "Tax Law", "title": "Corporate Tax Structuring — Aggarwal Ventures Ltd.",
         "description": "International tax structuring and transfer pricing compliance advisory.",
         "status": "active", "court": "Income Tax Appellate Tribunal",
         "next_hearing": (now + timedelta(days=5)).isoformat(),
         "created_at": (now - timedelta(days=10)).isoformat(), "updated_at": now.isoformat()},
        {"id": "demo_case_c3", "client_id": CLIENT_ID, "client_name": "Kavya Aggarwal",
         "lawyer_id": SOS_ID, "lawyer_name": "Adv Kartik Singh",
         "case_type": "Criminal Law", "title": "FIR Response — Wrongful Arrest Defence",
         "description": "Emergency defence for a wrongful FIR filed against family employee.",
         "status": "resolved", "court": "Sessions Court, Bangalore",
         "next_hearing": None,
         "created_at": (now - timedelta(days=30)).isoformat(), "updated_at": (now - timedelta(days=5)).isoformat()},
        # Extra cases for lawyer dashboards
        {"id": "demo_case_l1", "client_id": "dummy_user_1", "client_name": "Rahul Sharma",
         "lawyer_id": NORMAL_ID, "lawyer_name": "Adv Kartik Singh",
         "case_type": "Property Law", "title": "Title Deed Verification — Pune",
         "description": "Legal opinion on disputed title deed for residential property.",
         "status": "active", "court": "Civil Court Pune",
         "next_hearing": (now + timedelta(days=8)).isoformat(),
         "created_at": (now - timedelta(days=20)).isoformat(), "updated_at": now.isoformat()},
        {"id": "demo_case_l2", "client_id": "dummy_user_2", "client_name": "Siya Mehta",
         "lawyer_id": NORMAL_ID, "lawyer_name": "Adv Kartik Singh",
         "case_type": "Corporate Law", "title": "Employment Contract Dispute — TechStart Inc.",
         "description": "Non-compete clause enforceability challenge for a senior executive.",
         "status": "active", "court": "Labour Court, Mumbai",
         "next_hearing": (now + timedelta(days=21)).isoformat(),
         "created_at": (now - timedelta(days=45)).isoformat(), "updated_at": now.isoformat()},
        {"id": "demo_case_l3", "client_id": "dummy_user_3", "client_name": "Priya Iyer",
         "lawyer_id": SIG_ID, "lawyer_name": "Adv Kartik Singh",
         "case_type": "Intellectual Property", "title": "Patent Infringement — MedTech Product",
         "description": "High-value patent infringement suit against a pharmaceutical company.",
         "status": "active", "court": "Delhi High Court",
         "next_hearing": (now + timedelta(days=3)).isoformat(),
         "created_at": (now - timedelta(days=15)).isoformat(), "updated_at": now.isoformat()},
        {"id": "demo_case_l4", "client_id": "dummy_user_4", "client_name": "Anil Kapoor",
         "lawyer_id": SOS_ID, "lawyer_name": "Adv Kartik Singh",
         "case_type": "Criminal Law", "title": "Bail Application — Section 302 IPC",
         "description": "Urgent bail hearing for client wrongfully accused under IPC 302.",
         "status": "active", "court": "High Court of Karnataka",
         "next_hearing": (now + timedelta(days=2)).isoformat(),
         "created_at": (now - timedelta(days=3)).isoformat(), "updated_at": now.isoformat()},
    ]
    await db.cases.insert_many(cases)
    print(f"✅  {len(cases)} cases")

    bookings = [
        {"id": "demo_bk_1", "client_id": CLIENT_ID, "client_name": "Kavya Aggarwal",
         "lawyer_id": NORMAL_ID, "lawyer_name": "Adv Kartik Singh",
         "date": (now + timedelta(days=2)).strftime("%Y-%m-%d"), "time": "11:00 AM",
         "description": "Strategy review for Bandra property case",
         "consultation_type": "video", "meet_link": "https://meet.google.com/xyz-abcd-efg",
         "location": "Google Meet", "status": "confirmed",
         "amount": 2500, "price": 2500, "payment_status": "paid", "created_at": now.isoformat()},
        {"id": "demo_bk_2", "client_id": CLIENT_ID, "client_name": "Kavya Aggarwal",
         "lawyer_id": SIG_ID, "lawyer_name": "Adv Kartik Singh",
         "date": (now + timedelta(days=4)).strftime("%Y-%m-%d"), "time": "02:00 PM",
         "description": "Priority consultation: Tax structuring board review",
         "consultation_type": "in_person",
         "location": "Penthouse 1, Supreme Court Advocates Suite, New Delhi",
         "status": "confirmed", "amount": 10000, "price": 10000,
         "payment_status": "paid", "created_at": now.isoformat()},
        {"id": "demo_bk_3", "client_id": CLIENT_ID, "client_name": "Kavya Aggarwal",
         "lawyer_id": SOS_ID, "lawyer_name": "Adv Kartik Singh",
         "date": (now - timedelta(days=1)).strftime("%Y-%m-%d"), "time": "09:30 PM",
         "description": "Emergency SOS advisory call",
         "consultation_type": "video", "meet_link": "https://meet.google.com/sos-emcy-call",
         "location": "Google Meet", "status": "completed",
         "amount": 3000, "price": 3000, "payment_status": "paid",
         "created_at": (now - timedelta(days=1)).isoformat()},
        {"id": "demo_bk_4", "client_id": "dummy_user_1", "client_name": "Rahul Sharma",
         "lawyer_id": NORMAL_ID, "lawyer_name": "Adv Kartik Singh",
         "date": (now + timedelta(days=1)).strftime("%Y-%m-%d"), "time": "03:00 PM",
         "description": "Title deed verification consultation",
         "consultation_type": "in_person",
         "location": "802, High Court Chambers, Fort, Mumbai",
         "status": "pending", "amount": 3500, "price": 3500,
         "payment_status": "paid", "created_at": now.isoformat()},
        {"id": "demo_bk_5", "client_id": "dummy_user_2", "client_name": "Siya Mehta",
         "lawyer_id": NORMAL_ID, "lawyer_name": "Adv Kartik Singh",
         "date": (now - timedelta(days=10)).strftime("%Y-%m-%d"), "time": "11:00 AM",
         "description": "Employment dispute consultation",
         "consultation_type": "video", "meet_link": "https://meet.google.com/emp-x",
         "location": "Google Meet", "status": "completed",
         "amount": 2500, "price": 2500, "payment_status": "paid",
         "created_at": (now - timedelta(days=10)).isoformat()},
        {"id": "demo_bk_6", "client_id": "dummy_user_4", "client_name": "Anil Kapoor",
         "lawyer_id": SOS_ID, "lawyer_name": "Adv Kartik Singh",
         "date": (now + timedelta(days=1)).strftime("%Y-%m-%d"), "time": "07:00 AM",
         "description": "Urgent bail hearing prep",
         "consultation_type": "video", "meet_link": "https://meet.google.com/bail-abc",
         "location": "Google Meet", "status": "pending",
         "amount": 5500, "price": 5500, "payment_status": "paid", "created_at": now.isoformat()},
    ]
    await db.bookings.insert_many(bookings)
    print(f"✅  {len(bookings)} bookings")

    notifs = [
        {"id": "demo_n1", "user_id": NORMAL_ID, "title": "New Booking Confirmed",
         "message": "Kavya Aggarwal booked a Video consultation for " + (now + timedelta(days=2)).strftime("%b %d") + " at 11:00 AM.",
         "type": "booking", "is_read": False, "created_at": (now - timedelta(hours=2)).isoformat()},
        {"id": "demo_n2", "user_id": NORMAL_ID, "title": "Hearing Reminder",
         "message": "Your Bombay HC hearing in 'Property Dispute Settlement' is in 14 days.",
         "type": "reminder", "is_read": False, "created_at": (now - timedelta(hours=5)).isoformat()},
        {"id": "demo_n3", "user_id": SIG_ID, "title": "Priority Booking Confirmed",
         "message": "Kavya Aggarwal booked an in-person consultation on " + (now + timedelta(days=4)).strftime("%b %d") + " at 02:00 PM.",
         "type": "booking", "is_read": False, "created_at": (now - timedelta(hours=1)).isoformat()},
        {"id": "demo_n4", "user_id": SOS_ID, "title": "Pending Booking Request",
         "message": "Anil Kapoor needs urgent bail prep consultation at 7:00 AM tomorrow.",
         "type": "booking", "is_read": False, "created_at": now.isoformat()},
        {"id": "demo_n5", "user_id": CLIENT_ID, "title": "Consultation Confirmed!",
         "message": "Your consultation with Adv Kartik Singh is confirmed for " + (now + timedelta(days=2)).strftime("%b %d") + " at 11:00 AM.",
         "type": "booking", "is_read": False, "created_at": now.isoformat()},
    ]
    await db.notifications.insert_many(notifs)
    print(f"✅  {len(notifs)} notifications")

    events = [
        {"id": "demo_ev1", "user_id": NORMAL_ID, "title": "Bombay HC Hearing — Bandra Property",
         "type": "hearing", "start_time": (now + timedelta(days=14, hours=10)).isoformat(),
         "end_time": (now + timedelta(days=14, hours=12)).isoformat(),
         "description": "Main hearing for the property boundary dispute.", "created_at": now.isoformat()},
        {"id": "demo_ev2", "user_id": NORMAL_ID, "title": "Client Meeting — Siya Mehta",
         "type": "meeting", "start_time": (now + timedelta(days=3, hours=15)).isoformat(),
         "end_time": (now + timedelta(days=3, hours=16)).isoformat(),
         "description": "Review employment case strategy.", "created_at": now.isoformat()},
        {"id": "demo_ev3", "user_id": SIG_ID, "title": "ITAT Hearing — Aggarwal Ventures",
         "type": "hearing", "start_time": (now + timedelta(days=5, hours=11)).isoformat(),
         "end_time": (now + timedelta(days=5, hours=13)).isoformat(),
         "description": "ITAT hearing on transfer pricing.", "created_at": now.isoformat()},
        {"id": "demo_ev4", "user_id": SIG_ID, "title": "Delhi HC — Patent Infringement",
         "type": "hearing", "start_time": (now + timedelta(days=3, hours=9)).isoformat(),
         "end_time": (now + timedelta(days=3, hours=11)).isoformat(),
         "description": "Interim injunction application.", "created_at": now.isoformat()},
        {"id": "demo_ev5", "user_id": SOS_ID, "title": "Karnataka HC — Bail Hearing (Anil Kapoor)",
         "type": "hearing", "start_time": (now + timedelta(days=2, hours=10)).isoformat(),
         "end_time": (now + timedelta(days=2, hours=11, minutes=30)).isoformat(),
         "description": "Urgent bail application under IPC 302.", "created_at": now.isoformat()},
    ]
    await db.events.insert_many(events)
    print(f"✅  {len(events)} events")

    billing = [
        {"id": "demo_bill_1", "lawyer_id": NORMAL_ID, "client_id": CLIENT_ID,
         "client_name": "Kavya Aggarwal", "booking_id": "demo_bk_1",
         "amount": 2500, "status": "paid", "created_at": now.isoformat()},
        {"id": "demo_bill_2", "lawyer_id": NORMAL_ID, "client_id": "dummy_user_2",
         "client_name": "Siya Mehta", "booking_id": "demo_bk_5",
         "amount": 2500, "status": "paid", "created_at": (now - timedelta(days=10)).isoformat()},
        {"id": "demo_bill_3", "lawyer_id": SIG_ID, "client_id": CLIENT_ID,
         "client_name": "Kavya Aggarwal", "booking_id": "demo_bk_2",
         "amount": 10000, "status": "paid", "created_at": now.isoformat()},
        {"id": "demo_bill_4", "lawyer_id": SOS_ID, "client_id": CLIENT_ID,
         "client_name": "Kavya Aggarwal", "booking_id": "demo_bk_3",
         "amount": 3000, "status": "paid", "created_at": (now - timedelta(days=1)).isoformat()},
    ]
    await db.billing.insert_many(billing)
    print(f"✅  {len(billing)} billing records")


async def main():
    print("=" * 55)
    print("  LxwyerUp — Clean Demo Data Setup")
    print("=" * 55)
    await purge()
    print()
    await insert_users()
    print()
    await insert_data()
    print()
    print("=" * 55)
    print("  LOGIN CREDENTIALS (all use same password)")
    print("=" * 55)
    print()
    print(f"  👤 Kavya Aggarwal (Client/User)")
    print(f"     Email:    kavya@lexwyerup.com")
    print(f"     Password: {PASSWORD}")
    print(f"     Select:   'User' on login page")
    print()
    print(f"  ⚖️  Adv Kartik Singh — Normal Lawyer")
    print(f"     Email:    adv.kartik@lexwyerup.com")
    print(f"     Password: {PASSWORD}")
    print(f"     Select:   'Lawyer' on login page")
    print()
    print(f"  🏆 Adv Kartik Singh — Signature Lawyer")
    print(f"     Email:    signature.kartik@lexwyerup.com")
    print(f"     Password: {PASSWORD}")
    print(f"     Select:   'Lawyer' on login page")
    print()
    print(f"  🆘 Adv Kartik Singh — SOS Lawyer")
    print(f"     Email:    sos.kartik@lexwyerup.com")
    print(f"     Password: {PASSWORD}")
    print(f"     Select:   'Lawyer' on login page")
    print()
    mclient.close()


if __name__ == "__main__":
    asyncio.run(main())
