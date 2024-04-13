FROM mcr.microsoft.com/playwright:v1.43.0-jammy
WORKDIR /app

COPY features .
COPY package*.json .
RUN npm ci

CMD ["npx", "playwright", "test", "--ui-port=3001", "--ui-host=0.0.0.0"]
