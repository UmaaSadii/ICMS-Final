from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from academics.models import Timetable
from .models import Instructor
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_timetable(request):
    """Get timetable slots assigned to the logged-in instructor"""
    try:
        # Get instructor
        instructor = Instructor.objects.get(user=request.user)
        
        # Get timetables with course and semester info
        timetables = Timetable.objects.filter(instructor=instructor).select_related('course', 'course__semester')
        
        timetable_data = []
        for entry in timetables:
            timetable_data.append({
                'id': entry.timetable_id,
                'day': entry.day,
                'start_time': entry.start_time.strftime('%H:%M'),
                'end_time': entry.end_time.strftime('%H:%M'),
                'room': entry.room or 'TBA',
                'course': {
                    'name': entry.course.name,
                    'code': entry.course.code
                },
                'semester': {
                    'name': entry.course.semester.name if entry.course.semester else 'N/A',
                    'semester_code': entry.course.semester.semester_code if entry.course.semester else 'N/A'
                }
            })
        
        return Response({
            'timetables': timetable_data,
            'instructor': {
                'name': instructor.name,
                'employee_id': instructor.employee_id,
                'department': instructor.department.name if instructor.department else None
            }
        }, status=status.HTTP_200_OK)
        
    except Instructor.DoesNotExist:
        return Response({'error': 'Instructor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_info(request):
    """Show current user info"""
    user = request.user
    try:
        instructor = Instructor.objects.get(user=user)
        return Response({
            'user': {'username': user.username, 'email': user.email, 'id': user.id},
            'instructor': {'name': instructor.name, 'employee_id': instructor.employee_id, 'id': instructor.id},
            'has_instructor_profile': True
        })
    except Instructor.DoesNotExist:
        return Response({
            'user': {'username': user.username, 'email': user.email, 'id': user.id},
            'has_instructor_profile': False
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_instructor_mapping(request):
    """Debug endpoint to check instructor-user mapping"""
    try:
        # Check if instructor profile exists
        try:
            instructor = Instructor.objects.get(user=request.user)
        except Instructor.DoesNotExist:
            return Response({'error': 'No instructor profile found'}, status=404)
        
        # Check timetable assignments
        timetables = Timetable.objects.filter(instructor=instructor)
        
        return Response({
            'user': request.user.username,
            'instructor': instructor.name,
            'employee_id': instructor.employee_id,
            'timetable_count': timetables.count()
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)