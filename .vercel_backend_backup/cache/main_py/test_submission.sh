#!/bin/bash
curl -v -X POST "http://localhost:8000/api/lawyer-applications" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Test Lawyer Script",
           "email": "script_test_lawyer@example.com",
           "phone": "9988776655",
           "password": "password123",
           "bar_council_number": "D/999/2024",
           "specialization": "Civil Law",
           "experience": 5,
           "state": "Delhi",
           "city": "New Delhi",
           "court": "Delhi High Court",
           "education": "LLB",
           "languages": ["English"],
           "fee_range": "₹2000 - ₹5000",
           "bio": "Test bio from script",
           "lawyer_type": "independent",
           "cases_won": 0
         }'
