FROM --platform=linux/amd64 node:16.13.0-buster-slim

WORKDIR /2-transformation-step-uppercase

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD [ "npm", "start" ]