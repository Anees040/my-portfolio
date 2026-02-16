const CACHE_NAME = 'git-contributions-cache-v1';
const CONTRIBUTIONS_ENDPOINT = '/.netlify/functions/git-contributions';
const META_KEY = `${CONTRIBUTIONS_ENDPOINT}-meta`;
const STALE_AFTER_MS = 1; //1000 * 60 * 60 * 24; // 24 hours

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        const deletions = cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name));
        await Promise.all(deletions);
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.pathname !== CONTRIBUTIONS_ENDPOINT) {
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        const metaResponse = await cache.match(META_KEY);
        const now = Date.now();
        let isFresh = false;

        if (metaResponse) {
            try {
                const meta = await metaResponse.json();
                if (meta && typeof meta.cachedAt === 'number') {
                    isFresh = now - meta.cachedAt < STALE_AFTER_MS;
                }
            } catch (_) {
                isFresh = false;
            }
        }

        if (cachedResponse && isFresh) {
            return cachedResponse;
        }

        try {
            const networkResponse = await fetch(request);
            if (networkResponse && networkResponse.ok) {
                cache.put(request, networkResponse.clone());
                cache.put(META_KEY, new Response(JSON.stringify({ cachedAt: now }), {
                    headers: { 'Content-Type': 'application/json' },
                }));
            }
            return networkResponse;
        } catch (err) {
            if (cachedResponse) {
                return cachedResponse;
            }
            throw err;
        }
    })());
});
