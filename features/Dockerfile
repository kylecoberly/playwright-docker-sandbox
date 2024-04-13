FROM mcr.microsoft.com/playwright:v1.43.0-jammy
WORKDIR /app

COPY features ./features
COPY features/playwright.config.ts .
COPY package*.json .
RUN npm ci

CMD ["npm", "run", "test:ui"]
