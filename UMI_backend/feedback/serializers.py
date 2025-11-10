from rest_framework import serializers
from .models import Feedback, Teacher
from instructors.models import Instructor

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            'id',
            'feedback_type',
            'teacher',
            'message',
            'rating',
            'created_at',
            'visible_to_principal'
        ]
        read_only_fields = ['created_at', 'visible_to_principal']

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['id', 'name', 'department']
