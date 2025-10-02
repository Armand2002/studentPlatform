# 🏗️ **GIORNO 2 - FIRST USER JOURNEY**

*Workflow completo nuovo utente - Da empty state a primo acquisto*  
*Obiettivo: Popolare database e testare journey naturale*  
*Tempo: 3 ore*

---

## ⏰ **TIMING DETTAGLIATO**
- **Setup & Orientamento**: 20 min
- **Package Discovery & Selection**: 45 min  
- **Purchase Workflow**: 60 min
- **First Booking**: 45 min
- **Dashboard Popolata**: 30 min

---

## 🚀 **SETUP INIZIALE** (20 min)

### **1. Credenziali Test** ✅ READY
```bash
# Student già verificato:
Email: test.student.20250911153849@example.com
Password: Password123!

# Status verificato:
✅ Login funzionante
✅ API tutte operative
✅ Dashboard carica correttamente
```

### **2. Starting State Verification**
```bash
# STEP 1: Login e verifica empty state
1. Login → /dashboard/student
2. Verifica widgets vuoti:
   □ "Nessun pacchetto attivo" 
   □ "Nessuna lezione programmata"
   □ Statistiche a 0
   □ Calendario vuoto

# STEP 2: Questo è il punto di partenza perfetto!
3. Screenshot "before" per confronto finale
```

---

## 📦 **PACKAGE DISCOVERY JOURNEY** (45 min)

### **Test 1.1: Package Exploration** (20 min)
```bash
# STEP 1: Scoperta naturale pacchetti
1. Dashboard → Widget "Pacchetti Attivi" → Click "Acquista Primo Pacchetto"
2. Verifica redirect: □ Dove porta? /packages? /catalog?
3. Alternative navigation:
   - Sidebar → "I Miei Pacchetti" 
   - Quick Actions → "Acquista Pacchetto"

# STEP 2: Catalog/Packages page
4. Verifica elementi:
   □ Lista pacchetti disponibili (dovrebbero essere 13 dal test API)
   □ Prezzi e dettagli visibili
   □ Filtri per materia/tutor
   □ Descrizioni chiare
   □ Call-to-action evidenti

# STEP 3: Package details
5. Click su un pacchetto specifico:
   □ Modal/page dettagli
   □ Info complete (ore, prezzo, tutor, materie)
   □ Reviews/rating se presenti
   □ Button "Acquista" prominente
```

### **Test 1.2: Package Selection Process** (15 min)
```bash
# STEP 1: Comparison shopping
1. Confronta almeno 3 pacchetti diversi:
   □ Diversi prezzi
   □ Diverse materie  
   □ Diversi tutor
   □ Diverse durate

# STEP 2: Decision factors
2. Verifica info utili per decisione:
   □ Rapporto qualità/prezzo chiaro
   □ Disponibilità tutor
   □ Materie incluse
   □ Termini e condizioni

# STEP 3: Final selection
3. Seleziona 1 pacchetto per acquisto
   □ Motivazione: [documenta perché questo]
   □ Prezzo: [annota per tracking]
   □ Tutor: [nome per follow-up]
```

### **Test 1.3: Pre-Purchase UX** (10 min)
```bash
# STEP 1: Purchase intent
1. Click "Acquista" sul pacchetto scelto
2. Cosa succede?
   □ Redirect a checkout
   □ Modal conferma
   □ Login required check
   □ Form payment

# STEP 2: Information clarity
3. Prima del pagamento, verifica:
   □ Riepilogo ordine chiaro
   □ Prezzo finale evidente
   □ Termini di utilizzo
   □ Policy cancellazione
```

---

## 💳 **PURCHASE WORKFLOW** (60 min)

### **Test 2.1: Payment Flow** (30 min)
```bash
# STEP 1: Payment method selection
1. Opzioni pagamento disponibili:
   □ Carta di credito
   □ PayPal
   □ Stripe integration
   □ Altri metodi

# STEP 2: Form compilation
2. Compila dati pagamento:
   - Usa dati test Stripe se disponibile
   - Carta test: 4242 4242 4242 4242
   - CVV: 123, Data: 12/25
   
# STEP 3: Validation & Security
3. Verifica sicurezza:
   □ Form validation
   □ Error handling
   □ SSL indicators
   □ Loading states

# STEP 4: Transaction completion
4. Submit pagamento:
   □ Loading indicator
   □ Success/failure feedback
   □ Transaction ID se success
   □ Email confirmation trigger
```

### **Test 2.2: Post-Purchase Experience** (20 min)
```bash
# STEP 1: Success page
1. Dopo pagamento riuscito:
   □ Success page/modal
   □ Riepilogo acquisto
   □ Prossimi passi chiari
   □ Link alla dashboard

# STEP 2: Database update verification
2. Torna alla dashboard:
   □ Widget "Pacchetti Attivi" aggiornato
   □ Nuovo pacchetto visibile
   □ Ore disponibili mostrate
   □ Status corretto

# STEP 3: Navigation post-purchase
3. Esplora opzioni disponibili:
   □ "Prenota Prima Lezione" button
   □ Dettagli pacchetto acquistato
   □ Contatto tutor disponibile
```

### **Test 2.3: Purchase Failure Scenarios** (10 min)
```bash
# STEP 1: Invalid payment test
1. Testa carta rifiutata: 4000 0000 0000 0002
   □ Error message appropriato
   □ Retry option disponibile
   □ No partial charges

# STEP 2: Network issues simulation
2. Testa interruzione connessione:
   □ Timeout handling
   □ Recovery options
   □ State preservation
```

