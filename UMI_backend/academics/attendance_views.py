from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, time
from .models import Timetable, Attendance, AttendanceEditPermission
from students.models import Student
from instructors.models import Instructor
from .serializers import AttendanceSerializer

class TimetableBasedAttendanceView(APIView):
    """
    Get current instructor's active classes for attendance marking
    """
    def get(self, request):
        try:
            # Get current instructor (you may need to adjust this based on your auth)
            instructor_id = request.query_params.get('instructor_id')
            if not instructor_id:
                return Response({'error': 'Instructor ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            instructor = Instructor.objects.get(instructor_id=instructor_id)
            current_time = timezone.now().time()
            current_day = timezone.now().strftime('%A').lower()
            
            # Get active timetable slots for current instructor
            active_slots = Timetable.objects.filter(
                instructor=instructor,
                day=current_day,
                start_time__lte=current_time,
                end_time__gte=current_time
            )
            
            slots_data = []
            for slot in active_slots:
                # Get students enrolled in this course/semester
                students = Student.objects.filter(
                    department=slot.department,
                    semester=slot.semester
                )
                
                slots_data.append({
                    'timetable_id': slot.timetable_id,
                    'course': {
                        'id': slot.course.course_id,
                        'name': slot.course.name,
                        'code': slot.course.code
                    },
                    'department': slot.department.name,
                    'semester': slot.semester.name,
                    'time_slot': f"{slot.start_time} - {slot.end_time}",
                    'room': slot.room,
                    'students_count': students.count(),
                    'can_mark_attendance': True
                })
            
            return Response({
                'active_slots': slots_data,
                'current_time': current_time.strftime('%H:%M'),
                'current_day': current_day.title()
            })
            
        except Instructor.DoesNotExist:
            return Response({'error': 'Instructor not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MarkTimetableAttendanceView(APIView):
    """
    Mark attendance for a specific timetable slot
    """
    def post(self, request):
        try:
            timetable_id = request.data.get('timetable_id')
            attendance_data = request.data.get('attendance_data', [])
            instructor_id = request.data.get('instructor_id')
            
            if not all([timetable_id, attendance_data, instructor_id]):
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
            
            timetable = Timetable.objects.get(timetable_id=timetable_id)
            instructor = Instructor.objects.get(instructor_id=instructor_id)
            
            # Verify instructor is authorized for this timetable
            if timetable.instructor != instructor:
                return Response({'error': 'Unauthorized to mark attendance for this class'}, status=status.HTTP_403_FORBIDDEN)
            
            # Check if within time slot
            current_time = timezone.now().time()
            if not (timetable.start_time <= current_time <= timetable.end_time):
                return Response({'error': 'Attendance can only be marked during class time'}, status=status.HTTP_400_BAD_REQUEST)
            
            today = timezone.now().date()
            marked_count = 0
            
            for attendance_item in attendance_data:
                student_id = attendance_item.get('student_id')
                status_value = attendance_item.get('status')
                
                student = Student.objects.get(student_id=student_id)
                
                # Create or update attendance
                attendance, created = Attendance.objects.get_or_create(
                    student=student,
                    course=timetable.course,
                    instructor=instructor,
                    timetable=timetable,
                    date=today,
                    defaults={
                        'status': status_value,
                        'marked_by': instructor,
                        'can_edit': True,
                        'is_submitted': False
                    }
                )
                
                if not created and not attendance.is_submitted:
                    attendance.status = status_value
                    attendance.marked_by = instructor
                    attendance.save()
                
                marked_count += 1
            
            return Response({
                'message': f'Attendance marked for {marked_count} students',
                'timetable_id': timetable_id,
                'course': timetable.course.name,
                'date': today
            })
            
        except (Timetable.DoesNotExist, Instructor.DoesNotExist, Student.DoesNotExist) as e:
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubmitAttendanceView(APIView):
    """
    Submit attendance (locks it for editing)
    """
    def post(self, request):
        try:
            timetable_id = request.data.get('timetable_id')
            instructor_id = request.data.get('instructor_id')
            
            timetable = Timetable.objects.get(timetable_id=timetable_id)
            instructor = Instructor.objects.get(instructor_id=instructor_id)
            today = timezone.now().date()
            
            # Submit all attendance for this timetable slot
            attendances = Attendance.objects.filter(
                timetable=timetable,
                instructor=instructor,
                date=today,
                is_submitted=False
            )
            
            submitted_count = attendances.update(
                is_submitted=True,
                can_edit=False
            )
            
            return Response({
                'message': f'Attendance submitted for {submitted_count} records',
                'submitted_at': timezone.now()
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RequestAttendanceEditView(APIView):
    """
    Request permission to edit submitted attendance
    """
    def post(self, request):
        try:
            attendance_id = request.data.get('attendance_id')
            instructor_id = request.data.get('instructor_id')
            reason = request.data.get('reason')
            
            attendance = Attendance.objects.get(attendance_id=attendance_id)
            instructor = Instructor.objects.get(instructor_id=instructor_id)
            
            # Create edit permission request
            permission_request = AttendanceEditPermission.objects.create(
                instructor=instructor,
                attendance=attendance,
                reason=reason,
                status='pending'
            )
            
            return Response({
                'message': 'Edit permission request submitted',
                'request_id': permission_request.permission_id
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminAttendancePermissionsView(APIView):
    """
    Admin view to manage attendance edit permissions
    """
    def get(self, request):
        try:
            permissions = AttendanceEditPermission.objects.filter(status='pending')
            
            permissions_data = []
            for perm in permissions:
                permissions_data.append({
                    'id': perm.permission_id,
                    'instructor': perm.instructor.name,
                    'student': perm.attendance.student.name,
                    'course': perm.attendance.course.name,
                    'date': perm.attendance.date,
                    'current_status': perm.attendance.status,
                    'reason': perm.reason,
                    'requested_at': perm.requested_at
                })
            
            return Response({'pending_requests': permissions_data})
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            permission_id = request.data.get('permission_id')
            action = request.data.get('action')  # 'approve' or 'reject'
            admin_notes = request.data.get('admin_notes', '')
            admin_id = request.data.get('admin_id')
            
            permission = AttendanceEditPermission.objects.get(permission_id=permission_id)
            admin = Instructor.objects.get(instructor_id=admin_id)
            
            if action == 'approve':
                permission.status = 'approved'
                permission.approved_by = admin
                permission.approved_at = timezone.now()
                permission.admin_notes = admin_notes
                
                # Enable editing for the attendance record
                permission.attendance.admin_approved_edit = True
                permission.attendance.can_edit = True
                permission.attendance.save()
                
            elif action == 'reject':
                permission.status = 'rejected'
                permission.admin_notes = admin_notes
            
            permission.save()
            
            return Response({
                'message': f'Permission request {action}d',
                'permission_id': permission_id
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)