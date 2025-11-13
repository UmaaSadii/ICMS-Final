#!/usr/bin/env python3
"""
Fix super admin privileges
Run: python fix_superadmin.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UMI_backend.settings')
django.setup()

from register.models import User

def fix_superadmin():
    try:
        # Find the admin user
        user = User.objects.get(username='superadmin')
        
        # Restore super admin privileges
        user.is_superuser = True
        user.is_staff = True
        user.role = 'admin'
        user.save()
        
        print("✅ Super admin privileges restored!")
        print(f"Username: {user.username}")
        print(f"Is Superuser: {user.is_superuser}")
        print(f"Is Staff: {user.is_staff}")
        
    except User.DoesNotExist:
        print("❌ Super admin user not found!")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    fix_superadmin()