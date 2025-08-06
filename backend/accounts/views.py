from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer
from .models import User
from django.core.mail import send_mail
from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site
from .tokens import email_verification_token
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model
from .mongodb import users_collection
from .serializers import RegisterSerializer
from bson import ObjectId
from rest_framework import serializers


User = get_user_model()


class VerifyEmailView(APIView):
    def get(self, request):
        token = request.GET.get('token')
        uid = request.GET.get('uid')

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)

            if email_verification_token.check_token(user, token):
                user.is_active = True
                user.save()
                return Response({'message': 'Email successfully verified!'}, status=200)
            else:
                return Response({'error': 'Invalid or expired token.'}, status=400)

        except Exception as e:
            return Response({'error': 'Something went wrong.'}, status=400)

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate token
        token = email_verification_token.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        current_site = get_current_site(request).domain
        relative_link = reverse('email-verify')
        absurl = f"http://{current_site}{relative_link}?token={token}&uid={uid}"

        send_mail(
            subject="Verify your RegistrarConnect account",
            message=f"Click the link to verify: {absurl}",
            from_email=DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )

        return Response({"msg": "Registration successful. Please verify your email."}, status=201)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
        })

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[('student', 'Student'), ('alumni', 'Alumni'), ('registrar', 'Registrar')])

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs