from django.db import models
from django.conf import settings
from instructors.models import Instructor

class Student(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="feedback_student"  # ✅ added this
    )
    reg_no = models.CharField(max_length=20)
    department = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username


class Teacher(models.Model):
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)

    def __str__(self):
        return self.name




class Feedback(models.Model):
    FEEDBACK_TYPE_CHOICES = [
        ('teacher', 'Teacher Feedback'),
        ('institute', 'Institute Feedback'),
    ]

    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPE_CHOICES)
    teacher = models.ForeignKey(Instructor, on_delete=models.CASCADE, null=True, blank=True)  # 👈 ye line change karo
    message = models.TextField()
    rating = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    visible_to_principal = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.feedback_type} - Rating {self.rating}"
