from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstructorViewSet, InstructorProfileView, InstructorDashboardDataView, AttendanceReportsView, HODRecordsView
from .timetable_views import instructor_timetable, debug_instructor_mapping
from . import attendance_urls

router = DefaultRouter()
router.register(r'instructor', InstructorViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', InstructorProfileView.as_view(), name='instructor-profile'),
    path('dashboard-data/', InstructorDashboardDataView.as_view(), name='instructor-dashboard-data'),
    path('attendance/reports/', AttendanceReportsView.as_view(), name='attendance-reports'),
    path('hods/', HODRecordsView.as_view(), name='hod-records'),
    path('timetable/', instructor_timetable, name='instructor-timetable'),
    path('debug-mapping/', debug_instructor_mapping, name='debug-instructor-mapping'),
    path('', include(attendance_urls)),
]
