FROM node:alpine

WORKDIR /app

EXPOSE 6000

COPY package*.json ./

RUN npm install --force --production=true

COPY . .

CMD ["npm", "start"]