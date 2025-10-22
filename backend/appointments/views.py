from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
from .models import Appointment, AppointmentSettings
from .serializers import AppointmentSerializer, AppointmentSettingsSerializer
from .services import AutomaticAppointmentService
from backend.accounts.models import User
import logging

logger = logging.getLogger(__name__)

class AppointmentListCreateView(generics.ListCreateAPIView):
    """View for listing and creating appointments"""
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Students can only see their own appointments
        # Faculty can see appointments they're assigned to
        # Registrar, Finance, Admin can see all appointments
        if user.role == 'student':
            return Appointment.objects.filter(student=user).order_by('-created_at')
        elif user.role == 'faculty':
            return Appointment.objects.filter(faculty=user).order_by('-created_at')
        elif user.role in ['registrar', 'finance', 'admin']:
            return Appointment.objects.all().order_by('-created_at')
        else:
            # Default: only show appointments where user is involved
            return Appointment.objects.filter(
                models.Q(student=user) | models.Q(faculty=user)
            ).order_by('-created_at')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_appointments(request):
    """Get appointments for the authenticated student"""
    try:
        # Get appointments for the current user (student)
        appointments = Appointment.objects.filter(
            student=request.user
        ).order_by('-created_at')
        
        serializer = AppointmentSerializer(appointments, many=True)
        return Response({
            'appointments': serializer.data
        })
    except Exception as e:
        logger.error(f"Error fetching student appointments: {str(e)}")
        return Response(
            {"error": f"Failed to fetch appointments: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating, and deleting appointments"""
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Students can only see their own appointments
        # Faculty can see appointments they're assigned to
        # Registrar, Finance, Admin can see all appointments
        if user.role == 'student':
            return Appointment.objects.filter(student=user)
        elif user.role == 'faculty':
            return Appointment.objects.filter(faculty=user)
        elif user.role in ['registrar', 'finance', 'admin']:
            # Registrar, Finance, Admin can see all appointments
            return Appointment.objects.all()
        else:
            # Default: only show appointments where user is involved
            return Appointment.objects.filter(
                models.Q(student=user) | models.Q(faculty=user)
            )

class AppointmentStatusUpdateView(generics.UpdateAPIView):
    """View for updating appointment status"""
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Students can only update their own appointments
        # Faculty/Admin can update appointments they're assigned to
        if user.role == 'student':
            return Appointment.objects.filter(student=user)
        elif user.role == 'faculty':
            return Appointment.objects.filter(faculty=user)
        elif user.role == 'admin':
            # Admin can update all appointments
            return Appointment.objects.all()
        else:
            # Default: only show appointments where user is involved
            return Appointment.objects.filter(
                models.Q(student=user) | models.Q(faculty=user)
            )
    
    def patch(self, request, *args, **kwargs):
        """Handle PATCH requests for status updates"""
        try:
            appointment = self.get_object()
            old_status = appointment.status
            
            # Update the appointment status
            new_status = request.data.get('status')
            if new_status:
                appointment.status = new_status
                appointment.save()
                
                # Create action record
                from .models import AppointmentAction
                AppointmentAction.objects.create(
                    appointment=appointment,
                    actor=request.user,
                    action='status_changed',
                    from_status=old_status,
                    to_status=new_status,
                    notes=f"Status changed from {old_status} to {new_status}"
                )
                
                logger.info(f"Appointment {appointment.id} status updated from {old_status} to {new_status} by {request.user.email}")
                
                # If appointment is marked as claimed, update the corresponding document request
                if new_status == 'claimed' and appointment.document_request:
                    try:
                        from backend.document_requests.models import DocumentRequest, DocumentRequestAction
                        
                        # Update document request status from ready_to_claim to claimed
                        doc_request = appointment.document_request
                        old_doc_status = doc_request.status
                        
                        logger.info(f"Updating document request {doc_request.id} from status '{old_doc_status}' to 'claimed'")
                        
                        doc_request.status = 'claimed'
                        doc_request.save()
                        
                        # Create action record for document request
                        action = DocumentRequestAction.objects.create(
                            request=doc_request,
                            actor=request.user,
                            action='status_changed',
                            from_status=old_doc_status,
                            to_status='claimed',
                            notes=f"Document claimed - appointment {appointment.id} marked as claimed"
                        )
                        
                        logger.info(f"Document request {doc_request.id} status updated from '{old_doc_status}' to 'claimed' due to appointment {appointment.id} being claimed")
                        logger.info(f"Created action record {action.id} for document request {doc_request.id}")
                        
                    except Exception as e:
                        logger.error(f"Failed to update document request status: {str(e)}", exc_info=True)
                        # Don't fail the appointment update if document request update fails
                
                # Return updated appointment
                serializer = self.get_serializer(appointment)
                return Response(serializer.data)
            else:
                return Response(
                    {"error": "Status field is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            logger.error(f"Error updating appointment status: {str(e)}")
            return Response(
                {"error": f"Failed to update appointment status: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FacultyListView(generics.ListAPIView):
    """View for listing faculty members"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(role='faculty')
    
    def list(self, request, *args, **kwargs):
        faculty = self.get_queryset()
        data = [{'id': f.id, 'name': f'{f.first_name} {f.last_name}', 'email': f.email} for f in faculty]
        return Response(data)

class AppointmentSettingsView(generics.RetrieveUpdateAPIView):
    """View for managing appointment settings"""
    serializer_class = AppointmentSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return AppointmentSettings.get_settings()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def appointment_statistics(request):
    """Get appointment statistics"""
    try:
        stats = AutomaticAppointmentService.get_appointment_statistics()
        return Response(stats)
    except Exception as e:
        logger.error(f"Error getting appointment statistics: {str(e)}")
        return Response(
            {"error": "Failed to get appointment statistics"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_automatic_scheduling(request):
    """Manually trigger automatic appointment scheduling for ready requests"""
    try:
        logger.info("Starting automatic scheduling trigger")
        scheduled_count = AutomaticAppointmentService.check_and_schedule_ready_requests()
        logger.info(f"Scheduled {scheduled_count} appointments")
        
        # Ensure scheduled_count is a number
        if scheduled_count is None:
            scheduled_count = 0
            logger.warning("scheduled_count was None, setting to 0")
        
        response_data = {
            "message": f"Successfully scheduled {scheduled_count} appointments",
            "scheduled_count": int(scheduled_count)
        }
        
        logger.info(f"Returning response: {response_data}")
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error triggering automatic scheduling: {str(e)}", exc_info=True)
        return Response(
            {"error": f"Failed to trigger automatic scheduling: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_next_available_slot(request):
    """Get the next available appointment slot"""
    try:
        next_slot = Appointment.get_next_available_slot()
        return Response({
            "next_available_slot": next_slot.isoformat(),
            "formatted_time": next_slot.strftime("%Y-%m-%d %H:%M")
        })
    except Exception as e:
        logger.error(f"Error getting next available slot: {str(e)}")
        return Response(
            {"error": "Failed to get next available slot"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_ready_requests(request):
    """Debug endpoint to check ready requests"""
    try:
        from backend.document_requests.models import DocumentRequest
        
        # Get all ready requests
        ready_requests = DocumentRequest.objects.filter(status='ready_to_claim')
        
        # Get ready requests without appointments
        ready_without_appointments = ready_requests.exclude(
            appointments__status='scheduled'
        )
        
        debug_info = {
            "user_info": {
                "id": request.user.id,
                "email": request.user.email,
                "role": getattr(request.user, 'role', 'unknown'),
                "is_staff": request.user.is_staff,
                "is_superuser": request.user.is_superuser,
            },
            "total_ready_requests": ready_requests.count(),
            "ready_without_appointments": ready_without_appointments.count(),
            "ready_requests": [
                {
                    "id": req.id,
                    "student": req.student.email,
                    "document_type": req.document_type,
                    "status": req.status,
                    "has_appointment": req.appointments.filter(status='scheduled').exists()
                }
                for req in ready_requests[:10]  # Limit to first 10
            ]
        }
        
        return Response(debug_info)
    except Exception as e:
        logger.error(f"Error in debug endpoint: {str(e)}", exc_info=True)
        return Response(
            {"error": f"Debug failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )