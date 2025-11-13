#!/usr/bin/env python
"""
Create simple attendance data for testing strict attendance system
"""
import os
import sys
import django
from datetime import datetime, time, date, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UMI_backend.settings')
django.setup()

from academics.models import Department, Semester, Course, Timetable, Attendance, AttendanceEditPermission
from instructors.models import Instructor
from students.models import Student
from register.models import User

def create_simple_data():
    print("Creating simple attendance data...")
    
    # Check existing data
    print(f"Existing data:")
    print(f"- Departments: {Department.objects.count()}")
    print(f"- Instructors: {Instructor.objects.count()}")
    print(f"- Students: {Student.objects.count()}")
    print(f"- Timetables: {Timetable.objects.count()}")
    print(f"- Attendance: {Attendance.objects.count()}")
    
    # Create a simple timetable if none exists
    if Timetable.objects.count() == 0:
        print("Creating basic timetable...")
        
        # Get or create basic data
        dept, _ = Department.objects.get_or_create(
            code='CS',
            defaults={'name': 'Computer Science', 'description': 'CS Department'}
        )
        
        sem, _ = Semester.objects.get_or_create(
            semester_code='CS-S1',
            defaults={'name': 'Semester 1', 'program': 'CS', 'department': dept}
        )
        
        course, _ = Course.objects.get_or_create(
            code='CS101',
            defaults={'name': 'Programming', 'semester': sem, 'credits': 3}
        )
        
        # Create instructor if none exists
        if Instructor.objects.count() == 0:
            user, _ = User.objects.get_or_create(
                email='instructor@test.com',
                defaults={'username': 'instructor@test.com', 'role': 'instructor'}
            )
            
            instructor, _ = Instructor.objects.get_or_create(
                user=user,
                defaults={
                    'name': 'Test Instructor',
                    'phone': '+1234567890',
                    'department': dept,
                    'specialization': 'Programming'
                }
            )
        else:
            instructor = Instructor.objects.first()
        
        # Create timetable
        timetable, created = Timetable.objects.get_or_create(
            course=course,
            instructor=instructor,
            day='monday',
            start_time=time(9, 0),
            defaults={
                'end_time': time(10, 30),
                'room': 'CS-101'
            }
        )
        
        if created:
            print(f"Created timetable: {timetable}")
    
    # Create students if none exist
    if Student.objects.count() == 0:
        print("Creating test students...")
        
        dept = Department.objects.first()
        sem = Semester.objects.first()
        
        for i in range(1, 6):
            user, _ = User.objects.get_or_create(
                email=f'student{i}@test.com',
                defaults={'username': f'student{i}@test.com', 'role': 'student'}
            )
            
            student, created = Student.objects.get_or_create(
                student_id=f'CS202400{i}',
                defaults={
                    'user': user,
                    'name': f'Test Student {i}',
                    'email': f'student{i}@test.com',
                    'semester': sem,
                    'department': dept,
                    'phone': f'+155500{i}'
                }
            )
            
            if created:
                print(f"Created student: {student.name}")
    
    # Create some attendance records for testing
    print("Creating test attendance records...")
    
    timetables = Timetable.objects.all()[:3]  # Get first 3 timetables
    students = Student.objects.all()[:5]      # Get first 5 students
    
    # Create attendance for the last 3 days
    for i in range(3, 0, -1):
        test_date = date.today() - timedelta(days=i)
        
        for timetable in timetables:
            for j, student in enumerate(students):
                # Create some variation in attendance
                import random
                status = random.choice(['Present', 'Present', 'Absent', 'Late'])
                
                attendance, created = Attendance.objects.get_or_create(
                    student=student,
                    course=timetable.course,
                    instructor=timetable.instructor,
                    timetable=timetable,
                    date=test_date,
                    defaults={
                        'status': status,
                        'marked_by': timetable.instructor,
                        'is_submitted': True,
                        'can_edit': False
                    }
                )
                
                if created:
                    print(f"Created attendance: {student.name} - {status} - {test_date}")
    
    # Create some edit permission requests
    print("Creating edit permission requests...")
    
    recent_absent = Attendance.objects.filter(
        status='Absent',
        date__gte=date.today() - timedelta(days=2)
    )[:2]
    
    for attendance in recent_absent:
        permission, created = AttendanceEditPermission.objects.get_or_create(
            instructor=attendance.instructor,
            attendance=attendance,
            defaults={
                'reason': f'Student {attendance.student.name} was actually present but marked absent by mistake.',
                'proposed_status': 'Present',
                'status': 'pending'
            }
        )
        
        if created:
            print(f"Created edit request: {attendance.student.name} - {attendance.date}")
    
    print("\n=== FINAL SUMMARY ===")
    print(f"Departments: {Department.objects.count()}")
    print(f"Semesters: {Semester.objects.count()}")
    print(f"Courses: {Course.objects.count()}")
    print(f"Instructors: {Instructor.objects.count()}")
    print(f"Students: {Student.objects.count()}")
    print(f"Timetables: {Timetable.objects.count()}")
    print(f"Attendance Records: {Attendance.objects.count()}")
    print(f"Edit Requests: {AttendanceEditPermission.objects.count()}")
    
    # Show today's timetable
    today = date.today()
    today_day = today.strftime('%A').lower()
    today_timetables = Timetable.objects.filter(day=today_day)
    
    print(f"\n=== TODAY'S SCHEDULE ({today.strftime('%A')}) ===")
    if today_timetables:
        for tt in today_timetables:
            print(f"{tt.course.name} - {tt.instructor.name}")
            print(f"  Time: {tt.start_time} - {tt.end_time} | Room: {tt.room}")
            print(f"  Students: {Student.objects.filter(semester=tt.course.semester).count()}")
    else:
        print("No classes scheduled for today")
    
    print(f"\n=== INSTRUCTOR INFO ===")
    for instructor in Instructor.objects.all():
        print(f"{instructor.name}: {instructor.user.email if instructor.user else 'No email'} (ID: {instructor.pk})")

if __name__ == '__main__':
    create_simple_data()