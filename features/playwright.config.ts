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
