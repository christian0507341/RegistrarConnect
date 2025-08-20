# backend/accounts/urls.py
from django.urls import path
from .views import RegisterView, LoginView, UserProfileView, VerifyEmailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('verify-email/', VerifyEmailView.as_view(), name='email-verify')
]
