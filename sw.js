/* Belongix Service Worker v1.0 */
var CACHE = "belongix-v4";
var OFFLINE_URL = "/offline.html";

var PRECACHE = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/about.html",
  "/contact.html",
  "/mentors.html",
  "/bexi.js",
  "/manifest.json",
  "/offline.html",
  "/app.html",
  "/resume-builder.html",
  "/post-job.html"
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

/* ══════════════════════════════════════════════════
   FEATURE 36: Push Notification Handler
   Supports: job_match, score_milestone, booking_confirmed,
             weekly_tip, application_update
══════════════════════════════════════════════════ */
self.addEventListener('push', function(e) {
  if (!e.data) return;
  var data;
  try { data = e.data.json(); }
  catch(err) { data = { title: 'Belongix', body: e.data.text(), type: 'general' }; }

  var title   = data.title || 'Belongix';
  var options = {
    body:    data.body  || 'You have a new notification',
    icon:    '/icons/icon-192.png',
    badge:   '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    tag:     data.type || 'general',       // deduplicates same-type notifications
    renotify: data.renotify || false,
    data: {
      url:  data.url  || '/dashboard.html',
      type: data.type || 'general'
    },
    actions: getActions(data.type)
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

function getActions(type) {
  if (type === 'job_match')         return [{ action: 'view', title: '🔍 View Jobs' }, { action: 'dismiss', title: 'Later' }];
  if (type === 'score_milestone')   return [{ action: 'view', title: '📊 See Score' }, { action: 'dismiss', title: 'Dismiss' }];
  if (type === 'booking_confirmed') return [{ action: 'view', title: '📅 View Booking' }];
  if (type === 'weekly_tip')        return [{ action: 'view', title: '🤖 Ask Bexi' }, { action: 'dismiss', title: 'Skip' }];
  return [];
}

/* Handle notification click */
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/dashboard.html';

  // Handle action button clicks
  if (e.action === 'dismiss') return;
  if (e.action === 'view' || !e.action) {
    e.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        // Focus existing tab if open
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url.includes('belongix.in') && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new tab
        if (clients.openWindow) return clients.openWindow(url);
      })
    );
  }
});

/* Handle push subscription change */
self.addEventListener('pushsubscriptionchange', function(e) {
  e.waitUntil(
    self.registration.pushManager.subscribe(e.oldSubscription.options)
      .then(function(subscription) {
        // In production: send new subscription to your Supabase Edge Function
        return fetch('/api/push/update-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.toJSON() })
        });
      })
  );
});
