import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

cleanupOutdatedCaches();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error: __WB_MANIFEST is a placeholder that workbox-precaching will inject at compile time.
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
precacheAndRoute(self.__WB_MANIFEST ?? []);
