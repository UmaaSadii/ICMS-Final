#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UMI_backend.settings')
django.setup()

from hods.models import HODRegistrationRequest
from register.models import User
from academics.models import Department

def create_sample_hods():
    # Create departments if they don't exist
    departments_data = [
        {'name': 'Computer Science', 'code': 'CS', 'description': 'Computer Science Department'},
        {'name': 'Mathematics', 'code': 'MATH', 'description': 'Mathematics Department'},
        {'name': 'Physics', 'code': 'PHY', 'description': 'Physics Department'},
        {'name': 'Chemistry', 'code': 'CHEM', 'description': 'Chemistry Department'},
        {'name': 'Biology', 'code': 'BIO', 'description': 'Biology Department'},
    ]
    
    for dept_data in departments_data:
        dept, created = Department.objects.get_or_create(
            name=dept_data['name'],
            defaults={
                'code': dept_data['code'],
                'description': dept_data['description']
            }
        )
        if created:
            print(f"Created department: {dept.name}")
    
    # Create sample HOD registration requests
    hod_requests_data = [
        {
            'name': 'Dr. John Smith',
            'email': 'john.smith@university.edu',
            'employee_id': 'EMP001',
            'phone': '+1-555-0101',
            'department_name': 'Computer Science',
            'designation': 'Head of Department',
            'experience_years': 15,
            'specialization': 'Machine Learning & AI',
            'password': 'password123'
        },
        {
            'name': 'Dr. Sarah Johnson',
            'email': 'sarah.johnson@university.edu',
            'employee_id': 'EMP002',
            'phone': '+1-555-0102',
            'department_name': 'Mathematics',
            'designation': 'Head of Department',
            'experience_years': 12,
            'specialization': 'Applied Mathematics',
            'password': 'password123'
        },
        {
            'name': 'Dr. Michael Brown',
            'email': 'michael.brown@university.edu',
            'employee_id': 'EMP003',
            'phone': '+1-555-0103',
            'department_name': 'Physics',
            'designation': 'Head of Department',
            'experience_years': 18,
            'specialization': 'Quantum Physics',
            'password': 'password123'
        }
    ]
    
    for hod_data in hod_requests_data:
        try:
            department = Department.objects.get(name=hod_data['department_name'])
            
            # Check if HOD request already exists
            if not HODRegistrationRequest.objects.filter(email=hod_data['email']).exists():
                hod_request = HODRegistrationRequest.objects.create(
                    name=hod_data['name'],
                    email=hod_data['email'],
                    employee_id=hod_data['employee_id'],
                    phone=hod_data['phone'],
                    department=department,
                    designation=hod_data['designation'],
                    experience_years=hod_data['experience_years'],
                    specialization=hod_data['specialization'],
                    password=hod_data['password'],
                    status='pending'  # Create as pending, admin can approve
                )
                print(f"Created HOD request: {hod_request.name} for {department.name}")
                
                # Also create user account
                if not User.objects.filter(email=hod_data['email']).exists():
                    user = User.objects.create_user(
                        username=hod_data['email'],
                        email=hod_data['email'],
                        password=hod_data['password'],
                        role='hod',
                        name=hod_data['name']
                    )
                    print(f"Created user account: {user.email}")
            else:
                print(f"HOD request already exists for: {hod_data['email']}")
                
        except Department.DoesNotExist:
            print(f"Department not found: {hod_data['department_name']}")
        except Exception as e:
            print(f"Error creating HOD request for {hod_data['name']}: {str(e)}")

if __name__ == '__main__':
    print("Creating sample HOD registration requests...")
    create_sample_hods()
    print("Done!")