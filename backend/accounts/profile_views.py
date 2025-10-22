from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password
import logging

logger = logging.getLogger(__name__)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile information"""
    try:
        user = request.user
        
        # Update allowed fields
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            # Check if email is already taken by another user
            from .models import User
            if User.objects.filter(email__iexact=request.data['email']).exclude(id=user.id).exists():
                return Response(
                    {"error": "This email is already in use by another account"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = request.data['email']
        if 'phone' in request.data:
            user.phone = request.data.get('phone')
        if 'address' in request.data:
            user.address = request.data.get('address')
        if 'date_of_birth' in request.data:
            user.date_of_birth = request.data.get('date_of_birth')
        
        user.save()
        
        return Response({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "name": f"{user.first_name} {user.last_name}".strip() or user.email,
                "role": user.role if hasattr(user, "role") else None
            }
        })
        
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return Response(
            {"error": f"Failed to update profile: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    try:
        user = request.user
        
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        # Validate inputs
        if not current_password or not new_password:
            return Response(
                {"error": "Current password and new password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if current password is correct
        if not check_password(current_password, user.password):
            return Response(
                {"error": "Current password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if new passwords match (if confirm_password is provided)
        if confirm_password and new_password != confirm_password:
            return Response(
                {"error": "New passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check password length
        if len(new_password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters long"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({
            "message": "Password changed successfully"
        })
        
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        return Response(
            {"error": f"Failed to change password: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

