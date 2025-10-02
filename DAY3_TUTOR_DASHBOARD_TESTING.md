# 👨‍🏫 **GIORNO 3 - TUTOR DASHBOARD TESTING**

*Test dettagliato dashboard tutor - 2 ore totali*  
*Backend APIs: ✅ 100% Funzionanti*

---

## ⏰ **TIMING DETTAGLIATO**
- **Setup & Login**: 15 min
- **Main Dashboard & Analytics**: 45 min  
- **Package Request System**: 30 min
- **Availability Management**: 45 min
- **Student Management**: 15 min

---

## 🚀 **SETUP INIZIALE** (15 min)

### **1. Preparazione Test Data**
```bash
# Credenziali tutor validate:
Email: test.tutor.20250911154125@example.com
Password: [dalla registrazione precedente]

# Se non hai credenziali, crea nuovo tutor:
POST /api/auth/register
{
  "email": "test.tutor.day3@example.com", 
  "password": "TutorTest123!",
  "role": "tutor",
  "first_name": "Mario",
  "last_name": "Rossi",
  "bio": "Insegnante matematica",
  "subjects": ["Matematica", "Fisica"]
}
```

### **2. Login Tutor**
```bash
# STEP 1: Login
1. Vai a http://localhost:3000/login
2. Login con credenziali tutor
3. Verifica redirect: □ /dashboard/tutor
4. DevTools: □ localStorage user.role = "tutor"
```

### **3. Verifica API Backend**
```bash
# Test rapido endpoints tutor:
curl -H "Authorization: Bearer [token]" http://localhost:8000/api/dashboard/tutor-performance
curl -H "Authorization: Bearer [token]" http://localhost:8000/api/users/me/tutor
curl -H "Authorization: Bearer [token]" http://localhost:8000/api/packages/requests

# Expected: Status 200 per tutti
```

---

## 📊 **MAIN DASHBOARD & ANALYTICS** (45 min)

### **Test 1.1: Dashboard Layout** (15 min)
```bash
# STEP 1: Page structure
1. URL: /dashboard/tutor
2. Header/Navigation:
   □ Logo e branding
   □ Menu: Dashboard, Studenti, Calendario, Disponibilità
   □ User dropdown con nome tutor
   □ Notifications bell icon
   □ Background blu design system

# STEP 2: Main content layout
3. Verifica sezioni principali:
   □ KPI Cards row (4-5 cards)
   □ Revenue Chart section
   □ Recent Activity widget
   □ Quick Actions panel
   □ Student List preview
   □ Calendar widget integrato

# STEP 3: DevTools check
4. Console: □ Nessun errore JavaScript
5. Network: □ Multiple API calls completate
6. Performance: □ Dashboard load < 3 secondi
```

### **Test 1.2: KPI Cards** (15 min)
```bash
# STEP 1: Performance KPIs
1. Verifica KPI cards:
   □ "Lezioni Totali": Numero + trend (↑↓)
   □ "Rating Medio": Stelle + punteggio numerico
   □ "Ore Insegnate": Totale ore + questo mese
   □ "Studenti Attivi": Count + nuovi questo mese
   □ "Guadagni Mese": Importo + % crescita

# STEP 2: API data loading
2. DevTools Network:
   □ GET /api/dashboard/tutor-performance chiamata
   □ Response con dati KPI
   □ Loading skeleton durante fetch

# STEP 3: Interactive elements
3. Hover su cards:
   □ Tooltip con dettagli aggiuntivi
   □ Click card → drill-down o modal dettagli
   □ Trend indicators funzionanti
```

### **Test 1.3: Revenue Chart** (15 min)
```bash
# STEP 1: Chart rendering
1. Verifica chart principale:
   □ Chart.js o library simile caricata
   □ Asse X: mesi/settimane
   □ Asse Y: importi euro
   □ Linea/barre revenue trend
   □ Colori coerenti design system

# STEP 2: Chart interactions
2. Interazioni chart:
   □ Toggle "Weekly/Monthly" funzionante
   □ Hover datapoints → tooltip dettagli
   □ Zoom in/out (se supportato)
   □ Legend clickable per hide/show series

# STEP 3: Data accuracy
3. DevTools Network:
   □ API call per revenue data
   □ Response format corretto
   □ Chart aggiornato con dati reali
   □ Empty state se nessun dato
```

---

