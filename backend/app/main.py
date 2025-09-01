"""
FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine
from app.core.database import SessionLocal

# Create FastAPI app
app = FastAPI(
    title="Tutoring Platform API",
    description="API for online tutoring platform",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# Import models after app creation to avoid circular imports
from app.core import models

# Import routers
from app.auth.routes import router as auth_router
from app.users.routes import router as users_router
from app.bookings.routes import router as bookings_router
from app.pricing.routes import router as pricing_router  # 🆕 NUOVO IMPORT
from app.payments.routes import router as payments_router
from app.packages.routes import router as packages_router
from app.slots.routes import router as slots_router
from app.analytics.routes import router as analytics_router
from app.core.config import settings
from app.utils.seed import seed_users

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(bookings_router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(pricing_router, prefix="/api/pricing", tags=["Pricing"])  # 🆕 NUOVO ROUTER
# files module removed/archived; file routes not included
app.include_router(payments_router, prefix="/api/payments", tags=["Payments"])
app.include_router(packages_router, prefix="/api/packages", tags=["Packages"])
app.include_router(slots_router, prefix="/api/slots", tags=["Slots"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])
from app.admin.routes import router as admin_router

# admin_router already sets its own prefix
app.include_router(admin_router)

@app.get("/")
async def root():
    return {"message": "Tutoring Platform API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
def startup_seed():
    if settings.AUTO_SEED:
        db = SessionLocal()
        try:
            seed_users(db)
        finally:
            db.close()
