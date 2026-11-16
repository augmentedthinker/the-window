(() => {
'use strict';
const card=window.TRAY_CARDS.find(c=>c.id==='008'),A=window.SONG_ANALYSIS,R=window.TRAY_REACTIVE_008;
const API='http://127.0.0.1:8850/api/tray/choices',audio=document.querySelector('#song'),stage=document.querySelector('#stage'),status=document.querySelector('#save-status'),playStatus=document.querySelector('#play-status');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let active='E1',picked={},images={},raf=0,lastFrame=-1,saving=false;
function height(){if(parent!==window)parent.postMessage({type:'tray-audition-height',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');}
new ResizeObserver(height).observe(document.body);
window.addEventListener('resize',height);
window.addEventListener('load',height);
if(parent!==window)document.querySelector('#back').hidden=true;
if(!card||!A||A.audio!==card.audio){status.textContent='The selected song and analysis do not match. Please reload the current Tray.';status.className='error';return;}
const F=A.features,bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),data={};
for(const k of ['bass','mid','high','rms','bands','wave'])data[k]=bytes(F[k]);
const n=F.frames,fps=F.fps;
function sample(t){const f=Math.max(0,Math.min(n-1,Math.floor(t*fps))),s={};for(const k of ['bass','mid','high','rms'])s[k]=data[k][f]/255;s.bands=Array.from(data.bands.subarray(f*32,f*32+32),v=>v/255);s.wave=Array.from(data.wave.subarray(f*32,f*32+32),v=>(v-128)/128);return s;}
function draw(t=audio.currentTime){R.render(stage,active,sample(t),t,images);}
function thumbnails(){const t=audio.currentTime;for(const o of card.options){const canvas=document.querySelector(`[data-option="${o.key}"] canvas`);if(canvas)R.render(canvas,o.key,sample(t),t,images);}}
function frame(ms){if(audio.paused||document.hidden){raf=0;return;}if(ms-lastFrame>=1000/30){draw();lastFrame=ms;}raf=requestAnimationFrame(frame);}
function stopLoop(){cancelAnimationFrame(raf);raf=0;}
function loop(){if(!raf&&!audio.paused&&!document.hidden)raf=requestAnimationFrame(frame);}
function select(key,scroll=false){active=key;const o=card.options.find(o=>o.key===key);document.querySelector('#active-title').textContent=o.name;document.querySelector('#active-description').textContent=o.description;document.querySelectorAll('.tile').forEach(el=>{el.classList.toggle('active',el.dataset.option===key);el.querySelector('.preview').setAttribute('aria-pressed',String(el.dataset.option===key));});draw();thumbnails();if(scroll)document.querySelector('.transport').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});}
function votes(){for(const o of card.options){const tile=document.querySelector(`[data-option="${o.key}"]`),v=picked[`008_${o.key}`]?.key;tile.classList.toggle('accept',v==='on');tile.classList.toggle('reject',v==='off');tile.querySelector('[data-vote="on"]').setAttribute('aria-pressed',String(v==='on'));tile.querySelector('[data-vote="off"]').setAttribute('aria-pressed',String(v==='off'));tile.querySelector('.decision').textContent=v==='on'?'✓ Chosen':v==='off'?'× Crossed out':'Not reviewed';}height();}
async function load(){try{const r=await fetch(API,{cache:'no-store'});if(!r.ok)throw Error();picked=await r.json();votes();status.className='';status.textContent='Decisions are shared with the homes. Previewing does not cast a vote.';}catch{status.className='error';status.textContent='Could not load shared choices. Keep the Coast running to save decisions.';}}
async function vote(key,value){if(saving)return;saving=true;document.querySelectorAll('[data-vote]').forEach(b=>b.disabled=true);status.className='';status.textContent='Saving decision…';try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({card:`008_${key}`,key:value})});if(!r.ok)throw Error();picked=await r.json();votes();status.textContent='Decision saved on the Chromebook.';}catch{status.className='error';status.textContent='Decision was not saved. Check that the Coast is running, then try again.';}finally{saving=false;document.querySelectorAll('[data-vote]').forEach(b=>b.disabled=false);}}
for(const o of card.options){const el=document.createElement('section');el.className='tile';el.dataset.option=o.key;el.innerHTML=`<canvas width="480" height="270" aria-label="${esc(o.name)} sample"></canvas><h3>${esc(o.key)} · ${esc(o.name)}</h3><p class="description">${esc(o.description)}</p><button class="preview" data-preview="${esc(o.key)}" aria-pressed="false">Preview ${esc(o.name)}</button><p class="decision"></p><div class="actions"><button data-vote="on" aria-pressed="false">✓ Choose</button><button class="vote-no" data-vote="off" aria-pressed="false">× Cross out</button><button data-vote="none" aria-label="Reset decision for ${esc(o.name)}">Reset</button></div>`;el.querySelector('[data-preview]').onclick=()=>select(o.key,true);el.querySelectorAll('[data-vote]').forEach(b=>b.onclick=()=>vote(o.key,b.dataset.vote));document.querySelector(o.key[0]==='E'?'#environment':'#abstract').append(el);}
document.querySelector('.swatches').innerHTML=card.palette.map(c=>`<span><i style="background:${/^#[0-9a-f]{6}$/i.test(c.hex)?c.hex:'#173E4B'}"></i>${esc(c.hex)}</span>`).join('');
audio.src=card.audio;
audio.addEventListener('play',()=>{if(parent!==window)parent.postMessage({type:'tray-audition-play'},'*');playStatus.textContent='Playing · previews follow this same recording and position.';loop();});
audio.addEventListener('pause',()=>{stopLoop();draw();thumbnails();playStatus.textContent='Paused · press Play to audition.';});
audio.addEventListener('seeking',()=>{draw();thumbnails();});audio.addEventListener('seeked',()=>{draw();thumbnails();});
audio.addEventListener('error',()=>{playStatus.textContent='The selected recording could not load. Please reopen the local Music Tray.';});
audio.addEventListener('loadedmetadata',()=>{if(Math.abs(audio.duration-A.summary.duration)>.5){audio.pause();audio.removeAttribute('src');playStatus.textContent='Audio duration differs from its analysis; audition stopped.';}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();});window.addEventListener('pagehide',()=>audio.pause());
window.addEventListener('message',e=>{if(e.source!==parent)return;if(e.data?.type==='tray-preview-pause')audio.pause();if(e.data?.type==='tray-preview-measure')height();});
Promise.all(card.options.filter(o=>o.image).map(async o=>{const img=new Image();img.src=o.image;await img.decode();images[o.key]=img;})).then(()=>{select(active);height();}).catch(()=>{playStatus.textContent='A preview image could not load. Please reload the local Tray.';});
select(active);votes();load();
// Read-only diagnostics and deterministic rendering interface for independent visual QA / later reuse.
window.TRAY_AUDITION_008={sample,select,draw,images,get active(){return active},audio};
})();
