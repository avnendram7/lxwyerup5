"""
Clean up old YC demo data and re-insert a robust set for the YC product demo.
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
DB_NAME   = os.environ.get('DB_NAME', 'lxwyerup')
mclient   = AsyncIOMotorClient(MONGO_URL)
db        = mclient[DB_NAME]

PASSWORD  = "Demo@123"
PASS_HASH = hash_password(PASSWORD)
NOW       = datetime.now(timezone.utc)

# IDs
CLIENT_1 = "yc_client_kavya"
CLIENT_2 = "yc_client_rahul"
CLIENT_3 = "yc_client_siya"

LAWYER_NORMAL = "yc_lawyer_kartik"
LAWYER_SIG    = "yc_lawyer_neha"
LAWYER_SOS    = "yc_lawyer_vikram"

FIRM_1       = "yc_firm_lexco"
FIRM_LAWYER_1 = "yc_flawyer_priya"
FIRM_LAWYER_2 = "yc_flawyer_rajeev"

FIRM_CLIENT_1 = "yc_fclient_testcorp"
FIRM_CLIENT_2 = "yc_fclient_amit"

ACHIEVEMENTS = [
    {"id": "a1", "title": "National Award — Best Advocate 2023", "date": "2023", "year": "2023",
     "description": "Felicitated for outstanding contribution to jurisprudence.",
     "photo": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400"},
]

BASE_LAWYER = {
    "password": PASS_HASH,
    "phone": "+91 9876543211",
    "is_approved": True,
    "status": "approved",
    "is_verified": True,
    "account_status": "active",
    "experience": 15,
    "experience_years": 15,
    "cases_won": 240,
    "languages": ["English", "Hindi"],
    "practice_start_date": "2009-06-01",
    "consultation_preferences": "both",
    "achievements": ACHIEVEMENTS,
}


async def purge():
    """Delete ALL YC demo accounts by prefix."""
    prefix = "^yc_"
    
    r = await db.users.delete_many({"id": {"$regex": prefix}})
    print(f"🗑  Deleted {r.deleted_count} old users")

    await db.firm_lawyers.delete_many({"id": {"$regex": prefix}})
    await db.firm_clients.delete_many({"id": {"$regex": prefix}})
    
    await db.cases.delete_many({"id": {"$regex": prefix}})
    await db.bookings.delete_many({"id": {"$regex": prefix}})
    await db.notifications.delete_many({"id": {"$regex": prefix}})
    await db.events.delete_many({"id": {"$regex": prefix}})
    await db.billing.delete_many({"id": {"$regex": prefix}})
    await db.firm_tasks.delete_many({"id": {"$regex": prefix}})
    print("🗑  Cleared old relational data (cases/bookings/events/billing/tasks)")


async def insert_users():
    # 1. CLIENTS
    await db.users.insert_many([
        {
            "id": CLIENT_1, "email": "kavya@lexwyerup.com", "password": PASS_HASH,
            "full_name": "Kavya Aggarwal", "user_type": "client",
            "phone": "+91 9988776655", "city": "Delhi", "state": "Delhi",
            "created_at": (NOW - timedelta(days=100)).isoformat(),
        },
        {
            "id": CLIENT_2, "email": "rahul@lexwyerup.com", "password": PASS_HASH,
            "full_name": "Rahul Sharma", "user_type": "client",
            "phone": "+91 9988776656", "city": "Mumbai", "state": "Maharashtra",
            "created_at": (NOW - timedelta(days=50)).isoformat(),
        },
        {
            "id": CLIENT_3, "email": "siya@lexwyerup.com", "password": PASS_HASH,
            "full_name": "Siya Mehta", "user_type": "client",
            "phone": "+91 9988776657", "city": "Bangalore", "state": "Karnataka",
            "created_at": (NOW - timedelta(days=20)).isoformat(),
        }
    ])
    print("✅  Inserted Clients (Users)")

    # 2. INDEPENDENT LAWYERS
    await db.users.insert_many([
        {
            **BASE_LAWYER, "id": LAWYER_NORMAL, "email": "adv.kartik@lexwyerup.com",
            "full_name": "Adv Kartik Singh", "user_type": "lawyer",
            "bar_council_number": "MH/1234/2009",
            "education": "LL.M. — NLSIU",
            "specialization": "Civil Law",
            "secondarySpecializations": ["Property Law"],
            "fee_range": "2500-5000",
            "city": "Mumbai", "state": "Maharashtra",
            "office_address": "High Court Chambers, Fort, Mumbai",
            "application_type": ["normal"],
            "bio": "Expert in civil and property disputes in Mumbai.",
            "rating": 4.8, "reviews_count": 120,
            "created_at": (NOW - timedelta(days=500)).isoformat(),
        },
        {
            **BASE_LAWYER, "id": LAWYER_SIG, "email": "signature.neha@lexwyerup.com",
            "full_name": "Adv Neha Desai", "user_type": "lawyer",
            "bar_council_number": "DL/5678/2005",
            "education": "Harvard Law School",
            "specialization": "Corporate Law",
            "secondarySpecializations": ["Tax Law", "M&A"],
            "fee_range": "15000-25000",
            "city": "New Delhi", "state": "Delhi",
            "office_address": "Signature Chambers, Supreme Court, New Delhi",
            "application_type": ["normal"],
            "isSignature": True,
            "firm": "Desai Premium Legal",
            "bio": "Premium corporate attorney for high net worth clients.",
            "rating": 5.0, "reviews_count": 210,
            "created_at": (NOW - timedelta(days=600)).isoformat(),
        },
        {
            **BASE_LAWYER, "id": LAWYER_SOS, "email": "sos.vikram@lexwyerup.com",
            "full_name": "Adv Vikram Rathore", "user_type": "lawyer",
            "bar_council_number": "KA/9012/2012",
            "education": "NLSIU Bangalore",
            "specialization": "Criminal Law",
            "fee_range": "5000-10000",
            "city": "Bangalore", "state": "Karnataka",
            "office_address": "District Court, Bangalore",
            "application_type": ["sos"],
            "sos_locations": ["Bangalore Central", "Whitefield"],
            "sos_matters": ["Bail", "Police Station Visit"],
            "sos_terms_accepted": True,
            "sos_type": "sos_full",
            "charge_30min": 5000, "charge_60min": 8500,
            "bio": "Available 24/7 for emergency legal defense and bail.",
            "rating": 4.9, "reviews_count": 305,
            "created_at": (NOW - timedelta(days=400)).isoformat(),
        }
    ])
    print("✅  Inserted Independent Lawyers")

    # 3. LAW FIRM
    await db.users.insert_one({
        "id": FIRM_1, "unique_id": FIRM_1,
        "email": "contact@lexco.com",
        "contact_email": "contact@lexco.com",
        "password": PASS_HASH, "password_hash": PASS_HASH,
        "full_name": "Lex & Co. Associates",
        "firm_name": "Lex & Co. Associates",
        "contact_name": "Sanjay Lex",
        "contact_phone": "+91 8888888888",
        "user_type": "law_firm",
        "is_approved": True, "is_verified": True,
        "registration_number": "LLP12345/1995",
        "established_year": 1995,
        "total_lawyers": 25,
        "total_staff": 50,
        "practice_areas": ["Corporate Law", "Intellectual Property"],
        "city": "Mumbai", "state": "Maharashtra",
        "address": "Lex Tower, Nariman Point, Mumbai",
        "created_at": (NOW - timedelta(days=800)).isoformat(),
    })
    print("✅  Inserted Law Firm")

    # 4. FIRM LAWYERS
    await db.firm_lawyers.insert_many([
        {
            "id": FIRM_LAWYER_1, "unique_id": FIRM_LAWYER_1,
            "email": "priya@lexco.com", "full_name": "Adv Priya Sharma",
            "password_hash": PASS_HASH, "phone": "+91 7777777777",
            "firm_id": FIRM_1, "firm_name": "Lex & Co. Associates",
            "specialization": "Intellectual Property",
            "experience_years": 8, "designation": "Senior Associate",
            "is_active": True,
            "created_at": (NOW - timedelta(days=200)).isoformat(),
        },
        {
            "id": FIRM_LAWYER_2, "unique_id": FIRM_LAWYER_2,
            "email": "rajeev@lexco.com", "full_name": "Adv Rajeev Menon",
            "password_hash": PASS_HASH, "phone": "+91 7777777776",
            "firm_id": FIRM_1, "firm_name": "Lex & Co. Associates",
            "specialization": "Corporate Law",
            "experience_years": 12, "designation": "Partner",
            "is_active": True,
            "created_at": (NOW - timedelta(days=300)).isoformat(),
        }
    ])
    # Also add them to the users collection so they can login at /login
    await db.users.insert_many([
        {
            "id": FIRM_LAWYER_1, "email": "priya@lexco.com", "password": PASS_HASH,
            "full_name": "Adv Priya Sharma", "user_type": "firm_lawyer",
            "firm_id": FIRM_1, "firm_name": "Lex & Co. Associates",
            "is_approved": True, "created_at": NOW.isoformat(),
            "specialization": "Intellectual Property"
        },
        {
            "id": FIRM_LAWYER_2, "email": "rajeev@lexco.com", "password": PASS_HASH,
            "full_name": "Adv Rajeev Menon", "user_type": "firm_lawyer",
            "firm_id": FIRM_1, "firm_name": "Lex & Co. Associates",
            "is_approved": True, "created_at": NOW.isoformat(),
            "specialization": "Corporate Law"
        }
    ])
    print("✅  Inserted Firm Lawyers")

    # 5. FIRM CLIENTS
    await db.firm_clients.insert_many([
        {
            "id": FIRM_CLIENT_1, "unique_id": FIRM_CLIENT_1,
            "email": "legal@testcorp.com", "full_name": "Test Corp Ltd.",
            "password_hash": PASS_HASH, "phone": "+91 6666666666",
            "law_firm_id": FIRM_1, "law_firm_name": "Lex & Co. Associates",
            "status": "active", "case_type": "Corporate Dispute",
            "assigned_lawyer_id": FIRM_LAWYER_2,
            "assigned_lawyer_name": "Adv Rajeev Menon",
            "created_at": (NOW - timedelta(days=50)).isoformat(),
        },
        {
            "id": FIRM_CLIENT_2, "unique_id": FIRM_CLIENT_2,
            "email": "amit@firmclient.com", "full_name": "Amit Shah",
            "password_hash": PASS_HASH, "phone": "+91 6666666667",
            "law_firm_id": FIRM_1, "law_firm_name": "Lex & Co. Associates",
            "status": "active", "case_type": "Intellectual Property",
            "assigned_lawyer_id": FIRM_LAWYER_1,
            "assigned_lawyer_name": "Adv Priya Sharma",
            "created_at": (NOW - timedelta(days=20)).isoformat(),
        }
    ])
    print("✅  Inserted Firm Clients")


async def insert_data():
    now = NOW
    # Cases
    cases = [
        {"id": "yc_case_1", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal",
         "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh",
         "case_type": "Property Law", "title": "Bandra Plot Dispute",
         "description": "Property dispute regarding a plot in Bandra West.", "case_number": "CASE-1001",
         "status": "active", "court": "Bombay High Court", "next_hearing": (now + timedelta(days=15)).isoformat(), "created_at": (now - timedelta(days=20)).isoformat()},
        {"id": "yc_case_4", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal",
         "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh",
         "case_type": "Civil Law", "title": "Breach of Contract",
         "description": "Vendor failed to deliver goods as per contract terms.", "case_number": "CASE-1004",
         "status": "active", "court": "District Court, Mumbai", "next_hearing": (now + timedelta(days=2)).isoformat(), "created_at": (now - timedelta(days=10)).isoformat()},
        {"id": "yc_case_5", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal",
         "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh",
         "case_type": "Family Law", "title": "Estate Inheritance Claim",
         "description": "Claiming rightful share in ancestral property.", "case_number": "CASE-1005",
         "status": "active", "court": "Family Court, Mumbai", "next_hearing": (now + timedelta(days=25)).isoformat(), "created_at": (now - timedelta(days=5)).isoformat()},
        {"id": "yc_case_6", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal",
         "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh",
         "case_type": "Intellectual Property", "title": "Brand Trademark Infringement",
         "description": "A competitor is using a similar brand logo.", "case_number": "CASE-1006",
         "status": "pending", "court": "Bombay High Court", "next_hearing": None, "created_at": (now - timedelta(days=2)).isoformat()},
        {"id": "yc_case_7", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal",
         "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh",
         "case_type": "Employment Law", "title": "Wrongful Termination Suit",
         "description": "Filing suit against former employer.", "case_number": "CASE-1007",
         "status": "resolved", "court": "Labour Court", "next_hearing": None, "created_at": (now - timedelta(days=60)).isoformat()},
        
        {"id": "yc_case_2", "client_id": CLIENT_2, "client_name": "Rahul Sharma",
         "lawyer_id": LAWYER_SIG, "lawyer_name": "Adv Neha Desai",
         "case_type": "Corporate Law", "title": "Startup Equity Restructuring",
         "description": "Restructuring of equity shares for upcoming Series A funding.", "case_number": "CASE-1002",
         "status": "active", "court": "Delhi High Court", "next_hearing": (now + timedelta(days=5)).isoformat(), "created_at": (now - timedelta(days=30)).isoformat()},
         
        {"id": "yc_case_3", "client_id": CLIENT_3, "client_name": "Siya Mehta",
         "lawyer_id": LAWYER_SOS, "lawyer_name": "Adv Vikram Rathore",
         "case_type": "Criminal Law", "title": "Wrongful Detainment Bail",
         "description": "Bail application for wrongful detainment.", "case_number": "CASE-1003",
         "status": "resolved", "court": "Sessions Court, Bangalore", "next_hearing": None, "created_at": (now - timedelta(days=40)).isoformat()},
    ]
    await db.cases.insert_many(cases)
    
    # Bookings
    bookings = [
        {"id": "yc_bk_1", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal",
         "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh",
         "date": (now + timedelta(days=2)).strftime("%Y-%m-%d"), "time": "11:00 AM",
         "description": "Initial consultation for property dispute.",
         "status": "confirmed", "amount": 2500, "price": 2500, "created_at": (now - timedelta(days=2)).isoformat()},
        {"id": "yc_bk_4", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal", "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh", "date": (now + timedelta(days=3)).strftime("%Y-%m-%d"), "time": "10:00 AM", "description": "Reviewing contract documents.", "status": "confirmed", "amount": 2500, "price": 2500, "created_at": (now - timedelta(days=1)).isoformat()},
        {"id": "yc_bk_5", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal", "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh", "date": (now + timedelta(days=5)).strftime("%Y-%m-%d"), "time": "02:00 PM", "description": "Discuss inheritance claim.", "status": "pending", "amount": 2500, "price": 2500, "created_at": (now - timedelta(days=1)).isoformat()},
        {"id": "yc_bk_6", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal", "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh", "date": (now + timedelta(days=7)).strftime("%Y-%m-%d"), "time": "04:30 PM", "description": "Follow-up on trademark infringement.", "status": "confirmed", "amount": 2500, "price": 2500, "created_at": (now - timedelta(days=2)).isoformat()},
        {"id": "yc_bk_7", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal", "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh", "date": (now - timedelta(days=5)).strftime("%Y-%m-%d"), "time": "09:00 AM", "description": "Discuss wrongful termination.", "status": "completed", "amount": 2500, "price": 2500, "created_at": (now - timedelta(days=10)).isoformat()},
        {"id": "yc_bk_8", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal", "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh", "date": (now - timedelta(days=10)).strftime("%Y-%m-%d"), "time": "11:30 AM", "description": "Initial case assessment.", "status": "completed", "amount": 2500, "price": 2500, "created_at": (now - timedelta(days=15)).isoformat()},
        {"id": "yc_bk_9", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal", "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh", "date": (now + timedelta(days=1)).strftime("%Y-%m-%d"), "time": "01:00 PM", "description": "Quick sync.", "status": "confirmed", "amount": 2500, "price": 2500, "created_at": (now - timedelta(days=1)).isoformat()},
        {"id": "yc_bk_10", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal", "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh", "date": (now + timedelta(days=10)).strftime("%Y-%m-%d"), "time": "10:30 AM", "description": "Strategy discussion.", "status": "pending", "amount": 2500, "price": 2500, "created_at": (now - timedelta(days=1)).isoformat()},
        {"id": "yc_bk_11", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal", "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh", "date": (now + timedelta(days=12)).strftime("%Y-%m-%d"), "time": "03:00 PM", "description": "Hearing prep.", "status": "confirmed", "amount": 2500, "price": 2500, "created_at": (now - timedelta(days=1)).isoformat()},
        {"id": "yc_bk_12", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal", "lawyer_id": LAWYER_NORMAL, "lawyer_name": "Adv Kartik Singh", "date": (now + timedelta(days=15)).strftime("%Y-%m-%d"), "time": "09:00 AM", "description": "Pre-hearing meeting.", "status": "confirmed", "amount": 2500, "price": 2500, "created_at": (now - timedelta(days=1)).isoformat()},
         
        {"id": "yc_bk_2", "client_id": CLIENT_2, "client_name": "Rahul Sharma",
         "lawyer_id": LAWYER_SIG, "lawyer_name": "Adv Neha Desai",
         "date": (now + timedelta(days=4)).strftime("%Y-%m-%d"), "time": "02:00 PM",
         "description": "Discuss term sheet and equity.",
         "status": "confirmed", "amount": 15000, "price": 15000, "created_at": (now - timedelta(days=3)).isoformat()},
         
        {"id": "yc_bk_3", "client_id": CLIENT_3, "client_name": "Siya Mehta",
         "lawyer_id": LAWYER_SOS, "lawyer_name": "Adv Vikram Rathore",
         "date": (now - timedelta(days=1)).strftime("%Y-%m-%d"), "time": "09:30 PM",
         "description": "Emergency bail consultation.",
         "status": "completed", "amount": 5000, "price": 5000, "created_at": (now - timedelta(days=1)).isoformat()},
    ]
    await db.bookings.insert_many(bookings)

    # Documents
    documents = [
        {"id": "yc_doc_1", "user_id": CLIENT_1, "case_id": "yc_case_1", "title": "Property Deed - Bandra.pdf", "file_url": "/uploads/dummy.pdf", "file_type": "application/pdf", "file_size": 2500000, "uploaded_at": (now - timedelta(days=18)).isoformat()},
        {"id": "yc_doc_2", "user_id": CLIENT_1, "case_id": "yc_case_1", "title": "Sale Agreement.docx", "file_url": "/uploads/dummy.docx", "file_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "file_size": 1200000, "uploaded_at": (now - timedelta(days=15)).isoformat()},
        {"id": "yc_doc_3", "user_id": CLIENT_2, "case_id": "yc_case_2", "title": "Term Sheet - Seed Round.pdf", "file_url": "/uploads/dummy.pdf", "file_type": "application/pdf", "file_size": 3500000, "uploaded_at": (now - timedelta(days=25)).isoformat()},
        {"id": "yc_doc_4", "user_id": CLIENT_3, "case_id": "yc_case_3", "title": "Bail Application Draft.pdf", "file_url": "/uploads/dummy.pdf", "file_type": "application/pdf", "file_size": 1500000, "uploaded_at": (now - timedelta(days=5)).isoformat()},
    ]
    await db.documents.insert_many(documents)

    # Messages
    messages = [
        {"id": "yc_msg_1", "sender_id": CLIENT_1, "receiver_id": LAWYER_NORMAL, "content": "Hello Adv Kartik, any updates on the Bandra case?", "timestamp": (now - timedelta(days=2)).isoformat(), "read": True},
        {"id": "yc_msg_2", "sender_id": LAWYER_NORMAL, "receiver_id": CLIENT_1, "content": "Yes Kavya, we have our next hearing in 15 days. I need the signed agreement.", "timestamp": (now - timedelta(days=1, hours=22)).isoformat(), "read": True},
        {"id": "yc_msg_3", "sender_id": CLIENT_1, "receiver_id": LAWYER_NORMAL, "content": "I've uploaded the Sale Agreement in my vault. Can you check?", "timestamp": (now - timedelta(days=1, hours=20)).isoformat(), "read": False},
        {"id": "yc_msg_4", "sender_id": CLIENT_2, "receiver_id": LAWYER_SIG, "content": "Adv Neha, the investors want to review the term sheet.", "timestamp": (now - timedelta(days=1)).isoformat(), "read": False},
    ]
    await db.messages.insert_many(messages)

    # Billing
    billing = [
        {"id": "yc_bill_1", "client_id": CLIENT_1, "client_name": "Kavya Aggarwal", "lawyer_id": LAWYER_NORMAL, "booking_id": "yc_bk_1", "amount": 2500, "status": "paid", "created_at": (now - timedelta(days=2)).isoformat()},
        {"id": "yc_bill_2", "client_id": CLIENT_2, "client_name": "Rahul Sharma", "lawyer_id": LAWYER_SIG, "booking_id": "yc_bk_2", "amount": 15000, "status": "paid", "created_at": (now - timedelta(days=3)).isoformat()},
        {"id": "yc_bill_3", "client_id": CLIENT_3, "client_name": "Siya Mehta", "lawyer_id": LAWYER_SOS, "booking_id": "yc_bk_3", "amount": 5000, "status": "paid", "created_at": (now - timedelta(days=1)).isoformat()},
    ]
    await db.billing.insert_many(billing)

    # SOS Sessions
    sos_sessions = [
        {"id": "yc_sos_1", "user_id": CLIENT_3, "matched_lawyer_id": LAWYER_SOS, "status": "completed", "duration_minutes": 45, "fee_charged": 5000, "rating_given": 5, "created_at": (now - timedelta(days=1, hours=1)).isoformat(), "ended_at": (now - timedelta(days=1, hours=0)).isoformat(), "sos_matter": "Bail Application", "location": "Bangalore"},
    ]
    await db.sos_sessions.insert_many(sos_sessions)

    # Notifications
    notifications = [
        {"id": "yc_notif_1", "user_id": CLIENT_1, "title": "Booking Confirmed", "message": "Your consultation with Adv Kartik is confirmed for tomorrow.", "type": "booking", "is_read": False, "created_at": (now - timedelta(hours=2)).isoformat()},
        {"id": "yc_notif_2", "user_id": LAWYER_NORMAL, "title": "New Message", "message": "You have a new message from Kavya Aggarwal.", "type": "message", "is_read": False, "created_at": (now - timedelta(hours=1)).isoformat()},
        {"id": "yc_notif_3", "user_id": LAWYER_SOS, "title": "SOS Review", "message": "Siya Mehta gave you a 5-star review for the recent SOS session.", "type": "review", "is_read": True, "created_at": (now - timedelta(minutes=30)).isoformat()},
    ]
    await db.notifications.insert_many(notifications)

    events = [
        {"id": "yc_ev_1", "lawyer_id": LAWYER_NORMAL, "title": "Hearing - Bandra Plot", "type": "hearing", "start_time": (now + timedelta(days=15, hours=10)).isoformat(), "end_time": (now + timedelta(days=15, hours=12)).isoformat(), "created_at": now.isoformat()},
        {"id": "yc_ev_2", "lawyer_id": LAWYER_SIG, "title": "Term Sheet Discussion", "type": "meeting", "start_time": (now + timedelta(days=5, hours=14)).isoformat(), "end_time": (now + timedelta(days=5, hours=15)).isoformat(), "created_at": now.isoformat()},
        {"id": "yc_ev_3", "lawyer_id": FIRM_LAWYER_1, "title": "IP Filing Deadline", "type": "deadline", "start_time": (now + timedelta(days=7, hours=10)).isoformat(), "end_time": (now + timedelta(days=7, hours=11)).isoformat(), "created_at": now.isoformat()},
    ]
    await db.events.insert_many(events)

    # Firm Tasks
    firm_tasks = [
        {"id": "yc_task_1", "title": "Draft Non-Compete Agreement", "description": "Draft NCA for Test Corp new executives.", "assigned_to": FIRM_LAWYER_2, "assigned_by": FIRM_1, "priority": "high", "status": "in_progress", "due_date": (now + timedelta(days=2)).strftime("%Y-%m-%d"), "case_id": FIRM_CLIENT_1, "case_name": "Test Corp Ltd.", "created_at": (now - timedelta(days=1)).isoformat(), "completed_at": None},
        {"id": "yc_task_2", "title": "Review Merger Docs", "description": "Review the proposed merger documents.", "assigned_to": FIRM_LAWYER_2, "assigned_by": FIRM_1, "priority": "urgent", "status": "completed", "due_date": (now - timedelta(days=1)).strftime("%Y-%m-%d"), "case_id": FIRM_CLIENT_1, "case_name": "Test Corp Ltd.", "created_at": (now - timedelta(days=5)).isoformat(), "completed_at": (now - timedelta(days=1)).isoformat()},
        {"id": "yc_task_3", "title": "File Trademark Application", "description": "File trademark for Amit Shah's new product line.", "assigned_to": FIRM_LAWYER_1, "assigned_by": FIRM_1, "priority": "medium", "status": "pending", "due_date": (now + timedelta(days=7)).strftime("%Y-%m-%d"), "case_id": FIRM_CLIENT_2, "case_name": "Amit Shah", "created_at": now.isoformat(), "completed_at": None},
    ]
    await db.firm_tasks.insert_many(firm_tasks)

    print("✅  Inserted Relational Data (Cases, Bookings, Docs, Msgs, Billing, SOS, Notifs, Events, Tasks)")


async def main():
    print("=" * 55)
    print("  LxwyerUp — YC Demo Data Seeder")
    print("=" * 55)
    await purge()
    print()
    await insert_users()
    print()
    await insert_data()
    print()
    print("=" * 55)
    print("  LOGIN CREDENTIALS (Password: Demo@123)")
    print("=" * 55)
    print("  Client/User:")
    print("   - kavya@lexwyerup.com")
    print("   - rahul@lexwyerup.com")
    print("   - siya@lexwyerup.com")
    print("\n  Independent Lawyers:")
    print("   - adv.kartik@lexwyerup.com (Normal)")
    print("   - signature.neha@lexwyerup.com (Signature)")
    print("   - sos.vikram@lexwyerup.com (SOS)")
    print("\n  Law Firm (Login as Law Firm):")
    print("   - contact@lexco.com")
    print("\n  Firm Lawyers (Login as Lawyer):")
    print("   - priya@lexco.com")
    print("   - rajeev@lexco.com")
    print("\n  Firm Clients (Login at /firm-client-login):")
    print("   - legal@testcorp.com")
    print("   - amit@firmclient.com")
    print("=" * 55)
    mclient.close()

if __name__ == "__main__":
    asyncio.run(main())
