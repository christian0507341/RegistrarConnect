from rest_framework import serializers
from .models import DocumentRequest

class DocumentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentRequest
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'status']