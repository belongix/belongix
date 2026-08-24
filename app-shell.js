// Belongix shared app shell — sidebar navigation, mobile menu,
// notification bell. Every authenticated page calls
// renderAppShell(activePage, mainContentHTML, user) once, instead of
// each page hand-writing its own copy of the sidebar markup.

var SIDEBAR_ITEMS = [
  {group:'Workspace', items:[
    {page:'dashboard', href:'dashboard.html', icon:'📊', label:'Dashboard'},
    {page:'career-profile', href:'career-profile.html', icon:'👤', label:'Career Profile'},
    {page:'resume-builder', href:'resume-builder.html', icon:'📄', label:'Resume Builder'},
    {page:'jobs', href:'jobs.html', icon:'🔍', label:'Job Matcher'},
    {page:'applications', href:'applications.html', icon:'📋', label:'Applications'},
    {page:'interview', href:'interview.html', icon:'🎤', label:'Interview Prep'},
    {page:'career-coach', href:'career-coach.html', icon:'💬', label:'Career Coach'},
  ]},
  {group:'Career Intelligence', items:[
    {page:'skill-gaps', href:'skill-gaps.html', icon:'📈', label:'Skill Gaps'},
    {page:'career-roadmap', href:'career-roadmap.html', icon:'🗺', label:'Career Roadmap'},
  ]},
  {group:'Account', items:[
    {page:'settings', href:'settings.html', icon:'⚙️', label:'Settings'},
  ]},
];

function renderSidebar(activePage, userEmail){
  var groupsHTML = SIDEBAR_ITEMS.map(function(g){
    var itemsHTML = g.items.map(function(it){
      return '<a href="'+it.href+'" class="sb-link'+(it.page===activePage?' active':'')+'" title="'+it.label+'">'
        +'<span class="sb-link-icon">'+it.icon+'</span><span class="sb-link-text">'+it.label+'</span></a>';
    }).join('');
    return '<div class="sb-group-title">'+g.group+'</div>'+itemsHTML;
  }).join('');

  var initials = (userEmail||'?').charAt(0).toUpperCase();

  return '<div class="sidebar-overlay" id="sidebar-overlay" onclick="closeMobileSidebar()"></div>'
    +'<div class="sidebar" id="sidebar">'
    +'<div class="sb-brand"><span>Belong<span class="dot">ix</span></span><button class="sb-toggle" onclick="toggleSidebar()" aria-label="Collapse sidebar" title="Collapse sidebar">◀</button></div>'
    +groupsHTML
    +'<div class="sb-user"><div class="sb-user-avatar">'+initials+'</div><div class="sb-user-email sb-label">'+esc(userEmail||'')+'</div></div>'
    +'</div>';
}

function renderAppShell(activePage, mainHTML, userEmail){
  document.body.innerHTML =
    '<div class="app-shell">'
    + renderSidebar(activePage, userEmail)
    + '<div class="main" style="width:100%">'
    +   '<button class="mobile-menu-btn" onclick="openMobileSidebar()" aria-label="Open menu">☰ Menu</button>'
    +   mainHTML
    + '</div>'
    + '</div>'
    + '<nav class="mobile-bottom-nav">'
    +   '<a href="dashboard.html" class="'+(activePage==='dashboard'?'active':'')+'">📊<span>Home</span></a>'
    +   '<a href="resume-builder.html" class="'+(activePage==='resume-builder'?'active':'')+'">📄<span>Resumes</span></a>'
    +   '<a href="jobs.html" class="'+(activePage==='jobs'?'active':'')+'">🔍<span>Jobs</span></a>'
    +   '<a href="career-coach.html" class="'+(activePage==='career-coach'?'active':'')+'">💬<span>Coach</span></a>'
    +   '<a href="settings.html" class="'+(activePage==='settings'?'active':'')+'">⚙️<span>Settings</span></a>'
    + '</nav>'
    + '<div class="toast" id="toast"></div>';
}

function toggleSidebar(){document.getElementById('sidebar').classList.toggle('collapsed');}
function openMobileSidebar(){document.getElementById('sidebar').classList.add('mobile-open');document.getElementById('sidebar-overlay').classList.add('show');}
function closeMobileSidebar(){document.getElementById('sidebar').classList.remove('mobile-open');document.getElementById('sidebar-overlay').classList.remove('show');}

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function showToast(msg){
  var t=document.getElementById('toast');if(!t)return;
  t.textContent=msg;t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},2800);
}
