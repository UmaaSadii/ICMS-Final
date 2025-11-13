from django.urls import path
from .attendance_views import (
    DepartmentStudentsView, BulkAttendanceView, InstructorDepartmentsView, 
    DepartmentSemestersView, SubmitTodayAttendanceView, CheckTodayAttendanceStatusView
)
from .test_attendance_view import (
    TestBulkAttendanceView, TestSubmitAttendanceView, TestAttendanceStatusView
)

urlpatterns = [
    # Attendance related endpoints
    path('departments/', InstructorDepartmentsView.as_view(), name='instructor-departments'),
    path('departments/<int:department_id>/semesters/', DepartmentSemestersView.as_view(), name='department-semesters'),
    path('departments/<int:department_id>/semesters/<int:semester_id>/students/', DepartmentStudentsView.as_view(), name='department-students'),
    path('attendance/bulk/', BulkAttendanceView.as_view(), name='bulk-attendance'),
    path('attendance/submit-today/', SubmitTodayAttendanceView.as_view(), name='submit-today-attendance'),
    path('attendance/today-status/', CheckTodayAttendanceStatusView.as_view(), name='today-attendance-status'),
    
    # TEST ENDPOINTS - Remove in production
    path('attendance/test-bulk/', TestBulkAttendanceView.as_view(), name='test-bulk-attendance'),
    path('attendance/test-submit/', TestSubmitAttendanceView.as_view(), name='test-submit-attendance'),
    path('attendance/test-status/', TestAttendanceStatusView.as_view(), name='test-attendance-status'),
]
