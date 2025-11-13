from rest_framework.permissions import BasePermission

class IsAdminOrInstructorForResultsAttendance(BasePermission):
    """
    Permission class for results and attendance management.
    Allows access to admin users and instructors.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Allow admin users
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Check if user has instructor profile
        if hasattr(request.user, 'instructor_profile'):
            return True
        
        return False

class IsAdminRoleOrReadOnly(BasePermission):
    """
    Permission class that allows admin users full access and read-only for others.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Allow read operations for authenticated users
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Allow write operations only for admin users
        return request.user.is_staff or request.user.is_superuser

class AllowAnyReadOnly(BasePermission):
    """
<<<<<<< HEAD
    Permission class that allows read-only access to anyone and write access to authenticated users.
=======
    Permission class that allows read-only access to anyone.
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
    """
    
    def has_permission(self, request, view):
        # Allow read operations for anyone
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
<<<<<<< HEAD
        # For write operations, check authentication
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Allow write operations for authenticated users (including admin and regular users)
=======
        # Require authentication for write operations
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Allow write operations for authenticated users
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
        return True