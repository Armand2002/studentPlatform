import requests
from datetime import datetime, timezone

BASE_URL = "http://localhost:8000/api"
REQUEST_TIMEOUT = 10


def login(username: str, password: str):
    """Login e ottieni token"""
    payload = {"username": username, "password": password}
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            token = data.get("access_token")
            print("✅ Login OK, token ottenuto")
            return token
        else:
            print(f"❌ Login fallito: {resp.status_code} - {resp.text}")
            return None
    except requests.RequestException as e:
        print(f"❌ Errore di rete durante il login: {e}")
        return None


def test_tutor_assigned_students(token: str):
    """Test dell'endpoint sicuro per studenti assegnati al tutor"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🔒 Testing nuovo endpoint sicuro: /api/users/tutors/me/students")
    
    try:
        resp = requests.get(f"{BASE_URL}/users/tutors/me/students", headers=headers, timeout=REQUEST_TIMEOUT)
        print(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            students = resp.json()
            print("✅ Endpoint sicuro funziona!")
            print(f"📊 Numero studenti assegnati: {len(students)}")
            
            if students:
                print("👥 Studenti assegnati:")
                for student in students:
                    print(f"  - ID: {student.get('id')}, Nome: {student.get('first_name')} {student.get('last_name')}")
                    print(f"    Email: {student.get('user', {}).get('email', 'N/A')}")
            else:
                print("📝 Nessuno studente assegnato a questo tutor")
                
        elif resp.status_code == 403:
            print("❌ Accesso negato - verificare che l'utente sia un tutor")
        elif resp.status_code == 404:
            print("❌ Profilo tutor non trovato")
        else:
            print(f"❌ Errore: {resp.status_code} - {resp.text}")
            
    except requests.RequestException as e:
        print(f"❌ Errore di rete: {e}")


def test_old_endpoint_should_fail(token: str):
    """Test che l'endpoint /api/users/students dia 403 per i tutor (solo admin)"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🚫 Testing endpoint admin-only: /api/users/students (dovrebbe dare 403)")
    
    try:
        resp = requests.get(f"{BASE_URL}/users/students", headers=headers, timeout=REQUEST_TIMEOUT)
        print(f"Status: {resp.status_code}")
        
        if resp.status_code == 403:
            print("✅ Sicurezza OK! Tutor non può accedere a tutti gli studenti")
        elif resp.status_code == 200:
            students = resp.json()
            print(f"⚠️ SECURITY ISSUE! Tutor può vedere {len(students)} studenti!")
        else:
            print(f"❓ Risposta inaspettata: {resp.status_code} - {resp.text}")
            
    except requests.RequestException as e:
        print(f"❌ Errore di rete: {e}")


if __name__ == '__main__':
    # Usa l'ultimo tutor creato
    print("🔐 Test sicurezza: endpoint studenti assegnati al tutor")
    
    # Login con tutor appena creato
    email = "test.tutor.20250902164808@example.com"  # Dal test precedente
    password = "Password123!"
    
    token = login(email, password)
    if not token:
        print("❌ Login fallito, impossibile continuare")
        exit(1)
    
    # Test nuovo endpoint sicuro
    test_tutor_assigned_students(token)
    
    # Test che l'endpoint admin dia 403
    test_old_endpoint_should_fail(token)
    
    print("\n🎯 Test di sicurezza completato!")
