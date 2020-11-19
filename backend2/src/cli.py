from src.core.article import ArticleCoreService

article_service = ArticleCoreService()


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


def main():
    # fetch_new_article_ids()
    # fetch_article()
    # fetch_article_by_id('0400ee7e-bef4-40c1-92ac-3eb60bce0757')
    # parse_article('0400ee7e-bef4-40c1-92ac-3eb60bce0757')
    parse_new_article()


if __name__ == '__main__':
    main()
