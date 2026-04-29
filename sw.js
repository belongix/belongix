/* Belongix Service Worker v1.0 */
var CACHE = "belongix-v1";
var OFFLINE_URL = "/offline.html";

var PRECACHE = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/about.html",
  "/contact.html",
  "/mentors.html",
  "/belongix-ai.js",
  "/manifest.json",
  "/offline.html"
];

/* Install — cache core files */
self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* Activate — clean old caches */
self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* Fetch — network first, cache fallback */
self.addEventListener("fetch", function(e) {
  if (e.request.method !== "GET") return;

  var url = new URL(e.request.url);

  /* Always fetch from network for API calls (Supabase, JSearch, Razorpay) */
  if (
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("razorpay.com") ||
    url.hostname.includes("rapidapi.com") ||
    url.hostname.includes("googleapis.com")
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        /* Cache successful responses */
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        /* Network failed — try cache */
        return caches.match(e.request).then(function(cached) {
          if (cached) return cached;
          /* For navigation requests, show offline page */
          if (e.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});
