# Codebase workflows — verified

Data: 2025-09-16

Questo file riepiloga i workflow presenti nella codebase del progetto (backend + frontend). Tutto il contenuto è stato verificato direttamente nei file sorgente del repository (i path sono indicati). Usa questo documento come mappa per capire dove si trova la logica e come testare / riprodurre ogni flusso.

---

## Indice

- Admin package assignment & payment workflow
- Package creation / immutability / deactivate / delete policy
- Package purchase workflow (student)
- Booking consumption → package hours update (incl. admin assignment consumption)
- Periodic closer script (chiusura assegnazioni admin)
- Database migration (activated_at, completed_at)
- Frontend mappings (pages & API calls)
- File list rapido e comandi di verifica

---

## 1) Admin package assignment & payment workflow

Descrizione
- Admin può creare un'assegnazione "admin package assignment" che lega student, tutor e package; questa crea un record in `admin_package_assignments`.
- I pagamenti offline/gestiti da admin sono registrati in `admin_payments`. La conferma pagamento può automaticamente attivare l'assegnazione (se `auto_activate_on_payment` è True) e impostare `activated_at`.

File rilevanti (verificati):
- Backend routes: `backend/app/admin/routes.py` (prefisso `/api/admin`)
  - POST `/api/admin/package-assignments` → `create_package_assignment` (chiama `AdminPackageService.create_assignment`)
  - POST `/api/admin/payments` → `record_payment`
  - PUT `/api/admin/payments/{payment_id}/confirm` → `confirm_payment`
  - GET `/api/admin/package-assignments` → `list_package_assignments`

- Services: `backend/app/admin/services.py`
  - `AdminPackageService.create_assignment(db, data, admin_id)` — crea `AdminPackageAssignment` e imposta campi iniziali (`hours_remaining`, `auto_activate_on_payment`, ecc.).
  - `AdminPaymentService.record_payment(...)` — crea `AdminPayment` (con idempotency sulla `reference_number`).
  - `AdminPaymentService.confirm_payment(db, payment_id, admin_id)` — conferma il pagamento, marca `payment.status = COMPLETED`, imposta `confirmation_date`, e se l'assegnazione esiste e `auto_activate_on_payment` true cambia `assignment.status = ACTIVE` e imposta `assignment.activated_at = now()` se non già presente.

- Models / Columns: `backend/app/admin/models.py`
  - `AdminPackageAssignment` include `activated_at: DateTime | nullable`, `completed_at: DateTime | nullable`, `hours_remaining`, `hours_used`, `status` (enum), e relazioni verso `student`, `tutor`, `package`.
  - `AdminPayment` con `status`, `confirmation_date`, `reference_number`, ecc.

- Schemas (Pydantic): `backend/app/admin/schemas.py` espone i campi, incluse `activated_at` e `completed_at`.

Come verificare (smoke):
1. Chiamare POST `/api/admin/package-assignments` con payload conforme a `AdminPackageAssignmentCreate` (controlla `backend/app/admin/schemas.py`).
2. Creare un pagamento POST `/api/admin/payments` collegato a `package_assignment_id` e poi PUT `/api/admin/payments/{id}/confirm`.
3. Verificare in DB che l'assegnazione venga impostata a status `ACTIVE` e che `activated_at` sia valorizzato.

---

## 2) Package creation / immutability / deactivate / delete policy

Descrizione
- I pacchetti possono essere creati da tutor tramite `/api/packages` o da admin tramite `/api/admin/packages` (admin crea per conto di un tutor).
- I pacchetti sono immutabili: la route PUT `/api/packages/{package_id}` risponde sempre con 403 (Packages are immutable once created).
- Deletion policy: DELETE `/api/packages/{package_id}` è permesso solo se non esistono `PackagePurchase` o `AdminPackageAssignment` collegati; altrimenti ritorna 403.
- È stata aggiunta anche una route PATCH `/api/packages/{package_id}/deactivate` che esegue soft-deactivate (setta `is_active=False`) — utile perché il frontend invocava questa chiamata.

File rilevanti (verificati):
- Routes: `backend/app/packages/routes.py`
  - POST `/` (create package — tutor)
  - GET `/` (list packages)
  - POST `/purchases` (purchase - students)
  - GET `/purchases`, `/purchases/active`, `/purchases/{id}`
  - PUT `/{package_id}` (immutability: raises 403)
  - DELETE `/{package_id}` (hard delete only if no purchases/assignments)
  - PATCH `/{package_id}/deactivate` (soft deactivate) — aggiunta recente e presente nel file

- Services: `backend/app/packages/services.py`
  - `PackageService.create_package`, `get_package_by_id`, `get_all_active_packages`, `delete_package` (soft), etc.
  - `PackagePurchaseService.create_package_purchase` e `update_purchase_hours`.

