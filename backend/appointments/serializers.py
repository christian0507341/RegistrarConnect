from rest_framework import serializers
from .models import Appointment, AppointmentAction
from backend.document_requests.models import DocumentRequest
from django.utils import timezone

class AppointmentActionSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source='actor.email', read_only=True)

    class Meta:
        model = AppointmentAction
        fields = ('id', 'action', 'from_status', 'to_status', 'notes', 'actor', 'actor_email', 'created_at')
        read_only_fields = ('id', 'actor', 'actor_email', 'created_at')

class AppointmentSerializer(serializers.ModelSerializer):
    actions = AppointmentActionSerializer(many=True, read_only=True)
    document_request_id = serializers.PrimaryKeyRelatedField(
        queryset=DocumentRequest.objects.all(),
        source='document_request',
        required=False
    )

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['student', 'status', 'created_at', 'actions']

    def validate(self, attrs):
        schedule = attrs.get('schedule') or getattr(self.instance, 'schedule', None)
        if schedule and schedule <= timezone.now():
            raise serializers.ValidationError({"schedule": "Schedule must be in the future."})
        if 'document_request' in attrs and Appointment.objects.filter(
            document_request=attrs['document_request'],
            status='scheduled'
        ).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError({"document_request": "An active appointment already exists for this request."})
        return attrs

class AppointmentStatusSerializer(serializers.ModelSerializer):
    notes = serializers.CharField(write_only=True, required=False, allow_blank=True)
    schedule = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Appointment
        fields = ("status", "faculty", "notes", "schedule")

    def validate(self, attrs):
        appt = self.instance
        new_status = attrs.get("status", appt.status)
        new_faculty = attrs.get("faculty") or appt.faculty
        new_schedule = attrs.get("schedule") or appt.schedule

        if new_status == "scheduled":
            if not new_faculty:
                raise serializers.ValidationError("Faculty must be assigned when scheduling.")
            if not new_schedule:
                raise serializers.ValidationError("Schedule is required when scheduling.")
        return attrs