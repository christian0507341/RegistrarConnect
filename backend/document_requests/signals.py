from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.cache import cache
from django.utils import timezone
from .models import DocumentRequestAction
import logging

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=DocumentRequestAction)
def track_approval_changes(sender, instance, **kwargs):
    """
    Track if payment or document is being changed to True.
    Store the old values before save.
    """
    if instance.pk:
        try:
            old_instance = DocumentRequestAction.objects.get(pk=instance.pk)
            # Store old values in instance for use in post_save
            instance._old_payment = old_instance.payment
            instance._old_document = old_instance.document
        except DocumentRequestAction.DoesNotExist:
            instance._old_payment = False
            instance._old_document = False
    else:
        instance._old_payment = False
        instance._old_document = False


@receiver(post_save, sender=DocumentRequestAction)
def notify_on_approval(sender, instance, created, **kwargs):
    """
    Send notification to mobile when payment or document changes to True.
    """
    # Get old values from pre_save
    old_payment = getattr(instance, '_old_payment', False)
    old_document = getattr(instance, '_old_document', False)
    
    notifications = []
    
    # Check if payment was just approved
    if not old_payment and instance.payment:
        notification = {
            'id': f'payment_approved_{instance.request.id}_{instance.id}',
            'type': 'payment_approved',
            'request_id': instance.request.id,
            'student_id': instance.request.student_id.id,
            'document_type': instance.request.document_type,
            'title': '💳 Payment Approved',
            'message': f'Your payment for {instance.request.get_document_type_display()} has been approved!',
            'timestamp': timezone.now().isoformat(),
        }
        notifications.append(notification)
        logger.info(f"✅ Payment approved for request {instance.request.id}")
    
    # Check if document was just approved
    if not old_document and instance.document:
        notification = {
            'id': f'document_approved_{instance.request.id}_{instance.id}',
            'type': 'document_approved',
            'request_id': instance.request.id,
            'student_id': instance.request.student_id.id,
            'document_type': instance.request.document_type,
            'title': '📄 Document Approved',
            'message': f'Your {instance.request.get_document_type_display()} has been approved and is being processed!',
            'timestamp': timezone.now().isoformat(),
        }
        notifications.append(notification)
        logger.info(f"✅ Document approved for request {instance.request.id}")
    
    # Store notifications in cache for the mobile app to fetch
    if notifications:
        student_id = instance.request.student_id.id
        cache_key = f'pending_notifications_{student_id}'
        
        # Get existing pending notifications
        pending = cache.get(cache_key, [])
        
        # Add new notifications
        pending.extend(notifications)
        
        # Store back in cache (expire after 7 days)
        cache.set(cache_key, pending, timeout=60*60*24*7)
        
        logger.info(f"📬 Stored {len(notifications)} notifications for student {student_id}")
