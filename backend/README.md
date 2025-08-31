# Tutoring Platform Backend

## Overview
Backend API for online tutoring platform built with FastAPI.

## Features
- User authentication and authorization
- Lesson booking system
- Payment processing
- File management
- Google Calendar integration
- Email notifications
- Admin dashboard
- Analytics and reporting

## Tech Stack
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic (migrations)
- JWT authentication
- Google APIs
- Docker

## Setup

### Prerequisites
- Python 3.11+
cd backend
Email service
-------------
The project includes a lightweight SendGrid-based email service at `app/services/email_service.py`.
It exposes trigger functions used by bookings and admin flows (e.g. `trigger_booking_confirmed`, `trigger_booking_cancelled`, `trigger_package_assigned`).
Configure SendGrid credentials in `.env` using variables prefixed `SENDGRID_` and add template IDs to `.env.example`.
```

```bash
pip install -r requirements/development.txt
```

4. Setup environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Setup database
```bash
# Create database
createdb tutoring

# Run migrations
alembic upgrade head
```

6. Run development server
```bash
uvicorn app.main:app --reload
```

## API Documentation
Visit http://localhost:8000/docs for interactive API documentation.

## Project Structure
```
backend/
├── app/                    # Main application
│   ├── core/              # Core configuration
│   ├── auth/              # Authentication
│   ├── users/             # User management
│   ├── bookings/          # Lesson bookings
│   └── ...
├── migrations/            # Database migrations
├── tests/                 # Test suite
├── requirements/          # Dependencies
└── docs/                  # Documentation
```

## Contributing
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request
