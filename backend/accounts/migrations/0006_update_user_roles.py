# Generated migration for adding registrar and finance roles

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_alter_user_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('student', 'Student'),
                    ('registrar', 'Registrar'),
                    ('finance', 'Finance'),
                    ('admin', 'Admin')
                ],
                default='student',
                max_length=20
            ),
        ),
    ]

