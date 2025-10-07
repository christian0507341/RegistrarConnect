from rest_framework import serializers
from .models import DocumentRequest, DocumentRequestAction

class DocumentRequestWebSerializer(serializers.ModelSerializer):
    student = serializers.CharField(source="student.get_full_name")
    student_id = serializers.CharField(source="student.student_id")
    semester = serializers.SerializerMethodField()
    school_year = serializers.SerializerMethodField()

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
        ]

    def get_semester(self, obj):
        import re
        match = re.search(r"Semester:\s*([^,)]*)", obj.purpose)
        return match.group(1) if match else ""

    def get_school_year(self, obj):
        import re
        match = re.search(r"School Year:\s*([^)]+)", obj.purpose)
        return match.group(1) if match else ""

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

    def update(self, instance, validated_data):
        if 'purpose' in validated_data and validated_data['purpose'] != instance.purpose:
            raise serializers.ValidationError({"purpose": "Purpose cannot be changed after submission."})
        return super().update(instance, validated_data)

class DocumentRequestStatusSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=DocumentRequest.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = DocumentRequest
        fields = ['status', 'notes']

    def validate_status(self, value):
        if value not in [choice[0] for choice in DocumentRequest.Status.choices]:
            raise serializers.ValidationError(f"\"{value}\" is not a valid choice.")
        return value

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.processed_by = self.context['request'].user
        instance.save()
        return instance

class DocumentRequestCancelSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentRequest
        fields = ["status"]

    def update(self, instance, validated_data):
        if instance.status != 'pending':
            raise serializers.ValidationError("Only pending requests can be cancelled.")
        instance.status = 'cancelled'
        instance.save()
        DocumentRequestAction.objects.create(
            request=instance,
            actor=self.context['request'].user,
            action='status_changed',
            from_status='pending',
            to_status='cancelled',
            notes='Cancelled via chatbot'
        )
        return instance

class StatusSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='document_type')
    payment = serializers.BooleanField()
    document = serializers.BooleanField()

    class Meta:
        model = DocumentRequest
        fields = ['title', 'payment', 'document']

class StatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentRequest
        fields = ['payment', 'document']
        read_only_fields = []

    def update(self, instance, validated_data):
        old_payment = instance.payment
        old_document = instance.document
        instance = super().update(instance, validated_data)
        if old_payment != instance.payment or old_document != instance.document:
            notes = f"Payment: {instance.payment}, Document: {instance.document}"
            DocumentRequestAction.objects.create(
                request=instance,
                actor=self.context['request'].user,
                action='status_changed',
                from_status=f"payment: {old_payment}, document: {old_document}",
                to_status=f"payment: {instance.payment}, document: {instance.document}",
                notes=notes
            )
        return instance