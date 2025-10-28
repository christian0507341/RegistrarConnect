# backend/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User
from django import forms

class AdminUserAddForm(forms.ModelForm):
    password1 = forms.CharField(label=_("Password"), widget=forms.PasswordInput)
    password2 = forms.CharField(label=_("Password confirmation"), widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ("email", "role", "student_id", "first_name", "middle_name", "last_name")

    def clean_password2(self):
        p1 = self.cleaned_data.get("password1")
        p2 = self.cleaned_data.get("password2")
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError(_("Passwords don't match."))
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        # username is auto-generated in User.save() – users/admins don’t enter it here
        if commit:
            user.save()
        return user


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    radio_fields = {"role": admin.VERTICAL}
    add_form = AdminUserAddForm                 # ← use our add form (no username)

    list_display = ("id", "email", "role", "student_id",
                    "is_active", "is_staff", "is_superuser")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email", "student_id", "first_name", "last_name")
    ordering = ("id",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),        # username still visible on EDIT page
        (_("Personal info"), {"fields": ("first_name", "middle_name", "last_name")}),
        (_("RegistrarConnect"), {"fields": ("role", "student_id")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

    # ---- Add page: NO username here ----
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "role", "student_id",
                       "first_name", "middle_name", "last_name",
                       "password1", "password2"),
        }),
    )