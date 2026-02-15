// ===== VERSION CHANGE FOR EVERY UPDATE =====
const CACHE_VERSION = "landtools-v1.0.0";
const STATIC_CACHE = `${CACHE_VERSION}-static`;

// Files to pre-cache
const STATIC_ASSETS = [
  "/"
];

// ===== INSTALL =====
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ===== ACTIVATE =====
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

// ===== FETCH STRATEGY =====
self.addEventListener("fetch", (event) => {

  // HTML → Network First (Always Fresh)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, copy);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // CSS/JS/Images → Cache First (Fast Load)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});