# VirusMutationsAI
Welcome to VirusMutationsAI - a web-dashboard with smart routines to analyze genomes of viruses.
Current implementation allows to search articles for mutations at the covid-19 virus genome.


## Install packages

Install and run `yarn`


## Run backend

Run `yarn back`

## Run frontend

Run `yarn front`


## Update articles DB manually:

Launch consequently from 'backend/scripts': covid_articles_db.py, mutations_extractor.py


## Deploy

Run `npm run covid`

## Docker

### Build images

#### Frontend
Run the following command in the root directory of the repo:

`docker build -t <tag> -f docker/frontend/Dockerfile .`

The image exposes port `80`.

Frontend app can be configured via environment variables.

| Variable | Description | Required | Example |
| -------  | ----------- | -------- | ------- |
| API_URL | Backend API URL | y | `http://localhost:3000/api/` |
| API2_URL | 2nd backend API URL | y | `http://localhost:8000/api/` |

#### Backend
Run the following command in the root directory of the repo:

`docker build -t <tag> -f docker/backend/Dockerfile .`

The image exposes port `3000` by default
but it can be configured via `PORT` environment variable.

Backend app can be configured via environment variables.

| Variable | Description | Required | Example |
| -------  | ----------- | -------- | ------- |
| PORT | | y | `3000` |
| ORIGIN | | y | `http://localhost` |
| PUBLIC_URL | Site address used for links in emails  | y | `http://localhost` |
| DB_TYPE | | y | `postgres` |
| DB_HOST | | y | `172.17.0.1` |
| DB_PORT | | y | `5432` |
| DB_USER | | y | `username` |
| DB_NAME | | y | `covid` |
| DB_PASSWORD | | y | `password` |
| DB_SYNCHRONIZE | | y | `true` |
| JWT_SECRET | | y | `VerySecretString` |
| MAIL_SERVICE | | y | `gmail` |
| MAIL_EMAIL | | y | `username@example.com` |
| MAIL_PASSWORD | | y | `password` |
| MAIL_CLIENT_ID | | y | `123456789.apps.googleusercontent.com` |
| MAIL_CLIENT_SECRET | | y | `agHrjEwr5gWfc` |
| MAIL_SUBJECT | | y | `Hello` |

#### Backend 2
Run the following command in the root directory of the repo:

`docker build -t <tag> -f docker/backend2/Dockerfile .`

The image exposes port `8000` by default.

Backend app can be configured via environment variables.

| Variable | Description | Required | Example |
| -------  | ----------- | -------- | ------- |
| PROJECT_NAME | Open API Title | n | `Virus Mutations AI API` |
| ACCESS_TOKEN_URL | Authentication URL for Swagger | n | `http://localhost:3000/api/login` |
| API_V1_STR | API version 1 prefix | n | `/api/v1` |
| SECRET_KEY | JWT key | y | `VerySecretString` |
| CORS_ORIGINS | JSON-formatted list of origins | n | `["http://localhost:4200", "http://127.0.0.1:4200"]` |
| PUBLIC_URL | Site address used in links in emails  | y | `http://localhost` |
| POSTGRES_SERVER | | n | `172.17.0.1` |
| POSTGRES_PORT | | n | `5432` |
| POSTGRES_USER | | n | `username` |
| POSTGRES_PASSWORD | | n | `password` |
| POSTGRES_DB | | n | `covid` |
| SQLALCHEMY_DATABASE_URI | | n | `postgres://username:password@server/db` |
| LOG_QUERIES | Log SQL queries | n | `False` |

### Run the app using [Docker Compose](https://docs.docker.com/compose/)
See [docker-compose.yml](docker/docker-compose.yml) in the docker directory.
