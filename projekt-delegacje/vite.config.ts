import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Delegacje Artikon",
        short_name: "Delegacje",
        description: "System zarządzania delegacjami",
        theme_color: "#002E7A",
        background_color: "#002E7A",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "./img/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./img/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
