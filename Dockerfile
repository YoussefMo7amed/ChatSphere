FROM node:20-alpine

WORKDIR /project/src/

COPY ./src .

RUN npm install 

EXPOSE 3000

ENTRYPOINT ["node", "/project/src/index.js"]
