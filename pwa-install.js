/* Belongix PWA Install Handler v2.0
   - Shows install banner on 2nd page visit
   - Push notification opt-in after install
   - iOS Safari share-sheet instructions
*/
(function () {
  'use strict';

  var VISIT_KEY      = 'bx_visit_count';
  var DISMISSED_KEY  = 'bx_install_dismissed';
  var PUSH_KEY       = 'bx_push_asked';
  var deferredPrompt = null;

  /* ── PAGE VISIT COUNTER ── */
  function getVisitCount() {
    try { return parseInt(localStorage.getItem(VISIT_KEY)) || 0; } catch(e) { return 0; }
  }
  function bumpVisit() {
    try { localStorage.setItem(VISIT_KEY, String(getVisitCount() + 1)); } catch(e) {}
  }
  function isDismissed() {
    try { return !!sessionStorage.getItem(DISMISSED_KEY); } catch(e) { return false; }
  }
  function dismiss() {
    try { sessionStorage.setItem(DISMISSED_KEY, '1'); } catch(e) {}
  }

  bumpVisit();

  /* ── SERVICE WORKER REGISTRATION ── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js')
        .then(function (reg) {
          /* SW registered — check for push permission after install */
          reg.addEventListener('updatefound', function() {
            /* New SW available — could show "update ready" banner */
          });
        })
        .catch(function () { /* SW registration failed silently */ });
    });
  }

  /* ── BANNER HTML FACTORY ── */
  function makeBanner() {
    var banner = document.createElement('div');
    banner.id = 'bx-install-banner';
    Object.assign(banner.style, {
      position: 'fixed',
      bottom: 'calc(90px + env(safe-area-inset-bottom))',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#fff',
      border: '1.5px solid #D0D0E8',
      borderRadius: '16px',
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 8px 32px rgba(45,27,105,.2)',
      zIndex: '2147483640',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'DM Sans', sans-serif",
      maxWidth: '340px',
      width: 'calc(100vw - 48px)',
      animation: 'bxSlideUp .4s cubic-bezier(.34,1.56,.64,1)'
    });

    var style = document.createElement('style');
    style.textContent = '@keyframes bxSlideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
    banner.appendChild(style);

    // Icon
    var icon = document.createElement('div');
    Object.assign(icon.style, {
      width:'44px', height:'44px', borderRadius:'12px',
      background:'linear-gradient(135deg,#2D1B69,#6B48CC)',
      display:'flex', alignItems:'center', justifyContent:'center',
      flexShrink:'0', fontSize:'22px'
    });
    icon.textContent = '🚀';
    banner.appendChild(icon);

    // Text
    var txt = document.createElement('div');
    txt.style.flex = '1';
    txt.style.minWidth = '0';
    txt.innerHTML = '<div style="font-size:13px;font-weight:700;color:#0F172A">Add Belongix to Home Screen</div><div style="font-size:11px;color:#64748B;margin-top:2px">Instant access · No app store needed</div>';
    banner.appendChild(txt);

    // Install button
    var installBtn = document.createElement('button');
    installBtn.textContent = 'Install';
    Object.assign(installBtn.style, {
      background: 'linear-gradient(135deg,#2D1B69,#6B48CC)',
      color: '#fff', border: 'none', borderRadius: '9px',
      padding: '8px 14px', fontSize: '12px', fontWeight: '700',
      cursor: 'pointer', flexShrink: '0', fontFamily: 'inherit',
      transition: '.15s'
    });
    banner.appendChild(installBtn);

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&#10005;';
    Object.assign(closeBtn.style, {
      background: 'none', border: 'none', color: '#94A3B8',
      cursor: 'pointer', fontSize: '17px', lineHeight: '1',
      flexShrink: '0', padding: '2px'
    });
    banner.appendChild(closeBtn);

    // Handlers
    installBtn.addEventListener('click', function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (result) {
          if (result.outcome === 'accepted') {
            banner.remove();
            /* Offer push notifications after install */
            setTimeout(offerPushNotifications, 3000);
          }
          deferredPrompt = null;
        });
      }
    });
    closeBtn.addEventListener('click', function () {
      banner.remove();
      dismiss();
    });

    return banner;
  }

  /* ── BEFOREINSTALLPROMPT (Android / Chrome) ── */
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    /* Show on 2nd visit or more, and not dismissed */
    if (getVisitCount() >= 1 && !isDismissed()) {
      setTimeout(function() {
        if (!document.getElementById('bx-install-banner')) {
          document.body.appendChild(makeBanner());
        }
      }, 2500);
    }
  });

  /* ── iOS SAFARI INSTRUCTIONS ── */
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var isStandalone = window.navigator.standalone;

  if (isIOS && !isStandalone && !isDismissed() && getVisitCount() >= 1) {
    setTimeout(function () {
      if (document.getElementById('bx-ios-tip')) return;
      var tip = document.createElement('div');
      tip.id = 'bx-ios-tip';
      Object.assign(tip.style, {
        position: 'fixed',
        bottom: 'calc(90px + env(safe-area-inset-bottom))',
        left: '50%', transform: 'translateX(-50%)',
        background: '#fff', border: '1.5px solid #D0D0E8',
        borderRadius: '16px', padding: '18px 20px',
        boxShadow: '0 8px 32px rgba(45,27,105,.2)',
        zIndex: '2147483640', maxWidth: '300px',
        width: 'calc(100vw - 48px)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'DM Sans', sans-serif",
        textAlign: 'center', animation: 'bxSlideUp .4s cubic-bezier(.34,1.56,.64,1)'
      });
      tip.innerHTML = [
        "<div style='font-size:26px;margin-bottom:10px'>📲</div>",
        "<div style='font-size:13.5px;font-weight:700;color:#0F172A;margin-bottom:6px'>Add Belongix to your iPhone</div>",
        "<div style='font-size:12px;color:#64748B;line-height:1.65'>Tap the <strong>Share</strong> button <span style='font-size:16px'>⎙</span> at the bottom of Safari,<br>then tap <strong>Add to Home Screen</strong></div>",
        "<button id='bx-ios-got-it' style='margin-top:14px;background:none;border:1.5px solid #E2E8F0;border-radius:9px;padding:7px 20px;font-size:12.5px;color:#64748B;cursor:pointer;font-family:inherit'>Got it</button>"
      ].join('');
      document.body.appendChild(tip);
      document.getElementById('bx-ios-got-it').addEventListener('click', function() {
        tip.remove();
        dismiss();
      });
    }, 3000);
  }

  /* ── PUSH NOTIFICATIONS OPT-IN ── */
  function offerPushNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    try { if (localStorage.getItem(PUSH_KEY)) return; } catch(e) { return; }
    if (Notification.permission === 'granted') { subscribePush(); return; }
    if (Notification.permission === 'denied') return;

    /* Show a soft prompt before the browser dialog */
    var nudge = document.createElement('div');
    nudge.id = 'bx-push-nudge';
    Object.assign(nudge.style, {
      position: 'fixed', bottom: 'calc(90px + env(safe-area-inset-bottom))',
      left: '50%', transform: 'translateX(-50%)',
      background: '#fff', border: '1.5px solid #D0D0E8',
      borderRadius: '16px', padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: '12px',
      boxShadow: '0 8px 32px rgba(45,27,105,.2)',
      zIndex: '2147483640', maxWidth: '340px',
      width: 'calc(100vw - 48px)',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'DM Sans', sans-serif",
      animation: 'bxSlideUp .4s ease'
    });
    nudge.innerHTML = [
      "<div style='font-size:22px'>🔔</div>",
      "<div style='flex:1;min-width:0'>",
        "<div style='font-size:13px;font-weight:700;color:#0F172A'>Get job alerts?</div>",
        "<div style='font-size:11px;color:#64748B;margin-top:2px'>New jobs · Career score milestones · Mentor reminders</div>",
      "</div>",
      "<button id='bx-push-yes' style='background:#2D1B69;color:#fff;border:none;border-radius:8px;padding:7px 13px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:inherit'>Enable</button>",
      "<button id='bx-push-no' style='background:none;border:none;color:#94A3B8;cursor:pointer;font-size:17px;padding:2px'>&#10005;</button>"
    ].join('');
    document.body.appendChild(nudge);

    document.getElementById('bx-push-yes').addEventListener('click', function() {
      nudge.remove();
      Notification.requestPermission().then(function(perm) {
        try { localStorage.setItem(PUSH_KEY, '1'); } catch(e) {}
        if (perm === 'granted') subscribePush();
      });
    });
    document.getElementById('bx-push-no').addEventListener('click', function() {
      nudge.remove();
      try { localStorage.setItem(PUSH_KEY, 'no'); } catch(e) {}
    });
  }

  function subscribePush() {
    /* Push subscription — requires VAPID key from your backend.
       Replace 'YOUR_VAPID_PUBLIC_KEY' with your actual key.
       See: https://web.dev/push-notifications-subscribing-a-user/
    */
    var VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY';
    if (VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY') return; /* not configured yet */

    navigator.serviceWorker.ready.then(function(reg) {
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      }).then(function(sub) {
        /* Send subscription to your Supabase edge function:
           fetch('/api/push-subscribe', { method:'POST', body: JSON.stringify(sub) });
        */
        try { localStorage.setItem(PUSH_KEY, '1'); } catch(e) {}
      }).catch(function() { /* push subscribe failed */ });
    });
  }

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var raw = window.atob(base64);
    var output = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
    return output;
  }

  /* ── STANDALONE MODE TWEAKS ── */
  /* Makes installed app feel truly native — no browser chrome */
  var isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone
    || document.referrer.includes('android-app://');

  if (isRunningStandalone) {
    /* isStandalone mode tweaks — lock portrait, disable overscroll */
    document.documentElement.style.setProperty(
      '--safe-bottom', 'env(safe-area-inset-bottom, 16px)'
    );

    /* Prevent pull-to-refresh on Android in standalone mode */
    document.body.style.overscrollBehaviorY = 'contain';

    /* Hide any elements that say "Open in browser" */
    document.querySelectorAll('.browser-only').forEach(function(el) {
      el.style.display = 'none';
    });

    /* Add app-mode class so CSS can target standalone */
    document.documentElement.classList.add('pwa-standalone');

    /* Log for analytics */
    try {
      var launchCount = parseInt(localStorage.getItem('bx_pwa_launches') || '0') + 1;
      localStorage.setItem('bx_pwa_launches', String(launchCount));
    } catch(e) {}
  }

  /* ── NETWORK STATUS BANNER ── */
  window.addEventListener('offline', function() {
    var banner = document.getElementById('bx-offline-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'bx-offline-banner';
      banner.innerHTML = '📡 You are offline — some features may not work';
      Object.assign(banner.style, {
        position: 'fixed', top: '0', left: '0', right: '0',
        background: '#1a1a2e', color: '#fff',
        padding: '10px 16px', textAlign: 'center',
        fontSize: '13px', fontWeight: '600',
        zIndex: '99999', fontFamily: 'system-ui,sans-serif'
      });
      document.body.prepend(banner);
    }
  });

  window.addEventListener('online', function() {
    var banner = document.getElementById('bx-offline-banner');
    if (banner) banner.remove();
  });

})();
