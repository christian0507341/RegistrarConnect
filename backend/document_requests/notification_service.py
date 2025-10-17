from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from .models import DocumentRequest


class StatusNotificationService:
    """
    Service to send notifications when document request status changes
    """
    
    @staticmethod
    def send_status_update_notification(document_request, old_status, new_status):
        """
        Send notification to student when their document request status changes
        """
        try:
            student = document_request.student
            subject = f"Document Request Status Update - {document_request.document_type}"
            
            # Create email content
            context = {
                'student_name': student.name if hasattr(student, 'name') else student.email,
                'document_type': document_request.get_document_type_display(),
                'old_status': old_status,
                'new_status': new_status,
                'payment_status': document_request.payment,
                'document_status': document_request.document,
                'request_id': document_request.id,
                'purpose': document_request.purpose,
            }
            
            # Create HTML email content
            html_message = render_to_string('document_requests/status_update_email.html', context)
            
            # Send email
            send_mail(
                subject=subject,
                message=f"Your document request status has been updated to: {new_status}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[student.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            return True
            
        except Exception as e:
            print(f"Failed to send notification email: {e}")
            return False
    
    @staticmethod
    def send_completion_notification(document_request):
        """
        Send special notification when document request is completed
        """
        try:
            student = document_request.student
            subject = f"Document Ready for Pickup - {document_request.document_type}"
            
            context = {
                'student_name': student.name if hasattr(student, 'name') else student.email,
                'document_type': document_request.get_document_type_display(),
                'request_id': document_request.id,
                'purpose': document_request.purpose,
            }
            
            html_message = render_to_string('document_requests/completion_email.html', context)
            
            send_mail(
                subject=subject,
                message=f"Your {document_request.document_type} is ready for pickup!",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[student.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            return True
            
        except Exception as e:
            print(f"Failed to send completion notification: {e}")
            return False
