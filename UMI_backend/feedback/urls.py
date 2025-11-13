from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedbackViewSet, TeacherViewSet, HODFeedbackViewSet, PrincipalFeedbackViewSet

router = DefaultRouter()
router.register(r'feedback', FeedbackViewSet, basename='feedback')
router.register(r'teachers', TeacherViewSet, basename='teachers')

urlpatterns = [
    path('', include(router.urls)),
    path('hod/feedbacks/', HODFeedbackViewSet.as_view({'get': 'list'}), name='hod-feedbacks'),
    path('hod/feedbacks/<int:pk>/allow/', HODFeedbackViewSet.as_view({'patch': 'allow_principal'}), name='allow-feedback'),
    path('principal/feedbacks/', PrincipalFeedbackViewSet.as_view({'get': 'list'}), name='principal-feedbacks'),
]
