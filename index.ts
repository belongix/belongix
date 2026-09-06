import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cors={
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://www.belongix.in',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Content-Type':'application/json'
};
Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors});
  try{
    const auth=req.headers.get('Authorization'); if(!auth) return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:cors});
    const sb=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}});
    const {data:{user}}=await sb.auth.getUser(); if(!user) return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:cors});
    const limit=Number(Deno.env.get('DAILY_AI_LIMIT')||50);
    const {data:allowed,error:limitError}=await sb.rpc('consume_ai_usage',{p_user_id:user.id,p_limit:limit});
    if(limitError) throw limitError;
    if(!allowed) return new Response(JSON.stringify({error:'Daily AI limit reached'}),{status:429,headers:cors});
    const body=await req.json(); const input=String(body.input||'').slice(0,12000); const instruction=String(body.instruction||'Improve this resume content').slice(0,2000);
    if(!input) return new Response(JSON.stringify({error:'Missing input'}),{status:400,headers:cors});
    const apiKey=Deno.env.get('OPENAI_API_KEY'); if(!apiKey) return new Response(JSON.stringify({error:'AI provider is not configured'}),{status:503,headers:cors});
    const model=Deno.env.get('AI_MODEL')||'gpt-5.6-luna';
    const apiUrl=Deno.env.get('AI_API_URL')||'https://api.openai.com/v1/responses';
    const prompt=`You are a resume-writing assistant. Improve only what the user provides. Never invent employers, dates, degrees, technologies, metrics, awards, certifications or achievements. If a metric is missing, use a neutral wording or [add metric] placeholder. Keep output concise and professional. User request: ${instruction}\n\nResume content:\n${input}`;
    const ac=new AbortController(); const timer=setTimeout(()=>ac.abort(),25000);
    const r=await fetch(apiUrl,{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,input:prompt}),signal:ac.signal}); clearTimeout(timer);
    const j=await r.json(); if(!r.ok) return new Response(JSON.stringify({error:j?.error?.message||'AI provider error'}),{status:502,headers:cors});
    const text=j.output_text || j.output?.flatMap((x:any)=>x.content||[]).map((c:any)=>c.text||'').join('') || '';
    return new Response(JSON.stringify({text}),{headers:cors});
  }catch(e){return new Response(JSON.stringify({error:e instanceof Error?e.message:'Server error'}),{status:500,headers:cors});}
});
