from typing import Any

from jinja2 import Environment, FileSystemLoader

from src.db.models import MessageQueue
from src.db.models.mail import MessageStatus
from src.db.session import SessionLocal


class EmailCoreService:
    def __init__(self):
        self._db = SessionLocal()
        self._jinja_env = Environment(loader=FileSystemLoader(searchpath="templates"))

    def add_message_to_queue(self, to: str, subject_template_path: str, html_template_path: str, environment: Any):
        subject = self._jinja_env.get_template(subject_template_path).render(environment)
        html = self._jinja_env.get_template(html_template_path).render(environment)

        self._db.add(MessageQueue(to=to, subject=subject, contents=html, status=MessageStatus.NEW, message=""))
        self._db.commit()
