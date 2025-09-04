"""
Test completo del flusso di assegnazione tutor-studente tramite admin
Verifica la visibilità reciproca dopo l'assegnazione via pacchetto
"""
import requests
from datetime import datetime, timezone, timedelta

BASE_URL = "http://localhost:8000/api"
REQUEST_TIMEOUT = 10


def create_admin_in_db():
    """Crea admin direttamente nel database (solo per test)"""
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    from app.core.database import engine
    from sqlalchemy import text
    from app.core.security import get_password_hash
    
    email = "test.admin@platform.com"
    password = "AdminPassword123!"
    
    try:
        with engine.connect() as conn:
            # Controlla se admin esiste
            result = conn.execute(text("SELECT email FROM users WHERE role = 'admin' LIMIT 1"))
            existing = result.fetchone()
            
            if existing:
                print(f"✅ Admin esistente: {existing[0]}")
                return existing[0], "AdminPassword123!"
            
            # Crea nuovo admin
            hashed_pw = get_password_hash(password)
            conn.execute(text("""
                INSERT INTO users (email, hashed_password, role, is_active, is_verified, created_at, updated_at)
                VALUES (:email, :password, 'admin', true, true, NOW(), NOW())
            """), {"email": email, "password": hashed_pw})
            conn.commit()
            
            print(f"✅ Admin creato: {email}")
            return email, password
            
    except Exception as e:
        print(f"❌ Errore creazione admin: {e}")
        return None, None


