from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .attendance_serializers import StudentSerializer, BulkAttendanceSerializer
from .permissions import IsInstructorForDepartment
from students.models import Student
from academics.models import Attendance, Department, Semester
from .models import Instructor


class InstructorDepartmentsView(APIView):
    """
    GET /api/instructors/departments/
    Get all departments for instructors to work with attendance and results
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            departments = Department.objects.all()
            from academics.serializers import DepartmentSerializer
            serializer = DepartmentSerializer(departments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DepartmentSemestersView(APIView):
    """
    GET /api/instructors/departments/<department_id>/semesters/
    Get semesters for a specific department
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, department_id):
        try:
            department = Department.objects.get(department_id=department_id)
            semesters = Semester.objects.filter(department=department)
            
            from academics.serializers import SemesterSerializer
            serializer = SemesterSerializer(semesters, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Department.DoesNotExist:
            return Response({"error": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DepartmentStudentsView(APIView):
    """
    GET /api/instructors/departments/<department_id>/semesters/<semester_id>/students/
    Get students by department and semester for attendance marking
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, department_id, semester_id):
        try:
            department = Department.objects.get(department_id=department_id)
            semester = Semester.objects.get(semester_id=semester_id, department=department)
            students = Student.objects.filter(department=department, semester=semester)
            serializer = StudentSerializer(students, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except (Department.DoesNotExist, Semester.DoesNotExist):
            return Response({"error": "Department or Semester not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BulkAttendanceView(APIView):
    """
    POST /api/instructors/attendance/bulk/
    Mark attendance for multiple students at once - TODAY ONLY
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            from datetime import date
            today = date.today()
            
            serializer = BulkAttendanceSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            attendance_date = serializer.validated_data['date']
            attendances_data = serializer.validated_data['attendances']
            
            # Only allow today's attendance
            if str(attendance_date) != str(today):
                return Response({
                    "error": "Attendance can only be marked for today's date"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if attendance already submitted for today
            instructor = request.user.instructor_profile if hasattr(request.user, 'instructor_profile') else None
            if instructor:
                existing_submitted = Attendance.objects.filter(
                    instructor=instructor,
                    date=today,
                    is_submitted=True
                ).exists()
                
                if existing_submitted:
                    return Response({
                        "error": "Attendance already submitted for today. Contact admin to make changes."
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
                "message": f"Attendance marked for {len(created_attendances)} students",
                "attendances": created_attendances
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubmitTodayAttendanceView(APIView):
    """
    POST /api/instructors/attendance/submit-today/
    Submit today's attendance (one-time only)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            from datetime import date
            today = date.today()
            
            instructor = request.user.instructor_profile if hasattr(request.user, 'instructor_profile') else None
            if not instructor:
                return Response({"error": "Instructor profile not found"}, status=status.HTTP_400_BAD_REQUEST)
            
            today_attendances = Attendance.objects.filter(
                instructor=instructor,
                date=today
            )
            
            if not today_attendances.exists():
                return Response({"error": "No attendance records found for today"}, status=status.HTTP_400_BAD_REQUEST)
            
            if today_attendances.filter(is_submitted=True).exists():
                return Response({"error": "Attendance already submitted for today"}, status=status.HTTP_400_BAD_REQUEST)
            
            submitted_count = today_attendances.update(
                is_submitted=True,
                can_edit=False
            )
            
            return Response({
                "message": f"Successfully submitted attendance for {submitted_count} students",
                "date": today,
                "submitted_count": submitted_count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CheckTodayAttendanceStatusView(APIView):
    """
    GET /api/instructors/attendance/today-status/
    Check if today's attendance is already submitted
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            from datetime import date
            today = date.today()
            
            instructor = request.user.instructor_profile if hasattr(request.user, 'instructor_profile') else None
            if not instructor:
                return Response({"error": "Instructor profile not found"}, status=status.HTTP_400_BAD_REQUEST)
            
            today_attendances = Attendance.objects.filter(
                instructor=instructor,
                date=today
            )
            
            is_submitted = today_attendances.filter(is_submitted=True).exists()
            total_marked = today_attendances.count()
            
            return Response({
                "date": today,
                "is_submitted": is_submitted,
                "total_marked": total_marked,
                "can_edit": not is_submitted
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)