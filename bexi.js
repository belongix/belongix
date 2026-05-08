/* ═══════════════════════════════════════════════════
   Belongix — Bexi Career Guide  v6.0
   ✅ Zero API keys  ✅ Zero cost  ✅ 100% uptime
   ✅ Rule-based AI  ✅ Live support  ✅ Ticket system
   Drop-in: <script src="bexi.js"></script>
═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPPORT_EMAIL = 'teambelongix@gmail.com';
  var TICKET_SUBJECT = 'Bexi Support Ticket — Belongix';

  /* ═══════════════════════════════════════════
     KNOWLEDGE BASE — 100+ Q&A pairs
     Each entry: { patterns: [], answer: '' }
     patterns = keywords to match (ANY match fires)
  ═══════════════════════════════════════════ */
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
      answer: "🤝 **Belongix Mentor Network:**\n\nWe have 50+ verified mentors from India's top companies:\n- Google, Microsoft, Amazon\n- Swiggy, Razorpay, CRED, Zepto, PhonePe\n- Infosys, Wipro, TCS (senior leadership)\n- YC-backed startups\n\n**Session types:**\n- 30 minutes — Quick question / offer review / resume feedback\n- 60 minutes — Career strategy / interview prep / career switch plan\n\n**How to book:**\n1. Go to 'Find a Mentor' in your dashboard\n2. Filter by company, specialisation, experience\n3. Pick a slot and confirm\n\n**Pro plan required** for mentor booking (₹499/month).\n\n👉 Next step: Go to the Mentors page and browse — you can see all mentor profiles even on the free plan."
    },

    /* ── BELONGIX WHAT IS ── */
    {
      patterns: ['what is belongix','about belongix','belongix platform','how belongix works','belongix features','tell me about','what do you offer','what can i do','what does belongix'],
      answer: "🏢 **What is Belongix?**\n\nBelongix is India's all-in-one career platform — built specifically for Indian professionals.\n\n**7 tools in one dashboard:**\n1. 🔍 **Job Board** — verified listings from top companies\n2. 💰 **Salary Intelligence** — real benchmarks from 2,400+ professionals\n3. 🤖 **Bexi AI** — career guidance (that's me!)\n4. 📊 **Career Score** — know your job-readiness (0–100)\n5. 📚 **Upskilling Hub** — 48+ curated courses\n6. 🤝 **Mentor Network** — 50+ verified mentors\n7. 📄 **Resume Builder** — ATS-optimised with live score\n\n**Completely free** to join — no credit card needed.\n\n👉 Next step: Sign up at belongix.in and complete your profile to get your Career Score."
    },

    /* ── PRICING / PLANS ── */
    {
      patterns: ['pricing','price','plan','cost','free plan','pro plan','subscription','how much','₹499','upgrade','paid plan','premium'],
      answer: "💳 **Belongix Plans:**\n\n**Free (Starter) — ₹0 forever:**\n- Full Job Board access\n- Career Score\n- Resume Builder (all templates)\n- Salary Intelligence (basic ranges)\n- Bexi AI (10 questions/day)\n- 5 learning tracks\n\n**Pro — ₹499/month:**\n- Everything in Free\n- Unlimited Bexi AI questions\n- Full salary data + company breakdown\n- All 48+ upskilling courses\n- Mentor session booking\n- Featured profile in recruiter search\n\n**No credit card** needed for Free plan. Cancel Pro anytime.\n\n👉 Next step: Start with the free plan — it covers 80% of what most users need. Upgrade when you need mentors or unlimited AI."
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
      answer: "You're welcome! 😊\n\nIf you ever need help with salary data, interview prep, career switching, or anything else — I'm here 24/7.\n\n**Quick links:**\n- 💰 Check your salary → Dashboard → Salary Insights\n- 🔍 Find jobs → Dashboard → Job Board\n- 📄 Build resume → Resume Builder\n- 🤝 Book mentor → Dashboard → Mentors\n\nGood luck with your career journey! 🚀"
    }
  ];

  /* ══════════════════════════════════════
     MATCH ENGINE
     Score each KB entry against user input
  ══════════════════════════════════════ */
  function findAnswer(input) {
    var q = input.toLowerCase().trim();
    var best = null, bestScore = 0;

    KB.forEach(function (entry) {
      var score = 0;
      entry.patterns.forEach(function (p) {
        if (q.includes(p)) score += p.split(' ').length; // longer phrase = higher score
      });
      if (score > bestScore) { bestScore = score; best = entry; }
    });

    if (best && bestScore > 0) return best.answer;

    // Fallback — didn't understand
    return "I'm not sure I understood that fully. 🤔\n\nI can help you with:\n- **Salary** questions (role, city, experience)\n- **Interview prep** and roadmaps\n- **Career switch** guidance\n- **Skills to learn** in 2026\n- **Resume** and LinkedIn tips\n- **Job search** strategies\n- **Belongix** platform help\n\nTry rephrasing, or click **'Raise a Ticket'** below to reach our human support team!";
  }

  /* ══════════════════════════════════════
     TICKET SYSTEM — opens pre-filled email
  ══════════════════════════════════════ */
  function raiseTicket() {
    var chat = getTranscript();
    var subject = encodeURIComponent(TICKET_SUBJECT);
    var body = encodeURIComponent(
      'Hi Belongix Support Team,\n\n' +
      'I need help with the following:\n\n' +
      '[PLEASE DESCRIBE YOUR ISSUE HERE]\n\n' +
      '---\nBexi Chat Transcript:\n' + chat +
      '\n\n---\nSent via Bexi AI on belongix.in'
    );
    window.open('mailto:' + SUPPORT_EMAIL + '?subject=' + subject + '&body=' + body);
  }

  function liveChatEmail() {
    var subject = encodeURIComponent('Live Support Request — Belongix');
    var body = encodeURIComponent('Hi Belongix team,\n\nI need live support.\n\n[Describe your question or issue]\n\n---\nSent via Bexi AI chat');
    window.open('mailto:' + SUPPORT_EMAIL + '?subject=' + subject + '&body=' + body);
  }

  var _transcript = [];
  function getTranscript() {
    return _transcript.map(function(m){ return (m.role === 'user' ? 'User: ' : 'Bexi: ') + m.text; }).join('\n');
  }

  /* ══════════════════════════════════════
     QUICK ACTION CHIPS (homepage)
  ══════════════════════════════════════ */
  var QUICK = [
    { label: '💰 Am I underpaid?',           q: 'Am I being paid fairly for my role?' },
    { label: '🔄 Switch to data analytics',   q: 'How do I switch to data analytics?' },
    { label: '⚡ Skills for ₹20 LPA job',     q: 'What skills should I learn in 2026 for a ₹20 LPA job?' },
    { label: '📄 Resume tips',                q: 'Give me resume tips' },
    { label: '🎯 Interview prep',             q: 'How do I prepare for interviews?' },
    { label: '📞 Talk to support',            q: 'contact support' }
  ];

  /* ══════════════════════════════════════
     CSS  — compact panel, no overlap
  ══════════════════════════════════════ */
  var CSS = [
    '@import url("https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap");',

    ':root{--bxb:#2D1B69;--bxb2:#4C2FAA;--bxg:linear-gradient(135deg,#2D1B69,#6C3FC5);',
    '--bxa:#FF5C35;--bxgr:#10B981;--bxi:#0D0D1A;--bxm:#5A5A7A;--bxs:#8B8BA8;',
    '--bxbg:#F7F7FC;--bxw:#fff;--bxbr:#E4E4F0;',
    '--bxff:"DM Sans",sans-serif;--bxfs:"Sora",sans-serif;}',

    /* FAB — smaller */
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

    /* Panel — SMALLER: 300px wide, 440px tall */
    '#bx-panel{position:fixed;bottom:68px;right:20px;z-index:9997;',
    'width:300px;height:440px;',
    'background:var(--bxw);border-radius:16px;border:1px solid var(--bxbr);',
    'box-shadow:0 16px 56px rgba(45,27,105,.2);',
    'display:none;flex-direction:column;overflow:hidden;font-family:var(--bxff);}',
    '#bx-panel.open{display:flex;}',

    /* Mobile full screen */
    '@media(max-width:520px){',
    '#bx-panel{width:100%;height:100%;bottom:0;right:0;border-radius:0;border:none;}',
    '#bx-fab{bottom:14px;right:14px;padding:9px 14px 9px 10px;font-size:12px;}}',

    /* Header — tighter */
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

    /* Messages */
    '#bx-msgs{flex:1;overflow-y:auto;padding:10px 10px 6px;display:flex;flex-direction:column;gap:8px;scroll-behavior:smooth;}',
    '#bx-msgs::-webkit-scrollbar{width:2px;}#bx-msgs::-webkit-scrollbar-thumb{background:#D0D0E8;border-radius:2px;}',

    /* Bubbles */
    '.bxb{max-width:90%;padding:9px 11px;border-radius:13px;font-size:12.5px;line-height:1.65;word-break:break-word;animation:bxIn .15s ease both;}',
    '@keyframes bxIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}',
    '.bxb.bot{background:var(--bxbg);color:var(--bxi);align-self:flex-start;border-radius:3px 13px 13px 13px;border:1px solid var(--bxbr);max-width:94%;}',
    '.bxb.user{background:var(--bxg);color:#fff;align-self:flex-end;border-radius:13px 3px 13px 13px;}',
    '.bxb.err{background:#FEF2F2;border-color:#FECACA;color:#991B1B;}',
    '.bx-step{margin:7px 0 3px;padding:5px 9px;background:rgba(45,27,105,.07);border-left:3px solid #6C3FC5;border-radius:0 7px 7px 0;font-size:11.5px;font-weight:600;color:var(--bxb);}',

    /* Typing */
    '#bx-typing{display:flex;gap:4px;align-items:center;padding:9px 11px;background:var(--bxbg);border:1px solid var(--bxbr);border-radius:3px 13px 13px 13px;align-self:flex-start;}',
    '#bx-typing span{width:5px;height:5px;border-radius:50%;background:#A0A0C0;animation:bxDots 1.3s infinite ease-in-out;}',
    '#bx-typing span:nth-child(2){animation-delay:.18s;}#bx-typing span:nth-child(3){animation-delay:.36s;}',
    '@keyframes bxDots{0%,80%,100%{transform:scale(.7);opacity:.5}40%{transform:scale(1.1);opacity:1}}',

    /* Quick chips — horizontal scroll */
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

    /* Thinking dots in send btn */
    '.bx-spin{width:12px;height:12px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:bxSpin .6s linear infinite;}',
    '@keyframes bxSpin{to{transform:rotate(360deg)}}'
  ].join('');

  /* ══════════════════════════════════════
     HTML
  ══════════════════════════════════════ */
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
        + '<div id="bx-hinfo"><div id="bx-hname">Bexi AI</div><div id="bx-hst">Career Guide · Online 24/7</div></div>'
        + '<div id="bx-hacts">'
        + '<button class="bx-hbtn" onclick="raiseTicket()" title="Raise a support ticket">🎫 Ticket</button>'
        + '</div>'
        + '<button id="bx-x" onclick="bexiClose()" aria-label="Close">✕</button>'
        + '</div>'

        /* Messages */
        + '<div id="bx-msgs">'
        + '<div class="bxb bot">Hi! I\'m Bexi 👋 Your free career guide for India\'s job market.<br><br>Ask me anything about salaries, jobs, skills, or career switching!</div>'
        + '</div>'

        /* Quick chips */
        + '<div id="bx-chips">' + chips + '</div>'

        /* Support bar */
        + '<div id="bx-support">'
        + '<button class="bx-sbtm" onclick="liveChatEmail()">📧 Email Us</button>'
        + '<button class="bx-sbtm accent" onclick="raiseTicket()">🎫 Raise Ticket</button>'
        + '</div>'

        /* Input */
        + '<div id="bx-irow">'
        + '<input id="bx-inp" type="text" placeholder="Ask about salaries, jobs, skills..." autocomplete="off"'
        + ' onkeydown="if(event.key===\'Enter\'){event.preventDefault();bexiSend()}"/>'
        + '<button id="bx-send" onclick="bexiSend()" aria-label="Send">&#10148;</button>'
        + '</div>'

      + '</div>';
  }

  /* ══════════════════════════════════════
     MOUNT
  ══════════════════════════════════════ */
  function mount() {
    if (document.getElementById('bx-root')) return;
    var root = document.createElement('div');
    root.id = 'bx-root';
    root.innerHTML = buildHTML();
    document.body.appendChild(root);
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') bexiClose(); });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', mount) : mount();

  /* ══════════════════════════════════════
     OPEN / CLOSE
  ══════════════════════════════════════ */
  window.bexiToggle = function() {
    var p = document.getElementById('bx-panel');
    if (!p) return;
    p.classList.contains('open') ? bexiClose() : bexiOpen();
  };

  function bexiOpen() {
    var p = document.getElementById('bx-panel');
    var bd = document.getElementById('bx-bd');
    if (!p) return;
    p.classList.add('open');
    if (bd) bd.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ var i=document.getElementById('bx-inp'); if(i) i.focus(); }, 150);
  }

  window.bexiClose = function() {
    var p = document.getElementById('bx-panel');
    var bd = document.getElementById('bx-bd');
    if (p) p.classList.remove('open');
    if (bd) bd.classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ══════════════════════════════════════
     SEND + ASK
  ══════════════════════════════════════ */
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

    // Hide chips after first message
    var chips = document.getElementById('bx-chips');

    appendMsg(question, 'user');
    _transcript.push({ role:'user', text: question });

    // Check if user is asking for support/ticket
    var q = question.toLowerCase();
    if (q.includes('ticket') || q.includes('raise ticket') || q.includes('support ticket')) {
      setTimeout(function(){ raiseTicket(); }, 300);
      appendMsg("Opening a support ticket for you! 🎫\n\nYour email app will open with a pre-filled ticket. Our team responds within **24 hours**.\n\n👉 Next step: Describe your issue in the email and hit send!", 'bot');
      _transcript.push({ role:'bot', text:'[Ticket raised]' });
      return;
    }

    if (q.includes('live chat') || q.includes('live support') || q.includes('human') || q.includes('agent') || q.includes('email us')) {
      setTimeout(function(){ liveChatEmail(); }, 300);
      appendMsg("Connecting you to our team! 📧\n\nYour email app will open addressed to **teambelongix@gmail.com**. We reply within 24 hours.\n\n👉 Next step: Describe your question and hit send — we'll get back to you!", 'bot');
      _transcript.push({ role:'bot', text:'[Live support email opened]' });
      return;
    }

    // Simulate thinking (instant answer, but tiny delay feels natural)
    showTyping();
    var send = document.getElementById('bx-send');
    if (send) { send.disabled = true; send.innerHTML = '<div class="bx-spin"></div>'; }

    setTimeout(function() {
      hideTyping();
      if (send) { send.disabled = false; send.innerHTML = '&#10148;'; }

      var answer = findAnswer(question);
      appendMsg(answer, 'bot');
      _transcript.push({ role:'bot', text: answer });
    }, 600 + Math.random() * 400); // 600–1000ms feels natural
  };

  /* ══════════════════════════════════════
     SUPPORT ACTIONS (global)
  ══════════════════════════════════════ */
  window.raiseTicket   = raiseTicket;
  window.liveChatEmail = liveChatEmail;

  /* ══════════════════════════════════════
     DOM HELPERS
  ══════════════════════════════════════ */
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

})();
