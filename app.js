(function(){
const C=window.BELONGIX_CONFIG||{};
window.BX={
 sb:(window.supabase&&C.SUPABASE_URL&&C.SUPABASE_ANON_KEY&&!C.SUPABASE_ANON_KEY.startsWith('YOUR_'))?supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY):null,
 esc:s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),
 toast(msg,kind){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.className='toast'+(kind==='error'?' error':'');t.textContent=msg;t.classList.add('show');clearTimeout(t.x);t.x=setTimeout(()=>t.classList.remove('show'),2600)},
 friendlyError(e){
  let m=(e&&e.message)||String(e||'');
  if(/invalid login credentials/i.test(m))return 'That email and password don\'t match an account.';
  if(/already registered|already exists/i.test(m))return 'An account with that email already exists — try signing in instead.';
  if(/password/i.test(m)&&/short|least/i.test(m))return 'Password is too short — use at least 6 characters.';
  if(/network|fetch/i.test(m))return 'Network issue — check your connection and try again.';
  if(/rate limit/i.test(m))return 'Too many attempts — wait a moment and try again.';
  if(!m)return 'Something went wrong. Please try again.';
  return m.length>140?'Something went wrong. Please try again.':m;
 },
 async session(){if(!this.sb)return null;return (await this.sb.auth.getSession()).data.session},
 async requireAuth(){let s=await this.session();if(!s){location.href='index.html#signin';return null}return s},
 async signOut(){if(this.sb)await this.sb.auth.signOut();location.href='index.html'},
 async ai(action,payload){let s=await this.requireAuth();if(!s)throw Error('Please sign in.');if(!C.RESUME_AI_FUNCTION_URL||C.RESUME_AI_FUNCTION_URL.includes('YOUR_'))throw Error('AI writing isn\'t connected yet — add RESUME_AI_FUNCTION_URL in config.js.');let r=await fetch(C.RESUME_AI_FUNCTION_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+s.access_token},body:JSON.stringify({action,...payload})});let d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'AI request failed');return d},
 initTheme(){
  let saved=localStorage.getItem('belongix_theme');
  let theme=saved||'light';
  document.documentElement.setAttribute('data-theme',theme);
  return theme;
 },
 setTheme(theme){document.documentElement.setAttribute('data-theme',theme);localStorage.setItem('belongix_theme',theme)},
 initDrawer(){
  let btn=document.querySelector('.menuBtn');
  let drawer=document.querySelector('.drawer');
  if(!btn||!drawer)return;
  btn.addEventListener('click',()=>drawer.classList.add('open'));
  drawer.addEventListener('click',e=>{if(e.target===drawer||e.target.classList.contains('drawerBackdrop')||e.target.classList.contains('drawerClose'))drawer.classList.remove('open')});
 }
};
document.addEventListener('DOMContentLoaded',()=>{BX.initTheme();BX.initDrawer()});
})();
