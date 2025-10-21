# backend/document_requests/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from backend.document_requests.models import DocumentRequest, DocumentRequestAction

@receiver(post_save, sender=DocumentRequestAction)
def update_request_status(sender, instance, created, **kwargs):
    """Update DocumentRequest.status whenever a new action is created."""
    if created and instance.request:
        instance.request.status = instance.action
        instance.request.save(update_fields=['status'])
