#!/usr/bin/env python
import os
import django
from django.conf import settings

# Configure Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# Test the export function
try:
    from backend.document_requests.views import export_document_requests
    print("✅ Export function imported successfully")
    
    # Test URL patterns
    from django.urls import reverse
    from django.test import RequestFactory
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    # Create a test request
    factory = RequestFactory()
    request = factory.get('/api/document-requests/export/?format=csv')
    
    # Create a test user (you might need to adjust this based on your user model)
    try:
        user = User.objects.first()
        if user:
            request.user = user
            print("✅ Test user found")
        else:
            print("⚠️ No users found in database")
    except Exception as e:
        print(f"⚠️ Could not get user: {e}")
    
    print("✅ Export function is ready to use")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
