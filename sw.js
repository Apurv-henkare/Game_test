var CACHE_NAME = 'gamehub-v1';

var SHELL_FILES = [
  'index.html',
  'manifest.json'
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

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  if (url.includes('game.data') || url.includes('.wasm') || url.includes('love.js') || url.includes('game.js')) {
    return;
  }

  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});