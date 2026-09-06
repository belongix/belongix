(function(){
  const C=window.BELONGIX_CONFIG;
  if(!window.supabase||!C) throw new Error('Belongix configuration missing');
  window.belongix=window.supabase.createClient(C.SUPABASE_URL,C.SUPABASE_PUBLISHABLE_KEY);
  window.getBelongixSession=async function(){
    const r=await belongix.auth.getSession();
    return r.data&&r.data.session?r.data.session:null;
  };
  window.requireBelongixUser=async function(){
    const s=await getBelongixSession();
    return s?s.user:null;
  };
})();
