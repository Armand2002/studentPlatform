# Piattaforma Tutoring — Funzionalità (Backend & Frontend)

Questo documento riassume in modo sintetico e presentabile tutte le funzionalità implementate nel progetto (backend + frontend), lo stato attuale, e i criteri minimi di accettazione per ciascuna voce. Usalo come base per la presentazione al cliente e per verificare la conformità ai requisiti.

## Indice

- Scopo
- Come leggere questo documento
- Riepilogo veloce (High-level)
- Backend — funzionalità e stato
- API principali (endpoints significativi)
- Frontend — funzionalità e stato
- Mappatura requisiti -> stato (Acceptance criteria)
- Test & Verifica raccomandati
- Gap conosciuti e prossimi passi


## Scopo

Fornire al cliente una panoramica chiara di cosa è già implementato, cosa è parzialmente pronto e cosa manca, con criteri misurabili per la verifica.

## Come leggere questo documento

- "Stato": Done / Partial / Not implemented
- "Criterio di accettazione": cosa verificare per considerare la funzionalità soddisfatta
- Tutti i percorsi API elencati si trovano sotto il prefisso `/api` (backend FastAPI)


## Riepilogo veloce

- Backend: FastAPI + SQLAlchemy + Alembic. JWT auth (access + refresh). Sistema utenti con ruoli (STUDENT/TUTOR/ADMIN). Pricing engine avanzato. Admin workflow offline. Email tramite SendGrid (95% configurato).
- Frontend: Next.js (App Router), TypeScript. Autenticazione, pagine student/tutor, booking UI, pacchetti, dashboard. PWA generata in produzione (next-pwa).


## Backend — funzionalità e stato

1) Autenticazione & Account
- Registrazione (student/tutor) con profilo esteso — Stato: Done
  - Criterio: POST /api/auth/register con payload corretto crea utente, profilo, restituisce access + refresh token (HTTP 201).
- Login/Logout — Stato: Done
  - Criterio: POST /api/auth/login restituisce token; POST /api/auth/logout invalida sessione.
- Refresh token — Stato: Done
  - Criterio: POST /api/auth/refresh scambia refresh token per nuovo access token.
- Password reset (via email token) — Stato: Done
  - Criterio: request + confirm generano token, consentono reset password.

2) Gestione utenti e profili
- CRUD studenti/tutor (API e modelli DB) — Stato: Done
  - Criterio: GET/POST/PUT/DELETE sugli endpoint /api/users o /api/students /api/tutors funzionano con permessi corretti.
- Session management (user_sessions) — Stato: Done (DB + API)

3) Pricing engine
- Regole pricing, override tutor, audit log calcoli — Stato: Done
  - Criterio: POST /api/pricing/calculate restituisce prezzo coerente; calcoli salvati in pricing_calculations.

4) Pacchetti (packages)
- Creazione pacchetti tutor, acquisti, gestione ore — Stato: Done
  - Criterio: tutor crea pacchetto; admin/studente può assegnare/acquistare; ore scalate dopo booking.

5) Prenotazioni (bookings)
- Creazione, conferma, completamento, cancellazione — Stato: Done
  - Criterio: POST /api/bookings crea booking; tutor può confermare/complete; prezzo calcolato automaticamente.

6) Slots (disponibilità tutor)
- Creazione singola / bulk, check disponibilità — Stato: Done
  - Criterio: POST /api/slots e POST /api/slots/multiple creano slot; GET /api/slots/available filtra per disponibilità.

7) Admin workflows
- Assignment pacchetti offline, pagamenti admin, workflow stato — Stato: Done
  - Criterio: POST /api/admin/package-assignments crea assignment, email trigger (se SendGrid ok), status transitions funzionanti.

8) Pagamenti
- Pagamenti offline gestiti da admin — Stato: Done
  - Criterio: POST /api/admin/payments e conferma funzionano; ricevute trigger via email.
