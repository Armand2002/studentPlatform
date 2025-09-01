# Backend Structure - Tutoring Platform

> ⚠️ Nota (31-08-2025): la struttura mostrata include elementi storici; alcuni moduli
> come `app/notifications` e `app/files` sono stati rimossi dal codice. Per lo stato
> corrente vedere `docs/backend_changes.md`.


```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI app entry point
│   │
│   ├── core/                       # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py              # Settings & environment variables
│   │   ├── database.py            # Database connection & session
│   │   ├── security.py            # Security utilities
│   │   └── exceptions.py          # Custom exception handlers
│   │
│   ├── auth/                       # Authentication module (già fatto)
│   │   ├── __init__.py
│   │   ├── models.py              # User, UserSession, PasswordReset
│   │   ├── schemas.py             # Pydantic models for auth
│   │   ├── routes.py              # Auth endpoints
│   │   ├── services.py            # Auth business logic
│   │   ├── dependencies.py        # Auth dependencies
│   │   ├── middleware.py          # Auth middleware
│   │   └── utils.py               # JWT utilities
│   │
│   ├── users/                      # User management
│   │   ├── __init__.py
│   │   ├── models.py              # Student, Tutor profiles
│   │   ├── schemas.py             # User data schemas
│   │   ├── routes.py              # User CRUD endpoints
│   │   ├── services.py            # User business logic
│   │   └── dependencies.py        # User-specific dependencies
│   │
│   ├── packages/                   # Learning packages
│   │   ├── __init__.py
│   │   ├── models.py              # Package, PackageContent
│   │   ├── schemas.py             # Package schemas
│   │   ├── routes.py              # Package endpoints
│   │   ├── services.py            # Package logic
│   │   └── dependencies.py        # Package dependencies
│   │
│   ├── bookings/                   # Lesson bookings
│   │   ├── __init__.py
│   │   ├── models.py              # Booking, BookingStatus
│   │   ├── schemas.py             # Booking schemas
│   │   ├── routes.py              # Booking endpoints
│   │   ├── services.py            # Booking logic
│   │   ├── dependencies.py        # Booking dependencies
│   │   └── calendar_service.py    # Google Calendar integration
│   │
│   ├── payments/                   # Payment management
│   │   ├── __init__.py
│   │   ├── models.py              # Payment, Transaction
│   │   ├── schemas.py             # Payment schemas
│   │   ├── routes.py              # Payment endpoints
│   │   ├── services.py            # Payment logic
│   │   └── dependencies.py        # Payment dependencies
│   │
│   ├── files/                      # File management
│   │   ├── __init__.py
│   │   ├── models.py              # File, FilePermission
│   │   ├── schemas.py             # File schemas
│   │   ├── routes.py              # File upload/download endpoints
│   │   ├── services.py            # File handling logic
│   │   ├── storage.py             # File storage (local/S3)
│   │   └── dependencies.py        # File dependencies
│   │
│   ├── slots/                      # Tutor availability
│   │   ├── __init__.py
│   │   ├── models.py              # TutorSlot, SlotTemplate
│   │   ├── schemas.py             # Slot schemas
│   │   ├── routes.py              # Slot management endpoints
│   │   ├── services.py            # Slot logic
│   │   └── dependencies.py        # Slot dependencies
│   │
│   ├── notifications/              # Email/push notifications
│   │   ├── __init__.py
│   │   ├── models.py              # Notification, NotificationTemplate
│   │   ├── schemas.py             # Notification schemas
│   │   ├── routes.py              # Notification endpoints
│   │   ├── services.py            # Notification logic
│   │   ├── email_service.py       # Email sending
│   │   └── templates/             # Email templates
│   │       ├── booking_confirmation.html
│   │       ├── payment_received.html
│   │       └── password_reset.html
│   │
│   ├── analytics/                  # Analytics & reporting
│   │   ├── __init__.py
│   │   ├── models.py              # Analytics models
│   │   ├── schemas.py             # Analytics schemas
│   │   ├── routes.py              # Analytics endpoints
│   │   └── services.py            # Analytics logic
│   │
│   ├── integrations/               # External integrations
│   │   ├── __init__.py
│   │   ├── google/                # Google services
│   │   │   ├── __init__.py
│   │   │   ├── calendar.py        # Google Calendar API
│   │   │   ├── oauth.py           # Google OAuth
│   │   │   └── forms.py           # Google Forms API
│   │   ├── whatsapp/              # WhatsApp integration
│   │   │   ├── __init__.py
│   │   │   └── api.py
│   │   └── telegram/              # Telegram integration
│   │       ├── __init__.py
│   │       └── bot.py
│   │
│   ├── admin/                      # Admin functionality
│   │   ├── __init__.py
│   │   ├── models.py              # Admin-specific models
│   │   ├── schemas.py             # Admin schemas
│   │   ├── routes.py              # Admin endpoints
│   │   ├── services.py            # Admin logic
│   │   └── dashboard.py           # Dashboard data
│   │
│   ├── utils/                      # Shared utilities
│   │   ├── __init__.py
│   │   ├── validators.py          # Custom validators
│   │   ├── helpers.py             # Helper functions
│   │   ├── constants.py           # App constants
│   │   ├── decorators.py          # Custom decorators
│   │   └── exceptions.py          # Custom exceptions
│   │
│   └── middleware/                 # Custom middleware
│       ├── __init__.py
│       ├── cors.py                # CORS middleware
│       ├── logging.py             # Request logging
│       └── rate_limiting.py       # Rate limiting
│
├── migrations/                     # Database migrations (Alembic)
│   ├── versions/
│   ├── env.py
│   ├── script.py.mako
│   └── alembic.ini
│
├── tests/                          # Test suite
│   ├── __init__.py
│   ├── conftest.py                # Test configuration
│   ├── test_auth/                 # Auth tests
│   │   ├── __init__.py
│   │   ├── test_routes.py
│   │   ├── test_services.py
│   │   └── test_models.py
│   ├── test_users/                # User tests
│   ├── test_bookings/             # Booking tests
│   ├── test_payments/             # Payment tests
│   └── test_files/                # File tests
│
├── scripts/                        # Utility scripts
│   ├── __init__.py
│   ├── create_admin.py            # Create admin user
│   ├── migrate_data.py            # Data migration
│   ├── backup_db.py               # Database backup
│   └── seed_data.py               # Seed development data
│
├── static/                         # Static files
│   ├── uploads/                   # File uploads
│   │   ├── pdfs/
│   │   ├── images/
│   │   └── temp/
│   └── assets/                    # Static assets
│       ├── logos/
│       └── templates/
│
├── logs/                          # Application logs
│   ├── app.log
│   ├── error.log
│   └── access.log
│
├── docs/                          # Documentation
│   ├── api.md
│   ├── setup.md
│   ├── deployment.md
│   └── database_schema.md
│
├── requirements/                   # Dependencies
│   ├── base.txt                   # Base requirements
│   ├── development.txt            # Development dependencies
│   ├── production.txt             # Production dependencies
│   └── testing.txt                # Testing dependencies
│
├── .env.example                   # Environment variables template
├── .env.development               # Development environment
├── .env.testing                   # Testing environment
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── requirements.txt               # Main requirements file
├── pytest.ini                    # Pytest configuration
├── alembic.ini                    # Alembic configuration
└── README.md

```

