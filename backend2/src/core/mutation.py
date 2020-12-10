from typing import TextIO

from psycopg2._psycopg import cursor
from sqlalchemy.orm import Session

from src.db.session import SessionLocal


class MutationCoreService:
    def __init__(self):
        self.db: Session = SessionLocal()

    def add_mutation_mappings_from_csv(self, file: TextIO, header=False, delimiter=","):
        table = "mutation_mapping"
        header_opt = "HEADER" if header else ""
        command = f"COPY {table} FROM STDIN WITH CSV {header_opt} DELIMITER '{delimiter}' ENCODING 'utf-8'"

        connection = self.db.get_bind().raw_connection()
        cur: cursor = connection.cursor()
        cur.copy_expert(command, file)
        connection.commit()
        connection.close()
