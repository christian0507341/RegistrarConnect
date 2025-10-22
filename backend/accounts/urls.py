# backend/accounts/urls.py
from django.urls import path
from .views import RegisterView, LoginView
from .views import get_me
from .admin_views import (
    admin_dashboard_stats,
    admin_users_list,
    admin_user_detail,
    admin_create_user,
    admin_update_user,
    admin_delete_user,
    admin_activity_logs,
    admin_system_reports,
)
from .system_settings_views import (
    get_system_settings,
    update_system_settings,
    reset_system_settings,
)
from .profile_views import (
    update_profile,
    change_password,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="api_register"),
    path("login/",    LoginView.as_view(),    name="api_login"),
    path("me/", get_me, name="get_me"),
    path("me/update/", update_profile, name="update_profile"),
    path("change-password/", change_password, name="change_password"),
    
    # Admin endpoints
    path("admin/stats/", admin_dashboard_stats, name="admin_dashboard_stats"),
    path("admin/users/", admin_users_list, name="admin_users_list"),
    path("admin/users/create/", admin_create_user, name="admin_create_user"),
    path("admin/users/<int:pk>/", admin_user_detail, name="admin_user_detail"),
    path("admin/users/<int:pk>/update/", admin_update_user, name="admin_update_user"),
    path("admin/users/<int:pk>/delete/", admin_delete_user, name="admin_delete_user"),
    path("admin/logs/", admin_activity_logs, name="admin_activity_logs"),
    path("admin/reports/", admin_system_reports, name="admin_system_reports"),
    
    # System settings endpoints
    path("admin/settings/", get_system_settings, name="get_system_settings"),
    path("admin/settings/update/", update_system_settings, name="update_system_settings"),
    path("admin/settings/reset/", reset_system_settings, name="reset_system_settings"),
]
