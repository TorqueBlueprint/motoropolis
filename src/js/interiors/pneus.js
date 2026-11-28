//@ interiors/pneus.js - INSIDE THE TIRE SHOP (Phase 3 step 2: the tire shop as a business, engine TYREJOBS in sim/shopjobs.js).
//@ Four bays with a two-post lift each; bays 1-3 have a Tire Technician (staffOf('pneus','Tire Technician',k)), bay 4 waits for a 4th one (JOB OPEN).
//@ A job every 11 min, 16-32 min each: ARRIVED -> LIFT UP -> WHEELS OFF -> TYRE CHANGER -> BALANCER -> REFIT · TORQUE -> ALIGNMENT -> READY -> DRIVEN OFF
//@ (stages a service does not need take no time: a balancing job skips the changer, an alignment keeps the wheels on).
//@ Each bay: the car on its lift (wheels on the floor while they are off), a tyre changer with its turntable and a wheel balancer with
//@ its display; a hanging job card (size, DOT code, tread mm / 32nds, pressure bar / psi, torque N·m / lb·ft). The tyre rack (back wall)
//@ has a size label per column; JOB BOARD (left wall), TYRES IN STOCK + THE TILL (back wall right), PRICES (right wall), the alignment
//@ screen (front), the invoice desk with the latest invoice and its PAID stamp. Static parts are one vertex-coloured mesh + one atlas mesh;
//@ tyres, rims, turntables and alignment heads are instanced.
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== TIRE SHOP =====
 const TS={built:false,home:{tx:0,tz:-1,yaw:.2,pitch:.36,dist:47},bays:[],v:{},hover:null,pin:null,A:[]};
 const TSL={X:[-17,-7,3,13],Z:-3.5,CS:1.55,MX:4.3};
 const TSA=bizAtlas({card0:[0,0,384,352],card1:[384,0,384,352],card2:[768,0,384,352],card3:[1152,0,384,352],align:[1536,0,512,320],
  kan:[0,352,1280,720],inv:[1280,352,512,800],stock:[0,1072,640,512],till:[640,1072,640,512],menu:[1280,1152,512,512],
  rack:[0,1584,1024,64],bal0:[1024,1584,256,128],bal1:[1280,1584,256,128],bal2:[1536,1584,256,128],bal3:[1792,1584,256,128],
  sTitle:[0,1712,1024,112],sSub:[1024,1712,640,96],sREC:[0,1824,512,96],sPAY:[512,1824,512,96],sLNG:[1024,1824,512,96]});
 const tsStageCol=['#7a8088','#3fa7c4','#2f6fd9','#ff7a1a','#e8b931','#7a3fb0','#c8231c','#2e8b57','#22252b'];
 const TSO={card:{bay:'BAY',free:'FREE',col:tsStageCol,dark:[4],readyTxt:'READY TO COLLECT',
   rows:(x,A,j)=>{const txt=A.txt;x.fillStyle='#ebe7dc';x.fillRect(14,186,356,84);
    txt(x,`${j.size} · ${j.dot}`,192,200,340,20,'#16181c',800,A.MONO);
    txt(x,j.svc==='WHEEL ALIGNMENT'?`TOE ${j.toe.map(v=>(v>0?'+':'')+v.toFixed(1)+'°').join(' ')}`:`TREAD ${j.before.toFixed(1)} mm · ${j.b32}/32 in → ${j.after.toFixed(1)} mm · ${j.a32}/32 in`,192,226,340,19,'#4a4f57',700);
    txt(x,`${j.bar} bar · ${j.psi} psi  ·  NUTS ${j.nm} N·m · ${j.lbft} lb·ft`,192,252,340,19,'#4a4f57',700)}},
  board:{title:'JOB BOARD · TIRE SHOP',bay:'BAY',cols:[['CHECK-IN',[0,1],'#e8b931'],['WHEELS OFF',[2,3,4],'#ff7a1a'],['REFIT · ALIGN',[5,6],'#7a3fb0'],['READY',[7,8],'#2e8b57']],foot:'Hover or click a car on a lift to see who is working on it'},
  inv:{name:'TORQUEBLUEPRINT TIRES · ALIGNMENT',accent:'#e8b931',rows:j=>{const w=BIZP.who(TYREJOBS,j);return[['INVOICE',`INV-${j.no.slice(2)} · JOB ${j.no}`],['DATE',`${new Date(j.t1*1000).toISOString().slice(0,10)} · ${BIZP.hm(j.t1)}`],['CUSTOMER',w?`★ ${w}`:'Customer'],['VEHICLE',j.model],['PLATE',j.plate],['TYRES',`${j.size} · ${j.dot}`],['ODOMETER',BIZP.kmmi(j.km)]]},
   lines:j=>j.parts.map(p=>[`${p.qty} × ${p.n}`,p.each*p.qty]).concat([[`Labour ${j.lab} h × ${j.rate} TC/h`,j.labTC]]),
   note:j=>(j.wheels?`TREAD ${j.after.toFixed(1)} mm / ${j.a32}/32 in · ${j.bar} bar / ${j.psi} psi · NUTS ${j.nm} N·m / ${j.lbft} lb·ft`:`ALIGNMENT · TOE SET TO 0.0° ± 0.1° · ${j.bar} bar / ${j.psi} psi`)}};
 // ---------- the room ----------
 function buildTires(){const S=new T.Scene();TS.S=S;bizScene(S,{lamps:[-18,-6,6,18],h:11});
  const RW=56,RD=24,RH=11,X0=-RW/2,Z0=-RD/2,{bx,cyl,quad}=OFG,LX=TSL.X,LZ=TSL.Z,MX=TSL.MX,A=TSA;
  A.init();tsPaintStatic();
  const V=[],Q=[],q=(k,w,h,x,y,z,ry)=>quad(Q,k,w,h,x,y,z,ry,0,A);
  const YEL=0xf2c12e,DARK=0x22252b,STEEL=0x8e98a4,RED=0xd93a2f,BLUE=0x2f6fd9,WOOD=0xb07a45,TOP=0xe9e5dc;
  // floor, painted bays, walls, trim, windows
  bx(V,RW,.1,RD+8,0x8b9097,0,-.1,4);LX.forEach(x=>{bx(V,6.2,.02,9.6,0x6f757d,x,0,LZ);for(const dx of[-3.1,3.1])bx(V,.14,.03,9.6,0xffd34d,x+dx,0,LZ)});bx(V,RW,.03,.3,0xffd34d,0,0,5.4);
  bx(V,RW,RH,.5,0x2d3a4a,0,0,Z0);bx(V,.5,RH,RD,0x26323f,X0,0,0);bx(V,.5,RH,RD,0x26323f,-X0,0,0);bx(V,RW,.5,.6,DARK,0,RH-1.4,Z0+.5);
  for(let y=1;y<RH-1.6;y+=1.2)bx(V,RW-.2,.05,.05,0x354657,0,y,Z0+.3);
  for(const sx of[-1,1])for(const wz of[4,9]){const wx=sx*(-X0-.3);bx(V,.12,2.8,3.6,0xbfe6ff,wx,2.4,wz);bx(V,.2,.22,4,0xd8dde3,wx,2.3,wz);bx(V,.2,.22,4,0xd8dde3,wx,5.2,wz)}
  // the title signs (atlas) on dark backs
  bx(V,18.4,1.9,.25,DARK,-2,RH-3,Z0+.4);q('sTitle',18,1.6,-2,RH-2.05,Z0+.56);bx(V,10.3,1.3,.25,DARK,14,RH-4.6,Z0+.4);q('sSub',10,1.1,14,RH-3.95,Z0+.56);
  // bays: two-post lift, hanging job card, tyre changer (red) and wheel balancer (blue) beside each bay
  LX.forEach((x,k)=>{for(const dx of[-2.6,2.6]){bx(V,.5,4.8,.5,YEL,x+dx,0,LZ);bx(V,.85,.14,.85,DARK,x+dx,0,LZ)}bx(V,5.7,.32,.5,YEL,x,4.8,LZ);
   for(const dx of[-.9,.9])bx(V,.07,.14,.07,STEEL,x+dx,5.12,LZ+.12);bx(V,2.24,2.05,.08,DARK,x,5.24,LZ+.1);q('card'+k,2.1,1.925,x,6.25,LZ+.15);
   const mx=x+MX,cz=LZ+2.4,bz=LZ-2.2;
   bx(V,1.3,1,1.3,RED,mx,0,cz);bx(V,.22,2.3,.22,DARK,mx,1,cz-.62);bx(V,1,.18,.18,DARK,mx,3.15,cz-.62);bx(V,.16,.6,.16,STEEL,mx,2.55,cz-.2);bx(V,.4,.12,.4,0x3a3f46,mx,0,cz+.9);
   bx(V,1.2,1.1,.9,BLUE,mx,0,bz);cyl(V,.08,.08,.7,8,STEEL,mx-.9,1.3,bz,0,0,Math.PI/2);bx(V,.9,.5,.06,DARK,mx,1.35,bz+.48);q('bal'+k,.84,.42,mx,1.6,bz+.52);bx(V,1.5,.1,1.1,0x3a3f46,mx-.75,2.25,bz,0,0,0)});
  // the tyre rack (back wall left) with size labels; tyre stacks
  for(let r=0;r<4;r++)bx(V,15,.12,1,STEEL,-18.6,.1+r*1.7,Z0+1.8);for(const x of[-26,-18.6,-11.2])bx(V,.14,6.9,1,STEEL,x,0,Z0+1.8);bx(V,15,.5,.12,DARK,-18.6,7.05,Z0+1.3);q('rack',14.6,.46,-18.6,7.3,Z0+1.38);
  // job board (left wall), stock + till (back wall right), prices (right wall)
  bx(V,.22,6.5,11.2,DARK,X0+.36,3.6,-2.6);q('kan',10.7,6.02,X0+.5,6.85,-2.6,Math.PI/2);
  bx(V,6.2,4.4,.22,DARK,6.2,3.6,Z0+.38);q('stock',6,4.0,6.2,5.8,Z0+.52);bx(V,6.2,4.4,.22,DARK,21.5,3.6,Z0+.38);q('till',6,4.0,21.5,5.8,Z0+.52);
  bx(V,.22,4.4,4.4,DARK,-X0-.36,3.2,-3);q('menu',4.2,4.2,-X0-.5,5.4,-3,-Math.PI/2);
  // the alignment computer (front centre) with its big screen
  bx(V,.3,2.8,.3,DARK,-2,0,6.6);bx(V,1.1,.8,.7,DARK,-2,0,6.6);bx(V,2.7,1.75,.18,DARK,-2,2.55,6.5);q('align',2.5,1.56,-2,3.42,6.6);
  // reception, invoice desk with printer and the invoice on its stand, lounge, compressor, hose reels, plants, water cooler
  bx(V,5,1.15,1.3,WOOD,21,0,7.6);bx(V,5.2,.1,1.5,TOP,21,1.15,7.6);q('sREC',3,.56,21,.6,8.27);bx(V,1,.65,.08,DARK,20,1.25,7.4);
  bx(V,3.4,.95,1.2,0x2b3440,13.8,0,7.9);bx(V,3.5,.08,1.3,TOP,13.8,.95,7.9);bx(V,.95,.42,.7,0xdfe3e8,12.7,1.03,7.8);bx(V,.7,.04,.45,0xffffff,12.7,1.45,7.7);q('sPAY',2.9,.54,13.8,.5,8.51);
  bx(V,.12,1.5,.12,DARK,14.6,1.03,7.65);bx(V,2.2,3.25,.07,DARK,14.6,2.4,7.62);q('inv',2,3.125,14.6,4.02,7.67);
  for(let k=0;k<3;k++){const cx=22.4+k*1.5;bx(V,1.1,.12,1.1,BLUE,cx,.85,11);bx(V,1.1,1,.15,BLUE,cx,.85,11.55);bx(V,.1,.85,.1,DARK,cx,0,11)}q('sLNG',3,.5,23.9,2.3,11.65);
  bx(V,1.4,.6,1,WOOD,19.6,0,11);bx(V,.8,1.6,.8,0xf4f4f0,26.6,0,11);cyl(V,.35,.35,.9,12,0x9fd0ff,26.6,2.05,11);
  cyl(V,.6,.6,2.2,16,RED,25.6,.8,Z0+2,0,0,Math.PI/2);bx(V,.9,.7,.7,DARK,25.6,1.4,Z0+2);
  for(const x of[-3.6,2.6])cyl(V,.5,.5,.24,16,0xe8b931,x,4.2,Z0+.45,Math.PI/2,0,0);
  for(const px of[X0+1.4,-X0-1.4]){cyl(V,.55,.42,.9,12,0x8a5a3a,px,.45,11.4);V.push({g:new T.IcosahedronGeometry(.9,0),c:0x3f8f45,m:OFG.xf(px,1.6,11.4,0,0,0,1,1.3,1)})}
  {const ex=-X0-.45;cyl(V,.22,.22,.9,12,RED,ex,1.25,5.4)}
  const sm=new T.Mesh(OFG.merge(V),OFM.vc);sm.castShadow=true;sm.receiveShadow=true;S.add(sm);
  S.add(new T.Mesh(OFG.merge(Q),A.mat()));
  // tyres: the rack, the stacks and the tyres on the machines are instanced (one tyre shape, one wheel shape with its alloy rim)
  const tyreL=(rim)=>{const P=[[.44,-.24],[.6,-.25],[.72,-.235],[.79,-.2],[.81,-.12],[.81,.12],[.79,.2],[.72,.235],[.6,.25],[.44,.24]].map(p=>new T.Vector2(p[0],p[1]));const lg=new T.LatheGeometry(P,28);lg.rotateX(Math.PI/2);
   const L=[{g:lg,c:0x1b1c20,m:new T.Matrix4()}];for(const gz of[-.08,0,.08])L.push({g:new T.TorusGeometry(.812,.012,4,32),c:0x0c0d0f,m:new T.Matrix4().makeTranslation(0,0,gz)});
   if(rim){L.push({g:new T.CylinderGeometry(.45,.45,.34,18),c:0xc9d1da,m:OFG.xf(0,0,0,Math.PI/2,0,0)});L.push({g:new T.CylinderGeometry(.11,.11,.4,10),c:0x5a6068,m:OFG.xf(0,0,0,Math.PI/2,0,0)});for(let s=0;s<5;s++)L.push({g:OFG.UB,c:0x8a95a3,m:OFG.xf(0,0,.18,0,0,s/5*Math.PI*2,.09,.34,.05)})}
   else L.push({g:new T.CircleGeometry(.44,18),c:0x2a2c31,m:new T.Matrix4().makeTranslation(0,0,.2)});return OFG.merge(L)};
  const o3=new T.Object3D(),put=(im,i,x,y,z,rx,ry,s)=>{o3.position.set(x,y,z);o3.rotation.set(rx||0,ry||0,0);o3.scale.setScalar(s==null?1:s);o3.updateMatrix();im.setMatrixAt(i,o3.matrix)};
  {const R=[],W=[];for(let c=0;c<8;c++)for(let r=0;r<4;r++)(r===3&&c%2===0?W:R).push([-24.9+c*1.8,.95+r*1.7,Z0+1.8,0]);
   for(let k=0;k<4;k++)R.push([-23.6,.32+k*.62,3,Math.PI/2]);for(let k=0;k<3;k++)R.push([-21.8,.32+k*.62,2.4,Math.PI/2]);for(let k=0;k<5;k++)R.push([-23.4,.32+k*.62,6.4,Math.PI/2]);
   const ri=new T.InstancedMesh(tyreL(false),OFM.vc,R.length);R.forEach((p,i)=>put(ri,i,p[0],p[1],p[2],p[3]));ri.castShadow=true;S.add(ri);
   const wi=new T.InstancedMesh(tyreL(true),OFM.vc,W.length);W.forEach((p,i)=>put(wi,i,p[0],p[1],p[2],p[3]));wi.castShadow=true;S.add(wi)}
  // the wheels on the machines (changer: lying flat; balancer: on the shaft), turntables, alignment heads: moved per frame
  TS.mw=new T.InstancedMesh(tyreL(true),OFM.vc,8);TS.mw.instanceMatrix.setUsage(T.DynamicDrawUsage);TS.mw.castShadow=true;S.add(TS.mw);
  {const L=[];cyl(L,.62,.62,.1,18,0x9aa3ae,0,0,0);bx(L,1.2,.06,.12,0x5a6068,0,.05,0);bx(L,.12,.06,1.2,0x5a6068,0,.05,0);TS.tt=new T.InstancedMesh(OFG.merge(L),OFM.vc,4);TS.tt.instanceMatrix.setUsage(T.DynamicDrawUsage);S.add(TS.tt)}
  {const L=[];bx(L,.18,.5,.5,0x22252b,0,-.25,0);bx(L,.12,.12,.9,0xff7a1a,.1,.12,0);bx(L,.2,.16,.16,0x3ee08f,.12,.2,.45);TS.cl=new T.InstancedMesh(OFG.merge(L),OFM.vc,16);TS.cl.instanceMatrix.setUsage(T.DynamicDrawUsage);S.add(TS.cl)}
  // lift arms (instanced)
  {const L=[];for(const s of[-1,1]){bx(L,.8,.45,.8,0xd9a520,s*2.6,-.1,0);bx(L,1.3,.14,.32,STEEL,s*1.9,0,0);bx(L,.24,.16,3.5,STEEL,s*1.2,0,0);for(const e of[-1.6,1.6])cyl(L,.24,.24,.12,10,0x1b1d22,s*1.2,.22,e)}
   TS.arms=new T.InstancedMesh(OFG.merge(L),OFM.vc,4);TS.arms.castShadow=true;TS.arms.instanceMatrix.setUsage(T.DynamicDrawUsage);S.add(TS.arms)}
  LX.forEach((x,k)=>{const car=new T.Group();car.position.set(x,0,LZ);car.rotation.y=Math.PI;S.add(car);const wh=new T.Group();wh.position.set(x,0,LZ);wh.rotation.y=Math.PI;S.add(wh);TS.bays.push({k,x,car,wh,cur:null,id:null,h:0,z:LZ,lazy:false,hw:1.2,hl:1.9})});
  // people: 3 technicians, the counter clerk, up to 3 waiting customers
  TS.tech=[0,1,2].map(i=>{const m=mkP(S,'#22252b',60+i,'Tire Technician');m.userData.p=null;return m});
  TS.clerk=mkP(S,'#e8b931',66,'civ');TS.cust=[0,1,2].map(i=>{const m=mkP(S,null,63+i,'civ');m.visible=false;m.userData.p=null;return m});
  bizPointer('pneus',TS,(hx,hy)=>bizHit(hx,hy,TS.bays.filter(L=>TS.A[L.k]&&L.car.visible).map(L=>({k:L.k,x:L.x,y:L.h+1.4,z:L.z,r:2.4})),TS.tech));
  TS.built=true}
 // ---------- atlas painting ----------
 function tsPaintStatic(){const A=TSA,P=A.paint,txt=A.txt;
  const sg=(k,t,bg,fg,sz)=>P(k,(x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(0,0,W,5);txt(x,t,W/2,H/2+3,W-30,sz||60,fg)});
  sg('sTitle','TIRES · ALIGNMENT','#22252b','#ffffff',84);sg('sSub','BALANCE · ALIGN · REPAIR','#ffd34d','#1d0f02',64);sg('sREC','RECEPTION · CHECK-IN','#22252b','#ffd34d');sg('sPAY','INVOICES · PAY HERE','#22252b','#5cc98a');sg('sLNG','CUSTOMER LOUNGE','#163a5c','#eef3fb');
  // the rack labels: one tyre size per column
  const S=TYREJOBS.SIZES,col=[0,1,1,2,2,3,4,5];P('rack',(x,W,H)=>{x.fillStyle='#16181c';x.fillRect(0,0,W,H);for(let c=0;c<8;c++){const cx=c*128;x.fillStyle='#ffd34d';x.fillRect(cx+4,6,120,52);txt(x,S[col[c]][0],cx+64,33,112,24,'#16181c',800,A.MONO)}});
  // prices: the cheapest of each service today (same for everyone: the day's jobs from the engine)
  const E=TYREJOBS,d0=Math.floor(E.now()/86400)*86400,lo={};for(let g=Math.floor(d0/E.STEP);g<Math.floor(d0/E.STEP)+131;g++){const j=E.job(g),k=j.svc.startsWith('SWAP')?'SEASONAL SWAP':j.svc;if(!(lo[k]<=j.total))lo[k]=j.total}
  P('menu',(x,W,H)=>{x.fillStyle='#10161e';x.fillRect(0,0,W,H);x.strokeStyle='#e8b931';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);txt(x,'PRICES · FROM',W/2,44,W-40,40,'#ffd34d');
   const L=[['PUNCTURE REPAIR','plug-patch · balance'],['NEW TYRES ×2','fitted · valves · balance'],['NEW TYRES ×4','fitted · valves · balance'],['WHEEL BALANCING','all four wheels'],['WHEEL ALIGNMENT','4-wheel · report'],['SEASONAL SWAP','swap + tyre hotel']];
   L.forEach(([n,d],i)=>{const y=100+i*64;x.fillStyle=i%2?'#18212c':'#141c26';x.fillRect(18,y-26,W-36,56);txt(x,n,30,y-6,300,24,'#eef3fb',800,null,'left');txt(x,d,30,y+16,300,16,'#9aa3ae',600,null,'left');txt(x,lo[n]!=null?E.tc(lo[n]):'—',W-30,y,150,26,'#ffd34d',800,A.MONO,'right')});
   txt(x,'Torque Coins (TC) · display only for now',W/2,H-22,W-40,18,'#6b7280',600)})}
 const tsStock=(sz,t)=>8+SHOPS.h32('tstock',sz,Math.floor(t/86400))%16;
 function tsPaintStock(t){const A=TSA,txt=A.txt,E=TYREJOBS,d0=Math.floor(t/86400)*86400,used={};for(const j of E.invoices(t,60))if(j.t1>=d0&&j.svc.startsWith('NEW'))used[j.size]=(used[j.size]||0)+j.n;
  const A0=TS.A,need={};for(const a of A0)if(a&&a.s<=3&&a.j.svc.startsWith('NEW'))need[a.j.size]=(need[a.j.size]||0)+a.j.n;
  A.paint('stock',(x,W,H)=>{x.fillStyle='#10161e';x.fillRect(0,0,W,H);x.strokeStyle='#3a3f46';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);txt(x,'TYRES IN STOCK · SIZES',W/2,40,W-40,40,'#ffd34d');x.fillStyle='#ffd34d';x.fillRect(24,66,W-48,3);
   txt(x,'SIZE',34,90,120,18,'#9aa3ae',800,null,'left');txt(x,'FITTED TODAY',W-250,90,140,18,'#9aa3ae',800,null,'right');txt(x,'IN STOCK',W-34,90,120,18,'#9aa3ae',800,null,'right');
   E.SIZES.forEach((s,i)=>{const y=126+i*50,st=Math.max(0,tsStock(s[0],t)-(used[s[0]]||0)),nd=need[s[0]]||0;x.fillStyle=i%2?'#18212c':'#141c26';x.fillRect(18,y-22,W-36,44);
    txt(x,s[0],34,y+1,200,24,'#9fd0ff',800,A.MONO,'left');txt(x,`R${s[1]} · ${E.tc(s[2])} each`,236,y+1,170,17,'#eef3fb',600,null,'left');txt(x,String(used[s[0]]||0),W-250,y+1,80,22,'#ffb36b',800,A.MONO,'right');
    txt(x,nd?`${st} · ${nd} ON A CAR`:String(st),W-34,y+1,170,22,st>=4?'#5cc98a':'#ff6b5e',800,A.MONO,'right')});
   txt(x,'Sizes: width / profile R rim (inches) · DOT = week + year made',W/2,H-24,W-40,17,'#6b7280',600)})}
 // the alignment screen: the bay that is aligning now, otherwise the last car aligned
 function tsPaintAlign(a){const A=TSA,txt=A.txt;A.paint('align',(x,W,H)=>{x.fillStyle='#071a2d';x.fillRect(0,0,W,H);txt(x,a?`4-WHEEL ALIGNMENT · BAY ${a.j.bay+1} · ${a.j.no}`:'4-WHEEL ALIGNMENT · STANDBY',W/2,30,W-30,28,'#3ee08f');
   const j=a&&a.j,u=a?Math.min(1,a.inS/Math.max(1,a.j.st[7]-a.j.st[6])):1;
   ['FL','FR','RL','RR'].forEach((n,k)=>{const bx0=20+(k%2)*246,by=62+Math.floor(k/2)*104,v=j?Math.round(j.toe[k]*(1-bizEase(u*1.25))*10)/10:0,ok=Math.abs(v)<=.2;
    x.fillStyle=ok?'#1f5b3a':'#5b1f1f';x.fillRect(bx0,by,226,92);txt(x,`${n} TOE`,bx0+14,by+22,100,20,'#9aa3ae',800,null,'left');txt(x,`${v>0?'+':''}${v.toFixed(1)}°`,bx0+113,by+58,200,46,ok?'#3ee08f':'#ff5a4f',800,A.MONO)});
   txt(x,'SPEC 0.0° ± 0.2° · CAMBER −0.8° ± 0.5°',W/2,H-24,W-30,20,'#9fd0ff',700)})}
 // the balancer display: the weights it asks for (g / oz), then 0 g once balanced
 function tsPaintBal(k,a){const A=TSA,txt=A.txt;A.paint('bal'+k,(x,W,H)=>{x.fillStyle='#111827';x.fillRect(0,0,W,H);
   if(!a||a.s!==4){txt(x,'BALANCER',W/2,40,W-20,26,'#3a5a7a');txt(x,'READY',W/2,86,W-20,30,'#3ee08f',800,A.MONO);return}
   const j=a.j,u=a.inS/Math.max(1,j.st[5]-j.st[4]),gi=5+SHOPS.h32('bal',j.g)%30,go=5+SHOPS.h32('bal2',j.g)%25,oz=g=>(g*.035274).toFixed(2);
   if(u<.45){txt(x,'SPINNING…',W/2,30,W-20,24,'#ffd34d');txt(x,`IN ${gi} g · ${oz(gi)} oz`,W/2,70,W-16,24,'#ff5a4f',800,A.MONO);txt(x,`OUT ${go} g · ${oz(go)} oz`,W/2,102,W-16,24,'#ff5a4f',800,A.MONO)}
   else{txt(x,'BALANCED ✓',W/2,34,W-20,26,'#3ee08f');txt(x,'IN 0 g · OUT 0 g',W/2,84,W-16,26,'#3ee08f',800,A.MONO)}})}
 // ---------- per frame ----------
 // car height and place along the bay: rolls in, lift up for the tyre work (wheels off), down for READY, drives off
 function tsPose(a,t){if(!a)return{h:0,z:0,off:false};const j=a.j,s=a.s,H=1.15;let h=0,z=0;
  if(s>=1&&s<=6){const u0=(t-j.st[1])/5,u1=(j.st[7]-t)/5;h=H*bizEase(Math.min(u0,u1))}
  if(s===0)z=12*(1-bizEase(a.inS/8));else if(s===8)z=14*bizEase(a.out);return{h,z,off:j.wheels&&s>=2&&s<=4}}
 function syncTires(dt){const E=TYREJOBS,t=E.now(),A0=E.bays(t);TS.A=A0;TS.t=t;const o3=TS._o3||(TS._o3=new T.Object3D()),LZ=TSL.Z,MX=TSL.MX;
  TS.bays.forEach((L,k)=>{const a=A0[k];
   if(bizCar(L,a,TSL.CS)&&L.cur){const bb=TS._bb||(TS._bb=new T.Box3());L.car.updateMatrixWorld(true);bb.setFromObject(L.cur.g);L.hw=Math.max(.8,(bb.max.x-bb.min.x)/2*.92);L.hl=Math.max(1.2,(bb.max.z-bb.min.z)/2*.62)}
   const p=tsPose(a,t);L.h=p.h;L.z=LZ+p.z;L.car.position.set(L.x,p.h,L.z);L.car.visible=!!a&&!(a.s===8&&a.out>.98);
   L.wh.position.set(L.x,p.off?0:p.h,L.z);L.wh.visible=L.car.visible;if(L.cur&&L.cur.hub)L.cur.hub.visible=p.off&&p.h>.3;
   o3.position.set(L.x,p.h+.2,LZ);o3.rotation.set(0,0,0);o3.scale.setScalar(1);o3.updateMatrix();TS.arms.setMatrixAt(k,o3.matrix);
   // machines: a wheel on the changer (stage 3) and on the balancer (stage 4); the turntable and the balancer shaft spin
   const s=a?a.s:-1,mx=L.x+MX,on3=s===3,on4=s===4,spin=simTime*(on3?2.2:0);
   o3.position.set(mx,1.45,LZ+2.4);o3.rotation.set(Math.PI/2,0,spin);o3.scale.setScalar(on3?.95:0);o3.updateMatrix();TS.mw.setMatrixAt(k*2,o3.matrix);
   o3.position.set(mx-1.05,1.3,LZ-1.9);o3.rotation.set(on4&&a.inS/Math.max(1,a.j.st[5]-a.j.st[4])<.45?simTime*14:0,Math.PI/2,0);o3.scale.setScalar(on4?.95:0);o3.updateMatrix();TS.mw.setMatrixAt(k*2+1,o3.matrix);
   o3.position.set(mx,1.08,LZ+2.4);o3.rotation.set(0,spin,0);o3.scale.setScalar(1);o3.updateMatrix();TS.tt.setMatrixAt(k,o3.matrix);
   // alignment heads clamped on the four wheels (stage 6)
   const al=s===6;for(let w=0;w<4;w++){const sx=w%2?1:-1,sz=w<2?1:-1;o3.position.set(L.x+sx*(L.hw+.12),L.h+.5,L.z+sz*L.hl);o3.rotation.set(0,sx>0?0:Math.PI,0);o3.scale.setScalar(al?1:0);o3.updateMatrix();TS.cl.setMatrixAt(k*4+w,o3.matrix)}});
  TS.arms.instanceMatrix.needsUpdate=true;TS.mw.instanceMatrix.needsUpdate=true;TS.tt.instanceMatrix.needsUpdate=true;TS.cl.instanceMatrix.needsUpdate=true;
  tsBoards(A0,t);tsPeople(A0,t,dt)}
 function tsBoards(A0,t){const V=TS.v,E=TYREJOBS;let up=0;
  A0.forEach((a,k)=>{const key=a?[a.j.g,a.s,a.s<E.RD?Math.ceil(a.left/60):0,E.staffName(a.j),BIZP.who(E,a.j)].join('|'):'free'+Math.floor(t/E.STEP)+E.open();if(V['c'+k]!==key){V['c'+k]=key;BIZP.card(TSA,'card'+k,k,a,t,E,TSO.card);up=1}
   const bk=a&&a.s===4?a.j.g+':'+(a.inS/Math.max(1,a.j.st[5]-a.j.st[4])<.45?0:1):'-';if(V['b'+k]!==bk){V['b'+k]=bk;tsPaintBal(k,a);up=1}});
  const ak=A0.map(a=>a?a.j.g+':'+a.s+':'+(a.s<E.RD?Math.ceil(a.left/60):0)+':'+E.staffName(a.j):'-').join(',')+'#'+BIZP.hm(t);if(V.kan!==ak){V.kan=ak;BIZP.board(TSA,'kan',A0,t,E,TSO.board);up=1}
  const L=E.invoices(t,1),tk=(L[0]?L[0].g:'')+'#'+WALL.length+E.open();if(V.till!==tk){V.till=tk;BIZP.till(TSA,'till',t,E);BIZP.invoice(TSA,'inv',L[0]||null,E,TSO.inv);up=1}
  const sk=A0.map(a=>a?a.j.g+':'+(a.s<=3?1:0):'-').join(',')+tk;if(V.stock!==sk){V.stock=sk;tsPaintStock(t);up=1}
  const al=A0.find(a=>a&&a.s===6)||null,alk=al?al.j.g+':'+Math.floor(al.inS/4):'idle';if(V.al!==alk){V.al=alk;tsPaintAlign(al);up=1}
  if(up)TSA.tex.needsUpdate=true}
 // technicians go where their job needs them; customers check in, wait in the lounge, pay and collect
 const TS_IDLE=[[-20,-6.5,Math.PI],[-14,6.2,Math.PI],[9,6.2,Math.PI]];
 function tsPeople(A0,t,dt){const LZ=TSL.Z,MX=TSL.MX,E=TYREJOBS;TS.techJob=bizStaffJobs(E,A0,s=>s<=6);
  TS.tech.forEach((m,i)=>{const a=TS.techJob[i];let x,z,ang;if(a){const L=TS.bays[a.j.bay],s=a.s;
    if(s===0){x=L.x+2;z=LZ+7;ang=Math.PI}else if(s===1){x=L.x-3.4;z=LZ+1.2;ang=Math.PI/2}else if(s===2){x=L.x+(L.hw+.9);z=LZ+L.hl;ang=-Math.PI/2}
    else if(s===3){x=L.x+MX;z=LZ+3.7;ang=Math.PI}else if(s===4){x=L.x+MX-.2;z=LZ-.9;ang=Math.PI}else if(s===5){x=L.x-(L.hw+.9);z=LZ-L.hl+Math.sin(simTime*.4)*.4;ang=Math.PI/2}
    else{x=-2.6;z=5.4;ang=Math.PI}}
   else{[x,z,ang]=TS_IDLE[i]}bizMove(m,x,z,ang,dt);m.visible=true});
  putP(TS.clerk,{x:21,z:6.4,ang:Math.sin(simTime*.7)*.4},false);
  const staff=[0,1,2].map(i=>staffOf('pneus','Tire Technician',i)),cs=A0.filter(a=>a&&a.j.name&&!staff.includes(a.j.name)).slice(0,3),SEAT=[[22.4,10.2],[23.9,10.4],[25.4,10.2]];
  TS.cust.forEach((m,i)=>{const a=cs[i];m.visible=!!a;m.userData.a=a||null;if(!a){m.userData.p=null;return}const L=TS.bays[a.j.bay];let x,z,ang=Math.PI;
   if(a.s===0){const u=bizEase(a.inS/((a.j.st[1]-a.j.st[0])||1));x=L.x+(21-L.x)*u;z=(LZ+7)+(9-(LZ+7))*u}else if(a.s===7){x=13.4+i*.8;z=9.2}else if(a.s===8){x=L.x+2.4;z=L.z+4}else{[x,z]=SEAT[i]}
   if(!m.userData.p&&a.s!==0)m.userData.p={x,z};bizMove(m,x,z,ang,dt)})}
 function labelsTires(){const E=TYREJOBS;hctx.textAlign='center';hctx.textBaseline='middle';const sz=clamp(1100/cam.dist,14,26);
  TS.bays.forEach((L,k)=>{const a=TS.A[k];if(!a||!L.car.visible)return;const s=toHud(L.x,L.h+2.6,L.z);if(!s)return;const w=BIZP.who(E,a.j),sel=(TS.pin||TS.hover||{}).k===k;
   pill(w?'★ '+w:a.j.plate,s.x,s.y,sz*(sel?1.08:1),w?'rgba(255,122,26,.95)':'#fafafa',w?'#1d0f02':'#111',sel?'#ffffff':undefined)});
  TS.tech.forEach((m,i)=>bizStaffTag(m,E,i,TS.techJob&&TS.techJob[i]));
  TS.cust.forEach(m=>{const a=m.userData.a;if(!m.visible||!a)return;const w=BIZP.who(E,a.j);if(!w)return;tag(m.position.x,3.5,m.position.z,`★ ${w} · `+(a.s===0?'CHECKING IN':a.s===7?'PAYING '+E.tc(a.j.total):a.s===8?'COLLECTING THE CAR':'WAITING · '+a.j.no))});
  hctx.globalAlpha=1;lockedNote('pneus');header('INSIDE THE TIRE SHOP');
  bizPanelLine(bizLine(E,TS,TS.A,TS.techJob,'is between jobs · checking the tyre rack'),'#e8b931')}
