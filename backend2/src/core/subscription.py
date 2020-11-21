from collections import defaultdict
from datetime import datetime

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.sql.functions import now

from src.core.email import EmailCoreService
from src.db.models import User, UserConfig, SubscriptionStatus, Subscription, ArticleMutation, ArticleData
from src.db.session import SessionLocal


class SubscriptionCoreService:
    def __init__(self):
        self._db = SessionLocal()
        self._email_service = EmailCoreService()

    def find_articles_to_send(self):
        never_sent = SubscriptionStatus.last_send.is_(None)
        subscription_interval_reached = UserConfig.subscription_interval + SubscriptionStatus.last_send < now()
        article_not_sent = ArticleData.updated > SubscriptionStatus.last_send

        subscription_condition = never_sent | subscription_interval_reached
        article_condition = never_sent | article_not_sent

        fields_to_select = (
            User.id,
            User.username,
            User.email,
            ArticleData.title,
            ArticleData.url,
            Subscription.mutation
        )

        articles_to_send = self._db.query(*fields_to_select)\
            .outerjoin(UserConfig)\
            .outerjoin(SubscriptionStatus)\
            .join(Subscription)\
            .join(ArticleMutation, ArticleMutation.mutation == Subscription.mutation)\
            .join(ArticleData)\
            .filter(User.active & subscription_condition & article_condition) \
            .all()

        articles_by_mutation_by_user_id = defaultdict(lambda: {"mutations": defaultdict(list)})
        for row in articles_to_send:
            articles_by_mutation_by_user_id[row.id]["mutations"][row.mutation].append({
                "title": row.title,
                "url": row.url,
            })
            articles_by_mutation_by_user_id[row.id]["email"] = row.email
            articles_by_mutation_by_user_id[row.id]["username"] = row.username

        return articles_by_mutation_by_user_id

    def find_and_queue_articles_to_send(self) -> int:
        articles_to_send = self.find_articles_to_send()
        for user_id, articles in articles_to_send.items():
            self.add_new_articles_message_to_queue(articles["email"], articles)
            subscription_status = {"user_id": user_id, "last_send": datetime.utcnow()}
            insert_statement = insert(SubscriptionStatus).values(subscription_status).on_conflict_do_update(
                index_elements=[SubscriptionStatus.user_id],
                set_={"last_send": datetime.utcnow()}
            )
            self._db.execute(insert_statement)
        self._db.commit()

        return len(articles_to_send)

    def add_new_articles_message_to_queue(self, to, articles):
        self._email_service.add_message_to_queue(
            to,
            "new_articles_for_mutations_subject.html",
            "new_articles_for_mutations.html",
            articles,
        )
