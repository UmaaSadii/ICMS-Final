#!/usr/bin/env python
"""
Create dummy timetable and attendance data for testing strict attendance system
"""
import os
import sys
import django
from datetime import datetime, time, date, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UMI_backend.settings')
django.setup()

from academics.models import Department, Semester, Course, Timetable, Attendance
from instructors.models import Instructor
from students.models import Student
from register.models import User

def create_dummy_data():
    print("Creating dummy timetable and attendance data...")
    
    # Get or create departments
    cs_dept, _ = Department.objects.get_or_create(
        code='CS',
        defaults={
            'name': 'Computer Science',
            'description': 'Computer Science Department',
            'num_semesters': 8
        }
    )
    
    ee_dept, _ = Department.objects.get_or_create(
        code='EE',
        defaults={
            'name': 'Electrical Engineering',
            'description': 'Electrical Engineering Department',
            'num_semesters': 8
        }
    )
    
    # Get or create semesters
    cs_sem1, _ = Semester.objects.get_or_create(
        semester_code='CS-S1',
        defaults={
            'name': 'Semester 1',
            'program': 'Computer Science',
            'capacity': 30,
            'department': cs_dept
        }
    )
    
    cs_sem3, _ = Semester.objects.get_or_create(
        semester_code='CS-S3',
        defaults={
            'name': 'Semester 3',
            'program': 'Computer Science',
            'capacity': 30,
            'department': cs_dept
        }
    )
    
    ee_sem1, _ = Semester.objects.get_or_create(
        semester_code='EE-S1',
        defaults={
            'name': 'Semester 1',
            'program': 'Electrical Engineering',
            'capacity': 25,
            'department': ee_dept
        }
    )
    
    # Get or create courses
    courses_data = [
        {'code': 'CS101', 'name': 'Programming Fundamentals', 'semester': cs_sem1, 'credits': 3},
        {'code': 'CS102', 'name': 'Data Structures', 'semester': cs_sem1, 'credits': 4},
        {'code': 'CS301', 'name': 'Database Systems', 'semester': cs_sem3, 'credits': 3},
        {'code': 'CS302', 'name': 'Software Engineering', 'semester': cs_sem3, 'credits': 4},
        {'code': 'EE101', 'name': 'Circuit Analysis', 'semester': ee_sem1, 'credits': 4},
        {'code': 'EE102', 'name': 'Digital Logic', 'semester': ee_sem1, 'credits': 3},
    ]
    
    courses = {}
    for course_data in courses_data:
        course, _ = Course.objects.get_or_create(
            code=course_data['code'],
            defaults={
                'name': course_data['name'],
                'semester': course_data['semester'],
                'credits': course_data['credits'],
                'description': f"{course_data['name']} course"
            }
        )
        courses[course_data['code']] = course
    
    # Get or create instructors
    instructors_data = [
        {'name': 'Dr. John Smith', 'email': 'john.smith@university.edu', 'specialization': 'Programming'},
        {'name': 'Dr. Sarah Johnson', 'email': 'sarah.johnson@university.edu', 'specialization': 'Database Systems'},
        {'name': 'Dr. Mike Wilson', 'email': 'mike.wilson@university.edu', 'specialization': 'Software Engineering'},
        {'name': 'Dr. Lisa Brown', 'email': 'lisa.brown@university.edu', 'specialization': 'Circuit Design'},
    ]
    
    instructors = {}
    for i, inst_data in enumerate(instructors_data, 1):
        # Create user if doesn't exist
        user, _ = User.objects.get_or_create(
            email=inst_data['email'],
            defaults={
                'username': inst_data['email'],
                'role': 'instructor',
                'is_active': True
            }
        )
        
        instructor, _ = Instructor.objects.get_or_create(
            user=user,
            defaults={
                'employee_id': f'INST{i:03d}',
                'name': inst_data['name'],
                'phone': f'+1234567{i:03d}',
                'department': cs_dept if i <= 3 else ee_dept,
                'designation': 'Assistant Professor',
                'specialization': inst_data['specialization'],
                'experience_years': 5 + i
            }
        )
        instructors[inst_data['name']] = instructor
    
    # Create timetable slots
    timetable_data = [
        # Monday
        {'course': 'CS101', 'instructor': 'Dr. John Smith', 'day': 'monday', 'start': '09:00', 'end': '10:30', 'room': 'CS-101'},
        {'course': 'CS102', 'instructor': 'Dr. Sarah Johnson', 'day': 'monday', 'start': '11:00', 'end': '12:30', 'room': 'CS-102'},
        {'course': 'EE101', 'instructor': 'Dr. Lisa Brown', 'day': 'monday', 'start': '14:00', 'end': '15:30', 'room': 'EE-101'},
        
        # Tuesday
        {'course': 'CS301', 'instructor': 'Dr. Sarah Johnson', 'day': 'tuesday', 'start': '09:00', 'end': '10:30', 'room': 'CS-201'},
        {'course': 'CS302', 'instructor': 'Dr. Mike Wilson', 'day': 'tuesday', 'start': '11:00', 'end': '12:30', 'room': 'CS-202'},
        {'course': 'EE102', 'instructor': 'Dr. Lisa Brown', 'day': 'tuesday', 'start': '14:00', 'end': '15:30', 'room': 'EE-102'},
        
        # Wednesday
        {'course': 'CS101', 'instructor': 'Dr. John Smith', 'day': 'wednesday', 'start': '10:00', 'end': '11:30', 'room': 'CS-101'},
        {'course': 'CS301', 'instructor': 'Dr. Sarah Johnson', 'day': 'wednesday', 'start': '13:00', 'end': '14:30', 'room': 'CS-201'},
        
        # Thursday
        {'course': 'CS102', 'instructor': 'Dr. Sarah Johnson', 'day': 'thursday', 'start': '09:00', 'end': '10:30', 'room': 'CS-102'},
        {'course': 'CS302', 'instructor': 'Dr. Mike Wilson', 'day': 'thursday', 'start': '11:00', 'end': '12:30', 'room': 'CS-202'},
        
        # Friday
        {'course': 'EE101', 'instructor': 'Dr. Lisa Brown', 'day': 'friday', 'start': '09:00', 'end': '10:30', 'room': 'EE-101'},
        {'course': 'EE102', 'instructor': 'Dr. Lisa Brown', 'day': 'friday', 'start': '11:00', 'end': '12:30', 'room': 'EE-102'},
    ]
    
    timetables = []
    for tt_data in timetable_data:
        course = courses[tt_data['course']]
        instructor = instructors[tt_data['instructor']]
        
        timetable, created = Timetable.objects.get_or_create(
            course=course,
            instructor=instructor,
            day=tt_data['day'],
            start_time=time.fromisoformat(tt_data['start']),
            defaults={
                'end_time': time.fromisoformat(tt_data['end']),
                'room': tt_data['room']
            }
        )
        timetables.append(timetable)
        if created:
            print(f"Created timetable: {course.name} - {tt_data['day']} {tt_data['start']}-{tt_data['end']}")
    
    # Get or create students
    students_data = [
        # CS Semester 1 students
        {'id': 'CS2024001', 'name': 'Alice Johnson', 'email': 'alice.johnson@student.edu', 'semester': cs_sem1},
        {'id': 'CS2024002', 'name': 'Bob Smith', 'email': 'bob.smith@student.edu', 'semester': cs_sem1},
        {'id': 'CS2024003', 'name': 'Charlie Brown', 'email': 'charlie.brown@student.edu', 'semester': cs_sem1},
        {'id': 'CS2024004', 'name': 'Diana Wilson', 'email': 'diana.wilson@student.edu', 'semester': cs_sem1},
        {'id': 'CS2024005', 'name': 'Eva Davis', 'email': 'eva.davis@student.edu', 'semester': cs_sem1},
        
        # CS Semester 3 students
        {'id': 'CS2022001', 'name': 'Frank Miller', 'email': 'frank.miller@student.edu', 'semester': cs_sem3},
        {'id': 'CS2022002', 'name': 'Grace Lee', 'email': 'grace.lee@student.edu', 'semester': cs_sem3},
        {'id': 'CS2022003', 'name': 'Henry Taylor', 'email': 'henry.taylor@student.edu', 'semester': cs_sem3},
        
        # EE Semester 1 students
        {'id': 'EE2024001', 'name': 'Ivy Chen', 'email': 'ivy.chen@student.edu', 'semester': ee_sem1},
        {'id': 'EE2024002', 'name': 'Jack Anderson', 'email': 'jack.anderson@student.edu', 'semester': ee_sem1},
        {'id': 'EE2024003', 'name': 'Kate Martinez', 'email': 'kate.martinez@student.edu', 'semester': ee_sem1},
    ]
    
    students = {}
    for student_data in students_data:
        # Create user if doesn't exist
        user, _ = User.objects.get_or_create(
            email=student_data['email'],
            defaults={
                'username': student_data['email'],
                'role': 'student',
                'is_active': True
            }
        )
        
        student, _ = Student.objects.get_or_create(
            student_id=student_data['id'],
            defaults={
                'user': user,
                'name': student_data['name'],
                'email': student_data['email'],
                'semester': student_data['semester'],
                'department': student_data['semester'].department,
                'phone': f'+1555{student_data["id"][-3:]}'
            }
        )
        students[student_data['id']] = student
        if _:
            print(f"Created student: {student.name} ({student.student_id})")
    
    # Create some sample attendance records for the past few days
    print("Creating sample attendance records...")
    
    # Get some recent dates (excluding weekends)
    today = date.today()
    dates_to_create = []
    for i in range(7, 0, -1):  # Last 7 days
        check_date = today - timedelta(days=i)
        if check_date.weekday() < 5:  # Monday=0, Friday=4
            dates_to_create.append(check_date)
    
    attendance_count = 0
    for check_date in dates_to_create:
        day_name = check_date.strftime('%A').lower()
        
        # Get timetables for this day
        day_timetables = [tt for tt in timetables if tt.day == day_name]
        
        for timetable in day_timetables:
            # Get students for this course's semester
            course_students = Student.objects.filter(semester=timetable.course.semester)
            
            for student in course_students:
                # Create attendance with some variation
                import random
                status_choices = ['Present', 'Present', 'Present', 'Absent', 'Late']  # Weighted towards Present
                status = random.choice(status_choices)
                
                attendance, created = Attendance.objects.get_or_create(
                    student=student,
                    course=timetable.course,
                    instructor=timetable.instructor,
                    timetable=timetable,
                    date=check_date,
                    defaults={
                        'status': status,
                        'marked_by': timetable.instructor,
                        'is_submitted': True,  # Mark as submitted for past records
                        'can_edit': False
                    }
                )
                
                if created:
                    attendance_count += 1
    
    print(f"Created {attendance_count} attendance records")
    
    # Create some edit permission requests
    print("Creating sample edit permission requests...")
    
    # Get some recent attendance records
    recent_attendances = Attendance.objects.filter(
        date__gte=today - timedelta(days=3),
        status='Absent'
    )[:3]
    
    from academics.models import AttendanceEditPermission
    
    edit_requests_count = 0
    for attendance in recent_attendances:
        permission, created = AttendanceEditPermission.objects.get_or_create(
            instructor=attendance.instructor,
            attendance=attendance,
            defaults={
                'reason': f'Student {attendance.student.name} was actually present but marked absent by mistake. Please allow correction.',
                'proposed_status': 'Present',
                'status': 'pending'
            }
        )
        if created:
            edit_requests_count += 1
    
    print(f"Created {edit_requests_count} edit permission requests")
    
    print("\n=== DUMMY DATA CREATION COMPLETE ===")
    print(f"Departments: {Department.objects.count()}")
    print(f"Semesters: {Semester.objects.count()}")
    print(f"Courses: {Course.objects.count()}")
    print(f"Instructors: {Instructor.objects.count()}")
    print(f"Students: {Student.objects.count()}")
    print(f"Timetables: {Timetable.objects.count()}")
    print(f"Attendance Records: {Attendance.objects.count()}")
    print(f"Edit Requests: {AttendanceEditPermission.objects.count()}")
    
    print("\n=== SAMPLE TIMETABLE FOR TODAY ===")
    today_day = today.strftime('%A').lower()
    today_timetables = Timetable.objects.filter(day=today_day)
    
    if today_timetables:
        for tt in today_timetables:
            print(f"{tt.course.name} ({tt.course.code}) - {tt.instructor.name}")
            print(f"  Time: {tt.start_time} - {tt.end_time} | Room: {tt.room}")
            print(f"  Students: {Student.objects.filter(semester=tt.course.semester).count()}")
            print()
    else:
        print(f"No classes scheduled for {today.strftime('%A')}")
    
    print("\n=== INSTRUCTOR LOGIN INFO ===")
    for name, instructor in instructors.items():
        print(f"{name}: {instructor.user.email} (ID: {instructor.instructor_id})")

if __name__ == '__main__':
    create_dummy_data()