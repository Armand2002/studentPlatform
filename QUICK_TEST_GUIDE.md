# Quick Test Guide

Breve guida per verificare rapidamente le funzionalità principali (admin, tutor, student) e PWA.

## Prerequisiti
- Backend in esecuzione su `http://localhost:8000`
- Frontend in esecuzione su `http://localhost:3000`
- Nel file `backend/.env` puoi abilitare il seed automatico:
  - `AUTO_SEED=true`

## Utenti seed (dev)
- Admin: `admin.e2e@acme.com` / `Password123!`
- Tutor: `tutor.e2e@acme.com` / `Password123!`
- Student: `student.e2e@acme.com` / `Password123!`

## Ottenere i token (PowerShell)
```
$base = "http://localhost:8000"
$body = "username=admin.e2e@acme.com&password=Password123!"
$admin = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -ContentType "application/x-www-form-urlencoded" -Body $body
$admin.access_token
```
Ripeti per tutor/student cambiando email.

## Smoke test per ruolo

### Admin
- Verifica auth:
  - `GET /api/auth/me` (200)
- Pagamenti (manuali):
  - `GET /api/payments/` (200)
  - `POST /api/payments/?amount_cents=1299&currency=EUR&description=Test` (201)
  - `PUT /api/payments/{id}` con body `{ "status": "succeeded" }` (200)
- Analytics:
  - `GET /api/analytics/metrics` (200)
  - `GET /api/analytics/trends?days=7` (200)

### Tutor
- Profilo tutor:
  - `GET /api/users/me/tutor` (200)
  - se 404, crea con `POST /api/users/me/tutor` body `{ first_name, last_name, hourly_rate, subjects }`
- Slot:
  - `POST /api/slots` body `{ tutor_id, date: "YYYY-MM-DD", start_time: "09:00:00", end_time: "10:00:00" }` (201)
  - `GET /api/slots?slot_date=YYYY-MM-DD` (200)
  - `DELETE /api/slots/{id}` (200)
- Materiali:
  - `POST /api/files/upload` multipart (file + `subject`)
  - `GET /api/files?subject=...` (200)
  - `GET /api/files/{id}/download` (200)
  - `DELETE /api/files/{id}` (200)

### Student
- Profilo studente:
  - `GET /api/users/me/student` (200)
- Prenotazioni:
  - `GET /api/bookings/upcoming` (200) — empty state se nessuna prenotazione

## Frontend: percorsi rapidi
- Login: `http://localhost:3000/login`
- Dashboard admin: `http://localhost:3000/dashboard/admin`
- Dashboard tutor: `http://localhost:3000/dashboard/tutor`
- Dashboard student: `http://localhost:3000/dashboard/student`

## PWA (verifica rapida)
- `http://localhost:3000/manifest.webmanifest` deve rispondere 200
- Icone: `http://localhost:3000/icons/icon-192.svg` (200)
- In Chrome DevTools → Application: verifica Manifest e Service Worker attivi

## Note
## Smoke Test automatizzati (PowerShell)

Esegui tutti gli smoke in una volta:

```powershell
.\scripts\smoke-all.ps1
```

Esecuzione singola per ruolo:

```powershell
.\scripts\smoke-admin.ps1
.\scripts\smoke-tutor.ps1
.\scripts\smoke-student.ps1
```

Parametri opzionali:

```powershell
.\scripts\smoke-admin.ps1 -BaseUrl http://localhost:8000
```

Output: JSON con `status` e `ok`. Esito generale in `overall_ok` (wrapper `smoke-all.ps1`).
- I pagamenti reali (Stripe) non sono ancora integrati. L'admin conferma manualmente con `PUT /api/payments/{id}`.
- Se `GET /api/auth/me` risponde 401 dopo un riavvio, esegui logout/login per rigenerare i token.

