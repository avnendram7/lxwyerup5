#!/usr/bin/env python3
import requests
import json

# Test the login API directly
backend_url = "https://legalflow-50.preview.emergentagent.com/api"

def test_login(email, password, user_type):
    print(f"\n=== Testing {user_type} login ===")
    print(f"Email: {email}")
    
    try:
        response = requests.post(f"{backend_url}/auth/login", json={
            "email": email,
            "password": password,
            "user_type": user_type
        })
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ LOGIN SUCCESS")
            print(f"Token received: {data.get('token', 'No token')[:50]}...")
            print(f"User data: {data.get('user', {})}")
            return True
        else:
            print("❌ LOGIN FAILED")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ REQUEST FAILED: {e}")
        return False

# Test all three login scenarios
results = []

# Test 1: Client Login
results.append(test_login("rajesh.kumar@example.com", "Client@123", "client"))

# Test 2: Lawyer Login  
results.append(test_login("priya.sharma@shahandassociates.com", "Lawyer@123", "lawyer"))

# Test 3: Law Firm Login
results.append(test_login("contact@shahandassociates.com", "LawFirm@123", "law_firm"))

# Summary
print(f"\n=== SUMMARY ===")
print(f"Client Login: {'✅ PASS' if results[0] else '❌ FAIL'}")
print(f"Lawyer Login: {'✅ PASS' if results[1] else '❌ FAIL'}")
print(f"Law Firm Login: {'✅ PASS' if results[2] else '❌ FAIL'}")
print(f"Overall: {sum(results)}/3 login flows working")