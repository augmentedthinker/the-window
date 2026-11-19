(() => {
  const local = ['127.0.0.1', 'localhost'].includes(location.hostname);
  const panel = document.querySelector('#coordination');
  const note = document.querySelector('#coordination-note');
  const mode = document.querySelector('#work-mode');
  const homes = document.querySelector('#neighbor-status');
  const request = async (data) => {
    const r = await fetch('/api/collaboration', data ? {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)} : {});
    const body = await r.json(); if (!r.ok) throw Error(body.error || 'Change not saved'); return body;
  };
  async function availability() {
    const button=document.querySelector('#check-neighbors');button.disabled=true;
    try {
      const r=await fetch('/api/neighbors');if(!r.ok)throw Error('Check unavailable');const data=await r.json();
      homes.replaceChildren();
      for(const h of data.homes){const li=document.createElement('li');li.textContent=`${h.home} · ${h.agent}: ${h.reachable?'server reachable':'server not reachable'}`;homes.append(li);}
      const li=document.createElement('li');li.textContent=`Checked ${new Date(data.checkedAt).toLocaleTimeString()}. Toggle and agent readiness unknown. No messages sent.`;homes.append(li);
    } catch(e){homes.textContent=e.message;}finally{button.disabled=false;}
  }
  // One browser deadline timer; no server polling or model work.
  let expiryTimer;
  function archiveExpired() {
    clearTimeout(expiryTimer);
    let next=Infinity;
    for(const thread of document.querySelectorAll('.thread')){
      const expiry=Date.parse(thread.dataset.expires);
      if(thread.dataset.closed || !Number.isFinite(expiry))continue;
      if(expiry<=Date.now()){
        const archive=document.querySelector('#older-discussions');archive.append(thread);
        thread.querySelector('.thread-status').textContent='Daily archive · not marked completed';
        const b=thread.querySelector('.thread-action');b.dataset.action='reopen';b.textContent='Reopen discussion';
      }else next=Math.min(next,expiry);
    }
    if(Number.isFinite(next))expiryTimer=setTimeout(archiveExpired,Math.min(2147483647,Math.max(1,next-Date.now()+50)));
  }
  archiveExpired();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)archiveExpired();});
  if(!local){
    note.textContent='Published snapshot. Change work mode and close discussions from the local Window on the Chromebook. Phone choices remain in the Music Tray.';
    return;
  }
  request().then(data=>{
    panel.hidden=false; mode.value=data.mode; let currentMode=data.mode;
    note.textContent=data.mode==='local'?'At home: local changes stay here. No GitHub push needed.':'Remote phone: batch relevant updates for publication. This setting never pushes by itself.';
    document.querySelectorAll('.thread-action').forEach(b=>b.hidden=false);
    mode.addEventListener('change',async()=>{
      mode.disabled=true;
      try{const saved=await request({action:'mode',mode:mode.value});currentMode=saved.mode;note.textContent=saved.mode==='local'?'At home: local changes stay here.':'Remote phone: publish relevant updates in batches; nothing was pushed by this switch.';}
      catch(e){mode.value=currentMode;note.textContent=e.message;}finally{mode.disabled=false;}
    });
    document.querySelector('#check-neighbors').addEventListener('click',availability);availability();
  }).catch(()=>{note.textContent='Local coordination service unavailable. Existing discussions remain readable.';});
  document.querySelectorAll('.thread-action').forEach(b=>b.addEventListener('click',async()=>{
    b.disabled=true;
    try{await request({action:b.dataset.action,thread:b.dataset.id});location.reload();}
    catch(e){note.textContent=e.message;b.disabled=false;}
  }));
})();
