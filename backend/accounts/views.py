from rest_framework import generics, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings

from .serializers import RegisterSerializer, UserSerializer
from .tokens import email_verification_token

User = get_user_model()


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.GET.get('token')
        uid = request.GET.get('uid')
        if not token or not uid:
            return Response({'error': 'Invalid verification link.'}, status=400)
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except Exception:
            return Response({'error': 'Invalid verification link.'}, status=400)

        if email_verification_token.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({'message': 'Email successfully verified!'}, status=200)
        return Response({'error': 'Invalid or expired token.'}, status=400)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        token = email_verification_token.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        current_site = get_current_site(request).domain
        absurl = f"http://{current_site}{reverse('email-verify')}?token={token}&uid={uid}"

        send_mail(
            subject="Verify your RegistrarConnect account",
            message=f"Click the link to verify: {absurl}",
            from_email=settings.DEFAULT_FROM_EMAIL,
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

class FacultyListView(generics.ListAPIView):
    queryset = User.objects.filter(role="faculty")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]