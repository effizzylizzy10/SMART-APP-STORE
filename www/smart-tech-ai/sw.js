// Smart Tech AI service worker — makes the app open and work with no internet.
// It lives next to index.html, so its scope is this folder (works at a site root or in a subfolder).
// Bump VERSION whenever this file changes so old caches are cleared.
const VERSION = 'v4';
const APP = 'stai-app-' + VERSION;      // the page itself and your own files
const LIBS = 'stai-libs-' + VERSION;    // CDN libraries (Transformers.js, WebLLM, ONNX runtime, gif.js)
const LIB_HOSTS = ['cdn.jsdelivr.net', 'esm.run', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const SHELL = ['./', 'manifest.webmanifest', 'assets/icon.svg', 'css/styles.css',
  'js/config.js', 'js/studio.js', 'js/ui.js', 'js/knowledge.js', 'js/research.js', 'js/offline.js', 'js/chat.js', 'js/main.js', 'js/background.js'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(APP);
    await Promise.allSettled(SHELL.map(u => c.add(u))); // a missing file must not block install
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if ((k.startsWith('stai-app-') || k.startsWith('stai-libs-')) && k !== APP && k !== LIBS) await caches.delete(k);
    await self.clients.claim();
    (await self.clients.matchAll()).forEach(c => c.postMessage({ type: 'sw-ready', version: VERSION }));
  })());
});

// The page tells us its own URL so it is saved even if it isn't named index.html.
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'cache-page') {
    e.waitUntil(caches.open(APP).then(c => c.add(new Request(e.data.url, { cache: 'reload' }))).catch(() => {}));
  }
});

const ok = r => r && (r.ok || r.type === 'opaque');

async function networkFirst(req, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, no) => setTimeout(() => no(new Error('timeout')), timeoutMs)),
    ]);
    if (ok(res)) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? await cache.match('./') : null) || Response.error();
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (ok(res)) cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    // Pages: fresh when online (short timeout so a bad signal falls back fast), cached when offline.
    e.respondWith(networkFirst(req, APP, req.mode === 'navigate' ? 4000 : 8000));
  } else if (LIB_HOSTS.includes(url.hostname)) {
    // Libraries are version-pinned, so the cached copy is served instantly.
    e.respondWith(cacheFirst(req, LIBS));
  }
  // Everything else (AI provider APIs, search, images, model weights) is left alone.
  // Model weights are stored by Transformers.js / WebLLM in their own caches.
});
