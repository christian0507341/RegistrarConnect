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
        return f"{self.request.id} - {self.action} ({self.created_at})"

class DocumentRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    DOCUMENT_TYPES = [
        ('transcript', 'Transcript of Records'),
        ('good_moral', 'Certificate of Good Moral'),
        ('enrollment', 'Certificate of Enrollment'),
        ('grades', 'Copy of Grades'),
    ]

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="document_requests")
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    purpose = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="processed_document_requests"
    )
    receipt_image = models.ImageField(upload_to='receipts/', null=True, blank=True, default=None)
    notes = models.TextField(blank=True, null=True)
    payment = models.BooleanField(default=False)  # Added for payment status
    document = models.BooleanField(default=False)  # Added for document status

    def __str__(self):
        return f"{self.student.email} - {self.document_type} - {self.status}"

    class Meta:
        ordering = ('-requested_at',)