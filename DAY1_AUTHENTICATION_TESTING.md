# 🔐 **GIORNO 1 - AUTHENTICATION TESTING**

*Test dettagliato sistema autenticazione - 2 ore totali*  
*Backend Status: ✅ 100% Funzionante*

---

## ⏰ **TIMING DETTAGLIATO**
- **Setup & Preparazione**: 15 min
- **Login Testing**: 45 min  
- **Registration Testing**: 45 min
- **Password Reset Testing**: 30 min
- **Session & Security**: 15 min

---

## 🚀 **SETUP INIZIALE** (15 min)

### **1. Verifica Server Attivi**
```bash
# Controlla backend
curl http://localhost:8000/api/health
# Expected: {"status": "healthy"}

# Controlla frontend  
curl http://localhost:3000
# Expected: HTML response
```

### **2. Browser Setup**
```bash
# Apri Chrome con DevTools
- F12 → Console tab aperta
- Network tab aperta 
- Application tab → Local Storage visibile
- Responsive mode ready (per mobile test)
```

### **3. Test Data Ready**
```bash
# Credenziali validate:
Admin: admin.e2e@acme.com / Password123!
Student: test.student.20250911153849@example.com / [password dalla registrazione]
Tutor: test.tutor.20250911154125@example.com / [password dalla registrazione]

# URLs:
Login: http://localhost:3000/login
Register: http://localhost:3000/register
Forgot: http://localhost:3000/forgot-password
```

---

## 🔑 **LOGIN TESTING** (45 min)

### **Test 1.1: Login Page Load** (5 min)
```bash
# STEP 1: Naviga a /login
1. Apri http://localhost:3000/login
2. Verifica elementi visibili:
   □ Logo/brand della piattaforma
   □ Form con email field
   □ Form con password field  
   □ Button "Accedi" o "Login"
   □ Link "Registrati" 
   □ Link "Password dimenticata?"
   □ Background blu (design system)

# STEP 2: Controlla DevTools
3. Console: □ Nessun errore JavaScript
4. Network: □ Caricamento CSS/JS completato
5. Responsive: □ Layout corretto mobile/desktop
```

### **Test 1.2: Form Validation** (10 min)
```bash
# STEP 1: Test campi vuoti
1. Click "Accedi" senza compilare
   □ Messaggio errore "Email obbligatoria"
   □ Messaggio errore "Password obbligatoria"
   □ Form non submitted (nessuna chiamata API)

# STEP 2: Test email invalida
2. Email: "invalid-email" + Password: "test"
3. Click "Accedi"
   □ Messaggio errore "Email non valida"
   □ Form non submitted

# STEP 3: Test password corta
4. Email: "test@test.com" + Password: "12"  
5. Click "Accedi"
   □ Messaggio errore "Password troppo corta" (se validazione client)
   □ O tentativo login con errore server appropriato
```

### **Test 1.3: Login Credenziali Errate** (10 min)
```bash
# STEP 1: Email inesistente
1. Email: "nonexistent@test.com" + Password: "Password123!"
2. Click "Accedi" 
3. Osserva DevTools Network tab:
   □ POST /api/auth/login chiamata
   □ Response 401 Unauthorized
   □ Messaggio errore "Credenziali non valide"
   □ Form rimane visibile (no redirect)

# STEP 2: Password errata
4. Email: "admin.e2e@acme.com" + Password: "WrongPassword"
5. Click "Accedi"
   □ Stessi controlli del punto precedente
   □ Nessun token salvato in localStorage
```

### **Test 1.4: Login Admin Successo** (10 min)
```bash
# STEP 1: Login corretto
1. Email: "admin.e2e@acme.com"
2. Password: "Password123!"
3. Click "Accedi"

# STEP 2: Verifica Network
4. DevTools Network:
   □ POST /api/auth/login → Status 200
   □ Response contiene: access_token, refresh_token, user data
   □ Response user.role = "admin"

# STEP 3: Verifica Storage  
5. DevTools Application → Local Storage:
   □ access_token salvato
   □ refresh_token salvato
   □ user_data salvato con role "admin"

# STEP 4: Verifica Redirect
6. URL automaticamente cambiata a:
   □ /dashboard/admin (redirect corretto per admin)
```

