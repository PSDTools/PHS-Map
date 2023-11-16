import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

// This is your Service Worker, you can put any of your custom Service Worker
// code in this file, above the `precacheAndRoute` line.
cleanupOutdatedCaches();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error: __WB_MANIFEST is a placeholder that workbox-precaching will inject at compile time.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unsafe-argument
precacheAndRoute(self.__WB_MANIFEST || []);
