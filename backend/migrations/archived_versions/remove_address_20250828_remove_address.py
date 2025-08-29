"""Remove address from students table"""

revision = 'remove_address_20250828'
down_revision = 'eecdf9e451d1'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    op.drop_column('students', 'address')

def downgrade() -> None:
    op.add_column('students', sa.Column('address', sa.Text(), nullable=True))