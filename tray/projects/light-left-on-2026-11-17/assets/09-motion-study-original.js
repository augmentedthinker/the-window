// Deterministic source-time painting layer. Saved mix features, not instrument stems.
window.LightLeftOnMotion=(()=>{
 const clamp=x=>Math.max(0,Math.min(1,Number(x)||0));
 function draw(ctx,img,plate,t,w,h,features,options={}){
  const frame=Math.max(0,Math.min((features.rms?.length||1)-1,Math.floor(t*features.fps)));
  const e=options.energy===undefined?clamp(features.rms?.[frame]):clamp(options.energy);
  const bass=options.energy===undefined?clamp(features.bass?.[frame]):e;
  const strength=options.strength===undefined?1:options.strength;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#142633';ctx.fillRect(0,0,w,h);
  const zoom=options.zoom||1.025,scale=Math.max(w/img.width,h/img.height)*zoom;
  const ox=(w-img.width*scale)/2,oy=(h-img.height*scale)/2;
  ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.drawImage(img,0,0);ctx.scale(img.width,img.height);
  if(plate==='P02'){
   // Local amber over the existing flame; no hand or whole-scene deformation.
   const x=.55,y=.43,r=.035+.009*e;
   ctx.save();ctx.beginPath();ctx.ellipse(x,y,.065,.11,0,0,Math.PI*2);ctx.clip();
   const g=ctx.createRadialGradient(x,y,0,x,y,r*2);g.addColorStop(0,`rgba(255,211,124,${strength*(.05+.15*e)*(.8+.2*Math.sin(t*11))})`);g.addColorStop(1,'rgba(226,170,83,0)');ctx.fillStyle=g;ctx.fillRect(x-.08,y-.12,.16,.24);ctx.restore();
  }
  if(plate==='P10'){
   ctx.save();ctx.strokeStyle=`rgba(228,231,223,${strength*(.16+.30*e)})`;ctx.lineWidth=.0012;ctx.beginPath();
   for(let i=0;i<110;i++){const x=((i*.6180339-t*.034)%1+1)%1,y=((i*.381966+t*(.06+(i%5)*.008))%1+1)%1;ctx.moveTo(x,y);ctx.lineTo(x-.006,y+.012+.009*bass);}ctx.stroke();ctx.restore();
   // Window light stays within the painted window.
   ctx.save();ctx.beginPath();ctx.rect(.61,.425,.105,.13);ctx.clip();ctx.fillStyle=`rgba(226,170,83,${strength*(.018+.045*bass)})`;ctx.fillRect(.61,.425,.105,.13);ctx.restore();
  }
  if(plate==='P08'){
   // Passing headlight wash limited to the lower snowy road; authored phase,
   // while recorded mix energy controls brightness. Not tracked car footage.
   ctx.save();ctx.beginPath();ctx.moveTo(.24,.98);ctx.lineTo(.42,.61);ctx.lineTo(.57,.61);ctx.lineTo(.8,.98);ctx.closePath();ctx.clip();
   const phase=(Math.sin(t*.48)+1)/2,x=.30+.37*phase;
   const g=ctx.createRadialGradient(x,.87,0,x,.87,.23);g.addColorStop(0,`rgba(236,226,191,${strength*(.035+.12*e)})`);g.addColorStop(1,'rgba(236,226,191,0)');ctx.fillStyle=g;ctx.fillRect(.2,.6,.65,.4);ctx.restore();
  }
  ctx.restore();return {time:t,energy:e,bass,frame};
 }
 return {draw};
})();
