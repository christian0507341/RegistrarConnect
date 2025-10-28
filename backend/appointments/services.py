from django.utils import timezone
from django.db import transaction
from .models import Appointment, AppointmentAction, AppointmentSettings
import logging

logger = logging.getLogger(__name__)

class AutomaticAppointmentService:
    """Service for automatically scheduling appointments when documents are ready"""
    
    @staticmethod
    def schedule_appointment_for_ready_request(document_request):
        """
        Automatically schedule an appointment when a document request is ready to claim
        """
        try:
            with transaction.atomic():
                # Check if appointment already exists for this request
                existing_appointment = Appointment.objects.filter(
                    document_request=document_request,
                    status='scheduled'
                ).first()
                
                if existing_appointment:
                    logger.info(f"Appointment already exists for request {document_request.id}")
                    return existing_appointment
                
                # Get the next available slot
                next_slot = Appointment.get_next_available_slot()
                
                # Create the appointment
                appointment = Appointment.objects.create(
                    student=document_request.student_id,
                    document_request=document_request,
                    purpose=f"Claim {document_request.document_type} document",
                    schedule=next_slot,
                    status='scheduled'
                )
                
                # Create action record
                AppointmentAction.objects.create(
                    appointment=appointment,
                    action='scheduled',
                    to_status='scheduled',
                    notes=f"Automatically scheduled for {next_slot.strftime('%Y-%m-%d %H:%M')}"
                )
                
                logger.info(f"Automatically scheduled appointment {appointment.id} for request {document_request.id} at {next_slot}")
                return appointment
                
        except Exception as e:
            logger.error(f"Error scheduling appointment for request {document_request.id}: {str(e)}")
            raise
    
    @staticmethod
    def check_and_schedule_ready_requests():
        """
        Check for document requests that are ready to claim and schedule appointments
        """
        from backend.document_requests.models import DocumentRequest
        
        scheduled_count = 0  # Initialize at the top level
        
        try:
            logger.info("Checking for ready document requests")
            
            # Find document requests that are ready to claim but don't have appointments
            ready_requests = DocumentRequest.objects.filter(
                status='ready_to_claim'
            ).exclude(
                appointments__status='scheduled'
            )
            
            logger.info(f"Found {ready_requests.count()} ready requests without appointments")
            
            for request in ready_requests:
                try:
                    logger.info(f"Processing request {request.id} for student {request.student_id.email}")
                    AutomaticAppointmentService.schedule_appointment_for_ready_request(request)
                    scheduled_count += 1
                    logger.info(f"Successfully scheduled appointment for request {request.id}")
                except Exception as e:
                    logger.error(f"Failed to schedule appointment for request {request.id}: {str(e)}", exc_info=True)
                    continue
            
            logger.info(f"Scheduled {scheduled_count} appointments for ready requests")
            
        except Exception as e:
            logger.error(f"Error checking ready requests: {str(e)}", exc_info=True)
            # Don't raise, just log the error and return the count so far
        
        return scheduled_count
    
    @staticmethod
    def get_appointment_statistics():
        """
        Get statistics about appointments
        """
        from django.db.models import Count
        from datetime import date, timedelta
        
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        week_from_now = today + timedelta(days=7)
        
        stats = {
            'today': Appointment.objects.filter(
                schedule__date=today,
                status='scheduled'
            ).count(),
            'tomorrow': Appointment.objects.filter(
                schedule__date=tomorrow,
                status='scheduled'
            ).count(),
            'this_week': Appointment.objects.filter(
                schedule__date__range=[today, week_from_now],
                status='scheduled'
            ).count(),
            'total_scheduled': Appointment.objects.filter(
                status='scheduled'
            ).count(),
            'max_per_day': AppointmentSettings.get_settings().max_appointments_per_day,
        }
        
        return stats
