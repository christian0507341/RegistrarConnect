from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from backend.accounts.views import EmailTokenObtainPairView, get_me
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # User-facing auth (register + login)
    path("api/auth/", include("backend.accounts.urls")),

    # JWT (email-only)
    path("api/token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # User profile endpoint
    path("api/auth/me/", get_me, name="get_me"),

    # Other APIs
    path("api/document-requests/", include("backend.document_requests.urls")),
    path("api/appointments/", include("backend.appointments.urls")),
    path("api/ai/", include("backend.ai.urls")),
    # Alias for accounts endpoints (legacy clients may call /api/accounts/)
    path("api/accounts/", include("backend.accounts.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
