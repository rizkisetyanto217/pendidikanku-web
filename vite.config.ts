// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    // pakai HTTP saja (tanpa https)
    port: 5174,
    proxy: {
      "/api": {
        target: "https://masjidkubackend4-production.up.railway.app",
        changeOrigin: true,
        secure: true,
        // backend kamu memang pakai prefix /api, jadi TIDAK perlu rewrite
        // rewrite: (p) => p.replace(/^\/api/, "/api"),

        // ini agar Set-Cookie dari Railway disimpan sebagai cookie 'localhost'
        cookieDomainRewrite: "localhost",
      },
    },
  },
});
