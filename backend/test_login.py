import requests
from datetime import datetime

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
            print("✅ Registrazione: OK")
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


if __name__ == '__main__':
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    email = f"test.student.{ts}@example.com"
    password = "Password123!"

    print("🚀 Test login end-to-end: registro, login, profilo")
    ok = register_student(email, password)
    if not ok:
        raise SystemExit(1)

    token = login(email, password)
    if not token:
        raise SystemExit(1)

    # check both generic user profile and student profile
    get_profile(token, student=False)
    get_profile(token, student=True)
