#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Nyaay Sathi Application
Tests all authentication, firm client management, and other API endpoints
"""

import requests
import json
import os
from datetime import datetime
import uuid
import time

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://legalflow-50.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Generate unique timestamp for this test run
TEST_RUN_ID = int(time.time())

# Test data with unique emails
TEST_USERS = {
    'client': {
        'email': f'rajesh.kumar.{TEST_RUN_ID}@example.com',
        'password': 'SecurePass123!',
        'full_name': 'Rajesh Kumar',
        'user_type': 'client',
        'phone': '+91-9876543210'
    },
    'lawyer': {
        'email': f'advocate.sharma.{TEST_RUN_ID}@lawfirm.com',
        'password': 'LawyerPass456!',
        'full_name': 'Advocate Priya Sharma',
        'user_type': 'lawyer',
        'phone': '+91-9876543211'
    },
    'law_firm': {
        'email': f'manager.{TEST_RUN_ID}@corporatelaw.com',
        'password': 'FirmPass789!',
        'full_name': 'Amit Gupta',
        'user_type': 'law_firm',
        'phone': '+91-9876543212',
        'firm_name': 'Corporate Legal Associates'
    },
    'admin': {
        'email': 'admin@nyaaysathi.com',
        'password': 'admin123'
    }
}

# Global variables to store tokens and IDs
tokens = {}
user_ids = {}
test_results = []

def log_test(test_name, status, details=""):
    """Log test results"""
    result = {
        'test': test_name,
        'status': status,
        'details': details,
        'timestamp': datetime.now().isoformat()
    }
    test_results.append(result)
    status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⏭️"
    print(f"{status_symbol} {test_name}: {details}")

def make_request(method, endpoint, data=None, headers=None, auth_token=None):
    """Make HTTP request with proper error handling"""
    url = f"{API_BASE}{endpoint}"
    
    if headers is None:
        headers = {'Content-Type': 'application/json'}
    
    if auth_token:
        headers['Authorization'] = f'Bearer {auth_token}'
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=60)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=60)
        elif method == 'PUT':
            response = requests.put(url, json=data, headers=headers, timeout=60)
        elif method == 'PATCH':
            response = requests.patch(url, json=data, headers=headers, timeout=60)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=60)
        
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def test_health_check():
    """Test basic health endpoints"""
    print("\n=== HEALTH CHECK TESTS ===")
    
    # Test root endpoint
    response = make_request('GET', '/')
    if response and response.status_code == 200:
        log_test("Root Endpoint", "PASS", f"Status: {response.status_code}")
    else:
        log_test("Root Endpoint", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test health endpoint
    response = make_request('GET', '/health')
    if response and response.status_code == 200:
        log_test("Health Check", "PASS", f"Status: {response.status_code}")
    else:
        log_test("Health Check", "FAIL", f"Status: {response.status_code if response else 'No response'}")

def test_authentication():
    """Test authentication endpoints"""
    print("\n=== AUTHENTICATION TESTS ===")
    
    # Test user registration/signup for all user types
    for user_type, user_data in TEST_USERS.items():
        if user_type == 'admin':  # Skip admin for registration
            continue
            
        # Test /auth/register
        response = make_request('POST', '/auth/register', user_data)
        if response and response.status_code == 200:
            data = response.json()
            tokens[user_type] = data.get('token')
            user_ids[user_type] = data.get('user', {}).get('id')
            log_test(f"Register {user_type}", "PASS", f"Token received, User ID: {user_ids.get(user_type)}")
        else:
            log_test(f"Register {user_type}", "FAIL", f"Status: {response.status_code if response else 'No response'}")
        
        # Test /auth/signup (alias)
        signup_data = user_data.copy()
        signup_data['email'] = f"signup_{TEST_RUN_ID}_{user_data['email']}"
        response = make_request('POST', '/auth/signup', signup_data)
        if response and response.status_code == 200:
            log_test(f"Signup {user_type}", "PASS", f"Status: {response.status_code}")
        else:
            log_test(f"Signup {user_type}", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test login for all user types
    for user_type, user_data in TEST_USERS.items():
        if user_type == 'admin':  # Skip admin for regular login
            continue
            
        login_data = {
            'email': user_data['email'],
            'password': user_data['password'],
            'user_type': user_data['user_type']
        }
        response = make_request('POST', '/auth/login', login_data)
        if response and response.status_code == 200:
            data = response.json()
            tokens[user_type] = data.get('token')
            log_test(f"Login {user_type}", "PASS", f"Token received")
        else:
            log_test(f"Login {user_type}", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test /auth/me for authenticated users
    for user_type in TEST_USERS.keys():
        if user_type == 'admin':  # Skip admin for /auth/me
            continue
            
        if tokens.get(user_type):
            response = make_request('GET', '/auth/me', auth_token=tokens[user_type])
            if response and response.status_code == 200:
                log_test(f"Get Profile {user_type}", "PASS", f"Profile retrieved")
            else:
                log_test(f"Get Profile {user_type}", "FAIL", f"Status: {response.status_code if response else 'No response'}")

def test_firm_client_management():
    """Test firm client management endpoints"""
    print("\n=== FIRM CLIENT MANAGEMENT TESTS ===")
    
    # Create a law firm first if not exists
    law_firm_id = user_ids.get('law_firm')
    if not law_firm_id:
        log_test("Firm Client Tests", "SKIP", "No law firm user created")
        return
    
    # Test client application submission
    application_data = {
        'full_name': f'Suresh Enterprises Pvt Ltd {TEST_RUN_ID}',
        'email': f'suresh.{TEST_RUN_ID}@enterprises.com',
        'phone': '+91-9876543220',
        'company_name': 'Suresh Enterprises',
        'case_type': 'corporate',
        'case_description': 'Need legal assistance for company incorporation and compliance matters',
        'law_firm_id': law_firm_id,
        'law_firm_name': 'Corporate Legal Associates'
    }
    
    response = make_request('POST', '/firm-clients/applications', application_data)
    application_id = None
    if response and response.status_code == 200:
        data = response.json()
        application_id = data.get('application_id')
        log_test("Submit Client Application", "PASS", f"Application ID: {application_id}")
    else:
        log_test("Submit Client Application", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test get applications for law firm
    if law_firm_id:
        response = make_request('GET', f'/firm-clients/applications/firm/{law_firm_id}')
        if response and response.status_code == 200:
            applications = response.json()
            log_test("Get Firm Applications", "PASS", f"Found {len(applications)} applications")
        else:
            log_test("Get Firm Applications", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test application approval
    if application_id:
        approval_data = {
            'status': 'approved',
            'reviewed_by': 'manager@corporatelaw.com',
            'assigned_lawyer_id': user_ids.get('lawyer', 'lawyer123'),
            'assigned_lawyer_name': 'Advocate Priya Sharma'
        }
        response = make_request('PUT', f'/firm-clients/applications/{application_id}/status', approval_data)
        if response and response.status_code == 200:
            data = response.json()
            temp_password = data.get('temp_password')
            log_test("Approve Client Application", "PASS", f"Temp password: {temp_password}")
            
            # Test client login with temp password
            if temp_password:
                login_data = {
                    'email': f'suresh.{TEST_RUN_ID}@enterprises.com',
                    'password': temp_password
                }
                response = make_request('POST', '/firm-clients/login', login_data)
                if response and response.status_code == 200:
                    client_data = response.json()
                    client_token = client_data.get('token')
                    client_id = client_data.get('user', {}).get('id')
                    log_test("Firm Client Login", "PASS", f"Client logged in successfully")
                    
                    # Test get client details
                    if client_id:
                        response = make_request('GET', f'/firm-clients/{client_id}')
                        if response and response.status_code == 200:
                            log_test("Get Client Details", "PASS", "Client details retrieved")
                        else:
                            log_test("Get Client Details", "FAIL", f"Status: {response.status_code if response else 'No response'}")
                else:
                    log_test("Firm Client Login", "FAIL", f"Status: {response.status_code if response else 'No response'}")
        else:
            log_test("Approve Client Application", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test get all clients for firm
    if law_firm_id:
        response = make_request('GET', f'/firm-clients/firm/{law_firm_id}/list')
        if response and response.status_code == 200:
            clients = response.json()
            log_test("Get Firm Clients List", "PASS", f"Found {len(clients)} clients")
        else:
            log_test("Get Firm Clients List", "FAIL", f"Status: {response.status_code if response else 'No response'}")

def test_lawyer_applications():
    """Test lawyer application endpoints"""
    print("\n=== LAWYER APPLICATION TESTS ===")
    
    lawyer_app_data = {
        'name': f'Vikram Singh {TEST_RUN_ID}',
        'email': f'vikram.singh.{TEST_RUN_ID}@lawyer.com',
        'phone': '+91-9876543230',
        'password': 'LawyerVikram123!',
        'bar_council_number': f'BAR/2020/{TEST_RUN_ID}',
        'specialization': 'Criminal Law',
        'experience': 5,
        'cases_won': 45,
        'state': 'Delhi',
        'city': 'New Delhi',
        'court': 'Delhi High Court',
        'education': 'LLB from Delhi University',
        'languages': ['Hindi', 'English', 'Punjabi'],
        'fee_range': '₹50,000 - ₹1,00,000',
        'bio': 'Experienced criminal lawyer with expertise in white-collar crimes'
    }
    
    response = make_request('POST', '/lawyers/applications', lawyer_app_data)
    if response and response.status_code == 200:
        log_test("Submit Lawyer Application", "PASS", "Application submitted successfully")
    else:
        log_test("Submit Lawyer Application", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test get all lawyers
    response = make_request('GET', '/lawyers')
    if response and response.status_code == 200:
        lawyers = response.json()
        log_test("Get All Lawyers", "PASS", f"Found {len(lawyers)} lawyers")
    else:
        log_test("Get All Lawyers", "FAIL", f"Status: {response.status_code if response else 'No response'}")

def test_lawfirm_applications():
    """Test law firm application endpoints"""
    print("\n=== LAW FIRM APPLICATION TESTS ===")
    
    lawfirm_app_data = {
        'firm_name': f'Delhi Legal Partners {TEST_RUN_ID}',
        'registration_number': f'REG/2020/DLP{TEST_RUN_ID}',
        'established_year': 2015,
        'website': f'https://delhilegalpartners{TEST_RUN_ID}.com',
        'contact_name': 'Rajesh Khanna',
        'contact_email': f'rajesh.{TEST_RUN_ID}@delhilegal.com',
        'contact_phone': '+91-9876543240',
        'contact_designation': 'Managing Partner',
        'password': 'FirmRajesh123!',
        'address': '123 Connaught Place, New Delhi',
        'city': 'New Delhi',
        'state': 'Delhi',
        'pincode': '110001',
        'practice_areas': ['Corporate Law', 'Taxation', 'Real Estate'],
        'total_lawyers': 15,
        'total_staff': 25,
        'description': 'Leading law firm specializing in corporate and commercial law',
        'achievements': 'Winner of Best Law Firm Award 2022'
    }
    
    response = make_request('POST', '/lawfirms/applications', lawfirm_app_data)
    if response and response.status_code == 200:
        log_test("Submit Law Firm Application", "PASS", "Application submitted successfully")
    else:
        log_test("Submit Law Firm Application", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test get all law firms
    response = make_request('GET', '/lawfirms')
    if response and response.status_code == 200:
        lawfirms = response.json()
        log_test("Get All Law Firms", "PASS", f"Found {len(lawfirms)} law firms")
    else:
        log_test("Get All Law Firms", "FAIL", f"Status: {response.status_code if response else 'No response'}")

def test_admin_endpoints():
    """Test admin endpoints"""
    print("\n=== ADMIN TESTS ===")
    
    # Test admin login
    admin_data = {
        'email': 'admin@nyaaysathi.com',
        'password': 'admin123'
    }
    
    response = make_request('POST', '/admin/login', admin_data)
    admin_token = None
    if response and response.status_code == 200:
        data = response.json()
        admin_token = data.get('token')
        log_test("Admin Login", "PASS", "Admin logged in successfully")
    else:
        log_test("Admin Login", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    if admin_token:
        # Test get lawyer applications
        response = make_request('GET', '/admin/lawyer-applications', auth_token=admin_token)
        if response and response.status_code == 200:
            data = response.json()
            applications = data.get('applications', [])
            log_test("Get Lawyer Applications (Admin)", "PASS", f"Found {len(applications)} applications")
        else:
            log_test("Get Lawyer Applications (Admin)", "FAIL", f"Status: {response.status_code if response else 'No response'}")
        
        # Test get law firm applications
        response = make_request('GET', '/admin/lawfirm-applications', auth_token=admin_token)
        if response and response.status_code == 200:
            data = response.json()
            applications = data.get('applications', [])
            log_test("Get Law Firm Applications (Admin)", "PASS", f"Found {len(applications)} applications")
        else:
            log_test("Get Law Firm Applications (Admin)", "FAIL", f"Status: {response.status_code if response else 'No response'}")

def test_firm_lawyer_endpoints():
    """Test firm lawyer management endpoints"""
    print("\n=== FIRM LAWYER TESTS ===")
    
    # Test firm lawyer application
    firm_lawyer_app = {
        'full_name': f'Anita Desai {TEST_RUN_ID}',
        'email': f'anita.desai.{TEST_RUN_ID}@corporatelaw.com',
        'phone': '+91-9876543250',
        'password': 'AnitaLawyer123!',
        'firm_id': user_ids.get('law_firm', 'firm123'),
        'firm_name': 'Corporate Legal Associates',
        'specialization': 'Contract Law',
        'experience_years': 3,
        'bar_council_number': f'BAR/2021/{TEST_RUN_ID}',
        'education': 'LLM from National Law School',
        'languages': ['Hindi', 'English', 'Marathi'],
        'bio': 'Specialist in contract drafting and review'
    }
    
    response = make_request('POST', '/firm-lawyers/applications', firm_lawyer_app)
    if response and response.status_code == 200:
        log_test("Submit Firm Lawyer Application", "PASS", "Application submitted successfully")
    else:
        log_test("Submit Firm Lawyer Application", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test get firm lawyer applications
    response = make_request('GET', '/firm-lawyers/applications')
    if response and response.status_code == 200:
        applications = response.json()
        log_test("Get Firm Lawyer Applications", "PASS", f"Found {len(applications)} applications")
    else:
        log_test("Get Firm Lawyer Applications", "FAIL", f"Status: {response.status_code if response else 'No response'}")

def test_chat_endpoints():
    """Test chat functionality"""
    print("\n=== CHAT TESTS ===")
    
    # Test guest chat (no authentication)
    chat_data = {
        'message': 'I need legal advice for a property dispute',
        'system_prompt': 'You are a helpful legal assistant'
    }
    
    response = make_request('POST', '/chat/guest', chat_data)
    if response and response.status_code == 200:
        data = response.json()
        session_id = data.get('session_id')
        log_test("Guest Chat", "PASS", f"Session ID: {session_id}")
    else:
        log_test("Guest Chat", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test authenticated chat
    client_token = tokens.get('client')
    if client_token:
        response = make_request('POST', '/chat', chat_data, auth_token=client_token)
        if response and response.status_code == 200:
            log_test("Authenticated Chat", "PASS", "Chat response received")
        else:
            log_test("Authenticated Chat", "FAIL", f"Status: {response.status_code if response else 'No response'}")
        
        # Test get chat history
        response = make_request('GET', '/chat/history', auth_token=client_token)
        if response and response.status_code == 200:
            history = response.json()
            log_test("Get Chat History", "PASS", f"Found {len(history)} messages")
        else:
            log_test("Get Chat History", "FAIL", f"Status: {response.status_code if response else 'No response'}")

def test_cases_endpoints():
    """Test case management endpoints"""
    print("\n=== CASES TESTS ===")
    
    client_token = tokens.get('client')
    if not client_token:
        log_test("Cases Tests", "SKIP", "No client token available")
        return
    
    # Test create case
    case_data = {
        'title': 'Property Ownership Dispute',
        'case_number': 'PROP/2024/001',
        'description': 'Legal dispute over property ownership with neighbor',
        'status': 'active'
    }
    
    response = make_request('POST', '/cases', case_data, auth_token=client_token)
    case_id = None
    if response and response.status_code == 200:
        data = response.json()
        case_id = data.get('id')
        log_test("Create Case", "PASS", f"Case ID: {case_id}")
    else:
        log_test("Create Case", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test get cases
    response = make_request('GET', '/cases', auth_token=client_token)
    if response and response.status_code == 200:
        cases = response.json()
        log_test("Get Cases", "PASS", f"Found {len(cases)} cases")
    else:
        log_test("Get Cases", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test get specific case
    if case_id:
        response = make_request('GET', f'/cases/{case_id}', auth_token=client_token)
        if response and response.status_code == 200:
            log_test("Get Specific Case", "PASS", "Case details retrieved")
        else:
            log_test("Get Specific Case", "FAIL", f"Status: {response.status_code if response else 'No response'}")

def test_bookings_endpoints():
    """Test booking management endpoints"""
    print("\n=== BOOKINGS TESTS ===")
    
    client_token = tokens.get('client')
    if not client_token:
        log_test("Bookings Tests", "SKIP", "No client token available")
        return
    
    # Test create booking
    booking_data = {
        'lawyer_id': user_ids.get('lawyer', 'lawyer123'),
        'date': '2024-02-15',
        'time': '10:00',
        'description': 'Need consultation for property dispute case'
    }
    
    response = make_request('POST', '/bookings', booking_data, auth_token=client_token)
    if response and response.status_code == 200:
        log_test("Create Booking", "PASS", "Booking created successfully")
    else:
        log_test("Create Booking", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test get bookings
    response = make_request('GET', '/bookings', auth_token=client_token)
    if response and response.status_code == 200:
        bookings = response.json()
        log_test("Get Bookings", "PASS", f"Found {len(bookings)} bookings")
    else:
        log_test("Get Bookings", "FAIL", f"Status: {response.status_code if response else 'No response'}")

def test_documents_endpoints():
    """Test document management endpoints"""
    print("\n=== DOCUMENTS TESTS ===")
    
    client_token = tokens.get('client')
    if not client_token:
        log_test("Documents Tests", "SKIP", "No client token available")
        return
    
    # Test create document
    doc_data = {
        'case_id': 'case123',
        'title': 'Property Deed',
        'file_url': '/documents/property_deed.pdf',
        'file_type': 'pdf'
    }
    
    response = make_request('POST', '/documents', doc_data, auth_token=client_token)
    if response and response.status_code == 200:
        log_test("Create Document", "PASS", "Document created successfully")
    else:
        log_test("Create Document", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    
    # Test get documents
    response = make_request('GET', '/documents', auth_token=client_token)
    if response and response.status_code == 200:
        documents = response.json()
        log_test("Get Documents", "PASS", f"Found {len(documents)} documents")
    else:
        log_test("Get Documents", "FAIL", f"Status: {response.status_code if response else 'No response'}")

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = len([r for r in test_results if r['status'] == 'PASS'])
    failed = len([r for r in test_results if r['status'] == 'FAIL'])
    skipped = len([r for r in test_results if r['status'] == 'SKIP'])
    total = len(test_results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed} ✅")
    print(f"Failed: {failed} ❌")
    print(f"Skipped: {skipped} ⏭️")
    print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
    
    if failed > 0:
        print("\nFAILED TESTS:")
        for result in test_results:
            if result['status'] == 'FAIL':
                print(f"❌ {result['test']}: {result['details']}")
    
    print("\n" + "="*60)

def main():
    """Run all tests"""
    print("🚀 Starting Nyaay Sathi Backend API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    
    try:
        test_health_check()
        test_authentication()
        test_firm_client_management()
        test_lawyer_applications()
        test_lawfirm_applications()
        test_admin_endpoints()
        test_firm_lawyer_endpoints()
        test_chat_endpoints()
        test_cases_endpoints()
        test_bookings_endpoints()
        test_documents_endpoints()
        
        print_summary()
        
        # Save results to file
        with open('test_results_detailed.json', 'w') as f:
            json.dump(test_results, f, indent=2)
        
        print(f"\nDetailed results saved to: test_results_detailed.json")
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())