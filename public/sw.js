self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open("brainscore-cache").then(cache => {
      return cache.addAll([
        "/", 
        "/manifest.json",
        "/icons/icon-192.png",
        "/icons/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        return caches.open("brainscore-cache").then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
