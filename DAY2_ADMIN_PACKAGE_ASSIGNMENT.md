# 🏗️ **GIORNO 2 - ADMIN PACKAGE ASSIGNMENT WORKFLOW**

*Workflow completo admin per assegnazione pacchetti*  
*Obiettivo: Popolare il sistema con assegnazioni reali*  
*Tempo: 3 ore*

---

## ⏰ **TIMING DETTAGLIATO**
- **Setup & Login Admin**: 20 min
- **Package Creation (Tutor)**: 45 min  
- **Admin Package Assignment**: 90 min
- **Assignment Verification**: 45 min
- **Email & Notifications**: 20 min

---

## 🚀 **SETUP INIZIALE** (20 min)

### **1. Credenziali Test** ✅ READY
```bash
# Admin principale:
Email: admin@example.com
Password: admin123

# Student target per assegnazione:
Email: test.student.20250911153849@example.com
Password: Password123!

# Tutor per creazione pacchetto:
Email: tutor@example.com
Password: tutor123
```

### **2. Verifica Backend Status**
```bash
# STEP 1: Test API health
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# STEP 2: Test admin login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
# Expected: Status 200 + token

# STEP 3: Verifica database clean state
# Controlla che non ci siano assegnazioni esistenti per il student
```

### **3. Frontend Admin Access**
```bash
# STEP 1: Login admin
1. Vai a http://localhost:3000/login
2. Login con credenziali admin
3. Verifica redirect: □ /dashboard/admin
4. Verifica sidebar admin: □ User Management, Packages, Assignments

# STEP 2: Verifica empty state
5. Dashboard admin: □ Statistiche a 0
6. No assegnazioni attive
7. Screenshot "before" per confronto
```

---

## 📦 **PACKAGE CREATION (TUTOR)** (45 min)

### **Test 1.1: Tutor Package Creation** (25 min)
```bash
# STEP 1: Login tutor
1. Logout admin → Login tutor (tutor@example.com)
2. Vai a /dashboard/tutor
3. Verifica dashboard tutor carica correttamente

# STEP 2: Create new package
4. Dashboard tutor → Sezione "I Miei Pacchetti"
5. Click "Crea Nuovo Pacchetto" o equivalente
6. Compila form creazione:
   □ Nome: "Matematica - Preparazione Test"
   □ Materia: "Matematica"
   □ Descrizione: "Pacchetto intensivo per preparazione test universitari"
   □ Ore totali: 10
   □ Prezzo: €300
   □ Durata validità: 3 mesi

# STEP 3: Submit e verifica
7. Submit form → Verifica success message
8. Verifica pacchetto appare in lista tutor
9. Note package ID per step successivi
```

### **Test 1.2: Package Details & Status** (20 min)
```bash
# STEP 1: Package details
1. Click sul pacchetto creato
2. Verifica dettagli completi:
   □ Tutte le info inserite corrette
   □ Status: "Attivo" o "Disponibile"
   □ Tutor ID associato corretto

# STEP 2: Backend verification
3. API call per verifica:
curl -H "Authorization: Bearer [tutor_token]" \
     http://localhost:8000/api/packages/
# Expected: Nuovo pacchetto in lista

# STEP 3: Package availability
4. Verifica che il pacchetto sia disponibile per assegnazione admin
5. Note tutti i dettagli per prossimo step
```

---

## 👨‍💼 **ADMIN PACKAGE ASSIGNMENT** (90 min)

### **Test 2.1: Admin Dashboard Overview** (15 min)
```bash
# STEP 1: Switch to admin
1. Logout tutor → Login admin
2. Dashboard admin → Verifica overview
3. Menu sidebar → Click "Assignments" o "Package Management"

# STEP 2: Available packages
4. Verifica lista pacchetti disponibili
5. Trova il pacchetto creato dal tutor
6. Verifica dettagli package visibili
```

### **Test 2.2: Student Selection** (20 min)
```bash
# STEP 1: User management access
1. Admin dashboard → "User Management" o "Students"
2. Lista studenti → Trova test student
3. Verifica profilo student completo:
   □ Email: test.student.20250911153849@example.com
   □ Status: Active
   □ Pacchetti attuali: 0 (vuoto)

# STEP 2: Student details
4. Click su student → Profilo dettagliato
5. Verifica sezione "Pacchetti Assegnati": □ Vuota
6. Note student ID per assignment
```

### **Test 2.3: Create Package Assignment** (40 min)
```bash
# STEP 1: Assignment creation
1. Admin dashboard → "Create Assignment" o equivalente
2. Assignment form:
   □ Student: Seleziona test student (dropdown/search)
   □ Tutor: Seleziona tutor del pacchetto
   □ Package: Seleziona "Matematica - Preparazione Test"
   
# STEP 2: Customization options
3. Opzioni personalizzazione:
   □ Custom Name: "Matematica Intensiva - Mario Rossi"
   □ Custom Hours: 10 (default dal pacchetto)
   □ Custom Price: €280 (sconto applicato)
   □ Expiry Date: 3 mesi da oggi
   □ Admin Notes: "Assegnazione per preparazione test ingegneria"

# STEP 3: Assignment settings
4. Impostazioni avanzate:
   □ Auto-activate on payment: ✅ Enabled
   □ Status: "Assigned" (pending activation)
   □ Payment required: €280

# STEP 4: Submit assignment
5. Review assignment details
6. Click "Create Assignment"
7. Verifica success message
8. Note assignment ID generato
```

