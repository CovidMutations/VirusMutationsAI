#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER "$DB_USER" WITH PASSWORD '$DB_USER_PASSWORD';
    CREATE DATABASE "$DB_NAME";
    GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_USER";
    \c "$DB_NAME";
    CREATE EXTENSION "uuid-ossp";
EOSQL