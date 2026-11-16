/* Schrauberstadt – Offline-Cache: Spiel und Karten liegen im Gerät, neue Versionen kommen beim nächsten Start */
const C = 'ss-v1';
const CORE = ['/', '/index.html', '/base_reno.webp?v=2', '/base_old.webp?v=2', '/icon-192.png', '/icon-512.png', '/manifest.webmanifest'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // Stadt-Server (Supabase) immer live
  const page = r.mode === 'navigate' || u.pathname === '/' || u.pathname.endsWith('.html');
  if (page) { // Spiel: erst Netz (neueste Version), sonst Kopie
    e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(C).then((c) => c.put('/index.html', cp)); return res; }).catch(() => caches.match('/index.html')));
  } else { // Bilder/Karten: erst Kopie, sonst Netz
    e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); return res; })));
  }
});
