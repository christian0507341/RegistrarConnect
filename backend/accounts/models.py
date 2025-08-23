# accounts/models.py
import re
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from .validators import (
    no_space_username_validator,
    validate_phinma_email,
    validate_student_id,
)

class User(AbstractUser):

    REQUIRED_FIELDS = []   # superuser prompt: username + password only

    class Roles(models.TextChoices):
        STUDENT = "student", _("Student")
        FACULTY = "faculty", _("Faculty")

    # Tighten built‑ins
    username = models.CharField(
        _("username"),
        max_length=150,
        unique=True,
        help_text=_("Required. 150 characters or fewer. No spaces."),
        validators=[no_space_username_validator],   # ← no spaces in admin/anywhere
        error_messages={"unique": _("A user with that username already exists.")},
    )

    # Email used for user-facing login, PHINMA only
    email = models.EmailField(
        _("email address"),
        unique=True,
        validators=[validate_phinma_email],         # ← only *.up@phinmaed.com
    )

    # Names capped to 50
    first_name  = models.CharField(_("first name"),  max_length=50, blank=True)
    middle_name = models.CharField(_("middle name"), max_length=50, blank=True, null=True)
    last_name   = models.CharField(_("last name"),   max_length=50, blank=True)

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.STUDENT,
        help_text=_("User role"),
    )

    # Only for students
    student_id = models.CharField(
        max_length=20,   # enough for both patterns
        blank=True,
        null=True,
        unique=True,
        validators=[validate_student_id],
        help_text=_("Required if role is Student (e.g., 03-2324-092300 or 03-01-2425-329623)."),
    )

    def clean(self):
        super().clean()
        # Enforce student_id when student
        if self.role == self.Roles.STUDENT and not self.student_id:
            raise ValidationError({"student_id": _("Student ID is required for students.")})

    def _unique_username_from_local(self, local: str) -> str:
        base = re.sub(r"[^a-z0-9._-]+", "", (local or "user").lower()).strip("._-") or "user"
        candidate, i = base, 1
        while type(self).objects.filter(username=candidate).exclude(pk=self.pk).exists():
            i += 1
            candidate = f"{base}{i}"
        return candidate

    def _unique_phinma_email_from_username(self) -> str:
        base = re.sub(r"[^a-z0-9._-]+", "", (self.username or "user").lower()).strip("._-") or "user"
        local = base if base.endswith(".up") else f"{base}.up"
        candidate, i = f"{local}@phinmaed.com", 1
        while type(self).objects.filter(email__iexact=candidate).exclude(pk=self.pk).exists():
            core = local[:-3] if local.endswith(".up") else local
            candidate = f"{core}{i}.up@phinmaed.com"
            i += 1
        return candidate

    def save(self, *args, **kwargs):
        # If username is missing but email exists → derive username from email local-part
        if not self.username and self.email:
            local = self.email.split("@")[0]
            self.username = self._unique_username_from_local(local)

        # If email is missing (e.g., createsuperuser username-only) → generate valid PHINMA email
        if not self.email and self.username:
            self.email = self._unique_phinma_email_from_username()

        super().save(*args, **kwargs)