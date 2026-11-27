//@ view3d/labels.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- labels drawn on the HUD canvas ----------
 function pill(text,x,y,size,bg,fg,stroke){if(window.__HIDE&&window.__HIDE.some(n=>String(text).includes(n)))return;hctx.font=`700 ${size*=(HUDH===CH?HUDSC:1),size}px 'Barlow Condensed', sans-serif`;const w=hctx.measureText(text).width+size*.9,h=size*1.25;hctx.fillStyle=bg;rrect(hctx,x-w/2,y-h,w,h,h/2);hctx.fill();if(stroke){hctx.strokeStyle=stroke;hctx.lineWidth=2;hctx.stroke()}hctx.fillStyle=fg;hctx.fillText(text,x,y-h/2+1)}
 function drawLabels(){
  hctx.textAlign='center';hctx.textBaseline='middle';if(WORLD&&W3.labelsDraw)W3.labelsDraw();if(WORLD&&W3.dragDraw)W3.dragDraw();if(WORLD&&W3.fish&&cam.dist<220&&mode!=='in'){const F=W3.fish.g.position,q=toHud(F.x,3.2,F.z);if(q)pill('★ Kongcringe · FISHERMAN',q.x,q.y,clamp(2000/cam.dist,12,20),'rgba(46,139,87,.95)','#ffffff')}const sz=clamp(2600/cam.dist,13,26),near=cam.dist<200;
  const items=[];
  if(near)peds.forEach((p,k)=>{if(!p.name)return;const g=pedMeshes[k];items.push({w:g.position,h:2.25,t:p.name+(jobOf(p.name)?' · '+jobOf(p.name).toUpperCase():''),kind:'p'})});
  for(const c of cars){if(!c.driver||c.hidden||c.removed||c===selected)continue;const g=meshes.get(c.id);if(g&&near)items.push({w:g.position,h:2.1,t:'★ '+c.driver,kind:'d'})}
  const cp=camera.position;for(const it of items)it.d=Math.hypot(it.w.x-cp.x,it.w.y-cp.y,it.w.z-cp.z);items.sort((a,b)=>a.d-b.d);
  let shown=0;for(const it of items){if(shown>=(X?14:36))break;if(X&&it.d>150)continue;const s=toHud(it.w.x,it.w.y+it.h,it.w.z);if(!s||s.x<-50||s.x>CW+50||s.y<0||s.y>CH)continue;shown++;
   const a=clamp(1.6-it.d/170,.35,1);hctx.globalAlpha=a;if(it.kind==='p')pill(it.t,s.x,s.y,sz,'rgba(16,19,24,.85)','#ffd34d');else pill(it.t,s.x,s.y,sz*.92,'rgba(255,122,26,.92)','#1d0f02')}
  hctx.globalAlpha=1;
  for(const c of cars){if(!(c.newT>0)||c.hidden)continue;const g=meshes.get(c.id);if(!g)continue;const s=toHud(g.position.x,g.position.y+2.6,g.position.z);if(!s)continue;const k=c.newT/6;hctx.globalAlpha=k;hctx.font="800 22px 'Barlow Condensed', sans-serif";hctx.fillStyle='#5cc98a';hctx.strokeStyle='rgba(16,19,24,.9)';hctx.lineWidth=4;hctx.strokeText('+1 SUB',s.x,s.y-(1-k)*14);hctx.fillText('+1 SUB',s.x,s.y-(1-k)*14)}
  hctx.globalAlpha=1;
  if(crime){const c=crime.car,g=meshes.get(c.id);const s=g&&toHud(g.position.x,g.position.y+3,g.position.z);if(s)pill(`STOLEN · ${crime.thief}`,s.x,s.y,sz,'rgba(217,58,47,.95)','#fff');for(const p of crime.cops){const gp=meshes.get(p.id);const sp=gp&&toHud(gp.position.x,gp.position.y+3,gp.position.z);if(sp)pill(p.driver?`🚔 ${p.driver}`:'🚔 POLICE',sp.x,sp.y,sz*.9,'rgba(29,79,184,.95)','#fff')}}
  if(selected&&!selected.removed&&!selected.hidden){const g=meshes.get(selected.id);const s=g&&toHud(g.position.x,g.position.y+2.4,g.position.z);if(s){hctx.font="700 16px 'JetBrains Mono', monospace";const t=selected.plate,w=hctx.measureText(t).width+20;hctx.fillStyle='#fafafa';rrect(hctx,s.x-w/2,s.y-28,w,26,4);hctx.fill();hctx.strokeStyle='#111';hctx.lineWidth=2;hctx.stroke();hctx.fillStyle='#111';hctx.fillText(t,s.x,s.y-14.5);
   if(selected.driver)pill('★ '+selected.driver,s.x,s.y-34,17,'rgba(255,122,26,.95)','#1d0f02')}}
  const LP0=(b,x,y,h)=>{const p=lotPt(b,x,y);return toHud(U(p.x),h,U(p.y))};
  // "STEP INSIDE …" boards only when zoomed in (camera closer than ~300 m; the city opens at 760) and the building is
  // within ~120 m of the point the camera looks at (full up to 100 m, gone by 140 m); the repair shop's board always stays
  const zk=clamp((340-cam.dist)/60,0,1);
  const LP=(b,x,y,h)=>{if(zk<=0)return null;const p=lotPt(b,x,y),wx=U(p.x),wz=U(p.y),k=zk*clamp((140-Math.hypot(wx-cam.tx,wz-cam.tz))/40,0,1);if(k<=0)return null;const s=toHud(wx,h,wz);if(s)s.k=k;return s};
  if(!trailer){const O=B.oficina,s=LP0(O,O.x0+O.w/2,O.y0+O.h*.55,11.5);if(s){hctx.globalAlpha=.82+.18*Math.sin(simTime*3);pill('CLICK TO STEP INSIDE ▶',s.x,s.y,clamp(2300/cam.dist,13,22),'#22252b','#ffffff','#ff7a1a');hctx.globalAlpha=1}
   if(isOpen('lavagem')){const Lw=B.lavagem,s2=LP(Lw,Lw.x0+Lw.w/2,Lw.y0+Lw.h/2,8);if(s2){hctx.globalAlpha=(.82+.18*Math.sin(simTime*3+1))*s2.k;pill('STEP INSIDE THE CAR WASH ▶',s2.x,s2.y,clamp(2300/cam.dist,13,22),'#22252b','#ffffff','#46c8ff');hctx.globalAlpha=1}}
   if(isOpen('reboques')){const Rb=B.reboques,s3=LP(Rb,Rb.x0+Rb.w/2,Rb.y0+Rb.h*.7,9);if(s3){hctx.globalAlpha=(.82+.18*Math.sin(simTime*3+2))*s3.k;pill('STEP INSIDE THE TOW DEPOT ▶',s3.x,s3.y,clamp(2300/cam.dist,13,22),'#22252b','#ffffff','#f2a51a');hctx.globalAlpha=1}}}
   {const LBLS={bomba:['STEP INSIDE THE GAS STATION ▶','#d93a2f',7.5,.55],pneus:['STEP INSIDE THE TIRE SHOP ▶','#9aa3ae',9,.7],inspecao:['STEP INSIDE THE INSPECTION CENTER ▶','#1d4fb8',7,.5],parque:['STEP INSIDE THE PARKING ▶','#1d4fb8',4,.5],pecas:['STEP INSIDE AUTO PARTS ▶','#c0392b',8,.5],stand:['STEP INSIDE THE DEALERSHIP ▶','#ff7a1a',8,.5],sucata:['STEP INSIDE THE JUNKYARD ▶','#a08a66',6,.5],fabrica:['STEP INSIDE THE FACTORY ▶','#ff7a1a',10,.4],market:['STEP INSIDE THE SUPERMARKET ▶','#2e7d4f',9,.78],pista:['STEP INSIDE THE PIT GARAGE ▶','#ff7a1a',4,.5]};
    for(const k in LBLS){if(!isOpen(k))continue;const L=LBLS[k],b=B[k],sp=LP(b,b.x0+b.w/2,b.y0+b.h*L[3],L[2]);if(sp){hctx.globalAlpha=(.82+.18*Math.sin(simTime*3+k.length))*sp.k;pill(L[0],sp.x,sp.y,clamp(2300/cam.dist,13,22),'#22252b','#ffffff',L[1]);hctx.globalAlpha=1}}
    if(WORLD&&W3.homeLabels)W3.homeLabels(zk); // subscribers' homes (interiors/home.js): STEP INSIDE for the nearest one, a few ★ names when close
    {for(const[t2,lab,col,hh]of[['police','STEP INSIDE THE POLICE STATION ▶','#1d4fb8',9.4],['court','STEP INSIDE THE COURTHOUSE ▶','#8a6a2c',12]]){const Lc=LOT[t2],sp=LP(Lc.b,Lc.cx*10,(Lc.cz-2)*10,hh);if(sp){hctx.globalAlpha=(.82+.18*Math.sin(simTime*3+t2.length))*sp.k;pill(lab,sp.x,sp.y,clamp(2300/cam.dist,13,22),'#22252b','#ffffff',col);hctx.globalAlpha=1}}}
    {const Ln=LOT.news,sp=LP(Ln.b,(Ln.cx+3)*10,(Ln.cz-2)*10,10.6);if(sp){hctx.globalAlpha=(.82+.18*Math.sin(simTime*3+5))*sp.k;pill('STEP INSIDE MOTOROPOLIS DAILY ▶',sp.x,sp.y,clamp(2300/cam.dist,13,22),'#22252b','#ffffff','#2e7d4f');hctx.globalAlpha=1}}}
 }
