(function(){
  const nav=`<a class="brand" href="index.html">Belongix</a><nav><a href="index.html#features">Features</a><a href="resume-builder.html">Resume Builder</a><a href="career-profile.html">Profile</a><a href="settings.html">Settings</a></nav><div class="nav-actions"><a class="btn ghost" href="resume-builder.html">Build Resume</a><button class="btn dark" id="auth-btn">Sign in</button></div>`;
  document.querySelectorAll('[data-app-nav]').forEach(x=>{x.innerHTML=nav});
  async function refresh(){
    const btn=document.getElementById('auth-btn'); if(!btn||!window.belongixAuth)return;
    const u=await belongixAuth.user(); btn.textContent=u?'Sign out':'Sign in'; btn.onclick=()=>u?belongixAuth.signOut():(location.href='index.html?auth=required');
    document.querySelectorAll('[data-user-email]').forEach(x=>x.textContent=u?.email||'Not signed in');
  }
  window.addEventListener('DOMContentLoaded',refresh);
})();
