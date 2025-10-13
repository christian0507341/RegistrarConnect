from django.db import migrations

def migrate_ai_chat_history_to_chat_history(apps, schema_editor):
    AIChatHistory = apps.get_model('document_requests', 'AIChatHistory')
    ChatHistory = apps.get_model('ai', 'ChatHistory')
    for ai_chat in AIChatHistory.objects.all():
        chat, created = ChatHistory.objects.get_or_create(
            user_id=ai_chat.user_id,
            conversation_id=ai_chat.conversation_id,
            defaults={
                "history": ai_chat.history,
                "session": ai_chat.session,
                "status": ai_chat.status,
                "created_at": ai_chat.created_at,
                "updated_at": ai_chat.updated_at,
            }
        )
        if not created:
            chat.history = ai_chat.history
            chat.session = ai_chat.session
            chat.status = ai_chat.status
            chat.save()

def reverse_migrate(apps, schema_editor):
    # Optional: Restore AIChatHistory if needed (reverse migration)
    AIChatHistory = apps.get_model('document_requests', 'AIChatHistory')
    ChatHistory = apps.get_model('ai', 'ChatHistory')
    for chat in ChatHistory.objects.all():
        AIChatHistory.objects.update_or_create(
            user_id=chat.user_id,
            conversation_id=chat.conversation_id,
            defaults={
                "history": chat.history,
                "session": chat.session,
                "status": chat.status,
                "created_at": chat.created_at,
                "updated_at": chat.updated_at,
            }
        )

class Migration(migrations.Migration):

    dependencies = [
        ('ai', '0006_chathistory_document_request_and_more'),
        ('document_requests', '0011_documentrequestaction_document_and_more'),
    ]

    operations = [
        migrations.RunPython(migrate_ai_chat_history_to_chat_history, reverse_migrate),
    ]