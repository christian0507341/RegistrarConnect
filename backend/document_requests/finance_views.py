"""
Finance-specific views for payment verification and management
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Count, Sum
from django.utils import timezone
from .models import DocumentRequest, DocumentRequestAction
from .serializers import DocumentRequestWebSerializer
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_verifications(request):
    """
    Get payment submissions awaiting Finance verification
    Only returns requests where payment has NOT been approved yet
    """
    if request.user.role not in ['finance', 'admin']:
        return Response(
            {"error": "Only finance can access pending verifications"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Get all document requests that are not in draft/cancelled/rejected status
        all_requests = DocumentRequest.objects.exclude(
            status__in=['draft', 'cancelled', 'rejected', 'ready_to_claim', 'claimed']
        ).select_related('student_id')
        
        # Filter to only those with payment NOT approved yet
        pending_verifications = []
        for req in all_requests:
            # Check if payment is already approved in action records
            payment_approved = DocumentRequestAction.objects.filter(
                request=req,
                action='payment_approved',
                payment=True
            ).exists()
            
            # Only include if payment is NOT yet approved
            if not payment_approved:
                pending_verifications.append(req)
        
        logger.info(f"Found {len(pending_verifications)} pending verifications")
        
        # Serialize and return
        from .serializers import DocumentRequestSerializer
        serializer = DocumentRequestSerializer(pending_verifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error fetching pending verifications: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_payment(request, pk):
    """
    Finance approves a payment
    """
    if request.user.role not in ['finance', 'admin']:
        return Response(
            {"error": "Only finance can approve payments"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        doc_request = DocumentRequest.objects.get(pk=pk)
        
        # Check if already approved
        already_approved = DocumentRequestAction.objects.filter(
            request=doc_request,
            action='payment_approved',
            payment=True
        ).exists()
        
        if already_approved:
            return Response({
                "message": "Payment already approved",
                "request_id": doc_request.id
            }, status=status.HTTP_200_OK)
        
        # Update document status to reflect payment approval
        doc_request.status = 'payment_approved'
        doc_request.processed_by_id = request.user
        doc_request.save()
        
        # Create action log with payment=True (this is the source of truth)
        DocumentRequestAction.objects.create(
            request=doc_request,
            actor=request.user,
            action='payment_approved',
            from_status='pending',
            to_status='payment_approved',
            payment=True,  # THIS IS THE KEY FIELD
            document=False,
            notes="Payment verified and approved by Finance"
        )
        
        logger.info(f"Payment approved for request {doc_request.id} by {request.user.email}")
        
        return Response({
            "message": "Payment approved successfully",
            "request_id": doc_request.id,
            "status": doc_request.status
        }, status=status.HTTP_200_OK)
        
    except DocumentRequest.DoesNotExist:
        return Response(
            {"error": "Document request not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error approving payment: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_payment(request, pk):
    """
    Finance rejects a payment
    """
    if request.user.role != 'finance':
        return Response(
            {"error": "Only finance can reject payments"},
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
        doc_request.payment = False
        doc_request.status = 'awaiting_payment'
        doc_request.notes = f"Payment rejected by finance: {reason}"
        doc_request.save()
        
        # Create action log
        DocumentRequestAction.objects.create(
            request=doc_request,
            actor=request.user,
            action='payment_rejected',
            payment=False,
            notes=reason
        )
        
        return Response({
            "message": "Payment rejected successfully",
            "request_id": doc_request.id
        }, status=status.HTTP_200_OK)
        
    except DocumentRequest.DoesNotExist:
        return Response(
            {"error": "Document request not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error rejecting payment: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def finance_dashboard_stats(request):
    """
    Get dashboard statistics for finance
    """
    if request.user.role != 'finance':
        return Response(
            {"error": "Only finance can access these stats"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        today = timezone.now().date()
        
        # Count pending payment verifications
        pending_verifications = DocumentRequest.objects.filter(
            payment=False,
            status__in=['pending', 'awaiting_payment']
        ).exclude(payment_amount__isnull=True).count()
        
        # Count approved payments today
        approved_today = DocumentRequestAction.objects.filter(
            actor=request.user,
            action='payment_approved',
            created_at__date=today
        ).count()
        
        # Total revenue (approved payments)
        total_revenue = DocumentRequest.objects.filter(
            payment=True
        ).aggregate(total=Sum('payment_amount'))['total'] or 0
        
        # Revenue this month
        month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        revenue_this_month = DocumentRequest.objects.filter(
            payment=True,
            updated_at__gte=month_start
        ).aggregate(total=Sum('payment_amount'))['total'] or 0
        
        # Count rejected payments
        rejected_payments = DocumentRequestAction.objects.filter(
            action='payment_rejected',
            created_at__date=today
        ).count()
        
        return Response({
            "pending_verifications": pending_verifications,
            "approved_today": approved_today,
            "total_revenue": float(total_revenue),
            "revenue_this_month": float(revenue_this_month),
            "rejected_payments": rejected_payments
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error fetching finance stats: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def finance_reports(request):
    """
    Get financial reports with various breakdowns
    """
    if request.user.role != 'finance':
        return Response(
            {"error": "Only finance can access financial reports"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Get approved payments
        approved_payments = DocumentRequest.objects.filter(payment=True)
        
        # Breakdown by document type
        by_document_type = approved_payments.values('document_type').annotate(
            count=Count('id'),
            total_amount=Sum('payment_amount')
        ).order_by('-total_amount')
        
        # Breakdown by payment method
        by_payment_method = approved_payments.values('payment_method').annotate(
            count=Count('id'),
            total_amount=Sum('payment_amount')
        ).order_by('-total_amount')
        
        # Monthly revenue trend (last 6 months)
        monthly_revenue = []
        for i in range(6):
            month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_start = month_start.replace(month=month_start.month - i if month_start.month > i else 12 + month_start.month - i)
            
            if month_start.month > timezone.now().month:
                month_start = month_start.replace(year=month_start.year - 1)
            
            revenue = DocumentRequest.objects.filter(
                payment=True,
                updated_at__year=month_start.year,
                updated_at__month=month_start.month
            ).aggregate(total=Sum('payment_amount'))['total'] or 0
            
            monthly_revenue.append({
                "month": month_start.strftime('%B %Y'),
                "revenue": float(revenue)
            })
        
        return Response({
            "by_document_type": list(by_document_type),
            "by_payment_method": list(by_payment_method),
            "monthly_revenue": monthly_revenue
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error generating finance reports: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

