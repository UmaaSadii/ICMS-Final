from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    """
    Admin, principal, and director roles ko allow karega
    """
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role in ['admin', 'principal', 'director'])