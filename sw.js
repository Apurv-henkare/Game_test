// Minimal service worker for PWA install support
// Intentionally lightweight — no aggressive caching to avoid game lag

var CACHE_NAME = 'gamehub-v1';

// Only cache the shell (hub page + icons). Game files are too large to cache.
var SHELL_FILES = [
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_FILES).catch(function() {});
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// Network-first strategy: always try network, fallback to cache only for shell
self.addEventListener('fetch', function(e) {
  // Let game files (.data, .wasm, .js, love.js) always go to network
  var url = e.request.url;
  if (url.includes('game.data') || url.includes('.wasm') || url.includes('love.js') || url.includes('game.js')) {
    return; // Don't intercept — let browser handle normally
  }

  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});
