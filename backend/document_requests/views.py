from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from django.db import transaction
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
    existing = DocumentRequest.objects.filter(
        student_id=request.user,
        document_type=request.data.get("document_type"),
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
            DocumentRequestAction.objects.create(
                request=instance,
                actor=request.user,
                action="payment_method_set",
                from_status=prev,
                to_status="awaiting_payment",
                notes=f"Payment method: {payment_method}",
            )

        # 2) receipt reference -> pending (from draft/awaiting_payment)
        if receipt_reference and instance.status in ["draft", "awaiting_payment"]:
            prev = instance.status
            instance.status = "pending"
            instance.receipt_reference = receipt_reference
            instance.save(update_fields=["status", "receipt_reference"])
            DocumentRequestAction.objects.create(
                request=instance,
                actor=request.user,
                action="receipt_submitted",
                from_status=prev,
                to_status="pending",
                notes=f"Receipt reference: {receipt_reference}",
            )

        # 3) initial creation (no payment/no receipt)
        if not payment_method and not receipt_reference and existing is None:
            DocumentRequestAction.objects.create(
                request=instance,
                actor=request.user,
                action="created",
                from_status=None,
                to_status="draft",
                notes=instance.notes or "",
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
        if prev in ("draft", "awaiting_payment") and doc.status == "pending":
            DocumentRequestAction.objects.create(
                request=doc,
                actor=request.user,
                action="receipt_uploaded",
                from_status=prev,
                to_status="pending",
                notes="Receipt image uploaded",
            )
        ch = doc.chat_history.first()
        if ch and ch.status != doc.status:
            ch.status = doc.status
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
            old_status = instance.status
            payment = self.request.data.get('payment', False)
            document = self.request.data.get('document', False)
            schedule = self.request.data.get('schedule')

            updated = serializer.save(processed_by_id=self.request.user)
            action = DocumentRequestAction.objects.create(
                request=updated,
                actor=self.request.user,
                action='status_changed',
                from_status=old_status,
                to_status=updated.status,
                notes=self.request.data.get('notes', ''),
                payment=payment,
                document=document
            )

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
