FROM node:wheezy
MAINTAINER Starfox64 <louisdijon21@yahoo.fr>

COPY . /supinbot

WORKDIR /supinbot

RUN npm install --production

CMD node index.js

EXPOSE 8080
