import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_lawyer_structure():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.lxwyerup
    
    # Get lawyers
    lawyers = await db.users.find({'user_type': 'lawyer', 'is_approved': True}).to_list(10)
    print(f"Found {len(lawyers)} approved lawyers.")
    
    for lawyer in lawyers:
        print(f"ID: {lawyer.get('id')}")
        print(f"Name (full_name): {lawyer.get('full_name')}")
        print(f"Name (name): {lawyer.get('name')}")
        print(f"Experience (experience): {lawyer.get('experience')}")
        print(f"Experience (years_experience): {lawyer.get('years_experience')}")
        print(f"City: {lawyer.get('city')}")
        print(f"Specialization: {lawyer.get('specialization')}")
        print("keys:", list(lawyer.keys()))
        print("---")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(check_lawyer_structure())
