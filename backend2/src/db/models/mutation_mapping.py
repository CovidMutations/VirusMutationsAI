from sqlalchemy import Column, UnicodeText, PrimaryKeyConstraint

from src.db.base import Base


class MutationMapping(Base):
    __tablename__ = "mutation_mapping"
    __table_args__ = (
        PrimaryKeyConstraint("nucleotide", "protein"),
    )

    nucleotide = Column(UnicodeText, nullable=False)
    protein = Column(UnicodeText, nullable=False)
