from django.db import migrations, models

def backfill_conversation_id(apps, schema_editor):
    ChatHistory = apps.get_model('ai', 'ChatHistory')
    for row in ChatHistory.objects.all():
        # give every existing row a unique conversation id
        row.conversation_id = f"default-{row.pk}"
        row.save(update_fields=['conversation_id'])

class Migration(migrations.Migration):

    dependencies = [
        ('ai', '0001_initial'),
    ]

    operations = [
        # 1) add field as nullable so DB accepts it on existing rows
        migrations.AddField(
            model_name='chathistory',
            name='conversation_id',
            field=models.CharField(max_length=128, db_index=True, null=True),
        ),
        # 2) backfill
        migrations.RunPython(backfill_conversation_id, migrations.RunPython.noop),
        # 3) make it non-null
        migrations.AlterField(
            model_name='chathistory',
            name='conversation_id',
            field=models.CharField(max_length=128, db_index=True),
        ),
        # 4) enforce uniqueness at DB level
        migrations.AlterUniqueTogether(
            name='chathistory',
            unique_together={('user', 'conversation_id')},
        ),
        # (optional) you already have db_index=True; composite index is nice-to-have
        # migrations.AddIndex(
        #     model_name='chathistory',
        #     index=models.Index(fields=['user', 'conversation_id'], name='ai_user_conv_idx'),
        # ),
    ]
