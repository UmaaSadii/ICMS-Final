#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UMI_backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from academics.models import Department, Semester
import json

def test_department_creation():
    print("Testing department creation...")
    
    # Create a test user
    User = get_user_model()
    try:
        user = User.objects.get(username='testuser')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='test123',
            role='admin'
        )
    
    # Create a test client
    client = Client()
    client.force_login(user)
    
    # Test data - use timestamp to ensure uniqueness
    import time
    timestamp = str(int(time.time()))
    test_data = {
        'name': f'Test Dept {timestamp[-4:]}',
        'code': f'T{timestamp[-3:]}',  # Keep code short (max 10 chars)
        'description': 'Test Department for API testing',
        'num_semesters': 4
    }
    
    # Make POST request
    response = client.post(
        '/api/academics/departments/',
        data=json.dumps(test_data),
        content_type='application/json'
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.content.decode()}")
    
    if response.status_code == 201:
        print("SUCCESS: Department created successfully!")
        
        # Check if semesters were created
        dept = Department.objects.get(code=test_data['code'])
        semesters = Semester.objects.filter(department=dept)
        print(f"SUCCESS: Created {semesters.count()} semesters for the department")
        
        # Clean up
        dept.delete()
        print("SUCCESS: Test cleanup completed")
        
    else:
        print("ERROR: Department creation failed")
        try:
            error_data = json.loads(response.content.decode())
            print(f"Error details: {error_data}")
        except:
            print(f"Raw response: {response.content.decode()}")

if __name__ == '__main__':
    test_department_creation()