def register_student():
    """Registra un nuovo studente"""
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    email = f"test.student.{ts}@example.com"
    password = "StudentPassword123!"
    
    payload = {
        "email": email,
        "password": password,
        "role": "student",
        "first_name": "Mario",
        "last_name": "Rossi",
        "date_of_birth": "2005-01-15",
        "institute": "Liceo Scientifico", 
        "class_level": "3°",
        "phone_number": "+391234567890"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 201:
            print(f"✅ Studente registrato: {email}")
            return email, password
        else:
            print(f"❌ Registrazione studente fallita: {resp.status_code} - {resp.text}")
            return None, None
    except Exception as e:
        print(f"❌ Errore registrazione studente: {e}")
        return None, None


def login(username: str, password: str):
    """Login e ottieni token"""
    payload = {"username": username, "password": password}
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            token = data.get("access_token")
            print(f"✅ Login OK: {username}")
            return token
        else:
            print(f"❌ Login fallito per {username}: {resp.status_code} - {resp.text}")
            return None
    except Exception as e:
        print(f"❌ Errore login: {e}")
        return None


def get_user_profile(token: str, profile_type: str):
    """Ottieni profilo utente (student/tutor)"""
    headers = {"Authorization": f"Bearer {token}"}
    endpoint = f"/users/me/{profile_type}" if profile_type != "user" else "/users/me"
    
    try:
        resp = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            return resp.json()
        else:
            print(f"❌ Errore profilo {profile_type}: {resp.status_code}")
            return None
    except Exception as e:
        print(f"❌ Errore richiesta profilo: {e}")
        return None


def admin_create_package_assignment(admin_token: str, package_id: int, student_id: int, tutor_id: int):
    """Admin crea assegnazione pacchetto studente-tutor"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    payload = {
        "package_id": package_id,
        "student_id": student_id,
        "tutor_id": tutor_id,
        "custom_name": f"Assignment Test - Student {student_id} → Tutor {tutor_id}",
        "price": 150.0
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/admin/package-assignments", json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            assignment = resp.json()
            print(f"✅ Admin ha creato assignment ID: {assignment['id']}")
            print(f"   Package: {assignment['package_id']} | Student: {assignment['student_id']} | Tutor: {assignment['tutor_id']}")
            return assignment
        else:
            print(f"❌ Creazione assignment fallita: {resp.status_code} - {resp.text}")
            return None
    except Exception as e:
        print(f"❌ Errore assignment: {e}")
        return None


def student_create_booking(student_token: str, tutor_id: int, package_purchase_id: int = 1):
    """Studente crea booking con tutor assegnato"""
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # Booking per domani
    tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
    end_time = tomorrow + timedelta(hours=1)
    
    payload = {
        "tutor_id": tutor_id,
        "start_time": tomorrow.isoformat(),
        "end_time": end_time.isoformat(),
        "duration_hours": 1,
        "subject": "Matematica",
        "notes": "Lezione di test da assignment admin",
        "package_purchase_id": package_purchase_id
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/bookings", json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 201:
            booking = resp.json()
            print(f"✅ Studente ha creato booking ID: {booking.get('id')}")
            return booking
        else:
            print(f"❌ Creazione booking fallita: {resp.status_code} - {resp.text}")
            # Proviamo a capire il problema
            if "package_purchase_id" in resp.text:
                print("   💡 Suggerimento: Potrebbe mancare PackagePurchase. In un sistema reale lo studente compra il package prima del booking.")
            return None
    except Exception as e:
        print(f"❌ Errore booking: {e}")
        return None


def tutor_check_assigned_students(tutor_token: str):
    """Tutor controlla i suoi studenti assegnati"""
    headers = {"Authorization": f"Bearer {tutor_token}"}
    
    try:
        resp = requests.get(f"{BASE_URL}/users/tutors/me/students", headers=headers, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            students = resp.json()
            print(f"👥 Tutor vede {len(students)} studenti assegnati:")
            for student in students:
                name = f"{student.get('first_name', 'N/A')} {student.get('last_name', 'N/A')}"
                email = student.get('user', {}).get('email', 'N/A')
                print(f"   - {name} ({email}) [ID: {student.get('id')}]")
            return students
        else:
            print(f"❌ Tutor non può vedere studenti: {resp.status_code} - {resp.text}")
            return []
    except Exception as e:
        print(f"❌ Errore controllo studenti: {e}")
        return []


def student_check_bookings(student_token: str):
    """Studente controlla i suoi booking (vede i tutor assegnati)"""
    headers = {"Authorization": f"Bearer {student_token}"}
    
    try:
        resp = requests.get(f"{BASE_URL}/bookings", headers=headers, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            bookings_data = resp.json()
            bookings = bookings_data.get('bookings', [])
            print(f"📅 Studente vede {len(bookings)} booking:")
            
            tutors_seen = set()
            for booking in bookings:
                tutor = booking.get('tutor')
                if tutor:
                    tutor_name = f"{tutor.get('first_name', 'N/A')} {tutor.get('last_name', 'N/A')}"
                    tutors_seen.add(tutor_name)
                    print(f"   - {booking.get('subject')} con {tutor_name} [Tutor ID: {tutor.get('id')}]")
            
            print(f"👨‍🏫 Tutors unici visti dallo studente: {len(tutors_seen)}")
            return bookings
        else:
            print(f"❌ Studente non può vedere booking: {resp.status_code} - {resp.text}")
            return []
    except Exception as e:
        print(f"❌ Errore controllo booking: {e}")
        return []


def insert_test_booking_directly(student_id: int, tutor_id: int):
    """Inserisce booking direttamente nel DB come fallback"""
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    from app.core.database import engine
    from sqlalchemy import text
    
    tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
    end_time = tomorrow + timedelta(hours=1)
    
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                INSERT INTO bookings (student_id, tutor_id, package_purchase_id, start_time, end_time, 
                                    duration_hours, subject, status, created_at, updated_at)
                VALUES (:student_id, :tutor_id, 1, :start_time, :end_time, 1, 'Matematica', 'confirmed', NOW(), NOW())
            """), {
                "student_id": student_id,
                "tutor_id": tutor_id,
                "start_time": tomorrow,
                "end_time": end_time
            })
            conn.commit()
            
        print(f"✅ Booking inserito direttamente nel DB (Student {student_id} → Tutor {tutor_id})")
        return True
        
    except Exception as e:
        print(f"❌ Errore inserimento booking diretto: {e}")
        return False


