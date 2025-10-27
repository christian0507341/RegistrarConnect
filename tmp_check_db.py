import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings')

django.setup()
from django.conf import settings
from django.db import connection
from backend.appointments.models import Appointment

print('DB ENGINE:', settings.DATABASES['default']['ENGINE'])
print('DB NAME:', settings.DATABASES['default']['NAME'])
print('DB HOST:', settings.DATABASES['default']['HOST'])
print('DB PORT:', settings.DATABASES['default']['PORT'])
print('Connected:', connection is not None)
try:
    count = Appointment.objects.count()
    print('Appointment count:', count)
    first = Appointment.objects.first()
    if first:
        print('First appointment id:', first.id, 'status:', first.status, 'student:', getattr(first.student,'email', None))
    else:
        print('No appointments found')
except Exception as e:
    print('Error querying Appointment:', e)
