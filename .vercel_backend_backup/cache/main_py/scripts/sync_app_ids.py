
import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient

# Setup path and env
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# DB Connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'lxwyerup_db')
db = client[db_name]

async def sync_app_ids():
    print(f"Connecting to DB: {db_name}")
    
    # 1. Sync Approved Lawyers
    lawyer_apps = await db.lawyer_applications.find({'status': 'approved'}).to_list(None)
    print(f"Found {len(lawyer_apps)} approved lawyer applications.")
    
    for app in lawyer_apps:
        # Find corresponding user
        user = await db.users.find_one({'email': app['email'], 'user_type': 'lawyer'})
        if user and user.get('unique_id'):
            await db.lawyer_applications.update_one(
                {'_id': app['_id']},
                {'$set': {'unique_id': user['unique_id']}}
            )
            print(f"Synced Lawyer {app['email']} -> {user['unique_id']}")
            
    # 2. Sync Approved Law Firms
    firm_apps = await db.lawfirm_applications.find({'status': 'approved'}).to_list(None)
    print(f"Found {len(firm_apps)} approved law firm applications.")
    
    for app in firm_apps:
        # Find corresponding user (email = contact_email)
        user = await db.users.find_one({'email': app['contact_email'], 'user_type': 'law_firm'})
        if user and user.get('unique_id'):
            await db.lawfirm_applications.update_one(
                {'_id': app['_id']},
                {'$set': {'unique_id': user['unique_id']}}
            )
            print(f"Synced Firm {app['contact_email']} -> {user['unique_id']}")

    # 3. Pending applications? We don't assign IDs to pending yet.
    
    print("Sync complete.")
    client.close()

if __name__ == "__main__":
    asyncio.run(sync_app_ids())
