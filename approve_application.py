
import requests
import json

BASE_URL = "http://localhost:8000/api"

def approve_app():
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

    headers = {"Authorization": f"Bearer {token}"}

    # Get Pending App ID
    print("Fetching pending apps...")
    resp = requests.get(f"{BASE_URL}/admin/lawyer-applications", headers=headers)
    apps = resp.json().get('applications', [])
    pending = [a for a in apps if a.get('status') == 'pending' and a.get('email') == 'test.lawyer.unique6@example.com']
    
    if not pending:
        print("No pending applications to approve.")
        return

    target_app = pending[0]
    app_id = target_app['_id']
    print(f"Approving app ID: {app_id} ({target_app.get('name')})")

    # Approve
    try:
        resp = requests.put(f"{BASE_URL}/admin/lawyer-applications/{app_id}/approve", headers=headers)
        resp.raise_for_status()
        print("Approval successful.")
        
        # Verify User created
        print("Verifying user creation...")
        resp = requests.get(f"{BASE_URL}/admin/lawyers", headers=headers)
        lawyers = resp.json().get('lawyers', [])
        
        # Find the new lawyer
        # Match by email
        new_lawyer = next((l for l in lawyers if l.get('email') == target_app['email']), None)
        if new_lawyer:
            print("User created successfully!")
            print(f"Practice Start Date: {new_lawyer.get('practice_start_date')}")
            print(f"Education Details: {new_lawyer.get('education_details')}")
        else:
            print("ERROR: User not found after approval!")

    except Exception as e:
        print(f"Approval failed: {e}")
        if resp.status_code:
            print(resp.text)

if __name__ == "__main__":
    approve_app()
