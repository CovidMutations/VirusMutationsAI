from src.core.email import EmailCoreService
from src.core.subscription import SubscriptionCoreService


def queue_articles():
    subscription_service = SubscriptionCoreService()
    subscription_service.find_and_queue_articles_to_send()


def send_messages_from_queue():
    mail_service = EmailCoreService()
    while mail_service.send_message_from_queue():
        pass
