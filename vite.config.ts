/** @type {import('vite').UserConfig} */

import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
  ],
  define: {
    "process.env": {}, // Needed to hack import.meta into React
  },
  server: {
    port: Number(process.env.PORT),
    fs: {
      cachedChecks: false,
    },
  },
  build: {
    sourcemap: true,
  },
});
