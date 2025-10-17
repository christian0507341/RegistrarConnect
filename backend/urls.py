from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from backend.accounts.views import EmailTokenObtainPairView

urlpatterns = [
    path("admin/", admin.site.urls),

    # User-facing auth (register + login)
    path("api/auth/", include("backend.accounts.urls")),

    # JWT (email-only)
    path("api/token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Other APIs
    path("api/document-requests/", include("backend.document_requests.urls")),
    path("api/appointments/", include("backend.appointments.urls")),
    path("api/ai/", include("backend.ai.urls")),
    path("web/", include("backend.document_requests.urls")),  # Added for /web/statuses/

    #path('api/document-requests/<int:pk>/status/', DocumentRequestStatusUpdateView.as_view(), name='document-request-status-update'),
]