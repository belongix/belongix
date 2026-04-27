/* ================================================================
   BELONGIX AI AGENT — BelongixAI v1.0
   100% Custom Built · No External APIs · Always Free
   Career Guidance for Indian Professionals
   ================================================================ */

(function () {
  "use strict";

  // ── KNOWLEDGE BASE ──────────────────────────────────────────────

  var KB = {

    salaries: {
      "software engineer":       { min: 4,  max: 35, avg: "8–15",  note: "Higher in product companies vs service firms" },
      "data scientist":          { min: 5,  max: 40, avg: "10–20", note: "AI/ML boom is driving salaries up fast" },
      "devops engineer":         { min: 5,  max: 38, avg: "9–22",  note: "Cloud skills add big salary premium" },
      "product manager":         { min: 8,  max: 60, avg: "18–32", note: "MBA or strong PM experience helps" },
      "ml engineer":             { min: 6,  max: 80, avg: "15–35", note: "Hottest role in India right now" },
      "frontend developer":      { min: 3,  max: 25, avg: "6–16",  note: "React + TypeScript skills are essential" },
      "backend developer":       { min: 4,  max: 30, avg: "8–18",  note: "Node.js and Java dominate the market" },
      "full stack developer":    { min: 4,  max: 32, avg: "8–20",  note: "Most in-demand role in startups" },
      "data analyst":            { min: 3,  max: 20, avg: "5–12",  note: "SQL + Power BI combo is very valuable" },
      "cloud architect":         { min: 12, max: 60, avg: "20–40", note: "AWS certification adds 30-40% salary bump" },
      "cybersecurity analyst":   { min: 5,  max: 30, avg: "8–18",  note: "Growing demand, limited supply" },
      "ui ux designer":          { min: 3,  max: 25, avg: "6–14",  note: "Figma proficiency is must-have" },
      "qa engineer":             { min: 3,  max: 20, avg: "5–12",  note: "Automation testing (Selenium/Cypress) valued more" },
      "business analyst":        { min: 4,  max: 22, avg: "7–15",  note: "Domain expertise multiplies value" },
      "scrum master":            { min: 6,  max: 28, avg: "10–20", note: "CSM certification helps significantly" },
      "fresher":                 { min: 3,  max: 8,  avg: "3.5–6", note: "Top MNCs offer ₹6–9 LPA for freshers" }
    },

    companies: {
      "tcs": {
        prep: ["📚 Complete InfyTQ / TCS iON platform", "🔢 Aptitude: verbal, quant, reasoning (RS Aggarwal)", "💻 Coding: easy problems in C/Java/Python", "🎤 HR round: standard behavioral questions"],
        culture: "India's largest IT company. Great for freshers — strong training program (ILP). Work-life balance varies by project.",
        salary: "₹3.36–7 LPA for freshers. Experienced: ₹6–20 LPA",
        tip: "Apply through TCS NextStep portal. NQT exam is the gateway."
      },
      "infosys": {
        prep: ["🖥️ InfyTQ certification (mandatory for campus)", "🔢 Aptitude + verbal + coding sections", "💡 HackWithInfy for above-band packages", "🎤 Simple HR interview"],
        culture: "Strong learning culture. Mysore training campus is world-class. Good for freshers wanting structured growth.",
        salary: "₹3.6–9.3 LPA for freshers. Experienced: ₹7–25 LPA",
        tip: "Get InfyTQ certified before interviews. It gives you an edge."
      },
      "wipro": {
        prep: ["📝 WILP exam for lateral hires", "💻 Coding in any language", "🔢 Aptitude and reasoning", "🎤 Two rounds of interviews"],
        culture: "Stable company, large delivery teams. Good for mid-career professionals.",
        salary: "₹3.5–7 LPA for freshers. Experienced: ₹6–18 LPA",
        tip: "Wipro NLTH (National Level Talent Hunt) is best entry path."
      },
      "google": {
        prep: ["🧮 DSA: LeetCode (Medium/Hard daily for 3–6 months)", "🏗️ System Design: Grokking the System Design Interview", "🧠 Behavioral: STAR method for all answers", "🔄 5–6 interview rounds typical"],
        culture: "Innovation-driven, high autonomy, high performance bar. Best tech culture in industry.",
        salary: "₹25–80+ LPA. FAANG salaries are industry benchmark.",
        tip: "Referrals increase interview chances by 5x. Network on LinkedIn."
      },
      "amazon": {
        prep: ["📖 Study Amazon Leadership Principles (14 of them)", "🧮 DSA: LeetCode focus on arrays, trees, graphs", "🏗️ System Design for senior roles", "⭐ STAR method is mandatory for behavioral"],
        culture: "Fast-paced, ownership-driven, high bar. Customer obsession is real.",
        salary: "₹18–60 LPA. Includes RSU stock grants.",
        tip: "Leadership Principles are as important as coding. Prepare both equally."
      },
      "microsoft": {
        prep: ["💻 DSA: LeetCode Medium level", "🏗️ System Design for senior roles", "🤝 Collaborative culture means teamwork questions matter", "3–4 rounds typical"],
        culture: "Growth mindset culture under Satya Nadella. Very employee-friendly.",
        salary: "₹20–70 LPA + significant RSU grants.",
        tip: "MSFT is known for good work-life balance vs other FAANG companies."
      },
      "razorpay": {
        prep: ["💻 Strong DSA fundamentals", "🏗️ System design (payments/fintech context)", "📦 Product thinking valued", "4–5 rounds"],
        culture: "Fast-growing Indian startup. Fintech leader. High growth opportunity.",
        salary: "₹12–40 LPA. ESOPs are valuable.",
        tip: "Know payments domain — UPI, banking APIs, PG ecosystem."
      },
      "swiggy": {
        prep: ["💻 DSA + system design", "📊 Data and scale problems", "🚀 Product sense important", "5 rounds typically"],
        culture: "High-energy startup, scale challenges daily. Great learning curve.",
        salary: "₹14–45 LPA. ESOPs available.",
        tip: "Swiggy values problem-solving at scale. Focus on distributed systems."
      }
    },

    skills2026: {
      "most demanded": ["Generative AI / Prompt Engineering", "Python", "Cloud Computing (AWS, Azure, GCP)", "React.js", "Node.js", "Data Analysis", "Kubernetes & Docker", "Cybersecurity", "SQL & NoSQL", "Machine Learning"],
      "rising fast": ["LangChain & RAG", "Vector Databases", "Rust", "Go (Golang)", "WebAssembly", "Edge Computing", "FinOps", "Platform Engineering"],
      "certifications": ["AWS Solutions Architect", "Google Professional Cloud Engineer", "Azure Administrator", "Certified Kubernetes Admin (CKA)", "TensorFlow Developer", "Scrum Master (CSM)", "PMP"]
    },

    careerPaths: {
      "software engineer": ["Junior Dev → Senior Dev → Tech Lead → Engineering Manager → VP Engineering", "OR: Senior Dev → Principal Engineer → Staff Engineer → Distinguished Engineer"],
      "data scientist": ["Data Analyst → Junior Data Scientist → Senior DS → Lead DS → Head of Data / Chief Data Officer"],
      "devops": ["DevOps Engineer → Senior DevOps → DevOps Lead → Cloud Architect → VP Infrastructure"],
      "product manager": ["Associate PM → PM → Senior PM → Group PM → Director of Product → CPO"],
      "frontend": ["Junior Frontend → Senior Frontend → Frontend Lead → Full Stack → Principal Engineer"],
      "fresher": ["Start with any service company (TCS/Infosys/Wipro) → Build 2 years experience → Move to product company for 2x salary"]
    },

    resumeTips: [
      "✅ Keep resume to 1 page if under 5 years experience",
      "✅ Start every bullet with an action verb (Built, Designed, Reduced, Increased)",
      "✅ Quantify everything — 'Improved app speed by 40%' beats 'Improved performance'",
      "✅ Put skills section at top — recruiters scan for keywords in 6 seconds",
      "✅ Include GitHub profile link with active projects",
      "✅ No objective statement — replace with a 2-line professional summary",
      "✅ Use ATS-friendly format — clean, no tables, no graphics",
      "✅ Tailor resume for each job — match keywords from job description",
      "✅ List certifications (AWS, GCP, etc.) prominently",
      "✅ GPA only matters if above 7.5 — otherwise skip it"
    ],

    interviewTips: [
      "🧮 DSA: Practice LeetCode daily — 2 easy + 1 medium per day minimum",
      "🏗️ System Design: Study Grokking the System Design Interview",
      "⭐ Behavioral: Use STAR method — Situation, Task, Action, Result",
      "🔍 Company Research: Read annual report, recent news, Glassdoor reviews",
      "❓ Ask good questions: 'What does success look like in 90 days?'",
      "📱 Mock interviews: Practice with friends or use Pramp.com (free)",
      "🕐 First 5 minutes matter most — strong intro is essential",
      "💬 Think aloud during coding — interviewers value your thought process",
      "🔄 Follow up within 24 hours with a thank-you email",
      "💪 Rejection is normal — even top engineers get rejected at FAANG"
    ],

    aboutBelongix: [
      "Belongix is India's professional career platform built for students, freshers, and working professionals.",
      "We offer: career score tracking, live job listings, salary intelligence, upskilling tracks, and professional networking.",
      "Our mission: Every professional in India deserves to Connect, Belong, and Grow.",
      "Belongix is free to join. Premium plan at ₹599/month unlocks advanced features.",
      "Visit belongix.in to create your account and start your career journey!"
    ],

    cities: {
      "bangalore": "India's Silicon Valley. Best for software, AI/ML, startups. Average tech salary is 15-20% higher than other cities.",
      "hyderabad": "HITEC City is growing fast. Amazon, Microsoft, Google all have major offices. Cost of living lower than Bangalore.",
      "mumbai": "Financial capital. Best for fintech, product management, data roles. High cost of living.",
      "pune": "Growing tech hub. TCS, Infosys, Wipro large campuses. Good work-life balance vs Bangalore.",
      "chennai": "Strong in automotive, manufacturing tech, IT services. Cost of living is reasonable.",
      "delhi ncr": "Gurgaon/Noida tech corridor. Good for startup ecosystem, e-commerce, fintech.",
      "remote": "Remote work is now standard in India. 60% of tech companies offer hybrid/remote options."
    }
  };

  // ── INTENTS ─────────────────────────────────────────────────────

  var INTENTS = [
    { name: "greeting",     patterns: ["hello", "hi", "hey", "start", "help me", "good morning", "good evening", "namaste", "what can you do"] },
    { name: "salary",       patterns: ["salary", "pay", "ctc", "lpa", "earn", "package", "compensation", "how much", "stipend", "wages", "income"] },
    { name: "company",      patterns: ["tcs", "infosys", "wipro", "google", "amazon", "microsoft", "razorpay", "swiggy", "flipkart", "accenture", "cognizant"] },
    { name: "skills",       patterns: ["skill", "learn", "course", "certification", "upskill", "study", "technology", "programming", "language", "framework", "what should i learn", "which technology"] },
    { name: "resume",       patterns: ["resume", "cv", "curriculum vitae", "portfolio", "write resume", "resume tips", "resume format", "resume review"] },
    { name: "interview",    patterns: ["interview", "prepare", "crack", "question", "round", "technical round", "hr round", "coding interview", "system design"] },
    { name: "fresher",      patterns: ["fresher", "graduate", "college", "campus", "entry level", "beginner", "new to", "first job", "no experience", "just graduated"] },
    { name: "career_path",  patterns: ["career path", "roadmap", "how to become", "career change", "switch career", "grow", "promotion", "future", "scope", "career in"] },
    { name: "job_search",   patterns: ["find job", "job search", "how to get job", "apply for job", "job hunting", "job portal", "where to find", "naukri", "linkedin", "glassdoor"] },
    { name: "city",         patterns: ["bangalore", "hyderabad", "mumbai", "pune", "chennai", "delhi", "noida", "gurgaon", "remote", "work from home", "which city"] },
    { name: "burnout",      patterns: ["burnout", "stress", "tired", "exhausted", "mental health", "anxiety", "pressure", "depressed", "overwhelmed", "toxic", "quit"] },
    { name: "about",        patterns: ["belongix", "what is belongix", "about this", "platform", "how does belongix", "features"] },
    { name: "motivation",   patterns: ["motivat", "stuck", "give up", "not getting", "rejected", "failure", "discourage", "hopeless", "lost"] },
    { name: "ai_ml",        patterns: ["artificial intelligence", "machine learning", "deep learning", "ai career", "data science career", "nlp", "llm", "generative ai", "prompt"] },
    { name: "startup",      patterns: ["startup", "own business", "entrepreneur", "build product", "my own", "found a company", "side project"] }
  ];

  // ── RESPONSE ENGINE ─────────────────────────────────────────────

  var context = { lastIntent: null, mentioned: [], turnCount: 0 };

  function detectIntent(msg) {
    var lower = msg.toLowerCase();
    var scores = {};
    INTENTS.forEach(function (intent) {
      scores[intent.name] = 0;
      intent.patterns.forEach(function (p) {
        if (lower.indexOf(p) !== -1) scores[intent.name]++;
      });
    });
    var best = "general";
    var bestScore = 0;
    Object.keys(scores).forEach(function (k) {
      if (scores[k] > bestScore) { bestScore = scores[k]; best = k; }
    });
    return bestScore > 0 ? best : "general";
  }

  function detectRole(msg) {
    var lower = msg.toLowerCase();
    var roles = Object.keys(KB.salaries);
    for (var i = 0; i < roles.length; i++) {
      if (lower.indexOf(roles[i]) !== -1) return roles[i];
    }
    return null;
  }

  function detectCompany(msg) {
    var lower = msg.toLowerCase();
    var companies = Object.keys(KB.companies);
    for (var i = 0; i < companies.length; i++) {
      if (lower.indexOf(companies[i]) !== -1) return companies[i];
    }
    return null;
  }

  function detectCity(msg) {
    var lower = msg.toLowerCase();
    var cities = Object.keys(KB.cities);
    for (var i = 0; i < cities.length; i++) {
      if (lower.indexOf(cities[i]) !== -1) return cities[i];
    }
    return null;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getResponse(msg) {
    var intent = detectIntent(msg);
    var role = detectRole(msg);
    var company = detectCompany(msg);
    var city = detectCity(msg);
    context.turnCount++;
    context.lastIntent = intent;

    // ── GREETING
    if (intent === "greeting") {
      var greetings = [
        "Hi! I'm <strong>Bexi</strong> — Belongix's career AI 👋<br><br>I can help you with:<br>💰 Salary insights for any role<br>🏢 Company interview prep<br>📄 Resume & CV tips<br>🚀 Career path guidance<br>🛠️ Skills to learn in 2026<br><br>What would you like to know?",
        "Hello! I'm <strong>Bexi</strong>, your career guide on Belongix! 🤖<br><br>Ask me anything about:<br>• Salaries in India 💰<br>• How to crack Google/Amazon/TCS interviews 🏢<br>• What skills to learn 🛠️<br>• Career switching advice 🔄<br><br>What's on your mind?",
        "Hey there! I'm <strong>Bexi</strong> 👋 — built by Belongix to help you navigate your career.<br><br>Quick options:<br>📊 Check salary for any role<br>🎯 Get interview prep tips<br>📄 Resume advice<br>🗺️ Career roadmap<br><br>What would you like help with today?"
      ];
      return { text: pickRandom(greetings), chips: ["Check my salary", "Interview tips", "What skills to learn", "Resume help"] };
    }

    // ── SALARY
    if (intent === "salary") {
      if (role && KB.salaries[role]) {
        var s = KB.salaries[role];
        return {
          text: "💰 <strong>Salary for " + role.replace(/\b\w/g, function(l){ return l.toUpperCase(); }) + " in India:</strong><br><br>" +
                "📉 Entry level: ₹" + s.min + "–" + Math.round(s.min * 1.8) + " LPA<br>" +
                "📊 Mid level: ₹" + s.avg + " LPA<br>" +
                "📈 Senior level: ₹" + Math.round(s.max * 0.6) + "–" + s.max + " LPA<br><br>" +
                "💡 <em>" + s.note + "</em><br><br>" +
                "Want tips on how to negotiate a higher salary?",
          chips: ["How to negotiate salary", "Top companies for this role", "What skills increase my pay"]
        };
      }
      return {
        text: "💰 <strong>Average IT salaries in India (2026):</strong><br><br>" +
              "🟢 Fresher (0–1 yr): ₹3.5–8 LPA<br>" +
              "🔵 Mid-level (2–5 yr): ₹8–22 LPA<br>" +
              "🟣 Senior (5–10 yr): ₹18–45 LPA<br>" +
              "🔴 Lead/Architect (10+ yr): ₹35–80+ LPA<br><br>" +
              "Product companies (Razorpay, Swiggy) pay 40–60% more than service companies (TCS, Infosys).<br><br>" +
              "Which specific role would you like salary details for?",
        chips: ["Software Engineer salary", "Data Scientist salary", "DevOps salary", "Product Manager salary"]
      };
    }

    // ── COMPANY
    if (intent === "company" || company) {
      var comp = company || detectCompany(msg);
      if (comp && KB.companies[comp]) {
        var c = KB.companies[comp];
        var prepList = c.prep.join("<br>");
        return {
          text: "🏢 <strong>" + comp.charAt(0).toUpperCase() + comp.slice(1) + " — Complete Guide:</strong><br><br>" +
                "<strong>Interview Preparation:</strong><br>" + prepList + "<br><br>" +
                "<strong>Company Culture:</strong><br>" + c.culture + "<br><br>" +
                "<strong>Salary Range:</strong> " + c.salary + "<br><br>" +
                "💡 <em>" + c.tip + "</em>",
          chips: ["Interview tips for " + comp, "What salary to expect", "Resume tips"]
        };
      }
      return {
        text: "🏢 I have detailed interview guides for: <strong>TCS, Infosys, Wipro, Google, Amazon, Microsoft, Razorpay, Swiggy</strong>.<br><br>Which company are you targeting?",
        chips: ["Google interview prep", "TCS interview prep", "Amazon interview prep", "Razorpay interview prep"]
      };
    }

    // ── SKILLS
    if (intent === "skills") {
      return {
        text: "🛠️ <strong>Top skills to learn in 2026:</strong><br><br>" +
              "<strong>🔥 Most In-Demand:</strong><br>" +
              KB.skills2026["most demanded"].slice(0, 5).join(", ") + "<br><br>" +
              "<strong>🚀 Rising Fast:</strong><br>" +
              KB.skills2026["rising fast"].slice(0, 4).join(", ") + "<br><br>" +
              "<strong>🏆 Top Certifications:</strong><br>" +
              KB.skills2026["certifications"].slice(0, 3).join(", ") + "<br><br>" +
              "💡 <em>Focus on one skill deeply rather than many superficially. Employers value depth over breadth.</em>",
        chips: ["Best AI/ML skills", "Cloud certifications", "Frontend skills", "How long to learn Python"]
      };
    }

    // ── RESUME
    if (intent === "resume") {
      var tips = KB.resumeTips.slice(0, 5).join("<br>");
      return {
        text: "📄 <strong>Resume Tips for Indian Job Market:</strong><br><br>" + tips + "<br><br>💡 <strong>Recommended format:</strong> Use a clean ATS-friendly template from Overleaf or Novoresume. Avoid fancy Canva designs for tech roles.",
        chips: ["Resume format tips", "What to write in summary", "How to list projects", "ATS optimization"]
      };
    }

    // ── INTERVIEW
    if (intent === "interview") {
      var itips = KB.interviewTips.slice(0, 5).join("<br>");
      return {
        text: "🎯 <strong>Interview Preparation Guide:</strong><br><br>" + itips + "<br><br>Which type of interview do you want to prepare for?",
        chips: ["Technical coding round", "System design round", "HR behavioral round", "Amazon Leadership Principles"]
      };
    }

    // ── FRESHER
    if (intent === "fresher") {
      return {
        text: "🎓 <strong>Guide for Freshers — Your First Job in India:</strong><br><br>" +
              "📍 <strong>Step 1:</strong> Get certified — AWS/GCP free tier, Google courses, Coursera<br>" +
              "💻 <strong>Step 2:</strong> Build 2–3 projects on GitHub (not just tutorial projects — solve real problems)<br>" +
              "📄 <strong>Step 3:</strong> Create a strong 1-page resume with projects and skills<br>" +
              "🎯 <strong>Step 4:</strong> Apply on Naukri, LinkedIn, Instahyre, Wellfound for startups<br>" +
              "🏢 <strong>Step 5:</strong> Target service companies first (TCS/Infosys) to get 2 years of experience<br>" +
              "🚀 <strong>Step 6:</strong> After 2 years, move to product companies for 2–3x salary jump<br><br>" +
              "💰 Expected fresher salary: ₹3.5–9 LPA depending on company and skills",
        chips: ["Best companies for freshers", "Fresher resume tips", "Which skills to learn first", "How to crack TCS NQT"]
      };
    }

    // ── CAREER PATH
    if (intent === "career_path") {
      if (role) {
        var paths = KB.careerPaths;
        var pathKey = Object.keys(paths).find(function(k){ return role.indexOf(k) !== -1; });
        if (pathKey) {
          return {
            text: "🗺️ <strong>Career Path for " + role.replace(/\b\w/g, function(l){ return l.toUpperCase(); }) + ":</strong><br><br>" +
                  KB.careerPaths[pathKey] + "<br><br>" +
                  "⏱️ Typically takes 2–3 years to move up each level in India.<br>" +
                  "💡 Switching companies is the fastest way to get 30–50% salary hikes.",
            chips: ["How to get promoted faster", "When to switch companies", "Skills needed for next level"]
          };
        }
      }
      return {
        text: "🗺️ <strong>Career paths I can guide you on:</strong><br><br>" +
              "💻 Software Engineering<br>📊 Data Science & Analytics<br>⚙️ DevOps & Cloud<br>🎯 Product Management<br>🎨 UI/UX Design<br>🔒 Cybersecurity<br><br>Which field would you like a roadmap for?",
        chips: ["Software Engineer path", "Data Scientist path", "DevOps path", "Product Manager path"]
      };
    }

    // ── JOB SEARCH
    if (intent === "job_search") {
      return {
        text: "🔍 <strong>Best job search strategy for India (2026):</strong><br><br>" +
              "1️⃣ <strong>LinkedIn</strong> — best for product companies and referrals<br>" +
              "2️⃣ <strong>Naukri.com</strong> — largest job database in India<br>" +
              "3️⃣ <strong>Instahyre</strong> — AI-powered, great for mid-level roles<br>" +
              "4️⃣ <strong>Wellfound</strong> — best for startup jobs<br>" +
              "5️⃣ <strong>Referrals</strong> — 85% of jobs are filled this way. Network on LinkedIn!<br><br>" +
              "💡 <strong>Pro tip:</strong> On Belongix dashboard, go to Jobs section for curated live listings from top Indian companies!",
        chips: ["How to get referrals", "LinkedIn profile tips", "Resume for job hunting", "How many jobs to apply daily"]
      };
    }

    // ── CITY
    if (intent === "city" || city) {
      var c2 = city || "bangalore";
      if (KB.cities[c2]) {
        return {
          text: "📍 <strong>" + c2.charAt(0).toUpperCase() + c2.slice(1) + " — Career Insights:</strong><br><br>" + KB.cities[c2] + "<br><br>Would you like to know about job opportunities or salary levels in this city?",
          chips: ["Top companies in " + c2, "Average salary in " + c2, "Compare cities for tech jobs"]
        };
      }
    }

    // ── BURNOUT
    if (intent === "burnout") {
      return {
        text: "💚 <strong>First, you're not alone.</strong> 83% of Indian IT professionals face burnout at some point.<br><br>" +
              "Here's what actually helps:<br><br>" +
              "🛑 <strong>Short-term:</strong> Take a proper break — even 2–3 days makes a difference<br>" +
              "💬 <strong>Talk:</strong> To a trusted colleague, friend, or mentor<br>" +
              "🎯 <strong>Boundary:</strong> Set clear work hours and protect them<br>" +
              "🔄 <strong>Switch:</strong> If the job itself is toxic, plan your exit — don't quit impulsively<br>" +
              "📋 <strong>Career move:</strong> Sometimes burnout is a signal it's time for a new role<br><br>" +
              "Belongix community is being built for exactly this — a safe space to talk and find better opportunities.",
        chips: ["When should I switch jobs", "How to find better work culture", "How to negotiate better hours"]
      };
    }

    // ── MOTIVATION
    if (intent === "motivation") {
      var quotes = [
        "💪 Every rejection is data — not a verdict on your worth.<br><br>The average software engineer gets rejected 7–10 times before landing their dream job. Keep applying. Keep improving. The offer will come.",
        "🚀 Being stuck doesn't mean you're falling behind — it means you're about to level up.<br><br>The engineers at Google today were rejected from their first 5 companies. Every 'no' is getting you closer to the right 'yes'.",
        "💡 The gap between where you are and where you want to be is filled with action.<br><br>What's ONE thing you can do today — even a small thing — to move forward? Apply to one job. Learn one concept. Message one connection."
      ];
      return {
        text: pickRandom(quotes),
        chips: ["Help me make a plan", "How to prepare better", "What should I focus on"]
      };
    }

    // ── AI/ML CAREER
    if (intent === "ai_ml") {
      return {
        text: "🤖 <strong>AI/ML Career in India — 2026 Guide:</strong><br><br>" +
              "<strong>Why it's hot:</strong> India faces 53% AI talent deficit. Demand is massive, supply is low.<br><br>" +
              "<strong>Roadmap to become an AI Engineer:</strong><br>" +
              "1️⃣ Master Python (1–2 months)<br>" +
              "2️⃣ Statistics & Math basics (2 months)<br>" +
              "3️⃣ Machine Learning (scikit-learn, 2–3 months)<br>" +
              "4️⃣ Deep Learning (TensorFlow/PyTorch, 2–3 months)<br>" +
              "5️⃣ Specialise: NLP, Computer Vision, or GenAI (2–3 months)<br>" +
              "6️⃣ Build 2–3 strong projects + Kaggle competitions<br><br>" +
              "💰 <strong>Salary:</strong> ₹8–35 LPA (entry to senior). Top AI engineers earn ₹50–80+ LPA.",
        chips: ["Best ML courses", "AI certifications", "Top companies hiring AI engineers", "ML engineer salary"]
      };
    }

    // ── STARTUP
    if (intent === "startup") {
      return {
        text: "🚀 <strong>Building a startup in India — Key advice:</strong><br><br>" +
              "✅ Validate before building — talk to 20+ potential users first<br>" +
              "✅ Register on Startup India (startupindia.gov.in) — free, tax benefits<br>" +
              "✅ Apply to NASSCOM 10000 Startups — free mentorship + funding<br>" +
              "✅ 100x.vc offers ₹25L at 1% equity — great first funding<br>" +
              "✅ Microsoft & Google give free cloud credits for startups<br>" +
              "✅ Y Combinator is open to Indian founders — apply every batch<br><br>" +
              "💡 <em>The best time to start? When you've validated a real problem people will pay to solve.</em>",
        chips: ["How to get funding", "Startup India registration", "No-code tools to build MVP"]
      };
    }

    // ── ABOUT BELONGIX
    if (intent === "about") {
      return {
        text: "💚 <strong>About Belongix:</strong><br><br>" +
              "Belongix is India's professional career platform built for students, freshers, and working professionals.<br><br>" +
              "<strong>What we offer:</strong><br>" +
              "📊 Career Score — track your professional growth<br>" +
              "💼 Live Jobs — matched to your profile<br>" +
              "💰 Salary Intelligence — know your worth<br>" +
              "🛠️ Upskilling Tracks — learn in-demand skills<br>" +
              "🤝 Professional Network — connect with peers<br><br>" +
              "🌐 Visit: <strong>belongix.in</strong><br>" +
              "📧 Contact: teambelongix@gmail.com",
        chips: ["How to use Belongix", "Is Belongix free", "How career score works"]
      };
    }

    // ── GENERAL FALLBACK
    var fallbacks = [
      "That's a great question! I'm still learning about that topic. Here's what I <em>can</em> help you with:<br><br>💰 Salary for any role in India<br>🏢 Interview prep for TCS, Google, Amazon, etc.<br>📄 Resume tips<br>🛠️ Skills to learn in 2026<br>🗺️ Career path guidance<br><br>What would you like to explore?",
      "Hmm, let me make sure I help you best! I specialise in Indian career guidance. Try asking me:<br><br>• 'What is the salary for a Data Scientist?'<br>• 'How to crack Google interview?'<br>• 'What skills should I learn in 2026?'<br>• 'I am a fresher, what should I do?'",
      "I want to give you the best answer! Could you be a bit more specific? For example:<br><br>🎯 Which role are you in or targeting?<br>📍 Which city are you based in?<br>🏢 Which company are you preparing for?<br><br>That'll help me give you a much more tailored answer!"
    ];
    return {
      text: pickRandom(fallbacks),
      chips: ["Salary check", "Interview prep", "Career advice", "What is Belongix"]
    };
  }

  // ── UI ───────────────────────────────────────────────────────────

  var CSS = [
    "#bx-bubble{position:fixed;bottom:24px;right:24px;z-index:99999;font-family:'DM Sans',system-ui,sans-serif;all:initial;display:block}",
    "#bx-bubble *{box-sizing:border-box;font-family:'DM Sans',system-ui,sans-serif;line-height:normal;letter-spacing:normal;text-transform:none}",
    "#bx-btn{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#2563EB,#0EA5E9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(37,99,235,.4);transition:.3s;position:relative}",
    "#bx-btn:hover{transform:scale(1.08)}",
    "#bx-btn svg{width:26px;height:26px;color:white}",
    "#bx-dot{position:absolute;top:3px;right:3px;width:10px;height:10px;background:#10B981;border-radius:50%;border:2px solid white;animation:bxPulse 2s infinite}",
    "@keyframes bxPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.7}}",
    "#bx-window{position:fixed;bottom:92px;right:24px;width:370px;height:520px;background:white;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden;border:1px solid #E2E8F0;z-index:99999}",
    "#bx-window.open{display:flex}",
    "#bx-head{background:linear-gradient(135deg,#1E3A5F,#2563EB);padding:16px 18px;display:flex;align-items:center;gap:12px}",
    "#bx-head-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}",
    "#bx-head-info h4{color:white;font-size:14px;font-weight:700;margin:0}",
    "#bx-head-info p{color:rgba(255,255,255,.7);font-size:11px;margin:0}",
    "#bx-close{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer;font-size:20px;line-height:1;padding:4px}",
    "#bx-close:hover{color:white}",
    "#bx-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}",
    "#bx-msgs::-webkit-scrollbar{width:4px}",
    "#bx-msgs::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}",
    ".bx-msg{max-width:86%;padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.6;animation:bxFadeIn .25s ease}",
    "@keyframes bxFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}",
    ".bx-bot{background:#F1F5F9;color:#0F172A;border-bottom-left-radius:4px;align-self:flex-start}",
    ".bx-user{background:linear-gradient(135deg,#2563EB,#0EA5E9);color:white;border-bottom-right-radius:4px;align-self:flex-end}",
    ".bx-typing{display:flex;gap:4px;padding:12px 14px;background:#F1F5F9;border-radius:16px;border-bottom-left-radius:4px;align-self:flex-start}",
    ".bx-typing span{width:7px;height:7px;border-radius:50%;background:#94A3B8;animation:bxBounce 1.2s infinite}",
    ".bx-typing span:nth-child(2){animation-delay:.2s}",
    ".bx-typing span:nth-child(3){animation-delay:.4s}",
    "@keyframes bxBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}",
    ".bx-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}",
    ".bx-chip{background:white;border:1.5px solid #DBEAFE;color:#2563EB;border-radius:20px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;transition:.2s;font-family:inherit}",
    ".bx-chip:hover{background:#EFF6FF;border-color:#2563EB}",
    "#bx-footer{padding:12px 16px;border-top:1px solid #F1F5F9;display:flex;gap:8px}",
    "#bx-input{flex:1;border:1.5px solid #E2E8F0;border-radius:12px;padding:9px 14px;font-size:13px;font-family:inherit;color:#0F172A;outline:none;transition:.2s}",
    "#bx-input:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.1)}",
    "#bx-send{width:38px;height:38px;border-radius:10px;background:#2563EB;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s;flex-shrink:0}",
    "#bx-send:hover{background:#1d4ed8}",
    "#bx-send svg{width:16px;height:16px;color:white}",
    "@media(max-width:480px){#bx-window{width:calc(100vw - 32px);right:16px}}"
  ].join("");

  function inject() {
    // Fonts
    if (!document.getElementById("bx-font")) {
      var link = document.createElement("link");
      link.id = "bx-font";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    // Style
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    // HTML
    var html = [
      '<div id="bx-bubble">',
        '<div id="bx-window">',
          '<div id="bx-head">',
            '<div id="bx-head-avatar">🤖</div>',
            '<div id="bx-head-info"><h4>Bexi — Career AI</h4><p>Powered by Belongix · Always online</p></div>',
            '<button id="bx-close" onclick="bxToggle()">✕</button>',
          '</div>',
          '<div id="bx-msgs"></div>',
          '<div id="bx-footer">',
            '<input id="bx-input" type="text" placeholder="Ask me anything about your career...">',
            '<button id="bx-send"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>',
          '</div>',
        '</div>',
        '<button id="bx-btn" onclick="bxToggle()">',
          '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
          '<div id="bx-dot"></div>',
        '</button>',
      '</div>'
    ].join("");

    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    document.body.appendChild(wrap.firstChild);

    // Events
    document.getElementById("bx-input").addEventListener("keypress", function (e) {
      if (e.key === "Enter") bxSend();
    });
    document.getElementById("bx-send").addEventListener("click", bxSend);

  }

  var isOpen = false;
  var welcomed = false;
  window.bxToggle = function () {
    isOpen = !isOpen;
    var w = document.getElementById("bx-window");
    if (isOpen) {
      w.classList.add("open");
      setTimeout(function(){ document.getElementById("bx-input").focus(); }, 100);
      if (!welcomed) {
        welcomed = true;
        setTimeout(function () {
          bxAppendBot("Hi! I'm <strong>Bexi</strong> — Belongix's career guide 👋<br><br>Ask me anything about salaries, interview prep, skills to learn, or career paths in India!", ["Check my salary", "Interview tips", "Best skills 2026", "I am a fresher"]);
        }, 300);
      }
    } else {
      w.classList.remove("open");
    }
  };

  function bxAppendBot(text, chips) {
    var msgs = document.getElementById("bx-msgs");
    if (!msgs) return;
    var div = document.createElement("div");
    div.className = "bx-msg bx-bot";
    div.style.cssText = "max-width:86%;padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.6;background:#F1F5F9;color:#0F172A;border-bottom-left-radius:4px;align-self:flex-start;display:block;margin:0;word-wrap:break-word";
    div.innerHTML = text;
    msgs.appendChild(div);
    if (chips && chips.length) {
      var chipWrap = document.createElement("div");
      chipWrap.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin-top:6px";
      chips.forEach(function (chip) {
        var btn = document.createElement("button");
        btn.style.cssText = "background:white;border:1.5px solid #DBEAFE;color:#2563EB;border-radius:20px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:.2s";
        btn.textContent = chip;
        btn.onclick = function () { bxHandleChip(chip); };
        btn.onmouseover = function(){ this.style.background="#EFF6FF"; };
        btn.onmouseout = function(){ this.style.background="white"; };
        chipWrap.appendChild(btn);
      });
      msgs.appendChild(chipWrap);
    }
    msgs.scrollTop = msgs.scrollHeight;
  }

  function bxHandleChip(text) {
    var input = document.getElementById("bx-input");
    input.value = text;
    bxSend();
  }

  function bxSend() {
    var input = document.getElementById("bx-input");
    var msg = input.value.trim();
    if (!msg) return;
    input.value = "";

    var msgs = document.getElementById("bx-msgs");
    var userDiv = document.createElement("div");
    userDiv.style.cssText = "max-width:86%;padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.6;background:linear-gradient(135deg,#2563EB,#0EA5E9);color:white;border-bottom-right-radius:4px;align-self:flex-end;display:block;margin:0;word-wrap:break-word";
    userDiv.textContent = msg;
    msgs.appendChild(userDiv);

    var typing = document.createElement("div");
    typing.className = "bx-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    var delay = 600 + Math.random() * 600;
    setTimeout(function () {
      msgs.removeChild(typing);
      var resp = getResponse(msg);
      bxAppendBot(resp.text, resp.chips);
    }, delay);
  }

  // ── INIT
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

})();
