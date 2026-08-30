/* ══════════════════════════════════════════════════════════════
   Finance · Joe — service worker
   Only caches the app shell (this HTML file + manifest + icons),
   so the app can open offline. It NEVER touches Firebase, Apps
   Script, or any other cross-origin request — those always go
   straight to the network untouched, exactly like without a
   service worker at all. Money data is never cached here.
   ══════════════════════════════════════════════════════════════ */
var CACHE = 'financejoe-shell-v1';
var SHELL = ['./expense-app.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  var url = new URL(req.url);

  /* Only ever handle same-origin GETs for the app shell files.
     Everything else (Firebase reads/writes, Apps Script JSONP calls,
     images, third-party anything) is left completely alone. */
  if(req.method !== 'GET' || url.origin !== self.location.origin) return;
  if(SHELL.indexOf('.' + url.pathname.replace(/^.*\/(?=[^/]+$)/, '/')) === -1 &&
     !(req.mode === 'navigate')) return;

  e.respondWith(
    fetch(req).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(req, copy); });
      return res;
    }).catch(function(){
      return caches.match(req).then(function(cached){
        return cached || caches.match('./expense-app.html');
      });
    })
  );
});
