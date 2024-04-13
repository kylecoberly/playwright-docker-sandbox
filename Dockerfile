FROM node:20.8.1-bookworm
WORKDIR /app
USER root

# COPY ./package*.json .
COPY . .
RUN npm ci

CMD ["npm", "run", "dev"]
