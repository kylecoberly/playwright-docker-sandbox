FROM node:20.8.1-bookworm
WORKDIR /app
USER root

COPY ./package.json ./package.json
# COPY ./package-lock.json .
RUN npm install
COPY . .

CMD ["npm", "run", "_dev"]
