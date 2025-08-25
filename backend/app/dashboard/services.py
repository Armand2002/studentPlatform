"""
Dashboard Real-Time Services - Replica Excel filtri dinamici
Widgets live che si aggiornano automaticamente come fogli Excel
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, case
from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta
from decimal import Decimal

from app.bookings.models import Booking, BookingStatus
from app.packages.models import PackagePurchase, Package
from app.users.models import Student, Tutor
from app.pricing.models import PricingCalculation


class DashboardRealTimeService:
    """
    Service Dashboard Real-Time
    
    Replica tutte le funzionalità Excel dashboard con filtri dinamici:
    - FILTER(Bookings, DATE=TODAY())
    - COUNTIFS(), SUMIFS() automatici  
    - Widget che si aggiornano in tempo reale
    - KPI business intelligenti
    """
    
    @staticmethod
    async def get_today_live_dashboard(db: Session) -> Dict[str, Any]:
        """
        📊 DASHBOARD OGGI - Replica Excel FILTER(TODAY())
        
        Widget principale che mostra situazione del giorno corrente
        Equivalente Excel: Tutte le formule che usano TODAY()
        """
        
        today = date.today()
        now = datetime.now()
        
        # 📅 LEZIONI OGGI (Excel: FILTER(Bookings, DATE=TODAY()))
        today_lessons = db.query(Booking).filter(
            func.date(Booking.start_time) == today
        ).all()
        
        # Categorizza per stato
        lessons_by_status = {
            "completed": [l for l in today_lessons if l.status == BookingStatus.COMPLETED],
            "ongoing": [l for l in today_lessons if l.status == BookingStatus.CONFIRMED and l.start_time <= now <= l.end_time],
            "upcoming": [l for l in today_lessons if l.start_time > now and l.status in [BookingStatus.PENDING, BookingStatus.CONFIRMED]], 
            "cancelled": [l for l in today_lessons if l.status == BookingStatus.CANCELLED]
        }
        
        # 💰 CALCOLI REVENUE (Excel: SUMIF(Bookings, TODAY(), Price))
        completed_lessons = lessons_by_status["completed"]
        today_revenue = sum(l.calculated_price or Decimal("0") for l in completed_lessons)
        today_tutor_earnings = sum(l.tutor_earnings or Decimal("0") for l in completed_lessons)
        today_platform_fees = sum(l.platform_fee or Decimal("0") for l in completed_lessons)
        
        # 👥 TUTORS ATTIVI OGGI (Excel: COUNTIF unici)
        active_tutors_today = len(set(l.tutor_id for l in today_lessons))
        active_students_today = len(set(l.student_id for l in today_lessons))
        
        # ⏱️ ORE TOTALI (Excel: SUMIF durate)
        total_hours_today = sum(l.calculated_duration or l.duration_hours or 0 for l in completed_lessons)
        
        return {
            "date": today.isoformat(),
            "timestamp": now.isoformat(),
            
            # Conteggi lezioni
            "lessons_total": len(today_lessons),
            "lessons_completed": len(lessons_by_status["completed"]),
            "lessons_ongoing": len(lessons_by_status["ongoing"]), 
            "lessons_upcoming": len(lessons_by_status["upcoming"]),
            "lessons_cancelled": len(lessons_by_status["cancelled"]),
            
            # Metriche finanziarie
            "revenue_today": float(today_revenue),
            "tutor_earnings_today": float(today_tutor_earnings),
            "platform_fees_today": float(today_platform_fees),
            
            # Metriche operazionali
            "active_tutors_today": active_tutors_today,
            "active_students_today": active_students_today,
            "total_hours_today": total_hours_today,
            
            # KPI calculated
            "avg_lesson_price": float(today_revenue / len(completed_lessons)) if completed_lessons else 0,
            "completion_rate": round(len(lessons_by_status["completed"]) / len(today_lessons) * 100, 1) if today_lessons else 0,
            "cancellation_rate": round(len(lessons_by_status["cancelled"]) / len(today_lessons) * 100, 1) if today_lessons else 0
        }
    
    @staticmethod
    async def get_expiring_packages_widget(db: Session, days_ahead: int = 7) -> Dict[str, Any]:
        """
        ⏰ PACCHETTI IN SCADENZA - Replica Excel EDATE logic
        
        Trova pacchetti che scadono nei prossimi N giorni
        Equivalente Excel: FILTER(Packages, EXPIRY_DATE <= TODAY()+7)
        """
        
        today = date.today()
        cutoff_date = today + timedelta(days=days_ahead)
        
        # Query pacchetti in scadenza
        expiring_packages = db.query(PackagePurchase).filter(
            and_(
                PackagePurchase.expiry_date <= cutoff_date,
                PackagePurchase.expiry_date >= today,  # Non già scaduti
                PackagePurchase.is_active == True,
                PackagePurchase.hours_remaining > 0
            )
        ).order_by(PackagePurchase.expiry_date.asc()).all()
        
        # Categorizza per urgenza
        urgent = []  # Scadono entro 2 giorni  
        warning = []  # Scadono entro 7 giorni
        
        for package in expiring_packages:
            days_until_expiry = (package.expiry_date - today).days
            
            package_info = {
                "purchase_id": package.id,
                "student_name": f"{package.student.first_name} {package.student.last_name}",
                "package_name": package.package.name,
                "expiry_date": package.expiry_date.isoformat(),
                "days_until_expiry": days_until_expiry,
                "hours_remaining": package.hours_remaining,
                "hours_used": package.hours_used,
                "utilization_rate": round((package.hours_used / (package.hours_used + package.hours_remaining)) * 100, 1)
            }
            
            if days_until_expiry <= 2:
                urgent.append(package_info)
            else:
                warning.append(package_info)
        
        return {
            "total_expiring": len(expiring_packages),
            "urgent_count": len(urgent),  # <= 2 giorni
            "warning_count": len(warning),  # 3-7 giorni
            "urgent_packages": urgent,
            "warning_packages": warning,
            "days_ahead": days_ahead,
            "generated_at": datetime.now().isoformat()
        }
    
    @staticmethod
    async def get_tutor_performance_today(db: Session) -> Dict[str, Any]:
        """
        👨‍🏫 PERFORMANCE TUTOR OGGI - Replica Excel COUNTIFS per tutor
        
        Analisi performance tutor per giornata corrente
        Equivalente Excel: COUNTIFS(Bookings, TUTOR=X, DATE=TODAY())
        """
        
        today = date.today()
        
        # Query performance tutor oggi
        tutor_stats = db.query(
            Tutor.id,
            Tutor.first_name,
            Tutor.last_name,
            func.count(Booking.id).label('lessons_count'),
            func.sum(case(
                (Booking.status == BookingStatus.COMPLETED, 1),
                else_=0
            )).label('lessons_completed'),
            func.sum(case(
                (Booking.status == BookingStatus.COMPLETED, Booking.calculated_price),
                else_=0
            )).label('revenue_generated'),
            func.sum(case(
                (Booking.status == BookingStatus.COMPLETED, Booking.tutor_earnings), 
                else_=0
            )).label('tutor_earnings'),
            func.sum(case(
                (Booking.status == BookingStatus.COMPLETED, Booking.calculated_duration),
                else_=0
            )).label('hours_taught')
        ).join(Booking).filter(
            func.date(Booking.start_time) == today
        ).group_by(Tutor.id, Tutor.first_name, Tutor.last_name).all()
        
        # Formatta risultati
        tutor_performance = []
        total_revenue = 0
        total_lessons = 0
        
        for stat in tutor_stats:
            performance_data = {
                "tutor_id": stat.id,
                "tutor_name": f"{stat.first_name} {stat.last_name}",
                "lessons_scheduled": stat.lessons_count or 0,
                "lessons_completed": stat.lessons_completed or 0,
                "revenue_generated": float(stat.revenue_generated or 0),
                "tutor_earnings": float(stat.tutor_earnings or 0),
                "hours_taught": stat.hours_taught or 0,
                "completion_rate": round((stat.lessons_completed / stat.lessons_count * 100) if stat.lessons_count else 0, 1),
                "avg_earnings_per_lesson": round((stat.tutor_earnings / stat.lessons_completed) if stat.lessons_completed else 0, 2)
            }
            
            tutor_performance.append(performance_data)
            total_revenue += performance_data["revenue_generated"]
            total_lessons += performance_data["lessons_completed"]
        
        # Ordina per revenue generato
        tutor_performance.sort(key=lambda x: x["revenue_generated"], reverse=True)
        
        return {
            "date": today.isoformat(),
            "total_tutors_active": len(tutor_performance),
            "total_revenue_generated": total_revenue,
            "total_lessons_completed": total_lessons,
            "avg_revenue_per_tutor": round(total_revenue / len(tutor_performance), 2) if tutor_performance else 0,
            "tutor_performance": tutor_performance
        }
    
    @staticmethod  
    async def get_weekly_trends_widget(db: Session, weeks_back: int = 4) -> Dict[str, Any]:
        """
        📈 TREND SETTIMANALI - Replica Excel grafici temporali
        
        Analisi trend nelle ultime N settimane
        Equivalente Excel: Grafico pivot con raggruppamento settimanale
        """
        
        # Calcola date di riferimento
        today = date.today()
        start_date = today - timedelta(weeks=weeks_back)
        
        # Query per trend settimanali
        weekly_data = db.query(
            func.date_trunc('week', Booking.start_time).label('week_start'),
            func.count(Booking.id).label('total_bookings'),
            func.sum(case(
                (Booking.status == BookingStatus.COMPLETED, 1),
                else_=0
            )).label('completed_bookings'),
            func.sum(case(
                (Booking.status == BookingStatus.COMPLETED, Booking.calculated_price),
                else_=0
            )).label('weekly_revenue'),
            func.count(func.distinct(Booking.tutor_id)).label('active_tutors'),
            func.count(func.distinct(Booking.student_id)).label('active_students')
        ).filter(
            Booking.start_time >= start_date
        ).group_by(
            func.date_trunc('week', Booking.start_time)
        ).order_by(
            func.date_trunc('week', Booking.start_time)
        ).all()
        
        # Formatta dati per grafici
        weeks = []
        for week_data in weekly_data:
            week_info = {
                "week_start": week_data.week_start.date().isoformat(),
                "total_bookings": week_data.total_bookings or 0,
                "completed_bookings": week_data.completed_bookings or 0,
                "weekly_revenue": float(week_data.weekly_revenue or 0),
                "active_tutors": week_data.active_tutors or 0,
                "active_students": week_data.active_students or 0,
                "completion_rate": round((week_data.completed_bookings / week_data.total_bookings * 100) if week_data.total_bookings else 0, 1)
            }
            weeks.append(week_info)
        
        # Calcoli trend
        if len(weeks) >= 2:
            current_week = weeks[-1]
            previous_week = weeks[-2] 
            
            revenue_trend = ((current_week["weekly_revenue"] - previous_week["weekly_revenue"]) / previous_week["weekly_revenue"] * 100) if previous_week["weekly_revenue"] else 0
            bookings_trend = ((current_week["total_bookings"] - previous_week["total_bookings"]) / previous_week["total_bookings"] * 100) if previous_week["total_bookings"] else 0
        else:
            revenue_trend = 0
            bookings_trend = 0
        
        return {
            "weeks_analyzed": len(weeks),
            "date_range": {
                "from": start_date.isoformat(),
                "to": today.isoformat()
            },
            "weekly_data": weeks,
            "trends": {
                "revenue_change_percent": round(revenue_trend, 1),
                "bookings_change_percent": round(bookings_trend, 1),
                "trend_direction": "up" if revenue_trend > 0 else ("down" if revenue_trend < 0 else "stable")
            },
            "summary": {
                "total_revenue": sum(w["weekly_revenue"] for w in weeks),
                "total_bookings": sum(w["total_bookings"] for w in weeks),
                "avg_weekly_revenue": round(sum(w["weekly_revenue"] for w in weeks) / len(weeks), 2) if weeks else 0,
                "avg_weekly_bookings": round(sum(w["total_bookings"] for w in weeks) / len(weeks), 2) if weeks else 0
            }
        }
    
    @staticmethod
    async def get_subject_analytics_widget(db: Session) -> Dict[str, Any]:
        """
        📚 ANALYTICS PER MATERIA - Replica Excel COUNTIFS per subject
        
        Analisi performance per materia insegnata  
        Equivalente Excel: Tabella pivot per materie
        """
        
        # Timeframe: ultimi 30 giorni
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        # Query analytics per materia
        subject_stats = db.query(
            Booking.subject,
            func.count(Booking.id).label('total_bookings'),
            func.sum(case(
                (Booking.status == BookingStatus.COMPLETED, 1),
                else_=0
            )).label('completed_bookings'),
            func.sum(case(
                (Booking.status == BookingStatus.COMPLETED, Booking.calculated_price),
                else_=0
            )).label('total_revenue'),
            func.sum(case(
                (Booking.status == BookingStatus.COMPLETED, Booking.calculated_duration),
                else_=0  
            )).label('total_hours'),
            func.count(func.distinct(Booking.tutor_id)).label('tutors_count'),
            func.count(func.distinct(Booking.student_id)).label('students_count')
        ).filter(
            Booking.start_time >= thirty_days_ago
        ).group_by(
            Booking.subject
        ).order_by(
            func.sum(case(
                (Booking.status == BookingStatus.COMPLETED, Booking.calculated_price),
                else_=0
            )).desc()
        ).all()
        
        # Formatta risultati
        subject_analytics = []
        total_revenue_all = sum(float(stat.total_revenue or 0) for stat in subject_stats)
        
        for stat in subject_stats:
            subject_revenue = float(stat.total_revenue or 0)
            subject_data = {
                "subject": stat.subject,
                "total_bookings": stat.total_bookings or 0,
                "completed_bookings": stat.completed_bookings or 0,
                "total_revenue": subject_revenue,
                "total_hours": stat.total_hours or 0,
                "tutors_available": stat.tutors_count or 0,
                "students_enrolled": stat.students_count or 0,
                "completion_rate": round((stat.completed_bookings / stat.total_bookings * 100) if stat.total_bookings else 0, 1),
                "avg_price_per_hour": round((subject_revenue / stat.total_hours) if stat.total_hours else 0, 2),
                "revenue_share": round((subject_revenue / total_revenue_all * 100) if total_revenue_all else 0, 1)
            }
            subject_analytics.append(subject_data)
        
        return {
            "period": "last_30_days",
            "subjects_count": len(subject_analytics), 
            "total_revenue": total_revenue_all,
            "subject_breakdown": subject_analytics,
            "top_subject": subject_analytics[0]["subject"] if subject_analytics else None,
            "generated_at": datetime.now().isoformat()
        }
    
    @staticmethod
    async def get_real_time_alerts(db: Session) -> Dict[str, Any]:
        """
        🚨 ALERT REAL-TIME - Sistema notifiche intelligenti
        
        Alert automatici basati su condizioni business:
        - Pacchetti in scadenza urgente
        - Tutors sovraccarichi
        - Revenue sotto soglia  
        - Anomalie sistema
        """
        
        alerts = []
        today = date.today()
        
        # Alert 1: Pacchetti scadenza urgente (<2 giorni)
        urgent_packages = await DashboardRealTimeService.get_expiring_packages_widget(db, days_ahead=2)
        if urgent_packages["urgent_count"] > 0:
            alerts.append({
                "type": "urgent",
                "category": "packages",
                "title": f"{urgent_packages['urgent_count']} pacchetti scadono entro 2 giorni",
                "description": "Contattare studenti per rinnovo",
                "action_required": True,
                "data": urgent_packages["urgent_packages"]
            })
        
        # Alert 2: Revenue giornaliero sotto soglia
        today_dashboard = await DashboardRealTimeService.get_today_live_dashboard(db)
        daily_target = 500.0  # €500 target giornaliero
        
        if today_dashboard["revenue_today"] < daily_target and datetime.now().hour > 18:
            alerts.append({
                "type": "warning", 
                "category": "revenue",
                "title": f"Revenue oggi sotto target: €{today_dashboard['revenue_today']:.2f} / €{daily_target}",
                "description": "Considerare azioni promozionali",
                "action_required": False,
                "data": {"current": today_dashboard["revenue_today"], "target": daily_target}
            })
        
        # Alert 3: Tutors con troppe lezioni oggi
        tutor_performance = await DashboardRealTimeService.get_tutor_performance_today(db)
        overloaded_tutors = [t for t in tutor_performance["tutor_performance"] if t["lessons_scheduled"] > 6]
        
        if overloaded_tutors:
            alerts.append({
                "type": "info",
                "category": "tutors", 
                "title": f"{len(overloaded_tutors)} tutors con >6 lezioni oggi",
                "description": "Monitorare qualità e burnout",
                "action_required": False,
                "data": overloaded_tutors
            })
        
        # Alert 4: Cancellazioni eccessive
        if today_dashboard["cancellation_rate"] > 20:  # >20% cancellazioni
            alerts.append({
                "type": "warning",
                "category": "operations",
                "title": f"Tasso cancellazioni elevato: {today_dashboard['cancellation_rate']}%",
                "description": "Investigare cause e migliorare retention",
                "action_required": True,
                "data": {"cancellation_rate": today_dashboard["cancellation_rate"]}
            })
        
        return {
            "alerts_count": len(alerts),
            "urgent_count": len([a for a in alerts if a["type"] == "urgent"]),
            "warning_count": len([a for a in alerts if a["type"] == "warning"]),
            "info_count": len([a for a in alerts if a["type"] == "info"]),
            "alerts": alerts,
            "generated_at": datetime.now().isoformat()
        }