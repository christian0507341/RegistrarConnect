from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .models import DocumentRequest, DocumentRequestAction
from .serializers import DocumentRequestSerializer, DocumentRequestStatusSerializer
from backend.common.permissions import IsFaculty
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import DocumentRequest

from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import DocumentRequest, DocumentRequestAction
from .serializers import DocumentRequestSerializer, DocumentRequestStatusSerializer, DocumentRequestCancelSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def document_request_history(request):
    """Return all requests for the current user"""
    requests = DocumentRequest.objects.filter(student=request.user)
    serializer = DocumentRequestSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def document_request_status(request, pk):
    """Return status of a single request"""
    try:
        doc = DocumentRequest.objects.get(pk=pk, student=request.user)
    except DocumentRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)
    return Response({"id": doc.id, "status": doc.status, "document_type": doc.document_type, "purpose": doc.purpose})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def document_request_cancel(request, pk):
    """Cancel a pending request"""
    try:
        doc = DocumentRequest.objects.get(pk=pk, student=request.user)
    except DocumentRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)
    serializer = DocumentRequestCancelSerializer(doc, data={"status": "cancelled"}, context={"request": request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({"message": "Request cancelled"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_document_request(request):
    doc_type = request.data.get("doc_type")
    semester = request.data.get("semester")
    sy = request.data.get("school_year")

    if not doc_type:
        return Response({"error": "doc_type is required"}, status=status.HTTP_400_BAD_REQUEST)

    doc_request = DocumentRequest.objects.create(
        user=request.user,
        doc_type=doc_type,
        semester=semester,
        school_year=sy,
        status="pending"
    )
    return Response({
        "id": doc_request.id,
        "doc_type": doc_request.doc_type,
        "status": doc_request.status
    }, status=status.HTTP_201_CREATED)

class DocumentRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'faculty':
            return DocumentRequest.objects.all().select_related('student', 'processed_by')
        return DocumentRequest.objects.filter(student=user).select_related('student', 'processed_by')

    def perform_create(self, serializer):
        instance = serializer.save(student=self.request.user)
        DocumentRequestAction.objects.create(
            request=instance,
            actor=self.request.user,
            action='created',
            to_status=instance.status,
            notes=instance.purpose or ''
        )

class DocumentRequestDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DocumentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'faculty':
            return DocumentRequest.objects.all().select_related('student', 'processed_by')
        return DocumentRequest.objects.filter(student=user).select_related('student', 'processed_by')

class DocumentRequestStatusUpdateView(generics.UpdateAPIView):
    queryset = DocumentRequest.objects.all().select_related('student', 'processed_by')
    serializer_class = DocumentRequestStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        updated = serializer.save(processed_by=self.request.user)

        # audit
        DocumentRequestAction.objects.create(
            request=updated,
            actor=self.request.user,
            action='status_changed',
            from_status=old_status,
            to_status=updated.status,
            notes=self.request.data.get('notes', '')
        )