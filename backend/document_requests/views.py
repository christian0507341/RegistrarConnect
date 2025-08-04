from django.shortcuts import render

from rest_framework import generics, permissions
from .models import DocumentRequest
from .serializers import DocumentRequestSerializer

class DocumentRequestCreateView(generics.CreateAPIView):
    serializer_class = DocumentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DocumentRequestListView(generics.ListAPIView):
    serializer_class = DocumentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DocumentRequest.objects.filter(user=self.request.user)