#!/usr/bin/env python
import os
import sys
import django
from django.db import connection

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UMI_backend.settings')
django.setup()

def reset_migrations():
    """Reset migration state in database"""
    
    with connection.cursor() as cursor:
        # Clear migration history for problematic apps
        apps_to_reset = ['academics', 'register', 'students', 'instructors', 'hods']
        
        for app in apps_to_reset:
            try:
                cursor.execute("DELETE FROM django_migrations WHERE app = %s", [app])
                print(f"Cleared migration history for {app}")
            except Exception as e:
                print(f"Error clearing {app}: {e}")
        
        print("Migration history reset complete")

if __name__ == "__main__":
    reset_migrations()