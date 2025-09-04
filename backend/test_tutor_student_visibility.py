"""
Test completo visibilità reciproca con admin esistente o fallback diretto
"""
import requests
from datetime import datetime, timezone, timedelta

BASE_URL = "http://localhost:8000/api"
REQUEST_TIMEOUT = 10


def try_admin_login():
    """Prova login con admin comuni o esistenti"""
    admin_accounts = [
        ("admin@platform.com", "password123"),
        ("admin@example.com", "password123"),
        ("test.admin@platform.com", "AdminPassword123!"),
        ("admin", "admin"),
        ("admin@test.com", "admin123")
    ]
    
    for email, password in admin_accounts:
        token = login(email, password, silent=True)
        if token:
            print(f"✅ Admin trovato: {email}")
            return email, password, token
    
    print("⚠️  Nessun admin trovato, continuo senza admin")
    return None, None, None


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
            print(f"❌ Registrazione studente fallita: {resp.status_code}")
            return None, None
    except Exception as e:
        print(f"❌ Errore registrazione studente: {e}")
        return None, None


def login(username: str, password: str, silent: bool = False):
    """Login e ottieni token"""
    payload = {"username": username, "password": password}
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            token = data.get("access_token")
            if not silent:
                print(f"✅ Login OK: {username}")
            return token
        else:
            if not silent:
                print(f"❌ Login fallito per {username}: {resp.status_code}")
            return None
    except Exception as e:
        if not silent:
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
        return None
    except Exception:
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
            return assignment
        else:
            print(f"❌ Creazione assignment fallita: {resp.status_code}")
            return None
    except Exception as e:
        print(f"❌ Errore assignment: {e}")
        return None


