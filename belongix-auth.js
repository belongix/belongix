(function(){
  const cfg=window.BELONGIX_CONFIG||{};
  if(!window.supabase||!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY){console.warn('Belongix: Supabase config missing');return;}
  window.belongixSupabase=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  window.belongixAuth={
    client:window.belongixSupabase,
    async user(){const {data}=await this.client.auth.getUser();return data?.user||null},
    async signOut(){await this.client.auth.signOut();location.href='index.html'},
    async requireUser(){const u=await this.user();if(!u){location.href='index.html?auth=required';return null}return u}
  };
})();
