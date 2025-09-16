# Codebase workflows per tipo di utente

Data: 2025-09-16

Questo documento riordina il contenuto del precedente `CODEBASE_WORKFLOWS.md` suddividendo i workflow per tipo di utente: Student, Tutor e Admin. Tutto è verificato direttamente nella codebase: sotto ogni workflow trovi i file e le rotte coinvolte e i passi concreti per testarlo.

---

## Indice

- Studente
  - Acquisto pacchetto
  - Visualizzazione pacchetti attivi
  - Prenotazione e consumo ore
- Tutor
  - Creazione pacchetto (tutor)
  - Visualizzazione pacchetti dei tutor
  - Gestione risorse del pacchetto (links)
- Admin
  - Creazione assegnazione (AdminPackageAssignment)
  - Registrazione e conferma pagamenti admin
  - Creazione pacchetto per conto del tutor
  - Report & settings
  - Deattivazione e cancellazione pacchetti (policy)
  - Script periodico di chiusura assegnazioni

---

## Studente

1) Acquisto pacchetto

- Endpoint backend (verificati in `backend/app/packages/routes.py`):
  - POST `/api/packages/purchases` (schema: `PackagePurchaseCreate`)
- Service (verificato): `backend/app/packages/services.py` → `PackagePurchaseService.create_package_purchase`
  - Imposta `hours_remaining = package.total_hours` al momento della creazione.

File frontend (verificati):
- `frontend/src/lib/api-services/packages.ts` → `purchasePackage(packageId)` invoca `api.post(API_ENDPOINTS.PURCHASE_PACKAGE, { packageId, paymentMethod })` che punta a `/api/packages/purchases`.

Come testare (Studente):
- Chiamare POST `/api/packages/purchases` con payload valido (student_id, package_id, expiry_date...).
- GET `/api/packages/purchases/active` per verificare l'acquisto attivo.

2) Visualizzazione pacchetti attivi

- Endpoint: GET `/api/packages` (pubblico, filtri disponibili)
- Frontend: `frontend/src/app/dashboard/admin/packages/page.tsx` (lista admin), e componenti utenti per vedere pacchetti (non elencati qui)

3) Prenotazione e consumo ore

- Quando uno studente conferma una booking che usa un `package_purchase_id`, il backend esegue l'aggiornamento delle ore:
  - File: `backend/app/bookings/auto_calculations.py`
    - `auto_update_package_consumption(booking, db, operation='consume')` sottrae ore dal `PackagePurchase`.
    - Se esiste una `AdminPackageAssignment` ACTIVE corrispondente, `_consume_admin_assignment_hours` sottrae ore anche dall'assegnazione e può impostare `completed_at` se le ore arrivano a 0.

Come testare (Studente):
- Creare un `PackagePurchase` e una booking che lo usa. Confermare la booking e verificare `PackagePurchase.hours_remaining` diminuito.
- Se esiste un'assegnazione admin corrispondente (stesso student_id/tutor_id/package_id) attiva, verificare che le sue `hours_remaining` diminuiscano.

---

## Tutor

1) Creazione pacchetto (Tutor)

- Endpoint: POST `/api/packages` (solo per utenti con ruolo TUTOR). Vedi `backend/app/packages/routes.py`.
- Service: `PackageService.create_package` in `backend/app/packages/services.py`.
- Frontend: quando un tutor è loggato, il bottone "Nuovo Pacchetto" nella pagina admin pacchetti consente la creazione; `packageService.createPackage(payload)` invoca `POST /api/packages`.

Come testare (Tutor):
- Eseguire POST `/api/packages` con JWT di un tutor attivo. Verificare che il record venga creato.

2) Visualizzazione pacchetti del tutor

- Endpoint: GET `/api/packages?tutor_id={tutorId}` (implementato come filtro in `get_packages`).

3) Gestione risorse del pacchetto (links)

- Endpoint:
  - POST `/api/packages/{package_id}/links` → aggiungi link risorsa (solo owner tutor o admin)
  - GET `/api/packages/{package_id}/links` → lista link (public solo per studenti)
  - DELETE `/api/packages/links/{link_id}` → rimuovi link (owner o admin)
- Service: `PackageService.add_resource_link`, `get_package_links`, `delete_resource_link`.

Come testare (Tutor):
- Aggiungi un link con POST, verifica GET e prova a cancellarlo.

---

## Admin

Questa sezione include i workflow che richiedono privilegi amministrativi.

