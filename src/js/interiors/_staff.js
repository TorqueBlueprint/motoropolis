//@ interiors/_staff.js - XTRA: job tags and extra staff inside interiors (wraps INTS[k].sync/labels)
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // job tags: who works where, inside every building
 function staffTag(m,b,title,k,y){if(!m||!m.visible)return;const n=staffOf(b,title,k);tag(m.position.x,y||3.9,m.position.z,n?`★ ${n} · ${title.toUpperCase()}`:`${title.toUpperCase()} · JOB OPEN`,n?'rgba(46,139,87,.95)':'rgba(16,19,24,.8)',n?'#fff':'#9aa3ae')}
 const XTRA={bomba:{sync(){if(!GS.att){GS.att=mkP(GS.S,'#d93a2f',150,'Fuel Attendant')}loopP(GS.att,[[0,11.5],[24,11.5]],16,0,.25)},labels(){staffTag(GS.cashier,'bomba','Cashier',0);staffTag(GS.att,'bomba','Fuel Attendant',0)}},
  reboques:{sync(){},labels(){if(TW.L)TW.L.forEach((m,k)=>staffTag(m,'reboques','Tow Truck Driver',k));staffTag(TW.disp,'reboques','Dispatcher',0,4.2)}},
  pneus:{sync(){},labels(){if(TS.L)TS.L.m.forEach((m,k)=>staffTag(m,'pneus','Tire Technician',k))}},
  lavagem:{sync(){},labels(){if(WS.L)WS.L.a.forEach((m,k)=>staffTag(m,'lavagem','Wash Attendant',k,4.6))}},
  inspecao:{sync(){},labels(){if(IC.L)IC.L.forEach((m,k)=>staffTag(m,'inspecao','Inspector',k,4.6))}},
  parque:{sync(){if(!PK.att){PK.att=mkP(PK.S,'#1d4fb8',151,'Parking Attendant');putP(PK.att,{x:24,z:7.6,ang:Math.PI},false)}PK.att.rotation.y=Math.PI+Math.sin(simTime*.5)*.6},labels(){staffTag(PK.att,'parque','Parking Attendant',0)}},
  pecas:{sync(){},labels(){if(PW.L){staffTag(PW.L[0],'pecas','Warehouse Worker',0);staffTag(PW.L[1],'pecas','Warehouse Worker',1);staffTag(PW.L[2],'pecas','Parts Van Driver',0)}}},
  stand:{sync(){if(!DS.s2){DS.s2=mkP(DS.S,'#22252b',152,'Car Salesman')}const t=DS.L&&DS.L.c[1];if(t)putP(DS.s2,{x:t.position.x-1.4,z:t.position.z+1.2,ang:t.rotation.y},true)},labels(){if(DS.L)staffTag(DS.L.s,'stand','Car Salesman',0);staffTag(DS.s2,'stand','Car Salesman',1)}},
  sucata:{sync(){},labels(){if(JY.L)staffTag(JY.L[0],'sucata','Crusher Operator',0)}},
  fabrica:{sync(){},labels(){if(FC.L)FC.L.slice(0,4).forEach((m,k)=>staffTag(m,'fabrica','Assembly Worker',k))}},
  pista:{sync(){},labels(){if(RT.cars)RT.cars.forEach((c,k)=>{const n=staffOf('pista','Race Driver',k);tag(c.g.position.x,3.6,c.g.position.z,n?`★ ${n} · RACE DRIVER #${c.r.num}`:`RACE DRIVER #${c.r.num} · JOB OPEN`,n?'rgba(46,139,87,.95)':'rgba(16,19,24,.8)',n?'#fff':'#9aa3ae')});if(RT.L)RT.L.forEach((m,k)=>staffTag(m,'pista','Pit Crew',k))}}};
 for(const k in XTRA){const it=INTS[k];if(!it)continue;const s0=it.sync,l0=it.labels;it.sync=dt=>{s0(dt);XTRA[k].sync(dt)};it.labels=()=>{l0();XTRA[k].labels()}}
