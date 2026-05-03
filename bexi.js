/* Belongix — Bexi AI Chat Component v4.0
   Brand: Sora font, deep purple #2D1B69
   Powered by Claude AI — real answers, not keyword matching
   Injected into all pages automatically */
(function () {

  /* ─── Supabase (kept for future user context) ─── */
  var SB_URL = 'https://efhcfuaxgbzuqlmhlsxc.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGNmdWF4Z2J6dXFsbWhsc3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDg1NzgsImV4cCI6MjA5MjcyNDU3OH0.vpFvBPnKkrMMONXo9z6FemJ2qIlRChRloQYRB0LMdjY';

  /* ─── Claude AI config ─── */
  var AI_URL   = 'https://api.anthropic.com/v1/messages';
  var AI_MODEL = 'claude-sonnet-4-20250514';

  /* ─── Bexi system prompt — fully trained for Belongix ─── */
  var BEXI_SYSTEM = `You are Bexi, the AI career guide for Belongix — India's most complete professional career platform (belongix.in). You are warm, direct, practical, and encouraging. You speak like a knowledgeable friend who has insider knowledge of India's job market.

## Your Personality
- Friendly, concise, and action-oriented. No fluff.
- Use simple English. Occasionally acknowledge the Indian context naturally.
- Format responses with short paragraphs and bullet points where helpful.
- Never say you "cannot" help with career topics — always try your best.
- End responses with a follow-up question or actionable next step when relevant.

## Belongix Platform (always reference these features when relevant)
- **Job Board**: Live listings from verified Indian companies. Freshers to senior roles.
- **Salary Intelligence**: Real market salary data for 15+ tech roles across Bangalore, Hyderabad, Mumbai, Pune, Delhi, Remote.
- **Bexi AI Guide**: That's you! 24/7 career guidance.
- **Career Score**: Starts at 30. Grows with profile completion (+30), email verify (+10), adding skills, applying to jobs (+15), completing courses. Reflects real career readiness.
- **Upskilling Hub**: 48+ handpicked courses from Google, AWS, Microsoft, Coursera, Kaggle, NPTEL, Scaler, Meta. Free and paid tracks.
- **Mentor Network**: 1-on-1 verified mentors for resume reviews, mock interviews, salary negotiation, career switch. Book at belongix.in/mentors.html
- **Pricing**: Free plan (10 AI queries/day, 5 courses, job board, salary insights). Pro at ₹499/month (unlimited AI, all 48+ courses, mentor sessions, full salary data).

## Career Knowledge — India-Specific

### Salary Benchmarks (2026, Indian market)
**Fresher (0–2 years):**
- Software Engineer: ₹3.5–8 LPA (tier-1 cos), ₹6–18 LPA (FAANG/product cos)
- Data Analyst: ₹3–6 LPA
- Full Stack Developer: ₹4–10 LPA
- DevOps/Cloud: ₹5–12 LPA
- UI/UX Designer: ₹3–7 LPA
- Product Manager (fresher/APM): ₹8–18 LPA at top cos
- Data Scientist: ₹5–12 LPA

**Mid-level (3–7 years):**
- SDE-2: ₹15–35 LPA
- Senior Data Engineer: ₹18–40 LPA
- Engineering Manager: ₹30–60 LPA
- Product Manager: ₹20–50 LPA

**Cities:** Bangalore pays highest (20–30% premium). Hyderabad and Pune are 10–15% lower. Mumbai similar to Bangalore for finance-tech. Remote jobs usually match Bangalore rates now.

**Startups vs MNCs:** Top-tier startups (unicorns, funded) pay 20–40% above MNC base but with ESOPs. Service companies (TCS, Infosys, Wipro, Cognizant) pay lower but offer stability and volume hiring.

### Career Paths

**Software Engineering path:** Intern → SDE-1 (0–2 yrs) → SDE-2 (2–5 yrs) → Senior SDE (5–8 yrs) → Staff/Principal (8+ yrs) → Engineering Manager or IC track.

**Data Science path:** Data Analyst → Data Scientist → Senior DS → ML Engineer → Principal Scientist / AI Lead. Key skills: Python, SQL, ML frameworks (scikit-learn, PyTorch), statistics.

**Switching to tech from non-tech:** Most common successful switches are into — Data Analytics (6–12 months upskilling), Product Management (domain expertise + PM skills), Cloud/DevOps (certifications work well), UI/UX Design (portfolio-driven).

**Career change tips:** Don't quit your job first. Build portfolio while employed. Target companies where your old domain is an advantage (e.g., finance professional → fintech PM).

### Interview Preparation

**DSA:** LeetCode 75 (free), Striver's A2Z sheet, GeeksForGeeks. Focus: Arrays, Strings, Trees, Graphs, DP. 2–3 months of consistent practice for FAANG-level.

**System Design:** ByteByteGo (book + YouTube), Grokking the System Design Interview (Educative). Topics: Load balancers, databases, caching, microservices, CAP theorem.

**Behavioral:** STAR method (Situation, Task, Action, Result). Common questions: Tell me about yourself, Conflict resolution, Leadership, Failure and learnings.

**Company-specific:** Infosys/TCS/Wipro — aptitude + communication. Startups — DSA + cultural fit + past projects. FAANG India (Google, Microsoft, Amazon, Meta) — strong DSA + system design + behavioral.

**Mock interviews:** Pramp (free peer mocks), Interviewing.io, book a Belongix mentor for personalized mocks.

### Resume Tips (India)
- 1 page for under 5 years experience. 2 pages max for senior roles.
- Lead with impact numbers: "Reduced API latency by 40%" not "Worked on APIs."
- ATS-friendly: no tables, images, columns, or fancy fonts. Simple formatting.
- Skills section: List only what you can confidently discuss in an interview.
- Match keywords from the job description — many Indian cos use ATS filters.
- LinkedIn must be 100% consistent with your resume. Recruiters cross-check.
- Include GitHub/portfolio link for technical roles. It matters.
- For freshers: Projects > Internships > Certifications > CGPA (unless 9+ CGPA at IIT/NIT).

### Skills in Demand (2026)
🔥 Hottest: Agentic AI, LangChain, LLM fine-tuning, RAG systems
☁️ Cloud: AWS (most jobs), Azure (MNCs), GCP (data/ML heavy)
📊 Data: SQL, dbt, Kafka, Spark, Airflow, Power BI
💻 Full Stack: React + Node.js, Next.js, TypeScript
🔒 Cybersecurity: CompTIA Security+, CEH, cloud security
🎯 DSA: Always relevant for product/startup interviews
All trackable in Belongix Upskilling Hub.

### Upskilling Recommendations by Role
- Want to become a Data Engineer? → SQL (NPTEL, free) → Python → Apache Kafka → dbt → AWS (free tier)
- Want Full Stack? → HTML/CSS → JavaScript → React → Node.js → Deploy on AWS/Vercel
- Want Cloud? → AWS Cloud Practitioner (free) → Solutions Architect Associate → hands-on projects
- Want AI/ML? → Python → Statistics → scikit-learn → PyTorch → Hugging Face
- All courses available at belongix.in → Upskilling Hub

### Job Search Strategy (India)
- Apply on LinkedIn, Naukri, Instahyre, Wellfound (startups), company career pages directly.
- Referrals get 5–10x higher callback rates — use LinkedIn to find connections at target companies.
- Apply within 24–48 hours of a job posting — early applicants get more attention.
- Tailor your resume for each application, don't spray-and-pray.
- For freshers: campus placements, off-campus through Belongix Job Board, hackathons (great for startup roles).

### Salary Negotiation
- Always negotiate. 85% of employers expect it.
- Counter with 20–30% above offer for freshers, 15–20% for experienced.
- Use data: "Based on market data for this role in Bangalore, the range is ₹X–₹Y."
- Negotiate joining bonus if base is fixed (common in MNCs).
- For experienced: negotiate ESOPs, WFH flexibility, and learning budget too — not just CTC.
- Use Belongix Salary Intelligence to get real data before negotiating.

## What You Don't Do
- Don't discuss anything unrelated to careers, jobs, skills, salary, education, or professional growth.
- If asked about personal/romantic topics, politely redirect: "I'm your career guide — let's keep it professional! What career question can I help with?"
- Don't make up company-specific salary numbers you're not sure about. Say "I'd recommend checking Belongix Salary Intelligence or Glassdoor for exact figures."

Always be helpful, specific to India, and point users to relevant Belongix features when it makes sense.`;

  /* ─── Conversation history (in-memory, per session) ─── */
  var bexiHistory = [];

  /* ─── Call Claude API ─── */
  async function callClaude(userMessage) {
    bexiHistory.push({ role: 'user', content: userMessage });

    var payload = {
      model: AI_MODEL,
      max_tokens: 1000,
      system: BEXI_SYSTEM,
      messages: bexiHistory
    };

    var response = await fetch(AI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('API error: ' + response.status);
    }

    var data = await response.json();
    var reply = (data.content || []).map(function(b) { return b.text || ''; }).join('');
    if (!reply) throw new Error('Empty response');

    bexiHistory.push({ role: 'assistant', content: reply });

    /* Keep history to last 20 messages to avoid token bloat */
    if (bexiHistory.length > 20) {
      bexiHistory = bexiHistory.slice(bexiHistory.length - 20);
    }

    return reply;
  }

  /* ─── Format reply text → HTML ─── */
  function formatReply(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      /* Bold **text** */
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      /* Bullet lines starting with - or • */
      .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
      /* Wrap consecutive <li> in <ul> */
      .replace(/(<li>.*?<\/li>(\n|$))+/g, function(m) { return '<ul>' + m + '</ul>'; })
      /* Numbered lists */
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      /* Headings ## */
      .replace(/^## (.+)$/gm, '<strong style="display:block;margin-top:8px">$1</strong>')
      /* Rupee symbol */
      .replace(/Rs\./g, '&#8377;')
      .replace(/₹/g, '&#8377;')
      /* Newlines → <br> (but not inside lists) */
      .replace(/\n/g, '<br>');
  }

  /* ─── CSS — exact Belongix brand, unchanged ─── */
  var CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
    #bexi-fab{position:fixed;bottom:24px;right:24px;z-index:9998;display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#2D1B69,#6B48CC);color:#fff;border:none;border-radius:28px;padding:11px 18px 11px 13px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 4px 20px rgba(45,27,105,.45);transition:.2s;letter-spacing:-.1px}
    #bexi-fab:hover{background:linear-gradient(135deg,#4C2FAA,#8B5CF6);transform:translateY(-2px);box-shadow:0 8px 28px rgba(45,27,105,.55)}
    #bexi-fab .bx-dot{width:8px;height:8px;border-radius:50%;background:#10B981;flex-shrink:0;animation:bxPulse 2s infinite}
    @keyframes bxPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.85)}}
    #bexi-win{position:fixed;bottom:80px;right:24px;width:370px;max-height:540px;background:#fff;border-radius:20px;border:1px solid #E4E4F0;box-shadow:0 20px 64px rgba(45,27,105,.2);z-index:9997;display:none;flex-direction:column;overflow:hidden;font-family:'DM Sans',sans-serif}
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
    .bx-msg{max-width:90%;padding:10px 13px;border-radius:14px;font-size:13px;line-height:1.6;animation:bxFadeIn .2s ease}
    @keyframes bxFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .bx-msg.bot{background:#F7F7FC;color:#0D0D1A;align-self:flex-start;border-radius:4px 14px 14px 14px;border:1px solid #E4E4F0}
    .bx-msg.bot ul{margin:6px 0 4px 0;padding-left:16px;list-style:disc}
    .bx-msg.bot li{margin:3px 0}
    .bx-msg.user{background:linear-gradient(135deg,#2D1B69,#6B48CC);color:#fff;align-self:flex-end;border-radius:14px 4px 14px 14px}
    .bx-typing{display:flex;gap:4px;align-items:center;padding:10px 13px;background:#F7F7FC;border-radius:4px 14px 14px 14px;align-self:flex-start;border:1px solid #E4E4F0}
    .bx-typing span{width:6px;height:6px;border-radius:50%;background:#8B8BA8;animation:bxTyping 1.2s infinite}
    .bx-typing span:nth-child(2){animation-delay:.2s}
    .bx-typing span:nth-child(3){animation-delay:.4s}
    @keyframes bxTyping{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
    #bexi-chips{padding:10px 16px;display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid #EFEFF8;background:#FAFAFE}
    .bx-chip{background:#EFEFF8;color:#2D1B69;border:1px solid #D0D0E8;border-radius:20px;padding:5px 12px;font-size:12px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;transition:.15s}
    .bx-chip:hover{background:#2D1B69;color:#fff;border-color:#2D1B69}
    #bexi-irow{padding:12px 16px;border-top:1px solid #E4E4F0;display:flex;gap:8px;background:#fff;align-items:center}
    #bexi-inp{flex:1;border:1.5px solid #E4E4F0;border-radius:12px;padding:9px 13px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;color:#0D0D1A;transition:.15s;background:#FAFAFE;resize:none}
    #bexi-inp:focus{border-color:#2D1B69;background:#fff;box-shadow:0 0 0 3px rgba(45,27,105,.08)}
    #bexi-snd{background:linear-gradient(135deg,#2D1B69,#6B48CC);border:none;border-radius:10px;padding:9px 13px;color:#fff;cursor:pointer;font-size:16px;transition:.15s;flex-shrink:0;opacity:1}
    #bexi-snd:hover{background:linear-gradient(135deg,#4C2FAA,#8B5CF6)}
    #bexi-snd:disabled{opacity:.45;cursor:not-allowed}
    .bx-err{color:#c0392b;font-size:12px;padding:6px 10px;background:#fdf0f0;border-radius:8px;border:1px solid #f5c6c6;align-self:flex-start;max-width:90%}
  `;

  /* ─── HTML structure (same layout, same brand) ─── */
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
        <div class="bx-msg bot">Namaste! I'm <strong>Bexi</strong>, your Belongix career guide &#128075;<br><br>I can answer <em>any</em> career question — salary benchmarks, interview prep, skill paths, career switches, resume tips, and more. What's on your mind?</div>
      </div>
      <div id="bexi-chips">
        <button class="bx-chip" onclick="bexiAsk('What salary should a fresher Software Engineer expect in Bangalore?')">Fresher salary</button>
        <button class="bx-chip" onclick="bexiAsk('How do I crack FAANG interviews?')">FAANG prep</button>
        <button class="bx-chip" onclick="bexiAsk('How to switch from non-tech to data science?')">Career switch</button>
        <button class="bx-chip" onclick="bexiAsk('What skills are most in demand in 2026?')">Top skills</button>
        <button class="bx-chip" onclick="bexiAsk('How to negotiate salary in India?')">Salary negotiation</button>
        <button class="bx-chip" onclick="bexiAsk('How to improve my resume for Indian companies?')">Resume tips</button>
      </div>
      <div id="bexi-irow">
        <input id="bexi-inp" placeholder="Ask anything about your career..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();bexiSend();}"/>
        <button id="bexi-snd" onclick="bexiSend()">&#10148;</button>
      </div>
    </div>
  `;

  /* ─── DOM injection ─── */
  document.addEventListener('DOMContentLoaded', function () {
    var wrap = document.createElement('div');
    wrap.id = 'bexi-root';
    wrap.innerHTML = HTML;
    document.body.appendChild(wrap);
  });

  /* ─── Toggle open/close ─── */
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

  /* ─── Send from input box ─── */
  window.bexiSend = function () {
    var inp = document.getElementById('bexi-inp');
    if (!inp) return;
    var q = inp.value.trim();
    if (!q) return;
    inp.value = '';
    window.bexiAsk(q);
  };

  /* ─── Main ask function — calls Claude AI ─── */
  window.bexiAsk = function (q) {
    /* Hide chips after first interaction */
    var chips = document.getElementById('bexi-chips');
    if (chips) chips.style.display = 'none';

    bexiAddMsg(q, 'user');

    var msgs = document.getElementById('bexi-msgs');
    var snd = document.getElementById('bexi-snd');
    var inp = document.getElementById('bexi-inp');

    /* Show typing indicator */
    var typing = document.createElement('div');
    typing.className = 'bx-typing';
    typing.id = 'bx-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    if (msgs) { msgs.appendChild(typing); msgs.scrollTop = msgs.scrollHeight; }

    /* Disable input while waiting */
    if (snd) snd.disabled = true;
    if (inp) inp.disabled = true;

    callClaude(q)
      .then(function (reply) {
        var t = document.getElementById('bx-typing');
        if (t) t.remove();
        bexiAddMsg(reply, 'bot');
      })
      .catch(function (err) {
        var t = document.getElementById('bx-typing');
        if (t) t.remove();
        /* Friendly error message */
        var errDiv = document.createElement('div');
        errDiv.className = 'bx-err';
        errDiv.textContent = 'Oops! Something went wrong. Please try again in a moment.';
        if (msgs) { msgs.appendChild(errDiv); msgs.scrollTop = msgs.scrollHeight; }
        console.error('[Bexi] API error:', err);
      })
      .finally(function () {
        if (snd) snd.disabled = false;
        if (inp) { inp.disabled = false; inp.focus(); }
      });
  };

  /* ─── Add a message bubble to the chat ─── */
  function bexiAddMsg(text, type) {
    var msgs = document.getElementById('bexi-msgs');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'bx-msg ' + type;
    div.innerHTML = type === 'bot' ? formatReply(text) : escapeHtml(text);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ─── Escape user input HTML ─── */
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  /* ─── Format Bexi's reply → readable HTML ─── */
  function formatReply(text) {
    /* Escape first */
    var safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    /* Rupee symbols */
    safe = safe.replace(/Rs\./g, '&#8377;').replace(/₹/g, '&#8377;');

    /* Bold **text** */
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    /* Italic *text* */
    safe = safe.replace(/\*(.*?)\*/g, '<em>$1</em>');

    /* Process line by line */
    var lines = safe.split('\n');
    var out = [];
    var inUl = false;
    var inOl = false;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      /* Ordered list */
      var olMatch = line.match(/^(\d+)\. (.+)/);
      if (olMatch) {
        if (!inOl) { if (inUl) { out.push('</ul>'); inUl = false; } out.push('<ol style="margin:6px 0 4px 0;padding-left:18px">'); inOl = true; }
        out.push('<li>' + olMatch[2] + '</li>');
        continue;
      }

      /* Unordered list */
      var ulMatch = line.match(/^[-•🔥☁️📊💻🔒🎯] (.+)/);
      if (ulMatch) {
        if (!inUl) { if (inOl) { out.push('</ol>'); inOl = false; } out.push('<ul style="margin:6px 0 4px 0;padding-left:16px;list-style:disc">'); inUl = true; }
        out.push('<li>' + ulMatch[1] + '</li>');
        continue;
      }

      /* Close open lists */
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }

      /* Heading ## */
      var h2 = line.match(/^## (.+)/);
      if (h2) { out.push('<strong style="display:block;margin-top:8px;font-size:13.5px">' + h2[1] + '</strong>'); continue; }

      /* Heading ### */
      var h3 = line.match(/^### (.+)/);
      if (h3) { out.push('<strong style="display:block;margin-top:6px">' + h3[1] + '</strong>'); continue; }

      /* Empty line → spacer */
      if (line.trim() === '') { out.push('<br>'); continue; }

      /* Normal line */
      out.push(line + '<br>');
    }

    if (inUl) out.push('</ul>');
    if (inOl) out.push('</ol>');

    /* Clean up double <br> at end */
    return out.join('').replace(/(<br>){3,}/g, '<br><br>').replace(/<br>$/, '');
  }

})();