## 📦 **PACKAGE REQUEST SYSTEM** (30 min)

### **Test 2.1: Package Request Widget** (10 min)
```bash
# STEP 1: Widget location
1. Nel dashboard principale, trova:
   □ Widget "Richieste Pacchetti"
   □ O sezione "Package Requests"
   □ Button "Richiedi Nuovo Pacchetto"

# STEP 2: Widget content
2. Verifica contenuto:
   □ Lista richieste recenti (se presenti)
   □ Status badges (Pending/Approved/Rejected)
   □ Quick stats: "3 pending, 2 approved"
   □ Link "Vedi tutte le richieste"
```

### **Test 2.2: New Package Request Form** (15 min)
```bash
# STEP 1: Open form
1. Click "Richiedi Nuovo Pacchetto"
2. Verifica apertura:
   □ Modal form O redirect a pagina dedicata
   □ Form title "Richiesta Nuovo Pacchetto"

# STEP 2: Form fields
3. Verifica campi form:
   □ "Nome Pacchetto" (text input)
   □ "Materia" (dropdown o select)
   □ "Numero Ore" (number input)
   □ "Prezzo Proposto" (currency input)
   □ "Descrizione" (textarea)
   □ "Note per Admin" (textarea opzionale)

# STEP 3: Form validation
4. Test validation:
   □ Submit form vuoto → errori appropriati
   □ Campo ore: solo numeri positivi
   □ Campo prezzo: formato currency
   □ Descrizione: min/max length
```

### **Test 2.3: Submit Package Request** (5 min)
```bash
# STEP 1: Valid submission
1. Compila form completo:
   - Nome: "Matematica Avanzata"
   - Materia: "Matematica"  
   - Ore: 10
   - Prezzo: 250
   - Descrizione: "Pacchetto per studenti universitari"

# STEP 2: Submit process
2. Click "Invia Richiesta":
   □ POST /api/packages/request chiamata
   □ Loading state durante submit
   □ Success: messaggio conferma
   □ Form reset o modal close

# STEP 3: Request tracking
3. Verifica post-submit:
   □ Nuova richiesta in widget dashboard
   □ Status "Pending" corretto
   □ Email notifica admin (se configurato)
```

---

## 📅 **AVAILABILITY MANAGEMENT** (45 min)

### **Test 3.1: Availability Page** (15 min)
```bash
# STEP 1: Navigation
1. Click "Disponibilità" nel menu
2. URL: □ /dashboard/tutor/availability
3. Page structure:
   □ Calendar view principale
   □ Sidebar con form "Aggiungi Slot"
   □ Lista slot esistenti
   □ Bulk actions toolbar

# STEP 2: Calendar display
4. Verifica calendario:
   □ Vista settimanale di default
   □ Slot esistenti evidenziati
   □ Slot disponibili vs occupati
   □ Navigation settimane precedenti/successive
```

### **Test 3.2: Single Slot Creation** (15 min)
```bash
# STEP 1: Add slot form
1. Sidebar "Aggiungi Slot":
   □ Date picker
   □ Start time picker
   □ End time picker  
   □ Repeat options (opzionale)
   □ Button "Aggiungi Slot"

# STEP 2: Form validation
2. Test validation:
   □ Data passata → errore
   □ End time < start time → errore
   □ Slot sovrapposto → warning/errore
   □ Weekend handling (se configurato)

# STEP 3: Successful creation
3. Compila form valido + submit:
   □ POST /api/slots/ chiamata
   □ Response 201 success
   □ Calendar aggiornato immediatamente
   □ Nuovo slot visibile
```

### **Test 3.3: Bulk Slot Creation** (10 min)
```bash
# STEP 1: Bulk creation form
1. Button "Crea Slot Multipli":
   □ Modal con form avanzato
   □ Date range picker (da/a)
   □ Time slots (es. 9:00-17:00)
   □ Days of week checkboxes
   □ Duration per slot (es. 1h)

# STEP 2: Bulk submit
2. Configurazione esempio:
   - Date: Prossima settimana
   - Time: 14:00-18:00
   - Days: Lun, Mer, Ven
   - Duration: 1 ora
   
3. Submit:
   □ POST /api/slots/multiple chiamata
   □ Progress indicator per bulk operation
   □ Success: "12 slot creati"
```

