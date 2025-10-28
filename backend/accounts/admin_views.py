# backend/accounts/admin_views.py
"""
Admin API Views for User Management and System Statistics
Only accessible by users with 'admin' role
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from backend.document_requests.models import DocumentRequest, DocumentRequestAction
from backend.appointments.models import Appointment
from .serializers import UserSerializer

User = get_user_model()


def is_admin(user):
    """Check if user has admin role"""
    return user.role == 'admin'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """
    Get admin dashboard statistics
    GET /api/admin/stats/
    """
    if not is_admin(request.user):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    
    # User statistics
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    users_by_role = User.objects.values('role').annotate(count=Count('id'))
    
    # New users this week
    new_users_this_week = User.objects.filter(
        date_joined__gte=week_ago
    ).count()
    
    # Document request statistics
    total_requests = DocumentRequest.objects.count()
    pending_requests = DocumentRequest.objects.filter(
        status__in=['pending', 'awaiting_payment', 'on_process', 'payment_approved']
    ).count()
    completed_requests = DocumentRequest.objects.filter(
        status='claimed'
    ).count()
    
    # Appointments statistics
    total_appointments = Appointment.objects.count()
    today_appointments = Appointment.objects.filter(
        schedule__date=today
    ).count()
    scheduled_appointments = Appointment.objects.filter(
        status='scheduled'
    ).count()
    
    # Recent activity count (last 24 hours)
    yesterday = timezone.now() - timedelta(days=1)
    recent_actions = DocumentRequestAction.objects.filter(
        created_at__gte=yesterday
    ).count()
    
    return Response({
        'users': {
            'total': total_users,
            'active': active_users,
            'new_this_week': new_users_this_week,
            'by_role': {item['role']: item['count'] for item in users_by_role}
        },
        'requests': {
            'total': total_requests,
            'pending': pending_requests,
            'completed': completed_requests
        },
        'appointments': {
            'total': total_appointments,
            'today': today_appointments,
            'scheduled': scheduled_appointments
        },
        'activity': {
            'recent_actions_24h': recent_actions
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    """
    Get list of all users with filtering
    GET /api/admin/users/?role=student&status=active&search=john
    """
    if not is_admin(request.user):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    users = User.objects.all().order_by('-date_joined')
    
    # Filter by role
    role = request.query_params.get('role')
    if role:
        users = users.filter(role=role)
    
    # Filter by status
    active_status = request.query_params.get('status')
    if active_status == 'active':
        users = users.filter(is_active=True)
    elif active_status == 'inactive':
        users = users.filter(is_active=False)
    
    # Search by name or email
    search = request.query_params.get('search')
    if search:
        users = users.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search) |
            Q(username__icontains=search)
        )
    
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, pk):
    """
    Get details of a specific user
    GET /api/admin/users/<id>/
    """
    if not is_admin(request.user):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(pk=pk)
        serializer = UserSerializer(user)
        
        # Add additional stats for this user
        user_data = serializer.data
        if user.role == 'student':
            user_data['stats'] = {
                'total_requests': DocumentRequest.objects.filter(user=user).count(),
                'pending_requests': DocumentRequest.objects.filter(
                    user=user,
                    status__in=['pending', 'awaiting_payment', 'on_process']
                ).count(),
                'total_appointments': Appointment.objects.filter(user=user).count(),
            }
        
        return Response(user_data)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_user(request):
    """
    Create a new user
    POST /api/admin/users/
    """
    if not is_admin(request.user):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        # Create user with password
        password = request.data.get('password', 'changeme123')
        user = User.objects.create_user(
            username=request.data.get('username'),
            email=request.data.get('email'),
            password=password,
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', ''),
            role=request.data.get('role', 'student')
        )
        
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_update_user(request, pk):
    """
    Update a user
    PATCH /api/admin/users/<id>/
    """
    if not is_admin(request.user):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(pk=pk)
        
        # Update allowed fields
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            user.email = request.data['email']
        if 'role' in request.data:
            user.role = request.data['role']
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
        
        # Change password if provided
        if 'password' in request.data and request.data['password']:
            user.set_password(request.data['password'])
        
        user.save()
        
        return Response(UserSerializer(user).data)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, pk):
    """
    Delete a user (soft delete by setting is_active=False)
    DELETE /api/admin/users/<id>/
    """
    if not is_admin(request.user):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(pk=pk)
        
        # Don't allow deleting yourself
        if user.id == request.user.id:
            return Response(
                {"error": "Cannot delete your own account"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Soft delete
        user.is_active = False
        user.save()
        
        return Response({"message": "User deactivated successfully"})
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_activity_logs(request):
    """
    Get system activity logs
    GET /api/admin/logs/?limit=50&action_type=approval
    """
    if not is_admin(request.user):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get all document request actions as activity logs
    logs = DocumentRequestAction.objects.select_related(
        'actor', 'request'
    ).order_by('-created_at')
    
    # Filter by action type
    action_type = request.query_params.get('action_type')
    if action_type:
        logs = logs.filter(action=action_type)
    
    # Limit results
    limit = int(request.query_params.get('limit', 100))
    logs = logs[:limit]
    
    # Serialize the data
    logs_data = []
    for log in logs:
        # Build user data (actor might be None)
        user_data = None
        if log.actor:
            user_data = {
                'id': log.actor.id,
                'name': f"{log.actor.first_name} {log.actor.last_name}".strip() or log.actor.email,
                'email': log.actor.email,
                'role': log.actor.role
            }
        
        logs_data.append({
            'id': log.id,
            'action': log.action,
            'user': user_data,
            'document_request': {
                'id': log.request.id,
                'document_type': log.request.document_type,
                'status': log.request.status
            },
            'notes': log.notes,
            'created_at': log.created_at.isoformat(),
        })
    
    return Response(logs_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_system_reports(request):
    """
    Get system-wide reports and analytics
    GET /api/admin/reports/
    """
    if not is_admin(request.user):
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    today = timezone.now().date()
    thirty_days_ago = today - timedelta(days=30)
    
    # Requests by document type
    requests_by_type = DocumentRequest.objects.values('document_type').annotate(
        count=Count('id')
    )
    
    # Requests by status
    requests_by_status = DocumentRequest.objects.values('status').annotate(
        count=Count('id')
    )
    
    # Appointments by status
    appointments_by_status = Appointment.objects.values('status').annotate(
        count=Count('id')
    )
    
    # Users by role
    users_by_role = User.objects.values('role').annotate(count=Count('id'))
    
    # Recent registrations (last 30 days)
    recent_registrations = User.objects.filter(
        date_joined__gte=thirty_days_ago
    ).extra(select={'day': 'date(date_joined)'}).values('day').annotate(
        count=Count('id')
    ).order_by('day')
    
    return Response({
        'requests_by_type': list(requests_by_type),
        'requests_by_status': list(requests_by_status),
        'appointments_by_status': list(appointments_by_status),
        'users_by_role': list(users_by_role),
        'recent_registrations': list(recent_registrations),
    })

