from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .models import DocumentRequest, DocumentRequestAction, AIChatHistory
from .serializers import DocumentRequestSerializer, DocumentRequestStatusSerializer, DocumentRequestCancelSerializer
from backend.common.permissions import IsFaculty
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from backend.accounts.models import User
from .permissions import IsFaculty
from .serializers import DocumentRequestWebSerializer

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
    print(f"Debug: Querying {requests.query}, Count: {requests.count()}")
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
    if doc.status != 'confirming':
        return Response({"error": "Only requests in Confirming phase can be cancelled."}, status=400)
    serializer = DocumentRequestCancelSerializer(doc, data=request.data)
    if serializer.is_valid():
        serializer.save()
        # Create new chat history for the user
        AIChatHistory.objects.create(
            user_id=request.user,
            conversation_id=f"{request.user.id}_{doc.id}_{doc.created_at}",
            status='draft'
        )
        return Response({"message": "Request cancelled successfully"})
    return Response(serializer.errors, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_document_request(request):
    existing = DocumentRequest.objects.filter(
        student_id=request.user,
        document_type=request.data.get("document_type"),
        status="draft"
    ).first()
    if existing:
        serializer = DocumentRequestSerializer(existing, data=request.data, partial=True)
    else:
        serializer = DocumentRequestSerializer(data=request.data)
    if serializer.is_valid():
        instance = serializer.save(student_id=request.user)
        receipt = request.data.get("receipt_image")
        if receipt and instance.status == "awaiting_payment":
            instance.status = "on_process"
            instance.receipt_image = receipt
            instance.save()
        action = 'submitted' if instance.status == 'draft' else 'created'
        DocumentRequestAction.objects.create(
            request=instance,
            actor=request.user,
            action=action,
            to_status=instance.status,
            notes=instance.notes or ''
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'faculty':
            return DocumentRequest.objects.all().select_related('student_id', 'processed_by_id')
        return DocumentRequest.objects.filter(student_id=user).select_related('student_id', 'processed_by_id')

    def perform_create(self, serializer):
        instance = serializer.save(student_id=self.request.user)
        DocumentRequestAction.objects.create(
            request=instance,
            actor=self.request.user,
            action='created',
            to_status=instance.status,
            notes=instance.notes or ''
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
        instance = self.get_object()
        old_status = instance.status
        updated = serializer.save(processed_by_id=self.request.user)
        payment = self.request.data.get('payment', False)
        document = self.request.data.get('document', False)
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
        elif payment and document:
            updated.status = 'ready_to_claim'
            updated.save()
            action.to_status = 'ready_to_claim'
            action.save()
        return Response({"status": updated.status})