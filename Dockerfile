FROM node:20.8.1-bookworm
WORKDIR /app

COPY . .
RUN npm ci

CMD ["npm", "start"]
