//@ interiors/court.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== COURTHOUSE =====
 const CT={built:false,home:{...STD_HOME,yaw:0,tz:0,dist:42}};
 function buildCourt(){const R=room({title:'MOTOROPOLIS COURTHOUSE',titleW:22,sbg:'#4a3412',sfg:'#ffd34d',trim:0x8a6a2c,wall:0x5a4330,wall2:0x4a3626,floor:0xa88a62,h:12});CT.S=R.S;const wd=M(0x6b4a2b),wd2=M(0x8a6a2c);
  // judge's bench
  R.B2(12,3.2,3,wd,0,0,-8);R.B2(12.4,.2,3.2,wd2,0,3.2,-8);R.B2(3,3,.6,wd,0,3.4,-10.3);CT.judge=mkP(CT.S,'#111',190,'Judge');putP(CT.judge,{x:0,z:-8.9,ang:0},false);CT.judge.position.y=1.8;
  const sc=new T.Group();sc.add(box(.12,1.6,.12,M(0xe8b931,{metalness:.6}),0,0,0));sc.add(box(1.8,.1,.1,M(0xe8b931,{metalness:.6}),0,1.5,0));for(const dx of[-.8,.8]){const pn=new T.Mesh(new T.CylinderGeometry(.35,.22,.1,12),M(0xe8b931,{metalness:.6}));pn.position.set(dx,1.1,0);sc.add(pn)}sc.position.set(4.6,3.4,-7.4);R.add(sc);
  // witness box & clerk
  R.B2(3,2,2.4,wd,-9,0,-6);CT.clerk=mkP(CT.S,'#5a6472',191,'Court Clerk');putP(CT.clerk,{x:9,z:-6,ang:0},false);R.B2(3.4,1.4,2,wd,9,0,-4.6);
  // defense and prosecution tables
  CT.law=[];[[-7,1],[7,1]].forEach(([x,z],i)=>{R.B2(7,1.5,2.4,wd2,x,0,z);const m=mkP(CT.S,i?'#22252b':'#2b3a55',192+i,'Lawyer');putP(m,{x:x-1.5,z:z+2.2,ang:Math.PI},false);CT.law.push(m)});
  CT.def=mkP(CT.S,'#e8732a',194);putP(CT.def,{x:-4.5,z:3.2,ang:Math.PI},false);
  // public benches
  for(let r=0;r<2;r++)for(const x of[-12,12])R.B2(12,1,1.2,wd,x,0,8+r*2.8);CT.pub=[0,1,2,3,4,5].map(i=>{const m=mkP(CT.S,null,195+i,'civ');putP(m,{x:(i<3?-15:9)+(i%3)*3,z:9.4,ang:Math.PI},false);return m});
  R.B2(.2,1.2,5,wd2,0,0,8.6);CT.built=true}
 function syncCourt(){const cs=CASES[0];CT.def.visible=!!cs;CT.judge.rotation.y=Math.sin(simTime*.5)*.35;CT.law.forEach((m,k)=>{m.rotation.y=Math.PI+Math.sin(simTime*(.7+k*.3))*.5})}
 function labelsCourt(){staffTag(CT.judge,'court','Judge',0,6.2);staffTag(CT.clerk,'court','Court Clerk',0,4.4);CT.law.forEach((m,k)=>staffTag(m,'court','Lawyer',k,4.4));
  const cs=CASES[0];if(cs){tag(-4.5,4.4,3.2,`DEFENDANT: ${cs.thief}`,'rgba(232,115,42,.95)','#1d0f02');pill(cs.verdict?`CASE #${cs.no} · ${cs.verdict==='guilty'?'GUILTY':cs.verdict==='community'?'30 DAYS WASHING CARS':'NOT GUILTY'}`:`CASE #${cs.no} · MOTOROPOLIS vs ${cs.thief} · IN SESSION`,HUDW/2,150,24,cs.verdict==='free'?'rgba(46,139,87,.95)':'rgba(74,52,18,.95)','#ffd34d')}
  else pill('NO CASES TODAY · THE STREETS ARE CALM',HUDW/2,150,22,'rgba(16,19,24,.85)','#c8defa')
  header('INSIDE THE COURTHOUSE')}