- Frontend: `frontend/src/lib/api-services/packages.ts`
  - `packageService.deactivatePackage(id)` invoca `PATCH /api/packages/${id}/deactivate` (wrapper `apiRequest`).
  - `createPackageAsAdmin` invoca `/api/admin/packages`.

Comportamento verificabile:
- Se il frontend chiamava `PATCH /api/packages/{id}/deactivate` prima della route, restituiva 404 — la route è stata aggiunta per risolvere il problema.
- DELETE è protetto contro pacchetti collegati a acquisti o assegnazioni.

---

## 3) Package purchase workflow (student)

Descrizione
- Uno studente acquista un pacchetto tramite POST `/api/packages/purchases`.
- Al momento della creazione della `PackagePurchase` il campo `hours_remaining` viene impostato a `package.total_hours` (vedi `PackagePurchaseService.create_package_purchase`).
- Le rotte per leggere gli acquisti sono GET `/api/packages/purchases` e `/api/packages/purchases/active`.

File rilevanti (verificati):
- Backend: `backend/app/packages/routes.py` (purchases endpoints)
- Services: `backend/app/packages/services.py` (`PackagePurchaseService`)
- Frontend: `frontend/src/lib/api-services/packages.ts` (`purchasePackage`, `getUserPackages`, `getActivePackages`)

Verifica rapida:
- Come student: POST `/api/packages/purchases` con `package_id`, `student_id`, `expiry_date` (schema in `backend/app/packages/schemas.py`), poi GET `/api/packages/purchases/active` per vedere l'acquisto attivo.

---

## 4) Booking consumption → package hours update (incl. admin assignment consumption)

Descrizione
- Quando una prenotazione (`Booking`) viene confermata, la logica in `BookingAutoCalculations.auto_update_package_consumption` viene invocata per sottrarre ore dal `PackagePurchase` collegato.
- La funzione tenta inoltre di trovare una `AdminPackageAssignment` ACTIVE corrispondente (stesso student_id, tutor_id, package_id) e sottrarre anche lì le ore consumate; se `hours_remaining <= 0` l'assegnazione viene marcata `COMPLETED` e `completed_at` impostato.

File rilevanti (verificati):
- `backend/app/bookings/auto_calculations.py`
  - `auto_update_package_consumption(booking, db, operation)` gestisce `consume` e `refund`.
  - `_consume_admin_assignment_hours(db, purchase, booking, hours_to_consume)` cerca e aggiorna eventuale `AdminPackageAssignment` ACTIVE.

Verifica:
- Conferma una booking che usa `package_purchase_id` e verifica che `PackagePurchase.hours_remaining` diminuisca e che, se esiste una `AdminPackageAssignment` attiva corrispondente, le sue `hours_remaining` vengano aggiornate.

---

## 5) Periodic closer script (chiusura assegnazioni admin)

Descrizione
- Script standalone che chiude (setta status = COMPLETED e `completed_at`) le `AdminPackageAssignment` attive quando:
  - `hours_remaining <= 0` oppure
  - `activated_at` è più vecchia di `ADMIN_ASSIGNMENT_CLOSE_DAYS` (default 31 giorni).

File rilevante: `backend/scripts/close_expired_admin_assignments.py` — lo script usa `SessionLocal()` e committa i cambiamenti.

Esecuzione:
- Eseguire dentro il container o ambiente Python con accesso al DB:
  ```bash
  python backend/scripts/close_expired_admin_assignments.py
  ```
- Configurare `ADMIN_ASSIGNMENT_CLOSE_DAYS` in env se desideri cambiare la finestra.

---

## 6) Database migration (activated_at, completed_at)

Descrizione
- Migrazione Alembic che aggiunge le colonne `activated_at` e `completed_at` a `admin_package_assignments`.

File: `backend/migrations/versions/20250915_add_admin_ts.py` — implementa `upgrade()` che aggiunge le colonne (fa attenzione al dialect postgres vs fallback), e `downgrade()`.

Nota: in dev sono state incontrate problematiche con molte heads; assicurati che la storia delle revision sia coerente quando applichi in staging/production.

---

## 7) Frontend mappings: pages & API calls

Front-end files verificati (principali):
- `frontend/src/app/dashboard/admin/packages/page.tsx` — UI amministrazione pacchetti (lista, deattiva, creazione). Usa `packageService` per le chiamate API.
- `frontend/src/app/dashboard/admin/assignments/page.tsx` — UI amministrazione assegnazioni (mostra `activatedAt`, `completedAt`, status badge, ecc.). Richiama `/api/admin/package-assignments`.
- `frontend/src/lib/api-services/packages.ts` — mappa i metodi usati dalla UI a endpoint REST:
  - `getPackages()` → GET `/api/packages`
  - `deactivatePackage(id)` → PATCH `/api/packages/${id}/deactivate`
  - `createPackageAsAdmin(...)` → POST `/api/admin/packages`
  - `purchasePackage(packageId)` → POST `/api/packages/purchases`

