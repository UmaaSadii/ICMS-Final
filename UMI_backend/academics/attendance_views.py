from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
<<<<<<< HEAD
from rest_framework.permissions import IsAuthenticated
=======
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
from django.utils import timezone
from datetime import datetime, time
from .models import Timetable, Attendance, AttendanceEditPermission
from students.models import Student
from instructors.models import Instructor
from .serializers import AttendanceSerializer

class TimetableBasedAttendanceView(APIView):
    """
<<<<<<< HEAD
    Get current instructor's active classes for attendance marking - STRICT SLOT ENFORCEMENT
    """
    def get(self, request):
        try:
=======
    Get current instructor's active classes for attendance marking
    """
    def get(self, request):
        try:
            # Get current instructor (you may need to adjust this based on your auth)
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
            instructor_id = request.query_params.get('instructor_id')
            if not instructor_id:
                return Response({'error': 'Instructor ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            instructor = Instructor.objects.get(instructor_id=instructor_id)
            current_time = timezone.now().time()
            current_day = timezone.now().strftime('%A').lower()
<<<<<<< HEAD
            today = timezone.now().date()
            
            # STRICT: Only get slots that are currently active (within time window)
=======
            
            # Get active timetable slots for current instructor
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
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
<<<<<<< HEAD
                    semester=slot.course.semester,
                    is_active=True
                )
                
                # Check if attendance already submitted for today
                submitted_count = Attendance.objects.filter(
                    timetable=slot,
                    date=today,
                    is_submitted=True
                ).count()
                
                is_already_submitted = submitted_count > 0
                
=======
                    department=slot.department,
                    semester=slot.semester
                )
                
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
                slots_data.append({
                    'timetable_id': slot.timetable_id,
                    'course': {
                        'id': slot.course.course_id,
                        'name': slot.course.name,
                        'code': slot.course.code
                    },
<<<<<<< HEAD
                    'department': slot.course.semester.department.name if slot.course.semester else 'N/A',
                    'semester': slot.course.semester.name if slot.course.semester else 'N/A',
                    'time_slot': f"{slot.start_time.strftime('%H:%M')} - {slot.end_time.strftime('%H:%M')}",
                    'room': slot.room,
                    'students_count': students.count(),
                    'can_mark_attendance': not is_already_submitted,
                    'is_submitted': is_already_submitted,
                    'time_remaining': self._calculate_time_remaining(slot.end_time, current_time)
=======
                    'department': slot.department.name,
                    'semester': slot.semester.name,
                    'time_slot': f"{slot.start_time} - {slot.end_time}",
                    'room': slot.room,
                    'students_count': students.count(),
                    'can_mark_attendance': True
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
                })
            
            return Response({
                'active_slots': slots_data,
                'current_time': current_time.strftime('%H:%M'),
<<<<<<< HEAD
                'current_day': current_day.title(),
                'message': 'Attendance can only be marked during assigned time slots' if not active_slots else None
=======
                'current_day': current_day.title()
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
            })
            
        except Instructor.DoesNotExist:
            return Response({'error': 'Instructor not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
<<<<<<< HEAD
    
    def _calculate_time_remaining(self, end_time, current_time):
        """Calculate remaining time in minutes"""
        from datetime import datetime, timedelta
        end_dt = datetime.combine(datetime.today(), end_time)
        current_dt = datetime.combine(datetime.today(), current_time)
        remaining = end_dt - current_dt
        return max(0, int(remaining.total_seconds() / 60))

class MarkTimetableAttendanceView(APIView):
    """
    Mark attendance for a specific timetable slot - STRICT ENFORCEMENT
=======

