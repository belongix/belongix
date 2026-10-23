const { createClient } = window.supabase;
const sb = createClient(window.BELONGIX_CONFIG.supabaseUrl, window.BELONGIX_CONFIG.supabasePublishableKey);

const views = [...document.querySelectorAll(".view")];
const navs = [...document.querySelectorAll("[data-view]")];
const title = document.getElementById("viewTitle");
const titles = {dashboard:"Dashboard",resume:"My Resume",templates:"Templates",analytics:"Analytics",settings:"Settings"};
const toast = document.getElementById("toast");
const bexi = document.getElementById("bexi");
const authOverlay = document.getElementById("authOverlay");
const authForm = document.getElementById("authForm");
const authError = document.getElementById("authError");
let signUpMode = false;
let recoveryMode = false;
let currentUser = null;
let currentResume = null;
let currentVersion = null;
let saveTimer = null;
let bexiHistory = [];

function showToast(message="Saved") {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"), 1800);
}
function show(view) {
  views.forEach(v => v.classList.toggle("active-view", v.id === view));
  navs.forEach(n => n.classList.toggle("active", n.dataset.view === view));
  title.textContent = titles[view] || "Dashboard";
  window.scrollTo({top:0,behavior:"smooth"});
}
navs.forEach(n => n.addEventListener("click", ()=>show(n.dataset.view)));
document.querySelectorAll(".primary,.secondary").forEach(b => b.addEventListener("click", ()=>{
  if (b.dataset.view) show(b.dataset.view);
}));

function openBexi(prefill) {
  bexi.classList.add("open");
  if (prefill) document.querySelector(".bexi-input input").value = prefill;
}
function closeBexi(){ bexi.classList.remove("open"); }
document.getElementById("openBexi").onclick = ()=>openBexi();
document.getElementById("actionBexi").onclick = ()=>openBexi("Help me strengthen my experience bullets without inventing metrics.");
document.getElementById("closeBexi").onclick = closeBexi;
document.querySelectorAll(".ai-suggest").forEach(b=>b.onclick=()=>openBexi("Improve this resume section while preserving every factual claim."));
document.getElementById("targetJob").onclick=()=>{
  openBexi("I want to target this resume to a job description. Tell me what to paste and then analyze the keyword and evidence gaps.");
};
document.querySelectorAll(".chips button").forEach(b=>b.onclick=()=>{
  document.querySelector(".bexi-input input").value = b.textContent;
  sendBexi();
});

function collectResume() {
  const sections = [...document.querySelectorAll(".paper .resume-section")];
  return {
    name: document.querySelector(".paper-top h2")?.textContent.trim() || "",
    contact: [...document.querySelectorAll(".paper-top p")].map(x=>x.textContent.trim()).join(" | "),
    sections: sections.map(s=>({
      heading:s.querySelector("h4")?.textContent.trim() || "",
      text:[...s.querySelectorAll("p,li,h5")].map(x=>x.textContent.trim()).join("\n")
    }))
  };
}

