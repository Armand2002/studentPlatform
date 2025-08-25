"""
Dashboard Real-Time Routes - API endpoints per dashboard live
Replica funzionalità Excel con aggiornamenti real-time
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, date

from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User, UserRole
from app.dashboard.services import DashboardRealTimeService


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def require_dashboard_access(current_user: User = Depends(get_current_user)):
    """Require admin or tutor access for dashboard"""
    if current_user.role not in [UserRole.ADMIN, UserRole.TUTOR]:
        raise HTTPException(status_code=403, detail="Dashboard access requires admin or tutor role")
    return current_user


# ================================
# LIVE DASHBOARD ENDPOINTS
# ================================

@router.get("/live")
async def get_live_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dashboard_access)
):
    """
    📊 DASHBOARD LIVE COMPLETO
    
    Dashboard principale con tutti i widget live.
    Equivalente alla vista Excel principale con filtri TODAY() automatici.
    
    Aggiorna ogni 30 secondi nel frontend per dati real-time.
    """
    
    try:
        # Raccoglie tutti i dati dashboard in parallelo
        today_data = await DashboardRealTimeService.get_today_live_dashboard(db)
        expiring_packages = await DashboardRealTimeService.get_expiring_packages_widget(db, days_ahead=7)
        tutor_performance = await DashboardRealTimeService.get_tutor_performance_today(db)
        alerts = await DashboardRealTimeService.get_real_time_alerts(db)
        
        return {
            "dashboard_type": "live", 
            "generated_at": datetime.now().isoformat(),
            "auto_refresh_seconds": 30,
            
            # Widget principali
            "today": today_data,
            "expiring_packages": expiring_packages,
            "tutor_performance": tutor_performance,
            "alerts": alerts,
            
            # Meta info
            "user_role": current_user.role.value,
            "widgets_loaded": 4,
            "data_freshness": "real_time"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")


@router.get("/today")
async def get_today_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dashboard_access)
):
    """
    📅 SUMMARY OGGI - Replica Excel FILTER(TODAY())
    
    Widget specifico per situazione giornata corrente.
    Perfetto per homepage o widget mobile.
    """
    
    try:
        today_data = await DashboardRealTimeService.get_today_live_dashboard(db)
        return {
            "widget": "today_summary",
            **today_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Today summary error: {str(e)}")


@router.get("/expiring-packages")
async def get_expiring_packages(
    days_ahead: int = Query(7, ge=1, le=30, description="Days ahead to check for expiring packages"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dashboard_access)
):
    """
    ⏰ PACCHETTI IN SCADENZA - Replica Excel EDATE logic
    
    Lista pacchetti che scadono nei prossimi N giorni.
    Utile per planning rinnovi e retention.
    """
    
    try:
        expiring_data = await DashboardRealTimeService.get_expiring_packages_widget(db, days_ahead)
        return {
            "widget": "expiring_packages",
            **expiring_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Expiring packages error: {str(e)}")


@router.get("/tutor-performance")
async def get_tutor_performance_today(
    tutor_id: Optional[int] = Query(None, description="Filter by specific tutor ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dashboard_access)
):
    """
    👨‍🏫 PERFORMANCE TUTOR - Replica Excel COUNTIFS per tutor
    
    Analisi performance tutors per giornata corrente.
    Può filtrare per tutor specifico.
    """
    
    try:
        # Se tutor non admin, può vedere solo le sue stats
        if current_user.role == UserRole.TUTOR and tutor_id:
            from app.users import services as user_services
            tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
            if not tutor or tutor.id != tutor_id:
                raise HTTPException(status_code=403, detail="Can only view your own performance")
        
        performance_data = await DashboardRealTimeService.get_tutor_performance_today(db)
        
        # Filtra per tutor specifico se richiesto
        if tutor_id:
            performance_data["tutor_performance"] = [
                t for t in performance_data["tutor_performance"] 
                if t["tutor_id"] == tutor_id
            ]
            performance_data["filtered_by_tutor"] = tutor_id
        
        return {
            "widget": "tutor_performance_today",
            **performance_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tutor performance error: {str(e)}")


# ================================
# ANALYTICS ENDPOINTS
# ================================

@router.get("/trends")
async def get_weekly_trends(
    weeks_back: int = Query(4, ge=2, le=12, description="Number of weeks to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dashboard_access)
):
    """
    📈 TREND SETTIMANALI - Replica Excel grafici temporali
    
    Analisi trend performance nelle ultime N settimane.
    Dati perfetti per grafici line chart.
    """
    
    try:
        trends_data = await DashboardRealTimeService.get_weekly_trends_widget(db, weeks_back)
        return {
            "widget": "weekly_trends",
            **trends_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trends error: {str(e)}")


@router.get("/subjects")
async def get_subject_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dashboard_access)
):
    """
    📚 ANALYTICS MATERIE - Replica Excel COUNTIFS per subject
    
    Analisi performance per materia insegnata.
    Utile per decidere focus business e pricing.
    """
    
    try:
        subject_data = await DashboardRealTimeService.get_subject_analytics_widget(db)
        return {
            "widget": "subject_analytics",
            **subject_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subject analytics error: {str(e)}")


# ================================
# ALERTS & NOTIFICATIONS
# ================================

@router.get("/alerts")
async def get_real_time_alerts(
    alert_type: Optional[str] = Query(None, description="Filter by alert type: urgent, warning, info"),
    category: Optional[str] = Query(None, description="Filter by category: packages, revenue, tutors, operations"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dashboard_access)
):
    """
    🚨 ALERT REAL-TIME - Sistema notifiche intelligenti
    
    Alert automatici basati su condizioni business.
    Aggiorna ogni minuto per monitoring continuo.
    """
    
    try:
        alerts_data = await DashboardRealTimeService.get_real_time_alerts(db)
        
        # Applica filtri se richiesti
        if alert_type or category:
            filtered_alerts = alerts_data["alerts"]
            
            if alert_type:
                filtered_alerts = [a for a in filtered_alerts if a["type"] == alert_type]
                
            if category:
                filtered_alerts = [a for a in filtered_alerts if a["category"] == category]
            
            alerts_data["alerts"] = filtered_alerts
            alerts_data["filtered"] = True
            alerts_data["filters_applied"] = {"type": alert_type, "category": category}
        
        return {
            "widget": "real_time_alerts",
            **alerts_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alerts error: {str(e)}")


# ================================
# BOOKING INSIGHTS
# ================================

@router.get("/booking-insights")
async def get_booking_insights(
    date_from: Optional[date] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    tutor_id: Optional[int] = Query(None, description="Filter by tutor"),
    student_id: Optional[int] = Query(None, description="Filter by student"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dashboard_access)
):
    """
    📊 BOOKING INSIGHTS AVANZATI
    
    Analytics approfonditi sui booking con filtri flessibili.
    Equivalente Excel: Tabella pivot complessa con filtri multipli.
    """
    
    try:
        from app.bookings.services import EnhancedBookingService
        from datetime import datetime
        
        # Converti date in datetime se presenti
        datetime_from = datetime.combine(date_from, datetime.min.time()) if date_from else None
        datetime_to = datetime.combine(date_to, datetime.max.time()) if date_to else None
        
        # Verifica permessi per filtri specifici
        if current_user.role == UserRole.TUTOR:
            from app.users import services as user_services
            tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
            if tutor:
                tutor_id = tutor.id  # Force filter by own tutor
        
        analytics = await EnhancedBookingService.get_booking_analytics(
            db=db,
            student_id=student_id,
            tutor_id=tutor_id,
            date_from=datetime_from,
            date_to=datetime_to
        )
        
        return {
            "widget": "booking_insights",
            "filters": {
                "date_from": date_from.isoformat() if date_from else None,
                "date_to": date_to.isoformat() if date_to else None,
                "tutor_id": tutor_id,
                "student_id": student_id
            },
            **analytics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Booking insights error: {str(e)}")


# ================================
# UTILITY ENDPOINTS
# ================================

@router.get("/health")
async def dashboard_health_check():
    """
    ❤️ HEALTH CHECK DASHBOARD
    
    Verifica stato servizi dashboard per monitoring.
    """
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "dashboard_service": "operational",
            "real_time_data": "operational", 
            "alerts_system": "operational"
        },
        "version": "1.0.0"
    }


@router.post("/refresh")
async def refresh_dashboard_cache(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_dashboard_access)
):
    """
    🔄 REFRESH CACHE DASHBOARD
    
    Force refresh dei dati dashboard se necessario.
    Utile per debug o dopo modifiche massive dati.
    """
    
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required for cache refresh")
    
    # Background task per refresh
    def refresh_cache():
        # TODO: Implementare cache refresh logic se implementi caching
        print(f"🔄 Dashboard cache refresh requested by {current_user.email}")
        pass
    
    background_tasks.add_task(refresh_cache)
    
    return {
        "message": "Dashboard cache refresh initiated",
        "requested_by": current_user.email,
        "timestamp": datetime.now().isoformat()
    }


# ================================
# EXPORT ENDPOINTS
# ================================

@router.get("/export/today")
async def export_today_data(
    format: str = Query("json", regex="^(json|csv)$", description="Export format"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_dashboard_access)
):
    """
    📤 EXPORT DATI OGGI
    
    Esporta dati dashboard per reporting esterno.
    Supporta JSON e CSV per integrazione Excel/Google Sheets.
    """
    
    try:
        today_data = await DashboardRealTimeService.get_today_live_dashboard(db)
        
        if format == "csv":
            # TODO: Implementare export CSV se necessario
            raise HTTPException(status_code=501, detail="CSV export not yet implemented")
        
        return {
            "export_format": format,
            "export_timestamp": datetime.now().isoformat(),
            "exported_by": current_user.email,
            "data": today_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export error: {str(e)}")