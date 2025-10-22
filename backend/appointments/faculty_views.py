from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment
from backend.document_requests.models import DocumentRequest
from backend.accounts.models import User
import logging

logger = logging.getLogger(__name__)


def check_faculty_permission(user):
    """Helper function to check if user is faculty"""
    return user.role == 'faculty'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_dashboard_stats(request):
    """Get dashboard statistics for faculty members"""
    try:
        user = request.user
        
        if not check_faculty_permission(user):
            return Response(
                {"error": "Only faculty can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get today's date
        today = timezone.now().date()
        today_start = timezone.make_aware(datetime.combine(today, datetime.min.time()))
        today_end = timezone.make_aware(datetime.combine(today, datetime.max.time()))
        
        # Get this week's dates
        week_start = today_start - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6, hours=23, minutes=59, seconds=59)
        
        # Faculty appointments
        faculty_appointments = Appointment.objects.filter(faculty=user)
        
        # Today's appointments
        today_appointments = faculty_appointments.filter(
            schedule__gte=today_start,
            schedule__lte=today_end
        ).count()
        
        # Upcoming appointments (this week, excluding today)
        tomorrow = today + timedelta(days=1)
        tomorrow_start = timezone.make_aware(datetime.combine(tomorrow, datetime.min.time()))
        upcoming_appointments = faculty_appointments.filter(
            schedule__gte=tomorrow_start,
            schedule__lte=week_end,
            status='scheduled'
        ).count()
        
        # Completed today
        completed_today = faculty_appointments.filter(
            schedule__gte=today_start,
            schedule__lte=today_end,
            status__in=['completed', 'claimed']
        ).count()
        
        # Total students advised (unique students from appointments)
        total_students = faculty_appointments.values('student').distinct().count()
        
        return Response({
            'today_appointments': today_appointments,
            'upcoming_appointments': upcoming_appointments,
            'completed_today': completed_today,
            'total_students': total_students
        })
        
    except Exception as e:
        logger.error(f"Error fetching faculty dashboard stats: {str(e)}")
        return Response(
            {"error": f"Failed to fetch dashboard stats: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_students(request):
    """Get list of students that faculty has advised/has appointments with"""
    try:
        user = request.user
        
        if not check_faculty_permission(user):
            return Response(
                {"error": "Only faculty can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get unique students from appointments
        student_ids = Appointment.objects.filter(
            faculty=user
        ).values_list('student_id', flat=True).distinct()
        
        students = User.objects.filter(id__in=student_ids, role='student')
        
        # Get appointment count for each student
        students_data = []
        for student in students:
            appointment_count = Appointment.objects.filter(
                faculty=user,
                student=student
            ).count()
            
            students_data.append({
                'id': student.id,
                'name': f"{student.first_name} {student.last_name}".strip() or student.email,
                'student_id': getattr(student, 'student_id', f"STU-{student.id}"),
                'email': student.email,
                'course': getattr(student, 'course', 'N/A'),
                'year': getattr(student, 'year_level', 'N/A'),
                'appointments': appointment_count
            })
        
        return Response(students_data)
        
    except Exception as e:
        logger.error(f"Error fetching faculty students: {str(e)}")
        return Response(
            {"error": f"Failed to fetch students: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_reports(request):
    """Get activity reports for faculty"""
    try:
        user = request.user
        
        if not check_faculty_permission(user):
            return Response(
                {"error": "Only faculty can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get date range from query params
        date_range = request.GET.get('date_range', 'thisMonth')
        
        # Calculate date ranges
        today = timezone.now().date()
        if date_range == 'thisWeek':
            start_date = today - timedelta(days=today.weekday())
        elif date_range == 'thisMonth':
            start_date = today.replace(day=1)
        elif date_range == 'thisYear':
            start_date = today.replace(month=1, day=1)
        else:
            start_date = today.replace(month=1, day=1)
        
        start_datetime = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
        
        # Get appointments in date range
        appointments = Appointment.objects.filter(
            faculty=user,
            created_at__gte=start_datetime
        )
        
        # Calculate stats
        total_appointments = appointments.count()
        completed = appointments.filter(status__in=['completed', 'claimed']).count()
        cancelled = appointments.filter(status='cancelled').count()
        students = appointments.values('student').distinct().count()
        
        return Response({
            'total_appointments': total_appointments,
            'completed': completed,
            'cancelled': cancelled,
            'students': students,
            'date_range': date_range
        })
        
    except Exception as e:
        logger.error(f"Error fetching faculty reports: {str(e)}")
        return Response(
            {"error": f"Failed to fetch reports: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_notifications(request):
    """Get notifications for faculty"""
    try:
        user = request.user
        
        if not check_faculty_permission(user):
            return Response(
                {"error": "Only faculty can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get recent appointments (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        recent_appointments = Appointment.objects.filter(
            faculty=user,
            created_at__gte=week_ago
        ).order_by('-created_at')[:20]
        
        notifications = []
        for apt in recent_appointments:
            # New appointment notification
            if apt.status == 'scheduled':
                notifications.append({
                    'id': f"apt_{apt.id}",
                    'title': 'New Appointment Request',
                    'message': f"{apt.student.first_name} {apt.student.last_name} requested an appointment for {apt.schedule.strftime('%Y-%m-%d at %H:%M')}",
                    'timestamp': apt.created_at.isoformat(),
                    'isRead': False,
                    'type': 'info'
                })
            # Completed appointment notification
            elif apt.status in ['completed', 'claimed']:
                notifications.append({
                    'id': f"apt_{apt.id}",
                    'title': 'Appointment Completed',
                    'message': f"Your appointment with {apt.student.first_name} {apt.student.last_name} has been completed",
                    'timestamp': apt.updated_at.isoformat(),
                    'isRead': True,
                    'type': 'success'
                })
        
        return Response({'notifications': notifications})
        
    except Exception as e:
        logger.error(f"Error fetching faculty notifications: {str(e)}")
        return Response(
            {"error": f"Failed to fetch notifications: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

