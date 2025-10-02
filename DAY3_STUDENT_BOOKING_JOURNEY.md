# 🎓 **GIORNO 3 - STUDENT BOOKING JOURNEY**

*Workflow completo studente: da pacchetto assegnato a prima lezione*  
*Obiettivo: Testare journey completo studente con dati reali*  
*Tempo: 2.5 ore*

---

## ⏰ **TIMING DETTAGLIATO**
- **Setup & Dashboard Review**: 20 min
- **Package Exploration**: 30 min  
- **First Lesson Booking**: 60 min
- **Lesson Management**: 45 min
- **Materials & Communication**: 35 min

---

## 🚀 **SETUP INIZIALE** (20 min)

### **1. Prerequisites** ✅ FROM DAY 2
```bash
# Student con pacchetto assegnato:
Email: test.student.20250911153849@example.com
Password: Password123!

# Package assignment attivo:
- Nome: "Matematica Intensiva - Mario Rossi"
- Ore rimanenti: 10/10
- Status: Active
- Tutor assegnato: [dal Day 2]
```

### **2. Starting State Verification**
```bash
# STEP 1: Login student
1. Login → /dashboard/student
2. Verifica dashboard popolata (NON più empty state!)
3. Screenshot "Day 3 starting state"

# STEP 2: Widgets check
4. Widget "Pacchetti Attivi":
   □ Mostra pacchetto assegnato ✅
   □ Ore: 10/10 ✅
   □ Progress: 0% ✅
   
5. Widget "Prossime Lezioni":
   □ Empty state: "Nessuna lezione programmata" ✅
   □ Button "Prenota Prima Lezione" ✅
```

### **3. Navigation Overview**
```bash
# STEP 1: Sidebar navigation
1. Verifica tutte le voci sidebar accessibili:
   □ Dashboard ✅
   □ I Miei Pacchetti ✅
   □ Le Mie Lezioni ✅ (ora unificato!)
   □ Calendario ✅
   □ Materiali Didattici ✅
   □ I Miei Tutor ✅

# STEP 2: Quick actions
2. Quick Actions Widget:
   □ "Prenota Lezione" → dovrebbe aprire lessons tab booking ✅
   □ "Vedi Calendario" → /calendar ✅
   □ Altri buttons funzionanti ✅
```

---

## 📦 **PACKAGE EXPLORATION** (30 min)

### **Test 1.1: Package Details Deep Dive** (15 min)
```bash
# STEP 1: Packages page
1. Sidebar → "I Miei Pacchetti"
2. Verifica pacchetto assegnato:
   □ Card completa con tutti i dettagli
   □ Nome: "Matematica Intensiva - Mario Rossi"
   □ Materia: Matematica
   □ Tutor: [Nome tutor dal Day 2]
   □ Ore: 10 totali, 10 rimanenti
   □ Progress bar: 0%
   □ Scadenza: [Data corretta]
   □ Status: "Attivo"

# STEP 2: Package actions
3. Verifica bottoni disponibili:
   □ "Prenota Lezione" → Attivo e funzionante ✅
   □ "Visualizza Storico" → Vuoto ma accessibile ✅
   □ "Contatta Tutor" → Funzionale ✅
```

### **Test 1.2: Package History & Details** (15 min)
```bash
# STEP 1: Package history
1. Click "Visualizza Storico"
2. Verifica empty state appropriato:
   □ "Nessuna lezione completata"
   □ Messaggio incoraggiante
   □ Link per prenotare prima lezione

# STEP 2: Tutor information
3. Verifica info tutor disponibili:
   □ Nome tutor visibile
   □ Materie insegnate
   □ Rating/reviews se presenti
   □ Contatto disponibile
```

---

## 🎯 **FIRST LESSON BOOKING** (60 min)

### **Test 2.1: Booking Interface Access** (15 min)
```bash
# STEP 1: Multiple entry points
1. Dashboard → Widget "Prossime Lezioni" → "Prenota Prima Lezione"
2. Verifica redirect: □ /dashboard/student/lessons?tab=booking ✅

# STEP 2: Lessons page unified
3. Verifica tabs disponibili:
   □ "Prossime Lezioni" (empty state)
   □ "Prenota Nuova" (active tab) ✅
   □ "Storico" (empty state)

# STEP 3: Alternative access
4. Quick Actions → "Prenota Lezione"
5. Packages page → "Prenota Lezione"
6. Tutti dovrebbero portare al tab booking ✅
```

### **Test 2.2: Booking Filters & Search** (20 min)
```bash
# STEP 1: Booking filters
1. Tab "Prenota Nuova" → Sezione filtri:
   □ Dropdown "Materia": Dovrebbe includere "Matematica" ✅
   □ Date picker: Minimo oggi ✅
   □ Button "Cerca Slot" ✅

# STEP 2: Filter functionality
2. Seleziona "Matematica" + data futura
3. Click "Cerca Slot"
4. Verifica chiamata API:
   □ GET /api/slots/available?subject=matematica&date=YYYY-MM-DD
   □ Loading state durante ricerca ✅

# STEP 3: Available slots display
5. Risultati attesi:
   □ Lista slot disponibili del tutor assegnato ✅
   □ Ogni slot card con: data, ora, tutor, materia ✅
   □ Button "Prenota Lezione" per ogni slot ✅
   □ Se nessun slot: Empty state appropriato ✅
```

