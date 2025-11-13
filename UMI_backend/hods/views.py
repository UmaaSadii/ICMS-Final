from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from .models import HODRegistrationRequest, HOD
from .serializers import HODRegistrationRequestSerializer, HODRegistrationSerializer, HODSerializer
from .permissions import IsAdminUser
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404

User = get_user_model()

class HODRequestListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        requests = HODRegistrationRequest.objects.all().order_by('-requested_at')
        serializer = HODRegistrationRequestSerializer(requests, many=True)
        return Response({
            'requests': serializer.data,
            'stats': {
                'total': requests.count(),
                'pending': requests.filter(status='pending').count(),
                'approved': requests.filter(status='approved').count(),
                'rejected': requests.filter(status='rejected').count()
            }
        })

@method_decorator(csrf_exempt, name='dispatch')
class HODRequestActionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request, request_id):
        try:
            hod_request = HODRegistrationRequest.objects.get(id=request_id)
            action = request.data.get('action')
            
            if action == 'approve':
                hod_request.status = 'approved'
                hod_request.hod_request_status = 'approved'
                hod_request.reviewed_at = timezone.now()
                hod_request.save()

                # Create HOD user account if it doesn't exist
                user, created = User.objects.get_or_create(
                    username=hod_request.employee_id,
                    defaults={
                        'email': hod_request.email,
                        'role': 'hod',
                        'name': hod_request.name
                    }
                )
                
                if created:
                    user.set_password(hod_request.password)
                    user.save()
                else:
                    # User already exists, update role if needed
                    user.role = 'hod'
                    user.name = hod_request.name
                    user.email = hod_request.email
                    user.save()

                # Create HOD record if it doesn't exist
                hod, hod_created = HOD.objects.get_or_create(
                    email=hod_request.email,
                    defaults={
                        'user': user,
                        'employee_id': hod_request.employee_id,
                        'name': hod_request.name,
                        'phone': hod_request.phone,
                        'department': hod_request.department,
                        'designation': hod_request.designation,
                        'specialization': hod_request.specialization,
                        'experience_years': hod_request.experience_years,
                        'hire_date': timezone.now().date(),
                        'is_active': True
                    }
                )
                
                if not hod_created:
                    # Update existing HOD record
                    hod.user = user
                    hod.name = hod_request.name
                    hod.phone = hod_request.phone
                    hod.department = hod_request.department
                    hod.designation = hod_request.designation
                    hod.specialization = hod_request.specialization
                    hod.experience_years = hod_request.experience_years
                    hod.is_active = True
                    hod.save()

                # Update status to completed
                hod_request.hod_request_status = 'completed'
                hod_request.save()
                
            elif action == 'reject':
                hod_request.status = 'rejected'
                hod_request.hod_request_status = 'rejected'
                hod_request.reviewed_at = timezone.now()
                hod_request.rejection_reason = request.data.get('reason', '')
                hod_request.save()
                
            serializer = HODRegistrationRequestSerializer(hod_request)
            return Response(serializer.data)
            
        except HODRegistrationRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=404)


@api_view(['POST'])
@permission_classes([])
def hod_registration_request(request):
    """HOD Registration Request"""
    if request.method == 'POST':
        serializer = HODRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            hod_request = serializer.save()
            return Response({
                'message': 'HOD registration request submitted successfully',
                'request_id': hod_request.id,
                'status': 'pending_approval'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_hod_requests(request):
    """Get all HOD requests"""
    requests = HODRegistrationRequest.objects.all().order_by('-requested_at')
    serializer = HODRegistrationRequestSerializer(requests, many=True)
    return Response({
        'requests': serializer.data,
        'count': requests.count()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def review_hod_request(request, request_id):
    """Review HOD request (approve/reject)"""
    try:
        hod_request = HODRegistrationRequest.objects.get(id=request_id)
        action = request.data.get('action')
        
        if action == 'approve':
            hod_request.status = 'approved'
            hod_request.reviewed_at = timezone.now()
            hod_request.reviewed_by = request.user
            hod_request.save()
            
            # Create user account
            user = User.objects.create_user(
                username=hod_request.employee_id,
                email=hod_request.email,
                password=hod_request.password,
                role='hod',
                name=hod_request.name
            )
            
            # Create HOD profile
            HOD.objects.create(
                user=user,
                employee_id=hod_request.employee_id,
                name=hod_request.name,
                email=hod_request.email,
                phone=hod_request.phone,
                department=hod_request.department,
                designation=hod_request.designation,
                specialization=hod_request.specialization,
                experience_years=hod_request.experience_years,
                hire_date=timezone.now().date()
            )
            
            return Response({'message': 'HOD request approved successfully'})
            
        elif action == 'reject':
            hod_request.status = 'rejected'
            hod_request.reviewed_at = timezone.now()
            hod_request.reviewed_by = request.user
            hod_request.rejection_reason = request.data.get('reason', '')
            hod_request.save()
            
            return Response({'message': 'HOD request rejected'})
            
    except HODRegistrationRequest.DoesNotExist:
        return Response({'error': 'Request not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hod_profile(request):
    """Get current HOD's profile"""
    try:
        print(f"Looking for HOD with email: {request.user.email}")
        print(f"All HODs: {list(HOD.objects.all().values_list('email', 'name'))}")
        
        # Find HOD by email since they registered with their email
        hod = HOD.objects.filter(email=request.user.email).first()
        if not hod:
            print("HOD not found by email, trying by user")
            # Try by user relationship
            hod = HOD.objects.filter(user=request.user).first()
        
        if not hod:
            print("No HOD found, checking HOD registration requests...")
            from .models import HODRegistrationRequest
            hod_request = HODRegistrationRequest.objects.filter(email=request.user.email, status='approved').first()
            if hod_request:
                print(f"Found approved HOD request: {hod_request.name}")
                # Return data from HOD registration request
                data = {
                    'name': hod_request.name,
                    'email': hod_request.email,
                    'phone': hod_request.phone,
                    'employee_id': hod_request.employee_id,
                    'designation': hod_request.designation,
                    'specialization': hod_request.specialization,
                    'experience_years': hod_request.experience_years,
                    'hire_date': hod_request.hire_date.isoformat() if hod_request.hire_date else None,
                    'department': {
                        'name': hod_request.department.name if hod_request.department else None
                    },
                    'image': request.build_absolute_uri(hod_request.image.url) if hod_request.image else None
                }
                return Response(data)
            return Response({'error': 'HOD profile not found'}, status=404)
        
        print(f"Found HOD: {hod.name}, Department: {hod.department}")
        if hod.department:
            print(f"Department fields: {dir(hod.department)}")
        
        # Manual serialization to avoid serializer issues
        data = {
            'id': hod.id,
            'name': hod.name,
            'email': hod.email,
            'phone': hod.phone,
            'employee_id': hod.employee_id,
            'designation': hod.designation,
            'specialization': hod.specialization,
            'experience_years': hod.experience_years,
            'hire_date': hod.hire_date.isoformat() if hod.hire_date else None,
            'department': {
                'id': getattr(hod.department, 'department_id', getattr(hod.department, 'pk', None)) if hod.department else None,
                'name': hod.department.name if hod.department else None
            },
            'image': request.build_absolute_uri(hod.image.url) if hod.image else None
        }
        
        return Response(data)
    except Exception as e:
        import traceback
        print(f"HOD Profile Error: {str(e)}")
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=500)