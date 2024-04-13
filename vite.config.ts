/** @type {import('vite').UserConfig} */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
  ],
  define: {
    "process.env": {}, // Needed to hack import.meta into React
  },
  server: {
    port: Number(process.env.PORT),
  },
  build: {
    sourcemap: true,
  },
});
