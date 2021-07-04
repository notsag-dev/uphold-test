# Uphold backend exercise

## Requirements
Docker and Docker Compose have to be available in order to run the project.

## Set up the project
In both `ticker-exercise` and `database` folders there is a file called `.env.example`. Please copy their contents into a file called `.env` in their respective folders. The one in `ticker-exercise` needs to be set an Uphold application api key and secret in order for it to work.

## Test
From the `ticker-exercise` folder, run:
```
npm install && npm run test
```

## Run using docker
From the root folder, run:
```
docker-compose up
```
Notes:
- Note that in order to make your life easier and be able to run the database and the node container with this only command, the node container is sleeping for 60 seconds before starting to ensure the database is configured correctly (Docker compose's depends_on is not enough in this case). In a more realistic scenario this would not be done this way.
- If a rebuild of the Docker images and recreation of containers is needed, run `docker-compose up --build --force-recreate` instead.

## Run on host
It is possible to run this project out of Docker but the database has to be set up manually. In this case, Node 14 is needed.

After manually creating the db and updating the `.env` to match your db user's credentials, run:
```
npm install
npm run build
npm run migrate
npm start
```

## Query alerts from the database
Find the Postgres db connection information in any of the .env files mentioned above (host will be the IP of your Docker host), and connect to it. Query to get all the alerts:
```
select * from alerts;
```
