from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Feedback, Teacher
from .serializers import FeedbackSerializer, TeacherSerializer


# ---- Student creates feedback ----
class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny]  # ✅ anonymous allowed

    def perform_create(self, serializer):
        # ✅ feedback anonymously save hoga
        serializer.save()

    def list(self, request):
        # ✅ HOD/Principal jab feedback dekhenge to sab anonymous dikhega
        feedbacks = Feedback.objects.all()
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)


# ---- HOD allows feedback to be visible to principal ----
class HODFeedbackViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        feedbacks = Feedback.objects.all()
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def allow_principal(self, request, pk=None):
        try:
            feedback = Feedback.objects.get(pk=pk)
        except Feedback.DoesNotExist:
            return Response({'error': 'Feedback not found'}, status=status.HTTP_404_NOT_FOUND)

        feedback.visible_to_principal = True
        feedback.save()
        return Response({'status': 'Feedback allowed for principal'})


# ---- Principal view ----
class PrincipalFeedbackViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        feedbacks = Feedback.objects.filter(visible_to_principal=True)
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)


# ---- Teacher list API ----
class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
