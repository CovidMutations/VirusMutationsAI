"""Initial revision

Revision ID: df419851a830
Revises: 
Create Date: 2020-11-11 18:00:45.523670

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'df419851a830'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
    sa.Column('created', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=False),
    sa.Column('username', sa.UnicodeText(), nullable=False),
    sa.Column('email', sa.UnicodeText(), nullable=False),
    sa.Column('password', sa.UnicodeText(), nullable=False),
    sa.Column('salt', sa.UnicodeText(), nullable=False),
    sa.Column('active', sa.Boolean(), nullable=False),
    sa.Column('verificationCode', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('subscription',
    sa.Column('user_id', postgresql.UUID(), nullable=False),
    sa.Column('mutation', sa.UnicodeText(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'mutation')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('subscription')
    op.drop_table('user')
    # ### end Alembic commands ###
