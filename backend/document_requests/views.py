from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .models import DocumentRequest, DocumentRequestAction
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
    """
    Fetch all document requests for faculty or student,
    returning only fields needed for web table.
    """
    user = request.user
    if hasattr(user, 'role') and user.role == 'faculty':
        queryset = DocumentRequest.objects.all().select_related('student')
    else:
        queryset = DocumentRequest.objects.filter(student=user).select_related('student')

    serializer = DocumentRequestWebSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def document_request_history(request):
    """Return all requests for the current user"""
    requests = DocumentRequest.objects.filter(student=request.user)
    print(f"Debug: Querying {requests.query}, Count: {requests.count()}")  # Add this line
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
    # Handle both 'doc_type' and 'document_type' for compatibility with chatbot
    doc_type = request.data.get("document_type") or request.data.get("doc_type")
    purpose = request.data.get("purpose")  # Required by model
    semester = request.data.get("semester", "")  # Optional, store in purpose if needed
    school_year = request.data.get("school_year", "")  # Optional, store in purpose if needed

    if not doc_type or not purpose:
        return Response({"error": "document_type and purpose are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Combine semester and school_year into purpose if provided
    full_purpose = purpose
    if semester or school_year:
        full_purpose += f" (Semester: {semester}, School Year: {school_year})"

    doc_request = DocumentRequest.objects.create(
        student=request.user,
        document_type=doc_type,
        purpose=full_purpose,
        status="pending"
    )
    return Response({
        "id": doc_request.id,
        "document_type": doc_request.document_type,
        "status": doc_request.status,
        "purpose": doc_request.purpose
    }, status=status.HTTP_201_CREATED)

class DocumentRequestListView(generics.ListAPIView):
    serializer_class = DocumentRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = DocumentRequest.objects.all()
        status = self.request.query_params.get("status")
        student = self.request.query_params.get("student")
        document_type = self.request.query_params.get("document_type")

        if status:
            queryset = queryset.filter(status=status.lower())
        if student:
            queryset = queryset.filter(student_id=student)
        if document_type:
            queryset = queryset.filter(document_type=document_type.lower())

        return queryset

class DocumentRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'faculty':  # Check if role exists
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
        if hasattr(user, 'role') and user.role == 'faculty':  # Check if role exists
            return DocumentRequest.objects.all().select_related('student', 'processed_by')
        return DocumentRequest.objects.filter(student=user).select_related('student', 'processed_by')

class DocumentRequestStatusUpdateView(generics.UpdateAPIView):
    queryset = DocumentRequest.objects.all().select_related('student', 'processed_by')
    serializer_class = DocumentRequestStatusSerializer
    permission_classes = [IsAuthenticated, IsFaculty]
    http_method_names = ['post', 'put', 'patch']

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        updated = serializer.save(processed_by=self.request.user)

        from .models import DocumentRequestAction
        DocumentRequestAction.objects.create(
            request=updated,
            actor=self.request.user,
            action='status_changed',
            from_status=old_status,
            to_status=updated.status,
            notes=self.request.data.get('notes', '')
        )