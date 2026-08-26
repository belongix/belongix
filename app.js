(function(){
const C=window.BELONGIX_CONFIG||{};
window.BX={
 sb:(window.supabase&&C.SUPABASE_URL&&C.SUPABASE_ANON_KEY&&!C.SUPABASE_ANON_KEY.startsWith('YOUR_'))?supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY):null,
 esc:s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),
 toast(msg){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t.x);t.x=setTimeout(()=>t.classList.remove('show'),2500)},
 async session(){if(!this.sb)return null;return (await this.sb.auth.getSession()).data.session},
 async requireAuth(){let s=await this.session();if(!s){location.href='index.html#signin';return null}return s},
 async signOut(){if(this.sb)await this.sb.auth.signOut();location.href='index.html'},
 async ai(action,payload){let s=await this.requireAuth();if(!s)throw Error('Please sign in.');let r=await fetch(C.RESUME_AI_FUNCTION_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+s.access_token},body:JSON.stringify({action,...payload})});let d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'AI request failed');return d}
};
})();