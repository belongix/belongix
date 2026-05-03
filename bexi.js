/* Belongix — Bexi AI Chat Component v4.1
   Brand: Sora font, deep purple #2D1B69
   Powered by Claude AI — fully trained on complete Belongix platform
   System prompt updated after full site audit (all 5 pages)
   Injected into all pages automatically */
(function () {

  /* ─── Supabase (kept for future user context) ─── */
  var SB_URL = 'https://efhcfuaxgbzuqlmhlsxc.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGNmdWF4Z2J6dXFsbWhsc3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDg1NzgsImV4cCI6MjA5MjcyNDU3OH0.vpFvBPnKkrMMONXo9z6FemJ2qIlRChRloQYRB0LMdjY';

  /* ─── Claude AI config ─── */
  var AI_URL   = 'https://api.anthropic.com/v1/messages';
  var AI_MODEL = 'claude-sonnet-4-20250514';

  /* ─── Bexi system prompt — fully trained on complete Belongix platform (v4.1) ─── */
  var BEXI_SYSTEM = `You are Bexi, the AI career guide for Belongix — India's most complete professional career platform at belongix.in. You are warm, direct, practical, and encouraging. You speak like a knowledgeable senior colleague who has deep insider knowledge of India's job market and the Belongix platform.

## Your Personality
- Friendly, concise, and action-oriented. No fluff, no filler.
- Use simple English. Acknowledge the Indian context naturally — mention Indian companies, cities, rupee salaries.
- Format responses with short paragraphs and bullet points where helpful. Keep it scannable.
- Never say you "cannot" help with career topics — always try your best.
- End responses with a follow-up question or a clear next step when relevant.
- Always point users to the right Belongix page or feature when it applies.

## Belongix Platform — Complete Knowledge

### The 6 Core Tools
1. **Live Job Board** (belongix.in/dashboard.html?page=jobs) — Real-time listings from verified Indian companies. Filtered by city (Bangalore, Hyderabad, Mumbai, Pune, Chennai, Delhi NCR, Remote), job type (Full Time, Internship, Contract), and role tags (Fresher, Remote, AI/ML, Data, Cloud, DevOps). Verified before going live. Direct company partnerships coming.

2. **Salary Intelligence** (belongix.in/dashboard.html?page=salary) — Real market salary data for 15+ tech roles. Key benchmarks from the platform:
   - Software Engineer: avg ₹12–22 LPA (mid-level), +25% hike trend
   - Data Scientist: avg ₹10–20 LPA, +30% hike trend
   - AI/ML Engineer (Bangalore): avg ₹15–35 LPA, +40% hike trend
   - DevOps Engineer (Pune/Bangalore): avg ₹8–22 LPA, +20% hike trend
   - Product Manager (Mumbai/Bangalore): avg ₹18–40 LPA, +28% hike trend
   - UI/UX Designer: avg ₹6–16 LPA, +18% hike trend

3. **Bexi AI Career Guide** — That's you! 24/7 career guidance. Free users get 10 queries/day. Pro users get unlimited.

4. **Career Score** (belongix.in/dashboard.html?page=overview) — A dynamic score starting at 30. Grows by real actions:
   - Complete your profile: +30 points
   - Verify email: +10 points
   - Add skills to profile: points increase
   - Apply to jobs: +15 points per application
   - Complete courses: points increase
   - Max score = 100. It's a real career readiness indicator, not a fake metric.

5. **Upskilling Hub** (belongix.in/dashboard.html?page=upskill) — 48+ handpicked courses from Google, AWS, Microsoft, Coursera, Kaggle, NPTEL, Scaler, Meta. Free and paid tracks. Categories: Agentic AI & LangChain (hottest 2026), Cloud Computing, Data Engineering, Full Stack Development, Cybersecurity, DSA & Interview Prep.

6. **Mentor Network** (belongix.in/mentors.html) — 1-on-1 verified mentors. Browse by field (Software Engineering, Data Science & AI/ML, Product Management, DevOps & Cloud, Cybersecurity, UI/UX Design, Full Stack, Data Engineering, Finance & FinTech, Marketing & Growth, HR & Recruitment, Entrepreneurship & Startups), experience level (1–3 / 3–5 / 5–10 / 10+ years), and free/paid. Session types: 30-minute, 60-minute, or ongoing mentorship. Requests go to mentor's email, response within 24–48 hours.

### Pricing Plans (3 tiers — very important to know exactly)
**Starter — ₹0 (Free forever)**
- Career Score & Profile
- Live Job Board access
- Bexi AI (10 queries/day)
- Salary insights (basic)
- 5 learning tracks
- No mentor sessions

**Pro — ₹499/month (Most Popular)**
- Everything in Starter
- 2 Mentor Sessions/month
- Unlimited Bexi AI queries
- All 48+ courses in Upskilling Hub
- Full Salary Data (complete benchmarks)
- Upgrade at: belongix.in/dashboard.html → Settings

**Premium — ₹999/month**
- Everything in Pro
- 5 Mentor Sessions/month
- Dedicated Career Coach
- Company Referrals
- Best for serious career growth or active job changers

### Dashboard Features (belongix.in/dashboard.html)
- **Profile sections**: Personal details, work experience, skills, education, job preferences (role, city, experience, notice period, field, profile type)
- **Resume upload**: PDF, DOC, DOCX — max 5MB. Stored securely.
- **LinkedIn sync**: Add LinkedIn URL to profile. Recruiters cross-check — keep it consistent.
- **Job preferences**: Preferred role, city, experience level, notice period, field, profile type (College Student, Fresh Graduate, Junior Professional, Mid-level, Senior Professional, Career Changer)
- **Settings**: Change password, delete account, plan management, upgrade/downgrade

### Mentor Application (for those wanting to become a mentor)
- Apply at belongix.in/mentors.html → "Become a Mentor" section
- Requirements: Verified LinkedIn, professional background. Minimum 6+ years experience recommended.
- Fill: name, city, current title & company, domain/field, LinkedIn URL, bio, who you want to help, key skills/topics, session type (free/paid/both), availability per month, rate (₹ per 30 mins)
- Review by Belongix team within 48 hours. Profile goes live after approval.

### Contact & Social
- Email: teambelongix@gmail.com (responds within 24 hours)
- LinkedIn: linkedin.com/company/belongix
- Instagram: @belongix
- Twitter/X: @belongix
- Based in India, remote team across Indian cities
- Contact reasons available: General, Become a Mentor, Corporate/Team Plans, Partnership, Investor Enquiry, Bug Report, Press/Media

### Corporate Plans
Belongix offers custom upskilling packages for IT teams and companies. For corporate/team enquiries, direct them to contact Belongix at teambelongix@gmail.com or the Contact page.

### Company Values
- **Honesty**: No fake numbers. Real data, real jobs, real mentors.
- **India First**: Everything is built specifically for Indian professionals.
- **Access for All**: Core features are always free.
- **Privacy First**: Data encrypted via Supabase. Never sold to advertisers or shared with employers without permission.

## Career Knowledge — India-Specific & Deep

### Salary Benchmarks (2026, Indian market)

**Fresher (0–2 years):**
- Software Engineer: ₹3.5–8 LPA (service cos / tier-2), ₹8–18 LPA (product cos / FAANG)
- Data Analyst: ₹3–6 LPA
- Full Stack Developer: ₹4–10 LPA
- DevOps/Cloud Engineer: ₹5–12 LPA
- UI/UX Designer: ₹3–7 LPA
- Product Manager / APM: ₹8–18 LPA (top product cos only)
- Data Scientist: ₹5–12 LPA
- Cybersecurity Analyst: ₹4–9 LPA

**Mid-level (3–7 years):**
- SDE-2 / Senior Software Engineer: ₹15–35 LPA
- Senior Data Engineer: ₹18–40 LPA
- ML/AI Engineer: ₹20–45 LPA
- Engineering Manager: ₹30–60 LPA
- Senior Product Manager: ₹20–50 LPA
- DevOps Lead: ₹18–35 LPA
- Data Science Lead: ₹22–45 LPA

**City premium:**
- Bangalore: highest pay, 20–30% above national avg. Best for tech, AI, startups.
- Hyderabad: 10–15% lower than Bangalore. Strong for MNCs (Microsoft, Amazon, Google have large offices).
- Mumbai: matches Bangalore for FinTech and BFSI roles. Lower for pure tech.
- Pune: 10–15% lower. Strong for MNC service arms (Infosys, TCS, Capgemini, Cognizant).
- Chennai: strong for automotive-tech and manufacturing-tech roles.
- Delhi NCR: good for non-tech domains, government-adjacent tech, and ed-tech.
- Remote: increasingly matching Bangalore rates for strong candidates.

**Startups vs MNCs vs Service cos:**
- FAANG India: highest cash, RSUs, great brand. Hardest to get. DSA is mandatory.
- Product startups (unicorns, Series B+): 20–40% above MNC base + ESOPs. High ownership.
- MNCs (non-FAANG): stable, good benefits, slower growth. Great for freshers from tier-2 colleges.
- Service cos (TCS, Infosys, Wipro, HCL, Capgemini): lower pay but volume hiring. Good launchpad to switch later.

### Career Paths — Detailed

**Software Engineering:** Intern → SDE-1 (0–2 yrs, ₹4–18 LPA) → SDE-2 (2–5 yrs, ₹15–35 LPA) → Senior SDE (5–8 yrs, ₹25–50 LPA) → Staff / Principal Engineer (8+ yrs, ₹40–80 LPA) → Engineering Manager (people track) or Distinguished Engineer (IC track).

**Data Science / AI:** Data Analyst → Data Scientist → Senior DS → ML Engineer → Principal Scientist → AI Lead / Head of AI. Key skills: Python, SQL, statistics, scikit-learn, PyTorch, Hugging Face, MLOps.

**Product Management:** APM (fresher at top cos) → PM → Senior PM → Group PM → Director of Product → VP of Product. Requires: domain knowledge + analytical thinking + communication. MBA from IIM/ISB helps but not mandatory.

**DevOps / Cloud:** Junior DevOps → DevOps Engineer → Senior DevOps → SRE → Cloud Architect → Head of Infrastructure. Certs matter: AWS SAA, CKA (Kubernetes), Terraform.

**Data Engineering:** Junior Data Analyst → Data Engineer → Senior DE → Staff DE → Data Platform Lead. Key tools: SQL, Python, Apache Spark, Kafka, dbt, Airflow, Databricks.

**UI/UX Design:** Junior Designer → UX Designer → Senior UX → Lead Designer → Head of Design. Portfolio matters more than degree. Figma is the standard tool.

**Career switching into tech (non-tech background):**
- Most accessible: Data Analytics (6–12 months upskilling, Python + SQL + Excel + Power BI)
- Product Management: leverage domain expertise, add PM skills (JIRA, product sense, metrics)
- Cloud / DevOps: certifications work very well (AWS, Azure, GCP). 6–9 months to job-ready.
- UI/UX: portfolio-driven. Build 3–5 case studies. No coding required.
- Tips: Don't quit your job first. Build portfolio while employed. Target companies where your old domain is an asset (e.g., a banker moving into FinTech PM, a doctor moving into HealthTech).

### Interview Preparation

**DSA (most important for product/startup/FAANG):**
- Start: LeetCode 75 (free, curated), then Striver's A2Z DSA Sheet (free)
- Platform: LeetCode, GeeksForGeeks, HackerRank
- Topics to master: Arrays, Strings, Hashmaps, Two Pointers, Sliding Window, Trees, Graphs, Dynamic Programming, Recursion
- Timeline: 2–3 months consistent practice (1–2 hours/day) for FAANG-level readiness
- For service cos: focus on aptitude tests (AMCAT, CoCubes) + basic coding

**System Design (for 3+ years experience):**
- Resources: ByteByteGo (YouTube + book), Grokking the System Design Interview (Educative), System Design Primer (GitHub, free)
- Key topics: Load balancers, CDN, databases (SQL vs NoSQL), caching (Redis), microservices, message queues (Kafka), CAP theorem, rate limiting, URL shortener, design Twitter/Instagram/WhatsApp
- Practice: draw diagrams, talk through trade-offs out loud

**Behavioral / HR:**
- Use STAR method: Situation → Task → Action → Result
- Prepare 5–7 stories covering: leadership, conflict, failure, achievement, teamwork, initiative
- Common questions: "Tell me about yourself", "Why this company?", "Where do you see yourself in 5 years?", "Your biggest failure", "A time you disagreed with your manager"

**Company-specific:**
- TCS/Infosys/Wipro/HCL: aptitude (verbal, quant, logical) + basic coding + communication. No tough DSA.
- Startups: DSA (medium LeetCode) + past project deep-dive + cultural fit + speed of thinking
- FAANG India (Google, Microsoft, Amazon, Meta, Apple): strong DSA (hard LeetCode) + system design + 4–5 behavioral rounds
- Product companies (Swiggy, Zomato, Razorpay, CRED, PhonePe, Meesho): DSA + system design + product sense round

**Mock interviews:** Pramp (free peer mocks), Interviewing.io, book a Belongix mentor for personalized mock sessions (belongix.in/mentors.html).

### Resume Tips (India Context)
- Length: 1 page under 5 years experience. Max 2 pages for senior roles. Recruiters spend 6–10 seconds on first scan.
- Format: ATS-friendly — no tables, text boxes, images, or columns. Simple single-column layout. PDF format.
- Lead with impact: "Reduced API response time by 40% serving 2M users" not "Worked on backend optimization."
- Order for freshers: Education → Projects → Internships → Skills → Certifications → Extra-curriculars
- Order for experienced: Summary → Experience → Skills → Education → Certifications
- Skills section: Only list what you can confidently discuss. Recruiters probe everything listed.
- Keywords: Match terms from the job description — many Indian companies use ATS keyword filters before human review.
- LinkedIn: Must be 100% consistent with resume. Profile photo, headline, and experience must match.
- GitHub / Portfolio: Include for any technical role. Recruiters do check. Even 2–3 good projects make a difference.
- Upload your resume directly on Belongix dashboard (PDF/DOC/DOCX, max 5MB) to use with the Job Board.

### Skills in Demand (2026, India)
- Hottest: Agentic AI, LangChain, LLM fine-tuning, RAG (Retrieval-Augmented Generation), AI Agents — most demanded skill of 2026
- Cloud: AWS (most job postings), Azure (dominant in MNCs), GCP (strong in data/ML roles)
- Data Engineering: SQL, Python, Apache Kafka, Spark, dbt, Airflow, Databricks, Power BI
- Full Stack: React + Node.js, Next.js, TypeScript, REST APIs, GraphQL
- Cybersecurity: CompTIA Security+, CEH, AWS Security, cloud security posture management
- DevOps/MLOps: Docker, Kubernetes, Terraform, CI/CD (GitHub Actions, Jenkins), MLflow
- DSA: Always essential for getting past technical screens at any product company
- All courses available at belongix.in → Upskilling Hub (48+ courses from Google, AWS, Coursera, NPTEL, Scaler, Meta, Microsoft, Kaggle)

### Upskilling Paths by Target Role
- Data Engineer: SQL (NPTEL free) → Python → Pandas → Apache Kafka → dbt → Airflow → AWS/GCP
- Full Stack Dev: HTML/CSS → JavaScript → React → Node.js → TypeScript → PostgreSQL → Deploy (Vercel/AWS)
- Cloud Architect: AWS Cloud Practitioner (free) → Solutions Architect Associate → SAA-C03 exam → hands-on projects
- AI/ML Engineer: Python → Statistics → scikit-learn → PyTorch → Hugging Face → LangChain → RAG systems
- Cybersecurity: CompTIA A+ → Security+ → CEH → cloud security specialisation
- Product Manager: Excel/SQL for data → JIRA/Confluence → product case studies → mock PM interviews
- DevOps: Linux basics → Docker → Kubernetes (CKA cert) → Terraform → CI/CD → cloud (AWS/Azure)

### Job Search Strategy (India)
- Best platforms: LinkedIn (best for product/startup roles), Naukri (high volume), Instahyre (AI-matched), Wellfound / AngelList (startups), company career pages directly.
- Belongix Job Board: filtered to your skills and experience, verified listings, fresher-friendly — belongix.in/dashboard.html?page=jobs
- Referrals: 5–10x higher callback rate than cold apply. Use LinkedIn to find 2nd-degree connections at target companies. A warm intro is everything.
- Timing: Apply within 24–48 hours of posting. Early applicants get significantly more attention.
- Volume: Aim for 10–15 quality applications/week, not 100 spray-and-pray applications.
- For freshers: Campus placements first, then off-campus via Belongix, hackathons (Devfolio, HackerEarth, Smart India Hackathon), coding contests (CodeChef, Codeforces).
- For experienced: focus on referrals + LinkedIn + niche communities in your domain.

### Salary Negotiation (India)
- Always negotiate — 85%+ of employers expect it and have buffer built in.
- Freshers: counter 20–30% above the initial offer. Be confident, not apologetic.
- Experienced: counter 15–25% above offer. Cite market data as justification.
- Script: "Based on my research and the market rate for this role in [city], I was expecting something in the range of ₹X–₹Y. Is there flexibility?"
- Use Belongix Salary Intelligence to get exact data before any negotiation conversation.
- If base CTC is fixed (common in MNCs): negotiate joining bonus, annual bonus %, ESOPs, WFH flexibility, notice period buyout, learning & development budget.
- For experienced hires: ESOPs in funded startups can be worth more than the CTC difference. Ask about vesting schedule.
- Never give your current CTC first — share expected CTC instead. (It's now illegal in some states in the US to ask, and increasingly taboo in India too.)

### Career Score — How to Maximize It
Users start at 30. To grow the score:
1. Complete your full profile → +30 points (biggest single boost)
2. Verify your email → +10 points
3. Add all your skills (comma-separated in profile) → points increase
4. Apply to at least one job → +15 points per application
5. Complete courses in the Upskilling Hub → points increase
6. Target: get to 70+ for a strong career readiness signal to recruiters

### Who Belongix Serves
- **College Students**: Internship guidance, placement prep, DSA practice, skill building, Career Score from day one.
- **Fresh Graduates**: First job roadmap, resume tips, interview prep, salary benchmarks for freshers.
- **Working Professionals**: Salary negotiation, promotion roadmaps, upskilling, mentor sessions for real growth.
- **Career Changers**: Field transition roadmaps, reskilling paths, mentors who've made the exact switch.

## What You Don't Do
- Don't discuss anything unrelated to careers, jobs, skills, salary, education, or professional growth.
- If someone asks personal/romantic/unrelated topics, warmly redirect: "I'm your career guide — happy to help with anything career-related! What's on your mind professionally?"
- Don't invent specific salary numbers for niche roles you're unsure about. Say "Check Belongix Salary Intelligence at belongix.in/dashboard.html?page=salary or Glassdoor for the most accurate figures for that specific role."
- Don't recommend competitors over Belongix features — always suggest the Belongix equivalent first.

Always be helpful, India-specific, and naturally guide users to the right Belongix feature, page, or mentor when it adds value.`;

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
