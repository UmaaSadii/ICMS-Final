from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from datetime import date
from .attendance_serializers import BulkAttendanceSerializer
from students.models import Student
from academics.models import Attendance
from .models import Instructor


class TestBulkAttendanceView(APIView):
    """
    POST /api/instructors/attendance/test-bulk/
    Test attendance marking without slot restrictions - FOR TESTING ONLY
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = BulkAttendanceSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            attendance_date = serializer.validated_data['date']
            attendances_data = serializer.validated_data['attendances']
            
            instructor = request.user.instructor_profile if hasattr(request.user, 'instructor_profile') else None
            
            # Check if attendance already submitted for this date
            if instructor:
                existing_submitted = Attendance.objects.filter(
                    instructor=instructor,
                    date=attendance_date,
                    is_submitted=True
                ).exists()
                
                if existing_submitted:
                    return Response({
                        "error": "Attendance already submitted for this date. Contact admin to make changes."
                    }, status=status.HTTP_400_BAD_REQUEST)

            created_attendances = []
            for attendance_data in attendances_data:
                student_id = attendance_data['student_id']
                status_value = attendance_data['status']

                try:
                    student = Student.objects.get(pk=student_id)
                    attendance, created = Attendance.objects.update_or_create(
                        student=student,
                        date=attendance_date,
                        defaults={
                            'status': status_value,
                            'instructor': instructor,
                            'marked_by': instructor,
                            'can_edit': True,
                            'is_submitted': False
                        }
                    )
                    created_attendances.append({
                        'student_id': student.student_id,
                        'student_name': student.name,
                        'status': attendance.status,
                        'created': created
                    })
                except Student.DoesNotExist:
                    return Response({"error": f"Student with id {student_id} not found"},
                                   status=status.HTTP_404_NOT_FOUND)

            return Response({
                "message": f"TEST: Attendance marked for {len(created_attendances)} students",
                "attendances": created_attendances
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TestSubmitAttendanceView(APIView):
    """
    POST /api/instructors/attendance/test-submit/
    Submit attendance - works once per day per instructor slot
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            from django.utils import timezone
            from academics.models import Timetable
            
            attendance_date = request.data.get('date')
            if not attendance_date:
                return Response({"error": "Date is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            instructor = request.user.instructor_profile if hasattr(request.user, 'instructor_profile') else None
            if not instructor:
                return Response({"error": "Instructor profile not found"}, status=status.HTTP_400_BAD_REQUEST)
            
            attendances = Attendance.objects.filter(
                instructor=instructor,
                date=attendance_date
            )
            
            if not attendances.exists():
                return Response({"error": "No attendance records found for this date"}, status=status.HTTP_400_BAD_REQUEST)
            
            if attendances.filter(is_submitted=True).exists():
                return Response({"error": "Attendance already submitted for this date"}, status=status.HTTP_400_BAD_REQUEST)
            
            submitted_count = attendances.update(
                is_submitted=True,
                can_edit=False
            )
            
            return Response({
                "message": f"Successfully submitted attendance for {submitted_count} students",
                "date": attendance_date,
                "submitted_count": submitted_count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TestAttendanceStatusView(APIView):
    """
    GET /api/instructors/attendance/test-status/
    Check attendance status and slot availability
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            from django.utils import timezone
            from academics.models import Timetable
            
            attendance_date = request.query_params.get('date', str(date.today()))
            
            instructor = request.user.instructor_profile if hasattr(request.user, 'instructor_profile') else None
            if not instructor:
                return Response({"error": "Instructor profile not found"}, status=status.HTTP_400_BAD_REQUEST)
            
            attendances = Attendance.objects.filter(
                instructor=instructor,
                date=attendance_date
            )
            
            is_submitted = attendances.filter(is_submitted=True).exists()
            total_marked = attendances.count()
            
            # No slot restrictions - always allow submission if not already submitted
            can_submit_now = not is_submitted
            
            return Response({
                "date": attendance_date,
                "is_submitted": is_submitted,
                "total_marked": total_marked,
                "can_edit": not is_submitted,
                "can_submit_now": can_submit_now,
                "has_slots_today": True
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)