#!/usr/bin/env python
"""
Check HOD images to see current state
"""

import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UMI_backend.settings')
django.setup()

from hods.models import HOD, HODRegistrationRequest

def check_hod_images():
    """Check current state of HOD images."""
    
    print("=== ACTIVE HOD REQUESTS ===")
    active_requests = HODRegistrationRequest.objects.filter(status='approved')
    for req in active_requests:
        print(f"Request: {req.name} - Image: {bool(req.image)}")
        if req.image:
            print(f"  Image path: {req.image.name}")
    
    print("\n=== ACTIVE HOD RECORDS ===")
    active_hods = HOD.objects.all()
    for hod in active_hods:
        print(f"HOD: {hod.name} - Image: {bool(hod.image)}")
        if hod.image:
            print(f"  Image path: {hod.image.name}")
    
    print("\n=== RETIRED HOD REQUESTS ===")
    retired_requests = HODRegistrationRequest.objects.filter(status='retired')
    for req in retired_requests:
        print(f"Retired: {req.name} - Image: {bool(req.image)}")
        if req.image:
            print(f"  Image path: {req.image.name}")

if __name__ == '__main__':
    check_hod_images()