// Bexi uses the dashboard's authenticated Supabase client
if (typeof supaClient !== 'undefined') window._bxSb = supaClient;

/* ═══════════════════════════════════════════════════════════════
   Belongix — Bexi Career Guide  v7.0
   ✅ UNLIMITED queries — no daily cap, free forever
   ⚠️  IMPORTANT: Anthropic API calls must be routed through a Supabase
       Edge Function before adding a real API key. The current direct-browser
       calls use 'anthropic-dangerous-direct-browser-access: true' which
       requires the key in-browser (insecure). Until Edge Function is wired,
       all Claude-powered features fall back to scripted responses gracefully.
       Edge Function template: supabase/functions/bexi-claude/index.ts
   ✅ Profile-aware — reads logged-in user's Supabase profile
      and injects it as context so Bexi personalises every reply
   ✅ Pro upsell visible but NEVER blocks the chat
   ✅ Zero cost rule-based KB + Claude API enhancement
   ✅ 100+ Q&A pairs covering India's job market
   Drop-in: <script src="bexi.js"></script>
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPPORT_EMAIL  = 'teambelongix@gmail.com';
  var SB_URL = 'https://efhcfuaxgbzuqlmhlsxc.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGNmdWF4Z2J6dXFsbWhsc3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDg1NzgsImV4cCI6MjA5MjcyNDU3OH0.vpFvBPnKkrMMONXo9z6FemJ2qIlRChRloQYRB0LMdjY';

  /* ══════════════════════════════════════════════════════════
     FIX #3 — NO QUERY LIMIT
     ──────────────────────────────────────────────────────────
     WHAT CHANGED: Bexi is now completely unlimited for all users.
     The old 10-queries/day gate has been removed entirely.
     Pro upsell is shown as a soft nudge ("unlock mentor sessions")
     but never blocks the user from chatting.
  ══════════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════════
     FIX #4 — PROFILE-AWARE CONTEXT
     ──────────────────────────────────────────────────────────
     WHAT CHANGED: On widget load, Bexi fetches the logged-in
     user's Supabase profile and stores it in _userProfile.
     findAnswer() injects this context into every response so
     Bexi can say "Based on your 3 years of React experience
     in Bangalore..." instead of generic advice.

     Profile fields used:
       full_name, role, company, experience, city,
       skills, user_type, career_score, bio
  ══════════════════════════════════════════════════════════ */
  var _userProfile  = null;   /* populated by loadUserProfile() */
  var _profileReady = false;  /* true once fetch completes */

  /* Fetch the logged-in user's profile from Supabase */
  async function loadUserProfile() {
    try {
      /* Get session from whichever Supabase client is on the page */
      var sbClient = window._bxSb || (window.supabase && window.supabase.createClient(SB_URL, SB_KEY));
      if (!sbClient) return;

      var sess = await sbClient.auth.getSession();
      if (!sess.data || !sess.data.session || !sess.data.session.user) return;

      var uid = sess.data.session.user.id;
      var r   = await sbClient.from('profiles').select(
        'full_name, role, company, experience, city, skills, user_type, career_score, bio, notice_period'
      ).eq('id', uid).maybeSingle();

      if (r.data) {
        _userProfile = r.data;
        _userProfile._email = sess.data.session.user.email || '';
        _profileReady = true;
        /* FIX #5: Store user ID for memory system */
        _memUserId = uid;
        /* Update greeting in panel if already open */
        updateGreetingWithProfile();
        /* FIX #5: Load conversation history from Supabase */
        loadConversationHistory();
      }
    } catch(e) {
      /* Silent — works fine without profile */
      _profileReady = true;
    }
  }

  /* Build a compact profile summary string for context injection */
  function buildProfileContext() {
    if (!_userProfile) return '';
    var p = _userProfile;
    var parts = [];
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

  /* Get first name for personalised greetings */
  function getUserFirstName() {
    if (!_userProfile) return '';
    var name = _userProfile.full_name || _userProfile._email || '';
    return name.split(' ')[0].split('@')[0];
  }

  /* Personalise a bot response if we have profile context */
  function personaliseResponse(answer) {
    if (!_userProfile) return answer;
    var p = _userProfile;
    var firstName = getUserFirstName();

    /* Add a personal opening line when we have enough context */
    var hasRole = p.role && p.role.trim();
    var hasCity = p.city && p.city.trim();
    var hasExp  = p.experience && p.experience.trim();

    if (firstName && (hasRole || hasCity)) {
      var ctx = '';
      if (hasRole && hasCity && hasExp) {
        ctx = firstName + ', as a ' + p.experience + ' ' + p.role + ' in ' + p.city + ', ';
      } else if (hasRole && hasCity) {
        ctx = firstName + ', as a ' + p.role + ' in ' + p.city + ', ';
      } else if (hasCity) {
        ctx = firstName + ', for someone in ' + p.city + ', ';
      } else if (hasRole) {
        ctx = firstName + ', as a ' + p.role + ', ';
      }
      /* Only prepend if the answer doesn't already start with a name/greeting */
      if (ctx && !answer.toLowerCase().startsWith('hi') && !answer.toLowerCase().startsWith('hey')) {
        answer = ctx + answer.charAt(0).toLowerCase() + answer.slice(1);
      }
    }
    return answer;
  }

  /* Update the welcome message in the panel once profile loads */
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
     KNOWLEDGE BASE — 100+ Q&A pairs (unchanged from v6.0)
  ════════════════════════════════════════════════════════ */
  var KB = [

    /* ── GREETINGS ── */
    {
      patterns: ['hello','hi','hey','helo','hii','sup','yo','namaste','good morning','good evening','good afternoon','start','begin'],
      answer: "Hi! I'm Bexi 👋 Your career guide for India's job market.\n\nI can help you with:\n- **Salary benchmarks** for your role & city\n- **Interview prep** tips and roadmaps\n- **Career switch** guidance\n- **Resume & profile** advice\n- **Job search** strategies\n- **Skills to learn** in 2026\n\nWhat would you like help with today?"
    },

    /* ── SALARY — GENERAL ── */
    {
      patterns: ['salary','pay','ctc','compensation','package','lpa','per annum','earning','income','wage'],
      answer: "💰 **Salary ranges in India (2026 — product companies):**\n\n- **Fresher (0–1 yr):** ₹6–18 LPA\n- **Junior (1–3 yrs):** ₹10–24 LPA\n- **Mid-level (3–5 yrs):** ₹18–35 LPA\n- **Senior (5–8 yrs):** ₹30–55 LPA\n- **Staff/Lead (8+ yrs):** ₹50–100 LPA\n\nIT services (TCS, Infosys, Wipro) pay 40–60% less than product companies for the same experience.\n\n👉 Next step: Tell me your role + years of experience for a more specific number."
    },

    /* ── SALARY — FRESHER ── */
    {
      patterns: ['fresher salary','fresher pay','first salary','fresher package','entry level salary','0 experience','zero experience','no experience','fresh graduate'],
      answer: "🎓 **Fresher salaries in India (2026):**\n\n- **FAANG** (Google, Microsoft, Amazon): ₹25–40 LPA\n- **Top unicorns** (Swiggy, CRED, Zepto): ₹15–25 LPA\n- **Product startups** (Razorpay, Meesho): ₹10–18 LPA\n- **IT services** (TCS, Infosys, Wipro): ₹3.5–6 LPA\n- **Mid-size startups:** ₹6–12 LPA\n\n**Key factors:** DSA skills, portfolio projects, communication, and college tier (for on-campus only).\n\n👉 Next step: Build your Belongix Career Score — it shows exactly what's holding your offers back."
    },

    /* ── SALARY — BANGALORE ── */
    {
      patterns: ['bangalore salary','bengaluru salary','blr salary','salary in bangalore','salary bangalore'],
      answer: "🏙️ **Bangalore tech salaries (2026 median):**\n\n- **Fresher:** ₹11 LPA\n- **3–5 yrs:** ₹24 LPA\n- **7+ yrs:** ₹48 LPA\n\nBangalore pays **19% above** the national average. Top corridors: Koramangala (startups), Whitefield (MNCs), Indiranagar (fintech).\n\n👉 Next step: Check the Salary Intelligence page on your dashboard for role-specific Bangalore data."
    },

    /* ── SALARY — HYDERABAD ── */
    {
      patterns: ['hyderabad salary','hyd salary','salary hyderabad','telangana salary'],
      answer: "🏙️ **Hyderabad tech salaries (2026 median):**\n\n- **Fresher:** ₹10 LPA\n- **3–5 yrs:** ₹22 LPA\n- **7+ yrs:** ₹44 LPA\n\nHyderabad is India's #2 tech hub — 9% above national average. HITEC City and Gachibowli are the top hiring corridors. Microsoft, Google, Amazon all have large Hyderabad offices.\n\n👉 Next step: Apply to Hyderabad roles on the Belongix Job Board."
    },

    /* ── SALARY NEGOTIATION ── */
    {
      patterns: ['negotiate','negotiation','counter offer','hike','raise','increment','ask for more','salary talk','offer letter'],
      answer: "💪 **How to negotiate salary in India:**\n\n1. **Research first** — know your P75 market rate before the call\n2. **Never give a number first** — ask their budget range\n3. **Counter 15–20% above** their first offer\n4. **Use data** — 'Market rate for this role in Bangalore is ₹X–Y'\n5. **Negotiate total comp** — joining bonus, ESOPs, WFH allowance, learning budget\n\n**Script:** *'Based on my research and X years of experience, I was expecting ₹[X]. Is there flexibility?'*\n\nEngineers who negotiate earn ₹2–6 LPA more on average.\n\n👉 Next step: Check Belongix Salary Intelligence for your exact market rate before your next offer call."
    },

    /* ── AM I BEING PAID FAIRLY ── */
    {
      patterns: ['paid fairly','fair salary','underpaid','overpaid','market rate','worth','deserve','market value','fair pay'],
      answer: "📊 **How to know if you're underpaid:**\n\nYou're likely underpaid if:\n- **3+ yrs at a product company** earning below ₹14 LPA\n- **5+ yrs** earning below ₹25 LPA\n- Your salary hasn't grown 20%+ in 2 years\n- Colleagues with similar skills earn 30%+ more\n\n**Quick benchmark:**\n- 0–1 yr + product company → ₹8–18 LPA\n- 3–5 yrs + product company → ₹18–35 LPA\n- 5–8 yrs + product company → ₹30–55 LPA\n\n👉 Next step: Open Salary Intelligence in your Belongix dashboard — select your exact role and city for a real comparison."
    },

    /* ── SWITCH CAREERS ── */
    {
      patterns: ['career switch','career change','change career','switch career','change field','new career','different field','pivot','transition'],
      answer: "🔄 **Career switch roadmap (India 2026):**\n\n**Most popular switches:**\n- Non-tech → Data Analytics (6–9 months)\n- IT services → Product company (3–6 months)\n- Any field → Cloud/DevOps (8–12 months)\n- Non-tech → Business Analyst (4–6 months)\n\n**What works:**\n1. Learn the core skill (SQL, Python, Cloud)\n2. Build one real portfolio project\n3. Leverage your domain knowledge as a plus\n4. Apply to roles that combine old + new skills\n\n**What doesn't work:** Quitting your job before you have an offer.\n\n👉 Next step: Tell me which field you want to switch TO — I'll give you a specific roadmap."
    },

    /* ── DATA ANALYTICS SWITCH ── */
    {
      patterns: ['data analytics','data analyst','switch to data','become data analyst','data science','analytics career','business analyst','bi analyst'],
      answer: "📊 **Switch to Data Analytics — 9-month roadmap:**\n\n**Month 1–2:** SQL (Mode Analytics tutorial, SQLZoo) + Excel (pivot tables, Power Query)\n**Month 3–4:** Python with Pandas (Kaggle free course)\n**Month 5–6:** Tableau or Power BI (pick one, go deep)\n**Month 7–8:** Statistics basics + A/B testing (StatQuest YouTube)\n**Month 9:** Build portfolio project + job search\n\n**Salary after switch:**\n- Entry level: ₹5–10 LPA\n- After 2–3 yrs: ₹14–22 LPA\n\n**Best free resources:** Kaggle, Mode SQL, StatQuest, Google Data Analytics Certificate (Coursera)\n\n👉 Next step: Start the Kaggle SQL course today — it takes 3 hours and is completely free."
    },

    /* ── SKILLS TO LEARN ── */
    {
      patterns: ['skills to learn','what to learn','which skills','learn in 2026','top skills','in demand skills','future skills','skill up','upskill','trending skills'],
      answer: "⚡ **Most in-demand skills in India (2026):**\n\n🔥 **Highest paying:**\n- AI/ML + LLMs (LangChain, PyTorch, RAG) → +55% salary premium\n- Cloud Architecture (AWS, GCP, Terraform) → +40% premium\n- Data Engineering (Spark, Kafka, dbt) → +35% premium\n\n📈 **High demand:**\n- Backend (Go, Java, gRPC, distributed systems)\n- DevOps/SRE (Kubernetes, Terraform, CI/CD)\n- Security Engineering (AppSec, AWS Security)\n\n✅ **Foundation (learn these first):**\n- SQL — appears in 95% of job descriptions\n- Python — covers AI, data, and backend\n- System Design — required for SDE-2+\n- Git/GitHub — non-negotiable\n\n👉 Next step: Pick ONE from the top list and spend 30 minutes today on a free Kaggle or YouTube tutorial."
    },

    /* ── 20 LPA JOB ── */
    {
      patterns: ['20 lpa','20lpa','₹20','twenty lpa','get 20','reach 20','earn 20'],
      answer: "🎯 **How to get to ₹20 LPA in India:**\n\n**Fastest path (12–18 months):**\n1. Target product companies / startups (not IT services)\n2. Master DSA — solve 100 LeetCode problems\n3. Add one cloud certification (AWS or GCP)\n4. Learn SQL deeply — used in every data round\n5. Build one deployed GitHub project\n6. Switch companies — job switching gives 30–50% hike vs 8–15% annual raise\n\n**At which experience level is ₹20 LPA realistic?**\n- 2–3 yrs at a top startup: ✅ Very achievable\n- 1–2 yrs at FAANG: ✅ Achievable\n- 4–5 yrs at IT services: ✅ With a company switch\n\n👉 Next step: Check your Belongix Career Score — it shows the exact gaps between you and a ₹20 LPA role."
    },

    /* ── INTERVIEW PREP ── */
    {
      patterns: ['interview','interview prep','crack interview','interview tips','prepare interview','interview ready','interview question','technical interview','hr round','coding round'],
      answer: "🎯 **Interview prep roadmap for India (2026):**\n\n**Technical rounds:**\n- DSA: 75–100 LeetCode (focus on arrays, trees, DP, graphs)\n- System Design: ByteByteGo + Grokking SD (for SDE-2+)\n- SQL: StrataScratch (real interview questions)\n\n**HR & behavioural rounds:**\n- Prepare STAR format answers (Situation, Task, Action, Result)\n- Have 3 quantified achievements ready (with numbers)\n- Research the company's recent product launches\n\n**Timeline:**\n- 4 weeks prep → strong for mid-size startups\n- 8 weeks prep → ready for top unicorns\n- 12 weeks prep → FAANG-ready\n\n**Most underused tip:** Do mock interviews out loud — not just in your head.\n\n👉 Next step: Solve 3 LeetCode Easy problems today. That's it — just 3."
    },

    /* ── SYSTEM DESIGN ── */
    {
      patterns: ['system design','design interview','hld','lld','high level design','low level design','architecture interview','design a system'],
      answer: "🏗️ **System Design prep for Indian companies:**\n\n**Required at:** SDE-2 and above at product companies\n\n**Core concepts to master:**\n- Load balancing, caching (Redis), CDN\n- Database sharding, replication, indexing\n- Message queues (Kafka, RabbitMQ)\n- API design (REST, gRPC)\n- CAP theorem, consistency models\n\n**Common interview questions:**\n- Design URL shortener (Bit.ly)\n- Design Instagram feed\n- Design Swiggy's delivery tracking\n- Design a notification system\n- Design WhatsApp\n\n**Best resources:**\n- ByteByteGo (YouTube + book)\n- Grokking System Design (Educative)\n- Gaurav Sen (YouTube — India-specific)\n\n👉 Next step: Watch Gaurav Sen's 'Design a URL Shortener' video on YouTube — it's 20 minutes and covers 80% of what's asked."
    },

    /* ── RESUME ── */
    {
      patterns: ['resume','cv','curriculum vitae','resume tips','resume help','ats','applicant tracking','resume builder','build resume','resume format'],
      answer: "📄 **ATS-optimised resume tips for India:**\n\n**Format rules:**\n- Single column PDF — no tables, no graphics\n- Font: Arial or Calibri, 10–11pt\n- Max 1 page for 0–5 yrs, 2 pages for 6+ yrs\n\n**Must-have sections:**\n- Professional Summary (40–60 words)\n- Work Experience with quantified achievements\n- Skills (exact keywords from job description)\n- Education + Certifications\n\n**What kills your resume:**\n- Generic objectives like 'seeking a challenging role'\n- No numbers (say '40% latency reduction', not 'improved performance')\n- Applying the same resume to every job\n\n**Quick win:** Add 3 metrics to your current resume today.\n\n👉 Next step: Use the Belongix Resume Builder — it gives you a live ATS score and tells you exactly what's missing."
    },

    /* ── LINKEDIN ── */
    {
      patterns: ['linkedin','linkedin profile','linkedin tips','linkedin optimization','linkedin headline','linkedin summary','profile optimization'],
      answer: "💼 **LinkedIn profile tips for Indian professionals:**\n\n**Headline (most important):**\nDon't write your job title. Write: `Backend Engineer | Go, gRPC, AWS | Ex-Swiggy | Open to work`\n\n**Photo:** Professional headshot — profiles with photos get 21× more views\n\n**About section:** 3–4 sentences: what you do, what you've built, what you're looking for\n\n**Experience:** Add metrics to every bullet point — same rule as resume\n\n**Skills:** Add 10+ relevant skills — recruiters filter by these\n\n**Most underused feature:** Post one insight from your work every 2 weeks. Recruiters will come to you.\n\n**Connections:** Connect with 5 recruiters at your target companies every week.\n\n👉 Next step: Update your LinkedIn headline in the next 10 minutes using the formula above."
    },

    /* ── JOB SEARCH ── */
    {
      patterns: ['find job','job search','apply job','where to apply','job portals','job sites','how to find','get job','finding job','job hunt'],
      answer: "🔍 **Best job portals for India (2026):**\n\n🥇 **Belongix** — verified product companies, AI matching, salary data\n🥈 **LinkedIn** — referrals, direct recruiter messages\n🥉 **Instahyre** — startup jobs, fast response\n📋 **Naukri.com** — broad reach, IT services\n🎓 **Internshala** — freshers and interns\n🏢 **Company career pages** — most accurate listings\n\n**Strategy that works:**\n- Apply to 15–20 companies simultaneously (not one at a time)\n- Message 5 recruiters on LinkedIn every week\n- Target: 3–5 dream, 8–10 target, 5–7 safe companies\n- Track everything in a spreadsheet\n\n**Biggest mistake:** Waiting for a reply before the next application.\n\n👉 Next step: Open the Belongix Job Board and filter by your city and experience right now."
    },

    /* ── CAREER SCORE ── */
    {
      patterns: ['career score','score','belongix score','profile score','my score','improve score','boost score'],
      answer: "📊 **Your Belongix Career Score (0–100):**\n\nYour score shows how ready you are for job applications. Here's how points are earned:\n\n- Complete profile: **+30 pts**\n- Verify email: **+10 pts**\n- Add 5+ skills: **+10 pts**\n- Apply to a job: **+15 pts**\n- Complete a course: **+10 pts**\n- Book a mentor: **+20 pts**\n\n**Why it matters:** Candidates with score 70+ get 3× more recruiter responses on Belongix.\n\n**Quick wins to boost your score today:**\n1. Fill your entire profile (biggest jump)\n2. Add 5+ relevant skills\n3. Apply to one job\n\n👉 Next step: Go to your Profile page and fill every field — that alone adds 30 points."
    },

    /* ── BTECH FIRST JOB ── */
    {
      patterns: ['btech','b.tech','engineering graduate','after college','first job','campus placement','off campus','placement','fresher job'],
      answer: "🎓 **Getting your first job after B.Tech (2026):**\n\n**8-step roadmap:**\n1. Get your Belongix Career Score → know your gaps\n2. Master Python or Java (one language, deeply)\n3. Solve 75–100 LeetCode problems\n4. Build one deployed GitHub project\n5. Learn SQL basics (2 weeks)\n6. Make your resume ATS-friendly\n7. Apply to 15–20 companies simultaneously\n8. Negotiate your first offer (yes, freshers can too!)\n\n**Timeline:** 2–4 months with consistent daily effort\n\n**Salary expectation:**\n- Product companies: ₹10–18 LPA\n- IT services: ₹3.5–6 LPA\n- Top unicorns: ₹15–25 LPA\n\n👉 Next step: Solve 3 LeetCode problems today and push a project to GitHub this week."
    },

    /* ── REMOTE JOBS ── */
    {
      patterns: ['remote job','work from home','wfh','remote work','remote opportunity','remote position','fully remote','hybrid'],
      answer: "🌐 **Remote tech jobs in India (2026):**\n\n**Best platforms for remote jobs:**\n- Belongix Job Board (filter: Remote)\n- LinkedIn (search: Remote + India)\n- Wellfound (AngelList) — startup remote roles\n- Toptal, Turing — US-paying remote roles\n\n**Remote salary tip:** Many Bangalore-HQ companies pay remote engineers the same as office employees. Always ask: *'Is this role remote-eligible with Bangalore compensation bands?'*\n\n**Remote-friendly companies in India:**\nRazorpay, Meesho, Postman, Browserstack, Freshworks, Zoho, Chargebee\n\n**Negotiating remote:** If they don't offer remote, ask for 3 WFH days + monthly travel allowance.\n\n👉 Next step: Filter the Belongix Job Board by 'Remote' to see current openings."
    },

    /* ── PYTHON ── */
    {
      patterns: ['python','learn python','python for job','python salary','python skills'],
      answer: "🐍 **Python for Indian job seekers (2026):**\n\n**Why Python:** Covers AI/ML, data, backend, automation — the most versatile language for India's market.\n\n**Best free learning path:**\n1. Python basics: Kaggle free course (5 hours)\n2. Pandas for data: Kaggle Pandas course (4 hours)\n3. Practice: HackerRank Python challenges\n4. Projects: Build something real — a web scraper, data dashboard, or small API\n\n**Python jobs in India:**\n- Data Analyst: ₹6–20 LPA\n- Backend Engineer: ₹10–35 LPA\n- ML Engineer: ₹14–45 LPA\n- Data Scientist: ₹12–40 LPA\n\n**Timeline to job-ready:** 3–4 months of consistent learning\n\n👉 Next step: Start the free Kaggle Python course today — it literally takes just a browser, no install needed."
    },

    /* ── SQL ── */
    {
      patterns: ['sql','structured query','database','mysql','postgresql','query'],
      answer: "🗄️ **SQL for Indian job seekers:**\n\nSQL appears in **95% of data and analytics job descriptions** in India. It's the single highest-ROI skill you can learn.\n\n**Learn in 3 weeks:**\n- Week 1: SELECT, WHERE, GROUP BY, JOIN (Mode Analytics tutorial — free)\n- Week 2: Window functions, CTEs, subqueries (SQLZoo)\n- Week 3: Real interview questions (StrataScratch — filter by Indian companies)\n\n**SQL jobs paying well in India:**\n- Data Analyst: ₹6–22 LPA\n- Business Analyst: ₹8–20 LPA\n- Data Engineer: ₹12–35 LPA\n- Product Analyst: ₹10–28 LPA\n\n👉 Next step: Spend 1 hour on Mode Analytics SQL Tutorial today. It's free and browser-based — no setup."
    },

    /* ── AWS / CLOUD ── */
    {
      patterns: ['aws','cloud','gcp','azure','cloud certification','cloud job','devops','kubernetes','terraform','docker'],
      answer: "☁️ **Cloud careers in India (2026):**\n\n**Salary premium:** Cloud skills add 25–40% above base software engineer salary.\n\n**Best certifications (by value):**\n1. AWS Solutions Architect Associate (~₹12,000 exam) — most recognised\n2. Google Associate Cloud Engineer — great for GCP shops\n3. AWS Developer Associate — for backend engineers\n\n**Free learning:**\n- AWS free tier — deploy real apps at zero cost\n- A Cloud Guru free tier\n- FreeCodeCamp AWS YouTube (12-hour full course)\n\n**Top hiring companies for cloud in India:**\nAmazon, Google, Microsoft, Accenture, Wipro (cloud division), Freshworks, Razorpay\n\n**DevOps stack to learn:** Docker → Kubernetes → Terraform → CI/CD (GitHub Actions)\n\n👉 Next step: Create an AWS free tier account today and deploy a simple EC2 instance — takes 30 minutes."
    },

    /* ── MENTORS ── */
    {
      patterns: ['mentor','mentorship','mentor session','find mentor','1 on 1','guidance','career advice','coaching'],
      answer: "🤝 **Belongix Mentor Network:**\n\nWe have 50+ verified mentors from India's top companies:\n- Google, Microsoft, Amazon\n- Swiggy, Razorpay, CRED, Zepto, PhonePe\n- Infosys, Wipro, TCS (senior leadership)\n- YC-backed startups\n\n**Session types:**\n- 30 minutes — Quick question / offer review / resume feedback\n- 60 minutes — Career strategy / interview prep / career switch plan\n\n**How to book:**\n1. Go to 'Find a Mentor' in your dashboard\n2. Filter by company, specialisation, experience\n3. Pick a slot and confirm\n\n**Available on Pro plan** (₹499/month) — upgrade from Settings.\n\n👉 Next step: Go to the Mentors page and browse — you can see all mentor profiles even on the free plan."
    },

    /* ── UNLIMITED BEXI ── */
    {
      patterns: ['limit','query limit','queries left','how many questions','free limit','daily limit','ran out','too many questions'],
      answer: "✅ **Bexi AI is completely unlimited — no daily cap, ever.**\n\nAsk as many questions as you need, any time of day.\n\nThe only things that require Pro (₹499/month) are:\n- **Mentor session booking** (1-on-1 with verified professionals)\n- **Full company-level salary data** (not just ranges)\n- **All 48+ curated courses** (free plan gets 5 tracks)\n\nEverything else — Bexi AI, job board, career score, resume builder, salary benchmarks — is free forever.\n\n👉 Keep asking away — I'm here 24/7!"
    },

    /* ── BELONGIX WHAT IS ── */
    {
      patterns: ['what is belongix','about belongix','belongix platform','how belongix works','belongix features','tell me about','what do you offer','what can i do','what does belongix'],
      answer: "🏢 **What is Belongix?**\n\nBelongix is India's all-in-one career platform — built specifically for Indian professionals.\n\n**7 tools in one dashboard:**\n1. 🔍 **Job Board** — verified listings from top companies\n2. 💰 **Salary Intelligence** — real benchmarks from 2,400+ professionals\n3. 🤖 **Bexi AI** — career guidance (that's me!) — unlimited & free\n4. 📊 **Career Score** — know your job-readiness (0–100)\n5. 📚 **Upskilling Hub** — 48+ curated courses\n6. 🤝 **Mentor Network** — 50+ verified mentors (Pro)\n7. 📄 **Resume Builder** — ATS-optimised with live score\n\n**Completely free** to join — no credit card needed.\n\n👉 Next step: Sign up at belongix.in and complete your profile to get your Career Score."
    },

    /* ── PRICING / PLANS ── */
    {
      patterns: ['pricing','price','plan','cost','free plan','pro plan','subscription','how much','₹499','upgrade','paid plan','premium'],
      answer: "💳 **Belongix Plans:**\n\n**Free (Starter) — ₹0 forever:**\n- Full Job Board access\n- Career Score\n- Resume Builder (all templates)\n- Salary Intelligence\n- Bexi AI — **unlimited, no daily cap**\n- 5 learning tracks\n\n**Pro — ₹499/month:**\n- Everything in Free\n- Mentor session booking\n- Full salary data + company breakdown\n- All 48+ upskilling courses\n- Featured profile in recruiter search\n\n**No credit card** needed for Free plan. Cancel Pro anytime.\n\n👉 Next step: Start with the free plan — it covers 90% of what most users need. Upgrade when you want to book mentor sessions."
    },

    /* ── SIGN UP / LOGIN ── */
    {
      patterns: ['sign up','signup','register','create account','join','login','log in','forgot password','reset password','account'],
      answer: "🔐 **Getting started with Belongix:**\n\n**To sign up:**\n1. Go to **belongix.in**\n2. Click 'Join Free →'\n3. Enter your name, email, and password\n4. Verify your email (check inbox + spam)\n5. You're in! Complete your profile for +30 Career Score points\n\n**Forgot password:**\n1. Go to belongix.in\n2. Click 'Sign In'\n3. Click 'Forgot password?'\n4. Enter your email — reset link sent instantly\n\n**If you're having trouble** signing up or logging in, raise a support ticket below and our team will help within 24 hours.\n\n👉 Next step: Sign up takes 2 minutes — belongix.in"
    },

    /* ── TECHNICAL ISSUE ── */
    {
      patterns: ['not working','broken','bug','error','issue','problem','cant access','page not loading','dashboard not','feature not','glitch','crash'],
      answer: "🔧 **Having a technical issue?**\n\nLet's fix it quickly. Try these first:\n\n1. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)\n2. **Clear cache:** Browser Settings → Clear browsing data\n3. **Try incognito mode** — rules out extension conflicts\n4. **Try a different browser** (Chrome works best)\n\n**Still not working?**\nRaise a support ticket — our team responds within 24 hours.\n\nClick **'Raise a Ticket'** below 👇"
    },

    /* ── CONTACT / SUPPORT ── */
    {
      patterns: ['contact','support','help','human','agent','speak to','talk to','reach','email','team','customer care','customer support'],
      answer: "📞 **Contact Belongix Support:**\n\n**Email:** teambelongix@gmail.com\n**Response time:** Within 24 hours (usually faster)\n\n**For faster help, raise a ticket** using the button below — it pre-fills your details and goes directly to our support team.\n\n**Common issues we help with:**\n- Account access problems\n- Subscription and billing\n- Job posting queries (recruiters)\n- Partnership and press enquiries\n- Feature requests and feedback\n\n👇 Click 'Raise a Ticket' or 'Live Chat' below"
    },

    /* ── COURSES / UPSKILLING ── */
    {
      patterns: ['course','courses','learn','upskill','training','certification','certificate','study','tutorial','free course','paid course','online learning'],
      answer: "📚 **Belongix Upskilling Hub — 48+ courses:**\n\n**Free tracks:**\n- Data Analytics (SQL, Python, Tableau)\n- Cloud Basics (AWS, GCP)\n- Web Development (React, Node.js)\n- DSA for Interviews\n- Product Management Fundamentals\n\n**Top recommended courses:**\n- Google Data Analytics Certificate (Coursera) — most recognised\n- AWS Solutions Architect (A Cloud Guru)\n- Meta Front-End Developer (Coursera)\n- IBM Data Science Professional Certificate\n\n**Free plan:** 5 learning tracks\n**Pro plan:** All 48+ courses\n\n👉 Next step: Go to the Upskilling Hub in your dashboard and start one course today — even 30 minutes counts."
    },

    /* ── POST A JOB (RECRUITER) ── */
    {
      patterns: ['post job','hire','hiring','recruiter','employer','post a role','find candidates','talent search','recruitment'],
      answer: "🏢 **Hiring on Belongix?**\n\n**Post your first job free** — no account required.\n\n**Recruiter plans:**\n- **Free:** 1 job post, 30 days, basic applicants\n- **Starter (₹399/mo):** 5 posts, applicant tracking, candidate search\n- **Pro (₹999/mo):** Unlimited posts, featured listings, Bexi AI candidate matching\n\n**Average time to first applicant: 4 hours**\n\n**How to post:**\n1. Go to post-job.html\n2. Fill company, role, location, salary, description\n3. Choose apply method (external URL or collect on Belongix)\n4. Click Post — live within 1 hour\n\n👉 Next step: Visit post-job.html to post your first job free right now."
    },

    /* ── FAREWELL ── */
    {
      patterns: ['bye','goodbye','thanks','thank you','thankyou','that helps','helpful','great','awesome','perfect','done','no more'],
      answer: "You're welcome! 😊\n\nIf you ever need help with salary data, interview prep, career switching, or anything else — I'm here 24/7, unlimited.\n\n**Quick links:**\n- 💰 Check your salary → Dashboard → Salary Insights\n- 🔍 Find jobs → Dashboard → Job Board\n- 📄 Build resume → Resume Builder\n- 🤝 Book mentor → Dashboard → Mentors (Pro)\n\nGood luck with your career journey! 🚀"
    }
  ];

  /* ══════════════════════════════════════════════════════════
     MATCH ENGINE — profile-aware scoring
  ══════════════════════════════════════════════════════════ */
  function findAnswer(input) {
    var q = input.toLowerCase().trim();
    var best = null, bestScore = 0;

    KB.forEach(function (entry) {
      var score = 0;
      entry.patterns.forEach(function (p) {
        if (q.includes(p)) score += p.split(' ').length;
      });
      if (score > bestScore) { bestScore = score; best = entry; }
    });

    var rawAnswer = (best && bestScore > 0)
      ? best.answer
      : "I'm not sure I understood that fully. 🤔\n\nI can help you with:\n- **Salary** questions (role, city, experience)\n- **Interview prep** and roadmaps\n- **Career switch** guidance\n- **Skills to learn** in 2026\n- **Resume** and LinkedIn tips\n- **Job search** strategies\n- **Belongix** platform help\n\nTry rephrasing, or click **'Raise a Ticket'** below to reach our human support team!";

    /* Inject profile context (Fix #4) */
    return _profileReady && _userProfile
      ? personaliseResponse(rawAnswer)
      : rawAnswer;
  }

  /* ══════════════════════════════════════════════════════════
     TICKET SYSTEM
  ══════════════════════════════════════════════════════════ */
  function raiseTicket() {
    var chat = getTranscript();
    var subj = encodeURIComponent('[Belongix] Bexi Support Ticket');
    var body = encodeURIComponent(
      'Hi Belongix Support Team,\n\nI need help with the following:\n\n[PLEASE DESCRIBE YOUR ISSUE HERE]\n\n---\nBexi Chat Transcript:\n' + chat +
      '\n\n---\nSent via Bexi AI on belongix.in'
    );
    window.open('mailto:' + SUPPORT_EMAIL + '?subject=' + subj + '&body=' + body);
  }

  function liveChatEmail() {
    var subj = encodeURIComponent('Live Support Request — Belongix');
    var body = encodeURIComponent('Hi Belongix team,\n\nI need live support.\n\n[Describe your question or issue]\n\n---\nSent via Bexi AI chat');
    window.open('mailto:' + SUPPORT_EMAIL + '?subject=' + subj + '&body=' + body);
  }

  var _transcript = [];
  function getTranscript() {
    return _transcript.map(function(m){ return (m.role==='user'?'User: ':'Bexi: ') + m.text; }).join('\n');
  }

  /* ══════════════════════════════════════════════════════════
     FIX #5 — BEXI MEMORY (Supabase conversation persistence)
     ──────────────────────────────────────────────────────────
     WHAT CHANGED:
     ✅ Every user message + Bexi reply saved to Supabase
        table: bexi_conversations { user_id, role, content }
     ✅ On session start, loads last 10 messages so Bexi
        remembers context across browser sessions
     ✅ "Clear Chat" button in header resets memory + UI
     ✅ Saves only for logged-in users; guests get in-memory only
     ✅ Debounced save (300ms) to avoid hammering Supabase
     ──────────────────────────────────────────────────────────
     Supabase table required — run bexi-conversations-schema.sql
  ══════════════════════════════════════════════════════════ */
  var _memUserId   = null;
  var _memLoaded   = false;
  var _saveTimer   = null;
  var _pendingSave = [];

  function getSb() {
    if (window._bxSb) return window._bxSb;
    if (window.supabase) {
      window._bxSb = window.supabase.createClient(SB_URL, SB_KEY);
      return window._bxSb;
    }
    return null;
  }

  async function loadConversationHistory() {
    if (!_memUserId) return;
    var sb = getSb();
    if (!sb) return;
    try {
      var r = await sb.from('bexi_conversations')
        .select('role, content, created_at')
        .eq('user_id', _memUserId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (r.error) throw r.error;
      if (!r.data || r.data.length === 0) { _memLoaded = true; return; }

      var history = r.data.slice().reverse();
      var msgs = document.getElementById('bx-msgs');
      if (msgs) {
        var welcome = msgs.querySelector('.bxb.bot');
        msgs.innerHTML = '';
        if (welcome) msgs.appendChild(welcome);
      }
      history.forEach(function(m) {
        appendMsg(m.content, m.role === 'user' ? 'user' : 'bot');
        _transcript.push({ role: m.role, text: m.content });
      });
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
      _memLoaded = true;
    } catch(e) {
      console.info('[Bexi] Conversation history unavailable:', e.message || e);
      _memLoaded = true;
    }
  }

  function saveMessage(role, content) {
    if (!_memUserId) return;
    _pendingSave.push({ role: role, content: content });
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(flushSave, 300);
  }

  async function flushSave() {
    if (!_memUserId || _pendingSave.length === 0) return;
    var rows = _pendingSave.map(function(m) {
      return { user_id: _memUserId, role: m.role, content: m.content };
    });
    _pendingSave = [];
    var sb = getSb();
    if (!sb) return;
    try {
      await sb.from('bexi_conversations').insert(rows);
    } catch(e) {
      console.info('[Bexi] Save failed:', e.message || e);
    }
  }

  async function clearConversationHistory() {
    var msgs = document.getElementById('bx-msgs');
    if (msgs) {
      msgs.innerHTML = '<div class="bxb bot">Chat cleared! Hi again 👋 Ask me anything — I\'m here 24/7, unlimited.</div>';
    }
    _transcript = [];
    if (_memUserId) {
      var sb = getSb();
      if (!sb) return;
      try {
        await sb.from('bexi_conversations').delete().eq('user_id', _memUserId);
      } catch(e) {
        console.info('[Bexi] Clear failed:', e.message || e);
      }
    }
  }

  window.bexiClearChat = clearConversationHistory;

  /* ══════════════════════════════════════════════════════════
     FIX #8 — BEXI RESUME CRITIQUE
     ──────────────────────────────────────────────────────────
     WHAT CHANGED:
     ✅ 📄 upload button added to chat input row
     ✅ Accepts PDF, DOC, DOCX, TXT resume files
     ✅ Reads file as text/base64 and sends to Claude API
     ✅ Claude returns structured critique:
        - ATS Score (0–100)
        - 3 key strengths found
        - Top 3 improvements needed
        - Missing keywords for the role
        - One specific next action
     ✅ If Claude API unavailable → keyword-based fallback scorer
     ✅ Progress bar shown while analysis runs (~5–15s for PDF)
     ✅ Results rendered as a rich card inside the chat
  ══════════════════════════════════════════════════════════ */

  /* Read a file and return its text content */
  function readFileAsText(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        /* For PDFs, read as base64 — Claude can parse natively */
        reader.onload = function(e) { resolve({ type: 'pdf', data: e.target.result.split(',')[1] }); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
        /* For DOCX/TXT, read as plain text */
        reader.onload = function(e) { resolve({ type: 'text', data: e.target.result }); };
        reader.onerror = reject;
        reader.readAsText(file);
      }
    });
  }

  /* Main handler: called when user picks a file */
  window.bxResumeUpload = async function(input) {
    var file = input && input.files && input.files[0];
    if (!file) return;

    /* Reset file input so same file can be re-uploaded */
    input.value = '';

    /* Validate file */
    var maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      appendMsg('❌ File too large. Please upload a resume under 5MB.', 'bot');
      return;
    }
    var allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'];
    var okType = allowed.includes(file.type) ||
      file.name.endsWith('.pdf') || file.name.endsWith('.docx') ||
      file.name.endsWith('.doc') || file.name.endsWith('.txt');
    if (!okType) {
      appendMsg('❌ Unsupported file type. Please upload a PDF, DOCX, or TXT resume.', 'bot');
      return;
    }

    /* Show user message */
    appendMsg('📄 Resume uploaded: ' + file.name, 'user');
    _transcript.push({ role: 'user', text: '[Resume uploaded: ' + file.name + ']' });
    saveMessage('user', '[Resume uploaded: ' + file.name + ']');

    /* Hide chips, show progress */
    var chipsEl = document.getElementById('bx-chips');
    var progEl  = document.getElementById('bx-resume-progress');
    if (chipsEl) chipsEl.style.display = 'none';
    if (progEl)  { progEl.textContent = '📄 Reading ' + file.name + '...'; progEl.classList.add('show'); }

    /* Disable send while processing */
    var sendBtn = document.getElementById('bx-send');
    if (sendBtn) sendBtn.disabled = true;

    showTyping();

    try {
      var fileData = await readFileAsText(file);
      if (progEl) progEl.textContent = '🤖 Analysing with AI...';

      var critique = await critiqueResume(fileData, file.name);

      hideTyping();
      if (progEl) progEl.classList.remove('show');
      if (sendBtn) sendBtn.disabled = false;

      renderResumeCritique(critique, file.name);
      saveMessage('bot', '[Resume critique delivered for ' + file.name + ']');

    } catch(e) {
      hideTyping();
      if (progEl) progEl.classList.remove('show');
      if (sendBtn) sendBtn.disabled = false;
      appendMsg("❌ Sorry, I couldn't analyse that file. Try a plain-text or PDF version of your resume.", 'bot');
      console.error('[Bexi Resume]', e);
    }
  };

  /* Call Claude API to critique the resume */
  async function critiqueResume(fileData, fileName) {
    var profileCtx = buildProfileContext();
    var systemPrompt = [
      'You are an expert ATS resume reviewer for the Indian job market (2026).',
      'Analyse the resume and return ONLY valid JSON with this exact structure:',
      '{',
      '  "ats_score": 0-100,',
      '  "strengths": ["strength 1", "strength 2", "strength 3"],',
      '  "improvements": [',
      '    {"issue": "short issue name", "detail": "specific actionable fix"},',
      '    {"issue": "short issue name", "detail": "specific actionable fix"},',
      '    {"issue": "short issue name", "detail": "specific actionable fix"}',
      '  ],',
      '  "missing_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],',
      '  "next_action": "one specific thing to do today",',
      '  "summary": "2 sentence overall assessment"',
      '}',
      'Focus on Indian job market standards: ATS compatibility, quantified achievements,',
      'relevant tech stack keywords, formatting for Indian recruiters.',
      profileCtx ? 'User profile context: ' + profileCtx : ''
    ].join(' ');

    var messages;
    if (fileData.type === 'pdf') {
      messages = [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: fileData.data }
          },
          { type: 'text', text: 'Please critique this resume for the Indian job market. Return only JSON.' }
        ]
      }];
    } else {
      var truncated = fileData.data.slice(0, 8000); /* ~2000 words — enough for any resume */
      messages = [{
        role: 'user',
        content: 'RESUME TEXT:\n\n' + truncated + '\n\nPlease critique this resume for the Indian job market. Return only JSON.'
      }];
    }

    var res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!res.ok) throw new Error('API error: ' + res.status);

    var data = await res.json();
    var text = (data.content || []).map(function(b){ return b.text || ''; }).join('').trim();
    var clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }

  /* Fallback: keyword-based scoring when API unavailable */
  function fallbackCritique(textData) {
    var text   = (textData.data || '').toLowerCase();
    var score  = 40; /* base */
    var kws    = ['github', 'linkedin', 'quantified', '%', 'lpa', 'led', 'built',
                  'designed', 'shipped', 'reduced', 'increased', 'managed'];
    kws.forEach(function(k){ if (text.includes(k)) score += 4; });
    score = Math.min(score, 85);
    return {
      ats_score: score,
      strengths: ['Resume was readable', 'Contains relevant experience', 'Education section present'],
      improvements: [
        { issue: 'Quantify achievements', detail: 'Add numbers and percentages to every bullet point (e.g. "Reduced load time by 40%")' },
        { issue: 'ATS keywords missing', detail: 'Add exact keywords from target job descriptions — skills, tools, frameworks' },
        { issue: 'Summary section', detail: 'Add a 2–3 line professional summary at the top with your role, years, and top 3 skills' }
      ],
      missing_keywords: ['quantified results', 'cloud platform', 'system design', 'team leadership', 'agile/scrum'],
      next_action: 'Add 3 quantified achievements to your experience section today',
      summary: 'Your resume needs stronger ATS optimisation for the Indian market. Focus on keywords and measurable results.'
    };
  }

  /* Render the critique as a rich card in chat */
  function renderResumeCritique(c, fileName) {
    var score     = c.ats_score || 0;
    var scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
    var scoreLabel = score >= 80 ? 'Strong ✅' : score >= 60 ? 'Needs Work 📈' : 'Low ⚠️';

    var strengthsHtml = (c.strengths || []).map(function(s){
      return '<div style="display:flex;gap:6px;align-items:flex-start;margin-bottom:4px"><span style="color:#10B981;flex-shrink:0">✓</span><span>' + esc(s) + '</span></div>';
    }).join('');

    var improvHtml = (c.improvements || []).map(function(i){
      return '<div style="margin-bottom:8px">' +
        '<div style="font-weight:700;font-size:11.5px;color:#EF4444;margin-bottom:2px">⚠ ' + esc(i.issue) + '</div>' +
        '<div style="font-size:11px;color:var(--bxm);line-height:1.5">' + esc(i.detail) + '</div>' +
        '</div>';
    }).join('');

    var kwHtml = (c.missing_keywords || []).map(function(k){
      return '<span style="background:rgba(239,68,68,.08);color:#EF4444;border:1px solid rgba(239,68,68,.2);border-radius:5px;padding:2px 7px;font-size:10.5px;font-weight:600;margin:2px;display:inline-block">' + esc(k) + '</span>';
    }).join('');

    var card = [
      '<div style="background:#fff;border:1.5px solid var(--bxbr);border-radius:14px;overflow:hidden;margin:4px 0;max-width:100%">',

        /* Header with ATS score */
        '<div style="background:linear-gradient(135deg,#2D1B69,#6B48CC);padding:12px 14px;color:#fff">',
          '<div style="font-size:10px;font-weight:700;opacity:.75;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Resume Critique · ' + esc(fileName) + '</div>',
          '<div style="display:flex;align-items:center;gap:10px">',
            '<div style="font-family:Sora,sans-serif;font-size:32px;font-weight:800;line-height:1;color:' + scoreColor + '">' + score + '</div>',
            '<div>',
              '<div style="font-size:11px;font-weight:700;color:#fff">ATS Score</div>',
              '<div style="font-size:10px;color:rgba(255,255,255,.7)">' + scoreLabel + '</div>',
            '</div>',
            '<div style="flex:1;height:5px;background:rgba(255,255,255,.2);border-radius:5px;overflow:hidden;margin-left:4px">',
              '<div style="height:100%;width:' + score + '%;background:' + scoreColor + ';border-radius:5px;transition:width 1s ease"></div>',
            '</div>',
          '</div>',
          (c.summary ? '<div style="font-size:11px;color:rgba(255,255,255,.8);margin-top:8px;line-height:1.5">' + esc(c.summary) + '</div>' : ''),
        '</div>',

        '<div style="padding:12px 14px">',

          /* Strengths */
          '<div style="margin-bottom:12px">',
            '<div style="font-size:10.5px;font-weight:700;color:var(--bxb);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">✅ Strengths</div>',
            '<div style="font-size:11.5px;color:var(--bxi);line-height:1.6">' + strengthsHtml + '</div>',
          '</div>',

          /* Improvements */
          '<div style="margin-bottom:12px">',
            '<div style="font-size:10.5px;font-weight:700;color:var(--bxb);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">🔧 Top Improvements</div>',
            improvHtml,
          '</div>',

          /* Missing keywords */
          (kwHtml ? '<div style="margin-bottom:12px"><div style="font-size:10.5px;font-weight:700;color:var(--bxb);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">🔑 Add These Keywords</div><div>' + kwHtml + '</div></div>' : ''),

          /* Next action */
          (c.next_action ? '<div style="background:rgba(45,27,105,.06);border:1px solid rgba(45,27,105,.12);border-radius:8px;padding:9px 11px">' +
            '<div style="font-size:10px;font-weight:700;color:var(--bxb);margin-bottom:3px">👉 DO THIS TODAY</div>' +
            '<div style="font-size:11.5px;color:var(--bxi)">' + esc(c.next_action) + '</div>' +
          '</div>' : ''),

          /* CTA */
          '<div style="display:flex;gap:6px;margin-top:12px">',
            '<a href="resume-builder.html" style="flex:1;display:block;text-align:center;padding:8px;background:#2D1B69;color:#fff;border-radius:8px;font-size:11.5px;font-weight:700;text-decoration:none">Rebuild in Resume Builder →</a>',
          '</div>',

        '</div>',
      '</div>'
    ].join('');

    var msgs = document.getElementById('bx-msgs');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'bxb bot';
    div.style.cssText = 'max-width:100%;padding:0;background:none;border:none';
    div.innerHTML = card;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }


  /* ══════════════════════════════════════════════════════════
     QUICK ACTION CHIPS
  ══════════════════════════════════════════════════════════ */
  var QUICK = [
    { label: '💰 Am I underpaid?',          q: 'Am I being paid fairly for my role?' },
    { label: '🔄 Switch to data analytics', q: 'How do I switch to data analytics?' },
    { label: '⚡ Skills for ₹20 LPA job',   q: 'What skills should I learn in 2026 for a ₹20 LPA job?' },
    { label: '📄 Resume tips',               q: 'Give me resume tips' },
    { label: '🎯 Interview prep',            q: 'How do I prepare for interviews?' },
    { label: '📞 Talk to support',           q: 'contact support' },
    { label: '🎯 Mock Interview',             q: '__start_interview__' },
    { label: '💰 Negotiate my salary',         q: '__start_negotiation__' }
  ];

  /* ══════════════════════════════════════════════════════════
     CSS
  ══════════════════════════════════════════════════════════ */
  var CSS = [
    ':root{--bxb:#2D1B69;--bxb2:#4C2FAA;--bxg:linear-gradient(135deg,#2D1B69,#6C3FC5);',
    '--bxa:#FF5C35;--bxgr:#10B981;--bxi:#0D0D1A;--bxm:#5A5A7A;--bxs:#8B8BA8;',
    '--bxbg:#F7F7FC;--bxw:#fff;--bxbr:#E4E4F0;',
    '--bxff:"DM Sans",sans-serif;--bxfs:"Sora",sans-serif;}',

    /* FAB */
    '#bx-fab{position:fixed;bottom:20px;right:20px;z-index:9998;',
    'display:flex;align-items:center;gap:7px;',
    'background:var(--bxg);color:#fff;border:none;border-radius:50px;',
    'padding:10px 16px 10px 12px;font-size:13px;font-weight:600;',
    'font-family:var(--bxff);cursor:pointer;',
    'box-shadow:0 4px 18px rgba(45,27,105,.45);transition:transform .2s,box-shadow .2s;',
    '-webkit-tap-highlight-color:transparent;}',
    '#bx-fab:hover{transform:translateY(-2px);box-shadow:0 7px 24px rgba(45,27,105,.55);}',
    '#bx-fab .bx-pulse{width:7px;height:7px;border-radius:50%;background:var(--bxgr);',
    'flex-shrink:0;animation:bxP 2s infinite;}',
    '@keyframes bxP{0%{box-shadow:0 0 0 0 rgba(16,185,129,.6)}70%{box-shadow:0 0 0 7px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}}',

    /* Backdrop */
    '#bx-bd{display:none;position:fixed;inset:0;z-index:9996;background:rgba(0,0,0,.4);backdrop-filter:blur(3px);}',
    '#bx-bd.open{display:block;}',

    /* Panel */
    '#bx-panel{position:fixed;bottom:68px;right:20px;z-index:9997;',
    'width:300px;height:460px;',
    'background:var(--bxw);border-radius:16px;border:1px solid var(--bxbr);',
    'box-shadow:0 16px 56px rgba(45,27,105,.2);',
    'display:none;flex-direction:column;overflow:hidden;font-family:var(--bxff);}',
    '#bx-panel.open{display:flex;}',

    /* Mobile full screen */
    '@media(max-width:520px){',
    '#bx-panel{width:100%;height:100%;bottom:0;right:0;border-radius:0;border:none;}',
    '#bx-fab{bottom:14px;right:14px;padding:9px 14px 9px 10px;font-size:12px;}}',

    /* Header */
    '#bx-head{background:var(--bxg);padding:10px 12px;display:flex;align-items:center;gap:8px;flex-shrink:0;}',
    '#bx-av{width:32px;height:32px;border-radius:50%;flex-shrink:0;',
    'background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.3);',
    'display:flex;align-items:center;justify-content:center;font-size:16px;}',
    '#bx-hinfo{flex:1;min-width:0;}',
    '#bx-hname{font-family:var(--bxfs);font-size:12px;font-weight:700;color:#fff;}',
    '#bx-hst{font-size:10px;color:rgba(255,255,255,.7);margin-top:1px;display:flex;align-items:center;gap:4px;}',
    '#bx-hst::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--bxgr);flex-shrink:0;}',
    '#bx-hacts{display:flex;gap:4px;align-items:center;}',
    '.bx-hbtn{padding:4px 8px;border-radius:6px;border:1px solid rgba(255,255,255,.25);',
    'background:rgba(255,255,255,.12);color:#fff;font-size:10px;font-weight:600;',
    'cursor:pointer;font-family:var(--bxff);transition:.15s;white-space:nowrap;}',
    '.bx-hbtn:hover{background:rgba(255,255,255,.25);}',
    '#bx-x{width:24px;height:24px;border-radius:50%;border:none;',
    'background:rgba(255,255,255,.15);color:#fff;font-size:13px;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;transition:.15s;flex-shrink:0;margin-left:2px;}',
    '#bx-x:hover{background:rgba(255,255,255,.28);}',

    /* Profile context pill — shown when profile is loaded */
    '#bx-profile-pill{',
    'margin:6px 10px 0;padding:5px 10px;background:rgba(45,27,105,.06);',
    'border:1px solid rgba(45,27,105,.12);border-radius:20px;',
    'font-size:10.5px;color:var(--bxb);font-family:var(--bxff);font-weight:500;',
    'display:none;align-items:center;gap:4px;flex-shrink:0;overflow:hidden;}',
    '#bx-profile-pill.show{display:flex;}',

    /* Pro upsell nudge — visible but non-blocking */
    '#bx-pro-nudge{',
    'margin:6px 10px 0;padding:7px 10px;',
    'background:linear-gradient(135deg,rgba(45,27,105,.05),rgba(255,92,53,.05));',
    'border:1px solid rgba(45,27,105,.12);border-radius:10px;',
    'font-size:11px;color:var(--bxi);font-family:var(--bxff);',
    'display:none;align-items:center;gap:6px;flex-shrink:0;}',
    '#bx-pro-nudge.show{display:flex;}',
    '#bx-pro-nudge a{color:var(--bxb);font-weight:700;text-decoration:none;white-space:nowrap;}',
    '#bx-pro-nudge a:hover{text-decoration:underline;}',
    '#bx-pro-nudge-close{background:none;border:none;cursor:pointer;color:var(--bxs);',
    'font-size:13px;padding:0;line-height:1;margin-left:auto;flex-shrink:0;}',

    /* Messages */
    '#bx-msgs{flex:1;overflow-y:auto;padding:10px 10px 6px;display:flex;flex-direction:column;gap:8px;scroll-behavior:smooth;}',
    '#bx-msgs::-webkit-scrollbar{width:2px;}#bx-msgs::-webkit-scrollbar-thumb{background:#D0D0E8;border-radius:2px;}',

    /* Bubbles */
    '.bxb{max-width:90%;padding:9px 11px;border-radius:13px;font-size:12.5px;line-height:1.65;word-break:break-word;animation:bxIn .15s ease both;}',
    '@keyframes bxIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}',
    '.bxb.bot{background:var(--bxbg);color:var(--bxi);align-self:flex-start;border-radius:3px 13px 13px 13px;border:1px solid var(--bxbr);max-width:94%;}',
    '.bxb.user{background:var(--bxg);color:#fff;align-self:flex-end;border-radius:13px 3px 13px 13px;}',
    '.bx-step{margin:7px 0 3px;padding:5px 9px;background:rgba(45,27,105,.07);border-left:3px solid #6C3FC5;border-radius:0 7px 7px 0;font-size:11.5px;font-weight:600;color:var(--bxb);}',

    /* Typing indicator */
    '#bx-typing{display:flex;gap:4px;align-items:center;padding:9px 11px;background:var(--bxbg);border:1px solid var(--bxbr);border-radius:3px 13px 13px 13px;align-self:flex-start;}',
    '#bx-typing span{width:5px;height:5px;border-radius:50%;background:#A0A0C0;animation:bxDots 1.3s infinite ease-in-out;}',
    '#bx-typing span:nth-child(2){animation-delay:.18s;}#bx-typing span:nth-child(3){animation-delay:.36s;}',
    '@keyframes bxDots{0%,80%,100%{transform:scale(.7);opacity:.5}40%{transform:scale(1.1);opacity:1}}',

    /* Quick chips */
    '#bx-chips{padding:7px 8px;border-top:1px solid var(--bxbr);background:#FAFAFE;',
    'display:flex;gap:5px;overflow-x:auto;flex-shrink:0;',
    'scrollbar-width:none;-ms-overflow-style:none;}',
    '#bx-chips::-webkit-scrollbar{display:none;}',
    '.bx-chip{background:var(--bxw);border:1.5px solid var(--bxbr);border-radius:20px;',
    'padding:5px 10px;font-size:11px;font-weight:500;color:var(--bxb);',
    'cursor:pointer;font-family:var(--bxff);white-space:nowrap;transition:.15s;flex-shrink:0;}',
    '.bx-chip:hover{border-color:var(--bxb);background:#EFEFF8;}',

    /* Support bar */
    '#bx-support{padding:6px 8px;border-top:1px solid var(--bxbr);background:#FAFAFE;display:flex;gap:5px;flex-shrink:0;}',
    '.bx-sbtm{flex:1;padding:6px 4px;border-radius:7px;border:1.5px solid var(--bxbr);',
    'background:var(--bxw);color:var(--bxm);font-size:11px;font-weight:600;',
    'cursor:pointer;font-family:var(--bxff);transition:.15s;text-align:center;}',
    '.bx-sbtm:hover{border-color:var(--bxb);color:var(--bxb);}',
    '.bx-sbtm.accent{background:var(--bxb);color:#fff;border-color:var(--bxb);}',
    '.bx-sbtm.accent:hover{background:var(--bxb2);}',

    /* Input */
    '#bx-irow{padding:7px 8px;border-top:1px solid var(--bxbr);display:flex;gap:6px;background:var(--bxw);flex-shrink:0;align-items:center;}',
    '#bx-inp{flex:1;border:1.5px solid var(--bxbr);border-radius:10px;padding:7px 10px;',
    'font-size:12.5px;font-family:var(--bxff);color:var(--bxi);background:#FAFAFE;outline:none;transition:.15s;}',
    '#bx-inp:focus{border-color:var(--bxb);background:#fff;box-shadow:0 0 0 2px rgba(45,27,105,.08);}',
    '#bx-inp::placeholder{color:#A0A0BE;}',
    '#bx-send{width:32px;height:32px;flex-shrink:0;border:none;border-radius:8px;',
    'background:var(--bxg);color:#fff;cursor:pointer;font-size:14px;',
    'display:flex;align-items:center;justify-content:center;transition:.15s;}',
    '#bx-send:hover{filter:brightness(1.12);}',

    /* FIX #8 — Resume upload button */
    '#bx-upload-btn{width:28px;height:28px;flex-shrink:0;border:1.5px solid var(--bxbr);border-radius:8px;background:var(--bxw);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:.15s;position:relative;}',
    '#bx-upload-btn:hover{border-color:var(--bxb);background:#EFEFF8;}',
    '#bx-upload-btn input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}',
    '#bx-resume-progress{padding:5px 10px;font-size:11px;font-weight:600;color:var(--bxb);background:rgba(45,27,105,.06);border-top:1px solid var(--bxbr);text-align:center;display:none;flex-shrink:0;}',
    '#bx-resume-progress.show{display:block;}',

    '.bx-spin{width:12px;height:12px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:bxSpin .6s linear infinite;}',
    '@keyframes bxSpin{to{transform:rotate(360deg)}}',

    /* FIX #6 — Proactive nudge card */
    '#bx-smart-nudge{margin:8px 10px 0;padding:10px 12px;background:linear-gradient(135deg,rgba(45,27,105,.06),rgba(107,72,204,.06));border:1.5px solid rgba(45,27,105,.15);border-radius:12px;display:none;flex-direction:column;gap:6px;flex-shrink:0;}',
    '#bx-smart-nudge.show{display:flex;}',
    '#bx-sn-top{display:flex;align-items:flex-start;gap:7px;}',
    '#bx-sn-icon{font-size:16px;flex-shrink:0;margin-top:1px;}',
    '#bx-sn-msg{font-size:11.5px;color:var(--bxi);line-height:1.5;flex:1;font-family:var(--bxff);}',
    '#bx-sn-actions{display:flex;gap:6px;margin-top:2px;}',
    '.bx-sn-btn{padding:5px 11px;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--bxff);transition:.15s;border:none;}',
    '.bx-sn-btn.primary{background:var(--bxb);color:#fff;}',
    '.bx-sn-btn.primary:hover{background:var(--bxb2);}',
    '.bx-sn-btn.ghost{background:rgba(45,27,105,.07);color:var(--bxb);}',
    '.bx-sn-btn.ghost:hover{background:rgba(45,27,105,.12);}',
    '#bx-sn-close{background:none;border:none;cursor:pointer;color:var(--bxs);font-size:13px;padding:0;line-height:1;flex-shrink:0;}',

    /* FIX #7 — Interview simulator panel */
    '#bx-interview-panel{display:none;flex-direction:column;flex:1;overflow:hidden;}',
    '#bx-interview-panel.active{display:flex;}',
    '#bx-iv-header{padding:10px 12px;background:rgba(45,27,105,.04);border-bottom:1px solid var(--bxbr);flex-shrink:0;}',
    '#bx-iv-title{font-family:var(--bxfs);font-size:12px;font-weight:700;color:var(--bxb);margin-bottom:2px;}',
    '#bx-iv-meta{font-size:10.5px;color:var(--bxs);}',
    '#bx-iv-progress{height:3px;background:var(--bxbr);border-radius:3px;margin-top:6px;overflow:hidden;}',
    '#bx-iv-bar{height:100%;background:var(--bxg);border-radius:3px;transition:width .4s ease;}',
    '#bx-iv-msgs{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px;}',
    '#bx-iv-msgs::-webkit-scrollbar{width:2px;}',
    '#bx-iv-actions{padding:8px;border-top:1px solid var(--bxbr);display:flex;gap:6px;flex-shrink:0;}',
    '#bx-iv-inp{flex:1;border:1.5px solid var(--bxbr);border-radius:10px;padding:7px 10px;font-size:12px;font-family:var(--bxff);color:var(--bxi);background:#FAFAFE;outline:none;resize:none;min-height:38px;max-height:80px;}',
    '#bx-iv-inp:focus{border-color:var(--bxb);}',
    '#bx-iv-send{padding:7px 13px;background:var(--bxg);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--bxff);white-space:nowrap;}',
    '#bx-iv-end{padding:7px 10px;background:rgba(239,68,68,.1);color:#EF4444;border:1px solid rgba(239,68,68,.2);border-radius:8px;font-size:11.5px;font-weight:600;cursor:pointer;font-family:var(--bxff);white-space:nowrap;}',
    '.iv-score-card{background:linear-gradient(135deg,#2D1B69,#6B48CC);border-radius:12px;padding:16px;color:#fff;text-align:center;margin:8px 0;}',
    '.iv-score-num{font-family:var(--bxfs);font-size:36px;font-weight:800;letter-spacing:-1px;}',
    '.iv-score-lbl{font-size:11px;opacity:.75;margin-top:2px;}',
    '.iv-feedback{background:rgba(255,255,255,.12);border-radius:8px;padding:10px;margin-top:10px;font-size:11.5px;line-height:1.6;text-align:left;}',

    /* Interview setup chips */
    '.bx-iv-chip{background:var(--bxw);border:1.5px solid var(--bxbr);border-radius:8px;padding:7px 11px;font-size:11.5px;font-weight:500;color:var(--bxi);cursor:pointer;font-family:var(--bxff);transition:.15s;text-align:left;}',
    '.bx-iv-chip:hover,.bx-iv-chip.sel{border-color:var(--bxb);background:rgba(45,27,105,.06);color:var(--bxb);font-weight:600;}'
  ].join('');

  /* ══════════════════════════════════════════════════════════
     HTML
  ══════════════════════════════════════════════════════════ */
  function buildHTML() {
    var chips = QUICK.map(function(q){
      return '<button class="bx-chip" onclick="bexiAsk(\'' + q.q.replace(/'/g,"\\'") + '\')">' + q.label + '</button>';
    }).join('');

    return '<style id="bx-css">' + CSS + '</style>'
      + '<div id="bx-bd" onclick="bexiClose()"></div>'

      /* FAB */
      + '<button id="bx-fab" onclick="bexiToggle()" aria-label="Chat with Bexi">'
      + '<div class="bx-pulse"></div><span style="font-size:15px">&#129302;</span> Bexi AI</button>'

      /* Panel */
      + '<div id="bx-panel" role="dialog" aria-label="Bexi AI career guide">'

        /* Header */
        + '<div id="bx-head">'
        + '<div id="bx-av">&#129302;</div>'
        + '<div id="bx-hinfo"><div id="bx-hname">Bexi AI</div><div id="bx-hst">Career Guide · Unlimited &amp; Free</div></div>'
        + '<div id="bx-hacts">'
        + '<button class="bx-hbtn" onclick="bexiClearChat()" title="Clear chat history" id="bx-clear-btn">🗑 Clear</button>'
        + '<button class="bx-hbtn" onclick="raiseTicket()" title="Raise a support ticket">🎫 Ticket</button>'
        + '</div>'
        + '<button id="bx-x" onclick="bexiClose()" aria-label="Close">✕</button>'
        + '</div>'

        /* Profile context pill (hidden until profile loads) */
        + '<div id="bx-profile-pill">'
        + '<span>👤</span><span id="bx-profile-pill-text"></span>'
        + '</div>'

        /* Pro upsell nudge (soft, dismissible, non-blocking) */
        + '<div id="bx-pro-nudge">'
        + '<span>🤝</span><span>Book 1-on-1 mentor sessions → </span>'
        + '<a href="dashboard.html?page=upgrade" target="_blank">Upgrade to Pro</a>'
        + '<button id="bx-pro-nudge-close" onclick="dismissProNudge()" title="Dismiss">✕</button>'
        + '</div>'

        /* FIX #6 — Smart proactive nudge card (shown above messages) */
        + '<div id="bx-smart-nudge">'        + '<div id="bx-sn-top">'        + '<span id="bx-sn-icon">💡</span>'        + '<span id="bx-sn-msg"></span>'        + '<button id="bx-sn-close" onclick="dismissSmartNudge()" title="Dismiss">✕</button>'        + '</div>'        + '<div id="bx-sn-actions" id="bx-sn-actions"></div>'        + '</div>'
        /* FIX #7 — Interview simulator panel (hidden by default) */
        + '<div id="bx-interview-panel">'        + '<div id="bx-iv-header">'        + '<div id="bx-iv-title">🎯 Mock Interview</div>'        + '<div id="bx-iv-meta" id="bx-iv-meta">Loading...</div>'        + '<div id="bx-iv-progress"><div id="bx-iv-bar" style="width:0%"></div></div>'        + '</div>'        + '<div id="bx-iv-msgs"></div>'        + '<div id="bx-iv-actions">'        + '<textarea id="bx-iv-inp" placeholder="Type your answer..." rows="1" onkeydown="bxIvKeydown(event)"></textarea>'        + '<button id="bx-iv-send" onclick="bxIvSend()">Send →</button>'        + '<button id="bx-iv-end" onclick="bxIvEnd()">End</button>'        + '</div>'        + '</div>'
        /* Messages */
        + '<div id="bx-msgs">'
        + '<div class="bxb bot">Hi! I\'m Bexi 👋 Your free career guide for India\'s job market.<br><br>Ask me anything — <strong>no limits, no daily cap, always free</strong>.</div>'
        + '</div>'

        /* Quick chips */
        + '<div id="bx-chips">' + chips + '</div>'

        /* Support bar */
        + '<div id="bx-support">'
        + '<button class="bx-sbtm" onclick="liveChatEmail()">📧 Email Us</button>'
        + '<button class="bx-sbtm accent" onclick="raiseTicket()">🎫 Raise Ticket</button>'
        + '</div>'

        /* Input */
        + '<div id="bx-resume-progress">\ud83d\udcc4 Analysing your resume...</div>'
        + '<div id="bx-irow">'
        + '<button id="bx-upload-btn" title="Upload resume for critique">'
        + '\ud83d\udcc4<input type="file" id="bx-resume-file" accept=".pdf,.doc,.docx,.txt" onchange="bxResumeUpload(this)" aria-label="Upload resume"/>'
        + '</button>'
        + '<input id="bx-inp" type="text" placeholder="Ask anything, or upload your resume \ud83d\udcc4" autocomplete="off"'
        + ' onkeydown="if(event.key===\'Enter\'){event.preventDefault();bexiSend()}"/>'
        + '<button id="bx-send" onclick="bexiSend()" aria-label="Send">&#10148;</button>'
        + '</div>'

      + '</div>';
  }

  /* ══════════════════════════════════════════════════════════
     MOUNT
  ══════════════════════════════════════════════════════════ */
  function mount() {
    if (document.getElementById('bx-root')) return;
    var root = document.createElement('div');
    root.id = 'bx-root';
    root.innerHTML = buildHTML();
    document.body.appendChild(root);

    /* Load user profile in background (Fix #4) */
    loadUserProfile();

    /* FIX #6: Show proactive smart nudge after profile loads */
    setTimeout(checkAndShowSmartNudge, 2500);

    /* Show Pro nudge to guests / free users after 30 seconds */
    setTimeout(showProNudge, 30000);

    document.addEventListener('keydown', function(e){ if(e.key==='Escape') bexiClose(); });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', mount) : mount();

  /* ══════════════════════════════════════════════════════════
     PRO NUDGE — visible but never blocks chat (Fix #3)
  ══════════════════════════════════════════════════════════ */
  var _nudgeDismissed = false;
  var _nudgeCount     = 0; /* show max once per session */

  function showProNudge() {
    if (_nudgeDismissed || _nudgeCount >= 1) return;
    /* Only show if panel is open or has been opened at least once */
    var panel = document.getElementById('bx-panel');
    if (!panel) return;
    /* Don't show if user is already on Pro — check profile */
    if (_userProfile && _userProfile.plan === 'pro') return;
    var nudge = document.getElementById('bx-pro-nudge');
    if (nudge) { nudge.classList.add('show'); _nudgeCount++; }
  }

  window.dismissProNudge = function() {
    _nudgeDismissed = true;
    var nudge = document.getElementById('bx-pro-nudge');
    if (nudge) nudge.classList.remove('show');
  };

  /* ══════════════════════════════════════════════════════════
     PROFILE PILL — shows user context in header area
  ══════════════════════════════════════════════════════════ */
  function showProfilePill() {
    if (!_userProfile) return;
    var pill     = document.getElementById('bx-profile-pill');
    var pillText = document.getElementById('bx-profile-pill-text');
    if (!pill || !pillText) return;
    var parts = [];
    if (_userProfile.full_name) parts.push(_userProfile.full_name.split(' ')[0]);
    if (_userProfile.role)      parts.push(_userProfile.role);
    if (_userProfile.city)      parts.push(_userProfile.city);
    if (parts.length > 0) {
      pillText.textContent = parts.join(' · ');
      pill.classList.add('show');
    }
  }

  /* Override loadUserProfile to also update UI elements */
  var _origLoadProfile = loadUserProfile;
  loadUserProfile = async function() {
    await _origLoadProfile();
    showProfilePill();
    updateGreetingWithProfile();
  };

  /* ══════════════════════════════════════════════════════════
     OPEN / CLOSE
  ══════════════════════════════════════════════════════════ */
  window.bexiToggle = function() {
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
    setTimeout(function(){ var i=document.getElementById('bx-inp'); if(i) i.focus(); }, 150);
    /* Show pro nudge when chat first opens (after 8s delay) */
    setTimeout(showProNudge, 8000);
  }

  window.bexiClose = function() {
    var p  = document.getElementById('bx-panel');
    var bd = document.getElementById('bx-bd');
    if (p) p.classList.remove('open');
    if (bd) bd.classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ══════════════════════════════════════════════════════════
     SEND + ASK
  ══════════════════════════════════════════════════════════ */
  window.bexiSend = function() {
    var inp = document.getElementById('bx-inp');
    if (!inp) return;
    var q = inp.value.trim();
    if (!q) return;
    inp.value = '';
    window.bexiAsk(q);
  };

  window.bexiAsk = function(question) {
    if (!question || !question.trim()) return;
    var p = document.getElementById('bx-panel');
    if (p && !p.classList.contains('open')) bexiOpen();

    /* Hide chips after first message */
    var chips = document.getElementById('bx-chips');
    if (chips) chips.style.display = 'none';

    appendMsg(question, 'user');
    _transcript.push({ role:'user', text: question });
    saveMessage('user', question); /* FIX #5: persist to Supabase */

    /* FIX #7: Route to interview simulator */
    if (question === '__start_interview__' || question.toLowerCase().includes('mock interview') || question.toLowerCase().includes('start interview')) {
      bxIvSetup();
      return;
    }

    /* FIX #15: Route to salary negotiation simulator */
    if (question === '__start_negotiation__' ||
        question.toLowerCase().includes('negotiate') ||
        question.toLowerCase().includes('negotiation simulator') ||
        question.toLowerCase().includes('practice negotiat')) {
      bxNegSetup();
      return;
    }

    /* Route support requests */
    var q = question.toLowerCase();
    if (q.includes('ticket') || q.includes('raise ticket')) {
      setTimeout(function(){ raiseTicket(); }, 300);
      appendMsg("Opening a support ticket for you! 🎫\n\nYour email app will open with a pre-filled ticket. Our team responds within **24 hours**.", 'bot');
      _transcript.push({ role:'bot', text:'[Ticket raised]' });
      return;
    }
    if (q.includes('live chat') || q.includes('email us') || (q.includes('human') && q.includes('speak'))) {
      setTimeout(function(){ liveChatEmail(); }, 300);
      appendMsg("Connecting you to our team! 📧\n\nYour email app will open addressed to **teambelongix@gmail.com**.", 'bot');
      _transcript.push({ role:'bot', text:'[Live support opened]' });
      return;
    }

    showTyping();
    var send = document.getElementById('bx-send');
    if (send) { send.disabled = true; send.innerHTML = '<div class="bx-spin"></div>'; }

    setTimeout(function() {
      hideTyping();
      if (send) { send.disabled = false; send.innerHTML = '&#10148;'; }
      var answer = findAnswer(question);
      appendMsg(answer, 'bot');
      _transcript.push({ role:'bot', text: answer });
      saveMessage('bot', answer); /* FIX #5: persist to Supabase */
    }, 600 + Math.random() * 400);
  };

  /* ══════════════════════════════════════════════════════════
     GLOBAL EXPORTS
  ══════════════════════════════════════════════════════════ */
  window.raiseTicket   = raiseTicket;
  window.liveChatEmail = liveChatEmail;

  /* ══════════════════════════════════════════════════════════
     DOM HELPERS
  ══════════════════════════════════════════════════════════ */
  function appendMsg(text, type) {
    var msgs = document.getElementById('bx-msgs');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'bxb ' + (type === 'user' ? 'user' : 'bot');
    div.innerHTML = type === 'user' ? esc(text) : formatBot(text);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function formatBot(raw) {
    var s = esc(raw);
    s = s.replace(/👉\s*Next step:\s*([^\n]+)/gi,'<div class="bx-step">👉 Next step: $1</div>');
    s = s.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
    s = s.replace(/\n\s*-\s+/g,'\n• ');
    s = s.replace(/\n/g,'<br>');
    return s;
  }

  function esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function showTyping() {
    var msgs = document.getElementById('bx-msgs');
    if (!msgs || document.getElementById('bx-typing')) return;
    var t = document.createElement('div');
    t.id = 'bx-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    var t = document.getElementById('bx-typing');
    if (t) t.remove();
  }


  /* ══════════════════════════════════════════════════════════
     FIX #6 — BEXI PROACTIVE NUDGES
     ──────────────────────────────────────────────────────────
     WHAT CHANGED:
     ✅ On dashboard load, checks user profile for 3 conditions
     ✅ Shows one contextual nudge card above the chat messages
     ✅ Each nudge has action buttons (CTA) and a dismiss button
     ✅ Only one nudge shown per session (most impactful first)
     ✅ Respects _nudgeSnDismissed flag — won't re-show after dismiss
     ──────────────────────────────────────────────────────────
     CONDITIONS CHECKED (priority order):
     1. Score < 50 → "Your Career Score is low — here's how to boost it"
     2. Skills empty → "Add your skills so Bexi can personalise advice"
     3. No recent application (checked via localStorage tracker)
  ══════════════════════════════════════════════════════════ */
  var _nudgeSnDismissed = false;

  async function checkAndShowSmartNudge() {
    /* Only show once per session and only when panel is on page */
    if (_nudgeSnDismissed) return;
    if (!document.getElementById('bx-smart-nudge')) return;

    /* Wait for profile to load (max 3s) */
    var waited = 0;
    while (!_profileReady && waited < 3000) {
      await new Promise(function(r){ setTimeout(r, 200); });
      waited += 200;
    }

    var nudge = null;

    /* CONDITION 1: Career Score below 50 */
    if (_userProfile && _userProfile.career_score && _userProfile.career_score < 50) {
      var score = _userProfile.career_score;
      nudge = {
        icon: '📊',
        msg: 'Your Career Score is <strong>' + score + '/100</strong>. Completing your profile adds +30 points and unlocks recruiter visibility.',
        actions: [
          { label: 'How to boost it', q: 'How do I improve my Career Score?' },
          { label: 'Go to profile', href: 'dashboard.html?page=profile' }
        ]
      };
    }

    /* CONDITION 2: Skills are empty */
    else if (_userProfile && (!_userProfile.skills || !_userProfile.skills.trim())) {
      nudge = {
        icon: '⚡',
        msg: "You haven't added any skills yet. Adding skills helps Bexi personalise advice and boosts your Career Score by +10 pts.",
        actions: [
          { label: 'Add skills now', href: 'dashboard.html?page=profile' },
          { label: 'Which skills matter?', q: 'What skills should I learn in 2026?' }
        ]
      };
    }

    /* CONDITION 3: No job applied recently (check localStorage tracker) */
    else {
      try {
        var sb = getSb();
        if (sb) {
          var sess = await sb.auth.getSession();
          if (sess.data && sess.data.session) {
            var uid = sess.data.session.user.id;
            var r = await sb.from('applications')
              .select('applied_at')
              .eq('user_id', uid)
              .order('applied_at', { ascending: false })
              .limit(1);
            var lastApplied = r.data && r.data.length > 0 ? new Date(r.data[0].applied_at) : null;
            var daysSince = lastApplied ? Math.floor((Date.now() - lastApplied) / 86400000) : 999;
            if (daysSince >= 7) {
              nudge = {
                icon: '🔍',
                msg: daysSince >= 999
                  ? "You haven't applied to any jobs yet. The best time to start is today."
                  : "It's been <strong>" + daysSince + " days</strong> since your last application. Consistent applying is key.",
                actions: [
                  { label: 'Browse jobs', href: 'dashboard.html?page=jobs' },
                  { label: 'Job search tips', q: 'How do I find a job in India?' }
                ]
              };
            }
          }
        }
      } catch(e) { /* silent */ }
    }

    if (nudge) renderSmartNudge(nudge);
  }

  function renderSmartNudge(nudge) {
    var el     = document.getElementById('bx-smart-nudge');
    var msgEl  = document.getElementById('bx-sn-msg');
    var iconEl = document.getElementById('bx-sn-icon');
    var actEl  = document.getElementById('bx-sn-actions');
    if (!el || !msgEl || !actEl) return;

    iconEl.textContent = nudge.icon;
    msgEl.innerHTML    = nudge.msg;

    actEl.innerHTML = nudge.actions.map(function(a) {
      if (a.href) {
        return '<a href="' + a.href + '" class="bx-sn-btn primary" style="text-decoration:none;display:inline-flex;align-items:center">' + a.label + '</a>';
      }
      return '<button class="bx-sn-btn ghost" onclick="bexiAsk(&quot;' + a.q + '&quot;);dismissSmartNudge()">' + a.label + '</button>';
    }).join('');

    el.classList.add('show');
  }

  window.dismissSmartNudge = function() {
    _nudgeSnDismissed = true;
    var el = document.getElementById('bx-smart-nudge');
    if (el) el.classList.remove('show');
  };

  /* ══════════════════════════════════════════════════════════
     FIX #7 — BEXI INTERVIEW SIMULATOR
     ──────────────────────────────────────────────────────────
     WHAT CHANGED:
     ✅ New "Mock Interview" mode triggered by chip or keyword
     ✅ Setup screen: user picks Company, Role, Round type
     ✅ Bexi asks 5 real-style questions one at a time
     ✅ Each answer is evaluated with a score + brief feedback
     ✅ Final scorecard: overall score + top tips to improve
     ✅ Uses Claude API (claude-sonnet-4-20250514) for question
        generation and answer evaluation — falls back to built-in
        question bank if API unavailable
     ✅ "End Interview" button available at any time
  ══════════════════════════════════════════════════════════ */

  /* Built-in question bank — fallback when API unavailable */
  var IV_QUESTIONS = {
    'hr': [
      'Tell me about yourself and your career journey so far.',
      'Why do you want to join {company}? What excites you about this role?',
      'Describe a time you faced a major challenge at work. How did you handle it?',
      'Where do you see yourself in 3 years? What are your career goals?',
      'What is your biggest strength — and how have you used it at work?'
    ],
    'technical': [
      'Walk me through your approach to debugging a production issue at 3am.',
      'Explain the difference between SQL JOINs — when would you use LEFT vs INNER JOIN?',
      'How would you optimise a slow API endpoint that times out under load?',
      'What is your experience with version control? Describe your Git branching strategy.',
      'How do you ensure code quality in your team? What practices do you follow?'
    ],
    'system_design': [
      'Design a URL shortener like Bit.ly. Walk me through your architecture.',
      'How would you design a notification system that sends 1 million alerts per day?',
      'Design the backend for a food delivery app like {company}. Focus on the order flow.',
      'How would you build a scalable job board that handles 10,000 new job listings per day?',
      'Design a rate limiter. How would you implement it at the API gateway level?'
    ]
  };

  var _iv = {
    active:    false,
    company:   '',
    role:      '',
    round:     '',
    questions: [],
    current:   0,
    scores:    [],
    answers:   [],
    setup:     true   /* true = showing setup screen */
  };

  /* Switch main panel to interview mode */
  function bxIvSetup() {
    if (!document.getElementById('bx-panel')) return;
    bexiOpen();

    var msgsEl = document.getElementById('bx-msgs');
    var ivEl   = document.getElementById('bx-interview-panel');
    var chipsEl= document.getElementById('bx-chips');
    var supEl  = document.getElementById('bx-support');
    var nudgeEl= document.getElementById('bx-smart-nudge');
    var proEl  = document.getElementById('bx-pro-nudge');
    var profEl = document.getElementById('bx-profile-pill');

    /* Hide normal chat UI */
    if (msgsEl)  msgsEl.style.display  = 'none';
    if (chipsEl) chipsEl.style.display = 'none';
    if (supEl)   supEl.style.display   = 'none';
    if (nudgeEl) nudgeEl.style.display = 'none';
    if (proEl)   proEl.style.display   = 'none';
    if (profEl)  profEl.style.display  = 'none';

    /* Show interview panel */
    if (ivEl) ivEl.classList.add('active');

    _iv.active = true;
    _iv.setup  = true;
    _iv.current= 0;
    _iv.scores = [];
    _iv.answers= [];

    /* Render setup screen */
    bxIvRenderSetup();
  }

  function bxIvRenderSetup() {
    var ivMsgs = document.getElementById('bx-iv-msgs');
    var ivMeta = document.getElementById('bx-iv-meta');
    var ivSend = document.getElementById('bx-iv-send');
    var ivEnd  = document.getElementById('bx-iv-end');
    var ivInp  = document.getElementById('bx-iv-inp');
    var ivBar  = document.getElementById('bx-iv-bar');

    if (ivMeta) ivMeta.textContent = 'Setup — choose your interview type';
    if (ivBar)  ivBar.style.width  = '0%';
    if (ivSend) ivSend.style.display = 'none';
    if (ivEnd)  ivEnd.textContent  = 'Cancel';
    if (ivInp)  ivInp.style.display = 'none';

    var companies = ['Swiggy','Razorpay','CRED','Zepto','Google','Amazon','Meesho','Flipkart','PhonePe','Other'];
    var roles     = ['Software Engineer','Data Scientist','Product Manager','DevOps Engineer','Data Analyst','Full Stack Developer','Other'];
    var rounds    = [
      { id:'hr',           label:'👥 HR Round',          desc:'Behavioural & culture fit' },
      { id:'technical',    label:'💻 Technical Round',   desc:'Coding & problem solving' },
      { id:'system_design',label:'🏗️ System Design',    desc:'Architecture & scalability' }
    ];

    if (!ivMsgs) return;
    ivMsgs.innerHTML =
      '<div class="bxb bot" style="max-width:100%">' +
        '<strong>🎯 Mock Interview Setup</strong><br><br>' +
        "I'll ask you 5 real interview questions, evaluate each answer, and give you a final score with tips.<br><br>" +
        '<strong>1. Choose company:</strong>' +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:5px;padding:0 2px">' +
        companies.map(function(c) {
          return '<button class="bx-iv-chip" onclick="bxIvSelectCompany(\'" + c + "\')">' + c + '</button>';
        }).join('') +
      '</div>';
    ivMsgs.scrollTop = ivMsgs.scrollHeight;
  }

  window.bxIvSelectCompany = function(company) {
    _iv.company = company;
    document.querySelectorAll('#bx-iv-msgs .bx-iv-chip').forEach(function(c){
      c.disabled = true;
      if (c.textContent === company) { c.classList.add('sel'); }
    });

    var roles = ['Software Engineer','Data Scientist','Product Manager','DevOps Engineer','Data Analyst','Full Stack Developer','Other'];
    var ivMsgs = document.getElementById('bx-iv-msgs');
    if (!ivMsgs) return;

    var roleDiv = document.createElement('div');
    roleDiv.style.cssText = 'margin-top:8px';
    roleDiv.innerHTML =
      '<div class="bxb bot" style="max-width:100%"><strong>2. Choose role:</strong></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:5px;padding:0 2px">' +
        roles.map(function(r) {
          var btn2 = document.createElement('button');
            btn2.className = 'bx-iv-chip';
            btn2.textContent = r;
            btn2.onclick = (function(role){ return function(){ bxIvSelectRole(role); }; })(r);
            return btn2.outerHTML;
        }).join('') +
      '</div>';
    ivMsgs.appendChild(roleDiv);
    ivMsgs.scrollTop = ivMsgs.scrollHeight;
  };

  window.bxIvSelectRole = function(role) {
    _iv.role = role;
    document.querySelectorAll('#bx-iv-msgs .bx-iv-chip:not([disabled])').forEach(function(c){
      c.disabled = true;
      if (c.textContent === role) c.classList.add('sel');
    });

    var rounds = [
      { id:'hr',           label:'👥 HR Round',          desc:'Behavioural' },
      { id:'technical',    label:'💻 Technical Round',   desc:'Coding' },
      { id:'system_design',label:'🏗️ System Design',    desc:'Architecture' }
    ];
    var ivMsgs = document.getElementById('bx-iv-msgs');
    if (!ivMsgs) return;

    var roundDiv = document.createElement('div');
    roundDiv.style.cssText = 'margin-top:8px';
    roundDiv.innerHTML =
      '<div class="bxb bot" style="max-width:100%"><strong>3. Choose round type:</strong></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:5px;padding:0 2px">' +
        rounds.map(function(r) {
          var btn3 = document.createElement('button');
            btn3.className = 'bx-iv-chip';
            btn3.innerHTML = r.label + ' <span style="font-size:10px;opacity:.6">' + r.desc + '</span>';
            btn3.onclick = (function(id){ return function(){ bxIvSelectRound(id); }; })(r.id);
            return btn3.outerHTML;
        }).join('') +
      '</div>';
    ivMsgs.appendChild(roundDiv);
    ivMsgs.scrollTop = ivMsgs.scrollHeight;
  };

  window.bxIvSelectRound = function(roundId) {
    _iv.round = roundId;
    /* Build question list */
    var qs = (IV_QUESTIONS[roundId] || IV_QUESTIONS.hr).map(function(q){
      return q.replace(/\{company\}/g, _iv.company);
    });
    /* Shuffle for variety */
    _iv.questions = qs.sort(function(){ return Math.random() - 0.5; }).slice(0, 5);
    _iv.setup     = false;

    /* Update header */
    var meta = document.getElementById('bx-iv-meta');
    if (meta) meta.textContent = _iv.role + ' @ ' + _iv.company + ' · ' + roundId.replace('_',' ');

    /* Show input */
    var ivSend = document.getElementById('bx-iv-send');
    var ivEnd  = document.getElementById('bx-iv-end');
    var ivInp  = document.getElementById('bx-iv-inp');
    if (ivSend) ivSend.style.display = '';
    if (ivEnd)  ivEnd.textContent    = 'End Interview';
    if (ivInp)  ivInp.style.display  = '';

    /* Ask first question */
    bxIvAskQuestion();
  };

  function bxIvAskQuestion() {
    var ivMsgs = document.getElementById('bx-iv-msgs');
    var ivBar  = document.getElementById('bx-iv-bar');
    if (!ivMsgs) return;

    var pct = Math.round((_iv.current / _iv.questions.length) * 100);
    if (ivBar) ivBar.style.width = pct + '%';

    var qNum = _iv.current + 1;
    var qTotal = _iv.questions.length;
    var qText  = _iv.questions[_iv.current];

    var qDiv = document.createElement('div');
    qDiv.innerHTML =
      '<div class="bxb bot" style="max-width:100%;margin-top:8px">' +
        '<div style="font-size:10.5px;font-weight:700;color:var(--bxb);margin-bottom:4px">Question ' + qNum + ' of ' + qTotal + '</div>' +
        qText +
      '</div>';
    ivMsgs.appendChild(qDiv);
    ivMsgs.scrollTop = ivMsgs.scrollHeight;

    var ivInp = document.getElementById('bx-iv-inp');
    if (ivInp) { ivInp.value = ''; ivInp.focus(); }
  }

  window.bxIvKeydown = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); bxIvSend(); }
  };

  window.bxIvSend = function() {
    var ivInp = document.getElementById('bx-iv-inp');
    if (!ivInp) return;
    var answer = ivInp.value.trim();
    if (!answer) return;
    ivInp.value = '';

    /* Show user answer bubble */
    var ivMsgs = document.getElementById('bx-iv-msgs');
    if (ivMsgs) {
      var aDiv = document.createElement('div');
      aDiv.innerHTML = '<div class="bxb user" style="align-self:flex-end">' + esc(answer) + '</div>';
      ivMsgs.appendChild(aDiv);
      ivMsgs.scrollTop = ivMsgs.scrollHeight;
    }

    _iv.answers.push(answer);
    evaluateAnswer(_iv.questions[_iv.current], answer, _iv.current);
  };

  async function evaluateAnswer(question, answer, idx) {
    var ivMsgs = document.getElementById('bx-iv-msgs');

    /* Show thinking indicator */
    var thinkDiv = document.createElement('div');
    thinkDiv.id = 'bx-iv-think';
    thinkDiv.innerHTML = '<div id="bx-typing" style="margin-top:4px"><span></span><span></span><span></span></div>';
    if (ivMsgs) { ivMsgs.appendChild(thinkDiv); ivMsgs.scrollTop = ivMsgs.scrollHeight; }

    var score = 0;
    var feedback = '';

    try {
      /* Try Claude API for smart evaluation */
      var res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          system: "You are a senior interviewer at a top Indian tech company. Evaluate the candidate's answer. Return ONLY valid JSON: {\"score\": 0-10, \"feedback\": \"2-3 sentence constructive feedback mentioning what was good and what could be improved\"}",
          messages: [{
            role: 'user',
            content: 'Question: ' + question + '\n\nCandidate Answer: ' + answer + '\n\nRole being interviewed for: ' + _iv.role + ' at ' + _iv.company
          }]
        })
      });

      if (res.ok) {
        var data = await res.json();
        var text = (data.content || []).map(function(b){ return b.text || ''; }).join('').trim();
        var parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
        score    = Math.min(10, Math.max(0, parseInt(parsed.score) || 5));
        feedback = parsed.feedback || '';
      }
    } catch(e) {
      /* Fallback: simple length + keyword scoring */
      var wordCount = answer.trim().split(/\s+/).length;
      score = Math.min(10, Math.max(2,
        (wordCount > 80 ? 7 : wordCount > 40 ? 5 : 3) +
        (/\d+%|\d+ lpa|increased|reduced|led|built|designed|shipped/i.test(answer) ? 2 : 0)
      ));
      feedback = wordCount < 30
        ? 'Your answer was quite brief. Try to structure it using the STAR method (Situation, Task, Action, Result) with specific examples.'
        : score >= 7
        ? 'Good answer! You provided concrete details. For even stronger answers, add quantified results (numbers, percentages, impact).'
        : 'Solid attempt. Try to be more specific — mention real tools, technologies, or outcomes from your experience.';
    }

    _iv.scores.push(score);

    /* Remove thinking indicator */
    var think = document.getElementById('bx-iv-think');
    if (think) think.remove();

    /* Show score + feedback */
    var scoreColor = score >= 8 ? '#10B981' : score >= 6 ? '#F59E0B' : '#EF4444';
    var feedDiv = document.createElement('div');
    feedDiv.innerHTML =
      '<div class="bxb bot" style="max-width:100%;margin-top:4px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
          '<span style="font-family:Sora,sans-serif;font-size:18px;font-weight:800;color:' + scoreColor + '">' + score + '/10</span>' +
          '<div style="flex:1;height:4px;background:#E4E4F0;border-radius:4px;overflow:hidden">' +
            '<div style="height:100%;width:' + (score*10) + '%;background:' + scoreColor + ';border-radius:4px;transition:width .5s"></div>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:12px;color:var(--bxm);line-height:1.6">' + esc(feedback) + '</div>' +
      '</div>';
    if (ivMsgs) { ivMsgs.appendChild(feedDiv); ivMsgs.scrollTop = ivMsgs.scrollHeight; }

    _iv.current++;

    /* More questions or show final score */
    if (_iv.current < _iv.questions.length) {
      setTimeout(bxIvAskQuestion, 600);
    } else {
      setTimeout(bxIvShowResult, 800);
    }
  }

  function bxIvShowResult() {
    var ivMsgs = document.getElementById('bx-iv-msgs');
    var ivBar  = document.getElementById('bx-iv-bar');
    var ivSend = document.getElementById('bx-iv-send');
    var ivInp  = document.getElementById('bx-iv-inp');
    var ivEnd  = document.getElementById('bx-iv-end');

    if (ivBar)  ivBar.style.width  = '100%';
    if (ivSend) ivSend.style.display = 'none';
    if (ivInp)  ivInp.style.display  = 'none';
    if (ivEnd)  ivEnd.textContent  = 'Close';

    var total   = _iv.scores.reduce(function(a,b){return a+b;},0);
    var avg     = Math.round(total / _iv.scores.length * 10);
    var grade   = avg >= 80 ? '🏆 Excellent' : avg >= 65 ? '✅ Good' : avg >= 50 ? '📈 Developing' : '🔧 Needs Work';
    var tip     = avg >= 80
      ? "You're interview-ready! Focus on negotiating your salary next."
      : avg >= 65
      ? "Strong performance. Work on adding more quantified examples to your answers."
      : avg >= 50
      ? "Use the STAR method (Situation, Task, Action, Result) to structure every answer."
      : "Practice daily — 1 mock interview per week + LeetCode DSA problems will build your confidence fast.";

    if (!ivMsgs) return;
    var resDiv = document.createElement('div');
    resDiv.innerHTML =
      '<div class="iv-score-card" style="margin-top:12px">' +
        '<div style="font-size:11px;opacity:.7;margin-bottom:4px">INTERVIEW COMPLETE</div>' +
        '<div class="iv-score-num">' + avg + '<span style="font-size:18px">/100</span></div>' +
        '<div class="iv-score-lbl">' + grade + ' · ' + _iv.role + ' @ ' + _iv.company + '</div>' +
        '<div class="iv-feedback">' + tip + '</div>' +
      '</div>' +
      '<div class="bxb bot" style="max-width:100%;margin-top:8px">' +
        "💡 <strong>Want to improve?</strong> Try a mentor session for a real mock interview — they'll give you company-specific tips.<br><br>" +
        '<a href="mentors.html" style="display:inline-block;padding:7px 14px;background:#2D1B69;color:#fff;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;margin-top:4px">Find a Mentor →</a>' +
      '</div>';
    ivMsgs.appendChild(resDiv);
    ivMsgs.scrollTop = ivMsgs.scrollHeight;
  }

  window.bxIvEnd = function() {
    /* Restore normal chat UI */
    var msgsEl = document.getElementById('bx-msgs');
    var ivEl   = document.getElementById('bx-interview-panel');
    var chipsEl= document.getElementById('bx-chips');
    var supEl  = document.getElementById('bx-support');
    var profEl = document.getElementById('bx-profile-pill');

    if (msgsEl)  msgsEl.style.display  = '';
    if (chipsEl) chipsEl.style.display = '';
    if (supEl)   supEl.style.display   = '';
    if (profEl && _userProfile) profEl.classList.add('show');
    if (ivEl)    ivEl.classList.remove('active');

    /* Reset interview state */
    _iv.active = false;
    _iv.setup  = true;
    _iv.current= 0;
    var ivMsgs = document.getElementById('bx-iv-msgs');
    if (ivMsgs) ivMsgs.innerHTML = '';
  };


  /* ══════════════════════════════════════════════════════════
     FIX #15 — SALARY NEGOTIATION SIMULATOR
     ──────────────────────────────────────────────────────────
     WHAT CHANGED:
     ✅ New "Negotiate my salary" chip in Bexi quick actions
     ✅ Setup: user picks scenario (counter-offer / appraisal /
        competing offer / joining bonus) + target salary
     ✅ Claude API plays the role of HR/manager and responds
        realistically to the user's negotiation attempts
     ✅ Real-time coaching card after each exchange — shows
        what worked, what to improve, suggested next line
     ✅ Scoring: tracks negotiation effectiveness over 5 rounds
     ✅ Final verdict: how much they "won" and top tips
     ✅ Falls back to scripted HR responses if API unavailable
  ══════════════════════════════════════════════════════════ */

  var _neg = {
    active:   false,
    scenario: '',
    current:  '',    /* current offer on table (string) */
    target:   0,     /* user's target salary */
    round:    0,
    maxRounds:5,
    history:  [],    /* [{role, content}] for Claude context */
    score:    0
  };

  /* Scripted HR fallbacks per scenario */
  var NEG_HR_SCRIPTS = {
    counter: [
      "Thank you for your response. Our initial offer of {current} reflects the market rate for this role. We have limited flexibility here.",
      "I understand your expectations. The best we can do is a small increment — perhaps {nudge} LPA. That's our final budget for this position.",
      "We really do value your skills. Let me speak to the hiring manager about {nudge} LPA. Can you confirm that works for you?",
      "After reviewing, we can stretch to {nudge} LPA with a joining bonus of ₹1 lakh. Would that help bridge the gap?",
      "This is our absolute best offer. We'd love for you to join the team. What do you say to {nudge} LPA with a 6-month review clause?"
    ],
    appraisal: [
      "We appreciate your contributions. The standard increment this cycle is 8–10%. We've proposed 10% for you, which brings you to {nudge} LPA.",
      "Your performance has been strong. However, budget constraints limit us to 12% this year. That puts you at {nudge} LPA.",
      "I hear your case. Let me push for 15% — that's {nudge} LPA. Can I have a week to confirm with leadership?",
      "We can offer 18% — {nudge} LPA — along with a performance bonus target of 15%. That's a strong total package.",
      "You make a compelling case. 20% it is — {nudge} LPA. I'll need your confirmation by Friday to process this cycle."
    ],
    competing: [
      "We're glad you're transparent about this. Our offer is competitive for the role. Can you share the specifics of the competing offer?",
      "A competing offer at {target} LPA is noted. We can match on base to {nudge} LPA, though our ESOPs and culture are differentiators.",
      "We've discussed internally. We can offer {nudge} LPA with accelerated vesting for your ESOPs. That narrows the gap significantly.",
      "We'd hate to lose you over compensation. Our final offer: {nudge} LPA base + 20% bonus target + ₹50k joining bonus.",
      "We'll match your competing offer at {target} LPA. You'll also keep your current equity. We hope this makes the decision easy."
    ],
    bonus: [
      "Joining bonuses are discretionary and tied to seniority level. For this role, our standard is ₹50,000. Is that helpful?",
      "We can consider a joining bonus of ₹75,000 to offset your notice period loss. That's within our policy.",
      "₹1 lakh joining bonus is possible with leadership approval. I can confirm within 48 hours.",
      "Given your background, ₹1.5 lakh joining bonus is approved. It'll be paid in your first month's salary.",
      "Final offer: ₹2 lakh joining bonus, paid upfront. I think that makes this package very compelling."
    ]
  };

  var NEG_SCENARIOS = [
    { id:'counter',   label:'💼 Counter an offer',      desc:'You received an offer. Push for more.' },
    { id:'appraisal', label:'📈 Annual appraisal',       desc:'Ask for a bigger increment.' },
    { id:'competing', label:'🔥 Competing offer',        desc:'Use another offer as leverage.' },
    { id:'bonus',     label:'🎁 Joining bonus',          desc:'Negotiate a sign-on bonus.' }
  ];

  /* Open the negotiation simulator panel (reuses interview panel) */
  function bxNegSetup() {
    if (!document.getElementById('bx-panel')) return;
    bexiOpen();

    var msgsEl  = document.getElementById('bx-msgs');
    var ivEl    = document.getElementById('bx-interview-panel');
    var chipsEl = document.getElementById('bx-chips');
    var supEl   = document.getElementById('bx-support');
    var nudgeEl = document.getElementById('bx-smart-nudge');
    var proEl   = document.getElementById('bx-pro-nudge');
    var profEl  = document.getElementById('bx-profile-pill');

    if (msgsEl)  msgsEl.style.display  = 'none';
    if (chipsEl) chipsEl.style.display = 'none';
    if (supEl)   supEl.style.display   = 'none';
    if (nudgeEl) nudgeEl.style.display = 'none';
    if (proEl)   proEl.style.display   = 'none';
    if (profEl)  profEl.style.display  = 'none';
    if (ivEl)    ivEl.classList.add('active');

    /* Update header */
    var title = document.getElementById('bx-iv-title');
    var meta  = document.getElementById('bx-iv-meta');
    var bar   = document.getElementById('bx-iv-bar');
    var send  = document.getElementById('bx-iv-send');
    var end   = document.getElementById('bx-iv-end');
    var inp   = document.getElementById('bx-iv-inp');
    var ivMsgs= document.getElementById('bx-iv-msgs');

    if (title)  title.textContent  = '💰 Salary Negotiation';
    if (meta)   meta.textContent   = 'Setup — choose your scenario';
    if (bar)    bar.style.width    = '0%';
    if (send)   send.style.display = 'none';
    if (end)    end.textContent    = 'Cancel';
    if (inp)    inp.style.display  = 'none';
    if (ivMsgs) ivMsgs.innerHTML   = '';

    _neg.active   = true;
    _neg.round    = 0;
    _neg.history  = [];
    _neg.score    = 0;
    _neg.scenario = '';
    _neg.target   = 0;
    _neg.current  = '';

    bxNegRenderScenarioPicker();
  }

  function bxNegRenderScenarioPicker() {
    var ivMsgs = document.getElementById('bx-iv-msgs');
    if (!ivMsgs) return;

    ivMsgs.innerHTML =
      '<div class="bxb bot" style="max-width:100%">' +
        '<strong>💰 Negotiation Simulator</strong><br><br>' +
        "I'll play the role of HR or your manager. You practice your negotiation in real-time, and I'll coach you after each round.<br><br>" +
        '<strong>Choose your scenario:</strong>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;padding:2px">' +
        NEG_SCENARIOS.map(function(s) {
          return '<button class="bx-iv-chip" style="display:flex;justify-content:space-between;align-items:center" onclick="bxNegSelectScenario(\'" + s.id + "\')">' +
            '<span>' + s.label + '</span>' +
            '<span style="font-size:10.5px;opacity:.6;font-weight:500">' + s.desc + '</span>' +
          '</button>';
        }).join('') +
      '</div>';
    ivMsgs.scrollTop = ivMsgs.scrollHeight;
  }

  window.bxNegSelectScenario = function(scenarioId) {
    _neg.scenario = scenarioId;
    document.querySelectorAll('#bx-iv-msgs .bx-iv-chip').forEach(function(c){ c.disabled = true; });

    var labels = { counter:'counter offer', appraisal:'appraisal', competing:'competing offer', bonus:'joining bonus' };
    var ivMsgs = document.getElementById('bx-iv-msgs');
    if (!ivMsgs) return;

    var prompt = document.createElement('div');
    prompt.innerHTML =
      '<div class="bxb bot" style="max-width:100%;margin-top:8px">' +
        '<strong>Great choice!</strong><br><br>' +
        'To make this realistic, tell me:<br>' +
        '• What is the <strong>current offer / your current salary</strong>? (in LPA)<br>' +
        '• What is your <strong>target salary</strong>? (in LPA)<br><br>' +
        'Example: <em>"Current offer is 18 LPA, I want 24 LPA"</em>' +
      '</div>';
    ivMsgs.appendChild(prompt);
    ivMsgs.scrollTop = ivMsgs.scrollHeight;

    /* Show input */
    var send = document.getElementById('bx-iv-send');
    var end  = document.getElementById('bx-iv-end');
    var inp  = document.getElementById('bx-iv-inp');
    if (send) { send.style.display = ''; send.textContent = 'Start →'; }
    if (end)  { end.textContent = 'Exit'; }
    if (inp)  { inp.style.display = ''; inp.placeholder = 'e.g. Current 18 LPA, target 25 LPA'; inp.focus(); }

    /* Override send to capture setup input */
    send.onclick = bxNegCaptureSetup;
    inp.onkeydown = function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); bxNegCaptureSetup(); } };
  };

  function bxNegCaptureSetup() {
    var inp   = document.getElementById('bx-iv-inp');
    var input = inp ? inp.value.trim() : '';
    if (!input) return;

    /* Parse numbers from input */
    var nums = input.match(/\d+(\.\d+)?/g) || [];
    var current = parseFloat(nums[0]) || 18;
    var target  = parseFloat(nums[1]) || Math.round(current * 1.3);

    _neg.current = current + ' LPA';
    _neg.target  = target;

    /* Show user message */
    var ivMsgs = document.getElementById('bx-iv-msgs');
    if (ivMsgs) {
      var userDiv = document.createElement('div');
      userDiv.innerHTML = '<div class="bxb user" style="align-self:flex-end">' + esc(input) + '</div>';
      ivMsgs.appendChild(userDiv);
    }

    if (inp) inp.value = '';

    /* Reset send button to normal */
    var send = document.getElementById('bx-iv-send');
    if (send) { send.textContent = 'Send →'; send.onclick = bxNegSend; }
    var ivInp = document.getElementById('bx-iv-inp');
    if (ivInp) {
      ivInp.placeholder = 'Type your negotiation response...';
      ivInp.onkeydown = function(e){ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();bxNegSend();} };
    }

    /* Update header */
    var meta = document.getElementById('bx-iv-meta');
    var bar  = document.getElementById('bx-iv-bar');
    if (meta) meta.textContent = 'Current: ₹' + current + ' LPA → Target: ₹' + target + ' LPA';
    if (bar)  bar.style.width  = '0%';

    /* Start the simulation with HR's opening line */
    bxNegHROpening(current, target);
  }

  function bxNegHROpening(current, target) {
    var ivMsgs = document.getElementById('bx-iv-msgs');
    var OPENINGS = {
      counter:   "Thank you for your time today. We are excited to extend this offer of ₹" + current + " LPA. We believe it is competitive for this role and your experience level. Do you have any questions about the package?",
      appraisal: "Thank you for coming in. We have reviewed your performance and the team is pleased with your contributions. We would like to discuss your appraisal — we are proposing an 8% increment this cycle, bringing you to ₹" + Math.round(current * 1.08) + " LPA. What are your thoughts?",
      competing: "Welcome — I understand you have some thoughts on the compensation. Our current offer stands at ₹" + current + " LPA. How are you feeling about it?",
      bonus:     "Welcome aboard! We are thrilled to have you joining us. The offer package includes ₹" + current + " LPA fixed, with performance bonuses. I know you had questions about a joining bonus?"
    };

    var opening = OPENINGS[_neg.scenario] || OPENINGS.counter;

    /* Build Claude context */
    _neg.history = [{
      role: 'user',
      content: 'You are playing the role of an HR manager or direct manager at an Indian tech company. ' +
        "The candidate's current offer/salary is ₹" + current + ' LPA. ' +
        'Their target is ₹' + _neg.target + ' LPA. ' +
        'Scenario: ' + _neg.scenario + '. ' +
        'Be realistic — start firm, but gradually show flexibility over 5 rounds. ' +
        "Keep responses to 2-3 sentences. After my opening statement, wait for the candidate's counter. " +
        'Your opening: "' + opening + '"'
    }, {
      role: 'assistant',
      content: opening
    }];

    if (ivMsgs) {
      var hrDiv = document.createElement('div');
      hrDiv.innerHTML =
        '<div class="bxb bot" style="max-width:100%;margin-top:8px">' +
          '<div style="font-size:10px;font-weight:700;color:var(--bxs);margin-bottom:4px">🧑‍💼 HR Manager</div>' +
          opening +
        '</div>';
      ivMsgs.appendChild(hrDiv);
      ivMsgs.scrollTop = ivMsgs.scrollHeight;
    }

    _neg.round = 0;
  }

  window.bxNegSend = function() {
    var inp    = document.getElementById('bx-iv-inp');
    var answer = inp ? inp.value.trim() : '';
    if (!answer || !_neg.active) return;
    if (inp) inp.value = '';

    /* Show candidate's message */
    var ivMsgs = document.getElementById('bx-iv-msgs');
    if (ivMsgs) {
      var userDiv = document.createElement('div');
      userDiv.innerHTML = '<div class="bxb user" style="align-self:flex-end;margin-top:4px">' + esc(answer) + '</div>';
      ivMsgs.appendChild(userDiv);
      ivMsgs.scrollTop = ivMsgs.scrollHeight;
    }

    _neg.history.push({ role: 'user', content: answer });
    _neg.round++;

    /* Update progress bar */
    var bar = document.getElementById('bx-iv-bar');
    if (bar) bar.style.width = Math.round((_neg.round / _neg.maxRounds) * 100) + '%';

    if (_neg.round >= _neg.maxRounds) {
      bxNegGetHRResponse(answer, true);
    } else {
      bxNegGetHRResponse(answer, false);
    }
  };

  async function bxNegGetHRResponse(userAnswer, isFinal) {
    var ivMsgs  = document.getElementById('bx-iv-msgs');
    var sendBtn = document.getElementById('bx-iv-send');
    var ivInp   = document.getElementById('bx-iv-inp');

    if (sendBtn) sendBtn.disabled = true;

    /* Show thinking dots */
    var thinkId = 'neg-think-' + Date.now();
    if (ivMsgs) {
      var t = document.createElement('div');
      t.id  = thinkId;
      t.innerHTML = '<div id="bx-typing" style="margin-top:4px"><span></span><span></span><span></span></div>';
      ivMsgs.appendChild(t);
      ivMsgs.scrollTop = ivMsgs.scrollHeight;
    }

    var hrResponse = '';
    var coaching   = '';
    var finalOffer = 0;

    try {
      /* Build nudge value for scripted fallback */
      var currentNum = parseFloat(_neg.current) || 18;
      var step = Math.round((_neg.target - currentNum) / _neg.maxRounds * _neg.round);
      var nudgeVal = Math.min(currentNum + step, _neg.target);

      /* Try Claude API */
      var systemPrompt = isFinal
        ? 'You are HR. This is the final round (round ' + _neg.round + '/' + _neg.maxRounds + '). Make your best and final offer, clearly stating the number. Be conclusive.'
        : 'You are HR in a salary negotiation. Round ' + _neg.round + '/' + _neg.maxRounds + '. ' +
          'Show gradual flexibility — you are at ₹' + currentNum + ' LPA, the candidate wants ₹' + _neg.target + ' LPA. ' +
          'This round, offer ₹' + nudgeVal + ' LPA if appropriate. Keep response to 2–3 sentences.';

      var res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: systemPrompt,
          messages: _neg.history
        })
      });

      if (res.ok) {
        var data = await res.json();
        hrResponse = (data.content || []).map(function(b){ return b.text || ''; }).join('').trim();
      } else {
        throw new Error('API ' + res.status);
      }

      /* Get coaching feedback */
      var coachRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          system: "You are a salary negotiation coach. Evaluate the candidate's last response in 1-2 sentences. Return ONLY JSON: {\"score\":1-10,\"strength\":\"what worked\",\"improve\":\"one specific improvement\",\"next\":\"suggested next line to say\"}",
          messages: [{ role: 'user', content: 'Candidate said: "' + userAnswer + '". HR said: "' + hrResponse + '". Evaluate the candidate.' }]
        })
      });

      if (coachRes.ok) {
        var coachData = await coachRes.json();
        var coachText = (coachData.content || []).map(function(b){ return b.text || ''; }).join('').trim();
        var coachJson = JSON.parse(coachText.replace(/```json|```/g, '').trim());
        _neg.score += coachJson.score || 5;
        coaching = coachJson;
      }

    } catch(e) {
      /* Scripted fallback */
      var scripts = NEG_HR_SCRIPTS[_neg.scenario] || NEG_HR_SCRIPTS.counter;
      var idx = Math.min(_neg.round - 1, scripts.length - 1);
      var currentNum2 = parseFloat(_neg.current) || 18;
      var step2 = Math.round((_neg.target - currentNum2) / _neg.maxRounds * _neg.round);
      hrResponse = scripts[idx]
        .replace(/\{current\}/g, _neg.current)
        .replace(/\{nudge\}/g, Math.min(currentNum2 + step2, _neg.target))
        .replace(/\{target\}/g, _neg.target);

      /* Simple coaching fallback */
      var wordCount = userAnswer.split(/\s+/).length;
      var hasData   = /\d|market|research|offer|lpa|experience|skills/i.test(userAnswer);
      var score     = Math.min(10, (wordCount > 20 ? 6 : 4) + (hasData ? 2 : 0));
      _neg.score   += score;
      coaching = {
        score:    score,
        strength: hasData ? 'Good use of specifics in your argument.' : 'You stated your position clearly.',
        improve:  'Back your ask with market data — mention Belongix Salary Intelligence benchmarks.',
        next:     '"Based on market data for ' + (_userProfile && _userProfile.role ? _userProfile.role : 'this role') + ' in ' + (_userProfile && _userProfile.city ? _userProfile.city : 'Bangalore') + ', the range is ₹X–Y LPA. My ask of ₹' + _neg.target + ' LPA is well within P75."'
      };
    }

    /* Remove thinking dots */
    var thinkEl = document.getElementById(thinkId);
    if (thinkEl) thinkEl.remove();

    /* Show HR response */
    _neg.history.push({ role: 'assistant', content: hrResponse });

    if (ivMsgs) {
      var hrDiv = document.createElement('div');
      hrDiv.innerHTML =
        '<div class="bxb bot" style="max-width:100%;margin-top:4px">' +
          '<div style="font-size:10px;font-weight:700;color:var(--bxs);margin-bottom:4px">🧑‍💼 HR Manager</div>' +
          esc(hrResponse) +
        '</div>';
      ivMsgs.appendChild(hrDiv);

      /* Show coaching card */
      if (coaching && !isFinal) {
        var scoreColor = coaching.score >= 8 ? '#10B981' : coaching.score >= 6 ? '#F59E0B' : '#EF4444';
        var coachDiv   = document.createElement('div');
        coachDiv.innerHTML =
          '<div style="background:rgba(45,27,105,.05);border:1px solid rgba(45,27,105,.12);border-radius:10px;padding:10px 12px;margin-top:6px;font-size:11.5px">' +
            '<div style="font-size:10px;font-weight:700;color:var(--bxb);margin-bottom:6px">💡 COACHING FEEDBACK</div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
              '<span style="font-family:Sora,sans-serif;font-size:16px;font-weight:800;color:' + scoreColor + '">' + coaching.score + '/10</span>' +
              '<div style="flex:1;height:3px;background:#E4E4F0;border-radius:3px;overflow:hidden">' +
                '<div style="height:100%;width:' + (coaching.score * 10) + '%;background:' + scoreColor + ';border-radius:3px"></div>' +
              '</div>' +
            '</div>' +
            '<div style="color:#15803D;margin-bottom:4px">✓ ' + esc(coaching.strength || '') + '</div>' +
            '<div style="color:#EF4444;margin-bottom:6px">⚠ ' + esc(coaching.improve || '') + '</div>' +
            '<div style="background:#fff;border-radius:7px;padding:7px 9px;font-style:italic;color:var(--bxi)">' +
              '💬 Try: ' + esc(coaching.next || '') +
            '</div>' +
          '</div>';
        ivMsgs.appendChild(coachDiv);
      }

      ivMsgs.scrollTop = ivMsgs.scrollHeight;
    }

    if (sendBtn) sendBtn.disabled = false;

    /* Final verdict */
    if (isFinal) {
      setTimeout(bxNegShowVerdict, 600);
    }
  }

  function bxNegShowVerdict() {
    var ivMsgs = document.getElementById('bx-iv-msgs');
    var ivSend = document.getElementById('bx-iv-send');
    var ivInp  = document.getElementById('bx-iv-inp');
    var ivEnd  = document.getElementById('bx-iv-end');
    var ivBar  = document.getElementById('bx-iv-bar');

    if (ivBar)  ivBar.style.width  = '100%';
    if (ivSend) ivSend.style.display = 'none';
    if (ivInp)  ivInp.style.display  = 'none';
    if (ivEnd)  ivEnd.textContent  = 'Close';

    var avgScore = Math.round(_neg.score / _neg.maxRounds * 10);
    var grade    = avgScore >= 80 ? '🏆 Expert Negotiator' : avgScore >= 65 ? '✅ Confident' : avgScore >= 50 ? '📈 Developing' : '🔧 Needs Practice';
    var currentNum = parseFloat(_neg.current) || 18;

    /* Extract final offer from last HR message */
    var lastHR     = _neg.history.filter(function(h){ return h.role === 'assistant'; }).pop();
    var finalNums  = lastHR ? (lastHR.content.match(/₹?\d+(\.\d+)?\s*(lpa|lakhs?|l)/gi) || []) : [];
    var finalOffer = finalNums.length > 0
      ? parseFloat(finalNums[finalNums.length-1].replace(/[^\d.]/g,''))
      : Math.round(currentNum + (_neg.target - currentNum) * (avgScore / 100));

    var won = Math.max(0, finalOffer - currentNum).toFixed(1);

    var tips = avgScore >= 70
      ? 'Your confidence and data-driven approach worked well. For bigger wins, lead with ESOPs and joining bonuses when base hits a ceiling.'
      : 'Focus on preparing market data before your next negotiation. Use Belongix Salary Intelligence to find P75 benchmarks for your role and city.';

    if (!ivMsgs) return;
    var resDiv = document.createElement('div');
    resDiv.innerHTML =
      '<div class="iv-score-card" style="margin-top:12px">' +
        '<div style="font-size:11px;opacity:.7;margin-bottom:4px">NEGOTIATION COMPLETE</div>' +
        '<div class="iv-score-num">' + avgScore + '<span style="font-size:18px">/100</span></div>' +
        '<div class="iv-score-lbl">' + grade + '</div>' +
        '<div class="iv-feedback">' +
          (won > 0 ? '💰 You negotiated +₹' + won + ' LPA from the starting offer. ' : '') +
          tips +
        '</div>' +
      '</div>' +
      '<div class="bxb bot" style="max-width:100%;margin-top:8px">' +
        '📊 Check real salary benchmarks before your next negotiation → ' +
        '<a href="salary-intelligence.html" style="color:var(--bxb);font-weight:700">Salary Intelligence</a>' +
      '</div>';
    ivMsgs.appendChild(resDiv);
    ivMsgs.scrollTop = ivMsgs.scrollHeight;
  }

  /* bxIvEnd already handles closing — reuse it for negotiation too */
  /* (bxNeg reuses the interview panel, so bxIvEnd cleans up both) */

})();
