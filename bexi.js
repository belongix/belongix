/* ═══════════════════════════════════════════════════
   Belongix — Bexi AI Career Agent v4.0
   Real Claude API · Multi-turn · Quota system
   Injected via <script src="bexi.js"> on all pages
═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────── */
  var CLAUDE_MODEL  = 'claude-sonnet-4-20250514';
  var MAX_TOKENS    = 600;
  var FREE_LIMIT    = 3;
  var HISTORY_KEY   = 'bexi_history';
  var QUOTA_KEY     = 'bexi_free_count';
  var QUOTA_TS_KEY  = 'bexi_free_ts';
  var MAX_HISTORY   = 10;

  var SYSTEM_PROMPT = 'You are Bexi, the AI career guide for Belongix — India\'s career platform. Help Indian job seekers with: salary benchmarks, interview prep, resume tips, career switches, skills to learn, and negotiation tactics. Always give specific, actionable advice tailored to India\'s job market in 2026. Use Indian salary figures (LPA), mention specific Indian companies when relevant (Swiggy, Razorpay, CRED, Zepto, PhonePe, Infosys, TCS etc). Format responses clearly: use **bold** for key points, - for bullet lists. Start with a 👉 Next step: if the user needs a clear action. Keep responses under 120 words unless the question genuinely needs more. Be warm, direct, and confident — like a smart senior colleague who knows the market cold.';

  /* ── QUOTA ───────────────────────────────────────── */
  function getQuota() {
    try {
      var ts = parseInt(localStorage.getItem(QUOTA_TS_KEY) || '0', 10);
      if (Date.now() - ts > 86400000) {
        localStorage.setItem(QUOTA_KEY, '0');
        localStorage.setItem(QUOTA_TS_KEY, String(Date.now()));
        return 0;
      }
      return parseInt(localStorage.getItem(QUOTA_KEY) || '0', 10);
    } catch (e) { return 0; }
  }

  function bumpQuota() {
    try {
      var n = getQuota() + 1;
      localStorage.setItem(QUOTA_KEY, String(n));
      if (!localStorage.getItem(QUOTA_TS_KEY)) localStorage.setItem(QUOTA_TS_KEY, String(Date.now()));
      return n;
    } catch (e) { return 1; }
  }

  function quotaLeft() { return Math.max(0, FREE_LIMIT - getQuota()); }

  /* ── HISTORY ─────────────────────────────────────── */
  function loadHistory() {
    try { return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveHistory(hist) {
    try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(-MAX_HISTORY * 2))); }
    catch (e) {}
  }

  /* ── CLAUDE API ──────────────────────────────────── */
  async function callClaude(userMsg) {
    var history = loadHistory();
    var messages = history.concat([{ role: 'user', content: userMsg }]);
    var res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: MAX_TOKENS, system: SYSTEM_PROMPT, messages: messages })
    });
    if (!res.ok) {
      var err = await res.json().catch(function () { return {}; });
      throw new Error(err.error ? err.error.message : 'HTTP ' + res.status);
    }
    var data = await res.json();
    var text = (data.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('').trim();
    if (!text) throw new Error('Empty response');
    return text;
  }

  /* ── CSS ─────────────────────────────────────────── */
  var CSS = '@import url("https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap");'
    + '#bexi-fab{position:fixed;bottom:calc(24px + env(safe-area-inset-bottom));right:24px;z-index:9998;display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#2D1B69,#6B48CC);color:#fff;border:none;border-radius:28px;padding:11px 18px 11px 13px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:"DM Sans",sans-serif;box-shadow:0 4px 20px rgba(45,27,105,.45);transition:.2s;letter-spacing:-.1px}'
    + '#bexi-fab:hover{background:linear-gradient(135deg,#4C2FAA,#8B5CF6);transform:translateY(-2px);box-shadow:0 8px 28px rgba(45,27,105,.55)}'
    + '#bexi-fab .bx-dot{width:8px;height:8px;border-radius:50%;background:#10B981;flex-shrink:0;animation:bxPulse 2s infinite}'
    + '@keyframes bxPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.85)}}'
    + '#bexi-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9996;backdrop-filter:blur(3px)}'
    + '#bexi-backdrop.bx-show{display:block}'
    + '#bexi-win{position:fixed;bottom:calc(80px + env(safe-area-inset-bottom));right:24px;width:360px;max-height:540px;background:#fff;border-radius:20px;border:1px solid #E4E4F0;box-shadow:0 20px 64px rgba(45,27,105,.2);z-index:9997;display:none;flex-direction:column;overflow:hidden;font-family:"DM Sans",sans-serif}'
    + '#bexi-win.bx-open{display:flex}'
    + '@media(max-width:600px){#bexi-win{width:100%;height:100%;max-height:100%;bottom:0;right:0;border-radius:0;border:none}#bexi-fab{bottom:calc(16px + env(safe-area-inset-bottom));right:16px}}'
    + '#bexi-head{background:linear-gradient(135deg,#2D1B69,#6B48CC);padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}'
    + '#bexi-hav{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:2px solid rgba(255,255,255,.25)}'
    + '#bexi-hinfo{flex:1;min-width:0}'
    + '#bexi-hname{font-size:14px;font-weight:700;color:#fff;font-family:"Sora",sans-serif}'
    + '#bexi-hsub{font-size:11px;color:rgba(255,255,255,.72);margin-top:2px;display:flex;align-items:center;gap:5px}'
    + '#bexi-quota-badge{font-size:10.5px;font-weight:700;padding:3px 8px;border-radius:20px;border:1px solid rgba(255,255,255,.3);color:rgba(255,255,255,.85);white-space:nowrap;flex-shrink:0}'
    + '#bexi-x{background:rgba(255,255,255,.15);border:none;color:#fff;font-size:16px;cursor:pointer;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:.15s;flex-shrink:0;margin-left:4px}'
    + '#bexi-x:hover{background:rgba(255,255,255,.28)}'
    + '#bexi-msgs{flex:1;overflow-y:auto;padding:14px 14px 8px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}'
    + '#bexi-msgs::-webkit-scrollbar{width:3px}'
    + '#bexi-msgs::-webkit-scrollbar-thumb{background:#D0D0E8;border-radius:3px}'
    + '.bx-msg{max-width:90%;padding:10px 13px;border-radius:14px;font-size:13px;line-height:1.65;word-break:break-word;animation:bxFadeIn .2s ease}'
    + '@keyframes bxFadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}'
    + '.bx-msg.bot{background:#F7F7FC;color:#0D0D1A;align-self:flex-start;border-radius:4px 14px 14px 14px;border:1px solid #E4E4F0;max-width:94%}'
    + '.bx-msg.user{background:linear-gradient(135deg,#2D1B69,#6B48CC);color:#fff;align-self:flex-end;border-radius:14px 4px 14px 14px}'
    + '.bx-next{background:rgba(45,27,105,.07);border-left:3px solid #6B48CC;border-radius:0 8px 8px 0;padding:6px 10px;margin:8px 0 4px;font-size:12.5px;font-weight:600;color:#2D1B69}'
    + '#bx-typing{display:flex;gap:4px;align-items:center;padding:10px 13px;background:#F7F7FC;border-radius:4px 14px 14px 14px;align-self:flex-start;border:1px solid #E4E4F0}'
    + '#bx-typing span{width:6px;height:6px;border-radius:50%;background:#8B8BA8;animation:bxTyping 1.2s infinite}'
    + '#bx-typing span:nth-child(2){animation-delay:.22s}'
    + '#bx-typing span:nth-child(3){animation-delay:.44s}'
    + '@keyframes bxTyping{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}'
    + '#bexi-chips{padding:8px 12px 10px;display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid #EFEFF8;background:#FAFAFE;flex-shrink:0}'
    + '.bx-chip{background:#EFEFF8;color:#2D1B69;border:1px solid #D0D0E8;border-radius:20px;padding:5px 11px;font-size:11.5px;font-weight:500;cursor:pointer;font-family:"DM Sans",sans-serif;white-space:nowrap;transition:.15s}'
    + '.bx-chip:hover{background:#2D1B69;color:#fff;border-color:#2D1B69}'
    + '#bexi-gate{padding:16px;background:#FAFAFE;border-top:1px solid #E4E4F0;text-align:center;flex-shrink:0}'
    + '#bexi-gate-title{font-size:13.5px;font-weight:700;color:#0D0D1A;margin-bottom:4px;font-family:"Sora",sans-serif}'
    + '#bexi-gate-sub{font-size:12px;color:#5A5A7A;line-height:1.6;margin-bottom:12px}'
    + '.bx-gate-btn{display:inline-block;padding:9px 18px;border-radius:9px;font-size:13px;font-weight:700;text-decoration:none;font-family:"DM Sans",sans-serif;transition:.2s;cursor:pointer}'
    + '.bx-gate-btn.primary{background:#2D1B69;color:#fff;margin-right:6px;border:none}'
    + '.bx-gate-btn.primary:hover{background:#4C2FAA}'
    + '.bx-gate-btn.ghost{border:1.5px solid #D0D0E8;color:#5A5A7A;background:none}'
    + '.bx-gate-btn.ghost:hover{border-color:#2D1B69;color:#2D1B69}'
    + '#bexi-irow{padding:10px 12px;border-top:1px solid #E4E4F0;display:flex;gap:8px;background:#fff;flex-shrink:0}'
    + '#bexi-inp{flex:1;border:1.5px solid #E4E4F0;border-radius:12px;padding:9px 13px;font-size:13px;font-family:"DM Sans",sans-serif;outline:none;color:#0D0D1A;transition:.15s;background:#FAFAFE}'
    + '#bexi-inp:focus{border-color:#2D1B69;background:#fff;box-shadow:0 0 0 3px rgba(45,27,105,.08)}'
    + '#bexi-inp:disabled{opacity:.5;cursor:not-allowed}'
    + '#bexi-snd{background:linear-gradient(135deg,#2D1B69,#6B48CC);border:none;border-radius:10px;padding:9px 13px;color:#fff;cursor:pointer;font-size:15px;transition:.15s;flex-shrink:0;display:flex;align-items:center;justify-content:center;width:38px;height:38px}'
    + '#bexi-snd:hover{background:linear-gradient(135deg,#4C2FAA,#8B5CF6)}'
    + '#bexi-snd:disabled{opacity:.5;cursor:not-allowed}'
    + '.bx-spin{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:bxSpinR .7s linear infinite}'
    + '@keyframes bxSpinR{to{transform:rotate(360deg)}}';

  /* ── HTML ────────────────────────────────────────── */
  var HTML = '<style id="bexi-styles">' + CSS + '</style>'
    + '<div id="bexi-backdrop" onclick="bexiToggle()"></div>'
    + '<button id="bexi-fab" onclick="bexiToggle()" aria-label="Chat with Bexi AI">'
    + '<div class="bx-dot"></div><span style="font-size:17px">&#129302;</span> Chat with Bexi AI</button>'
    + '<div id="bexi-win" role="dialog" aria-label="Bexi AI chat">'
    + '<div id="bexi-head">'
    + '<div id="bexi-hav">&#129302;</div>'
    + '<div id="bexi-hinfo"><div id="bexi-hname">Bexi AI</div>'
    + '<div id="bexi-hsub"><span style="width:6px;height:6px;border-radius:50%;background:#10B981;display:inline-block;flex-shrink:0;margin-right:4px"></span>Career Guide &middot; Online</div></div>'
    + '<div id="bexi-quota-badge">3 free Qs left</div>'
    + '<button id="bexi-x" onclick="bexiToggle()" aria-label="Close">&#10005;</button>'
    + '</div>'
    + '<div id="bexi-msgs">'
    + '<div class="bx-msg bot">Hi! I\'m Bexi &#128075; Your AI career guide for India\'s job market.<br><br>Ask me anything — salary benchmarks, interview tips, career switches, resume help and more!</div>'
    + '</div>'
    + '<div id="bexi-chips">'
    + '<button class="bx-chip" onclick="bexiAsk(\'What salary should I expect as a fresher in 2026?\')">Fresher salary</button>'
    + '<button class="bx-chip" onclick="bexiAsk(\'How do I crack a system design interview?\')">System design</button>'
    + '<button class="bx-chip" onclick="bexiAsk(\'How do I negotiate a 30% salary hike?\')">Negotiate salary</button>'
    + '</div>'
    + '<div id="bexi-irow">'
    + '<input id="bexi-inp" placeholder="Ask anything about your career..." onkeydown="if(event.key===\'Enter\'){event.preventDefault();bexiSend()}" autocomplete="off"/>'
    + '<button id="bexi-snd" onclick="bexiSend()" aria-label="Send">&#10148;</button>'
    + '</div></div>';

  /* ── MOUNT ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var wrap = document.createElement('div');
    wrap.id = 'bexi-root';
    wrap.innerHTML = HTML;
    document.body.appendChild(wrap);
    renderQuotaBadge();
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var w = document.getElementById('bexi-win');
        if (w && w.classList.contains('bx-open')) bexiToggle();
      }
    });
  });

  /* ── TOGGLE ──────────────────────────────────────── */
  window.bexiToggle = function () {
    var win = document.getElementById('bexi-win');
    var back = document.getElementById('bexi-backdrop');
    if (!win) return;
    var opening = !win.classList.contains('bx-open');
    win.classList.toggle('bx-open');
    if (back) back.classList.toggle('bx-show', opening);
    if (opening) { renderQuotaBadge(); setTimeout(function () { var i = document.getElementById('bexi-inp'); if (i && !i.disabled) i.focus(); }, 150); }
  };

  /* ── QUOTA BADGE ─────────────────────────────────── */
  function renderQuotaBadge() {
    var badge = document.getElementById('bexi-quota-badge');
    if (!badge) return;
    var left = quotaLeft();
    if (left === 0) { badge.textContent = 'Upgrade for more'; badge.style.background = 'rgba(255,92,53,.25)'; }
    else { badge.textContent = left + ' free Q' + (left !== 1 ? 's' : '') + ' left'; badge.style.background = left === 1 ? 'rgba(245,158,11,.25)' : 'rgba(16,185,129,.2)'; }
  }

  /* ── SEND ────────────────────────────────────────── */
  window.bexiSend = function () {
    var inp = document.getElementById('bexi-inp');
    if (!inp) return;
    var q = inp.value.trim();
    if (!q) return;
    inp.value = '';
    window.bexiAsk(q);
  };

  /* ── ASK ─────────────────────────────────────────── */
  window.bexiAsk = function (q) {
    if (!q || !q.trim()) return;
    var win = document.getElementById('bexi-win');
    if (win && !win.classList.contains('bx-open')) bexiToggle();

    // Hide chips after first question
    var chips = document.getElementById('bexi-chips');
    if (chips) chips.style.display = 'none';

    // Quota gate
    if (getQuota() >= FREE_LIMIT) {
      addMsg(q, 'user');
      showGate();
      return;
    }

    addMsg(q, 'user');
    setDisabled(true);
    showTyping();

    callClaude(q).then(function (reply) {
      removeTyping();
      bumpQuota();
      // Save to history
      var hist = loadHistory();
      hist.push({ role: 'user', content: q });
      hist.push({ role: 'assistant', content: reply });
      saveHistory(hist);
      addMsg(reply, 'bot');
      renderQuotaBadge();
      setDisabled(false);
      if (quotaLeft() === 0) showGate();
    }).catch(function (err) {
      removeTyping();
      var msg = err && err.message ? err.message : '';
      var friendly = msg.includes('401') ? 'API key issue — please reload the page.'
        : msg.includes('429') ? 'Rate limit hit — wait a moment and try again.'
        : msg.includes('Failed to fetch') || msg.includes('NetworkError') ? 'Network error — check your connection.'
        : 'Something went wrong. Please try again.';
      addMsg('⚠️ ' + friendly, 'bot');
      setDisabled(false);
    });
  };

  /* ── HELPERS ─────────────────────────────────────── */
  function addMsg(text, role) {
    var msgs = document.getElementById('bexi-msgs');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'bx-msg ' + role;
    div.innerHTML = role === 'bot' ? formatBot(text) : escHtml(text);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function formatBot(text) {
    var s = escHtml(text);
    s = s.replace(/👉\s*Next step:\s*([^\n<]+)/gi, '<div class="bx-next">👉 Next step: $1</div>');
    s = s.replace(/\*\*([^*<]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\n-\s+/g, '<br>• ');
    s = s.replace(/\n/g, '<br>');
    return s;
  }

  function escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function showTyping() {
    var msgs = document.getElementById('bexi-msgs');
    if (!msgs || document.getElementById('bx-typing')) return;
    var t = document.createElement('div');
    t.id = 'bx-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() { var t = document.getElementById('bx-typing'); if (t) t.remove(); }

  function setDisabled(d) {
    var inp = document.getElementById('bexi-inp');
    var snd = document.getElementById('bexi-snd');
    if (inp) inp.disabled = d;
    if (snd) { snd.disabled = d; snd.innerHTML = d ? '<div class="bx-spin"></div>' : '&#10148;'; }
  }

  function showGate() {
    var existing = document.getElementById('bexi-gate');
    if (existing) return;
    var irow = document.getElementById('bexi-irow');
    if (irow) irow.style.display = 'none';
    var gate = document.createElement('div');
    gate.id = 'bexi-gate';
    gate.innerHTML = '<div id="bexi-gate-title">You\'ve used your 3 free questions ✨</div>'
      + '<div id="bexi-gate-sub">Join Belongix free for 10 questions/day,<br>or upgrade to Pro for unlimited Bexi AI.</div>'
      + '<a href="app.html" class="bx-gate-btn primary">Join Free → 10/day</a>'
      + '<a href="app.html#upgrade" class="bx-gate-btn ghost">Go Pro</a>';
    var win = document.getElementById('bexi-win');
    if (win) win.appendChild(gate);
  }

})();
