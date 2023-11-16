import { resolve } from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import webfontDownload from "vite-plugin-webfont-dl";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/PHS-Map/",
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  plugins: [
    webfontDownload(["https://fonts.googleapis.com/css?family=Lato"]),
    VitePWA({
      strategies: "injectManifest",
      injectManifest: {
        swSrc: "src/sw.ts",
        swDest: "dist/sw.js",
        globDirectory: "dist",
        globPatterns: ["**/*.{html,js,css,json,png}"],
      },
      srcDir: "src",
      filename: "sw.ts",
      devOptions: {
        enabled: false,
        type: "module",
      },
      manifest: {
        id: "/PHS-Map/",
        scope: "/PHS-Map/",
        name: "Pattonville Senior High School Map",
        display: "standalone",
        start_url: "/PHS-Map/",
        short_name: "PHS Map",
        theme_color: "#00843e",
        description: "Pattonville Senior High School Map",
        dir: "ltr",
        orientation: "any",
        background_color: "#000000",
        related_applications: [],
        prefer_related_applications: false,
        display_override: ["window-controls-overlay"],
        icons: [
          {
            src: "/PHS-Map/psdr3-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
        screenshots: [],
        // features: [],
        categories: [],
        shortcuts: [],
      },
    }),
  ],
});