function scoreResume(data, job="") {
  const text = JSON.stringify(data).toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const hasNumbers = /\b\d+(?:\.\d+)?%?\b/.test(text);
  const impact = Math.min(95, 58 + (hasNumbers ? 20 : 0) + Math.min(17, (text.match(/improv|increas|reduc|deliver|optimiz|autom|built|led/g)||[]).length*3));
  const ats = Math.min(98, 72 + (text.includes("java")?5:0) + (text.includes("spring")?5:0) + (text.includes("sql")?4:0) + (text.includes("experience")?4:0) + (text.includes("skills")?4:0));
  const keyword = job ? Math.min(98, 55 + [...new Set(job.toLowerCase().split(/[^a-z0-9+#.]+/).filter(w=>w.length>3))].filter(w=>text.includes(w)).length*4) : 89;
  const content = Math.min(96, 65 + Math.min(25, Math.floor(words.length/35)*5));
  const overall = Math.round(ats*.25 + content*.25 + keyword*.2 + impact*.3);
  return {overall,ats,content,keyword,impact};
}

function renderScores(s) {
  const ring = document.querySelector(".ring");
  if (ring) {
    ring.style.background = `conic-gradient(var(--purple) 0 ${s.overall}%,#ececf0 ${s.overall}% 100%)`;
    const strong=ring.querySelector("strong"); if(strong) strong.textContent=s.overall;
  }
  const small=document.querySelector(".score-small"); if(small) small.textContent=s.overall;
  const meter=document.querySelector(".intel-meter i"); if(meter) meter.style.width=s.overall+"%";
  const metrics=[s.ats,s.content,s.keyword,s.impact];
  document.querySelectorAll(".metric b").forEach((el,i)=>el.textContent=metrics[i]);
  const bars=document.querySelectorAll(".barrow i");
  bars.forEach((el,i)=>el.style.width=metrics[i]+"%");
  const scoreMini=document.querySelectorAll(".mini-card strong")[0]; if(scoreMini) scoreMini.textContent=s.overall;
}

async function ensureProfile() {
  const {data,error}=await sb.from("profiles").select("*").eq("id",currentUser.id).maybeSingle();
  if(error) throw error;
  if(!data) {
    const {error:e}=await sb.from("profiles").insert({
      id:currentUser.id,
      full_name:currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "",
      onboarding_completed:false
    });
    if(e) throw e;
  } else {
    const name=document.querySelector("#authName");
    document.querySelector(".user-mini strong").textContent=data.full_name || currentUser.email?.split("@")[0] || "Career profile";
    if(data.target_role) document.querySelector('.settings-card input:nth-of-type(2)').value=data.target_role;
    if(data.location) document.querySelector('.settings-card input:nth-of-type(3)').value=data.location;
    if(data.full_name) document.querySelector('.settings-card input:nth-of-type(1)').value=data.full_name;
  }
}

const defaultContent = {
  summary:"Java developer with 2.5+ years of experience building and maintaining enterprise applications using Java, Spring, JSP and Servlets. Experienced in Agile environments with a focus on reliable, maintainable software delivery.",
  experience:["Developed and maintained Java-based enterprise applications using Java/J2EE technologies.","Collaborated with cross-functional teams in Agile/Scrum development cycles.","Worked with Spring, JSP, Servlets, Tomcat and SQL across application development and support."],
  skills:"Languages: Java, SQL · Frameworks: Spring · Web: JSP, Servlets · Tools: Eclipse, SoapUI, Tomcat · Methodology: Agile/Scrum",
  education:"Bachelor's Degree — 2022 · University · India"
};

function applyContent(content) {
  document.querySelectorAll(".paper .resume-section[data-custom='true']").forEach(el=>el.remove());
  const sec=[...document.querySelectorAll(".paper .resume-section")];
  const summary=sec.find(x=>x.querySelector("h4")?.textContent.includes("SUMMARY"));
  const exp=sec.find(x=>x.querySelector("h4")?.textContent.includes("EXPERIENCE"));
  const skills=sec.find(x=>x.querySelector("h4")?.textContent.includes("SKILLS"));
  const edu=sec.find(x=>x.querySelector("h4")?.textContent.includes("EDUCATION"));
  if(summary && content.summary) summary.querySelector("p").textContent=content.summary;
  if(exp && Array.isArray(content.experience)) {
    const lis=exp.querySelectorAll("li"); content.experience.slice(0,lis.length).forEach((v,i)=>lis[i].textContent=v);
  }
  if(skills && content.skills) skills.querySelector("p").textContent=content.skills;
  if(edu && content.education) edu.querySelector("h5").textContent=content.education;
  (content.customSections||[]).forEach(item=>{
    const section=document.createElement("div");section.className="resume-section";section.dataset.custom="true";
    const heading=document.createElement("h4");heading.textContent=item.heading||"ADDITIONAL";
    const paragraph=document.createElement("p");paragraph.textContent=item.text||"";section.append(heading,paragraph);
    document.querySelector(".paper").append(section);
  });
  makeEditable();
}

function makeEditable() {
  document.querySelectorAll(".paper .resume-section p,.paper .resume-section li").forEach(el=>{
    el.contentEditable="true";
    el.spellcheck=true;
    el.oninput=()=>queueSave();
  });
}
function contentFromPaper() {
  const sec=[...document.querySelectorAll(".paper .resume-section")];
  const summary=sec.find(x=>x.querySelector("h4")?.textContent.includes("SUMMARY"));
  const exp=sec.find(x=>x.querySelector("h4")?.textContent.includes("EXPERIENCE"));
  const skills=sec.find(x=>x.querySelector("h4")?.textContent.includes("SKILLS"));
  const edu=sec.find(x=>x.querySelector("h4")?.textContent.includes("EDUCATION"));
  const known=new Set([summary,exp,skills,edu].filter(Boolean));
  const customSections=sec.filter(s=>!known.has(s)).map(s=>({heading:s.querySelector("h4")?.textContent.trim()||"ADDITIONAL",text:[...s.querySelectorAll("p,li,h5")].map(x=>x.textContent.trim()).join("\n")}));
  return {
    summary:summary?.querySelector("p")?.textContent.trim() || "",
    experience:[...(exp?.querySelectorAll("li")||[])].map(x=>x.textContent.trim()),
    skills:skills?.querySelector("p")?.textContent.trim() || "",
    education:edu?.querySelector("h5")?.textContent.trim() || "",
    customSections
  };
}

async function loadResume() {
  const {data:resumes,error}=await sb.from("resumes").select("*").eq("user_id",currentUser.id).order("created_at",{ascending:true}).limit(1);
  if(error) throw error;
  if(!resumes?.length) {
    const {data:r,error:re}=await sb.from("resumes").insert({user_id:currentUser.id,title:"Master Resume",template_key:"executive"}).select().single();
    if(re) throw re;
    currentResume=r;
    const {data:v,error:ve}=await sb.from("resume_versions").insert({resume_id:r.id,user_id:currentUser.id,version_no:1,version_name:"Master Resume",content:defaultContent,score:87}).select().single();
    if(ve) throw ve;
    currentVersion=v;
    await sb.from("resumes").update({active_version_id:v.id}).eq("id",r.id).eq("user_id",currentUser.id);
    applyContent(defaultContent);
  } else {
    currentResume=resumes[0];
    const {data:v,error:ve}=await sb.from("resume_versions").select("*").eq("resume_id",currentResume.id).eq("user_id",currentUser.id).order("updated_at",{ascending:false}).limit(1).maybeSingle();
    if(ve) throw ve;
    currentVersion=v;
    if(!currentVersion){
      const {data:createdVersion,error:createError}=await sb.from("resume_versions").insert({
        resume_id:currentResume.id,
        user_id:currentUser.id,
        version_no:1,
        version_name:"Master Resume",
        content:defaultContent,
        score:87
      }).select().single();
      if(createError) throw createError;
      currentVersion=createdVersion;
      const {error:updateError}=await sb.from("resumes").update({active_version_id:createdVersion.id}).eq("id",currentResume.id).eq("user_id",currentUser.id);
      if(updateError) console.error("Could not set active resume version:",updateError);
    }
    applyContent(currentVersion?.content || defaultContent);
    renderScores(scoreResume(currentVersion?.content || defaultContent,currentVersion?.target_job_description||""));
  }
  applySavedTemplate();
}

function applySavedTemplate(){
  const key=(currentResume?.template_key||"executive").toLowerCase();
  const paper=document.querySelector(".paper");
  if(!paper) return;
  paper.dataset.template=key;
  paper.classList.remove("template-executive","template-modern","template-minimal","template-technical","template-classic","template-impact");
  paper.classList.add("template-"+key);
  document.querySelectorAll(".template-card").forEach(card=>card.classList.toggle("selected-template",card.querySelector("h3")?.textContent.trim().toLowerCase()===key));
}
function queueSave(){ clearTimeout(saveTimer); saveTimer=setTimeout(saveResume,900); }
async function saveResume(){
  if(!currentUser || !currentResume){showToast("Sign in before saving");return false;}
  const content=contentFromPaper();
  const scores=scoreResume(content,currentVersion?.target_job_description||"");
  try{
    if(currentVersion){
      const {data,error}=await sb.from("resume_versions").update({content,score:scores.overall,updated_at:new Date().toISOString()}).eq("id",currentVersion.id).eq("user_id",currentUser.id).select().single();
      if(error) throw error;
      currentVersion=data;
    } else {
      const {data,error}=await sb.from("resume_versions").insert({resume_id:currentResume.id,user_id:currentUser.id,version_no:1,version_name:"Master Resume",content,score:scores.overall}).select().single();
      if(error) throw error;
      currentVersion=data;
    }
    renderScores(scores);
    showToast("Resume saved");
    return true;
  }catch(err){
    console.error("Resume save failed:",err);
    showToast("Save failed: "+(err.message||"check connection"));
    return false;
  }
}

document.querySelector(".workspace-actions .primary").onclick=async()=>{
  const saved=await saveResume();
  if(!saved) return;
  const paper=document.querySelector(".paper");
  if(window.html2pdf){
    await window.html2pdf().set({margin:0.35,filename:"Belongix-Resume.pdf",image:{type:"jpeg",quality:.96},html2canvas:{scale:2,useCORS:true},jsPDF:{unit:"in",format:"a4",orientation:"portrait"}}).from(paper).save();
  } else window.print();
};

async function sendBexi(){
  const input=document.querySelector(".bexi-input input");
  const message=input.value.trim(); if(!message) return;
  input.value="";
  const body=document.querySelector(".bexi-body");
  const userBubble=document.createElement("div");
  userBubble.className="bexi-msg"; userBubble.innerHTML="<small>YOU</small><p></p>";
  userBubble.querySelector("p").textContent=message;
  body.appendChild(userBubble);
  body.scrollTop=body.scrollHeight;
  try{
    const r=await fetch("/api/bexi",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      message,resume:collectResume(),jobDescription:currentVersion?.target_job_description||"",history:bexiHistory
    })});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||"Request failed");
    const msg={role:"assistant",content:data.text}; bexiHistory.push({role:"user",content:message},msg);
    const ai=document.createElement("div"); ai.className="bexi-msg"; ai.innerHTML="<small>BEXI</small><p></p>"; ai.querySelector("p").textContent=data.text;
    body.appendChild(ai); body.scrollTop=body.scrollHeight;
  }catch(e){
    const ai=document.createElement("div"); ai.className="bexi-msg"; ai.innerHTML="<small>BEXI</small><p></p>";
    ai.querySelector("p").textContent="I couldn't reach the AI service right now. Your resume is still saved locally in the workspace; please try again in a moment.";
    body.appendChild(ai);
  }
}
document.querySelector(".bexi-input button").onclick=sendBexi;
document.querySelector(".bexi-input input").addEventListener("keydown",e=>{if(e.key==="Enter")sendBexi()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeBexi()});

document.querySelectorAll(".template-card .secondary").forEach(btn=>btn.addEventListener("click",async()=>{
  if(!currentUser || !currentResume){showToast("Sign in to choose a template");return;}
  const card=btn.closest(".template-card");
  const template=card.querySelector("h3").textContent.trim().toLowerCase();
  btn.disabled=true;
  try{
    const {error}=await sb.from("resumes").update({template_key:template}).eq("id",currentResume.id).eq("user_id",currentUser.id);
    if(error) throw error;
    currentResume.template_key=template;
    const paper=document.querySelector(".paper");
    paper.dataset.template=template;
    paper.classList.remove("template-executive","template-modern","template-minimal","template-technical","template-classic","template-impact");
    paper.classList.add("template-"+template);
    document.querySelectorAll(".template-card").forEach(x=>x.classList.toggle("selected-template",x===card));
    showToast(template[0].toUpperCase()+template.slice(1)+" template applied");
    show("resume");
  }catch(err){console.error(err);showToast("Template could not be saved: "+(err.message||"try again"));}
  finally{btn.disabled=false;}
}));

const previewButton=document.querySelector(".workspace-actions .secondary");
if(previewButton) previewButton.addEventListener("click",()=>{
  const paper=document.querySelector(".paper");
  const active=paper.classList.toggle("preview-mode");
  document.querySelectorAll(".paper [contenteditable]").forEach(el=>el.contentEditable=active?"false":"true");
  previewButton.textContent=active?"Edit resume":"Preview";
});
document.querySelectorAll(".section").forEach(button=>button.addEventListener("click",()=>{
  const label=button.querySelector("span")?.textContent.trim();
  const section=[...document.querySelectorAll(".paper .resume-section")].find(el=>el.querySelector("h4")?.textContent.toLowerCase().includes((label||"").toLowerCase()));
  if(section){document.querySelectorAll(".section").forEach(x=>x.classList.toggle("active",x===button));section.scrollIntoView({behavior:"smooth",block:"center"});}
  else {showToast((label||"Section")+" is not available in this version yet.");}
}));
const addSectionButton=document.querySelector(".editor-title button");
if(addSectionButton) addSectionButton.addEventListener("click",()=>{
  const name=prompt("Name this resume section");
  if(!name?.trim()) return;
  const section=document.createElement("div");
  section.className="resume-section";
  const heading=document.createElement("h4");heading.textContent=name.trim().toUpperCase();
  const paragraph=document.createElement("p");paragraph.textContent="Add your details here.";paragraph.contentEditable="true";paragraph.oninput=()=>queueSave();
  section.append(heading,paragraph);document.querySelector(".paper").append(section);
  showToast("Section added — remember to save");section.scrollIntoView({behavior:"smooth",block:"center"});
});
const duplicateButton=document.querySelector(".version button");
if(duplicateButton) duplicateButton.addEventListener("click",async()=>{
  if(!currentUser||!currentResume||!currentVersion){showToast("Load a resume before duplicating");return;}
  duplicateButton.disabled=true;
  try{
    const {data:versions,error}=await sb.from("resume_versions").select("version_no").eq("resume_id",currentResume.id).eq("user_id",currentUser.id).order("version_no",{ascending:false}).limit(1);
    if(error) throw error;
    const nextNo=(versions?.[0]?.version_no||0)+1;
    const {data,error:insertError}=await sb.from("resume_versions").insert({resume_id:currentResume.id,user_id:currentUser.id,version_no:nextNo,version_name:"Resume copy "+nextNo,content:contentFromPaper(),score:scoreResume(contentFromPaper()).overall}).select().single();
    if(insertError) throw insertError;
    currentVersion=data;
    showToast("Created version "+nextNo);
  }catch(err){console.error(err);showToast("Could not duplicate: "+(err.message||"try again"));}
  finally{duplicateButton.disabled=false;}
});
document.querySelectorAll(".upgrade button").forEach(b=>b.addEventListener("click",()=>showToast("Belongix Pro subscriptions are not available yet.")));
document.querySelectorAll(".top-actions .icon-btn").forEach(b=>b.addEventListener("click",()=>showToast(b.getAttribute("aria-label")+" is not available yet.")));
document.querySelector(".settings-card .primary").onclick=async()=>{
  const inputs=document.querySelectorAll(".settings-card input");
  const payload={full_name:inputs[0].value.trim(),target_role:inputs[1].value.trim(),location:inputs[2].value.trim(),updated_at:new Date().toISOString()};
  const {error}=await sb.from("profiles").update(payload).eq("id",currentUser.id);
  if(error) return showToast("Could not save settings");
  document.querySelector(".user-mini strong").textContent=payload.full_name||"Career profile";
  showToast("Profile saved");
};

function setAuthMode(signup){
  signUpMode=signup;
  recoveryMode=false;
  document.getElementById("authTitle").textContent=signup?"Create your Belongix account":"Welcome back";
  document.getElementById("authCopy").textContent=signup?"Build, optimize and manage your career in one workspace.":"Sign in to save your resume, use Bexi, and continue your career workspace anywhere.";
  document.getElementById("nameField").style.display=signup?"grid":"none";
  document.getElementById("authSubmit").textContent=signup?"Create account →":"Sign in →";
  document.getElementById("authSwitch").textContent=signup?"Already have an account? Sign in":"New to Belongix? Create an account";
  authError.textContent="";
}
document.getElementById("authSwitch").onclick=()=>setAuthMode(!signUpMode);
const logoutButtons=[document.getElementById("logoutButton"),document.getElementById("logoutButtonMobile")].filter(Boolean);
async function performLogout(button){
  logoutButtons.forEach(b=>{b.disabled=true;b.textContent="Signing out…";});
  try{
    if(currentUser && currentResume){
      const saved=await saveResume();
      if(!saved && !confirm("Your latest changes may not be saved. Sign out anyway?")) return;
    }
    const {error}=await sb.auth.signOut({scope:"local"});
    if(error) throw error;
    currentUser=null;currentResume=null;currentVersion=null;clearTimeout(saveTimer);
    authForm.reset();setAuthMode(false);authOverlay.classList.remove("hidden");show("dashboard");
    showToast("Signed out");
  }catch(err){authError.textContent=err.message||"Could not sign out. Please try again.";}
  finally{logoutButtons.forEach(b=>{b.disabled=false;b.textContent="Sign out";});}
}
logoutButtons.forEach(button=>button.addEventListener("click",()=>performLogout(button)));
const resendButton=document.getElementById("resendConfirm");
if(resendButton) resendButton.addEventListener("click",async()=>{
  const email=document.getElementById("authEmail").value.trim();
  if(!email){authError.textContent="Enter your email address first.";return;}
  resendButton.disabled=true;
  authError.textContent="Requesting a confirmation email…";
  try{
    const {error}=await sb.auth.resend({type:"signup",email,options:{emailRedirectTo:window.location.origin}});
    authError.textContent=error ? error.message : "If this account needs confirmation, a new email has been requested. Check Inbox, Spam and Promotions.";
  }catch(err){authError.textContent=err.message||"Could not request a confirmation email.";}
  finally{resendButton.disabled=false;}
});
const forgotButton=document.getElementById("forgotPassword");
if(forgotButton) forgotButton.addEventListener("click",async()=>{
  const email=document.getElementById("authEmail").value.trim();
  if(!email){authError.textContent="Enter your email address first.";return;}
  forgotButton.disabled=true;
  authError.textContent="Requesting a password-reset email…";
  try{
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
    authError.textContent=error ? error.message : "If an account exists for this email, a reset link has been requested. Check Inbox and Spam.";
  }catch(err){authError.textContent=err.message||"Could not request a password reset.";}
  finally{forgotButton.disabled=false;}
});
authForm.addEventListener("submit",async e=>{
  e.preventDefault(); authError.textContent="";
  const email=document.getElementById("authEmail").value.trim();
  const password=document.getElementById("authPassword").value;
  const name=document.getElementById("authName").value.trim();
  try{
    let result;
    if(recoveryMode){
      result=await sb.auth.updateUser({password});
      if(result.error) throw result.error;
      recoveryMode=false;
      authError.textContent="Password updated. Please sign in with your new password.";
      await sb.auth.signOut({scope:"local"});
      setAuthMode(false);
      return;
    } else if(signUpMode) result=await sb.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:window.location.origin}});
    else result=await sb.auth.signInWithPassword({email,password});
    if(result.error) throw result.error;
    if(signUpMode && !result.data.session){
      authError.textContent="Account created. Check your email to confirm, then sign in.";
      return;
    }
    await bootUser(result.data.session?.user || result.data.user);
  }catch(err){authError.textContent=err.message||"Authentication failed.";}
});

