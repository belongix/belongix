(function(){
  const cfg=window.BELONGIX_CONFIG||{};
  const FN=cfg.SUPABASE_URL ? cfg.SUPABASE_URL+'/functions/v1/' : '';
  async function session(){
    if(!window.getBelongixSession) throw new Error('Belongix authentication is not ready');
    return await window.getBelongixSession();
  }
  function billingToast(msg,isError){
    let t=document.getElementById('billing-toast');
    if(!t){
      t=document.createElement('div');
      t.id='billing-toast';
      t.style.cssText='position:fixed;right:22px;bottom:22px;max-width:340px;background:#101322;color:#fff;padding:13px 16px;border-radius:11px;font:600 13px Inter,system-ui,sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.22);z-index:9999;opacity:0;transform:translateY(10px);transition:.2s;pointer-events:none';
      document.body.appendChild(t);
    }
    t.style.background=isError?'#c83c52':'#101322';
    t.textContent=msg;
    t.style.opacity='1';t.style.transform='none';
    clearTimeout(t._hideTimer);
    t._hideTimer=setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(10px)'},isError?4200:3200);
  }
  window.BelongixBilling={
    toast:billingToast,
    async checkout(plan){
      const s=await session();
      if(!s){ window.location.href='index.html?checkout='+encodeURIComponent(plan); return; }
      if(!window.Razorpay) throw new Error('Razorpay Checkout failed to load');
      const r=await fetch(FN+'razorpay-create-subscription',{method:'POST',headers:{Authorization:'Bearer '+s.access_token,'Content-Type':'application/json'},body:JSON.stringify({plan})});
      const data=await r.json();
      if(!r.ok) throw new Error(data.error||'Could not start checkout');
      const rzp=new Razorpay({
        key:data.key_id,
        subscription_id:data.subscription_id,
        name:'Belongix',
        description:plan==='pro'?'Belongix Pro — 30 resumes/month':'Belongix Plus — 10 resumes/month',
        theme:{color:'#5b4bdb'},
        prefill:{email:s.user.email||''},
        notes:{belongix_plan:plan},
        handler:async function(resp){
          const verify=await fetch(FN+'razorpay-verify',{method:'POST',headers:{Authorization:'Bearer '+s.access_token,'Content-Type':'application/json'},body:JSON.stringify(resp)});
          const result=await verify.json();
          if(!verify.ok) { billingToast(result.error||'Payment verification failed.',true); return; }
          billingToast('Payment successful — your '+(plan==='pro'?'Pro':'Plus')+' plan is being activated.',false);
          setTimeout(()=>{window.location.href='dashboard.html?billing=success';},1400);
        },
        modal:{ondismiss:function(){}}
      });
      rzp.on('payment.failed',function(resp){ billingToast(resp?.error?.description||'Payment failed. Please try again.',true); });
      rzp.open();
    },
    async status(){
      const s=await session();
      if(!s) return null;
      const {data,error}=await window.belongix.rpc('get_resume_quota');
      if(error) throw error;
      return data && data[0] ? data[0] : null;
    },
    async cancel(){
      const s=await session();
      if(!s) throw new Error('Please sign in');
      const r=await fetch(FN+'razorpay-cancel-subscription',{method:'POST',headers:{Authorization:'Bearer '+s.access_token,'Content-Type':'application/json'}});
      const data=await r.json();
      if(!r.ok) throw new Error(data.error||'Cancellation failed');
      return data;
    }
  };
})();
