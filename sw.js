const CACHE = "comptage-v88";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./xlsx.full.min.js", "./zxing.min.js", "./firebase-app-compat.js", "./firebase-auth-compat.js", "./firebase-firestore-compat.js", "./logo-192.png", "./logo-512.png", "./exasio-logo.png", "./barlow-latin-400-normal.woff2", "./barlow-latin-500-normal.woff2", "./barlow-latin-600-normal.woff2", "./barlow-condensed-latin-600-normal.woff2", "./barlow-condensed-latin-700-normal.woff2"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: "reload"})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isPage = e.request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
  if(isPage && url.origin === location.origin){
    // Page: network first so updates arrive at once; cache when offline
    e.respondWith(fetch(e.request.url, {cache: "no-store"}).then(res => {
      if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if(res.ok && url.origin === location.origin){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match("./index.html"))));
});
