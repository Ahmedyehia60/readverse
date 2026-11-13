import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/postcss";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  css: { postcss: { plugins: [tailwindcss()] } },
  server: {
    host: "0.0.0.0",
    proxy: { "/api": { target: "http://127.0.0.1:4000", changeOrigin: true } },
  },
  build: { outDir: "dist", sourcemap: false },
});
