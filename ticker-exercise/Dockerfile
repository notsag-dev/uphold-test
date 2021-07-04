FROM node:14

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD sleep 60 && npm run migrate && npm start
