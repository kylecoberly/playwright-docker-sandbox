# Testing micro-frontends with Playwright

This repo contains:

- **A stand-alone web app.** This app is unaware of Docker and Playwright. While
  it's React/TS/Vite, it could be any web technology. The entrypoint for this
  app is `index.html`, and the Dockerfile describing how to run it in a
  container is in `Dockerfile`. Locally it's available on
  `http://localhost:3000`, and within the Docker network it's available on
  `http://frontend:3000`.
- **A static website wrapping the web app.** This is a static website that
  renders the web app in an iframe. Nginx serves all the files in
  `features/wrapper` locally at `http://localhost:8080` and within the Docker
  network at `http://wrapper:80`. This is a mock of the environment the web app
  will render in.
- **Playwright tests.** The test file in `features/tests` is a complete UI test
  of the app, including assertions made through an iframe.
- **Playwright UI.** Running `npm run docker` will launch the web app, the
  wrapper site, and Playwright UI. Playwright UI is a browser-based UI workshop
  that runs Playwright tests while also providing a richer suite of analysis
  tools than regular dev tools. Playwright and all its browsers are part of the
  Docker image created from `features/Dockerfile` and are not otherwise locally
  installed.

## Dockerizing an existing microfrontend

Create a file called `Dockerfile` in the app's root directory with these
contents:

```docker
FROM node:20.8.1-bookworm
WORKDIR /app

COPY . .
RUN npm ci

CMD ["npm", "start"]
```

Make sure to match the app's:

- Node version
- Start command

### Create a static wrapper

Save the HTML, CSS, JS, and media assets from the real environment in a folder.
Add a `Dockerfile` to this folder telling Nginx to serve it:

```docker
FROM nginx
COPY . /usr/share/nginx/html
```

Point the iframe to `http://frontend:3000`. This is where Docker will internally
serve the web app.

### Configure the containers

In the root folder of the app, create a `docker-compose.yml` file with two
services for the static `wrapper` and the `frontend`:

```yml
services:
  wrapper:
    depends_on:
      frontend:
        condition: service_healthy # Don't start until the web app is running
    build:
      context: ./features/wrapper # Location of the static site relative to this file
    healthcheck:
      test: ["CMD", "service", "nginx", "status"] # Command to report whether static site is running
      interval: 2s
    ports:
      - "8080:80" # Map your computer's `localhost:8080` to the container's port 80
  frontend:
    build:
      context: . # Location of the web app relative to this file
    healthcheck:
      test: "curl -f http://localhost:3000 || exit 1" # Command to report whether the web app is running
      interval: 2s
    environment:
      PORT: 3000 # Docker port to run the web app on (or other environment variables needed)
    volumes:
      - ./src:/app/src # Sync changes to the files in the local `src` directory with the container
    ports:
      - "3000:3000" # Map your computer's `localhost:3000` to the container's port 3000
```

If you run `docker compose up`, Docker will run serve the wrapper locally (with
the web app iframed in) on `http://localhost:8080`. You'll see real-time logs
from both containers on the terminal, and you can stop the containers with
`Ctrl + c`.

## Adding Playwright to a Dockerized app

Create a `Dockerfile` close to your test files that uses Playwright's image:

```docker
FROM mcr.microsoft.com/playwright:v1.43.0-jammy
WORKDIR /app

COPY . .
RUN npm ci

CMD ["npm", "test"]
```

Double-check the Playwright version and the test command.

Add Playwright to the project with `npm install -D @playwright/test`. Even
though the actual Playwright binaries will come from the Docker image, the
package is still needed for editor integrations. Otherwise, your test files will
have to import from packages you don't appear to have installed.

Add `test-results` to the `.gitignore` to keep your local test results out of
the repo.

Configure Playwright by creating a `playwright.config.ts` file in the root
directory of the project.

```typescript
import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  use: {
    baseURL: process.env.BASE_URL,
    headless: true,
    viewport: {
      width: 1280,
      height: 720,
    },
    video: "on",
  },
};

export default config;
```

Adjust these values as needed.

Use these test scripts to launch Playwright UI or run the tests headlessly:

```json
{
  "scripts": {
    "test": "npm run test:ui",
    "test:ui": "playwright test -c features/playwright.config.ts --ui-port=3001 --ui-host=0.0.0.0",
    "test:headless": "playwright test -c features/playwright.config.ts"
  }
}
```

Check the location of the Playwright config file.

### Add Playwright to Docker Compose

Add this service to `docker-compose.yml`:

```yml
services:
  tests:
    depends_on:
      wrapper:
        condition: service_healthy # Don't try to launch this until the wrapper (and the app it depends on) are running
    build:
      context: . # Root of the project
      dockerfile: ./features/Dockerfile # Location of the Playwright Dockerfile
    ipc: host # Keeps chrome from OOMing
    environment:
      BASE_URL: "http://wrapper:80" # Base URL for Playwright test browser requests, uses the internal URL
    volumes:
      - ./features:/app/features # Sync the files in the features directory with the ones in the container
    ports:
      - "3001:3001" # Host Playwright UI on port 3001
```

Now running `docker compose up` also launch Playwright UI on
`http://localhost:3001`. To run the tests headlessly, run
`docker compose run tests npm run test:headless`

## Writing Playwright tests

Create files with the naming convention `____.test.ts` and use the following
patterns:

```typescript
import { expect, test } from "@playwright/test";

test("test name goes here", async ({ page }) => {
  page.goto("/"); // Go to root directory

  await page.getByText("Next").click(); // Find an element and take an action

  const iframe = page.frameLocator("iframe");
  const heading = iframe.getByRole("heading"); // Get an element from an iframe

  await expect(heading).toBe("Hello, world!"); // Assert something
});
```
