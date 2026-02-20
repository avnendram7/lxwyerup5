import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import uuid
import random

async def seed_bookings():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.lxwyerup
    
    # Get all lawyers
    lawyers = await db.users.find({'user_type': 'lawyer'}).to_list(100)
    print(f"Found {len(lawyers)} lawyers.")

    # Get a dummy client ID (or use a random UUID)
    dummy_client_id = str(uuid.uuid4())
    clients = await db.users.find({'user_type': 'client'}).to_list(1)
    if clients:
        dummy_client_id = clients[0]['id']

    today = datetime.now()
    
    for lawyer in lawyers:
        lawyer_id = lawyer['id']
        lawyer_name = lawyer.get('full_name', 'Lawyer')
        print(f"Checking bookings for {lawyer_name} ({lawyer_id})...")
        
        # Check existing bookings for this lawyer
        count = await db.bookings.count_documents({'lawyer_id': lawyer_id})
        if count >= 3:
            print(f"  - Has {count} bookings. Skipping.")
            continue
            
        print(f"  - Seeding bookings...")
        
        # Create 3 bookings: Yesterday, Today, Tomorrow
        offsets = [-1, 0, 1]
        for i, offset in enumerate(offsets):
            date_obj = today + timedelta(days=offset)
            date_str = date_obj.strftime("%Y-%m-%d")
            
            # Random status
            status = 'confirmed' if i < 2 else 'pending'
            
            booking = {
                'id': str(uuid.uuid4()),
                'client_id': dummy_client_id,
                'lawyer_id': lawyer_id,
                'date': date_str,
                'time': f"{10 + i}:00", # 10:00, 11:00, 12:00
                'description': f"Consultation regarding case #{random.randint(100, 999)}",
                'price': 1500.0,
                'meet_link': f"https://meet.google.com/abc-defg-hij",
                'duration_minutes': 60,
                'is_free_trial': False,
                'consultation_type': random.choice(['video', 'audio', 'in_person']),
                'location': 'Online' if random.choice([True, False]) else 'Office',
                'status': status,
                'client_name': 'John Doe', # Add client_name for frontend display if needed
                'created_at': datetime.utcnow().isoformat()
            }
            
            await db.bookings.insert_one(booking)
            print(f"    + Added booking: {date_str} ({status})")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(seed_bookings())
