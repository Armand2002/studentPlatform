import requests
from datetime import datetime, timezone

BASE_URL = "http://localhost:8000/api"
REQUEST_TIMEOUT = 10


def register_tutor(email: str, password: str):
    payload = {
        "email": email,
        "password": password,
        "role": "tutor",
        "first_name": "Test",
        "last_name": "Tutor",
        "bio": "Tutor di prova",
        "subjects": "Matematica, Fisica",
        "is_available": True
    }
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=REQUEST_TIMEOUT)
        print(f"Register status: {resp.status_code}")
        if resp.status_code == 201:
            print("✅ Registrazione tutor: OK")
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


def get_profile(token: str, tutor: bool = False):
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{BASE_URL}/users/me/tutor" if tutor else f"{BASE_URL}/users/me"
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


def test_dashboard_endpoints(token: str):
    """Test degli endpoint dashboard con autenticazione"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test endpoint dashboard live
    print("\n📊 Testing dashboard endpoints...")
    
    endpoints_to_test = [
        "/dashboard/live",
        "/dashboard/tutor-performance", 
        "/dashboard/today",
        "/dashboard/alerts"
    ]
    
    for endpoint in endpoints_to_test:
        url = f"{BASE_URL}{endpoint}"
        try:
            resp = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
            print(f"Dashboard {endpoint}: {resp.status_code}")
            if resp.status_code == 200:
                print(f"✅ {endpoint} OK")
                # Print first few keys to verify data structure
                if resp.headers.get('content-type', '').startswith('application/json'):
                    data = resp.json()
                    if isinstance(data, dict):
                        keys = list(data.keys())[:5]  # First 5 keys
                        print(f"   Data keys: {keys}")
            else:
                print(f"❌ {endpoint} failed: {resp.status_code} - {resp.text[:200]}")
        except requests.RequestException as e:
            print(f"❌ Errore di rete per {endpoint}: {e}")
    
    return True


if __name__ == '__main__':
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    email = f"test.tutor.{ts}@example.com"
    password = "Password123!"

    print("🚀 Test register+login tutor end-to-end: registro, login, profilo")
    ok = register_tutor(email, password)
    if not ok:
        raise SystemExit(1)

    token = login(email, password)
    if not token:
        raise SystemExit(1)

    # check both generic user profile and tutor profile
    get_profile(token, tutor=False)
    get_profile(token, tutor=True)
    
    # Test dashboard endpoints
    test_dashboard_endpoints(token)
    
    print("\n🎉 Tutti i test completati con successo!")