### **Test 2.4: Payment Recording** (15 min)
```bash
# STEP 1: Record payment
1. Assignment creata → "Record Payment" button
2. Payment form:
   □ Amount: €280
   □ Payment Method: "Bank Transfer"
   □ Payment Date: Oggi
   □ Reference: "TRF-2025-001"
   □ Admin Notes: "Pagamento ricevuto via bonifico"

# STEP 2: Activate assignment
3. Submit payment → Assignment status cambia
4. Verifica status: "Active"
5. Verifica ore disponibili: 10/10
6. Verifica expiry date impostata
```

---

## ✅ **ASSIGNMENT VERIFICATION** (45 min)

### **Test 3.1: Admin Side Verification** (15 min)
```bash
# STEP 1: Admin dashboard check
1. Admin dashboard → Assignments overview
2. Verifica assignment creata visibile:
   □ Student name corretto
   □ Package name corretto
   □ Status: "Active"
   □ Hours: 10/10 remaining

# STEP 2: Assignment details
3. Click assignment → Dettagli completi:
   □ Tutte le info corrette
   □ Payment recorded
   □ Timeline assignment visibile
```

### **Test 3.2: Student Side Verification** (30 min)
```bash
# STEP 1: Switch to student
1. Logout admin → Login student
2. Vai a /dashboard/student
3. 🎯 MOMENTO CRITICO: Dashboard ora popolata!

# STEP 2: Widgets verification
4. Widget "Pacchetti Attivi":
   □ NON più empty state!
   □ Mostra: "Matematica Intensiva - Mario Rossi"
   □ Ore rimanenti: 10/10
   □ Progress bar: 0%
   □ Scadenza: [data corretta]

# STEP 3: Packages page
5. Sidebar → "I Miei Pacchetti"
6. Verifica pacchetto assegnato:
   □ Tutti i dettagli corretti
   □ Status: "Attivo"
   □ Button "Prenota Lezione" visibile e attivo

# STEP 4: Quick actions
7. Dashboard → Quick Actions Widget
8. "Prenota Lezione" ora dovrebbe funzionare
9. "Acquista Pacchetto" → Dovrebbe mostrare pacchetti già assegnati
```

---

## 📧 **EMAIL & NOTIFICATIONS** (20 min)

### **Test 4.1: Email Notifications** (10 min)
```bash
# STEP 1: Check backend logs
1. Terminal → docker-compose logs web | grep email
2. Verifica email notifications:
   □ Package assigned notification
   □ Payment confirmation
   □ Assignment activation

# STEP 2: Email content (se configurato)
3. Se SendGrid configurato, verifica email ricevute
4. Altrimenti, verifica log entries per content
```

### **Test 4.2: In-App Notifications** (10 min)
```bash
# STEP 1: Student notifications
1. Student dashboard → Verifica notifications
2. Dovrebbe mostrare: "Nuovo pacchetto assegnato!"
3. Click notification → Redirect a package details

# STEP 2: Admin notifications
4. Admin dashboard → Verifica assignment success
5. Dashboard metrics dovrebbero essere aggiornate:
   □ Active assignments: 1
   □ Total revenue: €280
   □ Active students: 1
```

---

## ✅ **CHECKLIST FINALE GIORNO 2**

### **🎯 Completamenti Verificati:**
- [ ] **Tutor Package Creation**: Pacchetto creato e attivo
- [ ] **Admin Assignment Process**: Assignment creata con successo
- [ ] **Payment Recording**: Pagamento registrato e assignment attivata
- [ ] **Student Dashboard Populated**: Dashboard non più vuota!
- [ ] **Package Visibility**: Student vede pacchetto assegnato
- [ ] **Booking Availability**: Bottoni "Prenota Lezione" attivi
- [ ] **Email Notifications**: Notifiche inviate (logs verificati)

### **🐛 Issues Tracking:**
```bash
# Template per issues trovati:
ISSUE #[N]: [Titolo problema]
Component: [Admin/Student/Tutor dashboard]
Steps to reproduce: [Passi dettagliati]
Expected: [Comportamento atteso]  
Actual: [Comportamento reale]
Priority: [Critical/High/Medium/Low]
API Status: [Working/Broken]
```

### **📊 Success Metrics:**
- **Assignment Creation**: Completata senza errori
- **Database Population**: Student ha ora dati reali
- **Dashboard Transformation**: Da empty state a populated
- **Cross-Role Workflow**: Admin → Tutor → Student funzionante

### **🔍 Database State After Day 2:**
```bash
# Stato atteso database:
- AdminPackageAssignment: 1 record (Active)
- AdminPayment: 1 record (€280)
- Student dashboard: Populated with real data
- Ready for Day 3: Student booking workflow
```

---

**🎉 GIORNO 2 COMPLETATO!**

**Next**: GIORNO 3 - Student Journey from Assignment to First Booking

*Il focus sarà sul workflow studente ora che ha dati reali*

*Tempo stimato: 2.5 ore*
