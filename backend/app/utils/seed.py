from sqlalchemy.orm import Session
from datetime import date
from app.users import models as um
from app.core.security import get_password_hash


def seed_users(db: Session):
    # Admin
    if not db.query(um.User).filter(um.User.email == "admin.e2e@acme.com").first():
        db.add(um.User(email="admin.e2e@acme.com", hashed_password=get_password_hash("Password123!"), role=um.UserRole.ADMIN))
    
    # Tutor + profile
    tutor = db.query(um.User).filter(um.User.email == "tutor.e2e@acme.com").first()
    if not tutor:
        tutor = um.User(email="tutor.e2e@acme.com", hashed_password=get_password_hash("Password123!"), role=um.UserRole.TUTOR)
        db.add(tutor)
        db.flush()
    if not db.query(um.Tutor).filter(um.Tutor.user_id == tutor.id).first():
        db.add(um.Tutor(user_id=tutor.id, first_name="Tutor", last_name="Seed", bio=None, subjects="Matematica", hourly_rate=20, is_available=True))
    
    # Student + profile
    student = db.query(um.User).filter(um.User.email == "student.e2e@acme.com").first()
    if not student:
        student = um.User(email="student.e2e@acme.com", hashed_password=get_password_hash("Password123!"), role=um.UserRole.STUDENT)
        db.add(student)
        db.flush()
    if not db.query(um.Student).filter(um.Student.user_id == student.id).first():
        db.add(um.Student(
            user_id=student.id,
            first_name="Student",
            last_name="Seed",
            date_of_birth=date(2000,1,1),
            institute="Seed High School",
            class_level="5",
            address="Seed Street 1",
            phone_number="0000000000",
        ))
    
    db.commit()

