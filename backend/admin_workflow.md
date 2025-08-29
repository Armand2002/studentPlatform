# ================================
# ESEMPI WORKFLOW ADMIN
# ================================

"""
Esempi pratici di come l'admin gestisce pacchetti e pagamenti offline
"""

# ================================
# SCENARIO 1: NUOVO STUDENTE
# ================================

"""
🎯 WORKFLOW: Admin assegna pacchetto a nuovo studente

1. Studente contatta scuola per lezioni di Matematica
2. Admin crea assegnazione personalizzata
3. Sistema invia email notifica a studente
4. Studente effettua bonifico
5. Admin conferma pagamento ricevuto
6. Pacchetto si attiva automaticamente
7. Studente può prenotare lezioni
"""

# Step 1: Admin crea assegnazione
POST /api/admin/package-assignments
{
    "student_id": 15,
    "tutor_id": 8,
    "package_id": 3,
    "custom_name": "Matematica Liceo - Marco Rossi",
    "custom_total_hours": 12,
    "custom_price": 300.00,
    "custom_expiry_date": "2024-12-31",
    "student_notes": "Preparazione esame di maturità - focus su analisi e geometria",
    "admin_notes": "Studente molto motivato, richiede supporto intensivo",
    "auto_activate_on_payment": true
}

# Response:
{
    "id": 45,
    "student_id": 15,
    "tutor_id": 8,
    "status": "draft",
    "hours_remaining": 12,
    "assignment_date": "2024-08-28T16:30:00",
    "custom_name": "Matematica Liceo - Marco Rossi",
    # ... altri campi
}

# Step 2: Admin attiva l'assegnazione (invia email a studente)
PUT /api/admin/package-assignments/45/status
{
    "status": "assigned",
    "notes": "Pacchetto pronto - inviata email con istruzioni pagamento"
}

# ✉️ Email automatica inviata a studente:
"""
Ciao Marco,

Ti è stato assegnato un nuovo pacchetto di lezioni:
- Materia: Matematica  
- Tutor: Prof.ssa Laura Bianchi
- Ore totali: 12
- Prezzo: €300.00
- Scadenza: 31/12/2024

Per attivare il pacchetto, effettua il pagamento di €300.00 con bonifico a:
IBAN: IT60 X054 2811 1010 0000 0123 456
Causale: Pacchetto Matematica - Marco Rossi

Dopo la conferma del pagamento potrai prenotare le tue lezioni.
"""

# Step 3: Studente effettua bonifico, admin registra pagamento
POST /api/admin/payments
{
    "package_assignment_id": 45,
    "student_id": 15,
    "amount": 300.00,
    "payment_method": "bank_transfer",
    "payment_date": "2024-08-29",
    "reference_number": "BF240829-001234",
    "bank_details": "Bonifico da Marco Rossi - IBAN IT12...",
    "admin_notes": "Pagamento ricevuto e verificato"
}

# ✅ Sistema automaticamente:
# - Attiva il pacchetto (status: assigned -> active)
# - Invia ricevuta email
# - Invia email di attivazione pacchetto

# ================================
# SCENARIO 2: PAGAMENTO PARZIALE
# ================================

"""
💰 WORKFLOW: Gestione pagamento a rate

1. Admin crea pacchetto da €600
2. Studente paga €300 come anticipo
3. Admin registra pagamento parziale
4. Pacchetto rimane "assigned" (non ancora attivo)
5. Studente paga saldo €300
6. Admin conferma secondo pagamento
7. Pacchetto si attiva automaticamente
"""

# Step 1: Pacchetto costoso
POST /api/admin/package-assignments
{
    "student_id": 22,
    "tutor_id": 12,
    "package_id": 7,
    "custom_price": 600.00,
    "custom_total_hours": 20,
    "student_notes": "Corso intensivo preparazione università",
    "auto_activate_on_payment": false  # ⚠️ Disattiva auto-attivazione
}

