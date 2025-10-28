# Generated manually to fix missing user_id column
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ai', '0013_remove_chathistory_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='chathistory',
            name='user_id',
            field=models.CharField(max_length=255, db_index=True, default=''),
            preserve_default=False,
        ),
    ]
