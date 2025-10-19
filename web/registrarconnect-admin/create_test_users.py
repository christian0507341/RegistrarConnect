#!/usr/bin/env python3
"""
Script to create test users for RegistrarConnect
Run this from the backend directory: python create_test_users.py
"""

import os
import sys
import django

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_dir)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_test_users():
    """Create test users for different roles"""
    
    # Test users data
    test_users = [
        {
            'email': 'john.doe.up@phinmaed.com',
            'password': 'testpass123',
            'role': 'student',
            'first_name': 'John',
            'last_name': 'Doe',
            'student_id': '03-2324-092300'
        },
        {
            'email': 'jane.smith.up@phinmaed.com',
            'password': 'testpass123',
            'role': 'faculty',
            'first_name': 'Jane',
            'last_name': 'Smith'
        },
        {
            'email': 'admin.user.up@phinmaed.com',
            'password': 'testpass123',
            'role': 'admin',
            'first_name': 'Admin',
            'last_name': 'User'
        }
    ]
    
    created_users = []
    
    for user_data in test_users:
        try:
            # Check if user already exists
            if User.objects.filter(email=user_data['email']).exists():
                print(f"User {user_data['email']} already exists, skipping...")
                continue
            
            # Create user
            user = User.objects.create_user(
                email=user_data['email'],
                password=user_data['password'],
                role=user_data['role'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                student_id=user_data.get('student_id', ''),
                is_active=True
            )
            
            created_users.append(user)
            print(f"✅ Created user: {user.email} (Role: {user.role})")
            
        except Exception as e:
            print(f"❌ Failed to create user {user_data['email']}: {e}")
    
    print(f"\n🎉 Created {len(created_users)} test users!")
    print("\nTest login credentials:")
    for user in created_users:
        print(f"  Email: {user.email}")
        print(f"  Password: testpass123")
        print(f"  Role: {user.role}")
        print()

if __name__ == '__main__':
    create_test_users()
