from django.urls import path, include
from .views import (
    
    StudentResultListCreateEnhanced,
    DepartmentCourseResultsView,
    DepartmentCoursesView,
    StudentPromotionActionView,
)
from students.views import StudentDashboardView
from .viewsets import DepartmentViewSet, SemesterViewSet, CourseViewSet
from .hod_views import HODTimetableView
from .class_management_views import ClassFormDataView, FilteredDataView
from .simple_data_view import SimpleDataView
<<<<<<< HEAD
from .attendance_views import (
    TimetableBasedAttendanceView,
    MarkTimetableAttendanceView,
    SubmitAttendanceView,
    RequestAttendanceEditView,
    AdminAttendancePermissionsView,
    TimetableStudentsView
)
from .instructor_edit_views import (
    InstructorSubmittedAttendanceView,
    InstructorEditRequestsView
)
from .simple_edit_request_view import SimpleEditRequestView
from .admin_attendance_views import (
    AdminAttendanceView,
    AdminAttendanceStatsView
)
from .simple_admin_view import SimpleAdminPermissionsView
=======
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'semesters', SemesterViewSet)
router.register(r'courses', CourseViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # Enhanced result management endpoints
    path("students/<str:student_id>/results/professional/", StudentResultListCreateEnhanced.as_view()),
    path("departments/<int:department_id>/courses/<int:course_id>/results/professional/", DepartmentCourseResultsView.as_view()),

    # Promotion endpoint
    path("students/<str:student_id>/promotion/professional/", StudentPromotionActionView.as_view()),

    # Department courses endpoint
    path("departments/<int:department_id>/courses/", DepartmentCoursesView.as_view()),

    # Student dashboard
    path("dashboard/<str:student_id>/", StudentDashboardView, name="student-dashboard"),
    
    # HOD timetable
    path("hod/timetable/", HODTimetableView.as_view(), name="hod-timetable"),
    path("hod/timetable/<int:timetable_id>/", HODTimetableView.as_view(), name="hod-timetable-detail"),
    
    # Class management
    path("class/form-data/", ClassFormDataView.as_view(), name="class-form-data"),
    path("class/filtered-data/", FilteredDataView.as_view(), name="filtered-data"),
    path("data/", SimpleDataView.as_view(), name="simple-data"),
<<<<<<< HEAD
    
    # Strict Attendance Management
    path("attendance/timetable/active/", TimetableBasedAttendanceView.as_view(), name="active-slots"),
    path("attendance/timetable/mark/", MarkTimetableAttendanceView.as_view(), name="mark-attendance"),
    path("attendance/timetable/submit/", SubmitAttendanceView.as_view(), name="submit-attendance"),
    path("attendance/timetable/<int:timetable_id>/students/", TimetableStudentsView.as_view(), name="timetable-students"),
    path("attendance/edit-request/", SimpleEditRequestView.as_view(), name="simple-edit-request"),
    path("attendance/submitted/", InstructorSubmittedAttendanceView.as_view(), name="instructor-submitted"),
    path("attendance/edit-requests/", InstructorEditRequestsView.as_view(), name="instructor-requests"),
    path("admin/attendance/permissions/", SimpleAdminPermissionsView.as_view(), name="admin-permissions"),
    path("admin/attendance/", AdminAttendanceView.as_view(), name="admin-attendance"),
    path("admin/attendance/stats/", AdminAttendanceStatsView.as_view(), name="admin-attendance-stats"),
=======
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
]