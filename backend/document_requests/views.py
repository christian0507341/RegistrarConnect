from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .models import DocumentRequest, DocumentRequestAction
from .serializers import DocumentRequestSerializer, DocumentRequestStatusSerializer
from backend.common.permissions import IsFaculty

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
        # audit: submitted
        DocumentRequestAction.objects.create(
            request=instance,
            actor=self.request.user,
            action='submitted',
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

class DocumentRequestStatusUpdateView(generics.UpdateAPIView):
    """
    Faculty can update the status of a document request.
    """
    queryset = DocumentRequest.objects.all()
    serializer_class = DocumentRequestStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def perform_update(self, serializer):
        serializer.save(processed_by=self.request.user)