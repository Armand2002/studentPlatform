# 👨‍🎓 **GIORNO 2 - STUDENT DASHBOARD TESTING**

*Test dettagliato dashboard studente - 2.5 ore totali*  
*Backend APIs: ✅ 100% Funzionanti*

---

## ⏰ **TIMING DETTAGLIATO**
- **Setup & Login**: 15 min
- **Main Dashboard**: 45 min  
- **Packages Page**: 45 min
- **Calendar & Booking**: 45 min
- **Lessons History**: 30 min
- **Profile & Settings**: 15 min

---

## 🚀 **SETUP INIZIALE** (15 min)

### **1. Preparazione Test Data** ✅ READY
```bash
# Credenziali student VERIFICATE:
Email: test.student.20250911153849@example.com
Password: Password123!

# Status Backend APIs:
✅ Packages Purchases: 0 items (empty state perfect)
✅ Available Packages: 13 items (catalog ready) 
✅ User Profile: Working
✅ All Bookings: 0 items (empty state perfect)
✅ Completed Bookings: 0 items (empty state perfect)
```

### **2. Login Student**
```bash
# STEP 1: Login
1. Vai a http://localhost:3000/login
2. Login con credenziali student
3. Verifica redirect: □ /dashboard/student
4. DevTools: □ localStorage contiene user.role = "student"
```

### **3. Verifica API Backend**
```bash
# Test rapido API endpoints:
curl -H "Authorization: Bearer [token]" http://localhost:8000/api/packages/purchases
curl -H "Authorization: Bearer [token]" http://localhost:8000/api/bookings/
curl -H "Authorization: Bearer [token]" http://localhost:8000/api/users/me/student

# Expected: Status 200 per tutti
```

---

## 🏠 **MAIN DASHBOARD TESTING** (45 min)

### **Test 1.1: Dashboard Layout** (15 min)
```bash
# STEP 1: Verifica struttura pagina
1. URL: /dashboard/student
2. Header/Navigation:
   □ Logo piattaforma
   □ Navigation menu (Dashboard, Pacchetti, Calendario, Lezioni)
   □ User dropdown con nome/email
   □ Logout button
   □ Background blu (design system)

# STEP 2: Main content area
3. Verifica widgets principali:
   □ Widget "Pacchetti Attivi"
   □ Widget "Prossime Lezioni"  
   □ Widget "Calendario Mensile"
   □ Widget "Statistiche Studio"
   □ Quick Actions panel
   □ Layout responsive (grid o flex)

# STEP 3: DevTools check
4. Console: □ Nessun errore JavaScript
5. Network: □ Chiamate API completate
6. Performance: □ Caricamento < 3 secondi
```

### **Test 1.2: Widget Pacchetti Attivi** (10 min)
```bash
# STEP 1: Widget vuoto (nuovo student)
1. Verifica widget "Pacchetti Attivi":
   □ Titolo "I Tuoi Pacchetti Attivi"
   □ Empty state: "Nessun pacchetto attivo"
   □ Button "Acquista Primo Pacchetto"
   □ Icona appropriata (📦)

# STEP 2: Dati dinamici
2. DevTools Network: 
   □ GET /api/packages/purchases chiamata
   □ Response: [] (array vuoto normale per nuovo utente)
   □ Widget mostra empty state correttamente

# STEP 3: Click actions
3. Click "Acquista Primo Pacchetto":
   □ Redirect a pagina acquisto pacchetti
   □ O modal selezione pacchetti
```

### **Test 1.3: Widget Prossime Lezioni** (10 min)
```bash
# STEP 1: Widget vuoto
1. Verifica widget "Prossime Lezioni":
   □ Titolo "Prossime Lezioni"
   □ Empty state: "Nessuna lezione programmata"
   □ Button "Prenota Lezione"
   □ Icona calendario (📅)

# STEP 2: API call
2. DevTools Network:
   □ GET /api/bookings/upcoming chiamata
   □ Response: [] (vuoto normale)
   □ Loading state durante fetch

# STEP 3: Quick action
3. Click "Prenota Lezione":
   □ Redirect a /dashboard/student/calendar
   □ O modal prenotazione rapida
```

### **Test 1.4: Widget Calendario & Statistiche** (10 min)
```bash
# STEP 1: Calendario widget
1. Verifica calendario mensile:
   □ Mese corrente visualizzato
   □ Navigation frecce mese precedente/successivo
   □ Giorni della settimana corretti
   □ Oggi evidenziato
   □ Eventi/lezioni evidenziate (se presenti)

# STEP 2: Statistiche widget
2. Verifica statistiche studio:
   □ "Ore Completate": 0 (nuovo utente)
   □ "Progresso Studio": 0%
   □ "Lezioni Totali": 0
   □ Chart/progress bar visibile
   □ Icone appropriate

# STEP 3: Interazioni
3. Click frecce calendario: □ Cambio mese funzionante
4. Hover statistiche: □ Tooltip con dettagli
```