class MarkTimetableAttendanceView(APIView):
    """
    Mark attendance for a specific timetable slot
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
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
            
<<<<<<< HEAD
            # STRICT: Verify instructor is authorized for this timetable
            if timetable.instructor != instructor:
                return Response({
                    'error': 'Unauthorized: You can only mark attendance for your assigned classes'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # STRICT: Check if within time slot and correct day
            current_time = timezone.now().time()
            current_day = timezone.now().strftime('%A').lower()
            today = timezone.now().date()
            
            if timetable.day != current_day:
                return Response({
                    'error': f'Attendance can only be marked on {timetable.day.title()}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not (timetable.start_time <= current_time <= timetable.end_time):
                return Response({
                    'error': f'Attendance can only be marked between {timetable.start_time.strftime("%H:%M")} - {timetable.end_time.strftime("%H:%M")}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # STRICT: Check if already submitted for today
            if Attendance.objects.filter(timetable=timetable, date=today, is_submitted=True).exists():
                return Response({
                    'error': 'Attendance already submitted for today. Request admin permission to edit.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            marked_count = 0
            errors = []
=======
            # Verify instructor is authorized for this timetable
            if timetable.instructor != instructor:
                return Response({'error': 'Unauthorized to mark attendance for this class'}, status=status.HTTP_403_FORBIDDEN)
            
            # Check if within time slot
            current_time = timezone.now().time()
            if not (timetable.start_time <= current_time <= timetable.end_time):
                return Response({'error': 'Attendance can only be marked during class time'}, status=status.HTTP_400_BAD_REQUEST)
            
            today = timezone.now().date()
            marked_count = 0
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
            
            for attendance_item in attendance_data:
                student_id = attendance_item.get('student_id')
                status_value = attendance_item.get('status')
                
<<<<<<< HEAD
                try:
                    student = Student.objects.get(student_id=student_id)
                    
                    # Verify student is enrolled in the course's semester
                    if student.semester != timetable.course.semester:
                        errors.append(f'Student {student.name} not enrolled in {timetable.course.semester.name}')
                        continue
                    
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
                    
                    if not created and attendance.is_editable():
                        attendance.status = status_value
                        attendance.marked_by = instructor
                        attendance.save()
                    elif not created and not attendance.is_editable():
                        errors.append(f'Cannot edit attendance for {student.name} - already submitted')
                        continue
                    
                    marked_count += 1
                    
                except Student.DoesNotExist:
                    errors.append(f'Student with ID {student_id} not found')
                    continue
            
            response_data = {
                'message': f'Attendance marked for {marked_count} students',
                'timetable_id': timetable_id,
                'course': timetable.course.name,
                'date': today.isoformat(),
                'time_slot': f'{timetable.start_time.strftime("%H:%M")} - {timetable.end_time.strftime("%H:%M")}'
            }
            
            if errors:
                response_data['warnings'] = errors
            
            return Response(response_data)
            
        except (Timetable.DoesNotExist, Instructor.DoesNotExist) as e:
=======
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
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubmitAttendanceView(APIView):
    """
<<<<<<< HEAD
    Submit attendance (locks it for editing) - STRICT FINALIZATION
=======
    Submit attendance (locks it for editing)
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
    """
    def post(self, request):
        try:
            timetable_id = request.data.get('timetable_id')
            instructor_id = request.data.get('instructor_id')
            
<<<<<<< HEAD
            if not all([timetable_id, instructor_id]):
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
            
=======
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
            timetable = Timetable.objects.get(timetable_id=timetable_id)
            instructor = Instructor.objects.get(instructor_id=instructor_id)
            today = timezone.now().date()
            
<<<<<<< HEAD
            # Verify instructor authorization
            if timetable.instructor != instructor:
                return Response({
                    'error': 'Unauthorized: You can only submit attendance for your assigned classes'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get all attendance records for this slot today
            attendances = Attendance.objects.filter(
                timetable=timetable,
                date=today
            )
            
            if not attendances.exists():
                return Response({
                    'error': 'No attendance records found to submit'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if already submitted
            if attendances.filter(is_submitted=True).exists():
                return Response({
                    'error': 'Attendance already submitted for this class today'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Submit all attendance records
            submitted_count = attendances.update(
                is_submitted=True,
                can_edit=False,
                admin_approved_edit=False
            )
            
            return Response({
                'message': f'Attendance finalized for {submitted_count} students. Further edits require admin approval.',
                'submitted_at': timezone.now(),
                'course': timetable.course.name,
                'date': today,
                'time_slot': f'{timetable.start_time} - {timetable.end_time}'
            })
            
        except (Timetable.DoesNotExist, Instructor.DoesNotExist) as e:
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
=======
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
            
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RequestAttendanceEditView(APIView):
    """