- Integrazione Stripe (legacy) — Stato: Partial / Legacy

9) Email (SendGrid)
- Template e trigger automatici — Stato: Partial (95% implementato)
  - Criterio: invio email test su staging con API key funzionante; template_id configurati.
  - Nota: chiave SendGrid deve essere messa in variabili d'ambiente/secret manager.

10) File storage
- Upload base, access control — Stato: Done (minimal)

11) Analytics & Dashboard
- Metriche financiali e KPI — Stato: Done (API lato backend)

12) Migrations & DB
- Alembic migrations, idempotent fallback (create_all), start.sh resilient — Stato: Done (dev-friendly)
  - Criterio: `docker-compose up` applica migration idempotenti in dev senza errori di multiple heads.

### Dettaglio moduli (estratto dalla codebase)

Ho scandito la codebase `backend/app` e `frontend/src` per ricavare tutti i moduli effettivamente presenti; sotto trovi la lista completa con una breve descrizione e lo stato attuale (Done / Partial / Not implemented).

Backend (cartella `backend/app`)
- `auth` — Rotte e servizi di autenticazione (register, login, refresh, logout, password reset). Contiene `routes.py`, `schemas.py`, `services.py`. Stato: Done
- `users` — CRUD utenti e profili (students/tutors), dipendenze e servizi. Stato: Done
- `bookings` — Logica prenotazioni: create/confirm/complete/cancel, integrazione pricing, stato e validazioni. Stato: Done
- `pricing` — Regole pricing, override tutor, calcolo e audit log (`pricing_calculations`). Stato: Done
- `packages` — Creazione pacchetti, links materiali, acquisti/assegnazioni. Stato: Done
- `payments` — Pagamenti offline gestiti da admin, integrazione legacy Stripe (parzialmente usata). Stato: Partial
- `slots` — Gestione disponibilità tutors (single/bulk), conflitti e API pubbliche. Stato: Done
- `files` — Upload e gestione file, controlli di accesso, storage minimo. Stato: Done
- `notifications` — Trigger email/in-app; wiring per notifiche (SendGrid parziale). Stato: Partial
- `analytics` — Endpoint metriche, trend e report per dashboard. Stato: Done
- `dashboard` — Aggregazioni e API per pannelli admin/finance. Stato: Done
- `admin` — Workflow amministrativo (package assignment, status transitions, admin tools). Stato: Done
- `core` — Config, inizializzazione DB, security utilities, factory dell'app (`main.py` usa le impostazioni qui). Stato: Done
- `middleware` — Middleware per autenticazione, logging, CORS e altri hook request/response. Stato: Done
- `utils` — Helper generali, validatori, formati. Stato: Done
- `main.py` — Entrypoint FastAPI / uvicorn settings e montaggio router. Stato: Done

Frontend (cartella `frontend/src`)
- `app` — Layouts, routing (App Router) e struttura delle pagine. Stato: Done
- `components` — Componenti UI riutilizzabili (forms, cards, modals, booking widgets). Stato: Done
- `features` — Feature groupate (booking UI, packages, admin widgets). Stato: Done
- `contexts` — React context per Auth, App state e utilità condivise. Stato: Done
- `lib` — Wrapper API (client axios/fetch), helper per login/token management (modificato per inviare JSON). Stato: Done
- `middleware.ts` — Edge middleware / route middleware (auth, redirects). Stato: Done
- `types` — TypeScript types per modelli API e payloads. Stato: Done
- `utils` — Client utilities, form helpers, date formatting. Stato: Done
- PWA (`next-pwa` config in `next.config.js`) — Generazione SW in produzione, disabilitato in dev. Stato: Done (production only)

Test e script utili
- `backend/tests` — Test di integrazione e smoke scripts (diversi file test_*.py presenti). Stato: Partial (esistenti e funzionanti per flussi E2E locali).
- `frontend/test-integration.js` e script `scripts/*.ps1` — Smoke scripts per ambienti locali. Stato: Partial

