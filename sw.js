/* ══════════════════════════════════════════════════════════════
   Finance · Joe — service worker KILL SWITCH
   An earlier version of this file cached the app shell and, on
   some phones, ended up serving a stuck/stale copy on open. That
   was never worth the risk for a personal finance app, so this
   version's only job is to clean up after itself:
   activates immediately, wipes every cache this app ever created,
   unregisters itself, and reloads any open tab — so the app goes
   straight back to plain "always fetch fresh from the network"
   behaviour, exactly as if a service worker had never existed here.
   ══════════════════════════════════════════════════════════════ */
self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys()
      .then(function(keys){ return Promise.all(keys.map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.registration.unregister(); })
      .then(function(){ return self.clients.matchAll({type:'window'}); })
      .then(function(clientsArr){
        clientsArr.forEach(function(client){ client.navigate(client.url); });
      })
  );
});
