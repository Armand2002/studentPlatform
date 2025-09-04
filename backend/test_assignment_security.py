import requests
from datetime import datetime, timezone, timedelta

BASE_URL = "http://localhost:8000/api"
REQUEST_TIMEOUT = 10


def register_student():
    """Registra uno studente di test"""
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    email = f"test.student.{ts}@example.com"
    password = "Password123!"
    
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
            print("✅ Studente registrato")
            return email, password
        else:
            print(f"❌ Registrazione studente fallita: {resp.status_code} - {resp.text}")
            return None, None
    except requests.RequestException as e:
        print(f"❌ Errore di rete durante registrazione studente: {e}")
        return None, None


def login(username: str, password: str):
    """Login e ottieni token"""
    payload = {"username": username, "password": password}
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            return data.get("access_token")
        return None
    except Exception:
        return None


def get_user_ids(student_token: str, tutor_token: str):
    """Ottieni gli ID di studente e tutor"""
    student_headers = {"Authorization": f"Bearer {student_token}"}
    tutor_headers = {"Authorization": f"Bearer {tutor_token}"}
    
    # Get student ID
    resp = requests.get(f"{BASE_URL}/users/me/student", headers=student_headers)
    student_id = resp.json().get('id') if resp.status_code == 200 else None
    
    # Get tutor ID  
    resp = requests.get(f"{BASE_URL}/users/me/tutor", headers=tutor_headers)
    tutor_id = resp.json().get('id') if resp.status_code == 200 else None
    
    return student_id, tutor_id


def create_test_booking(student_token: str, student_id: int, tutor_id: int):
    """Crea un booking di test tramite admin (simulazione assegnazione)"""
    # Per ora simulo creando direttamente nel database
    # In un ambiente reale, l'admin creerebbe package purchases e bookings
    
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # Proviamo a creare un booking diretto (se endpoint esiste)
    tomorrow = datetime.now() + timedelta(days=1)
    payload = {
        "student_id": student_id,
        "tutor_id": tutor_id,
        "start_time": tomorrow.isoformat(),
        "end_time": (tomorrow + timedelta(hours=1)).isoformat(),
        "subject": "Matematica",
        "notes": "Lezione di test"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/bookings", json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 201:
            print("✅ Booking creato")
            return True
        else:
            print(f"❌ Creazione booking fallita: {resp.status_code} - {resp.text}")
            return False
    except Exception as e:
        print(f"❌ Errore creazione booking: {e}")
        return False


def test_tutor_sees_assigned_student(tutor_token: str):
    """Test che il tutor veda ora lo studente assegnato"""
    headers = {"Authorization": f"Bearer {tutor_token}"}
    
    resp = requests.get(f"{BASE_URL}/users/tutors/me/students", headers=headers)
    if resp.status_code == 200:
        students = resp.json()
        print(f"✅ Tutor ora vede {len(students)} studenti assegnati")
        for student in students:
            print(f"  - {student.get('first_name')} {student.get('last_name')}")
        return len(students) > 0
    else:
        print(f"❌ Errore: {resp.status_code}")
        return False


if __name__ == '__main__':
    print("🎯 Test completo: Assegnazione studente → tutor")
    
    # 1. Registra studente
    student_email, student_password = register_student()
    if not student_email:
        exit(1)
    
    # 2. Login studente e tutor
    student_token = login(student_email, student_password)
    tutor_token = login("test.tutor.20250902164808@example.com", "Password123!")
    
    if not student_token or not tutor_token:
        print("❌ Login fallito")
        exit(1)
    
    # 3. Ottieni ID
    student_id, tutor_id = get_user_ids(student_token, tutor_token)
    print(f"📊 Student ID: {student_id}, Tutor ID: {tutor_id}")
    
    if not student_id or not tutor_id:
        print("❌ Impossibile ottenere ID utenti")
        exit(1)
    
    # 4. Crea booking (simula assegnazione)
    if create_test_booking(student_token, student_id, tutor_id):
        # 5. Verifica che tutor veda studente
        if test_tutor_sees_assigned_student(tutor_token):
            print("🎉 SUCCESS: Tutor vede correttamente lo studente assegnato!")
        else:
            print("❌ Tutor non vede lo studente assegnato")
    else:
        print("❌ Impossibile creare booking di test")