### **Test 3.4: Slot Management** (5 min)
```bash
# STEP 1: Existing slots
1. Lista slot esistenti:
   □ Data e ora
   □ Status (Available/Booked/Blocked)
   □ Student name (se prenotato)
   □ Actions: Edit, Delete

# STEP 2: Slot actions
2. Click "Edit" su slot:
   □ Modal modifica
   □ Campi pre-popolati
   □ Save changes funzionante

3. Click "Delete":
   □ Conferma deletion
   □ Warning se slot prenotato
   □ Removal da calendario
```

---

## 👥 **STUDENT MANAGEMENT** (15 min)

### **Test 4.1: Students Overview** (10 min)
```bash
# STEP 1: Students page/widget
1. Sezione "I Miei Studenti":
   □ Lista studenti assegnati
   □ Info: nome, pacchetti attivi, prossime lezioni
   □ Progress tracking per studente
   □ Contact actions

# STEP 2: Student details
2. Click su studente:
   □ Modal o pagina dettagli
   □ Cronologia lezioni
   □ Performance metrics
   □ Note private tutor
   □ Comunicazioni history
```

### **Test 4.2: Student Communication** (5 min)
```bash
# STEP 1: Contact student
1. Button "Contatta" studente:
   □ Modal form messaggio
   □ O redirect a sistema messaggi
   □ Template messaggi predefiniti

# STEP 2: Lesson notes
2. Sezione note lezioni:
   □ Add note dopo lezione
   □ Private notes (solo tutor)
   □ Shared notes (visibili a studente)
```

---

## ✅ **CHECKLIST FINALE GIORNO 3**

### **🎯 Test Completati:**
- [ ] **Dashboard Layout**: Header, navigation, widgets, responsive
- [ ] **KPI Cards**: Dati corretti, loading states, interactions
- [ ] **Revenue Chart**: Rendering, interactions, data accuracy
- [ ] **Package Requests**: Form, validation, submission, tracking
- [ ] **Availability Calendar**: Display, navigation, slot visualization
- [ ] **Slot Creation**: Single e bulk creation, validation
- [ ] **Slot Management**: Edit, delete, status management
- [ ] **Student Management**: Lista, dettagli, comunicazione
- [ ] **API Integration**: Tutte chiamate backend funzionanti
- [ ] **Real-time Updates**: Dashboard metrics, calendar updates

### **🐛 Issues Tracking:**
```bash
# Template per issues:
ISSUE #[N]: [Problema specifico]
Page: /dashboard/tutor/[page]
Component: [Widget/Chart/Form specifico]
User Flow: [Sequenza azioni che causa problema]
Expected: [Comportamento atteso]
Actual: [Comportamento reale]
Priority: [Critical/High/Medium/Low]
Backend API: [Working/Broken] (se applicabile)
```

### **📊 Success Metrics:**
- **Dashboard Performance**: Load time < 3s, smooth interactions
- **Charts Functionality**: Rendering corretto, interactions responsive
- **Form Workflows**: Validation, submission, feedback appropriati
- **Calendar UX**: Navigation fluida, slot management intuitivo
- **Data Accuracy**: KPI corretti, revenue data precisi
- **Mobile Responsiveness**: Layout adattato (test preliminare)

### **🔍 Performance Notes:**
```bash
# DevTools observations:
- Chart rendering time: [XX] ms
- API response times: [XX] ms average
- Calendar re-render performance: [smooth/laggy]
- Form submission feedback: [immediate/delayed]
- Memory usage patterns: [stable/increasing]
```

### **📈 Tutor-Specific Features:**
- [ ] **Package Request System**: Workflow completo funzionante
- [ ] **Revenue Analytics**: Chart accurati e interattivi  
- [ ] **Availability Management**: Creazione e gestione slot
- [ ] **Student Relationship**: Tracking e comunicazione
- [ ] **Performance Metrics**: KPI realistici e aggiornati

---

**🎉 GIORNO 3 COMPLETATO!**

**Next**: GIORNO 4 - Admin Dashboard Testing  

*Focus: User management, package approvals, lesson management, advanced analytics*

*Tempo stimato: 2.5 ore (più complesso per features admin)*

### **📝 Notes per Giorno 4:**
- Admin ha più features critiche
- Package approval workflow da testare attentamente  
- Lesson management (nuovo) da validare completamente
- User management CRUD operations
- Advanced analytics e reports