# Step 2: Primo pagamento parziale
POST /api/admin/payments
{
    "package_assignment_id": 52,
    "student_id": 22,
    "amount": 300.00,  # Solo metà
    "payment_method": "bank_transfer",
    "payment_date": "2024-08-28",
    "admin_notes": "Anticipo 50% - resto entro fine mese"
}

# Step 3: Secondo pagamento
POST /api/admin/payments
{
    "package_assignment_id": 52,
    "student_id": 22,
    "amount": 300.00,  # Saldo
    "payment_method": "bank_transfer", 
    "payment_date": "2024-08-30",
    "admin_notes": "Saldo finale - pacchetto completo"
}

# Step 4: Admin attiva manualmente dopo pagamento completo
PUT /api/admin/package-assignments/52/status
{
    "status": "active",
    "notes": "Attivato dopo pagamento completo di €600"
}

# ================================
# SCENARIO 3: PAGAMENTO IN CONTANTI
# ================================

"""
💵 WORKFLOW: Pagamento in contanti alla scuola

1. Studente viene in segreteria
2. Paga €250 in contanti
3. Admin registra immediatamente il pagamento
4. Stampa ricevuta
5. Pacchetto si attiva subito
"""

POST /api/admin/payments
{
    "package_assignment_id": 38,
    "student_id": 18,
    "amount": 250.00,
    "payment_method": "cash",
    "payment_date": "2024-08-28",
    "reference_number": "CASH-240828-001",
    "admin_notes": "Pagamento in contanti in segreteria - ricevuta n.001"
}

# ✅ Sistema invia immediatamente ricevuta email

# ================================
# SCENARIO 4: GESTIONE ADMIN BULK
# ================================

"""
📦 WORKFLOW: Assegnazione di massa per nuova classe

Admin deve assegnare pacchetti a 15 studenti della stessa classe
"""

POST /api/admin/package-assignments/bulk
{
    "assignments": [
        {
            "student_id": 25,
            "tutor_id": 5,
            "package_id": 2,
            "custom_name": "Fisica 5A - Alice Verdi",
            "custom_total_hours": 10,
            "custom_price": 280.00,
            "student_notes": "Preparazione verifica trimestrale"
        },
        {
            "student_id": 26,
            "tutor_id": 5,
            "package_id": 2,
            "custom_name": "Fisica 5A - Bruno Neri",
            "custom_total_hours": 10,
            "custom_price": 280.00,
            "student_notes": "Recupero argomenti elettromagnetismo"
        }
        // ... altri 13 studenti
    ],
    "send_notifications": true
}

# Response:
{
    "created_count": 15,
    "failed_count": 0,
    "created_ids": [67, 68, 69, 70, ...],
    "errors": []
}

# ✉️ 15 email automatiche inviate agli studenti

# ================================
# SCENARIO 5: DASHBOARD ADMIN
# ================================

"""
📊 WORKFLOW: Admin controlla situazione finanziaria

Ogni mattina admin verifica:
- Pagamenti ricevuti ieri
- Pacchetti da attivare
- Pagamenti in ritardo
"""

GET /api/admin/dashboard/financial

# Response:
{
    "today_payments_count": 3,
    "today_payments_amount": 850.00,
    "today_new_assignments": 5,
    
    "week_payments_count": 18,
    "week_payments_amount": 4200.00,
    "week_revenue": 4200.00,
    
    "pending_payments_count": 7,
    "pending_payments_amount": 1680.00,
    "overdue_payments_count": 2,
    "overdue_payments_amount": 450.00,
    
    "active_packages_count": 45,
    "draft_packages_count": 3,
    "suspended_packages_count": 1,
    
    "assignment_to_active_rate": 87.5,
    "payment_completion_rate": 94.2,
    
    "top_tutors_by_revenue": [
        {"name": "Laura Bianchi", "revenue": 1200.00, "packages": 8},
        {"name": "Marco Verde", "revenue": 980.00, "packages": 6}
    ],
    "top_subjects_by_revenue": [
        {"subject": "Matematica", "revenue": 2100.00, "packages": 12},
        {"subject": "Fisica", "revenue": 1400.00, "packages": 8}
    ]
}

