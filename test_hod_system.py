#!/usr/bin/env python3
"""
Test script to verify HOD management system works with database
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api/register"
ADMIN_TOKEN = None  # Will be set after login

def login_as_admin():
    """Login as admin to get token"""
    global ADMIN_TOKEN
    
    login_data = {
        "username": "admin",  # Replace with actual admin username
        "password": "admin123"  # Replace with actual admin password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login/", json=login_data)
        if response.status_code == 200:
            data = response.json()
            ADMIN_TOKEN = data.get('token')
            print(f"✅ Admin login successful. Token: {ADMIN_TOKEN[:20]}...")
            return True
        else:
            print(f"❌ Admin login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False

def test_hod_records_list():
    """Test listing HOD records"""
    if not ADMIN_TOKEN:
        print("❌ No admin token available")
        return False
    
    headers = {
        "Authorization": f"Token {ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/admin/hod-records/", headers=headers)
        print(f"📋 HOD Records List - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {data.get('count', 0)} active HOD records")
            if data.get('data'):
                for hod in data['data'][:3]:  # Show first 3
                    print(f"   - {hod.get('name')} ({hod.get('email')}) - {hod.get('department_name', 'No Dept')}")
            return True
        else:
            print(f"❌ Failed to get HOD records: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error getting HOD records: {e}")
        return False

def test_hod_requests_list():
    """Test listing HOD requests"""
    if not ADMIN_TOKEN:
        print("❌ No admin token available")
        return False
    
    headers = {
        "Authorization": f"Token {ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/admin/hod-requests/", headers=headers)
        print(f"📋 HOD Requests List - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            stats = data.get('stats', {})
            print(f"✅ HOD Requests Stats:")
            print(f"   - Total: {stats.get('total', 0)}")
            print(f"   - Pending: {stats.get('pending', 0)}")
            print(f"   - Approved: {stats.get('approved', 0)}")
            print(f"   - Rejected: {stats.get('rejected', 0)}")
            return True
        else:
            print(f"❌ Failed to get HOD requests: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error getting HOD requests: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing HOD Management System with Database")
    print("=" * 50)
    
    # Test 1: Admin login
    if not login_as_admin():
        print("❌ Cannot proceed without admin login")
        return
    
    # Test 2: List HOD records
    print("\n📋 Testing HOD Records...")
    test_hod_records_list()
    
    # Test 3: List HOD requests
    print("\n📋 Testing HOD Requests...")
    test_hod_requests_list()
    
    print("\n✅ HOD Management System tests completed!")
    print("\nNext steps:")
    print("1. Start the Django server: cd UMI_backend && python manage.py runserver")
    print("2. Start the React frontend: cd Frontend && npm start")
    print("3. Login as admin and navigate to HOD management")
    print("4. Test creating, editing, and deleting HOD records")

if __name__ == "__main__":
    main()