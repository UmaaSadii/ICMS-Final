from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstructorViewSet, InstructorProfileView, InstructorDashboardDataView, AttendanceReportsView, HODRecordsView
<<<<<<< HEAD
from .timetable_views import instructor_timetable, debug_instructor_mapping, current_user_info
=======
from .timetable_views import instructor_timetable, debug_instructor_mapping
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
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
<<<<<<< HEAD
    path('current-user/', current_user_info, name='current-user-info'),

=======
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
    path('', include(attendance_urls)),
]
