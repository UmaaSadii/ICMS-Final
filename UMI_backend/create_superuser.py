#!/usr/bin/env python3
"""
Create initial Super Admin user for ICMS system
Run: python create_superuser.py
"""

import os
import sys
import django
from django.contrib.auth.hashers import make_password

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UMI_backend.settings')
django.setup()

from register.models import User

def create_superuser():
    """Create initial super admin user"""
    
    SUPER_ADMIN_DATA = {
        'username': 'superadmin',
        'email': 'superadmin@university.edu',
        'password': 'SuperAdmin@123',
        'first_name': 'Super',
        'last_name': 'Administrator'
    }
    
    try:
        # Check if ANY super admin exists
        if User.objects.filter(role='admin', is_superuser=True).exists():
            print("❌ Super admin already exists! Only one super admin allowed.")
            return
            
        if User.objects.filter(username=SUPER_ADMIN_DATA['username']).exists():
            print("❌ Username already taken!")
            return
        
        # Create super admin user
        user = User.objects.create(
            username=SUPER_ADMIN_DATA['username'],
            email=SUPER_ADMIN_DATA['email'],
            password=make_password(SUPER_ADMIN_DATA['password']),
            first_name=SUPER_ADMIN_DATA['first_name'],
            last_name=SUPER_ADMIN_DATA['last_name'],
            name=f"{SUPER_ADMIN_DATA['first_name']} {SUPER_ADMIN_DATA['last_name']}",
            role='admin',
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        
        print("✅ Super Admin created successfully!")
        print(f"Username: {SUPER_ADMIN_DATA['username']}")
        print(f"Email: {SUPER_ADMIN_DATA['email']}")
        print(f"Password: {SUPER_ADMIN_DATA['password']}")
        print("\n⚠️  Change password after first login!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    create_superuser()