---

## 📦 **PACKAGES PAGE TESTING** (45 min)

### **Test 2.1: Navigation & Page Load** (10 min)
```bash
# STEP 1: Navigation
1. Da dashboard, click "Pacchetti" nel menu
2. Verifica URL: □ /dashboard/student/packages
3. Breadcrumb: □ Dashboard > Pacchetti

# STEP 2: Page structure
4. Verifica elementi pagina:
   □ Titolo "I Tuoi Pacchetti"
   □ Tabs: "Attivi", "Completati", "Scaduti"
   □ Search bar
   □ Filtri: Materia, Tutor, Stato
   □ Button "Acquista Nuovo Pacchetto"

# STEP 3: API calls
5. DevTools Network:
   □ GET /api/packages/purchases (tutti i pacchetti)
   □ GET /api/packages/ (disponibili per acquisto)
   □ Response status 200
```

### **Test 2.2: Empty States** (10 min)
```bash
# STEP 1: Tab "Attivi" vuoto
1. Tab "Attivi" selezionato di default
2. Verifica empty state:
   □ Icona pacchetto grande
   □ Messaggio "Non hai pacchetti attivi"
   □ Sottomessaggio esplicativo
   □ Button "Acquista il tuo primo pacchetto"

# STEP 2: Altri tabs vuoti
3. Click tab "Completati":
   □ Empty state diverso: "Nessun pacchetto completato"
4. Click tab "Scaduti":
   □ Empty state: "Nessun pacchetto scaduto"

# STEP 3: Actions
5. Click button acquisto da empty state:
   □ Redirect a catalogo pacchetti
   □ O modal selezione
```

### **Test 2.3: Filters & Search** (15 min)
```bash
# STEP 1: Search functionality
1. Search bar placeholder: "Cerca per nome pacchetto o tutor"
2. Type "Matematica":
   □ Filtro real-time o con debounce
   □ Results aggiornati (vuoti se nessun match)
   □ Clear search button (X)

# STEP 2: Filtro Materia
3. Dropdown "Tutte le Materie":
   □ Lista materie disponibili
   □ Select "Matematica"
   □ Filtro applicato (badge visibile)
   □ Clear filter option

# STEP 3: Filtro Tutor
4. Dropdown "Tutti i Tutor":
   □ Lista tutor disponibili
   □ Multi-select o single-select
   □ Filtro applicato correttamente

# STEP 4: Combinazione filtri
5. Applica filtro Materia + Search:
   □ Filtri combinati funzionanti
   □ Count risultati aggiornato
   □ "Clear all filters" button
```

### **Test 2.4: Package Actions** (10 min)
```bash
# STEP 1: Acquisto nuovo pacchetto
1. Click "Acquista Nuovo Pacchetto"
2. Verifica comportamento:
   □ Modal con lista pacchetti disponibili
   □ O redirect a pagina catalogo
   □ Prezzi e dettagli visibili

# STEP 2: Package details (se presenti)
3. Se ci sono pacchetti, verifica card:
   □ Nome pacchetto e materia
   □ Nome tutor con foto
   □ Progress bar ore utilizzate/totali
   □ Data scadenza
   □ Button "Dettagli" o "Prenota Lezione"

# STEP 3: Package modal/details
4. Click su pacchetto o "Dettagli":
   □ Modal con info complete
   □ Ore rimanenti, cronologia lezioni
   □ Link contatto tutor
   □ Button "Prenota Lezione"
```

---

## 📅 **CALENDAR & BOOKING TESTING** (45 min)

### **Test 3.1: Calendar Page Load** (10 min)
```bash
# STEP 1: Navigation
1. Click "Calendario" nel menu
2. Verifica URL: □ /dashboard/student/calendar
3. Page load: □ < 3 secondi

# STEP 2: Calendar structure
4. Verifica elementi:
   □ Calendar view (mensile di default)
   □ Navigation: precedente/successivo mese
   □ View toggles: Mese/Settimana/Giorno
   □ Today button
   □ Legend colori (disponibile/occupato/prenotato)

# STEP 3: Initial state
5. Mese corrente mostrato
6. Oggi evidenziato
7. Nessun evento (nuovo utente)
```

