import os
import threading
import time
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import project models and services
from app.admin import models as admin_models
from app.packages import models as package_models
from app.users import models as user_models
from app.admin import services as admin_services
from datetime import date
import uuid
import traceback


@pytest.mark.skipif(os.getenv('RUN_PG_TESTS') is None, reason='Postgres concurrency tests disabled')
def test_concurrent_confirms():
    """Run two concurrent confirm_payment calls against Postgres-backed DB and assert idempotency.

    Requirements:
    - Environment variable DATABASE_URL must point to a Postgres DB
    - RUN_PG_TESTS=1 must be set to enable this test in CI
    """
    database_url = os.getenv('DATABASE_URL')
    assert database_url, 'DATABASE_URL is required for this test'

    engine = create_engine(database_url)
    Session = sessionmaker(bind=engine)

    # Create a sandbox session to insert package, admin, student, assignment and payment
    with Session() as session:
        # Create users: student, tutor and admin
        uid = uuid.uuid4().hex[:8]
        student_user = user_models.User(
            email=f'pg-student-{uid}@example.com',
            hashed_password='x',
            role=user_models.UserRole.STUDENT,
        )
        admin_user = user_models.User(
            email=f'pg-admin-{uid}@example.com',
            hashed_password='x',
            role=user_models.UserRole.ADMIN,
        )
        tutor_user = user_models.User(
            email=f'pg-tutor-{uid}@example.com',
            hashed_password='x',
            role=user_models.UserRole.TUTOR,
        )
        session.add_all([student_user, admin_user, tutor_user])
        session.flush()

        # Create tutor profile (required by AdminPackageAssignment.tutor_id FK)
        tutor_profile = user_models.Tutor(
            user_id=tutor_user.id, first_name='T', last_name='Tutor'
        )
        session.add(tutor_profile)
        session.flush()

        # Create student profile (required by AdminPackageAssignment.student_id FK)
        student_profile = user_models.Student(
            user_id=student_user.id,
            first_name='S',
            last_name='Student',
            date_of_birth=date(2000, 1, 1),
            institute='Test Institute',
            class_level='1A',
            phone_number='0000000000',
        )
        session.add(student_profile)
        session.flush()

        # Create minimal package (use tutor_profile.id for tutor_id and correct field names)
        pkg = package_models.Package(
            tutor_id=tutor_profile.id,
            name='concurrency-pkg',
            total_hours=10,
            price=1000,
            subject='math',
        )
        session.add(pkg)
        session.flush()

        # Create an assignment with required foreign keys and auto-activate flag
        assignment = admin_models.AdminPackageAssignment(
            package_id=pkg.id,
            student_id=student_profile.id,
            tutor_id=tutor_profile.id,
            assigned_by_admin_id=admin_user.id,
            status=admin_models.PackageAssignmentStatus.ASSIGNED,
            auto_activate_on_payment=True,
            custom_total_hours=5,
            hours_remaining=5,
        )
        session.add(assignment)
        session.flush()

        # Create a pending payment record (include required payment_date and processed_by_admin_id)
        payment = admin_models.AdminPayment(
            package_assignment_id=assignment.id,
            student_id=student_profile.id,
            processed_by_admin_id=admin_user.id,
            amount=1000,
            payment_method=admin_models.PaymentMethod.BANK_TRANSFER,
            payment_date=date.today(),
            status=admin_models.PaymentStatus.PENDING,
            reference_number=f'concurrency-ref-{uid}',
        )
        session.add(payment)
        session.commit()

        # Capture primitive ids to avoid accessing detached ORM instances in worker threads
        payment_id = payment.id
        admin_id = admin_user.id
        assignment_id = assignment.id

    # Worker target: call confirm_payment in a fresh DB session
    def worker(result_list, idx):
        try:
            with Session() as s:
                res = admin_services.AdminPaymentService.confirm_payment(s, payment_id=payment_id, admin_id=admin_id)
                result_list.append((idx, 'ok', res))
        except Exception as e:
            tb = traceback.format_exc()
            result_list.append((idx, 'err', tb))

    results = []
    threads = [threading.Thread(target=worker, args=(results, i)) for i in range(2)]

    # Start both threads nearly simultaneously
    for t in threads:
        t.start()
        time.sleep(0.02)

    for t in threads:
        t.join()

    # Analyze results: at least one should succeed, the other should either succeed idempotently or return without duplicating activation
    oks = [r for r in results if r[1] == 'ok']

    assert len(oks) >= 1, f'expected at least one successful confirm, got: {results}'

    # Verify DB state: payment should be COMPLETED and assignment should be active (status ACTIVATED or similar)
    with Session() as s:
        p = s.get(admin_models.AdminPayment, payment.id)
        a = s.get(admin_models.AdminPackageAssignment, assignment.id)
        assert p.status == admin_models.PaymentStatus.COMPLETED
        # For assignment, ensure hours_remaining did not go negative and status is not CANCELLED
        assert a.hours_remaining >= 0
        assert a.status in (admin_models.PackageAssignmentStatus.ASSIGNED, admin_models.PackageAssignmentStatus.ACTIVE)

