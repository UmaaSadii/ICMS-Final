from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register, login, UserDetailView, UserListView, admin_dashboard_cards
)
from .admin_views import AdminViewSet

router = DefaultRouter()
router.register(r'admins', AdminViewSet, basename='admin')

urlpatterns = [
    path('registration/', register, name='register'),       # POST only
    path('login/', login, name='login'),                     # POST login
    path('users/', UserListView.as_view(), name='user-list'),      # GET all users
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),  # GET/PUT/DELETE
    
    # Admin Dashboard
    path('admin/dashboard-cards/', admin_dashboard_cards, name='admin-dashboard-cards'),
    
    # Admin Management API
    path('', include(router.urls)),
]