import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import re

load_dotenv(Path(__file__).parent / '.env')
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def check():
    users = await db.users.find(
        {'email': {'$regex': 'lexwyerup', '$options': 'i'}},
        {'_id': 0, 'id': 1, 'email': 1, 'user_type': 1, 'is_approved': 1}
    ).to_list(100)
    print(f"Found {len(users)} users:")
    for u in users:
        print(u)

asyncio.run(check())
