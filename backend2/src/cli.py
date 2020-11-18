from src.core.article import ArticleCoreService

articleService = ArticleCoreService()


def fetch_new_article_ids():
    articleService.fetch_and_save_new_article_ids()


def fetch_article():
    articleService.fetch_and_save_new_article()


def main():
    # fetch_new_article_ids()
    fetch_article()


if __name__ == '__main__':
    main()
