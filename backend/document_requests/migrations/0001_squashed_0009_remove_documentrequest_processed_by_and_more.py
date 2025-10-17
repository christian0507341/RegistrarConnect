from django.db import migrations, models
import re
from django.conf import settings
import django.db.models.deletion

def split_purpose_data(apps, schema_editor):
    DocumentRequest = apps.get_model('document_requests', 'DocumentRequest')
    for doc in DocumentRequest.objects.all():
        if "(Semester:" in doc.purpose and "School Year:" in doc.purpose:
            purpose_part = doc.purpose.split(" (Semester:")[0].strip()
            sem_sy_part = doc.purpose.split(" (Semester:")[1].rstrip(")")
            semester_match = re.search(r"Semester: (\d+)", sem_sy_part)
            school_year_match = re.search(r"School Year: (\d{4}-\d{4})", sem_sy_part)
            if semester_match or school_year_match:
                doc.purpose = purpose_part
                doc.semester = int(semester_match.group(1)) if semester_match else doc.semester
                doc.school_year = school_year_match.group(1) if school_year_match else doc.school_year
                doc.save()

def reverse_split_purpose_data(apps, schema_editor):
    DocumentRequest = apps.get_model('document_requests', 'DocumentRequest')
    for doc in DocumentRequest.objects.all():
        if doc.semester or doc.school_year:
            full_purpose = doc.purpose
            if doc.semester:
                full_purpose += f" (Semester: {doc.semester}"
            if doc.school_year:
                full_purpose += f", School Year: {doc.school_year})"
            doc.purpose = full_purpose
            doc.semester = None
            doc.school_year = None
            doc.save()

def populate_student_id(apps, schema_editor):
    DocumentRequest = apps.get_model('document_requests', 'DocumentRequest')
    for request in DocumentRequest.objects.all():
        if request.student_id_id is None:  # Check IntegerField null
            try:
                request.student_id_id = request.student.id if hasattr(request, 'student') else None
                request.save(update_fields=['student_id'])
            except AttributeError:
                request.student_id_id = 1  # Default user ID
                request.save(update_fields=['student_id'])

def reverse_populate_student_id(apps, schema_editor):
    pass

class Migration(migrations.Migration):
    dependencies = []
    operations = [
        migrations.CreateModel(
            name='DocumentRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document_type', models.CharField(choices=[('OTR', 'Official Transcript of Records'), ('COG', 'Certificate of Grades'), ('COE', 'Certificate of Enrollment'), ('OTHERS', 'Other Certifications')], max_length=50)),
                ('semester', models.IntegerField(blank=True, choices=[(1, '1st'), (2, '2nd')], null=True)),
                ('school_year', models.CharField(blank=True, max_length=9, null=True)),
                ('purpose', models.CharField(blank=True, max_length=100, null=True)),
                ('payment_method', models.CharField(blank=True, choices=[('personal', 'Personal (Finance)'), ('gcash', 'Online (GCash)')], max_length=20, null=True)),
                ('receipt_image', models.ImageField(blank=True, null=True, upload_to='receipts/')),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('confirming', 'Confirming'), ('awaiting_payment', 'Awaiting Payment'), ('pending', 'Pending'), ('cancelled', 'Cancelled'), ('rejected', 'Rejected'), ('ready_to_claim', 'Ready to Claim')], default='draft', max_length=20)),
                ('notes', models.TextField(blank=True, null=True)),
                ('requested_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ('-requested_at',),
            },
        ),
        migrations.CreateModel(
            name='DocumentRequestAction',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('submitted', 'Submitted'), ('status_changed', 'Status Changed'), ('updated', 'Updated')], max_length=32)),
                ('from_status', models.CharField(blank=True, max_length=20, null=True)),
                ('to_status', models.CharField(blank=True, max_length=20, null=True)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('actor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('request', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='actions', to='document_requests.documentrequest')),
            ],
            options={
                'ordering': ('-created_at',),
            },
        ),
        migrations.RunSQL("ALTER TABLE document_requests_documentrequest ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NULL;"),
        migrations.RunPython(split_purpose_data, reverse_code=reverse_split_purpose_data),
        migrations.AddField(
            model_name='documentrequest',
            name='processed_by_id',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='documentrequest',
            name='student_id',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.RunPython(populate_student_id, reverse_code=reverse_populate_student_id),
    ]