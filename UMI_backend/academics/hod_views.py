from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Timetable, Course, Department, Semester
from instructors.models import Instructor
<<<<<<< HEAD
from register.models import User
from hods.models import HODRegistrationRequest
=======
from register.models import User, HODRegistrationRequest
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119

class HODTimetableView(APIView):
    """
    HOD Timetable management view
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all timetables or form data"""
        # Check if requesting available data for form
        if request.GET.get('action') == 'form_data':
            # Get HOD's department - first try instructor profile, then HOD registration request
            hod_department = None
            hod_user = request.user

        #check HOD registration request
            try:
                    hod_request = HODRegistrationRequest.objects.get(
                        employee_id=hod_user.username,
                        hod_request_status='account_created'
                    )
                    hod_department = hod_request.department
            except HODRegistrationRequest.DoesNotExist:
                    return Response({'error': 'HOD profile not found'}, status=status.HTTP_404_NOT_FOUND)

            # Filter data by HOD's department
            courses = Course.objects.select_related('semester__department').filter(
                semester__department=hod_department
            )
            instructors = Instructor.objects.select_related('department').filter(
                department=hod_department
            )
            semesters = Semester.objects.select_related('department').filter(
                department=hod_department
            )

            courses_data = []
            for course in courses:
                courses_data.append({
                    'course_id': course.course_id,
                    'name': course.name,
                    'code': course.code,
                    'credits': course.credits,
                    'semester': course.semester.name if course.semester else 'N/A',
                    'semester_id': course.semester.semester_id if course.semester else None,
                    'department': course.semester.department.name if course.semester else 'N/A'
                })

            instructors_data = []
            for instructor in instructors:
                instructors_data.append({
                    'id': instructor.id,
                    'name': instructor.name,
                    'employee_id': instructor.employee_id,
                    'department': instructor.department.name if instructor.department else 'N/A'
                })

            semesters_data = []
            for semester in semesters:
                semesters_data.append({
                    'semester_id': semester.semester_id,
                    'name': semester.name,
                    'program': semester.program,
                    'department': semester.department.name if semester.department else 'N/A'
                })

            return Response({
                'courses': courses_data,
                'instructors': instructors_data,
                'semesters': semesters_data,
                'days': [{'value': day[0], 'label': day[1]} for day in Timetable.DAY_CHOICES],
                'time_slots': [
                    {'value': '08:00', 'label': '8:00 AM'},
                    {'value': '09:00', 'label': '9:00 AM'},
                    {'value': '10:00', 'label': '10:00 AM'},
                    {'value': '11:00', 'label': '11:00 AM'},
                    {'value': '12:00', 'label': '12:00 PM'},
                    {'value': '13:00', 'label': '1:00 PM'},
                    {'value': '14:00', 'label': '2:00 PM'},
                    {'value': '15:00', 'label': '3:00 PM'},
                    {'value': '16:00', 'label': '4:00 PM'},
                ]
            })

        # Get HOD's department - first try instructor profile, then HOD registration request
        hod_department = None
        hod_user = request.user

        # Try to get department from instructor profile first
        try:
            hod_instructor = Instructor.objects.get(user=hod_user)
            hod_department = hod_instructor.department
        except Instructor.DoesNotExist:
            # If not found as instructor, check HOD registration request
            try:
                hod_request = HODRegistrationRequest.objects.get(
                    employee_id=hod_user.username,
                    hod_request_status='account_created'
                )
                hod_department = hod_request.department
            except HODRegistrationRequest.DoesNotExist:
                return Response({'error': 'HOD profile not found'}, status=status.HTTP_404_NOT_FOUND)

        # Filter timetables by HOD's department
        timetables = Timetable.objects.select_related('course__semester__department', 'instructor').filter(
            course__semester__department=hod_department
        )

        # Check if filtering by semester
        semester_id = request.GET.get('semester_id')
        if semester_id:
            timetables = timetables.filter(course__semester__semester_id=semester_id)

        timetable_data = []

        for timetable in timetables:
            timetable_data.append({
                'timetable_id': timetable.timetable_id,
                'course': {
                    'course_id': timetable.course.course_id,
                    'name': timetable.course.name,
                    'code': timetable.course.code
                },
                'instructor': {
                    'id': timetable.instructor.id,
                    'name': timetable.instructor.name,
                    'employee_id': timetable.instructor.employee_id
                },
                'day': timetable.day,
                'start_time': timetable.start_time.strftime('%H:%M'),
                'end_time': timetable.end_time.strftime('%H:%M'),
                'room': timetable.room,
                'id': timetable.timetable_id
            })

        return Response({
            'timetables': timetable_data,
            'count': len(timetable_data)
        })
    
    def post(self, request):
        """Create timetable"""
        try:
            course_id = request.data.get('course_id')
            instructor_id = request.data.get('instructor_id')
            day = request.data.get('day')
            start_time = request.data.get('start_time')
            end_time = request.data.get('end_time')
            room = request.data.get('room', '')
            
            course = Course.objects.get(course_id=course_id)
            instructor = Instructor.objects.get(id=instructor_id)
            
            timetable = Timetable.objects.create(
                course=course,
                instructor=instructor,
                day=day,
                start_time=start_time,
                end_time=end_time,
                room=room
            )
            
            return Response({
                'message': 'Timetable created successfully',
                'timetable_id': timetable.timetable_id,
                'data': {
                    'course': course.name,
                    'instructor': instructor.name,
                    'day': day,
                    'start_time': start_time,
                    'end_time': end_time,
                    'room': room
                }
            }, status=status.HTTP_201_CREATED)
            
        except Course.DoesNotExist:
            return Response({
                'error': 'Course not found',
                'course_id': course_id,
                'available_courses': list(Course.objects.values('course_id', 'name', 'code'))
            }, status=status.HTTP_404_NOT_FOUND)
        except Instructor.DoesNotExist:
            return Response({
                'error': 'Instructor not found',
                'instructor_id': instructor_id,
                'available_instructors': list(Instructor.objects.values('id', 'name', 'employee_id'))
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, timetable_id):
        """Delete timetable entry"""
        try:
            # Get HOD's department
            hod_department = None
            hod_user = request.user

            # Try to get department from instructor profile first
            try:
                hod_instructor = Instructor.objects.get(user=hod_user)
                hod_department = hod_instructor.department
            except Instructor.DoesNotExist:
                # If not found as instructor, check HOD registration request
                try:
                    hod_request = HODRegistrationRequest.objects.get(
                        employee_id=hod_user.username,
                        hod_request_status='account_created'
                    )
                    hod_department = hod_request.department
                except HODRegistrationRequest.DoesNotExist:
                    return Response({'error': 'HOD profile not found'}, status=status.HTTP_404_NOT_FOUND)

            # Get and delete the timetable entry, ensuring it belongs to HOD's department
            timetable = Timetable.objects.select_related('course__semester__department').get(
                timetable_id=timetable_id,
                course__semester__department=hod_department
            )
            timetable.delete()

            return Response({
                'message': 'Timetable entry deleted successfully'
            }, status=status.HTTP_200_OK)

        except Timetable.DoesNotExist:
            return Response({
                'error': 'Timetable entry not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        """Create sample data for testing"""
        try:
            # Create department
            dept, _ = Department.objects.get_or_create(
                code='CS', 
                defaults={'name': 'Computer Science', 'num_semesters': 8}
            )
            
            # Create semester
            sem, _ = Semester.objects.get_or_create(
                semester_code='CS-SEM1',
                defaults={
                    'name': 'Semester 1',
                    'program': 'CS',
                    'capacity': 30,
                    'department': dept
                }
            )
            
            # Create courses
            course1, _ = Course.objects.get_or_create(
                code='CS101',
                defaults={'name': 'Programming', 'credits': 3, 'semester': sem}
            )
            course2, _ = Course.objects.get_or_create(
                code='CS102', 
                defaults={'name': 'Data Structures', 'credits': 3, 'semester': sem}
            )
            
            # Create instructor user
            user, _ = User.objects.get_or_create(
                username='john_smith',
                defaults={
                    'email': 'john@uni.edu',
                    'name': 'Dr. John Smith',
                    'role': 'instructor'
                }
            )
            
            # Create instructor
            instructor, _ = Instructor.objects.get_or_create(
                employee_id='INS001',
                defaults={
                    'name': 'Dr. John Smith',
                    'phone': '123456789',
                    'specialization': 'Computer Science',
                    'user': user,
                    'department': dept
                }
            )
            
            return Response({
                'message': 'Sample data created successfully',
                'data': {
                    'department': dept.name,
                    'courses': [course1.name, course2.name],
                    'instructor': instructor.name
                }
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)