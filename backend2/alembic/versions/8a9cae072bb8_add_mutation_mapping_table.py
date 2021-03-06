"""Add mutation mapping table

Revision ID: 8a9cae072bb8
Revises: 1274cad53aab
Create Date: 2020-12-08 18:39:24.153031

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8a9cae072bb8'
down_revision = '1274cad53aab'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('mutation_mapping',
    sa.Column('nucleotide', sa.UnicodeText(), nullable=False),
    sa.Column('protein', sa.UnicodeText(), nullable=False),
    sa.PrimaryKeyConstraint('nucleotide', 'protein')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('mutation_mapping')
    # ### end Alembic commands ###
