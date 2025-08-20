from rest_framework import serializers
from .models import Appointment, AppointmentAction

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
        read_only_fields = ['student', 'status', 'created_at', 'actions']

class AppointmentStatusSerializer(serializers.ModelSerializer):
    """Faculty-only status updates; approving requires faculty & no double-booking."""
    notes = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Appointment
        fields = ("status", "faculty", "notes")

    def validate(self, attrs):
        # When approving, a faculty must be present
        new_status = attrs.get("status")
        new_faculty = attrs.get("faculty")
        if new_status == "approved" and not new_faculty:
            raise serializers.ValidationError("Faculty must be assigned when approving.")
        return attrs