### **Test 1.5: Login Student/Tutor** (10 min)
```bash
# STEP 1: Login Student
1. Logout se necessario
2. Login con: test.student.20250911153849@example.com
3. Verifica redirect: □ /dashboard/student

# STEP 2: Login Tutor  
4. Logout
5. Login con: test.tutor.20250911154125@example.com
6. Verifica redirect: □ /dashboard/tutor

# STEP 3: Verifica Role-based
7. Per ogni login, controlla localStorage:
   □ user_data.role corretto ("student"/"tutor")
   □ Token diversi per ogni utente
```

---

## 📝 **REGISTRATION TESTING** (45 min)

### **Test 2.1: Registration Page Load** (5 min)
```bash
# STEP 1: Naviga a /register
1. Apri http://localhost:3000/register
2. Verifica elementi visibili:
   □ Form email field
   □ Form password field
   □ Form confirm password field
   □ Radio buttons: Student / Tutor
   □ Campi condizionali per Tutor (se selezionato)
   □ Button "Registrati"
   □ Link "Hai già un account? Accedi"
```

### **Test 2.2: Role Selection** (10 min)
```bash
# STEP 1: Test selezione Student
1. Select radio "Student"
2. Verifica:
   □ Campi base visibili: email, password, confirm
   □ Nessun campo aggiuntivo
   □ Button "Registrati" abilitato

# STEP 2: Test selezione Tutor
3. Select radio "Tutor"  
4. Verifica campi aggiuntivi:
   □ Campo "Nome" obbligatorio
   □ Campo "Cognome" obbligatorio
   □ Campo "Bio/Descrizione"
   □ Multi-select "Materie" 
   □ Campo "Esperienza anni"
   □ Form si espande correttamente
```

### **Test 2.3: Form Validation Registration** (15 min)
```bash
# STEP 1: Test campi vuoti
1. Click "Registrati" senza compilare
   □ Errori per tutti i campi obbligatori
   □ Focus sul primo campo con errore

# STEP 2: Test password mismatch
2. Password: "Password123!" 
3. Confirm: "DifferentPassword"
4. Click "Registrati"
   □ Errore "Le password non coincidono"

# STEP 3: Test email già esistente
5. Email: "admin.e2e@acme.com" (già esistente)
6. Compila altri campi correttamente
7. Click "Registrati"
   □ POST /api/auth/register → Status 400
   □ Messaggio "Email già registrata"

# STEP 4: Test validazione Tutor
8. Select "Tutor" + lascia campi vuoti
9. Click "Registrati"
   □ Errori specifici per campi Tutor obbligatori
```

### **Test 2.4: Registration Student Success** (10 min)
```bash
# STEP 1: Compila form Student
1. Email: "test.student.new@example.com"
2. Password: "NewPassword123!"
3. Confirm Password: "NewPassword123!"
4. Select: "Student"
5. Click "Registrati"

# STEP 2: Verifica Network
6. DevTools Network:
   □ POST /api/auth/register → Status 201
   □ Response: user created successfully

# STEP 3: Verifica Redirect/Message
7. Verifica comportamento:
   □ Messaggio "Registrazione completata"
   □ Redirect automatico a /login
   □ O auto-login con redirect a /dashboard/student
```

### **Test 2.5: Registration Tutor Success** (5 min)
```bash
# STEP 1: Compila form Tutor completo
1. Email: "test.tutor.new@example.com"
2. Password: "NewPassword123!"
3. Select: "Tutor"
4. Nome: "Mario"
5. Cognome: "Rossi"  
6. Bio: "Insegnante di matematica con 5 anni di esperienza"
7. Materie: ["Matematica", "Fisica"]
8. Click "Registrati"

# STEP 2: Verifica Response
9. Network: □ Status 201
10. Messaggio: □ "Registrazione inviata, in attesa di approvazione admin"
11. Redirect: □ /login con messaggio informativo
```

---

## 🔄 **PASSWORD RESET TESTING** (30 min)

