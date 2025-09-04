"""
Test diretto API per verificare endpoint sicurezza tutor
"""
import requests

BASE_URL = "http://localhost:8000/api"


def test_endpoint_security():
    """Test della sicurezza endpoint tutor"""
    
    print("🔐 Test sicurezza endpoint /api/users/tutors/me/students")
    
    # Login tutor esistente
    login_payload = {"username": "test.tutor.20250902164808@example.com", "password": "Password123!"}
    
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
        if resp.status_code != 200:
            print(f"❌ Login tutor fallito: {resp.status_code}")
            return
        
        token = resp.json().get("access_token")
        print("✅ Login tutor OK")
        
        # Test nuovo endpoint sicuro
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/users/tutors/me/students", headers=headers)
        
        print(f"📊 Endpoint status: {resp.status_code}")
        
        if resp.status_code == 200:
            students = resp.json()
            print(f"✅ Endpoint funziona! Studenti trovati: {len(students)}")
            
            if students:
                print("👥 Lista studenti:")
                for student in students:
                    name = f"{student.get('first_name', 'N/A')} {student.get('last_name', 'N/A')}"
                    print(f"  - {name} (ID: {student.get('id')})")
            else:
                print("📝 Nessuno studente assegnato (normale se non ci sono booking)")
                
        else:
            print(f"❌ Errore endpoint: {resp.text}")
            
        # Test che endpoint admin dia 403
        print("\n🚫 Test endpoint admin (dovrebbe dare 403)")
        resp = requests.get(f"{BASE_URL}/users/students", headers=headers)
        
        if resp.status_code == 403:
            print("✅ Sicurezza OK! Tutor non può vedere tutti gli studenti")
        elif resp.status_code == 200:
            all_students = resp.json()
            print(f"⚠️  SECURITY ISSUE! Tutor può vedere {len(all_students)} studenti!")
        else:
            print(f"❓ Risposta inaspettata: {resp.status_code}")
            
        print("\n🎯 Test di sicurezza completato!")
        
    except Exception as e:
        print(f"❌ Errore: {e}")


if __name__ == '__main__':
    test_endpoint_security()
