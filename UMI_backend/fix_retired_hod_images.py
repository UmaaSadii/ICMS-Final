#!/usr/bin/env python
"""
Utility script to fix retired HOD images that weren't properly preserved.
Run this script to copy images from any remaining HOD records to retired HOD requests.
"""

import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UMI_backend.settings')
django.setup()

from hods.models import HOD, HODRegistrationRequest
from django.core.files.base import ContentFile

def fix_retired_hod_images():
    """Fix images for retired HODs by copying from any remaining HOD records."""
    
    retired_requests = HODRegistrationRequest.objects.filter(status='retired')
    fixed_count = 0
    
    print(f"Found {retired_requests.count()} retired HOD requests")
    
    for req in retired_requests:
        # Skip if already has image
        if req.image:
            print(f"[OK] {req.name} already has image")
            continue
            
        # Try to find corresponding HOD record (shouldn't exist but check anyway)
        try:
            hod_record = HOD.objects.get(email=req.email)
            if hod_record.image:
                print(f"Found HOD record with image for {req.name}, copying...")
                
                # Copy the image file properly
                hod_record.image.open()
                image_content = hod_record.image.read()
                hod_record.image.close()
                
                # Get the original filename
                original_name = os.path.basename(hod_record.image.name)
                
                # Save to request record
                req.image.save(
                    original_name,
                    ContentFile(image_content),
                    save=True
                )
                
                print(f"[FIXED] Fixed image for {req.name}")
                fixed_count += 1
            else:
                print(f"[SKIP] {req.name} - HOD record exists but no image")
                
        except HOD.DoesNotExist:
            print(f"[EXPECTED] {req.name} - No HOD record found (expected for retired HODs)")
    
    print(f"\nFixed {fixed_count} retired HOD images")

if __name__ == '__main__':
    fix_retired_hod_images()