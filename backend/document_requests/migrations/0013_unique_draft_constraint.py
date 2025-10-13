from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('document_requests', '0012_delete_aichathistory'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='documentrequest',
            constraint=models.UniqueConstraint(
                fields=['student_id', 'document_type'],
                condition=models.Q(status='draft'),
                name='unique_draft_per_student_type'
            ),
        ),
    ]