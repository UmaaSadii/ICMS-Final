from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import HODRegistrationRequest, User
from .serializers import HODRegistrationRequestSerializer, HODSerializer
from .permissions import IsAdminUser
from academics.models import Department
from academics.serializers import DepartmentSerializer
from hods.models import HOD
from django.contrib.auth.hashers import make_password

class HODRecordDetailView(APIView):
    """
    GET, PUT, DELETE /api/register/admin/hod-records/{id}/
    Manage individual HOD records
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self, pk):
        try:
            return HODRegistrationRequest.objects.get(pk=pk, status='approved')
        except HODRegistrationRequest.DoesNotExist:
            return None

    def get(self, request, pk):
        """Get HOD details"""
        hod = self.get_object(pk)
        if not hod:
            return Response({'error': 'HOD not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = HODSerializer(hod)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def put(self, request, pk):
        """Update HOD details with retirement support"""
        try:
            hod_request = self.get_object(pk)
            if not hod_request:
                return Response({'error': 'HOD not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Handle retirement
            if request.data.get('action') == 'retire':
                hod_request.status = 'retired'
                hod_request.rejection_reason = 'Retired by admin'
                hod_request.save()
                
                return Response({
                    'success': True,
                    'message': f'HOD {hod_request.name} retired successfully'
                })
            
            # Check department constraint when changing department
            if 'department' in request.data:
                try:
                    dept_id = int(request.data['department'])
                    new_department = Department.objects.get(department_id=dept_id)
                    
                    # Check if another active HOD exists for this department
                    existing_hod = HODRegistrationRequest.objects.filter(
                        department=new_department,
                        status='approved'
                    ).exclude(id=hod_request.id).first()
                    
                    if existing_hod:
                        return Response({
                            'success': False,
                            'error': f'Department {new_department.name} already has an active HOD: {existing_hod.name}'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    hod_request.department = new_department
                except (ValueError, Department.DoesNotExist):
                    return Response({
                        'success': False,
                        'error': 'Invalid department ID'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update other fields
            if 'name' in request.data:
                hod_request.name = request.data['name']
            if 'email' in request.data:
                hod_request.email = request.data['email']
            if 'phone' in request.data:
                hod_request.phone = request.data['phone']
            if 'specialization' in request.data:
                hod_request.specialization = request.data['specialization']
            if 'experience_years' in request.data:
                hod_request.experience_years = int(request.data['experience_years'])
            if 'designation' in request.data:
                hod_request.designation = request.data['designation']
            if 'employee_id' in request.data:
                hod_request.employee_id = request.data['employee_id']
            
            hod_request.save()
            
            return Response({
                'success': True,
                'message': f'HOD {hod_request.name} updated successfully',
                'data': {
                    'id': hod_request.id,
                    'name': hod_request.name,
                    'email': hod_request.email,
                    'phone': hod_request.phone,
                    'department': {
                        'id': hod_request.department.department_id if hod_request.department else None,
                        'name': hod_request.department.name if hod_request.department else 'N/A'
                    },
                    'department_name': hod_request.department.name if hod_request.department else 'N/A',
                    'specialization': hod_request.specialization,
                    'experience_years': hod_request.experience_years,
                    'designation': hod_request.designation,
                    'employee_id': hod_request.employee_id,
                    'is_active': True,
                    'status': hod_request.status
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Update failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        """Delete HOD record (soft delete)"""
        try:
            hod_request = self.get_object(pk)
            if not hod_request:
                return Response({'error': 'HOD not found'}, status=status.HTTP_404_NOT_FOUND)
            
            hod_name = hod_request.name
            hod_request.status = 'rejected'
            hod_request.rejection_reason = 'Deactivated by admin'
            hod_request.save()
            
            # Deactivate user if exists
            try:
                user = User.objects.get(email=hod_request.email)
                user.is_active = False
                user.save()
            except User.DoesNotExist:
                pass
            
            return Response({
                'success': True,
                'message': f'HOD {hod_name} deactivated successfully'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Delete failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HODRecordListView(APIView):
    """
    GET /api/register/admin/hod-records/
    POST /api/register/admin/hod-records/
    List all active HOD records or create new HOD record
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        try:
            # Get approved HOD requests as active HODs
            approved_requests = HODRegistrationRequest.objects.filter(
                status='approved'
            ).select_related('department')
            
            hod_data = []
            for req in approved_requests:
                hod_data.append({
                    'id': req.id,
                    'name': req.name,
                    'email': req.email,
                    'phone': req.phone,
                    'department': {
                        'id': req.department.department_id if req.department else None,
                        'name': req.department.name if req.department else 'N/A'
                    },
                    'department_name': req.department.name if req.department else 'N/A',
                    'designation': req.designation,
                    'specialization': req.specialization,
                    'experience_years': req.experience_years,
                    'hire_date': req.reviewed_at.date() if req.reviewed_at else None,
                    'is_active': True,
                    'employee_id': req.employee_id,
                    'status': req.status
                })
            
            return Response({
                'success': True,
                'data': hod_data,
                'count': len(hod_data)
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new HOD record with department constraint"""
        try:
            # Check department constraint
            if 'department' in request.data:
                try:
                    dept_id = int(request.data['department'])
                    department = Department.objects.get(department_id=dept_id)
                    
                    # Check if department already has an active HOD
                    existing_hod = HODRegistrationRequest.objects.filter(
                        department=department,
                        status='approved'
                    ).first()
                    
                    if existing_hod:
                        return Response({
                            'success': False,
                            'error': f'Department {department.name} already has an active HOD: {existing_hod.name}. Please retire the current HOD first.'
                        }, status=status.HTTP_400_BAD_REQUEST)
                        
                except (ValueError, Department.DoesNotExist):
                    return Response({
                        'success': False,
                        'error': 'Invalid department ID'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create HOD registration request
            hod_request = HODRegistrationRequest.objects.create(
                name=request.data.get('name', ''),
                email=request.data.get('email', ''),
                phone=request.data.get('phone', ''),
                department=department,
                specialization=request.data.get('specialization', ''),
                designation=request.data.get('designation', 'HOD'),
                experience_years=int(request.data.get('experience_years', 0)),
                employee_id=request.data.get('employee_id', ''),
                password='defaultpassword123',
                status='approved'
            )
            
            # Create user account
            if not User.objects.filter(email=hod_request.email).exists():
                User.objects.create_user(
                    username=hod_request.email,
                    email=hod_request.email,
                    password='defaultpassword123',
                    role='hod',
                    name=hod_request.name
                )
            
            return Response({
                'success': True,
                'message': f'HOD {hod_request.name} created successfully',
                'data': {
                    'id': hod_request.id,
                    'name': hod_request.name,
                    'email': hod_request.email,
                    'phone': hod_request.phone,
                    'department': {
                        'id': hod_request.department.department_id,
                        'name': hod_request.department.name
                    },
                    'department_name': hod_request.department.name,
                    'specialization': hod_request.specialization,
                    'experience_years': hod_request.experience_years,
                    'designation': hod_request.designation,
                    'employee_id': hod_request.employee_id,
                    'is_active': True,
                    'status': hod_request.status
                }
            }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to create HOD: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HODDepartmentListView(APIView):
    """
    GET /api/register/admin/hod-departments/
    Get all departments for HOD management
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            departments = Department.objects.all().order_by('name')
            
            # Get departments with active HODs
            occupied_dept_ids = HODRegistrationRequest.objects.filter(
                status='approved'
            ).values_list('department__department_id', flat=True)
            
            dept_data = []
            for dept in departments:
                dept_data.append({
                    'id': dept.department_id,
                    'name': dept.name,
                    'code': dept.code,
                    'description': dept.description,
                    'has_active_hod': dept.department_id in occupied_dept_ids
                })
            
            return Response({
                'success': True,
                'data': dept_data
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HODStatsView(APIView):
    """
    GET /api/register/admin/hod-stats/
    Get HOD statistics for dashboard
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            from django.db.models import Count
            
            # Count approved HOD requests as active HODs
            total_hods = HODRegistrationRequest.objects.filter(status='approved').count()
            
            pending_requests = HODRegistrationRequest.objects.filter(
                status='pending'
            ).count()
            
            retired_hods = HODRegistrationRequest.objects.filter(
                status='retired'
            ).count()
            
            # Get department-wise HOD count from approved requests
            dept_stats = HODRegistrationRequest.objects.filter(
                status='approved'
            ).values('department__name').annotate(
                count=Count('id')
            ).order_by('-count')
            
            return Response({
                'success': True,
                'stats': {
                    'total_hods': total_hods,
                    'pending_requests': pending_requests,
                    'retired_hods': retired_hods,
                    'department_wise': list(dept_stats)
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateHODFromRequestView(APIView):
    """
    POST /api/register/admin/create-hod-from-request/
    Create HOD record from approved registration request
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Count approved HOD requests
            approved_count = HODRegistrationRequest.objects.filter(
                status='approved'
            ).count()
            
            return Response({
                'success': True,
                'message': f'{approved_count} approved HOD accounts are already active',
                'approved_count': approved_count
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to check HOD records: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)