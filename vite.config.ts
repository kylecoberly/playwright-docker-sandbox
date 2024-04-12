/** @type {import('vite').UserConfig} */

import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  assetsInclude: ["./public"],
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    tsconfigPaths(),
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      $: path.resolve(__dirname, "./features"),
    },
  },
});
