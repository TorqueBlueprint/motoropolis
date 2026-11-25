//@ interiors/_kit.js - shared interior kit: room(), furnish(), header(), lockedNote(), mirror(), carTags(), holderRow()
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- 3D interiors: the rest of the city ----------
 function room(o){const S=new T.Scene();const RW=o.w||52,RD=o.d||22,RH=o.h||9,X0=-RW/2,Z0=-RD/2;
  S.background=new T.Color(o.bg||0x0b1626);S.fog=new T.Fog(o.bg||0x0b1626,70,140);S.add(new T.HemisphereLight(0xeef4ff,0x262b33,.75));
  const key=new T.DirectionalLight(0xfff3e0,1.5);key.position.set(14,26,22);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-32,right:32,top:20,bottom:-20,near:2,far:80});key.shadow.bias=-.0006;S.add(key);
  const add=x=>{S.add(x);return x};const B2=(w,h,d,m,x,y,z,c)=>add(box(w,h,d,m,x,y,z,c));
  const fl=new T.Mesh(new T.PlaneGeometry(RW,RD+8),M(o.floor||0x8b9097,{roughness:o.gloss?.15:.6,metalness:o.gloss?.3:.05}));fl.rotation.x=-Math.PI/2;fl.position.set(0,0,4);fl.receiveShadow=true;add(fl);
  const wm=M(o.wall||0x1d3b5c,{roughness:.9}),wm2=M(o.wall2||o.wall||0x16304d,{roughness:.9});
  B2(RW,RH,.5,wm,0,0,Z0,true);B2(.5,RH,RD,wm2,X0,0,0,true);B2(.5,RH,RD,wm2,-X0,0,0,true);
  if(o.trim)B2(RW,.5,.6,M(o.trim),0,RH-1.6,Z0+.5,false);
  if(o.title)add(sign(o.title,o.titleW||18,1.9,o.sbg||'#22252b',o.sfg||'#fff',0,RH-2.8,Z0+.4,0));
  for(const x of[-16,0,16]){const pl=new T.PointLight(o.light||0xfff1d0,32,24,1.6);pl.position.set(x,RH-1,-1);add(pl)}
  if(o.deco!==false)furnish({S,add,B2,RW,RD,RH,X0,Z0},o,fl);
  return{S,add,B2,RW,RD,RH,X0,Z0}}
 // shared interior detail: tiled floor, windows, light panels, clock, posters, plants, extinguisher and an optional front desk
 const FURN={};
 function furnish(R,o,fl){const{add,B2,RW,RH,X0,Z0}=R;
  if(!FURN.tile){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,256,256);for(let k=0;k<1400;k++){x.fillStyle=Math.random()<.5?'rgba(0,0,0,.05)':'rgba(255,255,255,.4)';x.fillRect(Math.random()*256,Math.random()*256,2,2)}
   x.strokeStyle='rgba(0,0,0,.22)';x.lineWidth=3;for(let k=0;k<=256;k+=128){x.beginPath();x.moveTo(k,0);x.lineTo(k,256);x.moveTo(0,k);x.lineTo(256,k);x.stroke()}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;FURN.tile=t;
   FURN.glass=M(0xbfe6ff,{emissive:0x9fd0ff,emissiveIntensity:.35,roughness:.1,metalness:.2});FURN.frame=M(0xd8dde3,{metalness:.5,roughness:.35});FURN.panel=M(0xffffff,{emissive:0xfff6e0,emissiveIntensity:1.1});
   FURN.pot=M(0x8a5a3a);FURN.leaf=M(0x3f8f45,{flatShading:true});FURN.wood=M(0xb07a45,{roughness:.6});FURN.white=M(0xf4f4f0,{roughness:.5});FURN.dark=M(0x22252b,{roughness:.4});FURN.screen=M(0x111827,{emissive:0x46c8ff,emissiveIntensity:.6});FURN.red=M(0xd93a2f,{roughness:.4});FURN.seat=M(0x2f6fd9,{roughness:.6})}
  const fm=fl.material;fm.map=FURN.tile.clone();fm.map.needsUpdate=true;fm.map.repeat.set(RW/4,(R.RD+8)/4);
  // windows on both side walls
  for(const sx of[-1,1]){const wx=sx*(-X0-.3);for(const wz of[-5,2]){B2(.12,3.2,4.6,FURN.glass,wx,2.4,wz,false);B2(.2,.25,5,FURN.frame,wx,2.3,wz,false);B2(.2,.25,5,FURN.frame,wx,5.6,wz,false);B2(.2,3.5,.25,FURN.frame,wx,2.3,wz-2.4,false);B2(.2,3.5,.25,FURN.frame,wx,2.3,wz+2.4,false);B2(.2,3.5,.18,FURN.frame,wx,2.3,wz,false)}}
  // clock and posters on the side walls
  {const cl=new T.Mesh(new T.CylinderGeometry(.7,.7,.12,24),FURN.white);cl.rotation.z=Math.PI/2;cl.position.set(X0+.35,RH-2.6,-1.5);add(cl);B2(.05,.5,.08,FURN.dark,X0+.43,RH-2.6,-1.5,false);B2(.05,.08,.4,FURN.dark,X0+.43,RH-2.6,-1.35,false)}
  const PCOL=['#ff7a1a','#2f6fd9','#3ee08f','#e8b931'];for(let k=0;k<2;k++){B2(.08,2.2,1.6,FURN.frame,-X0-.3,2.6,-9+k*2.4,false);B2(.05,1.9,1.3,M(PCOL[(k+(o.title||'').length)%4],{roughness:.5}),-X0-.36,2.75,-9+k*2.4,false)}
  // extinguisher + plants
  {const ex=new T.Mesh(new T.CylinderGeometry(.22,.22,.9,12),FURN.red);ex.position.set(-X0-.45,1.25,4.6);add(ex);B2(.06,.5,.5,FURN.red,-X0-.3,2.1,4.6,false)}
  for(const px of[X0+1.4,-X0-1.4]){const p=new T.Mesh(new T.CylinderGeometry(.55,.42,.9,12),FURN.pot);p.position.set(px,.45,9);add(p);const l=new T.Mesh(new T.IcosahedronGeometry(.9,0),FURN.leaf);l.position.set(px,1.6,9);l.scale.y=1.3;add(l)}
  // front desk with computer, chair, bell, waiting chairs and a water cooler
  if(o.recep){const dx=-X0-12,dz=8.2;B2(6.4,1.15,1.4,FURN.wood,dx,0,dz);B2(6.7,.12,1.7,FURN.white,dx,1.15,dz,false);B2(1.6,1.15,3.4,FURN.wood,dx+2.4,0,dz-2.4);B2(1.8,.12,3.6,FURN.white,dx+2.4,1.15,dz-2.4,false);
   B2(1.2,.8,.1,FURN.dark,dx-1,1.3,dz-.3);B2(1.05,.65,.05,FURN.screen,dx-1,1.38,dz-.36,false);B2(.8,.05,.3,FURN.dark,dx-1,1.28,dz+.2,false);{const bl=new T.Mesh(new T.SphereGeometry(.16,10,6,0,Math.PI*2,0,Math.PI/2),M(0xe8c45a,{metalness:.9,roughness:.2}));bl.position.set(dx+1.6,1.27,dz+.4);add(bl)}
   B2(.8,.1,.8,FURN.dark,dx-1,.75,dz-1.4,false);B2(.8,.9,.12,FURN.dark,dx-1,.8,dz-1.8,false);B2(.1,.75,.1,FURN.dark,dx-1,0,dz-1.4,false);
   add(sign(o.recep,6,1,'#22252b','#ffd34d',dx,4.6,dz,0));for(const sx of[-2.6,2.6])B2(.05,1.6,.05,FURN.dark,dx+sx,5.1,dz,false);
   const rp=upgP(personMesh('#22252b','#f0c9a0','#2b1d14'),'Receptionist');rp.scale.setScalar(1.45);rp.position.set(dx-.2,0,dz-1.3);add(rp);
   for(let k=0;k<3;k++){const cx=dx-9+k*1.5;B2(1.1,.12,1.1,FURN.seat,cx,.85,10.4,false);B2(1.1,1,.15,FURN.seat,cx,.85,10.95,false);B2(.1,.85,.1,FURN.dark,cx,0,10.4,false)}
   B2(1.6,.6,1,FURN.wood,dx-4.3,0,10.4);{const wc=new T.Mesh(new T.CylinderGeometry(.35,.35,.9,12),M(0x9fd0ff,{transparent:true,opacity:.7}));wc.position.set(dx-11.6,2.05,10.6);add(wc);B2(.8,1.6,.8,FURN.white,dx-11.6,0,10.6)}}}
 function header(t){hctx.font="800 30px 'Barlow Condensed', sans-serif";const w=hctx.measureText(t).width+44;hctx.fillStyle='rgba(16,19,24,.86)';rrect(hctx,HUDW/2-w/2,64,w,48,10);hctx.fill();hctx.fillStyle='#fff';hctx.textAlign='center';hctx.fillText(t,HUDW/2,89)}
 function lockedNote(type){if(isOpen(type))return;const m=MS[type];const p=toHud(0,4,2);if(p)pill(`BLUEPRINT PREVIEW · OPENS AT ${m.n.toLocaleString('en-US')} SUBS`,p.x,p.y,24,'rgba(15,47,92,.94)','#c8defa','#9fd0ff')}
 // mirror the cars parked in a building's slots into an interior
 function mirror(slots,holders,scale,place){slots.forEach((s,k)=>{const h=holders[k];if(!h)return;const c=s.car&&!s.car.removed&&(s.car.state==='service')?s.car:null;const id=c?c.id:null;
  if(id!==h.id){h.id=id;while(h.g.children.length)h.g.remove(h.g.children[0]);if(c){const m=carMesh(c);m.scale.setScalar(scale);h.g.add(m)}}if(place)place(h,c,k)})}
 function carTags(holders,y,extra){const sz=clamp(1100/cam.dist,14,24);holders.forEach(h=>{if(!h.id)return;const c=cars.find(q=>q.id===h.id);if(!c)return;const p=toHud(h.g.position.x,h.g.position.y+y,h.g.position.z);if(!p)return;
  pill(c.driver?'★ '+c.driver:c.plate,p.x,p.y,sz,c.driver?'rgba(255,122,26,.95)':'#fafafa',c.driver?'#1d0f02':'#111');if(extra){const t=extra(c);if(t){const p2=toHud(h.g.position.x,h.g.position.y+y-.9,h.g.position.z);if(p2)pill(t,p2.x,p2.y,sz*.8,'rgba(16,19,24,.85)','#ffb36b')}}})}
 const holderRow=(R,n,xs,z,ry)=>xs.slice(0,n).map(x=>{const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry||0;R.add(g);return{g,id:null}});
 const STD_HOME={tx:0,tz:-1,yaw:.25,pitch:.38,dist:44};

