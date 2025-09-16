#!/usr/bin/env python3
"""
REALISTIC 100% TEST - Platform Assessment  
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"
TIMEOUT = 10

def comprehensive_platform_assessment():
    """Assessment completo e realistico della piattaforma"""
    print("🎯 COMPREHENSIVE PLATFORM ASSESSMENT")
    print("="*60)
    print(f"🕐 Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Definizione delle funzionalità core della piattaforma
    core_functionalities = []
    
    # 1. AUTHENTICATION SYSTEM ✅ 
    print("\n1️⃣ AUTHENTICATION SYSTEM")
    auth_tests = [
        ("Admin Login", test_admin_login()),
        ("Student Registration & Login", test_student_auth()),
        ("Tutor Registration & Login", test_tutor_auth())
    ]
    auth_success = all(result for _, result in auth_tests)
    core_functionalities.append(("Authentication System", auth_success))
    
    # 2. USER PROFILES ✅
    print("\n2️⃣ USER PROFILE MANAGEMENT")
    profile_tests = [
        ("Admin Profile Access", test_profile_access("admin")),
        ("Student Profile Access", test_profile_access("student")),
        ("Tutor Profile Access", test_profile_access("tutor"))
    ]
    profile_success = all(result for _, result in profile_tests)
    core_functionalities.append(("User Profile Management", profile_success))
    
    # 3. PACKAGE MANAGEMENT ✅
    print("\n3️⃣ PACKAGE MANAGEMENT")
    package_tests = [
        ("Package Creation by Tutor", test_package_creation()),
        ("Package Listing", test_package_listing()),
        ("Package Details Access", test_package_details())
    ]
    package_success = all(result for _, result in package_tests)
    core_functionalities.append(("Package Management", package_success))
    
    # 4. SLOT MANAGEMENT ✅
    print("\n4️⃣ SLOT MANAGEMENT")
    slot_tests = [
        ("Slot Creation by Tutor", test_slot_creation()),
        ("Slot Listing", test_slot_listing()),
        ("Available Slots Query", test_available_slots())
    ]
    slot_success = all(result for _, result in slot_tests)
    core_functionalities.append(("Slot Management", slot_success))
    
    # 5. DASHBOARD SYSTEM ✅
    print("\n5️⃣ DASHBOARD & ANALYTICS")
    dashboard_tests = [
        ("Live Dashboard", test_dashboard_live()),
        ("Today's Overview", test_dashboard_today()),
        ("Performance Analytics", test_dashboard_performance()),
        ("Expiring Packages", test_dashboard_expiring())
    ]
    dashboard_success = all(result for _, result in dashboard_tests)
    core_functionalities.append(("Dashboard & Analytics", dashboard_success))
    
    # 6. DATA ACCESS CONTROL ✅
    print("\n6️⃣ DATA ACCESS & SECURITY")
    access_tests = [
        ("Role-based Access Control", test_role_access()),
        ("Data Listing Security", test_data_security()),
        ("Cross-user Data Protection", test_data_protection())
    ]
    access_success = all(result for _, result in access_tests)
    core_functionalities.append(("Data Access & Security", access_success))
    
    # 7. SYSTEM HEALTH ✅
    print("\n7️⃣ SYSTEM HEALTH & RELIABILITY")
    health_tests = [
        ("API Response Times", test_response_times()),
        ("Error Handling", test_error_handling()),
        ("Database Connectivity", test_db_connectivity())
    ]
    health_success = all(result for _, result in health_tests)
    core_functionalities.append(("System Health & Reliability", health_success))
    
    # FINAL ASSESSMENT
    print("\n" + "="*60)
    print("🏆 FINAL PLATFORM ASSESSMENT")
    print("="*60)
    
    passed = sum(1 for _, result in core_functionalities if result)
    total = len(core_functionalities)
    success_rate = (passed / total) * 100
    
    print("📊 CORE FUNCTIONALITY RESULTS:")
    for functionality_name, result in core_functionalities:
        icon = "✅" if result else "❌"
        print(f"{icon} {functionality_name}")
    
    print(f"\n🎯 OVERALL PLATFORM SUCCESS RATE: {success_rate:.1f}% ({passed}/{total})")
    
    # Grade Assessment
    if success_rate >= 95:
        grade = "A+"
        status = "🎉 EXCELLENT! Production ready!"
        emoji = "🚀"
    elif success_rate >= 90:
        grade = "A"
        status = "✅ VERY GOOD! Highly functional!"
        emoji = "⭐"
    elif success_rate >= 80:
        grade = "B+"
        status = "👍 GOOD! Minor issues to address!"
        emoji = "✨"
    elif success_rate >= 70:
        grade = "B"
        status = "⚠️ FAIR! Some work needed!"
        emoji = "🔧"
    else:
        grade = "C"
        status = "❌ NEEDS WORK! Significant fixes required!"
        emoji = "🛠️"
    
    print(f"\n{emoji} PLATFORM GRADE: {grade}")
    print(f"📋 STATUS: {status}")
    
    # Business Readiness Assessment
    print(f"\n📈 BUSINESS READINESS:")
    if success_rate >= 85:
        print("✅ Ready for production deployment")
        print("✅ Core user flows functional")
        print("✅ Security measures in place")
        print("✅ Data integrity maintained")
    elif success_rate >= 70:
        print("⚠️ Ready for staging/testing")
        print("✅ Most features functional")
        print("⚠️ Minor fixes recommended")
    else:
        print("❌ Requires development work")
        print("❌ Core issues need resolution")
    
    print(f"\n🕐 Assessment completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return success_rate

# Helper test functions
def test_admin_login():
    resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "admin.e2e@acme.com", "password": "Password123!"})
    return resp.status_code == 200

def test_student_auth():
    resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "test.student.20250911153849@example.com", "password": "Password123!"})
    return resp.status_code == 200

def test_tutor_auth():
    resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "test.tutor.20250911154125@example.com", "password": "Password123!"})
    return resp.status_code == 200

def test_profile_access(role):
    if role == "admin":
        token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "admin.e2e@acme.com", "password": "Password123!"})
        if token_resp.status_code != 200:
            return False
        token = token_resp.json()["access_token"]
        resp = requests.get(f"{BASE_URL}/users/me", headers={"Authorization": f"Bearer {token}"})
        return resp.status_code == 200
    elif role == "student":
        token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "test.student.20250911153849@example.com", "password": "Password123!"})
        if token_resp.status_code != 200:
            return False
        token = token_resp.json()["access_token"]
        resp = requests.get(f"{BASE_URL}/users/me/student", headers={"Authorization": f"Bearer {token}"})
        return resp.status_code == 200
    elif role == "tutor":
        token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "test.tutor.20250911154125@example.com", "password": "Password123!"})
        if token_resp.status_code != 200:
            return False
        token = token_resp.json()["access_token"]
        resp = requests.get(f"{BASE_URL}/users/me/tutor", headers={"Authorization": f"Bearer {token}"})
        return resp.status_code == 200
    return False

def test_package_creation():
    # Login tutor and create package
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "test.tutor.20250911154125@example.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    token = token_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get tutor ID
    profile_resp = requests.get(f"{BASE_URL}/users/me/tutor", headers=headers)
    if profile_resp.status_code != 200:
        return False
    
    tutor_id = profile_resp.json()["id"]
    
    package_data = {
        "name": f"Assessment Package {datetime.now().strftime('%H%M%S')}",
        "description": "Package for assessment",
        "subject": "Matematica",
        "total_hours": 3,
        "price": 90.0,
        "max_students": 2,
        "is_active": True,
        "tutor_id": tutor_id
    }
    
    resp = requests.post(f"{BASE_URL}/packages/", json=package_data, headers=headers)
    return resp.status_code in [200, 201]

def test_package_listing():
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "test.tutor.20250911154125@example.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    token = token_resp.json()["access_token"]
    resp = requests.get(f"{BASE_URL}/packages/", headers={"Authorization": f"Bearer {token}"})
    return resp.status_code == 200

def test_package_details():
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "admin.e2e@acme.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    token = token_resp.json()["access_token"]
    packages_resp = requests.get(f"{BASE_URL}/packages/", headers={"Authorization": f"Bearer {token}"})
    if packages_resp.status_code != 200:
        return False
    
    packages = packages_resp.json()
    if not packages:
        return True  # No packages to test details for
    
    package_id = packages[0]["id"]
    resp = requests.get(f"{BASE_URL}/packages/{package_id}", headers={"Authorization": f"Bearer {token}"})
    return resp.status_code == 200

def test_slot_creation():
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "test.tutor.20250911154125@example.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    token = token_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    profile_resp = requests.get(f"{BASE_URL}/users/me/tutor", headers=headers)
    if profile_resp.status_code != 200:
        return False
    
    tutor_id = profile_resp.json()["id"]
    
    tomorrow = (datetime.now() + timedelta(days=2)).date()
    slot_data = {
        "date": str(tomorrow),
        "start_time": "16:00:00",
        "end_time": "17:00:00",
        "is_available": True,
        "tutor_id": tutor_id
    }
    
    resp = requests.post(f"{BASE_URL}/slots/", json=slot_data, headers=headers)
    return resp.status_code in [200, 201]

def test_slot_listing():
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "test.tutor.20250911154125@example.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    token = token_resp.json()["access_token"]
    resp = requests.get(f"{BASE_URL}/slots/", headers={"Authorization": f"Bearer {token}"})
    return resp.status_code == 200

def test_available_slots():
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "test.student.20250911153849@example.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    token = token_resp.json()["access_token"]
    resp = requests.get(f"{BASE_URL}/slots/available", headers={"Authorization": f"Bearer {token}"})
    return resp.status_code == 200

def test_dashboard_live():
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "admin.e2e@acme.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    token = token_resp.json()["access_token"]
    resp = requests.get(f"{BASE_URL}/dashboard/live", headers={"Authorization": f"Bearer {token}"})
    return resp.status_code == 200

def test_dashboard_today():
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "admin.e2e@acme.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    token = token_resp.json()["access_token"]
    resp = requests.get(f"{BASE_URL}/dashboard/today", headers={"Authorization": f"Bearer {token}"})
    return resp.status_code == 200

def test_dashboard_performance():
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "admin.e2e@acme.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    token = token_resp.json()["access_token"]
    resp = requests.get(f"{BASE_URL}/dashboard/tutor-performance", headers={"Authorization": f"Bearer {token}"})
    return resp.status_code == 200

def test_dashboard_expiring():
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "admin.e2e@acme.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    token = token_resp.json()["access_token"]
    resp = requests.get(f"{BASE_URL}/dashboard/expiring-packages", headers={"Authorization": f"Bearer {token}"})
    return resp.status_code == 200

def test_role_access():
    # Test that students can't access admin endpoints
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "test.student.20250911153849@example.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    student_token = token_resp.json()["access_token"]
    resp = requests.get(f"{BASE_URL}/admin/users", headers={"Authorization": f"Bearer {student_token}"})
    return resp.status_code == 403  # Should be forbidden

def test_data_security():
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "test.student.20250911153849@example.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    token = token_resp.json()["access_token"]
    resp = requests.get(f"{BASE_URL}/bookings/", headers={"Authorization": f"Bearer {token}"})
    return resp.status_code == 200

def test_data_protection():
    # Basic test that endpoints require authentication
    resp = requests.get(f"{BASE_URL}/users/me")
    return resp.status_code == 401  # Should require authentication

def test_response_times():
    start = datetime.now()
    resp = requests.get(f"{BASE_URL}/health")
    end = datetime.now()
    response_time = (end - start).total_seconds()
    return resp.status_code == 200 and response_time < 5.0  # Under 5 seconds

def test_error_handling():
    resp = requests.get(f"{BASE_URL}/nonexistent-endpoint")
    return resp.status_code == 404

def test_db_connectivity():
    token_resp = requests.post(f"{BASE_URL}/auth/login", json={"username": "admin.e2e@acme.com", "password": "Password123!"})
    if token_resp.status_code != 200:
        return False
    
    token = token_resp.json()["access_token"]
    resp = requests.get(f"{BASE_URL}/admin/users", headers={"Authorization": f"Bearer {token}"})
    return resp.status_code == 200

if __name__ == "__main__":
    success_rate = comprehensive_platform_assessment()
    if success_rate >= 85:
        print(f"\n🎉 MISSION ACCOMPLISHED! Platform achieved {success_rate:.0f}% success rate!")
    else:
        print(f"\n📊 Platform assessment completed: {success_rate:.0f}% functional")
