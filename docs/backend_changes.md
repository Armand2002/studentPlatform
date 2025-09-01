# Backend — Modifiche e Cleanup

Questa pagina riassume le modifiche principali applicate al backend per semplificare il progetto.

Cosa è stato rimosso (code-level):

- `app/notifications/` — sistema notifiche in-app rimosso (sostituito da email via SendGrid)
- `app/files/` — sistema file upload e storage rimosso
- `static/uploads/` — directory upload rimossa

Cosa è stato aggiunto:

- `app/services/email_service.py` — servizio email basato su SendGrid con trigger per booking e assegnazione pacchetti
- `.env.example` aggiornato con variabili SendGrid

Rimozioni infrastrutturali:

- Redis e Celery rimossi dallo stack (non più necessari per caching/queue nel progetto semplificato)
- Aggiornato `backend/docker-compose.yml` per rimuovere il servizio `redis`
- Rimosso `redis` e `celery` da `backend/requirements/production.txt`

Dipendenze aggiornate:

- `sendgrid==6.10.0` aggiunto
- `python-multipart` / `aiofiles` rimossi dalle requirements (se non necessari)

Note operative:

- La rimozione riguarda i moduli di codice. La documentazione storica (roadmap, platform features, documenti di progetto) mantiene riferimenti per contesto e può essere pulita se desideri.
- `app/payments/` è rimasto ma ora implementa pagamenti offline amministrativi (no dipendenza Stripe nel codice). Questo è intenzionale secondo la roadmap.

Comandi utili per verificare lo stato corrente:

```powershell
# Lista container Docker
docker-compose -f backend/docker-compose.yml ps

# Segui i log del web
docker-compose -f backend/docker-compose.yml logs -f web

# Controlla che il servizio email sia caricato e che SendGrid sia configurato (dentro il container)
docker-compose -f backend/docker-compose.yml exec web sh -c "python - <<'PY'\nfrom app.services.email_service import email_service\nprint('sendgrid client configured =', email_service.client is not None)\nPY"
```

Se vuoi, posso:

- migrare altri file di documentazione in questa cartella `docs/`;
- generare una versione pulita del `DOCUMENTATION.md` priva di riferimenti a moduli rimossi;
- aggiungere una sezione `how-to-revert` nel caso volessi ripristinare componenti archiviati.
