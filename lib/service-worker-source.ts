const CACHE_VERSION = "v4";
const CACHE_NAME = `gradeflow-shell-${CACHE_VERSION}`;
const APP_SHELL_URLS = [
  "/",
  "/offline",
  "/workspace",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/apple-icon.png",
  "/icon-192.png",
  "/icon-512.png",
];
const OFFLINE_FALLBACK_URL = "/offline";

export function getServiceWorkerSource() {
  return `
const CACHE_NAME = ${JSON.stringify(CACHE_NAME)};
const APP_SHELL_URLS = ${JSON.stringify(APP_SHELL_URLS)};
const OFFLINE_FALLBACK_URL = ${JSON.stringify(OFFLINE_FALLBACK_URL)};

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

function buildOfflineAssetResponse(request) {
  if (request.destination === "image") {
    return new Response("", {
      headers: {
        "Content-Type": "image/svg+xml",
      },
      status: 200,
    });
  }

  return new Response("", {
    status: 503,
    statusText: "Offline",
  });
}

async function findNavigationFallback(request) {
  const exactMatch = await caches.match(request, { ignoreSearch: true });

  if (exactMatch) {
    return exactMatch;
  }

  return caches.match(OFFLINE_FALLBACK_URL);
}

self.addEventListener("message", (event) => {
  const data = event.data;

  if (!data || data.type !== "CACHE_ROUTE" || typeof data.url !== "string") {
    return;
  }

  const routeUrl = new URL(data.url, self.location.origin);

  if (routeUrl.origin !== self.location.origin) {
    return;
  }

  event.waitUntil(
    fetch(
      new Request(routeUrl.toString(), {
        headers: {
          "x-gradeflow-cache-warm": "1",
        },
      }),
    )
      .then((response) => {
        if (!response || response.status !== 200) {
          return null;
        }

        return caches.open(CACHE_NAME).then((cache) =>
          cache.put(routeUrl.toString(), response.clone()),
        );
      })
      .catch(() => null),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.headers.get("x-gradeflow-cache-warm") === "1") {
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

      return fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(() => buildOfflineAssetResponse(request));
    }),
  );
});
`;
}
