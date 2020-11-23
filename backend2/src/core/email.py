from typing import Any

from jinja2 import Environment, FileSystemLoader
from yagmail import SMTP

from src.core.config import settings
from src.db.models import MessageQueue
from src.db.models.mail import MessageStatus
from src.db.session import SessionLocal


class EmailCoreService:
    def __init__(self):
        self._db = SessionLocal()
        self._jinja_env = Environment(loader=FileSystemLoader(searchpath="src/templates"))
        self._yag = SMTP(settings.EMAIL_FROM, oauth2_file=settings.GMAIL_CREDENTIALS_PATH)

    def add_message_to_queue(self, to: str, subject_template_path: str, html_template_path: str, environment: Any):
        subject = self._jinja_env.get_template(subject_template_path).render(environment)
        html = self._jinja_env.get_template(html_template_path).render(environment)

        self._db.add(MessageQueue(to=to, subject=subject, contents=html, status=MessageStatus.NEW, message=""))
        self._db.commit()

    def send_message_from_queue(self) -> bool:
        """Find a new message in the queue and send it.

        Returns False if queue is empty
        """
        message: MessageQueue = self._db.query(MessageQueue) \
            .filter(MessageQueue.status == MessageStatus.NEW) \
            .with_for_update(skip_locked=True, key_share=True) \
            .first()

        if not message:
            return False

        try:
            self.send_message(message.to, message.subject, message.contents)  # TODO: Handle errors
        finally:
            message.status = MessageStatus.OK
            self._db.commit()

        return True

    def send_message(self, to: str, subject: str, contents: str, html=True):
        if html:
            contents = contents.replace("\n", " ")  # Prevent yagmail from replacing newlines with <br> tags
        return self._yag.send(to, subject, contents)
