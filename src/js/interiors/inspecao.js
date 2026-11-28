//@ interiors/inspecao.js - INSIDE THE INSPECTION CENTER (Phase 3 step 2: inspection as a business, engine INSPJOBS in sim/shopjobs.js).
//@ Two test lanes, an Inspector each (staffOf('inspecao','Inspector',k)). A car every 10 min, 14-19 min each:
//@ CHECK-IN -> LIGHTS (headlight aim, %) -> BRAKES (roller brake tester: front axle, then rear: kN / lbf per wheel, efficiency %, imbalance %)
//@ -> EMISSIONS (CO % / HC ppm / lambda for petrol, smoke opacity k m-1 for diesel) -> SUSPENSION · TYRES (tread mm / 32nds) -> RESULT (PASS / FAIL) -> DRIVEN OFF.
//@ Each lane has a station screen with the live readings, a result lamp (amber while testing, green PASS, red FAIL) and a job card; the
//@ latest certificate (PASS green stamp, or FAIL red stamp with the failed item and the retest) stands at the check-in desk; JOB BOARD and
//@ THE TILL on the walls. Static parts: one vertex-coloured mesh + one atlas mesh; rollers and lamps are instanced.
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== INSPECTION CENTER =====
 const IC={built:false,home:{tx:0,tz:-.5,yaw:.25,pitch:.38,dist:45},lanes:[],v:{},hover:null,pin:null,A:[]};
 // the car's x at each stage (BRAKES: the axle on the rollers is placed per car), rollers, lanes
 const ICL={Z:[-4,4],POS:[-19,-11.5,0,6,13,19.5],ROLL:-1,CS:1.55,TYW:[-1,0,1,0],CLERK:16.2};
 const ICA=bizAtlas({card0:[0,0,384,320],card1:[384,0,384,320],scr0:[768,0,512,320],scr1:[1280,0,512,320],cert:[0,320,512,880],kan:[512,320,1280,720],till:[512,1040,640,512],
  sTitle:[1152,1040,896,112],sDesk:[1152,1152,512,96],sWait:[1152,1248,512,96],sL:[1664,1152,384,80],sB:[1664,1232,384,80],sE:[1664,1312,384,80],sS:[1664,1392,384,80],rules:[0,1200,512,512]});
 const icStageCol=['#7a8088','#e8b931','#c8231c','#7a3fb0','#2f6fd9','#2e8b57','#22252b'];
 const icN=v=>v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
 const icKN=kn=>`${icN(kn)} kN · ${Math.round(kn*224.809).toLocaleString('en-US')} lbf`;
 const ICO={card:{bay:'LANE',free:'FREE',col:icStageCol,dark:[1],readyTxt:j=>j.pass?'PASS ✓ · CERTIFICATE':'FAIL ✗ · RETEST',readyCol:j=>j.pass?'#2e8b57':'#c8231c',doneTxt:'DRIVEN OFF ✓',
   rows:(x,A,j,a)=>{const txt=A.txt;x.fillStyle='#e6edf7';x.fillRect(14,186,356,60);txt(x,`${j.diesel?'DIESEL':'PETROL'} · ${j.kg.toLocaleString('en-US')} kg · ${j.lb.toLocaleString('en-US')} lb · ${BIZP.kmmi(j.km)}`,192,202,340,17,'#16181c',700);
    const s=a.s,b=j.brakes,e=j.emis;txt(x,s<=2?(j.retest?'RETEST AFTER A FAIL · 12 TC':'ANNUAL INSPECTION'):s===3?`BRAKES ${b.eff} % (MIN 50 %) · IMBALANCE ${b.imb} %`:s===4?(e.diesel?`SMOKE ${icN(e.k)} k m⁻¹ (MAX 1.50)`:`CO ${icN(e.co)} % · HC ${e.hc} ppm · λ ${e.lam}`):j.pass?'ALL ITEMS PASSED':'FAILED: '+j.fail.toUpperCase(),192,228,340,18,s>=5&&!j.pass?'#c8231c':'#4a4f57',700)}},
  board:{title:'JOB BOARD · INSPECTION CENTER',bay:'LANE',cols:[['CHECK-IN',[0],'#7a8088'],['LIGHTS · BRAKES',[1,2],'#e8b931'],['EMISSIONS · CHASSIS',[3,4],'#7a3fb0'],['RESULT',[5,6],'#2e8b57']],darkCols:[1],
   readyTxt:j=>j.pass?'PASS ✓ · CERTIFICATE PRINTED':'FAIL ✗ · '+j.fail.toUpperCase(),doneTxt:'DRIVEN OFF · PAID ✓',foot:'Hover or click a car in a lane to see who is testing it'}};
 function buildInsp(){const S=new T.Scene();IC.S=S;bizScene(S,{bg:0x0b1626,h:9});
  const RW=52,RD=22,RH=9,X0=-RW/2,Z0=-RD/2,{bx,cyl,quad}=OFG,A=ICA;A.init();icPaintStatic();
  const V=[],Q=[],q=(k,w,h,x,y,z,ry)=>quad(Q,k,w,h,x,y,z,ry,0,A);const BL=0x1d4fb8,DARK=0x22252b,STEEL=0x8e98a4,WOOD=0xb07a45,TOP=0xf4f4f0;
  bx(V,RW,.1,RD+8,0x8b9097,0,-.1,4);bx(V,RW,RH,.5,0x1e2f45,0,0,Z0);bx(V,.5,RH,RD,0x1a293d,X0,0,0);bx(V,.5,RH,RD,0x1a293d,-X0,0,0);bx(V,RW,.5,.6,BL,0,RH-1.6,Z0+.5);
  for(const sx of[-1,1])for(const wz of[-5,2]){const wx=sx*(-X0-.3);bx(V,.12,3.2,4.6,0xbfe6ff,wx,2.4,wz);bx(V,.2,.25,5,0xd8dde3,wx,2.3,wz);bx(V,.2,.25,5,0xd8dde3,wx,5.6,wz)}
  bx(V,16.4,1.9,.25,DARK,0,RH-3.75,Z0+.4);q('sTitle',16,1.7,0,RH-2.8,Z0+.56);
  // the lanes: dark test strip with yellow / black edge, gantries, station signs, the roller brake tester, the aim box, the analyser, the shaker plates, the exit lamp
  ICL.Z.forEach((z,k)=>{bx(V,46,.04,3.2,0x2b333d,0,0,z);for(let i=0;i<23;i++)bx(V,1,.05,.3,i%2?0x111111:0xffd34d,-22+i*2,0,z+1.8);
   for(const[x,key]of[[-11.5,'sL'],[ICL.ROLL,'sB'],[6,'sE'],[13,'sS']]){for(const dz of[-2.2,2.2])bx(V,.3,4.6,.3,STEEL,x,0,z+dz);bx(V,.4,.6,4.7,BL,x,4.6,z);q(key,2.2,.46,x,4.9,z+2.38)}
   const rx=ICL.ROLL;bx(V,2.6,.08,4.2,0x3a3f46,rx,0,z);for(const dz of[-1.3,1.3])bx(V,1.9,.06,1.1,0x111418,rx,.08,z+dz);
   bx(V,.8,1.4,.6,DARK,-7.6,0,z+1.3);bx(V,.5,.5,.6,0x46c8ff,-7.6,1.1,z+.98);bx(V,.1,.1,3,STEEL,-7.6,.05,z);
   bx(V,.9,1.1,.7,0xe8b931,2.2,0,z+2.7);bx(V,.7,.4,.05,0x111827,2.2,.9,z+2.36);cyl(V,.04,.04,2.4,6,DARK,3.2,.12,z+1.7,0,Math.PI/3,Math.PI/2);
   for(const dz of[-1.25,1.25])bx(V,1.4,.08,1,0x9aa3ae,13,0,z+dz);bx(V,1.6,.02,1.2,0x0d1014,13,.03,z);
   bx(V,.3,5.4,.3,DARK,22.6,0,z+2);bx(V,.7,1.6,.6,DARK,22.6,4.4,z+2);
   // the station screen on its pole (middle aisle for lane 1, front for lane 2) and the job card beside it
   bx(V,.25,2.6,.25,DARK,-4.2,0,z+3.3);bx(V,2.7,1.75,.18,DARK,-4.2,2.55,z+3.25);q('scr'+k,2.5,1.56,-4.2,3.42,z+3.36);
   bx(V,.12,2.4,.12,DARK,-16.2,0,z+3.3);bx(V,2.3,1.95,.08,DARK,-16.2,2.6,z+3.28);q('card'+k,2.1,1.75,-16.2,3.55,z+3.34)});
  // check-in desk with the certificate printer and the latest certificate on its stand, the inspection rules, waiting chairs, plants
  {const dx=14,dz=8.2;bx(V,6.4,1.15,1.4,WOOD,dx,0,dz);bx(V,6.7,.12,1.7,TOP,dx,1.15,dz);q('sDesk',3.2,.56,dx,.6,dz+.72);bx(V,1.2,.8,.1,DARK,dx-1.4,1.3,dz-.3);bx(V,.95,.42,.7,0xdfe3e8,dx+1.6,1.27,dz);bx(V,.7,.04,.45,0xffffff,dx+1.6,1.69,dz-.1);
   bx(V,.12,1.5,.12,DARK,dx+4,0,dz+.3);bx(V,2.2,3.6,.07,DARK,dx+4,1.5,dz+.27);q('cert',2,3.44,dx+4,3.3,dz+.32)}
  bx(V,.22,4.3,4.3,DARK,-X0-.36,3,-3.6);q('rules',4.1,4.1,-X0-.5,5.15,-3.6,-Math.PI/2);
  for(let k=0;k<4;k++){const cx=2+k*1.5;bx(V,1.1,.12,1.1,0x2f6fd9,cx,.85,10.4);bx(V,1.1,1,.15,0x2f6fd9,cx,.85,10.95);bx(V,.1,.85,.1,DARK,cx,0,10.4)}q('sWait',3,.5,4.25,2.3,11.05);
  bx(V,1.6,.6,1,WOOD,-1.2,0,10.4);bx(V,.8,1.6,.8,TOP,-3.4,0,10.6);cyl(V,.35,.35,.9,12,0x9fd0ff,-3.4,2.05,10.6);
  for(const px of[X0+1.4,-X0-1.4]){cyl(V,.55,.42,.9,12,0x8a5a3a,px,.45,9.4);V.push({g:new T.IcosahedronGeometry(.9,0),c:0x3f8f45,m:OFG.xf(px,1.6,9.4,0,0,0,1,1.3,1)})}
  // job board (left wall), till (back wall right)
  bx(V,.22,6.5,11.2,DARK,X0+.36,1.5,-2.6);q('kan',10.7,6.02,X0+.5,4.75,-2.6,Math.PI/2);bx(V,5.2,4.3,.22,DARK,17,2.2,Z0+.38);q('till',5,4,17,4.35,Z0+.52);
  const sm=new T.Mesh(OFG.merge(V),OFM.vc);sm.castShadow=true;sm.receiveShadow=true;S.add(sm);S.add(new T.Mesh(OFG.merge(Q),A.mat()));
  // rollers (two pairs per lane), spun during the brake test; result lamps (instanced, coloured per lane)
  {const g=new T.CylinderGeometry(.22,.22,1,14);g.rotateX(Math.PI/2);IC.roll=new T.InstancedMesh(g,M(0xc9d1da,{metalness:.7,roughness:.3}),8);IC.roll.instanceMatrix.setUsage(T.DynamicDrawUsage);S.add(IC.roll);IC.rollA=0}
  {IC.lamp=new T.InstancedMesh(new T.SphereGeometry(.32,12,8),new T.MeshBasicMaterial({color:0xffffff}),4);const o=new T.Object3D(),c=new T.Color(0x333333);for(let k=0;k<4;k++){o.position.set(22.95,4.9+(k%2?-.62:.32),ICL.Z[k>>1]+2);o.updateMatrix();IC.lamp.setMatrixAt(k,o.matrix);IC.lamp.setColorAt(k,c)}S.add(IC.lamp)}
  ICL.Z.forEach((z,k)=>{const car=new T.Group();car.rotation.y=Math.PI/2;S.add(car);const wh=new T.Group();wh.rotation.y=Math.PI/2;S.add(wh);IC.lanes.push({k,z,car,wh,cur:null,id:null,lazy:false,x:-19,hl:2.2,hw:1.2,wb:1.4})});
  IC.insp=[0,1].map(i=>{const m=mkP(S,'#e8b931',70+i,'Inspector');m.userData.p=null;return m});
  IC.clerk=mkP(S,'#1d4fb8',72,'civ');IC.cust=[0,1].map(i=>{const m=mkP(S,null,73+i,'civ');m.visible=false;m.userData.p=null;return m});
  bizPointer('inspecao',IC,(hx,hy)=>bizHit(hx,hy,IC.lanes.filter(L=>IC.A[L.k]&&L.car.visible).map(L=>({k:L.k,x:L.x,y:1.6,z:L.z,r:2.4})),IC.insp));
  IC.built=true}
 function icPaintStatic(){const A=ICA,P=A.paint,txt=A.txt;
  const sg=(k,t,bg,fg,sz)=>P(k,(x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(0,0,W,5);txt(x,t,W/2,H/2+3,W-30,sz||60,fg)});
  sg('sTitle','INSPECTION CENTER','#1d4fb8','#ffffff',84);sg('sDesk','CHECK-IN · CERTIFICATES','#22252b','#ffd34d');sg('sWait','WAITING AREA','#163a5c','#eef3fb');
  sg('sL','1 · LIGHTS','#e8b931','#16181c',46);sg('sB','2 · BRAKES','#c8231c','#ffffff',46);sg('sE','3 · EMISSIONS','#7a3fb0','#ffffff',46);sg('sS','4 · SUSPENSION · TYRES','#2f6fd9','#ffffff',40);
  P('rules',(x,W,H)=>{x.fillStyle='#10161e';x.fillRect(0,0,W,H);x.strokeStyle='#1d4fb8';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);txt(x,'PASS LIMITS · LIGHT VEHICLES',W/2,42,W-40,34,'#9fd0ff');
   const L=[['Service brake efficiency','≥ 50 %'],['Brake imbalance per axle','≤ 30 %'],['Parking brake efficiency','≥ 16 %'],['CO (petrol, idle)','≤ 0.30 %'],['HC (petrol)','≤ 200 ppm'],['Smoke opacity (diesel)','≤ 1.50 k m⁻¹'],['Tyre tread','≥ 1.6 mm · 2/32 in'],['Headlight aim (dipped)','−0.5 … −2.5 %']];
   L.forEach(([a,b],i)=>{const y=96+i*48;x.fillStyle=i%2?'#18212c':'#141c26';x.fillRect(18,y-20,W-36,42);txt(x,a,30,y+1,280,20,'#eef3fb',700,null,'left');txt(x,b,W-30,y+1,170,20,'#ffd34d',800,A.MONO,'right')});
   txt(x,'Inspection fee 36 TC · diesel +6 TC · retest within 30 days 12 TC',W/2,H-26,W-40,17,'#6b7280',600)})}
 // the station screen: live readings of the station the lane's car is at
 function icPaintScreen(k,a){const A=ICA,txt=A.txt;A.paint('scr'+k,(x,W,H)=>{x.fillStyle='#071a2d';x.fillRect(0,0,W,H);
   if(!a){txt(x,`LANE ${k+1} · READY`,W/2,H/2-20,W-30,40,'#3a5a7a');txt(x,INSPJOBS.open()?'waiting for the next car':'CLOSED',W/2,H/2+30,W-30,24,'#3a5a7a',700);return}
   const j=a.j,s=a.s,u=s<6?Math.min(1,a.inS/Math.max(1,j.st[s+1]-j.st[s])):1;txt(x,`LANE ${k+1} · ${j.no} · ${j.plate}`,W/2,26,W-30,24,'#9fd0ff',700,A.MONO);
   const big=(t,c,y,sz)=>txt(x,t,W/2,y,W-40,sz||52,c,800,A.MONO);
   if(s===0){txt(x,'CHECK-IN',W/2,70,W-40,34,'#ffffff');txt(x,j.model,W/2,118,W-40,24,'#c8defa',700);txt(x,`${j.diesel?'DIESEL':'PETROL'} · ${j.kg.toLocaleString('en-US')} kg · ${j.lb.toLocaleString('en-US')} lb`,W/2,156,W-40,24,'#c8defa',700);txt(x,BIZP.kmmi(j.km),W/2,194,W-40,24,'#c8defa',700);txt(x,j.retest?'RETEST':'PERIODIC INSPECTION',W/2,252,W-40,30,'#ffd34d');return}
   if(s===1){txt(x,'HEADLIGHT AIM · DIPPED BEAM',W/2,66,W-40,28,'#ffd34d');const ok=j.aim<=-.5&&j.aim>=-2.5;if(u<.4){big('MEASURING…','#9fd0ff',150,40)}else{big(`${j.aim>0?'+':''}${j.aim.toFixed(1)} %`,ok?'#3ee08f':'#ff5a4f',150,64);txt(x,ok?'WITHIN −0.5 … −2.5 % ✓':'TOO HIGH ✗ · DAZZLES ONCOMING TRAFFIC',W/2,224,W-40,24,ok?'#3ee08f':'#ff5a4f',800)}return}
   if(s===2){const b=j.brakes;txt(x,'ROLLER BRAKE TESTER',W/2,58,W-40,26,'#ff8a7a');const fr=bizEase(Math.min(1,u/.42)),rr=bizEase(Math.max(0,Math.min(1,(u-.5)/.38)));
    [['FL',b.fl,fr],['FR',b.fr,fr],['RL',b.rl,rr],['RR',b.rr,rr]].forEach(([n,v,f],i)=>{const y=88+i*42,bw=W-250,mx=Math.max(b.fl,b.fr)*1.15;x.fillStyle='#0d2740';x.fillRect(64,y,bw,30);x.fillStyle=n[0]==='F'&&b.imb>b.limImb&&f>.9?'#ff5a4f':'#3ee08f';x.fillRect(64,y,bw*Math.min(1,v*f/mx),30);
     txt(x,n,36,y+15,50,22,'#ffffff',800,null,'center');txt(x,f>0?icKN(v*f):'—',W-16,y+15,170,17,'#c8defa',700,A.MONO,'right')});
    if(u>.9){const ok=b.eff>=b.limEff&&b.imb<=b.limImb;txt(x,`EFFICIENCY ${b.eff} % · IMBALANCE ${b.imb} % · PARK ${b.park} %`,W/2,268,W-30,22,ok?'#3ee08f':'#ff5a4f',800)}else txt(x,u<.46?'FRONT AXLE ON THE ROLLERS':'REAR AXLE ON THE ROLLERS',W/2,268,W-30,22,'#9fd0ff',700);
    txt(x,`limits: efficiency ≥ ${b.limEff} % · imbalance ≤ ${b.limImb} % · park ≥ ${b.limPark} %`,W/2,300,W-30,16,'#6b8aa8',600);return}
   if(s===3){const e=j.emis,f=bizEase(Math.min(1,u/.7));if(e.diesel){txt(x,'SMOKE OPACITY · DIESEL · 3 FREE ACCELERATIONS',W/2,62,W-40,22,'#c9a0ff');const v=e.k*f,ok=e.k<=e.lim;big(`${icN(v)} k m⁻¹`,u<.7?'#ffffff':ok?'#3ee08f':'#ff5a4f',150,58);txt(x,`LIMIT ${icN(e.lim)} k m⁻¹`,W/2,214,W-40,24,'#9fd0ff',700);if(u>=.7)txt(x,ok?'PASS ✓':'OVER THE LIMIT ✗',W/2,262,W-40,30,ok?'#3ee08f':'#ff5a4f')}
    else{txt(x,'EXHAUST GAS ANALYSER · PETROL',W/2,62,W-40,24,'#c9a0ff');const ok=e.co<=e.limCo&&e.hc<=e.limHc;
     [['CO',`${icN(e.co*f)} %`,`≤ ${icN(e.limCo)} %`,e.co<=e.limCo],['HC',`${Math.round(e.hc*f)} ppm`,`≤ ${e.limHc} ppm`,e.hc<=e.limHc],['λ LAMBDA',(e.lam*(u<.7?f:1)).toFixed(3),'0.97 … 1.03',true]].forEach(([n,v,l,good],i)=>{const y=110+i*54;txt(x,n,40,y,140,26,'#ffffff',800,null,'left');txt(x,v,W/2+40,y,190,32,u<.7?'#ffffff':good?'#3ee08f':'#ff5a4f',800,A.MONO);txt(x,l,W-24,y,130,18,'#9fd0ff',700,null,'right')});
     if(u>=.7)txt(x,ok?'PASS ✓':'OVER THE LIMIT ✗',W/2,284,W-40,28,ok?'#3ee08f':'#ff5a4f')}return}
   if(s===4){txt(x,'SUSPENSION · STEERING · TYRES',W/2,62,W-40,26,'#7fb0ff');const tok=j.tread>=1.6,sok=j.shock>0,lk=j.fail==='Oil leak';
    [['TREAD (shallowest)',u>.25?`${j.tread.toFixed(1)} mm · ${j.t32}/32 in`:'…',tok],['SHOCK ABSORBERS',u>.5?(sok?`${j.shock} % ✓`:'BALL JOINT PLAY ✗'):'…',sok],['LEAKS UNDER THE CAR',u>.75?(lk?'OIL LEAK ✗':'NONE ✓'):'…',!lk]].forEach(([n,v,good],i)=>{const y=114+i*60;txt(x,n,30,y,220,22,'#ffffff',700,null,'left');txt(x,v,W-24,y,230,24,v==='…'?'#9fd0ff':good?'#3ee08f':'#ff5a4f',800,A.MONO,'right')});return}
   // result
   x.fillStyle=j.pass?'#123d27':'#4a1414';x.fillRect(16,48,W-32,H-64);big(j.pass?'PASS':'FAIL',j.pass?'#3ee08f':'#ff5a4f',130,96);txt(x,j.pass?'CERTIFICATE PRINTED · SEE YOU NEXT YEAR':j.fail.toUpperCase(),W/2,214,W-50,24,'#ffffff',800);
   if(!j.pass)txt(x,'RETEST WITHIN 30 DAYS · 12 TC',W/2,256,W-50,22,'#ffb3a8',700)})}
 // the certificate: every reading with its limit, PASS (green stamp) or FAIL (red stamp, the failed item and the retest)
 function icPaintCert(j){const A=ICA,txt=A.txt,E=INSPJOBS;A.paint('cert',(x,W,H)=>{x.fillStyle='#fdfcf8';x.fillRect(0,0,W,H);x.fillStyle='#1d4fb8';x.fillRect(0,0,W,14);
   txt(x,'MOTOROPOLIS INSPECTION CENTER',W/2,46,W-40,30,'#16181c');txt(x,j&&j.retest?'RETEST CERTIFICATE':'INSPECTION CERTIFICATE',W/2,82,W-40,28,'#1d4fb8',800);
   if(!j){txt(x,'No inspections yet today',W/2,300,W-60,28,'#6b7280',700);return}
   const w=BIZP.who(E,j),d=new Date(j.t1*1000),rows=[['CERTIFICATE',`${j.cert} · JOB ${j.no}`],['DATE',`${d.toISOString().slice(0,10)} · ${BIZP.hm(j.t1)}`],['OWNER',w?`★ ${w}`:'Owner'],['VEHICLE',j.model],['PLATE',j.plate],['ODOMETER',BIZP.kmmi(j.km)],['MASS · FUEL',`${j.kg.toLocaleString('en-US')} kg · ${j.lb.toLocaleString('en-US')} lb · ${j.diesel?'diesel':'petrol'}`]];
   rows.forEach(([a,b],i)=>{const y=116+i*28;txt(x,a,22,y,128,18,'#6b7280',700,null,'left');txt(x,b,150,y,W-170,20,'#16181c',700,null,'left')});
   let y=116+rows.length*28+4;x.fillStyle='#22252b';x.fillRect(18,y,W-36,3);y+=26;txt(x,'TEST',22,y,200,18,'#6b7280',800,null,'left');txt(x,'RESULT',W-22,y,200,18,'#6b7280',800,null,'right');
   const b=j.brakes,e=j.emis,L=[['Headlight aim',`${j.aim>0?'+':''}${j.aim.toFixed(1)} %`,j.aim<=-.5&&j.aim>=-2.5],['Brake efficiency',`${b.eff} % (≥ 50 %)`,b.eff>=50],['Front brakes L / R',`${icN(b.fl)} / ${icN(b.fr)} kN · ${Math.round(b.fl*224.809)} / ${Math.round(b.fr*224.809)} lbf`,true],['Imbalance front',`${b.imb} % (≤ 30 %)`,b.imb<=30],['Parking brake',`${b.park} % (≥ 16 %)`,true],
    e.diesel?['Smoke opacity',`${icN(e.k)} k m⁻¹ (≤ 1.50)`,e.k<=1.5]:['CO · HC',`${icN(e.co)} % · ${e.hc} ppm`,e.co<=.3&&e.hc<=200],['Tyre tread',`${j.tread.toFixed(1)} mm · ${j.t32}/32 in`,j.tread>=1.6],['Suspension · leaks',j.fail==='Worn suspension ball joint'?'ball joint play':j.fail==='Oil leak'?'oil leak':'OK',j.fail!=='Worn suspension ball joint'&&j.fail!=='Oil leak']];
   for(const[a,v,ok]of L){y+=31;txt(x,a,22,y,190,19,'#16181c',700,null,'left');txt(x,v,W-56,y,260,18,'#16181c',700,A.MONO,'right');txt(x,ok?'✓':'✗',W-28,y,30,24,ok?'#2e8b57':'#c8231c',900)}
   y+=20;x.fillStyle='#22252b';x.fillRect(18,y,W-36,3);y+=30;txt(x,`FEE ${E.tc(j.total)} · PAID`,22,y,260,24,'#16181c',800,null,'left');
   const nx=new Date((j.t1+365*86400)*1000).toISOString().slice(0,10);txt(x,j.pass?`VALID UNTIL ${nx}`:'NOT VALID · REPAIR + RETEST',W-22,y,240,19,j.pass?'#2e8b57':'#c8231c',800,null,'right');
   BIZP.stamp(A,x,W*.5,H-160,j.pass?'PASS':'FAIL',j.pass?'46,139,87':'200,35,28',230,90,74,-.16);
   if(!j.pass){txt(x,'FAILED: '+j.fail.toUpperCase(),W/2,H-62,W-40,20,'#c8231c',800);txt(x,'RETEST WITHIN 30 DAYS · 12 TC',W/2,H-36,W-40,18,'#4a4f57',700)}
   else txt(x,'Drive safe · see you next year',W/2,H-50,W-40,20,'#4a4f57',700)})}
 // ---------- per frame ----------
 // the car's x: rolls between stations; at BRAKES the front axle goes on the rollers, then the rear one
 function icPos(a,L,t){if(!a)return-19;const j=a.j,s=a.s,P=ICL.POS,R=ICL.ROLL,wb=L.wb;if(s===6)return P[5]+12*bizEase(a.out);if(s===0)return P[0]-7*(1-bizEase(a.inS/6));
  const at=i=>i===2?R-wb:P[i],d=j.st[s+1]-j.st[s],u=bizEase(Math.min(1,a.inS/Math.min(6,d*.5)));let x=at(s-1)+(at(s)-at(s-1))*u;if(s===2&&a.inS>d*.46)x=R-wb+2*wb*bizEase(Math.min(1,(a.inS-d*.46)/5));if(s===3)x=R+wb+(P[3]-R-wb)*u;return x}
 const IC_C={off:new T.Color(0x2a2f38),amb:new T.Color(0xffb020),grn:new T.Color(0x3ee08f),red:new T.Color(0xff3b30)};
 function syncInsp(dt){const E=INSPJOBS,t=E.now(),A0=E.bays(t);IC.A=A0;IC.t=t;const o3=IC._o3||(IC._o3=new T.Object3D());let rolling=false;
  IC.lanes.forEach((L,k)=>{const a=A0[k];
   if(bizCar(L,a,ICL.CS)&&L.cur){const bb=IC._bb||(IC._bb=new T.Box3());L.car.updateMatrixWorld(true);bb.setFromObject(L.cur.g);L.hl=Math.max(1.4,(bb.max.x-bb.min.x)/2);L.hw=Math.max(.8,(bb.max.z-bb.min.z)/2);L.wb=L.hl*.62}
   const x=icPos(a,L,t);L.x=x;L.car.position.set(x,0,L.z);L.wh.position.set(x,0,L.z);L.car.visible=L.wh.visible=!!a&&!(a.s===6&&a.out>.9);
   const s=a?a.s:-1,br=s===2&&a.inS>6&&Math.abs(a.inS-(a.j.st[3]-a.j.st[2])*.48)>4;if(br)rolling=true;
   for(let n=0;n<4;n++){o3.position.set(ICL.ROLL+(n&1?.45:-.45),.16,L.z+(n&2?1.3:-1.3));o3.rotation.set(0,0,br?-IC.rollA:0);o3.updateMatrix();IC.roll.setMatrixAt(k*4+n,o3.matrix)}
   const top=s>=1&&s<=4?(Math.floor(simTime*2)%2?IC_C.amb:IC_C.off):s===5?(a.j.pass?IC_C.off:IC_C.red):IC_C.off,bot=s===5&&a.j.pass?IC_C.grn:s>=1&&s<=4?IC_C.off:s===0?IC_C.off:IC_C.off;
   IC.lamp.setColorAt(k*2,top);IC.lamp.setColorAt(k*2+1,s===5&&a.j.pass?IC_C.grn:bot)});
  IC.rollA+=dt*(rolling?7:0);IC.roll.instanceMatrix.needsUpdate=true;if(IC.lamp.instanceColor)IC.lamp.instanceColor.needsUpdate=true;
  icBoards(A0,t);icPeople(A0,t,dt)}
 function icBoards(A0,t){const V=IC.v,E=INSPJOBS;let up=0;
  A0.forEach((a,k)=>{const key=a?[a.j.g,a.s,a.s<E.RD?Math.ceil(a.left/60):0,E.staffName(a.j),BIZP.who(E,a.j)].join('|'):'free'+Math.floor(t/E.STEP)+E.open();if(V['c'+k]!==key){V['c'+k]=key;BIZP.card(ICA,'card'+k,k,a,t,E,ICO.card);up=1}
   const sk=a?a.j.g+':'+a.s+':'+(a.s<6?Math.floor(Math.min(1,a.inS/Math.max(1,a.j.st[a.s+1]-a.j.st[a.s]))*14):0):'-'+E.open();if(V['s'+k]!==sk){V['s'+k]=sk;icPaintScreen(k,a);up=1}});
  const ak=A0.map(a=>a?a.j.g+':'+a.s+':'+(a.s<E.RD?Math.ceil(a.left/60):0)+':'+E.staffName(a.j):'-').join(',')+'#'+BIZP.hm(t);if(V.kan!==ak){V.kan=ak;BIZP.board(ICA,'kan',A0,t,E,ICO.board);up=1}
  const L=E.invoices(t,1),tk=(L[0]?L[0].g:'')+'#'+WALL.length+E.open();if(V.till!==tk){V.till=tk;BIZP.till(ICA,'till',t,E,{tag:j=>j.pass?['PASS','#2e8b57']:['FAIL','#c8231c']});icPaintCert(L[0]||null);up=1}
  if(up)ICA.tex.needsUpdate=true}
 // inspectors work each station; customers check in, wait, get the certificate at the desk and drive off
 function icPeople(A0,t,dt){const E=INSPJOBS;IC.inspJob=bizStaffJobs(E,A0,s=>s<=5);
  IC.insp.forEach((m,i)=>{const a=IC.inspJob[i],L=IC.lanes[i],side=L.z+2.7;let x,z,ang;if(a){const s=a.s;
    if(s===0){x=L.x+L.hl*.4;z=side;ang=Math.PI}else if(s===1){x=-7.6;z=side;ang=-Math.PI/2}else if(s===2){x=-4.2+.9;z=L.z+3.9;ang=Math.PI}
    else if(s===3){x=L.x-L.hl-.6;z=L.z+.9;ang=Math.PI/2}
    // SUSPENSION · TYRES: front wheel, middle, rear wheel, middle, held 5 s each (a target that crept along a sine made them slide in
    // the stand pose and pop in and out of the walk), kept clear of the check-in clerk
    else if(s===4){x=13+ICL.TYW[(Math.floor(simTime/5)+i*2)&3]*Math.min(1.5,L.hl*.7);z=side;ang=Math.PI}
    // RESULT: at the near end of the check-in desk, one spot per lane (they used to stand inside the clerk)
    else{x=10.15;z=7.75+i*1.05;ang=Math.PI/2}}
   else{x=9.2+i*1.3;z=6.2;ang=Math.PI}bizMove(m,x,z,ang,dt);m.visible=true});
  putP(IC.clerk,{x:ICL.CLERK,z:7.05,ang:Math.sin(simTime*.7)*.4},false);
  const staff=[0,1].map(i=>staffOf('inspecao','Inspector',i));
  IC.cust.forEach((m,i)=>{const a=A0[i]&&A0[i].j.name&&!staff.includes(A0[i].j.name)?A0[i]:null;m.visible=!!a&&a.s<6;m.userData.a=a;if(!m.visible){m.userData.p=null;return}const L=IC.lanes[i];let x,z,ang=Math.PI;
   if(a.s===0){x=12+i*1.2;z=9.6}else if(a.s===5){x=15.4+i*.9;z=9.6}else{x=2+i*3;z=9.9}
   if(!m.userData.p)m.userData.p={x:L.x,z:L.z+2.4};bizMove(m,x,z,ang,dt)})}
 function labelsInsp(){const E=INSPJOBS;hctx.textAlign='center';hctx.textBaseline='middle';const sz=clamp(1100/cam.dist,14,26);
  IC.lanes.forEach(L=>{const a=IC.A[L.k];if(!a||!L.car.visible)return;const s=toHud(L.x,3.2,L.z);if(!s)return;const w=BIZP.who(E,a.j),sel=(IC.pin||IC.hover||{}).k===L.k;
   pill(w?'★ '+w:a.j.plate,s.x,s.y,sz*(sel?1.08:1),w?'rgba(255,122,26,.95)':'#fafafa',w?'#1d0f02':'#111',sel?'#ffffff':undefined);
   const r=a.s===5?(a.j.pass?['PASS ✓','rgba(92,201,138,.95)']:['FAIL ✗ · '+a.j.fail.toUpperCase(),'rgba(255,90,79,.95)']):[E.STAGES[a.s],'rgba(16,19,24,.85)'];pill(r[0],s.x,s.y+sz*1.35,sz*.78,r[1],a.s===5?'#071a2d':'#9fd0ff')});
  IC.insp.forEach((m,i)=>bizStaffTag(m,E,i,IC.inspJob&&IC.inspJob[i]));
  IC.cust.forEach(m=>{const a=m.userData.a;if(!m.visible||!a)return;const w=BIZP.who(E,a.j);if(!w)return;tag(m.position.x,3.5,m.position.z,`★ ${w} · `+(a.s===0?'CHECKING IN':a.s===5?(a.j.pass?'GETTING THE CERTIFICATE':'BOOKING THE RETEST'):'WAITING · '+a.j.no))});
  hctx.globalAlpha=1;lockedNote('inspecao');header('INSIDE THE INSPECTION CENTER');
  bizPanelLine(bizLine(E,IC,IC.A,IC.inspJob,'is between cars · calibrating the brake tester'),'#46a0ff')}
