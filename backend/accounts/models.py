from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import CustomUserManager
from django.core.validators import RegexValidator

class User(AbstractUser):
    # Remove username, use email as the login identifier
    username = models.CharField(max_length=50, unique=True, null=True, blank=True)

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)

    student_id = models.CharField(
    max_length=20,
    unique=True,
    blank=True,
    null=True,
    validators=[
        RegexValidator(
            regex=r'^\d{2}-(?:\d{4}|\d{2}-\d{4})-\d{6}$',
            message="Student ID must be either XX-XXXX-XXXXXX or XX-XX-XXXX-XXXXXX"
        )
    ]
)

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('faculty', 'Faculty'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    objects = CustomUserManager()

    def __str__(self):
        return self.email
