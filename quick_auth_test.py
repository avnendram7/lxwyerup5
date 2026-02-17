#!/usr/bin/env python3
"""
Quick Authentication Test for Nyaay Sathi
"""

import requests
import json
import os

BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://legalflow-50.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

def test_auth_quick():
    """Quick auth test"""
    print(f"Testing: {API_BASE}")
    
    # Test registration
    user_data = {
        'email': 'quick.test@example.com',
        'password': 'QuickTest123!',
        'full_name': 'Quick Test User',
        'user_type': 'client',
        'phone': '+91-9876543298'
    }
    
    try:
        print("Testing registration...")
        response = requests.post(f"{API_BASE}/auth/register", json=user_data, timeout=60)
        print(f"Registration Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"Token received: {token[:50]}...")
            
            # Test login
            login_data = {
                'email': user_data['email'],
                'password': user_data['password'],
                'user_type': user_data['user_type']
            }
            
            print("Testing login...")
            response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=60)
            print(f"Login Status: {response.status_code}")
            
            if response.status_code == 200:
                login_result = response.json()
                login_token = login_result.get('token')
                print(f"Login Token: {login_token[:50]}...")
                
                # Test /auth/me
                print("Testing /auth/me...")
                headers = {'Authorization': f'Bearer {login_token}'}
                response = requests.get(f"{API_BASE}/auth/me", headers=headers, timeout=60)
                print(f"/auth/me Status: {response.status_code}")
                
                if response.status_code == 200:
                    user_profile = response.json()
                    print(f"User Profile: {user_profile.get('full_name')}")
        else:
            print(f"Registration failed: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_auth_quick()