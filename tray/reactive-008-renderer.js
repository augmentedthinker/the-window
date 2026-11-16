// Card008: deterministic source-time rendering from the selected recording's saved analysis.
// All environmental coordinates are normalized to the full generated image (no cropping).
(() => {
const P=['#173E4B','#91A9AA','#B77851','#F0C779','#E9EEE5'];
const regions={E1:{cx:.517,cy:.469,rx:.143,ry:.253},E2:{x:.16,y:.435,w:.65,h:.115},E3:{x:.319,y:.416,w:.361,h:.165}};
const clamp=v=>Math.max(0,Math.min(1,v));
function render(canvas,key,s,t,images){
 const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
 const B=clamp(s.bass),M=clamp(s.mid),A=clamp(s.high),L=clamp(s.rms),bands=s.bands||Array(32).fill(0),wave=s.wave||Array(32).fill(0);
 c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.clearRect(0,0,W,H);
 if(key[0]==='E'){
  const img=images[key]; if(!img?.naturalWidth)return;
  c.drawImage(img,0,0,W,H);
  if(key==='E1'){
   // Interior paper cone only: retain the fixed copper surround and cabinet.
   const r=regions.E1,x=r.cx*W,y=r.cy*H,rx=r.rx*W,ry=r.ry*H;
   const scale=1+B*.11*Math.sin(t*2*Math.PI*7);
   c.save();c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.clip();
   c.translate(x,y);c.scale(scale,scale);c.translate(-x,-y);c.drawImage(img,0,0,W,H);c.restore();
  }else if(key==='E2'){
   // Copper strings between actual tailpiece and end of fingerboard; thin envelope keeps endpoints anchored.
   const r=regions.E2;c.save();c.beginPath();c.rect(r.x*W,r.y*H,r.w*W,r.h*H);c.clip();
   for(let j=0;j<4;j++){
    const sy=(.457+j*.030)*H,ey=(.468+j*.020)*H;
    c.beginPath();for(let k=0;k<=60;k++){const u=k/60,x=(.167+u*.635)*W,y=sy+(ey-sy)*u+Math.sin(u*Math.PI)*Math.sin(u*Math.PI*6+t*(16+j*3))*(M*.011*H);k?c.lineTo(x,y):c.moveTo(x,y);}
    c.strokeStyle=P[j%2?3:4];c.globalAlpha=.12+M*.8;c.lineWidth=H*(.0008+M*.0018);c.stroke();
   }
   c.restore();
   // A soft soundboard glow at each existing f-hole; clipped tightly to its interior.
   for(const [x,y] of [[.306,.362],[.312,.618]]){
    c.save();c.beginPath();c.ellipse(x*W,y*H,.040*W,.025*H,0,0,Math.PI*2);c.clip();
    const g=c.createRadialGradient(x*W,y*H,0,x*W,y*H,.045*W);g.addColorStop(0,P[3]+'bb');g.addColorStop(1,P[3]+'00');c.globalCompositeOperation='screen';c.globalAlpha=B*.5;c.fillStyle=g;c.fillRect(0,0,W,H);c.restore();
   }
  }else{
   const r=regions.E3,x=r.x*W,y=r.y*H,w=r.w*W,h=r.h*H;
   c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
   c.fillStyle='#09181c';c.fillRect(x,y,w,h);
   for(let i=0;i<24;i++){
    const v=clamp(bands[Math.floor(i/24*32)]),bh=h*(.04+v*.82),bw=w/24;
    c.fillStyle=P[i<10?3:i<18?2:1];c.globalAlpha=.35+v*.65;
    c.fillRect(x+i*bw+bw*.15,y+h-bh-h*.07,bw*.70,bh);
   }
   c.globalAlpha=.7;c.strokeStyle=P[4];c.lineWidth=H*.0016;c.beginPath();
   for(let i=0;i<32;i++){const xx=x+i/31*w,yy=y+h*.35+wave[i]*h*.18; i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();c.restore();
  }
 }else{
  c.fillStyle=P[0];c.fillRect(0,0,W,H);
  // Sparse static fibers keep the abstract medium related to the paper sets.
  c.fillStyle=P[1];c.globalAlpha=.15;for(let i=0;i<95;i++)c.fillRect(((i*137)%997)/997*W,((i*241)%991)/991*H,1,1);c.globalAlpha=1;
  if(key==='A1'){
   // Broad pleated ribbons; audio bends their dominant geometry.
   for(let j=0;j<5;j++){
    const cy=H*(.19+j*.145),thick=H*(.045+B*.055),amp=H*(.035+M*.17),phase=t*.35+j;
    const yy=(u,d)=>cy+Math.sin(u*5+phase)*amp+d*thick;
    c.beginPath();for(let i=0;i<=50;i++){const u=i/50;i?c.lineTo(u*W,yy(u,-1)):c.moveTo(0,yy(0,-1));}for(let i=50;i>=0;i--){const u=i/50;c.lineTo(u*W,yy(u,1));}c.closePath();c.fillStyle=P[(j+1)%5];c.fill();
    c.save();c.clip();for(let i=0;i<45;i++){const x=i/44*W;c.strokeStyle=i%2?P[0]+'55':P[4]+'55';c.lineWidth=W*.002;c.beginPath();c.moveTo(x,0);c.lineTo(x+W*.014,H);c.stroke();}c.restore();
   }
  }else if(key==='A2'){
   // Two woven families of solid copper/ivory strings, a changing central lens.
   for(let family=0;family<2;family++)for(let j=0;j<14;j++){
    const q=j/13,band=bands[(j*2+family)%32]||0;
    c.beginPath();
    if(!family){c.moveTo(W*(.10+q*.80),H*.08);c.bezierCurveTo(W*(.9-q*.8),H*(.30+M*.14),W*(q*.8+.1),H*(.65-B*.13),W*(.9-q*.8),H*.92);}
    else{c.moveTo(W*.06,H*(.15+q*.70));c.bezierCurveTo(W*(.30+M*.14),H*(.9-q*.8),W*(.70-B*.10),H*(q*.8+.1),W*.94,H*(.85-q*.70));}
    c.strokeStyle=P[family?3:1];c.globalAlpha=.40+band*.6;c.lineWidth=H*(.003+band*.012);c.stroke();
   }
   c.globalAlpha=1;c.fillStyle=P[2];c.beginPath();c.ellipse(W*.5,H*.5,W*(.035+B*.07),H*(.035+M*.14),Math.sin(t*.25)*.35,0,Math.PI*2);c.fill();
  }else{
   // Broad faceted pressure rings: magnitude changes radius and each spectral facet.
   c.save();c.translate(W*.5,H*.5);c.rotate(t*.08);
   for(let j=0;j<5;j++){
    const r=H*(.075+j*.073+B*.045),thick=H*(.018+M*.035);c.beginPath();
    for(let k=0;k<=48;k++){const a=k/48*Math.PI*2,rr=r+(bands[k%32]||0)*H*.045;k?c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):c.moveTo(rr,0);}
    for(let k=48;k>=0;k--){const a=k/48*Math.PI*2,rr=Math.max(1,r-thick+(bands[k%32]||0)*H*.045);c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fillStyle=P[(j+1)%5];c.fill('evenodd');
   }
   c.fillStyle=P[3];c.beginPath();c.arc(0,0,H*(.015+A*.05),0,Math.PI*2);c.fill();c.restore();
  }
 }
 c.globalAlpha=1;c.globalCompositeOperation='source-over';
}
window.TRAY_REACTIVE_008={render,palette:P,regions};
})();