# ================================
# SCENARIO 6: REPORT MENSILE
# ================================

"""
📈 WORKFLOW: Admin genera report per direzione

Fine mese, admin prepara report revenue per direzione
"""

GET /api/admin/reports/revenue?date_from=2024-08-01&date_to=2024-08-31&group_by=week

# Response:
{
    "date_from": "2024-08-01",
    "date_to": "2024-08-31", 
    "group_by": "week",
    "total_revenue": 12500.00,
    "total_payments": 45,
    "total_tutor_earnings": 8750.00,
    "total_platform_fees": 3750.00,
    "items": [
        {
            "period": "2024-W31",
            "period_label": "Settimana 31 (1-7 Ago)",
            "total_revenue": 2800.00,
            "payments_count": 8,
            "active_packages": 12,
            "avg_package_value": 350.00,
            "tutor_earnings": 1960.00,
            "platform_fees": 840.00
        },
        {
            "period": "2024-W32",
            "period_label": "Settimana 32 (8-14 Ago)",
            "total_revenue": 3200.00,
            "payments_count": 11,
            "active_packages": 15,
            "avg_package_value": 290.91,
            "tutor_earnings": 2240.00,
            "platform_fees": 960.00
        }
        // ... altre settimane
    ]
}

# ================================
# SCENARIO 7: GESTIONE PROBLEMI
# ================================

"""
🚨 WORKFLOW: Gestione pagamento in ritardo

1. Sistema identifica pagamenti overdue
2. Admin contatta studente
3. Admin sospende pacchetto se necessario
4. Studente regolarizza
5. Admin riattiva pacchetto
"""

# Step 1: Admin visualizza pagamenti in ritardo
GET /api/admin/payments?status=overdue

# Step 2: Admin sospende pacchetto temporaneamente
PUT /api/admin/package-assignments/34/status
{
    "status": "suspended",
    "notes": "Sospeso per pagamento in ritardo - contattato studente"
}

# Step 3: Studente regolarizza, admin riattiva
PUT /api/admin/package-assignments/34/status
{
    "status": "active", 
    "notes": "Riattivato dopo regolarizzazione pagamento"
}

# ✉️ Email automatica di riattivazione inviata

# ================================
# SCENARIO 8: PERSONALIZZAZIONE AVANZATA
# ================================

"""
🎨 WORKFLOW: Pacchetto super-personalizzato

Studente speciale necessita pacchetto molto personalizzato:
- 25 ore invece delle 10 standard
- Prezzo scontato per situazione famiglia
- Tutor specifico
- Scadenza estesa
"""

POST /api/admin/package-assignments
{
    "student_id": 8,
    "tutor_id": 15,
    "package_id": 1,  # Pacchetto base da 10h €250
    
    # Personalizzazioni complete
    "custom_name": "Matematica Personalizzato - Sofia Blu (Situazione speciale)",
    "custom_total_hours": 25,  # +150% ore
    "custom_price": 400.00,    # Sconto da €625 a €400
    "custom_expiry_date": "2025-06-30",  # Scadenza estesa
    
    "student_notes": "Pacchetto personalizzato per preparazione intensiva. Flessibilità orari per impegni famiglia.",
    "admin_notes": "Sconto applicato per situazione familiare - approvato direzione. Monitorare progress.",
    
    "auto_activate_on_payment": true
}

# ================================
# INTEGRAZIONI EMAIL TEMPLATE
# ================================

