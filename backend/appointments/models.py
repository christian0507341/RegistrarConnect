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

class AppointmentSettings(models.Model):
    """Settings for appointment scheduling"""
    max_appointments_per_day = models.PositiveIntegerField(
        default=100,
        help_text="Maximum number of appointments that can be scheduled per day"
    )
    appointment_start_hour = models.PositiveIntegerField(
        default=9,
        help_text="Hour when appointments start (24-hour format)"
    )
    appointment_end_hour = models.PositiveIntegerField(
        default=17,
        help_text="Hour when appointments end (24-hour format)"
    )
    appointment_duration_minutes = models.PositiveIntegerField(
        default=15,
        help_text="Duration of each appointment in minutes"
    )
    advance_days = models.PositiveIntegerField(
        default=1,
        help_text="Number of days in advance to schedule appointments"
    )
    exclude_weekends = models.BooleanField(
        default=True,
        help_text="Whether to exclude weekends from scheduling"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Appointment Settings"
        verbose_name_plural = "Appointment Settings"

    def __str__(self):
        return f"Appointment Settings (Max: {self.max_appointments_per_day}/day)"

    @classmethod
    def get_settings(cls):
        """Get the current appointment settings, creating default if none exist"""
        settings_obj, created = cls.objects.get_or_create(
            id=1,  # Single settings record
            defaults={
                'max_appointments_per_day': 100,
                'appointment_start_hour': 9,
                'appointment_end_hour': 17,
                'appointment_duration_minutes': 15,
                'advance_days': 1,
                'exclude_weekends': True,
            }
        )
        return settings_obj

class AppointmentTimeSlot(models.Model):
    """Weekly time slot configuration for claiming appointments"""
    DAYS_OF_WEEK = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]
    
    day = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    start_time = models.TimeField(help_text="Start time (e.g., 09:00)")
    end_time = models.TimeField(help_text="End time (e.g., 17:00)")
    slots_per_hour = models.PositiveIntegerField(
        default=4,
        help_text="Number of appointment slots per hour"
    )
    is_active = models.BooleanField(default=True, help_text="Whether this time slot is active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['day', 'start_time']
        unique_together = ['day', 'start_time', 'end_time']
    
    def __str__(self):
        return f"{self.day} {self.start_time}-{self.end_time} ({self.slots_per_hour}/hr)"

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
        ('claimed', 'Claimed'),  # Document has been claimed
        ('no_show', 'No Show'),  # Student didn't show up
        ('rescheduled', 'Rescheduled'),  # Appointment was rescheduled
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

    @classmethod
    def get_next_available_slot(cls, target_date=None):
        """Get the next available appointment slot"""
        from datetime import datetime, timedelta
        from django.utils import timezone
        
        settings_obj = AppointmentSettings.get_settings()
        
        if target_date is None:
            # Start from tomorrow
            target_date = timezone.now().date() + timedelta(days=settings_obj.advance_days)
        
        # If exclude_weekends is True, skip weekends
        if settings_obj.exclude_weekends:
            while target_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
                target_date += timedelta(days=1)
        
        # Check each day until we find an available slot
        max_attempts = 30  # Prevent infinite loop
        attempts = 0
        
        while attempts < max_attempts:
            # Count existing appointments for this date
            existing_count = cls.objects.filter(
                schedule__date=target_date,
                status='scheduled'
            ).count()
            
            if existing_count < settings_obj.max_appointments_per_day:
                # Find the next available time slot for this date
                start_time = datetime.combine(target_date, datetime.min.time().replace(hour=settings_obj.appointment_start_hour))
                end_time = datetime.combine(target_date, datetime.min.time().replace(hour=settings_obj.appointment_end_hour))
                
                # Get all scheduled times for this date
                scheduled_times = cls.objects.filter(
                    schedule__date=target_date,
                    status='scheduled'
                ).values_list('schedule', flat=True)
                
                # Find the first available slot
                current_time = start_time
                while current_time < end_time:
                    slot_time = timezone.make_aware(current_time)
                    if slot_time not in scheduled_times:
                        return slot_time
                    current_time += timedelta(minutes=settings_obj.appointment_duration_minutes)
            
            # Move to next day
            target_date += timedelta(days=1)
            if settings_obj.exclude_weekends:
                while target_date.weekday() >= 5:
                    target_date += timedelta(days=1)
            
            attempts += 1
        
        # If no slot found, return a default time (tomorrow at start hour)
        return timezone.make_aware(
            datetime.combine(
                timezone.now().date() + timedelta(days=1),
                datetime.min.time().replace(hour=settings_obj.appointment_start_hour)
            )
        )