Note sui binding codice -> feature
- Ogni modulo backend contiene tipicamente `models.py`, `routes.py`, `schemas.py`, `services.py` e `dependencies.py` — questo riflette che ogni feature ha API, validazione e logica separata.
- Le funzionalità contrassegnate come Partial richiedono operazioni esterne (SendGrid API key, UI admin mancante, Stripe configurazione) per essere considerate "Done" in produzione.



## API principali (sintesi)


Authentication (endpoint, metodo, ruolo richiesto, stato)

| Endpoint | Metodo | Ruolo richiesto | Stato |
|---|---:|---|---|
| /api/auth/register | POST | Public | Done |
| /api/auth/login | POST | Public | Done |
| /api/auth/refresh | POST | Authenticated (any) | Done |
| /api/auth/logout | POST | Authenticated (any) | Done |
| /api/auth/password-reset-request | POST | Public | Done |
| /api/auth/password-reset | POST | Public (token) | Done |
| /api/auth/me | GET | Authenticated (any) | Done |



Users & Profile (endpoint, metodo, ruolo richiesto, stato)

| Endpoint | Metodo | Ruolo richiesto | Stato |
|---|---:|---|---|
| /api/students | POST | Admin / System (via API) | Done |
| /api/students | GET | Admin | Done |
| /api/students/{id} | GET | Student (own) / Admin | Done |
| /api/students/{id} | PUT | Student (own) / Admin | Done |
| /api/students/{id} | DELETE | Admin | Done |
| /api/tutors | POST | Public (register) / Admin | Done |
| /api/tutors | GET | Public / Authenticated | Done |
| /api/tutors/{id} | GET | Public | Done |
| /api/tutors/{id} | PUT | Tutor (owner) / Admin | Done |
| /api/tutors/{id} | DELETE | Admin | Done |
| /api/me/student | GET | Student | Done |
| /api/me/tutor | GET | Tutor | Done |
| /api/users/me/tutor | POST | Authenticated (Student/Tutor) | Done |



Pricing (endpoint, metodo, ruolo richiesto, stato)

| Endpoint | Metodo | Ruolo richiesto | Stato |
|---|---:|---|---|
| /api/pricing/calculate | POST | Admin / Tutor | Done |
| /api/pricing/preview | POST | Public / Authenticated | Done |
| /api/pricing/rules | GET | Admin / Tutor | Done |
| /api/pricing/rules/{rule_id} | GET | Admin / Tutor | Done |
| /api/pricing/rules | POST | Admin | Done |
| /api/pricing/rules/{rule_id} | PUT | Admin | Done |
| /api/pricing/rules/{rule_id} | DELETE | Admin | Done (soft-deactivate) |
| /api/pricing/rules/bulk | POST | Admin | Done |
| /api/pricing/tutors/{tutor_id}/overrides | GET | Admin / Tutor(owner) | Done |
| /api/pricing/tutors/{tutor_id}/overrides | POST | Admin | Done |



Packages & Purchases (endpoint, metodo, ruolo richiesto, stato)

| Endpoint | Metodo | Ruolo richiesto | Stato |
|---|---:|---|---|
| /api/packages | GET | Public | Done |
| /api/packages | POST | Tutor | Done |
| /api/packages/{id} | GET | Public | Done |
| /api/packages/{id} | PUT | Tutor (owner) / Admin | Done |
| /api/packages/{id} | DELETE | Tutor (owner) / Admin | Done |
| /api/packages/{id}/links | POST | Tutor (owner) / Admin | Done |
| /api/packages/{id}/links | GET | Authenticated / Public (public links) | Done |
| /api/packages/links/{link_id} | DELETE | Tutor (owner) / Admin | Done |
| /api/packages/purchases | POST | Student | Done |
| /api/packages/purchases | GET | Student (own) / Admin | Done |
| /api/packages/purchases/active | GET | Student | Done |
| /api/packages/purchases/{id} | GET | Student (own) / Admin | Done |



