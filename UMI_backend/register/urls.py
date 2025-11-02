from django.urls import path
from .views import (
    register, login, UserDetailView, UserListView,
    hod_registration_request, get_hod_requests, review_hod_request, admin_dashboard_cards
)
from .hod_views import HODRequestListView, HODRequestActionView
from .hod_management_views import (
    HODRecordDetailView, HODRecordListView, HODDepartmentListView, HODStatsView, CreateHODFromRequestView
)

urlpatterns = [
    path('registration/', register, name='register'),       # POST only
    path('login/', login, name='login'),                     # POST login
    path('users/', UserListView.as_view(), name='user-list'),      # GET all users
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),  # GET/PUT/DELETE
    
    # HOD Registration
    path('hod-registration/', hod_registration_request, name='hod-registration'),
    path('hod-requests/', get_hod_requests, name='hod-requests'),
    path('hod-requests/<int:request_id>/review/', review_hod_request, name='review-hod-request'),
    
    # HOD Request Management (New Professional API)
    path('admin/hod-requests/', HODRequestListView.as_view(), name='admin-hod-requests'),
    path('admin/hod-requests/<int:request_id>/action/', HODRequestActionView.as_view(), name='admin-hod-action'),
    
    # HOD Record Management
    path('admin/hod-records/', HODRecordListView.as_view(), name='admin-hod-records'),
    path('admin/hod-records/<int:pk>/', HODRecordDetailView.as_view(), name='admin-hod-record-detail'),
    path('admin/hod-departments/', HODDepartmentListView.as_view(), name='admin-hod-departments'),
    path('admin/hod-stats/', HODStatsView.as_view(), name='admin-hod-stats'),
    path('admin/create-hod-from-request/', CreateHODFromRequestView.as_view(), name='create-hod-from-request'),
    
    # Admin Dashboard
    path('admin/dashboard-cards/', admin_dashboard_cards, name='admin-dashboard-cards'),
]