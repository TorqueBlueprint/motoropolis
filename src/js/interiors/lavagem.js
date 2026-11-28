//@ interiors/lavagem.js - INSIDE THE MOTOROPOLIS CAR WASH (Phase 3 step 2: the car wash as a business, engine WASHJOBS in sim/shopjobs.js).
//@ Two tunnel lanes, a Wash Attendant each (staffOf('lavagem','Wash Attendant',k)). A car every 9 min, 7.5-17 min each:
//@ QUEUE (pay at the kiosk) -> PRE-WASH (high-pressure arch) -> FOAM (the snow-foam arch: the car disappears under the foam) -> BRUSHES · RINSE
//@ -> DRY (blowers) -> VACUUM · VALET (the valet bay, Premium and Full valet only) -> READY -> DRIVEN OFF through the exit door.
//@ Packages on the MENU board (Basic / Premium / Full valet, TC prices); a job card on each lane's first arch; JOB BOARD + THE TILL on the back
//@ wall; the latest receipt with its PAID stamp at the kiosk. Water and foam particles are seeded (no Math.random) and only fly at a station
//@ with a car in it. Static parts: one vertex-coloured mesh + one atlas mesh; brushes, blowers and the foam blankets are instanced.
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- 3D interior: the car wash ----------
 const WS={scene:new T.Scene(),built:false,lanes:[],home:{tx:0,tz:-1,yaw:.32,pitch:.36,dist:44},v:{},hover:null,pin:null,A:[]};
 // where the car stands at each stage (x along the lane), the arches and the lanes
 const WSL={Z:[-4.2,4.2],POS:[-21,-14,-6,3,12,20.5,20.5],ARCH:[['PRE-WASH',-14,0x2f6fd9],['FOAM',-6,0xff7ad1],['BRUSHES · RINSE',3,0x46c8ff],['DRY',12,0xffd34d]],CS:1.55};
 const WSA=bizAtlas({card0:[0,0,384,320],card1:[384,0,384,320],menu:[768,0,640,640],inv:[1408,0,512,800],kan:[0,640,1280,720],till:[0,1360,640,512],
  sTitle:[640,1360,1024,112],sPay:[640,1472,512,96],sVal:[1152,1472,512,96],sExit:[640,1568,512,96],sWait:[1152,1568,512,96]});
 const wsStageCol=['#7a8088','#2f6fd9','#e05fb4','#3fa7c4','#e8b931','#7a3fb0','#2e8b57','#22252b'];
 const wsF=c=>Math.round(c*9/5+32);
 const WSO={card:{bay:'LANE',free:'FREE',col:wsStageCol,dark:[4],readyTxt:'READY TO DRIVE OFF',doneTxt:'DRIVEN OFF ✓',
   rows:(x,A,j)=>{const txt=A.txt;x.fillStyle='#e4f1f7';x.fillRect(14,186,356,60);txt(x,j.inc.join(' · '),192,202,340,17,'#16181c',700);
    txt(x,`WATER ${j.water} L · ${j.gal} gal  ·  ${j.temp} °C · ${wsF(j.temp)} °F`,192,228,340,18,'#4a4f57',700,A.MONO)}},
  board:{title:'JOB BOARD · MOTOROPOLIS CAR WASH',bay:'LANE',cols:[['QUEUE',[0],'#e8b931'],['WASHING',[1,2,3,4],'#3fa7c4'],['VALET',[5],'#7a3fb0'],['READY',[6,7],'#2e8b57']],readyTxt:'READY · KEYS AT THE EXIT',doneTxt:'DRIVEN OFF · PAID ✓',foot:'Hover or click a car in a lane to see who is washing it'},
  inv:{name:'MOTOROPOLIS CAR WASH',doc:'RECEIPT',accent:'#3fa7c4',docCol:'#1f7a96',head:'PROGRAMME',rows:j=>{const w=BIZP.who(WASHJOBS,j);return[['RECEIPT',`RC-${j.no.slice(2)} · JOB ${j.no}`],['DATE',`${new Date(j.t1*1000).toISOString().slice(0,10)} · ${BIZP.hm(j.t1)}`],['CUSTOMER',w?`★ ${w}`:'Customer'],['VEHICLE',j.model],['PLATE',j.plate],['LANE',`LANE ${j.bay+1} · ${Math.round((j.t1-j.t0)/60)} min`]]},
   lines:j=>j.lines.map(p=>[`${p.qty} × ${p.n}`,p.each*p.qty]),note:j=>`WATER ${j.water} L / ${j.gal} gal · FOAM ${j.foam} L / ${(j.foam*1.05669).toFixed(2)} qt · ${j.temp} °C / ${wsF(j.temp)} °F`}};
 function buildWash(){
  const S=WS.scene;bizScene(S,{bg:0x07182b,sky:0xd6f1ff,key:0xe8f6ff,light:0xbfeaff,lampI:35,h:8});
  const RW=52,RD=20,RH=8,X0=-RW/2,Z0=-RD/2,{bx,cyl,quad}=OFG,A=WSA;A.init();wsPaintStatic();
  const V=[],Q=[],q=(k,w,h,x,y,z,ry)=>quad(Q,k,w,h,x,y,z,ry,0,A);
  // glossy wet floor (its own material), tiled walls, the neon strip, the exit doors
  const fl=new T.Mesh(new T.PlaneGeometry(RW,RD+8),M(0x5f6b78,{roughness:.25,metalness:.2}));fl.rotation.x=-Math.PI/2;fl.position.set(0,0,4);fl.receiveShadow=true;S.add(fl);
  bx(V,RW,RH,.5,0xdfeaf2,0,0,Z0);bx(V,.5,RH,RD,0xbcd3e3,X0,0,0);bx(V,.5,RH,RD,0xbcd3e3,-X0,0,0);
  for(let x=X0+1;x<-X0;x+=2)bx(V,.04,RH-.2,.04,0xa9c2d6,x,0,Z0+.28);for(let y=1;y<RH;y+=1)bx(V,RW-.2,.04,.04,0xa9c2d6,0,y,Z0+.28);
  const neon=new T.Mesh(new T.BoxGeometry(RW-1,.18,.18),M(0x46c8ff,{emissive:0x46c8ff,emissiveIntensity:1.6}));neon.position.set(0,RH-1.2+.09,Z0+.45);S.add(neon);
  bx(V,15.3,1.5,.25,0x062a36,0,5.25,Z0+.4);q('sTitle',15,1.3,0,6,Z0+.56);
  for(const lz of WSL.Z){bx(V,.2,5.6,4.4,0x111a24,-X0-.32,0,lz);bx(V,.3,.35,4.8,0x3fa7c4,-X0-.36,5.6,lz);bx(V,.3,5.6,.3,0x3fa7c4,-X0-.36,0,lz-2.3);bx(V,.3,5.6,.3,0x3fa7c4,-X0-.36,0,lz+2.3)}
  q('sExit',3.2,.6,-X0-.55,6.5,0,-Math.PI/2);
  // the lanes: conveyor, guide rails, the four arches (each lane's job card hangs on its first arch)
  WSL.Z.forEach((lz,k)=>{bx(V,46,.06,2.6,0x2b333d,-1,0,lz);for(let x=-23;x<22;x+=.9)bx(V,.2,.1,2.4,0x8e98a4,x,.05,lz);for(const dz of[-1.6,1.6])bx(V,46,.25,.25,0xffd34d,-1,0,lz+dz);
   for(const[name,x,col]of WSL.ARCH){for(const dz of[-3,3])bx(V,.45,5.4,.45,col,x,0,lz+dz);bx(V,.6,.5,6.5,col,x,5.4,lz);
    if(name==='PRE-WASH'||name==='BRUSHES · RINSE')for(let n=-2;n<=2;n++)bx(V,.18,.14,.18,0x22252b,x,5.25,lz+n*1.1);
    if(name==='FOAM'){for(let n=-2;n<=2;n++)cyl(V,.16,.22,.4,8,0xffffff,x,5.1,lz+n*1.1);bx(V,.7,1.4,.5,0xd94fa6,x,0,lz+3.6)}
    bx(V,.7,1.2,.45,0x22252b,x+.9,0,lz+3.4);bx(V,.5,.3,.05,0x3ee08f,x+.9,1.0,lz+3.64)}
   bx(V,2.3,1.6,.08,0x22252b,-14,6,lz+3.3);q('card'+k,2.1,1.75,-14,6.85,lz+3.36);
   // the valet bay: vacuum column, hose, mats rack
   const vx=20.5;bx(V,.6,3,.6,0xd93a2f,vx-3.2,0,lz+3.1);cyl(V,.06,.06,2.6,6,0x22252b,vx-2.2,2.6,lz+2.8,0,0,Math.PI/2.4);bx(V,1.1,.08,.6,0x8e98a4,vx-3.2,3.0,lz+3.1);
   bx(V,.12,1.1,.8,0x8e98a4,vx+3.6,0,lz+3.2);bx(V,.6,.8,.05,0x2b2f36,vx+3.6,.6,lz+3.2)});
  q('sVal',3,.56,20.5,6.9,0.05);bx(V,3.2,.76,.12,0x22252b,20.5,6.52,0);
  // menu board (front left, facing the camera), pay kiosk with the receipt stand, waiting bench, job board + till (back wall)
  bx(V,.25,2.6,.25,0x22252b,-17,0,9.2);bx(V,4.4,4.4,.2,0x22252b,-17,2.4,9.1);q('menu',4.2,4.2,-17,4.6,9.22);
  bx(V,2.4,2.2,1.2,0x22252b,-23.5,0,8);bx(V,1.2,.8,.08,0x111827,-23.5,1.3,8.62);bx(V,2.2,.75,.12,0x22252b,-23.5,2.36,8.62);q('sPay',2.1,.6,-23.5,2.73,8.69);
  bx(V,.12,1.5,.12,0x22252b,-21,0,8.6);bx(V,2.2,3.25,.07,0x22252b,-21,1.5,8.55);q('inv',2,3.125,-21,3.12,8.6);
  for(let k=0;k<4;k++){const cx=-3.3+k*1.5;bx(V,1.1,.12,1.1,0x2f6fd9,cx,.85,10.6);bx(V,1.1,1,.15,0x2f6fd9,cx,.85,11.15);bx(V,.1,.85,.1,0x22252b,cx,0,10.6)}q('sWait',3,.5,-1,2.3,11.25);
  bx(V,11.2,6.3,.22,0x22252b,-15.5,1.3,Z0+.38);q('kan',10.7,6.02,-15.5,4.45,Z0+.52);bx(V,5.2,4.3,.22,0x22252b,16.5,1.8,Z0+.38);q('till',5,4,16.5,3.95,Z0+.52);
  for(const px of[X0+1.4,-X0-1.4]){cyl(V,.55,.42,.9,12,0x8a5a3a,px,.45,11);V.push({g:new T.IcosahedronGeometry(.9,0),c:0x3f8f45,m:OFG.xf(px,1.6,11,0,0,0,1,1.3,1)})}
  const sm=new T.Mesh(OFG.merge(V),OFM.vc);sm.castShadow=true;sm.receiveShadow=true;S.add(sm);S.add(new T.Mesh(OFG.merge(Q),A.mat()));
  // brushes (2 standing per lane + a top one), blowers: instanced, spun per frame
  {const L=[];cyl(L,.75,.75,3.6,14,0x2f8fe0,0,2,0);for(let k=0;k<10;k++)bx(L,.08,3.6,1.6,0x7fd0ff,0,.2,0,k*Math.PI/10);WS.br=new T.InstancedMesh(OFG.merge(L),OFM.vc,4);WS.br.instanceMatrix.setUsage(T.DynamicDrawUsage);S.add(WS.br)}
  {const L=[];cyl(L,.6,.6,4.4,14,0x2f8fe0,0,0,0,Math.PI/2);for(let k=0;k<10;k++)bx(L,1.3,.08,4.4,0x7fd0ff,0,-.04,0,0,k*Math.PI/10);WS.top=new T.InstancedMesh(OFG.merge(L),OFM.vc,2);WS.top.instanceMatrix.setUsage(T.DynamicDrawUsage);S.add(WS.top)}
  {const L=[];cyl(L,.7,.7,.25,6,0x22252b,0,0,0,Math.PI/2);bx(L,1.3,.1,.14,0x8e98a4,0,0,.15);bx(L,.14,1.3,.1,0x8e98a4,0,0,.15);WS.fan=new T.InstancedMesh(OFG.merge(L),OFM.vc,4);WS.fan.instanceMatrix.setUsage(T.DynamicDrawUsage);S.add(WS.fan)}
  // the snow-foam blanket: seeded blobs over a car-sized dome (scaled per car), one instance per lane
  {const r=SHOPS.rng(SHOPS.h32('foam')),L=[];for(let i=0;i<90;i++){const a=r()*Math.PI*2,u=r(),x=Math.cos(a)*Math.sqrt(u),z=Math.sin(a)*Math.sqrt(u),y=Math.sqrt(Math.max(0,1-x*x-z*z))*.95+.05,s=.16+r()*.16;
    L.push({g:new T.IcosahedronGeometry(1,0),c:r()<.25?0xffd9f0:0xffffff,m:OFG.xf(x,y,z,r(),r(),0,s*1.3,s,s)})}
   WS.foam=new T.InstancedMesh(OFG.merge(L),new T.MeshStandardMaterial({vertexColors:true,roughness:1,emissive:0x8a8a90,emissiveIntensity:.35,flatShading:true}),2);WS.foam.instanceMatrix.setUsage(T.DynamicDrawUsage);S.add(WS.foam)}
  // water and foam particles: seeded, only at the stations with a car in them
  const mkPts=(n,size,op)=>{const g=new T.BufferGeometry(),pos=new Float32Array(n*3),col=new Float32Array(n*3);g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(col,3));
   const p=new T.Points(g,new T.PointsMaterial({size,vertexColors:true,transparent:true,opacity:op,depthWrite:false}));p.frustumCulled=false;S.add(p);return p};
  WS.pts=mkPts(600,.22,.85);WS.fpts=mkPts(360,.42,.95);{const r=SHOPS.rng(SHOPS.h32('wash-fx'));WS.seeds=new Float32Array(1200);for(let i=0;i<1200;i++)WS.seeds[i]=r()}
  WSL.Z.forEach((lz,k)=>{const car=new T.Group();car.rotation.y=Math.PI/2;S.add(car);const wh=new T.Group();wh.rotation.y=Math.PI/2;S.add(wh);WS.lanes.push({k,z:lz,car,wh,cur:null,id:null,lazy:false,x:-21,hw:1.2,hl:2.2,hh:1.6})});
  WS.att=[0,1].map(i=>{const m=mkP(S,'#3fa7c4',40+i,'Wash Attendant');m.userData.p=null;return m});
  WS.cust=[0,1].map(i=>{const m=mkP(S,null,42+i,'civ');m.visible=false;m.userData.p=null;return m});
  bizPointer('lavagem',WS,(hx,hy)=>bizHit(hx,hy,WS.lanes.filter(L=>WS.A[L.k]&&L.car.visible).map(L=>({k:L.k,x:L.x,y:1.6,z:L.z,r:2.4})),WS.att));
  WS.built=true}
 function wsPaintStatic(){const A=WSA,P=A.paint,txt=A.txt;
  const sg=(k,t,bg,fg,sz)=>P(k,(x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(0,0,W,5);txt(x,t,W/2,H/2+3,W-30,sz||60,fg)});
  sg('sTitle','MOTOROPOLIS CAR WASH','#3fa7c4','#062a36',84);sg('sPay','PAY HERE · KIOSK','#ffd34d','#1d0f02');sg('sVal','VACUUM · VALET','#7a3fb0','#ffffff');sg('sExit','EXIT ▶','#2e8b57','#ffffff');sg('sWait','WAITING AREA','#163a5c','#eef3fb');
  // the menu: the three packages with what they include, price and time
  const PK=[['BASIC WASH','#3fa7c4',12,'≈ 8 min',['Pre-wash + snow foam','Brushes + rinse','Air dry']],['PREMIUM WASH','#e05fb4',24,'≈ 11 min',['Basic + wheels + underbody','Hot wax','Quick vacuum']],['FULL VALET','#7a3fb0',48,'≈ 17 min',['Premium wash','Interior vacuum + mats','Dashboard, glass, tyre shine']]];
  P('menu',(x,W,H)=>{x.fillStyle='#071a2d';x.fillRect(0,0,W,H);x.strokeStyle='#46c8ff';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);txt(x,'WASH MENU',W/2,48,W-40,52,'#46c8ff');
   PK.forEach(([n,c,tc,tm,inc],i)=>{const y=100+i*170;x.fillStyle='#0d2740';x.fillRect(22,y,W-44,156);x.fillStyle=c;x.fillRect(22,y,12,156);txt(x,n,52,y+34,330,40,'#ffffff',800,null,'left');
    txt(x,`${tc} TC`,W-40,y+36,200,46,'#ffd34d',800,A.MONO,'right');inc.forEach((t,k)=>txt(x,'✓ '+t,56,y+78+k*26,W-260,22,'#c8defa',700,null,'left'));txt(x,tm,W-40,y+120,160,24,'#9fd0ff',700,null,'right')});
   txt(x,'Add-ons: air freshener 2 TC · tyre shine 4 TC · rain repellent 5 TC · large vehicle +4 TC',W/2,H-30,W-40,18,'#9aa3ae',600)})}
 // ---------- per frame ----------
 // the car's place along the lane at time t (it rolls between stations at the start of each stage; through the brushes it creeps)
 function wsPos(a,t){if(!a)return-21;const j=a.j,s=a.s,P=WSL.POS;if(s===7)return P[6]+10*bizEase(a.out);if(s===0)return P[0]-8*(1-bizEase(a.inS/6));
  let prev=P[s-1];for(let i=s-1;i>0&&j.st[i]===j.st[i+1];i--)prev=P[i-1];
  const d=j.st[s+1]-j.st[s],u=bizEase(Math.min(1,a.inS/Math.min(6,d*.5)));let x=prev+(P[s]-prev)*u;if(s===3)x+=4*bizEase(a.inS/Math.max(1,d))-2;return x}
 // how much foam is on the car (0..1): it builds up at the foam arch, stays, and the brushes and rinse take it off
 function wsFoam(a){if(!a)return 0;const j=a.j,s=a.s;if(s===2)return bizEase(a.inS/Math.max(1,(j.st[3]-j.st[2])*.45));if(s===3)return 1-bizEase(a.inS/Math.max(1,(j.st[4]-j.st[3])*.7));return 0}
 const WS_C={pre:new T.Color(0xbfe9ff),foam:new T.Color(0xffffff),pink:new T.Color(0xffd9f0),rinse:new T.Color(0x9fdcff)};
 function syncWash(dt){const E=WASHJOBS,t=E.now(),A0=E.bays(t);WS.A=A0;WS.t=t;const o3=WS._o3||(WS._o3=new T.Object3D());
  WS.lanes.forEach((L,k)=>{const a=A0[k];
   if(bizCar(L,a,WSL.CS)&&L.cur){const bb=WS._bb||(WS._bb=new T.Box3());L.car.updateMatrixWorld(true);bb.setFromObject(L.cur.g);L.hw=Math.max(.8,(bb.max.z-bb.min.z)/2);L.hl=Math.max(1.4,(bb.max.x-bb.min.x)/2);L.hh=Math.max(1,bb.max.y-bb.min.y)}
   const x=wsPos(a,t);L.x=x;L.car.position.set(x,.1,L.z);L.wh.position.set(x,.1,L.z);L.car.visible=L.wh.visible=!!a&&!(a.s===7&&a.out>.9);
   const s=a?a.s:-1,br=s===3,dr=s===4;
   for(let n=0;n<2;n++){o3.position.set(3,0,L.z+(n?2.1:-2.1));o3.rotation.set(0,br?simTime*9*(n?1:-1):0,0);o3.scale.setScalar(1);o3.updateMatrix();WS.br.setMatrixAt(k*2+n,o3.matrix)}
   o3.position.set(4.2,br?Math.max(1.6,L.hh+.55):3.4,L.z);o3.rotation.set(0,0,br?-simTime*8:0);o3.updateMatrix();WS.top.setMatrixAt(k,o3.matrix);
   for(let n=0;n<2;n++){o3.position.set(12,3.9,L.z+(n?1.4:-1.4));o3.rotation.set(0,0,dr?simTime*24:simTime*.3);o3.updateMatrix();WS.fan.setMatrixAt(k*2+n,o3.matrix)}
   const f=wsFoam(a);o3.position.set(x,.15,L.z);o3.rotation.set(0,0,0);o3.scale.set(f?L.hl*1.08*(.6+.4*f):0,f?(L.hh+.25)*f:0,f?L.hw*1.25*(.6+.4*f):0);o3.updateMatrix();WS.foam.setMatrixAt(k,o3.matrix);L.f=f});
  WS.br.instanceMatrix.needsUpdate=true;WS.top.instanceMatrix.needsUpdate=true;WS.fan.instanceMatrix.needsUpdate=true;WS.foam.instanceMatrix.needsUpdate=true;
  // particles: water at the pre-wash and the rinse, snow foam at the foam arch (pink and white), only where a car is
  {const p=WS.pts.geometry.attributes.position.array,c=WS.pts.geometry.attributes.color.array,sd=WS.seeds,N=600;let i=0;
   for(let k=0;k<N;k++){const lane=WS.lanes[k&1],a=A0[lane.k],s=a?a.s:-1,st=(k>>1)%2,on=st===0?s===1:s===3,ax=st===0?-14:3,r=sd[k],r2=sd[k+600];
    const ph=(simTime*1.6+r)%1;if(!on){p[i]=0;p[i+1]=-50;p[i+2]=0;i+=3;continue}
    p[i]=ax+(r2-.5)*1.4;p[i+1]=5.2-ph*5;p[i+2]=lane.z+(((r*97)%1)-.5)*5.4;const cc=st===0?WS_C.pre:WS_C.rinse;c[i]=cc.r;c[i+1]=cc.g;c[i+2]=cc.b;i+=3}
   WS.pts.geometry.attributes.position.needsUpdate=true;WS.pts.geometry.attributes.color.needsUpdate=true}
  {const p=WS.fpts.geometry.attributes.position.array,c=WS.fpts.geometry.attributes.color.array,sd=WS.seeds,N=360;let i=0;
   for(let k=0;k<N;k++){const lane=WS.lanes[k&1],a=A0[lane.k],on=a&&a.s===2,r=sd[k+200],r2=sd[k+500];if(!on){p[i]=0;p[i+1]=-50;p[i+2]=0;i+=3;continue}
    const ph=(simTime*.9+r)%1,sp=.25+ph*1.6;p[i]=-6+(r2-.5)*sp*1.6;p[i+1]=5-ph*ph*4.6;p[i+2]=lane.z+(((r*131)%1)-.5)*4.6*(.5+ph*.6);const cc=(k%4)?WS_C.foam:WS_C.pink;c[i]=cc.r;c[i+1]=cc.g;c[i+2]=cc.b;i+=3}
   WS.fpts.geometry.attributes.position.needsUpdate=true;WS.fpts.geometry.attributes.color.needsUpdate=true}
  wsBoards(A0,t);wsPeople(A0,t,dt)}
 function wsBoards(A0,t){const V=WS.v,E=WASHJOBS;let up=0;
  A0.forEach((a,k)=>{const key=a?[a.j.g,a.s,a.s<E.RD?Math.ceil(a.left/60):0,E.staffName(a.j),BIZP.who(E,a.j)].join('|'):'free'+Math.floor(t/E.STEP)+E.open();if(V['c'+k]!==key){V['c'+k]=key;BIZP.card(WSA,'card'+k,k,a,t,E,WSO.card);up=1}});
  const ak=A0.map(a=>a?a.j.g+':'+a.s+':'+(a.s<E.RD?Math.ceil(a.left/60):0)+':'+E.staffName(a.j):'-').join(',')+'#'+BIZP.hm(t);if(V.kan!==ak){V.kan=ak;BIZP.board(WSA,'kan',A0,t,E,WSO.board);up=1}
  const L=E.invoices(t,1),tk=(L[0]?L[0].g:'')+'#'+WALL.length+E.open();if(V.till!==tk){V.till=tk;BIZP.till(WSA,'till',t,E);BIZP.invoice(WSA,'inv',L[0]||null,E,WSO.inv);up=1}
  if(up)WSA.tex.needsUpdate=true}
 // attendants: wave the car in, pressure-wash it, run the foam and the brushes, vacuum it, hand over the keys; customers pay at the kiosk, wait, collect
 function wsPeople(A0,t,dt){const E=WASHJOBS;WS.attJob=bizStaffJobs(E,A0,s=>s<=6);
  WS.att.forEach((m,i)=>{const a=WS.attJob[i],L=WS.lanes[i],side=L.z+(L.z<0?3:2.9);let x,z,ang;if(a){const s=a.s;
    if(s===0){x=-18;z=side;ang=-Math.PI/2}else if(s===1){x=-14+Math.sin(simTime*.7)*1.2;z=side-.4;ang=Math.PI}else if(s===2){x=-4.6;z=side+.3;ang=Math.PI}else if(s===3){x=3.9;z=side+.2;ang=Math.PI}
    else if(s===4){x=13.4;z=side;ang=Math.PI}else if(s===5){x=L.x+Math.sin(simTime*.25)*L.hl*.6;z=L.z+L.hw+.8;ang=Math.PI}else{x=L.x-L.hl-1;z=L.z+L.hw+1;ang=Math.PI/2}}
   else{x=-21+i*1.6;z=6.2;ang=Math.PI}bizMove(m,x,z,ang,dt);m.visible=true});
  const staff=[0,1].map(i=>staffOf('lavagem','Wash Attendant',i));
  WS.cust.forEach((m,i)=>{const a=A0[i]&&A0[i].j.name&&!staff.includes(A0[i].j.name)?A0[i]:null;m.visible=!!a&&a.s<7;m.userData.a=a;if(!m.visible){m.userData.p=null;return}const L=WS.lanes[i];let x,z,ang=Math.PI;
   if(a.s===0){x=-23.5+i*.9;z=9.4;ang=Math.PI}else if(a.s===6){x=L.x+L.hl+.6;z=L.z+L.hw+1.3;ang=-Math.PI/2}else{x=-3.3+i*3;z=10.2;ang=Math.PI}
   if(!m.userData.p)m.userData.p={x:-24,z:11};bizMove(m,x,z,ang,dt)})}
 function drawWashLabels(){const E=WASHJOBS;hctx.textAlign='center';hctx.textBaseline='middle';const sz=clamp(1100/cam.dist,14,26);
  for(const[name,x,col]of WSL.ARCH){const s=toHud(x,6.6,-4.2);if(s)pill(name,s.x,s.y,sz*.9,'#'+col.toString(16).padStart(6,'0'),'#071a2d')}
  WS.lanes.forEach(L=>{const a=WS.A[L.k];if(!a||!L.car.visible)return;const s=toHud(L.x,L.hh+(L.f?1.6:1.2),L.z);if(!s)return;const w=BIZP.who(E,a.j),sel=(WS.pin||WS.hover||{}).k===L.k;
   pill(w?'★ '+w:a.j.plate,s.x,s.y,sz*(sel?1.08:1),w?'rgba(255,122,26,.95)':'#fafafa',w?'#1d0f02':'#111',sel?'#ffffff':undefined);pill(`${a.j.svc} · ${E.STAGES[a.s]}`,s.x,s.y+sz*1.35,sz*.75,'rgba(16,19,24,.85)',a.s===2?'#ffb3e0':'#9fdcff')});
  WS.att.forEach((m,i)=>bizStaffTag(m,E,i,WS.attJob&&WS.attJob[i]));
  WS.cust.forEach(m=>{const a=m.userData.a;if(!m.visible||!a)return;const w=BIZP.who(E,a.j);if(!w)return;tag(m.position.x,3.5,m.position.z,`★ ${w} · `+(a.s===0?'PAYING '+E.tc(a.j.total):a.s===6?'COLLECTING THE CAR':'WAITING · '+a.j.no))});
  if(!WS.A.some(Boolean)&&E.open()){const s=toHud(0,2,0);if(s)pill('Waiting for the next dirty car…',s.x,s.y,sz,'rgba(16,19,24,.85)','#c8defa')}
  hctx.globalAlpha=1;lockedNote('lavagem');header('INSIDE THE MOTOROPOLIS CAR WASH');
  bizPanelLine(bizLine(E,WS,WS.A,WS.attJob,'is between cars · topping up the snow foam'),'#46c8ff')}
