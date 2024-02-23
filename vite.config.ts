import { resolve, join } from "node:path";
import browserslist from "browserslist";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import webfontDownload from "vite-plugin-webfont-dl";

const browsersList = browserslist();
const basename = "/PHS-Map/";

// https://vitejs.dev/config/
export default defineConfig({
  base: basename,
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        // TODO(lishaduck): Once oven-sh/bun#2472 is resolved, use it. Pun not intended :)
        main: resolve(import.meta.dirname, "index.html"),
      },
    },
    target: browserslistToEsbuild(browsersList),
    // cssMinify: "lightningcss", // Currently doesn't support first-child.
  },
  css: {
    transformer: "lightningcss",
    lightningcss: {
      targets: browserslistToTargets(browsersList),
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
      workbox: {
        cleanupOutdatedCaches: true,
      },
      manifest: {
        id: basename,
        scope: basename,
        name: "Pattonville Senior High School Map",
        display: "standalone",
        start_url: basename,
        short_name: "PHS Map",
        theme_color: "#00843e",
        description: "A map of Pattonville Senior High School",
        dir: "ltr",
        orientation: "any",
        background_color: "#000000",
        related_applications: [],
        prefer_related_applications: false,
        display_override: ["window-controls-overlay"],
        icons: [
          {
            src: join(basename, `psdr3-icon.png`),
            sizes: "512x512",
            type: "image/png",
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
