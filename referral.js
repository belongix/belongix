// ================================================
// referral.js — Belongix Referral Tracking System
// Add this file to your project and include it in:
//   index.html    → <script src="referral.js"></script>
//   dashboard.html → <script src="referral.js"></script>
// Place the script tag just before </body>
// ================================================

// ════════════════════════════════════════════════════════════
// REFERRAL PROGRAM — COMPLETE TRACKING SYSTEM
// Added to index.html — does NOT replace anything
// ════════════════════════════════════════════════════════════

/* ── STEP 1: Capture referral code from URL on every page load ── */
(function captureReferralCode() {
  try {
    var params = new URLSearchParams(window.location.search);
    var code   = params.get('ref') || params.get('join') || '';
    if (!code) return;

    // Store with 30-day expiry
    var expiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
    localStorage.setItem('bx_ref_code',   code);
    localStorage.setItem('bx_ref_expiry', String(expiry));
    localStorage.setItem('bx_ref_source', document.referrer || 'direct');

    // Show the referral welcome banner
    var banner = document.getElementById('ref-banner');
    if (banner) banner.classList.add('show');

  } catch(e) {
    console.info('[Referral] Could not capture code:', e.message);
  }
})();

/* ── STEP 2: Check if stored referral code has expired ── */
(function checkReferralExpiry() {
  try {
    var expiry = localStorage.getItem('bx_ref_expiry');
    if (expiry && Date.now() > parseInt(expiry)) {
      localStorage.removeItem('bx_ref_code');
      localStorage.removeItem('bx_ref_expiry');
      localStorage.removeItem('bx_ref_source');
    }
  } catch(e) {}
})();

/* ── STEP 3: Log referral click to Supabase ── */
async function logReferralClick(refCode) {
  if (!refCode) return;
  try {
    await sb.from('referral_clicks').insert([{
      referral_code: refCode,
      source:        localStorage.getItem('bx_ref_source') || 'direct',
      clicked_at:    new Date().toISOString(),
      page:          window.location.pathname
    }]);
  } catch(e) {
    // Table may not exist yet — non-blocking
  }
}

// Log click if there's a ref code in URL
(function() {
  try {
    var params = new URLSearchParams(window.location.search);
    var code   = params.get('ref') || '';
    if (code) logReferralClick(code);
  } catch(e) {}
})();

/* ── STEP 4: Process referral on signup (called after auth) ── */
async function processReferralOnSignup(newUserId) {
  if (!newUserId) return;

  var refCode = '';
  try {
    refCode = localStorage.getItem('bx_ref_code') || '';
  } catch(e) {}

  if (!refCode) return;

  try {
    // Find referrer by matching referral code
    // referral_code = first 8 chars of userId (no dashes)
    var { data: allProfiles, error: pErr } = await sb
      .from('profiles')
      .select('id, career_score, full_name, email')
      .limit(500);

    if (pErr) throw pErr;

    var referrer = null;
    if (allProfiles && allProfiles.length) {
      referrer = allProfiles.find(function(p) {
        return p.id &&
          p.id.replace(/-/g, '').substring(0, 8).toLowerCase()
            === refCode.toLowerCase();
      });
    }

    // Prevent self-referral
    if (!referrer || referrer.id === newUserId) {
      console.info('[Referral] No valid referrer found for code:', refCode);
      return;
    }

    // Check if this user was already referred (prevent duplicate)
    var { data: existingRef } = await sb
      .from('referrals')
      .select('id')
      .eq('referred_id', newUserId)
      .limit(1);

    if (existingRef && existingRef.length > 0) {
      console.info('[Referral] User already has a referral record');
      return;
    }

    // Insert referral record
    await sb.from('referrals').insert([{
      referrer_id:        referrer.id,
      referrer_name:      referrer.full_name || referrer.email || 'Unknown',
      referrer_email:     referrer.email || '',
      referral_code:      refCode,
      referred_id:        newUserId,
      referred_signed_up: true,
      signed_up_at:       new Date().toISOString(),
      plan_purchased:     null,
      commission_amount:  0,
      payment_status:     'pending',
      source:             localStorage.getItem('bx_ref_source') || 'direct',
      created_at:         new Date().toISOString()
    }]);

    // Award +10 Career Score to referrer
    var currentScore = referrer.career_score || 30;
    await sb.from('profiles')
      .update({ career_score: Math.min(100, currentScore + 10) })
      .eq('id', referrer.id);

    // Award +10 bonus to new user (starts at 40 instead of 30)
    await sb.from('profiles')
      .upsert([{
        id:           newUserId,
        career_score: 40,
        referred_by:  refCode
      }], { onConflict: 'id' });

    // Update ambassador total_referrals count
    try {
      await sb.from('ambassadors')
        .update({
          total_referrals: sb.rpc('increment', { x: 1 })
        })
        .eq('referral_code', refCode);
    } catch(e) { /* ambassadors table may not exist yet */ }

    // Clean up localStorage
    try {
      localStorage.removeItem('bx_ref_code');
      localStorage.removeItem('bx_ref_expiry');
      localStorage.removeItem('bx_ref_source');
    } catch(e) {}

    console.info('[Referral] ✅ Referral processed — referrer:', referrer.id);

  } catch(e) {
    // Never interrupt signup flow
    console.warn('[Referral] Non-blocking error:', e.message || e);
  }
}

