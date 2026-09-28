// Offline cache for the whole game.
// Run `node tools/update-sw.mjs` before each deploy: it rewrites the file list
// below and bumps CACHE_VERSION so iPads pick up the new files.

const CACHE_VERSION = 4;
const CACHE_NAME = `chemistry-v${CACHE_VERSION}`;

// PRECACHE-START
const PRECACHE = [
  './',
  'assets/icons/icon-180.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'index.html',
  'manifest.webmanifest',
  'src/art/atoms.js',
  'src/data/items.json',
  'src/data/narration.json',
  'src/intro/props.js',
  'src/layout.js',
  'src/main.js',
  'src/scenes/BootScene.js',
  'src/scenes/MenuScene.js',
  'src/scenes/SorterIntroScene.js',
  'src/scenes/SorterScene.js',
  'src/sorter/Bin.js',
  'src/systems/audio.js',
  'src/systems/drag.js',
  'src/systems/save.js',
  'src/ui/button.js',
  'src/ui/emoji.js',
  'src/ui/parentCorner.js',
  'src/version.js',
  'vendor/phaser.min.js',
];
// PRECACHE-END

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
  } else {
    event.respondWith(cacheFirst(req));
  }
});

// The page itself: try the network briefly so updates arrive, else use the cache.
async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await withTimeout(fetch(req), 3000);
    if (res.ok) cache.put('./', res.clone());
    return res;
  } catch {
    return (await cache.match('./')) || Response.error();
  }
}

// Everything else never changes within a version: cache first.
async function cacheFirst(req) {
  const cached = await caches.match(req, { ignoreSearch: true });
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(req, res.clone());
  }
  return res;
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}
