/* Belongix AI Agent - Bexi v2.0 */
(function() {

  var salaries = {
    "software engineer": "Entry: Rs.4-8 LPA | Mid: Rs.10-20 LPA | Senior: Rs.22-40 LPA",
    "data scientist": "Entry: Rs.5-10 LPA | Mid: Rs.12-22 LPA | Senior: Rs.25-45 LPA",
    "devops engineer": "Entry: Rs.5-9 LPA | Mid: Rs.10-22 LPA | Senior: Rs.25-40 LPA",
    "product manager": "Entry: Rs.8-14 LPA | Mid: Rs.18-32 LPA | Senior: Rs.35-65 LPA",
    "ml engineer": "Entry: Rs.6-12 LPA | Mid: Rs.15-30 LPA | Senior: Rs.35-80 LPA",
    "frontend developer": "Entry: Rs.3-7 LPA | Mid: Rs.8-18 LPA | Senior: Rs.20-35 LPA",
    "backend developer": "Entry: Rs.4-8 LPA | Mid: Rs.9-20 LPA | Senior: Rs.22-38 LPA",
    "full stack developer": "Entry: Rs.4-9 LPA | Mid: Rs.10-22 LPA | Senior: Rs.24-40 LPA",
    "data analyst": "Entry: Rs.3-6 LPA | Mid: Rs.7-14 LPA | Senior: Rs.15-25 LPA",
    "cloud architect": "Entry: Rs.10-16 LPA | Mid: Rs.18-35 LPA | Senior: Rs.38-65 LPA",
    "ui ux designer": "Entry: Rs.3-6 LPA | Mid: Rs.7-15 LPA | Senior: Rs.18-30 LPA",
    "qa engineer": "Entry: Rs.3-6 LPA | Mid: Rs.6-14 LPA | Senior: Rs.15-25 LPA",
    "fresher": "Service companies: Rs.3.5-6 LPA | Product startups: Rs.6-12 LPA | FAANG: Rs.20-40 LPA"
  };

  var companies = {
    "tcs": "Prep: TCS iON NQT exam, aptitude + verbal + coding<br>Salary: Rs.3.36-7 LPA fresher<br>Culture: Great training program (ILP), good for freshers<br>Tip: Apply via TCS NextStep portal. NQT score is the gateway.",
    "infosys": "Prep: InfyTQ certification (mandatory for campus), HackWithInfy for better packages<br>Salary: Rs.3.6-9.3 LPA fresher<br>Culture: Strong learning culture, world-class Mysore training<br>Tip: Get InfyTQ certified before interview.",
    "wipro": "Prep: WILP exam, aptitude + coding in any language<br>Salary: Rs.3.5-7 LPA fresher<br>Culture: Stable, large delivery teams<br>Tip: Wipro NLTH (National Level Talent Hunt) is the best entry path.",
    "google": "Prep: LeetCode Medium/Hard daily for 3-6 months, System Design, STAR behavioral<br>Salary: Rs.25-80+ LPA<br>Culture: Innovation-driven, best tech culture in industry<br>Tip: Referrals increase chances by 5x. Network on LinkedIn first.",
    "amazon": "Prep: Study all 14 Leadership Principles deeply, LeetCode, STAR method<br>Salary: Rs.18-60 LPA + RSU stock grants<br>Culture: Fast-paced, ownership-driven, customer obsession is real<br>Tip: Leadership Principles are as important as coding. Prepare both.",
    "microsoft": "Prep: LeetCode Medium level, System Design for senior roles<br>Salary: Rs.20-70 LPA + significant RSU grants<br>Culture: Growth mindset, very employee-friendly<br>Tip: Known for great work-life balance vs other FAANG companies.",
    "razorpay": "Prep: Strong DSA, System Design (payments context), product thinking<br>Salary: Rs.12-40 LPA + valuable ESOPs<br>Culture: Fast-growing fintech leader<br>Tip: Know the payments domain - UPI, banking APIs, payment gateway.",
    "swiggy": "Prep: DSA + System Design at scale, data problems, product sense<br>Salary: Rs.14-45 LPA + ESOPs<br>Culture: High-energy startup, massive scale challenges<br>Tip: Focus on distributed systems and scale.",
    "flipkart": "Prep: DSA + System Design, e-commerce domain knowledge<br>Salary: Rs.15-50 LPA<br>Culture: India's e-commerce pioneer, strong engineering culture<br>Tip: Focus on scale - Flipkart handles millions of transactions daily."
  };

  function getResponse(msg) {
    var m = msg.toLowerCase().trim();

    if (!m || m.length < 3 || /^(hi|hello|hey|start|help|namaste)/.test(m)) {
      return "Hi! I am <b>Bexi</b>, Belongix's career guide!<br><br>I can help with:<br>- Salary check for any role<br>- Interview prep for TCS, Google, Amazon and more<br>- Resume tips<br>- Skills to learn in 2026<br>- Fresher job guide<br>- Career roadmap<br><br>What would you like to know?";
    }

    if (m.indexOf("salary") !== -1 || m.indexOf("ctc") !== -1 || m.indexOf("lpa") !== -1 || m.indexOf("pay") !== -1 || m.indexOf("earn") !== -1 || m.indexOf("package") !== -1) {
      for (var role in salaries) {
        if (m.indexOf(role) !== -1) {
          return "<b>Salary for " + role.replace(/\b\w/g, function(l){ return l.toUpperCase(); }) + " in India (2026):</b><br><br>" + salaries[role].replace(/\|/g, "<br>") + "<br><br>Product companies pay 40-60% more than service companies like TCS/Infosys.";
        }
      }
      return "<b>Average Tech Salaries in India 2026:</b><br><br>Fresher (0-1 yr): Rs.3.5-8 LPA<br>Mid-level (2-5 yr): Rs.8-22 LPA<br>Senior (5-10 yr): Rs.18-45 LPA<br>Lead/Architect (10+ yr): Rs.35-80+ LPA<br><br>Which role would you like specific salary details for?";
    }

    for (var comp in companies) {
      if (m.indexOf(comp) !== -1) {
        return "<b>" + comp.charAt(0).toUpperCase() + comp.slice(1) + " Interview Guide:</b><br><br>" + companies[comp];
      }
    }

    if (m.indexOf("skill") !== -1 || m.indexOf("learn") !== -1 || m.indexOf("course") !== -1 || m.indexOf("technolog") !== -1 || m.indexOf("certif") !== -1) {
      return "<b>Top Skills to Learn in 2026:</b><br><br><b>Most In-Demand:</b><br>- Generative AI and Prompt Engineering<br>- Python<br>- Cloud: AWS, Azure, GCP<br>- React.js and Node.js<br>- Data Analysis and SQL<br>- Kubernetes and Docker<br><br><b>Top Certifications:</b><br>- AWS Solutions Architect<br>- Google Cloud Professional<br>- Certified Kubernetes Admin (CKA)<br><br>Focus on one skill deeply - employers value depth over breadth.";
    }

    if (m.indexOf("resume") !== -1 || m.indexOf(" cv") !== -1) {
      return "<b>Resume Tips for Indian Job Market:</b><br><br>- Keep to 1 page if under 5 years experience<br>- Start every bullet with an action verb (Built, Reduced, Improved)<br>- Quantify results: 'Improved speed by 40%' beats 'Improved performance'<br>- Put skills section at top - recruiters scan in 6 seconds<br>- Include GitHub profile link<br>- Use ATS-friendly format: no tables, no graphics<br>- Tailor for each job - match keywords from job description<br><br>Use Novoresume or Overleaf for clean templates.";
    }

    if (m.indexOf("interview") !== -1 || m.indexOf("crack") !== -1 || m.indexOf("prepar") !== -1) {
      return "<b>Interview Preparation Guide:</b><br><br>- DSA: LeetCode daily - 2 easy + 1 medium minimum<br>- System Design: Study Grokking the System Design Interview<br>- Behavioral: Use STAR method - Situation, Task, Action, Result<br>- Research: Read company news, Glassdoor reviews<br>- Mock interviews: Practice on Pramp.com (free)<br>- Think aloud during coding rounds<br>- Follow up within 24 hours with thank-you email<br><br>Which company are you preparing for? I have specific guides!";
    }

    if (m.indexOf("fresher") !== -1 || m.indexOf("graduate") !== -1 || m.indexOf("first job") !== -1 || m.indexOf("no experience") !== -1 || m.indexOf("college") !== -1) {
      return "<b>Fresher Guide - Your First Job in India:</b><br><br>Step 1: Get certified - AWS free tier, Google certificates, Coursera<br>Step 2: Build 2-3 real projects on GitHub (not just tutorials!)<br>Step 3: Create a strong 1-page resume<br>Step 4: Apply on Naukri, LinkedIn, Instahyre, Wellfound<br>Step 5: Start with service companies (TCS/Infosys) for 2 years experience<br>Step 6: Move to product companies for 2-3x salary jump<br><br>Expected salary: Rs.3.5-9 LPA depending on company and skills.";
    }

    if (m.indexOf("career") !== -1 || m.indexOf("roadmap") !== -1 || m.indexOf("path") !== -1 || m.indexOf("grow") !== -1 || m.indexOf("promot") !== -1 || m.indexOf("switch") !== -1) {
      return "<b>Career Growth Tips for India:</b><br><br>- Fastest way to grow: Switch companies every 2-3 years - gets 30-50% hike<br>- Specialise: Go deep in one area (AI/ML, Cloud, Security)<br>- Get certified: AWS/GCP cert adds 20-40% salary bump<br>- Network: 85% of jobs are filled through referrals<br>- Build LinkedIn presence: Post content, contribute to open source<br><br>Typical path: Junior Dev - Senior Dev - Tech Lead - Engineering Manager - VP Engineering<br><br>Which field are you in? I can give a specific roadmap!";
    }

    if (m.indexOf("negotiat") !== -1 || m.indexOf("hike") !== -1 || m.indexOf("increment") !== -1) {
      return "<b>Salary Negotiation Tips:</b><br><br>- Always negotiate - 80% of employers expect it<br>- Research market rate on Glassdoor and LinkedIn first<br>- Give a range, not a single number. Start 20% above your target<br>- Never reveal current salary if you can avoid it<br>- Counter in writing - email feels more official<br>- Negotiate everything: joining bonus, ESOPs, WFH days, title<br>- Be ready to walk away - your strongest leverage<br><br>Average negotiation in India gets 10-25% more than initial offer!";
    }

    if (m.indexOf("burnout") !== -1 || m.indexOf("stress") !== -1 || m.indexOf("tired") !== -1 || m.indexOf("toxic") !== -1 || m.indexOf("quit") !== -1) {
      return "You are not alone. 83% of Indian IT professionals face burnout.<br><br>What actually helps:<br>- Take a proper break - even 2-3 days makes a difference<br>- Talk to a trusted colleague or friend<br>- Set clear work hours and protect them<br>- If the company is toxic, plan your exit carefully - do not quit impulsively<br><br>Sometimes burnout is a signal it is time for a better role. When you are ready, I can help you find and prepare for better opportunities.";
    }

    if (m.indexOf("ai") !== -1 || m.indexOf("machine learning") !== -1 || m.indexOf("data science") !== -1 || m.indexOf("ml") !== -1) {
      return "<b>AI/ML Career in India - 2026 Guide:</b><br><br>India faces 53% AI talent deficit. Demand is massive, supply is low.<br><br><b>Roadmap (6-12 months):</b><br>1. Master Python (1-2 months)<br>2. Statistics and Math basics (2 months)<br>3. Machine Learning with scikit-learn (2-3 months)<br>4. Deep Learning with TensorFlow/PyTorch (2-3 months)<br>5. Specialise: NLP, Computer Vision, or GenAI<br>6. Build 2-3 projects and compete on Kaggle<br><br>Salary: Rs.8-35 LPA entry to senior. Top AI engineers earn Rs.50-80+ LPA.";
    }

    if (m.indexOf("belongix") !== -1 || m.indexOf("what is this") !== -1 || m.indexOf("about") !== -1) {
      return "<b>About Belongix:</b><br><br>Belongix is India's professional career platform for students, freshers, and working professionals.<br><br>What we offer:<br>- Career Score tracking<br>- Live Job listings matched to your profile<br>- Salary Intelligence<br>- Upskilling Tracks<br>- Professional Networking<br>- Bexi AI Career Guide<br><br>Website: belongix.in | Free to join | Premium at Rs.599/month";
    }

    if (m.indexOf("motivat") !== -1 || m.indexOf("stuck") !== -1 || m.indexOf("rejected") !== -1 || m.indexOf("hopeless") !== -1) {
      return "Every rejection is data - not a verdict on your worth.<br><br>The average software engineer gets rejected 7-10 times before landing their dream job. What separates successful people is persistence - they keep applying, keep improving, keep showing up.<br><br>What to do right now:<br>1. Apply to 5 more companies today<br>2. Learn one new concept this week<br>3. Reach out to one new person on LinkedIn<br><br>The right opportunity is coming. Keep going!";
    }

    return "I want to give you the best answer! Try asking me:<br><br>- 'What is the salary for a software engineer?'<br>- 'How to crack Google interview?'<br>- 'What skills should I learn in 2026?'<br>- 'I am a fresher, what should I do?'<br>- 'TCS interview prep'<br>- 'Resume tips'<br><br>What would you like to know?";
  }

  function build() {
    var old = document.getElementById("bxWrap");
    if (old) old.parentNode.removeChild(old);

    var style = document.createElement("style");
    style.id = "bxStyle";
    style.textContent = "#bxWrap{position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}#bxBtn{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#2563EB,#0EA5E9);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(37,99,235,.4);position:relative;display:flex;align-items:center;justify-content:center}#bxBtn svg{width:24px;height:24px;color:#fff;pointer-events:none}#bxDot{position:absolute;top:3px;right:3px;width:11px;height:11px;background:#10B981;border-radius:50%;border:2px solid #fff;pointer-events:none}#bxBox{display:none;position:fixed;bottom:90px;right:24px;width:356px;height:500px;background:#fff;border-radius:18px;box-shadow:0 8px 40px rgba(0,0,0,.2);flex-direction:column;overflow:hidden;border:1px solid #e2e8f0}#bxBox.on{display:flex}#bxHd{background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}#bxAv{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}#bxNm{flex:1}#bxNm b{color:#fff;font-size:14px;font-weight:700;display:block}#bxNm small{color:rgba(255,255,255,.65);font-size:11px}#bxCl{background:none;border:none;color:rgba(255,255,255,.7);font-size:20px;cursor:pointer;line-height:1;padding:2px 6px;border-radius:4px}#bxCl:hover{color:#fff}#bxMs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;min-height:0}#bxMs::-webkit-scrollbar{width:3px}#bxMs::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}.bb{background:#f1f5f9;color:#0f172a;border-radius:14px 14px 14px 3px;padding:10px 13px;font-size:13px;line-height:1.65;max-width:90%;align-self:flex-start;word-break:break-word}.bu{background:linear-gradient(135deg,#2563eb,#0ea5e9);color:#fff;border-radius:14px 14px 3px 14px;padding:10px 13px;font-size:13px;line-height:1.65;max-width:90%;align-self:flex-end;word-break:break-word}.bd{background:#f1f5f9;border-radius:14px 14px 14px 3px;padding:12px 14px;align-self:flex-start;display:flex;gap:4px}.bd i{width:6px;height:6px;background:#94a3b8;border-radius:50%;animation:bx 1.2s infinite;display:inline-block}.bd i:nth-child(2){animation-delay:.2s}.bd i:nth-child(3){animation-delay:.4s}@keyframes bx{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}.bc{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}.bch{background:#fff;border:1.5px solid #bfdbfe;color:#2563eb;border-radius:14px;padding:4px 11px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit}#bxFt{padding:10px 12px;border-top:1px solid #f1f5f9;display:flex;gap:8px;flex-shrink:0}#bxIn{flex:1;border:1.5px solid #e2e8f0;border-radius:10px;padding:8px 12px;font-size:13px;font-family:inherit;color:#0f172a;outline:none;background:#fff;min-width:0}#bxIn:focus{border-color:#2563eb}#bxSd{width:36px;height:36px;border-radius:9px;background:#2563eb;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}#bxSd svg{width:14px;height:14px;color:#fff;pointer-events:none}@media(max-width:480px){#bxBox{width:calc(100vw - 32px);right:16px}}";
    document.head.appendChild(style);

    // Create elements
    var wrap = document.createElement("div"); wrap.id = "bxWrap";
    var box  = document.createElement("div"); box.id  = "bxBox";
    var hd   = document.createElement("div"); hd.id   = "bxHd";
    var av   = document.createElement("div"); av.id   = "bxAv";  av.textContent = "🤖";
    var nm   = document.createElement("div"); nm.id   = "bxNm";
    var nb   = document.createElement("b");   nb.textContent = "Bexi — Career AI";
    var ns   = document.createElement("small"); ns.textContent = "Powered by Belongix · Always online";
    var cl   = document.createElement("button"); cl.id = "bxCl"; cl.textContent = "✕";
    var ms   = document.createElement("div"); ms.id   = "bxMs";
    var ft   = document.createElement("div"); ft.id   = "bxFt";
    var inp  = document.createElement("input"); inp.id = "bxIn"; inp.type = "text"; inp.placeholder = "Ask about salaries, interviews, skills..."; inp.autocomplete = "off";
    var sd   = document.createElement("button"); sd.id = "bxSd"; sd.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    var btn  = document.createElement("button"); btn.id = "bxBtn";
    var dot  = document.createElement("div");   dot.id  = "bxDot";

    nm.appendChild(nb); nm.appendChild(ns);
    hd.appendChild(av); hd.appendChild(nm); hd.appendChild(cl);
    ft.appendChild(inp); ft.appendChild(sd);
    box.appendChild(hd); box.appendChild(ms); box.appendChild(ft);
    btn.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    btn.appendChild(dot);
    wrap.appendChild(box); wrap.appendChild(btn);
    document.body.appendChild(wrap);

    var isOpen = false, hasWelcomed = false;

    function toggle() {
      isOpen = !isOpen;
      isOpen ? box.classList.add("on") : box.classList.remove("on");
      if (isOpen) {
        inp.focus();
        if (!hasWelcomed) {
          hasWelcomed = true;
          setTimeout(function() {
            addBot("Hi! I am <b>Bexi</b>, Belongix's career guide!<br><br>Ask me anything:<br>- Salary for any role<br>- Interview prep (TCS, Google, Amazon...)<br>- Resume tips | Skills to learn<br>- Fresher guide | Career roadmap", ["Salary check", "Interview tips", "Skills 2026", "I am a fresher"]);
          }, 200);
        }
      }
    }

    function addBot(html, chips) {
      var d = document.createElement("div"); d.className = "bb"; d.innerHTML = html;
      ms.appendChild(d);
      if (chips) {
        var cw = document.createElement("div"); cw.className = "bc";
        chips.forEach(function(c) {
          var ch = document.createElement("button"); ch.className = "bch"; ch.textContent = c;
          ch.addEventListener("click", function() { doSend(c); });
          cw.appendChild(ch);
        });
        ms.appendChild(cw);
      }
      ms.scrollTop = 99999;
    }

    function doSend(text) {
      var msg = (text !== undefined ? text : inp.value).trim();
      if (!msg) return;
      inp.value = "";
      var u = document.createElement("div"); u.className = "bu"; u.textContent = msg;
      ms.appendChild(u);
      var dots = document.createElement("div"); dots.className = "bd"; dots.innerHTML = "<i></i><i></i><i></i>";
      ms.appendChild(dots);
      ms.scrollTop = 99999;
      setTimeout(function() {
        if (dots.parentNode) ms.removeChild(dots);
        addBot(getResponse(msg));
      }, 500 + Math.random() * 400);
    }

    btn.addEventListener("click", function(e) { e.stopPropagation(); toggle(); });
    cl.addEventListener("click",  function(e) { e.stopPropagation(); toggle(); });
    sd.addEventListener("click",  function(e) { e.stopPropagation(); doSend(); });
    inp.addEventListener("keydown", function(e) { if (e.key === "Enter") { e.preventDefault(); doSend(); } });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }

})();
