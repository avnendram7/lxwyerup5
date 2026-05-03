import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'lxwyerup')]

async def main():
    doc = await db.system_settings.find_one({"_id": "website_status"})
    print("LOCAL DB DOC:", doc)

asyncio.run(main())
