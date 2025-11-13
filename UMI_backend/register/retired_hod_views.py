from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from hods.models import HOD
from .models import HODRegistrationRequest
from django.utils import timezone

class RetiredHODView(APIView):
    """
    View for managing retired HOD records
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all retired HOD records"""
        try:
            # Get retired HODs from HOD model (is_active=False)
            retired_hods_from_model = HOD.objects.filter(is_active=False)
            
            # Get rejected HOD requests
            rejected_requests = HODRegistrationRequest.objects.filter(status='rejected')
            
            # Get retired requests (if we add this status later)
            retired_requests = HODRegistrationRequest.objects.filter(status='retired')
            
            retired_hods_data = []
            
            # Add retired HODs from HOD model
            for hod in retired_hods_from_model:
                retired_hods_data.append({
                    'id': hod.id,
                    'name': hod.name,
                    'email': hod.email,
                    'employee_id': hod.employee_id,
                    'phone': hod.phone,
                    'department_name': hod.department.name if hod.department else 'N/A',
                    'designation': hod.designation,
                    'specialization': hod.specialization,
                    'experience_years': hod.experience_years,
                    'status': 'retired',
                    'retired_at': hod.updated_at.isoformat() if hod.updated_at else timezone.now().isoformat(),
                    'retirement_reason': 'Deactivated by admin',
                    'image': hod.image.url if hod.image else None
                })
            
            # Add rejected requests
            for request in rejected_requests:
                retired_hods_data.append({
                    'id': request.id,
                    'name': request.name,
                    'email': request.email,
                    'employee_id': request.employee_id,
                    'phone': request.phone,
                    'department_name': request.department.name if request.department else 'N/A',
                    'designation': request.designation,
                    'specialization': request.specialization,
                    'experience_years': request.experience_years,
                    'status': 'rejected',
                    'retired_at': request.reviewed_at.isoformat() if request.reviewed_at else request.requested_at.isoformat(),
                    'retirement_reason': request.rejection_reason or 'Application rejected',
                    'image': None
                })
            
            # Add retired requests
            for request in retired_requests:
                retired_hods_data.append({
                    'id': request.id,
                    'name': request.name,
                    'email': request.email,
                    'employee_id': request.employee_id,
                    'phone': request.phone,
                    'department_name': request.department.name if request.department else 'N/A',
                    'designation': request.designation,
                    'specialization': request.specialization,
                    'experience_years': request.experience_years,
                    'status': 'retired',
                    'retired_at': request.reviewed_at.isoformat() if request.reviewed_at else request.requested_at.isoformat(),
                    'retirement_reason': request.rejection_reason or 'Retired',
                    'image': None
                })

            return Response({
                'success': True,
                'data': retired_hods_data,
                'count': len(retired_hods_data)
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Retire an active HOD"""
        try:
            hod_id = request.data.get('hod_id')
            retirement_reason = request.data.get('reason', 'Retired by admin')
            
            if not hod_id:
                return Response({
                    'success': False,
                    'error': 'HOD ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Try to find HOD in HOD model
            try:
                hod = HOD.objects.get(id=hod_id, is_active=True)
                hod.is_active = False
                hod.save()
                
                return Response({
                    'success': True,
                    'message': f'{hod.name} has been retired successfully'
                })
            except HOD.DoesNotExist:
                pass
            
            # Try to find in HOD registration requests
            try:
                hod_request = HODRegistrationRequest.objects.get(id=hod_id, status='approved')
                hod_request.status = 'retired'
                hod_request.reviewed_at = timezone.now()
                hod_request.rejection_reason = retirement_reason
                hod_request.save()
                
                return Response({
                    'success': True,
                    'message': f'{hod_request.name} has been retired successfully'
                })
            except HODRegistrationRequest.DoesNotExist:
                pass
            
            return Response({
                'success': False,
                'error': 'HOD not found or already retired'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)