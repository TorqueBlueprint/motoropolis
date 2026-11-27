//@ interiors/_life.js - LIFE: people moving inside each interior (wraps INTS[k].sync/labels)
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- people inside the buildings ----------
 function pathPos(pts,u){let tot=0;const seg=[];for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(d);tot+=d}
  let d=clamp(u,0,1)*tot;for(let i=0;i<seg.length;i++){if(d<=seg[i]||i===seg.length-1){const k=seg[i]?clamp(d/seg[i],0,1):0,a=pts[i],b=pts[i+1];return{x:a[0]+(b[0]-a[0])*k,z:a[1]+(b[1]-a[1])*k,ang:Math.atan2(b[0]-a[0],b[1]-a[1])}}d-=seg[i]}return{x:pts[0][0],z:pts[0][1],ang:0}}
 function putP(m,p,moving,ang){m.position.set(p.x,0,p.z);m.rotation.y=ang!=null?ang:p.ang;const rg0=!!m.userData.rig,ph=simTime*(rg0?6.5:9)+(m.userData.ph||0),sw=moving?Math.sin(ph)*.55:0,rg=walkPose(m,ph,moving);if(!rg){m.userData.legs[0].rotation.x=sw;m.userData.legs[1].rotation.x=-sw}m.position.y=moving?Math.abs(Math.sin(ph))*(rg?.02:.06):0}
 // a looping errand: walk the path there, wait, walk back, wait
 function loopP(m,pts,period,off,wait){const ph=((simTime/period)+off)%1,w=wait||.2,go=(1-2*w)/2;
  if(ph<go)putP(m,pathPos(pts,ph/go),true);else if(ph<go+w)putP(m,pathPos(pts,1),false);else if(ph<2*go+w)putP(m,pathPos([...pts].reverse(),(ph-go-w)/go),true);else putP(m,pathPos(pts,0),false)}
 const SKINS=['#f1c7a5','#d9a27e','#a8714f','#7a4b32','#f5d3b8'],SHIRTS=['#ff7a1a','#2f6fd9','#5cc98a','#e8b931','#d93a2f','#7a3fb0','#3fa7c4','#f2f2ee'];
 function mkP(S,col,i,job){const m=personMesh(col||SHIRTS[i%SHIRTS.length],SKINS[i%SKINS.length],['#2b1d14','#5a3a22','#111','#c9a25a'][i%4]);m.scale.setScalar(1.5);m.userData.ph=i*1.7;S.add(m);return upgP(m,job,i)}
 const nameOf=c=>c?(c.driver?'★ '+c.driver:'DRIVER '+c.plate):'';
 function tag(x,y,z,t,bg,fg){const p=toHud(x,y,z);if(p)pill(t,p.x,p.y,clamp(1000/cam.dist,13,22),bg||'rgba(16,19,24,.85)',fg||'#ffd34d')}
 const LIFE={};
 // GAS STATION: drivers get out at the pump, walk in, pay and walk back
 LIFE.bomba={sync(){const S=GS.S;if(!GS.L){GS.L={drv:[0,1,2,3].map(i=>mkP(S,null,i+3,'civ')),shop:[0,1].map(i=>mkP(S,null,i+10,'civ'))}}const L=GS.L;
   loopP(L.shop[0],[[-20,6],[-12,-.2],[-6,-1],[6,-1.8]],22,0,.25);loopP(L.shop[1],[[-4,7],[-16,3.8],[-18,-8],[9,-1.8]],27,.5,.2);
   B.bomba.slots.forEach((s,k)=>{const m=L.drv[k];const c=s.car&&s.car.state==='service'?s.car:null;m.visible=!!c;m.userData.c=c;if(!c)return;
    const x=[2,10,14,22][k],z=k<2?13:17,path=[[x,z-1.6],[12,11],[12,9.5],[8+(k-1.5)*.9,-1.8]];const kk=clamp(1-c.timer/(c.svcTotal||12),0,1);m.userData.k=kk;
    if(kk<.38)putP(m,pathPos(path,kk/.38),true);else if(kk<.62)putP(m,pathPos(path,1),false,Math.PI);else if(kk<.97)putP(m,pathPos([...path].reverse(),(kk-.62)/.35),true);else m.visible=false})},
  labels(){const L=GS.L;if(!L)return;for(const m of L.drv){if(!m.visible)continue;const c=m.userData.c,k=m.userData.k;tag(m.position.x,3.4,m.position.z,nameOf(c),c&&c.driver?'rgba(255,122,26,.95)':undefined,c&&c.driver?'#1d0f02':undefined);
   if(k>.4&&k<.62){const gal=Math.max(1,(100-c.fuel)*.13);tag(8,4.6,-4,k<.55?'PAYING…':`PAID $${(gal*3.49).toFixed(2)} ✓`,'rgba(92,201,138,.95)','#071a2d')}}}};
 // REPAIR SHOP: its people (mechanics, receptionist, customers) live in interiors/oficina.js with the job timetable
 // CAR WASH: an attendant guides each car in
 LIFE.lavagem={sync(){const S=WS.scene;if(!WS.L)WS.L={a:[mkP(S,'#3fa7c4',40,'Wash Attendant'),mkP(S,'#3fa7c4',41,'Wash Attendant')],p:mkP(S,null,42,'civ')};WS.lanes.forEach((L,k)=>{const m=WS.L.a[k];const x=L.id?L.car.position.x-5:-22;putP(m,{x:clamp(x,-23,-15),z:L.z+(k?3.2:-3.2),ang:Math.PI/2},!!L.id&&x>-23&&x<-15)});loopP(WS.L.p,[[-23.5,7],[-23.5,9.5],[-18,9.5]],18,0,.3)},
  labels(){if(!WS.L)return;WS.L.a.forEach((m,k)=>{if(WS.lanes[k].id)tag(m.position.x,3.3,m.position.z,'COME FORWARD…','rgba(63,167,196,.95)','#062a36')})}};
 // TOW DEPOT: drivers wait by their truck, run when a call comes in
 LIFE.reboques={sync(){const S=TW.scene;if(!TW.L)TW.L=[0,1,2].map(i=>mkP(S,'#f2a51a',50+i,'Tow Truck Driver'));B.reboques.slots.forEach((s,k)=>{const m=TW.L[k],bay=TW.bays[k];m.visible=!!bay.id;if(bay.id)loopP(m,[[bay.x+3,-1],[bay.x+3,1.5],[17,3.5]],20+k*3,k*.3,.3)})},labels(){}};
 // TIRE SHOP: mechanics roll wheels to the balancer
 LIFE.pneus={sync(){const S=TS.S;if(!TS.L)TS.L={m:[0,1,2].map(i=>mkP(S,'#22252b',60+i,'Tire Technician')),c:[0,1,2].map(i=>mkP(S,null,63+i,'civ'))};
   B.pneus.slots.forEach((s,k)=>{const x=[-8,3,14][k],busy=s.car&&s.car.state==='service';const m=TS.L.m[k];if(busy)loopP(m,[[x-2.6,0],[x+4.4,1.4]],6,k*.3,.25);else putP(m,{x:x+3,z:-6,ang:0},false);
    const cu=TS.L.c[k];cu.visible=!!busy;if(busy)putP(cu,{x:-22+k*1.6,z:8,ang:Math.PI},false);cu.userData.c=busy?s.car:null})},
  labels(){if(!TS.L)return;for(const m of TS.L.c)if(m.visible)tag(m.position.x,3.3,m.position.z,nameOf(m.userData.c)+' · WAITING')}};
 // INSPECTION: the inspector walks round each car and gives a verdict
 LIFE.inspecao={sync(){const S=IC.S;if(!IC.L)IC.L=[mkP(S,'#e8b931',70,'Inspector'),mkP(S,'#e8b931',71,'Inspector')];IC.insp.visible=false;
   B.inspecao.slots.forEach((s,k)=>{const m=IC.L[k],z=k?4:-4,c=s.car&&s.car.state==='service'?s.car:null;m.userData.c=c;if(c){const a=simTime*1.2+k*3;putP(m,{x:-2+Math.cos(a)*4.2,z:z+Math.sin(a)*2.6,ang:a+Math.PI},true);m.userData.k=1-c.timer/(c.svcTotal||5)}else putP(m,{x:12,z:z>0?6:-6,ang:0},false)})},
  labels(){if(!IC.L)return;for(const m of IC.L){const c=m.userData.c;if(c&&m.userData.k>.7)tag(-2,4.6,m.position.z>0?4:-4,c.health<55?'FAIL ✗':'PASS ✓',c.health<55?'rgba(255,90,79,.95)':'rgba(92,201,138,.95)','#071a2d')}}};
 // PARKING: drivers walk to the exit after parking and come back before leaving
 LIFE.parque={sync(){const S=PK.S;if(!PK.L)PK.L=[...Array(10)].map((_,i)=>mkP(S,null,80+i,'civ'));
   B.parque.slots.forEach((s,k)=>{const m=PK.L[k],c=s.car&&s.car.state==='service'?s.car:null,h=PK.h[k];m.userData.c=c;if(!c){m.visible=false;return}
    const el=(c.svcTotal||20)-c.timer,p=[[h.g.position.x+2,h.g.position.z],[h.g.position.x+2,-1],[24,9]];
    if(el<4){m.visible=true;putP(m,pathPos(p,el/4),true)}else if(c.timer<4){m.visible=true;putP(m,pathPos([...p].reverse(),1-c.timer/4),true)}else m.visible=false})},
  labels(){if(!PK.L)return;for(const m of PK.L)if(m.visible)tag(m.position.x,3.3,m.position.z,nameOf(m.userData.c))}};
 // AUTO PARTS: workers carry boxes to the counter
 LIFE.pecas={sync(){const S=PW.S;if(!PW.L){PW.L=[0,1,2].map(i=>mkP(S,'#c0392b',90+i,'Warehouse Worker'));PW.L.forEach(m=>{const b=box(.8,.6,.8,M(0xc79a62),0,1.3,.5,false);m.add(b)})}
   PW.L.forEach((m,k)=>loopP(m,[[-18+k*12,-6.5],[-18+k*12,-1.5],[16,4.6]],16+k*3,k*.33,.15))},labels(){}};
 // DEALERSHIP: customers browse the cars, the salesman follows
 LIFE.stand={sync(){const S=DS.S;if(!DS.L)DS.L={c:[0,1,2].map(i=>mkP(S,null,100+i,'civ')),s:mkP(S,'#22252b',104,'Car Salesman')};
   DS.L.c.forEach((m,k)=>{const a=simTime*.35+k*2.1,cx=[-15,-5,5,15][(Math.floor(simTime/12)+k)%4];putP(m,{x:cx+Math.cos(a)*4.4,z:-2+Math.sin(a)*4.4,ang:a+Math.PI},true)});
   const t=DS.L.c[0];putP(DS.L.s,{x:t.position.x+1.4,z:t.position.z+1.2,ang:t.rotation.y},true)},
  labels(){if(DS.L)tag(DS.L.s.position.x,3.4,DS.L.s.position.z,'SALESMAN','rgba(255,122,26,.95)','#1d0f02')}};
 // JUNKYARD / FACTORY / PITS: workers at their stations
 LIFE.sucata={sync(){const S=JY.S;if(!JY.L)JY.L=[mkP(S,'#e8b931',110,'Crusher Operator'),mkP(S,'#e8b931',111,'Crusher Operator')];loopP(JY.L[0],[[-1,4],[4,4]],10,0,.3);loopP(JY.L[1],[[8,8],[18,8]],14,.4,.3)},labels(){}};
 LIFE.fabrica={sync(){const S=FC.S;if(!FC.L)FC.L=[0,1,2,3,4].map(i=>mkP(S,'#2f6fd9',120+i,'Assembly Worker'));FC.L.forEach((m,k)=>loopP(m,[[-18+k*8,-.2],[-15+k*8,-.2]],5+k,k*.2,.3))},labels(){}};
 LIFE.pista={sync(){const S=RT.S;if(!RT.L)RT.L=[0,1,2].map(i=>mkP(S,'#d93a2f',130+i,'Pit Crew'));const pit=Math.floor(simTime/15)%3,ph=(simTime%15)/15;
   RT.L.forEach((m,k)=>{const x=-16+pit*10;if(ph<.4)putP(m,{x:x+[-2.6,2.6,0][k],z:-3+[0,0,3.6][k],ang:[Math.PI/2,-Math.PI/2,Math.PI][k]},false);else putP(m,{x:-20+k*2,z:5,ang:Math.PI},false)})},
  labels(){if(!RT.L)return;const pit=Math.floor(simTime/15)%3,ph=(simTime%15)/15;if(ph<.4)tag(-16+pit*10,4.6,-3,`PIT STOP · #${race[pit].num}`,'rgba(255,122,26,.95)','#1d0f02')}};
 for(const k in LIFE){const it=INTS[k];if(!it)continue;const s0=it.sync,l0=it.labels;it.sync=dt=>{s0(dt);LIFE[k].sync(dt)};it.labels=()=>{l0();LIFE[k].labels()}}

