(function () {
  'use strict';
  var cfg = window.BELONGIX_CONFIG;
  if (!cfg || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
    console.error('[Belongix] Missing config.js');
    window.BelongixAuth = { sb: null, user: null, ready: Promise.reject(new Error('Missing Supabase configuration')) };
    return;
  }
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('[Belongix] Supabase SDK failed to load');
    window.BelongixAuth = { sb: null, user: null, ready: Promise.reject(new Error('Supabase SDK unavailable')) };
    return;
  }
  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  var api = {
    sb: sb,
    user: null,
    getSession: async function () {
      var result = await sb.auth.getSession();
      api.user = result.data && result.data.session ? result.data.session.user : null;
      return api.user;
    },
    signOut: function () { return sb.auth.signOut(); },
    requireUser: async function (redirect) {
      var user = await api.getSession();
      if (!user && redirect !== false) window.location.href = 'index.html?auth=signin';
      return user;
    }
  };
  api.ready = api.getSession();
  sb.auth.onAuthStateChange(function (_event, session) {
    api.user = session ? session.user : null;
    window.dispatchEvent(new CustomEvent('belongix-auth-change', { detail: { user: api.user, session: session || null } }));
  });
  window.BelongixAuth = api;
  window.SB_URL = cfg.SUPABASE_URL;
  window.SB_KEY = cfg.SUPABASE_ANON_KEY;
})();