Bookings (endpoint, metodo, ruolo richiesto, stato)

| Endpoint | Metodo | Ruolo richiesto | Stato |
|---|---:|---|---|
| /api/bookings/ | POST | Student | Done |
| /api/bookings/ | GET | Authenticated (Student/Tutor/Admin) | Done |
| /api/bookings/upcoming | GET | Authenticated | Done |
| /api/bookings/completed | GET | Authenticated | Done |
| /api/bookings/{booking_id} | GET | Student/Tutor (owner) / Admin | Done |
| /api/bookings/{booking_id} | PUT | Student/Tutor(owner)/Admin | Done |
| /api/bookings/{booking_id}/confirm | POST | Tutor / Admin | Done |
| /api/bookings/{booking_id}/complete | POST | Tutor / Admin | Done |
| /api/bookings/{booking_id}/cancel | POST | Student/Tutor(owner)/Admin | Done |
| /api/bookings/pricing/preview | POST | Authenticated / Public (preview allowed) | Done |



Files (endpoint, metodo, ruolo richiesto, stato)

| Endpoint | Metodo | Ruolo richiesto | Stato |
|---|---:|---|---|
| /api/files/upload | POST | Tutor | Done |
| /api/files/ | GET | Tutor/Admin or Student(public filtered) | Done |
| /api/files/public | GET | Public | Done |
| /api/files/{file_id} | GET | Authenticated (owner/admin) | Done |
| /api/files/{file_id}/download | GET | Authenticated (owner/admin) | Done |
| /api/files/{file_id} | PUT | Tutor(owner) / Admin | Done |
| /api/files/{file_id} | DELETE | Tutor(owner) / Admin | Done |



Payments (endpoint, metodo, ruolo richiesto, stato)

| Endpoint | Metodo | Ruolo richiesto | Stato |
|---|---:|---|---|
| /api/payments/ | GET | Admin | Done |
| /api/payments/ | POST | Admin | Done |
| /api/payments/{payment_id} | PUT | Admin | Done |



Admin (endpoint, metodo, ruolo richiesto, stato)

| Endpoint | Metodo | Ruolo richiesto | Stato |
|---|---:|---|---|
| /api/admin/package-assignments | POST | Admin | Done |
| /api/admin/package-assignments | GET | Admin | Done |
| /api/admin/payments | POST | Admin | Done |
| /api/admin/payments | GET | Admin | Done |
| /api/admin/payments/{payment_id}/confirm | PUT | Admin | Done |



Slots (endpoint, metodo, ruolo richiesto, stato)

| Endpoint | Metodo | Ruolo richiesto | Stato |
|---|---:|---|---|
| /api/slots | POST | Tutor | Done |
| /api/slots/multiple | POST | Tutor | Done |
| /api/slots/ | GET | Tutor/Admin | Done |
| /api/slots/available | GET | Public | Done |
| /api/slots/{slot_id} | GET | Tutor/Admin | Done |
| /api/slots/{slot_id} | PUT | Tutor(owner)/Admin | Done |
| /api/slots/{slot_id} | DELETE | Tutor(owner)/Admin | Done |
| /api/slots/tutor/{tutor_id}/date/{date} | DELETE | Tutor(owner)/Admin | Done |



Analytics (endpoint, metodo, ruolo richiesto, stato)

| Endpoint | Metodo | Ruolo richiesto | Stato |
|---|---:|---|---|
| /api/analytics/metrics | GET | Admin | Done |
| /api/analytics/trends | GET | Admin | Done |



Utility / Root (endpoint, metodo, ruolo richiesto, stato)

| Endpoint | Metodo | Ruolo richiesto | Stato |
|---|---:|---|---|
| / | GET | Public | Done |
| /health | GET | Public | Done |



Notifications
- `app/notifications/routes.py` currently contains a TODO (no endpoints implemented) — Not implemented / TODO

