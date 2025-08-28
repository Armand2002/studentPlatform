#!/usr/bin/env python3
"""
Test script per verificare la registrazione con profilo completo
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

def test_student_registration():
    """Test registrazione studente con profilo completo"""
    print("🧪 Testando registrazione studente...")
    
    # Usa timestamp per email unica
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    student_data = {
        "email": f"test.student.{timestamp}@example.com",
        "password": "TestPassword123!",
        "role": "student",
        "first_name": "Mario",
        "last_name": "Rossi",
        "date_of_birth": "2005-06-15",
        "institute": "Liceo Scientifico Galileo Galilei",
        "class_level": "3° Liceo",
        "address": "Via Roma 123, Milano",
        "phone_number": "123456789"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=student_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Registrazione studente riuscita!")
            print(f"Token: {result.get('access_token', 'N/A')[:20]}...")
            return True, student_data["email"]
        else:
            print(f"❌ Registrazione fallita: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Errore durante il test: {e}")
        return False, None

def test_tutor_registration():
    """Test registrazione tutor con profilo completo"""
    print("\n🧪 Testando registrazione tutor...")
    
    # Usa timestamp per email unica
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    tutor_data = {
        "email": f"test.tutor.{timestamp}@example.com",
        "password": "TestPassword123!",
        "role": "tutor",
        "first_name": "Anna",
        "last_name": "Bianchi",
        "bio": "Tutor esperta in matematica e fisica",
        "subjects": "Matematica, Fisica",
        "hourly_rate": 25,
        "is_available": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=tutor_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Registrazione tutor riuscita!")
            print(f"Token: {result.get('access_token', 'N/A')[:20]}...")
            return True, tutor_data["email"]
        else:
            print(f"❌ Registrazione fallita: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Errore durante il test: {e}")
        return False, None

def test_login(email):
    """Test login con utente registrato"""
    print(f"\n🧪 Testando login per {email}...")
    
    login_data = {
        "username": email,
        "password": "TestPassword123!"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Login riuscito!")
            print(f"Token: {result.get('access_token', 'N/A')[:20]}...")
            return result.get('access_token')
        else:
            print(f"❌ Login fallito: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Errore durante il login: {e}")
        return None

def test_student_profile(token):
    """Test accesso al profilo studente"""
    if not token:
        print("❌ Token mancante per test profilo")
        return False
        
    print("\n🧪 Testando accesso profilo studente...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/users/me/student", headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Profilo studente accessibile!")
            print(f"Nome: {result.get('first_name')} {result.get('last_name')}")
            print(f"Istituto: {result.get('institute')}")
            return True
        else:
            print(f"❌ Accesso profilo fallito: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Errore durante accesso profilo: {e}")
        return False

if __name__ == "__main__":
    print("🚀 INIZIO TEST REGISTRAZIONE COMPLETA")
    print("=" * 50)
    
    # Test 1: Registrazione studente
    student_success, student_email = test_student_registration()
    
    # Test 2: Registrazione tutor
    tutor_success, tutor_email = test_tutor_registration()
    
    # Test 3: Login e accesso profilo
    if student_success and student_email:
        token = test_login(student_email)
        if token:
            profile_success = test_student_profile(token)
        else:
            profile_success = False
    else:
        profile_success = False
    
    # Risultati finali
    print("\n" + "=" * 50)
    print("📊 RISULTATI TEST")
    print(f"✅ Registrazione Studente: {'SUCCESSO' if student_success else 'FALLITO'}")
    print(f"✅ Registrazione Tutor: {'SUCCESSO' if tutor_success else 'FALLITO'}")
    print(f"✅ Accesso Profilo: {'SUCCESSO' if profile_success else 'FALLITO'}")
    
    if student_success and tutor_success and profile_success:
        print("\n🎉 TUTTI I TEST SUPERATI! Sistema funzionante!")
    else:
        print("\n❌ ALCUNI TEST FALLITI. Controllare il backend.")
