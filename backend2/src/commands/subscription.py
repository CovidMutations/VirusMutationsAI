from src.core.email import EmailCoreService
from src.core.subscription import SubscriptionCoreService

subscription_service = SubscriptionCoreService()
mail_service = EmailCoreService()


def queue_articles():
    subscription_service.find_and_queue_articles_to_send()


def send_messages_from_queue():
    while mail_service.send_message_from_queue():
        pass
