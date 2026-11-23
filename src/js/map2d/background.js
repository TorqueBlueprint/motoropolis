//@ map2d/background.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- background ----------
function tree(x,y,r){g.fillStyle='rgba(18,38,18,.3)';g.beginPath();g.ellipse(x+r*.5,y+r*.55,r,r*.82,0,0,TAU);g.fill();g.fillStyle=pick(['#3f7034','#4a7d3a','#55893f','#3b6a3a','#5c8f45']);g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.fillStyle='rgba(0,0,0,.14)';g.beginPath();g.arc(x+r*.22,y+r*.25,r*.7,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.13)';g.beginPath();g.arc(x-r*.28,y-r*.3,r*.6,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.arc(x-r*.42,y-r*.44,r*.28,0,TAU);g.fill()}
function sign(c,text,x,y,w,h,bgc,fg,size){c.fillStyle=bgc;rrect(c,x,y,w,h,4);c.fill();c.fillStyle=fg;c.font=`700 ${size||18}px 'Barlow Condensed', 'Arial Narrow', sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,x+w/2,y+h/2+1)}
function shed(x,y,w,h,floor){g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x+3,y+5,w+9,h+9);g.fillStyle='#22262c';g.fillRect(x-5,y-5,w+10,h+10);g.fillStyle='#4d535c';g.fillRect(x-5,y-5,w+10,2);g.fillRect(x-5,y-5,2,h+10);g.fillStyle=floor||'#a6a8ad';g.fillRect(x,y,w,h);
 g.strokeStyle='rgba(0,0,0,.06)';g.lineWidth=1;g.beginPath();for(let k=x+26;k<x+w;k+=26){g.moveTo(k,y);g.lineTo(k,y+h)}for(let k=y+26;k<y+h;k+=26){g.moveTo(x,k);g.lineTo(x+w,k)}g.stroke();
 const sg=g.createLinearGradient(0,y,0,y+24);sg.addColorStop(0,'rgba(0,0,0,.26)');sg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=sg;g.fillRect(x,y,w,24);
 const sg2=g.createLinearGradient(x,0,x+18,0);sg2.addColorStop(0,'rgba(0,0,0,.18)');sg2.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=sg2;g.fillRect(x,y,18,h)}
function drawBackground(){
 {const gg=g.createLinearGradient(0,0,CW,CH);gg.addColorStop(0,XMAS?'#f1f5f9':'#88af5d');gg.addColorStop(1,XMAS?'#dde6ee':'#6e9951');g.fillStyle=gg;g.fillRect(0,0,CW,CH);
  g.save();g.rotate(-.5);for(let k=-40;k<90;k++){g.fillStyle=k%2?'rgba(255,255,255,.04)':'rgba(0,0,0,.035)';g.fillRect(-900,k*34,3600,34)}g.restore();
  for(let k=0;k<2600;k++){g.fillStyle=R()<.5?'rgba(40,80,30,.16)':'rgba(215,238,150,.14)';g.fillRect(R()*CW,R()*CH,2,2)}
  for(let k=0;k<70;k++){const x=R()*CW,y=R()*CH;if(x>XS[0]-HALF-20&&x<XS[NX-1]+HALF+20&&y>YS[0]-HALF-20&&y<YS[NY-1]+HALF+20)continue;g.fillStyle=pick(['#f4e36a','#ffffff','#f29ac0']);for(let q=0;q<5;q++)g.fillRect(x+rr(-8,8),y+rr(-8,8),2,2)}}
 for(let k=0;k<160;k++){const x=R()*CW,y=R()*CH;if(x>XS[0]-HALF-20&&x<XS[NX-1]+HALF+20&&y>YS[0]-HALF-20&&y<YS[NY-1]+HALF+20)continue;tree(x,y,rr(9,16))}
 // blocks: sidewalks + lots
 for(const b of buildings){const X=b.x0-12,Y=b.y0-12,Wd=b.w+24,Hd=b.h+24;g.fillStyle='#b7b1a4';g.fillRect(X,Y,Wd,Hd);g.fillStyle='#cdc7bb';g.fillRect(X+2,Y+2,Wd-4,Hd-4);
  g.strokeStyle='rgba(0,0,0,.08)';g.lineWidth=1;g.beginPath();for(let k=X+12;k<X+Wd;k+=12){g.moveTo(k,Y);g.lineTo(k,Y+12);g.moveTo(k,Y+Hd-12);g.lineTo(k,Y+Hd)}for(let k=Y+12;k<Y+Hd;k+=12){g.moveTo(X,k);g.lineTo(X+12,k);g.moveTo(X+Wd-12,k);g.lineTo(X+Wd,k)}g.stroke();
  g.fillStyle='#d6d1c6';g.fillRect(b.x0,b.y0,b.w,b.h)}
 if(WORLD){const C2=cityFill();for(const bl of C2.blocks){if(bl.type==='lot')continue;g.fillStyle=bl.type==='res'?(XMAS?'#e8eef4':'#7fae5c'):'#cdc7bb';g.fillRect(bl.x0-6,bl.y0-6,bl.x1-bl.x0+12,bl.y1-bl.y0+12)}
  for(const f of C2.items){if(f.k==='tree'){tree(f.x,f.y,f.r);continue}if(f.k==='car'){g.fillStyle=f.col;g.fillRect(f.x-8,f.y-16,16,32);continue}g.save();g.translate(f.x,f.y);if(f.ang)g.rotate(f.ang);
   if(f.k==='park'){g.fillStyle='#8f949b';g.fillRect(-f.w/2,-f.h/2,f.w,f.h);g.restore();continue}g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-f.w/2+7,-f.h/2+8,f.w,f.h);
   if(f.k==='house'){g.fillStyle=f.roof;g.fillRect(-f.w/2,-f.h/2,f.w,f.h);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-f.w/2,0,f.w,f.h/2);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(-f.w/2,-1,f.w,2)}
   else{g.fillStyle=f.k==='tower'?'#3b5470':f.k==='mid'?'#6f7d8c':f.body;g.fillRect(-f.w/2,-f.h/2,f.w,f.h);g.fillStyle=f.k==='tower'?'#5f7f9f':'#59616d';g.fillRect(-f.w/2+6,-f.h/2+6,f.w-12,f.h-12)}g.restore()}
  if(C2.xst){const X0=C2.xst.x0,X1=C2.xst.sx,Y0b=C2.xst.y0,Y1b=C2.xst.y1,mx2=(X0+X1)/2;g.fillStyle='#b3261e';g.fillRect(mx2-52,Y0b+26,104,80);g.fillStyle='#f2f6fa';g.fillRect(mx2-52,Y0b+56,104,18);g.fillStyle='#7a4520';g.fillRect(mx2-40,Y1b-86,80,60);g.fillStyle='#fffaf2';g.fillRect(mx2-40,Y1b-60,80,8);g.font="800 11px 'Barlow Condensed',sans-serif";g.textAlign='center';g.fillStyle='#fff';g.fillText("SANTA'S WORKSHOP",mx2,Y0b+48);g.fillText('GINGERBREAD',mx2,Y1b-68)}
  const tb=C2.blocks.find(b=>b.type==='towerlot');if(tb){g.fillStyle='#2468bb';g.fillRect(tb.x0,tb.y0,tb.x1-tb.x0,tb.y1-tb.y0);g.fillStyle='#fff';g.font="800 24px 'Barlow Condensed',sans-serif";g.textAlign='center';g.fillText('MOTOROPOLIS TOWER',(tb.x0+tb.x1)/2,(tb.y0+tb.y1)/2-4);g.fillStyle='#ffb36b';g.font="700 17px 'Barlow',sans-serif";g.fillText(`OPENS AT ${MS.w_tower.n.toLocaleString('en-US')} SUBS`,(tb.x0+tb.x1)/2,(tb.y0+tb.y1)/2+20)}}
 // roads
 g.fillStyle='#3a3f47';
 for(const y of YS)g.fillRect(XS[0]-HALF,y-HALF,XS[NX-1]-XS[0]+HALF*2,HALF*2);
 for(const x of XS)g.fillRect(x-HALF,YS[0]-HALF,HALF*2,YS[NY-1]-YS[0]+HALF*2);
 if(CANAL_I>=0){const cx=XS[CANAL_I];g.fillStyle='#3b7fb8';g.fillRect(cx-HALF-12,YS[0]-HALF-40,HALF*2+24,YS[NY-1]-YS[0]+HALF*2+80);g.fillStyle='rgba(255,255,255,.12)';for(let k=0;k<160;k++){g.fillRect(cx-HALF-8+R()*(HALF*2+16),YS[0]-HALF-36+R()*(YS[NY-1]-YS[0]+HALF*2+72),rr(6,16),1.5)}
  g.fillStyle='#8f949b';for(const y of YS){g.fillStyle='#3a3f47';g.fillRect(cx-HALF-12,y-HALF,HALF*2+24,HALF*2);g.fillStyle='#c9c3b6';g.fillRect(cx-HALF-12,y-HALF-5,HALF*2+24,5);g.fillRect(cx-HALF-12,y+HALF,HALF*2+24,5)}}
 {const rx0=XS[0]-HALF,ry0=YS[0]-HALF,rw=XS[NX-1]-XS[0]+HALF*2,rh=YS[NY-1]-YS[0]+HALF*2;
  const onRoad=(x,y)=>XS.some(v=>Math.abs(x-v)<HALF-1)||YS.some(v=>Math.abs(y-v)<HALF-1);
  for(let k=0;k<5600;k++){const x=rx0+R()*rw,y=ry0+R()*rh;if(!onRoad(x,y))continue;g.fillStyle=R()<.5?'rgba(255,255,255,.05)':'rgba(0,0,0,.11)';g.fillRect(x,y,rr(1,3),rr(1,3))}
  g.fillStyle='rgba(0,0,0,.07)';for(const y of YS)for(const o of [-LANE,LANE])g.fillRect(rx0,y+o-7,rw,14);for(const x of XS)for(const o of [-LANE,LANE])g.fillRect(x+o-7,ry0,14,rh);
  for(let k=0;k<30;k++){const hz=R()<.5,x=hz?rr(rx0+60,rx0+rw-60):pick(XS)+pick([-LANE,LANE]),y=hz?pick(YS)+pick([-LANE,LANE]):rr(ry0+60,ry0+rh-60);
   if(R()<.45){g.fillStyle='#2a2e35';g.beginPath();g.arc(x,y,5,0,TAU);g.fill();g.strokeStyle='rgba(255,255,255,.13)';g.lineWidth=1;g.stroke()}else{g.fillStyle='rgba(18,20,24,.3)';g.fillRect(x-14,y-7,rr(18,36),rr(9,14))}}
  g.strokeStyle='rgba(238,234,224,.6)';g.lineWidth=2;for(const b of buildings)g.strokeRect(b.x0-13,b.y0-13,b.w+26,b.h+26);
  g.strokeStyle='rgba(238,234,224,.45)';g.strokeRect(rx0+1,ry0+1,rw-2,rh-2)}
 // markings
 g.strokeStyle='rgba(245,245,240,.75)';g.lineWidth=2;g.setLineDash([16,14]);
 for(let j=0;j<NY;j++)for(let i=0;i<NX-1;i++){g.beginPath();g.moveTo(XS[i]+HALF+4,YS[j]);g.lineTo(XS[i+1]-HALF-4,YS[j]);g.stroke()}
 for(let i=0;i<NX;i++)for(let j=0;j<NY-1;j++){if(i===CANAL_I)continue;g.beginPath();g.moveTo(XS[i],YS[j]+HALF+4);g.lineTo(XS[i],YS[j+1]-HALF-4);g.stroke()}
 g.setLineDash([]);
 for(const n of nodes){if(!n.round)continue;g.fillStyle='#3a3f47';g.beginPath();g.arc(n.x,n.y,HALF+8,0,TAU);g.fill();g.strokeStyle='rgba(245,245,240,.8)';g.lineWidth=2;g.setLineDash([8,8]);g.beginPath();g.arc(n.x,n.y,25,0,TAU);g.stroke();g.setLineDash([]);g.fillStyle='#c9c3b6';g.beginPath();g.arc(n.x,n.y,16,0,TAU);g.fill();g.fillStyle='#5f9a45';g.beginPath();g.arc(n.x,n.y,13,0,TAU);g.fill();tree(n.x,n.y,8)}
 // crosswalks + stop lines at lit junctions
 for(const n of nodes){if(!n.light)continue;
  for(const m of n.nb){const d=segDir(m,n.i+n.j*NX);// incoming from m to n
   const ox=-d.dx,oy=-d.dy;// pointing away from node toward m
   g.fillStyle='rgba(245,245,240,.85)';
   for(let k=-HALF+4;k<=HALF-8;k+=8){const cx=n.x+ox*(HALF+12)+(d.rx)*k,cy=n.y+oy*(HALF+12)+(d.ry)*k;g.fillRect(cx-(d.dx?7:2),cy-(d.dy?7:2),d.dx?14:4,d.dy?14:4)}
   const sx=n.x+ox*(HALF+23),sy=n.y+oy*(HALF+23);
   g.beginPath();g.lineWidth=3;g.strokeStyle='rgba(245,245,240,.9)';g.moveTo(sx+d.rx*2,sy+d.ry*2);g.lineTo(sx+d.rx*(HALF-2),sy+d.ry*(HALF-2));g.stroke();
  }}
 // street lamps
 lamps.length=0;
 for(let j=0;j<NY;j++)for(let i=0;i<NX-1;i++)for(let x=XS[i]+90;x<XS[i+1]-60;x+=150){lamps.push({x,y:YS[j]-HALF-6},{x:x+75,y:YS[j]+HALF+6})}
 for(let i=0;i<NX;i++)for(let j=0;j<NY-1;j++)for(let y=YS[j]+90;y<YS[j+1]-60;y+=140){if(i===CANAL_I)continue;lamps.push({x:XS[i]-HALF-6,y},{x:XS[i]+HALF+6,y:y+70})}
 for(const l of lamps){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(l.x+1,l.y+1,11,2);g.fillStyle='#3d424a';g.beginPath();g.arc(l.x,l.y,3.3,0,TAU);g.fill();g.fillStyle='#f3e7b8';g.beginPath();g.arc(l.x,l.y,1.4,0,TAU);g.fill()}
 drawBuildingsStatic();
}
const lamps=[];
function drawBuildingsStatic(){
 let b;
 // bomba
 b=B.bomba;g.fillStyle='#c9c4b9';g.fillRect(b.x0,b.y0,b.w,b.h);
 g.fillStyle='#e8e3d8';g.fillRect(b.x0+275,b.y0+30,60,b.h-50);g.strokeStyle='#2b2f36';g.lineWidth=3;g.strokeRect(b.x0+275,b.y0+30,60,b.h-50);
 sign(g,'SHOP',b.x0+280,b.y0+b.h/2-12,50,24,'#2b2f36','#fff',16);
 g.fillStyle='#8d8a84';for(const x of [120,215]){g.fillRect(b.x0+x-34,b.y0+106,70,12)}
 g.fillStyle='#d23a2a';for(const x of [120,215]){g.fillRect(b.x0+x-6,b.y0+104,12,16)}
 g.fillStyle='#2b2f36';rrect(g,b.x0+8,b.y0+b.h-60,62,52,4);g.fill();
 g.font="700 11px 'Barlow Condensed', sans-serif";g.textAlign='left';g.textBaseline='alphabetic';g.fillStyle='#ffb36b';g.fillText('DIESEL',b.x0+13,b.y0+b.h-44);g.fillText('REGULAR',b.x0+13,b.y0+b.h-22);
 g.fillStyle='#fff';g.font="700 12px 'JetBrains Mono', monospace";g.fillText('$3.89',b.x0+13,b.y0+b.h-31);g.fillText('$3.49',b.x0+13,b.y0+b.h-10);
 // oficina
 b=B.oficina;shed(b.x0+6,b.y0+62,b.w-12,b.h-68,'#9fa3a9');
 g.fillStyle='#d6d1c6';g.fillRect(b.x0+20,b.y0+58,b.w-40,8);
 for(const s of b.slots){g.fillStyle='#e8b931';g.fillRect(s.x-12,s.y-22,4,44);g.fillRect(s.x+8,s.y-22,4,44);g.strokeStyle='rgba(30,30,30,.35)';g.lineWidth=1;g.strokeRect(s.x-22,s.y-30,44,60)}
 g.fillStyle='#c0392b';g.fillRect(b.x0+10,b.y0+b.h-24,b.w-20,14);
 for(let k=0;k<14;k++){g.fillStyle=k%2?'#8b939c':'#6b737c';g.fillRect(b.x0+16+k*23,b.y0+b.h-22,14,10)}
 // stand
 b=B.stand;g.fillStyle='#d9d5cd';g.fillRect(b.x0,b.y0,b.w,b.h);
 g.fillStyle='#b8cfdc';g.fillRect(b.x0+16,b.y0+86,b.w-32,b.h-96);g.strokeStyle='#e9f3f8';g.lineWidth=4;g.strokeRect(b.x0+16,b.y0+86,b.w-32,b.h-96);
 // fabrica
 b=B.fabrica;g.fillStyle='#bdb8ae';g.fillRect(b.x0,b.y0,b.w,b.h);
 shed(b.x0+8,b.y0+8,b.w-16,b.h-86,'#8e949c');
 for(let x=b.x0+12;x<b.x0+b.w-16;x+=22){g.fillStyle='#a9b0b8';g.fillRect(x,b.y0+10,12,b.h-90);g.fillStyle='#6e757d';g.fillRect(x+12,b.y0+10,10,b.h-90)}
 g.fillStyle='#5b4a3a';g.beginPath();g.arc(b.x0+b.w-48,b.y0+30,14,0,TAU);g.fill();g.fillStyle='#2b2f36';g.beginPath();g.arc(b.x0+b.w-48,b.y0+30,8,0,TAU);g.fill();
 // lavagem
 b=B.lavagem;g.fillStyle='#cfd6d9';g.fillRect(b.x0,b.y0,b.w,b.h);
 for(const s of b.slots){g.fillStyle='#2f6f8f';g.fillRect(s.x-60,s.y-30,120,6);g.fillRect(s.x-60,s.y+24,120,6)}
 // park
 b=B.park;{const x0=b.x0,y0=b.y0,w=b.w,h=b.h;g.fillStyle=XMAS?'#e9eff5':'#6fa34e';g.fillRect(x0,y0,w,h);g.fillStyle='rgba(255,255,255,.05)';for(let k=0;k<w;k+=24)g.fillRect(x0+k,y0,12,h);
  g.strokeStyle='#e3d6b4';g.lineWidth=14;g.lineJoin='round';rrect(g,x0+26,y0+26,w-52,h-52,40);g.stroke();
  g.beginPath();g.moveTo(x0+w/2,y0);g.lineTo(x0+w/2,y0+26);g.stroke();g.beginPath();g.moveTo(x0+26,y0+h/2);g.lineTo(x0+w-26,y0+h/2);g.stroke();
  g.fillStyle='#4f9bd1';g.beginPath();g.ellipse(x0+w*.3,y0+h*.3,44,24,0,0,TAU);g.fill();g.strokeStyle='#d8cfb4';g.lineWidth=4;g.stroke();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(x0+w*.3-12,y0+h*.3-6,16,6,0,0,TAU);g.fill();
  g.fillStyle='#d8cfb4';g.beginPath();g.arc(x0+w/2,y0+h/2,26,0,TAU);g.fill();g.fillStyle='#62b3e6';g.beginPath();g.arc(x0+w/2,y0+h/2,18,0,TAU);g.fill();g.fillStyle='#ffffff';g.beginPath();g.arc(x0+w/2,y0+h/2,5,0,TAU);g.fill();
  g.fillStyle='#e6b25a';g.fillRect(x0+w*.66,y0+h*.62,70,46);g.fillStyle='#d93a2f';g.fillRect(x0+w*.66+8,y0+h*.62+6,20,34);g.fillStyle='#2f6fd9';g.fillRect(x0+w*.66+40,y0+h*.62+8,22,8);g.fillRect(x0+w*.66+40,y0+h*.62+26,22,8);
  g.fillStyle='#7a5a3a';for(const[bx,by]of[[x0+70,y0+h/2-16],[x0+w-110,y0+h/2-16],[x0+w/2+40,y0+40],[x0+w/2-80,y0+h-56]])g.fillRect(bx,by,32,8);
  for(const[tx,ty,r]of[[x0+14,y0+14,13],[x0+w-16,y0+16,14],[x0+16,y0+h-16,14],[x0+w-18,y0+h-18,13],[x0+w*.12,y0+h*.62,15],[x0+w*.55,y0+h*.78,13],[x0+w*.82,y0+h*.28,15],[x0+w*.62,y0+h*.22,11],[x0+w*.2,y0+h*.85,11]])tree(tx,ty,r);
  sign(g,'MOTOROPOLIS PARK',x0+w/2-80,y0+4,160,22,'#2e7d4f','#ffffff',16)}
 // newsroom: Motoropolis Daily + kiosk plaza
 b=B.news;{const x0=b.x0,y0=b.y0,w=b.w,h=b.h;g.fillStyle='#d9d1c0';g.fillRect(x0,y0,w,h);g.strokeStyle='rgba(0,0,0,.06)';g.lineWidth=1;g.beginPath();for(let k=x0+18;k<x0+w;k+=18){g.moveTo(k,y0);g.lineTo(k,y0+h)}for(let k=y0+18;k<y0+h;k+=18){g.moveTo(x0,k);g.lineTo(x0+w,k)}g.stroke();
  shed(x0+128,y0+62,w-140,h-72,'#9aa0a8');g.fillStyle='#1f3a2c';g.fillRect(x0+123,y0+57,w-130,14);
  sign(g,'MOTOROPOLIS DAILY',x0+128,y0+20,w-140,30,'#d93a2f','#ffffff',20);
  const kx=x0+58,ky=y0+86;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(kx+4,ky+5,30,0,TAU);g.fill();g.fillStyle='#2e7d4f';g.beginPath();for(let k=0;k<8;k++){const a=k*TAU/8+TAU/16;g.lineTo(kx+Math.cos(a)*30,ky+Math.sin(a)*30)}g.closePath();g.fill();
  g.fillStyle='#246640';g.beginPath();g.arc(kx,ky,18,0,TAU);g.fill();g.fillStyle='#ffd34d';g.beginPath();g.arc(kx,ky,5,0,TAU);g.fill();
  g.fillStyle='#ffffff';g.font="800 13px 'Barlow Condensed', sans-serif";g.textAlign='center';g.textBaseline='middle';g.fillText('NEWS',kx,ky+44);
  g.fillStyle='#7a5a3a';g.fillRect(x0+18,y0+h-40,40,9);g.fillRect(x0+70,y0+h-40,40,9);tree(x0+22,y0+22,12);tree(x0+100,y0+h-70,11)}
 // police station
 b=B.police;{const x0=b.x0,y0=b.y0,w=b.w,h=b.h;g.fillStyle='#c9c4b9';g.fillRect(x0,y0,w,h);
  g.strokeStyle='#f4f1e6';g.lineWidth=2;for(const x of[14,70,126])g.strokeRect(x0+x,y0+92,0.1,52);g.fillStyle='rgba(47,111,217,.35)';g.fillRect(x0+18,y0+150,104,6);
  shed(x0+150,y0+20,w-162,h-32,'#8f949b');g.fillStyle='#1d4fb8';g.fillRect(x0+145,y0+15,w-152,12);
  sign(g,'POLICE',x0+170,y0+h/2-16,w-200,32,'#1d4fb8','#ffffff',24);g.fillStyle='#ffffff';g.beginPath();g.arc(x0+150+(w-162)/2,y0+h-40,10,0,TAU);g.fill();g.fillStyle='#1d4fb8';g.beginPath();g.arc(x0+150+(w-162)/2,y0+h-40,6,0,TAU);g.fill()}
 // courthouse
 b=B.court;{const x0=b.x0,y0=b.y0,w=b.w,h=b.h;g.fillStyle='#d9d1c0';g.fillRect(x0,y0,w,h);
  g.fillStyle='#e9e5dc';g.fillRect(x0+60,y0+10,w-120,40);g.strokeStyle='#b9b2a3';g.lineWidth=1;for(let k=0;k<4;k++){g.beginPath();g.moveTo(x0+60,y0+18+k*9);g.lineTo(x0+w-60,y0+18+k*9);g.stroke()}
  shed(x0+40,y0+60,w-80,h-72,'#b9a27c');g.fillStyle='#f4f1e6';for(let k=0;k<6;k++){g.beginPath();g.arc(x0+70+k*((w-140)/5),y0+56,7,0,TAU);g.fill()}
  sign(g,'COURTHOUSE',x0+w/2-80,y0+h/2,160,30,'#4a3412','#ffd34d',22);g.fillStyle='#e8b931';g.font="800 26px 'Barlow Condensed', sans-serif";g.textAlign='center';g.textBaseline='middle';g.fillText('⚖',x0+w/2,y0+h/2+52);
  tree(x0+18,y0+20,12);tree(x0+w-18,y0+20,12)}
 // pista
 b=B.pista;g.fillStyle='#6f9a4f';g.fillRect(b.x0,b.y0,b.w,b.h);
 const cx=b.x0+b.w/2,cy=b.y0+b.h/2,ax=b.w/2-26,ay=b.h/2-24;
 g.lineWidth=30;g.strokeStyle='#40454d';g.beginPath();g.ellipse(cx,cy,ax,ay,0,0,TAU);g.stroke();
 g.lineWidth=4;g.setLineDash([10,10]);g.strokeStyle='#e33b2e';g.beginPath();g.ellipse(cx,cy,ax+15,ay+15,0,0,TAU);g.stroke();g.beginPath();g.ellipse(cx,cy,ax-15,ay-15,0,0,TAU);g.stroke();
 g.strokeStyle='#fff';g.lineDashOffset=10;g.beginPath();g.ellipse(cx,cy,ax+15,ay+15,0,0,TAU);g.stroke();g.beginPath();g.ellipse(cx,cy,ax-15,ay-15,0,0,TAU);g.stroke();g.setLineDash([]);g.lineDashOffset=0;
 for(let k=0;k<6;k++){g.fillStyle=k%2?'#fff':'#111';g.fillRect(cx+ax-15+k*5,cy-3,5,6)}
 // pecas
 b=B.pecas;shed(b.x0+12,b.y0+60,210,b.h-72,'#b9b2a6');
 for(let r=0;r<3;r++)for(let k=0;k<7;k++){g.fillStyle='#55504a';g.fillRect(b.x0+24+k*28,b.y0+80+r*42,22,30)}
 for(let k=0;k<5;k++)for(let r=0;r<2;r++){g.fillStyle='#1f2227';g.beginPath();g.arc(b.x0+240+k*16,b.y0+b.h-40+r*-16,8,0,TAU);g.fill();g.fillStyle='#555';g.beginPath();g.arc(b.x0+240+k*16,b.y0+b.h-40+r*-16,3,0,TAU);g.fill()}
 // pneus
 b=B.pneus;shed(b.x0+10,b.y0+90,b.w-20,b.h-100,'#a3a6ab');
 for(let k=0;k<12;k++){g.fillStyle='#1f2227';g.beginPath();g.arc(b.x0+22+k*27,b.y0+70,10,0,TAU);g.fill();g.fillStyle='#4a4d52';g.beginPath();g.arc(b.x0+22+k*27,b.y0+70,4,0,TAU);g.fill()}
 // reboques
 b=B.reboques;g.fillStyle='#b5ad9d';g.fillRect(b.x0,b.y0,b.w,b.h);
 for(const s of b.slots){g.strokeStyle='#f2a51a';g.lineWidth=3;g.strokeRect(s.x-15,s.y-32,30,64)}
 g.fillStyle='#e8e3d8';g.fillRect(b.x0+b.w-70,b.y0+b.h-40,60,32);g.strokeStyle='#2b2f36';g.strokeRect(b.x0+b.w-70,b.y0+b.h-40,60,32);
 // inspecao
 b=B.inspecao;g.fillStyle='#d0cdc6';g.fillRect(b.x0,b.y0,b.w,b.h);shed(b.x0+130,b.y0+46,150,b.h-60,'#b4b9bf');
 for(const s of b.slots){for(let k=0;k<10;k++){g.fillStyle=k%2?'#111':'#e8b931';g.fillRect(s.x-70+k*14,s.y+20,14,5)}}
 // parque
 b=B.parque;g.fillStyle='#8f949b';g.fillRect(b.x0,b.y0,b.w,b.h);
 g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2;for(const s of b.slots){g.strokeRect(s.x-15,s.y-26,30,52)}
 // sucata
 b=B.sucata;g.fillStyle='#9a8a6e';g.fillRect(b.x0,b.y0,b.w,b.h);
 for(let k=0;k<40;k++){g.fillStyle='rgba(60,45,30,.25)';g.beginPath();g.arc(b.x0+R()*b.w,b.y0+R()*b.h,rr(4,14),0,TAU);g.fill()}
 g.fillStyle='#4b4f55';g.fillRect(b.slots[0].x-26,b.slots[0].y-36,52,72);g.fillStyle='#2b2f36';g.fillRect(b.slots[0].x-20,b.slots[0].y-30,40,60);
 // supermarket: store at the back, customer parking in front
 b=B.market;{const x0=b.x0,y0=b.y0,w=b.w,h=b.h;
  g.fillStyle='#8f949b';g.fillRect(x0,y0,w,h);
  g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=2;for(const s2 of b.slots)g.strokeRect(s2.x-15,s2.y-26,30,52);
  const bw=200,bh=126,bx=x0+(w-bw)/2,by=y0+h-bh-6;
  g.fillStyle='rgba(0,0,0,.18)';g.fillRect(bx+6,by+7,bw,bh);
  g.fillStyle='#e7eaec';g.fillRect(bx,by,bw,bh);
  g.fillStyle='#4fa3c7';g.fillRect(bx+12,by+6,bw-24,26);
  g.strokeStyle='#eaf4f8';g.lineWidth=3;for(let k=1;k<8;k++){g.beginPath();g.moveTo(bx+12+k*(bw-24)/8,by+6);g.lineTo(bx+12+k*(bw-24)/8,by+32);g.stroke()}
  g.fillStyle='#d6dade';g.fillRect(bx,by+bh-18,bw,18);
  sign(g,'SUPERMARKET',bx+bw/2-78,by+38,156,26,'#2e7d4f','#ffffff',19);
  g.fillStyle='#c9ccd0';for(const tx of [x0+w-62,x0+w-36]){g.fillRect(tx,y0+16,18,52);g.fillStyle='rgba(60,70,80,.45)';g.fillRect(tx+3,y0+20,12,44);g.fillStyle='#c9ccd0'}
  for(const [tx,ty] of [[x0+12,y0+12],[x0+w-14,y0+12],[x0+14,y0+h-14],[x0+w-16,y0+h-14]])tree(tx,ty,12);
  sign(g,'P',x0+8,y0+h-46,30,30,'#1d4fb8','#fff',22)}
}

