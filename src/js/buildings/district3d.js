//@ buildings/district3d.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- the new district: Motoropolis Park, Motoropolis Daily and the future lots ----------
 const KQ={};
 {// PARK
  const L=LOT.park,g=new T.Group();const gm=M(0x6fa34e),pathM=M(0xe3d6b4),water=M(0x4f9bd1,{roughness:.15,metalness:.2}),benchM=M(0x7a5a3a);
  g.add(box(L.w,.06,L.d,gm,L.cx,Y0,L.cz,false));
  const pw=1.4,ix0=L.x0+2.6,ix1=L.x0+L.w-2.6,iz0=L.z0+2.6,iz1=L.z0+L.d-2.6;
  for(const z of[iz0,iz1])g.add(box(ix1-ix0+pw,.05,pw,pathM,(ix0+ix1)/2,Y0+.06,z,false));for(const x of[ix0,ix1])g.add(box(pw,.05,iz1-iz0+pw,pathM,x,Y0+.06,(iz0+iz1)/2,false));
  g.add(box(pw,.05,2.6,pathM,L.cx,Y0+.06,L.z0+1.3,false));g.add(box(ix1-ix0,.05,pw,pathM,L.cx,Y0+.06,L.cz,false));
  const pond=new T.Mesh(new T.CircleGeometry(1,40),XMAS?M(0xdff3ff,{roughness:.08,metalness:.1}):water);pond.rotation.x=-Math.PI/2;pond.scale.set(4.4,2.4,1);pond.position.set(L.x0+L.w*.3,Y0+.08,L.z0+L.d*.3);g.add(pond);
  const rim=new T.Mesh(new T.RingGeometry(1,1.08,40),pathM);rim.rotation.x=-Math.PI/2;rim.scale.set(4.4,2.4,1);rim.position.copy(pond.position);rim.position.y+=.01;g.add(rim);
  if(!XMAS){const f1=new T.Mesh(new T.CylinderGeometry(2.6,2.8,.5,24),pathM);f1.position.set(L.cx,Y0+.25,L.cz);g.add(f1);const f2=new T.Mesh(new T.CylinderGeometry(2.1,2.1,.1,24),water);f2.position.set(L.cx,Y0+.52,L.cz);g.add(f2);
  const f3=new T.Mesh(new T.CylinderGeometry(.25,.4,1.6,10),pathM);f3.position.set(L.cx,Y0+1.2,L.cz);g.add(f3);const f4=new T.Mesh(new T.CylinderGeometry(.9,.5,.25,14),pathM);f4.position.set(L.cx,Y0+2,L.cz);g.add(f4);
  KQ.spray=new T.Mesh(new T.ConeGeometry(.8,1.3,14,1,true),M(0xbfe8ff,{transparent:true,opacity:.55,roughness:.1}));KQ.spray.position.set(L.cx,Y0+2.7,L.cz);g.add(KQ.spray);}
  for(const[x,z,r]of[[.07,.85,0],[.9,.5,Math.PI/2],[.6,.17,0],[.35,.75,0]]){const bx=L.x0+L.w*x,bz=L.z0+L.d*z;const bg=new T.Group();bg.add(box(2.4,.12,.7,benchM,0,.45,0));bg.add(box(2.4,.6,.1,benchM,0,.55,-.32));for(const dx of[-1,1])bg.add(box(.1,.45,.6,mat.dark,dx,0,0));bg.position.set(bx,Y0,bz);bg.rotation.y=r;g.add(bg)}
  // playground: swing set, slide tower with roof and ladder, spring rider and seesaw on a soft mat
  {const px=L.x0+L.w*.72,pz=L.z0+L.d*.72;const red=mat.red,blue=mat.blue,yel=mat.yellow,steel=M(0x8a939c,{metalness:.5,roughness:.4});
   const cyl=(r,h,m,x,y,z,rx,rz)=>{const c=new T.Mesh(new T.CylinderGeometry(r,r,h,8),m);c.position.set(x,y,z);c.rotation.set(rx||0,0,rz||0);c.castShadow=true;g.add(c);return c};
   const matG=new T.Mesh(new T.BoxGeometry(7,.06,4.6),M(0xc0573e));matG.position.set(px+.8,Y0+.06,pz+1.6);matG.receiveShadow=true;g.add(matG);
   // swing set: A-frames at both ends, top bar, two seats on chains
   const sx=px-.2,sz=pz+.5;for(const dx of[-1.7,1.7])for(const dz of[-1,1])cyl(.07,2.85,red,sx+dx,Y0+1.35,sz+dz*.42,dz*.32,0);cyl(.08,3.6,red,sx,Y0+2.7,sz,0,Math.PI/2);
   for(const dx of[-.75,.75]){for(const dd of[-.2,.2])cyl(.015,1.95,steel,sx+dx+dd,Y0+1.7,sz,0,0);g.add(box(.55,.07,.3,blue,sx+dx,Y0+.68,sz))}
   // slide tower
   const tx=px+3.1,tz=pz+.6;for(const dx of[-.55,.55])for(const dz of[-.55,.55])cyl(.07,2.7,blue,tx+dx,Y0+1.35,tz+dz,0,0);g.add(box(1.25,.12,1.25,yel,tx,Y0+1.45,tz));
   for(const dx of[-.55,.55])g.add(box(.05,.45,1.1,red,tx+dx,Y0+1.57,tz-.05));g.add(box(1.1,.45,.05,red,tx,Y0+1.57,tz-.55));
   const roof=new T.Mesh(new T.ConeGeometry(1.05,.9,4),red);roof.rotation.y=Math.PI/4;roof.position.set(tx,Y0+3.15,tz);roof.castShadow=true;g.add(roof);
   for(const dz of[-.3,.3])cyl(.035,1.7,steel,tx-.8,Y0+.8,tz+dz,0,.25);for(let i=0;i<5;i++)cyl(.025,.6,steel,tx-.68-i*.08,Y0+.25+i*.3,tz,Math.PI/2,0);
   const ch=new T.Group();ch.position.set(tx,Y0+1.45,tz+.62);ch.rotation.x=.62;g.add(ch);const sl=box(.85,.06,2.7,yel,0,0,1.35);ch.add(sl);for(const dx of[-.42,.42])ch.add(box(.06,.22,2.7,yel,dx,0,1.35));sl.castShadow=true;
   // spring rider and seesaw
   const rx=px-2.0,rz=pz+2.9;cyl(.1,.5,steel,rx,Y0+.3,rz,0,0);g.add(box(.35,.35,.85,M(0x3ee08f),rx,Y0+.55,rz));g.add(box(.28,.4,.28,M(0x3ee08f),rx,Y0+.85,rz+.42));g.add(box(.5,.05,.06,steel,rx,Y0+1.05,rz+.3));
   const ssx=px+.9,ssz=pz+3.1;g.add(box(.25,.45,.25,steel,ssx,Y0,ssz));const pl=box(3.2,.08,.32,yel,0,0,0);pl.position.set(ssx,Y0+.5,ssz);pl.rotation.z=.16;g.add(pl);for(const dx of[-1.4,1.4]){const h=cyl(.03,.35,red,ssx+dx,Y0+.62+dx*.11,ssz,0,Math.PI/2);h.rotation.x=Math.PI/2}}
  const tl=[],lf=[],lc=[];for(const[x,z,s]of[[.04,.07,1.3],[.95,.08,1.4],[.05,.92,1.4],[.95,.92,1.3],[.12,.6,1.5],[.55,.8,1.2],[.82,.28,1.5],[.62,.22,1.1],[.2,.86,1.1],[.42,.08,1],[.9,.62,1.2]]){const x2=L.x0+L.w*x,z2=L.z0+L.d*z;tl.push([x2,Y0+.7*s,z2,0,0,0,s]);lf.push([x2,Y0+2.1*s,z2,.3,.6,0,s]);lc.push(['#4f8a3c','#3f7a34','#5c9445','#467f38'][Math.floor(rnd()*4)])}
  inst(new T.CylinderGeometry(.18,.25,1.4,6),mat.trunk,tl,true);inst(new T.IcosahedronGeometry(1.25,0),M(0xffffff,{flatShading:true}),lf,true,lc);
  g.add(sign('MOTOROPOLIS PARK',9,1.3,'#2e7d4f','#fff',L.cx,Y0+1.3,L.z0+.5,0));for(const dx of[-4.2,4.2])g.add(box(.2,1.4,.2,mat.dark,L.cx+dx,Y0,L.z0+.5));
  scene.add(g)}
 {// MOTOROPOLIS DAILY: newsroom building + kiosk plaza
  const L=LOT.news,g=new T.Group();const bw=L.w-14,bd=L.d-7.2,bx=L.x0+12.8+bw/2,bz=L.z0+6.2+bd/2;
  g.add(box(L.w,.05,L.d,M(0xd9d1c0),L.cx,Y0,L.cz,false));
  shellB(g,bw,7.2,bd,bx,bz,mat.wall3,M(0x1f3a2c));rowWin(g,bx-bw/2+1,bx+bw/2-1,Y0+1.2,bz-bd/2,8,-1);rowWin(g,bx-bw/2+1,bx+bw/2-1,Y0+4.2,bz-bd/2,8,-1);
  g.add(box(3.2,3,.2,mat.glass,bx-bw/2+4,Y0,bz-bd/2-.1,false));g.add(box(4,.3,1.6,M(0xd93a2f),bx-bw/2+4,Y0+3.1,bz-bd/2-.7,false));
  g.add(sign('MOTOROPOLIS DAILY',bw-4,1.7,'#d93a2f','#fff',bx,Y0+8.4,bz-bd/2+.4,0));
  hvac(g,bx+bw/4,Y0+7.65,bz);hvac(g,bx-bw/4,Y0+7.65,bz+2);
  const dish=new T.Mesh(new T.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),mat.steel);dish.scale.set(1.1,.4,1.1);dish.rotation.x=-.9;dish.position.set(bx+bw/2-2.5,Y0+8.6,bz+bd/2-2.5);g.add(dish);
  // kiosk on the plaza
  const kx=L.x0+5.8,kz=L.z0+8.6;KQ.cx=kx;KQ.cz=kz;const kg=new T.Group();kg.position.set(kx,Y0,kz);const gm=M(0x2e7d4f);
  const body=new T.Mesh(new T.CylinderGeometry(2.1,2.2,2.6,8),gm);body.position.y=1.3;body.castShadow=true;kg.add(body);
  const band=new T.Mesh(new T.CylinderGeometry(2.35,2.35,.7,8),M(0xd93a2f));band.position.y=2.95;band.castShadow=true;kg.add(band);
  const roof=new T.Mesh(new T.ConeGeometry(2.7,1.6,8),gm);roof.position.y=4.1;roof.castShadow=true;kg.add(roof);const fin=new T.Mesh(new T.SphereGeometry(.25,10,8),mat.yellow);fin.position.y=5;kg.add(fin);
  const cols=[0xd93a2f,0x2f6fd9,0xf2b81d,0x3ee08f,0xff7a1a,0x7a3fb0,0xf4f1e6,0x46c8ff];
  for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;if(k===6)continue;for(let r=0;r<2;r++)for(let c=0;c<2;c++){const mg=new T.Mesh(BOX,M(cols[(k*2+r+c)%8]));mg.scale.set(.5,.65,.05);const rr2=2.17;mg.position.set(Math.sin(a)*rr2+Math.cos(a)*(c-.5)*.6,.9+r*.8,Math.cos(a)*rr2-Math.sin(a)*(c-.5)*.6);mg.rotation.y=a;kg.add(mg)}}
  {const a=6*Math.PI/4+Math.PI/8;const win=new T.Mesh(BOX,mat.dark);win.scale.set(1.5,1.1,.1);win.position.set(Math.sin(a)*2.12,1.6,Math.cos(a)*2.12);win.rotation.y=a;kg.add(win);const ct=new T.Mesh(BOX,mat.wood);ct.scale.set(1.6,.12,.5);ct.position.set(Math.sin(a)*2.35,1.05,Math.cos(a)*2.35);ct.rotation.y=a;kg.add(ct)}
  for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/8;const sg=sign('NEWS',1.6,.5,'#d93a2f','#fff',Math.sin(a)*2.37,2.95,Math.cos(a)*2.37,a);sg.scale.set(.9,.9,.3);kg.add(sg)}
  g.add(kg);
  const benchM=M(0x7a5a3a);for(const[x,z]of[[3.8,L.d-3.4],[9,L.d-3.4]]){const bg=new T.Group();bg.add(box(2.4,.12,.7,benchM,0,.45,0));bg.add(box(2.4,.6,.1,benchM,0,.55,.32));bg.position.set(L.x0+x,Y0,L.z0+z);g.add(bg)}
  scene.add(g)}
 {// POLICE STATION
  const L=LOT.police,g=new T.Group();g.add(box(L.w,.05,L.d,M(0xc9c4b9),L.cx,Y0,L.cz,false));
  const bw=L.w-16.2,bd=L.d-3.2,bx=L.x0+15+bw/2,bz=L.z0+2+bd/2;const pm=M(0x1d4fb8);
  shellB(g,bw,6.4,bd,bx,bz,mat.wall2,pm);rowWin(g,bx-bw/2+1,bx+bw/2-1,Y0+1.4,bz-bd/2,6,-1);rowWin(g,bx-bw/2+1,bx+bw/2-1,Y0+4.2,bz-bd/2,6,-1);
  g.add(box(3.4,3,.2,mat.glass,bx-bw/2+3,Y0,bz-bd/2-.1,false));g.add(box(4.2,.3,1.6,pm,bx-bw/2+3,Y0+3.1,bz-bd/2-.7,false));
  g.add(sign('POLICE',bw-6,1.6,'#1d4fb8','#fff',bx+1.5,Y0+7.6,bz-bd/2+.4,0));
  const lb=box(.8,.5,.8,M(0x2f6fd9,{emissive:0x2f6fd9,emissiveIntensity:1.2}),bx-bw/2+3,Y0+3.5,bz-bd/2-.7,false);g.add(lb);
  g.add(box(.2,6,.2,mat.steel,L.x0+13,Y0,L.z0+2));const fl=box(1.6,1,.05,M(0x2f6fd9),L.x0+13.9,Y0+5,L.z0+2,false);g.add(fl);
  for(const x of[1.4,7,12.6])g.add(box(.12,.02,5.2,mat.dash,L.x0+x,Y0+.06,L.z0+11.8,false));
  hvac(g,bx+bw/4,Y0+6.85,bz);scene.add(g)}
 {// COURTHOUSE
  const L=LOT.court,g=new T.Group(),st=M(0xe9e5dc),st2=M(0xd8d1c2);g.add(box(L.w,.05,L.d,M(0xd9d1c0),L.cx,Y0,L.cz,false));
  const bw=L.w-8,bd=L.d-7.2,bx=L.cx,bz=L.z0+6+bd/2;
  shellB(g,bw,7,bd,bx,bz,mat.wall3,M(0x8a6a2c));
  for(let k=0;k<4;k++)g.add(box(bw-8-k*1.2+4,.3,1,st2,bx,Y0+k*.3,L.z0+1.4+k*1.05,false));
  for(let k=0;k<6;k++){const x=bx-(bw-14)/2+k*(bw-14)/5;const col=new T.Mesh(new T.CylinderGeometry(.42,.48,6.2,14),st);col.position.set(x,Y0+1.2+3.1,L.z0+5.2);col.castShadow=true;g.add(col)}
  g.add(box(bw-10,.6,2.4,st,bx,Y0+7.4,L.z0+5.2));
  g.add(box(bw-9,.5,3,st2,bx,Y0+8,L.z0+5.4));g.add(box(bw-12,.5,2.6,st,bx,Y0+8.5,L.z0+5.4));
  g.add(sign('COURTHOUSE',bw-14,1.3,'#4a3412','#ffd34d',bx,Y0+6.9,L.z0+3.9,0));
  const sc=new T.Group();sc.add(box(.15,2.2,.15,M(0xe8b931,{metalness:.6,roughness:.3}),0,0,0));sc.add(box(2.4,.12,.12,M(0xe8b931,{metalness:.6,roughness:.3}),0,2.1,0));for(const dx of[-1.1,1.1]){const pan=new T.Mesh(new T.CylinderGeometry(.45,.3,.15,14),M(0xe8b931,{metalness:.6,roughness:.3}));pan.position.set(dx,1.5,0);sc.add(pan)}
  sc.position.set(bx,Y0+9.9,L.z0+5.4);g.add(sc);
  for(const x of[2,L.w-2]){const tr=new T.Mesh(new T.IcosahedronGeometry(1.4,0),M(0x4f8a3c,{flatShading:true}));tr.position.set(L.x0+x,Y0+2.4,L.z0+2);tr.castShadow=true;g.add(tr);g.add(box(.3,1.4,.3,mat.trunk,L.x0+x,Y0,L.z0+2))}
  scene.add(g)}
