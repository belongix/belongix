(function(){
  const cfg=window.BELONGIX_CONFIG||{};
  const FN=cfg.SUPABASE_URL ? cfg.SUPABASE_URL+'/functions/v1/' : '';
  async function session(){
    if(!window.getBelongixSession) throw new Error('Belongix authentication is not ready');
    return await window.getBelongixSession();
  }
  window.BelongixBilling={
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
          if(!verify.ok) { alert(result.error||'Payment verification failed.'); return; }
          alert('Payment successful. Your '+(plan==='pro'?'Pro':'Plus')+' plan is being activated.');
          window.location.href='dashboard.html?billing=success';
        },
        modal:{ondismiss:function(){}}
      });
      rzp.on('payment.failed',function(resp){ alert(resp?.error?.description||'Payment failed. Please try again.'); });
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
