from rest_framework.permissions import BasePermission
from backend.accounts.models import User

class IsFaculty(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Roles.FACULTY