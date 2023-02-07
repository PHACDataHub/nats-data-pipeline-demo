FROM --platform=linux/amd64 node:16.13.0-buster-slim

WORKDIR /3a-add-to-kv-store

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD [ "npm", "start" ]