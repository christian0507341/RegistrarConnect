# RegistrarConnect/backend/ai/models.py
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from backend.document_requests.models import DocumentRequest

class ChatHistory(models.Model):
    user_id = models.CharField(max_length=255, db_index=True)
    conversation_id = models.CharField(max_length=255, unique=True)
    document_request = models.ForeignKey(
        DocumentRequest, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='chat_history'
    )
    history = models.JSONField(default=list)
    session = models.JSONField(default=dict)
    status = models.CharField(max_length=50, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"ChatHistory({self.conversation_id})"

@receiver(post_save, sender=DocumentRequest)
def update_chat_history_status(sender, instance, created, **kwargs):
    """
    Keep ChatHistory.status in sync with its linked DocumentRequest.status
    (for whichever chat_history is linked).
    """
    chat_history = instance.chat_history.first()
    if chat_history and instance.status != chat_history.status:
        chat_history.status = instance.status
        chat_history.save(update_fields=["status", "updated_at"])

@receiver(post_save, sender=ChatHistory)
def link_chat_to_request(sender, instance, created, **kwargs):
    """
    On new ChatHistory rows, if there's enough info in session, try to link to an
    existing DocumentRequest for this user. Allow linking even when the document
    is already 'pending' (student has submitted receipt).
    """
    if not created:
        return

    if instance.document_request_id is not None:
        return

    doc_type = instance.session.get("doc_type")
    if not doc_type:
        return

    # user_id is stored as string in ChatHistory
    try:
        user_pk = int(instance.user_id)
    except Exception:
        return

    q = DocumentRequest.objects.filter(
        student_id_id=user_pk,
        document_type=doc_type,
    ).order_by("-requested_at")

    sem = instance.session.get("semester")
    sy = instance.session.get("school_year")
    purpose = instance.session.get("purpose")

    if sem in (1, 2):
        q = q.filter(semester=sem)
    if sy:
        q = q.filter(school_year=sy)
    if purpose:
        q = q.filter(purpose=purpose)

    # Allow linking up to pending
    doc = q.filter(status__in=['draft', 'awaiting_payment', 'pending']).first()
    if doc:
        instance.document_request = doc
        instance.status = doc.status
        instance.save(update_fields=["document_request", "status", "updated_at"])
