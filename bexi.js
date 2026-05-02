/* Belongix — Bexi AI Chat Component v3.0
   Brand: Sora font, deep purple #2D1B69
   Injected into all pages automatically */
(function () {
  var SB_URL = 'https://efhcfuaxgbzuqlmhlsxc.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGNmdWF4Z2J6dXFsbWhsc3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDg1NzgsImV4cCI6MjA5MjcyNDU3OH0.vpFvBPnKkrMMONXo9z6FemJ2qIlRChRloQYRB0LMdjY';

  var RESPONSES = {
    salary: 'Fresher salaries in India (2026):\n- Software Engineer: Rs.3.5-8 LPA\n- Data Analyst: Rs.3-6 LPA\n- Full Stack Dev: Rs.4-10 LPA\n- DevOps: Rs.5-12 LPA\n\nTop startups pay 20-40% above market. Always negotiate!',
    interview: 'Top interview tips:\n1. DSA - LeetCode 75 is a solid start\n2. System Design - ByteByteGo on YouTube\n3. Behavioral - use STAR method\n4. Research the company before each round\n5. Mock interviews on Pramp (free)\n\nWant tips for a specific company?',
    skills: 'Most in-demand skills in 2026:\nAgentic AI & LangChain\nCloud (AWS / Azure / GCP)\nData Engineering (dbt, Kafka)\nFull Stack (React + Node.js)\nCybersecurity\nSQL & Analytics\n\nAll available free in Belongix Upskilling Hub!',
    career: 'Career path guidance:\n- Students - internships, DSA, projects\n- Freshers - first job roadmap, resume tips\n- Professionals - salary negotiation, promotions\n- Career changers - reskilling paths, mentor matching\n\nSign up for a personalized roadmap!',
    mentor: 'Our mentor network connects you with verified professionals for:\n- Resume reviews\n- Mock interview sessions\n- Salary negotiation coaching\n- Career switch guidance\n\nVisit belongix.in/mentors.html to find or become a mentor!',
    resume: 'Resume tips for India:\n1. Keep it 1 page for under 5 years experience\n2. Lead with impact numbers (increased X by Y%)\n3. Use ATS-friendly formatting - no tables/images\n4. Match keywords from the job description\n5. LinkedIn must match your resume exactly\n\nNeed a detailed review? Book a mentor session!',
    default: 'I can help with:\n- Salary benchmarks for your role\n- Interview preparation\n- Skills in demand 2026\n- Career path guidance\n- Resume and LinkedIn tips\n- Finding the right mentor\n\nWhat would you like to know?'
  };

  function getResponse(q) {
    var l = q.toLowerCase();
    if (l.match(/salary|pay|lpa|ctc|fresher|hike|package/)) return RESPONSES.salary;
    if (l.match(/interview|prep|dsa|leetcode|crack|selection/)) return RESPONSES.interview;
    if (l.match(/skill|learn|course|demand|trend|2026/)) return RESPONSES.skills;
    if (l.match(/career|path|switch|change|growth|job/)) return RESPONSES.career;
    if (l.match(/mentor|guide|coach|session|1.on.1/)) return RESPONSES.mentor;
    if (l.match(/resume|cv|linkedin|profile/)) return RESPONSES.resume;
    return RESPONSES.default;
  }

  var CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
    #bexi-fab{position:fixed;bottom:24px;right:24px;z-index:9998;display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#2D1B69,#6B48CC);color:#fff;border:none;border-radius:28px;padding:11px 18px 11px 13px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 4px 20px rgba(45,27,105,.45);transition:.2s;letter-spacing:-.1px}
    #bexi-fab:hover{background:linear-gradient(135deg,#4C2FAA,#8B5CF6);transform:translateY(-2px);box-shadow:0 8px 28px rgba(45,27,105,.55)}
    #bexi-fab .bx-dot{width:8px;height:8px;border-radius:50%;background:#10B981;flex-shrink:0;animation:bxPulse 2s infinite}
    @keyframes bxPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.85)}}
    #bexi-win{position:fixed;bottom:80px;right:24px;width:360px;max-height:520px;background:#fff;border-radius:20px;border:1px solid #E4E4F0;box-shadow:0 20px 64px rgba(45,27,105,.2);z-index:9997;display:none;flex-direction:column;overflow:hidden;font-family:'DM Sans',sans-serif}
    #bexi-win.bx-open{display:flex}
    #bexi-head{background:linear-gradient(135deg,#2D1B69,#6B48CC);padding:16px;display:flex;align-items:center;gap:12px}
    #bexi-hav{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:2px solid rgba(255,255,255,.25)}
    #bexi-hinfo{flex:1}
    #bexi-hname{font-size:14px;font-weight:700;color:#fff;letter-spacing:-.2px;font-family:'Sora',sans-serif}
    #bexi-hsub{font-size:11px;color:rgba(255,255,255,.7);margin-top:1px;display:flex;align-items:center;gap:5px}
    #bexi-hsub::before{content:'';width:6px;height:6px;border-radius:50%;background:#10B981;display:inline-block}
    #bexi-x{background:rgba(255,255,255,.15);border:none;color:#fff;font-size:16px;cursor:pointer;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:.15s;flex-shrink:0}
    #bexi-x:hover{background:rgba(255,255,255,.25)}
    #bexi-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}
    #bexi-msgs::-webkit-scrollbar{width:4px}
    #bexi-msgs::-webkit-scrollbar-thumb{background:#E4E4F0;border-radius:4px}
    .bx-msg{max-width:88%;padding:10px 13px;border-radius:14px;font-size:13px;line-height:1.6;animation:bxFadeIn .2s ease}
    @keyframes bxFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .bx-msg.bot{background:#F7F7FC;color:#0D0D1A;align-self:flex-start;border-radius:4px 14px 14px 14px;border:1px solid #E4E4F0}
    .bx-msg.user{background:linear-gradient(135deg,#2D1B69,#6B48CC);color:#fff;align-self:flex-end;border-radius:14px 4px 14px 14px}
    .bx-typing{display:flex;gap:4px;align-items:center;padding:10px 13px;background:#F7F7FC;border-radius:4px 14px 14px 14px;align-self:flex-start;border:1px solid #E4E4F0}
    .bx-typing span{width:6px;height:6px;border-radius:50%;background:#8B8BA8;animation:bxTyping 1.2s infinite}
    .bx-typing span:nth-child(2){animation-delay:.2s}
    .bx-typing span:nth-child(3){animation-delay:.4s}
    @keyframes bxTyping{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
    #bexi-chips{padding:10px 16px;display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid #EFEFF8;background:#FAFAFE}
    .bx-chip{background:#EFEFF8;color:#2D1B69;border:1px solid #D0D0E8;border-radius:20px;padding:5px 12px;font-size:12px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;transition:.15s}
    .bx-chip:hover{background:#2D1B69;color:#fff;border-color:#2D1B69}
    #bexi-irow{padding:12px 16px;border-top:1px solid #E4E4F0;display:flex;gap:8px;background:#fff}
    #bexi-inp{flex:1;border:1.5px solid #E4E4F0;border-radius:12px;padding:9px 13px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;color:#0D0D1A;transition:.15s;background:#FAFAFE}
    #bexi-inp:focus{border-color:#2D1B69;background:#fff;box-shadow:0 0 0 3px rgba(45,27,105,.08)}
    #bexi-snd{background:linear-gradient(135deg,#2D1B69,#6B48CC);border:none;border-radius:10px;padding:9px 13px;color:#fff;cursor:pointer;font-size:16px;transition:.15s;flex-shrink:0}
    #bexi-snd:hover{background:linear-gradient(135deg,#4C2FAA,#8B5CF6)}
  `;

  var HTML = `
    <style>${CSS}</style>
    <button id="bexi-fab" onclick="bexiToggle()">
      <div class="bx-dot"></div>
      <span style="font-size:17px">&#129302;</span>
      Chat with Bexi AI
    </button>
    <div id="bexi-win">
      <div id="bexi-head">
        <div id="bexi-hav">&#129302;</div>
        <div id="bexi-hinfo">
          <div id="bexi-hname">Bexi AI</div>
          <div id="bexi-hsub">Career Guide &middot; Online</div>
        </div>
        <button id="bexi-x" onclick="bexiToggle()">&#10005;</button>
      </div>
      <div id="bexi-msgs">
        <div class="bx-msg bot">Hi! I'm Bexi, your Belongix career guide &#128075;<br><br>Ask me about salary benchmarks, interview tips, skills to learn, career paths and more!</div>
      </div>
      <div id="bexi-chips">
        <button class="bx-chip" onclick="bexiAsk('What salary should a fresher expect?')">Fresher salary</button>
        <button class="bx-chip" onclick="bexiAsk('How to crack tech interviews?')">Interview tips</button>
        <button class="bx-chip" onclick="bexiAsk('Top skills in demand 2026?')">Top skills</button>
        <button class="bx-chip" onclick="bexiAsk('How to improve my resume?')">Resume tips</button>
      </div>
      <div id="bexi-irow">
        <input id="bexi-inp" placeholder="Ask anything about your career..." onkeydown="if(event.key==='Enter')bexiSend()"/>
        <button id="bexi-snd" onclick="bexiSend()">&#10148;</button>
      </div>
    </div>
  `;

  document.addEventListener('DOMContentLoaded', function () {
    var wrap = document.createElement('div');
    wrap.id = 'bexi-root';
    wrap.innerHTML = HTML;
    document.body.appendChild(wrap);
  });

  window.bexiToggle = function () {
    var w = document.getElementById('bexi-win');
    if (!w) return;
    var isOpen = w.classList.contains('bx-open');
    w.classList.toggle('bx-open');
    if (!isOpen) {
      var inp = document.getElementById('bexi-inp');
      if (inp) setTimeout(function () { inp.focus(); }, 100);
    }
  };

  window.bexiSend = function () {
    var inp = document.getElementById('bexi-inp');
    if (!inp) return;
    var q = inp.value.trim();
    if (!q) return;
    inp.value = '';
    window.bexiAsk(q);
  };

  window.bexiAsk = function (q) {
    bexiAddMsg(q, 'user');
    var msgs = document.getElementById('bexi-msgs');
    var typing = document.createElement('div');
    typing.className = 'bx-typing'; typing.id = 'bx-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    if (msgs) { msgs.appendChild(typing); msgs.scrollTop = msgs.scrollHeight; }
    setTimeout(function () {
      var t = document.getElementById('bx-typing');
      if (t) t.remove();
      bexiAddMsg(getResponse(q), 'bot');
    }, 900);
  };

  function bexiAddMsg(text, type) {
    var msgs = document.getElementById('bexi-msgs');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'bx-msg ' + type;
    div.innerHTML = text.replace(/\n/g, '<br>').replace(/Rs\./g, '&#8377;');
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }
})();
