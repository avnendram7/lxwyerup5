
import sys
import asyncio
sys.path.append('backend')
from services.database import db
from datetime import datetime

async def check_apps():
    print("Checking lawyer_applications collection...")
    apps = await db.lawyer_applications.find({}).to_list(100)
    print(f"Total applications found: {len(apps)}")
    for app in apps:
        print(f"- ID: {app['_id']}, Email: {app.get('email')}, Status: {app.get('status', 'MISSING')}, Name: {app.get('name')}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    loop.run_until_complete(check_apps())
