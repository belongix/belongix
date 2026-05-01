/* Belongix Bexi AI — shared component v2.0 */
(function () {
  var SB_URL = 'https://efhcfuaxgbzuqlmhlsxc.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGNmdWF4Z2J6dXFsbWhsc3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDg1NzgsImV4cCI6MjA5MjcyNDU3OH0.vpFvBPnKkrMMONXo9z6FemJ2qIlRChRloQYRB0LMdjY';

  var RESPONSES = {
    salary: 'Fresher salaries in India (2026):\n• Software Engineer: ₹3.5–8 LPA\n• Data Analyst: ₹3–6 LPA\n• Full Stack Dev: ₹4–10 LPA\n• DevOps Engineer: ₹5–12 LPA\n\nTop startups pay 20-40% above market. Always negotiate — most offers have 10-20% flexibility!',
    interview: 'Top interview tips:\n1. DSA — LeetCode 75 is a solid foundation\n2. System Design — ByteByteGo on YouTube\n3. Behavioral — use STAR method\n4. Research the company deeply before each round\n5. Mock interviews on Pramp (100% free)\n\nWant tips for a specific company?',
    skills: 'Most in-demand skills in 2026:\n🔥 Agentic AI & LangChain\n☁️ Cloud (AWS / Azure / GCP)\n🔄 Data Engineering (dbt, Kafka, Spark)\n💻 Full Stack (React + Node.js)\n🔒 Cybersecurity\n📊 SQL & Analytics\n\nAll available free in Belongix Upskilling Hub!',
    career: 'Career path guidance:\n• Students → internships, DSA, projects\n• Freshers → first job roadmap, resume tips\n• Professionals → salary negotiation, promotions\n• Changers → reskilling paths, mentor matching\n\nSign up on Belongix for personalized roadmap!',
    mentor: 'Our mentor network connects you with verified professionals for:\n• Resume reviews\n• Mock interview sessions\n• Salary negotiation coaching\n• Career switch guidance\n\nVisit belongix.in/mentors.html to find or become a mentor!',
    resume: 'Resume tips for Indian market:\n1. Keep it 1 page for < 5 years experience\n2. Lead with impact numbers (increased X by Y%)\n3. Use ATS-friendly formatting — no tables/images\n4. Match keywords from the job description\n5. LinkedIn must match your resume exactly\n\nNeed a detailed review? Book a mentor session!',
    default: 'Great question! I can help with:\n• Salary benchmarks for your role\n• Interview preparation tips\n• Skills in demand for 2026\n• Career path guidance\n• Resume & LinkedIn tips\n• Finding the right mentor\n\nWhat would you like to know more about?'
  };

  function getResponse(q) {
    var l = q.toLowerCase();
    if (l.includes('salary') || l.includes('pay') || l.includes('lpa') || l.includes('ctc') || l.includes('fresher') || l.includes('hike')) return RESPONSES.salary;
    if (l.includes('interview') || l.includes('prep') || l.includes('dsa') || l.includes('leetcode') || l.includes('crack')) return RESPONSES.interview;
    if (l.includes('skill') || l.includes('learn') || l.includes('course') || l.includes('demand') || l.includes('trend')) return RESPONSES.skills;
    if (l.includes('career') || l.includes('path') || l.includes('switch') || l.includes('change') || l.includes('growth')) return RESPONSES.career;
    if (l.includes('mentor') || l.includes('guide') || l.includes('coach') || l.includes('session')) return RESPONSES.mentor;
    if (l.includes('resume') || l.includes('cv') || l.includes('linkedin') || l.includes('profile')) return RESPONSES.resume;
    return RESPONSES.default;
  }

  var CSS = `
    #bexi-fab{position:fixed;bottom:24px;right:24px;z-index:9998;display:flex;align-items:center;gap:8px;background:#1447E6;color:#fff;border:none;border-radius:28px;padding:11px 18px 11px 13px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'Figtree','DM Sans',sans-serif;box-shadow:0 4px 20px rgba(20,71,230,.4);transition:.2s;letter-spacing:-.1px}
    #bexi-fab:hover{background:#0f3bc4;transform:translateY(-2px);box-shadow:0 8px 28px rgba(20,71,230,.5)}
    #bexi-fab .bx-dot{width:8px;height:8px;border-radius:50%;background:#22C55E;flex-shrink:0;animation:bxPulse 2s infinite}
    @keyframes bxPulse{0%,100%{opacity:1}50%{opacity:.5}}
    #bexi-win{position:fixed;bottom:80px;right:24px;width:360px;max-height:520px;background:#fff;border-radius:18px;border:1px solid #E5E7EB;box-shadow:0 20px 60px rgba(0,0,0,.18);z-index:9997;display:none;flex-direction:column;overflow:hidden;font-family:'Figtree','DM Sans',sans-serif}
    #bexi-win.bx-open{display:flex}
    #bexi-head{background:linear-gradient(135deg,#1447E6,#0EA5E9);padding:16px;display:flex;align-items:center;gap:12px}
    #bexi-hav{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:2px solid rgba(255,255,255,.3)}
    #bexi-hinfo{flex:1}
    #bexi-hname{font-size:14px;font-weight:700;color:#fff;letter-spacing:-.2px}
    #bexi-hsub{font-size:11px;color:rgba(255,255,255,.75);margin-top:1px;display:flex;align-items:center;gap:4px}
    #bexi-hsub::before{content:'';width:6px;height:6px;border-radius:50%;background:#22C55E;display:inline-block}
    #bexi-x{background:rgba(255,255,255,.15);border:none;color:#fff;font-size:16px;cursor:pointer;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:.15s;flex-shrink:0}
    #bexi-x:hover{background:rgba(255,255,255,.25)}
    #bexi-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}
    #bexi-msgs::-webkit-scrollbar{width:4px}
    #bexi-msgs::-webkit-scrollbar-thumb{background:#E5E7EB;border-radius:4px}
    .bx-msg{max-width:88%;padding:10px 13px;border-radius:14px;font-size:13px;line-height:1.6;animation:bxFadeIn .2s ease}
    @keyframes bxFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .bx-msg.bot{background:#F3F4F6;color:#111827;align-self:flex-start;border-radius:4px 14px 14px 14px}
    .bx-msg.user{background:#1447E6;color:#fff;align-self:flex-end;border-radius:14px 4px 14px 14px}
    .bx-typing{display:flex;gap:4px;align-items:center;padding:10px 13px;background:#F3F4F6;border-radius:4px 14px 14px 14px;align-self:flex-start}
    .bx-typing span{width:6px;height:6px;border-radius:50%;background:#9CA3AF;animation:bxTyping 1.2s infinite}
    .bx-typing span:nth-child(2){animation-delay:.2s}
    .bx-typing span:nth-child(3){animation-delay:.4s}
    @keyframes bxTyping{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
    #bexi-chips{padding:10px 16px;display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid #F3F4F6;background:#FAFAFA}
    .bx-chip{background:#EEF3FF;color:#1447E6;border:1px solid #C7D7FD;border-radius:20px;padding:5px 12px;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;white-space:nowrap;transition:.15s}
    .bx-chip:hover{background:#1447E6;color:#fff;border-color:#1447E6}
    #bexi-irow{padding:12px 16px;border-top:1px solid #E5E7EB;display:flex;gap:8px;background:#fff}
    #bexi-inp{flex:1;border:1.5px solid #E5E7EB;border-radius:12px;padding:9px 13px;font-size:13px;font-family:inherit;outline:none;color:#111827;transition:.15s;background:#FAFAFA}
    #bexi-inp:focus{border-color:#1447E6;background:#fff;box-shadow:0 0 0 3px rgba(20,71,230,.08)}
    #bexi-snd{background:#1447E6;border:none;border-radius:10px;padding:9px 13px;color:#fff;cursor:pointer;font-size:16px;transition:.15s;flex-shrink:0}
    #bexi-snd:hover{background:#0f3bc4}
  `;

  var HTML = `
    <style>${CSS}</style>
    <button id="bexi-fab" onclick="bexiToggle()">
      <div class="bx-dot"></div>
      <span style="font-size:17px">🤖</span>
      Chat with Bexi AI
    </button>
    <div id="bexi-win">
      <div id="bexi-head">
        <div id="bexi-hav">🤖</div>
        <div id="bexi-hinfo">
          <div id="bexi-hname">Bexi AI</div>
          <div id="bexi-hsub">Career Guide · Online</div>
        </div>
        <button id="bexi-x" onclick="bexiToggle()">✕</button>
      </div>
      <div id="bexi-msgs">
        <div class="bx-msg bot">Hi! I'm Bexi, your Belongix career guide 👋<br><br>I can help with salary benchmarks, interview tips, skills to learn, career paths and more. What would you like to know?</div>
      </div>
      <div id="bexi-chips">
        <button class="bx-chip" onclick="bexiAsk('What salary should a fresher expect?')">Fresher salary</button>
        <button class="bx-chip" onclick="bexiAsk('How to prepare for tech interviews?')">Interview prep</button>
        <button class="bx-chip" onclick="bexiAsk('Which skills are in demand in 2026?')">Top skills 2026</button>
        <button class="bx-chip" onclick="bexiAsk('How do I improve my resume?')">Resume tips</button>
      </div>
      <div id="bexi-irow">
        <input id="bexi-inp" placeholder="Ask anything about your career..." onkeydown="if(event.key==='Enter')bexiSend()"/>
        <button id="bexi-snd" onclick="bexiSend()">➤</button>
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
    // Show typing indicator
    var msgs = document.getElementById('bexi-msgs');
    var typing = document.createElement('div');
    typing.className = 'bx-typing';
    typing.id = 'bx-typing';
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
    div.innerHTML = text.replace(/\n/g, '<br>').replace(/•/g, '&bull;');
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }
})();
