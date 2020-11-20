from src.core.article import ArticleCoreService
from src.core.subscription import SubscriptionCoreService

article_service = ArticleCoreService()
subscription_service = SubscriptionCoreService()


def fetch_new_article_ids():
    article_service.fetch_and_save_new_article_ids()


def fetch_article():
    article_service.fetch_and_save_new_article()


def fetch_article_by_id(id_):
    article_service.fetch_and_save_article(id_)


def parse_article(id_):
    article_service.parse_article(id_)


def parse_new_article():
    article_service.parse_new_article()


def subscribers_to_send():
    users = subscription_service.find_and_queue_articles_to_send()
    print(users)


def main():
    # fetch_new_article_ids()
    # fetch_article()
    # fetch_article_by_id('0400ee7e-bef4-40c1-92ac-3eb60bce0757')
    # parse_article('0400ee7e-bef4-40c1-92ac-3eb60bce0757')
    # parse_new_article()
    subscribers_to_send()


if __name__ == '__main__':
    main()
