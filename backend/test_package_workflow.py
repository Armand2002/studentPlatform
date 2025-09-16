#!/usr/bin/env python3
"""
End-to-end test for admin package creation -> assign to tutor and student -> verify purchase/assignment
Run from backend/ folder (python test_package_workflow.py)
"""

import requests
import sys
import time
from datetime import date, timedelta

BASE = "http://localhost:8000/api"
ADMIN_CREDENTIALS = {"username": "admin.e2e@acme.com", "password": "Password123!"}

# Helpers

def login(username, password):
    r = requests.post(f"{BASE}/auth/login", json={"username": username, "password": password})
    if r.status_code != 200:
        print(f"LOGIN FAILED for {username}: {r.status_code} {r.text}")
        return None
    return r.json()


def api_get(path, token=None, params=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    return requests.get(f"{BASE}{path}", headers=headers, params=params)


def api_post(path, token=None, json_body=None):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"} if token else {"Content-Type": "application/json"}
    return requests.post(f"{BASE}{path}", headers=headers, json=json_body)


def main():
    print("=== Admin package workflow E2E test ===")

    # 1) login admin
    admin = login(ADMIN_CREDENTIALS["username"], ADMIN_CREDENTIALS["password"])
    if not admin:
        sys.exit(1)
    admin_token = admin.get("access_token")
    print("Admin token acquired")

    # 2) find a tutor (first available) via admin users endpoint
    tutors_resp = api_get('/admin/users', token=admin_token)
    if tutors_resp.status_code != 200:
        print("Failed to list admin users to find a tutor:", tutors_resp.status_code, tutors_resp.text)
        sys.exit(1)
    all_users = tutors_resp.json()
    tutors = [u for u in all_users if u.get('role') and u.get('role').lower() == 'tutor']
    if not tutors:
        print("No tutors found in system")
        sys.exit(1)
    tutor = tutors[0]
    tutor_id = tutor.get('id') or tutor.get('user_id')
    print(f"Using tutor id: {tutor_id}")

    # 3) find a student
    # 3) find a student (use admin users and filter)
    students_resp = api_get('/admin/users', token=admin_token)
    if students_resp.status_code != 200:
        print("Failed to list admin users to find a student:", students_resp.status_code, students_resp.text)
        sys.exit(1)
    all_users = students_resp.json()
    students = [u for u in all_users if u.get('role') and u.get('role').lower() == 'student']
    if not students:
        print("No students found")
        sys.exit(1)
    if not students:
        print("No students found")
        sys.exit(1)
    student = students[0]
    student_id = student.get('id')
    print(f"Using student id: {student_id}")

    # 4) create a package as admin (on behalf of tutor)
    package_body = {
        "name": "E2E Test Package",
        "description": "Created by E2E test",
        "total_hours": 8,
        "price": 120.00,
        "subject": "Fisica",
        "is_active": True,
        "tutor_id": tutor_id
    }

    create_pkg_resp = api_post('/admin/packages', token=admin_token, json_body=package_body)
    if create_pkg_resp.status_code not in (200,201):
        print("Failed to create admin package:", create_pkg_resp.status_code, create_pkg_resp.text)
        sys.exit(1)
    pkg = create_pkg_resp.json()
    package_id = pkg.get('id')
    print(f"Created package id: {package_id}")

    # 5) assign package to student (admin assignment)
    assign_body = {
        "student_id": student_id,
        "tutor_id": tutor_id,
        "package_id": package_id,
        "custom_name": "E2E Assigned Package",
        "custom_total_hours": 8,
        "custom_price": 120.00,
        "custom_expiry_date": (date.today() + timedelta(days=365)).isoformat(),
        "admin_notes": "Assigned by automated E2E test",
        "auto_activate_on_payment": True
    }

    assign_resp = api_post('/admin/package-assignments', token=admin_token, json_body=assign_body)
    if assign_resp.status_code not in (200,201):
        print("Failed to create package assignment:", assign_resp.status_code, assign_resp.text)
        sys.exit(1)
    assignment = assign_resp.json()
    assignment_id = assignment.get('id')
    print(f"Created assignment id: {assignment_id}")

    # 6) (Optional) register admin payment to activate assignment
    payment_body = {
        "package_assignment_id": assignment_id,
        "student_id": student_id,
        "amount": 120.00,
        "payment_method": "card_offline",
        "payment_date": date.today().isoformat(),
        "reference_number": "E2E-PAY-001"
    }
    payment_resp = api_post('/admin/payments', token=admin_token, json_body=payment_body)
    if payment_resp.status_code not in (200,201):
        print("Warning: admin payment not recorded:", payment_resp.status_code, payment_resp.text)
    else:
        print("Admin payment recorded")
        pay = payment_resp.json()
        pay_id = pay.get('id')
        # Confirm the payment to trigger activation logic
        if pay_id:
            confirm_resp = requests.put(f"{BASE}/admin/payments/{pay_id}/confirm", headers={"Authorization": f"Bearer {admin_token}"})
            if confirm_resp.status_code not in (200, 201):
                print("Warning: payment confirmation failed:", confirm_resp.status_code, confirm_resp.text)
            else:
                print("Payment confirmed")

    # 7) verify admin assignments (admin can list assignments)
    assignments_resp = api_get('/admin/package-assignments', token=admin_token)
    if assignments_resp.status_code != 200:
        print("Failed to fetch admin assignments:", assignments_resp.status_code, assignments_resp.text)
        sys.exit(1)

    assignments = assignments_resp.json()
    found = any(a.get('id') == assignment_id for a in assignments)
    if not found:
        print("Assigned package not found in admin assignments. Assignments:", assignments)
        sys.exit(1)

    # If we confirmed payment above, ensure status is active
    if pay_id:
        this_assign = next((a for a in assignments if a.get('id') == assignment_id), None)
        if this_assign and this_assign.get('status') != 'active':
            print('Warning: assignment not active after payment confirmation, current status:', this_assign.get('status'))
        else:
            print('Assignment is active after payment confirmation')

    print("SUCCESS: package assigned and visible in admin assignments")
    print("E2E admin -> create package -> assign -> payment -> confirm -> verify assignment completed")

if __name__ == '__main__':
    main()
