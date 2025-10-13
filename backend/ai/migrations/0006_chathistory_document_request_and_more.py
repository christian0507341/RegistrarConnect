from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('ai', '0005_chathistory_status'),
        ('document_requests', '0011_documentrequestaction_document_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chathistory',
            name='status',
            field=models.CharField(choices=[('draft', 'Draft'), ('confirming', 'Confirming'), ('awaiting_payment', 'Awaiting Payment'), ('pending', 'Pending'), ('cancelled', 'Cancelled'), ('rejected', 'Rejected'), ('ready_to_claim', 'Ready to Claim'), ('on_process', 'On Process')], default='draft', max_length=20),
        ),
        migrations.AddField(
            model_name='chathistory',
            name='document_request',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='document_requests.documentrequest'),
        ),
    ]