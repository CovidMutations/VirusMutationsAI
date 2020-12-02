"""Add abstract column

Revision ID: 1274cad53aab
Revises: cf979cdeedcf
Create Date: 2020-12-02 04:09:23.114258

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.

revision = '1274cad53aab'
down_revision = 'cf979cdeedcf'
branch_labels = None
depends_on = None

article_data = sa.table(
    'article_data',
    sa.Column('abstract', sa.UnicodeText()),
    sa.Column('id', postgresql.UUID())
    # Other columns not needed for the data migration
)

article = sa.table(
    'article',
    sa.Column('body', sa.UnicodeText()),
    sa.Column('id', postgresql.UUID())
    # Other columns not needed for the data migration
)


def upgrade():
    op.add_column('article_data', sa.Column('abstract', sa.UnicodeText(), server_default='', nullable=False))
    extract_abstract = sa.text(
        "array_to_string(xpath('.//front/article-meta/abstract/*', article.body::xml), E'\n', '')"
    )
    op.execute(
        sa.update(article_data).values(abstract=extract_abstract).where(article_data.c.id == article.c.id)
    )


def downgrade():
    op.drop_column('article_data', 'abstract')
