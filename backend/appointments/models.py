from django.db import models
from django.contrib.auth import get_user_model

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('declined', 'Declined'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    schedule_date = models.DateField()
    schedule_time = models.TimeField()
    purpose = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.schedule_date} @ {self.schedule_time}"
