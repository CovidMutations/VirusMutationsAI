# Image to build the app, it includes only build-time dependencies
FROM node:12.19-buster-slim as app-builder

COPY ./package.json ./yarn.lock ./app/

WORKDIR /app/backend

COPY ./backend/package.json ./backend/yarn.lock ./
RUN yarn install --frozen-lockfile --focus

COPY ./backend ./
RUN yarn run build


# Image to build run-time node.js dependencies
FROM node:12.19-buster-slim as node-deps-builder

COPY ./package.json ./yarn.lock ./app/

WORKDIR /app/backend

COPY ./backend/package.json ./backend/yarn.lock ./
RUN yarn install --frozen-lockfile --production --focus


# Image to build Python dependencies. Using the same base image as the final one
FROM node:12.19-buster-slim as python-deps-builder

WORKDIR /requirements

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-setuptools \
        python3-wheel \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /requirements.txt

RUN pip3 install --prefix=/requirements --no-cache-dir -r /requirements.txt


# Final image
FROM node:12.19-buster-slim

ENV NODE_ENV=production \
    SUPPRESS_NO_CONFIG_WARNING=y \
    PYTHONPATH=/usr/local/lib/python3.7/site-packages/

WORKDIR /app/backend

RUN apt-get update \
    && mkdir -p /usr/share/man/man1 /usr/share/man/man2 \
    && apt-get install -y --no-install-recommends \
        python3 \
        default-jre \
    && rm -rf /var/lib/apt/lists/*

COPY --from=node-deps-builder /app/backend/node_modules ./node_modules
COPY --from=node-deps-builder /app/node_modules ../node_modules
COPY --from=python-deps-builder /requirements /usr/local
COPY --from=app-builder /app/backend/dist ./
COPY --from=app-builder /app/backend/config ./config
COPY --from=app-builder /app/backend/assets ./assets
COPY --from=app-builder /app/backend/py ./py

VOLUME /app/backend/py/db

EXPOSE 3000

CMD ["node", "/app/backend/src/main.js"]
