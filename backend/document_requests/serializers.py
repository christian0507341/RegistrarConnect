from rest_framework import serializers
from django.utils import timezone
from .models import DocumentRequest, DocumentRequestAction
from backend.appointments.serializers import AppointmentSerializer


class DocumentRequestWebSerializer(serializers.ModelSerializer):
    student = serializers.CharField(source="student_id.get_full_name")
    student_id = serializers.CharField(source="student_id.student_id")
    semester = serializers.SerializerMethodField()
    school_year = serializers.SerializerMethodField()
    appointment = serializers.SerializerMethodField()

    class Meta:
        model = DocumentRequest
        fields = [
            "id",
            "student",
            "student_id",
            "document_type",
            "semester",
            "school_year",
            "purpose",
            "appointment",
        ]

    def get_semester(self, obj):
        import re
        match = re.search(r"Semester:\s*([^,)]*)", obj.purpose or "")
        return match.group(1) if match else ""

    def get_school_year(self, obj):
        import re
        match = re.search(r"School Year:\s*([^)]+)", obj.purpose or "")
        return match.group(1) if match else ""

    def get_appointment(self, obj):
        appointment = obj.appointments.first()
        return AppointmentSerializer(appointment).data if appointment else None


class DocumentRequestActionSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source='actor.email', read_only=True)
    payment = serializers.BooleanField(required=False, help_text="Payment approved")
    document = serializers.BooleanField(required=False, help_text="Document ready")

    class Meta:
        model = DocumentRequestAction
        fields = (
            'id',
            'action',
            'from_status',
            'to_status',
            'notes',
            'actor',
            'actor_email',
            'payment',
            'document',
            'created_at',
        )
        read_only_fields = ('id', 'actor', 'actor_email', 'created_at')


class DocumentRequestSerializer(serializers.ModelSerializer):
    actions = DocumentRequestActionSerializer(many=True, read_only=True)
    appointment = serializers.SerializerMethodField()
    receipt_reference = serializers.CharField(required=False, allow_blank=True, write_only=True)
    # Action-based status fields
    payment_approved = serializers.SerializerMethodField()
    document_approved = serializers.SerializerMethodField()
    current_status = serializers.SerializerMethodField()
    last_updated = serializers.SerializerMethodField()
    # Student information
    student_name = serializers.CharField(source='student_id.get_full_name', read_only=True)
    student_id_number = serializers.CharField(source='student_id.student_id', read_only=True)

    class Meta:
        model = DocumentRequest
        fields = '__all__'
        read_only_fields = [
            'status',
            'requested_at',
            'processed_by_id',
            'student_id',
            'actions',
            'appointment',
            'payment_approved',
            'document_approved',
            'current_status',
            'last_updated',
            'student_name',
            'student_id_number',
        ]

    def get_payment_approved(self, obj):
        return obj.get_current_status_from_actions()['payment_approved']
    
    def get_document_approved(self, obj):
        return obj.get_current_status_from_actions()['document_approved']
    
    def get_current_status(self, obj):
        return obj.get_current_status_from_actions()['current_status']
    
    def get_last_updated(self, obj):
        return obj.get_current_status_from_actions()['last_updated']

    def get_appointment(self, obj):
        appointment = obj.appointments.first()
        return AppointmentSerializer(appointment).data if appointment else None

    def update(self, instance, validated_data):
        # Purpose cannot change after it's first set/submitted
        if 'purpose' in validated_data and validated_data['purpose'] != instance.purpose:
            raise serializers.ValidationError({"purpose": "Purpose cannot be changed after submission."})

        # JUST persist the receipt_reference if provided; do not change status/notes here.
        receipt_reference = validated_data.pop('receipt_reference', None)
        instance = super().update(instance, validated_data)

        if receipt_reference:
            instance.receipt_reference = receipt_reference
            instance.save(update_fields=["receipt_reference"])

        return instance

    def create(self, validated_data):
        # Same: do not mutate status/notes here
        receipt_reference = validated_data.pop('receipt_reference', None)
        instance = super().create(validated_data)

        if receipt_reference:
            instance.receipt_reference = receipt_reference
            instance.save(update_fields=["receipt_reference"])

        return instance


class DocumentRequestStatusSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=DocumentRequest.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
    schedule = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = DocumentRequest
        fields = ['status', 'notes', 'schedule']

    def validate_status(self, value):
        if value not in [choice[0] for choice in DocumentRequest.Status.choices]:
            raise serializers.ValidationError(f"\"{value}\" is not a valid choice.")
        return value

    def validate_schedule(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError("Schedule must be in the future.")
        return value


class DocumentRequestCancelSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentRequest
        fields = ["status"]

    def update(self, instance, validated_data):
        if instance.status not in ['draft', 'confirming', 'awaiting_payment']:
            raise serializers.ValidationError("Only requests before payment can be cancelled.")
        instance.status = 'cancelled'
        instance.save()

        # Sync linked chat
        ch = getattr(instance, "chat_history", None)
        if ch:
            ch.status = 'cancelled'
            ch.save(update_fields=["status", "updated_at"])

        # Log action with from/to
        DocumentRequestAction.objects.create(
            request=instance,
            actor=self.context['request'].user,
            action='status_changed',
            from_status='pending',
            to_status='cancelled',
            notes='Cancelled via chatbot'
        )
        return instance


# ------------------ Receipt upload serializer (mobile flow) ------------------

class ReceiptUploadSerializer(serializers.ModelSerializer):
    receipt_image = serializers.ImageField(required=True)

    class Meta:
        model = DocumentRequest
        fields = ["receipt_image"]

    def update(self, instance, validated_data):
        # Just update the receipt image, status transition handled in view
        instance.receipt_image = validated_data["receipt_image"]
        instance.save(update_fields=["receipt_image"])
        return instance

    def validate_receipt_image(self, value):
        # Validate file size (max 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 5MB")
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError("Only JPEG and PNG images are allowed")
        
        return value