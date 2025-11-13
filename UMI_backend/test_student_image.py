#!/usr/bin/env python
import os
import sys
import django
from io import BytesIO
from PIL import Image

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UMI_backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from students.models import Student
from academics.models import Department
import json

def create_test_image():
    """Create a test image file"""
    image = Image.new('RGB', (100, 100), color='red')
    image_io = BytesIO()
    image.save(image_io, format='JPEG')
    image_io.seek(0)
    return SimpleUploadedFile(
        name='test_image.jpg',
        content=image_io.getvalue(),
        content_type='image/jpeg'
    )

def test_student_image_upload():
    print("Testing student creation with image upload...")
    
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
    
    # Get or create a department
    try:
        dept = Department.objects.first()
        if not dept:
            dept = Department.objects.create(
                name='Test Department',
                code='TEST',
                description='Test Department',
                num_semesters=4
            )
    except Exception as e:
        print(f"Error getting department: {e}")
        return
    
    # Create a test client
    client = Client()
    client.force_login(user)
    
    # Create test image
    test_image = create_test_image()
    
    # Test data
    import time
    timestamp = str(int(time.time()))
    test_data = {
        'first_name': 'Test',
        'last_name': 'Student',
        'email': f'teststudent{timestamp}@test.com',
        'password': 'test123',
        'department_id': dept.department_id,
        'registration_number': f'REG{timestamp}',
        'phone': '1234567890',
        'gender': 'male',
        'image': test_image
    }
    
    # Make POST request
    response = client.post('/api/students/', data=test_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.content.decode()}")
    
    if response.status_code == 201:
        print("SUCCESS: Student created successfully with image!")
        
        # Check if image was saved
        try:
            response_data = json.loads(response.content.decode())
            student_id = response_data['student']['student_id']
            student = Student.objects.get(student_id=student_id)
            
            if student.image:
                print(f"SUCCESS: Image saved at: {student.image.url}")
            else:
                print("WARNING: No image was saved")
            
            # Clean up
            if student.image:
                student.image.delete()
            student.delete()
            print("SUCCESS: Test cleanup completed")
            
        except Exception as e:
            print(f"Error during verification: {e}")
        
    else:
        print("ERROR: Student creation failed")
        try:
            error_data = json.loads(response.content.decode())
            print(f"Error details: {error_data}")
        except:
            print(f"Raw response: {response.content.decode()}")

if __name__ == '__main__':
    test_student_image_upload()