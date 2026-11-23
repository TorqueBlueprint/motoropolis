//@ interiors/police.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== POLICE STATION =====
 const PS={built:false,home:{...STD_HOME,yaw:.15}};
 function buildPolice(){const R=room({title:'MOTOROPOLIS POLICE DEPARTMENT',titleW:26,sbg:'#1d4fb8',trim:0x1d4fb8,wall:0x22303f,wall2:0x1b2734,floor:0x9aa3ad,h:14});PS.S=R.S;
  // holding cells on the left
  for(let k=0;k<2;k++){const cx=-20+k*8;R.B2(7.6,.2,6,mat.dark,cx,0,-7);for(let b=0;b<9;b++)R.B2(.12,5,.12,mat.steel,cx-3.4+b*.85,0,-4.1,false);R.B2(7.6,.2,.2,mat.steel,cx,5,-4.1,false);R.B2(2.4,.6,1.2,M(0x5a6472),cx-2,0,-9)}
  PS.cell=mkP(PS.S,'#e8732a',180);putP(PS.cell,{x:-20,z:-6.5,ang:0},false);PS.cell.visible=false;
  // desks with screens
  PS.cops=[];[[-2,2],[6,2],[14,2]].forEach(([x,z],i)=>{R.B2(5,1.5,2.4,M(0xe9e5dc),x,0,z);R.B2(1.8,1.1,.12,M(0x46c8ff,{emissive:0x46c8ff,emissiveIntensity:.5}),x-1,1.6,z-.6,false);R.B2(1.2,.9,.5,M(0x2b3440),x-1,0,z+3.4);
   const m=mkP(PS.S,'#141a28',181+i,'Police Officer');putP(m,{x:x-1,z:z+2,ang:Math.PI},false);PS.cops.push(m)});
  // wanted board
  PS.cv=document.createElement('canvas');PS.cv.width=1024;PS.cv.height=640;PS.tex=new T.CanvasTexture(PS.cv);PS.tex.colorSpace=T.SRGBColorSpace;
  R.B2(13.4,8.6,.3,mat.dark,12,.9,-10.6,false);const wb=new T.Mesh(new T.PlaneGeometry(12.8,8),new T.MeshBasicMaterial({map:PS.tex,toneMapped:false}));wb.position.set(12,5.2,-10.4);R.add(wb);PS.v='';
  // front desk
  R.B2(7,1.6,2,M(0x1d4fb8),-6,0,8);R.B2(7.2,.15,2.2,M(0xe9e5dc),-6,1.6,8);PS.desk=mkP(PS.S,'#141a28',185,'Police Officer');putP(PS.desk,{x:-6,z:6.2,ang:0},false);
  PS.L=[mkP(PS.S,null,186,'civ'),mkP(PS.S,null,187,'civ')];PS.built=true;wantedBoard()}
 function wantedBoard(){const th=thieves(),cs=CASES.slice(0,3);const key=th.join('|')+'#'+cs.map(c=>c.no+c.verdict).join('|')+(crime?'!'+crime.thief:'');if(key===PS.v)return;PS.v=key;
  const x=PS.cv.getContext('2d'),W=1024,H=640;x.fillStyle='#f1e7c9';x.fillRect(0,0,W,H);x.fillStyle='#8a1a14';x.font="900 96px 'Barlow Condensed',sans-serif";x.textAlign='center';x.textBaseline='alphabetic';x.fillText('WANTED',W/2,110);
  x.fillStyle='#3a2a1a';x.font="600 30px 'JetBrains Mono',monospace";x.fillText(crime?`LIVE CHASE: ${crime.thief.toUpperCase()}`:'MOTOROPOLIS POLICE DEPARTMENT',W/2,160);
  const list=th.length?th:['NO SUSPECTS... YET'];list.slice(0,6).forEach((n,i)=>{const cx=110+(i%3)*300,cy=200+Math.floor(i/3)*210;x.fillStyle='#d8cba6';x.fillRect(cx,cy,220,180);x.strokeStyle='#3a2a1a';x.lineWidth=4;x.strokeRect(cx,cy,220,180);
   x.fillStyle='#3a2a1a';x.beginPath();x.arc(cx+110,cy+65,34,0,Math.PI*2);x.fill();x.fillRect(cx+60,cy+100,100,40);x.font="800 26px 'Barlow Condensed',sans-serif";x.fillText(String(n).slice(0,16),cx+110,cy+170)});
  x.font="700 26px 'Barlow Condensed',sans-serif";x.fillStyle='#8a1a14';x.fillText('COMMENT "WORKSHOP THIEF" TO JOIN THE WANTED LIST',W/2,H-24);PS.tex.needsUpdate=true}
 function syncPolice(){wantedBoard();const caught=CASES.find(c=>!c.verdict);PS.cell.visible=!!caught;if(caught)PS.cell.rotation.y=Math.sin(simTime*.8)*.6;
  PS.cops.forEach((m,k)=>{m.rotation.y=Math.PI+Math.sin(simTime*(.5+k*.2))*.3});PS.desk.rotation.y=Math.sin(simTime*.4)*.4;
  PS.L.forEach((m,k)=>loopP(m,[[24,10],[-6,10.3],[-6,10.3]],14+k*4,k*.5,.3))}
 function labelsPolice(){PS.cops.forEach((m,k)=>staffTag(m,'police','Police Officer',k,4.4));staffTag(PS.desk,'police','Detective',0,4.6);
  const cs=CASES.find(c=>!c.verdict);if(cs&&PS.cell.visible)tag(-20,4.4,-6.5,`IN CUSTODY: ${cs.thief}`,'rgba(217,58,47,.95)','#fff');
  if(crime)pill(`🚨 LIVE CHASE: ${crime.thief} in ${crime.car.plate}`,hud.width/2,150,26,'rgba(217,58,47,.95)','#fff')
  header('INSIDE THE POLICE STATION')}

