FROM node:alpine

WORKDIR /app

EXPOSE 5000

COPY package*.json ./

RUN npm install --force --production=true

COPY . .

CMD ["npm", "start"]