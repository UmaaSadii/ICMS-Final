from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=[
            ("student", "Student"),
            ("instructor", "Instructor"),
            ("admin", "Admin"),
            ("hod", "HOD"),
            ("principal", "Principal")
        ],
        default="student"
    )
    # full name store karne ke liye ek extra field
    name = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.username


class HODRegistrationRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('retired', 'Retired')
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField()
    employee_id = models.CharField(max_length=50)
    phone = models.CharField(max_length=20)
    department = models.ForeignKey('academics.Department', on_delete=models.CASCADE)
    designation = models.CharField(max_length=100, default='HOD')
    experience_years = models.IntegerField(default=0)
    specialization = models.CharField(max_length=100)
    password = models.CharField(max_length=128)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    hod_request_status = models.CharField(max_length=20, choices=[
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('account_created', 'Account Created')
    ], default='pending_approval')
    
    class Meta:
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"{self.name} - {self.status}"



class PrincipalRegistrationRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('retired', 'Retired')
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField()
    employee_id = models.CharField(max_length=50)
    phone = models.CharField(max_length=20)
    department = models.ForeignKey('academics.Department', on_delete=models.SET_NULL, null=True, blank=True)
    designation = models.CharField(max_length=100, default='Principal')
    experience_years = models.IntegerField(default=0)
    specialization = models.CharField(max_length=100)
    password = models.CharField(max_length=128)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    principal_request_status = models.CharField(
        max_length=20,
        choices=[
            ('pending_approval', 'Pending Approval'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('account_created', 'Account Created')
        ],
        default='pending_approval'
    )

    class Meta:
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.name} - {self.status}"
