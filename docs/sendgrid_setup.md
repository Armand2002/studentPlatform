# SendGrid — Setup e test rapido

Questa guida spiega come configurare SendGrid per l'ambiente di sviluppo/staging e come testare gli invii senza interrompere l'ambiente di produzione.

1) Variabili d'ambiente richieste

Aggiungi nel file `backend/.env` (o nel secret manager usato in produzione):

```
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@tutoring-platform.com
SENDGRID_FROM_NAME="Tutoring Platform"
SENDGRID_TEMPLATE_BOOKING_CONFIRMED=d-booking-confirmed
SENDGRID_TEMPLATE_BOOKING_CANCELLED=d-booking-cancelled
SENDGRID_TEMPLATE_BOOKING_RESCHEDULED=d-booking-rescheduled
SENDGRID_TEMPLATE_PACKAGE_ASSIGNED=d-package-assigned
SENDGRID_TEMPLATE_PACKAGE_EXPIRING=d-package-expiring
FRONTEND_URL=http://localhost:3000
```

2) Modalità sicura per testare (consigliata)

- Usa Mailtrap o la SendGrid sandbox per evitare invii reali.
- In Mailtrap ottieni le credenziali SMTP o API e imposta `SENDGRID_API_KEY` con la chiave di Mailtrap per testare.

3) Comandi per verificare la configurazione dentro il container Docker

```powershell
# Controlla se la chiave è impostata
docker-compose -f backend/docker-compose.yml exec web sh -c "python - <<'PY'\nimport os\nprint('SENDGRID_API_KEY set =', bool(os.getenv('SENDGRID_API_KEY')) )\nprint('SENDGRID_FROM_EMAIL =', os.getenv('SENDGRID_FROM_EMAIL'))\nPY"

# Controlla che il client SendGrid sia inizializzato
docker-compose -f backend/docker-compose.yml exec web sh -c "python - <<'PY'\nfrom app.services.email_service import email_service\nprint('sendgrid client configured =', email_service.client is not None)\nPY"
```

4) Test d'invio (ESEGUI SOLO SE HAI UNA CHIAVE DI TEST)

```powershell
# Invia una email di test usando lo helper (attiverà un invio reale se la chiave è valida)
docker-compose -f backend/docker-compose.yml exec -T web sh -c "python - <<'PY'\nimport asyncio, os\nfrom app.services.email_service import email_service\nasync def main():\n    if not email_service.client:\n        print('SendGrid non configurato, aborting test send.')\n        return\n    ok = await email_service._send_email(\n        to_email='tuo.indirizzo@example.com',\n        to_name='Test User',\n        template_id=os.getenv('SENDGRID_TEMPLATE_BOOKING_CONFIRMED','d-booking-confirmed'),\n        template_data={'student_name':'Test','tutor_name':'Tutor','subject':'Test','date':'01/01/2026','time':'12:00','booking_id':0,'platform_url':'http://localhost:3000'},\n        subject='Test invio email'\n    )\n    print('send result =', ok)\nasyncio.run(main())\nPY"
```

5) Problemi comuni

- `SENDGRID_API_KEY not configured` -> assicurati di aver caricato `.env` o impostato la variabile in Docker Compose/secret manager.
- Errori 401 dalla API -> chiave non valida o permessi insufficienti.
- Errori 429 -> rate limit: applica retry/backoff o usa la sandbox.

Se vuoi, posso:
- aggiungere supporto temporaneo per `SENDGRID_SANDBOX=true` che abilita la modalità sandbox di SendGrid (non invia email reali);
- eseguire io un test d'invio se mi fornisci una chiave di test o se vuoi usare Mailtrap.