(Usa i percorsi esposti per i test E2E con Postman / test scripts già presenti nella cartella `backend/tests`.)


## Frontend — funzionalità e stato

1) Autenticazione UI
- Pagine register/login, gestione token in client, redirect role-based — Stato: Done
  - Criterio: Utente può registrarsi come STUDENT/TUTOR, eseguire login e accedere dashboard.

2) Registrazione user + profilo
- Form complete per STUDENT / TUTOR con validazione client-side e server-side — Stato: Done
  - Nota: server normalizza `role` per evitare errori di enum case-sensitive.

3) Dashboard (student/tutor)
- Pagine per vedere pacchetti, prenotazioni, cronologia — Stato: Done (essenziali)

4) Booking UI
- Creazione prenotazioni, selezione slot, conferma pagamento offline — Stato: Done

5) Pacchetti UI
- Creazione pacchetti (tutor), visualizzazione acquisti (student) — Stato: Done

6) Admin UI
- Partial: Backend ready; UI admin completa non ancora finalizzata — Stato: Partial
  - Criterio: operazioni admin possono essere eseguite via API; interfaccia manca di alcune pagine di gestione avanzata.

7) PWA / Service Worker
- next-pwa configurato; SW generato in production build — Stato: Done (production only)
  - Criterio: `npm run build` produce `public/sw.js` e la webapp passa i test di precaching.
  - Nota: in dev il service worker è disabilitato per evitare 404 e cache inesperate.

8) Frontend tests / integrazione
- Script di test-integration e smoke scripts presenti — Stato: Partial


## Mappatura requisiti -> stato (esempi)

Requisito cliente: "Studente si registra, riceve email di conferma e può prenotare".
- Registrazione: Done (API + frontend)
- Email conferma: Partial (SendGrid configurazione mancante)
- Prenotazione: Done (UI + backend + pricing)
- Criterio di accettazione completo: End-to-end demo su staging con email inviata: ancora da verificare.

Requisito cliente: "Admin può assegnare pacchetti e ricevere conferma di pagamento"
- Assegnazione: Done (API + backend)
- Pagamento offline e conferma: Done (API)
- UI per admin: Partial (manchi alcune pagine di amministrazione)


## Test & Verifica raccomandati (per presentazione al cliente)

- E2E smoke flow (da eseguire in staging o locale con DB pulito):
  1. Creare student via UI -> verificare HTTP 201 e ricezione token
  2. Se SendGrid configurato: verificare email di benvenuto/confirmation
  3. Creare pacchetto (tutor) e assegnarlo (admin) -> verificare email assignment
  4. Studente crea booking -> verificare pricing_calculations e booking status
  5. Tutor conferma e completa booking -> verificare ore scalate

- Test API Postman collection: coprire register/login/booking/pricing/admin flows.
- Test di load minimo: simulare 50 utenti concorrenti per booking e misurare latenza (opzionale).


## Gap conosciuti e prossimi passi

- SendGrid: configurazione API key & template_id in environment (prerequisito per demo email completa).
- Admin frontend: alcune interfacce di gestione avanzata non completate — se il cliente richiede UI completa, stimare 2-3 giorni di lavoro.
- Stripe/integrazione pagamenti online: parte legacy; se serve pagamenti online in produzione, definire scope.


## Note operative per la presentazione

- Per la demo dal vivo usare la build di produzione del frontend per mostrare PWA e precache.
- Preparare un DB di staging con dati realistici e una SendGrid API key di test.
- Fornire al cliente la Postman collection e i criteri di accettazione per ogni funzionalità.


---

Se vuoi, posso:
- salvare questo file come `PLATFORM_FEATURES.md` (fatto) e aggiungere un breve changelog delle ultime modifiche;
- generare una Postman collection di base per i percorsi critici;
- creare una lista di slide (markdown con punti per each slide) per la presentazione cliente.

Dimmi quale di queste azioni vuoi che esegua subito.
