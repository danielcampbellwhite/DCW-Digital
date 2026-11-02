import { services } from "@/content/services";

export const dynamic = "force-static";

/** Changes on every deploy, so a new service worker installs and refreshes saved pages. */
const VERSION = (process.env.VERCEL_GIT_COMMIT_SHA ?? String(Date.now())).slice(0, 12);

/** Pages saved for offline use as soon as the service worker installs. */
const PRECACHE = [
  "/",
  "/about",
  "/services",
  ...services.map((s) => `/services/${s.slug}`),
  "/projects",
  "/ai",
  "/blog",
  "/play",
  "/contact",
  "/privacy",
  "/offline",
];

const source = String.raw`/* DCW Digital service worker - version ${VERSION} */
const VERSION = ${JSON.stringify(VERSION)};
const PAGES = "dcw-pages-" + VERSION;
const STATIC = "dcw-static";
const MEDIA = "dcw-media";
const OFFLINE_URL = "/offline";
const PRECACHE = ${JSON.stringify(PRECACHE)};
const NETWORK_TIMEOUT_MS = 4000;

// Build assets referenced by a page's HTML, so precached pages also work offline.
function assetUrls(html) {
  const found = new Set();
  for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) found.add(m[0]);
  for (const m of html.matchAll(/static\/(?:chunks|css|media)\/[^"'\s)\\]+/g)) found.add("/_next/" + m[0]);
  return found;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES);
      const statics = await caches.open(STATIC);
      const assets = new Set();
      await Promise.all(
        PRECACHE.map(async (path) => {
          try {
            const res = await fetch(path, { cache: "no-store" });
            if (!res.ok) return;
            const html = await res.clone().text();
            await pages.put(path, res);
            assetUrls(html).forEach((a) => assets.add(a));
          } catch (e) {
            /* skip anything that fails; it'll be cached when visited */
          }
        })
      );
      await Promise.all(
        [...assets].map(async (url) => {
          try {
            if (await statics.match(url)) return;
            const res = await fetch(url);
            if (res.ok) await statics.put(url, res);
          } catch (e) {}
        })
      );
      await self.skipWaiting();
    })()
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n.startsWith("dcw-pages-") && n !== PAGES).map((n) => caches.delete(n))
      );
      await trim(STATIC, 400);
      await trim(MEDIA, 150);
      await self.clients.claim();
    })()
  );
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

// Pages: network first (fresh content), fall back to the saved copy offline.
async function handleNavigation(request) {
  const url = new URL(request.url);
  const cache = await caches.open(PAGES);
  try {
    const res = await withTimeout(fetch(request), NETWORK_TIMEOUT_MS);
    if (res.ok && res.type === "basic" && !res.redirected) cache.put(url.pathname, res.clone());
    return res;
  } catch (e) {
    const saved = (await cache.match(url.pathname)) || (await caches.match(url.pathname));
    if (saved) return saved;
    if (url.pathname !== OFFLINE_URL && (await cache.match(OFFLINE_URL))) {
      // Redirect (rather than serve the offline page at this address) so the
      // app doesn't get confused about which page it's on.
      return Response.redirect(OFFLINE_URL + "?from=" + encodeURIComponent(url.pathname + url.search), 302);
    }
    return new Response("You're offline.", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

// Hashed build files never change, so the cached copy is always right.
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

// Images and fonts: show the saved copy straight away, refresh it in the background.
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const update = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit || update;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname === "/sw.js") return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }

  // In-app navigation data. Left to the network: if it fails offline,
  // Next.js falls back to a full page load, which the cache can answer.
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request, MEDIA));
  }
});
`;

export function GET() {
  return new Response(source, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
