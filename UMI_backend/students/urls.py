from django.urls import path, include
from rest_framework.routers import DefaultRouter
<<<<<<< HEAD
from .views import StudentViewSet, StudentProfileView, student_department_filter
=======
from .views import StudentViewSet, StudentProfileView
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
from .analytics_views import student_analytics_dashboard, department_analytics, course_analytics

router = DefaultRouter()
router.register(r'', StudentViewSet)

urlpatterns = [
    # ✅ profile pehle likho
    path('profile/', StudentProfileView.as_view(), name='student-profile'),
<<<<<<< HEAD
    path('department-filter/', student_department_filter, name='student-department-filter'),
=======
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
    
    # ✅ Analytics endpoints
    path('analytics/dashboard/', student_analytics_dashboard, name='student-analytics-dashboard'),
    path('analytics/department/', department_analytics, name='department-analytics'),
    path('analytics/courses/', course_analytics, name='course-analytics'),

    # ✅ baad me router include karo
    path('', include(router.urls)),
]