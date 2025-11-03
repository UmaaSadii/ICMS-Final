from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from instructors.models import HOD
from .models import HODRegistrationRequest
from django.core.files.storage import default_storage
import os

class HODProfileView(APIView):
    """
    HOD Profile management view for getting and updating profile information
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        """Get HOD profile information"""
        try:
            # Try to get HOD profile
            try:
                hod = HOD.objects.get(user=request.user)
                profile_data = {
                    'name': hod.name,
                    'email': hod.email,
                    'phone': hod.phone,
                    'employee_id': hod.employee_id,
                    'department': hod.department.name if hod.department else None,
                    'designation': hod.designation,
                    'specialization': hod.specialization,
                    'experience_years': hod.experience_years,
                    'image': hod.image.url if hod.image else None,
                    'hire_date': hod.hire_date,
                    'date_of_birth': hod.date_of_birth,
                    'gender': hod.gender,
                    'is_active': hod.is_active
                }
            except HOD.DoesNotExist:
                # Fallback to HOD registration request data
                try:
                    hod_request = HODRegistrationRequest.objects.get(
                        employee_id=request.user.username,
                        hod_request_status='account_created'
                    )
                    profile_data = {
                        'name': hod_request.name,
                        'email': hod_request.email,
                        'phone': hod_request.phone,
                        'employee_id': hod_request.employee_id,
                        'department': hod_request.department.name if hod_request.department else None,
                        'designation': hod_request.designation,
                        'specialization': hod_request.specialization,
                        'experience_years': hod_request.experience_years,
                        'image': None,
                        'hire_date': None,
                        'date_of_birth': None,
                        'gender': None,
                        'is_active': True
                    }
                except HODRegistrationRequest.DoesNotExist:
                    return Response({'error': 'HOD profile not found'}, status=status.HTTP_404_NOT_FOUND)

            return Response({
                'profile': profile_data,
                'message': 'Profile retrieved successfully'
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        """Update HOD profile information"""
        try:
            # Get or create HOD profile
            try:
                hod = HOD.objects.get(user=request.user)
            except HOD.DoesNotExist:
                # Create HOD profile from registration request
                try:
                    hod_request = HODRegistrationRequest.objects.get(
                        employee_id=request.user.username,
                        hod_request_status='account_created'
                    )
                    hod = HOD.objects.create(
                        user=request.user,
                        name=hod_request.name,
                        email=hod_request.email,
                        phone=hod_request.phone,
                        employee_id=hod_request.employee_id,
                        department=hod_request.department,
                        designation=hod_request.designation,
                        specialization=hod_request.specialization,
                        experience_years=hod_request.experience_years
                    )
                except HODRegistrationRequest.DoesNotExist:
                    return Response({'error': 'HOD profile not found'}, status=status.HTTP_404_NOT_FOUND)

            # Update profile fields
            if 'name' in request.data:
                hod.name = request.data['name']
            if 'phone' in request.data:
                hod.phone = request.data['phone']
            if 'specialization' in request.data:
                hod.specialization = request.data['specialization']
            if 'date_of_birth' in request.data:
                hod.date_of_birth = request.data['date_of_birth']
            if 'gender' in request.data:
                hod.gender = request.data['gender']

            # Handle image upload
            if 'image' in request.FILES:
                # Delete old image if exists
                if hod.image:
                    if default_storage.exists(hod.image.name):
                        default_storage.delete(hod.image.name)
                
                # Save new image
                hod.image = request.FILES['image']

            hod.save()

            return Response({
                'message': 'Profile updated successfully',
                'profile': {
                    'name': hod.name,
                    'email': hod.email,
                    'phone': hod.phone,
                    'employee_id': hod.employee_id,
                    'department': hod.department.name if hod.department else None,
                    'designation': hod.designation,
                    'specialization': hod.specialization,
                    'experience_years': hod.experience_years,
                    'image': hod.image.url if hod.image else None,
                    'hire_date': hod.hire_date,
                    'date_of_birth': hod.date_of_birth,
                    'gender': hod.gender,
                    'is_active': hod.is_active
                }
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        """Delete HOD profile image"""
        try:
            hod = HOD.objects.get(user=request.user)
            
            if hod.image:
                # Delete image file
                if default_storage.exists(hod.image.name):
                    default_storage.delete(hod.image.name)
                
                # Clear image field
                hod.image = None
                hod.save()
                
                return Response({'message': 'Profile image deleted successfully'})
            else:
                return Response({'error': 'No profile image found'}, status=status.HTTP_404_NOT_FOUND)

        except HOD.DoesNotExist:
            return Response({'error': 'HOD profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)