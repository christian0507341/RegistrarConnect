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

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f"{self.request.id} - {self.action} ({self.created_at})"  # Fixed request_id to request.id

class DocumentRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CANCELLED = 'cancelled', 'Cancelled'
        PROCESSED = 'processed', 'Processed'
    DOCUMENT_TYPES = [
        ('transcript', 'Transcript of Records'),
        ('good_moral', 'Certificate of Good Moral'),
        ('enrollment', 'Certificate of Enrollment'),
        ('grades', 'Copy of Grades'),
    ]

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="document_requests")
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    purpose = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="processed_document_requests"
    )
    receipt_image = models.ImageField(upload_to='receipts/', null=True, blank=True, default=None)
    notes = models.TextField(blank=True, null=True)  # Add this line

    def __str__(self):
        return f"{self.student.email} - {self.document_type} - {self.status}"

    class Meta:
        ordering = ('-requested_at',)