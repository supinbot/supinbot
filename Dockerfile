FROM node:wheezy
MAINTAINER Starfox64 <louisdijon21@yahoo.fr>

COPY . /supinbot
WORKDIR /supinbot

RUN npm install --production && chmod 755 *.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["supinbot"]

VOLUME /supinbot/shared
