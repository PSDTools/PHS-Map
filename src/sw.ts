import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

// This is your Service Worker, you can put any of your custom Service Worker
// code in this file, above the `precacheAndRoute` line.
cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST || []);
