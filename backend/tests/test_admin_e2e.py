from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.utils.seed import seed_users
from app.core.database import Base
from app.packages.models import Package


def seed_package():
    url = "sqlite:///./test.db"
    engine = create_engine(url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        # create tables if missing
        Base.metadata.create_all(bind=engine)
        seed_users(db)
        # create a tutor and package (seed creates tutor with user)
        tutor_user = db.query(Package).first()
        pkg = Package(tutor_id=1, name="Seed Package", description="Seed", total_hours=10, price=100.00, subject="Math")
        db.add(pkg)
        db.commit()
        db.refresh(pkg)
        return pkg.id
    finally:
        db.close()


def get_token(client):
    # ensure users and package
    seed_package()
    resp = client.post("/api/auth/login", json={"username": "admin.e2e@acme.com", "password": "Password123!"})
    assert resp.status_code == 200
    return resp.json()["access_token"]


def test_full_flow(client):
    token = get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create assignment
    payload = {
        "student_id": 1,
        "tutor_id": 1,
        "package_id": 1,
        "custom_name": "Admin Assigned",
        "auto_activate_on_payment": True
    }
    resp = client.post("/api/admin/package-assignments", json=payload, headers=headers)
    assert resp.status_code == 200
    assignment = resp.json()
    assert assignment["package_id"] == 1

    # Record payment
    pay = {"package_assignment_id": assignment["id"], "student_id": 1, "amount": 100.00, "payment_method": "bank_transfer", "payment_date": "2025-08-28"}
    resp = client.post("/api/admin/payments", json=pay, headers=headers)
    assert resp.status_code == 200
    payment = resp.json()

    # Confirm payment
    resp = client.put(f"/api/admin/payments/{payment['id']}/confirm", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["message"] == "Payment confirmed"
