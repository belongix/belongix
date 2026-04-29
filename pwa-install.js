/* Belongix PWA Install Handler */
(function () {
  var deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    if (document.getElementById("bx-install-banner")) return;

    var banner = document.createElement("div");
    banner.id = "bx-install-banner";
    banner.style.cssText = [
      "position:fixed;bottom:90px;left:50%;transform:translateX(-50%);",
      "background:white;border:1.5px solid #DBEAFE;border-radius:16px;",
      "padding:14px 18px;display:flex;align-items:center;gap:12px;",
      "box-shadow:0 8px 32px rgba(37,99,235,.18);z-index:2147483640;",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;",
      "max-width:340px;width:calc(100vw - 48px);animation:bxSlideUp .4s ease"
    ].join("");

    banner.innerHTML = [
      "<style>@keyframes bxSlideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}</style>",
      "<div style='width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#2563EB,#0EA5E9);display:flex;align-items:center;justify-content:center;flex-shrink:0'>",
        "<span style='color:white;font-size:20px'>B</span>",
      "</div>",
      "<div style='flex:1;min-width:0'>",
        "<div style='font-size:13px;font-weight:700;color:#0F172A'>Install Belongix App</div>",
        "<div style='font-size:11px;color:#64748B;margin-top:2px'>Add to home screen for quick access</div>",
      "</div>",
      "<button id='bx-install-btn' style='background:#2563EB;color:white;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;font-family:inherit'>Install</button>",
      "<button id='bx-install-close' style='background:none;border:none;color:#94A3B8;cursor:pointer;font-size:18px;line-height:1;flex-shrink:0;padding:2px'>&#10005;</button>"
    ].join("");

    document.body.appendChild(banner);

    document.getElementById("bx-install-btn").addEventListener("click", function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (result) {
          if (result.outcome === "accepted") {
            banner.remove();
          }
          deferredPrompt = null;
        });
      }
    });

    document.getElementById("bx-install-close").addEventListener("click", function () {
      banner.remove();
      try { sessionStorage.setItem("bx_install_dismissed", "1"); } catch(e) {}
    });
  }

  /* Register service worker */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js")
        .then(function (reg) { console.log("Belongix SW registered"); })
        .catch(function (e) { console.log("SW error:", e); });
    });
  }

  /* iOS Safari install instructions (no beforeinstallprompt) */
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var isStandalone = window.navigator.standalone;
  var dismissed = false;
  try { dismissed = !!sessionStorage.getItem("bx_install_dismissed"); } catch(e) {}

  if (isIOS && !isStandalone && !dismissed) {
    setTimeout(function () {
      var tip = document.createElement("div");
      tip.id = "bx-ios-tip";
      tip.style.cssText = [
        "position:fixed;bottom:90px;left:50%;transform:translateX(-50%);",
        "background:white;border:1.5px solid #DBEAFE;border-radius:16px;",
        "padding:16px 18px;box-shadow:0 8px 32px rgba(37,99,235,.18);",
        "z-index:2147483640;max-width:300px;width:calc(100vw - 48px);",
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:center"
      ].join("");
      tip.innerHTML = [
        "<div style='font-size:20px;margin-bottom:8px'>&#128247;</div>",
        "<div style='font-size:13px;font-weight:700;color:#0F172A;margin-bottom:6px'>Install Belongix on iPhone</div>",
        "<div style='font-size:12px;color:#64748B;line-height:1.6'>Tap the <b>Share</b> button &#11835; below, then tap <b>Add to Home Screen</b></div>",
        "<button onclick=\"this.parentNode.remove();try{sessionStorage.setItem('bx_install_dismissed','1')}catch(e){}\" style='margin-top:12px;background:none;border:1px solid #E2E8F0;border-radius:8px;padding:6px 16px;font-size:12px;color:#64748B;cursor:pointer;font-family:inherit'>Got it</button>"
      ].join("");
      document.body.appendChild(tip);
    }, 3000);
  }
})();
