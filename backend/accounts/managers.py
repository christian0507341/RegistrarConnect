from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email=None, username=None, password=None, **extra_fields):
        """
        Create and return a regular user.
        - Students and Faculty must have an email.
        - Superusers can be created with just a username.
        """
        if not username and not email:
            raise ValueError("The given username or email must be set")

        # For students/faculty (normal users), require email
        role = extra_fields.get("role")
        if role in ("student", "faculty") and not email:
            raise ValueError("Email is required for students and faculty")

        user = self.model(
            email=self.normalize_email(email) if email else None,
            username=username,
            **extra_fields,
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        """
        Create and return a superuser (IT manager).
        Username is required. Email is optional for superusers.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if not username:
            raise ValueError("Superuser must have a username")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(username=username, password=password, **extra_fields)
