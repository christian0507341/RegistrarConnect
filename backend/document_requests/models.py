from django.db import models
from django.conf import settings

class DocumentRequestAction(models.Model):
    ACTIONS = [
        ('submitted', 'Submitted'),
        ('status_changed', 'Status Changed'),
        ('updated', 'Updated'),
    ]
    request = models.ForeignKey('DocumentRequest', on_delete=models.CASCADE, related_name='actions')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=32, choices=ACTIONS)
    from_status = models.CharField(max_length=20, blank=True, null=True)
    to_status = models.CharField(max_length=20, blank=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    payment = models.BooleanField(default=False)
    document = models.BooleanField(default=False)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f"{self.request.id} - {self.action} ({self.created_at})"

class DocumentRequest(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        CONFIRMING = 'confirming', 'Confirming'
        AWAITING_PAYMENT = 'awaiting_payment', 'Awaiting Payment'
        PENDING = 'pending', 'Pending'
        CANCELLED = 'cancelled', 'Cancelled'
        REJECTED = 'rejected', 'Rejected'
        READY_TO_CLAIM = 'ready_to_claim', 'Ready to Claim'
        ON_PROCESS = 'on_process', 'On Process'

    DOCUMENT_TYPES = [
        ('OTR', 'Official Transcript of Records'),
        ('COG', 'Certificate of Grades'),
        ('COE', 'Certificate of Enrollment'),
        ('OTHERS', 'Other Certifications'),
    ]

    student_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='requests_as_student', db_column='student_id')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    semester = models.IntegerField(null=True, blank=True, choices=[(1, '1st'), (2, '2nd')])
    school_year = models.CharField(max_length=9, null=True, blank=True)  # e.g., "2025-2026"
    purpose = models.CharField(max_length=100, null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=[('personal', 'Personal (Finance)'), ('gcash', 'Online (GCash)')], null=True, blank=True)
    receipt_image = models.ImageField(upload_to='receipts/', null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    processed_by_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_requests', db_column='processed_by_id')
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student_id} - {self.document_type} - {self.status}"

    class Meta:
        ordering = ('-requested_at',)

class AIChatHistory(models.Model):
    history = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_histories')
    conversation_id = models.CharField(max_length=100, unique=True)
    session = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=DocumentRequest.Status.choices, default=DocumentRequest.Status.DRAFT)

    def __str__(self):
        return f"Chat {self.conversation_id} for {self.user_id}"