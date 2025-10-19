from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from .models import DocumentRequest, DocumentRequestAction
from .serializers import (
    DocumentRequestSerializer,
    DocumentRequestStatusSerializer,
    DocumentRequestCancelSerializer,
    DocumentRequestWebSerializer,
    ReceiptUploadSerializer,
)
from backend.common.permissions import IsFaculty
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from backend.appointments.models import Appointment, AppointmentAction
from backend.ai.models import ChatHistory
import logging

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def document_requests_web(request):
    user = request.user
    if hasattr(user, 'role') and user.role == 'faculty':
        queryset = DocumentRequest.objects.all().select_related('student_id')
    else:
        queryset = DocumentRequest.objects.filter(student_id=user).select_related('student_id')
    serializer = DocumentRequestWebSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def document_request_history(request):
    requests = DocumentRequest.objects.filter(student_id=request.user)
    serializer = DocumentRequestSerializer(requests, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def document_request_status(request, pk):
    try:
        doc = DocumentRequest.objects.get(pk=pk, student_id=request.user)
    except DocumentRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)
    return Response({"id": doc.id, "status": doc.status, "document_type": doc.document_type, "purpose": doc.purpose})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def document_request_cancel(request, pk):
    try:
        doc = DocumentRequest.objects.get(pk=pk, student_id=request.user)
    except DocumentRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)
    if doc.status not in ['draft', 'confirming', 'awaiting_payment']:
        return Response({"error": "Only requests before payment can be cancelled."}, status=400)

    serializer = DocumentRequestCancelSerializer(doc, data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        if doc.chat_history:
            doc.chat_history.status = 'cancelled'
            doc.chat_history.save(update_fields=["status", "updated_at"])
        return Response({"message": "Request cancelled successfully"})
    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_document_request(request):
    """
    Creates or updates the student's in-flight request for a given document_type.
    If a 'conversation_id' is provided, link THAT ChatHistory row; else, link the most
    recent unlinked ChatHistory for this user.
    """
    document_type = request.data.get("document_type")
    semester = request.data.get("semester")
    school_year = request.data.get("school_year")
    purpose = request.data.get("purpose")
    
    # Check for existing active requests of the same type
    active_statuses = ['draft', 'confirming', 'awaiting_payment', 'pending', 'on_process']
    existing_active = DocumentRequest.objects.filter(
        student_id=request.user,
        document_type=document_type,
        status__in=active_statuses
    )
    
    # For COG and COE, also check semester and school year
    if document_type in ['COG', 'COE'] and semester and school_year:
        existing_active = existing_active.filter(
            semester=semester,
            school_year=school_year
        )
    
    # For OTR and OTHERS, check if any active request exists
    if document_type in ['OTR', 'OTHERS']:
        existing_active = existing_active.filter(
            purpose=purpose if purpose else Q(purpose__isnull=True)
        )
    
    if existing_active.exists():
        existing_request = existing_active.first()
        return Response({
            "error": "duplicate_request",
            "message": f"You already have a {document_type} request in progress.",
            "existing_request": {
                "id": existing_request.id,
                "document_type": existing_request.document_type,
                "status": existing_request.status,
                "requested_at": existing_request.requested_at,
                "semester": existing_request.semester,
                "school_year": existing_request.school_year,
                "purpose": existing_request.purpose
            },
            "status_message": f"Your {existing_request.document_type} request is currently {existing_request.get_status_display().lower()}. Please wait for it to be completed before submitting another request."
        }, status=status.HTTP_409_CONFLICT)

    # Check for existing draft request to update
    existing = DocumentRequest.objects.filter(
        student_id=request.user,
        document_type=document_type,
        status="draft"
    ).first()

    serializer = (
        DocumentRequestSerializer(existing, data=request.data, partial=True, context={"request": request})
        if existing else
        DocumentRequestSerializer(data=request.data, context={"request": request})
    )

    if not serializer.is_valid():
        logger.error(f"Validation failed for create_document_request: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        instance = serializer.save(student_id=request.user)

        payment_method = request.data.get("payment_method")
        receipt_reference = request.data.get("receipt_reference")

        # 1) payment method -> awaiting_payment (from draft)
        if payment_method and instance.status == "draft":
            prev = instance.status
            instance.status = "awaiting_payment"
            instance.save(update_fields=["status"])
            # Check if action already exists to prevent duplicates
            existing_action = DocumentRequestAction.objects.filter(
                request=instance,
                action="payment_method_set",
                from_status=prev,
                to_status="awaiting_payment"
            ).first()
            if not existing_action:
                DocumentRequestAction.objects.create(
                    request=instance,
                    actor=request.user,
                    action="payment_method_set",
                    from_status=prev,
                    to_status="awaiting_payment",
                    notes=f"Payment method set to {payment_method}",
                )

        # 2) receipt reference -> pending (from draft/awaiting_payment)
        if receipt_reference and instance.status in ["draft", "awaiting_payment"]:
            prev = instance.status
            instance.status = "pending"
            instance.receipt_reference = receipt_reference
            instance.save(update_fields=["status", "receipt_reference"])
            # Check if action already exists to prevent duplicates
            existing_action = DocumentRequestAction.objects.filter(
                request=instance,
                action="receipt_submitted",
                from_status=prev,
                to_status="pending"
            ).first()
            if not existing_action:
                DocumentRequestAction.objects.create(
                    request=instance,
                    actor=request.user,
                    action="receipt_submitted",
                    from_status=prev,
                    to_status="pending",
                    notes=f"Receipt submitted with reference: {receipt_reference}",
                )

        # 3) initial creation (no payment/no receipt)
        if not payment_method and not receipt_reference and existing is None:
            # Check if action already exists to prevent duplicates
            existing_action = DocumentRequestAction.objects.filter(
                request=instance,
                action="created",
                from_status=None,
                to_status="draft"
            ).first()
            if not existing_action:
                DocumentRequestAction.objects.create(
                    request=instance,
                    actor=request.user,
                    action="created",
                    from_status=None,
                    to_status="draft",
                    notes="Document request created",
                )

        # ---- Link ChatHistory ----
        conv_id = request.data.get("conversation_id")
        chat = None
        if conv_id:
            chat = ChatHistory.objects.filter(
                user_id=str(request.user.id),
                conversation_id=conv_id
            ).first()

        if not chat:
            # Prefer the latest unlinked conversation
            chat = (
                ChatHistory.objects
                .filter(user_id=str(request.user.id), document_request__isnull=True)
                .order_by("-updated_at", "-created_at")
                .first()
            )

        if chat:
            chat.document_request = instance
            chat.status = instance.status
            chat.save(update_fields=["document_request", "status", "updated_at"])
        else:
            # Create a new row if nothing to link
            chat_id = f"{request.user.id}_{instance.id}_{instance.requested_at}"
            chat = ChatHistory.objects.create(
                user_id=str(request.user.id),
                conversation_id=chat_id,
                status=instance.status,
                document_request=instance,
            )

        logger.info(f"DocumentRequest {instance.id} saved; linked ChatHistory {chat.id}")
        return Response(DocumentRequestSerializer(instance, context={"request": request}).data, status=status.HTTP_201_CREATED)


# ---- Upload receipt image (mobile flow) ----
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_receipt(request, pk):
    """
    POST multipart/form-data:
      - receipt_image: <file>

    Effect:
      - Saves file to DocumentRequest.receipt_image
      - If status ∈ {draft, awaiting_payment} -> moves to 'pending'
      - Logs DocumentRequestAction('receipt_uploaded' from <prev> to 'pending')
      - Syncs linked ChatHistory.status
    """
    try:
        doc = DocumentRequest.objects.get(pk=pk, student_id=request.user)
    except DocumentRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)

    serializer = ReceiptUploadSerializer(doc, data=request.data, context={"request": request})
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    with transaction.atomic():
        prev = doc.status
        serializer.save()
        
        # Move to pending if not yet submitted
        if doc.status in ["draft", "awaiting_payment"]:
            doc.status = "pending"
            doc.save(update_fields=["status"])
            
            # Log action with from/to (check for duplicates)
            existing_action = DocumentRequestAction.objects.filter(
                request=doc,
                action="receipt_uploaded",
                from_status=prev,
                to_status="pending"
            ).first()
            if not existing_action:
                DocumentRequestAction.objects.create(
                    request=doc,
                    actor=request.user,
                    action="receipt_uploaded",
                    from_status=prev,
                    to_status="pending",
                    notes="Receipt image uploaded",
                )
            
            # Sync linked ChatHistory
            ch = doc.chat_history.first()
            if ch:
                ch.status = "pending"
                ch.save(update_fields=["status", "updated_at"])

    return Response({"id": doc.id, "status": doc.status}, status=200)


class DocumentRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'faculty':
            return DocumentRequest.objects.all().select_related('student_id', 'processed_by_id')
        return DocumentRequest.objects.filter(student_id=user).select_related('student_id', 'processed_by_id')

    def perform_create(self, serializer):
        with transaction.atomic():
            instance = serializer.save(student_id=self.request.user)
            DocumentRequestAction.objects.create(
                request=instance,
                actor=self.request.user,
                action='created',
                from_status=None,
                to_status=instance.status,
                notes=instance.notes or ''
            )
            # Prefer latest chat without a link
            chat = (
                ChatHistory.objects
                .filter(user_id=str(self.request.user.id), document_request__isnull=True)
                .order_by("-updated_at", "-created_at")
                .first()
            )
            if chat:
                chat.document_request = instance
                chat.status = instance.status
                chat.save(update_fields=["document_request", "status", "updated_at"])
            else:
                chat_id = f"{self.request.user.id}_{instance.id}_{instance.requested_at}"
                ChatHistory.objects.create(
                    user_id=str(self.request.user.id),
                    conversation_id=chat_id,
                    status=instance.status,
                    document_request=instance,
                )


class DocumentRequestDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DocumentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'faculty':
            return DocumentRequest.objects.all().select_related('student_id', 'processed_by_id')
        return DocumentRequest.objects.filter(student_id=user).select_related('student_id', 'processed_by_id')


class DocumentRequestStatusUpdateView(generics.UpdateAPIView):
    queryset = DocumentRequest.objects.all().select_related('student_id', 'processed_by_id')
    serializer_class = DocumentRequestStatusSerializer
    permission_classes = [IsAuthenticated, IsFaculty]
    http_method_names = ['post', 'put', 'patch']

    def perform_update(self, serializer):
        with transaction.atomic():
            instance = self.get_object()
            old_status = instance.status  # Capture BEFORE any changes
            
            payment = self.request.data.get('payment', False)
            document = self.request.data.get('document', False)
            schedule = self.request.data.get('schedule')
            notes = self.request.data.get('notes', '')
            
            # Determine new status based on checkbox logic
            new_status = old_status  # default: no change
            
            if payment and document:
                # Both checked: document is ready to claim
                new_status = 'ready_to_claim'
            elif payment and not document:
                # Only payment approved: processing document
                new_status = 'on_process'
            elif old_status == 'pending' and not payment:
                # Faculty can keep it pending or reject
                new_status = self.request.data.get('status', 'pending')
            
            # Update instance
            instance.status = new_status
            instance.processed_by_id = self.request.user
            instance.save(update_fields=['status', 'processed_by_id'])
            
            # Create action log with proper from/to
            action = DocumentRequestAction.objects.create(
                request=instance,
                actor=self.request.user,
                action='status_changed',
                from_status=old_status,
                to_status=new_status,
                notes=notes,
                payment=payment,
                document=document
            )
            
            # Sync ChatHistory status
            chat = instance.chat_history.first()
            if chat:
                chat.status = new_status
                chat.save(update_fields=["status", "updated_at"])
            
            # Handle appointment scheduling when ready_to_claim
            if new_status == 'ready_to_claim' and schedule:
                conflict = Appointment.objects.filter(
                    faculty=self.request.user,
                    schedule=schedule,
                    status='scheduled'
                ).exists()
                if conflict:
                    raise ValidationError("This schedule is already taken.")
                Appointment.objects.create(
                    student=instance.student_id,
                    faculty=self.request.user,
                    document_request=instance,
                    purpose=f"Claim {instance.document_type}",
                    schedule=schedule,
                    status='scheduled'
                )
                AppointmentAction.objects.create(
                    appointment=Appointment.objects.get(document_request=instance),
                    actor=self.request.user,
                    action='scheduled',
                    to_status='scheduled',
                    notes=f"Scheduled for {schedule}"
                )
            
            return Response({
                "status": new_status,
                "from_status": old_status,
                "to_status": new_status
            })

            if payment and not document:
                updated.status = 'on_process'
                updated.save()
                action.to_status = 'on_process'
                action.save()
                if updated.chat_history:
                    updated.chat_history.status = 'on_process'
                    updated.chat_history.save(update_fields=["status", "updated_at"])
            elif payment and document:
                updated.status = 'ready_to_claim'
                updated.save()
                action.to_status = 'ready_to_claim'
                action.save()
                if updated.chat_history:
                    updated.chat_history.status = 'ready_to_claim'
                    updated.chat_history.save(update_fields=["status", "updated_at"])
                if schedule:
                    conflict = Appointment.objects.filter(
                        faculty=self.request.user,
                        schedule=schedule,
                        status='scheduled'
                    ).exists()
                    if conflict:
                        raise ValidationError("This schedule is already taken.")
                    Appointment.objects.create(
                        student=instance.student_id,
                        faculty=self.request.user,
                        document_request=instance,
                        purpose=f"Claim {instance.document_type}",
                        schedule=schedule,
                        status='scheduled'
                    )
                    AppointmentAction.objects.create(
                        appointment=Appointment.objects.get(document_request=instance),
                        actor=self.request.user,
                        action='scheduled',
                        to_status='scheduled',
                        notes=f"Scheduled for {schedule}"
                    )
            return Response({"status": updated.status})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_transaction_status(request):
    """
    Get student transaction status from document_requests_documentrequest and 
    document_requests_documentrequestaction tables.
    Returns document_type, status, payment, document approval status for the logged-in student.
    """
    logger.info(f"Student transaction status endpoint called by user: {request.user.id}")
    try:
        # Get all document requests for the current student
        document_requests = DocumentRequest.objects.filter(student_id=request.user)
        
        transactions = []
        
        for doc_request in document_requests:
            # Get the latest action for this request
            latest_action = DocumentRequestAction.objects.filter(
                request=doc_request,
                actor=request.user
            ).order_by('-created_at').first()
            
            # Determine approval status based on payment and document fields
            payment_approved = False
            document_approved = False
            
            if latest_action:
                payment_approved = latest_action.payment
                document_approved = latest_action.document
            
            # Determine overall status
            if doc_request.status == 'approved' and payment_approved and document_approved:
                overall_status = 'approved'
            elif doc_request.status == 'pending':
                if payment_approved and not document_approved:
                    overall_status = 'payment_approved_document_pending'
                elif not payment_approved and document_approved:
                    overall_status = 'document_approved_payment_pending'
                else:
                    overall_status = 'pending_review'
            else:
                overall_status = doc_request.status
            
            transaction = {
                'id': doc_request.id,
                'document_type': doc_request.document_type,
                'status': overall_status,
                'payment_approved': payment_approved,
                'document_approved': document_approved,
                'requested_at': doc_request.requested_at.strftime('%Y-%m-%d'),
                'last_updated': latest_action.created_at.strftime('%Y-%m-%d') if latest_action else doc_request.requested_at.strftime('%Y-%m-%d'),
                'original_status': doc_request.status,
                'purpose': doc_request.purpose,
                'semester': doc_request.semester,
                'school_year': doc_request.school_year,
            }
            
            transactions.append(transaction)
        
        # Sort by requested_at descending (newest first)
        transactions.sort(key=lambda x: x['requested_at'], reverse=True)
        
        return Response({
            'transactions': transactions,
            'total_count': len(transactions)
        })
        
    except Exception as e:
        logger.error(f"Error fetching student transactions: {str(e)}")
        return Response(
            {"error": "Failed to fetch transaction status"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_notifications(request):
    """
    Get student notifications based on their document requests and actions.
    Returns notifications for status changes, approvals, and announcements.
    """
    logger.info(f"Student notifications endpoint called by user: {request.user.id}")
    try:
        # Get all document requests for the current student
        document_requests = DocumentRequest.objects.filter(student_id=request.user)
        
        notifications = []
        
        for doc_request in document_requests:
            # Get the latest action for this request
            latest_action = DocumentRequestAction.objects.filter(
                request=doc_request,
                actor=request.user
            ).order_by('-created_at').first()
            
            if latest_action:
                # Create notification based on action type
                notification = {
                    'id': f"doc_{doc_request.id}_{latest_action.id}",
                    'title': _getNotificationTitle(doc_request, latest_action),
                    'message': _getNotificationMessage(doc_request, latest_action),
                    'time': _getTimeAgo(latest_action.created_at),
                    'icon': _getNotificationIcon(latest_action.action),
                    'color': _getNotificationColor(latest_action.action),
                    'type': 'document_request',
                    'document_type': doc_request.document_type,
                    'status': doc_request.status,
                }
                notifications.append(notification)
        
        # Add system announcements (you can expand this)
        announcements = [
            {
                'id': 'announcement_1',
                'title': 'System Maintenance',
                'message': 'The system will be under maintenance on Sunday, 2:00 AM - 4:00 AM.',
                'time': '2d ago',
                'icon': 'maintenance',
                'color': 'orange',
                'type': 'announcement',
            }
        ]
        
        # Combine and sort notifications
        all_notifications = notifications + announcements
        all_notifications.sort(key=lambda x: x['time'], reverse=True)
        
        return Response({
            'notifications': all_notifications,
            'total_count': len(all_notifications)
        })
        
    except Exception as e:
        logger.error(f"Error fetching student notifications: {str(e)}")
        return Response(
            {"error": "Failed to fetch notifications"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _getNotificationTitle(doc_request, action):
    """Generate notification title based on action type"""
    action_titles = {
        'created': 'Document Request Created',
        'submitted': 'Document Request Submitted',
        'payment_method_set': 'Payment Method Set',
        'receipt_submitted': 'Receipt Submitted',
        'receipt_uploaded': 'Receipt Uploaded',
        'status_changed': 'Status Updated',
        'scheduled': 'Appointment Scheduled',
        'updated': 'Request Updated',
    }
    return action_titles.get(action.action, 'Document Request Updated')


def _getNotificationMessage(doc_request, action):
    """Generate notification message based on action type"""
    if action.action == 'status_changed':
        return f"Your {doc_request.document_type} status changed from {action.from_status} to {action.to_status}."
    elif action.action == 'scheduled':
        return f"Your {doc_request.document_type} appointment has been scheduled."
    elif action.action == 'receipt_uploaded':
        return f"Receipt uploaded for your {doc_request.document_type} request."
    else:
        return f"Your {doc_request.document_type} request has been {action.action.replace('_', ' ')}."


def _getTimeAgo(created_at):
    """Convert datetime to human-readable time ago"""
    from django.utils import timezone
    now = timezone.now()
    diff = now - created_at
    
    if diff.days > 0:
        return f"{diff.days}d ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours}h ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes}m ago"
    else:
        return "Just now"


def _getNotificationIcon(action_type):
    """Get appropriate icon for notification type"""
    icon_map = {
        'created': 'add_circle',
        'submitted': 'send',
        'payment_method_set': 'payment',
        'receipt_submitted': 'receipt',
        'receipt_uploaded': 'upload',
        'status_changed': 'update',
        'scheduled': 'event',
        'updated': 'edit',
    }
    return icon_map.get(action_type, 'info')


def _getNotificationColor(action_type):
    """Get appropriate color for notification type"""
    color_map = {
        'created': 'blue',
        'submitted': 'blue',
        'payment_method_set': 'green',
        'receipt_submitted': 'green',
        'receipt_uploaded': 'green',
        'status_changed': 'orange',
        'scheduled': 'purple',
        'updated': 'blue',
    }
    return color_map.get(action_type, 'blue')

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsFaculty])
def view_receipt(request, pk):
    """
    Faculty endpoint to view receipt details for a document request.
    """
    try:
        doc = DocumentRequest.objects.get(pk=pk)
        return Response({
            "receipt_image": doc.receipt_image.url if doc.receipt_image else None,
            "receipt_reference": doc.receipt_reference,
            "payment_method": doc.payment_method,
            "status": doc.status,
            "document_type": doc.document_type,
            "student_name": doc.student_id.get_full_name() if hasattr(doc.student_id, 'get_full_name') else str(doc.student_id)
        })
    except DocumentRequest.DoesNotExist:
        return Response({"error": "Document request not found"}, status=404)
