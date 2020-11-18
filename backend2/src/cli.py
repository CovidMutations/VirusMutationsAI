from src.core.article import ArticleCoreService


def fetch_new_article_ids():
    ArticleCoreService().fetch_and_save_new_article_ids()


def main():
    fetch_new_article_ids()


if __name__ == '__main__':
    main()