- `frontend/src/lib/api-services/base.ts` — definisce `API_ENDPOINTS` (PACKAGES, PACKAGE_PURCHASES, ADMIN_*), e `apiRequest()` che lancia `ApiError` ben formattate.

Come verificare le chiamate dal frontend:
- Apri devtools nella pagina admin pacchetti e osserva la request PATCH a `/api/packages/{id}/deactivate`.
- Se ricevi 404: verifica che il backend sia in esecuzione e che il router `backend/app/packages/routes.py` sia incluso nell'app FastAPI (nel file `backend/app/main.py` o dove vengono registrati i router).

---

## 8) Elenco rapido file + ruoli

- backend/app/admin/routes.py — Endpoints admin (assignments, payments, reports)
- backend/app/admin/services.py — Logica di business admin (create assignment, record/confirm payment)
- backend/app/admin/models.py — Models: AdminPackageAssignment, AdminPayment
- backend/app/admin/schemas.py — Pydantic schemas per admin API
- backend/app/packages/routes.py — Routes pubbliche e admin-create (packages, purchases, deactivate, delete)
- backend/app/packages/services.py — Logica packages & purchases
- backend/app/bookings/auto_calculations.py — Consumo ore pacchetto + sincronizzazione con AdminPackageAssignment
- backend/scripts/close_expired_admin_assignments.py — Script periodico per chiudere assegnazioni
- backend/migrations/versions/20250915_add_admin_ts.py — Migrazione per `activated_at` e `completed_at`
- frontend/src/app/dashboard/admin/packages/page.tsx — UI pacchetti admin (lista, deattiva, create modal)
- frontend/src/app/dashboard/admin/assignments/page.tsx — UI assegnazioni admin
- frontend/src/lib/api-services/packages.ts — Wrapper API per pacchetti
- frontend/src/lib/api-services/base.ts — Endpoints centralizzati + error wrapper

---

## 9) Come testare / smoke checks (passi concreti)

1. Avvia backend (docker-compose / o come fai normalmente).
2. Avvia frontend dev server (`npm run dev` o `pnpm dev`) e apri la pagina admin pacchetti.
3. Verifica che il bottone "Disattiva" lanci una PATCH su `/api/packages/{id}/deactivate`:
   - Console devtools → Network → cerca PATCH
   - Se 404: il backend non espone la route o non è raggiungibile
4. Creazione assegnazione admin (via API):
   - POST `/api/admin/package-assignments` con payload conforme a `backend/app/admin/schemas.py`.
   - Verifica record in DB (`admin_package_assignments`) e campi `hours_remaining`.
5. Pagamento admin e conferma:
   - POST `/api/admin/payments` con `package_assignment_id` → poi PUT `/api/admin/payments/{id}/confirm`.
   - Verifica che l'assegnazione passi ad `ACTIVE` e che `activated_at` sia impostato.
6. Booking che consuma ore:
   - Conferma una booking che usa `package_purchase_id`; il codice in `auto_update_package_consumption` sottrae ore dalla `PackagePurchase` e prova a consumare anche l'eventuale `AdminPackageAssignment` ACTIVE corrispondente.
7. Eseguire script di chiusura (periodico):
   - `python backend/scripts/close_expired_admin_assignments.py` — verifica log e DB che assegna gli `completed_at` correttamente.

---

## 10) Note e raccomandazioni

- Alembic: assicurati che la storia delle migration in `backend/migrations/versions` sia coerente prima di applicare in produzione (down_revision a catena). Il file `20250915_add_admin_ts.py` è presente e applica le colonne.
- Test automatici: attualmente non ci sono test unitari/integration che coprano la chiusura automatica; sarebbe utile aggiungerne almeno 2 (happy path + hours exhausted).
- UX: il frontend invoca `PATCH /api/packages/{id}/deactivate`; la route è stata aggiunta nel backend per evitare 404. Verifica policy di permessi (solo tutor proprietario o admin possono disattivare).

---

Se vuoi, posso:
- generare automaticamente test unitari Pytest per `close_expired_admin_assignments.py` e per `AdminPaymentService.confirm_payment` (happy path + idempotency);
- creare uno script `make` / `npm` task per lanciare lo smoke test automaticamente;
- aggiungere note di deploy per Alembic (come settare down_revision se necessario).

Se vuoi il file posizionato altrove o con più / meno dettaglio, dimmi e lo aggiorno.
