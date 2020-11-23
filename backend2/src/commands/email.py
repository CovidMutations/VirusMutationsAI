from yagmail.oauth2 import get_oauth2_info

from src.core.config import settings
from src.core.email import EmailCoreService


def login_to_gmail():
    get_oauth2_info(settings.GMAIL_CREDENTIALS_PATH)


def send_message(to: str, subject: str, contents: str):
    mail_service = EmailCoreService()
    mail_service.send_message(to, subject, contents, False)
