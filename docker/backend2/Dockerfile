FROM python:3.8-alpine as builder

WORKDIR /requirements

RUN apk add --no-cache \
        gcc \
        g++ \
        libffi-dev \
        libxml2-dev \
        libxslt-dev \
        musl-dev \
        openssl-dev \
        postgresql-dev \
        python3-dev \
    && pip3 install --no-cache-dir poetry

COPY ./backend2/poetry.lock ./backend2/pyproject.toml /

RUN poetry export -o /requirements.txt \
    && pip3 install --target=/requirements --no-cache-dir -r /requirements.txt


FROM python:3.8-alpine

ENV PYTHONUNBUFFERED=y
WORKDIR /app
VOLUME /credentials/gmail

RUN apk add --no-cache \
        libpq \
        libstdc++ \
        libxslt-dev

COPY --from=builder /requirements /usr/local/lib/python3.8/site-packages
COPY ./backend2 ./

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "--host", "0.0.0.0", "--port", "8000", "src.main:app"]
