import json
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.utils.seed import seed_users


def ensure_seed_db():
    # Use same test DB URL as tests/conftest.py
    url = "sqlite:///./test.db"
    engine = create_engine(url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        seed_users(db)
    finally:
        db.close()


def get_auth_token(client, email="admin.e2e@acme.com", password="Password123!"):
    ensure_seed_db()
    resp = client.post("/api/auth/login", json={"username": email, "password": password})
    assert resp.status_code == 200
    return resp.json()["access_token"]


def test_admin_list_endpoints(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # list assignments (should be empty initially)
    resp = client.get("/api/admin/package-assignments", headers=headers)
    assert resp.status_code == 200

    # list payments
    resp = client.get("/api/admin/payments", headers=headers)
    assert resp.status_code == 200