1) Creazione assegnazione (AdminPackageAssignment)

- Route: POST `/api/admin/package-assignments` (file: `backend/app/admin/routes.py`). Richiede user.role == ADMIN.
- Service: `AdminPackageService.create_assignment(db, data, admin_id)` crea record in `admin_package_assignments` e imposta `hours_remaining`, `auto_activate_on_payment`.
- Schema: `backend/app/admin/schemas.py` → `AdminPackageAssignmentCreate` e `AdminPackageAssignment`.

Come testare (Admin):
- Effettua POST `/api/admin/package-assignments` con payload valido. Verifica `admin_package_assignments` in DB e i campi `hours_remaining` e `status` iniziale (di default DRAFT/ASSIGNED a seconda dell'implementazione).

2) Registrazione e conferma pagamenti admin

- Route: POST `/api/admin/payments` → crea `AdminPayment` (record_payment)
- Route: PUT `/api/admin/payments/{payment_id}/confirm` → conferma il pagamento; la logica in `AdminPaymentService.confirm_payment`:
  - imposta `payment.status = COMPLETED`, `confirmation_date = now`, `confirmed_by_admin_id`;
  - se `assignment.auto_activate_on_payment` è True, imposta `assignment.status = ACTIVE` e `assignment.activated_at = now()` (se non era impostato).

Come testare (Admin payments):
- POST un pagamento referenziando `package_assignment_id`.
- PUT `/api/admin/payments/{id}/confirm`.
- Verificare che `AdminPayment.status` sia `COMPLETED` e che l'assegnazione sia `ACTIVE` con `activated_at` valorizzato.

3) Creazione pacchetto per conto del tutor (Admin)

- Route: POST `/api/admin/packages` (vedi `backend/app/admin/routes.py` che delega a `package_services.PackageService.create_package`) — `createPackageAsAdmin` invoca questo endpoint dal frontend.

Come testare:
- Admin POST `/api/admin/packages` con `tutor_id` e payload pacchetto. Verificare che il pacchetto venga creato con `tutor_id` assegnato.

4) Report & settings

- Endpoint admin per report: GET `/api/admin/reports/overview` (param `days`, default 30) — calcola revenue, bookings, active users.
- Settings: GET `/api/admin/settings` e PUT `/api/admin/settings` (stubbed in routes).

5) Deattivazione e cancellazione pacchetti (policy)

- PATCH `/api/packages/{package_id}/deactivate` → soft-deactivate (impostato in `backend/app/packages/routes.py`).
- DELETE `/api/packages/{package_id}` → permissibile solo se non esistono `PackagePurchase` o `AdminPackageAssignment` collegati (altrimenti 403).

Come testare (Admin):
- Chiamare PATCH per un pacchetto a cui hai accesso e verificare `is_active` -> false.
- Provare DELETE su pacchetti collegati a acquisti o assegnazioni per verificare il 403.

6) Script periodico di chiusura assegnazioni

- File: `backend/scripts/close_expired_admin_assignments.py`.
- Comportamento: chiude le assegnazioni ACTIVE quando `hours_remaining <= 0` o `activated_at <= now - ADMIN_ASSIGNMENT_CLOSE_DAYS`.
- Esecuzione: `python backend/scripts/close_expired_admin_assignments.py` (o programmarlo come cron / job container). Variabile d'ambiente `ADMIN_ASSIGNMENT_CLOSE_DAYS` impostabile.

Come testare (Admin):
- Creare assegnazioni con `activated_at` oltre 31 giorni o `hours_remaining = 0` e lanciare lo script; verificare che lo script imposti `status = COMPLETED` e `completed_at`.

---

## File rapidi di riferimento

