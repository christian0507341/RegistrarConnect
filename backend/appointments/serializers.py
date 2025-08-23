from rest_framework import serializers
from .models import Appointment, AppointmentAction
from django.utils import timezone

class AppointmentActionSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source='actor.email', read_only=True)

    class Meta:
        model = AppointmentAction
        fields = ('id', 'action', 'from_status', 'to_status', 'notes', 'actor', 'actor_email', 'created_at')
        read_only_fields = ('id', 'actor', 'actor_email', 'created_at')

class AppointmentSerializer(serializers.ModelSerializer):
    actions = AppointmentActionSerializer(many=True, read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['student', 'faculty', 'status', 'created_at', 'actions']
        
    def validate(self, attrs):
        # Allow empty schedule at creation (pending), but if provided, it must be in the future
        schedule = attrs.get('schedule') or getattr(self.instance, 'schedule', None)
        if schedule and schedule <= timezone.now():
            raise serializers.ValidationError({"schedule": "Schedule must be in the future."})
        return attrs

class AppointmentStatusSerializer(serializers.ModelSerializer):
    """Faculty-only status updates; approving requires faculty & no double-booking."""
    notes = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Appointment
        fields = ("status", "faculty", "notes")

    def validate(self, attrs):
        appt = self.instance
        new_status = attrs.get("status", appt.status)
        new_faculty = attrs.get("faculty") or appt.faculty

        if new_status == "approved":
            if not new_faculty:
                raise serializers.ValidationError("Faculty must be assigned when approving.")
            # require a schedule present on the appointment to approve
            if not appt.schedule:
                raise serializers.ValidationError("Cannot approve an appointment without a schedule.")
        return attrs