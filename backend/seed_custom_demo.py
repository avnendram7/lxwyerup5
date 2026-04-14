#!/usr/bin/env python3
import asyncio
import os
import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Add backend to path
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

from dotenv import load_dotenv
load_dotenv(ROOT_DIR / '.env')

from services.auth import hash_password
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def seed_custom_demo():
    print("Seeding demo accounts...")
    
    # Common password
    password_hash = hash_password("DemoPassword123!")

    # 1. Kavya Aggarwal (Client)
    client_id = "demo_client_kavya"
    await db.users.delete_many({"id": client_id})
    await db.users.insert_one({
        "id": client_id,
        "email": "kavya@lexwyerup.com",
        "password": password_hash,
        "full_name": "Kavya Aggarwal",
        "user_type": "client",
        "phone": "+91 9876543210",
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    base_achievements = [
        {"id": "ach_1", "title": "Best Corporate Lawyer 2023", "year": "2023", "description": "Awarded by National Legal Council for outstanding work in M&A."},
        {"id": "ach_2", "title": "Pro Bono Champion", "year": "2022", "description": "Recognized for providing 500+ hours of free legal aid to underprivileged communities."},
        {"id": "ach_3", "title": "Landmark Verdict - Supreme Court", "year": "2021", "description": "Successfully represented a class action lawsuit setting a new constitutional precedent."}
    ]

    # 2. Adv Kartik Singh (Normal)
    lawyer_normal_id = "demo_lawyer_kartik"
    await db.users.delete_many({"id": lawyer_normal_id})
    await db.users.insert_one({
        "id": lawyer_normal_id,
        "email": "adv.kartik@lexwyerup.com",
        "password": password_hash,
        "full_name": "Adv Kartik Singh",
        "user_type": "lawyer",
        "phone": "+91 9876543211",
        "specialization": ["Civil Law", "Corporate Law"],
        "experience_years": 12,
        "fee_range": "₹2,500 - ₹5,000",
        "city": "Mumbai",
        "state": "Maharashtra",
        "office_address": "802, High Court Chambers, Fort, Mumbai",
        "is_approved": True,
        "consultation_preferences": "both",
        "application_type": ["normal"],
        "bio": "I am Adv Kartik Singh, a dedicated and passionate legal professional with over 12 years of experience. My core practice revolves around delivering clear, strategic, and practical legal advice. I specialize in complex civil litigation and corporate advisory, successfully guiding businesses and individuals through the intricacies of the Indian judicial system.",
        "achievements": base_achievements,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=500)).isoformat()
    })

    # 3. Adv Signature Kartik (Signature)
    lawyer_signature_id = "demo_lawyer_signature_kartik"
    await db.users.delete_many({"id": lawyer_signature_id})
    await db.users.insert_one({
        "id": lawyer_signature_id,
        "email": "signature.kartik@lexwyerup.com",
        "password": password_hash,
        "full_name": "Adv Kartik Singh",
        "user_type": "lawyer",
        "phone": "+91 9876543212",
        "specialization": ["Tax Law", "Intellectual Property"],
        "experience_years": 18,
        "fee_range": "₹10,000 - ₹20,000",
        "city": "Delhi",
        "state": "Delhi",
        "office_address": "Penthouse 1, Supreme Court Advocates Suite, New Delhi",
        "is_approved": True,
        "consultation_preferences": "both",
        "application_type": ["normal"],
        "isSignature": True,
        "bio": "As a distinguished Signature tier attorney, I bring unparalleled expertise and exclusive focus to your most critical legal matters. Practicing exclusively through Nyaay Sathi, I guarantee priority handling, meticulous corporate strategizing, and iron-clad legal representation tailored for high-net-worth individuals and enterprise clients.",
        "achievements": base_achievements,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=600)).isoformat()
    })

    # 4. Adv SOS Kartik (SOS)
    lawyer_sos_id = "demo_lawyer_sos_kartik"
    await db.users.delete_many({"id": lawyer_sos_id})
    await db.users.insert_one({
        "id": lawyer_sos_id,
        "email": "sos.kartik@lexwyerup.com",
        "password": password_hash,
        "full_name": "Adv Kartik Singh",
        "user_type": "lawyer",
        "phone": "+91 9876543213",
        "specialization": ["Criminal Law", "Family Law"],
        "experience_years": 8,
        "fee_range": "₹3,000 - ₹8,000",
        "city": "Bangalore",
        "state": "Karnataka",
        "office_address": "District Court Road, Next to Police HQ, Bangalore",
        "is_approved": True,
        "consultation_preferences": "video",
        "application_type": ["sos"],
        "sos_locations": ["Bangalore Central", "Koramangala"],
        "sos_matters": ["Bail", "Police Station Visit", "Medical Emergency"],
        "sos_terms_accepted": True,
        "bio": "I am your first line of defense in legal emergencies. As an active SOS responder on Nyaay Sathi, I am available round-the-clock for urgent interventions, immediate bail hearings, and police station visits. With quick reaction times and aggressive defense strategies, I ensure your rights are protected when you need it the most.",
        "achievements": base_achievements,
        "created_at": (datetime.now(timezone.utc) - timedelta(days=300)).isoformat()
    })

    print("Created users.")

    print("Creating dummy dashboard cases and bookings...")
    now = datetime.now(timezone.utc)
    
    # Link cases & bookings for Kavya to these lawyers
    await db.cases.delete_many({"client_id": client_id})
    await db.bookings.delete_many({"client_id": client_id})

    # Cases
    await db.cases.insert_many([
        {
            "id": "demo_case_1",
            "client_id": client_id,
            "client_name": "Kavya Aggarwal",
            "lawyer_id": lawyer_normal_id,
            "lawyer_name": "Adv Kartik Singh",
            "case_type": "Civil Law",
            "title": "Property Dispute Settlement",
            "description": "Resolution of commercial property boundary dispute.",
            "status": "active",
            "next_hearing": (now + timedelta(days=14)).isoformat(),
            "created_at": (now - timedelta(days=60)).isoformat(),
            "updated_at": now.isoformat()
        },
        {
            "id": "demo_case_2",
            "client_id": client_id,
            "client_name": "Kavya Aggarwal",
            "lawyer_id": lawyer_signature_id,
            "lawyer_name": "Adv Kartik Singh",
            "case_type": "Tax Law",
            "title": "Corporate Tax Structuring",
            "description": "High-level advisory on international tax structuring.",
            "status": "active",
            "next_hearing": (now + timedelta(days=5)).isoformat(),
            "created_at": (now - timedelta(days=10)).isoformat(),
            "updated_at": now.isoformat()
        }
    ])

    # Bookings
    await db.bookings.insert_many([
        {
            "id": "demo_booking_1",
            "client_id": client_id,
            "lawyer_id": lawyer_normal_id,
            "date": (now + timedelta(days=2)).strftime("%Y-%m-%d"),
            "time": "11:00 AM",
            "description": "Strategy review meeting",
            "consultation_type": "video",
            "meet_link": "https://meet.google.com/xyz-abcd-efg",
            "location": "Google Meet",
            "status": "confirmed",
            "amount": 2500,
            "created_at": now.isoformat()
        },
        {
            "id": "demo_booking_2",
            "client_id": client_id,
            "lawyer_id": lawyer_signature_id,
            "date": (now + timedelta(days=3)).strftime("%Y-%m-%d"),
            "time": "02:00 PM",
            "description": "Initial Confidential Consultation",
            "consultation_type": "in_person",
            "location": "Penthouse 1, Supreme Court Advocates Suite, New Delhi",
            "status": "confirmed",
            "amount": 10000,
            "created_at": now.isoformat()
        },
        {
            "id": "demo_booking_3",
            "client_id": client_id,
            "lawyer_id": lawyer_sos_id,
            "date": (now - timedelta(days=1)).strftime("%Y-%m-%d"),
            "time": "09:30 PM",
            "description": "Emergency advisory call",
            "consultation_type": "video",
            "meet_link": "https://meet.google.com/sos-emcy-call",
            "location": "Google Meet",
            "status": "completed",
            "amount": 3000,
            "created_at": (now - timedelta(days=1)).isoformat()
        }
    ])
    
    print("Data seeded successfully.")
    
if __name__ == "__main__":
    asyncio.run(seed_custom_demo())