### **Test 3.1: Forgot Password Page** ✅ AGGIORNATO (10 min)
```bash
# STEP 1: Accesso pagina
1. Da /login, click "Password dimenticata?"
2. Verifica redirect: □ /forgot-password
3. Verifica elementi:
   □ Form con campo email (ora leggibile ✅)
   □ Button "Invia reset"
   □ Link "Torna al login"
   □ Messaggio esplicativo

# STEP 2: Test validation
4. Click "Invia" senza email
   □ Errore "Email obbligatoria"
5. Email invalida + click "Invia"  
   □ Errore "Email non valida"
```

### **Test 3.2: Reset Request CON SENDGRID** ✅ AGGIORNATO (15 min)
```bash
# STEP 1: Email esistente (USA LA TUA EMAIL REALE!)
1. Email: "admin.e2e@acme.com" (o la tua email personale)
2. Click "Invia reset"
3. DevTools Network:
   □ POST /api/auth/password-reset-request → Status 200
   □ Response: "If email exists, password reset link sent"

# STEP 2: Verifica UI
4. Messaggio successo:
   □ "Email inviata, controlla la tua casella"
   □ Form disabilitato o nascosto
   □ Link per tornare al login

# STEP 3: CONTROLLA EMAIL REALE ⚠️ IN TESTING
5. Apri la tua casella email
6. Cerca email da: noreply@tutoring-platform.com
7. Subject: "🔑 Reset della tua password - Tutoring Platform"
8. ⚠️ NOTA: SendGrid configurato ma template potrebbe dare Error 400
9. Verifica se email arriva comunque
10. Click sul link nell'email se presente
    □ Dovrebbe aprire: /reset-password?token=REAL_TOKEN

# STEP 4: Email inesistente (per sicurezza)
11. Ricarica pagina
12. Email: "nonexistent@test.com"
13. Click "Invia reset"
    □ Status 200 (stesso messaggio per sicurezza)
    □ Nessuna email inviata realmente
```

### **Test 3.3: Reset Password Page CON TOKEN REALE** ✅ AGGIORNATO (15 min)
```bash
# STEP 1: URL con token reale dall'email
1. Click link dall'email → /reset-password?token=REAL_TOKEN
2. Verifica elementi:
   □ Form nuova password (ora leggibile ✅)
   □ Form conferma password (ora leggibile ✅)
   □ Button "Reimposta password"
   □ Validazione password strength
   □ Password visibility toggles (👁️)

# STEP 2: Test validation
3. Password diverse tra loro:
   □ Password: "NewPass123!"
   □ Confirm: "DifferentPass"
   □ Submit → Errore "Le password non coincidono"

4. Password troppo debole:
   □ Password: "123"
   □ Submit → Errore requisiti password

# STEP 3: Test submit SUCCESS ✅
5. Password corrette:
   □ Password: "NewPassword123!"
   □ Confirm: "NewPassword123!"
   □ Click "Reimposta password"
   □ Network: POST /api/auth/reset-password → Status 200
   □ Success page: "Password successfully reset"
   □ Redirect a /login

# STEP 4: Test login con nuova password
6. Login page:
   □ Email: admin.e2e@acme.com
   □ Password: "NewPassword123!" (la nuova)
   □ Submit → Success login ✅

# STEP 5: Test token riutilizzo (sicurezza)
7. Riprova stesso link reset:
   □ /reset-password?token=SAME_TOKEN
   □ Dovrebbe dare errore "Token già utilizzato"
```

---

## 🔒 **SESSION & SECURITY TESTING** (15 min)

### **Test 4.1: Logout Functionality** (5 min)
```bash
# STEP 1: Login admin
1. Login con admin.e2e@acme.com
2. Verifica presenza dashboard admin

# STEP 2: Logout
3. Click button "Logout" (in header/sidebar)
4. Verifica:
   □ Redirect immediato a /login
   □ localStorage svuotato (token rimossi)
   □ Messaggio "Logout effettuato"
```