"""
📧 ESEMPI TEMPLATE SENDGRID

Template Package Assigned:
---
Soggetto: 🎓 Nuovo pacchetto lezioni - {{package_name}}

Ciao {{student_name}},

Ti è stato assegnato un nuovo pacchetto di lezioni:

📚 **{{package_name}}**
👨‍🏫 Tutor: {{tutor_name}}
🕐 Ore totali: {{total_hours}}
💰 Prezzo: €{{price}}
📅 Scadenza: {{expiry_date}}
📖 Materia: {{subject}}

{{#if student_notes}}
📝 **Note per te:**
{{student_notes}}
{{/if}}

Per attivare il pacchetto, effettua il pagamento e le tue lezioni saranno subito disponibili.

[Accedi alla Piattaforma]({{login_url}})

---

Template Payment Receipt:
---
Soggetto: 🧾 Ricevuta pagamento n.{{receipt_number}}

Caro {{student_name}},

Abbiamo ricevuto il tuo pagamento per il pacchetto **{{package_name}}**.

**DETTAGLI PAGAMENTO:**
💰 Importo: €{{amount}}
📅 Data: {{payment_date}}
💳 Metodo: {{payment_method}}
🔢 Riferimento: {{reference_number}}

**RIEPILOGO PACCHETTO:**
📊 Totale dovuto: €{{total_due}}
✅ Totale pagato: €{{total_paid}}
{{#if balance_remaining}}
⏳ Saldo rimanente: €{{balance_remaining}}
{{/if}}

{{#unless balance_remaining}}
🎉 **Pagamento completato!** Il tuo pacchetto è ora attivo.
{{/unless}}

Questa è la tua ricevuta ufficiale. Conservala per i tuoi archivi.

Grazie!
---

Template Package Activated:
---
Soggetto: 🚀 Pacchetto attivato - Prenota le tue lezioni!

Fantastico {{student_name}}! 🎉

Il tuo pacchetto **{{package_name}}** è ora attivo e pronto all'uso.

**IL TUO PACCHETTO:**
👨‍🏫 Tutor: {{tutor_name}}
⏰ Ore rimanenti: {{hours_remaining}}
📅 Valido fino al: {{expiry_date}}

**PROSSIMI PASSI:**
1. [Prenota la tua prima lezione]({{booking_url}})
2. Contatta il tuo tutor: {{tutor_email}}
3. Consulta i materiali di studio disponibili

{{next_steps}}

Buono studio! 📚
---
"""

# ================================
# IMPLEMENTAZIONE COMPLETA SERVICES
# ================================