- backend/app/admin/* (routes.py, services.py, models.py, schemas.py)
- backend/app/packages/* (routes.py, services.py, models.py, schemas.py)
- backend/app/bookings/auto_calculations.py
- backend/scripts/close_expired_admin_assignments.py
- backend/migrations/versions/20250915_add_admin_ts.py
- frontend/src/app/dashboard/admin/packages/page.tsx
- frontend/src/app/dashboard/admin/assignments/page.tsx
- frontend/src/lib/api-services/packages.ts
- frontend/src/lib/api-services/base.ts

---

## Passi successivi suggeriti (opzionali)

- Aggiungere test Pytest per:
  - `AdminPaymentService.confirm_payment` (idempotency + attivazione assignment)
  - `close_expired_admin_assignments` (chiude per ore = 0 e per activated_at scadute)
- Aggiungere una task `/scripts/smoke_admin_workflow.sh` o `Makefile` per eseguire automaticamente i passaggi di verifica (richiederà un DB di test e token di autenticazione).

---

Se vuoi, posso:
- aggiungere i test Pytest per i due casi citati e committarli sotto `backend/tests/`;
- creare la task di smoke test;
- generare un breve HOWTO per eseguire lo script di chiusura nel container Docker. Dimmi cosa preferisci che faccia adesso.

## Altri workflow rilevati nella codebase

Durante l'audit ho cercato pattern chiave e file che indicano altri workflow importanti non coperti esplicitamente nel riepilogo per ruolo. Li elenco qui con i riferimenti ai file e suggerimenti su dove integrarli nel documento principale.

1) Registrazione e autenticazione

- File: `backend/app/auth/` (route e servizi), frontend: `frontend/src/app/(auth)` e `frontend/src/app/dashboard/*` per UI di login/registration.
- Cosa fa: registrazione utente, approvazione (admin), login JWT/session, gestione ruoli (STUDENT/TUTOR/ADMIN).
- Test rapido: eseguire POST `/api/auth/register`, poi login, verificare JWT e ruoli.

2) Slot / Calendario / Prenotazioni avanzate

- File: `backend/app/slots/`, `backend/app/bookings/` e frontend calendar components (`frontend/src/components/calendar`, `frontend/src/app/dashboard/*/calendar`), e `FRONTEND_TEST_CHECKLIST.md` segnala test mancanti per slot e calendario.
- Cosa fa: CRUD slot, prenotazioni, visualizzazione calendario, quick-slot creation.
- Test rapido: creare slot da tutor, visualizzarli nello student calendar, creare booking e verificare consumi.

3) Pagamenti e integrazione gateway

- File: `backend/app/payments/`, `backend/app/admin/services.py` (admin payments), `backend/test_*` contiene test di flusso pagamento.
- Cosa fa: creazione pagamenti, conferma, webhooks/confirm flows (se presenti). Potrebbe includere Stripe/PayPal adaptors.
- Test rapido: creare pagamento mock, chiamare conferma e verificare side-effects (attivazione assegnazione, creazione transazioni).

4) File upload / gestione assets

- File frontend: `frontend/src/components/uploads`, backend: `backend/app/files/` e `static/uploads/`.
- Cosa fa: upload CV, certificazioni, materiali pacchetto.
- Test rapido: upload file via UI o endpoint e verificare salvataggio e permessi.

5) Notifications / Notification center

- File: `frontend/src/components/notifications/NotificationSystem.tsx`, backend: `backend/app/notifications/`.
- Cosa fa: generazione e visualizzazione di notifiche per utenti (booking reminders, payment alerts, admin notes).
- Test rapido: generare una notifica via backend e verificare che il frontend la mostri.

6) Analytics, reports e metrics

- File frontend: `frontend/src/components/dashboard/admin/PlatformMetrics.tsx`, `frontend/src/app/dashboard/admin/analytics` e `reports`.
- Backend: `backend/app/analytics/` o endpoints admin in `backend/app/admin/routes.py`.
- Cosa fa: raccolta metriche revenue, bookings, active users; esporti/report.

7) Tests, smoke scripts e checklists

- File: test files in `backend/` like `backend/test_package_workflow.py`, `backend/test_definitive_100_percent.py`, and smoke scripts under `scripts/` (PowerShell smoke-*.ps1).
- Cosa fa: test end-to-end e smoke per verifiche rapide in ambienti dev.

8) Dev infra, docker-compose e environment

- File: `docker-compose.yml`, `docker-compose.frontend.yml`, `backend/.env.example`, `start.sh`.
- Cosa fa: orchestration dei servizi (web, db), variabili d'ambiente importanti per esecuzione e migrazioni.

9) Migrations / Alembic

- File: `backend/migrations/versions/20250915_add_admin_ts.py` e cartella `alembic/`.
- Cosa fa: versione schema e migration history; verifica necessaria in produzione per allineare heads.

Suggerimento per il documento principale:
- Integrare una sezione "Cross-cutting workflows" che contenga almeno questi punti (auth, slots/calendar, payments, uploads, notifications, analytics, tests, infra). Per ciascuno aggiungere i file principali e i passi di verifica già presenti per gli assignment/admin/package.

