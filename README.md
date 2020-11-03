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

### Run the app using [Docker Compose](https://docs.docker.com/compose/)
See [docker-compose.yml](docker/docker-compose.yml) in the docker directory.
