(async()=>{
 const project=await(await fetch('review-project.json')).json(),features=await(await fetch(project.controls)).json(),images={};
 for(const[id,p]of Object.entries(project.plates)){const im=new Image();im.src=p.file;await im.decode();images[id]=im;}
 const canvas=document.querySelector('#screen'),ctx=canvas.getContext('2d'),audio=document.querySelector('#audio'),select=document.querySelector('#version');let version='wide';
 function draw(t,kind=version,poster=false){const v=project.versions[kind];canvas.width=v.width;canvas.height=v.height;t=Math.max(0,Math.min(t,v.duration));const s=v.shots.find(s=>t>=s.start&&t<s.end)||v.shots.at(-1),u=Math.max(0,Math.min(1,(t-s.start)/(s.end-s.start))),lerp=(a,b)=>a+(b-a)*u;const c={x:lerp(s.camera.from.x,s.camera.to.x),y:lerp(s.camera.from.y,s.camera.to.y)},zoom=lerp(s.camera.from.zoom,s.camera.to.zoom);
 LightLeftOnMotion.draw(ctx,images[s.plate],s.plate,t+v.sourceStart,v.width,v.height,features,{zoom,camera:c});const fade=poster?1:Math.min(1,t/v.fadeIn,(v.duration-t)/v.fadeOut);if(fade<1){ctx.fillStyle=`rgba(10,21,29,${1-Math.max(0,fade)})`;ctx.fillRect(0,0,v.width,v.height);}document.querySelector('#status').textContent=`${kind==='wide'?'Movie':'Short'} · ${t.toFixed(1)} / ${v.duration.toFixed(1)}s · ${s.plate}`;return {plate:s.plate,time:t,sourceTime:t+v.sourceStart,camera:c,zoom};}
 function paint(t=audio.currentTime){return draw(t,version,audio.paused&&t<=.01)}
 async function change(kind){audio.pause();version=kind;audio.src=project.audio[kind];audio.load();paint(0);}
 select.onchange=()=>change(select.value);document.querySelector('#restart').onclick=()=>{audio.currentTime=0;paint(0)};audio.ontimeupdate=()=>paint();audio.onseeked=()=>paint();audio.onpause=()=>paint();audio.onplay=()=>paint();audio.onended=()=>draw(project.versions[version].duration);
 function tick(){if(!audio.paused&&!document.hidden)paint();requestAnimationFrame(tick)}
 window.renderFrame=(t,kind='wide')=>draw(t,kind);window.review={project,images,features,draw,change,audio,canvas};await change('wide');tick();
})().catch(e=>{document.querySelector('#status').textContent='Review could not load: '+e.message;throw e});
