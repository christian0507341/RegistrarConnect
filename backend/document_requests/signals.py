from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import DocumentRequest, DocumentRequestAction
from .notification_service import StatusNotificationService


@receiver(pre_save, sender=DocumentRequest)
def track_status_changes(sender, instance, **kwargs):
    """
    Track changes to payment and document fields before saving
    """
    if instance.pk:
        try:
            old_instance = DocumentRequest.objects.get(pk=instance.pk)
            instance._old_payment = old_instance.payment
            instance._old_document = old_instance.document
        except DocumentRequest.DoesNotExist:
            instance._old_payment = False
            instance._old_document = False
    else:
        instance._old_payment = False
        instance._old_document = False


@receiver(post_save, sender=DocumentRequest)
def update_status_on_payment_document_change(sender, instance, created, **kwargs):
    """
    Automatically update the overall status when payment or document status changes
    """
    if created:
        return
    
    # Check if payment or document status changed
    payment_changed = hasattr(instance, '_old_payment') and instance._old_payment != instance.payment
    document_changed = hasattr(instance, '_old_document') and instance._old_document != instance.document
    
    if payment_changed or document_changed:
        # Determine new status based on payment and document status
        new_status = determine_status(instance.payment, instance.document)
        old_status = instance.status
        
        # Update the status if it should change
        if new_status != old_status:
            instance.status = new_status
            instance.save(update_fields=['status'])
            
            # Create action log
            DocumentRequestAction.objects.create(
                request=instance,
                actor=instance.processed_by,  # Use processed_by if available, otherwise None
                action='status_changed',
                from_status=old_status,
                to_status=new_status,
                notes=f"Auto-updated: Payment={instance.payment}, Document={instance.document}"
            )
            
            # Send notification to student
            try:
                StatusNotificationService.send_status_update_notification(
                    instance, old_status, new_status
                )
                
                # Send special completion notification
                if new_status == 'completed':
                    StatusNotificationService.send_completion_notification(instance)
                    
            except Exception as e:
                print(f"Failed to send notification: {e}")


def determine_status(payment_status, document_status):
    """
    Determine the overall status based on payment and document status
    """
    if payment_status and document_status:
        return 'completed'
    elif payment_status and not document_status:
        return 'approved'  # Payment received, document processing
    elif not payment_status and document_status:
        return 'approved'  # Document ready, payment pending
    else:
        return 'pending'  # Neither payment nor document ready
