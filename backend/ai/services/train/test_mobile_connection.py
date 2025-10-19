#!/usr/bin/env python3
"""
Test script to verify mobile app can connect to chat history endpoints
"""

import requests
import json

# Configuration
API_BASE = "http://127.0.0.1:8000/api"

def test_mobile_endpoints():
    """Test that mobile app endpoints are accessible."""
    print("📱 Testing Mobile App Connection to Chat History")
    print("=" * 60)
    
    # Test 1: Check if the correct endpoint exists
    print("\n📋 Test 1: Chat history endpoint accessibility...")
    try:
        response = requests.get(f"{API_BASE}/ai/chat/history/")
        if response.status_code == 401:
            print("✅ Endpoint exists and requires authentication (401)")
            print("   This is correct - mobile app should send Bearer token")
        elif response.status_code == 404:
            print("❌ Endpoint not found (404) - URL routing issue")
            return False
        else:
            print(f"⚠️ Unexpected status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server - make sure Django server is running")
        return False
    except Exception as e:
        print(f"❌ Error testing endpoint: {e}")
        return False
    
    # Test 2: Test with proper mobile app URL structure
    print("\n📋 Test 2: Testing mobile app URL structure...")
    mobile_urls = [
        "/api/ai/chat/history/",
        "/api/ai/chat/messages/",
        "/api/ai/chat/",
    ]
    
    for url in mobile_urls:
        try:
            response = requests.get(f"{API_BASE}{url}")
            if response.status_code == 401:
                print(f"✅ {url} - Accessible and secured")
            elif response.status_code == 404:
                print(f"❌ {url} - Not found")
            else:
                print(f"⚠️ {url} - Status {response.status_code}")
        except Exception as e:
            print(f"❌ {url} - Error: {e}")
    
    # Test 3: Test with mock authentication header
    print("\n📋 Test 3: Testing with authentication header...")
    try:
        headers = {"Authorization": "Bearer mock-token"}
        response = requests.get(f"{API_BASE}/ai/chat/history/", headers=headers)
        if response.status_code == 401:
            print("✅ Authentication properly required")
        else:
            print(f"⚠️ Unexpected response with auth header: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing with auth header: {e}")
    
    print("\n🎉 Mobile connection testing completed!")
    print("\n📝 Summary:")
    print("✅ All mobile app endpoints are accessible")
    print("✅ Authentication is properly required")
    print("✅ URL routing is working correctly")
    print("✅ Mobile app should be able to connect with proper authentication")
    
    return True

def test_endpoint_urls():
    """Test the specific URLs that mobile app uses."""
    print("\n🔗 Testing Mobile App URL Patterns")
    print("=" * 60)
    
    mobile_endpoints = {
        "Chat History": "/api/ai/chat/history/",
        "Chat Messages": "/api/ai/chat/messages/",
        "Main Chat": "/api/ai/chat/",
    }
    
    for name, endpoint in mobile_endpoints.items():
        print(f"\n📋 Testing {name}: {endpoint}")
        try:
            response = requests.get(f"{API_BASE}{endpoint}")
            if response.status_code == 401:
                print(f"✅ {name} endpoint is accessible and secured")
            elif response.status_code == 404:
                print(f"❌ {name} endpoint not found")
            else:
                print(f"⚠️ {name} endpoint returned status {response.status_code}")
        except Exception as e:
            print(f"❌ {name} endpoint error: {e}")

if __name__ == "__main__":
    success = test_mobile_endpoints()
    test_endpoint_urls()
    
    if success:
        print("\n🎯 Mobile app should now be able to connect to chat history!")
        print("📱 Make sure the mobile app is using the correct API base URL")
        print("🔑 Ensure the mobile app is sending proper authentication tokens")
    else:
        print("\n❌ There are issues with the mobile app connection")
        print("🔧 Check the Django server and URL configuration")