### **Test 4.2: Protected Routes** (5 min)
```bash
# STEP 1: Accesso diretto senza login
1. Logout completo
2. Vai direttamente a: /dashboard/admin
3. Verifica: □ Redirect automatico a /login

# STEP 2: Test altre route protette
4. Testa: /dashboard/student
5. Testa: /dashboard/tutor
6. Tutte devono: □ Redirect a /login
```

### **Test 4.3: Token Refresh** (5 min)
```bash
# STEP 1: Sessione lunga
1. Login admin
2. Lascia browser aperto per 10+ minuti
3. Fai un'azione (click su menu)
4. Verifica:
   □ Nessun logout automatico
   □ Token refresh automatico (Network tab)
   □ Sessione mantiene stato

# STEP 2: Token scaduto (simulato)
5. DevTools → Application → Local Storage
6. Modifica manualmente access_token (corrompi)
7. Ricarica pagina
8. Verifica: □ Redirect a /login
```

---

## ✅ **CHECKLIST FINALE GIORNO 1**

### **🎯 Test Completati:**
- [x] **Login Page**: Layout, validation, errori ✅ COMPLETATO
- [x] **Login Success**: Admin, Student, Tutor con redirect corretti ✅ COMPLETATO
- [x] **Registration**: Form completo, validation, role-based fields ✅ COMPLETATO
- [x] **Registration Success**: Student e Tutor con comportamenti diversi ✅ COMPLETATO
- [x] **Bug Fix**: Dashboard Tutor API calls ✅ RISOLTO
- [x] **Protected Routes**: Backend API security ✅ COMPLETATO (401 without token, 200 with token)
- [ ] **Password Reset**: Request e reset page funzionanti ⚠️ SendGrid configurato, in testing
- [ ] **Logout**: Frontend logout button e localStorage cleanup
- [ ] **Token Management**: Refresh e scadenza

### **🐛 Issues da Documentare:**
```bash
# Issues trovati durante testing:
ISSUE #1: Dashboard Tutor - API Calls Failing ✅ RISOLTO
Page: /dashboard/tutor
Steps: 1. Register new tutor 2. Login 3. Redirect to dashboard
Expected: Dashboard loads with widgets showing data
Actual: React errors + CORS errors + 500 Internal Server Error
Priority: Critical - ✅ FIXED
Components: EarningsWidget.tsx, StudentsWidget.tsx
API Calls: GET /api/bookings/completed failing
Error: CORS + 500 Server Error
FIX: Aggiunto metodi mancanti get_completed_bookings e get_completed_bookings_all in BookingService
RESOLUTION: API ora restituisce Status 200 ✅

ISSUE #2: PerformanceMetrics - Null Rating Error ✅ RISOLTO
Page: /dashboard/tutor
Component: PerformanceMetrics.tsx
Steps: Dashboard loads → PerformanceMetrics widget renders
Expected: Rating displays correctly or shows N/A
Actual: TypeError: Cannot read properties of null (reading 'toFixed')
Priority: High - ✅ FIXED
Error: rating.toFixed(1) called on null value
FIX: Added null check in formatRating function
RESOLUTION: Now shows "☆☆☆☆☆ N/A" for null ratings ✅

ISSUE #3: Password Reset Forms - White Text Input ✅ RISOLTO
Pages: /forgot-password, /reset-password
Components: Email input, Password inputs
Steps: Navigate to forms → Type in input fields
Expected: Text should be visible with proper contrast
Actual: Text appears white and unreadable
Priority: Medium - ✅ FIXED
Error: Missing text-foreground and bg-background classes
FIX: Added text-foreground bg-background to input className
RESOLUTION: Text now visible with proper styling ✅
```

### **📊 Success Metrics:**
- **Login Flow**: 100% funzionante per tutti i ruoli
- **Registration**: Form completi e validazione corretta
- **Security**: Route protette e token management
- **UX**: Messaggi errore chiari e redirect appropriati

---

**🎉 GIORNO 1 COMPLETATO!**

**Next**: GIORNO 2 - Student Dashboard Testing

*Tempo stimato completamento: 2 ore*  
*Se completi prima, puoi iniziare il setup per Giorno 2*
