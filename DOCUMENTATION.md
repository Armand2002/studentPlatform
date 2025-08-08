# Documentazione Tecnica - Student Platform

## Indice
1. [Overview del Progetto](#1-overview-del-progetto)
2. [Analisi dei Requisiti](#2-analisi-dei-requisiti)
3. [Architettura del Sistema](#3-architettura-del-sistema)
4. [Modelli di Dati e Database Schema](#4-modelli-di-dati-e-database-schema)
5. [API Specification](#5-api-specification)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Integrazione Google Calendar](#7-integrazione-google-calendar)
8. [Sicurezza e Autenticazione](#8-sicurezza-e-autenticazione)
9. [User Flows](#9-user-flows)
10. [Testing Strategy](#10-testing-strategy)
11. [Deployment](#11-deployment)

---

## 1. Overview del Progetto

### 1.1 Descrizione
La **Student Platform** è una piattaforma online per la gestione di lezioni private e materiale didattico. Il sistema facilita l'interazione tra studenti, tutor e amministratori per prenotare lezioni, gestire contenuti educativi e monitorare i progressi.

### 1.2 Obiettivi Principali
- **Gestione Completa delle Lezioni**: Sistema di prenotazione e calendario integrato
- **Accesso Controllato ai Materiali**: Contenuti disponibili solo per pacchetti acquistati
- **Amministrazione Centralizzata**: Dashboard per controllo pagamenti e monitoraggio
- **Scalabilità**: Architettura modulare per future espansioni

### 1.3 Stack Tecnologico

#### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL con SQLAlchemy ORM
- **Autenticazione**: JWT tokens con refresh token
- **Migrazioni**: Alembic
- **File Storage**: Sistema locale (espandibile a S3)

#### Frontend
- **Framework**: Next.js 15 con TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React, Heroicons

#### Integrazioni
- **Google Calendar API**: Sincronizzazione appuntamenti
- **Email**: SMTP per notifiche
- **Docker**: Containerizzazione completa

---

## 2. Analisi dei Requisiti

### 2.1 Profili Utente

#### 2.1.1 Studenti
**Dati Profilo:**
- Nome, Cognome
- Data di nascita
- Istituto, Classe
- Indirizzo
- Numero di telefono

**Funzionalità:**
- ✅ Visualizzazione materiale didattico dei pacchetti acquistati
- ✅ Sistema di prenotazione lezioni
- ✅ Storico lezioni effettuate
- ✅ Lista tutor di riferimento
- ✅ Download file e materiali

#### 2.1.2 Tutor
**Funzionalità:**
- ✅ Visuale studenti associati
- ✅ Storico lezioni (effettuate/prenotate)
- ✅ Sistema caricamento file
- ✅ Gestione disponibilità (slot)
- ✅ Monitoraggio pagamenti

#### 2.1.3 Amministratore
**Funzionalità:**
- ✅ Conferma pagamenti studenti
- ✅ Conferma pagamenti tutor
- ✅ Dashboard lezioni prenotate
- ✅ Dashboard lezioni effettuate
- ✅ Gestione pacchetti e categorie
- ✅ Sistema dilazione pagamenti

### 2.2 User Stories

#### Visitatori
- **US-V1**: Come visitatore, devo poter compilare un form per ottenere informazioni e creare un profilo studente
- **US-V2**: Come visitatore, devo poter comprendere il processo di acquisto pacchetti

#### Studenti
- **US-S1**: Come studente, devo poter visualizzare sempre il materiale dei pacchetti acquistati per studiare autonomamente
- **US-S2**: Come studente, devo poter vedere le lezioni prenotate per organizzarmi
- **US-S3**: Como studente, devo poter vedere storico, ore rimanenti e scadenza pacchetti
- **US-S4**: Come studente, devo poter visualizzare i contatti dei tutor per comunicazioni dirette

#### Tutor
- **US-T1**: Come tutor, devo poter visualizzare storico studenti passati e attuali
- **US-T2**: Come tutor, devo poter vedere lezioni effettuate/prenotate e stato pagamenti

#### Amministratori
- **US-A1**: Come admin, devo poter confermare pagamenti studenti per verifiche contabili
- **US-A2**: Come admin, devo poter dilazionare costi pacchetti per flessibilità economica
- **US-A3**: Come admin, devo poter inserire nuove categorie di pacchetto per espansione offerta

### 2.3 Business Rules

#### Pacchetti
- **Scadenza**: 30 giorni dall'attivazione
- **Contenuto**: Materiale didattico specifico per materia/livello
- **Accesso**: Solo studenti con pacchetto attivo
- **Ore**: Consumo progressivo delle ore acquistate

#### Prenotazioni
- **Vincoli**: Solo con pacchetto attivo e ore disponibili
- **Cancellazione**: Possibile fino a X ore prima
- **Conferma**: Automatica o manuale (configurabile)

---

## 3. Architettura del Sistema

### 3.1 Architettura Generale

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Integrations  │
                    │  (Google Cal)   │
                    └─────────────────┘
```

### 3.2 Backend Architecture

#### 3.2.1 Struttura Modulare
```
app/
├── core/           # Configurazione e utilità base
├── auth/           # Autenticazione e autorizzazione
├── users/          # Gestione profili utente
├── packages/       # Gestione pacchetti didattici
├── bookings/       # Prenotazioni e lezioni
├── files/          # Upload e gestione file
├── slots/          # Disponibilità tutor
├── payments/       # Gestione pagamenti
├── notifications/  # Sistema notifiche
├── analytics/      # Dashboard e reportistica
├── admin/          # Funzionalità amministrative
└── integrations/   # Integrazioni esterne
```

#### 3.2.2 Pattern Architetturali
- **Repository Pattern**: Separazione logica dati
- **Service Layer**: Business logic centralizzata
- **Dependency Injection**: FastAPI dependencies
- **Event-Driven**: Notifiche automatiche

### 3.3 Frontend Architecture

#### 3.3.1 Struttura Next.js
```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── (auth)/            # Gruppi di route autenticazione
│   ├── dashboard/         # Dashboard utenti
│   ├── admin/             # Panel amministrativo
│   └── api/               # API routes (proxy)
├── components/            # Componenti riutilizzabili
│   ├── ui/                # Componenti base UI
│   ├── forms/             # Form specializzati
│   └── layout/            # Layout componenti
├── lib/                   # Utilità e configurazioni
│   ├── api.ts             # Client API
│   ├── auth.ts            # Gestione autenticazione
│   └── utils.ts           # Utilità generali
└── types/                 # TypeScript definitions
```

#### 3.3.2 Routing Structure
```
/                          # Landing page
/auth/login               # Login utenti
/auth/register            # Registrazione
/dashboard                # Dashboard generale
  ├── /packages           # Gestione pacchetti
  ├── /bookings          # Prenotazioni
  ├── /files             # Materiali didattici
  └── /profile           # Profilo utente
/admin                    # Panel amministrativo
  ├── /users             # Gestione utenti
  ├── /payments          # Gestione pagamenti
  └── /analytics         # Dashboard analytics
```

---

## 4. Modelli di Dati e Database Schema

### 4.1 Diagramma ERD

```mermaid
erDiagram
    User {
        int id PK
        string email UK
        string hashed_password
        enum role
        boolean is_active
        boolean is_verified
        datetime created_at
        datetime updated_at
    }
    
    Student {
        int id PK
        int user_id FK
        string first_name
        string last_name
        date date_of_birth
        string institute
        string class_level
        text address
        string phone_number
        datetime created_at
        datetime updated_at
    }
    
    Tutor {
        int id PK
        int user_id FK
        string first_name
        string last_name
        text bio
        text subjects
        int hourly_rate
        boolean is_available
        datetime created_at
        datetime updated_at
    }
    
    Package {
        int id PK
        int tutor_id FK
        string name
        text description
        int total_hours
        decimal price
        string subject
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    
    PackagePurchase {
        int id PK
        int student_id FK
        int package_id FK
        datetime purchase_date
        date expiry_date
        int hours_used
        int hours_remaining
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    
    Booking {
        int id PK
        int student_id FK
        int tutor_id FK
        int package_purchase_id FK
        datetime start_time
        datetime end_time
        int duration_hours
        string subject
        text notes
        enum status
        datetime created_at
        datetime updated_at
    }
    
    File {
        int id PK
        int tutor_id FK
        string filename
        string original_filename
        string file_path
        int file_size
        string mime_type
        string subject
        text description
        boolean is_public
        datetime created_at
        datetime updated_at
    }
    
    Slot {
        int id PK
        int tutor_id FK
        datetime start_time
        datetime end_time
        boolean is_available
        string notes
        datetime created_at
        datetime updated_at
    }

    User ||--o| Student : has
    User ||--o| Tutor : has
    Tutor ||--o{ Package : creates
    Student ||--o{ PackagePurchase : buys
    Package ||--o{ PackagePurchase : purchased_as
    PackagePurchase ||--o{ Booking : used_for
    Student ||--o{ Booking : books
    Tutor ||--o{ Booking : teaches
    Tutor ||--o{ File : uploads
    Tutor ||--o{ Slot : has_availability
```

### 4.2 Descrizione Tabelle

#### 4.2.1 Users & Profiles
- **users**: Tabella base per autenticazione
- **students**: Profilo esteso studenti con dati anagrafici
- **tutors**: Profilo esteso tutor con competenze e tariffe

#### 4.2.2 Educational Content
- **packages**: Pacchetti didattici con ore e materiali
- **package_purchases**: Istanze acquistate con scadenze
- **files**: Materiali didattici caricati dai tutor

#### 4.2.3 Scheduling
- **slots**: Disponibilità orarie dei tutor
- **bookings**: Prenotazioni effettuate con stato

#### 4.2.4 Constraints e Indexes
```sql
-- Unique constraints
ALTER TABLE students ADD CONSTRAINT uk_students_user_id UNIQUE (user_id);
ALTER TABLE tutors ADD CONSTRAINT uk_tutors_user_id UNIQUE (user_id);

-- Indexes per performance
CREATE INDEX idx_bookings_student_id ON bookings(student_id);
CREATE INDEX idx_bookings_tutor_id ON bookings(tutor_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_package_purchases_student_id ON package_purchases(student_id);
CREATE INDEX idx_package_purchases_expiry_date ON package_purchases(expiry_date);
```

---

## 5. API Specification

### 5.1 Authentication Endpoints

#### POST /api/auth/login
```json
{
  "request": {
    "email": "string",
    "password": "string"
  },
  "response": {
    "access_token": "string",
    "refresh_token": "string",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "email": "string",
      "role": "student|tutor|admin"
    }
  }
}
```

#### POST /api/auth/register
```json
{
  "request": {
    "email": "string",
    "password": "string",
    "role": "student|tutor",
    "profile_data": {
      "first_name": "string",
      "last_name": "string",
      // ... altri campi specifici per ruolo
    }
  },
  "response": {
    "message": "Registration successful",
    "user_id": 1
  }
}
```

### 5.2 Users Endpoints

#### GET /api/users/profile
```json
{
  "response": {
    "id": 1,
    "email": "string",
    "role": "student",
    "profile": {
      "first_name": "string",
      "last_name": "string",
      "date_of_birth": "2000-01-01",
      "institute": "string",
      "class_level": "string",
      "address": "string",
      "phone_number": "string"
    }
  }
}
```

### 5.3 Packages Endpoints

#### GET /api/packages
```json
{
  "response": [
    {
      "id": 1,
      "name": "Matematica Base",
      "description": "string",
      "total_hours": 10,
      "price": "100.00",
      "subject": "Matematica",
      "tutor": {
        "id": 1,
        "first_name": "string",
        "last_name": "string"
      }
    }
  ]
}
```

#### POST /api/packages/{package_id}/purchase
```json
{
  "request": {
    "payment_method": "string"
  },
  "response": {
    "purchase_id": 1,
    "expiry_date": "2024-02-07",
    "hours_remaining": 10,
    "status": "active"
  }
}
```

### 5.4 Bookings Endpoints

#### POST /api/bookings
```json
{
  "request": {
    "tutor_id": 1,
    "package_purchase_id": 1,
    "start_time": "2024-01-15T10:00:00Z",
    "duration_hours": 2,
    "subject": "Matematica",
    "notes": "Revisione equazioni"
  },
  "response": {
    "booking_id": 1,
    "status": "pending",
    "end_time": "2024-01-15T12:00:00Z"
  }
}
```

#### GET /api/bookings
```json
{
  "response": [
    {
      "id": 1,
      "start_time": "2024-01-15T10:00:00Z",
      "end_time": "2024-01-15T12:00:00Z",
      "duration_hours": 2,
      "subject": "Matematica",
      "status": "confirmed",
      "tutor": {
        "first_name": "string",
        "last_name": "string"
      },
      "student": {
        "first_name": "string",
        "last_name": "string"
      }
    }
  ]
}
```

### 5.5 Files Endpoints

#### POST /api/files/upload
```json
{
  "form_data": {
    "file": "binary",
    "subject": "string",
    "description": "string",
    "is_public": false
  },
  "response": {
    "file_id": 1,
    "filename": "string",
    "download_url": "/api/files/1/download"
  }
}
```

#### GET /api/files/my-materials
```json
{
  "response": [
    {
      "id": 1,
      "filename": "lezione_01.pdf",
      "subject": "Matematica",
      "description": "string",
      "file_size": 1024000,
      "created_at": "2024-01-01T00:00:00Z",
      "download_url": "/api/files/1/download"
    }
  ]
}
```

### 5.6 Admin Endpoints

#### GET /api/admin/dashboard
```json
{
  "response": {
    "total_students": 150,
    "total_tutors": 25,
    "pending_payments": 10,
    "completed_lessons_today": 5,
    "upcoming_lessons": 20,
    "revenue_this_month": "5000.00"
  }
}
```

#### POST /api/admin/payments/{payment_id}/confirm
```json
{
  "request": {
    "confirmed": true,
    "notes": "string"
  },
  "response": {
    "status": "confirmed",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

## 6. Frontend Architecture

### 6.1 Component Structure

#### 6.1.1 Layout Components
```typescript
// components/layout/DashboardLayout.tsx
interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  sidebar?: React.ReactNode;
}

// components/layout/Sidebar.tsx
interface SidebarProps {
  role: 'student' | 'tutor' | 'admin';
  activeItem?: string;
}
```

#### 6.1.2 Form Components
```typescript
// components/forms/BookingForm.tsx
interface BookingFormProps {
  tutorId: number;
  packagePurchaseId: number;
  availableSlots: Slot[];
  onSubmit: (data: BookingFormData) => void;
}

// components/forms/ProfileForm.tsx
interface ProfileFormProps {
  initialData?: UserProfile;
  onSubmit: (data: ProfileFormData) => void;
  isEditing?: boolean;
}
```

#### 6.1.3 Data Display Components
```typescript
// components/ui/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
}

// components/ui/Calendar.tsx
interface CalendarProps {
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  editable?: boolean;
}
```

### 6.2 State Management

#### 6.2.1 Auth Context
```typescript
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
}
```

#### 6.2.2 API Client
```typescript
// lib/api.ts
class ApiClient {
  private baseURL: string;
  private authToken: string | null;

  async get<T>(endpoint: string): Promise<T>;
  async post<T>(endpoint: string, data: any): Promise<T>;
  async put<T>(endpoint: string, data: any): Promise<T>;
  async delete<T>(endpoint: string): Promise<T>;
}
```

### 6.3 Route Protection

```typescript
// components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
  fallback?: React.ReactNode;
}

// middleware.ts (Next.js)
export function middleware(request: NextRequest) {
  // Token validation and role-based routing
}
```

---

## 7. Integrazione Google Calendar

### 7.1 Setup e Configurazione

#### 7.1.1 OAuth 2.0 Setup
```python
# app/integrations/google/oauth.py
class GoogleOAuthService:
    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI
    
    async def get_authorization_url(self) -> str:
        # Generate OAuth URL
    
    async def exchange_code_for_tokens(self, code: str) -> dict:
        # Exchange authorization code for tokens
```

#### 7.1.2 Calendar Service
```python
# app/integrations/google/calendar.py
class GoogleCalendarService:
    async def create_event(self, booking: Booking) -> str:
        """Create calendar event and return event_id"""
    
    async def update_event(self, event_id: str, booking: Booking):
        """Update existing calendar event"""
    
    async def delete_event(self, event_id: str):
        """Delete calendar event"""
    
    async def get_free_busy(self, tutor_email: str, start: datetime, end: datetime):
        """Get tutor availability"""
```

### 7.2 Booking Workflow con Calendar

#### 7.2.1 Creazione Prenotazione
```python
# app/bookings/services.py
async def create_booking(booking_data: BookingCreate, user: User):
    # 1. Validate package purchase and hours
    # 2. Check tutor availability
    # 3. Create booking in database
    booking = await booking_repository.create(booking_data)
    
    # 4. Create Google Calendar event
    calendar_service = GoogleCalendarService()
    event_id = await calendar_service.create_event(booking)
    
    # 5. Update booking with calendar event ID
    booking.calendar_event_id = event_id
    await booking_repository.update(booking)
    
    # 6. Send notifications
    await notification_service.send_booking_confirmation(booking)
    
    return booking
```

#### 7.2.2 Sincronizzazione Bidirezionale
```python
# Webhook per eventi Google Calendar
@router.post("/webhook/google-calendar")
async def google_calendar_webhook(request: Request):
    # Handle calendar events changes
    # Update corresponding bookings in database
```

---

## 8. Sicurezza e Autenticazione

### 8.1 JWT Authentication

#### 8.1.1 Token Structure
```python
# app/core/security.py
def create_access_token(data: dict, expires_delta: timedelta = None):
    payload = {
        "sub": str(data["user_id"]),
        "role": data["role"],
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + (expires_delta or timedelta(minutes=30))
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
```

#### 8.1.2 Refresh Token Flow
```python
async def refresh_access_token(refresh_token: str):
    # 1. Validate refresh token
    # 2. Check if not revoked
    # 3. Generate new access token
    # 4. Optionally rotate refresh token
```

### 8.2 Authorization & Permissions

#### 8.2.1 Role-Based Access Control
```python
# app/auth/dependencies.py
def require_role(allowed_roles: List[UserRole]):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return dependency

# Utilizzo negli endpoint
@router.get("/admin/dashboard")
async def admin_dashboard(admin: User = Depends(require_role([UserRole.ADMIN]))):
    pass
```

#### 8.2.2 Resource-Level Permissions
```python
# Accesso ai materiali solo con pacchetto attivo
async def check_material_access(file_id: int, student: Student):
    file = await file_repository.get(file_id)
    active_purchases = await package_repository.get_active_purchases(student.id)
    
    # Verifica se lo studente ha accesso al materiale
    for purchase in active_purchases:
        if purchase.package.tutor_id == file.tutor_id:
            return True
    
    raise HTTPException(status_code=403, detail="No access to this material")
```

### 8.3 Data Validation & Sanitization

#### 8.3.1 Pydantic Schemas
```python
# app/users/schemas.py
class StudentCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    date_of_birth: date
    institute: str = Field(..., min_length=2, max_length=100)
    class_level: str = Field(..., min_length=1, max_length=20)
    phone_number: str = Field(..., regex=r"^\+?[1-9]\d{1,14}$")
    
    @validator('date_of_birth')
    def validate_age(cls, v):
        if v > date.today():
            raise ValueError('Date of birth cannot be in the future')
        return v
```

### 8.4 File Upload Security

```python
# app/files/services.py
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def validate_file_upload(file: UploadFile):
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    # Scan for malware (implementazione futura)
    # await malware_scanner.scan(file)
```

---

## 9. User Flows

### 9.1 Student Journey

#### 9.1.1 Registrazione e Primo Acquisto
```mermaid
flowchart TD
    A[Visitatore] --> B[Form Contatto]
    B --> C[Informazioni Ricevute]
    C --> D[Creazione Account]
    D --> E[Scelta Pacchetto]
    E --> F[Processo Pagamento]
    F --> G[Attivazione Pacchetto]
    G --> H[Accesso Materiali]
    H --> I[Prenotazione Prima Lezione]
```

#### 9.1.2 Prenotazione Lezione
```mermaid
flowchart TD
    A[Login Student] --> B[Dashboard]
    B --> C[Visualizza Pacchetti Attivi]
    C --> D{Ore Disponibili?}
    D -->|No| E[Acquista Nuovo Pacchetto]
    D -->|Sì| F[Scegli Tutor]
    F --> G[Visualizza Disponibilità]
    G --> H[Seleziona Slot]
    H --> I[Conferma Prenotazione]
    I --> J[Evento Calendar Creato]
    J --> K[Notifica Email]
```

### 9.2 Tutor Workflow

#### 9.2.1 Gestione Disponibilità
```mermaid
flowchart TD
    A[Login Tutor] --> B[Dashboard]
    B --> C[Gestione Slot]
    C --> D[Imposta Disponibilità]
    D --> E[Sincronizza Calendar]
    E --> F[Ricevi Prenotazioni]
    F --> G[Conferma/Rifiuta]
    G --> H[Aggiorna Calendar]
```

#### 9.2.2 Upload Materiali
```mermaid
flowchart TD
    A[Tutor Dashboard] --> B[Sezione Materiali]
    B --> C[Upload File]
    C --> D[Validation]
    D --> E[Categorizzazione]
    E --> F[Pubblicazione]
    F --> G[Notifica Studenti]
```

### 9.3 Admin Workflow

#### 9.3.1 Gestione Pagamenti
```mermaid
flowchart TD
    A[Admin Login] --> B[Dashboard Pagamenti]
    B --> C[Pagamenti Pending]
    C --> D[Verifica Transazione]
    D --> E{Pagamento Valido?}
    E -->|Sì| F[Conferma Pagamento]
    E -->|No| G[Richiedi Documentazione]
    F --> H[Attiva Pacchetto]
    H --> I[Notifica Student]
    G --> J[Notifica Student]
```

---

## 10. Testing Strategy

### 10.1 Backend Testing

#### 10.1.1 Unit Tests
```python
# tests/test_auth/test_services.py
class TestAuthService:
    async def test_create_user_success(self):
        user_data = {
            "email": "test@example.com",
            "password": "password123",
            "role": UserRole.STUDENT
        }
        user = await auth_service.create_user(user_data)
        assert user.email == user_data["email"]
        assert user.is_active is True
    
    async def test_create_user_duplicate_email(self):
        # Test duplicate email handling
```

#### 10.1.2 Integration Tests
```python
# tests/test_bookings/test_routes.py
class TestBookingRoutes:
    async def test_create_booking_authenticated(self, client, student_token):
        headers = {"Authorization": f"Bearer {student_token}"}
        booking_data = {
            "tutor_id": 1,
            "package_purchase_id": 1,
            "start_time": "2024-01-15T10:00:00Z",
            "duration_hours": 2
        }
        response = await client.post("/api/bookings", json=booking_data, headers=headers)
        assert response.status_code == 201
```

#### 10.1.3 Database Tests
```python
# tests/test_models.py
class TestUserModel:
    async def test_student_profile_relationship(self):
        user = await create_test_user(role=UserRole.STUDENT)
        student = await create_test_student(user_id=user.id)
        
        # Test relationship loading
        user_with_profile = await user_repository.get_with_profile(user.id)
        assert user_with_profile.student_profile is not None
```

### 10.2 Frontend Testing

#### 10.2.1 Component Tests
```typescript
// __tests__/components/BookingForm.test.tsx
describe('BookingForm', () => {
  it('renders booking form correctly', () => {
    render(<BookingForm tutorId={1} packagePurchaseId={1} />);
    expect(screen.getByText('Select Date')).toBeInTheDocument();
    expect(screen.getByText('Select Time')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<BookingForm tutorId={1} packagePurchaseId={1} />);
    fireEvent.click(screen.getByText('Book Lesson'));
    
    await waitFor(() => {
      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });
  });
});
```

#### 10.2.2 End-to-End Tests
```typescript
// e2e/booking-flow.spec.ts
test('complete booking flow', async ({ page }) => {
  // Login as student
  await page.goto('/login');
  await page.fill('input[name="email"]', 'student@test.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to bookings
  await page.click('text=Book Lesson');
  
  // Select tutor and time
  await page.selectOption('select[name="tutor"]', '1');
  await page.fill('input[name="date"]', '2024-01-15');
  await page.selectOption('select[name="time"]', '10:00');
  
  // Submit booking
  await page.click('button[type="submit"]');
  
  // Verify success
  await expect(page.locator('text=Booking confirmed')).toBeVisible();
});
```

### 10.3 Performance Testing

#### 10.3.1 Load Testing
```python
# performance_tests/locustfile.py
from locust import HttpUser, task, between

class StudentUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login
        response = self.client.post("/api/auth/login", json={
            "email": "student@test.com",
            "password": "password123"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    @task(3)
    def view_dashboard(self):
        self.client.get("/api/users/dashboard", headers=self.headers)
    
    @task(2)
    def view_materials(self):
        self.client.get("/api/files/my-materials", headers=self.headers)
    
    @task(1)
    def create_booking(self):
        self.client.post("/api/bookings", json={
            "tutor_id": 1,
            "package_purchase_id": 1,
            "start_time": "2024-01-15T10:00:00Z",
            "duration_hours": 2
        }, headers=self.headers)
```

---

## 11. Deployment

### 11.1 Container Configuration

#### 11.1.1 Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/
COPY alembic.ini .
COPY migrations/ ./migrations/

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

#### 11.1.2 Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### 11.2 Docker Compose

#### 11.2.1 Development Environment
```yaml
# docker-compose.yml
version: '3.8'

services:
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: tutoring_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:password@database:5432/tutoring_platform
      SECRET_KEY: dev-secret-key
    depends_on:
      - database
    volumes:
      - ./backend:/app
      - ./static:/app/static

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### 11.3 Production Deployment

#### 11.3.1 Environment Variables
```bash
# .env.production
DATABASE_URL=postgresql://user:password@prod-db:5432/tutoring_platform
SECRET_KEY=super-secret-production-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALLOWED_HOSTS=["https://yourdomain.com"]
DEBUG=false
```

#### 11.3.2 Nginx Configuration
```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /app/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 11.4 CI/CD Pipeline

#### 11.4.1 GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v3
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          cd backend
          pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Deploy commands here
          docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Appendici

### A. Configurazione Sviluppo

#### A.1 Setup Locale
```bash
# Clone repository
git clone https://github.com/yourusername/studentPlatform.git
cd studentPlatform

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup database
createdb tutoring_platform
alembic upgrade head

# Setup frontend
cd ../frontend
npm install

# Start development servers
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev
```

#### A.2 Variabili d'Ambiente
```bash
# .env.development
DATABASE_URL=postgresql://postgres:password@localhost:5432/tutoring_platform
SECRET_KEY=dev-secret-key-change-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DEBUG=true
ALLOWED_HOSTS=["http://localhost:3000"]
```

### B. Troubleshooting Comune

#### B.1 Database Issues
- **Errore connessione**: Verificare che PostgreSQL sia in esecuzione
- **Migration fallite**: Controllare sintassi SQL e vincoli
- **Performance lente**: Verificare indici su tabelle grandi

#### B.2 Authentication Issues
- **Token scaduti**: Implementare refresh automatico
- **CORS errors**: Configurare correctly ALLOWED_HOSTS
- **Permission denied**: Verificare ruoli utente

#### B.3 File Upload Issues
- **File troppo grandi**: Aumentare MAX_FILE_SIZE
- **Estensioni non supportate**: Aggiornare ALLOWED_EXTENSIONS
- **Storage full**: Implementare cleanup automatico

---

*Documento creato il: {current_date}*
*Versione: 1.0*
*Ultimo aggiornamento: {current_date}*
