import click

from src.core.article import ArticleCoreService

article_service = ArticleCoreService()


def fetch_new_articles():
    ids_num = article_service.fetch_and_save_new_article_ids()
    for _ in range(ids_num):
        article_service.fetch_and_save_new_article()
        article_service.parse_new_article()

    click.echo(f'{ids_num} articles fetched')


def fetch_article(id_):
    try:
        article_service.fetch_and_save_article(id_)
        article_service.parse_article(id_)
    except RuntimeError as e:
        click.echo(str(e), err=True)


def parse_article(id_):
    try:
        article_service.parse_article(id_)
    except RuntimeError as e:
        click.echo(str(e), err=True)


def parse_all_articles():
    try:
        article_service.parse_all_new_articles()
    except RuntimeError as e:
        click.echo(str(e), err=True)
