import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // "@/lib/utils" style imports, as Aceternity components expect.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    // Send /api/* to the Express server during development, so the browser
    // sees one origin (just like on Vercel) and no CORS setup is needed.
    proxy: { "/api": "http://localhost:3000" },
  },
});