## File principali da creare

### 1. app/main.py
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.auth.routes import router as auth_router
from app.users.routes import router as users_router
from app.bookings.routes import router as bookings_router
# ... altri router

app = FastAPI(title="Tutoring Platform API", version="1.0.0")

# CORS
app.add_middleware(CORSMiddleware, **settings.CORS_CONFIG)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(bookings_router, prefix="/api/bookings", tags=["bookings"])

@app.get("/")
async def root():
    return {"message": "Tutoring Platform API"}
```

### 2. app/core/config.py
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:pass@localhost/tutoring"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Google APIs
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    
    # File Storage
    UPLOAD_DIR: str = "static/uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Email
    SMTP_HOST: str
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### 3. requirements/base.txt
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.7
pydantic[email]==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
google-api-python-client==2.108.0
google-auth-httplib2==0.1.1
google-auth-oauthlib==1.1.0
PyPDF2==3.0.1
python-dotenv==1.0.0
```

Questa struttura è:
- **Modulare**: Ogni feature ha il suo modulo
- **Scalabile**: Facile aggiungere nuove funzionalità
- **Testabile**: Ogni modulo può essere testato indipendentemente
- **Mantenibile**: Separazione chiara delle responsabilità

Vuoi che approfondiamo qualche modulo specifico?