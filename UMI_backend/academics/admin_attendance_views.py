from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from .models import Attendance, Department, Semester, Course, Timetable
from students.models import Student
from instructors.models import Instructor


class AdminAttendanceView(APIView):
    """
    GET /api/academics/admin/attendance/
    Professional attendance management with proper filtering
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            date_filter = request.query_params.get('date')
            department_id = request.query_params.get('department_id')
            semester_id = request.query_params.get('semester_id')

            # Get filtered students first
            students_query = Student.objects.select_related('department', 'semester')
            
            if department_id:
                students_query = students_query.filter(department__department_id=department_id)
            if semester_id:
                students_query = students_query.filter(semester__semester_id=semester_id)
            
            students = students_query.order_by('department__name', 'semester__name', 'name')
            
            # Get attendance records for filtered students with course info
            attendance_query = Attendance.objects.select_related(
                'student', 'instructor', 'timetable__course'
            )
            if date_filter:
                attendance_query = attendance_query.filter(date=date_filter)
            
            attendance_records = attendance_query.filter(student__in=students)
            
            # Create attendance lookup
            attendance_lookup = {}
            for att in attendance_records:
                key = f"{att.student.student_id}_{att.date}"
                attendance_lookup[key] = att
            
            # Organize students by department and semester
            organized_data = {}
            for student in students:
                dept_name = student.department.name if student.department else "No Department"
                sem_name = student.semester.name if student.semester else "No Semester"
                
                if dept_name not in organized_data:
                    organized_data[dept_name] = {}
                if sem_name not in organized_data[dept_name]:
                    organized_data[dept_name][sem_name] = []
                
                # Get attendance for this student on the filtered date
                attendance_key = f"{student.student_id}_{date_filter}" if date_filter else None
                attendance = attendance_lookup.get(attendance_key) if attendance_key else None
                
                student_data = {
                    'student_id': student.student_id,
                    'student_name': student.name,
                    'email': student.email,
                    'phone': getattr(student, 'phone', 'N/A'),
                    'attendance': {
                        'id': attendance.attendance_id if attendance else None,
                        'status': attendance.status if attendance else 'Not Marked',
                        'instructor': attendance.instructor.name if attendance and attendance.instructor else 'N/A',
                        'course': {
                            'name': attendance.timetable.course.name if attendance and attendance.timetable and attendance.timetable.course else 'N/A',
                            'code': attendance.timetable.course.code if attendance and attendance.timetable and attendance.timetable.course else 'N/A'
                        } if attendance and attendance.timetable else {'name': 'N/A', 'code': 'N/A'},
                        'time_slot': f"{attendance.timetable.start_time} - {attendance.timetable.end_time}" if attendance and attendance.timetable else 'N/A',
                        'room': attendance.timetable.room if attendance and attendance.timetable else 'N/A',
                        'marked_at': attendance.marked_at if attendance else None,
                        'is_submitted': attendance.is_submitted if attendance else False,
                        'can_edit': attendance.can_edit if attendance else True
                    } if date_filter else None
                }
                
                organized_data[dept_name][sem_name].append(student_data)
            
            # Calculate statistics
            stats = {
                'total_students': students.count(),
                'total_records': attendance_records.count(),
                'present': attendance_records.filter(status='Present').count(),
                'absent': attendance_records.filter(status='Absent').count(),
                'late': attendance_records.filter(status='Late').count()
            }
            
            return Response({
                'organized_data': organized_data,
                'statistics': stats,
                'filters': {
                    'date': date_filter,
                    'department_id': department_id,
                    'semester_id': semester_id
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminAttendanceStatsView(APIView):
    """
    GET /api/academics/admin/attendance/stats/
    Get attendance statistics by department and semester
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get all departments with their attendance stats
            departments = Department.objects.all()
            stats = []

            for dept in departments:
                semesters = Semester.objects.filter(department=dept)
                dept_stats = {
                    'department_id': dept.department_id,
                    'department_name': dept.name,
                    'department_code': dept.code,
                    'semesters': []
                }

                for sem in semesters:
                    students = Student.objects.filter(department=dept, semester=sem)
                    total_students = students.count()
                    
                    # Get attendance stats for this semester
                    attendances = Attendance.objects.filter(student__in=students)
                    total_records = attendances.count()
                    present_count = attendances.filter(status='Present').count()
                    absent_count = attendances.filter(status='Absent').count()
                    late_count = attendances.filter(status='Late').count()

                    sem_stats = {
                        'semester_id': sem.semester_id,
                        'semester_name': sem.name,
                        'semester_code': sem.semester_code,
                        'total_students': total_students,
                        'attendance_stats': {
                            'total_records': total_records,
                            'present': present_count,
                            'absent': absent_count,
                            'late': late_count,
                            'attendance_rate': round((present_count / total_records * 100), 2) if total_records > 0 else 0
                        }
                    }
                    dept_stats['semesters'].append(sem_stats)

                stats.append(dept_stats)

            return Response({'department_stats': stats}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)