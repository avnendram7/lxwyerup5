import requests
import json

url = "http://127.0.0.1:8000/api/lawyers/applications"
headers = {
    "Content-Type": "application/json"
}
data = {
    "name": "Test Lawyer",
    "email": "testlawyer123@example.com",
    "phone": "1234567890",
    "password": "password123",
    "bar_council_number": "D/123/2024",
    "specialization": "Criminal Law",
    "experience": 5,
    "state": "Delhi",
    "city": "New Delhi",
    "court": "Delhi High Court",
    "education": "LLB",
    "languages": ["English", "Hindi"],
    "fee_range": "500-1000",
    "bio": "Test bio",
    "lawyer_type": "independent",
    "office_address": "Test Address"
}

try:
    print(f"Sending POST request to {url}...")
    response = requests.post(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
