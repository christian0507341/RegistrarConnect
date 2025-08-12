from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import CustomUserManager

class User(AbstractUser):
    # Remove username, use email as the login identifier
    username = None

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    middle_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150)

    # Student ID NOT in registration; will be filled on profile later
    student_id = models.CharField(max_length=20, unique=True, blank=True, null=True)

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('faculty', 'Faculty'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']  # for createsuperuser prompts

    objects = CustomUserManager()

    def __str__(self):
        return self.email
