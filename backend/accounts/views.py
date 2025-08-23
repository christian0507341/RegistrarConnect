from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework import serializers
from rest_framework_simplejwt.views import TokenViewBase
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from .models import User

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.validated_data["user"]
        return Response({
            "message": "Logged in",
            "role": ser.validated_data["role_out"],
            "name": ser.validated_data["name"],
            "email": user.email,
        })

class EmailTokenObtainPairSerializer(serializers.Serializer):
    # Frontend sends a radio "role" + email + password
    role = serializers.ChoiceField(choices=User.Roles.choices)
    email = serializers.EmailField()
    password = serializers.CharField()

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

        # Issue JWTs
        refresh = RefreshToken.for_user(user)
        name = f"{user.first_name} {user.last_name}".strip() or user.email

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
            "name": name,
            "email": user.email,
        }

class EmailTokenObtainPairView(TokenViewBase):
    serializer_class = EmailTokenObtainPairSerializer