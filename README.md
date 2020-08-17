# VirusMutationsAI



## Install packages

Install and run `yarn`


## Run backend

Run `yarn back`

## Run frontend

Run `yarn front`


## Update articles DB manually:

Launch consequently from 'backend/scripts': covid_articles_db.py, mutations_extractor.py


## Deploy

# 1. Run backend in production mode

Run `yarn back:prod`

Copy next folders to the server: dist, db, scripts, assets, experiments, config and package.json file

Launch on server: `npm i`, `pm2 delete covid`, `pm2 start ecosystem.json`

Watch logs: `pm2 logs --lines 200`


# 2. Run frontend in production mode

Run `yarn front:prod`

Copy next folders to the server: dist, assets


