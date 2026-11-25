//@ cars/vehicles3d.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- vehicles ----------
 const colCache={};const colMat=c=>colCache[c]||(colCache[c]=X?new T.MeshPhysicalMaterial({color:c,roughness:.38,metalness:.35,clearcoat:.6,clearcoatRoughness:.25}):M(c,{roughness:.32,metalness:.35}));
 const WHEEL=new T.CylinderGeometry(.3,.3,.22,14).rotateZ(Math.PI/2);
 function carMesh(c){if(X){const xm=carMeshX(c);if(xm)return xm}
  const g=new T.Group(),L=c.len/10,Wd=c.wid/10*.92,body=colMat(c.color),m=c.m||{};
  const add=(w,h,d,mt,x,y,z,cast)=>{const b=box(w,h,d,mt,x,y,z,cast);g.add(b);return b};
  if(c.kind==='tow'){add(Wd*.9,.45,L*.96,mat.dark,0,.28,0);add(Wd,1.15,L*.3,body,0,.35,L*.3);add(Wd*1.01,.42,L*.12,mat.carGlass,0,1.0,L*.42,false);add(Wd,.28,L*.56,mat.steel,0,.72,-L*.17);
   add(.25,1.3,.25,body,0,1,-L*.38);add(.18,.18,L*.3,body,0,2.2,-L*.27,false);add(Wd*.6,.15,.25,mat.beacon,0,1.5,L*.3,false)}
  else if(c.kind==='van'){add(Wd,1.45,L*.96,body,0,.3,0);add(Wd*1.01,.45,L*.08,mat.carGlass,0,1.05,L*.45,false);add(Wd*1.01,.25,L*.7,mat.orange,0,.85,-L*.06,false)}
  else{const sport=m.sport,pick=m.pickup,wag=m.wagon||/SUV/.test(m.n||''),cl=m.classic;
   add(Wd,.5,L,body,0,.25,0);
   if(sport){add(Wd*.84,.36,L*.4,mat.carGlass,0,.75,-L*.06);add(Wd*.8,.06,L*.32,body,0,1.11,-L*.07,false);add(Wd*.9,.08,.25,mat.dark,0,.95,-L*.47,false)}
   else if(pick){add(Wd*.9,.58,L*.34,mat.carGlass,0,.75,L*.1);add(Wd*.88,.08,L*.3,body,0,1.33,L*.1,false);for(const dx of[-1,1])add(.1,.32,L*.4,body,dx*(Wd/2-.05),.75,-L*.28,false);add(Wd,.32,.1,body,0,.75,-L*.48,false)}
   else if(wag){add(Wd*.88,.58,L*.66,mat.carGlass,0,.75,-L*.1);add(Wd*.86,.08,L*.62,body,0,1.33,-L*.1,false)}
   else{add(Wd*.86,.52,L*.5,mat.carGlass,0,.75,-L*.04);add(Wd*.84,.08,L*.44,body,0,1.27,-L*.04,false)}
   if(cl)for(const s of[1,-1])add(Wd*1.02,.12,.12,mat.chrome,0,.36,s*L*.5,false)}
  for(const[x,z]of[[-1,.32],[1,.32],[-1,-.32],[1,-.32]]){const w=new T.Mesh(WHEEL,mat.tire);w.position.set(x*Wd/2,.3,z*L);g.add(w)}
  const hl=add(Wd*.75,.14,.05,mat.hl,0,.5,L/2+.01,false);const tl=add(Wd*.75,.13,.05,mat.tailOff,0,.52,-L/2-.01,false);g.userData.tl=tl;
  if(c.kind==='police'){for(const s of[1,-1])add(.06,.36,L*.36,mat.black,s*(Wd/2+.01),.32,-.05*L,false);add(Wd*.9,.04,L*.18,mat.black,0,1.29,-L*.04,false);g.userData.lb=[add(Wd*.4,.18,.3,M(0xff3b30,{emissive:0xff3b30,emissiveIntensity:2}),-Wd*.22,1.36,-L*.04,false),add(Wd*.4,.18,.3,M(0x2f6fd9,{emissive:0x2f6fd9,emissiveIntensity:2}),Wd*.22,1.36,-L*.04,false)]}
  return g}
 const raceMeshes=race.map(r=>{const g=carMesh({kind:'car',len:30,wid:16,color:r.col,m:{sport:true,n:'race'}});const nb=new T.Mesh(new T.CircleGeometry(.42,16).rotateX(-Math.PI/2),M(0xffffff));nb.position.set(0,1.15,-.2);g.add(nb);g.visible=false;scene.add(g);return g});
 const meshes=new Map();
 const ring=new T.Mesh(new T.RingGeometry(2.3,2.6,40).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9}));ring.visible=false;scene.add(ring);
 const inLot=(x,y)=>{for(const b of buildings)if(x>b.x0-1&&x<b.x1+1&&y>b.y0-1&&y<b.y1+1)return true;return false};
 function syncCars(dt){
  const seen=new Set();lodBegin();
  for(const c of cars){if(c.removed)continue;seen.add(c.id);let g=meshes.get(c.id);if(!g){g=carMesh(c);g.userData.y=inLot(c.x,c.y)?Y0:.02;scene.add(g);meshes.set(c.id,g)}
   g.visible=!c.hidden;if(!g.visible)continue;
   if(g.userData.lb){const on=Math.floor(simTime*6)%2===0;g.userData.lb[0].visible=!c.siren||on;g.userData.lb[1].visible=!c.siren||!on}
   const ty=c.state==='towed'?.55:(inLot(c.x,c.y)?Y0:.02);g.userData.y+=(ty-g.userData.y)*Math.min(1,dt*8);
   let sc=1;if(c.state==='service'&&c.slot&&c.slot.b.type==='sucata')sc=Math.max(.35,c.timer/3);
   let lift=0;if(c.state==='service'&&c.slot&&c.slot.b.type==='oficina'&&c.kind==='car'&&c.task&&c.task.type!=='parts'){const tot=c.svcTotal||6,el=tot-c.timer;lift=Math.min(1.4,el*.9,Math.max(0,c.timer)*.9)}
   g.position.set(U(c.x),g.userData.y+lift,U(c.y));g.rotation.y=Math.PI/2-c.ang;g.scale.set(1,sc,1);
   if(c.state==='towed')g.rotation.x=-.08;else g.rotation.x=0;
   g.userData.tl.material=c.brake||c.state==='broken'?mat.tailOn:mat.tailOff;lodCar(g,c)}
  for(const[id,g]of meshes)if(!seen.has(id)){scene.remove(g);meshes.delete(id)}
  // race cars
  const open=isOpen('pista'),Pi=B.pista,ax=Pi.w/2-26,ay=Pi.h/2-24,pcx=Pi.x0+Pi.w/2,pcy=Pi.y0+Pi.h/2;
  race.forEach((r,k)=>{const g=raceMeshes[k];g.visible=open;if(!open)return;const a=r.t*TAU,x=pcx+Math.cos(a)*ax,y=pcy+Math.sin(a)*ay,ang=Math.atan2(Math.cos(a)*ay,-Math.sin(a)*ax);g.position.set(U(x),Y0+.03,U(y));g.rotation.y=Math.PI/2-ang});
  if(selected&&!selected.removed&&!selected.hidden){ring.visible=true;const g=meshes.get(selected.id);if(g){ring.position.set(g.position.x,g.position.y+.05,g.position.z);ring.material.opacity=.6+.35*Math.sin(simTime*6)}}else ring.visible=false;
 }
