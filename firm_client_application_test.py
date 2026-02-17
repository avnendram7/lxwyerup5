#!/usr/bin/env python3
"""
Focused test for Firm Client Application API
Tests the specific scenario requested in the review
"""

import requests
import json
import os
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://legalflow-50.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

def make_request(method, endpoint, data=None, headers=None):
    """Make HTTP request with proper error handling"""
    url = f"{API_BASE}{endpoint}"
    
    if headers is None:
        headers = {'Content-Type': 'application/json'}
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=60)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=60)
        
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def test_firm_client_application_flow():
    """Test the specific firm client application flow requested"""
    print("🚀 Testing Firm Client Application Flow")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    print("="*60)
    
    # Test data as specified in the review request
    application_data = {
        'full_name': "Test Client",
        'email': "testclient@example.com",
        'password': "Test@123",
        'phone': "+91 9876543210",
        'company_name': "Test Company",
        'case_type': "civil",
        'case_description': "Test case description",
        'law_firm_id': "firm-001",
        'law_firm_name': "Shah & Associates"
    }
    
    print("1. Testing POST /api/firm-clients/applications")
    print(f"   Data: {json.dumps(application_data, indent=2)}")
    
    # Test application submission
    response = make_request('POST', '/firm-clients/applications', application_data)
    
    if response is None:
        print("❌ CRITICAL: No response from server")
        return False
    
    print(f"   Response Status: {response.status_code}")
    
    if response.status_code == 200:
        try:
            response_data = response.json()
            print(f"   ✅ Application submitted successfully")
            print(f"   Response: {json.dumps(response_data, indent=2)}")
            application_id = response_data.get('application_id')
            print(f"   Application ID: {application_id}")
        except json.JSONDecodeError:
            print(f"   ❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"   ❌ Application submission failed")
        try:
            error_data = response.json()
            print(f"   Error: {json.dumps(error_data, indent=2)}")
        except:
            print(f"   Error text: {response.text}")
        return False
    
    print("\n2. Verifying application is stored correctly")
    
    # Try to get applications for the firm to verify storage
    response = make_request('GET', f'/firm-clients/applications/firm/firm-001')
    
    if response and response.status_code == 200:
        try:
            applications = response.json()
            print(f"   ✅ Found {len(applications)} applications for firm-001")
            
            # Check if our application is in the list
            test_app = None
            for app in applications:
                if app.get('email') == 'testclient@example.com':
                    test_app = app
                    break
            
            if test_app:
                print(f"   ✅ Test application found in database")
                print(f"   Status: {test_app.get('status', 'unknown')}")
                print(f"   Full Name: {test_app.get('full_name')}")
                print(f"   Case Type: {test_app.get('case_type')}")
                
                # Verify password is hashed (not stored in plain text)
                if 'password' in test_app:
                    stored_password = test_app['password']
                    if stored_password != "Test@123":
                        print(f"   ✅ Password is properly hashed (not stored in plain text)")
                    else:
                        print(f"   ❌ SECURITY ISSUE: Password stored in plain text!")
                        return False
                else:
                    print(f"   ❌ Password field missing from stored application")
            else:
                print(f"   ❌ Test application not found in database")
                return False
                
        except json.JSONDecodeError:
            print(f"   ❌ Invalid JSON response when fetching applications")
            return False
    else:
        print(f"   ❌ Failed to fetch applications for verification")
        print(f"   Status: {response.status_code if response else 'No response'}")
        return False
    
    print("\n3. Testing that login DOES NOT work yet (application is pending)")
    
    # Test login with the application credentials - this should FAIL
    login_data = {
        'email': 'testclient@example.com',
        'password': 'Test@123'
    }
    
    response = make_request('POST', '/firm-clients/login', login_data)
    
    if response is None:
        print("   ❌ No response from login endpoint")
        return False
    
    print(f"   Login Response Status: {response.status_code}")
    
    if response.status_code == 401:
        try:
            error_data = response.json()
            print(f"   ✅ Login correctly FAILED (as expected for pending application)")
            print(f"   Error message: {error_data.get('detail', 'No detail provided')}")
        except json.JSONDecodeError:
            print(f"   ✅ Login failed with 401 status (as expected)")
    elif response.status_code == 200:
        print(f"   ❌ CRITICAL: Login succeeded when it should have failed!")
        print(f"   This indicates a security issue - pending applications should not be able to login")
        try:
            login_response = response.json()
            print(f"   Unexpected login response: {json.dumps(login_response, indent=2)}")
        except:
            pass
        return False
    else:
        print(f"   ❌ Unexpected login response status: {response.status_code}")
        try:
            error_data = response.json()
            print(f"   Response: {json.dumps(error_data, indent=2)}")
        except:
            print(f"   Response text: {response.text}")
        return False
    
    print("\n" + "="*60)
    print("✅ ALL TESTS PASSED")
    print("✅ Application submission working correctly")
    print("✅ Application stored with proper password hashing")
    print("✅ Login correctly blocked for pending applications")
    print("="*60)
    
    return True

if __name__ == "__main__":
    success = test_firm_client_application_flow()
    exit(0 if success else 1)