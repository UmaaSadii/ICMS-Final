import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from .models import PrincipalRegistrationRequest
from .serializers import PrincipalRegistrationRequestSerializer
from django.contrib.auth import authenticate, get_user_model
from .serializers import RegisterSerializer
from .permissions import IsAdminUser

logger = logging.getLogger(__name__)

User = get_user_model()

# -----------------------------
# 1️⃣ Public Register API
# -----------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    logger.info("Incoming data: %s", request.data)
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Check if it's a HOD registration request
        if hasattr(user, '_is_hod_request') and user._is_hod_request:
            return Response({
                "message": "HOD registration request submitted successfully. Please wait for admin approval.",
                "request_id": user.id,
                "status": "pending",
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "name": user.name
                }
            }, status=status.HTTP_201_CREATED)
        
        # Regular user registration
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_superuser": user.is_superuser,
                "is_staff": user.is_staff,
            },
            "access_token": token.key,
            "refresh_token": None
        }, status=status.HTTP_201_CREATED)
    logger.error("Registration errors: %s", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# -----------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Check if it's an instructor login (employee_id format)
    if username and not '@' in username:
        try:
            from instructors.models import Instructor
            instructor = Instructor.objects.select_related('user').get(employee_id=username)
            if instructor.password and instructor.password == password:
                user = instructor.user
                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": "instructor",
                        "first_name": instructor.name.split()[0] if instructor.name else '',
                        "last_name": ' '.join(instructor.name.split()[1:]) if instructor.name and len(instructor.name.split()) > 1 else '',
                        "employee_id": instructor.employee_id,
                        "department": instructor.department.name if instructor.department else None,
                        "is_superuser": user.is_superuser,
                        "is_staff": user.is_staff
                    },
                    "access_token": token.key,
                    "refresh_token": None
                }, status=status.HTTP_200_OK)
        except Instructor.DoesNotExist:
            pass
    
    # Regular user authentication
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_superuser": user.is_superuser,
                "is_staff": user.is_staff,
            },
            "access_token": token.key,
            "refresh_token": None
        }, status=status.HTTP_200_OK)

    return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# -----------------------------
