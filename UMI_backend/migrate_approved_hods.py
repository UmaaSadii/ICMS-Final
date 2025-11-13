#!/usr/bin/env python3
"""
Migration script to move approved HOD requests to active HOD records
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UMI_backend.settings')
django.setup()

<<<<<<< HEAD
from hods.models import HODRegistrationRequest, HOD
from register.models import User
=======
from register.models import HODRegistrationRequest, User
from instructors.models import HOD
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
from django.utils import timezone

def migrate_approved_hods():
    """Move approved HOD requests to active HOD records"""
    
    print("🔄 Starting migration of approved HOD requests to active HOD records...")
    
    # Get all approved HOD requests
    approved_requests = HODRegistrationRequest.objects.filter(
        status='approved',
        hod_request_status__in=['approved', 'account_created', 'completed']
    )
    
    migrated_count = 0
    
    for request in approved_requests:
        try:
            # Check if HOD record already exists
            existing_hod = HOD.objects.filter(email=request.email).first()
            if existing_hod:
                print(f"⚠️  HOD record already exists for {request.email}")
                continue
            
            # Get or create user account
            user, user_created = User.objects.get_or_create(
                email=request.email,
                defaults={
                    'username': request.employee_id or request.email,
                    'role': 'hod',
                    'name': request.name,
                    'first_name': request.name.split()[0] if request.name else '',
                    'last_name': ' '.join(request.name.split()[1:]) if len(request.name.split()) > 1 else ''
                }
            )
            
            if user_created:
                user.set_password(request.password or 'defaultpassword123')
                user.save()
                print(f"✅ Created user account for {request.email}")
            
            # Create HOD record
            hod = HOD.objects.create(
                user=user,
                employee_id=request.employee_id,
                name=request.name,
                email=request.email,
                phone=request.phone,
                department=request.department,
                designation=request.designation,
                specialization=request.specialization,
                experience_years=request.experience_years,
                hire_date=request.reviewed_at.date() if request.reviewed_at else timezone.now().date(),
                is_active=True
            )
            
            # Update request status
            request.hod_request_status = 'migrated_to_active'
            request.save()
            
            migrated_count += 1
            print(f"✅ Migrated {request.name} to active HOD record (ID: {hod.id})")
            
        except Exception as e:
            print(f"❌ Error migrating {request.name}: {str(e)}")
    
    print(f"\n🎉 Migration completed! {migrated_count} HOD records migrated to active status.")
    
    # Show summary
    total_active_hods = HOD.objects.filter(is_active=True).count()
    print(f"📊 Total active HOD records: {total_active_hods}")

if __name__ == "__main__":
    migrate_approved_hods()