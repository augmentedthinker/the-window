const main=document.querySelector('main[data-project-id]');
const status=document.querySelector('#choice-status');
const cfg=await (await fetch(new URL('config.json',import.meta.url))).json();
const storageKey='window-chooser-session-v1';
let session;try{session=JSON.parse(localStorage.getItem(storageKey)||'null')}catch{}
let busy=false;
async function request(path,method='GET',body,token=session?.access_token){
 const r=await fetch(cfg.url+path,{method,headers:{apikey:cfg.key,Authorization:'Bearer '+(token||cfg.key),'Content-Type':'application/json',Prefer:'return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const data=await r.json().catch(()=>null);if(!r.ok)throw Error(r.status===401?'Your sign-in expired. Open a new private setup link from Sunny.':'Could not save or load the shared choice. Please try again.');return data;
}
function remember(s){session=s;localStorage.setItem(storageKey,JSON.stringify(s))}
function show(rows){const selected=rows?.[0]?.option_id;for(const b of document.querySelectorAll('[data-choose]')){const on=b.dataset.choose===selected;b.setAttribute('aria-pressed',String(on));b.textContent=on?'Selected · '+selected:'Choose '+b.dataset.choose}return selected}
const query=()=>'/rest/v1/window_choices?project_id=eq.'+encodeURIComponent(main.dataset.projectId)+'&card_id=eq.'+encodeURIComponent(main.dataset.cardId)+'&select=option_id,updated_at';
try{
 const h=new URLSearchParams(location.hash.slice(1));
 if(h.has('token_hash')){
  const token_hash=h.get('token_hash');history.replaceState(null,'',location.pathname+location.search);
  remember(await request('/auth/v1/verify','POST',{token_hash,type:'magiclink'},cfg.key));
 }
 if(session&&session.expires_at*1000<Date.now()+60000){remember(await request('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token},cfg.key))}
 const selected=show(await request(query()));
 status.textContent=session?(selected?'Saved shared choice: '+selected+'. You can change it below.':'Ready. Choose a musical direction below.'):'Open your private setup link from Sunny to enable saving on this device.';
}catch(e){status.textContent=e instanceof TypeError?'Cannot reach shared choices. Check your connection and reload.':e.message}
for(const b of document.querySelectorAll('[data-choose]'))b.addEventListener('click',async()=>{
 if(busy)return;if(!session){status.textContent='Open your private setup link from Sunny first.';return}
 busy=true;document.querySelectorAll('[data-choose]').forEach(x=>x.disabled=true);status.textContent='Saving…';
 try{
  if(session.expires_at*1000<Date.now()+60000)remember(await request('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token},cfg.key));
  await request('/rest/v1/rpc/window_choose','POST',{p_project:main.dataset.projectId,p_card:main.dataset.cardId,p_option:b.dataset.choose});
  const rows=await request(query());if(show(rows)!==b.dataset.choose)throw Error('Save could not be confirmed. Please reload.');status.textContent='Saved shared choice: '+b.dataset.choose+'. The agents can read it now.';
 }catch(e){status.textContent=e instanceof TypeError?'Cannot reach shared choices. Check your connection and reload.':e.message}finally{busy=false;document.querySelectorAll('[data-choose]').forEach(x=>x.disabled=false)}
});
