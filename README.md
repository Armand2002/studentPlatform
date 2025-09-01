# studentPlatform

Questa repository contiene il backend e frontend del progetto studentPlatform.

La documentazione è stata riorganizzata in `docs/` per rendere più semplice la navigazione.

Vedi la documentazione principale qui:

- `docs/index.md` — indice della documentazione e pagine rapide
- `docs/backend_changes.md` — riepilogo delle modifiche al backend (cleanup, email service)
- `docs/sendgrid_setup.md` — istruzioni per configurare e testare SendGrid

Per avviare rapidamente i container Docker (backend):

```powershell
docker-compose -f backend/docker-compose.yml up -d --build
```

Se vuoi che sposti altri documenti dentro `docs/` o che generi una versione PDF della documentazione, dimmi quali file prioritizzare.