# backend/accounts/urls.py
from django.urls import path
from .views import RegisterView, LoginView
from .views import get_me


urlpatterns = [
    path("register/", RegisterView.as_view(), name="api_register"),
    path("login/",    LoginView.as_view(),    name="api_login"),
    path("me/", get_me, name="get_me"),
]
