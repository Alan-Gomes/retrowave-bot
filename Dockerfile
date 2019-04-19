FROM node:lts-alpine

USER root

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

WORKDIR /opt/app
COPY . .

RUN npm install

WORKDIR /opt/app/src

ENTRYPOINT [ "node", "index.js" ]
