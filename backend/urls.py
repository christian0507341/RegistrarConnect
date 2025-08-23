from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from backend.accounts.views import EmailTokenObtainPairView  # ← email-only JWT view

urlpatterns = [
    path("admin/", admin.site.urls),

    # User-facing auth (register + login)
    path("api/auth/", include("backend.accounts.urls")),  # ← was 'api/accounts/'

    # JWT (email-only)
    path("api/token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Other APIs
    path("api/document-requests/", include("backend.document_requests.urls")),
    path("api/appointments/", include("backend.appointments.urls")),
]