### **Test 2.3: Slot Booking Process** (25 min)
```bash
# STEP 1: Slot selection
1. Se slot disponibili, click su uno slot
2. Verifica dettagli slot:
   □ Data e ora corrette
   □ Tutor name matching
   □ Materia: Matematica
   □ Location: Online/In-person
   □ Duration: 1-2 ore

# STEP 2: Booking confirmation
3. Click "Prenota Lezione"
4. Verifica processo:
   □ POST /api/bookings/ chiamata
   □ Body include: slot_id, package_purchase_id
   □ Loading state durante submit
   □ Success message al completamento

# STEP 3: Automatic updates
5. Dopo booking success:
   □ Switch automatico a tab "Prossime Lezioni" ✅
   □ Nuova lezione visibile in lista ✅
   □ Widget dashboard aggiornato ✅
   □ Package ore decrementate ✅
```

---

## 📅 **LESSON MANAGEMENT** (45 min)

### **Test 3.1: Upcoming Lessons View** (20 min)
```bash
# STEP 1: Lessons tab
1. Tab "Prossime Lezioni" ora popolato:
   □ Card lezione con tutti i dettagli
   □ Data e ora lezione
   □ Nome tutor
   □ Materia: Matematica
   □ Status: "Confermata" o "In attesa"
   □ Location: Online/In-person

# STEP 2: Lesson actions
2. Verifica bottoni disponibili:
   □ "Entra in Lezione" (se online + orario vicino)
   □ "Dettagli" → Modal con info complete
   □ "Modifica" o "Cancella" se permesso

# STEP 3: Lesson details
3. Click "Dettagli":
   □ Modal con tutte le informazioni
   □ Note lezione se presenti
   □ Link meeting se online
   □ Contatto tutor
```

### **Test 3.2: Calendar Integration** (25 min)
```bash
# STEP 1: Calendar view
1. Sidebar → "Calendario"
2. Verifica lezione prenotata:
   □ Evento visibile nel calendario ✅
   □ Data e ora corrette ✅
   □ Click evento → Dettagli lezione ✅

# STEP 2: Calendar functionality
3. Verifica features calendario:
   □ Navigation mesi funzionante
   □ View modes (mese/settimana/giorno)
   □ Today button
   □ Eventi colorati per status

# STEP 3: Booking from calendar
4. Click su giorno futuro:
   □ Dovrebbe aprire booking interface
   □ O mostrare slot disponibili
   □ Integrazione con lessons page
```

---

## 📚 **MATERIALS & COMMUNICATION** (35 min)

### **Test 4.1: Materials Access** (15 min)
```bash
# STEP 1: Materials page
1. Sidebar → "Materiali Didattici"
2. Verifica accesso Google Drive:
   □ Link "Richiedi Materiale" funzionante ✅ (fixed!)
   □ Apre Google Drive in nuova tab ✅
   □ URL corretto ✅

# STEP 2: Materials organization
3. Verifica organizzazione:
   □ Filtri per materia
   □ Sezione per tutor
   □ Links diretti se configurati
```

### **Test 4.2: Tutor Communication** (20 min)
```bash
# STEP 1: Tutor contact
1. Sidebar → "I Miei Tutor"
2. Verifica tutor assegnato visibile:
   □ Tutor dal pacchetto presente
   □ Info complete: nome, materie, rating
   □ Status: "Disponibile oggi" o simile

# STEP 2: Communication channels
3. Verifica contatto tutor:
   □ Button "Contatta" funzionante
   □ Chat integration se presente
   □ Email/messaging system

# STEP 3: Lesson-specific communication
4. Da lezione prenotata → "Contatta Tutor":
   □ Context-aware messaging
   □ Riferimento alla lezione specifica
   □ Quick actions (conferma, domande, etc.)
```

---

## ✅ **CHECKLIST FINALE GIORNO 3**

### **🎯 Journey Completato:**
- [ ] **Dashboard Populated**: Da empty a ricca di contenuti
- [ ] **Package Exploration**: Dettagli completi e accessibili
- [ ] **First Booking Success**: Lezione prenotata con successo
- [ ] **Lessons Management**: Interface unificata funzionante
- [ ] **Calendar Integration**: Eventi sincronizzati
- [ ] **Materials Access**: Google Drive integration working
- [ ] **Tutor Communication**: Canali di contatto attivi

### **🐛 Issues Tracking:**
```bash
ISSUE #1: Lessons/Booking Page Redundancy ✅ FIXED
Status: Resolved - Pages unified with tabs
Component: /dashboard/student/lessons
Resolution: Integrated booking into lessons with tab system

# Template per nuovi issues:
ISSUE #[N]: [Titolo problema]
Page: /dashboard/student/[page]
Component: [Specifico widget/form]
Steps to reproduce: [Passi dettagliati]
Expected: [Comportamento atteso]  
Actual: [Comportamento reale]
Priority: [Critical/High/Medium/Low]
```

### **📊 Success Metrics:**
- **Booking Completion Rate**: 100% (first lesson booked)
- **Dashboard Engagement**: All widgets now populated
- **Navigation Flow**: Smooth transitions between pages
- **Package Consumption**: Hours correctly decremented (9/10 remaining)

### **🔍 Database State After Day 3:**
```bash
# Stato atteso database:
- Bookings: 1 record (upcoming lesson)
- AdminPackageAssignment: hours_used = 1, hours_remaining = 9
- Student engagement: First lesson scheduled
- Ready for Day 4: Tutor perspective
```

### **📱 Student Experience Summary:**
```bash
# Before Day 2: Empty dashboard, no packages
# After Day 2: Package assigned, dashboard populated
# After Day 3: First lesson booked, full engagement active

TRANSFORMATION COMPLETE! 🎉
Student now has:
✅ Active package with 9/10 hours
✅ Upcoming lesson scheduled  
✅ Access to all platform features
✅ Real data in every widget
✅ Working communication channels
```

---

**🎉 GIORNO 3 COMPLETATO!**

**Next**: GIORNO 4 - Tutor Perspective & Package Management

*Il focus sarà su come il tutor gestisce richieste e disponibilità*

*Tempo stimato: 2 ore*
