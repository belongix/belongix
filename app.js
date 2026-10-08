const views=[...document.querySelectorAll('.view')], navs=[...document.querySelectorAll('[data-view]')], title=document.getElementById('viewTitle');
const titles={dashboard:'Dashboard',resume:'My Resume',templates:'Templates',analytics:'Analytics',settings:'Settings'};
function show(view){views.forEach(v=>v.classList.toggle('active-view',v.id===view));navs.forEach(n=>n.classList.toggle('active',n.dataset.view===view));title.textContent=titles[view]||'Dashboard';window.scrollTo({top:0,behavior:'smooth'})}
navs.forEach(n=>n.addEventListener('click',()=>show(n.dataset.view)));
const bexi=document.getElementById('bexi'); const open=()=>bexi.classList.add('open'); const close=()=>bexi.classList.remove('open');
document.getElementById('openBexi').onclick=open; document.getElementById('actionBexi').onclick=open; document.getElementById('closeBexi').onclick=close;
document.querySelectorAll('.ai-suggest').forEach(b=>b.onclick=open);
document.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{bexi.querySelector('.bexi-msg p').textContent='Absolutely. I’ll analyze the current resume context and suggest changes that strengthen evidence without inventing experience.'});
document.getElementById('targetJob').onclick=()=>{open(); bexi.querySelector('.bexi-msg p').textContent='Paste a job description and I’ll compare it with this resume, identify gaps, and create a targeted version without inventing qualifications.'};
document.querySelectorAll('.primary,.secondary').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.view)show(b.dataset.view)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
