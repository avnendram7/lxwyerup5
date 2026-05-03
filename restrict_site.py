from datetime import datetime, timedelta, timezone
import jwt # PyJWT instead of python-jose if possible, wait let's check what auth.py uses
import os
import requests
from dotenv import load_dotenv

load_dotenv('backend/.env')
SECRET = os.environ.get("JWT_SECRET")
email = os.environ.get("MONITOR_EMAIL", "monitor@lxwyerup.com")

expires_delta = timedelta(hours=8)
expire = datetime.now(timezone.utc) + expires_delta
to_encode = {"email": email, "role": "admin", "exp": expire, "iat": datetime.now(timezone.utc)}
token = jwt.encode(to_encode, SECRET, algorithm="HS256")

url = "https://lxwyerup.vercel.app/api/monitor/website-status"
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
data = {"is_restricted": True}

response = requests.post(url, headers=headers, json=data)
print("Status Code:", response.status_code)
print("Response:", response.text)