### **Test 3.2: Calendar Navigation** (10 min)
```bash
# STEP 1: Month navigation
1. Click freccia "mese precedente":
   □ Calendario aggiornato
   □ Header mese/anno corretto
   □ URL updated (se usa query params)

2. Click freccia "mese successivo":
   □ Navigazione corretta
   □ Dati aggiornati

# STEP 2: View switching
3. Click "Settimana":
   □ Vista settimanale
   □ Layout diverso
   □ Navigation adattata

4. Click "Giorno":
   □ Vista giornaliera
   □ Slot orari visibili
   □ Navigation per giorni

# STEP 3: Today button
5. Naviga a mese diverso + click "Oggi":
   □ Ritorno a oggi
   □ Vista appropriata
```

### **Test 3.3: Slot Availability** (15 min)
```bash
# STEP 1: Day click (senza pacchetti)
1. Click su giorno futuro
2. Verifica comportamento:
   □ Modal "Nessun pacchetto attivo"
   □ Messaggio "Acquista un pacchetto per prenotare"
   □ Button redirect acquisto

# STEP 2: Slot display (simulato)
3. Se hai pacchetti o vuoi testare:
   □ Slot disponibili evidenziati
   □ Slot occupati diversamente colorati
   □ Tooltip con info tutor/materia

# STEP 3: API calls
4. DevTools Network per day click:
   □ GET /api/slots/available?date=YYYY-MM-DD
   □ Response: [] o slot disponibili
   □ Loading indicator durante fetch
```

### **Test 3.4: Booking Flow** (10 min)
```bash
# STEP 1: Slot selection (se disponibili)
1. Click su slot disponibile
2. Modal prenotazione:
   □ Dettagli slot (data, ora, tutor)
   □ Selezione pacchetto (dropdown)
   □ Calcolo prezzo automatico
   □ Button "Conferma Prenotazione"

# STEP 2: Booking confirmation
3. Compila form + click "Conferma":
   □ POST /api/bookings/ chiamata
   □ Loading state durante submit
   □ Success: modal conferma + calendar update
   □ Error: messaggio appropriato

# STEP 3: Calendar update
4. Dopo prenotazione:
   □ Slot cambia colore (prenotato)
   □ Event visibile nel calendario
   □ Tooltip aggiornato
```

---

## 📚 **LESSONS HISTORY TESTING** (30 min)

### **Test 4.1: Lessons Page** (10 min)
```bash
# STEP 1: Navigation
1. Click "Lezioni" nel menu
2. URL: □ /dashboard/student/lessons
3. Page structure:
   □ Tabs: "Prossime", "Completate", "Cancellate"
   □ Search e filtri
   □ Lista lezioni o empty state

# STEP 2: API calls
4. DevTools Network:
   □ GET /api/bookings/upcoming
   □ GET /api/bookings/completed
   □ Response status 200
```

### **Test 4.2: Lessons List** (10 min)
```bash
# STEP 1: Empty states
1. Tab "Prossime" (nuovo utente):
   □ Empty state: "Nessuna lezione programmata"
   □ Button "Prenota Prima Lezione"
   □ Icona appropriata

2. Tab "Completate":
   □ Empty state: "Nessuna lezione completata"

# STEP 2: Lesson cards (se presenti)
3. Struttura card lezione:
   □ Data e ora lezione
   □ Nome tutor + foto
   □ Materia e argomenti
   □ Status (confermata/pending)
   □ Actions (conferma/modifica/cancella)
```

### **Test 4.3: Lesson Actions** (10 min)
```bash
# STEP 1: Lesson details
1. Click su lezione (se presente):
   □ Modal dettagli completi
   □ Info tutor, materia, note
   □ Link materiali didattici
   □ Cronologia comunicazioni

# STEP 2: Actions disponibili
2. Verifica actions:
   □ "Conferma Partecipazione"
   □ "Richiedi Riprogrammazione"
   □ "Cancella Lezione"
   □ "Contatta Tutor"

# STEP 3: Search e filtri
3. Search lessons:
   □ Ricerca per tutor nome
   □ Filtro per materia
   □ Filtro per data range
```

---

## ⚙️ **PROFILE & SETTINGS TESTING** (15 min)

### **Test 5.1: Profile Access** (5 min)
```bash
# STEP 1: User dropdown
1. Click user avatar/nome in header
2. Dropdown menu:
   □ "Il Mio Profilo"
   □ "Impostazioni"
   □ "Logout"

# STEP 2: Profile page
3. Click "Il Mio Profilo":
   □ URL: /dashboard/student/profile
   □ Form dati personali
   □ Avatar/foto profilo
```

