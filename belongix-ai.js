/* Belongix AI Agent - Bexi v3.1 */
(function(){"use strict";

var KB={
salaries:{"software engineer":{e:"Rs.4-8 LPA",m:"Rs.10-20 LPA",s:"Rs.22-40 LPA",n:"Product companies pay 40-60% more than TCS/Infosys/Wipro."},"data scientist":{e:"Rs.5-10 LPA",m:"Rs.12-22 LPA",s:"Rs.25-45 LPA",n:"AI/ML boom is driving salaries up fast across India."},"devops engineer":{e:"Rs.5-9 LPA",m:"Rs.10-22 LPA",s:"Rs.25-40 LPA",n:"AWS and Kubernetes skills add a significant salary premium."},"product manager":{e:"Rs.8-14 LPA",m:"Rs.18-32 LPA",s:"Rs.35-65 LPA",n:"MBA or strong PM portfolio accelerates growth significantly."},"ml engineer":{e:"Rs.6-12 LPA",m:"Rs.15-30 LPA",s:"Rs.35-80 LPA",n:"Hottest role in India with a 53% AI skill deficit."},"frontend developer":{e:"Rs.3-7 LPA",m:"Rs.8-18 LPA",s:"Rs.20-35 LPA",n:"React and TypeScript is the most in-demand combo in 2026."},"backend developer":{e:"Rs.4-8 LPA",m:"Rs.9-20 LPA",s:"Rs.22-38 LPA",n:"Node.js and Java/Spring dominate backend hiring."},"full stack developer":{e:"Rs.4-9 LPA",m:"Rs.10-22 LPA",s:"Rs.24-40 LPA",n:"Most in-demand role in India's startup ecosystem."},"data analyst":{e:"Rs.3-6 LPA",m:"Rs.7-14 LPA",s:"Rs.15-25 LPA",n:"SQL plus Power BI combo is very valuable for Indian market."},"cloud architect":{e:"Rs.10-16 LPA",m:"Rs.18-35 LPA",s:"Rs.38-65 LPA",n:"AWS certification alone adds Rs.3-5 LPA to your package."},"ui ux designer":{e:"Rs.3-6 LPA",m:"Rs.7-15 LPA",s:"Rs.18-30 LPA",n:"Figma proficiency is now a hard requirement everywhere."},"qa engineer":{e:"Rs.3-6 LPA",m:"Rs.6-14 LPA",s:"Rs.15-25 LPA",n:"Automation testing valued 3x over manual testing."},"fresher":{e:"Rs.3.5-6 LPA",m:"Rs.6-12 LPA",s:"Rs.20-40 LPA",n:"FAANG freshers get Rs.20-40 LPA. Service companies Rs.3.5-6 LPA."}},
companies:{tcs:{a:"India's largest IT company with 600,000+ employees. Best for fresh graduates and steady career growth.",p:["Complete the <b>TCS NQT</b> exam covering aptitude, verbal, and coding","Practice on <b>TCS iON</b> platform — identical to the actual exam interface","Coding: easy-level problems in C, Java, or Python are sufficient","HR round: prepare Tell me about yourself and Why TCS with genuine answers","Apply only through <b>TCS NextStep</b> portal — the only official path"],s:"Fresher: Rs.3.36-7 LPA | Experienced 3-5yr: Rs.6-15 LPA | Senior: Rs.15-25 LPA",c:"Strong training program called ILP. Good for building core fundamentals."},infosys:{a:"India's second largest IT company. Known for world-class training at Mysore campus.",p:["Get <b>InfyTQ certified</b> before interview — nearly mandatory for campus hires","Attempt <b>HackWithInfy</b> contest for Rs.9.3 LPA direct package","Two rounds: online test with aptitude and coding, then HR interview","HR focuses on relocation willingness, career goals, situational answers"],s:"Fresher: Rs.3.6-9.3 LPA | Experienced: Rs.7-20 LPA",c:"Strong learning culture. Mysore training is genuinely world-class."},google:{a:"World's most innovative tech company. Extremely competitive but transformative salaries.",p:["<b>DSA:</b> Solve LeetCode Medium and Hard daily for 3-6 months minimum","<b>System Design:</b> Study Grokking the System Design Interview end-to-end","<b>Behavioral:</b> STAR method for all answers — Google values structured thinking","5-6 interview rounds, each 45 minutes","<b>Critical tip:</b> A Google employee referral increases chances by 5x"],s:"SDE-1: Rs.25-40 LPA | SDE-2: Rs.40-70 LPA | Senior: Rs.70-120+ LPA including RSUs",c:"Innovation-driven, high autonomy. Best tech culture globally."},amazon:{a:"One of world's largest tech companies. Culture driven by 14 Leadership Principles.",p:["<b>Study all 14 Leadership Principles</b> deeply — every question maps to them","<b>STAR method mandatory:</b> Situation, Task, Action, Result for every answer","<b>DSA:</b> Focus on arrays, trees, graphs, dynamic programming","System Design for SDE-2 and above","<b>Key insight:</b> Amazon looks for ownership and bias-for-action above everything"],s:"SDE-1: Rs.18-35 LPA | SDE-2: Rs.32-55 LPA | SDE-3: Rs.55-90 LPA plus RSUs",c:"Fast-paced, ownership-driven. High performance bar but excellent career growth."},microsoft:{a:"Under Satya Nadella, one of the most employee-friendly major tech companies.",p:["<b>DSA:</b> LeetCode Medium level sufficient for most roles","System Design for senior roles with Azure cloud context","Collaborative style — they want to see you think, not just produce answers fast","3-4 rounds with final as-app round with hiring manager"],s:"SDE-1: Rs.20-40 LPA | SDE-2: Rs.35-65 LPA | Senior: Rs.60-100+ LPA plus RSUs",c:"Growth mindset culture. Best work-life balance among FAANG."},razorpay:{a:"India's leading fintech. Fastest growing Indian startup in the payments space.",p:["Strong <b>DSA fundamentals</b> — LeetCode Medium level minimum","<b>System Design</b> with fintech context — payments, idempotency, high availability","Understand UPI, banking APIs, and payment gateway ecosystem","4-5 rounds including mandatory system design for all levels"],s:"SDE-1: Rs.12-20 LPA | SDE-2: Rs.20-35 LPA | Senior: Rs.35-60 LPA plus ESOPs",c:"High-growth fintech. Fast pace. ESOPs could appreciate substantially."},swiggy:{a:"India's food delivery giant. Strong engineering culture solving massive scale problems.",p:["DSA plus System Design at scale — distributed systems knowledge critical","Data problems and optimization common in all interview rounds","Product sense evaluated alongside technical skills","5 rounds for most engineering roles"],s:"SDE-1: Rs.14-22 LPA | SDE-2: Rs.22-40 LPA | Senior: Rs.40-70 LPA plus ESOPs",c:"High-energy culture. Excellent engineering challenges and growth."},wipro:{a:"One of India's top 3 IT service companies. Good for career stability.",p:["<b>WILP exam</b> for lateral hires covering aptitude and coding","Coding in any language — typically easy level problems","Two rounds: online test then HR interview","Wipro NLTH is the recommended campus path"],s:"Fresher: Rs.3.5-7 LPA | Experienced: Rs.6-18 LPA",c:"Stable company. Good work-life balance. Good for mid-career professionals."}}};

function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function getRole(m){var r=Object.keys(KB.salaries);for(var i=0;i<r.length;i++){if(m.indexOf(r[i])!==-1)return r[i];}return null;}
function getComp(m){var c=Object.keys(KB.companies);for(var i=0;i<c.length;i++){if(m.indexOf(c[i])!==-1)return c[i];}return null;}

function detect(m){
if(/^(hi|hello|hey|start|help|namaste|good morning|good evening|what can|howdy)/.test(m)||m.length<4)return"greet";
if(/salary|ctc|lpa|pay |earn|package|compensation|stipend|how much/.test(m))return"salary";
if(/tcs|infosys|wipro|google|amazon|microsoft|razorpay|swiggy|flipkart/.test(m))return"company";
if(/skill|learn|course|certif|technolog|upskill|what to study/.test(m))return"skills";
if(/resume|cv\b|curriculum|ats/.test(m))return"resume";
if(/interview|crack|prepar|technical round|hr round|coding round/.test(m))return"interview";
if(/fresher|graduate|first job|no experience|entry level|campus/.test(m))return"fresher";
if(/career path|roadmap|how to become|career change|switch|grow|promotion|when to switch/.test(m))return"career";
if(/negotiat|counter offer|salary hike/.test(m))return"negotiate";
if(/machine learning|artificial intel|data science|deep learning|llm|genai| ai /.test(m))return"aiml";
if(/burnout|stress|tired|exhausted|toxic|mental health/.test(m))return"burnout";
if(/motivat|stuck|give up|rejected|failure|discourag|hopeless|lost my job/.test(m))return"motivate";
if(/ticket|support|issue|problem|complaint|bug|feedback|contact team|report/.test(m))return"ticket";
if(/belongix|about this|what is this|platform|how does/.test(m))return"about";
if(/job search|find job|where to apply|job portal|naukri|instahyre/.test(m))return"jobsearch";
return"fallback";}

function salTable(e,m,s){return "<table style='border-collapse:collapse;width:100%;font-size:12px;margin:8px 0'><tr style='background:#EFF6FF'><td style='padding:5px 9px;border:1px solid #DBEAFE;font-weight:700'>Level</td><td style='padding:5px 9px;border:1px solid #DBEAFE;font-weight:700'>Exp</td><td style='padding:5px 9px;border:1px solid #DBEAFE;font-weight:700'>Range</td></tr><tr><td style='padding:5px 9px;border:1px solid #E2E8F0'>Entry</td><td style='padding:5px 9px;border:1px solid #E2E8F0'>0-2 yrs</td><td style='padding:5px 9px;border:1px solid #E2E8F0'>"+e+"</td></tr><tr style='background:#F8FAFC'><td style='padding:5px 9px;border:1px solid #E2E8F0'>Mid</td><td style='padding:5px 9px;border:1px solid #E2E8F0'>3-6 yrs</td><td style='padding:5px 9px;border:1px solid #E2E8F0'>"+m+"</td></tr><tr><td style='padding:5px 9px;border:1px solid #E2E8F0'>Senior</td><td style='padding:5px 9px;border:1px solid #E2E8F0'>7+ yrs</td><td style='padding:5px 9px;border:1px solid #E2E8F0'>"+s+"</td></tr></table>";}

function respond(msg){
var m=msg.toLowerCase().trim(),role,comp,sal,cd;
switch(detect(m)){
case"greet":return{h:rnd(["Hello! Welcome to Belongix \uD83D\uDC4B I am <b>Bexi</b>, your personal career guide.<br><br>Here is what I can help you with:<br><br>\uD83C\uDFAF <b>Career Guidance</b> — roadmaps, role advice, growth strategy<br>\uD83D\uDCB0 <b>Salary Intelligence</b> — real market data for any role<br>\uD83C\uDFE2 <b>Interview Prep</b> — company-specific guides (TCS, Google, Amazon...)<br>\uD83D\uDCC4 <b>Resume and CV Tips</b> — beat ATS and impress recruiters<br>\uD83D\uDEE0 <b>Skills and Learning</b> — what to learn for the 2026 market<br>\uD83C\uDF93 <b>Fresher Guide</b> — complete first job roadmap<br>\uD83C\uDF9F <b>Help and Support</b> — raise a ticket to our team<br><br>How can I help you today?","Hi there! I am <b>Bexi</b> from Belongix \uD83E\uDD16<br><br>I am here to help you make the best career decisions. Ask me about salaries, interview prep, skills to learn, company culture, career paths — or raise a support ticket if you need our team.<br><br>What is on your mind?"]),c:["Check my salary","Interview prep tips","I am a fresher","Raise a support ticket"]};
case"salary":role=getRole(m);if(role){sal=KB.salaries[role];return{h:"<b>Salary: "+role.replace(/\b\w/g,function(l){return l.toUpperCase();})+" in India (2026)</b>"+salTable(sal.e,sal.m,sal.s)+"<i>"+sal.n+"</i>",c:["How to negotiate this salary","Top companies for this role","How to grow faster"]};}return{h:"<b>Average Tech Salaries in India (2026)</b>"+salTable("Rs.3.5-8 LPA","Rs.8-22 LPA","Rs.18-45 LPA")+"Which role would you like details for?",c:["Software Engineer salary","Data Scientist salary","DevOps salary","Product Manager salary"]};
case"company":comp=getComp(m);if(comp){cd=KB.companies[comp];return{h:"<b>"+comp.charAt(0).toUpperCase()+comp.slice(1)+" — Interview Guide</b><br><br><b>About:</b> "+cd.a+"<br><br><b>How to prepare:</b><ol style='padding-left:16px;margin:6px 0'>"+cd.p.map(function(p){return"<li style='margin-bottom:5px;font-size:12px'>"+p+"</li>";}).join("")+"</ol><b>Salary:</b> "+cd.s+"<br><br><b>Culture:</b> "+cd.c,c:["Negotiate at "+comp,"Resume tips for "+comp,"Is "+comp+" good for freshers"]};}return{h:"I have detailed guides for: <b>TCS, Infosys, Wipro, Google, Amazon, Microsoft, Razorpay, Swiggy</b>.<br><br>Which company are you targeting?",c:["Google interview","Amazon interview","TCS interview","Razorpay interview"]};
case"skills":return{h:"<b>Top Skills to Learn in 2026</b><br><br><b>Most In-Demand:</b><br>1. Generative AI and Prompt Engineering<br>2. Python<br>3. Cloud Computing (AWS, Azure, GCP)<br>4. React.js and Next.js<br>5. Node.js<br>6. Data Analysis and SQL<br>7. Kubernetes and Docker<br><br><b>Rising Fast:</b><br>• LangChain and RAG Systems<br>• Vector Databases<br>• Go (Golang)<br>• Platform Engineering<br><br><b>Certifications that pay off:</b><br>• AWS Solutions Architect Associate<br>• Google Professional Cloud Engineer<br>• Certified Kubernetes Admin (CKA)<br><br><i>Best strategy: pick one skill and go deep. Employers pay a premium for genuine expertise.</i>",c:["Best AI/ML skills","Cloud certifications","Frontend or backend?","How long to learn Python"]};
case"resume":return{h:"<b>Resume Tips for Indian Tech Market</b><br><br><b>Format rules:</b><br>• 1 page if under 5 years experience — no exceptions<br>• ATS-friendly template: use Novoresume or Overleaf<br>• No Canva graphics, tables, or text boxes — ATS cannot parse them<br><br><b>Content rules:</b><br>• Replace Objective with a 2-line Professional Summary<br>• Every bullet = Action Verb + What you did + Quantified result<br>• Example: Reduced API response time by 40% using Redis caching<br>• Include GitHub link and certifications prominently<br><br><b>ATS tip:</b> Copy keywords directly from the job description into your resume<br><br><b>What recruiters scan in 6 seconds:</b> Job title, company names, skills section, education, years of experience",c:["How to write project bullets","ATS optimization tips","Should I include my GPA?"]};
case"interview":return{h:"<b>Interview Preparation — Complete Guide</b><br><br><b>Technical:</b><br>• DSA: LeetCode daily — 2 easy plus 1 medium minimum. Focus on arrays, trees, graphs, DP<br>• System Design: Grokking the System Design Interview — know load balancing, caching, microservices<br>• CS Fundamentals: OS, DBMS, Networking, OOP — asked in 70% of Indian tech interviews<br><br><b>Behavioral:</b><br>• Use STAR method: Situation, Task, Action, Result<br>• Prepare 5-6 stories covering leadership, failure, conflict, achievement, learning<br>• Research the company: recent news, products, culture<br><br><b>On the day:</b><br>• Think aloud during coding — your process matters as much as the answer<br>• Ask clarifying questions before coding — shows senior engineering thinking<br>• End with smart questions: What does success look like in 90 days?<br>• Send a thank-you email within 24 hours",c:["Google interview prep","Amazon Leadership Principles","System design tips","HR behavioral tips"]};
case"fresher":return{h:"<b>Complete Fresher Guide — First Job in India</b><br><br><b>Step 1 — Build credibility:</b><br>Get a free certification: AWS Cloud Practitioner, Google IT Support on Coursera, or Meta Frontend Developer Certificate<br><br><b>Step 2 — Build portfolio:</b><br>Create 2-3 real projects on GitHub. Solve actual problems, not tutorial clones. Ideas: expense tracker, job tracker, REST API project<br><br><b>Step 3 — Resume:</b><br>1 page maximum. Use Novoresume or Overleaf. Quantify every bullet with numbers.<br><br><b>Step 4 — Where to apply:</b><br>• Naukri.com — service companies<br>• LinkedIn — product companies and referrals<br>• Instahyre — AI-powered matching<br>• Wellfound — startup jobs<br><br><b>Step 5 — Strategy:</b><br>Start with service companies (TCS/Infosys) for 2 years experience, then switch to product companies for 2-3x salary jump.<br><br>Expected salary: Rs.3.5-9 LPA for service companies | Rs.12-40 LPA for FAANG",c:["Best companies for freshers","Fresher resume tips","TCS interview prep","How to get referrals"]};
case"career":return{h:"<b>Career Path and Growth Strategy</b><br><br><b>Common tech ladder:</b><br>Junior Engineer → Software Engineer → Senior Engineer → Staff/Lead → Principal Engineer or Engineering Manager → Director → VP Engineering<br><br><b>Fastest ways to grow salary in India:</b><br>1. Switch companies every 2-3 years — gets 30-50% hike vs 8-12% internal increment<br>2. Get certified — AWS or GCP cert alone adds Rs.3-5 LPA<br>3. Specialise in a high-demand niche: AI/ML, Cloud Security, Platform Engineering<br>4. Network actively — 85% of roles are filled through referrals<br>5. Build your brand — publish technical content, contribute to open source<br><br><b>When to switch:</b><br>• You have learned everything this role can teach you<br>• Your increment is below 15% for 2+ consecutive years<br>• You have been passed over for promotion without clear reason",c:["When should I switch jobs?","How to get promoted faster","Should I do an MBA?"]};
case"negotiate":return{h:"<b>Salary Negotiation — Complete Playbook</b><br><br><b>Before the conversation:</b><br>• Research market rate on Glassdoor, LinkedIn Salary, Levels.fyi, AmbitionBox<br>• Having another offer is your strongest leverage<br>• Never be first to name a number<br><br><b>Key rules:</b><br>• Always negotiate — 78% of employers have room and expect it<br>• Give a range, start 25-30% above your target<br>• Never reveal your current salary — not legally required in India<br>• Counter in writing — email feels official and gives you time<br>• Negotiate full package: base, joining bonus, ESOPs, WFH policy, title<br><br><b>Script that works:</b><br>Thank you for the offer. Based on my research for this role in [city], I was expecting closer to [X]. Is there flexibility on the base compensation?<br><br>Average successful negotiation in India: <b>10-25% above initial offer</b>",c:["Counter offer script","How to ask for a raise","Negotiate a joining bonus"]};
case"aiml":return{h:"<b>AI/ML Career in India — 2026 Guide</b><br><br>India faces a <b>53% AI skill deficit</b> with demand projected at 1 million AI roles by 2026.<br><br><b>Learning Roadmap (8-12 months):</b><br>1. Python mastery — NumPy, Pandas, Matplotlib (2 months)<br>2. Statistics and Math basics (2 months)<br>3. Machine Learning — scikit-learn, regression, classification (2-3 months)<br>4. Deep Learning — TensorFlow or PyTorch (2-3 months)<br>5. Specialisation — pick one: NLP, Computer Vision, or Generative AI<br>6. Portfolio — 3 strong projects plus 1 deployed app<br><br><b>Best free resources:</b><br>• fast.ai — best free deep learning course<br>• Kaggle — free courses and competitions<br>• Hugging Face — NLP and GenAI tutorials<br><br>Salaries: Entry Rs.8-12 LPA | Mid Rs.15-30 LPA | Senior Rs.35-80 LPA",c:["Best ML courses free","AI engineer salary","Top AI companies India"]};
case"burnout":return{h:"<b>You are not alone.</b><br><br>83% of Indian IT professionals experience burnout. It is real and it is valid.<br><br><b>Immediate steps:</b><br>• Take 2-3 proper rest days — even a long weekend helps reset<br>• Set one firm boundary this week: no work after 8 PM<br>• Talk to one trusted person — colleague, friend, or family<br><br><b>Medium-term:</b><br>• Identify the root cause: overwork? Bad manager? Wrong role?<br>• If the company is toxic, plan your exit quietly — never quit without another offer<br><br><b>Free support in India:</b><br>• iCall: 9152987821 (free counselling)<br>• Vandrevala Foundation: 1860-2662-345 (24/7 mental health)<br><br>You deserve a workplace that respects you.",c:["Help me find a better job","When should I quit?","How to handle a toxic manager"]};
case"motivate":return{h:"<b>About job rejections — the honest truth:</b><br><br>The average software engineer gets rejected <b>8-12 times</b> before landing their target role. Engineers now at Google and Amazon were rejected from their first 5 companies.<br><br>Rejection is not a verdict on your worth. It is feedback about fit, timing, and preparation gaps.<br><br><b>What to do right now:</b><br>1. Review your last 3 rejections — find the pattern (resume, DSA, system design, or behavioral?)<br>2. Identify the weakest link and spend 2 focused weeks fixing just that one thing<br>3. Apply to 5 new companies today — momentum is everything<br>4. Reach out to one new connection on LinkedIn today<br><br>The gap between where you are and where you want to be is filled with daily action.",c:["My resume gets rejected","I fail coding rounds","I fail HR rounds","Help me make a plan"]};
case"ticket":return{h:"<b>Raise a Support Ticket</b><br><br>Our team will get back to you within 24 hours on working days.<br><br>Please select the type of issue:",c:["Bug Report","Account and Login Help","Feature Request","Billing and Payments","General Enquiry"],act:"ticket"};
case"about":return{h:"<b>About Belongix</b><br><br>Belongix is India's professional career platform for students, freshers, and working professionals.<br><br><b>What we offer:</b><br>• Career Score — track and grow your professional profile<br>• Live Job Listings — matched to your skills and goals<br>• Salary Intelligence — real market data<br>• Upskilling Tracks — curated learning for 2026<br>• Professional Network — connect with peers<br>• Bexi AI — 24/7 career guidance<br>• Help and Support — dedicated team<br><br>Contact: teambelongix@gmail.com | Website: belongix.in<br>Free to join | Premium: Rs.599 per month",c:["How career score works","Is Belongix free?","Raise a support ticket"]};
case"jobsearch":return{h:"<b>Job Search Strategy for India (2026)</b><br><br><b>Best platforms:</b><br>• LinkedIn — product companies, referrals, senior roles<br>• Naukri.com — largest database, service companies<br>• Instahyre — AI-powered matching for mid-level roles<br>• Wellfound — startup jobs and equity roles<br>• Company career pages directly — better visibility<br><br><b>Strategy that works:</b><br>1. Apply to 30-50 jobs per week — it is a numbers game<br>2. Referrals increase interview rates by 5-10x — prioritise them<br>3. Customise your resume for each role to match keywords<br>4. Follow up after 5-7 days if no response",c:["How to get referrals","LinkedIn profile tips","How to write a cold message"]};
default:return{h:"I want to give you the most useful answer! Here is what I can help with:<br><br>• Salary for any role in India<br>• Interview prep for TCS, Google, Amazon, Razorpay and more<br>• Resume and CV tips<br>• Skills and certifications to learn in 2026<br>• Fresher first-job complete guide<br>• Career roadmap and growth strategy<br>• Salary negotiation playbook<br>• Support ticket to our team<br><br>What would you like to explore?",c:["Salary check","Interview prep","Fresher guide","Raise support ticket"]};}
}

function genId(){return"BLX-"+Date.now().toString(36).toUpperCase().slice(-6);}

function showTicket(cat,ms){
var d=document.createElement("div");d.className="bb";
d.innerHTML="<div style='background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px'><div style='font-weight:700;font-size:13px;color:#1E3A5F;margin-bottom:12px'>Support Ticket: "+cat+"</div><div style='margin-bottom:10px'><label style='font-size:11px;font-weight:600;color:#64748B;display:block;margin-bottom:4px'>YOUR NAME *</label><input id='bxTn' type='text' placeholder='Full name' style='width:100%;padding:8px 10px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;font-family:inherit;box-sizing:border-box;outline:none;background:#fff;color:#0F172A'></div><div style='margin-bottom:10px'><label style='font-size:11px;font-weight:600;color:#64748B;display:block;margin-bottom:4px'>YOUR EMAIL *</label><input id='bxTe' type='email' placeholder='Email address' style='width:100%;padding:8px 10px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;font-family:inherit;box-sizing:border-box;outline:none;background:#fff;color:#0F172A'></div><div style='margin-bottom:12px'><label style='font-size:11px;font-weight:600;color:#64748B;display:block;margin-bottom:4px'>DESCRIBE YOUR ISSUE *</label><textarea id='bxTd' placeholder='Please describe your issue in detail...' style='width:100%;padding:8px 10px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;font-family:inherit;box-sizing:border-box;outline:none;background:#fff;color:#0F172A;resize:vertical;min-height:80px'></textarea></div><button id='bxTsub' style='background:#2563EB;color:#fff;border:none;border-radius:8px;padding:10px 0;font-size:13px;font-weight:700;cursor:pointer;width:100%;font-family:inherit'>Submit Ticket</button><p style='font-size:11px;color:#94A3B8;text-align:center;margin:8px 0 0 0'>We respond within 24 hours on working days</p></div>";
ms.appendChild(d);ms.scrollTop=99999;
setTimeout(function(){
var sub=document.getElementById("bxTsub");
if(!sub)return;
sub.addEventListener("click",function(){
var n=(document.getElementById("bxTn")||{}).value||"";
var e=(document.getElementById("bxTe")||{}).value||"";
var dd=(document.getElementById("bxTd")||{}).value||"";
if(!n.trim()||!e.trim()||!dd.trim()){alert("Please fill in all required fields.");return;}
var tid=genId();
var subj=encodeURIComponent("Belongix Support Ticket "+tid+" - "+cat);
var body=encodeURIComponent("BELONGIX SUPPORT TICKET\nTicket ID: "+tid+"\nCategory: "+cat+"\nName: "+n+"\nEmail: "+e+"\nMessage:\n"+dd+"\nDate: "+new Date().toLocaleString("en-IN"));
d.innerHTML="<div style='text-align:center;padding:12px'><div style='font-size:32px;margin-bottom:8px'>\u2705</div><div style='font-weight:700;color:#10B981;font-size:14px;margin-bottom:6px'>Ticket Submitted!</div><div style='font-size:12px;color:#64748B;margin-bottom:4px'>Ticket ID: <b style='color:#2563EB'>"+tid+"</b></div><div style='font-size:12px;color:#64748B'>We will reach out to <b>"+e+"</b> within 24 hours.</div></div>";
ms.scrollTop=99999;
setTimeout(function(){try{window.location.href="mailto:teambelongix@gmail.com?subject="+subj+"&body="+body;}catch(x){}},700);});},150);}

function build(){
var ex=document.getElementById("bxWrap");if(ex)ex.parentNode.removeChild(ex);
var st=document.createElement("style");st.id="bxStyle";
st.textContent=[
"#bxWrap{position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}",
"#bxBtn{width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#1D4ED8,#06B6D4);border:none;cursor:pointer;box-shadow:0 4px 24px rgba(29,78,216,.55);position:relative;display:flex;align-items:center;justify-content:center;transition:transform .2s;animation:bxPop 3s ease-in-out infinite}",
"@keyframes bxPop{0%,100%{box-shadow:0 4px 24px rgba(29,78,216,.55),0 0 0 0 rgba(29,78,216,.4)}65%{box-shadow:0 4px 24px rgba(29,78,216,.55),0 0 0 14px rgba(29,78,216,0)}}",
"#bxBtn:hover{transform:scale(1.1);animation:none}",
"#bxBtnInner{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}",
"#bxBtnFace{width:34px;height:28px;background:rgba(255,255,255,.95);border-radius:8px;position:relative;display:flex;align-items:center;justify-content:center;gap:6px}",
"#bxBtnFace:before{content:'';position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:6px;height:9px;background:rgba(255,255,255,.85);border-radius:3px}",
"#bxBtnFace:after{content:'';position:absolute;top:-11px;left:50%;transform:translateX(-50%);width:8px;height:8px;background:#93C5FD;border-radius:50%}",
".bxEye{width:9px;height:9px;background:#2563EB;border-radius:2px;position:relative}",
".bxEye:after{content:'';position:absolute;top:1.5px;left:1.5px;width:4px;height:4px;background:white;border-radius:50%}",
"#bxBtnMouth{width:20px;height:3px;background:#BFDBFE;border-radius:2px;margin-top:2px}",
"#bxBtnArms{display:flex;justify-content:space-between;width:44px;margin-top:-2px}",
"#bxBtnArms span{width:7px;height:3px;background:rgba(255,255,255,.8);border-radius:2px;display:block}",
"#bxDot{position:absolute;top:3px;right:3px;width:12px;height:12px;background:#10B981;border-radius:50%;border:2px solid #fff;pointer-events:none;animation:bxPulse 2s infinite}",
"@keyframes bxPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.7}}",
"#bxBox{display:none;position:fixed;bottom:98px;right:24px;width:380px;height:560px;background:#fff;border-radius:20px;box-shadow:0 12px 48px rgba(0,0,0,.18);flex-direction:column;overflow:hidden;border:1px solid #E2E8F0}",
"#bxBox.on{display:flex}",
"#bxHd{background:linear-gradient(135deg,#1E3A5F,#2563EB);padding:15px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0}",
"#bxAv{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:24px;border:2px solid rgba(255,255,255,.3)}",
"#bxNm b{color:#fff;font-size:14px;font-weight:700;display:block;margin-bottom:2px}",
"#bxNm small{color:rgba(255,255,255,.7);font-size:11px;display:flex;align-items:center;gap:5px}",
"#bxGreen{width:7px;height:7px;background:#10B981;border-radius:50%;display:inline-block;flex-shrink:0}",
"#bxCl{margin-left:auto;background:rgba(255,255,255,.15);border:none;color:#fff;font-size:15px;cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.2s}",
"#bxCl:hover{background:rgba(255,255,255,.3)}",
"#bxMs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;min-height:0}",
"#bxMs::-webkit-scrollbar{width:3px}",
"#bxMs::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px}",
".bb{background:#F1F5F9;color:#0F172A;border-radius:16px 16px 16px 3px;padding:11px 14px;font-size:13px;line-height:1.7;max-width:94%;align-self:flex-start;word-break:break-word}",
".bu{background:linear-gradient(135deg,#2563EB,#0EA5E9);color:#fff;border-radius:16px 16px 3px 16px;padding:11px 14px;font-size:13px;line-height:1.7;max-width:80%;align-self:flex-end;word-break:break-word}",
".bxD{background:#F1F5F9;border-radius:16px 16px 16px 3px;padding:13px 16px;align-self:flex-start;display:flex;gap:4px}",
".bxD i{width:7px;height:7px;background:#94A3B8;border-radius:50%;animation:bxBnc 1.2s infinite;display:inline-block}",
".bxD i:nth-child(2){animation-delay:.2s}.bxD i:nth-child(3){animation-delay:.4s}",
"@keyframes bxBnc{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}",
".bxCW{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;max-width:94%}",
".bxC{background:#fff;border:1.5px solid #BFDBFE;color:#2563EB;border-radius:16px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:.15s}",
".bxC:hover{background:#EFF6FF;border-color:#2563EB}",
"#bxFt{padding:12px 14px;border-top:1px solid #F1F5F9;display:flex;gap:8px;flex-shrink:0;background:#fff}",
"#bxIn{flex:1;border:1.5px solid #E2E8F0;border-radius:12px;padding:9px 13px;font-size:13px;font-family:inherit;color:#0F172A;outline:none;background:#fff;min-width:0;transition:.2s}",
"#bxIn:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.1)}",
"#bxSd{width:38px;height:38px;border-radius:10px;background:#2563EB;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.2s}",
"#bxSd:hover{background:#1D4ED8}",
"#bxSd svg{width:15px;height:15px;color:#fff;pointer-events:none}",
"@media(max-width:480px){#bxBox{width:calc(100vw - 24px);right:12px;height:520px}}"
].join("");
document.head.appendChild(st);

// Build DOM
var wrap=document.createElement("div");wrap.id="bxWrap";
var box=document.createElement("div");box.id="bxBox";

// Header
var hd=document.createElement("div");hd.id="bxHd";
var av=document.createElement("div");av.id="bxAv";av.textContent="\uD83E\uDD16";
var nm=document.createElement("div");nm.id="bxNm";
nm.innerHTML="<b>Bexi \u2014 Career AI</b><small><span id='bxGreen'></span>Powered by Belongix \u00B7 Always online</small>";
var cl=document.createElement("button");cl.id="bxCl";cl.textContent="\u2715";
hd.appendChild(av);hd.appendChild(nm);hd.appendChild(cl);

// Messages
var ms=document.createElement("div");ms.id="bxMs";

// Footer input
var ft=document.createElement("div");ft.id="bxFt";
var inp=document.createElement("input");inp.id="bxIn";inp.type="text";inp.placeholder="Ask about careers, salaries, interviews...";inp.autocomplete="off";
var sd=document.createElement("button");sd.id="bxSd";
sd.innerHTML='<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
ft.appendChild(inp);ft.appendChild(sd);

box.appendChild(hd);box.appendChild(ms);box.appendChild(ft);

// Cartoon robot button - built with CSS, zero SVG string issues
var btn=document.createElement("button");btn.id="bxBtn";btn.type="button";
var inner=document.createElement("div");inner.id="bxBtnInner";
var face=document.createElement("div");face.id="bxBtnFace";
var eye1=document.createElement("div");eye1.className="bxEye";
var eye2=document.createElement("div");eye2.className="bxEye";
var mouth=document.createElement("div");mouth.id="bxBtnMouth";
face.appendChild(eye1);face.appendChild(eye2);
inner.appendChild(face);inner.appendChild(mouth);
var arms=document.createElement("div");arms.id="bxBtnArms";
var arm1=document.createElement("span");var arm2=document.createElement("span");
arms.appendChild(arm1);arms.appendChild(arm2);
inner.appendChild(arms);
btn.appendChild(inner);
var dot=document.createElement("div");dot.id="bxDot";btn.appendChild(dot);

wrap.appendChild(box);wrap.appendChild(btn);
document.body.appendChild(wrap);

var open=false,welcomed=false;

function toggle(){open=!open;open?box.classList.add("on"):box.classList.remove("on");if(open){inp.focus();if(!welcomed){welcomed=true;setTimeout(function(){addBot(rnd(["Hello! Welcome to Belongix \uD83D\uDC4B I am <b>Bexi</b>, your personal career guide.<br><br>Here is what I can help you with:<br><br>\uD83C\uDFAF <b>Career Guidance</b> \u2014 roadmaps, role advice, growth strategy<br>\uD83D\uDCB0 <b>Salary Intelligence</b> \u2014 real market data for any role<br>\uD83C\uDFE2 <b>Interview Prep</b> \u2014 company-specific guides (TCS, Google, Amazon...)<br>\uD83D\uDCC4 <b>Resume and CV Tips</b> \u2014 beat ATS and impress recruiters<br>\uD83C\uDF9F <b>Help and Support</b> \u2014 raise a ticket to our team<br><br>How can I help you today?","Hi there! I am <b>Bexi</b> from Belongix \uD83E\uDD16<br><br>Ask me anything about salaries, interview prep, skills, career paths, or raise a support ticket if you need our team.<br><br>What is on your mind?"]),["Check my salary","Interview prep tips","I am a fresher","Raise a support ticket"]);},200);}}}

function addBot(html,chips,act){var d=document.createElement("div");d.className="bb";d.innerHTML=html;ms.appendChild(d);if(chips&&chips.length){var cw=document.createElement("div");cw.className="bxCW";chips.forEach(function(c){var ch=document.createElement("button");ch.className="bxC";ch.textContent=c;ch.addEventListener("click",function(){if(act==="ticket"){showTicket(c,ms);}else{doSend(c);}});cw.appendChild(ch);});ms.appendChild(cw);}ms.scrollTop=99999;}

function doSend(text){var msg=text!==undefined?text:inp.value.trim();if(!msg)return;inp.value="";var u=document.createElement("div");u.className="bu";u.textContent=msg;ms.appendChild(u);var dots=document.createElement("div");dots.className="bxD";dots.innerHTML="<i></i><i></i><i></i>";ms.appendChild(dots);ms.scrollTop=99999;setTimeout(function(){if(dots.parentNode)ms.removeChild(dots);var r=respond(msg);addBot(r.h,r.c,r.act);},600+Math.random()*500);}

btn.addEventListener("click",function(e){e.stopPropagation();toggle();});
cl.addEventListener("click",function(e){e.stopPropagation();toggle();});
sd.addEventListener("click",function(e){e.stopPropagation();doSend();});
inp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();doSend();}});}

if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",build);}else{build();}
})();
