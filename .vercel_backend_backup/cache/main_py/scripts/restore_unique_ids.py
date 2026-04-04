
import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient

# Setup path and env
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# DB Connection (Simplified for script)
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'lxwyerup_db')
db = client[db_name]

async def generate_unique_id(user_type: str) -> str:
    """
    Generate a unique, sequential ID based on user type.
    """
    prefixes = {
        'lawyer': 'LWR',
        'client': 'USR',
        'law_firm': 'FIRM',
        'firm_lawyer': 'FLWR',
        'admin': 'ADM'
    }
    
    prefix = prefixes.get(user_type, 'USR')
    
    counter_doc = await db.counters.find_one_and_update(
        {'_id': user_type},
        {'$inc': {'sequence_value': 1}},
        upsert=True,
        return_document=True
    )
    
    sequence = counter_doc['sequence_value']
    
    if sequence < 1000:
         sequence += 1000

    return f"{prefix}-{sequence}"

async def restore_ids():
    print(f"Connecting to DB: {db_name}")
    
    # Get all users without unique_id
    users = await db.users.find({'unique_id': {'$exists': False}}).to_list(None)
    print(f"Found {len(users)} users without unique_id")
    
    updated_count = 0
    
    for user in users:
        user_type = user.get('user_type', 'client')
        new_id = await generate_unique_id(user_type)
        
        await db.users.update_one(
            {'_id': user['_id']},
            {'$set': {'unique_id': new_id}}
        )
        print(f"Assigned {new_id} to {user.get('email')}")
        updated_count += 1
        
    print(f"Successfully updated {updated_count} users.")
    client.close()

if __name__ == "__main__":
    asyncio.run(restore_ids())