async function bootUser(user){
  if(!user) throw new Error("No authenticated user was returned.");
  currentUser=user;
  try{
    // Ensure the auth session is fully available before making RLS-protected Data API calls.
    const {data:sessionData,error:sessionError}=await sb.auth.getSession();
    if(sessionError) throw sessionError;
    if(!sessionData.session?.user) throw new Error("Your sign-in session is not available yet. Please try again.");
    currentUser=sessionData.session.user;

    // Mobile browsers can briefly race auth persistence and the first database request.
    // Retry the workspace bootstrap once before surfacing an error.
    let lastError=null;
    for(let attempt=0; attempt<2; attempt++){
      try{
        await ensureProfile();
        await loadResume();
        authOverlay.classList.add("hidden");
        authError.textContent="";
        return;
      }catch(err){
        lastError=err;
        if(attempt===0) await new Promise(resolve=>setTimeout(resolve,700));
      }
    }
    throw lastError || new Error("Unable to initialize the career workspace.");
  }catch(err){
    console.error("Belongix workspace bootstrap failed:",err);
    const detail=err?.message ? ` (${err.message})` : "";
    authError.textContent=`You are signed in, but Belongix couldn't load your career workspace. Please try Sign in again.${detail}`;
    authOverlay.classList.remove("hidden");
  }
}

