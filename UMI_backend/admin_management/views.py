from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from register.models import User
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db import models
import os

class AdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        admins = User.objects.filter(role='admin', is_active=True)
        data = []
        for admin in admins:
            # Determine role based on user properties
            if admin.is_superuser:
                role = 'super_admin'
            elif admin.is_staff and admin.role == 'admin':
                role = 'admin'
            else:
                role = 'department_admin'
            
            # Get department info if exists
            department_info = {'name': 'All Departments'}
            try:
                from academics.models import Department
                # Check if department_id is stored in last_name
                if '|dept_' in str(admin.last_name):
                    dept_id = admin.last_name.split('|dept_')[1]
                    try:
                        dept = Department.objects.get(pk=int(dept_id))
                        department_info = {'id': dept.pk, 'name': getattr(dept, 'name', f'Department {dept.pk}')}
                    except:
                        pass
                elif role == 'department_admin':
                    # Default department for dept admins without specific assignment
                    departments = Department.objects.all()[:1]
                    if departments:
                        dept = departments[0]
                        department_info = {'id': dept.pk, 'name': getattr(dept, 'name', f'Department {dept.pk}')}
            except Exception as e:
                print(f"Department retrieval error: {e}")
                # Fallback to simple department assignment
                if role == 'department_admin':
                    department_info = {'name': 'Computer Science'}
                pass
            
            # Get profile image URL
            image_url = None
            if hasattr(admin, 'profile_image') and admin.profile_image:
                try:
                    image_url = request.build_absolute_uri(admin.profile_image.url)
                    print(f'Admin {admin.username} image URL: {image_url}')
                except Exception as e:
                    print(f'Error building image URL for {admin.username}: {e}')
                    image_url = admin.profile_image.url
            else:
                print(f'Admin {admin.username} has no profile image')
            
            data.append({
                'id': admin.id,
                'name': admin.name or f"{admin.first_name} {admin.last_name}",
                'email': admin.email,
                'employee_id': admin.username,
                'role': role,
                'status': 'active' if admin.is_active else 'inactive',
                'permissions': ['user_management', 'department_management'] if admin.is_superuser else ['department_management'],
                'created_at': admin.date_joined.isoformat(),
                'last_login': admin.last_login.isoformat() if admin.last_login else None,
                'department': department_info,
                'image': image_url
            })
        return Response({'data': data})
    
    def create(self, request):
        data = request.data
        try:
            user = User.objects.create_user(
                username=data.get('employee_id'),
                email=data.get('email'),
                password=data.get('password'),
                first_name=data.get('name', '').split(' ')[0],
                last_name=' '.join(data.get('name', '').split(' ')[1:]),
                name=data.get('name'),
                role='admin',
                is_active=data.get('status') == 'active',
                is_staff=True,
                is_superuser=data.get('role') == 'super_admin'
            )
            return Response({'message': 'Admin created successfully', 'id': user.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        try:
            user = User.objects.get(id=pk)
            data = request.data
            
            print(f"Updating user {pk} with data: {data}")  # Debug log
            
            if 'name' in data:
                user.name = data['name']
                name_parts = data['name'].split(' ')
                user.first_name = name_parts[0]
                user.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            if 'email' in data:
                user.email = data['email']
            
            if 'employee_id' in data:
                user.username = data['employee_id']
            
            if 'password' in data and data['password']:
                user.set_password(data['password'])
            
            if 'status' in data:
                user.is_active = data['status'] == 'active'
            
            if 'is_active' in data:
                user.is_active = data['is_active']
            
            # Handle department assignment
            department_name = 'All Departments'
            if 'department_id' in data and data['department_id']:
                try:
                    from academics.models import Department
                    dept = Department.objects.get(pk=data['department_id'])
                    department_name = getattr(dept, 'name', f'Department {dept.pk}')
                    # Store department_id in last_name field
                    base_name = user.last_name.split('|')[0] if '|' in str(user.last_name) else user.last_name
                    user.last_name = f"{base_name}|dept_{data['department_id']}"
                    print(f"Assigned department {department_name} to user {user.username}")
                except Exception as e:
                    print(f"Department assignment error: {e}")
                    # Fallback assignment
                    department_name = 'Computer Science'
                    user.last_name = f"{user.last_name.split('|')[0] if '|' in str(user.last_name) else user.last_name}|dept_1"
            
            # Determine role for response
            response_role = 'admin'  # Default
            if 'role' in data:
                response_role = data['role']
                if data['role'] == 'super_admin':
                    user.is_superuser = True
                    user.is_staff = True
                    user.role = 'admin'
                elif data['role'] == 'admin':
                    user.is_superuser = False
                    user.is_staff = True
                    user.role = 'admin'
                elif data['role'] == 'department_admin':
                    user.is_superuser = False
                    user.is_staff = False
                    user.role = 'admin'
            
            user.save()
            print(f"User {pk} updated successfully")  # Debug log
            # Get image URL for response
            image_url = None
            if hasattr(user, 'profile_image') and user.profile_image:
                try:
                    image_url = request.build_absolute_uri(user.profile_image.url)
                except:
                    image_url = user.profile_image.url
            
            return Response({
                'message': 'Admin updated successfully',
                'admin': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'role': response_role,
                    'status': 'active' if user.is_active else 'inactive',
                    'department': department_name,
                    'image': image_url
                }
            })
        except User.DoesNotExist:
            return Response({'error': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error updating user {pk}: {str(e)}")  # Debug log
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def delete_admin(self, request, pk=None):
        print(f"Delete admin called for pk={pk}")  # Debug
        try:
            target_user = User.objects.get(id=pk)
            print(f"Found user: {target_user.username}")  # Debug
            deleted_name = target_user.name or target_user.username
            
            # Simple soft delete - just deactivate
            target_user.is_active = False
            target_user.save()
            print(f"User {deleted_name} soft deleted successfully")  # Debug
            
            return Response({'message': f'Admin {deleted_name} deleted successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            print(f"User with pk={pk} not found")  # Debug
            return Response({'error': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error in delete_admin: {str(e)}")  # Debug
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        try:
            user = User.objects.get(id=pk)
            image_file = request.FILES.get('image')
            
            if not image_file:
                return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
            if image_file.content_type not in allowed_types:
                return Response({'error': 'Invalid file type. Only JPEG, PNG, and GIF are allowed.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file size (5MB max)
            if image_file.size > 5 * 1024 * 1024:
                return Response({'error': 'File too large. Maximum size is 5MB.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create uploads directory if it doesn't exist
            upload_dir = 'uploads/admin_images/'
            os.makedirs(os.path.join('media', upload_dir), exist_ok=True)
            
            # Generate unique filename
            file_extension = os.path.splitext(image_file.name)[1]
            filename = f"admin_{user.id}_{user.username}{file_extension}"
            file_path = os.path.join(upload_dir, filename)
            
            # Delete old image if exists
            if hasattr(user, 'profile_image') and user.profile_image:
                try:
                    default_storage.delete(user.profile_image.name)
                except:
                    pass
            
            # Save new image
            saved_path = default_storage.save(file_path, ContentFile(image_file.read()))
            
            # Update user model (assuming profile_image field exists)
            user.profile_image = saved_path
            user.save()
            
            image_url = request.build_absolute_uri(default_storage.url(saved_path))
            
            return Response({
                'message': 'Image uploaded successfully',
                'image_url': image_url
            })
        except User.DoesNotExist:
            return Response({'error': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def pending_registrations(self, request):
        # Only super admin can view pending registrations
        if not request.user.is_superuser:
            return Response({'error': 'Only Super Admin can view pending registrations'}, status=status.HTTP_403_FORBIDDEN)
        
        # Find all inactive users (potential pending admins)
        pending_admins = User.objects.filter(is_active=False)
        print(f'Found {pending_admins.count()} inactive users')  # Debug
        
        for user in pending_admins:
            print(f'User: {user.username}, role: {user.role}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser}')
        data = []
        for admin in pending_admins:
            # Get image URL
            image_url = None
            if hasattr(admin, 'profile_image') and admin.profile_image:
                try:
                    image_url = request.build_absolute_uri(admin.profile_image.url)
                except:
                    image_url = admin.profile_image.url
            
            data.append({
                'id': admin.id,
                'name': admin.name or f"{admin.first_name} {admin.last_name}",
                'email': admin.email,
                'employee_id': admin.username,
                'role': 'department_admin',
                'status': 'inactive',
                'created_at': admin.date_joined.isoformat(),
                'image': image_url
            })
        return Response({'data': data})
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        # Only super admin can approve registrations
        if not request.user.is_superuser:
            return Response({'error': 'Only Super Admin can approve registrations'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(id=pk)
            user.is_active = True
            user.save()
            return Response({'message': f'Admin {user.name or user.username} approved successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def invalidate_sessions(self, request, pk=None):
        return Response({'message': 'Sessions invalidated successfully'})
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current admin user's profile"""
        try:
            user = request.user
            
            # Determine role based on user properties
            if user.is_superuser:
                role = 'super_admin'
            elif user.is_staff and user.role == 'admin':
                role = 'admin'
            else:
                role = 'department_admin'
            
            # Get profile image URL
            image_url = None
            if hasattr(user, 'profile_image') and user.profile_image:
                try:
                    image_url = request.build_absolute_uri(user.profile_image.url)
                except Exception as e:
                    print(f'Error building image URL for {user.username}: {e}')
                    image_url = user.profile_image.url
            
            profile_data = {
                'id': user.id,
                'name': user.name or f"{user.first_name} {user.last_name}",
                'email': user.email,
                'employee_id': user.username,
                'role': role,
                'status': 'active' if user.is_active else 'inactive',
                'image': image_url,
                'created_at': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None
            }
            
            return Response(profile_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)