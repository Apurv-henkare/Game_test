// Service worker — caches game files for instant second load
var CACHE = 'gamehub-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

// Cache-first strategy: serve from cache, fetch in background to update
self.addEventListener('fetch', function(e) {
  // Only cache same-origin GET requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.open(CACHE).then(function(cache) {
      return cache.match(e.request).then(function(cached) {
        var fetched = fetch(e.request).then(function(response) {
          // Cache the fresh copy (only successful responses)
          if (response && response.status === 200) {
            cache.put(e.request, response.clone());
          }
          return response;
        }).catch(function() {
          return cached; // offline fallback
        });

        // Return cached immediately if available, otherwise wait for fetch
        return cached || fetched;
      });
    })
  );
});
