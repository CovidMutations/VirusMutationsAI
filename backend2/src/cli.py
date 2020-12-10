import os
import sys

import click

sys.path.append(os.getcwd())

from src.commands import *  # noqa


@click.group()
def cli():
    pass


@cli.group()
def articles():
    pass


@articles.command()
@click.argument("id_", metavar='[ID]', type=click.UUID, required=False)
def fetch(id_: str = None):
    """Fetch articles"""
    if id_:
        fetch_article(id_)
    else:
        fetch_new_articles()


@articles.command()
@click.argument("id_", metavar='[ID]', type=click.UUID)
def parse(id_: str = None):
    """Parse article body"""
    parse_article(id_)

@articles.command()
def parse_all():
    """Parse all unparsed articles' bodies"""
    parse_all_articles()


@cli.group()
def subscription():
    pass


@subscription.command()
def queue():
    """Find and queue new articles to send to subscribers"""
    queue_articles()


@subscription.command()
def send():
    """Send messages from the queue"""
    send_messages_from_queue()


@cli.group()
def gmail():
    pass


@gmail.command()
def login():
    """Log in to GMAIL and save credentials file"""
    login_to_gmail()


@gmail.command()
@click.option('--to', help="To", required=True)
@click.option('--subject', help="Subject", default="VirusMutationsAI test", show_default=True)
@click.option('--body', help="Body", default="Test message from VirusMutationsAI", show_default=True)
def test(to, subject, body):
    """Send test message"""
    send_message(to, subject, body)


@cli.group()
def mutations():
    pass


@mutations.command()
@click.argument("file", metavar='input', type=click.File(encoding='utf-8'), required=True)
@click.option(
    '--header',
    help="Specifies that the file contains a header line with the names of each column in the file",
    is_flag=True,
    default=False,
    show_default=True
)
@click.option(
    '--delimiter',
    help="Specifies the character that separates columns within each row of the file",
    default=",",
    show_default=True
)
def import_mappings(file, header=False, delimiter=","):
    """Import mutation-to-protein mappings from a CSV-file"""
    add_mutation_mappings(file, header, delimiter)


if __name__ == "__main__":
    cli()
