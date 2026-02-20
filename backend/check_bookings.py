import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

async def check_bookings():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.lxwyerup
    
    # Check if we can list collections
    collections = await db.list_collection_names()
    print(f"Collections: {collections}")
    
    # Check bookings
    cursor = db.bookings.find({})
    bookings = await cursor.to_list(length=100)
    
    print(f"\nTotal bookings found: {len(bookings)}")
    
    for b in bookings:
        print(f"ID: {b.get('id')}")
        print(f"Lawyer ID: {b.get('lawyer_id')}")
        print(f"Status: {b.get('status')}")
        print(f"Date: {b.get('date')} (type: {type(b.get('date'))})")
        print(f"Created At: {b.get('created_at')} (type: {type(b.get('created_at'))})")
        print("---")

    print("\nCheck Users:")
    cursor = db.users.find({'user_type': 'lawyer'})
    users = await cursor.to_list(length=10)
    for u in users:
        print(f"ID: {u.get('id')}")
        print(f"Name: {u.get('full_name')}")
        print(f"Email: {u.get('email')}")
        print("---")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(check_bookings())