### **Test 5.2: Profile Data** (10 min)
```bash
# STEP 1: Profile form
1. Verifica campi:
   □ Email (readonly)
   □ Nome, Cognome
   □ Telefono
   □ Data nascita
   □ Indirizzo
   □ Preferenze studio

# STEP 2: Edit profile
2. Modifica dati + click "Salva":
   □ PUT /api/users/me/student chiamata
   □ Loading state
   □ Success message
   □ Dati aggiornati in header

# STEP 3: Settings page
3. Click "Impostazioni":
   □ Notifiche email toggle
   □ Notifiche push toggle
   □ Privacy settings
   □ Change password form
```

---

## ✅ **CHECKLIST FINALE GIORNO 2**

### **🎯 Test Completati:**
- [ ] **Main Dashboard**: Layout, widgets, API calls, empty states
- [ ] **Packages Page**: Navigation, filtri, search, empty states
- [ ] **Calendar**: Navigation, views, slot display, booking flow
- [ ] **Lessons**: Lista, filtri, actions, empty states
- [ ] **Profile**: Dati utente, modifica, impostazioni
- [ ] **Navigation**: Menu, breadcrumb, routing
- [ ] **API Integration**: Tutte le chiamate backend funzionanti
- [ ] **UX Flow**: Onboarding nuovo utente, empty states

### **🐛 Issues Tracking:**
```bash
ISSUE #1: Richiedi Materiale Button - Missing Google Drive Redirect ✅ FIXED
Page: /dashboard/student (QuickActionsWidget)
Component: "Richiedi Materiale" button in Quick Actions
Steps to reproduce: 1. Login studente 2. Dashboard principale 3. Click "Richiedi Materiale"
Expected: Redirect to Google Drive materials folder
Actual: Tries to navigate to /dashboard/student/materials/request (page doesn't exist)
Priority: Medium
API Status: N/A (frontend routing issue)
RESOLUTION: Updated href to Google Drive URL + added external link handling ✅

ISSUE #2: Materials Page - Button Not Functional ✅ FIXED
Page: /dashboard/student/materials
Component: "Richiedi Materiale" button in header
Steps to reproduce: 1. Navigate to /materials 2. Click "Richiedi Materiale" button
Expected: Redirect to Google Drive or open request modal
Actual: Button has no onClick/href configured - does nothing
Priority: Medium
API Status: N/A (frontend configuration issue)
RESOLUTION: Added onClick handler to open Google Drive URL ✅

ISSUE #3: MaterialLinksWidget - Button Not Functional ✅ FIXED
Page: Various (widget component)
Component: "Richiedi Materiale" button in MaterialLinksWidget
Expected: Redirect to Google Drive materials folder
Actual: Button had no onClick handler
RESOLUTION: Added onClick handler to open Google Drive URL ✅

ISSUE #4: Sidebar Double Selection - Dashboard Always Active ✅ FIXED
Page: All /dashboard/student/* pages
Component: DashboardSidebar navigation
Steps to reproduce: 1. Login studente 2. Navigate to any subpage (packages, calendar, etc.)
Expected: Only current page should be highlighted in sidebar
Actual: Both "Dashboard" and current page are highlighted (double selection)
Priority: Medium - UX issue
API Status: N/A (frontend logic issue)
RESOLUTION: Modified isActive logic - Dashboard only active on exact match ✅

# Template per altri issues:
ISSUE #[N]: [Titolo problema]
Page: /dashboard/student/[page]
Component: [Widget/Form/Button specifico]
Steps to reproduce: [Passi dettagliati]
Expected: [Comportamento atteso]  
Actual: [Comportamento reale]
Priority: [Critical/High/Medium/Low]
API Status: [Working/Broken] (se relativo ad API)
```

### **📊 Success Metrics:**
- **Page Load**: Tutte le pagine < 3 secondi
- **API Integration**: 100% chiamate backend funzionanti
- **Empty States**: UX appropriata per nuovo utente
- **Navigation**: Routing e menu completamente funzionali
- **Responsive**: Layout corretto su desktop

### **🔍 Performance Notes:**
```bash
# DevTools Performance tab:
- Initial bundle size: [XX] MB
- API response times: [XX] ms average
- Re-render count: [normale/eccessivo]
- Memory usage: [stabile/leak]
```

---

**🎉 GIORNO 2 COMPLETATO!**

**Next**: GIORNO 3 - Tutor Dashboard Testing

*Il focus sarà su dashboard tutor, package requests, availability management*

*Tempo stimato: 2 ore*
