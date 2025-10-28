# backend/accounts/system_settings_views.py
"""
System Settings API Views
Manage system-wide configuration
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings as django_settings
from django.core.cache import cache
import json


def is_admin(user):
    """Check if user has admin role"""
    return user.role == 'admin'


# Default settings structure
DEFAULT_SETTINGS = {
    'general': {
        'site_name': 'RegistrarConnect',
        'site_url': 'https://registrar.phinmaed.com',
        'admin_email': 'admin@phinmaed.com',
        'timezone': 'Asia/Manila',
        'date_format': 'MM/DD/YYYY',
    },
    'email': {
        'smtp_host': 'smtp.gmail.com',
        'smtp_port': '587',
        'smtp_username': '',
        'smtp_password': '',  # Store encrypted in production
        'email_from': 'noreply@phinmaed.com',
    },
    'security': {
        'allow_registration': True,
        'require_email_verification': True,
        'max_file_size': 10,  # MB
        'allowed_file_types': 'pdf, jpg, png',
    },
    'notifications': {
        'enable_notifications': True,
        'notification_sound': True,
    }
}


def get_settings_from_cache():
    """Get settings from cache or return defaults"""
    cached_settings = cache.get('system_settings')
    if cached_settings:
        return json.loads(cached_settings)
    return DEFAULT_SETTINGS.copy()


def save_settings_to_cache(settings_data):
    """Save settings to cache"""
    cache.set('system_settings', json.dumps(settings_data), timeout=None)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_system_settings(request):
    """
    Get current system settings
    GET /api/auth/admin/settings/
    """
    if not is_admin(request.user):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    settings_data = get_settings_from_cache()
    
    # Don't send sensitive data like passwords
    if 'email' in settings_data and 'smtp_password' in settings_data['email']:
        settings_data['email']['smtp_password'] = '********' if settings_data['email']['smtp_password'] else ''
    
    return Response(settings_data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_system_settings(request):
    """
    Update system settings
    POST /api/auth/admin/settings/
    
    Expected payload:
    {
        "general": {...},
        "email": {...},
        "security": {...},
        "notifications": {...}
    }
    """
    if not is_admin(request.user):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Get current settings
        current_settings = get_settings_from_cache()
        
        # Update with new data
        updated_settings = request.data
        
        # Merge with existing settings (in case partial update)
        for category in ['general', 'email', 'security', 'notifications']:
            if category in updated_settings:
                if category not in current_settings:
                    current_settings[category] = {}
                current_settings[category].update(updated_settings[category])
        
        # Save to cache
        save_settings_to_cache(current_settings)
        
        # Log the change
        print(f"[SYSTEM SETTINGS] Updated by {request.user.email}")
        
        return Response({
            'message': 'Settings updated successfully',
            'settings': current_settings
        })
        
    except Exception as e:
        return Response(
            {"error": f"Failed to update settings: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_system_settings(request):
    """
    Reset settings to defaults
    POST /api/auth/admin/settings/reset/
    """
    if not is_admin(request.user):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Reset to defaults
    save_settings_to_cache(DEFAULT_SETTINGS.copy())
    
    print(f"[SYSTEM SETTINGS] Reset to defaults by {request.user.email}")
    
    return Response({
        'message': 'Settings reset to defaults successfully',
        'settings': DEFAULT_SETTINGS
    })

