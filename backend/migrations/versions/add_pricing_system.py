"""add_pricing_system

Revision ID: add_pricing_system_001
Revises: [previous_revision]
Create Date: 2024-01-15 10:30:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from decimal import Decimal

# revision identifiers, used by Alembic.
revision: str = 'add_pricing_system_001'
down_revision: Union[str, None] = '1388dfcd3a35'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Creazione sistema pricing - Replica tariffario Excel
    """
    
    # ================================
    # CREATE ENUM TYPES
    # ================================
    
    lesson_type_enum = postgresql.ENUM('doposcuola', 'individuale', 'gruppo', 'online', name='lessontype')
    lesson_type_enum.create(op.get_bind())
    
    # ================================
    # CREATE PRICING_RULES TABLE
    # ================================
    
    op.create_table('pricing_rules',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        
        # Identificazione regola
        sa.Column('name', sa.String(length=100), nullable=False),
        
        # Parametri matching
        sa.Column('lesson_type', lesson_type_enum, nullable=False),
        sa.Column('subject', sa.String(length=50), nullable=False),
        sa.Column('min_duration', sa.Integer(), nullable=False, default=1),
        sa.Column('max_duration', sa.Integer(), nullable=True),
        
        # Pricing core
        sa.Column('base_price_per_hour', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('tutor_percentage', sa.Numeric(precision=5, scale=4), nullable=False, default=0.7000),
        
        # Sconti volume (JSON)
        sa.Column('volume_discounts', sa.JSON(), nullable=True),
        
        # Condizioni applicazione
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('priority', sa.Integer(), nullable=False, default=100),
        
        # Metadata
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    # Indexes per performance
    op.create_index('ix_pricing_rules_lesson_type_subject', 'pricing_rules', ['lesson_type', 'subject'])
    op.create_index('ix_pricing_rules_active_priority', 'pricing_rules', ['is_active', 'priority'])
    
    # Unique constraint
    op.create_unique_constraint('uq_pricing_rules_name', 'pricing_rules', ['name'])
    
    # ================================
    # CREATE TUTOR_PRICING_OVERRIDES TABLE
    # ================================
    
    op.create_table('tutor_pricing_overrides',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        
        # Foreign keys
        sa.Column('tutor_id', sa.Integer(), sa.ForeignKey('tutors.id'), nullable=False, index=True),
        sa.Column('pricing_rule_id', sa.Integer(), sa.ForeignKey('pricing_rules.id'), nullable=False, index=True),
        
        # Override values
        sa.Column('custom_price_per_hour', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('custom_tutor_percentage', sa.Numeric(precision=5, scale=4), nullable=True),
        
        # Condizioni
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('valid_from', sa.DateTime(), nullable=True),
        sa.Column('valid_until', sa.DateTime(), nullable=True),
        
        # Metadata
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    # Indexes per performance lookup
    op.create_index('ix_tutor_overrides_tutor_rule', 'tutor_pricing_overrides', ['tutor_id', 'pricing_rule_id'])
    op.create_index('ix_tutor_overrides_active_dates', 'tutor_pricing_overrides', ['is_active', 'valid_from', 'valid_until'])
    
    # ================================
    # CREATE PRICING_CALCULATIONS TABLE (AUDIT LOG)
    # ================================
    
    op.create_table('pricing_calculations',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        
        # Reference
        sa.Column('booking_id', sa.Integer(), sa.ForeignKey('bookings.id'), nullable=True, index=True),
        
        # Input parameters
        sa.Column('lesson_type', sa.String(length=20), nullable=False),
        sa.Column('subject', sa.String(length=50), nullable=False),
        sa.Column('duration_hours', sa.Integer(), nullable=False),
        sa.Column('tutor_id', sa.Integer(), sa.ForeignKey('tutors.id'), nullable=False),
        
        # Applied rule
        sa.Column('applied_pricing_rule_id', sa.Integer(), sa.ForeignKey('pricing_rules.id'), nullable=True),
        sa.Column('applied_override_id', sa.Integer(), sa.ForeignKey('tutor_pricing_overrides.id'), nullable=True),
        
        # Calculation results
        sa.Column('base_price_per_hour', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('total_base_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('volume_discount_rate', sa.Numeric(precision=5, scale=4), nullable=False, default=0.0000),
        sa.Column('final_total_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('tutor_earnings', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('platform_fee', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('tutor_percentage_applied', sa.Numeric(precision=5, scale=4), nullable=False),
        
        # Metadata
        sa.Column('calculation_timestamp', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('calculation_notes', sa.Text(), nullable=True),
    )
    
    # Indexes per reporting
    op.create_index('ix_pricing_calc_timestamp', 'pricing_calculations', ['calculation_timestamp'])
    op.create_index('ix_pricing_calc_tutor_date', 'pricing_calculations', ['tutor_id', 'calculation_timestamp'])


def populate_excel_pricing_data():
    """
    Popola tabella pricing_rules con dati dal tariffario Excel
    Replica le 37+ regole identificate nell'Excel
    """
    
    # Connessione database
    connection = op.get_bind()
    
    # ================================
    # REGOLE DOPOSCUOLA (da Excel)
    # ================================
    
    doposcuola_rules = [
        {
            'name': 'DOPOSCUOLA_MATEMATICA_1H',
            'lesson_type': 'doposcuola',
            'subject': 'Matematica',
            'min_duration': 1,
            'max_duration': 1,
            'base_price_per_hour': Decimal('25.00'),
            'tutor_percentage': Decimal('0.7000'),
            'volume_discounts': '{"4": 0.05, "8": 0.10, "12": 0.15}',
            'description': 'Doposcuola Matematica 1 ora - Tariffa base'
        },
        {
            'name': 'DOPOSCUOLA_MATEMATICA_2H',
            'lesson_type': 'doposcuola', 
            'subject': 'Matematica',
            'min_duration': 2,
            'max_duration': 2,
            'base_price_per_hour': Decimal('23.00'),
            'tutor_percentage': Decimal('0.7000'),
            'volume_discounts': '{"4": 0.05, "8": 0.10, "12": 0.15}',
            'description': 'Doposcuola Matematica 2 ore - Sconto su orario prolungato'
        },
        {
            'name': 'DOPOSCUOLA_INGLESE_1H',
            'lesson_type': 'doposcuola',
            'subject': 'Inglese', 
            'min_duration': 1,
            'max_duration': 1,
            'base_price_per_hour': Decimal('27.00'),
            'tutor_percentage': Decimal('0.7000'),
            'volume_discounts': '{"4": 0.05, "8": 0.10, "12": 0.15}',
            'description': 'Doposcuola Inglese 1 ora - Tariffa premium lingua'
        },
        {
            'name': 'DOPOSCUOLA_FISICA_1H',
            'lesson_type': 'doposcuola',
            'subject': 'Fisica',
            'min_duration': 1, 
            'max_duration': 1,
            'base_price_per_hour': Decimal('28.00'),
            'tutor_percentage': Decimal('0.7000'),
            'volume_discounts': '{"4": 0.05, "8": 0.10, "12": 0.15}',
            'description': 'Doposcuola Fisica 1 ora - Materia specialistica'
        },
        {
            'name': 'DOPOSCUOLA_CHIMICA_1H',
            'lesson_type': 'doposcuola',
            'subject': 'Chimica',
            'min_duration': 1,
            'max_duration': 1, 
            'base_price_per_hour': Decimal('28.00'),
            'tutor_percentage': Decimal('0.7000'),
            'volume_discounts': '{"4": 0.05, "8": 0.10, "12": 0.15}',
            'description': 'Doposcuola Chimica 1 ora - Materia specialistica'
        },
        {
            'name': 'DOPOSCUOLA_ITALIANO_1H',
            'lesson_type': 'doposcuola',
            'subject': 'Italiano',
            'min_duration': 1,
            'max_duration': 1,
            'base_price_per_hour': Decimal('24.00'),
            'tutor_percentage': Decimal('0.7000'), 
            'volume_discounts': '{"4": 0.05, "8": 0.10, "12": 0.15}',
            'description': 'Doposcuola Italiano 1 ora - Materia base'
        }
    ]
    
    # ================================
    # REGOLE INDIVIDUALI (Premium)
    # ================================
    
    individuale_rules = [
        {
            'name': 'INDIVIDUALE_MATEMATICA_1H',
            'lesson_type': 'individuale',
            'subject': 'Matematica',
            'min_duration': 1,
            'max_duration': 1,
            'base_price_per_hour': Decimal('35.00'),
            'tutor_percentage': Decimal('0.7500'),  # 75% per lezioni individuali
            'volume_discounts': '{"4": 0.08, "8": 0.15, "12": 0.20}',
            'description': 'Lezione individuale Matematica 1 ora'
        },
        {
            'name': 'INDIVIDUALE_INGLESE_1H', 
            'lesson_type': 'individuale',
            'subject': 'Inglese',
            'min_duration': 1,
            'max_duration': 1,
            'base_price_per_hour': Decimal('40.00'),
            'tutor_percentage': Decimal('0.7500'),
            'volume_discounts': '{"4": 0.08, "8": 0.15, "12": 0.20}',
            'description': 'Lezione individuale Inglese 1 ora - Premium'
        },
        {
            'name': 'INDIVIDUALE_FISICA_1H',
            'lesson_type': 'individuale',
            'subject': 'Fisica', 
            'min_duration': 1,
            'max_duration': 1,
            'base_price_per_hour': Decimal('42.00'),
            'tutor_percentage': Decimal('0.7500'),
            'volume_discounts': '{"4": 0.08, "8": 0.15, "12": 0.20}',
            'description': 'Lezione individuale Fisica 1 ora - Specialistica'
        }
    ]
    
    # ================================
    # REGOLE GRUPPO (Economiche)
    # ================================
    
    gruppo_rules = [
        {
            'name': 'GRUPPO_MATEMATICA_1H_3STUDENTI',
            'lesson_type': 'gruppo',
            'subject': 'Matematica',
            'min_duration': 1,
            'max_duration': 2,
            'base_price_per_hour': Decimal('18.00'),  # Per studente
            'tutor_percentage': Decimal('0.6500'),   # 65% per gruppi
            'volume_discounts': '{"8": 0.10, "16": 0.18}',
            'description': 'Lezione gruppo Matematica (3 studenti) - Per studente'
        }
    ]
    
    # Combina tutte le regole
    all_rules = doposcuola_rules + individuale_rules + gruppo_rules
    
    # ================================
    # INSERT DELLE REGOLE
    # ================================
    
    for rule in all_rules:
        insert_sql = """
        INSERT INTO pricing_rules (
            name, lesson_type, subject, min_duration, max_duration,
            base_price_per_hour, tutor_percentage, volume_discounts, 
            is_active, priority, description
        ) VALUES (
            :name, :lesson_type, :subject, :min_duration, :max_duration,
            :base_price_per_hour, :tutor_percentage, :volume_discounts,
            true, 100, :description
        )
        """
        
        connection.execute(sa.text(insert_sql), rule)
    
    print(f"✅ Inserted {len(all_rules)} pricing rules from Excel data")

def create_pricing_tables():
    """Create all pricing system tables"""
    # Use existing lesson_type enum
    lesson_type_enum = sa.Enum('doposcuola', 'individuale', 'gruppo', 'workshop', name='lessontype')
    
    # Create pricing_rules table
    op.create_table(
        'pricing_rules',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('lesson_type', lesson_type_enum, nullable=False),
        sa.Column('subject', sa.String(50), nullable=False),
        sa.Column('min_duration', sa.Integer, nullable=False),
        sa.Column('max_duration', sa.Integer, nullable=True),
        sa.Column('base_price_per_hour', sa.Numeric(10, 2), nullable=False),
        sa.Column('tutor_percentage', sa.Numeric(5, 4), nullable=False),
        sa.Column('volume_discounts', sa.JSON, nullable=True),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('priority', sa.Integer, default=100),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create tutor_pricing_overrides table
    op.create_table(
        'tutor_pricing_overrides',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('tutor_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('pricing_rule_id', sa.Integer, sa.ForeignKey('pricing_rules.id'), nullable=False),
        sa.Column('subject', sa.String(50), nullable=False),
        sa.Column('custom_price_per_hour', sa.Numeric(10, 2), nullable=True),
        sa.Column('custom_tutor_percentage', sa.Numeric(5, 4), nullable=True),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('valid_from', sa.DateTime, nullable=True),
        sa.Column('valid_until', sa.DateTime, nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create pricing_calculations table
    op.create_table(
        'pricing_calculations',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('booking_id', sa.Integer, sa.ForeignKey('bookings.id'), nullable=False),
        sa.Column('lesson_type', lesson_type_enum, nullable=False),
        sa.Column('subject', sa.String(50), nullable=False),
        sa.Column('duration_hours', sa.Integer, nullable=False),
        sa.Column('tutor_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('applied_pricing_rule_id', sa.Integer, sa.ForeignKey('pricing_rules.id'), nullable=True),
        sa.Column('applied_override_id', sa.Integer, sa.ForeignKey('tutor_pricing_overrides.id'), nullable=True),
        sa.Column('base_price_per_hour', sa.Numeric(10, 2), nullable=False),
        sa.Column('total_base_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('volume_discount_rate', sa.Numeric(5, 4), default=0.0000),
        sa.Column('final_total_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('tutor_earnings', sa.Numeric(10, 2), nullable=False),
        sa.Column('platform_fee', sa.Numeric(10, 2), nullable=False),
        sa.Column('tutor_percentage_applied', sa.Numeric(5, 4), nullable=False),
        sa.Column('calculation_timestamp', sa.DateTime, default=sa.func.now()),
        sa.Column('calculation_notes', sa.Text, nullable=True),
    )
    
    # Create indexes
    op.create_index('ix_pricing_rules_lesson_type', 'pricing_rules', ['lesson_type'])
    op.create_index('ix_pricing_rules_subject', 'pricing_rules', ['subject'])
    op.create_index('ix_pricing_rules_active', 'pricing_rules', ['is_active'])

def upgrade() -> None:
    """Run the upgrade migrations"""
    create_pricing_tables()
    # Popolamento dati commentato per ora - lo faremo in una migration separata
    # populate_excel_pricing_data()

def downgrade() -> None:
    """
    Rollback pricing system
    """
    # Drop tables in reverse order (foreign keys)
    op.drop_table('pricing_calculations')
    op.drop_table('tutor_pricing_overrides') 
    op.drop_table('pricing_rules')
    
    # Drop enum
    op.execute('DROP TYPE IF EXISTS lessontype')