/* ── STEP 5: Process conversion when user upgrades to Pro/Premium ── */
async function processReferralConversion(userId, plan) {
  if (!userId || !plan) return;

  var commissionMap = {
    'pro':     150,
    'premium': 300
  };
  var priceMap = {
    'pro':     499,
    'premium': 999
  };

  var commission = commissionMap[plan.toLowerCase()];
  if (!commission) return;

  try {
    // Find referral record for this user
    var { data: referral, error } = await sb
      .from('referrals')
      .select('*')
      .eq('referred_id', userId)
      .is('plan_purchased', null)
      .limit(1)
      .single();

    if (error || !referral) return;

    // Update referral with conversion details
    await sb.from('referrals')
      .update({
        plan_purchased:    plan,
        plan_amount:       priceMap[plan.toLowerCase()],
        commission_amount: commission,
        converted_at:      new Date().toISOString(),
        payment_status:    'pending'
      })
      .eq('id', referral.id);

    // Update ambassador earnings
    try {
      await sb.from('ambassadors')
        .update({
          total_conversions: sb.rpc('increment', { x: 1 }),
          total_earned:      sb.rpc('increment', { x: commission }),
          pending_amount:    sb.rpc('increment', { x: commission })
        })
        .eq('referral_code', referral.referral_code);
    } catch(e) { /* ambassadors table may not exist yet */ }

    // Log to audit
    await sb.from('audit_log').insert([{
      admin_name:   'System',
      admin_role:   'system',
      action:       'REFERRAL_CONVERSION',
      target_type:  'referral',
      target_id:    referral.id,
      target_name:  referral.referrer_name,
      details:      referral.referrer_name + ' earned ₹' + commission +
                    ' from ' + plan + ' upgrade'
    }]);

    console.info('[Referral] ✅ Conversion recorded — commission: ₹' + commission);

  } catch(e) {
    console.warn('[Referral] Conversion error (non-blocking):', e.message || e);
  }
}

/* ── STEP 6: Generate referral link for current user ── */
function generateReferralLink(userId) {
  if (!userId) return 'https://www.belongix.in';
  var code = userId.replace(/-/g, '').substring(0, 8);
  return 'https://www.belongix.in/?ref=' + code;
}

/* ── STEP 7: Copy referral link to clipboard ── */
function copyReferralLink(userId) {
  var link = generateReferralLink(userId);
  navigator.clipboard.writeText(link).then(function() {
    showReferralToast('✅ Referral link copied!');
  }).catch(function() {
    prompt('Copy your referral link:', link);
  });
}

/* ── STEP 8: WhatsApp share ── */
function shareReferralWhatsApp(userId) {
  var link = generateReferralLink(userId);
  var msg  = "Hey! I've been using Belongix for my career — India's best free career platform. "
           + "Try it using my link and we both get +10 Career Score: " + link;
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

/* ── STEP 9: LinkedIn share ── */
function shareReferralLinkedIn(userId) {
  var link = generateReferralLink(userId);
  window.open(
    'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(link),
    '_blank'
  );
}

/* ── Toast notification helper ── */
function showReferralToast(msg) {
  var existing = document.getElementById('ref-toast');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.id = 'ref-toast';
  toast.style.cssText = [
    'position:fixed',
    'bottom:24px',
    'right:24px',
    'background:#2D1B69',
    'color:white',
    'padding:12px 20px',
    'border-radius:10px',
    'font-size:14px',
    'font-weight:600',
    'font-family:inherit',
    'z-index:9999',
    'box-shadow:0 8px 32px rgba(45,27,105,.4)',
    'transition:opacity .3s'
  ].join(';');
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

// ════════════════════════════════════════════════════════════
