from rest_framework.permissions import BasePermission
from backend.accounts.models import User

class IsFaculty(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Roles.FACULTY

class IsStaffRole(BasePermission):
    """
    Permission class for staff roles (faculty, registrar, finance, admin)
    who can manage document requests
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'role') and request.user.role in ['faculty', 'registrar', 'finance', 'admin']