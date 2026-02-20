
import requests
import json
import os

BASE_URL = "http://localhost:8000/api"

def check():
    # Login
    print("Logging in...")
    try:
        resp = requests.post(f"{BASE_URL}/admin/login", json={"email": "admin@lxwyerup.com", "password": "admin123"})
        resp.raise_for_status()
        token = resp.json()['token']
        print("Login successful.")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    # Fetch Lawyer Applications
    headers = {"Authorization": f"Bearer {token}"}
    print("Fetching lawyer applications...")
    try:
        resp = requests.get(f"{BASE_URL}/admin/lawyer-applications", headers=headers)
        resp.raise_for_status()
        data = resp.json()
        apps = data.get('applications', [])
        stats = data.get('stats', {})
        
        print(f"Stats: {stats}")
        print(f"Total apps fetched: {len(apps)}")
        
        pending_apps = [a for a in apps if a.get('status') == 'pending']
        print(f"Pending apps count from list: {len(pending_apps)}")
        
        if pending_apps:
            print("First pending app structure:")
            print(json.dumps(pending_apps[0], indent=2))
        else:
            print("No pending apps found in list!")

    except Exception as e:
        print(f"Fetch failed: {e}")

if __name__ == "__main__":
    check()
