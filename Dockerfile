FROM node:wheezy
MAINTAINER Starfox64 <louisdijon21@yahoo.fr>

COPY . /supinbot
WORKDIR /supinbot

RUN npm install --production
CMD ./init-shared.sh && node index.js

VOLUME /supinbot/shared
