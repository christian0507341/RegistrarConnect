import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings')

django.setup()
from backend.appointments.models import Appointment
from backend.document_requests.models import DocumentRequest

# Choose an appointment id to test - pick first
appt = Appointment.objects.first()
if not appt:
    print('No appointment to test')
    exit(1)

print('Testing appointment id', appt.id, 'current status', appt.status)
orig_status = appt.status
orig_doc_status = None
if appt.document_request:
    orig_doc_status = appt.document_request.status
    print('Linked document request', appt.document_request.id, 'status', orig_doc_status)

try:
    # Update status to 'claimed'
    appt.status = 'claimed'
    appt.save()
    print('Updated appointment status to claimed')
    # If linked doc request exists, simulate the backend logic in views.py
    if appt.document_request:
        doc = appt.document_request
        print('Updating linked document request', doc.id, 'to claimed')
        doc.status = 'claimed'
        doc.save()
        print('Document request updated to', doc.status)

    # Revert changes
    appt.status = orig_status
    appt.save()
    print('Reverted appointment status to', orig_status)
    if appt.document_request and orig_doc_status is not None:
        doc.status = orig_doc_status
        doc.save()
        print('Reverted document request status to', orig_doc_status)

    print('Test completed successfully')
except Exception as e:
    print('Error during update test:', e)
