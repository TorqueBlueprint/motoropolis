//@ map2d/draw.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- drawing ----------
function drawCar(c){
 if(c.hidden)return;
 let sc=c.state==='road'||c.state==='towed'||c.state==='broken'?Math.min(2.2,V2.k*.8):1;if(c.state==='service'&&c.slot&&c.slot.b.type==='sucata')sc=Math.max(.35,c.timer/3);
 ctx.save();ctx.translate(c.x+3,c.y+4);ctx.rotate(c.ang);ctx.scale(sc,sc);ctx.fillStyle='rgba(0,0,0,.27)';rrect(ctx,-c.len/2,-c.wid/2,c.len,c.wid,5);ctx.fill();ctx.restore();
 ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.ang);ctx.scale(sc,sc);
 const L=c.len,W=c.wid,hl=-L/2,hw=-W/2;
 ctx.fillStyle='#15171b';for(const wx of [hl+L*.2,hl+L*.78]){ctx.fillRect(wx-3.5,hw-1.2,7,3);ctx.fillRect(wx-3.5,W/2-1.8,7,3)}
 if(c.kind==='bus'){
  ctx.fillStyle=c.color;rrect(ctx,hl,hw,L,W,4);ctx.fill();ctx.fillStyle='#eef3fb';rrect(ctx,hl+2,hw+2,L-4,W-4,3);ctx.fill();ctx.fillStyle='rgba(25,35,45,.85)';for(let k=0;k<6;k++)ctx.fillRect(hl+5+k*(L-12)/6,hw+1,(L-12)/6-2,2.5),ctx.fillRect(hl+5+k*(L-12)/6,W/2-3.5,(L-12)/6-2,2.5);ctx.fillStyle=c.color;ctx.fillRect(hl+L-7,hw+1,5,W-2);
 }else if(c.kind==='police'){
  ctx.fillStyle='#f4f4f0';rrect(ctx,hl,hw,L,W,4);ctx.fill();ctx.fillStyle='#1d2430';ctx.fillRect(hl+L*.28,hw,L*.36,W);ctx.fillStyle='rgba(25,35,45,.88)';rrect(ctx,hl+L*.2,hw+2,L*.5,W-4,3);ctx.fill();
  const on=Math.floor(simTime*6)%2===0;ctx.fillStyle=c.siren?(on?'#ff3b30':'#2f6fd9'):'#7a1a1a';ctx.fillRect(hl+L*.44,hw+1,4,W/2-1);ctx.fillStyle=c.siren?(on?'#2f6fd9':'#ff3b30'):'#1a2f7a';ctx.fillRect(hl+L*.44,0,4,W/2-1);
 }else if(c.kind==='fire'||c.kind==='amb'){const fi=c.kind==='fire';
  ctx.fillStyle=fi?'#d93a2f':'#f4f4f0';rrect(ctx,hl,hw,L,W,4);ctx.fill();ctx.fillStyle=fi?'#f4f4f0':'#d93a2f';ctx.fillRect(hl+3,-1.5,L-8,3);if(fi){ctx.fillStyle='#aab4c0';ctx.fillRect(hl+4,-4,L*.6,8)}
  ctx.fillStyle='rgba(25,35,45,.88)';ctx.fillRect(hl+L*.8,hw+2,L*.12,W-4);
  const on=Math.floor(simTime*6)%2===0;ctx.fillStyle=c.siren?(on?'#ff3b30':'#2f6fd9'):'#7a1a1a';ctx.fillRect(hl+L*.72,hw+1,4,W/2-1);ctx.fillStyle=c.siren?(on?'#2f6fd9':'#ff3b30'):'#1a2f7a';ctx.fillRect(hl+L*.72,0,4,W/2-1);
 }else if(c.kind==='tow'){
  ctx.fillStyle='#3a3d42';ctx.fillRect(hl,hw+1,L*.62,W-2);
  ctx.fillStyle='#55595f';ctx.fillRect(hl+2,-2,L*.5,4);
  ctx.fillStyle=c.color;rrect(ctx,hl+L*.6,hw,L*.4,W,4);ctx.fill();
  ctx.fillStyle='rgba(25,35,45,.9)';ctx.fillRect(hl+L*.8,hw+2,5,W-4);
  const on=Math.floor(simTime*4)%2===0&&!c.idle;
  ctx.fillStyle=on?'#ffb000':'#7a5a10';ctx.fillRect(hl+L*.66,hw+1,4,W-2);
 }else{
  ctx.fillStyle=c.color;rrect(ctx,hl,hw,L,W,c.m.classic?6:4);ctx.fill();
  if(c.m.pickup){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(hl+2,hw+2,L*.42,W-4)}
  if(c.kind==='van'){ctx.fillStyle='#d6402f';ctx.fillRect(hl+3,-2,L-14,4)}
  ctx.fillStyle='rgba(25,35,45,.88)';
  const gx=c.m.pickup?hl+L*.46:hl+L*.2,gw=c.kind==='van'?L*.18:c.m.wagon?L*.6:L*.5;
  rrect(ctx,gx,hw+2,gw,W-4,3);ctx.fill();
  ctx.fillStyle=c.color;ctx.globalAlpha=.9;rrect(ctx,gx+gw*.2,hw+3.5,gw*.55,W-7,2);ctx.fill();ctx.globalAlpha=1;
  if(c.m.sport){ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(hl,-2.5,L,1.6);ctx.fillRect(hl,1,L,1.6)}
  if(c.isNew&&c.state==='service'){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.strokeRect(hl+1,hw+1,L-2,W-2)}
 }
 {const hg=ctx.createLinearGradient(0,hw,0,W/2);hg.addColorStop(0,'rgba(255,255,255,.24)');hg.addColorStop(.45,'rgba(255,255,255,0)');hg.addColorStop(1,'rgba(0,0,0,.2)');ctx.fillStyle=hg;rrect(ctx,hl,hw,L,W,4);ctx.fill()}
 ctx.fillStyle='#fff4c2';ctx.fillRect(L/2-2,hw+1.5,2,3);ctx.fillRect(L/2-2,W/2-4.5,2,3);
 const brake=c.brake&&(c.state==='road'||c.state==='broken');
 ctx.fillStyle=brake?'#ff3020':'#8a1a14';ctx.fillRect(hl,hw+1.5,2,3);ctx.fillRect(hl,W/2-4.5,2,3);
 if(c.stolen&&Math.floor(simTime*4)%2===0){ctx.strokeStyle='#ff3b30';ctx.lineWidth=3;ctx.strokeRect(hl-4,hw-4,L+8,W+8)}
 if(c.state==='broken'||c.state==='towed'){if(Math.floor(simTime*3)%2===0){ctx.fillStyle='#ffa600';ctx.fillRect(hl-1,hw,3,3);ctx.fillRect(hl-1,W/2-3,3,3);ctx.fillRect(L/2-2,hw,3,3);ctx.fillRect(L/2-2,W/2-3,3,3)}}
 ctx.restore();
}
function drawLights(night){
 for(const n of nodes){if(!n.light)continue;const ni=nodes.indexOf(n);
  for(const m of n.nb){const st=lightState(n,n.ax[m]||'h');const sp=stopPt(m,ni),t=edgeTan(ni,m),e=EDGE(m,ni);
   const x=sp.x-t.y*(e.w/2-e.lane+8),y=sp.y+t.x*(e.w/2-e.lane+8);
   ctx.fillStyle='#1b1d21';ctx.beginPath();ctx.arc(x,y,5.5,0,TAU);ctx.fill();
   ctx.fillStyle=st==='g'?'#38e07b':st==='y'?'#ffc21a':'#ff3b2f';ctx.beginPath();ctx.arc(x,y,3.6,0,TAU);ctx.fill();
   if(night>0){ctx.globalCompositeOperation='lighter';glow(x,y,14,st==='g'?'56,224,123':st==='y'?'255,194,26':'255,59,47',.5*night);ctx.globalCompositeOperation='source-over'}
  }}
}
function glow(x,y,r,rgb,a){const gr=ctx.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${rgb},${a})`);gr.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
function chan(){return(channel.trim()||'MY CHANNEL').toUpperCase()}
function drawDynamicUnder(){ctx.save();
 const O=B.oficina;lotT(ctx,O);
 sign(ctx,chan()+' REPAIR SHOP',O.x0+20,O.y0+8,O.w-40,30,'#ff7a1a','#1d0f02',20);
 if(!trailer){const pa=.85+.15*Math.sin(simTime*3);ctx.globalAlpha=pa;sign(ctx,'CLICK TO STEP INSIDE ▶',O.x0+O.w/2-105,O.y0+40,210,22,'#22252b','#ffffff',16);ctx.globalAlpha=1}
 const P=B.pecas;lotT(ctx,P);sign(ctx,'AUTO PARTS',P.x0+20,P.y0+18,150,28,'#c0392b','#fff',18);
 const T=B.pneus;lotT(ctx,T);sign(ctx,'TIRES · ALIGNMENT',T.x0+60,T.y0+12,T.w-120,26,'#22252b','#fff',17);
 const Rb=B.reboques;lotT(ctx,Rb);sign(ctx,'24H TOWING',Rb.x0+90,Rb.y0+14,166,28,'#f2a51a','#1d0f02',19);
 const I=B.inspecao;lotT(ctx,I);sign(ctx,'INSPECTION CENTER',I.x0+20,I.y0+12,I.w-40,26,'#1d4fb8','#fff',17);
 const Pa=B.parque;lotT(ctx,Pa);sign(ctx,'P',Pa.x0+Pa.w-44,Pa.y0+Pa.h-40,32,32,'#1d4fb8','#fff',24);
 const L=B.lavagem;lotT(ctx,L);sign(ctx,'AUTOMATIC CAR WASH',L.x0+90,L.y0+L.h-36,L.w-110,26,'#3fa7c4','#062a36',17);
 const St=B.stand;lotT(ctx,St);sign(ctx,'DEALERSHIP · NEW & USED',St.x0+40,St.y0+40,St.w-80,30,'#22252b','#fff',19);
 for(let k=0;k<14;k++){const x=St.x0+18+k*23.5,y=St.y0+20,f=Math.sin(simTime*4+k)*2;ctx.fillStyle=['#d93a2f','#e8b931','#2f6fd9'][k%3];ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+16,y);ctx.lineTo(x+8,y+12+f);ctx.fill()}
 const F=B.fabrica;lotT(ctx,F);sign(ctx,'CAR FACTORY',F.x0+30,F.y0+F.h-112,220,26,'#22252b','#fff',17);
 // conveyor
 const cy=F.y0+F.h-70;ctx.fillStyle='#3a3d42';ctx.fillRect(F.x0+20,cy-8,F.w-40,16);
 for(let k=0;k<6;k++){const x=F.x0+24+((simTime*18+k*55)%(F.w-60));ctx.fillStyle=['#9aa3ad','#d93a2f','#2f6fd9','#f2f2ee'][k%4];ctx.fillRect(x,cy-6,24,12)}
 // sucata piles & crane
 const Su=B.sucata;lotT(ctx,Su);sign(ctx,'JUNKYARD · SALVAGE',Su.x0+120,Su.y0+12,210,26,'#5b4a3a','#fff',17);
 const cols=['#7a3f2a','#5a6b7d','#8a7f6a','#6b2e2e','#4d5a4a','#9aa3ad'];
 for(let k=0;k<Math.min(Su.pile,60);k++){const col=k%10,row=Math.floor(k/10);const x=Su.x0+160+col*17,y=Su.y0+Su.h-30-row*15;ctx.fillStyle=cols[(k*7)%cols.length];ctx.fillRect(x,y,15,13);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.strokeRect(x,y,15,13)}
 const ca=Math.sin(simTime*.4)*.9,px=Su.x0+150,py=Su.y0+90;ctx.strokeStyle='#e8b931';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(ca)*110,py+Math.sin(ca)*60);ctx.stroke();ctx.fillStyle='#2b2f36';ctx.beginPath();ctx.arc(px,py,9,0,TAU);ctx.fill();
 // lavagem brushes
 lotT(ctx,L); for(const s of L.slots){const on=s.car&&s.car.state==='service';const a=on?simTime*14:0;
  for(const sd of [-1,1]){const bx=s.ux+12,by=s.uy+sd*21;ctx.fillStyle=on?'#4fc3e8':'#2f6f8f';ctx.beginPath();ctx.arc(bx,by,8,0,TAU);ctx.fill();ctx.strokeStyle='#e8f8ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx+Math.cos(a)*7,by+Math.sin(a)*7);ctx.lineTo(bx-Math.cos(a)*7,by-Math.sin(a)*7);ctx.stroke()}}
 // pista billboard + race cars
 lotT(ctx,B.pista);const Pi=B.pista,cx=Pi.x0+Pi.w/2,cyy=Pi.y0+Pi.h/2,ax=Pi.w/2-26,ay=Pi.h/2-24;
 ctx.fillStyle='#22252b';rrect(ctx,cx-120,cyy-34,240,68,6);ctx.fill();ctx.fillStyle='#ff7a1a';ctx.fillRect(cx-120,cyy-34,240,6);
 ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';let fs=34;ctx.font=`800 ${fs}px 'Barlow Condensed', sans-serif`;
 while(ctx.measureText(chan()).width>220&&fs>14){fs-=2;ctx.font=`800 ${fs}px 'Barlow Condensed', sans-serif`}
 ctx.fillText(chan(),cx,cyy+2);ctx.font="600 12px 'Barlow', sans-serif";ctx.fillStyle='#ffb36b';ctx.fillText('SUBSCRIBE · OFFICIAL TRACK',cx,cyy+24);
 for(const r of race){const a=r.t*TAU,x=cx+Math.cos(a)*ax,y=cyy+Math.sin(a)*ay,ang=Math.atan2(Math.cos(a)*ay,-Math.sin(a)*ax);
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-13,-6,28,14);ctx.fillStyle=r.col;rrect(ctx,-15,-7,30,14,3);ctx.fill();ctx.fillStyle='#111';ctx.fillRect(-15,-8,5,16);ctx.fillRect(10,-8,5,16);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,5,0,TAU);ctx.fill();ctx.fillStyle='#111';ctx.font="700 7px 'JetBrains Mono', monospace";ctx.fillText(String(r.num),0,.5);ctx.restore()}
 // inspection lane lamps
 lotT(ctx,I); for(const s of I.slots){const on=s.car&&s.car.state==='service';ctx.fillStyle=on?(Math.floor(simTime*2)%2?'#38e07b':'#e8b931'):'#555';ctx.beginPath();ctx.arc(s.ux+60,s.uy-26,4,0,TAU);ctx.fill()}
 ctx.restore();
}
function drawDynamicOver(){ctx.save();
 const b=B.bomba;lotT(ctx,b);
 ctx.fillStyle='rgba(235,110,30,.55)';ctx.fillRect(b.x0+70,b.y0+40,200,140);ctx.strokeStyle='rgba(120,50,10,.8)';ctx.lineWidth=2;ctx.strokeRect(b.x0+70,b.y0+40,200,140);
 ctx.fillStyle='#fff';ctx.font="800 22px 'Barlow Condensed', sans-serif";ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('FUEL',b.x0+170,b.y0+28);
 // mechanics beside cars on lifts
 lotT(ctx,B.oficina);for(const s of B.oficina.slots){if(!(s.car&&s.car.state==='service'))continue;const ph=simTime*2+s.ux;const mx=s.ux+20+Math.sin(ph)*3,my=s.uy+Math.cos(ph*.7)*14;
  ctx.fillStyle='#1d4fb8';ctx.beginPath();ctx.arc(mx,my,5.5,0,TAU);ctx.fill();ctx.fillStyle='#f0c9a0';ctx.beginPath();ctx.arc(mx,my,3,0,TAU);ctx.fill();
  const pr=1-s.car.timer/s.car.svcTotal;ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(s.ux-20,s.uy+34,40,5);ctx.fillStyle='#5cc98a';ctx.fillRect(s.ux-20,s.uy+34,40*clamp(pr,0,1),5)}
 lotT(ctx,B.stand);for(const s of B.stand.slots){if(s.car&&s.car.isNew&&s.car.state==='service'){ctx.fillStyle='#e8b931';rrect(ctx,s.ux-24,s.uy+26,48,15,3);ctx.fill();ctx.fillStyle='#1d0f02';ctx.font="700 10px 'JetBrains Mono', monospace";ctx.textAlign='center';ctx.fillText('$'+(s.car.price/1000).toFixed(1)+'k',s.ux,s.uy+34)}}
 ctx.restore();
}
function drawParticles(){
 for(const p of particles){const k=p.t/p.life;
  if(p.kind==='smoke'){ctx.fillStyle=`rgba(70,72,76,${.45*(1-k)})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill()}
  else if(p.kind==='dust'){ctx.fillStyle=`rgba(150,130,100,${.6*(1-k)})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill()}
  else if(p.kind==='spark'){ctx.fillStyle=`rgba(255,${200-k*120|0},60,${1-k})`;ctx.fillRect(p.x-1.5,p.y-1.5,3,3)}
  else if(p.kind==='flame'){ctx.fillStyle=`rgba(255,${Math.round(200-150*k)},40,${.9*(1-k)})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r*(1-k*.5),0,TAU);ctx.fill()}
  else if(p.kind==='bubble'){ctx.strokeStyle=`rgba(230,250,255,${.9*(1-k)})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.stroke()}
  else if(p.kind==='confetti'){ctx.globalAlpha=1-k*k;ctx.fillStyle=p.col;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.t*8+p.r);ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);ctx.restore();ctx.globalAlpha=1}
 }
}
function drawLocked(){
 const next=nextMilestone();
 ctx.save();
 MILESTONES.forEach((m,idx)=>{
  if(isOpen(m.type))return;const b=B[m.type],isNext=next===m;ctx.save();lotT(ctx,b,true);
  const x=b.x0-2,y=b.y0-2,w=b.w+4,h=b.h+4;
  const gr=ctx.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,'#2468bb');gr.addColorStop(1,'#174a8c');ctx.fillStyle=gr;ctx.fillRect(x,y,w,h);
  ctx.lineWidth=1;ctx.strokeStyle='rgba(255,255,255,.08)';ctx.beginPath();
  for(let k=x+12;k<x+w;k+=12){ctx.moveTo(k,y);ctx.lineTo(k,y+h)}for(let k=y+12;k<y+h;k+=12){ctx.moveTo(x,k);ctx.lineTo(x+w,k)}ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.17)';ctx.beginPath();
  for(let k=x+60;k<x+w;k+=60){ctx.moveTo(k,y);ctx.lineTo(k,y+h)}for(let k=y+60;k<y+h;k+=60){ctx.moveTo(x,k);ctx.lineTo(x+w,k)}ctx.stroke();
  ctx.strokeStyle='rgba(232,243,255,.8)';ctx.lineWidth=1.6;ctx.strokeRect(b.x0+14,b.y0+14,b.w-28,b.h-28);
  ctx.setLineDash([6,4]);ctx.lineWidth=1.3;
  if(m.type==='pista'){const cx=b.x0+b.w/2,cy=b.y0+b.h/2;for(const d of [-15,15]){ctx.beginPath();ctx.ellipse(cx,cy,b.w/2-26+d,b.h/2-24+d,0,0,TAU);ctx.stroke()}}
  for(const s of b.slots){ctx.save();ctx.translate(s.ux,s.uy);ctx.rotate(s.uang);ctx.strokeRect(-17,-10,34,20);ctx.beginPath();ctx.moveTo(4,-10);ctx.lineTo(4,10);ctx.stroke();ctx.restore()}
  ctx.setLineDash([]);
  const dy=b.y1-7;ctx.lineWidth=1;ctx.strokeStyle='rgba(232,243,255,.6)';ctx.beginPath();ctx.moveTo(b.x0+14,dy);ctx.lineTo(b.x1-14,dy);ctx.moveTo(b.x0+14,dy-4);ctx.lineTo(b.x0+14,dy+4);ctx.moveTo(b.x1-14,dy-4);ctx.lineTo(b.x1-14,dy+4);ctx.stroke();
  ctx.strokeStyle='rgba(232,243,255,.9)';ctx.lineWidth=2;ctx.strokeRect(x+1,y+1,w-2,h-2);
  const bw=Math.min(b.w-70,272),bh=isNext?112:86,bx=b.x0+(b.w-bw)/2,by=b.y0+(b.h-bh)/2;
  if(isNext){const p=.5+.5*Math.sin(simTime*4);ctx.fillStyle=`rgba(255,122,26,${.22+.3*p})`;rrect(ctx,bx-8,by-8,bw+16,bh+16,10);ctx.fill()}
  ctx.fillStyle='rgba(10,34,70,.95)';rrect(ctx,bx,by,bw,bh,6);ctx.fill();ctx.strokeStyle=isNext?'#ff7a1a':'rgba(232,243,255,.85)';ctx.lineWidth=2;ctx.stroke();
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle='rgba(200,222,250,.9)';ctx.font="700 12px 'JetBrains Mono', monospace";ctx.fillText(`${isNext?'NEXT UP · ':''}BLUEPRINT ${String(idx).padStart(2,'0')}/11`,bx+bw/2,by+15);
  ctx.strokeStyle='rgba(232,243,255,.3)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx+10,by+27);ctx.lineTo(bx+bw-10,by+27);ctx.stroke();
  ctx.fillStyle='#fff';let fs=25;ctx.font=`800 ${fs}px 'Barlow Condensed', sans-serif`;while(ctx.measureText(m.label.toUpperCase()).width>bw-20&&fs>14){fs-=2;ctx.font=`800 ${fs}px 'Barlow Condensed', sans-serif`}
  ctx.fillText(m.label.toUpperCase(),bx+bw/2,by+46);
  ctx.fillStyle='#ffb36b';ctx.font="800 21px 'Barlow Condensed', sans-serif";ctx.fillText(`OPENS AT ${m.n.toLocaleString('en-US')} SUBS`,bx+bw/2,by+69);
  if(isNext){const sv=subs||0,pv=[...ALL_MS].reverse().find(q=>q.n<=sv),base=pv?pv.n:0,pr=clamp((sv-base)/Math.max(1,m.n-base),0,1),left=m.n-sv;
   ctx.fillStyle='rgba(255,255,255,.16)';rrect(ctx,bx+16,by+83,bw-32,7,3.5);ctx.fill();ctx.fillStyle='#ff7a1a';rrect(ctx,bx+16,by+83,Math.max(7,(bw-32)*pr),7,3.5);ctx.fill();
   ctx.fillStyle='#e8f3ff';ctx.font="600 13px 'Barlow', sans-serif";ctx.fillText(`${left.toLocaleString('en-US')} subscriber${left===1?'':'s'} to go`,bx+bw/2,by+101)}
  ctx.restore();
 });
 ctx.restore();
}
let lightC=null;
function drawAmbient(n){
 const day=1-n;
 if(day>.02)for(let k=0;k<4;k++){const sp=14+k*5,x=((simTime*sp+k*620)%(CW+900))-450,y=140+k*250+Math.sin(simTime*.05+k)*60,r=250+k*40;
  ctx.save();ctx.translate(x,y);ctx.scale(1.5,.7);const gr=ctx.createRadialGradient(0,0,0,0,0,r);gr.addColorStop(0,`rgba(15,25,40,${.14*day})`);gr.addColorStop(1,'rgba(15,25,40,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.restore()}
 const dusk=Math.sin(Math.PI*n);if(dusk>.01){ctx.fillStyle=`rgba(255,130,50,${.17*dusk})`;ctx.fillRect(0,0,CW,CH)}
 if(!lightC){lightC=document.createElement('canvas');lightC.width=CW;lightC.height=CH;const l=lightC.getContext('2d');
  let gr=l.createRadialGradient(CW*.5,CH*.5,CH*.45,CW*.5,CH*.5,CW*.72);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(8,12,22,.4)');l.fillStyle=gr;l.fillRect(0,0,CW,CH);
  gr=l.createLinearGradient(0,0,CW*.6,CH);gr.addColorStop(0,'rgba(255,236,190,.11)');gr.addColorStop(1,'rgba(255,236,190,0)');l.fillStyle=gr;l.fillRect(0,0,CW,CH)}
 ctx.drawImage(lightC,0,0);
}
function drawNewCars(){
 for(const c of cars){if(!(c.newT>0)||c.hidden)continue;const k=c.newT/6;
  ctx.strokeStyle=`rgba(92,201,138,${k})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(c.x,c.y,c.len*.7+(1-k)*14,0,TAU);ctx.stroke();
  ctx.fillStyle=`rgba(92,201,138,${k})`;ctx.font="800 18px 'Barlow Condensed', sans-serif";ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('+1 SUB',c.x,c.y-c.len*.7-14-(1-k)*10)}
}
function nightLevel(){
 if(lightMode==='dia')return 0;if(lightMode==='noite')return 1;
 const h=clockH();return h<5?1:h<7?1-(h-5)/2:h<19?0:h<21?(h-19)/2:1;
}
function clockH(){return(7+simTime/10)%24}
function clockStr(){const h=clockH(),hh=Math.floor(h),mm=Math.floor((h-hh)*60/5)*5;return String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')}
function drawNight(n){
 if(n<=0)return;
 ctx.fillStyle=`rgba(8,14,38,${.62*n})`;ctx.fillRect(0,0,CW,CH);
 ctx.save();ctx.setTransform(V2.s,0,0,V2.s,V2.ox,V2.oy);
 ctx.globalCompositeOperation='lighter';
 for(const l of lamps)glow(l.x,l.y,46,'255,190,110',.28*n);
 for(const c of cars){
  if(c.hidden||(c.state!=='road'&&c.state!=='lot'&&c.state!=='broken'&&c.state!=='towed'))continue;
  if(c.state!=='towed'&&c.state!=='broken'){
   const hx=Math.cos(c.ang),hy=Math.sin(c.ang),fx=c.x+hx*c.len/2,fy=c.y+hy*c.len/2,len=90;
   const gr=ctx.createLinearGradient(fx,fy,fx+hx*len,fy+hy*len);gr.addColorStop(0,`rgba(255,240,190,${.42*n})`);gr.addColorStop(1,'rgba(255,240,190,0)');
   ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(fx-hy*5,fy+hx*5);ctx.lineTo(fx+hx*len-hy*26,fy+hy*len+hx*26);ctx.lineTo(fx+hx*len+hy*26,fy+hy*len-hx*26);ctx.lineTo(fx+hy*5,fy-hx*5);ctx.fill();
  }
  const bx=c.x-Math.cos(c.ang)*c.len/2,by=c.y-Math.sin(c.ang)*c.len/2;glow(bx,by,c.brake?16:9,'255,40,30',(c.brake?.6:.3)*n);
  if((c.state==='broken'||c.state==='towed')&&Math.floor(simTime*3)%2===0)glow(c.x,c.y,26,'255,166,0',.5*n);
  if(c.kind==='tow'&&!c.idle&&Math.floor(simTime*4)%2===0)glow(c.x,c.y,34,'255,176,0',.5*n);
 }
 for(const b of buildings){if(b.type==='pista')continue;glow(b.x0+b.w/2,b.y0+b.h/2,Math.max(b.w,b.h)*.55,'255,200,120',.12*n)}
 const Pi=B.pista;glow(Pi.x0+Pi.w/2,Pi.y0+Pi.h/2,160,'255,255,240',.18*n);
 ctx.globalCompositeOperation='source-over';ctx.restore();
}
let VW=CW,VH=CH;const HUDS=WORLD?CW/1920:1;
let HUDSC=HUDS;const hudSc=(cw,ch)=>cw/ch<1.2?Math.min(HUDS,cw/1000):HUDS;
function hudScaled(f){const cw=ctx===hctx?HUDW:ctx.canvas.width,ch=ctx===hctx?HUDH:ctx.canvas.height,sc=hudSc(cw,ch);if(sc===1){VW=cw;VH=ch;try{f()}finally{VW=CW;VH=CH}return}ctx.save();ctx.scale(sc,sc);VW=cw/sc;VH=ch/sc;try{f()}finally{ctx.restore();VW=CW;VH=CH}}
function xmasLine(){const n=new Date(),y=n.getMonth()===0?n.getFullYear()-1:n.getFullYear(),d=Math.ceil((new Date(y,11,25)-new Date(n.getFullYear(),n.getMonth(),n.getDate()))/864e5);return d>1?`🎄 ${d} DAYS TO CHRISTMAS`:d===1?'🎄 CHRISTMAS EVE TOMORROW':d===0?'🎅 MERRY CHRISTMAS, MOTOROPOLIS!':'✨ HAPPY HOLIDAYS FROM MOTOROPOLIS'}
function drawHUD(){
 const name=chan();
 ctx.save();ctx.textAlign='left';ctx.textBaseline='alphabetic';
 ctx.font="800 42px 'Barlow Condensed', sans-serif";const tw=Math.max(ctx.measureText(name).width,250);
 // the redesigned page (ui/welcome.js) shows the next unlock as a card over the city, and never the subscriber count
 const NEWUI=!!document.getElementById('nuCard');
 if(!NEWUI){ctx.fillStyle='rgba(16,19,24,.86)';rrect(ctx,22,18,tw+52,92,10);ctx.fill();ctx.fillStyle='#ff7a1a';ctx.fillRect(22,18,7,92);
 ctx.fillStyle='#fff';ctx.fillText(name,44,62);
 ctx.font="600 19px 'Barlow', sans-serif";ctx.fillStyle='#ffb36b';ctx.fillText(`MOTOROPOLIS · ${clockStr()} · DAY ${Math.floor((70+simTime)/240)+1}`,44,92)}
 // next milestone
 const nm=nextMilestone(),sv=subs||0;
 if(!NEWUI){ctx.fillStyle='rgba(16,19,24,.86)';rrect(ctx,22,118,470,74,10);ctx.fill()}
 if(XMAS){const t=xmasLine(),cy=VW<1300?296:200;ctx.font="800 22px 'Barlow Condensed', sans-serif";const w=ctx.measureText(t).width+40;ctx.fillStyle='rgba(179,38,30,.92)';rrect(ctx,22,cy,w,40,10);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText(t,42,cy+28)}
 ctx.textAlign='left';
 if(NEWUI){}else if(nm){
  const prevN=[...ALL_MS].reverse().find(m=>m.n<=sv);const base=prevN?prevN.n:0;const pr=clamp((sv-base)/Math.max(1,nm.n-base),0,1);
  ctx.font="700 14px 'Barlow', sans-serif";ctx.fillStyle='#9aa3ae';ctx.fillText(`NEXT MILESTONE · ${nm.n.toLocaleString('en-US')} SUBSCRIBERS`,40,142);
  ctx.font="800 24px 'Barlow Condensed', sans-serif";ctx.fillStyle='#fff';const left=nm.n-sv;ctx.fillText(`${nm.label.toUpperCase()} · ${left.toLocaleString('en-US')} TO GO`,40,168);
  ctx.fillStyle='#262b34';rrect(ctx,40,176,434,8,4);ctx.fill();ctx.fillStyle='#ff7a1a';rrect(ctx,40,176,Math.max(8,434*pr),8,4);ctx.fill();
 }else{ctx.font="800 26px 'Barlow Condensed', sans-serif";ctx.fillStyle='#5cc98a';ctx.fillText('ALL MILESTONES REACHED!',40,163)}
 const chips=[...(NEWUI?[]:[['SUBSCRIBERS',sv.toLocaleString('en-US'),true]]),['ON THE ROAD',String(cars.filter(c=>c.state==='road'&&c.kind==='car').length)],['REPAIRS',String(stats.repairs)],['REVENUE',eur(stats.money)]];
 const NARROW=VW<1300,chY=NARROW?205:18;let x=VW-22;ctx.textAlign='right';let subsX=0,subsW=0;
 for(let k=chips.length-1;k>=0;k--){const[l,v,hl]=chips[k];ctx.font=`700 ${hl?38:30}px 'Barlow Condensed', sans-serif`;const w=Math.max(ctx.measureText(v).width,hl?120:90)+28;x-=w;
  ctx.fillStyle=hl?'#ff7a1a':'rgba(16,19,24,.86)';rrect(ctx,x,chY,w,70,8);ctx.fill();ctx.fillStyle=hl?'#1d0f02':'#fff';ctx.fillText(v,x+w-14,chY+(hl?60:56));ctx.font="600 13px 'Barlow', sans-serif";ctx.fillStyle=hl?'#3d1d04':'#9aa3ae';ctx.fillText(l,x+w-14,chY+20);
  if(hl){subsX=x;subsW=w}x-=10}
 if(NEWUI&&!subsW){subsX=x;subsW=120}
 if(sv>MAXCARS&&!NEWUI){ctx.font="600 14px 'Barlow', sans-serif";ctx.fillStyle='rgba(16,19,24,.86)';const t=`1 car ≈ ${Math.ceil(sv/MAXCARS).toLocaleString('en-US')} subscribers`;const tw2=ctx.measureText(t).width+20;rrect(ctx,VW-22-tw2,96,tw2,26,6);ctx.fill();ctx.fillStyle='#ffb36b';ctx.fillText(t,VW-32,114)}
 if(subToast){const k=subToast.t/3;ctx.globalAlpha=1-k*k;ctx.font="800 34px 'Barlow Condensed', sans-serif";ctx.fillStyle='#5cc98a';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='rgba(16,19,24,.9)';const ty=118+k*40;ctx.strokeText(subToast.text,subsX+subsW/2,ty);ctx.fillText(subToast.text,subsX+subsW/2,ty);ctx.globalAlpha=1}
 // call to action and the news ticker (left out while the Drag Strip telemetry covers the bottom of the 3D view)
 const dragTel=DRAG.hudAt&&performance.now()-DRAG.hudAt<250;
 if(!dragTel){ctx.textAlign='left';const cta='SUBSCRIBE AND HELP THE CITY GROW';ctx.font="800 22px 'Barlow Condensed', sans-serif";const cw2=ctx.measureText(cta).width;
 const bxw=cw2+150,bxx=VW-22-bxw,bxy=VH-22-58-(NARROW?170:0);ctx.fillStyle='rgba(16,19,24,.86)';rrect(ctx,bxx,bxy,bxw,58,10);ctx.fill();
 ctx.fillStyle='#e8322a';rrect(ctx,bxx+12,bxy+12,112,34,6);ctx.fill();ctx.fillStyle='#fff';ctx.font="800 18px 'Barlow Condensed', sans-serif";ctx.textAlign='center';ctx.fillText('SUBSCRIBE',bxx+68,bxy+35);
 ctx.textAlign='left';ctx.font="800 22px 'Barlow Condensed', sans-serif";ctx.fillStyle='#fff';ctx.fillText(cta,bxx+136,bxy+37);
 const rows=ticker.slice(0,4);
 if(rows.length){ctx.textAlign='left';const h=rows.length*30+16;ctx.fillStyle='rgba(16,19,24,.86)';rrect(ctx,22,VH-22-h,760,h,10);ctx.fill();
  rows.forEach((r,i)=>{const y=VH-22-h+30+i*30;ctx.fillStyle=r.kind==='ok'?'#5cc98a':r.kind==='bad'?'#ff5a4f':'#6cb6ff';ctx.fillRect(38,y-14,5,18);
   ctx.font="500 15px 'JetBrains Mono', monospace";ctx.fillStyle='#9aa3ae';ctx.fillText(r.time,52,y);
   ctx.font="500 18px 'Barlow', sans-serif";ctx.fillStyle=`rgba(238,240,242,${i===0?1:.82})`;let txt=r.text;while(ctx.measureText(txt).width>640&&txt.length>10)txt=txt.slice(0,-2);if(txt!==r.text)txt=txt.trim()+'…';ctx.fillText(txt,112,y)})}}
 ctx.restore();
}
function drawCeleb(){
 if(!celeb)return;const t=celeb.t,a=Math.min(1,t/.35)*Math.min(1,(4.5-t)/.5),sc=.85+.15*Math.min(1,t/.35);
 ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.translate(VW/2,VH/2-40);ctx.scale(sc,sc);
 const w=760,h=170;ctx.fillStyle='rgba(16,19,24,.94)';rrect(ctx,-w/2,-h/2,w,h,14);ctx.fill();ctx.fillStyle='#ff7a1a';ctx.fillRect(-w/2,-h/2,w,8);
 ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillStyle='#ffb36b';ctx.font="700 22px 'Barlow Condensed', sans-serif";ctx.fillText('NEW BUILDING IN TOWN',0,-46);
 ctx.fillStyle='#fff';let fs=64;ctx.font=`800 ${fs}px 'Barlow Condensed', sans-serif`;while(ctx.measureText(celeb.title.toUpperCase()).width>w-60&&fs>30){fs-=4;ctx.font=`800 ${fs}px 'Barlow Condensed', sans-serif`}
 ctx.fillText(celeb.title.toUpperCase(),0,6);
 ctx.fillStyle='#5cc98a';ctx.font="600 22px 'Barlow', sans-serif";ctx.fillText(celeb.sub,0,56);
 ctx.restore();ctx.textBaseline='alphabetic';
}
function drawSelected(){
 const c=selected;if(!c)return;
 ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.arc(c.x,c.y,c.len*.75,0,TAU);ctx.stroke();ctx.setLineDash([]);
 const w=96,h=24,x=c.x-w/2,y=c.y-c.len*.75-34;
 ctx.fillStyle='#fafafa';rrect(ctx,x,y,w,h,4);ctx.fill();ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.stroke();
 
 ctx.fillStyle='#111';ctx.font="700 14px 'JetBrains Mono', monospace";ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(c.plate,x+w/2,y+h/2+1);
}
const inV2=f=>{ctx.save();ctx.setTransform(V2.s,0,0,V2.s,V2.ox,V2.oy);try{f()}finally{ctx.restore()}};
function draw(){
 ctx.drawImage(bg,0,0);
 const n=nightLevel();
 inV2(()=>{drawDynamicUnder();
 const order=[...cars].sort((a,b)=>(a.state==='road'||a.state==='towed'?1:0)-(b.state==='road'||b.state==='towed'?1:0));
 for(const c of order)drawCar(c);
 drawDynamicOver();
 drawPeople();
 drawLocked()});
 drawAmbient(n);
 drawNight(n);
 inV2(()=>{drawLights(n);
 drawParticles();
 drawPeopleNames();
 drawNewCars();
 drawSelected()});
 if(showHud&&!trailer)hudScaled(drawHUD);
 if(!trailer)hudScaled(drawCeleb);
}

