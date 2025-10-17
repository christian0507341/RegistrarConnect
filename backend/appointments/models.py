from django.db import models
from django.conf import settings
from django.utils import timezone

class AppointmentAction(models.Model):
    ACTIONS = [
        ('created', 'Created'),
        ('status_changed', 'Status Changed'),
        ('assigned', 'Assigned Faculty'),
        ('scheduled', 'Scheduled'),  # Added for faculty setting specific time
    ]
    appointment = models.ForeignKey('Appointment', on_delete=models.CASCADE, related_name='actions')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=32, choices=ACTIONS)
    from_status = models.CharField(max_length=20, blank=True, null=True)
    to_status = models.CharField(max_length=20, blank=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f"{self.appointment_id} {self.action} {self.from_status}->{self.to_status}"

class Appointment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="appointments")
    faculty = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="faculty_appointments",
        limit_choices_to={'role': 'faculty'},
        null=True,
        blank=True
    )
    document_request = models.ForeignKey(
        'document_requests.DocumentRequest',
        on_delete=models.CASCADE,
        related_name="appointments",
        null=True,
        blank=True
    )  # Link to DocumentRequest
    purpose = models.TextField()
    schedule = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('scheduled', 'Scheduled'),  # Aligned with "ready to claim"
        ('missed', 'Missed'),  # For tracking missed appointments
        ('cancelled', 'Cancelled'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['document_request'],
                condition=models.Q(status='scheduled'),
                name='unique_scheduled_appointment_per_request'
            )  # Prevent multiple scheduled appointments per request
        ]

    def __str__(self):
        student = getattr(self.student, "email", None) or getattr(self.student, "username", None) or "student?"
        faculty = getattr(self.faculty, "email", None) or getattr(self.faculty, "username", None) or "faculty?"
        when = self.schedule.strftime("%Y-%m-%d %H:%M") if getattr(self, "schedule", None) else "unscheduled"
        return f"{student} with {faculty} on {when}"