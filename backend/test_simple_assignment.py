import requests
from datetime import datetime, timezone

BASE_URL = "http://localhost:8000/api"
REQUEST_TIMEOUT = 10


def create_admin_directly():
    """
    Crea un admin direttamente nel database (per test)
    Normalmente l'admin sarebbe creato via script di setup
    """
    from app.core.database import SessionLocal
    from app.users.models import User, UserRole
    from app.core.security import get_password_hash
    
    db = SessionLocal()
    try:
        # Verifica se admin esiste già
        existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if existing_admin:
            print(f"✅ Admin esistente trovato: {existing_admin.email}")
            return existing_admin.email, "password123"  # Password di default per admin test
        
        # Crea nuovo admin
        email = "admin@platform.com"
        password = "password123"
        
        hashed_password = get_password_hash(password)
        admin = User(
            email=email,
            hashed_password=hashed_password,
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print(f"✅ Admin creato nel database: {email}")
        return email, password
        
    except Exception as e:
        print(f"❌ Errore creazione admin: {e}")
        db.rollback()
        return None, None
    finally:
        db.close()


def login(username: str, password: str):
    """Login e ottieni token"""
    payload = {"username": username, "password": password}
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            return data.get("access_token")
        else:
            print(f"❌ Login fallito: {resp.status_code} - {resp.text}")
        return None
    except Exception as e:
        print(f"❌ Errore login: {e}")
        return None


def create_package_assignment_simple(admin_token: str):
    """Crea assignment semplice con dati esistenti"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    payload = {
        "package_id": 1,  # Assumiamo che package 1 esista
        "student_id": 10,  # Student dal test precedente
        "tutor_id": 8,     # Tutor dal test precedente
        "custom_name": "Test Assignment Simple",
        "price": 100.0
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/admin/package-assignments", json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            assignment = resp.json()
            print(f"✅ Assignment creato: {assignment}")
            return assignment
        else:
            print(f"❌ Assignment fallito: {resp.status_code} - {resp.text}")
            return None
    except Exception as e:
        print(f"❌ Errore assignment: {e}")
        return None


def insert_test_booking_directly():
    """Inserisce un booking direttamente nel database per test"""
    from app.core.database import SessionLocal
    from app.bookings.models import Booking, BookingStatus
    from datetime import timedelta
    
    db = SessionLocal()
    try:
        # Crea booking diretto
        tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
        
        booking = Booking(
            student_id=10,  # Student ID
            tutor_id=8,     # Tutor ID  
            package_purchase_id=1,  # Fake per test
            start_time=tomorrow,
            end_time=tomorrow + timedelta(hours=1),
            duration_hours=1,
            subject="Matematica",
            status=BookingStatus.CONFIRMED
        )
        
        db.add(booking)
        db.commit()
        
        print("✅ Booking inserito direttamente nel DB")
        return True
        
    except Exception as e:
        print(f"❌ Errore inserimento booking: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def test_tutor_sees_assigned_student():
    """Test finale che il tutor veda lo studente"""
    # Login tutor
    tutor_token = login("test.tutor.20250902164808@example.com", "Password123!")
    if not tutor_token:
        print("❌ Login tutor fallito")
        return False
    
    # Test endpoint
    headers = {"Authorization": f"Bearer {tutor_token}"}
    resp = requests.get(f"{BASE_URL}/users/tutors/me/students", headers=headers)
    
    if resp.status_code == 200:
        students = resp.json()
        print(f"✅ Tutor vede {len(students)} studenti")
        for student in students:
            name = f"{student.get('first_name', '')} {student.get('last_name', '')}"
            print(f"  - {name}")
        return len(students) > 0
    else:
        print(f"❌ Errore endpoint: {resp.status_code}")
        return False


if __name__ == '__main__':
    print("🎯 Test semplificato: Inserimento diretto DB → Test endpoint")
    
    # 1. Crea admin se necessario
    admin_email, admin_password = create_admin_directly()
    if not admin_email:
        exit(1)
    
    # 2. Login admin
    admin_token = login(admin_email, admin_password)
    if not admin_token:
        print("❌ Login admin fallito")
        exit(1)
    
    print("✅ Admin login OK")
    
    # 3. Inserisci booking direttamente (saltando assignment per ora)
    if insert_test_booking_directly():
        # 4. Test che tutor veda studente
        if test_tutor_sees_assigned_student():
            print("🎉 SUCCESS: Tutor vede lo studente assegnato tramite booking!")
        else:
            print("❌ Tutor non vede studenti")
    else:
        print("❌ Inserimento booking fallito")