# 3️⃣ List all users (all logged-in users can view)
# -----------------------------
class UserListView(generics.ListAPIView):
    """
    List all users: everyone logged-in can view
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAuthenticated]

# -----------------------------
# 4️⃣ Single user GET / PUT / DELETE
# GET → all logged-in users
# PUT/DELETE → admin only
# -----------------------------
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'DELETE']:
            # sirf admin modify/delete
            return [IsAuthenticated(), IsAdminUser()]
        # GET → sab logged-in users
        return [IsAuthenticated()]


# HOD Registration Request
@api_view(['POST'])
@permission_classes([AllowAny])
def hod_registration_request(request):
    from .models import HODRegistrationRequest
    from academics.models import Department
    
    try:
        data = request.data
        department = Department.objects.get(department_id=data.get('department_id'))
        
        hod_request = HODRegistrationRequest.objects.create(
            name=data.get('name'),
            email=data.get('email'),
            employee_id=data.get('employee_id'),
            phone=data.get('phone'),
            department=department,
            designation=data.get('designation', 'HOD'),
            experience_years=data.get('experience_years', 0),
            specialization=data.get('specialization'),
            password=data.get('password')
        )
        
        return Response({
            'message': 'HOD registration request submitted successfully',
            'request_id': hod_request.id,
            'status': 'pending'
        }, status=status.HTTP_201_CREATED)
        
    except Department.DoesNotExist:
        return Response({'error': 'Invalid department'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# Admin: Get HOD Registration Requests
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_hod_requests(request):
    from .models import HODRegistrationRequest
    
    requests = HODRegistrationRequest.objects.select_related('department', 'reviewed_by')
    
    requests_data = []
    for req in requests:
        requests_data.append({
            'id': req.id,
            'name': req.name,
            'email': req.email,
            'employee_id': req.employee_id,
            'phone': req.phone,
            'department': req.department.name,
            'designation': req.designation,
            'experience_years': req.experience_years,
            'specialization': req.specialization,
            'status': req.status,
            'requested_at': req.requested_at,
            'reviewed_at': req.reviewed_at,
            'reviewed_by': req.reviewed_by.username if req.reviewed_by else None,
            'rejection_reason': req.rejection_reason
        })
    
    return Response(requests_data)


# Admin: Approve/Reject HOD Request
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def review_hod_request(request, request_id):
    from .models import HODRegistrationRequest
    from instructors.models import Instructor
    from django.utils import timezone
    
    try:
        hod_request = HODRegistrationRequest.objects.get(id=request_id)
        action = request.data.get('action')  # 'approve' or 'reject'
        
        if action == 'approve':
            # Create User
            user = User.objects.create_user(
                username=hod_request.email,
                email=hod_request.email,
                password=hod_request.password,
                role='hod',
                name=hod_request.name
            )
            
            # Create Instructor profile
            Instructor.objects.create(
                user=user,
                employee_id=hod_request.employee_id,
                name=hod_request.name,
                phone=hod_request.phone,
                department=hod_request.department,
                designation=hod_request.designation,
                experience_years=hod_request.experience_years,
                specialization=hod_request.specialization,
                password=hod_request.password
            )
            
            hod_request.status = 'approved'
            message = 'HOD request approved successfully'
            
        elif action == 'reject':
            hod_request.status = 'rejected'
            hod_request.rejection_reason = request.data.get('reason', '')
            message = 'HOD request rejected'
        
        hod_request.reviewed_at = timezone.now()
        hod_request.reviewed_by = request.user
        hod_request.save()
        
        return Response({'message': message})
        
    except HODRegistrationRequest.DoesNotExist:
        return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
# Admin Dashboard Cards
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_dashboard_cards(request):
    from .models import HODRegistrationRequest
    
    pending_count = HODRegistrationRequest.objects.filter(status='pending').count()
    approved_count = HODRegistrationRequest.objects.filter(status='approved').count()
    rejected_count = HODRegistrationRequest.objects.filter(status='rejected').count()
    
    return Response({
        'hod_requests_card': {
            'title': 'HOD Registration Requests',
            'pending': pending_count,
            'approved': approved_count,
            'rejected': rejected_count,
            'total': pending_count + approved_count + rejected_count,
            'endpoint': '/api/hods/admin/requests/',
            'icon': 'user-check',
            'color': 'warning' if pending_count > 0 else 'success'
        }
    })


from django.utils import timezone

class PrincipalRegistrationRequestView(generics.CreateAPIView):
    queryset = PrincipalRegistrationRequest.objects.all()
    serializer_class = PrincipalRegistrationRequestSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Principal registration request submitted successfully."},
            status=status.HTTP_201_CREATED
        )


class PrincipalRequestListView(generics.ListAPIView):
    queryset = PrincipalRegistrationRequest.objects.all()
    serializer_class = PrincipalRegistrationRequestSerializer


class PrincipalApproveRejectView(generics.UpdateAPIView):
    queryset = PrincipalRegistrationRequest.objects.all()
    serializer_class = PrincipalRegistrationRequestSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        status_value = request.data.get("status")

        if status_value not in ["approved", "rejected"]:
            return Response({"error": "Invalid status value"}, status=status.HTTP_400_BAD_REQUEST)

        instance.status = status_value
        instance.reviewed_by = request.user
        instance.reviewed_at = timezone.now()
        instance.save()

        if status_value == "approved":
            user = User.objects.create_user(
                username=instance.email.split('@')[0],
                email=instance.email,
                password=instance.password,
                name=instance.name,
                role="principal"
            )
            instance.principal_request_status = "account_created"
            instance.save()

        return Response(
            {"message": f"Principal request {status_value} successfully."},
            status=status.HTTP_200_OK
        )
