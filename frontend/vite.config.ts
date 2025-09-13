/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    css: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        // Proxy for file uploads in order images to load in the chat
        target: "https://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/socket": {
        target: "wss://localhost:4000",
        ws: true, // Enable WebSocket proxying
        secure: false,
      },
    },
  },
});
