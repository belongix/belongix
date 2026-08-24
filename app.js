(function(){
  const C=window.BELONGIX_CONFIG||{}; window.BX={};
  BX.sb=window.supabase?supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY):null;
  BX.toast=function(m){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)};
  BX.esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  BX.session=async function(){if(!BX.sb)return null;let r=await BX.sb.auth.getSession();return r.data.session||null};
  BX.requireAuth=async function(){let s=await BX.session();if(!s){location.href='index.html?auth=1';return null}return s};
  BX.signOut=async function(){if(BX.sb)await BX.sb.auth.signOut();location.href='index.html'};
  BX.userName=function(s){return s?.user?.user_metadata?.full_name||s?.user?.email?.split('@')[0]||'there'};
  BX.table=async function(table,query){if(!BX.sb)return {data:null,error:null};return await query(BX.sb.from(table))};
  BX.local=function(k,v){if(v===undefined){try{return JSON.parse(localStorage.getItem('bx_'+k))}catch{return null}}localStorage.setItem('bx_'+k,JSON.stringify(v));return v};
})();
