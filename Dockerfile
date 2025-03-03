FROM node:22.14-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm i

RUN npx tsc

CMD ["node", "dist/index.js"]

