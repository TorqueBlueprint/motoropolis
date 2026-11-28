//@ interiors/oficina.js - INSIDE THE TORQUEBLUEPRINT REPAIR SHOP (Phase 3 step 1: the shop as a real business).
//@ Six lifts run the seeded job timetable of sim/shopjobs.js (SHOP): cars roll in, get diagnosed, quoted, approved, go up on the lift
//@ (wheels stay on the floor for brake / tyre / suspension / clutch jobs), get inspected, wait READY and drive off after the handover.
//@ Each lift has a hanging job card; the JOB BOARD (left wall) is a kanban of every active job; the parts corner (back right) has
//@ labelled bins with barcodes, the STOCK & ORDERS board and the counter; the invoice desk shows the latest invoice with its PAID
//@ stamp; the TILL board (back left) shows today's jobs and TC and the latest invoices. Mechanics are the residents with the Mechanic
//@ job (staffOf('oficina','Mechanic',k)); the panel line at the bottom says who is doing what (hover or click a car or a mechanic).
//@ Kept: the Wall of Mechanics, the bolt jar (1 bolt = 1 subscriber), crates, the unlockable gear with its blueprint ghosts, reception.
//@ Static furniture is merged into one vertex-coloured mesh and one atlas mesh (every card and board on one 2048 canvas, redrawn only
//@ when its content changes); the lift carriages are one instanced mesh; each car on a lift is re-baked into body / glass / wheels.
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- 3D interior: the TorqueBlueprint repair shop ----------
 let mode='city',fade=0,fadeTo=null,cityCam=null;
 const IN={scene:new T.Scene(),lifts:[],built:false,v:{},hover:null,pin:null,A:[],mech:[],cust:[]};
 const inHome={tx:0,tz:-3,yaw:.2,pitch:.34,dist:48};
 const OFL={X:[-17.5,-10.5,-3.5,3.5,10.5,17.5],Z:-4,RAISE:2.8,CS:1.55};
 // the shop's atlas (interiors/_bizkit.js): every card and board on one 2048 canvas
 const OFA=bizAtlas({card0:[0,0,384,256],card1:[384,0,384,256],card2:[768,0,384,256],card3:[0,256,384,256],card4:[384,256,384,256],card5:[768,256,384,256],
   stock:[1152,0,640,512],kan:[0,512,1280,720],inv:[1280,512,512,768],till:[0,1240,640,512],bins:[640,1240,1024,384],
   sPARTS:[640,1632,512,96],sREC:[1152,1632,512,96],sPAY:[640,1736,512,96],sLNG:[1152,1736,512,96]});
 const ofStageCol=['#7a8088','#2f6fd9','#e8b931','#3fa7c4','#ff7a1a','#7a3fb0','#2e8b57','#22252b'];
 const ofHM=ts=>{const d=new Date(ts*1000);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
 const ofWho=j=>j.name&&!SHOP.hidden(j.name)?j.name:null;
 const ofMin=s=>Math.max(1,Math.ceil(s/60))+' min';
 const ofKmMi=km=>`${Math.round(km).toLocaleString('en-US')} km / ${Math.round(km*.621371).toLocaleString('en-US')} mi`;
 if(location.hostname==='localhost')window.__SHOPDBG={IN,X:()=>X,T,SHOP,OFL};
 // ---------- the room ----------
 function buildInterior(){
  const S=IN.scene,RW=56,RD=24,RH=14,X0=-RW/2,Z0=-RD/2,{bx,cyl,quad,place}=OFG,LX=OFL.X,LZ=OFL.Z;
  S.background=new T.Color(0x0b1626);S.fog=new T.Fog(0x0b1626,70,140);
  S.add(new T.HemisphereLight(0xdfe9ff,0x2a2f38,.8));
  const key=new T.DirectionalLight(0xfff3e0,1.6);key.position.set(14,26,22);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-32,right:32,top:20,bottom:-20,near:2,far:80});key.shadow.bias=-.0006;S.add(key);
  for(const x of[-18,-6,6,18]){const pl=new T.PointLight(0xfff1d0,44,24,1.6);pl.position.set(x,RH-1,-2);S.add(pl)}
  // the atlas canvas (every card and board)
  const tex=OFA.init();ofPaintStatic();
  const V=[],A=[];
  const YEL=0xf2c12e,DARK=0x22252b,STEEL=0x8e98a4,RED=0xc8231c,ORANGE=0xff7a1a,WOOD=0x8a5a2b,TOP=0xe9e5dc;
  // floor, painted bays, walls
  bx(V,RW,.1,RD+8,0x8b9097,0,-.1,4);
  LX.forEach(x=>{bx(V,6.2,.02,9.6,0x6f757d,x,0,LZ);for(const dx of[-3.1,3.1])bx(V,.14,.03,9.6,0xffd34d,x+dx,0,LZ)});bx(V,RW,.03,.3,0xffd34d,0,0,5.6);
  bx(V,RW,RH,.5,0x1d3b5c,0,0,Z0);bx(V,.5,RH,RD,0x16304d,X0,0,0);bx(V,.5,RH,RD,0x16304d,-X0,0,0);
  for(let y=1;y<RH;y+=1.2)bx(V,RW-.2,.05,.05,0x24476d,0,y,Z0+.3);bx(V,RW,.5,.6,ORANGE,0,RH-3.1,Z0+.5);
  bx(V,44.8,5,.3,DARK,0,5.75,Z0+.45);
  // lifts: posts, bases, top beam, the hanging job card; a tool trolley and a drain pan by each
  LX.forEach((x,k)=>{for(const dx of[-2.6,2.6]){bx(V,.55,5.2,.55,YEL,x+dx,0,LZ);bx(V,.9,.15,.9,DARK,x+dx,0,LZ)}bx(V,5.75,.35,.55,YEL,x,5.2,LZ);
   for(const dx of[-.9,.9])bx(V,.07,.12,.07,STEEL,x+dx,5.55,LZ+.12);bx(V,2.24,1.52,.08,DARK,x,5.62,LZ+.1);quad(A,'card'+k,2.1,1.4,x,6.38,LZ+.15);
   bx(V,.85,.85,.55,RED,x+3.5,0,LZ+3.4);bx(V,.95,.06,.65,STEEL,x+3.5,.85,LZ+3.4);bx(V,.5,.12,.3,DARK,x+3.4,.91,LZ+3.4);cyl(V,.55,.55,.12,16,0xe8b931,x-1.8,.06,LZ+4.2)});
  // workbench (left) under the bolt jar, the job board on the left wall
  bx(V,4.5,1.5,2.2,WOOD,-25.3,0,-9.5);bx(V,4.7,.2,2.4,0xc08a4a,-25.3,1.5,-9.5);bx(V,1.75,.25,1.75,STEEL,-25.3,3.7,-9.5);
  bx(V,.22,6.5,11.2,DARK,X0+.36,4.05,-3);quad(A,'kan',10.7,6.02,X0+.5,7.3,-3,Math.PI/2);
  // back wall strips beside the Wall of Mechanics: the till (left) and the stock board (right)
  for(const s of[-1,1])bx(V,5.2,4.25,.22,DARK,s*25.2,5.48,Z0+.38);quad(A,'till',5,4,-25.2,7.6,Z0+.52);quad(A,'stock',5,4,25.2,7.6,Z0+.52);
  // parts corner: shelving along the back wall, labelled bins, the counter
  for(const x of[21.3,23.4,25.5,27.55])bx(V,.12,4.4,1.25,ORANGE,x,0,Z0+1.05);for(let lv=0;lv<5;lv++)bx(V,6.4,.08,1.25,STEEL,24.45,.1+lv*1.05,Z0+1.05);
  const BC=[0x2f6fd9,0xd93a2f,0xe8b931,0x8e949b,0x2e8b57,0xc79a62];let bi=0;for(let lv=0;lv<4;lv++)for(let b=0;b<6;b++){const x=21.85+b*1.03+(b>1?.04:0)+(b>3?.04:0),y=.18+lv*1.05,z=Z0+1.05;bx(V,.86,.62,.95,BC[(b+lv*2)%6],x,y,z);quad(A,'bins',.8,.2,x,y+.33,z+.48);A[A.length-1].bin=bi++}
  bx(V,6,1.1,1.2,0x5a6472,24.4,0,-7.4);bx(V,6.2,.1,1.4,TOP,24.4,1.1,-7.4);quad(A,'sPARTS',3.2,.6,24.4,.58,-6.79);bx(V,.9,.6,.08,DARK,25.6,1.2,-7.6);bx(V,.25,.18,.5,0x2b2f36,23.2,1.2,-7.3);
  bx(V,1.6,.9,1.0,0xc79a62,22.2,1.2,-7.5);
  // reception, the invoice desk (printer + the invoice on its stand), the lounge
  bx(V,4.6,1.1,1.2,ORANGE,20.3,0,6.4);bx(V,4.8,.1,1.4,TOP,20.3,1.1,6.4);quad(A,'sREC',3,.56,20.3,.58,7.01);bx(V,.9,.6,.08,DARK,19.4,1.2,6.2);
  bx(V,3.4,.95,1.2,0x2b3440,13.8,0,6.8);bx(V,3.5,.08,1.3,TOP,13.8,.95,6.8);bx(V,.95,.42,.7,0xdfe3e8,12.7,1.03,6.7);bx(V,.7,.04,.45,0xffffff,12.7,1.45,6.6);quad(A,'sPAY',2.9,.54,13.8,.5,7.41);
  bx(V,.12,1.5,.12,DARK,14.6,1.03,6.55);bx(V,2.2,3.25,.07,DARK,14.6,2.4,6.52);quad(A,'inv',2,3,14.6,4.02,6.57);
  bx(V,4.6,.75,1.5,0x2b5c8f,24,0,11.4);bx(V,4.6,1.5,.45,0x2b5c8f,24,0,12.2);bx(V,1.7,.45,.85,WOOD,24,0,9.7);bx(V,1.25,2.7,1.0,0xd93a2f,27.1,0,8.3);bx(V,.9,1.3,.05,0xbfe6ff,27.1,1.1,7.78);quad(A,'sLNG',2.6,.48,24,1.95,12.44);
  cyl(V,.3,.24,.7,12,0x6b4a2b,21.2,.35,11.6);cyl(V,.55,.35,1.1,10,0x2e7d4f,21.2,1.25,11.6);
  const sm=new T.Mesh(OFG.merge(V),OFM.vc);sm.castShadow=true;sm.receiveShadow=true;S.add(sm);
  const am=new T.Mesh(OFG.merge(A),new T.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.5,roughness:.85}));S.add(am);
  // the big sign + the Wall of Mechanics (back wall, above the lifts)
  S.add(sign('TORQUEBLUEPRINT REPAIR SHOP',22,2,'#ff7a1a','#1d0f02',0,RH-1.5,Z0+.4,0));
  IN.board=new T.Group();IN.board.position.set(0,8.25,Z0+.45);S.add(IN.board);IN.boardKey='';
  // the bolt jar (1 bolt = 1 subscriber), crates
  const jar=new T.Mesh(new T.CylinderGeometry(.8,.8,2,24,1,true),new T.MeshStandardMaterial({color:0xbfe9ff,transparent:true,opacity:.25,roughness:.05,metalness:.1,side:T.DoubleSide,depthWrite:false}));jar.position.set(-25.3,2.7,-9.5);S.add(jar);
  IN.boltGeo=new T.CylinderGeometry(.12,.12,.08,6);IN.boltMat=M(0xcfd9e5,{metalness:.7,roughness:.3});IN.bolts=null;IN.boltN=-1;IN.crates=null;IN.cratesN=-1;
  // lift carriages (arms + pads), one instanced mesh moved per frame
  {const L=[];for(const s of[-1,1]){bx(L,.8,.5,.8,0xd9a520,s*2.6,-.1,0);bx(L,1.3,.14,.32,STEEL,s*1.9,0,0);bx(L,.24,.16,3.5,STEEL,s*1.2,0,0);for(const e of[-1.6,1.6])cyl(L,.24,.24,.12,10,0x1b1d22,s*1.2,.22,e)}
   IN.arms=new T.InstancedMesh(OFG.merge(L),OFM.vc,6);IN.arms.castShadow=true;IN.arms.instanceMatrix.setUsage(T.DynamicDrawUsage);S.add(IN.arms)}
  LX.forEach((x,k)=>{const car=new T.Group();car.position.set(x,0,LZ);car.rotation.y=Math.PI;S.add(car);const wh=new T.Group();wh.position.set(x,0,LZ);wh.rotation.y=Math.PI;S.add(wh);
   IN.lifts.push({k,x,car,wh,cur:null,id:null,h:0,z:LZ,lazy:false})});
  // unlockable gear (each with its blueprint ghost): merged per state, rebuilt when the subscriber count crosses a milestone
  const G=[],gq=(n,name,fn,x,z,ry)=>G.push({n,name,fn,x,z,ry:ry||0});
  gq(10,'TOOL CHEST',L=>{bx(L,1.8,2.4,1,RED,0,0,0);for(let k=0;k<5;k++)bx(L,1.6,.06,.05,STEEL,0,.4+k*.42,.52)},-21.9,-10.6);
  gq(25,'TIRE RACK',L=>{for(let r=0;r<3;r++)for(let k=0;k<4;k++)cyl(L,.75,.75,.45,18,0x1b1c20,-1.5+k,.9+r*1.7,0,Math.PI/2);for(const y of[.1,1.8,3.5])bx(L,4.4,.12,.9,STEEL,0,y,0)},-26.6,0,Math.PI/2);
  gq(50,'AIR COMPRESSOR',L=>{cyl(L,.6,.6,2.2,18,RED,0,.8,0,0,0,Math.PI/2);bx(L,.9,.7,.7,DARK,0,1.4,0)},-24.3,4.6);
  gq(1000,'PAINT BOOTH',L=>{bx(L,7,5.6,.2,0x9fd4ff,0,0,2.4);bx(L,7,5.6,.2,0x9fd4ff,0,0,-2.4);bx(L,.2,5.6,5,0x9fd4ff,3.5,0,0);bx(L,7.4,.4,5.4,0x3ee08f,0,5.6,0)},-19,9.6);
  gq(5000,'DYNO',L=>{bx(L,4.6,.3,2.4,DARK,0,0,0);for(const dz of[-.6,.6])cyl(L,.35,.35,2,16,0xdfe5ec,dz*2.2,.35,0,Math.PI/2);bx(L,.2,2.4,.2,DARK,3,0,-1.4);bx(L,1.6,1,.15,0x0b3d2a,3,2.4,-1.4)},-8.5,9.6);
  IN.gear=G;IN.gearKey='';IN.gearM=[];
  // people: 5 mechanics, the receptionist, up to 3 waiting customers
  IN.mech=[0,1,2,3,4].map(i=>{const m=mkP(S,'#1d4fb8',60+i,'Mechanic');m.userData.p=null;return m});
  IN.rec=mkP(S,'#ff7a1a',30,'Receptionist');IN.cust=[0,1,2].map(i=>{const m=mkP(S,null,20+i,'civ');m.visible=false;m.userData.p=null;return m});
  // hover / click: the panel line for a car on a lift or a mechanic
  bizPointer('oficina',IN,ofHit);
  IN.built=true;
 }
 // ---------- atlas painting ----------
 function ofPaintStatic(){const A=OFA,P=A.paint,txt=A.txt;
  const sg=(k,t,bg,fg)=>P(k,(x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(0,0,W,5);txt(x,t,W/2,H/2+3,W-30,60,fg)});
  sg('sPARTS','PARTS COUNTER · STOCK & ORDERS','#22252b','#ffd34d');sg('sREC','RECEPTION · CHECK-IN','#1d0f02','#ff7a1a');sg('sPAY','INVOICES · PAY HERE','#22252b','#5cc98a');sg('sLNG','CUSTOMER LOUNGE','#163a5c','#eef3fb');
  // bin labels: SKU, part, barcode
  const sk=ofSkus();P('bins',(x,W,H)=>{x.fillStyle='#eef0f2';x.fillRect(0,0,W,H);for(let i=0;i<24;i++){const cx=(i%4)*256,cy=Math.floor(i/4)*64,p=sk[i%sk.length];x.fillStyle='#ffffff';x.fillRect(cx+3,cy+3,250,58);x.strokeStyle='#22252b';x.lineWidth=2;x.strokeRect(cx+3,cy+3,250,58);
   txt(x,p.sku,cx+58,cy+20,100,22,'#16181c',800,A.MONO);txt(x,p.n.toUpperCase(),cx+58,cy+45,104,15,'#4a4f57',700);A.bar(x,p.sku,cx+116,cy+9,132,46)}})}
 let OFSK=null;function ofSkus(){if(OFSK)return OFSK;const seen=new Map();for(let g=0;g<400;g++)for(const p of SHOP.job(g).parts)if(!seen.has(p.sku))seen.set(p.sku,p);OFSK=[...seen.values()].sort((a,b)=>a.sku<b.sku?-1:1);return OFSK}
 const ofStock=(sku,t)=>2+SHOP.h32('stock',sku,Math.floor(t/86400))%9;
 // job card, job board, till and invoice: the shared painters (interiors/_bizkit.js BIZP) with the repair shop's words
 const OFO={card:{bay:'LIFT',col:ofStageCol,dark:[2],pipW:50},
  board:{title:'JOB BOARD · TORQUEBLUEPRINT REPAIR SHOP',bay:'LIFT',cols:[['QUOTE',[0,1,2,3],'#e8b931'],['REPAIR',[4],'#ff7a1a'],['INSPECTION',[5],'#7a3fb0'],['READY',[6,7],'#2e8b57']]},
  inv:{name:'TORQUEBLUEPRINT REPAIR SHOP',rows:j=>{const who=ofWho(j);return[['INVOICE',`INV-${j.no.slice(2)} · JOB ${j.no}`],['DATE',`${new Date(j.t1*1000).toISOString().slice(0,10)} · ${ofHM(j.t1)}`],['CUSTOMER',who?`★ ${who}`:'Customer'],['VEHICLE',j.model],['PLATE',j.plate],['ODOMETER',ofKmMi(j.km)]]},
   lines:j=>j.parts.map(p=>[`${p.qty} × ${p.n}`,p.each*p.qty]).concat([[`Labour ${j.lab} h × ${j.rate} TC/h`,j.labTC]]),note:j=>j.svc+(j.wheels?' · WHEEL NUTS 120 N·m / 89 lb·ft':'')}};
 const ofPaintCard=(k,a,t)=>BIZP.card(OFA,'card'+k,k,a,t,SHOP,OFO.card);
 const ofPaintKanban=(A0,t)=>BIZP.board(OFA,'kan',A0,t,SHOP,OFO.board);
 function ofPaintStock(A0,t){const A=OFA,txt=A.txt,vanHere=typeof van!=='undefined'&&van&&!van.hidden&&van.state==='service'&&van.slot===B.oficina.parts;
  A.paint('stock',(x,W,H)=>{x.fillStyle='#10161e';x.fillRect(0,0,W,H);x.strokeStyle='#3a3f46';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);txt(x,'PARTS · STOCK & ORDERS',W/2,40,W-40,40,'#ffd34d');x.fillStyle='#ffd34d';x.fillRect(24,66,W-48,3);
   const need=new Map();for(const a of A0)if(a&&a.s<7)for(const p of a.j.parts){const q=need.get(p.sku)||{p,qty:0};q.qty+=p.qty;need.set(p.sku,q)}
   const rows=[...need.values()].sort((a,b)=>a.p.sku<b.p.sku?-1:1).slice(0,6);
   rows.forEach((r,i)=>{const y=96+i*44,st=ofStock(r.p.sku,t);x.fillStyle=i%2?'#18212c':'#141c26';x.fillRect(18,y-18,W-36,40);
    txt(x,r.p.sku,30,y+2,110,20,'#9fd0ff',700,A.MONO,'left');txt(x,r.p.n.toUpperCase(),150,y+2,236,20,'#eef3fb',700,null,'left');txt(x,`NEED ${r.qty}`,W-150,y+2,90,20,'#ffb36b',700,null,'right');txt(x,`STOCK ${st}`,W-30,y+2,110,20,st>=r.qty?'#5cc98a':'#ff6b5e',800,null,'right')});
   if(!rows.length)txt(x,'NO PARTS IN USE RIGHT NOW',W/2,180,W-60,26,'#6b7280',700);
   const oy=372;x.fillStyle='#22252b';x.fillRect(18,oy-24,W-36,40);txt(x,'ORDERED',34,oy-3,150,26,'#ff7a1a',800,null,'left');txt(x,isOpen('pecas')?(vanHere?'PARTS VAN AT THE DOOR · UNLOADING':'DELIVERED BY THE PARTS VAN'):'DELIVERED BY COURIER',W-34,oy-3,380,20,vanHere?'#5cc98a':'#9aa3ae',700,null,'right');
   const ord=A0.filter(a=>a&&a.j.ordered&&a.s>=2&&a.s<7).sort((a,b)=>a.j.t0-b.j.t0).slice(0,3);
   ord.forEach((a,i)=>{const j=a.j,y=oy+36+i*36,got=a.s>=4;txt(x,`${j.ordered.sku} · ${j.ordered.n.toUpperCase()}`,34,y,330,20,'#eef3fb',700,null,'left');txt(x,j.no,W-200,y,100,20,'#9fd0ff',700,A.MONO,'right');
    txt(x,got?'RECEIVED ✓':vanHere?'ARRIVING NOW':`DUE ${ofHM(j.st[4])}`,W-30,y,140,20,got?'#5cc98a':'#ffd34d',800,null,'right')});
   if(!ord.length)txt(x,'Nothing on order · every part in stock',W/2,oy+56,W-60,22,'#6b7280',600)})}
 const ofPaintTill=t=>BIZP.till(OFA,'till',t,SHOP);
 const ofPaintInvoice=j=>BIZP.invoice(OFA,'inv',j,SHOP,OFO.inv);
 // ---------- Wall of Mechanics (unchanged) ----------
 const BOARD_ROWS=5,BOARD_COLS=14,BOARD_PER=BOARD_ROWS*BOARD_COLS;
 function boardTex(names,page,pages){const W=4096,H=448,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.fillStyle='#5a3d22';x.fillRect(0,0,W,H);
  x.fillStyle='rgba(0,0,0,.35)';for(let i=14;i<W;i+=26)for(let j=14;j<H;j+=26){x.beginPath();x.arc(i,j,3,0,Math.PI*2);x.fill()}
  x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ffd34d';x.fillRect(W/2-560,10,1120,62);x.fillStyle='#071a2d';x.font="800 50px 'Barlow Condensed','Arial Narrow',sans-serif";x.fillText(`WALL OF MECHANICS · ${names.length} IN THE CITY`,W/2,42);
  if(pages>1){x.fillStyle='#ffd34d';x.font="800 34px 'Barlow Condensed',sans-serif";x.textAlign='right';x.fillText(`PAGE ${page+1}/${pages}`,W-30,42);x.textAlign='center'}
  if(!names.length){x.fillStyle='#eef3fb';x.font="700 64px 'Barlow Condensed',sans-serif";x.fillText('Comment WORKSHOP to get your name here',W/2,260);}
  const shown=names.slice(page*BOARD_PER,(page+1)*BOARD_PER),n=shown.length;
  const cols=Math.max(1,Math.min(BOARD_COLS,Math.ceil(n/BOARD_ROWS))),rows=Math.min(BOARD_ROWS,Math.max(1,Math.ceil(n/cols))),gw=(W-40)/cols,gh=(H-96)/BOARD_ROWS;
  const font=Math.min(56,gh*.62,gw/7.5);
  shown.forEach((nm,i)=>{const col=Math.floor(i/rows),row=i%rows;const px=20+col*gw+6,py=86+row*gh+5,w=gw-12,h=gh-10;x.fillStyle='#e9b531';x.fillRect(px,py,w,h);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(px,py+h-5,w,5);
   x.fillStyle='#2b1f05';let f=font;x.font=`800 ${f}px 'Barlow Condensed','Arial Narrow',sans-serif`;while(x.measureText(nm).width>w-16&&f>18){f-=2;x.font=`800 ${f}px 'Barlow Condensed','Arial Narrow',sans-serif`}
   let t=nm;while(x.measureText(t).width>w-16&&t.length>4)t=t.slice(0,-2)+'…';x.fillText(t,px+w/2,py+h/2+2)});
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t}
 // ---------- per frame ----------
 const ofEase=bizEase;
 // lift height and the car's place along the bay for a lift entry a at time t
 function ofLiftPose(a,t){if(!a)return{h:0,z:0,off:false};const j=a.j,R=OFL.RAISE;let h=0,z=0;
  if(a.s===4)h=R*ofEase(Math.min((t-j.st[4])/6,(j.st[5]-t)/6));else if(a.s===1)h=.9*ofEase(Math.min((t-j.st[1])/4,(j.st[2]-t)/4));
  if(a.s===0)z=12*(1-ofEase(a.inS/8));else if(a.s===7)z=14*ofEase(a.out);return{h,z,off:j.wheels&&a.s===4}}
 function syncInterior(dt){
  const sv=subs||0,t=SHOP.now(),A0=SHOP.lifts(t);IN.A=A0;IN.t=t;
  // wall of mechanics
  const pages=Math.max(1,Math.ceil(WALL.length/BOARD_PER)),page=Math.floor(simTime/8)%pages;const key=WALL.join('|')+'#'+page;if(key!==IN.boardKey){IN.boardKey=key;while(IN.board.children.length){const o=IN.board.children[0];IN.board.remove(o);if(o.material&&o.material.map){o.material.map.dispose();o.material.dispose()}}
   const pm2=new T.Mesh(new T.PlaneGeometry(44,4.8),new T.MeshStandardMaterial({map:boardTex(WALL,page,pages),roughness:.8}));pm2.position.z=.2;IN.board.add(pm2)}
  // bolts, crates, pallets
  const nb=sv%100;if(nb!==IN.boltN){IN.boltN=nb;if(IN.bolts)IN.scene.remove(IN.bolts);const im=new T.InstancedMesh(IN.boltGeo,IN.boltMat,Math.max(1,nb));const o=new T.Object3D();
   for(let i=0;i<nb;i++){const a=i*2.399,r=.62*Math.sqrt((i%9+.5)/9);o.position.set(-25.3+Math.cos(a)*r,1.82+Math.floor(i/9)*.1,-9.5+Math.sin(a)*r);o.rotation.set((i*.37)%.4,a,0);o.updateMatrix();im.setMatrixAt(i,o.matrix)}
   im.count=nb;IN.bolts=im;IN.scene.add(im)}
  const nc=Math.floor(sv/100)%10,np=Math.floor(sv/1000)%10,ck=nc+'/'+np;if(ck!==IN.cratesN){IN.cratesN=ck;if(IN.crates){IN.scene.remove(IN.crates);IN.crates.geometry.dispose();IN.crates=null}const L=[];
   for(let i=0;i<nc;i++)OFG.bx(L,1.1,.9,1.1,0xc08a4a,-25+(i%3)*1.25,Math.floor(i/3)*.92,-5.4);
   for(let i=0;i<np;i++){OFG.bx(L,1.8,.2,1.8,0x7a5126,-24.4,0,8-i*2.2);OFG.bx(L,1.6,1.4,1.6,0xc08a4a,-24.4,.2,8-i*2.2)}
   if(L.length){IN.crates=new T.Mesh(OFG.merge(L),OFM.vc);IN.crates.castShadow=true;IN.crates.receiveShadow=true;IN.scene.add(IN.crates)}}
  // the gear: one merged mesh for what is unlocked, one ghost mesh + one edge mesh for the rest
  const gk=IN.gear.map(g=>sv>=g.n?1:0).join('');if(gk!==IN.gearKey){IN.gearKey=gk;for(const m of IN.gearM){IN.scene.remove(m);m.geometry.dispose()}IN.gearM=[];const on=[],off=[];
   for(const g of IN.gear){const L=[];g.fn(L);OFG.place(L,g.x,g.z,g.ry);(sv>=g.n?on:off).push(...L)}
   if(on.length){const m=new T.Mesh(OFG.merge(on),OFM.vc);m.castShadow=true;m.receiveShadow=true;IN.gearM.push(m)}
   if(off.length){const e=OFG.edges(off);IN.gearM.push(new T.Mesh(OFG.merge(off),ghostMat),new T.LineSegments(e,edgeMat))}
   for(const m of IN.gearM)IN.scene.add(m)}
  // the six lifts
  const o3=IN._o3||(IN._o3=new T.Object3D());
  IN.lifts.forEach((L,k)=>{const a=A0[k],id=a?a.j.g:null;
   bizCar(L,a,OFL.CS);
   const p=ofLiftPose(a,t);L.h=p.h;L.z=OFL.Z+p.z;L.car.position.set(L.x,p.h,L.z);L.car.visible=!!a&&!(a.s===7&&a.out>.98);
   L.wh.position.set(L.x,p.off?0:p.h,L.z);L.wh.visible=L.car.visible;if(L.cur&&L.cur.hub)L.cur.hub.visible=p.off&&p.h>.3;
   o3.position.set(L.x,p.h+.2,OFL.Z);o3.updateMatrix();IN.arms.setMatrixAt(k,o3.matrix)});
  IN.arms.instanceMatrix.needsUpdate=true;
  // the boards (redrawn only when what they show changes)
  ofBoards(A0,t);
  // people
  ofPeople(A0,t,dt);
 }
 function ofBoards(A0,t){const V=IN.v,up=[];const mn=SHOP.mechName,vanHere=typeof van!=='undefined'&&van&&!van.hidden&&van.state==='service'&&van.slot===B.oficina.parts?1:0;
  A0.forEach((a,k)=>{const key=a?[a.j.g,a.s,a.s<6?Math.ceil(a.left/60):0,mn(a.j),ofWho(a.j)].join('|'):'free'+Math.floor(t/SHOP.STEP);if(V['c'+k]!==key){V['c'+k]=key;ofPaintCard(k,a,t);up.push(1)}});
  const ak=A0.map(a=>a?a.j.g+':'+a.s+':'+(a.s<6?Math.ceil(a.left/60):0)+':'+mn(a.j):'-').join(',');
  const kk=ak+'#'+ofHM(t);if(V.kan!==kk){V.kan=kk;ofPaintKanban(A0,t);up.push(1)}
  const sk=A0.map(a=>a?a.j.g+':'+a.s:'-').join(',')+'#'+vanHere+isOpen('pecas');if(V.stock!==sk){V.stock=sk;ofPaintStock(A0,t);up.push(1)}
  const L=SHOP.invoices(t,1),tk=(L[0]?L[0].g:'')+'#'+WALL.length;if(V.till!==tk){V.till=tk;ofPaintTill(t);ofPaintInvoice(L[0]||null);up.push(1)}
  if(up.length)OFA.tex.needsUpdate=true}
 // mechanics go where their job needs them; customers check in, wait, pay and collect
 const ofMove=bizMove;
 const OF_IDLE=[[-23.6,-7.6,Math.PI],[-21.6,-8.8,Math.PI],[-22.4,2.8,1.2],[24.6,-5.6,Math.PI],[26,7.2,-1.2]];
 function ofPeople(A0,t,dt){const LZ=OFL.Z,mt=[];
  for(let m=0;m<5;m++){let best=null,pr=-1;for(const a of A0){if(!a||a.j.mech!==m)continue;const q=[1,3,0,2,5,4,0,0][a.s];if(q>pr){pr=q;best=a}}mt.push(pr>0?best:null)}
  IN.mechJob=mt;
  IN.mech.forEach((m,i)=>{const a=mt[i];let x,z,ang;if(a){const L=IN.lifts[a.j.lift];const s=i%2?1:-1;
    if(a.s===4){if(L.h>1.4){x=L.x+s*.55;z=LZ+.9+(i%3)*.3;ang=Math.PI+Math.sin(simTime*.8+i)*.6}else{x=L.x+s*2.0;z=LZ+3.4;ang=Math.PI}}
    else if(a.s===1){x=L.x+s*1.0;z=LZ+4.6;ang=Math.PI}else if(a.s===5){x=L.x-1.9;z=LZ+2.0;ang=Math.PI/2}else if(a.s===3){x=22.4+i*.8;z=-6.2;ang=Math.PI}else{x=L.x+1.8;z=LZ+6.6;ang=Math.PI}}
   else{[x,z,ang]=OF_IDLE[i]}
   ofMove(m,x,z,ang,dt);m.visible=true});
  putP(IN.rec,{x:20.3,z:5.2,ang:Math.sin(simTime*.7)*.4},false);
  // customers: residents only, the first three by lift
  const staff=[0,1,2,3,4].map(i=>staffOf('oficina','Mechanic',i)).concat(staffOf('oficina','Receptionist',0)),cs=A0.filter(a=>a&&a.j.name&&!staff.includes(a.j.name)).slice(0,3),SEAT=[[22.7,9.9],[24,10.1],[25.3,9.9]];
  IN.cust.forEach((m,i)=>{const a=cs[i];m.visible=!!a;m.userData.a=a||null;if(!a){m.userData.p=null;return}const L=IN.lifts[a.j.lift];let x,z,ang=Math.PI;
   if(a.s===0){const u=ofEase(a.inS/((a.j.st[1]-a.j.st[0])||1));x=L.x+(20.3-L.x)*u;z=(LZ+7)+(8-(LZ+7))*u}else if(a.s===2){x=19.4+i*.9;z=8;}else if(a.s===6){x=13.4+i*.8;z=8.2}else if(a.s===7){x=L.x+2.4;z=L.z+4;ang=Math.PI}else{[x,z]=SEAT[i];ang=Math.PI}
   if(!m.userData.p&&a.s!==0)m.userData.p={x,z};ofMove(m,x,z,ang,dt)})}
 // hover / click: nearest car on a lift or mechanic on screen
 function ofHit(hx,hy){let best=null,bd=1e9;
  IN.lifts.forEach((L,k)=>{if(!IN.A[k]||!L.car.visible)return;const p=toHud(L.x,L.h+1.4,L.z),p2=toHud(L.x+2.4,L.h+1.4,L.z);if(!p||!p2)return;const r=Math.max(30,Math.hypot(p2.x-p.x,p2.y-p.y)),d=Math.hypot(hx-p.x,hy-p.y);if(d<r&&d<bd){bd=d;best={k}}});
  IN.mech.forEach((m,i)=>{const p=toHud(m.position.x,1.6,m.position.z),p2=toHud(m.position.x,4.6,m.position.z);if(!p||!p2)return;const r=Math.max(26,Math.abs(p2.y-p.y)*.7);const d=Math.min(Math.hypot(hx-p.x,hy-p.y),Math.hypot(hx-p2.x,hy-p2.y));if(d<r&&d<bd){bd=d;best={m:i}}});
  return best}
 function ofPanelLine(){const sel=IN.pin||IN.hover;let a=null,m=null;
  if(sel&&sel.k!=null)a=IN.A[sel.k];else if(sel&&sel.m!=null){m=sel.m;a=IN.mechJob&&IN.mechJob[m]}
  if(sel&&sel.m!=null&&!a){const n=staffOf('oficina','Mechanic',m);return n?(SHOP.hidden(n)?null:`${n} is between jobs · back at the workbench`):'MECHANIC · JOB OPEN · Comment WORKSHOP MECHANIC'}
  if(!a){const L=IN.A.filter(q=>q&&q.s<7),R=L.filter(q=>q.s===4),P=R.length?R:L;if(!P.length)return'All lifts are free · the next car is on its way';a=P[Math.floor(simTime/6)%P.length]}
  return SHOP.line(a.j,a.s,a.left)}
 function drawInteriorLabels(){hctx.textAlign='center';hctx.textBaseline='middle';const sz=clamp(1100/cam.dist,14,26),LZ=OFL.Z;
  for(const gq of IN.gear){if(subs>=gq.n)continue;const s=toHud(gq.x,4.4,gq.z);if(s)pill(`${gq.name} · UNLOCKS AT ${gq.n.toLocaleString('en-US')} SUBS`,s.x,s.y,sz*.85,'rgba(15,47,92,.92)','#c8defa','#9fd0ff')}
  IN.lifts.forEach((L,k)=>{const a=IN.A[k];if(!a||!L.car.visible)return;const s=toHud(L.x,L.h+2.5,L.z);if(!s)return;const who=ofWho(a.j),sel=(IN.pin||IN.hover||{}).k===k;
   pill(who?'★ '+who:a.j.plate,s.x,s.y,sz*(sel?1.08:1),who?'rgba(255,122,26,.95)':'#fafafa',who?'#1d0f02':'#111',sel?'#ffffff':undefined)});
  const s=toHud(-25.3,4.6,-9.5);if(s)pill('1 BOLT = 1 SUBSCRIBER',s.x,s.y,sz*.85,'rgba(16,19,24,.85)','#ffd34d');
  // job tags: mechanics, receptionist, customers
  IN.mech.forEach((m,i)=>{const n=staffOf('oficina','Mechanic',i),a=IN.mechJob&&IN.mechJob[i];tag(m.position.x,4.6,m.position.z,n?`★ ${n} · MECHANIC${a?' · '+a.j.no:''}`:'MECHANIC · JOB OPEN · Comment WORKSHOP MECHANIC',n?'rgba(46,139,87,.95)':'rgba(16,19,24,.8)',n?'#fff':'#9aa3ae')});
  {const n=staffOf('oficina','Receptionist',0);tag(IN.rec.position.x,4.4,IN.rec.position.z,n?`★ ${n} · RECEPTIONIST`:'RECEPTIONIST · JOB OPEN · Comment WORKSHOP RECEPTIONIST',n?'rgba(46,139,87,.95)':'rgba(16,19,24,.8)',n?'#fff':'#9aa3ae')}
  IN.cust.forEach(m=>{const a=m.userData.a;if(!m.visible||!a)return;const who=ofWho(a.j);if(!who)return;tag(m.position.x,3.5,m.position.z,`★ ${who} · `+(a.s===0?'CHECKING IN':a.s===2?'APPROVING THE QUOTE '+SHOP.tc(a.j.total):a.s===6?'PAYING '+SHOP.tc(a.j.total):a.s===7?'COLLECTING THE CAR':'WAITING · '+a.j.no))});
  hctx.globalAlpha=1;
  // header
  hctx.font="800 30px 'Barlow Condensed', sans-serif";const t='INSIDE THE TORQUEBLUEPRINT REPAIR SHOP',w=hctx.measureText(t).width+44;hctx.fillStyle='rgba(16,19,24,.86)';rrect(hctx,HUDW/2-w/2,64,w,48,10);hctx.fill();hctx.fillStyle='#fff';hctx.fillText(t,HUDW/2,89);
  // the panel line: who is working on what (hover / click a car or a mechanic; otherwise it cycles through the jobs)
  bizPanelLine(ofPanelLine(),'#ff7a1a');
 }
