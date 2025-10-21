from rest_framework.permissions import BasePermission, SAFE_METHODS

class AllowAnyReadOnly(BasePermission):
    """
    Custom permission to allow read-only access to any request.
    Write access is restricted to authenticated users.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

class IsAdminRoleOrReadOnly(BasePermission):
    """
    Custom permission to only allow admin users to edit objects.
    Read-only access is allowed to any request.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or
            getattr(request.user, 'role', None) in ['admin', 'principal', 'director']
        )

class IsAdminOrInstructorForResultsAttendance(BasePermission):
    """
    Custom permission to allow only admin or instructor users to modify results and attendance.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or
            getattr(request.user, 'role', None) in ['admin', 'principal', 'director', 'instructor']
        )

