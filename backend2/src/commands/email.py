from yagmail import SMTP

from src.core.config import settings
from src.core.email import EmailCoreService

mail_service = EmailCoreService()


def login_to_gmail():
    with SMTP(oauth2_file=settings.GMAIL_CREDENTIALS_PATH):
        pass


def send_message(to: str, subject: str, contents: str):
    mail_service.send_message(to, subject, contents, False)
