/* ═══════════════════════════════════════════════════════════════
   Belongix — Bexi AI Chat  v4.0
   • Public: 3 free questions / 24h (localStorage)
   • Powered by Anthropic Claude claude-sonnet-4-20250514
   • Mobile: full-screen overlay
   • Desktop: 350×500 side panel
   ═══════════════════════════════════════════════════════════════ */
(function () {

  /* ── CONFIG ── */
  var FREE_LIMIT   = 3;
  var QUOTA_KEY    = 'bexi_free_count';
  var QUOTA_TS_KEY = 'bexi_free_ts';
  var CHAT_KEY     = 'bexi_history';

  var SYSTEM_PROMPT = "You are Bexi, an AI career guide for Indian professionals built by Belongix. You have deep knowledge of India's job market in 2026 - salaries, in-demand skills, top companies hiring, interview prep, and career switching. Always give specific, actionable advice relevant to India. Mention real companies (Swiggy, Razorpay, Infosys, TCS, Google India, Flipkart, CRED, Zepto, PhonePe, etc.), real salary ranges in LPA, and real skills (Python, React, SQL, AWS, System Design, etc.). Be warm, direct, and encouraging. Never give generic advice. Format your response with short paragraphs and use bullet points (start lines with -) for lists. Always end with one specific next step the person can take today, prefixed with exactly '👉 Next step:'";

  var STARTERS = [
    { label: "\u{1F4B0} Am I paid fairly?",    q: "Am I being paid fairly for my role?" },
    { label: "\u{1F4CA} Switch to data?",       q: "How do I switch from non-tech to data analytics?" },
    { label: "\u{1F680} \u20B920LPA skills?",   q: "What skills should I learn in 2026 for a \u20B920LPA job?" }
  ];

  /* ── QUOTA HELPERS ── */
  function getCount() {
    try {
      var ts  = parseInt(localStorage.getItem(QUOTA_TS_KEY)) || 0;
      var cnt = parseInt(localStorage.getItem(QUOTA_KEY))    || 0;
      if (Date.now() - ts > 86400000) {
        cnt = 0;
        localStorage.setItem(QUOTA_KEY, '0');
        localStorage.setItem(QUOTA_TS_KEY, String(Date.now()));
      }
      return cnt;
    } catch(e) { return 0; }
  }
  function bumpCount() {
    try {
      var n = getCount() + 1;
      localStorage.setItem(QUOTA_KEY, String(n));
      if (!localStorage.getItem(QUOTA_TS_KEY)) {
        localStorage.setItem(QUOTA_TS_KEY, String(Date.now()));
      }
    } catch(e) {}
  }
  function quotaLeft() { return Math.max(0, FREE_LIMIT - getCount()); }

  /* ── CONVERSATION HISTORY (session-scoped) ── */
  var _history = [];
  try { _history = JSON.parse(sessionStorage.getItem(CHAT_KEY)) || []; } catch(e) {}
  function saveHistory() {
    try { sessionStorage.setItem(CHAT_KEY, JSON.stringify(_history.slice(-10))); } catch(e) {}
  }

  /* ── MOBILE DETECT ── */
  function isMobile() { return window.innerWidth <= 640; }

  /* ══════════════════════════════════════════════════════════════
     CSS
  ══════════════════════════════════════════════════════════════ */
  var CSS = [
    "@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');",

    /* FAB */
    "#bx-fab{position:fixed;bottom:calc(22px + env(safe-area-inset-bottom));right:22px;z-index:9996;display:flex;align-items:center;gap:9px;background:linear-gradient(135deg,#2D1B69 0%,#6C3FC5 100%);color:#fff;border:none;border-radius:30px;padding:12px 20px 12px 14px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 6px 24px rgba(45,27,105,.5),0 2px 8px rgba(45,27,105,.3);transition:transform .2s,box-shadow .2s;letter-spacing:-.1px;white-space:nowrap;}",
    "#bx-fab:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(45,27,105,.55);}",
    "#bx-fab:active{transform:translateY(0);}",

    /* FAB icon */
    ".bx-fab-icon{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;border:1.5px solid rgba(255,255,255,.3);position:relative;}",
    ".bx-pulse-ring{position:absolute;inset:-4px;border-radius:50%;border:2px solid rgba(108,63,197,.5);animation:bxRingPulse 2s ease-out infinite;}",
    "@keyframes bxRingPulse{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.65)}}",
    ".bx-fab-badge{position:absolute;top:-4px;right:-4px;width:8px;height:8px;border-radius:50%;background:#10B981;border:2px solid #fff;}",

    /* Backdrop */
    "#bx-bd{display:none;position:fixed;inset:0;background:rgba(10,6,30,.6);z-index:9997;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:bxFadeIn .2s ease;}",
    "#bx-bd.open{display:block;}",
    "@keyframes bxFadeIn{from{opacity:0}to{opacity:1}}",

    /* Panel */
    "#bx-win{position:fixed;bottom:calc(86px + env(safe-area-inset-bottom));right:22px;width:350px;height:500px;background:#fff;border-radius:20px;border:1px solid #E4E4F0;box-shadow:0 24px 64px rgba(45,27,105,.22),0 4px 16px rgba(45,27,105,.1);z-index:9998;display:flex;flex-direction:column;overflow:hidden;font-family:'DM Sans',sans-serif;transform:scale(.92) translateY(16px);opacity:0;pointer-events:none;transition:transform .28s cubic-bezier(.34,1.56,.64,1),opacity .22s ease;transform-origin:bottom right;}",
    "#bx-win.bx-open{transform:scale(1) translateY(0);opacity:1;pointer-events:auto;}",

    /* Mobile full-screen */
    "@media(max-width:640px){#bx-win{inset:0!important;bottom:0!important;right:0!important;width:100vw!important;height:100%!important;border-radius:0!important;transform-origin:bottom center;}}",

    /* Header */
    "#bx-head{background:linear-gradient(135deg,#2D1B69 0%,#6C3FC5 100%);padding:14px 16px;display:flex;align-items:center;gap:11px;flex-shrink:0;position:relative;}",
    "#bx-hav{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:2px solid rgba(255,255,255,.3);position:relative;z-index:1;}",
    "#bx-hinfo{flex:1;position:relative;z-index:1;}",
    "#bx-hname{font-family:'Sora',sans-serif;font-size:14px;font-weight:700;color:#fff;letter-spacing:-.2px;}",
    "#bx-hsub{font-size:11px;color:rgba(255,255,255,.72);margin-top:2px;display:flex;align-items:center;gap:5px;}",
    ".bx-od{width:6px;height:6px;border-radius:50%;background:#10B981;flex-shrink:0;animation:bxPulse 2s infinite;}",
    "@keyframes bxPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.82)}}",
    "#bx-qbadge{font-size:10px;font-weight:700;color:rgba(255,255,255,.8);background:rgba(255,255,255,.15);border-radius:20px;padding:2px 9px;position:relative;z-index:1;white-space:nowrap;}",
    "#bx-cls{background:rgba(255,255,255,.15);border:none;color:#fff;font-size:15px;cursor:pointer;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:.15s;flex-shrink:0;position:relative;z-index:1;}",
    "#bx-cls:hover{background:rgba(255,255,255,.28);}",

    /* Messages */
    "#bx-msgs{flex:1;overflow-y:auto;padding:14px 14px 8px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;}",
    "#bx-msgs::-webkit-scrollbar{width:3px;}",
    "#bx-msgs::-webkit-scrollbar-thumb{background:#E4E4F0;border-radius:4px;}",
    ".bx-msg{max-width:87%;padding:10px 13px;border-radius:16px;font-size:13px;line-height:1.65;animation:bxMsgIn .22s ease;}",
    "@keyframes bxMsgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}",
    ".bx-msg.bot{background:#F5F5FA;color:#0D0D1A;align-self:flex-start;border-radius:4px 16px 16px 16px;border:1px solid #E8E8F2;}",
    ".bx-msg.bot strong{color:#2D1B69;}",
    ".bx-nxtstep{display:block;margin-top:10px;padding:8px 11px;background:linear-gradient(135deg,rgba(45,27,105,.07),rgba(108,63,197,.07));border-left:3px solid #6C3FC5;border-radius:0 8px 8px 0;font-size:12.5px;font-weight:600;color:#2D1B69;}",
    ".bx-msg.user{background:linear-gradient(135deg,#2D1B69,#6C3FC5);color:#fff;align-self:flex-end;border-radius:16px 4px 16px 16px;}",

    /* Typing */
    ".bx-typing{display:flex;gap:4px;align-items:center;padding:11px 14px;background:#F5F5FA;border-radius:4px 16px 16px 16px;align-self:flex-start;border:1px solid #E8E8F2;animation:bxMsgIn .22s ease;}",
    ".bx-typing span{width:6px;height:6px;border-radius:50%;background:#A0A0C0;animation:bxDot 1.3s ease-in-out infinite;}",
    ".bx-typing span:nth-child(2){animation-delay:.18s;}",
    ".bx-typing span:nth-child(3){animation-delay:.36s;}",
    "@keyframes bxDot{0%,60%,100%{transform:translateY(0);opacity:.6}30%{transform:translateY(-6px);opacity:1}}",

    /* Starters */
    "#bx-starters{padding:6px 10px 10px;display:flex;flex-direction:column;gap:5px;border-top:1px solid #F0F0F8;flex-shrink:0;}",
    ".bx-slbl{font-size:10px;font-weight:700;color:#A0A0BE;text-transform:uppercase;letter-spacing:.5px;padding:0 4px;}",
    ".bx-srow{display:flex;gap:5px;flex-wrap:wrap;}",
    ".bx-starter{background:#F0F0FA;color:#2D1B69;border:1.5px solid #DDD8F4;border-radius:20px;padding:5px 11px;font-size:11.5px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;transition:.15s;}",
    ".bx-starter:hover{background:#2D1B69;color:#fff;border-color:#2D1B69;}",

    /* Input */
    "#bx-irow{padding:10px 12px;border-top:1px solid #E8E8F2;display:flex;gap:8px;background:#fff;flex-shrink:0;}",
    "#bx-inp{flex:1;border:1.5px solid #E4E4F0;border-radius:12px;padding:9px 13px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;color:#0D0D1A;background:#FAFAFE;transition:.15s;}",
    "#bx-inp:focus{border-color:#6C3FC5;background:#fff;box-shadow:0 0 0 3px rgba(108,63,197,.1);}",
    "#bx-inp:disabled{opacity:.5;cursor:not-allowed;}",
    "#bx-snd{background:linear-gradient(135deg,#2D1B69,#6C3FC5);border:none;border-radius:11px;padding:0 14px;color:#fff;cursor:pointer;font-size:17px;transition:.15s;flex-shrink:0;display:flex;align-items:center;justify-content:center;height:40px;min-width:44px;}",
    "#bx-snd:hover{transform:scale(1.05);box-shadow:0 4px 14px rgba(45,27,105,.4);}",
    "#bx-snd:disabled{opacity:.5;cursor:not-allowed;transform:none;}",

    /* Gate */
    ".bx-gate{margin:4px 0;background:linear-gradient(135deg,rgba(45,27,105,.06),rgba(108,63,197,.06));border:1.5px solid #DDD8F4;border-radius:14px;padding:16px;font-size:12.5px;color:#2D1B69;text-align:center;align-self:stretch;animation:bxMsgIn .3s ease;}",
    ".bx-gate-ic{font-size:26px;margin-bottom:9px;}",
    ".bx-gate-t{font-family:'Sora',sans-serif;font-size:13.5px;font-weight:700;margin-bottom:5px;color:#1A0F3C;}",
    ".bx-gate-s{font-size:12px;color:#5A5A8A;line-height:1.6;margin-bottom:13px;}",
    ".bx-gate-btns{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;}",
    ".bx-gcta{padding:8px 18px;border-radius:9px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:none;transition:.15s;border:none;display:inline-block;}",
    ".bx-gcta.p{background:linear-gradient(135deg,#2D1B69,#6C3FC5);color:#fff;}",
    ".bx-gcta.p:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(45,27,105,.35);}",
    ".bx-gcta.s{background:#fff;color:#2D1B69;border:1.5px solid #DDD8F4;}",
    ".bx-gcta.s:hover{border-color:#2D1B69;}"
  ].join('');

  /* ══════════════════════════════════════════════════════════════
     HTML
  ══════════════════════════════════════════════════════════════ */
  var starterBtns = STARTERS.map(function(s) {
    return '<button class="bx-starter" onclick="window.bexiAsk(' + JSON.stringify(s.q) + ')">' + s.label + '</button>';
  }).join('');

  var HTML = [
    '<style>' + CSS + '</style>',

    '<!-- Bexi backdrop -->',
    '<div id="bx-bd" onclick="window.bexiClose()"></div>',

    '<!-- Bexi FAB -->',
    '<button id="bx-fab" onclick="window.bexiToggle()" aria-label="Chat with Bexi AI">',
    '  <div class="bx-fab-icon">',
    '    <div class="bx-pulse-ring"></div>',
    '    <div class="bx-fab-badge"></div>',
    '    \uD83E\uDD16',
    '  </div>',
    '  Chat with Bexi AI',
    '</button>',

    '<!-- Bexi chat panel -->',
    '<div id="bx-win" role="dialog" aria-label="Bexi AI Career Guide">',

    '  <div id="bx-head">',
    '    <div id="bx-hav">\uD83E\uDD16</div>',
    '    <div id="bx-hinfo">',
    '      <div id="bx-hname">Bexi AI</div>',
    '      <div id="bx-hsub"><div class="bx-od"></div>India\u2019s #1 Career Guide &middot; Online</div>',
    '    </div>',
    '    <div id="bx-qbadge"></div>',
    '    <button id="bx-cls" onclick="window.bexiClose()" aria-label="Close">\u2715</button>',
    '  </div>',

    '  <div id="bx-msgs">',
    '    <div class="bx-msg bot">',
    '      \uD83D\uDC4B Hey! I\u2019m <strong>Bexi</strong>, your AI career guide for India\u2019s job market.<br><br>',
    '      Ask me about salaries, interview prep, career switches, or in-demand skills \u2014 I give real, specific answers for Indian professionals.',
    '    </div>',
    '  </div>',

    '  <div id="bx-starters">',
    '    <div class="bx-slbl">Try asking \u2192</div>',
    '    <div class="bx-srow">' + starterBtns + '</div>',
    '  </div>',

    '  <div id="bx-irow">',
    '    <input id="bx-inp" type="text" placeholder="Ask about your career..." autocomplete="off"',
    '      onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();window.bexiSend();}" />',
    '    <button id="bx-snd" onclick="window.bexiSend()" aria-label="Send">',
    '      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    '    </button>',
    '  </div>',

    '</div>'
  ].join('\n');

  /* ══════════════════════════════════════════════════════════════
     MOUNT
  ══════════════════════════════════════════════════════════════ */
  function mount() {
    if (document.getElementById('bx-root')) return;
    var root = document.createElement('div');
    root.id = 'bx-root';
    root.innerHTML = HTML;
    document.body.appendChild(root);
    updateQuotaBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  /* ══════════════════════════════════════════════════════════════
     QUOTA BADGE
  ══════════════════════════════════════════════════════════════ */
  function updateQuotaBadge() {
    var el = document.getElementById('bx-qbadge');
    if (!el) return;
    var left = quotaLeft();
    el.textContent = left + ' free Q' + (left === 1 ? '' : 's') + ' left';
    el.style.background = left === 0
      ? 'rgba(239,68,68,.28)'
      : left === 1
      ? 'rgba(245,158,11,.28)'
      : 'rgba(255,255,255,.15)';
  }

  /* ══════════════════════════════════════════════════════════════
     TOGGLE / OPEN / CLOSE
  ══════════════════════════════════════════════════════════════ */
  window.bexiToggle = function() {
    var win = document.getElementById('bx-win');
    if (!win) return;
    win.classList.contains('bx-open') ? window.bexiClose() : window.bexiOpen();
  };

  window.bexiOpen = function() {
    var win = document.getElementById('bx-win');
    var bd  = document.getElementById('bx-bd');
    if (win) win.classList.add('bx-open');
    if (bd && isMobile()) bd.classList.add('open');
    if (isMobile()) document.body.style.overflow = 'hidden';
    updateQuotaBadge();
    setTimeout(function() {
      var inp = document.getElementById('bx-inp');
      if (inp && !inp.disabled) inp.focus();
    }, 300);
  };

  window.bexiClose = function() {
    var win = document.getElementById('bx-win');
    var bd  = document.getElementById('bx-bd');
    if (win) win.classList.remove('bx-open');
    if (bd)  bd.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') window.bexiClose();
  });

  /* ══════════════════════════════════════════════════════════════
     SEND
  ══════════════════════════════════════════════════════════════ */
  window.bexiSend = function() {
    var inp = document.getElementById('bx-inp');
    if (!inp) return;
    var q = inp.value.trim();
    if (!q) return;
    inp.value = '';
    window.bexiAsk(q);
  };

  /* ══════════════════════════════════════════════════════════════
     ASK (public entry point — called by starters + send)
  ══════════════════════════════════════════════════════════════ */
  window.bexiAsk = function(question) {
    if (!question || !question.trim()) return;

    // Hide starters once conversation begins
    var stEl = document.getElementById('bx-starters');
    if (stEl) stEl.style.display = 'none';

    // Check quota before adding user message
    var left = quotaLeft();

    // Render user bubble
    bexiAddMsg(question, 'user');

    if (left <= 0) {
      // Already exhausted — show gate, don't call API
      bexiShowGate();
      return;
    }

    // Optimistically consume quota
    bumpCount();
    updateQuotaBadge();

    // Disable input while streaming
    bexiSetLoading(true);

    // Store in history for multi-turn context
    _history.push({ role: 'user', content: question });
    saveHistory();

    // Show typing indicator
    var typingId = bexiShowTyping();

    // Call Claude
    callClaude().then(function(answer) {
      bexiRemoveTyping(typingId);
      bexiAddMsg(answer, 'bot');
      _history.push({ role: 'assistant', content: answer });
      saveHistory();
      bexiSetLoading(false);
      // Show gate if now exhausted
      if (quotaLeft() === 0) {
        setTimeout(bexiShowGate, 500);
      }
    }).catch(function() {
      bexiRemoveTyping(typingId);
      bexiAddMsg('Sorry, I hit a snag! Please try again in a moment. \uD83D\uDE4F', 'bot');
      bexiSetLoading(false);
    });
  };

  /* ══════════════════════════════════════════════════════════════
     CLAUDE API CALL
  ══════════════════════════════════════════════════════════════ */
  function callClaude() {
    // Build messages from history (last 8 entries = 4 turns)
    var messages = _history.slice(-8);

    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    }).then(function(res) {
      if (!res.ok) {
        return res.json().catch(function(){ return {}; }).then(function(err) {
          throw new Error((err.error && err.error.message) || ('API error ' + res.status));
        });
      }
      return res.json();
    }).then(function(data) {
      var text = (data.content || [])
        .filter(function(b) { return b.type === 'text'; })
        .map(function(b) { return b.text; })
        .join('');
      return text || "I couldn't generate a response right now. Please try again!";
    });
  }

  /* ══════════════════════════════════════════════════════════════
     UI HELPERS
  ══════════════════════════════════════════════════════════════ */
  function bexiAddMsg(text, type) {
    var msgs = document.getElementById('bx-msgs');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'bx-msg ' + type;

    if (type === 'bot') {
      // Split out "👉 Next step:" into styled callout
      var parts = text.split(/(👉 Next step:.*?)(?:\n|$)/);
      var html = '';
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (part.indexOf('👉 Next step:') === 0) {
          html += '<span class="bx-nxtstep">' + escHtml(part) + '</span>';
        } else {
          // Format: **bold**, bullet lines, line breaks
          var formatted = escHtml(part)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^- (.+)$/gm, '&#8226; $1')
            .replace(/\n/g, '<br>');
          html += formatted;
        }
      }
      div.innerHTML = html;
    } else {
      div.textContent = text;
    }

    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function escHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/₹/g, '&#8377;')
      .replace(/Rs\./g, '&#8377;');
  }

  var _tSeq = 0;
  function bexiShowTyping() {
    var msgs = document.getElementById('bx-msgs');
    if (!msgs) return null;
    var id = 'bxt' + (++_tSeq);
    var el = document.createElement('div');
    el.className = 'bx-typing';
    el.id = id;
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return id;
  }

  function bexiRemoveTyping(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  }

  function bexiSetLoading(on) {
    var inp = document.getElementById('bx-inp');
    var snd = document.getElementById('bx-snd');
    if (inp) inp.disabled = on;
    if (snd) snd.disabled = on;
  }

  function bexiShowGate() {
    var msgs = document.getElementById('bx-msgs');
    if (!msgs || msgs.querySelector('.bx-gate')) return;

    var gate = document.createElement('div');
    gate.className = 'bx-gate';
    gate.innerHTML = [
      '<div class="bx-gate-ic">\uD83D\uDD12</div>',
      '<div class="bx-gate-t">You\'ve used your 3 free questions</div>',
      '<div class="bx-gate-s">',
        'Join free to get <strong>10 questions/day</strong> \u2014 or upgrade to ',
        '<strong>Pro for unlimited</strong> Bexi AI, salary insights, and 1-on-1 mentor sessions.',
      '</div>',
      '<div class="bx-gate-btns">',
        '<a href="app.html" class="bx-gcta p">Join free \u2192</a>',
        '<a href="app.html" class="bx-gcta s">Sign in</a>',
      '</div>'
    ].join('');

    msgs.appendChild(gate);
    msgs.scrollTop = msgs.scrollHeight;

    // Lock input
    var inp = document.getElementById('bx-inp');
    var snd = document.getElementById('bx-snd');
    if (inp) { inp.disabled = true; inp.placeholder = 'Join free for more questions'; }
    if (snd) snd.disabled = true;
  }

})();