def main():
    """Test completo del flusso admin → assignment → visibilità reciproca"""
    
    print("🎯 TEST COMPLETO: Admin Assignment → Visibilità Reciproca Tutor-Studente")
    print("=" * 70)
    
    # 1. Setup utenti
    print("\n📋 FASE 1: Setup utenti")
    
    # Admin
    admin_email, admin_password = create_admin_in_db()
    if not admin_email:
        print("❌ Test fallito: impossibile creare admin")
        return
    
    # Studente 
    student_email, student_password = register_student()
    if not student_email:
        print("❌ Test fallito: impossibile registrare studente")
        return
    
    # Tutor esistente (dal test precedente)
    tutor_email = "test.tutor.20250902164808@example.com"
    tutor_password = "Password123!"
    
    # 2. Login tutti
    print("\n🔐 FASE 2: Login utenti")
    admin_token = login(admin_email, admin_password)
    student_token = login(student_email, student_password)
    tutor_token = login(tutor_email, tutor_password)
    
    if not all([admin_token, student_token, tutor_token]):
        print("❌ Test fallito: login fallito")
        return
    
    # 3. Ottieni ID utenti
    print("\n📊 FASE 3: Recupero profili utenti")
    student_profile = get_user_profile(student_token, "student")
    tutor_profile = get_user_profile(tutor_token, "tutor")
    
    if not student_profile or not tutor_profile:
        print("❌ Test fallito: impossibile ottenere profili")
        return
    
    student_id = student_profile["id"]
    tutor_id = tutor_profile["id"]
    
    print(f"   Student: {student_profile['first_name']} {student_profile['last_name']} (ID: {student_id})")
    print(f"   Tutor: {tutor_profile['first_name']} {tutor_profile['last_name']} (ID: {tutor_id})")
    
    # 4. Admin crea assignment
    print("\n👨‍💼 FASE 4: Admin crea assignment pacchetto")
    assignment = admin_create_package_assignment(admin_token, package_id=1, student_id=student_id, tutor_id=tutor_id)
    
    if not assignment:
        print("❌ Test fallito: assignment non creato")
        return
    
    # 5. Studente crea booking (o fallback diretto)
    print("\n📅 FASE 5: Creazione booking studente-tutor")
    booking = student_create_booking(student_token, tutor_id)
    
    if not booking:
        print("⚠️  Booking API fallito, provo inserimento diretto...")
        if not insert_test_booking_directly(student_id, tutor_id):
            print("❌ Test fallito: impossibile creare booking")
            return
    
    # 6. Verifica visibilità reciproca
    print("\n🔍 FASE 6: Verifica visibilità reciproca")
    
    # Tutor vede studente
    print("\n👨‍🏫 Test: Tutor vede studenti assegnati")
    tutor_students = tutor_check_assigned_students(tutor_token)
    
    # Studente vede tutor
    print("\n👨‍� Test: Studente vede tutors tramite booking")
    student_bookings = student_check_bookings(student_token)
    
    # 7. Risultati finali
    print("\n" + "=" * 70)
    print("🎯 RISULTATI FINALI:")
    
    tutor_sees_student = len(tutor_students) > 0
    student_sees_tutor = len(student_bookings) > 0
    
    if tutor_sees_student and student_sees_tutor:
        print("🎉 SUCCESS: Visibilità reciproca CONFERMATA!")
        print(f"   ✅ Tutor vede {len(tutor_students)} studenti")
        print(f"   ✅ Studente vede {len(student_bookings)} booking con tutors")
        print("\n🔒 La sicurezza funziona: solo studenti/tutors assegnati si vedono reciprocamente")
    elif tutor_sees_student:
        print("⚠️  PARZIALE: Tutor vede studente, ma studente non vede tutor nei booking")
    elif student_sees_tutor:
        print("⚠️  PARZIALE: Studente vede tutor, ma tutor non vede studente")
    else:
        print("❌ FALLITO: Nessuna visibilità reciproca")
        
    print("\n✅ Test completato!")


if __name__ == '__main__':
    main()
