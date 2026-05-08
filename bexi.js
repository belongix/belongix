/* ═══════════════════════════════════════════════════════════════
   Belongix — Bexi AI Career Guide  v5.0
   Powered by Google Gemini API  — 100% FREE, no credit card
   ─────────────────────────────────────────────────────────────
   SETUP (2 minutes, completely free):
   1. Go to https://aistudio.google.com
   2. Sign in with your Google account
   3. Click "Get API Key" → "Create API key"
   4. Paste the key below — done!
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── ✏️  PASTE YOUR FREE GEMINI KEY HERE ────────────────── */
  var GEMINI_KEY = 'AIzaSyAbl2QB3rdLgO7ZL2YEfsp1xrGCVBzKSRE';
  /* ─────────────────────────────────────────────────────────── */

  /* Gemini endpoint — free tier, no credit card needed */
  var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_KEY;

  var FREE_LIMIT = 3;
  var COUNT_KEY  = 'bexi_free_count';
  var TS_KEY     = 'bexi_free_ts';
  var HIST_KEY   = 'bexi_session_history';
  var MAX_HIST   = 8;

  var SYSTEM_INSTRUCTION = 'You are Bexi, an AI career guide for Indian professionals built by Belongix. You have deep knowledge of India\'s job market in 2026 — salaries, in-demand skills, top companies hiring, interview prep, and career switching. Always give specific, actionable advice relevant to India. Mention real companies (Swiggy, Razorpay, Infosys, TCS, Google India, CRED, Zepto, PhonePe, Meesho, Flipkart, etc.), real salary ranges in LPA, and real skills (Python, React, SQL, AWS, system design, etc.). Be warm, direct, and encouraging. Never give generic advice. Use **bold** for key terms and - for bullet lists. Always end your reply with a 👉 Next step: line telling the person exactly one concrete thing they can do today. Keep replies under 150 words unless the question genuinely needs more depth.';

  var STARTERS = [
    'Am I being paid fairly for my role?',
    'How do I switch from non-tech to data analytics?',
    'What skills should I learn in 2026 for a ₹20 LPA job?'
  ];

  /* ════════ QUOTA ════════ */
  function getCount() {
    try {
      var ts = parseInt(localStorage.getItem(TS_KEY) || '0', 10);
      if (Date.now() - ts > 86400000) {
        localStorage.setItem(COUNT_KEY, '0');
        localStorage.setItem(TS_KEY, String(Date.now()));
        return 0;
      }
      return parseInt(localStorage.getItem(COUNT_KEY) || '0', 10);
    } catch (e) { return 0; }
  }

  function increment() {
    try {
      var n = getCount() + 1;
      localStorage.setItem(COUNT_KEY, String(n));
      if (!localStorage.getItem(TS_KEY)) localStorage.setItem(TS_KEY, String(Date.now()));
    } catch (e) {}
  }

  function remaining() { return Math.max(0, FREE_LIMIT - getCount()); }

  /* ════════ HISTORY ════════ */
  function getHistory() {
    try { return JSON.parse(sessionStorage.getItem(HIST_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function pushHistory(role, content) {
    try {
      var h = getHistory();
      h.push({ role: role, content: content });
      sessionStorage.setItem(HIST_KEY, JSON.stringify(h.slice(-(MAX_HIST * 2))));
    } catch (e) {}
  }

  /* ════════ GEMINI API ════════
     Gemini uses a different format from OpenAI/Anthropic:
     - "user" / "model" roles (not "user" / "assistant")
     - contents[] array with parts[]
     - system_instruction as a separate field
  ════════════════════════════ */
  async function askGemini(userMsg) {
    /* Build conversation history in Gemini format */
    var rawHistory = getHistory();
    var contents = rawHistory.map(function (m) {
      return {
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      };
    });

    /* Add current user message */
    contents.push({ role: 'user', parts: [{ text: userMsg }] });

    var body = {
      system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: contents,
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.7
      }
    };

    var res = await fetch(GEMINI_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    });

    if (!res.ok) {
      var errData = await res.json().catch(function () { return {}; });
      var code = res.status;
      if (code === 400) throw new Error('bad_key');
      if (code === 403) throw new Error('invalid_key');
      if (code === 429) throw new Error('rate_limit');
      throw new Error(errData.error ? errData.error.message : 'HTTP ' + code);
    }

    var data  = await res.json();
    var reply = '';
    try {
      reply = data.candidates[0].content.parts[0].text.trim();
    } catch (e) {
      throw new Error('empty');
    }
    if (!reply) throw new Error('empty');
    return reply;
  }

  /* ════════ ERROR MESSAGES ════════ */
  function friendlyError(err) {
    var m = err && err.message ? err.message : '';
    if (m === 'bad_key' || m === 'invalid_key' || m === '403')
      return '⚠️ Gemini API key is missing or invalid. Open bexi.js and replace YOUR_GEMINI_API_KEY_HERE with your free key from aistudio.google.com';
    if (m === 'rate_limit')
      return '⚠️ Too many questions right now — please wait a moment and try again.';
    if (m === 'empty')
      return '⚠️ Got an empty response — please try rephrasing your question.';
    if (m.includes('Failed to fetch') || m.includes('NetworkError'))
      return '⚠️ Network error — check your internet connection and try again.';
    return '⚠️ Something went wrong. Please try again. (' + (m || 'unknown') + ')';
  }

  /* ════════ CSS ════════ */
  var CSS = [
    '@import url("https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap");',

    ':root{',
    '--bxb:#2D1B69;--bxb2:#4C2FAA;',
    '--bxg:linear-gradient(135deg,#2D1B69,#6C3FC5);',
    '--bxa:#FF5C35;--bxgr:#10B981;',
    '--bxi:#0D0D1A;--bxm:#5A5A7A;--bxs:#8B8BA8;',
    '--bxbg:#F7F7FC;--bxw:#fff;--bxbr:#E4E4F0;',
    '--bxff:"DM Sans",sans-serif;--bxfs:"Sora",sans-serif;',
    '}',

    /* ── FAB ── */
    '#bx-fab{',
    '  position:fixed;bottom:calc(24px + env(safe-area-inset-bottom));right:24px;z-index:9998;',
    '  display:flex;align-items:center;gap:9px;',
    '  background:var(--bxg);color:#fff;border:none;border-radius:56px;',
    '  padding:12px 20px 12px 14px;font-size:14px;font-weight:600;',
    '  font-family:var(--bxff);cursor:pointer;letter-spacing:-.1px;',
    '  box-shadow:0 6px 24px rgba(45,27,105,.5);',
    '  transition:transform .2s,box-shadow .2s;',
    '  -webkit-tap-highlight-color:transparent;',
    '}',
    '#bx-fab:hover{transform:translateY(-3px);box-shadow:0 10px 32px rgba(45,27,105,.6);}',
    '#bx-fab .bx-pulse{',
    '  width:9px;height:9px;border-radius:50%;background:var(--bxgr);',
    '  flex-shrink:0;animation:bxP 2s infinite;',
    '}',
    '@keyframes bxP{0%{box-shadow:0 0 0 0 rgba(16,185,129,.6)}70%{box-shadow:0 0 0 9px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}}',

    /* ── Backdrop ── */
    '#bx-bd{display:none;position:fixed;inset:0;z-index:9996;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);}',
    '#bx-bd.open{display:block;}',

    /* ── Panel ── */
    '#bx-panel{',
    '  position:fixed;bottom:calc(88px + env(safe-area-inset-bottom));right:24px;z-index:9997;',
    '  width:350px;height:500px;',
    '  background:var(--bxw);border-radius:18px;border:1px solid var(--bxbr);',
    '  box-shadow:0 24px 72px rgba(45,27,105,.22);',
    '  display:none;flex-direction:column;overflow:hidden;font-family:var(--bxff);',
    '}',
    '#bx-panel.open{display:flex;}',

    /* Mobile: full-screen */
    '@media(max-width:600px){',
    '  #bx-panel{width:100%;height:100%;bottom:0;right:0;border-radius:0;border:none;}',
    '  #bx-fab{bottom:calc(16px + env(safe-area-inset-bottom));right:16px;',
    '    padding:11px 18px 11px 12px;font-size:13px;}',
    '}',

    /* ── Header ── */
    '#bx-head{',
    '  background:var(--bxg);padding:14px 16px;',
    '  display:flex;align-items:center;gap:11px;flex-shrink:0;',
    '}',
    '#bx-av{',
    '  width:40px;height:40px;border-radius:50%;flex-shrink:0;',
    '  background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.3);',
    '  display:flex;align-items:center;justify-content:center;font-size:20px;',
    '}',
    '#bx-hinfo{flex:1;min-width:0;}',
    '#bx-hname{font-family:var(--bxfs);font-size:14px;font-weight:700;color:#fff;letter-spacing:-.2px;}',
    '#bx-hst{',
    '  display:flex;align-items:center;gap:5px;',
    '  font-size:11.5px;color:rgba(255,255,255,.72);margin-top:2px;',
    '}',
    '#bx-hst::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--bxgr);flex-shrink:0;}',
    '#bx-quota{',
    '  font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;',
    '  border:1px solid rgba(255,255,255,.28);color:rgba(255,255,255,.9);',
    '  background:rgba(16,185,129,.2);white-space:nowrap;flex-shrink:0;',
    '}',
    '#bx-x{',
    '  width:30px;height:30px;border-radius:50%;border:none;',
    '  background:rgba(255,255,255,.15);color:#fff;font-size:16px;cursor:pointer;',
    '  display:flex;align-items:center;justify-content:center;transition:.15s;',
    '  flex-shrink:0;margin-left:4px;',
    '}',
    '#bx-x:hover{background:rgba(255,255,255,.28);}',

    /* ── Messages ── */
    '#bx-msgs{',
    '  flex:1;overflow-y:auto;padding:14px 14px 8px;',
    '  display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;',
    '}',
    '#bx-msgs::-webkit-scrollbar{width:3px;}',
    '#bx-msgs::-webkit-scrollbar-thumb{background:#D0D0E8;border-radius:3px;}',

    /* Bubbles */
    '.bxb{',
    '  max-width:88%;padding:11px 14px;border-radius:16px;',
    '  font-size:13.5px;line-height:1.7;word-break:break-word;',
    '  animation:bxIn .18s ease both;',
    '}',
    '@keyframes bxIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
    '.bxb.bot{',
    '  background:var(--bxbg);color:var(--bxi);',
    '  align-self:flex-start;',
    '  border-radius:4px 16px 16px 16px;',
    '  border:1px solid var(--bxbr);max-width:93%;',
    '}',
    '.bxb.user{',
    '  background:var(--bxg);color:#fff;',
    '  align-self:flex-end;',
    '  border-radius:16px 4px 16px 16px;',
    '}',
    '.bxb.err{background:#FEF2F2;border-color:#FECACA;color:#991B1B;}',

    /* 👉 Next step callout */
    '.bx-step{',
    '  margin:9px 0 4px;padding:7px 11px;',
    '  background:rgba(45,27,105,.07);',
    '  border-left:3px solid #6C3FC5;',
    '  border-radius:0 8px 8px 0;',
    '  font-size:12.5px;font-weight:600;color:var(--bxb);',
    '}',

    /* ── Typing indicator ── */
    '#bx-typing{',
    '  display:flex;gap:5px;align-items:center;padding:11px 14px;',
    '  background:var(--bxbg);border:1px solid var(--bxbr);',
    '  border-radius:4px 16px 16px 16px;align-self:flex-start;',
    '}',
    '#bx-typing span{',
    '  width:7px;height:7px;border-radius:50%;background:#A0A0C0;',
    '  animation:bxDots 1.3s infinite ease-in-out;',
    '}',
    '#bx-typing span:nth-child(2){animation-delay:.18s;}',
    '#bx-typing span:nth-child(3){animation-delay:.36s;}',
    '@keyframes bxDots{0%,80%,100%{transform:scale(.7);opacity:.5}40%{transform:scale(1.1);opacity:1}}',

    /* ── Starter chips ── */
    '#bx-starters{',
    '  padding:10px 14px 12px;border-top:1px solid #EFEFF8;',
    '  background:#FAFAFE;display:flex;flex-direction:column;gap:7px;flex-shrink:0;',
    '}',
    '#bx-starters-lbl{',
    '  font-size:10.5px;font-weight:700;color:var(--bxs);',
    '  text-transform:uppercase;letter-spacing:.5px;',
    '}',
    '.bx-starter{',
    '  background:var(--bxw);border:1.5px solid var(--bxbr);border-radius:10px;',
    '  padding:8px 12px;font-size:12.5px;font-weight:500;color:var(--bxb);',
    '  cursor:pointer;font-family:var(--bxff);text-align:left;',
    '  line-height:1.4;transition:.15s;',
    '}',
    '.bx-starter:hover{border-color:var(--bxb);background:#EFEFF8;color:var(--bxb);}',

    /* ── Quota gate ── */
    '#bx-gate{',
    '  padding:18px 16px;background:var(--bxbg);',
    '  border-top:1px solid var(--bxbr);text-align:center;flex-shrink:0;',
    '}',
    '#bx-gate h4{',
    '  font-family:var(--bxfs);font-size:14px;font-weight:700;',
    '  color:var(--bxi);margin-bottom:5px;',
    '}',
    '#bx-gate p{font-size:12.5px;color:var(--bxm);line-height:1.65;margin-bottom:13px;}',
    '.bx-cta{',
    '  display:inline-flex;align-items:center;padding:9px 18px;border-radius:9px;',
    '  font-size:13px;font-weight:700;font-family:var(--bxff);',
    '  text-decoration:none;cursor:pointer;border:none;transition:.15s;',
    '  margin:0 4px 4px;',
    '}',
    '.bx-cta.fill{background:var(--bxb);color:#fff;}',
    '.bx-cta.fill:hover{background:var(--bxb2);}',
    '.bx-cta.outline{border:1.5px solid var(--bxbr);background:transparent;color:var(--bxm);}',
    '.bx-cta.outline:hover{border-color:var(--bxb);color:var(--bxb);}',

    /* ── Input row ── */
    '#bx-irow{',
    '  padding:10px 12px;border-top:1px solid var(--bxbr);',
    '  display:flex;gap:8px;background:var(--bxw);',
    '  flex-shrink:0;align-items:center;',
    '}',
    '#bx-inp{',
    '  flex:1;border:1.5px solid var(--bxbr);border-radius:11px;',
    '  padding:9px 13px;font-size:13.5px;font-family:var(--bxff);',
    '  color:var(--bxi);background:#FAFAFE;outline:none;transition:.15s;',
    '}',
    '#bx-inp:focus{border-color:var(--bxb);background:#fff;box-shadow:0 0 0 3px rgba(45,27,105,.09);}',
    '#bx-inp:disabled{opacity:.45;cursor:not-allowed;}',
    '#bx-inp::placeholder{color:#A0A0BE;}',
    '#bx-send{',
    '  width:38px;height:38px;flex-shrink:0;border:none;border-radius:10px;',
    '  background:var(--bxg);color:#fff;cursor:pointer;font-size:16px;',
    '  display:flex;align-items:center;justify-content:center;transition:.15s;',
    '}',
    '#bx-send:hover{filter:brightness(1.12);transform:scale(1.06);}',
    '#bx-send:disabled{opacity:.45;cursor:not-allowed;transform:none;filter:none;}',
    '.bx-spin{',
    '  width:15px;height:15px;',
    '  border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;',
    '  border-radius:50%;animation:bxSpin .65s linear infinite;',
    '}',
    '@keyframes bxSpin{to{transform:rotate(360deg)}}'
  ].join('\n');

  /* ════════ HTML ════════ */
  function buildHTML() {
    var chips = STARTERS.map(function (q) {
      return '<button class="bx-starter" onclick="bexiAsk(' + JSON.stringify(q) + ')">' + esc(q) + '</button>';
    }).join('');

    return [
      '<style id="bx-css">' + CSS + '</style>',

      '<div id="bx-bd" onclick="bexiClose()"></div>',

      '<button id="bx-fab" onclick="bexiToggle()" aria-label="Chat with Bexi AI">',
      '  <div class="bx-pulse"></div>',
      '  <span style="font-size:18px">&#129302;</span>',
      '  Chat with Bexi AI',
      '</button>',

      '<div id="bx-panel" role="dialog" aria-modal="true" aria-label="Bexi AI career guide">',

      '  <div id="bx-head">',
      '    <div id="bx-av">&#129302;</div>',
      '    <div id="bx-hinfo">',
      '      <div id="bx-hname">Bexi AI</div>',
      '      <div id="bx-hst">Career Guide &middot; Online</div>',
      '    </div>',
      '    <div id="bx-quota">3 free Qs left</div>',
      '    <button id="bx-x" onclick="bexiClose()" aria-label="Close">&#10005;</button>',
      '  </div>',

      '  <div id="bx-msgs">',
      '    <div class="bxb bot">',
      '      Hi! I\'m Bexi &#128075;<br><br>',
      '      I know India\'s job market inside out — salaries, in-demand skills, career switches, and salary negotiation. Ask me anything!',
      '    </div>',
      '  </div>',

      '  <div id="bx-starters">',
      '    <div id="bx-starters-lbl">Try asking</div>',
      chips,
      '  </div>',

      '  <div id="bx-irow">',
      '    <input id="bx-inp" type="text"',
      '      placeholder="Ask anything about your career..."',
      '      autocomplete="off"',
      '      onkeydown="if(event.key===\'Enter\'){event.preventDefault();bexiSend()}"',
      '    />',
      '    <button id="bx-send" onclick="bexiSend()" aria-label="Send">&#10148;</button>',
      '  </div>',

      '</div>'
    ].join('\n');
  }

  /* ════════ MOUNT ════════ */
  function mount() {
    if (document.getElementById('bx-root')) return;
    var root = document.createElement('div');
    root.id  = 'bx-root';
    root.innerHTML = buildHTML();
    document.body.appendChild(root);
    syncBadge();
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') bexiClose();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  /* ════════ OPEN / CLOSE ════════ */
  window.bexiToggle = function () {
    var p = document.getElementById('bx-panel');
    if (!p) return;
    p.classList.contains('open') ? bexiClose() : bexiOpen();
  };

  function bexiOpen() {
    var p  = document.getElementById('bx-panel');
    var bd = document.getElementById('bx-bd');
    if (!p) return;
    p.classList.add('open');
    if (bd) bd.classList.add('open');
    document.body.style.overflow = 'hidden';
    syncBadge();
    setTimeout(function () {
      var inp = document.getElementById('bx-inp');
      if (inp && !inp.disabled) inp.focus();
    }, 180);
  }

  window.bexiClose = function () {
    var p  = document.getElementById('bx-panel');
    var bd = document.getElementById('bx-bd');
    if (p)  p.classList.remove('open');
    if (bd) bd.classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ════════ BADGE ════════ */
  function syncBadge() {
    var b = document.getElementById('bx-quota');
    if (!b) return;
    var left = remaining();
    if (left === 0) {
      b.textContent = 'Upgrade for more';
      b.style.background  = 'rgba(255,92,53,.22)';
      b.style.borderColor = 'rgba(255,92,53,.4)';
    } else if (left === 1) {
      b.textContent = '1 free Q left';
      b.style.background  = 'rgba(245,158,11,.22)';
      b.style.borderColor = 'rgba(245,158,11,.4)';
    } else {
      b.textContent = left + ' free Qs left';
      b.style.background  = 'rgba(16,185,129,.18)';
      b.style.borderColor = 'rgba(16,185,129,.35)';
    }
  }

  /* ════════ SEND ════════ */
  window.bexiSend = function () {
    var inp = document.getElementById('bx-inp');
    if (!inp) return;
    var q = inp.value.trim();
    if (!q) return;
    inp.value = '';
    window.bexiAsk(q);
  };

  /* ════════ ASK ════════ */
  window.bexiAsk = function (question) {
    if (!question || !question.trim()) return;

    var p = document.getElementById('bx-panel');
    if (p && !p.classList.contains('open')) bexiOpen();

    /* Hide starters after first use */
    var st = document.getElementById('bx-starters');
    if (st) st.style.display = 'none';

    /* Quota gate */
    if (getCount() >= FREE_LIMIT) {
      appendMsg(question, 'user');
      showGate();
      return;
    }

    appendMsg(question, 'user');
    lockInput(true);
    showTyping();

    askGemini(question).then(function (reply) {
      hideTyping();
      increment();
      pushHistory('user',      question);
      pushHistory('assistant', reply);
      appendMsg(reply, 'bot');
      syncBadge();
      lockInput(false);
      if (remaining() === 0) showGate();
    }).catch(function (err) {
      hideTyping();
      lockInput(false);
      appendMsg(friendlyError(err), 'err');
    });
  };

  /* ════════ DOM HELPERS ════════ */
  function appendMsg(text, type) {
    var msgs = document.getElementById('bx-msgs');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'bxb ' + (type === 'user' ? 'user' : type === 'err' ? 'bot err' : 'bot');
    div.innerHTML  = type === 'user' ? esc(text) : formatBot(text);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function formatBot(raw) {
    var s = esc(raw);
    /* 👉 Next step: → purple callout */
    s = s.replace(/👉\s*Next step:\s*([^\n]+)/gi, '<div class="bx-step">👉 Next step: $1</div>');
    /* **bold** → <strong> */
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    /* - bullet lines */
    s = s.replace(/\n\s*-\s+/g, '\n• ');
    /* newlines → <br> */
    s = s.replace(/\n/g, '<br>');
    return s;
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }

  function showTyping() {
    var msgs = document.getElementById('bx-msgs');
    if (!msgs || document.getElementById('bx-typing')) return;
    var t = document.createElement('div');
    t.id  = 'bx-typing';
    t.setAttribute('aria-label', 'Bexi is thinking');
    t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    var t = document.getElementById('bx-typing');
    if (t) t.remove();
  }

  function lockInput(on) {
    var inp  = document.getElementById('bx-inp');
    var send = document.getElementById('bx-send');
    if (inp)  inp.disabled  = on;
    if (send) {
      send.disabled = on;
      send.innerHTML = on ? '<div class="bx-spin"></div>' : '&#10148;';
    }
  }

  /* ════════ QUOTA GATE ════════ */
  function showGate() {
    if (document.getElementById('bx-gate')) return;
    var irow = document.getElementById('bx-irow');
    if (irow) irow.style.display = 'none';

    var gate = document.createElement('div');
    gate.id  = 'bx-gate';
    gate.innerHTML = [
      '<h4>You\'ve used your 3 free questions ✨</h4>',
      '<p>Join Belongix free for <strong>10 questions/day</strong>,<br>',
      'or upgrade to <strong>Pro</strong> for unlimited Bexi AI.</p>',
      '<a href="app.html" class="bx-cta fill">Join Free → 10/day</a>',
      '<a href="app.html#upgrade" class="bx-cta outline">Go Pro — Unlimited</a>'
    ].join('');

    var panel = document.getElementById('bx-panel');
    if (panel) panel.appendChild(gate);
  }

})();
