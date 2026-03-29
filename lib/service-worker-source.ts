const CACHE_VERSION = "v2";
const CACHE_NAME = `gradeflow-shell-${CACHE_VERSION}`;
const APP_SHELL_URLS = [
  "/",
  "/workspace",
  "/manifest.webmanifest",
  "/apple-icon.png",
  "/icon-192.png",
  "/icon-512.png",
];
const NAVIGATION_FALLBACK_URLS = ["/workspace", "/"];

export function getServiceWorkerSource() {
  return `
const CACHE_NAME = ${JSON.stringify(CACHE_NAME)};
const APP_SHELL_URLS = ${JSON.stringify(APP_SHELL_URLS)};
const NAVIGATION_FALLBACK_URLS = ${JSON.stringify(NAVIGATION_FALLBACK_URLS)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheResponse(request, response) {
  if (!response || response.status !== 200 || request.method !== "GET") {
    return response;
  }

  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
}

async function findNavigationFallback(request) {
  const exactMatch = await caches.match(request, { ignoreSearch: true });

  if (exactMatch) {
    return exactMatch;
  }

  for (const fallbackUrl of NAVIGATION_FALLBACK_URLS) {
    const fallbackResponse = await caches.match(fallbackUrl);

    if (fallbackResponse) {
      return fallbackResponse;
    }
  }

  return Response.error();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(() => findNavigationFallback(request)),
    );
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    ["style", "script", "font", "image"].includes(request.destination);

  if (!isStaticAsset) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => cacheResponse(request, response));
    }),
  );
});
`;
}
