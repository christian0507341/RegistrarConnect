"""
Registrar-specific views for document request management
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Count
from django.utils import timezone
from .models import DocumentRequest, DocumentRequestAction
from .serializers import DocumentRequestWebSerializer, DocumentRequestSerializer
from backend.appointments.models import Appointment
from backend.appointments.services import AutomaticAppointmentService
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_approvals(request):
    """
    Get document requests that have payment approved and are waiting for registrar approval
    Only returns requests where payment is ACTUALLY approved (checked via action records)
    """
    if request.user.role not in ['registrar', 'admin']:
        return Response(
            {"error": "Only registrar can access pending approvals"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Get all document requests
        all_requests = DocumentRequest.objects.all().select_related('student_id')
        
        # Filter to only those with payment approved but document not approved
        pending_requests = []
        for req in all_requests:
            status_info = req.get_current_status_from_actions()
            logger.info(f"Request {req.id}: payment_approved={status_info.get('payment_approved')}, document_approved={status_info.get('document_approved')}, status={req.status}")
            
            # Only include if payment is approved AND document is not yet approved
            if status_info.get('payment_approved') and not status_info.get('document_approved'):
                pending_requests.append(req)
        
        logger.info(f"Found {len(pending_requests)} pending approvals out of {len(all_requests)} total requests")
        
        # Serialize the filtered requests
        serializer = DocumentRequestSerializer(pending_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error fetching pending approvals: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_document_request(request, pk):
    """
    Registrar approves a document request and triggers auto-scheduling
    """
    if request.user.role != 'registrar':
        return Response(
            {"error": "Only registrar can approve document requests"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doc_request = DocumentRequest.objects.get(pk=pk)
        
        # Check if payment is approved by looking at action records
        current_status = doc_request.get_current_status_from_actions()
        if not current_status.get('payment_approved'):
            return Response(
                {"error": "Payment must be approved before document approval"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update document status
        doc_request.status = 'ready_to_claim'
        doc_request.save()
        
        # Create action log with both payment and document approved
        DocumentRequestAction.objects.create(
            request=doc_request,
            actor=request.user,
            action='status_changed',
            from_status='pending',
            to_status='ready_to_claim',
            payment=True,  # Payment was already approved
            document=True,  # Document is now approved
            notes="Document approved by registrar. Ready for claiming."
        )
        
        # Trigger automatic appointment scheduling
        try:
            appointment = AutomaticAppointmentService.schedule_appointment_for_ready_request(doc_request)
            
            if appointment:
                logger.info(f"Auto-scheduled appointment {appointment.id} for request {doc_request.id}")
                return Response({
                    "message": "Document request approved and appointment scheduled successfully",
                    "request_id": doc_request.id,
                    "status": doc_request.status,
                    "appointment_id": appointment.id,
                    "appointment_time": appointment.schedule.strftime('%Y-%m-%d %H:%M') if appointment.schedule else None
                }, status=status.HTTP_200_OK)
            else:
                logger.warning(f"No appointment scheduled for request {doc_request.id}")
        except Exception as e:
            logger.error(f"Failed to auto-schedule appointment: {str(e)}")
            # Don't fail the approval if auto-scheduling fails
            # Continue to return success response below
        
        return Response({
            "message": "Document request approved successfully",
            "request_id": doc_request.id,
            "status": doc_request.status
        }, status=status.HTTP_200_OK)
        
    except DocumentRequest.DoesNotExist:
        return Response(
            {"error": "Document request not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error approving document request: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_document_request(request, pk):
    """
    Registrar rejects a document request
    """
    if request.user.role != 'registrar':
        return Response(
            {"error": "Only registrar can reject document requests"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doc_request = DocumentRequest.objects.get(pk=pk)
        reason = request.data.get('reason', '')
        
        if not reason:
            return Response(
                {"error": "Rejection reason is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status
        doc_request.status = 'rejected'
        doc_request.notes = f"Rejected by registrar: {reason}"
        doc_request.save()
        
        # Create action log
        DocumentRequestAction.objects.create(
            request=doc_request,
            actor=request.user,
            action='status_changed',
            from_status=doc_request.status,
            to_status='rejected',
            notes=reason
        )
        
        return Response({
            "message": "Document request rejected successfully",
            "request_id": doc_request.id
        }, status=status.HTTP_200_OK)
        
    except DocumentRequest.DoesNotExist:
        return Response(
            {"error": "Document request not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error rejecting document request: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def registrar_dashboard_stats(request):
    """
    Get dashboard statistics for registrar
    """
    if request.user.role != 'registrar':
        return Response(
            {"error": "Only registrar can access these stats"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        today = timezone.now().date()
        
        # Count pending approvals (payment approved, waiting for document approval)
        # Get requests where latest action has payment=True but document=False
        pending_approvals = 0
        for req in DocumentRequest.objects.all():
            status_info = req.get_current_status_from_actions()
            if status_info.get('payment_approved') and not status_info.get('document_approved'):
                pending_approvals += 1
        
        # Count ready for claiming
        ready_for_claiming = DocumentRequest.objects.filter(
            status='ready_to_claim'
        ).count()
        
        # Count today's processed
        processed_today = DocumentRequestAction.objects.filter(
            actor=request.user,
            action__in=['document_approved', 'document_rejected'],
            created_at__date=today
        ).count()
        
        # Count scheduled appointments
        scheduled_appointments = Appointment.objects.filter(
            status='scheduled'
        ).count()
        
        # Today's claiming appointments
        today_appointments = Appointment.objects.filter(
            scheduled_date=today,
            status='scheduled'
        ).count()
        
        return Response({
            "pending_approvals": pending_approvals,
            "ready_for_claiming": ready_for_claiming,
            "processed_today": processed_today,
            "scheduled_appointments": scheduled_appointments,
            "today_appointments": today_appointments
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error fetching registrar stats: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

