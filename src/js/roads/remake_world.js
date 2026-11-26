//@ roads/remake_world.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- REMAKE world: canal with bridges, roundabouts, rounded blocks, bus stops ----------
 if(X){
  if(!WORLD){const rx0=XS3[0]-H3,rx1=XS3[NX-1]+H3,rz0=YS3[0]-H3,rz1=YS3[NY-1]+H3;const base=new T.Mesh(new T.PlaneGeometry(rx1-rx0,rz1-rz0),WORLD?mat.grass:mat.asphalt);base.rotation.x=-Math.PI/2;base.position.set((rx0+rx1)/2,-.006,(rz0+rz1)/2);base.receiveShadow=true;scene.add(base)}
  if(CANAL_I>=0){const cx=XS3[CANAL_I],cw=(HALF*2+24)/10,z0=YS3[0]-H3-4,z1=YS3[NY-1]+H3+4;
   const wm=M(0x2f6f9f,{roughness:.22,metalness:.15});const cuts=[z0,...YS3.flatMap(z=>[z-H3-.4,z+H3+.4]),z1];for(let k=0;k<cuts.length;k+=2){const a=cuts[k],b=cuts[k+1];if(b-a<.5)continue;const w=new T.Mesh(new T.PlaneGeometry(cw-.6,b-a),wm);w.rotation.x=-Math.PI/2;w.position.set(cx,.02,(a+b)/2);w.receiveShadow=true;scene.add(w)}
   const stone=M(0xb8b1a3,{roughness:.9});for(const s of[-1,1])scene.add(box(.3,.45,z1-z0,stone,cx+s*(cw/2-.15),0,(z0+z1)/2));
   const rail=M(0x2b3038,{metalness:.6,roughness:.35}),arch=M(0xc9c3b6,{roughness:.8});
   for(const z of YS3){const deck=box(cw+.4,.5,H3*2+.8,arch,cx,-.5,z);scene.add(deck);for(const s of[-1,1]){const zz=z+s*(H3+.25);scene.add(box(cw+.4,.22,.22,rail,cx,.95,zz));for(let k=0;k<7;k++)scene.add(box(.08,.95,.08,rail,cx-cw/2+.2+k*(cw/6),0,zz));scene.add(box(.5,1.4,.5,arch,cx-cw/2-.1,0,zz));scene.add(box(.5,1.4,.5,arch,cx+cw/2+.1,0,zz))}
    const lamp=new T.Mesh(new T.SphereGeometry(.22,10,8),mat.lamp);lamp.position.set(cx-cw/2-.1,1.65,z+H3+.25);scene.add(lamp);const l2=lamp.clone();l2.position.z=z-H3-.25;scene.add(l2)}
   const boat=new T.Group();boat.add(box(1.2,.35,3.2,M(0xf4f4f0),0,0,0,true));boat.add(box(.9,.5,1.1,M(0x2f6fd9),0,.35,-.3,true));boat.position.set(cx,.05,(YS3[1]+YS3[2])/2);scene.add(boat);KQ.boat=boat}
  if(!WORLD)for(const n of nodes){if(!n.round)continue;const x=U(n.x),z=U(n.y);const disc=new T.Mesh(new T.CircleGeometry((HALF+8)/10,40),mat.asphalt);disc.rotation.x=-Math.PI/2;disc.position.set(x,.014,z);scene.add(disc);
   const curb=new T.Mesh(new T.CylinderGeometry(1.65,1.7,.25,32),mat.curb);curb.position.set(x,.125,z);curb.castShadow=true;scene.add(curb);const gr=new T.Mesh(new T.CylinderGeometry(1.4,1.4,.27,32),mat.grass2);gr.position.set(x,.13,z);scene.add(gr);
   const tr=new T.Mesh(new T.CylinderGeometry(.12,.16,1.1,8),mat.trunk);tr.position.set(x,.8,z);scene.add(tr);const lf=new T.Mesh(new T.IcosahedronGeometry(.85,0),M(0x4f8a3c,{flatShading:true}));lf.position.set(x,1.7,z);lf.castShadow=true;scene.add(lf);
   for(let k=0;k<24;k++){const a=k/24*TAU;if(k%2)continue;const d=box(.6,.02,.12,mat.dash,x+Math.cos(a)*2.5,.03,z+Math.sin(a)*2.5,false);d.rotation.y=-a+Math.PI/2;scene.add(d)}}
  // bus stops on the Line 1 loop
  {const sh=M(0x2b3038,{metalness:.5,roughness:.4}),gl=M(0x9fc8e8,{roughness:.05,metalness:.3,transparent:true,opacity:.45});
   // Line 1 goes round the plaza ring: a shelter on four of its legs (Phase 1B)
   const BL=CITY.busLoop,segs=[0,2,4,5].map(k=>[BL[k],BL[(k+1)%BL.length]]);
   for(const[a,b]of segs){const d=segAt(a,b,EDGE(a,b).len/2),e=EDGE(a,b),p=lanePt(a,b,e.len/2);const o=e.w/2-e.lane+18;const x=U(p.x+d.rx*o),z=U(p.y+d.ry*o),ry=Math.atan2(d.dx,d.dy);const g=new T.Group();
    g.add(box(2.6,.08,1,sh,0,2.1,0));g.add(box(2.6,1.8,.05,gl,0,.3,-.45,false));for(const s of[-1,1])g.add(box(.08,2.1,.08,sh,s*1.25,0,-.45));g.add(box(2.2,.1,.4,M(0x7a5a3a),0,.6,-.2));
    g.add(sign('BUS 1',.9,.35,'#ff7a1a','#1d0f02',1.6,1.9,0,0));g.position.set(x,WORLD?.05:.3,z);g.rotation.y=ry;scene.add(g)}}
 }
