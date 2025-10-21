from django.urls import path, include
from .views import (
    
    StudentResultListCreateEnhanced,
    DepartmentCourseResultsView,
    DepartmentCoursesView,
    StudentPromotionActionView,
)
from students.views import StudentDashboardView
from .viewsets import DepartmentViewSet, SemesterViewSet, CourseViewSet
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
]