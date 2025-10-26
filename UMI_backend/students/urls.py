from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, StudentProfileView

router = DefaultRouter()
router.register(r'', StudentViewSet)

urlpatterns = [
    # ✅ profile pehle likho
    path('profile/', StudentProfileView.as_view(), name='student-profile'),

    # ✅ baad me router include karo
    path('', include(router.urls)),
]