class AdminPackageService:
    """
    Service completo per gestione admin pacchetti
    """
    
    @staticmethod
    async def create_assignment(db: Session, data: schemas.AdminPackageAssignmentCreate, admin_id: int):
        """Crea assegnazione pacchetto con validazioni complete"""
        
        # Validate all references exist
        student = db.query(Student).filter(Student.id == data.student_id).first()
        if not student:
            raise ValueError("Studente non trovato")
            
        tutor = db.query(Tutor).filter(Tutor.id == data.tutor_id).first()
        if not tutor:
            raise ValueError("Tutor non trovato")
            
        package = db.query(Package).filter(Package.id == data.package_id).first()
        if not package:
            raise ValueError("Pacchetto non trovato")
        
        # Validate admin user
        admin = db.query(User).filter(
            User.id == admin_id, 
            User.role == UserRole.ADMIN
        ).first()
        if not admin:
            raise ValueError("Admin non valido")
        
        # Check for conflicting active assignments
        existing_active = db.query(AdminPackageAssignment).filter(
            AdminPackageAssignment.student_id == data.student_id,
            AdminPackageAssignment.tutor_id == data.tutor_id,
            AdminPackageAssignment.status.in_([
                PackageAssignmentStatus.ASSIGNED,
                PackageAssignmentStatus.ACTIVE
            ])
        ).first()
        
        if existing_active:
            raise ValueError("Studente ha già un pacchetto attivo con questo tutor")
        
        # Calculate hours and pricing
        total_hours = data.custom_total_hours or package.total_hours
        final_price = data.custom_price or package.price
        
        # Validate custom values
        if data.custom_total_hours and data.custom_total_hours > 100:
            raise ValueError("Numero ore troppo elevato (max 100)")
            
        if data.custom_price and data.custom_price > 5000:
            raise ValueError("Prezzo troppo elevato (max €5000)")
        
        # Create assignment
        assignment = AdminPackageAssignment(
            student_id=data.student_id,
            tutor_id=data.tutor_id,
            package_id=data.package_id,
            assigned_by_admin_id=admin_id,
            custom_name=data.custom_name,
            custom_total_hours=data.custom_total_hours,
            custom_price=data.custom_price,
            custom_expiry_date=data.custom_expiry_date,
            hours_remaining=total_hours,
            admin_notes=data.admin_notes,
            student_notes=data.student_notes,
            auto_activate_on_payment=data.auto_activate_on_payment,
            status=PackageAssignmentStatus.DRAFT
        )
        
        db.add(assignment)
        db.flush()
        
        # Create pending payment if price > 0
        if final_price > 0:
            pending_payment = AdminPayment(
                package_assignment_id=assignment.id,
                student_id=data.student_id,
                processed_by_admin_id=admin_id,
                amount=final_price,
                payment_method=PaymentMethod.BANK_TRANSFER,  # Default
                payment_date=date.today(),
                status=PaymentStatus.PENDING,
                admin_notes=f"Auto-created pending payment for assignment #{assignment.id}"
            )
            db.add(pending_payment)
        
        db.commit()
        db.refresh(assignment)
        return assignment
    
    @staticmethod
    async def update_assignment_status(
        db: Session, 
        assignment_id: int, 
        new_status: PackageAssignmentStatus, 
        admin_id: int,
        notes: Optional[str] = None
    ):
        """Aggiorna stato assegnazione con validazioni business"""
        
        assignment = db.query(AdminPackageAssignment).filter(
            AdminPackageAssignment.id == assignment_id
        ).first()
        
        if not assignment:
            raise ValueError("Assegnazione non trovata")
        
        old_status = assignment.status
        
        # Validate status transitions
        valid_transitions = {
            PackageAssignmentStatus.DRAFT: [
                PackageAssignmentStatus.ASSIGNED, 
                PackageAssignmentStatus.CANCELLED
            ],
            PackageAssignmentStatus.ASSIGNED: [
                PackageAssignmentStatus.ACTIVE,
                PackageAssignmentStatus.SUSPENDED,
                PackageAssignmentStatus.CANCELLED
            ],
            PackageAssignmentStatus.ACTIVE: [
                PackageAssignmentStatus.SUSPENDED,
                PackageAssignmentStatus.COMPLETED,
                PackageAssignmentStatus.CANCELLED
            ],
            PackageAssignmentStatus.SUSPENDED: [
                PackageAssignmentStatus.ACTIVE,
                PackageAssignmentStatus.CANCELLED
            ]
        }
        
        if new_status not in valid_transitions.get(old_status, []):
            raise ValueError(f"Transizione non valida da {old_status.value} a {new_status.value}")
        
        # Business logic per attivazione
        if new_status == PackageAssignmentStatus.ACTIVE:
            # Verifica pagamento se richiesto
            if not assignment.auto_activate_on_payment:
                total_paid = sum(
                    p.amount for p in assignment.payments 
                    if p.status == PaymentStatus.COMPLETED
                )
                total_due = assignment.custom_price or assignment.package.price
                
                if total_paid < total_due:
                    raise ValueError(f"Pagamento incompleto: pagato €{total_paid}, dovuto €{total_due}")
        
        # Update status
        assignment.status = new_status
        assignment.updated_at = datetime.utcnow()
        
        # Add admin log entry
        if notes:
            current_notes = assignment.admin_notes or ""
            timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
            assignment.admin_notes = f"{current_notes}\n[{timestamp}] Status: {old_status.value} -> {new_status.value}\n{notes}"
        
        db.commit()
        db.refresh(assignment)
        return assignment
    
    @staticmethod
    async def list_assignments(
        db: Session,
        status: Optional[PackageAssignmentStatus] = None,
        student_id: Optional[int] = None,
        tutor_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ):
        """Lista assegnazioni con filtri e dettagli completi"""
        
        query = db.query(AdminPackageAssignment)
        
        # Apply filters
        if status:
            query = query.filter(AdminPackageAssignment.status == status)
        if student_id:
            query = query.filter(AdminPackageAssignment.student_id == student_id)
        if tutor_id:
            query = query.filter(AdminPackageAssignment.tutor_id == tutor_id)
        
        assignments = query.order_by(
            AdminPackageAssignment.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        # Enrich with calculated fields
        enriched_assignments = []
        for assignment in assignments:
            # Calculate payment summary
            total_paid = sum(
                p.amount for p in assignment.payments 
                if p.status == PaymentStatus.COMPLETED
            )
            total_due = assignment.custom_price or assignment.package.price
            
            # Determine payment status
            if total_paid == 0:
                payment_status = "unpaid"
            elif total_paid < total_due:
                payment_status = "partial"
            else:
                payment_status = "completed"
            
            # Create enriched object
            enriched = {
                **assignment.__dict__,
                "student_name": f"{assignment.student.first_name} {assignment.student.last_name}",
                "tutor_name": f"{assignment.tutor.first_name} {assignment.tutor.last_name}",
                "package_name": assignment.custom_name or assignment.package.name,
                "assigned_by_admin_name": f"{assignment.assigned_by.email}",  # Admin email as name
                "total_paid": total_paid,
                "total_due": total_due,
                "payment_status": payment_status
            }
            enriched_assignments.append(enriched)
        
        return enriched_assignments

class AdminPaymentService:
    """
    Service completo per gestione pagamenti offline
    """
    
    @staticmethod
    async def record_payment(db: Session, data: schemas.AdminPaymentCreate, admin_id: int):
        """Registra pagamento con validazioni e automazioni"""
        
        # Validate assignment exists
        assignment = db.query(AdminPackageAssignment).filter(
            AdminPackageAssignment.id == data.package_assignment_id
        ).first()
        
        if not assignment:
            raise ValueError("Assegnazione pacchetto non trovata")
        
        # Validate student matches
        if assignment.student_id != data.student_id:
            raise ValueError("Studente non corrisponde all'assegnazione")
        
        # Validate amount
        total_due = assignment.custom_price or assignment.package.price
        total_paid = sum(
            p.amount for p in assignment.payments 
            if p.status == PaymentStatus.COMPLETED
        )
        
        if data.amount > (total_due - total_paid):
            raise ValueError(f"Importo eccessivo: dovuto €{total_due - total_paid}, inserito €{data.amount}")
        
        # Create payment record
        payment = AdminPayment(
            package_assignment_id=data.package_assignment_id,
            student_id=data.student_id,
            processed_by_admin_id=admin_id,
            amount=data.amount,
            payment_method=data.payment_method,
            payment_date=data.payment_date,
            reference_number=data.reference_number,
            bank_details=data.bank_details,
            admin_notes=data.admin_notes,
            status=PaymentStatus.COMPLETED,  # Admin records = automatically confirmed
            confirmed_by_admin_id=admin_id,
            confirmation_date=datetime.utcnow()
        )
        
        db.add(payment)
        db.flush()
        
        # Check if payment completes the total
        new_total_paid = total_paid + data.amount
        
        if new_total_paid >= total_due:
            # Payment is complete
            if assignment.auto_activate_on_payment and assignment.status == PackageAssignmentStatus.ASSIGNED:
                # Auto-activate package
                assignment.status = PackageAssignmentStatus.ACTIVE
                assignment.updated_at = datetime.utcnow()
                
                # Log activation
                timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
                assignment.admin_notes = (assignment.admin_notes or "") + f"\n[{timestamp}] Auto-activated after payment completion (€{new_total_paid}/€{total_due})"
        
        db.commit()
        db.refresh(payment)
        return payment
    
    @staticmethod
    async def confirm_payment(db: Session, payment_id: int, admin_id: int, notes: Optional[str] = None):
        """Conferma pagamento precedentemente registrato"""
        
        payment = db.query(AdminPayment).filter(AdminPayment.id == payment_id).first()
        
        if not payment:
            raise ValueError("Pagamento non trovato")
        
        if payment.status == PaymentStatus.COMPLETED:
            raise ValueError("Pagamento già confermato")
        
        # Update payment status
        payment.status = PaymentStatus.COMPLETED
        payment.confirmed_by_admin_id = admin_id
        payment.confirmation_date = datetime.utcnow()
        
        if notes:
            payment.admin_notes = (payment.admin_notes or "") + f"\n[CONFIRMATION] {notes}"
        
        db.commit()
        db.refresh(payment)
        return payment
    
    @staticmethod
    async def list_payments(
        db: Session,
        status: Optional[PaymentStatus] = None,
        payment_method: Optional[PaymentMethod] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        skip: int = 0,
        limit: int = 100
    ):
        """Lista pagamenti con filtri e dettagli"""
        
        query = db.query(AdminPayment)
        
        # Apply filters
        if status:
            query = query.filter(AdminPayment.status == status)
        if payment_method:
            query = query.filter(AdminPayment.payment_method == payment_method)
        if date_from:
            query = query.filter(AdminPayment.payment_date >= date_from)
        if date_to:
            query = query.filter(AdminPayment.payment_date <= date_to)
        
        payments = query.order_by(AdminPayment.created_at.desc()).offset(skip).limit(limit).all()
        
        # Enrich with details
        enriched_payments = []
        for payment in payments:
            enriched = {
                **payment.__dict__,
                "student_name": f"{payment.student.first_name} {payment.student.last_name}",
                "package_name": payment.package_assignment.custom_name or payment.package_assignment.package.name,
                "processed_by_admin_name": payment.processed_by.email,
                "confirmed_by_admin_name": payment.confirmed_by.email if payment.confirmed_by else None,
                "assignment_status": payment.package_assignment.status.value
            }
            enriched_payments.append(enriched)
        
        return enriched_payments

class AdminDashboardService:
    """
    Service per dashboard e analytics admin
    """
    
    @staticmethod
    async def get_financial_overview(db: Session):
        """Dashboard finanziario completo"""
        
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)
        
        # Today metrics
        today_payments = db.query(AdminPayment).filter(
            AdminPayment.payment_date == today,
            AdminPayment.status == PaymentStatus.COMPLETED
        ).all()
        
        # Week metrics
        week_payments = db.query(AdminPayment).filter(
            AdminPayment.payment_date >= week_start,
            AdminPayment.status == PaymentStatus.COMPLETED
        ).all()
        
        # Month metrics
        month_payments = db.query(AdminPayment).filter(
            AdminPayment.payment_date >= month_start,
            AdminPayment.status == PaymentStatus.COMPLETED
        ).all()
        
        # Pending/Overdue analysis
        pending_payments = db.query(AdminPayment).filter(
            AdminPayment.status == PaymentStatus.PENDING
        ).all()
        
        overdue_cutoff = today - timedelta(days=30)
        overdue_payments = [p for p in pending_payments if p.created_at.date() < overdue_cutoff]
        
        # Package status counts
        active_packages = db.query(AdminPackageAssignment).filter(
            AdminPackageAssignment.status == PackageAssignmentStatus.ACTIVE
        ).count()
        
        draft_packages = db.query(AdminPackageAssignment).filter(
            AdminPackageAssignment.status == PackageAssignmentStatus.DRAFT
        ).count()
        
        suspended_packages = db.query(AdminPackageAssignment).filter(
            AdminPackageAssignment.status == PackageAssignmentStatus.SUSPENDED
        ).count()
        
        # Conversion rates
        total_assignments = db.query(AdminPackageAssignment).count()
        assignment_to_active_rate = (active_packages / total_assignments * 100) if total_assignments > 0 else 0
        
        total_payment_records = db.query(AdminPayment).count()
        completed_payments = db.query(AdminPayment).filter(AdminPayment.status == PaymentStatus.COMPLETED).count()
        payment_completion_rate = (completed_payments / total_payment_records * 100) if total_payment_records > 0 else 0
        
        return {
            "today_payments_count": len(today_payments),
            "today_payments_amount": sum(p.amount for p in today_payments),
            "today_new_assignments": db.query(AdminPackageAssignment).filter(
                AdminPackageAssignment.created_at >= datetime.combine(today, datetime.min.time())
            ).count(),
            
            "week_payments_count": len(week_payments),
            "week_payments_amount": sum(p.amount for p in week_payments),
            "week_revenue": sum(p.amount for p in week_payments),
            
            "month_payments_count": len(month_payments),
            "month_payments_amount": sum(p.amount for p in month_payments),
            "month_revenue": sum(p.amount for p in month_payments),
            
            "pending_payments_count": len(pending_payments),
            "pending_payments_amount": sum(p.amount for p in pending_payments),
            "overdue_payments_count": len(overdue_payments),
            "overdue_payments_amount": sum(p.amount for p in overdue_payments),
            
            "active_packages_count": active_packages,
            "draft_packages_count": draft_packages,
            "suspended_packages_count": suspended_packages,
            
            "assignment_to_active_rate": round(assignment_to_active_rate, 1),
            "payment_completion_rate": round(payment_completion_rate, 1),
            
            "top_tutors_by_revenue": await AdminDashboardService._get_top_tutors(db, month_start),
            "top_subjects_by_revenue": await AdminDashboardService._get_top_subjects(db, month_start)
        }
    
    @staticmethod
    async def _get_top_tutors(db: Session, date_from: date, limit: int = 5):
        """Top tutors by revenue this month"""
        
        # Query complex - group by tutor with joins
        from sqlalchemy import func, desc
        
        results = db.query(
            Tutor.id,
            Tutor.first_name,
            Tutor.last_name,
            func.sum(AdminPayment.amount).label('revenue'),
            func.count(AdminPackageAssignment.id).label('packages')
        ).join(
            AdminPackageAssignment, AdminPackageAssignment.tutor_id == Tutor.id
        ).join(
            AdminPayment, AdminPayment.package_assignment_id == AdminPackageAssignment.id
        ).filter(
            AdminPayment.payment_date >= date_from,
            AdminPayment.status == PaymentStatus.COMPLETED
        ).group_by(
            Tutor.id, Tutor.first_name, Tutor.last_name
        ).order_by(desc('revenue')).limit(limit).all()
        
        return [
            {
                "name": f"{r.first_name} {r.last_name}",
                "revenue": float(r.revenue),
                "packages": r.packages
            }
            for r in results
        ]
    
    @staticmethod
    async def _get_top_subjects(db: Session, date_from: date, limit: int = 5):
        """Top subjects by revenue this month"""
        
        from sqlalchemy import func, desc
        
        results = db.query(
            Package.subject,
            func.sum(AdminPayment.amount).label('revenue'),
            func.count(AdminPackageAssignment.id).label('packages')
        ).join(
            AdminPackageAssignment, AdminPackageAssignment.package_id == Package.id
        ).join(
            AdminPayment, AdminPayment.package_assignment_id == AdminPackageAssignment.id
        ).filter(
            AdminPayment.payment_date >= date_from,
            AdminPayment.status == PaymentStatus.COMPLETED
        ).group_by(Package.subject).order_by(desc('revenue')).limit(limit).all()
        
        return [
            {
                "subject": r.subject,
                "revenue": float(r.revenue),
                "packages": r.packages
            }
            for r in results
        ]

# ================================
# MAIN ROUTES INTEGRATION
# ================================

# Add to app/main.py
from app.admin.routes import router as admin_router

app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])

# ================================
# TESTING EXAMPLES
# ================================

"""
🧪 ESEMPI TESTING API

# Test creazione assegnazione
curl -X POST "http://localhost:8000/api/admin/package-assignments" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "tutor_id": 1,
    "package_id": 1,
    "custom_name": "Test Package",
    "custom_total_hours": 10,
    "custom_price": 250.00,
    "student_notes": "Test assignment"
  }'

# Test registrazione pagamento
curl -X POST "http://localhost:8000/api/admin/payments" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "package_assignment_id": 1,
    "student_id": 1,
    "amount": 250.00,
    "payment_method": "bank_transfer",
    "payment_date": "2024-08-28",
    "reference_number": "TEST001"
  }'

# Test dashboard
curl -X GET "http://localhost:8000/api/admin/dashboard/financial" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
"""