from django.urls import path
from .views import (
    HODRequestListView, HODRequestActionView,
    hod_registration_request, get_hod_requests, review_hod_request, hod_profile
)
from .management_views import (
    HODRecordDetailView, HODRecordListView, HODDepartmentListView, 
    HODStatsView, CreateHODFromRequestView, HODRetireView, HODRetiredListView
)
from .timetable_views import HODTimetableView, delete_timetable
from django.http import JsonResponse

def test_hod_endpoint(request):
    return JsonResponse({'message': 'HOD endpoint working'})

urlpatterns = [
    # Test endpoint
    path('test/', test_hod_endpoint, name='hod-test'),
    # HOD Profile
    path('profile/', hod_profile, name='hod-profile'),
    
    # HOD Registration
    path('registration/', hod_registration_request, name='hod-registration'),
    path('requests/', get_hod_requests, name='hod-requests'),
    path('requests/<int:request_id>/review/', review_hod_request, name='review-hod-request'),
    
    # HOD Request Management (Admin API)
    path('admin/requests/', HODRequestListView.as_view(), name='admin-hod-requests'),
    path('admin/requests/<int:request_id>/action/', HODRequestActionView.as_view(), name='admin-hod-action'),
    
    # HOD Record Management (Admin API)
    path('admin/records/', HODRecordListView.as_view(), name='admin-hod-records'),
    path('admin/records/<int:pk>/', HODRecordDetailView.as_view(), name='admin-hod-record-detail'),
    path('admin/departments/', HODDepartmentListView.as_view(), name='admin-hod-departments'),
    path('admin/stats/', HODStatsView.as_view(), name='admin-hod-stats'),
    path('admin/create-from-request/', CreateHODFromRequestView.as_view(), name='create-hod-from-request'),
    path('admin/records/<int:pk>/retire/', HODRetireView.as_view(), name='retire-hod'),
    path('admin/retired/', HODRetiredListView.as_view(), name='admin-retired-hods'),
    
    # HOD Timetable Management
    path('timetable/', HODTimetableView.as_view(), name='hod-timetable'),
    path('timetable/<int:timetable_id>/', delete_timetable, name='hod-timetable-delete'),
]