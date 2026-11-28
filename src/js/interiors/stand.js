//@ interiors/stand.js - INSIDE THE DEALERSHIP · MOTOROPOLIS MOTORS (Phase 3 step 3: the dealership as a business, engine DEALJOBS in sim/dealer.js).
//@ A bright showroom with a glossy floor: five cars on show (the city's car models, DEALJOBS.display: the same for everyone, new every
//@ day), the first on a slowly turning turntable under a ring light; a spec stand by each car (model name from MODELS, hp / kW,
//@ 0-100 km/h / 0-60 mph, kg / lb, top speed, km / mi, price in TC). Three sales desks (staffOf('stand','Car Salesman',k); desk 3 waits
//@ for a third salesman: JOB OPEN · Comment WORKSHOP CAR SALESMAN), each with its hanging deal card; the manager's glass office, the
//@ customer lounge (sofas, TV, coffee machine), the SOLD board, the sales leaderboard, TODAY (cars sold, TC), the finance desk with the
//@ latest sales contract and its SOLD stamp, the key cabinet (the sold car's key leaves its hook at the handover) and the delivery bay
//@ behind glass: the deal's car drives out of its roller door for the TEST DRIVE and comes back, gets a valet, then waits under a red
//@ ribbon with "READY FOR COLLECTION: <buyer>" and drives home after the key handover.
//@ Static parts: one vertex-coloured mesh, the glossy floor, the glass, the glow and one atlas mesh; cars are re-baked by OFC into
//@ body (+ wheels) and glass meshes; keys, ribbons and roller doors are instanced. Atlas text is redrawn only when it changes.
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== DEALERSHIP =====
 const DS={built:false,home:{tx:0,tz:-.5,yaw:.12,pitch:.36,dist:45},v:{},hover:null,pin:null,A:[],disp:[],del:[]};
 const DSL={CS:1.8,TT:[0,-3.4],TR:4.4,
  CARS:[[0,-3.4,0],[-13,-5.6,.6],[11.8,-4,-.6],[-9.8,4.1,-.38],[9.8,4.1,.38]],
  SPEC:[[-5.6,.9,.35],[-8.7,-1,.2],[7.2,.6,-.25],[-5.3,6.7,.3],[5.4,6.8,-.3]],
  DESK:[[-15,9.4],[-2.6,9.4],[11,9.4]],SPOT:[[24,-5.8],[24,2.2]],DOORX:27.7,FIN:[16.2,-9.4],LNG:[-23.6,6],OFF:[-23.4,-9.4]};
 const DSA=bizAtlas({card0:[0,0,384,352],card1:[384,0,384,352],card2:[768,0,384,352],
  spec0:[1152,0,288,384],spec1:[1440,0,288,384],spec2:[1728,0,288,384],spec3:[1152,384,288,384],spec4:[1440,384,288,384],target:[1728,384,288,200],coffee:[1728,584,288,184],
  n0:[1152,768,288,64],n1:[1440,768,288,64],n2:[1728,768,288,64],exit:[1152,832,896,160],
  sold:[0,352,1152,640],lead:[0,992,768,512],till:[768,992,640,512],inv:[1408,992,512,800],lng:[1408,1792,320,96],dbay:[1728,1792,320,96],
  tv:[0,1504,640,360],del0:[640,1504,768,120],del1:[640,1624,768,120],office:[640,1744,384,120],fin:[1024,1744,384,120],sTitle:[0,1864,1024,112],keys:[1024,1864,384,112],dsub:[1408,1888,640,160]});
 const dsStageCol=['#3fa7c4','#2f6fd9','#e8b931','#7a3fb0','#c8231c','#ff7a1a','#2e8b57','#22252b'];
 const dsKm=km=>`${Math.round(km).toLocaleString('en-US')} km · ${Math.round(km*.621371).toLocaleString('en-US')} mi`;
 const DSO={card:{bay:'DESK',free:'FREE',nextTxt:'NEXT CUSTOMER',col:dsStageCol,dark:[2],readyTxt:'READY FOR COLLECTION',doneTxt:'DRIVEN HOME ✓',
   rows:(x,A,j)=>{const txt=A.txt;x.fillStyle='#ebe7dc';x.fillRect(14,186,356,84);
    txt(x,`${j.list.toLocaleString('en-US')} TC − ${j.disc.toLocaleString('en-US')} · ${j.used?'USED':'NEW'} · ${dsKm(j.km)}`,192,200,340,19,'#16181c',800,A.MONO);
    txt(x,j.trade?`TRADE-IN: ${j.trade.m.n} · ${j.trade.val.toLocaleString('en-US')} TC`:'NO TRADE-IN',192,226,340,19,'#4a4f57',700);
    txt(x,j.fin?`FINANCE ${j.fin.n} × ${j.fin.mo.toLocaleString('en-US')} TC · ${j.fin.apr}% APR`:`CASH · ${j.due.toLocaleString('en-US')} TC DUE`,192,252,340,19,'#4a4f57',700)}},
  inv:{name:'MOTOROPOLIS MOTORS · SALES',doc:'SALES CONTRACT',accent:'#ff7a1a',head:'VEHICLE + EXTRAS',stamp:['SOLD','200,35,28'],
   rows:j=>{const w=BIZP.who(DEALJOBS,j);return[['CONTRACT',`${j.no} · ${j.stockNo}`],['DATE',`${new Date(j.st[4]*1000).toISOString().slice(0,10)} · ${BIZP.hm(j.st[4])}`],['BUYER',w?`★ ${w}`:'Customer'],['VEHICLE',`${j.used?'Used':'New'} · ${j.model}`],['PLATE',j.plate],['ODOMETER',dsKm(j.km)],['PAYMENT',j.fin?`Finance · ${j.fin.n} months · ${j.fin.apr}% APR`:'Cash']]},
   lines:j=>[['Vehicle · list price',j.list],['Discount',-j.disc]].concat(j.fees.map(f=>[f[0],f[2]])),
   note:j=>(j.trade?`TRADE-IN ${j.trade.m.n} −${j.trade.val.toLocaleString('en-US')} TC · `:'')+(j.fin?`DEPOSIT ${j.fin.dep.toLocaleString('en-US')} TC · ${j.fin.n} × ${j.fin.mo.toLocaleString('en-US')} TC`:`PAID IN FULL · ${j.due.toLocaleString('en-US')} TC`)}};
 // ---------- a display / delivery car: OFC re-bake, wheels merged into the body (2 draw calls), swapped when the model lands ----------
 function dsCar(H,key,m,col){if(H.key===key&&!(H.lazy&&OFC.glbReady(m)))return false;H.key=key;
  if(H.cur){H.g.remove(H.cur);H.cur.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry!==BOX&&(o.material===OFM.body||o.material===OFM.glass||o.material===OFM.vc))o.geometry.dispose()})}
  H.cur=null;H.lazy=false;if(!m)return true;const c=OFC.build({m,color:col});let root=c.g;
  if(c.wh){const body=root.children.find(o=>o.material===OFM.body),wm=c.wh.children[0];if(body&&wm){const a=body.geometry,b=wm.geometry,mg=new T.BufferGeometry();
    for(const k of['position','normal','color']){const A=a.attributes[k].array,Bv=b.attributes[k].array,o=new Float32Array(A.length+Bv.length);o.set(A);o.set(Bv,A.length);mg.setAttribute(k,new T.BufferAttribute(o,3))}
    mg.computeBoundingSphere();a.dispose();b.dispose();body.geometry=mg}if(c.hub){root.remove(c.hub);c.hub.geometry.dispose()}}
  root.scale.setScalar(DSL.CS);H.g.add(root);H.cur=root;H.lazy=c.lazy;const bb=DS._bb||(DS._bb=new T.Box3());root.updateMatrixWorld(true);bb.setFromObject(root);H.top=Math.max(1.2,bb.max.y-H.g.position.y);return true}
 // ---------- the room ----------
 function buildDeal(){const S=new T.Scene();DS.S=S;bizScene(S,{bg:0x101826,lamps:[-18,-6,6,18],h:11,lampI:30,sky:0xeef4ff});
  const RW=56,RD=24,RH=10.5,X0=-RW/2,Z0=-RD/2,{bx,cyl,quad}=OFG,A=DSA;A.init();dsPaintStatic();
  const V=[],Q=[],GL=[],GW=[],FLR=[],q=(k,w,h,x,y,z,ry)=>quad(Q,k,w,h,x,y,z,ry,0,A);
  const WHITE=0xf2f2ee,DARK=0x22252b,STEEL=0x9aa4b0,ORANGE=0xff7a1a,WOOD=0xb07a45,LEATHER=0x3a3f46,GRN=0x3f8f45,BLUE=0x1f3a6e;
  // glossy floor (its own material), big tiles; the delivery bay in dark epoxy with yellow lines
  bx(FLR,48,.1,RD+8,0xf3f3f0,-4,-.1,4);bx(FLR,8,.1,RD,0x5a6068,24,-.1,0);
  for(let k=-6;k<=5;k++)bx(V,.04,.012,RD+8,0xdedcd6,k*4,0,4);for(let k=-2;k<=4;k++)bx(V,48,.012,.04,0xdedcd6,-4,0,k*4);
  for(const z of[-9.4,-2.2,5.4])bx(V,7.6,.02,.16,0xffd34d,24,0,z);bx(V,.16,.02,RD-.4,0xffd34d,20.3,0,0);
  // walls: the left wall is glazed (bright panes), back wall white with a dark band, right wall with the two roller doors
  bx(V,RW,RH,.5,WHITE,0,0,Z0);bx(V,RW,.6,.6,DARK,0,RH-1.2,Z0+.5);bx(V,RW,.3,.55,ORANGE,0,RH-1.5,Z0+.5);
  bx(V,.5,RH,RD,0xe6e6e1,X0,0,0);for(let k=0;k<=5;k++)bx(V,.3,RH-1,.3,0x2a2f36,X0+.3,0,Z0+.6+k*(RD-1.2)/5);bx(V,.3,.3,RD,0x2a2f36,X0+.3,RH-1.2,0);bx(V,.3,.3,RD,0x2a2f36,X0+.3,.3,0);
  for(let k=0;k<5;k++)bx(GW,.06,RH-1.8,(RD-1.2)/5-.36,0xcfe6ff,X0+.36,.45,Z0+.6+(k+.5)*(RD-1.2)/5);
  bx(V,.5,RH,RD,0xdfe1e4,-X0,0,0);for(const[,z]of DSL.SPOT){bx(V,.3,4.5,.3,DARK,DSL.DOORX,0,z-2.3);bx(V,.3,4.5,.3,DARK,DSL.DOORX,0,z+2.3);bx(V,.3,.5,4.9,DARK,DSL.DOORX,4.3,z)}
  // title signs (atlas) on dark backs
  bx(V,16.4,1.95,.25,DARK,-3,RH-3.6,Z0+.4);q('sTitle',16,1.75,-3,RH-2.62,Z0+.56);bx(V,8.2,2.2,.25,DARK,11.5,RH-3.8,Z0+.4);q('dsub',8,2,11.5,RH-2.7,Z0+.56);
  // back wall boards: SOLD, TODAY, LEADERBOARD
  bx(V,8.4,4.8,.22,DARK,-11,2.2,Z0+.38);q('sold',8.1,4.5,-11,4.6,Z0+.52);
  bx(V,5.8,4.7,.22,DARK,-1.4,2.2,Z0+.38);q('till',5.6,4.48,-1.4,4.55,Z0+.52);
  bx(V,6.6,4.6,.22,DARK,6.6,2.2,Z0+.38);q('lead',6.4,4.27,6.6,4.5,Z0+.52);
  // the turntable: plinth with a light ring; the turning deck is its own mesh; a ring light above on cables
  {const[tx,tz]=DSL.TT;cyl(V,DSL.TR+.25,DSL.TR+.35,.3,48,0x2a2e35,tx,.15,tz);cyl(GW,DSL.TR+.27,DSL.TR+.27,.05,48,0xffb36b,tx,.27,tz);
   const tor=new T.TorusGeometry(2.8,.1,8,48);tor.rotateX(Math.PI/2);GW.push({g:tor,c:0xffffff,m:OFG.xf(tx,6.5,tz)});for(let k=0;k<3;k++){const a=k/3*Math.PI*2;bx(V,.03,RH-6.5,.03,DARK,tx+Math.cos(a)*2.8,6.5,tz+Math.sin(a)*2.8)}}
  // spec stands: a slim lectern with a tilted card, beside every car
  DSL.SPEC.forEach(([x,z,ry],k)=>{bx(V,.7,.1,.5,DARK,x,0,z,ry);bx(V,.12,1.25,.12,STEEL,x,.1,z,ry);bx(V,1.62,2.12,.08,DARK,x,1.2,z,ry,-.32);q('spec'+k,1.5,2,x+Math.sin(ry)*.08,2.28,z+Math.cos(ry)*.08,ry);Q[Q.length-1].m=OFG.xf(x+Math.sin(ry)*.06,2.27,z+Math.cos(ry)*.06,-.32,ry,0)});
  // sales desks: desk, monitor, chairs, a hanging deal card and the name plate
  DSL.DESK.forEach(([x,z],k)=>{bx(V,3.6,1.05,1.2,WHITE,x,0,z);bx(V,3.8,.08,1.4,DARK,x,1.05,z);bx(V,1.1,.7,.08,DARK,x-.7,1.13,z-.3);bx(V,1,.58,.03,0x46c8ff,x-.7,1.2,z-.25);
   bx(V,.8,.1,.8,DARK,x,.75,z-1.4);bx(V,.8,.9,.12,DARK,x,.8,z-1.85);for(const dx of[-.8,.8]){bx(V,.8,.1,.8,LEATHER,x+dx,.72,z+1.4);bx(V,.8,.8,.12,LEATHER,x+dx,.72,z+1.82)}
   q('n'+k,1.6,.36,x+.8,1.3,z+.61);bx(V,1.7,.42,.06,DARK,x+.8,1.07,z+.58);
   bx(V,.14,1,.14,STEEL,x+2.65,0,z);bx(V,.7,.06,.5,DARK,x+2.65,0,z);bx(V,2.24,2.05,.08,DARK,x+2.65,.92,z);q('card'+k,2.1,1.925,x+2.65,1.95,z+.05)});
  // the manager's glass office (back left)
  {const[ox,oz]=DSL.OFF,x0=X0+.5,x1=-19,z0=Z0+.3,z1=-5.6;bx(GL,x1-x0,RH-3,.06,0xbfe6ff,(x0+x1)/2,0,z1);bx(GL,.06,RH-3,z1-z0,0xbfe6ff,x1,0,(z0+z1)/2);
   for(let k=0;k<=4;k++)bx(V,.12,RH-3,.12,0x2a2f36,x0+k*(x1-x0)/4,0,z1);bx(V,.12,RH-3,.12,0x2a2f36,x1,0,(z0+z1)/2);bx(V,x1-x0,.18,.18,0x2a2f36,(x0+x1)/2,RH-3,z1);bx(V,.18,.18,z1-z0,0x2a2f36,x1,RH-3,(z0+z1)/2);
   bx(V,3.8,1.05,1.4,0x2b3440,ox,0,oz);bx(V,4,.08,1.6,WOOD,ox,1.05,oz);bx(V,1,.65,.06,DARK,ox+.9,1.13,oz-.4);bx(V,.9,.1,.9,DARK,ox,.8,oz-1.5);bx(V,.9,1.2,.12,DARK,ox,.8,oz-1.95);
   for(const dx of[-.9,.9])bx(V,.8,.1,.8,LEATHER,ox+dx,.72,oz+1.4);bx(V,3.1,2.2,.12,DARK,ox,2.6,Z0+.45);q('target',2.9,2.02,ox,3.7,Z0+.53);
   bx(V,3.9,.78,.1,DARK,(x0+x1)/2,RH-3.9,z1+.06);q('office',3.7,1.16,(x0+x1)/2,RH-3.55,z1+.12);
   cyl(V,.45,.35,.8,10,0x8a5a3a,x0+.8,.4,z0+.9);V.push({g:new T.IcosahedronGeometry(.8,0),c:GRN,m:OFG.xf(x0+.8,1.6,z0+.9,0,0,0,1,1.3,1)})}
  // the customer lounge (front left): sofas, coffee table, TV on the glazed wall's pillar, the coffee bar
  {const[lx,lz]=DSL.LNG;bx(V,2,.5,5.2,LEATHER,lx+2.4,0,lz);bx(V,.6,1.2,5.2,LEATHER,lx+3.5,0,lz);bx(V,4.6,.5,2,LEATHER,lx-.4,0,lz+4.4);bx(V,4.6,1.2,.6,LEATHER,lx-.4,0,lz+5.2);
   bx(V,1.4,.45,2.6,WOOD,lx-.4,0,lz);bx(V,1.6,.06,2.8,0x2a2f36,lx-.4,.45,lz);bx(V,.5,.08,.7,ORANGE,lx-.4,.51,lz-.4);bx(V,.4,.06,.5,0x2f6fd9,lx-.2,.51,lz+.5);
   bx(V,3,.1,4.6,0x8a6a42,lx-.6,0,lz,0);
   bx(V,.2,2.35,4.1,DARK,X0+.62,2.4,lz-.2);q('tv',3.9,2.19,X0+.75,3.55,lz-.2,Math.PI/2);
   bx(V,4.6,1.1,1.1,DARK,-23,0,-3.4);bx(V,4.8,.08,1.3,WHITE,-23,1.1,-3.4);bx(V,.9,1.2,.7,0x8e98a4,-24.4,1.18,-3.5);bx(V,.5,.3,.05,0x111827,-24.4,1.95,-3.12);
   for(let k=0;k<4;k++)cyl(V,.1,.08,.22,8,0xffffff,-22.8+k*.4,1.29,-3.2);bx(V,1.6,1.05,.06,DARK,-21.4,1.18,-3.7,0,-.2);q('coffee',1.5,.96,-21.4,1.71,-3.65);Q[Q.length-1].m=OFG.xf(-21.4,1.7,-3.64,-.2,0,0);
   q('lng',3,.9,lx,4.2,lz-2.6);bx(V,3.1,1,.08,DARK,lx,3.7,lz-2.66);for(const dx of[-1.4,1.4])bx(V,.05,RH-4.7,.05,DARK,lx+dx,4.7,lz-2.66);
   for(const pz of[1.2,10.8]){cyl(V,.5,.38,.9,12,0x8a5a3a,X0+1.3,.45,pz);V.push({g:new T.IcosahedronGeometry(.85,0),c:GRN,m:OFG.xf(X0+1.3,1.7,pz,0,0,0,1,1.3,1)})}}
  // the finance desk, the latest contract on its stand, the key cabinet on the back wall
  {const[fx,fz]=DSL.FIN;bx(V,4.2,1.05,1.2,0x2b3440,fx,0,fz);bx(V,4.4,.08,1.4,WHITE,fx,1.05,fz);bx(V,1,.65,.06,DARK,fx-1,1.13,fz-.3);bx(V,.9,.1,.9,DARK,fx-.4,.8,fz-1.4);for(const dx of[-.9,.6])bx(V,.8,.1,.8,LEATHER,fx+dx,.72,fz+1.4);
   bx(V,.12,1.5,.12,DARK,fx+1.3,1.13,fz+.1);bx(V,1.66,2.6,.07,DARK,fx+1.3,2.4,fz+.06);q('inv',1.5,2.34,fx+1.3,3.7,fz+.11);
   bx(V,4.1,.82,.1,DARK,fx-.6,RH-4.5,fz+.1);q('fin',3.9,1.22,fx-.9,RH-4.1,fz+.17);for(const dx of[-2.4,1.2])bx(V,.05,4.2,.05,DARK,fx+dx,RH-4.2,fz+.1);
   bx(V,2.6,2.1,.3,0x6b4a2b,18.4,1.6,Z0+.5);bx(V,2.4,1.9,.06,0x3a2a1e,18.4,1.7,Z0+.67);q('keys',2.4,.7,18.4,4.15,Z0+.67);
   for(let r=0;r<4;r++)bx(V,2.2,.04,.06,STEEL,18.4,2.15+r*.42,Z0+.72)}
  // delivery bay: glass partition, the DELIVERY BAY floor sign, the exit sign over the doors, a tyre-shine trolley
  bx(GL,.06,RH-2.5,RD-4.4,0xbfe6ff,20.2,0,-2.2);for(let k=0;k<=4;k++)bx(V,.12,RH-2.5,.12,0x2a2f36,20.2,0,Z0+.3+k*(RD-4.4)/4);bx(V,.16,.18,RD-4.4,0x2a2f36,20.2,RH-2.5,-2.2);
  quad(Q,'dbay',3.6,1.08,24,.03,9,0,-Math.PI/2,A);bx(V,.1,1.3,8.6,DARK,-X0-.32,6.2,-1.8);q('exit',8.4,1.5,-X0-.4,6.85,-1.8,-Math.PI/2);
  for(const[,z]of DSL.SPOT){bx(V,7,.1,.06,DARK,24,6.3,z+.02);q(z<0?'del0':'del1',6.6,1.03,24,5.85,z+.08)}
  bx(V,.9,.8,.6,0x3a3f46,21.6,0,8.6);cyl(V,.2,.2,.5,10,0x2f6fd9,21.4,1.05,8.6);
  // suspended linear lights
  for(let i=0;i<6;i++)for(let j=0;j<3;j++){const x=-22+i*8,z=-7+j*7;if(x>20)continue;bx(GW,4.6,.08,.32,0xffffff,x,8.9,z);for(const dx of[-2,2])bx(V,.02,RH-9,.02,DARK,x+dx,8.98,z)}
  // plants, extinguisher
  for(const[px,pz]of[[-17,-10.6],[3.2,-10.6],[19.2,8.4],[-17.6,11]]){cyl(V,.5,.38,.9,12,0xe8e6e1,px,.45,pz);V.push({g:new T.IcosahedronGeometry(.85,0),c:GRN,m:OFG.xf(px,1.7,pz,0,0,0,1,1.3,1)})}
  cyl(V,.22,.22,.9,12,0xd93a2f,-X0-.45,1.25,9.4);
  const sm=new T.Mesh(OFG.merge(V),OFM.vc);sm.castShadow=true;sm.receiveShadow=true;S.add(sm);
  const fm=new T.Mesh(OFG.merge(FLR),new T.MeshStandardMaterial({vertexColors:true,roughness:.14,metalness:.18}));fm.receiveShadow=true;S.add(fm);
  S.add(new T.Mesh(OFG.merge(GL),new T.MeshStandardMaterial({vertexColors:true,roughness:.05,metalness:.3,transparent:true,opacity:.22,depthWrite:false})));
  S.add(new T.Mesh(OFG.merge(GW),new T.MeshStandardMaterial({vertexColors:true,emissive:0xffffff,emissiveIntensity:.85,roughness:.4})));
  S.add(new T.Mesh(OFG.merge(Q),A.mat()));
  // the turntable deck (turns), its spot light
  {const L=[],[tx,tz]=DSL.TT;cyl(L,DSL.TR,DSL.TR,.12,48,0x3d424a,0,0,0);for(let k=0;k<16;k++)bx(L,.04,.02,DSL.TR*2-.2,0x8a95a3,0,.06,0,k*Math.PI/16);DS.tt=new T.Mesh(OFG.merge(L),OFM.vc);DS.tt.position.set(tx,.36,tz);DS.tt.receiveShadow=true;S.add(DS.tt);
   const sp=new T.SpotLight(0xffffff,160,24,.42,.5,1.4);sp.position.set(tx,9.6,tz+2.5);sp.target.position.set(tx,0,tz);S.add(sp);S.add(sp.target)}
  // the cars on show and the delivery spots
  DSL.CARS.forEach(([x,z,ry],k)=>{const g=new T.Group();g.position.set(x,k===0?.42:0,z);g.rotation.y=ry;S.add(g);DS.disp.push({k,g,key:null,cur:null,lazy:false})});
  DSL.SPOT.forEach(([x,z],k)=>{const g=new T.Group();g.position.set(x,0,z);g.rotation.y=Math.PI/2;S.add(g);DS.del.push({k,x,z,g,key:null,cur:null,lazy:false,px:x})});
  // instanced: the keys on the cabinet, the red ribbons, the roller doors
  {const L=[];bx(L,.08,.22,.03,0xd9b44a,0,-.18,0);bx(L,.14,.08,.04,0x22252b,0,-.32,0);DS.keys=new T.InstancedMesh(OFG.merge(L),OFM.vc,40);const o3=new T.Object3D();
   for(let i=0;i<40;i++){o3.position.set(17.5+(i%10)*.2,3.6-Math.floor(i/10)*.42,Z0+.74);o3.updateMatrix();DS.keys.setMatrixAt(i,o3.matrix)}DS.keys.instanceMatrix.setUsage(T.DynamicDrawUsage);S.add(DS.keys)}
  {const L=[],RED=0xd0162b;bx(L,1.9,.06,.32,RED,0,0,0);bx(L,.32,.06,3.2,RED,0,0,0);for(const s of[-1,1]){const t=new T.TorusGeometry(.32,.09,6,14);L.push({g:t,c:RED,m:OFG.xf(s*.3,.3,0,0,0,s*.6,1,.8,.5)})}
   L.push({g:new T.SphereGeometry(.14,8,6),c:RED,m:OFG.xf(0,.08,0)});for(const s of[-1,1])bx(L,.12,.5,.05,RED,s*.18,-.42,.1,0,0,s*.4);
   DS.rib=new T.InstancedMesh(OFG.merge(L),OFM.body,2);DS.rib.instanceMatrix.setUsage(T.DynamicDrawUsage);S.add(DS.rib)}
  {const L=[];bx(L,.12,4,4.4,0xc9ccd0,0,0,0);for(let k=1;k<9;k++)bx(L,.16,.05,4.42,0x9aa3ae,0,k*.44,0);DS.door=new T.InstancedMesh(OFG.merge(L),OFM.vc,2);DS.door.instanceMatrix.setUsage(T.DynamicDrawUsage);S.add(DS.door)}
  // people: 2 salesmen, the manager, the finance clerk, the valet, buyers and walk-in browsers
  DS.sales=[0,1].map(i=>{const m=mkP(S,'#22252b',170+i,'Car Salesman');m.userData.p=null;return m});
  DS.mgr=mkP(S,'#1f3a6e',175,'Store Manager');DS.finc=mkP(S,'#f2f2ee',176,'Receptionist');DS.valet=mkP(S,'#3fa7c4',177,'Wash Attendant');DS.valet.userData.p=null;
  DS.cust=[0,1].map(i=>{const m=mkP(S,null,178+i,'civ');m.visible=false;m.userData.p=null;return m});
  DS.walk=[0,1,2].map(i=>mkP(S,null,181+i,'civ'));
  bizPointer('stand',DS,(hx,hy)=>bizHit(hx,hy,DS.del.filter(L=>DS.A[L.k]&&L.g.visible).map(L=>({k:L.k,x:L.g.position.x,y:1.4,z:L.g.position.z,r:2.6})),DS.sales));
  DS.built=true}
 // ---------- atlas painting ----------
 function dsPaintStatic(){const A=DSA,P=A.paint,txt=A.txt;
  const sg=(k,t,bg,fg,sz)=>P(k,(x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(0,0,W,5);txt(x,t,W/2,H/2+3,W-30,sz||60,fg)});
  P('sTitle',(x,W,H)=>{x.fillStyle='#16181c';x.fillRect(0,0,W,H);txt(x,'MOTOROPOLIS MOTORS',W/2,H/2-4,W-80,84,'#ffffff');x.fillStyle='#ff7a1a';x.fillRect(W*.22,H-14,W*.56,6)});
  P('dsub',(x,W,H)=>{x.fillStyle='#ff7a1a';x.fillRect(0,0,W,H);txt(x,'NEW & USED · FINANCE',W/2,H*.36,W-30,56,'#1d0f02');txt(x,'TRADE-INS · TEST DRIVES · DELIVERY',W/2,H*.74,W-30,34,'#1d0f02',700)});
  sg('office','SALES MANAGER','#22252b','#ffd34d',58);sg('fin','FINANCE · PAPERWORK','#22252b','#5cc98a',54);sg('keys','KEY CABINET','#3a2a1e','#ffd34d',56);sg('lng','CUSTOMER LOUNGE','#163a5c','#eef3fb',50);
  P('dbay',(x,W,H)=>{x.fillStyle='#5a6068';x.fillRect(0,0,W,H);txt(x,'DELIVERY BAY',W/2,H/2,W-20,64,'#ffd34d')});
  P('exit',(x,W,H)=>{x.fillStyle='#16181c';x.fillRect(0,0,W,H);txt(x,'DELIVERY · TEST DRIVE EXIT ▶',W/2,H/2,W-40,92,'#ffd34d')});
  P('coffee',(x,W,H)=>{x.fillStyle='#2b1d14';x.fillRect(0,0,W,H);txt(x,'COFFEE · ON THE HOUSE',W/2,30,W-20,30,'#ffd34d');['Espresso','Cappuccino','Hot chocolate','Water · still / sparkling'].forEach((t,i)=>txt(x,t,W/2,68+i*28,W-30,22,'#f4e8d6',700))})}
 // a spec card: model, NEW / USED, power, acceleration, weight, top speed, odometer, price
 function dsPaintSpec(k,o){const A=DSA,txt=A.txt,s=DEALJOBS.spec(o.m);A.paint('spec'+k,(x,W,H)=>{x.fillStyle='#fbfaf6';x.fillRect(0,0,W,H);x.fillStyle=k===0?'#ff7a1a':'#22252b';x.fillRect(0,0,W,46);
   txt(x,k===0?'★ ON THE TURNTABLE':o.used?'APPROVED USED':'BRAND NEW',W/2,25,W-20,28,k===0?'#1d0f02':'#ffffff');
   txt(x,o.m.n,W/2,72,W-20,30,'#16181c',800);x.fillStyle='#ff7a1a';x.fillRect(20,94,W-40,3);
   const R=[['POWER',s.hp?`${s.hp} hp · ${s.kw} kW`:'—'],['0-100 km/h',s.t100?`${s.t100.toFixed(1)} s`:'—'],['0-60 mph',s.t60?`${s.t60.toFixed(1)} s`:'—'],['WEIGHT',`${s.kg.toLocaleString('en-US')} kg · ${s.lb.toLocaleString('en-US')} lb`],
    ['TOP SPEED',s.vmax?`${s.vmax} km/h · ${Math.round(s.vmax*.621371)} mph`:'—'],['DRIVE',s.drive?`${s.drive} · ${s.asp==='T'?'TURBO':s.asp==='S'?'SUPERCHARGED':'NA'} · ${s.fuel==='D'?'DIESEL':'PETROL'}`:'—'],['ODOMETER',dsKm(o.km)]];
   R.forEach(([a,b],i)=>{const y=118+i*28;x.fillStyle=i%2?'#f1efe8':'#fbfaf6';x.fillRect(12,y-13,W-24,26);txt(x,a,20,y+1,96,15,'#6b7280',800,null,'left');txt(x,b,W-18,y+1,W-126,16,'#16181c',800,null,'right')});
   x.fillStyle='#16181c';x.fillRect(12,H-70,W-24,58);txt(x,`${o.price.toLocaleString('en-US')} TC`,W/2,H-41,W-40,38,'#ffd34d',800,A.MONO)})}
 function dsPaintNames(t){const A=DSA,txt=A.txt,E=DEALJOBS;for(let k=0;k<3;k++){const n=staffOf('stand','Car Salesman',k);A.paint('n'+k,(x,W,H)=>{x.fillStyle=n?'#16181c':'#3a3f46';x.fillRect(0,0,W,H);
   txt(x,n&&!E.hidden(n)?`★ ${n}`:n?'CAR SALESMAN':'JOB OPEN · '+E.OPEN,W/2,n?22:H/2,W-16,n?26:18,n?'#ffd34d':'#ffb36b',800);if(n)txt(x,'CAR SALESMAN · DESK '+(k+1),W/2,48,W-16,15,'#9aa3ae',700)})}}
 // the SOLD board: the latest 8 cars sold, each with its SOLD tag
 function dsPaintSold(t){const A=DSA,txt=A.txt,E=DEALJOBS,L=E.sold(t,8),b=E.board(t);A.paint('sold',(x,W,H)=>{x.fillStyle='#10161e';x.fillRect(0,0,W,H);x.strokeStyle='#c8231c';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);
   txt(x,'SOLD · THE LATEST DEALS',W/2-140,44,W-360,46,'#ffffff');x.fillStyle='#c8231c';x.fillRect(W-290,18,260,52);txt(x,`TODAY: ${b.n} SOLD`,W-160,45,240,32,'#ffffff',800);
   L.forEach((j,i)=>{const cx=24+(i%4)*277,cy=90+Math.floor(i/4)*262,w=BIZP.who(E,j);x.fillStyle='#fdfcf8';x.fillRect(cx,cy,263,248);x.fillStyle=j.used?'#2f6fd9':'#ff7a1a';x.fillRect(cx,cy,263,10);
    txt(x,j.no,cx+14,cy+32,120,22,'#16181c',800,A.MONO,'left');txt(x,BIZP.hm(j.st[4]),cx+249,cy+32,90,20,'#6b7280',700,A.MONO,'right');
    txt(x,j.model,cx+131,cy+74,243,24,'#16181c',800);txt(x,w?`★ ${w}`:'Customer',cx+131,cy+106,243,20,w?'#b5520e':'#6b7280',700);txt(x,E.tc(j.total),cx+131,cy+142,243,26,'#16181c',800,A.MONO);
    txt(x,j.fin?`FINANCE · ${j.fin.n} MONTHS`:'CASH',cx+131,cy+172,243,16,'#4a4f57',700);BIZP.stamp(A,x,cx+131,cy+214,'SOLD','200,35,28',150,46,34,-.12)});
   if(!L.length)txt(x,E.open()?'No cars sold yet today':'OPENING SOON',W/2,H/2,W-80,40,'#6b7280',700)})}
 // the leaderboard: cars sold today and in the last 7 days per salesman (desk 3 is the open post)
 function dsPaintLead(t){const A=DSA,txt=A.txt,E=DEALJOBS,b=E.board(t);A.paint('lead',(x,W,H)=>{x.fillStyle='#0d1014';x.fillRect(0,0,W,H);x.strokeStyle='#e8b931';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);
   txt(x,'SALES LEADERBOARD',W/2,44,W-40,44,'#ffd34d');txt(x,'SALESMAN',40,96,200,20,'#9aa3ae',800,null,'left');txt(x,'TODAY',W-300,96,100,20,'#9aa3ae',800,null,'right');txt(x,'7 DAYS',W-190,96,100,20,'#9aa3ae',800,null,'right');txt(x,'TC TODAY',W-36,96,140,20,'#9aa3ae',800,null,'right');
   const rows=b.per.map(p=>({p,n:staffOf('stand','Car Salesman',p.k)})).sort((a,c)=>c.p.day-a.p.day||c.p.week-a.p.week);
   rows.concat([{p:null,n:null}]).forEach((r,i)=>{const y=150+i*100;x.fillStyle=i%2?'#151a20':'#11161b';x.fillRect(22,y-40,W-44,84);
    if(!r.p){txt(x,`DESK 3 · CAR SALESMAN · JOB OPEN`,W/2,y-8,W-80,28,'#ffb36b',800);txt(x,E.OPEN,W/2,y+24,W-80,22,'#9aa3ae',700);return}
    const nm=r.n&&!E.hidden(r.n)?r.n:r.n?'CAR SALESMAN':'CAR SALESMAN · JOB OPEN';txt(x,(i===0&&r.p.day?'★ ':'')+nm,40,y,W-470,30,i===0?'#ffd34d':'#eef3fb',800,null,'left');
    txt(x,String(r.p.day),W-300,y,100,40,'#ffffff',800,A.MONO,'right');txt(x,String(r.p.week),W-190,y,100,32,'#9fd0ff',800,A.MONO,'right');txt(x,r.p.tc.toLocaleString('en-US'),W-36,y,160,26,'#5cc98a',800,A.MONO,'right')});
   txt(x,'Cars sold since 00:00 UTC · Torque Coins (TC), display only',W/2,H-26,W-40,18,'#6b7280',600)})}
 // TODAY: n CARS SOLD · X TC and the latest sales
 function dsPaintTill(t){const A=DSA,txt=A.txt,E=DEALJOBS,td=E.today(t),L=E.sold(t,6);A.paint('till',(x,W,H)=>{x.fillStyle='#0d1014';x.fillRect(0,0,W,H);x.strokeStyle='#2e8b57';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);
   txt(x,'SALES · TODAY (UTC)',W/2,40,W-40,36,'#5cc98a');x.fillStyle='#16241c';x.fillRect(22,68,W-44,92);txt(x,`TODAY: ${td.n} CARS SOLD · ${E.tc(td.tc)}`,W/2,114,W-60,48,'#ffd34d',800,A.MONO);
   txt(x,'LATEST SALES',W/2,186,W-40,26,'#9aa3ae',800);L.forEach((j,i)=>{const y=222+i*40,w=BIZP.who(E,j);x.fillStyle=i%2?'#151a20':'#11161b';x.fillRect(22,y-17,W-44,36);
    txt(x,j.no,36,y+1,100,20,'#9fd0ff',700,A.MONO,'left');txt(x,w?`★ ${w}`:'Customer',140,y+1,190,20,'#eef3fb',700,null,'left');txt(x,E.tc(j.total),W-122,y+1,150,20,'#ffd34d',700,A.MONO,'right');x.fillStyle='#c8231c';x.fillRect(W-112,y-12,78,26);txt(x,'SOLD',W-73,y+2,70,20,'#ffffff',800)});
   if(!L.length)txt(x,E.open()?'No cars sold yet today':'OPENING SOON',W/2,300,W-60,24,'#6b7280',700);txt(x,'Torque Coins (TC) · display only for now',W/2,H-24,W-40,18,'#6b7280',600)})}
 // the manager's screen, the lounge TV, the delivery signs
 function dsPaintTarget(t){const A=DSA,txt=A.txt,E=DEALJOBS,td=E.today(t),goal=40;A.paint('target',(x,W,H)=>{x.fillStyle='#071a2d';x.fillRect(0,0,W,H);txt(x,'TODAY · TARGET',W/2,28,W-20,24,'#3ee08f');txt(x,`${td.n} / ${goal} CARS`,W/2,80,W-20,46,'#ffffff',800,A.MONO);
   x.fillStyle='#16324d';x.fillRect(20,122,W-40,26);x.fillStyle='#3ee08f';x.fillRect(20,122,(W-40)*Math.min(1,td.n/goal),26);txt(x,E.tc(td.tc),W/2,174,W-20,24,'#ffd34d',800,A.MONO)})}
 function dsPaintTV(t,o){const A=DSA,txt=A.txt,s=DEALJOBS.spec(o.m),ph=Math.floor(t/12)%3;A.paint('tv',(x,W,H)=>{const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0b1626');g.addColorStop(1,'#1d3b5c');x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle='#ff7a1a';x.fillRect(0,0,W,10);
   txt(x,'MOTOROPOLIS MOTORS · TV',W/2,40,W-40,28,'#ffb36b');
   if(ph===0){txt(x,'ON THE TURNTABLE TODAY',W/2,98,W-40,30,'#9fd0ff');txt(x,o.m.n,W/2,150,W-40,44,'#ffffff');txt(x,s.hp?`${s.hp} hp · ${s.kw} kW · 0-100 km/h ${s.t100} s · 0-60 mph ${s.t60} s`:'',W/2,206,W-40,26,'#eef3fb',700);txt(x,`${o.price.toLocaleString('en-US')} TC`,W/2,272,W-40,52,'#ffd34d',800,A.MONO)}
   else if(ph===1){txt(x,'BOOK A TEST DRIVE',W/2,110,W-40,48,'#ffffff');txt(x,'Ask at any sales desk',W/2,170,W-40,30,'#9fd0ff',700);txt(x,'Finance from 4.9% APR · trade-ins welcome',W/2,230,W-40,28,'#eef3fb',700)}
   else{const td=DEALJOBS.today(t);txt(x,'SOLD TODAY',W/2,110,W-40,40,'#9fd0ff');txt(x,`${td.n} CARS`,W/2,180,W-40,70,'#ffffff',800,A.MONO);txt(x,'Every car handed over with a full tank and a valet',W/2,250,W-40,24,'#eef3fb',700)}})}
 function dsPaintDel(k,a){const A=DSA,txt=A.txt,E=DEALJOBS;A.paint('del'+k,(x,W,H)=>{const s=a?a.s:-1,w=a&&BIZP.who(E,a.j),nm=w||(a?a.j.plate:'');
   if(s===6){x.fillStyle='#2e8b57';x.fillRect(0,0,W,H);txt(x,`READY FOR COLLECTION: ${nm}`,W/2,H/2,W-30,60,'#ffffff')}
   else if(s===4||s===5){x.fillStyle='#ff7a1a';x.fillRect(0,0,W,H);txt(x,`SOLD · PREPARING FOR ${nm}`,W/2,H/2,W-30,52,'#1d0f02')}
   else if(s===1){x.fillStyle='#2f6fd9';x.fillRect(0,0,W,H);txt(x,`ON A TEST DRIVE · ${a.j.no}`,W/2,H/2,W-30,52,'#ffffff')}
   else if(s===2||s===3){x.fillStyle='#22252b';x.fillRect(0,0,W,H);txt(x,`RESERVED · ${a.j.no} · ${nm}`,W/2,H/2,W-30,50,'#ffd34d')}
   else if(s===7){x.fillStyle='#22252b';x.fillRect(0,0,W,H);txt(x,`DRIVEN HOME · ENJOY THE CAR!`,W/2,H/2,W-30,52,'#5cc98a')}
   else{x.fillStyle='#22252b';x.fillRect(0,0,W,H);txt(x,`DELIVERY SPOT ${k+1} · FREE`,W/2,H/2,W-30,52,'#9aa3ae')}})}
 // ---------- per frame ----------
 // the deal's car in its delivery spot: x along the spot (doors at +x), visible?, door open (0..1)
 function dsPose(a,t){if(!a)return{x:0,vis:false,door:0};const j=a.j,s=a.s,L=12;
  if(s===0)return{x:0,vis:false,door:0};
  if(s===1){const u0=a.inS/8,u1=(j.st[2]-t)/8;if(u0<1)return{x:L*bizEase(u0),vis:true,door:1};if(u1<1)return{x:L*bizEase(u1),vis:true,door:1};return{x:L,vis:false,door:0}}
  if(s===7){const u=a.out;return{x:L*bizEase(u),vis:u<.98,door:1}}
  return{x:0,vis:true,door:0}}
 function syncDeal(dt){const E=DEALJOBS,t=E.now(),A0=E.bays(t);DS.A=A0;DS.t=t;const o3=DS._o3||(DS._o3=new T.Object3D());
  // the cars on show (today's list), the turntable
  const D=E.display(t),dk=Math.floor(t/86400);DS.disp.forEach((H,k)=>{const o=D.show[k];dsCar(H,dk+':'+k,o.m,o.col)});
  const ang=simTime*.22;DS.tt.rotation.y=ang;DS.disp[0].g.rotation.y=ang;
  // delivery spots: the deal's car, the doors, the ribbons, the keys
  DS.del.forEach((L,k)=>{const a=A0[k],p=dsPose(a,t);dsCar(L,a?'d'+a.j.g:null,a?a.j.m:null,a?a.j.color:null);L.g.visible=p.vis&&!!L.cur;L.g.position.x=L.x+p.x;L.px=L.g.position.x;
   const dv=DS.dv||(DS.dv=[0,0]);dv[k]+=(p.door-dv[k])*Math.min(1,dt*3);o3.position.set(DSL.DOORX,dv[k]*3.7,L.z);o3.rotation.set(0,0,0);o3.scale.set(1,1-dv[k]*.92,1);o3.updateMatrix();DS.door.setMatrixAt(k,o3.matrix);
   const rib=a&&(a.s===5||a.s===6)&&L.g.visible;o3.position.set(L.g.position.x,(L.top||2)+.02,L.z);o3.rotation.set(0,Math.PI/2,0);o3.scale.setScalar(rib?1:0);o3.updateMatrix();DS.rib.setMatrixAt(k,o3.matrix)});
  DS.door.instanceMatrix.needsUpdate=true;DS.rib.instanceMatrix.needsUpdate=true;
  const gone=new Set();for(const a of A0)if(a&&a.s>=6)gone.add(a.j.keyNo-1);const kk=[...gone].join(',');if(DS.v.keys!==kk){DS.v.keys=kk;for(let i=0;i<40;i++){o3.position.set(17.5+(i%10)*.2,3.6-Math.floor(i/10)*.42,-11.26);o3.rotation.set(0,0,0);o3.scale.setScalar(gone.has(i)?0:1);o3.updateMatrix();DS.keys.setMatrixAt(i,o3.matrix)}DS.keys.instanceMatrix.needsUpdate=true}
  dsBoards(A0,t,D);dsPeople(A0,t,dt)}
 function dsBoards(A0,t,D){const V=DS.v,E=DEALJOBS;let up=0;
  A0.forEach((a,k)=>{const key=a?[a.j.g,a.s,a.s<E.RD?Math.ceil(a.left/60):0,E.staffName(a.j),BIZP.who(E,a.j)].join('|'):'free'+Math.floor(t/E.STEP)+E.open()+staffOf('stand','Car Salesman',k);if(V['c'+k]!==key){V['c'+k]=key;BIZP.card(DSA,'card'+k,k,a,t,E,DSO.card);up=1}});
  const dk=Math.floor(t/86400)+':'+D.show.map(o=>o.m.n).join('|');if(V.spec!==dk){V.spec=dk;D.show.forEach((o,k)=>dsPaintSpec(k,o));up=1}
  const nk=[0,1,2].map(k=>staffOf('stand','Car Salesman',k)).join('|')+(window.__HIDE||[]).length;if(V.n!==nk){V.n=nk;dsPaintNames(t);up=1}
  const L=E.sold(t,1),sk=(L[0]?L[0].g:'')+'#'+WALL.length+E.open()+Math.floor(t/86400)+nk;if(V.sold!==sk){V.sold=sk;dsPaintSold(t);dsPaintLead(t);dsPaintTill(t);dsPaintTarget(t);BIZP.invoice(DSA,'inv',L[0]||null,E,DSO.inv);up=1}
  const tk=Math.floor(t/12)%3+':'+D.show[0].m.n;if(V.tv!==tk){V.tv=tk;dsPaintTV(t,D.show[0]);up=1}
  for(let k=0;k<2;k++){const a=A0[k],key=a?a.j.g+':'+a.s+':'+BIZP.who(E,a.j):'-';if(V['d'+k]!==key){V['d'+k]=key;dsPaintDel(k,a);up=1}}
  if(up)DSA.tex.needsUpdate=true}
 // salesmen go where the deal needs them; buyers browse, test-drive, sit at the desk and the finance desk, wait in the lounge, collect
 const DS_IDLE=[[-14.4,8,Math.PI*0],[-1.2,8,0]];
 function dsBrowse(j){const c=DSL.CARS[1+(j.g%4)];return c}
 function dsPeople(A0,t,dt){const E=DEALJOBS;DS.staffJob=bizStaffJobs(E,A0,s=>s<=6);const lounge=[[-21.6,4.6],[-24,10.3]];
  DS.sales.forEach((m,i)=>{const a=DS.staffJob[i],dk=DSL.DESK[i];let x=dk[0],z=dk[1]-1.4,ang=0,vis=true;
   if(a){const s=a.s,L=DS.del[a.j.bay];if(s===0){const c=dsBrowse(a.j),u=simTime*.12+i*2;x=c[0]+Math.cos(u)*3.6+1;z=c[1]+Math.sin(u)*3.6*.7+.8;ang=Math.atan2(c[0]-x,c[1]-z)}
    else if(s===1){vis=dsPose(a,t).vis&&dsPose(a,t).x<1.5;x=L.x-1.5;z=L.z+2.4;ang=Math.PI/2}
    else if(s===3){x=DSL.FIN[0]+1.9;z=DSL.FIN[1]+1.8;ang=-Math.PI*.75}
    else if(s===4){x=dk[0]+1.8;z=dk[1]+1.2;ang=Math.PI/2}
    else if(s===6){x=L.x-2.2;z=L.z+2.6;ang=Math.PI*.8}}
   m.visible=vis;if(vis)bizMove(m,x,z,ang,dt);else m.userData.p={x,z}});
  // the manager at the office desk, the finance clerk behind the finance desk, the valet at a car being prepared
  putP(DS.mgr,{x:DSL.OFF[0],z:DSL.OFF[1]-1,ang:Math.sin(simTime*.3)*.5},false);putP(DS.finc,{x:DSL.FIN[0]-.4,z:DSL.FIN[1]-1,ang:Math.sin(simTime*.5)*.4},false);
  {const a=A0.find(q=>q&&q.s===5);let x=21.2,z=8.2,ang=Math.PI,mv=false;if(a){const L=DS.del[a.j.bay],u=simTime*.25;x=L.x+Math.cos(u)*3.4;z=L.z+Math.sin(u)*1.9;ang=u+Math.PI;mv=true}bizMove(DS.valet,x,z,ang,dt,mv?2.2:4.2)}
  // the buyers (residents shown by name; walk-in customers too)
  const staff=[0,1].map(i=>staffOf('stand','Car Salesman',i));
  DS.cust.forEach((m,i)=>{const a=A0[i];const ok=a&&!(a.j.name&&staff.includes(a.j.name));m.userData.a=ok?a:null;if(!ok){m.visible=false;m.userData.p=null;return}
   const s=a.s,dk=DSL.DESK[i],L=DS.del[i];let x,z,ang=Math.PI,vis=true;
   if(s===0){const c=dsBrowse(a.j),u=simTime*.12+i*2+.6;x=c[0]+Math.cos(u)*3.4;z=c[1]+Math.sin(u)*3.4*.7;ang=Math.atan2(c[0]-x,c[1]-z)}
   else if(s===1){vis=false;x=L.x;z=L.z+2}
   else if(s===2||s===4){x=dk[0]+(s===4?.9:-.8);z=dk[1]+1.25;ang=Math.PI}
   else if(s===3){x=DSL.FIN[0]+(i?-.9:.6);z=DSL.FIN[1]+1.3;ang=Math.PI}
   else if(s===5){[x,z]=lounge[i];ang=i?Math.PI:-Math.PI/2}
   else if(s===6){x=L.x-.6;z=L.z+2.8;ang=-Math.PI*.75}
   else{vis=false;x=L.x;z=L.z+2}
   m.visible=vis;if(!vis){m.userData.p=null;return}if(!m.userData.p)m.userData.p={x:s===0?-6:x,z:s===0?14:z};bizMove(m,x,z,ang,dt)});
  // walk-in browsers wander between the cars (only while the dealership is open)
  const op=E.open();DS.walk.forEach((m,i)=>{m.visible=op;if(!op)return;const c=DSL.CARS[(Math.floor(simTime/22)+i*2)%5],u=simTime*.16+i*2.3,r=c===DSL.CARS[0]?DSL.TR+1.2:3.8;
   putP(m,{x:c[0]+Math.cos(u)*r,z:c[1]+Math.sin(u)*r*.75,ang:-u},true)})}
 function labelsDeal(){const E=DEALJOBS;hctx.textAlign='center';hctx.textBaseline='middle';const sz=clamp(1100/cam.dist,14,26);
  DS.del.forEach((L,k)=>{const a=DS.A[k];if(!a||!L.g.visible)return;const s=toHud(L.g.position.x,3.4,L.z);if(!s)return;const w=BIZP.who(E,a.j),sel=(DS.pin||DS.hover||{}).k===k;
   pill(w?'★ '+w:a.j.plate,s.x,s.y,sz*(sel?1.08:1),w?'rgba(255,122,26,.95)':'#fafafa',w?'#1d0f02':'#111',sel?'#ffffff':undefined)});
  DS.sales.forEach((m,i)=>bizStaffTag(m,E,i,DS.staffJob&&DS.staffJob[i]));
  {const d=DSL.DESK[2];if(!staffOf('stand','Car Salesman',2))tag(d[0],3.4,d[1]-1.4,`${E.ROLE} · JOB OPEN · ${E.OPEN}`,'rgba(16,19,24,.8)','#9aa3ae')}
  const ST=['BROWSING','ON A TEST DRIVE','MAKING AN OFFER','SIGNING THE FINANCE','SOLD!','COFFEE IN THE LOUNGE','COLLECTING THE KEYS','DRIVING HOME'];
  DS.cust.forEach(m=>{const a=m.userData.a;if(!m.visible||!a)return;const w=BIZP.who(E,a.j);if(!w)return;tag(m.position.x,3.5,m.position.z,`★ ${w} · ${ST[a.s]}`+(a.s===0?' · '+a.j.model:''))});
  hctx.globalAlpha=1;lockedNote('stand');header('INSIDE THE DEALERSHIP · MOTOROPOLIS MOTORS');
  bizPanelLine(bizLine(E,DS,DS.A,DS.staffJob,'is at the sales desk · waiting for the next customer'),'#ff7a1a')}
