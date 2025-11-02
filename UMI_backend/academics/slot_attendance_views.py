from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Timetable, Attendance, AttendanceEditPermission
from students.models import Student
from instructors.models import Instructor
from .permissions import IsAdminOrInstructorForResultsAttendance

class SlotBasedAttendanceView(APIView):
    """
    Mark attendance only during assigned timetable slots
    """
    permission_classes = [IsAdminOrInstructorForResultsAttendance]
    def post(self, request):
        try:
            # Get authenticated instructor
            instructor = getattr(request.user, 'instructor_profile', None)
            if not instructor:
                return Response({'error': 'User is not an instructor'}, status=status.HTTP_403_FORBIDDEN)

            timetable_id = request.data.get('timetable_id')
            attendance_data = request.data.get('attendance_data', [])

            # Get timetable slot
            timetable = Timetable.objects.get(timetable_id=timetable_id)
            
            # Verify instructor is authorized
            if timetable.instructor != instructor:
                return Response({'error': 'Unauthorized to mark attendance for this class'}, status=status.HTTP_403_FORBIDDEN)
            
            # Check if within time slot (allow 15 minutes before and after)
            current_time = timezone.now().time()
            current_day = timezone.now().strftime('%A').lower()
            
            if timetable.day != current_day:
                return Response({'error': 'Attendance can only be marked on the scheduled day'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Allow marking 15 minutes before start and 30 minutes after end
            start_buffer = (datetime.combine(datetime.today(), timetable.start_time) - timedelta(minutes=15)).time()
            end_buffer = (datetime.combine(datetime.today(), timetable.end_time) + timedelta(minutes=30)).time()
            
            if not (start_buffer <= current_time <= end_buffer):
                return Response({
                    'error': f'Attendance can only be marked between {start_buffer} and {end_buffer}',
                    'current_time': current_time.strftime('%H:%M')
                }, status=status.HTTP_400_BAD_REQUEST)
            
            today = timezone.now().date()
            marked_count = 0
            updated_count = 0
            
            for item in attendance_data:
                student_id = item.get('student_id')
                attendance_status = item.get('status')
                
                student = Student.objects.get(student_id=student_id)
                
                # Check if attendance already exists for this slot
                attendance, created = Attendance.objects.get_or_create(
                    student=student,
                    course=timetable.course,
                    instructor=instructor,
                    timetable=timetable,
                    date=today,
                    defaults={
                        'status': attendance_status,
                        'marked_by': instructor,
                        'is_submitted': False,
                        'can_edit': True
                    }
                )
                
                if not created:
                    # Check if already submitted
                    if attendance.is_submitted and not attendance.admin_approved_edit:
                        continue  # Skip if submitted and no admin approval
                    
                    # Update if not submitted or admin approved
                    if not attendance.is_submitted or attendance.admin_approved_edit:
                        attendance.status = attendance_status
                        attendance.marked_by = instructor
                        if attendance.admin_approved_edit:
                            attendance.admin_approved_edit = False  # Reset after use
                        attendance.save()
                        updated_count += 1
                else:
                    marked_count += 1
            
            return Response({
                'message': f'Attendance processed: {marked_count} new, {updated_count} updated',
                'timetable_slot': f"{timetable.course.name} - {timetable.start_time} to {timetable.end_time}"
            })
            
        except Timetable.DoesNotExist:
            return Response({'error': 'Timetable slot not found'}, status=status.HTTP_404_NOT_FOUND)
        except Instructor.DoesNotExist:
            return Response({'error': 'Instructor not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SubmitSlotAttendanceView(APIView):
    """
    Submit attendance for a slot (locks it)
    """
    permission_classes = [IsAdminOrInstructorForResultsAttendance]
    def post(self, request):
        try:
            # Get authenticated instructor
            instructor = getattr(request.user, 'instructor_profile', None)
            if not instructor:
                return Response({'error': 'User is not an instructor'}, status=status.HTTP_403_FORBIDDEN)

            timetable_id = request.data.get('timetable_id')

            timetable = Timetable.objects.get(timetable_id=timetable_id)
            today = timezone.now().date()
            
            # Submit all attendance for this slot
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

class RequestEditPermissionView(APIView):
    """
    Request admin permission to edit submitted attendance
    """
    permission_classes = [IsAdminOrInstructorForResultsAttendance]
    def post(self, request):
        try:
            # Get authenticated instructor
            instructor = getattr(request.user, 'instructor_profile', None)
            if not instructor:
                return Response({'error': 'User is not an instructor'}, status=status.HTTP_403_FORBIDDEN)

            attendance_id = request.data.get('attendance_id')
            reason = request.data.get('reason')

            attendance = Attendance.objects.get(attendance_id=attendance_id)
            
            # Check if already has pending request
            existing_request = AttendanceEditPermission.objects.filter(
                instructor=instructor,
                attendance=attendance,
                status='pending'
            ).first()
            
            if existing_request:
                return Response({'error': 'Edit request already pending for this attendance'}, status=status.HTTP_400_BAD_REQUEST)
            
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

class GetInstructorSlotsView(APIView):
    """
    Get instructor's current active slots
    """
    permission_classes = [IsAdminOrInstructorForResultsAttendance]
    def get(self, request):
        try:
            # Get authenticated instructor
            instructor = getattr(request.user, 'instructor_profile', None)
            if not instructor:
                return Response({'error': 'User is not an instructor'}, status=status.HTTP_403_FORBIDDEN)
            
            current_time = timezone.now().time()
            current_day = timezone.now().strftime('%A').lower()
            
            # Get slots for today
            today_slots = Timetable.objects.filter(
                instructor=instructor,
                day=current_day
            ).order_by('start_time')
            
            slots_data = []
            for slot in today_slots:
                # Check if currently active (within time range)
                start_buffer = (datetime.combine(datetime.today(), slot.start_time) - timedelta(minutes=15)).time()
                end_buffer = (datetime.combine(datetime.today(), slot.end_time) + timedelta(minutes=30)).time()
                is_active = start_buffer <= current_time <= end_buffer
                
                # Get students for this slot
                students = Student.objects.filter(
                    department=slot.department,
                    semester=slot.semester
                )
                
                # Check if attendance already submitted for today
                today = timezone.now().date()
                submitted_attendance = Attendance.objects.filter(
                    timetable=slot,
                    date=today,
                    is_submitted=True
                ).exists()
                
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
                    'is_active': is_active,
                    'students_count': students.count(),
                    'attendance_submitted': submitted_attendance,
                    'can_mark': is_active and not submitted_attendance
                })
            
            return Response({
                'slots': slots_data,
                'current_time': current_time.strftime('%H:%M'),
                'current_day': current_day.title()
            })
            
        except Instructor.DoesNotExist:
            return Response({'error': 'Instructor not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)