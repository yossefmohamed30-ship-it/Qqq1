/* ══════════════════════════════════════════════════════════════
   Finance · Joe — service worker KILL SWITCH (final)
   Cleans up any old service worker/cache from earlier versions of
   this app, then gets out of the way for good. Does NOT force a
   reload of the page — that caused an infinite reload loop on some
   phones (reload → re-register → activate → reload → ...). It just
   quietly clears its caches and unregisters itself.
   ══════════════════════════════════════════════════════════════ */
self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys()
      .then(function(keys){ return Promise.all(keys.map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.registration.unregister(); })
  );
});