---

## 📅 **FIRST BOOKING JOURNEY** (45 min)

### **Test 3.1: Booking Discovery** (15 min)
```bash
# STEP 1: Booking entry points
1. Da dove si può prenotare:
   □ Dashboard → "Prenota Prima Lezione"
   □ Pacchetti → "Prenota Lezione"  
   □ Quick Actions → "Prenota Lezione"
   □ Sidebar → "Calendario"

# STEP 2: Booking page/modal
2. Interface prenotazione:
   □ Calendario slot disponibili
   □ Filtri per tutor/materia
   □ Selezione data/ora
   □ Durata lezione
```

### **Test 3.2: Slot Selection** (15 min)
```bash
# STEP 1: Available slots
1. Visualizzazione disponibilità:
   □ Slot liberi evidenziati
   □ Slot occupati disabilitati
   □ Info tutor per ogni slot
   □ Prezzi/costi chiari

# STEP 2: Slot booking
2. Seleziona slot specifico:
   □ Conferma dettagli (data, ora, tutor)
   □ Selezione pacchetto da utilizzare
   □ Note/richieste speciali
   □ Conferma finale
```

### **Test 3.3: Booking Confirmation** (15 min)
```bash
# STEP 1: Booking completion
1. Conferma prenotazione:
   □ Success feedback immediato
   □ Dettagli lezione confermata
   □ Calendar update automatico
   □ Email notification trigger

# STEP 2: Dashboard update
2. Verifica aggiornamenti:
   □ Widget "Prossime Lezioni" popolato
   □ Calendario mostra evento
   □ Pacchetto ore decrementate
   □ Status tracking corretto
```

---

## 📊 **DASHBOARD POPOLATA VERIFICATION** (30 min)

### **Test 4.1: Rich Dashboard Experience** (20 min)
```bash
# STEP 1: Widgets con dati reali
1. Dashboard overview con contenuti:
   □ Pacchetti: 1 attivo, X ore rimanenti
   □ Lezioni: 1 programmata, data/ora visible
   □ Calendario: Eventi visibili
   □ Statistiche: Valori > 0

# STEP 2: Navigation experience
2. Esplora pagine con dati:
   □ /packages → "I Miei Pacchetti" popolata
   □ /calendar → Eventi visibili
   □ /lessons → Lezione programmata
   □ /materials → Accesso risorse

# STEP 3: Interactive elements
3. Testa funzionalità con dati:
   □ Click su lezione → Dettagli
   □ Modifica prenotazione
   □ Contatta tutor
   □ Accesso materiali
```

### **Test 4.2: Data Consistency** (10 min)
```bash
# STEP 1: Cross-page consistency
1. Verifica dati coerenti:
   □ Stesso pacchetto visibile ovunque
   □ Ore rimanenti consistenti
   □ Lezione mostrata uguale
   □ Tutor info coerenti

# STEP 2: Real-time updates
2. Modifica qualcosa e verifica:
   □ Cambio si riflette immediatamente
   □ No dati cached obsoleti
   □ Sync tra pagine
```

---

## ✅ **CHECKLIST FINALE GIORNO 2**

### **🎯 Workflow Completati:**
- [ ] **Package Discovery**: Esplorazione catalogo naturale
- [ ] **Purchase Journey**: Acquisto completo end-to-end  
- [ ] **First Booking**: Prima prenotazione lezione
- [ ] **Dashboard Rich**: App popolata con dati reali
- [ ] **Navigation Flow**: Tutti i percorsi utente testati

### **📊 Dati Creati:**
- [ ] **1 Package Purchase**: Attivo nel sistema
- [ ] **1 Lesson Booking**: Programmata nel calendario  
- [ ] **Updated Dashboard**: Widgets con contenuti reali
- [ ] **User Journey**: Percorso completo documentato

### **🐛 Issues Found:**
```bash
# Template per ogni issue:
ISSUE #1: Redundant Pages - Lessons vs Booking Confusion 🤔 IDENTIFIED
Workflow Step: Booking/Lesson Management
User Action: Looking for lesson-related functionality
Expected: Clear, unified lesson management interface
Actual: Two separate pages (/lessons vs /booking) with confusing names
Impact: Medium - UX confusion, scattered workflow
RECOMMENDATION: Unify into single /lessons page with tabs
- Tab 1: "Le Mie Lezioni" (existing bookings)
- Tab 2: "Prenota Nuova" (available slots)  
- Tab 3: "Storico" (completed lessons)

ISSUE #[N]: [Titolo problema]
Workflow Step: [Discovery/Purchase/Booking/Dashboard]
User Action: [Cosa stava facendo l'utente]
Expected: [Comportamento atteso nel workflow]
Actual: [Cosa è successo realmente]
Impact: [Critical/High/Medium - effetto sul journey]
```

### **📈 Success Metrics:**
- **Conversion Rate**: Riuscito ad acquistare pacchetto?
- **Time to First Booking**: Quanto tempo dal login alla prima lezione?
- **UX Friction Points**: Dove l'utente si è bloccato?
- **Data Population**: Dashboard popolata correttamente?

---

**🎉 GIORNO 2 COMPLETATO!**

**Next**: GIORNO 3 - Active User Workflow (con dati esistenti!)

*Ora abbiamo un utente attivo con pacchetto e lezione - possiamo testare workflow avanzati!*
