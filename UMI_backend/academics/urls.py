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
]