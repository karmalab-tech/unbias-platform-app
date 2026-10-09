const CACHE = "unbias-dashboard-v1";
const PAGES = ["/", "/installation", "/video"];
const DATA = ["/api/public/stats", "/api/public/settings", "/qr.svg"];
const FALLBACK_MS = 4000;

const key = (url) => url.origin + url.pathname;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith("unbias-dashboard-") && name !== CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, cacheKey, event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(cacheKey, { ignoreVary: true });
  const network = fetch(request).then((response) => {
    if (response.ok) cache.put(cacheKey, response.clone());
    return response;
  });
  if (event) event.waitUntil(network.catch(() => {}));
  if (!cached) return network;

  const settled = network.then(
    (response) => (response.status >= 500 ? cached : response),
    () => cached
  );
  return Promise.race([settled, wait(FALLBACK_MS).then(() => cached)]);
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && PAGES.includes(url.pathname)) {
    event.respondWith(networkFirst(request, key(url), event));
  } else if (DATA.includes(url.pathname)) {
    event.respondWith(networkFirst(request, key(url), event));
  } else if (url.pathname.startsWith("/vite/")) {
    event.respondWith(cacheFirst(request));
  }
});

async function precache(url, accept) {
  const cache = await caches.open(CACHE);
  const response = await fetch(url, { headers: { Accept: accept } });
  if (response.ok && !response.redirected) await cache.put(url, response);
}

// The first visit loads everything before this worker controls the page, so the page lists what it used.
self.addEventListener("message", (event) => {
  if (event.data?.type !== "precache") return;
  const origin = self.location.origin;
  const jobs = [];

  const page = event.data.page;
  if (PAGES.includes(page)) jobs.push(precache(origin + page, "text/html"));
  DATA.forEach((path) =>
    jobs.push(precache(origin + path, path.endsWith(".svg") ? "image/svg+xml" : "application/json"))
  );
  (event.data.assets ?? [])
    .filter((asset) => asset.startsWith(origin + "/vite/"))
    .forEach((asset) => jobs.push(precache(asset, "*/*")));

  event.waitUntil(Promise.allSettled(jobs));
});
