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
        print(f"Instructor timetable request from user: {request.user}")
        
        # Get instructor profile for logged-in user
        instructor = Instructor.objects.get(user=request.user)
        print(f"Found instructor: {instructor.name} (ID: {instructor.id}, Employee ID: {instructor.employee_id})")
        
        # Debug: Check if this is instructor 0874089
        if instructor.employee_id == '0874089':
            print("*** This is instructor 0874089 - checking timetable assignments ***")
            all_timetables = Timetable.objects.filter(instructor__employee_id='0874089')
            print(f"Direct query by employee_id found {all_timetables.count()} entries")
            for tt in all_timetables:
                print(f"  - {tt.day} {tt.start_time}-{tt.end_time}: {tt.course.name}")
        
        # Get timetable entries for this instructor
        timetables = Timetable.objects.filter(instructor=instructor).select_related(
            'course', 'semester', 'instructor'
        )
        print(f"Found {timetables.count()} timetable entries for instructor {instructor.name}")
        
        # Debug: Also try filtering by instructor ID directly
        timetables_by_id = Timetable.objects.filter(instructor_id=instructor.id)
        print(f"Alternative query by instructor_id={instructor.id} found {timetables_by_id.count()} entries")
        
        # Debug: Show all timetable entries for debugging
        if timetables.count() == 0:
            print("No timetables found - checking all timetable entries:")
            all_entries = Timetable.objects.all()[:5]  # Show first 5
            for entry in all_entries:
                print(f"  Entry: instructor_id={entry.instructor_id}, instructor_name={entry.instructor.name if entry.instructor else 'None'}")
        
        timetable_data = []
        for entry in timetables:
            print(f"Processing timetable entry: {entry.day} {entry.start_time} - {entry.course.name}")
            timetable_data.append({
                'id': entry.id,
                'day': entry.day,
                'start_time': entry.start_time.strftime('%H:%M'),
                'end_time': entry.end_time.strftime('%H:%M'),
                'room': entry.room,
                'course': {
                    'name': entry.course.name,
                    'course_code': entry.course.course_code
                },
                'semester': {
                    'name': entry.semester.name,
                    'semester_number': entry.semester.semester_number
                }
            })
        
        print(f"Returning {len(timetable_data)} timetable entries")
        
        return Response({
            'timetables': timetable_data,
            'instructor': {
                'name': instructor.name,
                'employee_id': instructor.employee_id,
                'department': instructor.department.name if instructor.department else None
            }
        }, status=status.HTTP_200_OK)
        
    except Instructor.DoesNotExist:
        print(f"Instructor profile not found for user: {request.user}")
        return Response({'error': 'Instructor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in instructor_timetable: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_instructor_mapping(request):
    """Debug endpoint to check instructor-user mapping"""
    try:
        print(f"Debug request from user: {request.user} (ID: {request.user.id})")
        
        # Check if instructor profile exists
        try:
            instructor = Instructor.objects.get(user=request.user)
            print(f"Found instructor: {instructor.name} (Employee ID: {instructor.employee_id})")
        except Instructor.DoesNotExist:
            print("No instructor profile found for this user")
            
            # Check if instructor exists by employee_id 0874089
            try:
                instructor_0874089 = Instructor.objects.get(employee_id='0874089')
                print(f"Instructor 0874089 exists: {instructor_0874089.name}, linked to user: {instructor_0874089.user}")
                if instructor_0874089.user:
                    print(f"User details: {instructor_0874089.user.username}, email: {instructor_0874089.user.email}")
                else:
                    print("Instructor 0874089 has no linked user account!")
            except Instructor.DoesNotExist:
                print("Instructor 0874089 does not exist in database")
            
            return Response({'error': 'No instructor profile found'}, status=404)
        
        # Check timetable assignments
        timetables = Timetable.objects.filter(instructor=instructor)
        print(f"Timetables for this instructor: {timetables.count()}")
        
        return Response({
            'user': request.user.username,
            'instructor': instructor.name,
            'employee_id': instructor.employee_id,
            'timetable_count': timetables.count()
        })
        
    except Exception as e:
        print(f"Debug error: {str(e)}")
        return Response({'error': str(e)}, status=500)