from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=[
            ("student", "Student"),
            ("instructor", "Instructor"),
            ("admin", "Admin"),
            ("hod", "HOD")
        ],
        default="student"
    )
    # full name store karne ke liye ek extra field
    name = models.CharField(max_length=100, null=True, blank=True)
    # profile image field
    profile_image = models.ImageField(upload_to='uploads/admin_images/', null=True, blank=True)

    def __str__(self):
        return self.username