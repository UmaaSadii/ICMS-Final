from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Attendance, AttendanceEditPermission
from instructors.models import Instructor

class InstructorSubmittedAttendanceView(APIView):
    """
    Get submitted attendance records for an instructor
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            instructor_id = request.query_params.get('instructor_id')
            if not instructor_id:
                return Response({'error': 'Instructor ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            instructor = Instructor.objects.get(pk=instructor_id)
            
            # Get submitted attendance records for this instructor
            attendances = Attendance.objects.filter(
                instructor=instructor,
                is_submitted=True
            ).order_by('-date')[:50]  # Last 50 records
            
            records_data = []
            for attendance in attendances:
                records_data.append({
                    'attendance_id': attendance.attendance_id,
                    'student_name': attendance.student.name,
                    'student_id': attendance.student.student_id,
                    'course_name': attendance.course.name if attendance.course else 'N/A',
                    'course_code': attendance.course.code if attendance.course else 'N/A',
                    'date': attendance.date,
                    'current_status': attendance.status,
                    'is_submitted': attendance.is_submitted,
                    'can_edit': attendance.can_edit
                })
            
            return Response({'records': records_data})
            
        except Instructor.DoesNotExist:
            return Response({'error': 'Instructor not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InstructorEditRequestsView(APIView):
    """
    Get edit requests for an instructor
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            instructor_id = request.query_params.get('instructor_id')
            if not instructor_id:
                return Response({'error': 'Instructor ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            instructor = Instructor.objects.get(pk=instructor_id)
            
            # Get edit requests for this instructor
            requests = AttendanceEditPermission.objects.filter(
                instructor=instructor
            ).order_by('-requested_at')
            
            requests_data = []
            for req in requests:
                requests_data.append({
                    'id': req.permission_id,
                    'student': {
                        'id': req.attendance.student.student_id,
                        'name': req.attendance.student.name
                    },
                    'course': {
                        'name': req.attendance.course.name if req.attendance.course else 'N/A',
                        'code': req.attendance.course.code if req.attendance.course else 'N/A'
                    },
                    'date': req.attendance.date,
                    'current_status': req.attendance.status,
                    'proposed_status': req.proposed_status,
                    'reason': req.reason,
                    'status': req.status,
                    'requested_at': req.requested_at,
                    'admin_notes': req.admin_notes
                })
            
            return Response({'requests': requests_data})
            
        except Instructor.DoesNotExist:
            return Response({'error': 'Instructor not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)