sb.auth.onAuthStateChange((event,session)=>{
  // Keep network/database work outside the Supabase auth callback to avoid auth-lock deadlocks.
  if(event==="PASSWORD_RECOVERY"){
    recoveryMode=true;
    document.getElementById("authTitle").textContent="Set a new password";
    document.getElementById("authCopy").textContent="Choose a new password for your Belongix account.";
    document.getElementById("authSubmit").textContent="Update password →";
    document.getElementById("authPassword").autocomplete="new-password";
    authOverlay.classList.remove("hidden");
    return;
  }
  if(event==="SIGNED_OUT"){
    currentUser=null; currentResume=null; currentVersion=null; clearTimeout(saveTimer);
    authOverlay.classList.remove("hidden");
    return;
  }
  if(session?.user && !currentUser){
    const user=session.user;
    queueMicrotask(()=>bootUser(user));
  }
});

(async()=>{
  setAuthMode(false);
  try{
    const {data,error}=await sb.auth.getSession();
    if(error) throw error;
    if(data.session?.user) await bootUser(data.session.user);
    else authOverlay.classList.remove("hidden");
    makeEditable();
  }catch(err){
    console.error("Belongix session initialization failed:",err);
    authError.textContent="We couldn't restore your session. Please sign in again.";
    authOverlay.classList.remove("hidden");
  }
})();
