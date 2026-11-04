const editorSpeakerPresets = {
  'projects/music-studio/jungle-future/speaker-closeup.png': [{x:.5,y:.447,r:.22,lo:0,hi:9}],
  'projects/music-studio/jungle-future/speaker-closeup-green.png': [{x:.5,y:.447,r:.22,lo:0,hi:9}],
  'projects/music-studio/jungle-future/speaker-environment.png': [{x:.635,y:.352,r:.054,lo:0,hi:8},{x:.187,y:.502,rx:.042,ry:.074,rotation:-.42,lo:8,hi:19},{x:.845,y:.721,rx:.040,ry:.057,rotation:.27,lo:19,hi:32}],
  'projects/born-with-my-eyes-open/reactive-speakers/close.png': [{x:.5,y:.5,r:.25,lo:0,hi:9}],
  'projects/born-with-my-eyes-open/reactive-speakers/environment.png': [{x:.451,y:.341,r:.145,lo:0,hi:8},{x:.83,y:.538,r:.09,lo:8,hi:19},{x:.152,y:.762,r:.055,lo:19,hi:32}]
};
const editorAbstractPresets = {
  'projects/music-studio/jungle-future/visual-studies/rings.png':'jungle-rings',
  'projects/music-studio/jungle-future/visual-studies/network.png':'jungle-network',
  'projects/music-studio/jungle-future/visual-studies/waves.png':'jungle-waves',
  'projects/born-with-my-eyes-open/abstract-visuals/bars.png':'bars',
  'projects/born-with-my-eyes-open/abstract-visuals/rings.png':'rings',
  'projects/born-with-my-eyes-open/abstract-visuals/wave.png':'wave'
};
function editorPaintAbstract(ctx, kind, frame, time) {
  const bg='#1e1c18', paper='#e9d2b2', red='#eb4f2b', blue='#254d70', bands=frame?.bands || Array(32).fill(0), rms=frame?.rms || 0, flux=frame?.flux || 0, wave=frame?.wave || Array(64).fill(0);
  if(kind.startsWith('jungle-')) {
    ctx.fillStyle='#161d0d';ctx.fillRect(0,0,720,720);ctx.lineWidth=4;
    if(kind==='jungle-rings'){for(let i=0;i<6;i++){const v=bands[(i*4+3)%32],r=45+i*43+v*28+rms*19;ctx.strokeStyle=`rgb(${Math.round(110+100*v)},${Math.round(105+85*v)},45)`;ctx.beginPath();ctx.arc(360,360,r,0,Math.PI*2);ctx.stroke();}for(let i=0;i<64;i++){const a=i*Math.PI*2/64,v=bands[Math.floor(i/2)%32],r=300;ctx.strokeStyle='#d5bb61';ctx.beginPath();ctx.moveTo(360+Math.cos(a)*r,360+Math.sin(a)*r);ctx.lineTo(360+Math.cos(a)*(r+8+v*45),360+Math.sin(a)*(r+8+v*45));ctx.stroke();}}
    if(kind==='jungle-network'){for(let i=0;i<27;i++){const x=40+(i*193)%640,y=40+(i*307)%640,a=(i*2.4)%6.28,v=bands[(i*5)%32];ctx.strokeStyle=`rgb(${Math.round(75+110*v)},${Math.round(76+105*v)},30)`;ctx.lineWidth=2+v*4;ctx.beginPath();for(let j=0;j<7;j++){const px=x+Math.cos(a+j*.12)*j*23,py=y+Math.sin(a+j*.12)*j*23;if(!j)ctx.moveTo(px,py);else ctx.lineTo(px,py);if(j&&((time*.24+i*.17+j*.12)%1)<.55){ctx.fillStyle='#d9bd68';ctx.fillRect(px-2-v*5,py-2-v*5,4+v*10,4+v*10);}}ctx.stroke();}}
    if(kind==='jungle-waves'){for(let k=0;k<7;k++){ctx.strokeStyle='#b6a65a';ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<=720;x+=5){const v=bands[Math.min(31,Math.floor(x/720*32))],y=100+k*85+Math.sin(x*.013+time*.8+k)*18+Math.sin(x*.03-time*.5+k)*8+v*45*Math.sin(x*.03+time*2+k);if(!x)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}}
    return;
  }
  ctx.fillStyle=bg;ctx.fillRect(0,0,720,720);ctx.strokeStyle='#2a2823';ctx.lineWidth=2;
  for(let x=-720;x<1440;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+720,720);ctx.stroke();}
  if(kind==='bars'){ ctx.strokeStyle=paper;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(64,575);ctx.lineTo(656,575);ctx.stroke(); for(let i=0;i<20;i++){const v=bands[Math.floor(i*32/20)],x=75+i*29,h=18+v*390;ctx.fillStyle=[red,blue,paper][i%3];ctx.fillRect(x,575-h,18,h);ctx.fillStyle=paper;ctx.fillRect(x,575-h-8,18,4);} }
  if(kind==='rings'){for(let i=0;i<7;i++){const v=bands.slice(i*4,i*4+4).reduce((a,b)=>a+b,0)/4,r=48+i*34+v*24;ctx.strokeStyle=[red,paper,blue][i%3];ctx.lineWidth=5+Math.round(v*6);ctx.beginPath();ctx.arc(360,360,r,0,Math.PI*2);ctx.stroke();}ctx.fillStyle=red;ctx.beginPath();ctx.arc(360,360,16+rms*28,0,Math.PI*2);ctx.fill();ctx.fillStyle=paper;for(let j=0;j<8;j++){const a=time*.35+j*Math.PI*2/8,r=265+flux*20;ctx.beginPath();ctx.arc(360+Math.cos(a)*r,360+Math.sin(a)*r,7,0,Math.PI*2);ctx.fill();}}
  if(kind==='wave'){for(let row=0;row<5;row++){ctx.strokeStyle=[blue,paper,red,paper,blue][row];ctx.lineWidth=4;ctx.beginPath();for(let i=0;i<64;i++){const x=45+i*10,y=250+row*55+wave[i]*(58+row*8);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}ctx.strokeStyle='#56473a';ctx.lineWidth=2;for(const x of [75,220,360,500,645]){ctx.beginPath();ctx.moveTo(x,180);ctx.lineTo(x,540);ctx.stroke();}ctx.fillStyle=red;ctx.beginPath();ctx.arc(360,150,10+flux*20,0,Math.PI*2);ctx.fill();}
}
