import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy para API PostgreSQL
      "/api/postgres": {
        target: "https://codcoz-api-postgres.koyeb.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/postgres/, ""),
        secure: true,
      },
      // Proxy para API MongoDB
      "/api/mongo": {
        target: "https://codcoz-api-mongo-eemr.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mongo/, ""),
        secure: true,
      },
      // Proxy para API Redis
      "/api/redis": {
        target: "https://codcoz-api-redis.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/redis/, ""),
        secure: true,
      },
    },
  },
});
