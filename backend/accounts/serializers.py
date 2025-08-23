from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from .models import User
from .validators import validate_phinma_email, validate_student_id

class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=User.Roles.choices)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "role",
            "student_id",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "password",
            "confirm_password",
        )
        extra_kwargs = {
            "first_name": {"max_length": 50, "required": True},
            "middle_name": {"max_length": 50, "required": False},
            "last_name": {"max_length": 50, "required": True},
        }

    def validate_email(self, value):
        validate_phinma_email(value)
        return value

    def validate_student_id(self, value):
        # Let blank/null pass unless role=student (checked in validate())
        if value in (None, "",):
            return value
        validate_student_id(value)
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        if attrs.get("role") == User.Roles.STUDENT and not attrs.get("student_id"):
            raise serializers.ValidationError({"student_id": "Student ID is required for students."})
        return attrs

    def create(self, validated):
        validated.pop("confirm_password", None)
        password = validated.pop("password")
        user = User.objects.create(**validated)  # username auto‑fills from email
        user.set_password(password)
        user.is_active = True
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=User.Roles.choices)  # radio on frontend
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    # response fields
    name = serializers.CharField(read_only=True)
    role_out = serializers.CharField(read_only=True)

    def validate(self, attrs):
        email = attrs["email"]
        password = attrs["password"]
        role = attrs["role"]

        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(email__iexact=email)
        except UserModel.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        if not check_password(password, user.password):
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("User is inactive.")
        if user.role != role:
            raise serializers.ValidationError("Role does not match this account.")

        attrs["user"] = user
        attrs["role_out"] = user.role
        attrs["name"] = f"{user.first_name} {user.last_name}".strip() or user.email
        return attrs
