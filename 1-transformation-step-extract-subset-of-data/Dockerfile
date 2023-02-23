FROM --platform=linux/amd64 node:16.13.0-buster-slim

WORKDIR /1-transformation-step-extract-subset-of-data

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD [ "npm", "start" ]