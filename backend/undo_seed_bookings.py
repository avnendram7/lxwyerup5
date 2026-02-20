import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta

async def undo_seed_bookings():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.lxwyerup
    
    # Calculate cutoff time (1 hour ago)
    cutoff = datetime.utcnow() - timedelta(hours=1)
    cutoff_iso = cutoff.isoformat()
    
    print(f"Deleting bookings created after {cutoff_iso}...")
    
    # Delete bookings
    result = await db.bookings.delete_many({
        'created_at': {'$gt': cutoff_iso}
    })
    
    print(f"Deleted {result.deleted_count} bookings.")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(undo_seed_bookings())
