//@ buildings/exteriors.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 const BUILD={
  market(L){const g=new T.Group();
   // painted bays, kerb island and trolley bays in front of the store
   g.add(box(L.w-.6,.05,10.8,M(0x5f656d,{roughness:.95}),L.cx,Y0,L.z0+5.3,false));
   for(const s of B.market.slots){const x=U(s.x),z=U(s.y);for(const dx of[-1.7,1.7])g.add(box(.18,.04,5.6,mat.dash,x+dx,Y0+.08,z,false))}
   g.add(box(L.w-2,.04,.2,mat.dash,L.cx,Y0+.08,L.z0+9.6,false));
   for(const tx of[L.x0+L.w-4.6,L.x0+L.w-2.2]){g.add(box(1.6,.25,5.2,M(0xc9ccd0),tx,Y0,L.z0+5.4,false));g.add(box(1.5,1.9,.16,mat.steel,tx,Y0+.25,L.z0+2.9,false));g.add(box(1.7,.12,5.4,M(0xdfe3e7),tx,Y0+2.1,L.z0+5.4,false));
    for(let k=0;k<4;k++){g.add(box(1,.8,.08,mat.steel,tx,Y0+.5,L.z0+3.6+k*.9,false));g.add(box(1,.08,.9,mat.steel,tx,Y0+.5,L.z0+4+k*.9,false))}}
   // lamp posts
   for(const x of[L.x0+3,L.cx-4,L.x0+L.w-8]){g.add(box(.25,6,.25,mat.steel,x,Y0,L.z0+9.1));g.add(box(1.5,.25,.6,M(0xf6f2e4,{emissive:0xfff1d0,emissiveIntensity:.8}),x,Y0+5.9,L.z0+9.1,false))}
   // the store: 3D model, with a plain block behind it so the lot is never empty
   const bw=23,bh=6.4,bd=9.4,cx=L.cx,cz=L.z0+L.d-bd/2-.5;
   const stub=new T.Group();g.add(stub);
   stub.add(box(bw,bh,bd,M(0x9fc6d8),cx,Y0,cz));stub.add(box(bw+.6,.5,bd+.6,M(0x2e7d4f),cx,Y0+bh,cz,false));
   g.add(sign(chan()+' SUPERMARKET',13,1.7,'#2e7d4f','#ffffff',cx,Y0+bh+1.7,cz-bd/2+.3,0));
   if(X&&X.ld)X.ld.loadAsync(ASSET_BASE+'assets/world/market.glb').then(gl=>{const m=gl.scene;m.updateMatrixWorld(true);const b0=new T.Box3().setFromObject(m),s0=b0.getSize(new T.Vector3());
    m.scale.set(bd/s0.x,bh/s0.y,bw/s0.z);m.updateMatrixWorld(true);const b1=new T.Box3().setFromObject(m);m.position.set(-(b1.min.x+b1.max.x)/2,-b1.min.y,-(b1.min.z+b1.max.z)/2);
    m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
    const piv=new T.Group();piv.add(m);piv.rotation.y=Math.PI/2;piv.position.set(cx,Y0,cz);g.add(piv);stub.visible=false}).catch(e=>console.warn('market',e));
   hvac(g,cx+5,Y0+bh+.3,cz+2);hvac(g,cx-5,Y0+bh+.3,cz+2);return g},
  oficina(L){const g=new T.Group();backShop(g,L,17.1,chan()+' REPAIR SHOP','#ff7a1a','#1d0f02',[4.5,10.9,17.3,23.7,30.1]);
   for(const s of B.oficina.slots){const x=U(s.x),z=U(s.y);for(const dx of[-1.25,1.25]){g.add(box(.35,2.8,.35,mat.yellow,x+dx,Y0,z+.9));g.add(box(.14,.12,1.6,mat.yellow,x+dx*.75,Y0+.35,z))}g.add(box(2.9,.16,.35,mat.yellow,x,Y0+2.8,z+.9))}
   g.add(box(4.2,.02,3.2,mat.stripe||(mat.stripe=M(0xffd34d)),L.x0+29.6,Y0,L.z0+3,false));return g},
  bomba(L){const g=new T.Group();g.add(box(17,.55,13,mat.wall,L.x0+16.75,Y0+4.4,L.z0+11.1));g.add(box(17.1,.35,13.1,mat.red,L.x0+16.75,Y0+4.3,L.z0+11.1,false));
   for(const[x,z]of[[9.6,5.4],[23.9,5.4],[9.6,16.8],[23.9,16.8]])g.add(box(.45,4.3,.45,mat.wall2,L.x0+x,Y0,L.z0+z));
   for(const z of[7.2,15]){g.add(box(1.1,.2,3.6,mat.curb,L.x0+16.75,Y0,L.z0+z,false));g.add(box(.8,1.7,.7,mat.wall2,L.x0+16.75,Y0+.2,L.z0+z));g.add(box(.82,.45,.72,mat.red,L.x0+16.75,Y0+1.5,L.z0+z,false))}
   g.add(box(5.6,4,9,mat.wall,L.x0+30.6,Y0,L.z0+12.2));rowWin(g,L.x0+28.2,L.x0+33,1.4,L.z0+16.75,3,1);g.add(sign('FUEL · SNACKS',5.4,1.1,'#d93a2f','#fff',L.x0+30.6,Y0+4.4,L.z0+16.9,0));
   g.add(sign('FUEL',8,1.6,'#d93a2f','#fff',L.x0+16.75,Y0+5.15,L.z0+17.7,0));g.add(sign('FUEL',8,1.6,'#d93a2f','#fff',L.x0+16.75,Y0+5.15,L.z0+4.5,Math.PI));
   g.add(box(.3,6,.3,mat.dark,L.x0+3.5,Y0,L.z0+19));const pr=sign('$3.49',3,1.4,'#22252b','#ffd34d',L.x0+3.5,Y0+6.2,L.z0+19,0);g.add(pr);return g},
  stand(L){const g=new T.Group();g.add(box(L.w-3,4.8,3.6,mat.glass,L.cx,Y0,L.z0+19.4));g.add(box(L.w-2.6,.55,4,mat.wall,L.cx,Y0+4.8,L.z0+19.4));
   g.add(sign('DEALERSHIP · NEW & USED',L.w-9,1.7,'#22252b','#fff',L.cx,Y0+6.3,L.z0+19.4,0));g.add(sign('DEALERSHIP',14,1.7,'#22252b','#fff',L.cx,Y0+6.3,L.z0+19.2,Math.PI));
   for(let k=0;k<7;k++){const x=L.x0+1.6+k*(L.w-3.2)/6;if(Math.abs(x-U(B.stand.door.x))<2.2)continue;g.add(box(.12,3.8,.12,mat.steel,x,Y0,L.z0+1.2));g.add(box(.04,1.1,1.1,[mat.red,mat.yellow,mat.blue][k%3],x,Y0+2.6,L.z0+1.8))}
   for(const s of B.stand.slots)g.add(box(3.4,.04,5,mat.wall2,U(s.x),Y0,U(s.y),false));return g},
  fabrica(L){const g=new T.Group();g.add(box(L.w-3,6.6,13,mat.wall2,L.cx,Y0,L.z0+8.1));
   for(let k=0;k<6;k++){const s=new T.Mesh(new T.CylinderGeometry(0,2.4,13,3,1),mat.roof);s.rotation.set(Math.PI/2,0,Math.PI/2);s.position.set(L.x0+3.6+k*5.5,Y0+7.3,L.z0+8.1);s.castShadow=true;g.add(s)}
   const ch=new T.Mesh(new T.CylinderGeometry(.9,1.2,13,12),mat.red);ch.position.set(L.x0+L.w-4.8,Y0+6.5,L.z0+3);ch.castShadow=true;g.add(ch);
   for(const x of[7,17])g.add(box(3.6,3.6,.12,mat.black,L.x0+x,Y0,L.z0+14.66,false));rowWin(g,L.x0+20,L.x1-2,3.4,L.z0+14.6,4,1);
   g.add(sign('CAR FACTORY',13,1.9,'#22252b','#fff',L.cx+3,Y0+5.4,L.z0+14.7,0));return g},
  lavagem(L){const g=new T.Group();for(const lz of[7.6,15.6]){for(const x of[13.5,22.5]){for(const dz of[-1.9,1.9])g.add(box(.35,3.3,.35,mat.blue,L.x0+x,Y0,L.z0+lz+dz));g.add(box(.5,.45,4.2,mat.blue,L.x0+x,Y0+3.3,L.z0+lz))}
    g.add(box(9.4,.25,.35,mat.cyan,L.x0+18,Y0+3.5,L.z0+lz-1.9,false));g.add(box(9.4,.25,.35,mat.cyan,L.x0+18,Y0+3.5,L.z0+lz+1.9,false));
    for(const dz of[-1.45,1.45]){const br=new T.Mesh(new T.CylinderGeometry(.42,.42,2.6,12),mat.cyan);br.position.set(L.x0+18,Y0+1.4,L.z0+lz+dz);br.userData.spin=1;g.add(br)}
    g.add(box(10,.02,.25,mat.dash,L.x0+18,Y0,L.z0+lz-1.2,false));g.add(box(10,.02,.25,mat.dash,L.x0+18,Y0,L.z0+lz+1.2,false))}
   g.add(sign('CAR WASH',9,1.6,'#3fa7c4','#062a36',L.x0+18,Y0+4.8,L.z0+9.75,0));
   g.add(box(5.4,3.6,7,mat.wall,L.x0+30.8,Y0,L.z0+11.6));rowWin(g,L.x0+28.6,L.x0+33,1.3,L.z0+15.1,3,1);return g},
  pista(L){const g=new T.Group();const ax=U(B.pista.w/2-26),ay=U(B.pista.h/2-24);const sh=new T.Shape();sh.absellipse(0,0,ax+1.7,ay+1.7,0,Math.PI*2);const hole=new T.Path();hole.absellipse(0,0,ax-1.7,ay-1.7,0,Math.PI*2,true);sh.holes.push(hole);
   const t=new T.Mesh(new T.ShapeGeometry(sh,72),mat.track);t.rotation.x=Math.PI/2;t.position.set(L.cx,Y0+.03,L.cz);t.receiveShadow=true;g.add(t);
   const inner=new T.Mesh(new T.CircleGeometry(1,48),mat.grass2);inner.scale.set(ax-1.7,ay-1.7,1);inner.rotation.x=-Math.PI/2;inner.position.set(L.cx,Y0+.02,L.cz);inner.receiveShadow=true;g.add(inner);
   const kb=[],kc=[];for(let k=0;k<72;k++){const an=k/72*Math.PI*2;for(const r of[1.9,-1.9]){kb.push([L.cx+Math.cos(an)*(ax+r),Y0+.03,L.cz+Math.sin(an)*(ay+r),0,-an,0]);kc.push(k%2?'#e33b2e':'#f4f4f0')}}
   const ki=new T.InstancedMesh(new T.BoxGeometry(.5,.12,.5),M(0xffffff),kb.length);const o=new T.Object3D(),cc=new T.Color();kb.forEach((p,k)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(0,p[4],0);o.updateMatrix();ki.setMatrixAt(k,o.matrix);ki.setColorAt(k,cc.set(kc[k]))});g.add(ki);
   g.add(box(L.w-8,1.6,1.8,mat.grey,L.cx,Y0,L.z0+.9));g.add(box(L.w-8,.9,1,mat.grey,L.cx,Y0+1.6,L.z0+.5));
   const bt=labelTex(chan(),'#22252b','#ff7a1a',1024,200,120);const bm=new T.MeshStandardMaterial({map:bt,emissiveMap:bt,emissive:0xffffff,emissiveIntensity:0});signMats.push(bm);const lb=new T.Mesh(new T.PlaneGeometry(14,2.7),bm);lb.rotation.set(-Math.PI/2,0,Math.PI);lb.position.set(L.cx,Y0+.08,L.cz);g.add(lb);
   for(let k=0;k<6;k++)g.add(box(.4,.02,.6,k%2?mat.black:mat.kerbW,L.cx+ax-1.25+k*.5,Y0+.04,L.cz,false));return g},
  pecas(L){const g=new T.Group();shellB(g,21,5.2,15.4,L.x0+11.6,L.z0+11,mat.wall2,mat.red);rowWin(g,L.x0+2,L.x0+21,2.8,L.z0+18.7,6,1);rowWin(g,L.x0+2,L.x0+21,2.8,L.z0+3.3,6,-1);
   g.add(sign('AUTO PARTS',12,1.8,'#c0392b','#fff',L.x0+11.6,Y0+4.4,L.z0+18.8,0));g.add(sign('AUTO PARTS',12,1.8,'#c0392b','#fff',L.x0+11.6,Y0+4.4,L.z0+3.15,Math.PI));
   g.add(box(3,1,6,mat.curb,L.x0+23.6,Y0,L.z0+15));hvac(g,L.x0+7,Y0+5.65,L.z0+11);
   for(let k=0;k<4;k++){g.add(box(1.2,.15,1.2,mat.wood,L.x0+30+(k%2)*1.5,Y0,L.z0+3+Math.floor(k/2)*1.5));g.add(box(1,.9,1,M(0xc79a62),L.x0+30+(k%2)*1.5,Y0+.15,L.z0+3+Math.floor(k/2)*1.5))}return g},
  pneus(L){const g=new T.Group();backShop(g,L,17.2,'TIRES · ALIGNMENT','#22252b','#fff',[7.3,17.3,27.3]);
   const tg=new T.CylinderGeometry(.75,.75,.5,16);for(let k=0;k<4;k++)for(let r=0;r<5;r++){const ti=new T.Mesh(tg,mat.tire);ti.position.set(L.x0+28.5+(k%2)*1.8,Y0+.25+r*.52,L.z0+3+Math.floor(k/2)*1.8);ti.castShadow=true;g.add(ti)}return g},
  reboques(L){const g=new T.Group();backShop(g,L,16.8,'24H TOWING','#f2a51a','#1d0f02',[7.3,17.3,27.3]);for(const s of B.reboques.slots)g.add(box(3.2,.03,6.4,mat.stripe||(mat.stripe=M(0xffd34d)),U(s.x),Y0,U(s.y),false));return g},
  inspecao(L){const g=new T.Group();shellB(g,5.8,4.6,15,L.x0+30.6,L.z0+11.4,mat.wall,mat.blue);rowWin(g,L.x0+28,L.x0+33.2,2.4,L.z0+18.9,2,1);
   g.add(sign('INSPECTION',5.4,1.2,'#1d4fb8','#fff',L.x0+30.6,Y0+3.8,L.z0+19.05,0));
   for(const x of[15.2,20,24.8]){for(const z of[5.4,18.3])g.add(box(.3,3.8,.3,mat.steel,L.x0+x,Y0,L.z0+z));g.add(box(.4,.35,13.3,mat.blue,L.x0+x,Y0+3.8,L.z0+11.85))}
   g.add(sign('INSPECTION',8,1.3,'#1d4fb8','#fff',L.x0+20,Y0+5,L.z0+11.9,0));
   g.userData.lamps=B.inspecao.slots.map(s=>{const m=new T.Mesh(new T.SphereGeometry(.28,10,8),mat.lampOff);m.position.set(U(s.x)+3.6,Y0+3.5,U(s.y)-2);g.add(m);return{s,m}});
   for(const s of B.inspecao.slots)for(let k=0;k<10;k++)g.add(box(1.4,.02,.4,k%2?mat.black:mat.stripe||(mat.stripe=M(0xffd34d)),U(s.x)-6.3+k*1.4,Y0,U(s.y)+2.2,false));return g},
  parque(L){const g=new T.Group();g.add(box(L.w-.6,.03,L.d-.6,mat.lotAsph,L.cx,Y0,L.cz,false));
   for(const lz of[7.4,16.6])for(let k=0;k<6;k++)g.add(box(.14,.02,5,mat.dash,L.x0+1.9+k*6.2,Y0+.03,L.z0+lz,false));
   g.add(box(2.2,2.6,2,mat.wall,L.x0+L.w-2,Y0,L.z0+2));g.add(box(4,.18,.18,mat.red,L.x0+L.w-5,Y0+1,L.z0+.8,false));g.add(sign('P',1.6,1.6,'#1d4fb8','#fff',L.x0+L.w-2,Y0+3.6,L.z0+L.d-1.2,0));g.add(box(.2,2.8,.2,mat.dark,L.x0+L.w-2,Y0,L.z0+L.d-1.3));return g},
  sucata(L){const g=new T.Group();g.add(box(L.w-.6,.05,L.d-.6,mat.dirt,L.cx,Y0,L.cz,false));const s=B.sucata.slots[0],sx=U(s.x),sz=U(s.y);
   for(const dx of[-1.6,1.6])g.add(box(.45,1.7,5.4,mat.yellow,sx+dx,Y0,sz));const press=box(3.6,.5,5.4,mat.yellow,sx,0,sz);press.position.y=Y0+3.2;g.add(press);g.userData.press=press;
   for(const dx of[-1.6,1.6])g.add(box(.3,4,.3,mat.dark,sx+dx,Y0,sz-2.9));
   g.add(box(.8,9,.8,mat.yellow,L.x0+L.w-3,Y0,L.z0+3));g.add(box(13,.55,.55,mat.yellow,L.x0+L.w-8.5,Y0+9,L.z0+3));
   g.add(sign('JUNKYARD',8,1.6,'#5b4a3a','#fff',L.x0+5,Y0+3,L.z0+L.d-1,0));g.add(box(.25,2.2,.25,mat.dark,L.x0+5,Y0,L.z0+L.d-1.1));
   for(let k=0;k<14;k++){const x=L.x0+.4+k*(L.w-.8)/13;if(Math.abs(x-U(B.sucata.door.x))<1.8)continue;g.add(box(.12,1.8,.12,mat.grey,x,Y0,L.z0+.4,false))}return g},
 };
