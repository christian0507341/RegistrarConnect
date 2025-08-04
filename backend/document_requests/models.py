from django.db import models
from django.contrib.auth import get_user_model

class DocumentRequest(models.Model):
    DOCUMENT_CHOICES = [
        ('tor', 'Transcript of Records'),
        ('diploma', 'Diploma'),
        ('coe', 'Certificate of Enrollment'),
    ]

    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_CHOICES)
    purpose = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
