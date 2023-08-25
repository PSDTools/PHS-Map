import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

// This is your Service Worker, you can put any of your custom Service Worker
// code in this file, above the `precacheAndRoute` line.
cleanupOutdatedCaches();

/** This code uses an injected value, so it doesn't type-check. */
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unsafe-argument
precacheAndRoute(self.__WB_MANIFEST || []);
