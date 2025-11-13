from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from .models import HODRegistrationRequest
from .serializers import HODRegistrationRequestSerializer
from .permissions import IsAdminUser
from django.contrib.auth import get_user_model
from hods.models import HOD

User = get_user_model()

class HODRequestListView(APIView):
    permission_classes = [IsAuthenticated]  # Temporarily removed IsAdminUser for testing
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
    permission_classes = [IsAuthenticated]  # Temporarily removed IsAdminUser for testing
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