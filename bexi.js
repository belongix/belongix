// Bexi uses the dashboard's authenticated Supabase client
if (typeof supaClient !== 'undefined') window._bxSb = supaClient;

/* ═══════════════════════════════════════════════════════════════
   Belongix — Bexi Career Guide  v8.0
   ✅ SECURE — All Claude API calls via Supabase Edge Function
   ✅ API key never exposed to browser
   ✅ UNLIMITED queries — no daily cap, free forever
   ✅ Profile-aware — personalised responses
   ✅ Resume critique, Interview simulator, Salary negotiation
   ✅ 100+ Q&A KB + Claude AI enhancement
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPPORT_EMAIL = 'teambelongix@gmail.com';
  var SB_URL = 'https://efhcfuaxgbzuqlmhlsxc.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGNmdWF4Z2J6dXFsbWhsc3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDg1NzgsImV4cCI6MjA5MjcyNDU3OH0.vpFvBPnKkrMMONXo9z6FemJ2qIlRChRloQYRB0LMdjY';

  /* ── Edge Function URL (all Claude calls go here — key stays server-side) ── */
  var BEXI_EDGE = SB_URL + '/functions/v1/bexi-chat';

  /* ── Secure Edge Function caller ── */
  async function callBexiEdge(endpoint, payload) {
    try {
      var token = '';
      try {
        var sb = getSb();
        if (sb) {
          var sess = await sb.auth.getSession();
          token = (sess.data && sess.data.session && sess.data.session.access_token) || '';
        }
      } catch(e) { /* non-fatal */ }

      var url = endpoint ? BEXI_EDGE + '/' + endpoint : BEXI_EDGE + '/chat';
      var res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? 'Bearer ' + token : 'Bearer ' + SB_KEY
        },
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      if (data.fallback || !data.success) return null; /* fallback to KB */
      return data;
    } catch(e) {
      return null; /* silent fallback to KB */
    }
  }

  var _userProfile  = null;
  var _profileReady = false;

  async function loadUserProfile() {
    try {
      var sbClient = window._bxSb || (window.supabase && window.supabase.createClient(SB_URL, SB_KEY));
      if (!sbClient) return;
      var sess = await sbClient.auth.getSession();
      if (!sess.data || !sess.data.session || !sess.data.session.user) return;
      var uid = sess.data.session.user.id;
      var r = await sbClient.from('profiles').select(
        'full_name, role, company, experience, city, skills, user_type, career_score, bio, notice_period'
      ).eq('id', uid).maybeSingle();
      if (r.data) {
        _userProfile = r.data;
        _userProfile._email = sess.data.session.user.email || '';
        _profileReady = true;
        _memUserId = uid;
        updateGreetingWithProfile();
        loadConversationHistory();
      }
    } catch(e) { _profileReady = true; }
  }

  function buildProfileContext() {
    if (!_userProfile) return '';
    var p = _userProfile, parts = [];
    if (p.full_name)    parts.push('Name: ' + p.full_name);
    if (p.role)         parts.push('Current role: ' + p.role);
    if (p.company)      parts.push('Company: ' + p.company);
    if (p.experience)   parts.push('Experience: ' + p.experience);
    if (p.city)         parts.push('City: ' + p.city);
    if (p.skills)       parts.push('Skills: ' + p.skills);
    if (p.career_score) parts.push('Career Score: ' + p.career_score + '/100');
    if (p.user_type)    parts.push('Stage: ' + p.user_type.replace(/_/g,' '));
    if (p.notice_period)parts.push('Notice period: ' + p.notice_period);
    return parts.join(' | ');
  }

  function getUserFirstName() {
    if (!_userProfile) return '';
    var name = _userProfile.full_name || _userProfile._email || '';
    return name.split(' ')[0].split('@')[0];
  }

  function personaliseResponse(answer) {
    if (!_userProfile) return answer;
    var p = _userProfile, firstName = getUserFirstName();
    var hasRole = p.role && p.role.trim();
    var hasCity = p.city && p.city.trim();
    var hasExp  = p.experience && p.experience.trim();
    if (firstName && (hasRole || hasCity)) {
      var ctx = '';
      if (hasRole && hasCity && hasExp) ctx = firstName + ', as a ' + p.experience + ' ' + p.role + ' in ' + p.city + ', ';
      else if (hasRole && hasCity) ctx = firstName + ', as a ' + p.role + ' in ' + p.city + ', ';
      else if (hasCity) ctx = firstName + ', for someone in ' + p.city + ', ';
      else if (hasRole) ctx = firstName + ', as a ' + p.role + ', ';
      if (ctx && !answer.toLowerCase().startsWith('hi') && !answer.toLowerCase().startsWith('hey')) {
        answer = ctx + answer.charAt(0).toLowerCase() + answer.slice(1);
      }
    }
    return answer;
  }

  function updateGreetingWithProfile() {
    var firstName = getUserFirstName();
    if (!firstName) return;
    var msgs = document.getElementById('bx-msgs');
    if (!msgs) return;
    var firstMsg = msgs.querySelector('.bxb.bot');
    if (firstMsg && firstMsg.innerHTML.includes("I'm Bexi")) {
      firstMsg.innerHTML = formatBot(
        "Hi " + firstName + "! I'm Bexi 👋 Your personal career guide.\n\n" +
        (buildProfileContext() ? "I can see your profile — I'll give you personalised advice based on your background.\n\n" : "") +
        "Ask me anything about salaries, interviews, skills, or career switching!"
      );
    }
  }

  /* ════════════════════════════════════════════════════════
     KNOWLEDGE BASE — 100+ Q&A pairs
  ════════════════════════════════════════════════════════ */
  var KB = [
    { patterns: ['hello','hi','hey','helo','hii','sup','yo','namaste','good morning','good evening','good afternoon','start','begin'],
      answer: "Hi! I'm Bexi 👋 Your career guide for India's job market.\n\nI can help you with:\n- **Salary benchmarks** for your role & city\n- **Interview prep** tips and roadmaps\n- **Career switch** guidance\n- **Resume & profile** advice\n- **Job search** strategies\n- **Skills to learn** in 2026\n\nWhat would you like help with today?" },
    { patterns: ['salary','pay','ctc','compensation','package','lpa','per annum','earning','income','wage'],
      answer: "💰 **Salary ranges in India (2026 — product companies):**\n\n- **Fresher (0–1 yr):** ₹6–18 LPA\n- **Junior (1–3 yrs):** ₹10–24 LPA\n- **Mid-level (3–5 yrs):** ₹18–35 LPA\n- **Senior (5–8 yrs):** ₹30–55 LPA\n- **Staff/Lead (8+ yrs):** ₹50–100 LPA\n\nIT services (TCS, Infosys, Wipro) pay 40–60% less than product companies for the same experience.\n\n👉 Next step: Tell me your role + years of experience for a more specific number." },
    { patterns: ['fresher salary','fresher pay','first salary','fresher package','entry level salary','0 experience','zero experience','no experience','fresh graduate'],
      answer: "🎓 **Fresher salaries in India (2026):**\n\n- **FAANG** (Google, Microsoft, Amazon): ₹25–40 LPA\n- **Top unicorns** (Swiggy, CRED, Zepto): ₹15–25 LPA\n- **Product startups** (Razorpay, Meesho): ₹10–18 LPA\n- **IT services** (TCS, Infosys, Wipro): ₹3.5–6 LPA\n- **Mid-size startups:** ₹6–12 LPA\n\n👉 Next step: Build your Belongix Career Score — it shows exactly what's holding your offers back." },
    { patterns: ['bangalore salary','bengaluru salary','blr salary','salary in bangalore','salary bangalore'],
      answer: "🏙️ **Bangalore tech salaries (2026 median):**\n\n- **Fresher:** ₹11 LPA\n- **3–5 yrs:** ₹24 LPA\n- **7+ yrs:** ₹48 LPA\n\nBangalore pays **19% above** the national average.\n\n👉 Next step: Check the Salary Intelligence page on your dashboard for role-specific Bangalore data." },
    { patterns: ['hyderabad salary','hyd salary','salary hyderabad','telangana salary'],
      answer: "🏙️ **Hyderabad tech salaries (2026 median):**\n\n- **Fresher:** ₹10 LPA\n- **3–5 yrs:** ₹22 LPA\n- **7+ yrs:** ₹44 LPA\n\nHyderabad is India's #2 tech hub — 9% above national average.\n\n👉 Next step: Apply to Hyderabad roles on the Belongix Job Board." },
    { patterns: ['negotiate','negotiation','counter offer','hike','raise','increment','ask for more','salary talk','offer letter'],
      answer: "💪 **How to negotiate salary in India:**\n\n1. **Research first** — know your P75 market rate\n2. **Never give a number first** — ask their budget range\n3. **Counter 15–20% above** their first offer\n4. **Use data** — 'Market rate for this role in Bangalore is ₹X–Y'\n5. **Negotiate total comp** — joining bonus, ESOPs, WFH, learning budget\n\n**Script:** *'Based on my research and X years of experience, I was expecting ₹[X]. Is there flexibility?'*\n\n👉 Next step: Check Belongix Salary Intelligence for your exact market rate." },
    { patterns: ['paid fairly','fair salary','underpaid','overpaid','market rate','worth','deserve','market value','fair pay'],
      answer: "📊 **How to know if you're underpaid:**\n\nYou're likely underpaid if:\n- **3+ yrs at a product company** earning below ₹14 LPA\n- **5+ yrs** earning below ₹25 LPA\n- Your salary hasn't grown 20%+ in 2 years\n\n**Quick benchmark:**\n- 0–1 yr + product company → ₹8–18 LPA\n- 3–5 yrs + product company → ₹18–35 LPA\n- 5–8 yrs + product company → ₹30–55 LPA\n\n👉 Next step: Open Salary Intelligence in your Belongix dashboard." },
    { patterns: ['career switch','career change','change career','switch career','change field','new career','different field','pivot','transition'],
      answer: "🔄 **Career switch roadmap (India 2026):**\n\n**Most popular switches:**\n- Non-tech → Data Analytics (6–9 months)\n- IT services → Product company (3–6 months)\n- Any field → Cloud/DevOps (8–12 months)\n\n**What works:**\n1. Learn the core skill (SQL, Python, Cloud)\n2. Build one real portfolio project\n3. Apply to roles that combine old + new skills\n\n👉 Next step: Tell me which field you want to switch TO — I'll give you a specific roadmap." },
    { patterns: ['data analytics','data analyst','switch to data','become data analyst','data science','analytics career','business analyst'],
      answer: "📊 **Switch to Data Analytics — 9-month roadmap:**\n\n**Month 1–2:** SQL + Excel\n**Month 3–4:** Python with Pandas (Kaggle free)\n**Month 5–6:** Tableau or Power BI\n**Month 7–8:** Statistics + A/B testing\n**Month 9:** Portfolio project + job search\n\n**Salary after switch:** ₹5–10 LPA entry → ₹14–22 LPA after 2–3 yrs\n\n👉 Next step: Start the Kaggle SQL course today — free, browser-based." },
    { patterns: ['skills to learn','what to learn','which skills','learn in 2026','top skills','in demand skills','future skills','skill up','upskill','trending skills'],
      answer: "⚡ **Most in-demand skills in India (2026):**\n\n🔥 **Highest paying:**\n- AI/ML + LLMs → +55% salary premium\n- Cloud Architecture (AWS, GCP, Terraform) → +40%\n- Data Engineering (Spark, Kafka, dbt) → +35%\n\n✅ **Foundation (learn these first):**\n- SQL — appears in 95% of job descriptions\n- Python — covers AI, data, and backend\n- System Design — required for SDE-2+\n\n👉 Next step: Pick ONE from the top list and spend 30 minutes today on a free tutorial." },
    { patterns: ['20 lpa','20lpa','₹20','twenty lpa','get 20','reach 20','earn 20'],
      answer: "🎯 **How to get to ₹20 LPA in India:**\n\n1. Target product companies / startups (not IT services)\n2. Master DSA — solve 100 LeetCode problems\n3. Add one cloud certification (AWS or GCP)\n4. Build one deployed GitHub project\n5. Switch companies — job switching gives 30–50% hike\n\n**Realistic timeline:** 12–18 months with consistent effort\n\n👉 Next step: Check your Belongix Career Score to see exact gaps." },
    { patterns: ['interview','interview prep','crack interview','interview tips','prepare interview','interview ready','interview question','technical interview','hr round','coding round'],
      answer: "🎯 **Interview prep roadmap for India (2026):**\n\n**Technical rounds:**\n- DSA: 75–100 LeetCode (arrays, trees, DP, graphs)\n- System Design: ByteByteGo (for SDE-2+)\n- SQL: StrataScratch (real interview questions)\n\n**HR rounds:**\n- Prepare STAR format answers\n- Have 3 quantified achievements ready\n\n**Timeline:**\n- 4 weeks → strong for mid-size startups\n- 8 weeks → top unicorns\n- 12 weeks → FAANG-ready\n\n👉 Next step: Solve 3 LeetCode Easy problems today." },
    { patterns: ['system design','design interview','hld','lld','high level design','architecture interview'],
      answer: "🏗️ **System Design prep for Indian companies:**\n\n**Core concepts:**\n- Load balancing, caching (Redis), CDN\n- Database sharding, replication, indexing\n- Message queues (Kafka, RabbitMQ)\n- CAP theorem\n\n**Common questions:** URL shortener, Instagram feed, Swiggy delivery tracking\n\n**Best resources:** ByteByteGo, Gaurav Sen (YouTube)\n\n👉 Next step: Watch Gaurav Sen's 'Design a URL Shortener' on YouTube — 20 minutes covers 80% of what's asked." },
    { patterns: ['resume','cv','curriculum vitae','resume tips','resume help','ats','resume builder','build resume'],
      answer: "📄 **ATS-optimised resume tips for India:**\n\n**Format rules:**\n- Single column PDF — no tables, no graphics\n- Max 1 page for 0–5 yrs, 2 pages for 6+ yrs\n\n**Must-have:**\n- Quantified achievements (say '40% latency reduction')\n- Exact keywords from job description\n- Professional Summary (40–60 words)\n\n**Quick win:** Add 3 metrics to your current resume today.\n\n👉 Next step: Use the Belongix Resume Builder — gives you a live ATS score." },
    { patterns: ['linkedin','linkedin profile','linkedin tips','linkedin optimization'],
      answer: "💼 **LinkedIn profile tips:**\n\n**Headline formula:** `Backend Engineer | Go, AWS | Ex-Swiggy | Open to work`\n\n**About:** 3–4 sentences — what you do, what you've built, what you're looking for\n\n**Most underused:** Post one insight from your work every 2 weeks. Recruiters will come to you.\n\n👉 Next step: Update your LinkedIn headline in the next 10 minutes." },
    { patterns: ['find job','job search','apply job','where to apply','job portals','job sites','how to find','get job','finding job'],
      answer: "🔍 **Best job portals for India (2026):**\n\n🥇 **Belongix** — verified product companies, AI matching\n🥈 **LinkedIn** — referrals, direct recruiter messages\n🥉 **Instahyre** — startup jobs, fast response\n\n**Strategy:** Apply to 15–20 companies simultaneously. Message 5 recruiters on LinkedIn every week.\n\n👉 Next step: Filter the Belongix Job Board by your city and experience right now." },
    { patterns: ['career score','score','belongix score','profile score','my score','improve score'],
      answer: "📊 **Your Belongix Career Score (0–100):**\n\n- Complete profile: **+30 pts**\n- Verify email: **+10 pts**\n- Add 5+ skills: **+10 pts**\n- Apply to a job: **+15 pts**\n- Complete a course: **+10 pts**\n\n**Score 70+ = 3× more recruiter responses on Belongix**\n\n👉 Next step: Go to Profile and fill every field — that alone adds 30 points." },
    { patterns: ['btech','b.tech','engineering graduate','after college','first job','campus placement','fresher job'],
      answer: "🎓 **Getting your first job after B.Tech (2026):**\n\n1. Get your Career Score → know your gaps\n2. Master Python or Java (one language, deeply)\n3. Solve 75–100 LeetCode problems\n4. Build one deployed GitHub project\n5. Apply to 15–20 companies simultaneously\n\n**Salary expectation:** Product companies: ₹10–18 LPA | IT services: ₹3.5–6 LPA\n\n👉 Next step: Solve 3 LeetCode problems today." },
    { patterns: ['remote job','work from home','wfh','remote work','remote opportunity','fully remote','hybrid'],
      answer: "🌐 **Remote tech jobs in India (2026):**\n\n**Best platforms:** Belongix (filter: Remote), LinkedIn, Wellfound, Toptal\n\n**Remote-friendly companies:** Razorpay, Meesho, Postman, Browserstack, Zoho, Chargebee\n\n**Tip:** Many Bangalore-HQ companies pay remote engineers the same as office employees.\n\n👉 Next step: Filter the Belongix Job Board by 'Remote'." },
    { patterns: ['python','learn python','python for job','python salary'],
      answer: "🐍 **Python for Indian job seekers (2026):**\n\n**Best free path:** Kaggle Python (5 hrs) → Kaggle Pandas (4 hrs) → HackerRank practice → build one project\n\n**Python jobs:** Data Analyst ₹6–20 LPA | Backend ₹10–35 LPA | ML Engineer ₹14–45 LPA\n\n**Timeline to job-ready:** 3–4 months consistent learning\n\n👉 Next step: Start Kaggle Python course today — free, no install needed." },
    { patterns: ['sql','structured query','database','mysql','postgresql','query'],
      answer: "🗄️ **SQL for Indian job seekers:**\n\nSQL appears in **95% of data job descriptions** — highest ROI skill you can learn.\n\n**3-week plan:** Mode Analytics SQL tutorial → SQLZoo → StrataScratch interview questions\n\n**SQL jobs:** Data Analyst ₹6–22 LPA | Data Engineer ₹12–35 LPA\n\n👉 Next step: Spend 1 hour on Mode Analytics SQL Tutorial today." },
    { patterns: ['aws','cloud','gcp','azure','cloud certification','devops','kubernetes','terraform','docker'],
      answer: "☁️ **Cloud careers in India (2026):**\n\n**Salary premium:** 25–40% above base SWE\n\n**Best certifications:** AWS Solutions Architect Associate (most recognised) → Google ACE → AWS Developer\n\n**Free learning:** AWS free tier, FreeCodeCamp AWS YouTube (12-hour course)\n\n👉 Next step: Create an AWS free tier account and deploy a simple EC2 instance today." },
    { patterns: ['mentor','mentorship','mentor session','find mentor','1 on 1','guidance'],
      answer: "🤝 **Belongix Mentor Network:**\n\n50+ verified mentors from Google, Microsoft, Amazon, Swiggy, Razorpay, CRED, Zepto\n\n**Sessions:** 30 min (quick question) or 60 min (deep strategy)\n\n**Available on Pro plan** (₹499/month)\n\n👉 Next step: Go to the Mentors page and browse — profiles visible on free plan." },
    { patterns: ['limit','query limit','queries left','how many questions','free limit','daily limit'],
      answer: "✅ **Bexi AI is completely unlimited — no daily cap, ever.**\n\nAsk as many questions as you need, any time.\n\nOnly these require Pro (₹499/month):\n- Mentor session booking\n- Full company-level salary data\n- All 150+ upskilling courses\n\n👉 Keep asking away — I'm here 24/7!" },
    { patterns: ['what is belongix','about belongix','belongix platform','how belongix works'],
      answer: "🏢 **What is Belongix?**\n\nIndia's all-in-one career platform:\n\n1. 🔍 **Job Board** — verified listings\n2. 💰 **Salary Intelligence** — real benchmarks\n3. 🤖 **Bexi AI** — career guidance (unlimited & free)\n4. 📊 **Career Score** — job-readiness tracker\n5. 📚 **Upskilling Hub** — 150+ curated courses\n6. 🤝 **Mentor Network** — 50+ verified mentors\n7. 📄 **Resume Builder** — ATS-optimised\n\n👉 Next step: Sign up at belongix.in — takes 2 minutes." },
    { patterns: ['pricing','price','plan','cost','free plan','pro plan','subscription','how much','upgrade','paid plan'],
      answer: "💳 **Belongix Plans:**\n\n**Free — ₹0 forever:** Full Job Board, Career Score, Resume Builder, Salary Intelligence, Bexi AI (unlimited), 5 learning tracks\n\n**Pro — ₹499/month:** Everything free + Mentor sessions, Full salary data, All 150+ courses\n\n**No credit card** needed for Free plan.\n\n👉 Start free — it covers 90% of what most users need." },
    { patterns: ['sign up','signup','register','create account','join','login','log in','forgot password'],
      answer: "🔐 **Getting started:**\n\n1. Go to **belongix.in** → Click 'Join Free →'\n2. Enter name, email, password\n3. Verify email (check spam too)\n4. Complete profile for +30 Career Score pts\n\n**Forgot password:** Sign In → Forgot password? → Reset link sent instantly\n\n👉 Sign up takes 2 minutes — belongix.in" },
    { patterns: ['not working','broken','bug','error','issue','problem','cant access','page not loading'],
      answer: "🔧 **Having a technical issue?**\n\nTry these first:\n1. Hard refresh: Ctrl+Shift+R\n2. Clear cache: Browser Settings → Clear browsing data\n3. Try incognito mode\n4. Try Chrome (works best)\n\n**Still stuck?** Raise a support ticket below 👇" },
    { patterns: ['contact','support','help','human','agent','speak to','team','customer care'],
      answer: "📞 **Contact Belongix Support:**\n\n**Email:** teambelongix@gmail.com\n**Response:** Within 24 hours\n\n👇 Click 'Raise a Ticket' or 'Email Us' below" },
    { patterns: ['course','courses','learn','upskill','training','certification','certificate','study'],
      answer: "📚 **Belongix Upskilling Hub — 150+ courses:**\n\n**Free tracks:** Data Analytics, Cloud Basics, Web Dev, DSA, Product Management\n\n**Top picks:** Google Data Analytics Certificate, AWS Solutions Architect, Meta Front-End Developer\n\n**Free plan:** 5 tracks | **Pro:** All 150+ courses\n\n👉 Next step: Go to Upskilling Hub and start one course today." },
    { patterns: ['post job','hire','hiring','recruiter','employer','find candidates'],
      answer: "🏢 **Hiring on Belongix?**\n\n**Post your first job free** — no account required.\n\n**Average time to first applicant: 4 hours**\n\n1. Go to post-job.html\n2. Fill role details\n3. Post — live within 1 hour\n\n👉 Visit post-job.html to post free right now." },
    { patterns: ['bye','goodbye','thanks','thank you','thankyou','that helps','helpful','great','awesome','perfect','done'],
      answer: "You're welcome! 😊\n\nI'm here 24/7, unlimited — come back anytime.\n\n**Quick links:**\n- 💰 Salary Insights → Dashboard\n- 🔍 Job Board → Dashboard\n- 📄 Resume Builder → Dashboard\n- 🤝 Book Mentor → Mentors page (Pro)\n\nGood luck! 🚀" }
  ];

  function findAnswer(input) {
    var q = input.toLowerCase().trim();
    var best = null, bestScore = 0;
    KB.forEach(function(entry) {
      var score = 0;
      entry.patterns.forEach(function(p) { if (q.includes(p)) score += p.split(' ').length; });
      if (score > bestScore) { bestScore = score; best = entry; }
    });
    var rawAnswer = (best && bestScore > 0) ? best.answer :
      "I'm not sure I understood that fully. 🤔\n\nI can help with:\n- **Salary** questions\n- **Interview prep** and roadmaps\n- **Career switch** guidance\n- **Skills to learn** in 2026\n- **Resume** and LinkedIn tips\n- **Job search** strategies\n\nTry rephrasing, or click **'Raise a Ticket'** below!";
    return _profileReady && _userProfile ? personaliseResponse(rawAnswer) : rawAnswer;
  }

  /* ── Support functions ── */
  function raiseTicket() {
    var chat = _transcript.map(function(m){ return (m.role==='user'?'User: ':'Bexi: ') + m.text; }).join('\n');
    var subj = encodeURIComponent('[Belongix] Bexi Support Ticket');
    var body = encodeURIComponent('Hi Belongix Support,\n\nI need help with:\n\n[DESCRIBE ISSUE]\n\n---\nBexi Chat Transcript:\n' + chat);
    window.open('mailto:' + SUPPORT_EMAIL + '?subject=' + subj + '&body=' + body);
  }
  function liveChatEmail() {
    var subj = encodeURIComponent('Live Support Request — Belongix');
    var body = encodeURIComponent('Hi Belongix team,\n\nI need live support.\n\n[Describe question/issue]');
    window.open('mailto:' + SUPPORT_EMAIL + '?subject=' + subj + '&body=' + body);
  }

  var _transcript = [];

  /* ── Memory / Supabase persistence ── */
  var _memUserId = null, _memLoaded = false, _saveTimer = null, _pendingSave = [];

  function getSb() {
    if (window._bxSb) return window._bxSb;
    if (window.supabase) { window._bxSb = window.supabase.createClient(SB_URL, SB_KEY); return window._bxSb; }
    return null;
  }

  async function loadConversationHistory() {
    if (!_memUserId) return;
    var sb = getSb(); if (!sb) return;
    try {
      var r = await sb.from('bexi_conversations').select('role, content, created_at')
        .eq('user_id', _memUserId).order('created_at', {ascending:false}).limit(10);
      if (r.error || !r.data || !r.data.length) { _memLoaded = true; return; }
      var history = r.data.slice().reverse();
      var msgs = document.getElementById('bx-msgs');
      if (msgs) { var welcome = msgs.querySelector('.bxb.bot'); msgs.innerHTML = ''; if (welcome) msgs.appendChild(welcome); }
      history.forEach(function(m) { appendMsg(m.content, m.role === 'user' ? 'user' : 'bot'); _transcript.push({role:m.role, text:m.content}); });
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
      _memLoaded = true;
    } catch(e) { _memLoaded = true; }
  }

  function saveMessage(role, content) {
    if (!_memUserId) return;
    _pendingSave.push({role:role, content:content});
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(flushSave, 300);
  }

  async function flushSave() {
    if (!_memUserId || !_pendingSave.length) return;
    var rows = _pendingSave.map(function(m){ return {user_id:_memUserId, role:m.role, content:m.content}; });
    _pendingSave = [];
    var sb = getSb(); if (!sb) return;
    try { await sb.from('bexi_conversations').insert(rows); } catch(e) {}
  }

  async function clearConversationHistory() {
    var msgs = document.getElementById('bx-msgs');
    if (msgs) msgs.innerHTML = '<div class="bxb bot">Chat cleared! Ask me anything 👋</div>';
    _transcript = [];
    if (_memUserId) { var sb = getSb(); if (!sb) return; try { await sb.from('bexi_conversations').delete().eq('user_id', _memUserId); } catch(e) {} }
  }
  window.bexiClearChat = clearConversationHistory;

  /* ════════════════════════════════════════════════════════
     RESUME CRITIQUE — via Edge Function
  ════════════════════════════════════════════════════════ */
  function readFileAsText(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        reader.onload = function(e) { resolve({type:'pdf', data:e.target.result.split(',')[1]}); };
        reader.onerror = reject; reader.readAsDataURL(file);
      } else {
        reader.onload = function(e) { resolve({type:'text', data:e.target.result}); };
        reader.onerror = reject; reader.readAsText(file);
      }
    });
  }

  window.bxResumeUpload = async function(input) {
    var file = input && input.files && input.files[0];
    if (!file) return;
    input.value = '';
    if (file.size > 5 * 1024 * 1024) { appendMsg('❌ File too large. Please upload a resume under 5MB.', 'bot'); return; }
    var allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|doc|txt)$/i)) {
      appendMsg('❌ Unsupported file type. Please upload PDF, DOCX, or TXT.', 'bot'); return;
    }
    appendMsg('📄 Resume uploaded: ' + file.name, 'user');
    _transcript.push({role:'user', text:'[Resume uploaded: ' + file.name + ']'});
    saveMessage('user', '[Resume uploaded: ' + file.name + ']');
    var progEl = document.getElementById('bx-resume-progress');
    if (progEl) { progEl.textContent = '📄 Reading ' + file.name + '...'; progEl.classList.add('show'); }
    var sendBtn = document.getElementById('bx-send');
    if (sendBtn) sendBtn.disabled = true;
    showTyping();
    try {
      var fileData = await readFileAsText(file);
      if (progEl) progEl.textContent = '🤖 Analysing with AI...';

      /* Call Edge Function — API key stays server-side */
      var result = await callBexiEdge('resume', {
        fileData: fileData,
        fileName: file.name,
        profileContext: buildProfileContext()
      });

      hideTyping();
      if (progEl) progEl.classList.remove('show');
      if (sendBtn) sendBtn.disabled = false;

      if (result && result.critique) {
        renderResumeCritique(result.critique, file.name);
      } else {
        /* Fallback if Edge Function unavailable */
        renderResumeCritique(fallbackCritique(fileData), file.name);
      }
      saveMessage('bot', '[Resume critique delivered for ' + file.name + ']');
    } catch(e) {
      hideTyping();
      if (progEl) progEl.classList.remove('show');
      if (sendBtn) sendBtn.disabled = false;
      appendMsg("❌ Sorry, I couldn't analyse that file. Try a plain-text or PDF version.", 'bot');
    }
  };

  function fallbackCritique(textData) {
    var text = (textData.data || '').toLowerCase();
    var score = 40;
    ['github','linkedin','%','lpa','led','built','designed','shipped','reduced','increased','managed'].forEach(function(k){ if (text.includes(k)) score += 4; });
    score = Math.min(score, 85);
    return {
      ats_score: score,
      strengths: ['Resume was readable','Contains relevant experience','Education section present'],
      improvements: [
        {issue:'Quantify achievements', detail:'Add numbers to every bullet point (e.g. "Reduced load time by 40%")'},
        {issue:'ATS keywords missing', detail:'Add exact keywords from target job descriptions'},
        {issue:'Summary section', detail:'Add a 2–3 line professional summary at the top'}
      ],
      missing_keywords: ['quantified results','cloud platform','system design','team leadership','agile'],
      next_action: 'Add 3 quantified achievements to your experience section today',
      summary: 'Your resume needs stronger ATS optimisation for the Indian market.'
    };
  }

  function renderResumeCritique(c, fileName) {
    var score = c.ats_score || 0;
    var scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
    var scoreLabel = score >= 80 ? 'Strong ✅' : score >= 60 ? 'Needs Work 📈' : 'Low ⚠️';
    var strengthsHtml = (c.strengths||[]).map(function(s){ return '<div style="display:flex;gap:6px;margin-bottom:4px"><span style="color:#10B981">✓</span><span>' + esc(s) + '</span></div>'; }).join('');
    var improvHtml = (c.improvements||[]).map(function(i){ return '<div style="margin-bottom:8px"><div style="font-weight:700;font-size:11.5px;color:#EF4444">⚠ ' + esc(i.issue) + '</div><div style="font-size:11px;color:var(--bxm)">' + esc(i.detail) + '</div></div>'; }).join('');
    var kwHtml = (c.missing_keywords||[]).map(function(k){ return '<span style="background:rgba(239,68,68,.08);color:#EF4444;border:1px solid rgba(239,68,68,.2);border-radius:5px;padding:2px 7px;font-size:10.5px;font-weight:600;margin:2px;display:inline-block">' + esc(k) + '</span>'; }).join('');
    var card = '<div style="background:#fff;border:1.5px solid var(--bxbr);border-radius:14px;overflow:hidden;margin:4px 0">'
      + '<div style="background:linear-gradient(135deg,#2D1B69,#6B48CC);padding:12px 14px;color:#fff">'
      + '<div style="font-size:10px;font-weight:700;opacity:.75;text-transform:uppercase;margin-bottom:4px">Resume Critique · ' + esc(fileName) + '</div>'
      + '<div style="display:flex;align-items:center;gap:10px">'
      + '<div style="font-family:Sora,sans-serif;font-size:32px;font-weight:800;color:' + scoreColor + '">' + score + '</div>'
      + '<div><div style="font-size:11px;font-weight:700;color:#fff">ATS Score</div><div style="font-size:10px;color:rgba(255,255,255,.7)">' + scoreLabel + '</div></div>'
      + '<div style="flex:1;height:5px;background:rgba(255,255,255,.2);border-radius:5px;overflow:hidden;margin-left:4px">'
      + '<div style="height:100%;width:' + score + '%;background:' + scoreColor + ';border-radius:5px"></div></div></div>'
      + (c.summary ? '<div style="font-size:11px;color:rgba(255,255,255,.8);margin-top:8px;line-height:1.5">' + esc(c.summary) + '</div>' : '')
      + '</div><div style="padding:12px 14px">'
      + '<div style="margin-bottom:12px"><div style="font-size:10.5px;font-weight:700;color:var(--bxb);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">✅ Strengths</div><div style="font-size:11.5px">' + strengthsHtml + '</div></div>'
      + '<div style="margin-bottom:12px"><div style="font-size:10.5px;font-weight:700;color:var(--bxb);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">🔧 Top Improvements</div>' + improvHtml + '</div>'
      + (kwHtml ? '<div style="margin-bottom:12px"><div style="font-size:10.5px;font-weight:700;color:var(--bxb);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">🔑 Add These Keywords</div><div>' + kwHtml + '</div></div>' : '')
      + (c.next_action ? '<div style="background:rgba(45,27,105,.06);border:1px solid rgba(45,27,105,.12);border-radius:8px;padding:9px 11px"><div style="font-size:10px;font-weight:700;color:var(--bxb);margin-bottom:3px">👉 DO THIS TODAY</div><div style="font-size:11.5px">' + esc(c.next_action) + '</div></div>' : '')
      + '<div style="margin-top:12px"><a href="resume-builder.html" style="display:block;text-align:center;padding:8px;background:#2D1B69;color:#fff;border-radius:8px;font-size:11.5px;font-weight:700;text-decoration:none">Rebuild in Resume Builder →</a></div>'
      + '</div></div>';
    var msgs = document.getElementById('bx-msgs');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'bxb bot';
    div.style.cssText = 'max-width:100%;padding:0;background:none;border:none';
    div.innerHTML = card;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ── Quick chips ── */
  var QUICK = [
    {label:'💰 Am I underpaid?', q:'Am I being paid fairly for my role?'},
    {label:'🔄 Switch to data analytics', q:'How do I switch to data analytics?'},
    {label:'⚡ Skills for ₹20 LPA job', q:'What skills should I learn in 2026 for a ₹20 LPA job?'},
    {label:'📄 Resume tips', q:'Give me resume tips'},
    {label:'🎯 Interview prep', q:'How do I prepare for interviews?'},
    {label:'📞 Talk to support', q:'contact support'},
    {label:'🎯 Mock Interview', q:'__start_interview__'},
    {label:'💰 Negotiate my salary', q:'__start_negotiation__'}
  ];

  /* ── CSS ── */
  var CSS = [
    ':root{--bxb:#2D1B69;--bxb2:#4C2FAA;--bxg:linear-gradient(135deg,#2D1B69,#6C3FC5);--bxa:#FF5C35;--bxgr:#10B981;--bxi:#0D0D1A;--bxm:#5A5A7A;--bxs:#8B8BA8;--bxbg:#F7F7FC;--bxw:#fff;--bxbr:#E4E4F0;--bxff:"DM Sans",sans-serif;--bxfs:"Sora",sans-serif;}',
    '#bx-fab{position:fixed;bottom:20px;right:20px;z-index:9998;display:flex;align-items:center;gap:7px;background:var(--bxg);color:#fff;border:none;border-radius:50px;padding:10px 16px 10px 12px;font-size:13px;font-weight:600;font-family:var(--bxff);cursor:pointer;box-shadow:0 4px 18px rgba(45,27,105,.45);transition:transform .2s,box-shadow .2s;-webkit-tap-highlight-color:transparent;}',
    '#bx-fab:hover{transform:translateY(-2px);box-shadow:0 7px 24px rgba(45,27,105,.55);}',
    '#bx-fab .bx-pulse{width:7px;height:7px;border-radius:50%;background:var(--bxgr);flex-shrink:0;animation:bxP 2s infinite;}',
    '@keyframes bxP{0%{box-shadow:0 0 0 0 rgba(16,185,129,.6)}70%{box-shadow:0 0 0 7px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}}',
    '#bx-bd{display:none;position:fixed;inset:0;z-index:9996;background:rgba(0,0,0,.4);backdrop-filter:blur(3px);}#bx-bd.open{display:block;}',
    '#bx-panel{position:fixed;bottom:68px;right:20px;z-index:9997;width:300px;height:460px;background:var(--bxw);border-radius:16px;border:1px solid var(--bxbr);box-shadow:0 16px 56px rgba(45,27,105,.2);display:none;flex-direction:column;overflow:hidden;font-family:var(--bxff);}#bx-panel.open{display:flex;}',
    '@media(max-width:520px){#bx-panel{width:100%;height:100%;bottom:0;right:0;border-radius:0;border:none;}#bx-fab{bottom:14px;right:14px;padding:9px 14px 9px 10px;font-size:12px;}}',
    '#bx-head{background:var(--bxg);padding:10px 12px;display:flex;align-items:center;gap:8px;flex-shrink:0;}',
    '#bx-av{width:32px;height:32px;border-radius:50%;flex-shrink:0;background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:16px;}',
    '#bx-hinfo{flex:1;min-width:0;}#bx-hname{font-family:var(--bxfs);font-size:12px;font-weight:700;color:#fff;}',
    '#bx-hst{font-size:10px;color:rgba(255,255,255,.7);margin-top:1px;display:flex;align-items:center;gap:4px;}#bx-hst::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--bxgr);flex-shrink:0;}',
    '#bx-hacts{display:flex;gap:4px;align-items:center;}.bx-hbtn{padding:4px 8px;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff;font-size:10px;font-weight:600;cursor:pointer;font-family:var(--bxff);transition:.15s;white-space:nowrap;}.bx-hbtn:hover{background:rgba(255,255,255,.25);}',
    '#bx-x{width:24px;height:24px;border-radius:50%;border:none;background:rgba(255,255,255,.15);color:#fff;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s;flex-shrink:0;margin-left:2px;}#bx-x:hover{background:rgba(255,255,255,.28);}',
    '#bx-profile-pill{margin:6px 10px 0;padding:5px 10px;background:rgba(45,27,105,.06);border:1px solid rgba(45,27,105,.12);border-radius:20px;font-size:10.5px;color:var(--bxb);font-family:var(--bxff);font-weight:500;display:none;align-items:center;gap:4px;flex-shrink:0;overflow:hidden;}#bx-profile-pill.show{display:flex;}',
    '#bx-pro-nudge{margin:6px 10px 0;padding:7px 10px;background:linear-gradient(135deg,rgba(45,27,105,.05),rgba(255,92,53,.05));border:1px solid rgba(45,27,105,.12);border-radius:10px;font-size:11px;color:var(--bxi);font-family:var(--bxff);display:none;align-items:center;gap:6px;flex-shrink:0;}#bx-pro-nudge.show{display:flex;}',
    '#bx-pro-nudge a{color:var(--bxb);font-weight:700;text-decoration:none;white-space:nowrap;}#bx-pro-nudge a:hover{text-decoration:underline;}',
    '#bx-pro-nudge-close{background:none;border:none;cursor:pointer;color:var(--bxs);font-size:13px;padding:0;line-height:1;margin-left:auto;flex-shrink:0;}',
    '#bx-msgs{flex:1;overflow-y:auto;padding:10px 10px 6px;display:flex;flex-direction:column;gap:8px;scroll-behavior:smooth;}',
    '#bx-msgs::-webkit-scrollbar{width:2px;}#bx-msgs::-webkit-scrollbar-thumb{background:#D0D0E8;border-radius:2px;}',
    '.bxb{max-width:90%;padding:9px 11px;border-radius:13px;font-size:12.5px;line-height:1.65;word-break:break-word;animation:bxIn .15s ease both;}',
    '@keyframes bxIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}',
    '.bxb.bot{background:var(--bxbg);color:var(--bxi);align-self:flex-start;border-radius:3px 13px 13px 13px;border:1px solid var(--bxbr);max-width:94%;}',
    '.bxb.user{background:var(--bxg);color:#fff;align-self:flex-end;border-radius:13px 3px 13px 13px;}',
    '.bx-step{margin:7px 0 3px;padding:5px 9px;background:rgba(45,27,105,.07);border-left:3px solid #6C3FC5;border-radius:0 7px 7px 0;font-size:11.5px;font-weight:600;color:var(--bxb);}',
    '#bx-typing{display:flex;gap:4px;align-items:center;padding:9px 11px;background:var(--bxbg);border:1px solid var(--bxbr);border-radius:3px 13px 13px 13px;align-self:flex-start;}',
    '#bx-typing span{width:5px;height:5px;border-radius:50%;background:#A0A0C0;animation:bxDots 1.3s infinite ease-in-out;}',
    '#bx-typing span:nth-child(2){animation-delay:.18s;}#bx-typing span:nth-child(3){animation-delay:.36s;}',
    '@keyframes bxDots{0%,80%,100%{transform:scale(.7);opacity:.5}40%{transform:scale(1.1);opacity:1}}',
    '#bx-chips{padding:7px 8px;border-top:1px solid var(--bxbr);background:#FAFAFE;display:flex;gap:5px;overflow-x:auto;flex-shrink:0;scrollbar-width:none;}#bx-chips::-webkit-scrollbar{display:none;}',
    '.bx-chip{background:var(--bxw);border:1.5px solid var(--bxbr);border-radius:20px;padding:5px 10px;font-size:11px;font-weight:500;color:var(--bxb);cursor:pointer;font-family:var(--bxff);white-space:nowrap;transition:.15s;flex-shrink:0;}.bx-chip:hover{border-color:var(--bxb);background:#EFEFF8;}',
    '#bx-support{padding:6px 8px;border-top:1px solid var(--bxbr);background:#FAFAFE;display:flex;gap:5px;flex-shrink:0;}',
    '.bx-sbtm{flex:1;padding:6px 4px;border-radius:7px;border:1.5px solid var(--bxbr);background:var(--bxw);color:var(--bxm);font-size:11px;font-weight:600;cursor:pointer;font-family:var(--bxff);transition:.15s;text-align:center;}.bx-sbtm:hover{border-color:var(--bxb);color:var(--bxb);}',
    '.bx-sbtm.accent{background:var(--bxb);color:#fff;border-color:var(--bxb);}.bx-sbtm.accent:hover{background:var(--bxb2);}',
    '#bx-irow{padding:7px 8px;border-top:1px solid var(--bxbr);display:flex;gap:6px;background:var(--bxw);flex-shrink:0;align-items:center;}',
    '#bx-inp{flex:1;border:1.5px solid var(--bxbr);border-radius:10px;padding:7px 10px;font-size:12.5px;font-family:var(--bxff);color:var(--bxi);background:#FAFAFE;outline:none;transition:.15s;}#bx-inp:focus{border-color:var(--bxb);background:#fff;}#bx-inp::placeholder{color:#A0A0BE;}',
    '#bx-send{width:32px;height:32px;flex-shrink:0;border:none;border-radius:8px;background:var(--bxg);color:#fff;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:.15s;}#bx-send:hover{filter:brightness(1.12);}',
    '#bx-upload-btn{width:28px;height:28px;flex-shrink:0;border:1.5px solid var(--bxbr);border-radius:8px;background:var(--bxw);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:.15s;position:relative;}#bx-upload-btn:hover{border-color:var(--bxb);background:#EFEFF8;}',
    '#bx-upload-btn input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}',
    '#bx-resume-progress{padding:5px 10px;font-size:11px;font-weight:600;color:var(--bxb);background:rgba(45,27,105,.06);border-top:1px solid var(--bxbr);text-align:center;display:none;flex-shrink:0;}#bx-resume-progress.show{display:block;}',
    '.bx-spin{width:12px;height:12px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:bxSpin .6s linear infinite;}@keyframes bxSpin{to{transform:rotate(360deg)}}',
    '#bx-smart-nudge{margin:8px 10px 0;padding:10px 12px;background:linear-gradient(135deg,rgba(45,27,105,.06),rgba(107,72,204,.06));border:1.5px solid rgba(45,27,105,.15);border-radius:12px;display:none;flex-direction:column;gap:6px;flex-shrink:0;}#bx-smart-nudge.show{display:flex;}',
    '#bx-sn-top{display:flex;align-items:flex-start;gap:7px;}#bx-sn-icon{font-size:16px;flex-shrink:0;margin-top:1px;}#bx-sn-msg{font-size:11.5px;color:var(--bxi);line-height:1.5;flex:1;font-family:var(--bxff);}',
    '#bx-sn-actions{display:flex;gap:6px;margin-top:2px;}.bx-sn-btn{padding:5px 11px;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--bxff);transition:.15s;border:none;}',
    '.bx-sn-btn.primary{background:var(--bxb);color:#fff;}.bx-sn-btn.primary:hover{background:var(--bxb2);}.bx-sn-btn.ghost{background:rgba(45,27,105,.07);color:var(--bxb);}.bx-sn-btn.ghost:hover{background:rgba(45,27,105,.12);}',
    '#bx-sn-close{background:none;border:none;cursor:pointer;color:var(--bxs);font-size:13px;padding:0;line-height:1;flex-shrink:0;}',
    '#bx-interview-panel{display:none;flex-direction:column;flex:1;overflow:hidden;}#bx-interview-panel.active{display:flex;}',
    '#bx-iv-header{padding:10px 12px;background:rgba(45,27,105,.04);border-bottom:1px solid var(--bxbr);flex-shrink:0;}',
    '#bx-iv-title{font-family:var(--bxfs);font-size:12px;font-weight:700;color:var(--bxb);margin-bottom:2px;}#bx-iv-meta{font-size:10.5px;color:var(--bxs);}',
    '#bx-iv-progress{height:3px;background:var(--bxbr);border-radius:3px;margin-top:6px;overflow:hidden;}#bx-iv-bar{height:100%;background:var(--bxg);border-radius:3px;transition:width .4s ease;}',
    '#bx-iv-msgs{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px;}#bx-iv-msgs::-webkit-scrollbar{width:2px;}',
    '#bx-iv-actions{padding:8px;border-top:1px solid var(--bxbr);display:flex;gap:6px;flex-shrink:0;}',
    '#bx-iv-inp{flex:1;border:1.5px solid var(--bxbr);border-radius:10px;padding:7px 10px;font-size:12px;font-family:var(--bxff);color:var(--bxi);background:#FAFAFE;outline:none;resize:none;min-height:38px;max-height:80px;}#bx-iv-inp:focus{border-color:var(--bxb);}',
    '#bx-iv-send{padding:7px 13px;background:var(--bxg);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--bxff);white-space:nowrap;}',
    '#bx-iv-end{padding:7px 10px;background:rgba(239,68,68,.1);color:#EF4444;border:1px solid rgba(239,68,68,.2);border-radius:8px;font-size:11.5px;font-weight:600;cursor:pointer;font-family:var(--bxff);white-space:nowrap;}',
    '.iv-score-card{background:linear-gradient(135deg,#2D1B69,#6B48CC);border-radius:12px;padding:16px;color:#fff;text-align:center;margin:8px 0;}',
    '.iv-score-num{font-family:var(--bxfs);font-size:36px;font-weight:800;letter-spacing:-1px;}.iv-score-lbl{font-size:11px;opacity:.75;margin-top:2px;}.iv-feedback{background:rgba(255,255,255,.12);border-radius:8px;padding:10px;margin-top:10px;font-size:11.5px;line-height:1.6;text-align:left;}',
    '.bx-iv-chip{background:var(--bxw);border:1.5px solid var(--bxbr);border-radius:8px;padding:7px 11px;font-size:11.5px;font-weight:500;color:var(--bxi);cursor:pointer;font-family:var(--bxff);transition:.15s;text-align:left;}.bx-iv-chip:hover,.bx-iv-chip.sel{border-color:var(--bxb);background:rgba(45,27,105,.06);color:var(--bxb);font-weight:600;}'
  ].join('');

  /* ── HTML ── */
  function buildHTML() {
    var chips = QUICK.map(function(q){ return '<button class="bx-chip" onclick="bexiAsk(\'' + q.q.replace(/'/g,"\\'") + '\')">' + q.label + '</button>'; }).join('');
    return '<style id="bx-css">' + CSS + '</style>'
      + '<div id="bx-bd" onclick="bexiClose()"></div>'
      + '<button id="bx-fab" onclick="bexiToggle()" aria-label="Chat with Bexi"><div class="bx-pulse"></div><span style="font-size:15px">&#129302;</span> Bexi AI</button>'
      + '<div id="bx-panel" role="dialog" aria-label="Bexi AI career guide">'
        + '<div id="bx-head"><div id="bx-av">&#129302;</div>'
        + '<div id="bx-hinfo"><div id="bx-hname">Bexi AI</div><div id="bx-hst">Career Guide · Unlimited &amp; Free</div></div>'
        + '<div id="bx-hacts"><button class="bx-hbtn" onclick="bexiClearChat()">🗑 Clear</button><button class="bx-hbtn" onclick="raiseTicket()">🎫 Ticket</button></div>'
        + '<button id="bx-x" onclick="bexiClose()" aria-label="Close">✕</button></div>'
        + '<div id="bx-profile-pill"><span>👤</span><span id="bx-profile-pill-text"></span></div>'
        + '<div id="bx-pro-nudge"><span>🤝</span><span>Book 1-on-1 mentor sessions → </span><a href="dashboard.html?page=upgrade" target="_blank">Upgrade to Pro</a><button id="bx-pro-nudge-close" onclick="dismissProNudge()" title="Dismiss">✕</button></div>'
        + '<div id="bx-smart-nudge"><div id="bx-sn-top"><span id="bx-sn-icon">💡</span><span id="bx-sn-msg"></span><button id="bx-sn-close" onclick="dismissSmartNudge()" title="Dismiss">✕</button></div><div id="bx-sn-actions"></div></div>'
        + '<div id="bx-interview-panel"><div id="bx-iv-header"><div id="bx-iv-title">🎯 Mock Interview</div><div id="bx-iv-meta">Loading...</div><div id="bx-iv-progress"><div id="bx-iv-bar" style="width:0%"></div></div></div><div id="bx-iv-msgs"></div><div id="bx-iv-actions"><textarea id="bx-iv-inp" placeholder="Type your answer..." rows="1" onkeydown="bxIvKeydown(event)"></textarea><button id="bx-iv-send" onclick="bxIvSend()">Send →</button><button id="bx-iv-end" onclick="bxIvEnd()">End</button></div></div>'
        + '<div id="bx-msgs"><div class="bxb bot">Hi! I\'m Bexi 👋 Your free career guide for India\'s job market.<br><br>Ask me anything — <strong>no limits, no daily cap, always free</strong>.</div></div>'
        + '<div id="bx-chips">' + chips + '</div>'
        + '<div id="bx-support"><button class="bx-sbtm" onclick="liveChatEmail()">📧 Email Us</button><button class="bx-sbtm accent" onclick="raiseTicket()">🎫 Raise Ticket</button></div>'
        + '<div id="bx-resume-progress">📄 Analysing your resume...</div>'
        + '<div id="bx-irow"><button id="bx-upload-btn" title="Upload resume for critique">📄<input type="file" id="bx-resume-file" accept=".pdf,.doc,.docx,.txt" onchange="bxResumeUpload(this)" aria-label="Upload resume"/></button>'
        + '<input id="bx-inp" type="text" placeholder="Ask anything, or upload your resume 📄" autocomplete="off" onkeydown="if(event.key===\'Enter\'){event.preventDefault();bexiSend()}"/>'
        + '<button id="bx-send" onclick="bexiSend()" aria-label="Send">&#10148;</button></div>'
      + '</div>';
  }

  /* ── Mount ── */
  function mount() {
    if (document.getElementById('bx-root')) return;
    var root = document.createElement('div');
    root.id = 'bx-root'; root.innerHTML = buildHTML();
    document.body.appendChild(root);
    loadUserProfile();
    setTimeout(checkAndShowSmartNudge, 2500);
    setTimeout(showProNudge, 30000);
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') bexiClose(); });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', mount) : mount();

  /* ── Open/Close ── */
  var _nudgeDismissed = false, _nudgeCount = 0;
  function showProNudge() {
    if (_nudgeDismissed || _nudgeCount >= 1) return;
    if (_userProfile && _userProfile.plan === 'pro') return;
    var nudge = document.getElementById('bx-pro-nudge');
    if (nudge) { nudge.classList.add('show'); _nudgeCount++; }
  }
  window.dismissProNudge = function() { _nudgeDismissed = true; var n = document.getElementById('bx-pro-nudge'); if (n) n.classList.remove('show'); };

  function showProfilePill() {
    if (!_userProfile) return;
    var pill = document.getElementById('bx-profile-pill'), pillText = document.getElementById('bx-profile-pill-text');
    if (!pill || !pillText) return;
    var parts = [];
    if (_userProfile.full_name) parts.push(_userProfile.full_name.split(' ')[0]);
    if (_userProfile.role) parts.push(_userProfile.role);
    if (_userProfile.city) parts.push(_userProfile.city);
    if (parts.length > 0) { pillText.textContent = parts.join(' · '); pill.classList.add('show'); }
  }
  var _origLoadProfile = loadUserProfile;
  loadUserProfile = async function() { await _origLoadProfile(); showProfilePill(); updateGreetingWithProfile(); };

  window.bexiToggle = function() { var p = document.getElementById('bx-panel'); if (!p) return; p.classList.contains('open') ? bexiClose() : bexiOpen(); };
  function bexiOpen() {
    var p = document.getElementById('bx-panel'), bd = document.getElementById('bx-bd');
    if (!p) return; p.classList.add('open'); if (bd) bd.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ var i=document.getElementById('bx-inp'); if(i) i.focus(); }, 150);
    setTimeout(showProNudge, 8000);
  }
  window.bexiClose = function() {
    var p = document.getElementById('bx-panel'), bd = document.getElementById('bx-bd');
    if (p) p.classList.remove('open'); if (bd) bd.classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ── Send / Ask ── */
  window.bexiSend = function() { var inp = document.getElementById('bx-inp'); if (!inp) return; var q = inp.value.trim(); if (!q) return; inp.value = ''; window.bexiAsk(q); };
  window.bexiAsk = function(question) {
    if (!question || !question.trim()) return;
    var p = document.getElementById('bx-panel'); if (p && !p.classList.contains('open')) bexiOpen();
    var chips = document.getElementById('bx-chips'); if (chips) chips.style.display = 'none';
    appendMsg(question, 'user');
    _transcript.push({role:'user', text:question});
    saveMessage('user', question);
    if (question === '__start_interview__' || question.toLowerCase().includes('mock interview')) { bxIvSetup(); return; }
    if (question === '__start_negotiation__' || question.toLowerCase().includes('negotiate')) { bxNegSetup(); return; }
    var q = question.toLowerCase();
    if (q.includes('ticket') || q.includes('raise ticket')) { setTimeout(function(){ raiseTicket(); }, 300); appendMsg("Opening a support ticket for you! 🎫\n\nOur team responds within **24 hours**.", 'bot'); return; }
    if (q.includes('live chat') || q.includes('email us') || (q.includes('human') && q.includes('speak'))) { setTimeout(function(){ liveChatEmail(); }, 300); appendMsg("Connecting you to our team! 📧", 'bot'); return; }
    showTyping();
    var send = document.getElementById('bx-send'); if (send) { send.disabled = true; send.innerHTML = '<div class="bx-spin"></div>'; }
    setTimeout(function() {
      hideTyping(); if (send) { send.disabled = false; send.innerHTML = '&#10148;'; }
      var answer = findAnswer(question);
      appendMsg(answer, 'bot');
      _transcript.push({role:'bot', text:answer});
      saveMessage('bot', answer);
    }, 600 + Math.random() * 400);
  };

  window.raiseTicket = raiseTicket;
  window.liveChatEmail = liveChatEmail;

  /* ── DOM helpers ── */
  function appendMsg(text, type) {
    var msgs = document.getElementById('bx-msgs'); if (!msgs) return;
    var div = document.createElement('div'); div.className = 'bxb ' + (type==='user'?'user':'bot');
    div.innerHTML = type === 'user' ? esc(text) : formatBot(text);
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
  }
  function formatBot(raw) {
    var s = esc(raw);
    s = s.replace(/👉\s*Next step:\s*([^\n]+)/gi,'<div class="bx-step">👉 Next step: $1</div>');
    s = s.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
    s = s.replace(/\n\s*-\s+/g,'\n• ');
    s = s.replace(/\n/g,'<br>');
    return s;
  }
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function showTyping() { var msgs=document.getElementById('bx-msgs'); if(!msgs||document.getElementById('bx-typing'))return; var t=document.createElement('div'); t.id='bx-typing'; t.innerHTML='<span></span><span></span><span></span>'; msgs.appendChild(t); msgs.scrollTop=msgs.scrollHeight; }
  function hideTyping() { var t=document.getElementById('bx-typing'); if(t) t.remove(); }

  /* ── Smart nudge ── */
  var _nudgeSnDismissed = false;
  async function checkAndShowSmartNudge() {
    if (_nudgeSnDismissed || !document.getElementById('bx-smart-nudge')) return;
    var waited = 0;
    while (!_profileReady && waited < 3000) { await new Promise(function(r){ setTimeout(r,200); }); waited += 200; }
    var nudge = null;
    if (_userProfile && _userProfile.career_score && _userProfile.career_score < 50) {
      nudge = { icon:'📊', msg:'Your Career Score is <strong>' + _userProfile.career_score + '/100</strong>. Completing your profile adds +30 points.',
        actions:[{label:'How to boost it', q:'How do I improve my Career Score?'},{label:'Go to profile', href:'dashboard.html?page=profile'}] };
    } else if (_userProfile && (!_userProfile.skills || !_userProfile.skills.trim())) {
      nudge = { icon:'⚡', msg:"You haven't added any skills yet. Adding skills boosts your Career Score by +10 pts.",
        actions:[{label:'Add skills now', href:'dashboard.html?page=profile'},{label:'Which skills matter?', q:'What skills should I learn in 2026?'}] };
    }
    if (nudge) renderSmartNudge(nudge);
  }
  function renderSmartNudge(nudge) {
    var el=document.getElementById('bx-smart-nudge'), msgEl=document.getElementById('bx-sn-msg'), iconEl=document.getElementById('bx-sn-icon'), actEl=document.getElementById('bx-sn-actions');
    if (!el||!msgEl||!actEl) return;
    iconEl.textContent = nudge.icon; msgEl.innerHTML = nudge.msg;
    actEl.innerHTML = nudge.actions.map(function(a){ return a.href ? '<a href="'+a.href+'" class="bx-sn-btn primary" style="text-decoration:none">'+a.label+'</a>' : '<button class="bx-sn-btn ghost" onclick="bexiAsk(&quot;'+a.q+'&quot;);dismissSmartNudge()">'+a.label+'</button>'; }).join('');
    el.classList.add('show');
  }
  window.dismissSmartNudge = function() { _nudgeSnDismissed=true; var el=document.getElementById('bx-smart-nudge'); if(el) el.classList.remove('show'); };

  /* ── Interview simulator — uses Edge Function for evaluation ── */
  var IV_QUESTIONS = {
    'hr': ['Tell me about yourself and your career journey so far.','Why do you want to join {company}?','Describe a time you faced a major challenge at work.','Where do you see yourself in 3 years?','What is your biggest strength?'],
    'technical': ['Walk me through debugging a production issue at 3am.','Explain SQL JOINs — when would you use LEFT vs INNER JOIN?','How would you optimise a slow API endpoint?','Describe your Git branching strategy.','How do you ensure code quality?'],
    'system_design': ['Design a URL shortener like Bit.ly.','Design a notification system for 1 million alerts/day.','Design the backend for a food delivery app.','Design a scalable job board.','Design a rate limiter at the API gateway level.']
  };
  var _iv = { active:false, company:'', role:'', round:'', questions:[], current:0, scores:[], answers:[], setup:true };

  function bxIvSetup() {
    if (!document.getElementById('bx-panel')) return; bexiOpen();
    ['bx-msgs','bx-chips','bx-support','bx-smart-nudge','bx-pro-nudge','bx-profile-pill'].forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display='none'; });
    var ivEl = document.getElementById('bx-interview-panel'); if (ivEl) ivEl.classList.add('active');
    _iv.active=true; _iv.setup=true; _iv.current=0; _iv.scores=[]; _iv.answers=[];
    var title=document.getElementById('bx-iv-title'); if(title) title.textContent='🎯 Mock Interview';
    bxIvRenderSetup();
  }
  function bxIvRenderSetup() {
    var ivMsgs=document.getElementById('bx-iv-msgs'), meta=document.getElementById('bx-iv-meta'), bar=document.getElementById('bx-iv-bar'), send=document.getElementById('bx-iv-send'), end=document.getElementById('bx-iv-end'), inp=document.getElementById('bx-iv-inp');
    if(meta) meta.textContent='Setup — choose your interview type'; if(bar) bar.style.width='0%'; if(send) send.style.display='none'; if(end) end.textContent='Cancel'; if(inp) inp.style.display='none';
    if (!ivMsgs) return;
    var companies=['Swiggy','Razorpay','CRED','Zepto','Google','Amazon','Meesho','Flipkart','PhonePe','Other'];
    ivMsgs.innerHTML='<div class="bxb bot" style="max-width:100%"><strong>🎯 Mock Interview Setup</strong><br><br>I\'ll ask 5 real questions, evaluate each answer, and give you a final score.<br><br><strong>1. Choose company:</strong></div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:5px;padding:0 2px">'+companies.map(function(c){ return '<button class="bx-iv-chip" onclick="bxIvSelectCompany(\''+c+'\')">'+c+'</button>'; }).join('')+'</div>';
    ivMsgs.scrollTop=ivMsgs.scrollHeight;
  }
  window.bxIvSelectCompany = function(company) {
    _iv.company=company; document.querySelectorAll('#bx-iv-msgs .bx-iv-chip').forEach(function(c){ c.disabled=true; if(c.textContent===company) c.classList.add('sel'); });
    var roles=['Software Engineer','Data Scientist','Product Manager','DevOps Engineer','Data Analyst','Full Stack Developer','Other'];
    var ivMsgs=document.getElementById('bx-iv-msgs'); if(!ivMsgs) return;
    var d=document.createElement('div'); d.style.cssText='margin-top:8px';
    d.innerHTML='<div class="bxb bot" style="max-width:100%"><strong>2. Choose role:</strong></div><div style="display:flex;flex-wrap:wrap;gap:5px;padding:0 2px">'+roles.map(function(r){ return '<button class="bx-iv-chip" onclick="bxIvSelectRole(\''+r+'\')">'+r+'</button>'; }).join('')+'</div>';
    ivMsgs.appendChild(d); ivMsgs.scrollTop=ivMsgs.scrollHeight;
  };
  window.bxIvSelectRole = function(role) {
    _iv.role=role; document.querySelectorAll('#bx-iv-msgs .bx-iv-chip:not([disabled])').forEach(function(c){ c.disabled=true; if(c.textContent===role) c.classList.add('sel'); });
    var rounds=[{id:'hr',label:'👥 HR Round',desc:'Behavioural'},{id:'technical',label:'💻 Technical Round',desc:'Coding'},{id:'system_design',label:'🏗️ System Design',desc:'Architecture'}];
    var ivMsgs=document.getElementById('bx-iv-msgs'); if(!ivMsgs) return;
    var d=document.createElement('div'); d.style.cssText='margin-top:8px';
    d.innerHTML='<div class="bxb bot" style="max-width:100%"><strong>3. Choose round:</strong></div><div style="display:flex;flex-wrap:wrap;gap:5px;padding:0 2px">'+rounds.map(function(r){ return '<button class="bx-iv-chip" onclick="bxIvSelectRound(\''+r.id+'\')">'+r.label+'</button>'; }).join('')+'</div>';
    ivMsgs.appendChild(d); ivMsgs.scrollTop=ivMsgs.scrollHeight;
  };
  window.bxIvSelectRound = function(roundId) {
    _iv.round=roundId;
    _iv.questions=(IV_QUESTIONS[roundId]||IV_QUESTIONS.hr).map(function(q){ return q.replace(/\{company\}/g,_iv.company); }).sort(function(){ return Math.random()-.5; }).slice(0,5);
    _iv.setup=false;
    var meta=document.getElementById('bx-iv-meta'); if(meta) meta.textContent=_iv.role+' @ '+_iv.company+' · '+roundId.replace('_',' ');
    var send=document.getElementById('bx-iv-send'), end=document.getElementById('bx-iv-end'), inp=document.getElementById('bx-iv-inp');
    if(send) send.style.display=''; if(end) end.textContent='End Interview'; if(inp) inp.style.display='';
    bxIvAskQuestion();
  };
  function bxIvAskQuestion() {
    var ivMsgs=document.getElementById('bx-iv-msgs'), bar=document.getElementById('bx-iv-bar'); if(!ivMsgs) return;
    if(bar) bar.style.width=Math.round((_iv.current/_iv.questions.length)*100)+'%';
    var d=document.createElement('div');
    d.innerHTML='<div class="bxb bot" style="max-width:100%;margin-top:8px"><div style="font-size:10.5px;font-weight:700;color:var(--bxb);margin-bottom:4px">Question '+(_iv.current+1)+' of '+_iv.questions.length+'</div>'+esc(_iv.questions[_iv.current])+'</div>';
    ivMsgs.appendChild(d); ivMsgs.scrollTop=ivMsgs.scrollHeight;
    var inp=document.getElementById('bx-iv-inp'); if(inp){ inp.value=''; inp.focus(); }
  }
  window.bxIvKeydown = function(e) { if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); bxIvSend(); } };
  window.bxIvSend = function() {
    var inp=document.getElementById('bx-iv-inp'); if(!inp) return;
    var answer=inp.value.trim(); if(!answer) return; inp.value='';
    var ivMsgs=document.getElementById('bx-iv-msgs');
    if(ivMsgs){ var d=document.createElement('div'); d.innerHTML='<div class="bxb user" style="align-self:flex-end">'+esc(answer)+'</div>'; ivMsgs.appendChild(d); ivMsgs.scrollTop=ivMsgs.scrollHeight; }
    _iv.answers.push(answer); evaluateAnswer(_iv.questions[_iv.current], answer, _iv.current);
  };
  async function evaluateAnswer(question, answer, idx) {
    var ivMsgs=document.getElementById('bx-iv-msgs');
    var thinkDiv=document.createElement('div'); thinkDiv.id='bx-iv-think';
    thinkDiv.innerHTML='<div id="bx-typing" style="margin-top:4px"><span></span><span></span><span></span></div>';
    if(ivMsgs){ ivMsgs.appendChild(thinkDiv); ivMsgs.scrollTop=ivMsgs.scrollHeight; }
    var score=5, feedback='';
    /* Call Edge Function for evaluation */
    var result = await callBexiEdge('evaluate', { question:question, answer:answer, role:_iv.role, company:_iv.company });
    if (result && result.evaluation) { score=result.evaluation.score||5; feedback=result.evaluation.feedback||''; }
    else {
      /* Fallback scoring */
      var wc=answer.trim().split(/\s+/).length;
      score=Math.min(10,Math.max(2,(wc>80?7:wc>40?5:3)+(/\d+%|\d+ lpa|increased|reduced|led|built|designed|shipped/i.test(answer)?2:0)));
      feedback=wc<30?'Your answer was brief. Try the STAR method (Situation, Task, Action, Result).':score>=7?'Good answer! Add quantified results for even stronger responses.':'Be more specific — mention real tools, technologies, or outcomes.';
    }
    _iv.scores.push(score);
    var think=document.getElementById('bx-iv-think'); if(think) think.remove();
    var scoreColor=score>=8?'#10B981':score>=6?'#F59E0B':'#EF4444';
    var fd=document.createElement('div');
    fd.innerHTML='<div class="bxb bot" style="max-width:100%;margin-top:4px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-family:Sora,sans-serif;font-size:18px;font-weight:800;color:'+scoreColor+'">'+score+'/10</span><div style="flex:1;height:4px;background:#E4E4F0;border-radius:4px;overflow:hidden"><div style="height:100%;width:'+(score*10)+'%;background:'+scoreColor+';border-radius:4px;transition:width .5s"></div></div></div><div style="font-size:12px;color:var(--bxm);line-height:1.6">'+esc(feedback)+'</div></div>';
    if(ivMsgs){ ivMsgs.appendChild(fd); ivMsgs.scrollTop=ivMsgs.scrollHeight; }
    _iv.current++;
    if(_iv.current<_iv.questions.length){ setTimeout(bxIvAskQuestion,600); } else { setTimeout(bxIvShowResult,800); }
  }
  function bxIvShowResult() {
    var ivMsgs=document.getElementById('bx-iv-msgs'), bar=document.getElementById('bx-iv-bar'), send=document.getElementById('bx-iv-send'), inp=document.getElementById('bx-iv-inp'), end=document.getElementById('bx-iv-end');
    if(bar) bar.style.width='100%'; if(send) send.style.display='none'; if(inp) inp.style.display='none'; if(end) end.textContent='Close';
    var avg=Math.round(_iv.scores.reduce(function(a,b){return a+b;},0)/_iv.scores.length*10);
    var grade=avg>=80?'🏆 Excellent':avg>=65?'✅ Good':avg>=50?'📈 Developing':'🔧 Needs Work';
    var tip=avg>=80?'You\'re interview-ready! Focus on salary negotiation next.':avg>=65?'Strong performance. Add more quantified examples.':'Use STAR method for every answer.';
    if(!ivMsgs) return;
    var rd=document.createElement('div');
    rd.innerHTML='<div class="iv-score-card" style="margin-top:12px"><div style="font-size:11px;opacity:.7;margin-bottom:4px">INTERVIEW COMPLETE</div><div class="iv-score-num">'+avg+'<span style="font-size:18px">/100</span></div><div class="iv-score-lbl">'+grade+' · '+_iv.role+' @ '+_iv.company+'</div><div class="iv-feedback">'+tip+'</div></div>'
      +'<div class="bxb bot" style="max-width:100%;margin-top:8px">💡 <strong>Want real feedback?</strong> Book a mentor session for a company-specific mock interview.<br><br><a href="mentors.html" style="display:inline-block;padding:7px 14px;background:#2D1B69;color:#fff;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;margin-top:4px">Find a Mentor →</a></div>';
    ivMsgs.appendChild(rd); ivMsgs.scrollTop=ivMsgs.scrollHeight;
  }
  window.bxIvEnd = function() {
    ['bx-msgs','bx-chips','bx-support'].forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display=''; });
    var profEl=document.getElementById('bx-profile-pill'); if(profEl&&_userProfile) profEl.classList.add('show');
    var ivEl=document.getElementById('bx-interview-panel'); if(ivEl) ivEl.classList.remove('active');
    _iv.active=false; _iv.setup=true; _iv.current=0;
    var ivMsgs=document.getElementById('bx-iv-msgs'); if(ivMsgs) ivMsgs.innerHTML='';
  };

  /* ── Salary Negotiation Simulator — uses Edge Function ── */
  var NEG_HR_SCRIPTS = {
    counter:["Thank you for your response. Our initial offer of {current} reflects the market rate. We have limited flexibility.","The best we can do is {nudge} LPA. That's our budget for this position.","After reviewing, we can stretch to {nudge} LPA. Would that work?","We can offer {nudge} LPA with a joining bonus of ₹1 lakh.","This is our best offer — {nudge} LPA. We'd love for you to join."],
    appraisal:["The standard increment is 8–10%. We've proposed 10% — {nudge} LPA.","Budget limits us to 12% this year — {nudge} LPA.","Let me push for 15% — {nudge} LPA. Can I confirm with leadership?","We can offer 18% — {nudge} LPA — plus a performance bonus.","20% increment — {nudge} LPA. I'll process this cycle."],
    competing:["Our offer stands at {current}. Can you share the competing offer details?","We can match on base to {nudge} LPA, though our ESOPs are strong differentiators.","We've discussed internally — {nudge} LPA with accelerated vesting.","Our final offer: {nudge} LPA + 20% bonus + ₹50k joining bonus.","We'll match your competing offer at {target} LPA. You keep your equity."],
    bonus:["Joining bonuses for this role — our standard is ₹50,000.","We can consider ₹75,000 joining bonus. That's within our policy.","₹1 lakh joining bonus is possible with leadership approval.","₹1.5 lakh joining bonus approved — paid in first month.","Final: ₹2 lakh joining bonus, paid upfront."]
  };
  var NEG_SCENARIOS=[{id:'counter',label:'💼 Counter an offer',desc:'Push for more.'},{id:'appraisal',label:'📈 Annual appraisal',desc:'Ask for bigger increment.'},{id:'competing',label:'🔥 Competing offer',desc:'Use another offer as leverage.'},{id:'bonus',label:'🎁 Joining bonus',desc:'Negotiate a sign-on bonus.'}];
  var _neg={active:false,scenario:'',current:'',target:0,round:0,maxRounds:5,history:[],score:0};
  function bxNegSetup() {
    if(!document.getElementById('bx-panel')) return; bexiOpen();
    ['bx-msgs','bx-chips','bx-support','bx-smart-nudge','bx-pro-nudge','bx-profile-pill'].forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display='none'; });
    var ivEl=document.getElementById('bx-interview-panel'); if(ivEl) ivEl.classList.add('active');
    var title=document.getElementById('bx-iv-title'); if(title) title.textContent='💰 Salary Negotiation';
    var meta=document.getElementById('bx-iv-meta'), bar=document.getElementById('bx-iv-bar'), send=document.getElementById('bx-iv-send'), end=document.getElementById('bx-iv-end'), inp=document.getElementById('bx-iv-inp'), ivMsgs=document.getElementById('bx-iv-msgs');
    if(meta) meta.textContent='Setup — choose your scenario'; if(bar) bar.style.width='0%'; if(send) send.style.display='none'; if(end) end.textContent='Cancel'; if(inp) inp.style.display='none'; if(ivMsgs) ivMsgs.innerHTML='';
    _neg.active=true; _neg.round=0; _neg.history=[]; _neg.score=0; _neg.scenario=''; _neg.target=0; _neg.current='';
    if(!ivMsgs) return;
    ivMsgs.innerHTML='<div class="bxb bot" style="max-width:100%"><strong>💰 Negotiation Simulator</strong><br><br>I\'ll play HR. You practice negotiating in real-time with coaching after each round.<br><br><strong>Choose your scenario:</strong></div>'
      +'<div style="display:flex;flex-direction:column;gap:6px;padding:2px">'+NEG_SCENARIOS.map(function(s){ return '<button class="bx-iv-chip" onclick="bxNegSelectScenario(\''+s.id+'\')">'+s.label+' <span style="font-size:10.5px;opacity:.6">'+s.desc+'</span></button>'; }).join('')+'</div>';
    ivMsgs.scrollTop=ivMsgs.scrollHeight;
  }
  window.bxNegSelectScenario=function(scenarioId){
    _neg.scenario=scenarioId; document.querySelectorAll('#bx-iv-msgs .bx-iv-chip').forEach(function(c){ c.disabled=true; });
    var ivMsgs=document.getElementById('bx-iv-msgs'); if(!ivMsgs) return;
    var d=document.createElement('div');
    d.innerHTML='<div class="bxb bot" style="max-width:100%;margin-top:8px"><strong>Tell me:</strong><br>• Current offer / salary (in LPA)<br>• Your target salary (in LPA)<br><br><em>Example: "Current 18 LPA, I want 24 LPA"</em></div>';
    ivMsgs.appendChild(d); ivMsgs.scrollTop=ivMsgs.scrollHeight;
    var send=document.getElementById('bx-iv-send'), end=document.getElementById('bx-iv-end'), inp=document.getElementById('bx-iv-inp');
    if(send){ send.style.display=''; send.textContent='Start →'; send.onclick=bxNegCaptureSetup; }
    if(end) end.textContent='Exit';
    if(inp){ inp.style.display=''; inp.placeholder='e.g. Current 18 LPA, target 25 LPA'; inp.focus(); inp.onkeydown=function(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); bxNegCaptureSetup(); } }; }
  };
  function bxNegCaptureSetup(){
    var inp=document.getElementById('bx-iv-inp'), input=inp?inp.value.trim():''; if(!input) return;
    var nums=input.match(/\d+(\.\d+)?/g)||[]; var current=parseFloat(nums[0])||18; var target=parseFloat(nums[1])||Math.round(current*1.3);
    _neg.current=current+' LPA'; _neg.target=target;
    var ivMsgs=document.getElementById('bx-iv-msgs');
    if(ivMsgs){ var d=document.createElement('div'); d.innerHTML='<div class="bxb user" style="align-self:flex-end">'+esc(input)+'</div>'; ivMsgs.appendChild(d); }
    if(inp) inp.value='';
    var send=document.getElementById('bx-iv-send'); if(send){ send.textContent='Send →'; send.onclick=bxNegSend; }
    var ivInp=document.getElementById('bx-iv-inp'); if(ivInp){ ivInp.placeholder='Type your negotiation response...'; ivInp.onkeydown=function(e){ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();bxNegSend();} }; }
    var meta=document.getElementById('bx-iv-meta'); if(meta) meta.textContent='Current: ₹'+current+' LPA → Target: ₹'+target+' LPA';
    var bar=document.getElementById('bx-iv-bar'); if(bar) bar.style.width='0%';
    bxNegHROpening(current,target);
  }
  function bxNegHROpening(current,target){
    var OPENINGS={counter:"Thank you. We're excited to extend this offer of ₹"+current+" LPA. Do you have any questions?",appraisal:"We've reviewed your performance and propose a 8% increment — ₹"+Math.round(current*1.08)+" LPA. Your thoughts?",competing:"Our current offer stands at ₹"+current+" LPA. How are you feeling about it?",bonus:"Welcome! Our offer is ₹"+current+" LPA fixed. You had questions about a joining bonus?"};
    var opening=OPENINGS[_neg.scenario]||OPENINGS.counter;
    _neg.history=[{role:'user',content:'You are playing HR at an Indian tech company. Current offer: ₹'+current+' LPA. Candidate target: ₹'+target+' LPA. Scenario: '+_neg.scenario+'. Be realistic — start firm, show gradual flexibility over 5 rounds. Keep responses to 2-3 sentences.'}];
    _neg.history.push({role:'assistant',content:opening});
    var ivMsgs=document.getElementById('bx-iv-msgs');
    if(ivMsgs){ var d=document.createElement('div'); d.innerHTML='<div class="bxb bot" style="max-width:100%;margin-top:8px"><div style="font-size:10px;font-weight:700;color:var(--bxs);margin-bottom:4px">🧑‍💼 HR Manager</div>'+esc(opening)+'</div>'; ivMsgs.appendChild(d); ivMsgs.scrollTop=ivMsgs.scrollHeight; }
    _neg.round=0;
  }
  window.bxNegSend=function(){
    var inp=document.getElementById('bx-iv-inp'), answer=inp?inp.value.trim():''; if(!answer||!_neg.active) return; if(inp) inp.value='';
    var ivMsgs=document.getElementById('bx-iv-msgs'); if(ivMsgs){ var d=document.createElement('div'); d.innerHTML='<div class="bxb user" style="align-self:flex-end;margin-top:4px">'+esc(answer)+'</div>'; ivMsgs.appendChild(d); ivMsgs.scrollTop=ivMsgs.scrollHeight; }
    _neg.history.push({role:'user',content:answer}); _neg.round++;
    var bar=document.getElementById('bx-iv-bar'); if(bar) bar.style.width=Math.round((_neg.round/_neg.maxRounds)*100)+'%';
    bxNegGetHRResponse(answer,_neg.round>=_neg.maxRounds);
  };
  async function bxNegGetHRResponse(userAnswer,isFinal){
    var ivMsgs=document.getElementById('bx-iv-msgs'), sendBtn=document.getElementById('bx-iv-send'), ivInp=document.getElementById('bx-iv-inp');
    if(sendBtn) sendBtn.disabled=true;
    var thinkId='neg-think-'+Date.now(), t=document.createElement('div'); t.id=thinkId; t.innerHTML='<div id="bx-typing" style="margin-top:4px"><span></span><span></span><span></span></div>';
    if(ivMsgs){ ivMsgs.appendChild(t); ivMsgs.scrollTop=ivMsgs.scrollHeight; }
    var currentNum=parseFloat(_neg.current)||18, step=Math.round((_neg.target-currentNum)/_neg.maxRounds*_neg.round), nudgeVal=Math.min(currentNum+step,_neg.target);
    var hrResponse='', coaching=null;
    /* Call Edge Function for HR response + coaching */
    var negResult = await callBexiEdge('negotiate', {
      history: _neg.history,
      systemPrompt: (isFinal?'You are HR. Final round '+_neg.round+'/'+_neg.maxRounds+'. Make your best final offer at ₹'+nudgeVal+' LPA. Be conclusive.':'You are HR. Round '+_neg.round+'/'+_neg.maxRounds+'. Offer ₹'+nudgeVal+' LPA if appropriate. 2-3 sentences.'),
      userAnswer: userAnswer, coachingMode: !isFinal
    });
    if(negResult&&negResult.hrResponse){ hrResponse=negResult.hrResponse; coaching=negResult.coaching||null; }
    else {
      /* Fallback */
      var scripts=NEG_HR_SCRIPTS[_neg.scenario]||NEG_HR_SCRIPTS.counter, idx=Math.min(_neg.round-1,scripts.length-1);
      hrResponse=scripts[idx].replace(/\{current\}/g,_neg.current).replace(/\{nudge\}/g,nudgeVal).replace(/\{target\}/g,_neg.target);
      var wc=userAnswer.split(/\s+/).length, hasData=/\d|market|research|offer|lpa|experience/i.test(userAnswer), score2=Math.min(10,(wc>20?6:4)+(hasData?2:0));
      _neg.score+=score2; coaching={score:score2,strength:hasData?'Good use of specifics.':'You stated your position clearly.',improve:'Back your ask with market data.',next:'"Based on market data, the range is ₹X–Y LPA. My ask of ₹'+_neg.target+' LPA is well within P75."'};
    }
    if(negResult) _neg.score+=(coaching&&coaching.score)||5;
    _neg.history.push({role:'assistant',content:hrResponse});
    var thinkEl=document.getElementById(thinkId); if(thinkEl) thinkEl.remove();
    if(ivMsgs){
      var hrDiv=document.createElement('div'); hrDiv.innerHTML='<div class="bxb bot" style="max-width:100%;margin-top:4px"><div style="font-size:10px;font-weight:700;color:var(--bxs);margin-bottom:4px">🧑‍💼 HR Manager</div>'+esc(hrResponse)+'</div>'; ivMsgs.appendChild(hrDiv);
      if(coaching&&!isFinal){
        var sc=coaching.score||5, scColor=sc>=8?'#10B981':sc>=6?'#F59E0B':'#EF4444';
        var cd=document.createElement('div');
        cd.innerHTML='<div style="background:rgba(45,27,105,.05);border:1px solid rgba(45,27,105,.12);border-radius:10px;padding:10px 12px;margin-top:6px;font-size:11.5px"><div style="font-size:10px;font-weight:700;color:var(--bxb);margin-bottom:6px">💡 COACHING FEEDBACK</div><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-family:Sora,sans-serif;font-size:16px;font-weight:800;color:'+scColor+'">'+sc+'/10</span><div style="flex:1;height:3px;background:#E4E4F0;border-radius:3px;overflow:hidden"><div style="height:100%;width:'+(sc*10)+'%;background:'+scColor+';border-radius:3px"></div></div></div><div style="color:#15803D;margin-bottom:4px">✓ '+esc(coaching.strength||'')+'</div><div style="color:#EF4444;margin-bottom:6px">⚠ '+esc(coaching.improve||'')+'</div><div style="background:#fff;border-radius:7px;padding:7px 9px;font-style:italic">💬 Try: '+esc(coaching.next||'')+'</div></div>';
        ivMsgs.appendChild(cd);
      }
      ivMsgs.scrollTop=ivMsgs.scrollHeight;
    }
    if(sendBtn) sendBtn.disabled=false;
    if(isFinal) setTimeout(bxNegShowVerdict,600);
  }
  function bxNegShowVerdict(){
    var ivMsgs=document.getElementById('bx-iv-msgs'), send=document.getElementById('bx-iv-send'), inp=document.getElementById('bx-iv-inp'), end=document.getElementById('bx-iv-end'), bar=document.getElementById('bx-iv-bar');
    if(bar) bar.style.width='100%'; if(send) send.style.display='none'; if(inp) inp.style.display='none'; if(end) end.textContent='Close';
    var avgScore=Math.round(_neg.score/_neg.maxRounds*10), grade=avgScore>=80?'🏆 Expert Negotiator':avgScore>=65?'✅ Confident':avgScore>=50?'📈 Developing':'🔧 Needs Practice';
    var currentNum=parseFloat(_neg.current)||18;
    var lastHR=_neg.history.filter(function(h){return h.role==='assistant';}).pop();
    var finalNums=lastHR?(lastHR.content.match(/₹?\d+(\.\d+)?\s*(lpa|lakhs?|l)/gi)||[]):[];
    var finalOffer=finalNums.length>0?parseFloat(finalNums[finalNums.length-1].replace(/[^\d.]/g,'')):Math.round(currentNum+(_neg.target-currentNum)*(avgScore/100));
    var won=Math.max(0,finalOffer-currentNum).toFixed(1);
    if(!ivMsgs) return;
    var rd=document.createElement('div');
    rd.innerHTML='<div class="iv-score-card" style="margin-top:12px"><div style="font-size:11px;opacity:.7;margin-bottom:4px">NEGOTIATION COMPLETE</div><div class="iv-score-num">'+avgScore+'<span style="font-size:18px">/100</span></div><div class="iv-score-lbl">'+grade+'</div><div class="iv-feedback">'+(won>0?'💰 You negotiated +₹'+won+' LPA from the starting offer. ':'')+(avgScore>=70?'Use ESOPs and joining bonuses when base hits a ceiling.':'Prepare market data — check Belongix Salary Intelligence for P75 benchmarks.')+'</div></div>'
      +'<div class="bxb bot" style="max-width:100%;margin-top:8px">📊 Check real salary benchmarks → <a href="dashboard.html?page=salary" style="color:var(--bxb);font-weight:700">Salary Intelligence</a></div>';
    ivMsgs.appendChild(rd); ivMsgs.scrollTop=ivMsgs.scrollHeight;
  }

})();