<<<<<<< HEAD
    Request permission to edit submitted attendance - ENHANCED
=======
    Request permission to edit submitted attendance
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
    """
    def post(self, request):
        try:
            attendance_id = request.data.get('attendance_id')
            instructor_id = request.data.get('instructor_id')
            reason = request.data.get('reason')
<<<<<<< HEAD
            proposed_status = request.data.get('proposed_status')
            
            if not all([attendance_id, instructor_id, reason]):
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
=======
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
            
            attendance = Attendance.objects.get(attendance_id=attendance_id)
            instructor = Instructor.objects.get(instructor_id=instructor_id)
            
<<<<<<< HEAD
            # Verify instructor is authorized
            if attendance.instructor != instructor and attendance.marked_by != instructor:
                return Response({
                    'error': 'You can only request edits for attendance you marked'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check if already has pending request
            existing_request = AttendanceEditPermission.objects.filter(
                instructor=instructor,
                attendance=attendance,
                status='pending'
            ).first()
            
            if existing_request:
                return Response({
                    'error': 'You already have a pending edit request for this attendance record'
                }, status=status.HTTP_400_BAD_REQUEST)
            
=======
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
            # Create edit permission request
            permission_request = AttendanceEditPermission.objects.create(
                instructor=instructor,
                attendance=attendance,
                reason=reason,
<<<<<<< HEAD
                proposed_status=proposed_status,
=======
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
                status='pending'
            )
            
            return Response({
<<<<<<< HEAD
                'message': 'Edit permission request submitted to admin for approval',
                'request_id': permission_request.permission_id,
                'student': attendance.student.name,
                'course': attendance.course.name,
                'date': attendance.date,
                'current_status': attendance.status,
                'proposed_status': proposed_status
            })
            
        except (Attendance.DoesNotExist, Instructor.DoesNotExist) as e:
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
=======
                'message': 'Edit permission request submitted',
                'request_id': permission_request.permission_id
            })
            
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminAttendancePermissionsView(APIView):
    """
