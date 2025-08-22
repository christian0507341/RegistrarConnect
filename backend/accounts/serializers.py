import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model

User = get_user_model()

PHINMAED_PATTERN = re.compile(r'.+\.up@phinmaed\.com$', re.IGNORECASE)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'middle_name', 'last_name', 'role')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'middle_name', 'last_name', 'password', 'password2', 'role')

    def validate_email(self, value):
        if not PHINMAED_PATTERN.search(value or ''):
            raise serializers.ValidationError(
                "Use your PHINMAED email ending with '.up@phinmaed.com' (e.g., firstname.lastname.up@phinmaed.com)."
            )
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password2')
        user = User(**validated_data)
        user.is_active = True  # skip verification for now
        user.set_password(password)
        user.save()
        return user
