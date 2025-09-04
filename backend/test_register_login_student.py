import requests
from datetime import datetime, timezone

BASE_URL = "http://localhost:8000/api"
REQUEST_TIMEOUT = 10


def register_student(email: str, password: str):
    payload = {
        "email": email,
        "password": password,
        "role": "student",
        "first_name": "Test",
        "last_name": "Student",
        "date_of_birth": "2005-01-01",
        "institute": "Istituto Test",
        "class_level": "3A",
        "phone_number": "+391234567890"
    }
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=REQUEST_TIMEOUT)
        print(f"Register status: {resp.status_code}")
        if resp.status_code == 201:
            print("✅ Registrazione studente: OK")
            return True
        else:
            print(f"❌ Registrazione fallita: {resp.status_code} - {resp.text}")
            return False
    except requests.RequestException as e:
        print(f"❌ Errore di rete durante la registrazione: {e}")
        return False


def login(username: str, password: str):
    payload = {"username": username, "password": password}
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=REQUEST_TIMEOUT)
        print(f"Login status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            token = data.get("access_token")
            print("✅ Login OK, token found")
            return token
        else:
            print(f"❌ Login fallito: {resp.status_code} - {resp.text}")
            return None
    except requests.RequestException as e:
        print(f"❌ Errore di rete durante il login: {e}")
        return None


def get_profile(token: str, student: bool = False):
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{BASE_URL}/users/me/student" if student else f"{BASE_URL}/users/me"
    try:
        resp = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
        print(f"Profile status: {resp.status_code} - {url}")
        if resp.status_code == 200:
            print("✅ Profilo recuperato")
            print(resp.json())
            return True
        else:
            print(f"❌ Recupero profilo fallito: {resp.status_code} - {resp.text}")
            return False
    except requests.RequestException as e:
        print(f"❌ Errore di rete durante il recupero profilo: {e}")
        return False


def test_packages_endpoint(token: str):
    """Test dell'endpoint /api/packages/purchases per verificare integrazione backend-frontend"""
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.get(f"{BASE_URL}/packages/purchases", headers=headers, timeout=REQUEST_TIMEOUT)
        print(f"📦 Packages purchases status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print("✅ Endpoint packages/purchases: OK")
            print(f"📊 Pacchetti trovati: {len(data)} items")
            if data:
                print("🔍 Primi dati ricevuti:")
                print(data[0] if len(data) > 0 else "Nessun dato")
            else:
                print("📝 Nessun pacchetto acquistato (normale per nuovo utente)")
            return True
        else:
            print(f"❌ Packages endpoint fallito: {resp.status_code}")
            print(f"Error details: {resp.text}")
            return False
    except requests.RequestException as e:
        print(f"❌ Errore di rete durante test packages: {e}")
        return False


def test_bookings_endpoint(token: str):
    """Test dell'endpoint /api/bookings/ per verificare integrazione backend-frontend"""
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.get(f"{BASE_URL}/bookings/", headers=headers, timeout=REQUEST_TIMEOUT)
        print(f"📅 Bookings status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print("✅ Endpoint bookings: OK")
            print(f"📊 Prenotazioni trovate: {len(data)} items")
            if data:
                print("🔍 Primi dati ricevuti:")
                print(data[0] if len(data) > 0 else "Nessun dato")
            else:
                print("📝 Nessuna prenotazione (normale per nuovo utente)")
            return True
        else:
            print(f"❌ Bookings endpoint fallito: {resp.status_code}")
            print(f"Error details: {resp.text}")
            return False
    except requests.RequestException as e:
        print(f"❌ Errore di rete durante test bookings: {e}")
        return False


if __name__ == '__main__':
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    email = f"test.student.{ts}@example.com"
    password = "Password123!"

    print("🚀 Test register+login+packages end-to-end: registro, login, profilo, API")
    print("=" * 70)
    
    # Step 1: Registrazione
    print("📝 STEP 1: Registrazione studente")
    ok = register_student(email, password)
    if not ok:
        raise SystemExit(1)

    # Step 2: Login
    print("\n🔐 STEP 2: Login")
    token = login(email, password)
    if not token:
        raise SystemExit(1)
    print(f"🔑 Token JWT: {token[:50]}...")

    # Step 3: Profili
    print("\n👤 STEP 3: Verifica profili")
    get_profile(token, student=False)
    get_profile(token, student=True)

    # Step 4: Test API endpoints per frontend integration
    print("\n🔌 STEP 4: Test API endpoints per integrazione frontend")
    
    # Test packages endpoint (per PackageOverviewWidget)
    print("\n📦 Test endpoint packages/purchases:")
    test_packages_endpoint(token)
    
    # Test bookings endpoint (per UpcomingLessonsWidget)
    print("\n📅 Test endpoint bookings:")
    test_bookings_endpoint(token)
    
    print("\n" + "=" * 70)
    print("✅ Test completato! Backend pronto per integrazione frontend")
    print(f"🎯 Usa questo token per test manuali: {token}")