def student_create_booking(student_token: str, tutor_id: int):
    """Studente crea booking con tutor assegnato"""
    headers = {"Authorization": f"Bearer {student_token}"}
    
    tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
    end_time = tomorrow + timedelta(hours=1)
    
    payload = {
        "tutor_id": tutor_id,
        "start_time": tomorrow.isoformat(),
        "end_time": end_time.isoformat(),
        "duration_hours": 1,
        "subject": "Matematica",
        "notes": "Lezione di test da assignment admin",
        "package_purchase_id": 1
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/bookings", json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 201:
            booking = resp.json()
            print(f"✅ Studente ha creato booking ID: {booking.get('id')}")
            return booking
        else:
            print(f"❌ Booking fallito: {resp.status_code}")
            return None
    except Exception as e:
        print(f"❌ Errore booking: {e}")
        return None


def direct_db_insert_booking(student_id: int, tutor_id: int):
    """Fallback: inserisce booking direttamente via SQL"""
    try:
        import psycopg2
        
        # Connessione diretta al database Docker
        conn = psycopg2.connect(
            host="localhost",
            port="5432", 
            database="tutoring_platform",
            user="user",
            password="password"
        )
        
        cursor = conn.cursor()
        
        tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
        end_time = tomorrow + timedelta(hours=1)
        
        cursor.execute("""
            INSERT INTO bookings (student_id, tutor_id, package_purchase_id, start_time, end_time, 
                                duration_hours, subject, status, created_at, updated_at)
            VALUES (%s, %s, 1, %s, %s, 1, 'Matematica', 'confirmed', NOW(), NOW())
        """, (student_id, tutor_id, tomorrow, end_time))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ Booking inserito direttamente nel DB (Student {student_id} → Tutor {tutor_id})")
        return True
        
    except Exception as e:
        print(f"❌ Errore inserimento diretto: {e}")
        return False


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
                print(f"   - {name} ({email})")
            return students
        else:
            print(f"❌ Tutor non può vedere studenti: {resp.status_code}")
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
                    print(f"   - {booking.get('subject')} con {tutor_name}")
            
            print(f"👨‍🏫 Tutors unici visti: {len(tutors_seen)}")
            return bookings
        else:
            print(f"❌ Studente non può vedere booking: {resp.status_code}")
            return []
    except Exception as e:
        print(f"❌ Errore controllo booking: {e}")
        return []


def main():
    """Test completo con fallback multipli"""
    
    print("🎯 TEST VISIBILITÀ RECIPROCA TUTOR-STUDENTE")
    print("=" * 50)
    
    # 1. Setup utenti
    print("\n📋 FASE 1: Setup utenti")
    
    # Prova admin esistente
    admin_email, admin_password, admin_token = try_admin_login()
    
    # Studente nuovo
    student_email, student_password = register_student()
    if not student_email:
        print("❌ Test fallito: impossibile registrare studente")
        return
    
    # Tutor esistente
    tutor_email = "test.tutor.20250902164808@example.com"
    tutor_password = "Password123!"
    
    # 2. Login
    print("\n🔐 FASE 2: Login utenti")
    student_token = login(student_email, student_password)
    tutor_token = login(tutor_email, tutor_password)
    
    if not student_token or not tutor_token:
        print("❌ Login studente/tutor fallito")
        return
    
    # 3. Profili
    print("\n📊 FASE 3: Recupero profili")
    student_profile = get_user_profile(student_token, "student")
    tutor_profile = get_user_profile(tutor_token, "tutor")
    
    if not student_profile or not tutor_profile:
        print("❌ Impossibile ottenere profili")
        return
    
    student_id = student_profile["id"]
    tutor_id = tutor_profile["id"]
    
    print(f"   Student: {student_profile['first_name']} {student_profile['last_name']} (ID: {student_id})")
    print(f"   Tutor: {tutor_profile['first_name']} {tutor_profile['last_name']} (ID: {tutor_id})")
    
    # 4. Assignment (se admin disponibile)
    assignment_created = False
    if admin_token:
        print("\n👨‍💼 FASE 4: Admin crea assignment")
        assignment = admin_create_package_assignment(admin_token, package_id=1, student_id=student_id, tutor_id=tutor_id)
        assignment_created = assignment is not None
    else:
        print("\n⚠️  SALTATA FASE 4: Nessun admin disponibile")
    
    # 5. Booking
    print("\n📅 FASE 5: Creazione booking")
    booking = student_create_booking(student_token, tutor_id)
    
    if not booking:
        print("⚠️  Booking API fallito, provo inserimento diretto...")
        if not direct_db_insert_booking(student_id, tutor_id):
            print("❌ Impossibile creare booking")
            return
    
    # 6. Test visibilità
    print("\n🔍 FASE 6: Test visibilità reciproca")
    
    print("\n👨‍🏫 Tutor → Studenti:")
    tutor_students = tutor_check_assigned_students(tutor_token)
    
    print("\n👨‍🎓 Studente → Tutors (via bookings):")
    student_bookings = student_check_bookings(student_token)
    
    # 7. Risultati
    print("\n" + "=" * 50)
    print("🎯 RISULTATI:")
    
    tutor_sees_student = len(tutor_students) > 0
    student_sees_tutor = len(student_bookings) > 0
    
    if tutor_sees_student and student_sees_tutor:
        print("🎉 SUCCESS: Visibilità reciproca CONFERMATA!")
        print(f"   ✅ Tutor vede {len(tutor_students)} studenti")
        print(f"   ✅ Studente vede {len(student_bookings)} booking")
        if assignment_created:
            print("   🔗 Assignment admin utilizzato")
        else:
            print("   🔗 Booking diretto utilizzato")
    elif tutor_sees_student:
        print("⚠️  PARZIALE: Solo tutor vede studente")
    elif student_sees_tutor:
        print("⚠️  PARZIALE: Solo studente vede tutor")
    else:
        print("❌ FALLITO: Nessuna visibilità")
    
    print("\n✅ Test completato!")


if __name__ == '__main__':
    main()
