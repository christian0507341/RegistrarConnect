#!/usr/bin/env python3
"""
Test script for user isolation in chat history
This script verifies that users can only access their own chat history.
"""

import requests
import json
import time

# Configuration
API_BASE = "http://127.0.0.1:8000/api"

def login_user(email, password):
    """Login and get access token."""
    response = requests.post(f"{API_BASE}/auth/login/", json={
        "email": email,
        "password": password
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("access")
    return None

def test_user_isolation():
    """Test that users can only see their own chat history."""
    print("🔒 Testing User Isolation in Chat History")
    print("=" * 60)
    
    # Test with two different users
    user1_token = login_user("user1@example.com", "password123")
    user2_token = login_user("user2@example.com", "password123")
    
    if not user1_token or not user2_token:
        print("❌ Failed to login test users")
        return
    
    print("✅ Both test users logged in successfully")
    
    # Test 1: User 1 gets their own chat history
    print("\n📋 Test 1: User 1 accessing their own chat history...")
    headers1 = {"Authorization": f"Bearer {user1_token}"}
    response1 = requests.get(f"{API_BASE}/ai/chat/history/", headers=headers1)
    
    if response1.status_code == 200:
        user1_history = response1.json()
        print(f"✅ User 1 can access their history: {len(user1_history)} conversations")
        for conv in user1_history:
            print(f"   - Conversation {conv['id']} (Status: {conv.get('status', 'N/A')})")
    else:
        print(f"❌ User 1 failed to access history: {response1.status_code}")
        print(f"   Response: {response1.text}")
    
    # Test 2: User 2 gets their own chat history
    print("\n📋 Test 2: User 2 accessing their own chat history...")
    headers2 = {"Authorization": f"Bearer {user2_token}"}
    response2 = requests.get(f"{API_BASE}/ai/chat/history/", headers=headers2)
    
    if response2.status_code == 200:
        user2_history = response2.json()
        print(f"✅ User 2 can access their history: {len(user2_history)} conversations")
        for conv in user2_history:
            print(f"   - Conversation {conv['id']} (Status: {conv.get('status', 'N/A')})")
    else:
        print(f"❌ User 2 failed to access history: {response2.status_code}")
        print(f"   Response: {response2.text}")
    
    # Test 3: Verify isolation - users should see different data
    print("\n📋 Test 3: Verifying data isolation...")
    if response1.status_code == 200 and response2.status_code == 200:
        user1_ids = {conv['id'] for conv in user1_history}
        user2_ids = {conv['id'] for conv in user2_history}
        
        overlap = user1_ids.intersection(user2_ids)
        if len(overlap) == 0:
            print("✅ Data isolation confirmed - no shared conversations")
        else:
            print(f"❌ Data isolation failed - shared conversations: {overlap}")
    else:
        print("❌ Cannot verify isolation - one or both users failed to access history")
    
    # Test 4: User 1 tries to access User 2's conversation (should fail)
    print("\n📋 Test 4: User 1 trying to access User 2's conversation...")
    if response2.status_code == 200 and len(user2_history) > 0:
        user2_conv_id = user2_history[0]['id']
        
        # User 1 tries to get User 2's conversation messages
        response_cross = requests.get(
            f"{API_BASE}/ai/chat/messages/",
            headers=headers1,
            params={"conversation_id": user2_conv_id}
        )
        
        if response_cross.status_code == 200:
            # Should return empty array, not User 2's messages
            messages = response_cross.json()
            if len(messages) == 0:
                print("✅ Cross-user access properly blocked - empty response")
            else:
                print(f"❌ Cross-user access failed - got {len(messages)} messages")
        else:
            print(f"✅ Cross-user access properly blocked - status {response_cross.status_code}")
    else:
        print("⚠️ Cannot test cross-user access - User 2 has no conversations")
    
    # Test 5: User 1 tries to delete User 2's conversation (should fail)
    print("\n📋 Test 5: User 1 trying to delete User 2's conversation...")
    if response2.status_code == 200 and len(user2_history) > 0:
        user2_conv_id = user2_history[0]['id']
        
        # User 1 tries to delete User 2's conversation
        response_delete = requests.delete(
            f"{API_BASE}/ai/chat/history/{user2_conv_id}/",
            headers=headers1
        )
        
        if response_delete.status_code == 404:
            print("✅ Cross-user deletion properly blocked - conversation not found")
        elif response_delete.status_code == 403:
            print("✅ Cross-user deletion properly blocked - access denied")
        else:
            print(f"❌ Cross-user deletion not properly blocked - status {response_delete.status_code}")
    else:
        print("⚠️ Cannot test cross-user deletion - User 2 has no conversations")
    
    print("\n🎉 User isolation testing completed!")

def test_authentication_required():
    """Test that authentication is required for all endpoints."""
    print("\n🔐 Testing Authentication Requirements")
    print("=" * 60)
    
    endpoints = [
        ("GET", "/ai/chat/history/"),
        ("GET", "/ai/chat/messages/"),
        ("POST", "/ai/chat/"),
    ]
    
    for method, endpoint in endpoints:
        print(f"\n📋 Testing {method} {endpoint} without authentication...")
        
        if method == "GET":
            response = requests.get(f"{API_BASE}{endpoint}")
        elif method == "POST":
            response = requests.post(f"{API_BASE}{endpoint}", json={})
        elif method == "DELETE":
            response = requests.delete(f"{API_BASE}{endpoint}")
        
        if response.status_code == 401:
            print(f"✅ Authentication required for {method} {endpoint}")
        else:
            print(f"❌ Authentication not required for {method} {endpoint} - status {response.status_code}")

if __name__ == "__main__":
    test_user_isolation()
    test_authentication_required()
