from rest_framework import serializers
from .models import DocumentRequest, DocumentRequestAction

class DocumentRequestActionSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source='actor.email', read_only=True)

    class Meta:
        model = DocumentRequestAction
        fields = ('id', 'action', 'from_status', 'to_status', 'notes', 'actor', 'actor_email', 'created_at')
        read_only_fields = ('id', 'actor', 'actor_email', 'created_at')

class DocumentRequestSerializer(serializers.ModelSerializer):
    actions = DocumentRequestActionSerializer(many=True, read_only=True)

    class Meta:
        model = DocumentRequest
        fields = '__all__'
        read_only_fields = ['status', 'requested_at', 'processed_by', 'student', 'actions']

class DocumentRequestStatusSerializer(serializers.ModelSerializer):
    """Used by faculty to update status and optional notes/purpose."""
    notes = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = DocumentRequest
        fields = ("status", "purpose", "notes")