<<<<<<< HEAD
    Admin view to manage attendance edit permissions - ENHANCED
    """
    def get(self, request):
        try:
            status_filter = request.query_params.get('status', 'pending')
            permissions = AttendanceEditPermission.objects.all().order_by('-requested_at')
=======
    Admin view to manage attendance edit permissions
    """
    def get(self, request):
        try:
            permissions = AttendanceEditPermission.objects.filter(status='pending')
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
            
            permissions_data = []
            for perm in permissions:
                permissions_data.append({
                    'id': perm.permission_id,
<<<<<<< HEAD
                    'instructor': {
                        'id': perm.instructor.instructor_id,
                        'name': perm.instructor.name,
                        'email': perm.instructor.user.email if perm.instructor.user else 'N/A'
                    },
                    'student': {
                        'id': perm.attendance.student.student_id,
                        'name': perm.attendance.student.name
                    },
                    'course': {
                        'id': perm.attendance.course.course_id,
                        'name': perm.attendance.course.name,
                        'code': perm.attendance.course.code
                    },
                    'timetable': {
                        'day': perm.attendance.timetable.day,
                        'time': f"{perm.attendance.timetable.start_time} - {perm.attendance.timetable.end_time}",
                        'room': perm.attendance.timetable.room
                    },
                    'date': perm.attendance.date,
                    'current_status': perm.attendance.status,
                    'proposed_status': perm.proposed_status,
                    'reason': perm.reason,
                    'requested_at': perm.requested_at,
                    'reviewed_at': perm.reviewed_at,
                    'admin_notes': perm.admin_notes,
                    'status': perm.status
                })
            
            return Response({
                'pending_requests': permissions_data,
                'requests': permissions_data,
                'total_count': permissions.count(),
                'debug_info': f"Found {permissions.count()} total requests"
            })
            
        except Exception as e:
            print(f"AdminAttendancePermissionsView error: {e}")
            return Response({'error': str(e), 'debug': 'Check server logs'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
=======
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
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
    
    def post(self, request):
        try:
            permission_id = request.data.get('permission_id')
            action = request.data.get('action')  # 'approve' or 'reject'
            admin_notes = request.data.get('admin_notes', '')
<<<<<<< HEAD
            
            if not all([permission_id, action]):
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
            
            permission = AttendanceEditPermission.objects.get(permission_id=permission_id)
            
            if permission.status != 'pending':
                return Response({
                    'error': 'This request has already been processed'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if action == 'approve':
                permission.status = 'approved'
                permission.reviewed_by = request.user
                permission.reviewed_at = timezone.now()
=======
            admin_id = request.data.get('admin_id')
            
            permission = AttendanceEditPermission.objects.get(permission_id=permission_id)
            admin = Instructor.objects.get(instructor_id=admin_id)
            
            if action == 'approve':
                permission.status = 'approved'
                permission.approved_by = admin
                permission.approved_at = timezone.now()
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
                permission.admin_notes = admin_notes
                
                # Enable editing for the attendance record
                permission.attendance.admin_approved_edit = True
                permission.attendance.can_edit = True
<<<<<<< HEAD
                permission.attendance.is_submitted = False  # Allow re-editing
                permission.attendance.save()
                
                message = f'Edit permission approved for {permission.attendance.student.name}'
                
            elif action == 'reject':
                permission.status = 'rejected'
                permission.reviewed_by = request.user
                permission.reviewed_at = timezone.now()
                permission.admin_notes = admin_notes
                
                message = f'Edit permission rejected for {permission.attendance.student.name}'
            else:
                return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
=======
                permission.attendance.save()
                
            elif action == 'reject':
                permission.status = 'rejected'
                permission.admin_notes = admin_notes
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
            
            permission.save()
            
            return Response({
<<<<<<< HEAD
                'message': message,
                'permission_id': permission_id,
                'action': action,
                'admin_notes': admin_notes
            })
            
        except AttendanceEditPermission.DoesNotExist:
            return Response({'error': 'Permission request not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TimetableStudentsView(APIView):
    """
    Get students for a specific timetable slot
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, timetable_id):
        try:
            timetable = Timetable.objects.get(timetable_id=timetable_id)
            today = timezone.now().date()
            
            # Get students enrolled in the course's semester
            students = Student.objects.filter(
                semester=timetable.course.semester,
                is_active=True
            ).order_by('name')
            
            students_data = []
            for student in students:
                # Check if attendance already marked for today
                attendance = Attendance.objects.filter(
                    student=student,
                    timetable=timetable,
                    date=today
                ).first()
                
                students_data.append({
                    'student_id': student.student_id,
                    'name': student.name,
                    'email': student.user.email if student.user else 'N/A',
                    'current_status': attendance.status if attendance else 'Present',
                    'is_marked': attendance is not None,
                    'can_edit': attendance.is_editable() if attendance else True
                })
            
            return Response({
                'students': students_data,
                'course': {
                    'id': timetable.course.course_id,
                    'name': timetable.course.name,
                    'code': timetable.course.code
                },
                'timetable': {
                    'id': timetable.timetable_id,
                    'day': timetable.day,
                    'time': f"{timetable.start_time} - {timetable.end_time}",
                    'room': timetable.room
                },
                'date': today,
                'total_students': len(students_data)
            })
            
        except Timetable.DoesNotExist:
            return Response({'error': 'Timetable not found'}, status=status.HTTP_404_NOT_FOUND)
=======
                'message': f'Permission request {action}d',
                'permission_id': permission_id
            })
            
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)