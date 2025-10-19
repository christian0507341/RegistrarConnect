#!/usr/bin/env python3
"""
Test script for duplicate request prevention
This script tests the duplicate request prevention functionality.
"""

import requests
import json
import time

# Configuration
API_BASE = "http://127.0.0.1:8000/api"
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123"
}

def login_user():
    """Login and get access token."""
    response = requests.post(f"{API_BASE}/auth/login/", json=TEST_USER)
    if response.status_code == 200:
        data = response.json()
        return data.get("access")
    return None

def create_document_request(token, document_type, semester=None, school_year=None, purpose=None):
    """Create a document request."""
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "document_type": document_type,
        "semester": semester,
        "school_year": school_year,
        "purpose": purpose
    }
    
    response = requests.post(f"{API_BASE}/document-requests/create/", json=data, headers=headers)
    return response

def test_duplicate_prevention():
    """Test duplicate request prevention."""
    print("🧪 Testing Duplicate Request Prevention")
    print("=" * 50)
    
    # Login
    token = login_user()
    if not token:
        print("❌ Failed to login")
        return
    
    print("✅ Logged in successfully")
    
    # Test 1: Create first OTR request
    print("\n📋 Test 1: Creating first OTR request...")
    response1 = create_document_request(token, "OTR", purpose="Employment")
    
    if response1.status_code == 201:
        print("✅ First OTR request created successfully")
        request_data = response1.json()
        print(f"   Request ID: {request_data.get('id')}")
        print(f"   Status: {request_data.get('status')}")
    else:
        print(f"❌ Failed to create first request: {response1.status_code}")
        print(f"   Response: {response1.text}")
        return
    
    # Test 2: Try to create duplicate OTR request
    print("\n📋 Test 2: Attempting to create duplicate OTR request...")
    response2 = create_document_request(token, "OTR", purpose="Employment")
    
    if response2.status_code == 409:  # Conflict
        print("✅ Duplicate request correctly prevented!")
        error_data = response2.json()
        print(f"   Error: {error_data.get('error')}")
        print(f"   Message: {error_data.get('message')}")
        print(f"   Status Message: {error_data.get('status_message')}")
    else:
        print(f"❌ Duplicate request was not prevented: {response2.status_code}")
        print(f"   Response: {response2.text}")
    
    # Test 3: Create different document type (should work)
    print("\n📋 Test 3: Creating COG request (different document type)...")
    response3 = create_document_request(token, "COG", semester=1, school_year="2024-2025", purpose="Scholarship")
    
    if response3.status_code == 201:
        print("✅ COG request created successfully (different document type)")
        request_data = response3.json()
        print(f"   Request ID: {request_data.get('id')}")
        print(f"   Status: {request_data.get('status')}")
    else:
        print(f"❌ Failed to create COG request: {response3.status_code}")
        print(f"   Response: {response3.text}")
    
    # Test 4: Try to create duplicate COG request
    print("\n📋 Test 4: Attempting to create duplicate COG request...")
    response4 = create_document_request(token, "COG", semester=1, school_year="2024-2025", purpose="Scholarship")
    
    if response4.status_code == 409:  # Conflict
        print("✅ Duplicate COG request correctly prevented!")
        error_data = response4.json()
        print(f"   Error: {error_data.get('error')}")
        print(f"   Message: {error_data.get('message')}")
    else:
        print(f"❌ Duplicate COG request was not prevented: {response4.status_code}")
        print(f"   Response: {response4.text}")
    
    # Test 5: Create COG for different semester (should work)
    print("\n📋 Test 5: Creating COG for different semester...")
    response5 = create_document_request(token, "COG", semester=2, school_year="2024-2025", purpose="Scholarship")
    
    if response5.status_code == 201:
        print("✅ COG request for different semester created successfully")
        request_data = response5.json()
        print(f"   Request ID: {request_data.get('id')}")
        print(f"   Status: {request_data.get('status')}")
    else:
        print(f"❌ Failed to create COG for different semester: {response5.status_code}")
        print(f"   Response: {response5.text}")
    
    print("\n🎉 Duplicate request prevention test completed!")

if __name__ == "__main__":
    test_duplicate_prevention()
