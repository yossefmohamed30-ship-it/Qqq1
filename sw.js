/* ══════════════════════════════════════════════════════════════
   Finance · Joe — service worker
   As conservative as possible:
   - Only ever caches this app's own shell files (this HTML file +
     manifest + icons), so the home-screen icon has *something* to
     open even with no signal. Money data is never touched here —
     Firebase and Apps Script requests always go straight to the
     network untouched, exactly as if this file didn't exist.
   - Network-first for the shell, so you always get the latest
     version when you're online; only falls back to the cached copy
     when the network truly fails. Never blocks or hangs the page:
     worst case behaves exactly like there was no service worker.
   - Does NOT force itself onto an already-open page (no
     skipWaiting/clients.claim) — it only starts controlling on the
     *next* fresh open, so it can never take over mid-load.
   ══════════════════════════════════════════════════════════════ */
var CACHE = 'financejoe-shell-v2';
var SHELL = ['./expense-app.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return Promise.all(SHELL.map(function(u){
        return c.add(u).catch(function(){ /* one missing file must not fail install */ });
      }));
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  var url = new URL(req.url);

  /* Only ever handle same-origin GETs for this app's own shell files.
     Everything else (Firebase reads/writes, Apps Script calls, images,
     third-party anything) is left completely untouched. */
  if(req.method !== 'GET' || url.origin !== self.location.origin) return;
  var isShellFile = SHELL.some(function(s){ return url.pathname.endsWith(s.replace('./','/')); });
  if(!isShellFile && req.mode !== 'navigate') return;

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
