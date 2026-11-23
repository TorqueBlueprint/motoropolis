//@ cars/remake_bodies.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- REMAKE vehicles: smooth extruded bodies per category ----------
 const XGEO={};
 function profile(type,L){const s=new T.Shape(),h=L/2;const P={ // [roofHeight, bonnet, windshieldStart, roofStart, roofEnd, tail]
   sport:[.95,.62,-.05,.12,.42,.72],sedan:[1.18,.78,-.22,.0,.45,.85],compact:[1.2,.8,-.28,-.08,.5,.86],suv:[1.42,.92,-.32,-.18,.7,1.0],wagon:[1.22,.8,-.25,-.05,.82,.98],classic:[1.16,.86,-.18,.0,.4,.86],van:[1.62,.96,-.58,-.42,.95,1.0],police:[1.18,.78,-.22,.0,.45,.85]}[type]||[1.18,.78,-.22,0,.45,.85];
  const [rh,bh,ws,rs,re,tl]=P;
  s.moveTo(-h,.28);s.lineTo(-h,bh*.95);s.quadraticCurveTo(-h,bh*1.02,-h+.25,bh*1.02);
  s.lineTo(-re*h+.0,bh);s.quadraticCurveTo(-re*h+.1,rh,-re*h+.4,rh);s.lineTo(-rs*h,rh);s.quadraticCurveTo(ws*h+.1,rh,-ws*h*-1,bh*1.02);
  s.lineTo(h-.3,bh*.96);s.quadraticCurveTo(h,bh*.9,h,bh*.62);s.lineTo(h,.28);s.lineTo(h*.78,.28);s.absarc(h*.62,.3,.36,0,Math.PI,true);s.lineTo(-h*.42,.28);s.absarc(-h*.6,.3,.36,0,Math.PI,true);s.lineTo(-h,.28);return s}
 function bodyGeo(type,L,Wd){const k=type+L.toFixed(1)+Wd.toFixed(2);if(XGEO[k])return XGEO[k];
  const g=new T.ExtrudeGeometry(profile(type,L),{depth:Wd-.16,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:3,curveSegments:10});g.translate(0,0,-(Wd-.16)/2);g.rotateY(-Math.PI/2);return XGEO[k]=g}
 const glassX=()=>mat.carGlass;
 function wheelX(g,x,z,r){const w=new T.Mesh(WHEEL,mat.tire);w.scale.set(1.05,r/.3,r/.3);w.position.set(x,r,z);g.add(w);const rim=new T.Mesh(WHEEL,mat.chrome);rim.scale.set(1.12,r/.3*.62,r/.3*.62);rim.position.set(x,r,z);g.add(rim)}
 const GLBMAT={};
 function glbCar(c,key){const src=X.cars[key],cfg=CAR_GLB[key],L=c.len/10;const g=new T.Group();const m0=src.clone(true);const s=L*(cfg.lenK||1)/cfg.len;m0.position.set(-(cfg.cx||0),-(cfg.y0||0),-(cfg.cz||0));const m=new T.Group();m.add(m0);m.scale.setScalar(s);m.rotation.y=cfg.rot||0;
  const col=c.color||'#2f6fd9',mk=key+col;
  m.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
   // bodies exported as see-through (alpha blend) show the far-side wheels through the panels: make them solid, keep glass see-through
   if(o.material&&o.material.transparent&&!/glass/i.test(o.material.name||'')){const kk='opq'+o.material.uuid;if(!GLBMAT[kk]){const nm=o.material.clone();nm.transparent=false;nm.alphaTest=.5;nm.depthWrite=true;GLBMAT[kk]=nm}o.material=GLBMAT[kk]}
   if(cfg.keep)return;if(cfg.paint&&o.material&&[].concat(cfg.paint).includes(o.material.name)){const mk2=mk+o.material.name;if(!GLBMAT[mk2]){const nm=o.material.clone();if(!cfg.tint)nm.map=null;nm.color.set(col);nm.metalness=.35;nm.roughness=.35;nm.transparent=false;nm.opacity=1;GLBMAT[mk2]=nm}o.material=GLBMAT[mk2];return}if(o.material&&o.material.map&&o.material.name==='Car_Main'){if(!GLBMAT[mk]){const base=o.material,img=base.map.image;const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;const x=cv.getContext('2d');x.drawImage(img,0,0);
     const[cx,cy,cw,ch]=cfg.cell,k=img.width/64;x.fillStyle=col;x.fillRect(cx*k,cy*k,cw*k,ch*k);const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.flipY=base.map.flipY;t.magFilter=T.NearestFilter;t.minFilter=T.NearestFilter;t.generateMipmaps=false;
     const nm=base.clone();nm.map=t;nm.metalness=Math.min(nm.metalness,.5);GLBMAT[mk]=nm}o.material=GLBMAT[mk]}});
  g.add(m);const tl=box(L*.5,.08,.05,mat.tailOff,0,.62*s*cfg.len/4.4,-L/2+.02,false);tl.visible=false;g.add(tl);g.userData.tl=tl;return g}
 function carMeshX(c){if(X.cars&&['tow','fire','amb','garbage','van'].includes(c.kind)&&X.cars[c.kind]){const g=glbCar(c,c.kind);if(c.kind==='fire'||c.kind==='amb'){const L=c.len/10;g.userData.lb=[box(.5,.14,.3,M(0xff3b30,{emissive:0xff3b30,emissiveIntensity:2.5}),-.35,2.1,L*.3,false),box(.5,.14,.3,M(0x2f6fd9,{emissive:0x2f6fd9,emissiveIntensity:2.5}),.35,2.1,L*.3,false)];g.userData.lb.forEach(b=>g.add(b))}return g}
  if(c.kind==='tow')return null;if(c.m&&c.m.glb&&X.cars&&X.cars[c.m.glb])return glbCar(c,c.m.glb);
  if(c.kind==='bus'&&X.cars&&X.cars.bus)return glbCar(c,'bus');
  if(c.kind==='police'&&X.cars&&X.cars.police){const g=glbCar(c,'police'),L=c.len/10,H=CAR_GLB.police.h*L/CAR_GLB.police.len;g.userData.lb=[box(.42,.1,.22,M(0xff3b30,{emissive:0xff3b30,emissiveIntensity:2.5}),-.26,H-.16,-.02*L,false),box(.42,.1,.22,M(0x2f6fd9,{emissive:0x2f6fd9,emissiveIntensity:2.5}),.26,H-.16,-.02*L,false)];g.userData.lb.forEach(b=>g.add(b));return g}const g=new T.Group(),L=c.len/10,Wd=c.wid/10*.94,body=colMat(c.color),m=c.m||{};const add=(w,h,d,mt,x,y,z,cast)=>{const b=box(w,h,d,mt,x,y,z,cast);g.add(b);return b};
  if(c.kind==='bus'){add(Wd,2.3,L*.98,body,0,.35,0);add(Wd*1.01,.85,L*.86,mat.carGlass,0,1.35,-.02,false);add(Wd*1.01,.6,L*.06,mat.carGlass,0,1.3,L*.47,false);add(Wd*.98,.12,L*.94,M(0xeef3fb),0,2.66,0,false);
   add(Wd*1.02,.16,L*.98,M(0xeef3fb),0,1.05,0,false);const sg=add(Wd*.7,.3,.05,M(0x111111,{emissive:0xffb000,emissiveIntensity:1.2}),0,2.2,L*.49+.01,false);
   for(const z of[-L*.32,L*.32])for(const x of[-1,1])wheelX(g,x*Wd/2,z,.42);
   const hl=add(Wd*.8,.16,.05,mat.hl,0,.6,L/2+.01,false);const tl=add(Wd*.8,.16,.05,mat.tailOff,0,.8,-L/2-.01,false);g.userData.tl=tl;return g}
  if(c.kind==='fire'||c.kind==='amb'){const fi=c.kind==='fire',bc=fi?M(0xd93a2f,{roughness:.4}):M(0xf4f4f0,{roughness:.4}),st=fi?M(0xf4f4f0):M(0xd93a2f);
   add(Wd,fi?1.9:1.7,L*.64,bc,0,.32,-L*.17);add(Wd,1.4,L*.32,bc,0,.32,L*.33);add(Wd*1.01,.55,L*.1,mat.carGlass,0,1.05,L*.44,false);add(Wd*1.02,.2,L*.97,st,0,.95,0,false);
   if(fi){add(Wd*.5,.14,L*.72,mat.steel,0,fi?2.3:2,-L*.12,false);for(const s of[-1,1])add(.04,1,L*.5,M(0xb52a20),s*(Wd/2+.02),.5,-L*.18,false)}else for(const s of[-1,1]){add(.03,.7,.22,st,s*(Wd/2+.02),1.05,-L*.15,false);add(.03,.22,.7,st,s*(Wd/2+.02),1.29,-L*.15,false)}
   for(const z of[-L*.32,L*.3])for(const x of[-1,1])wheelX(g,x*Wd/2,z,.4);
   g.userData.lb=[add(Wd*.38,.2,.3,M(0xff3b30,{emissive:0xff3b30,emissiveIntensity:2}),-Wd*.2,1.75,L*.36,false),add(Wd*.38,.2,.3,M(0x2f6fd9,{emissive:0x2f6fd9,emissiveIntensity:2}),Wd*.2,1.75,L*.36,false)];
   add(Wd*.72,.14,.05,mat.hl,0,.6,L/2+.01,false);g.userData.tl=add(Wd*.72,.14,.05,mat.tailOff,0,.7,-L/2-.01,false);return g}
  const type=c.kind==='police'?'police':c.kind==='van'?'van':m.sport?'sport':m.classic?'classic':m.pickup?'pickup':m.wagon?'wagon':/SUV/.test(m.n||'')?'suv':L<2.75?'compact':'sedan';
  if(type==='pickup'){const cab=new T.Mesh(bodyGeo('suv',L*.62,Wd),body);cab.position.z=L*.19;cab.castShadow=true;g.add(cab);add(Wd,.62,L*.42,body,0,.28,-L*.29);add(Wd*.86,.08,L*.38,mat.dark,0,.86,-L*.29,false)}
  else{const b=new T.Mesh(bodyGeo(type,L,Wd),body);b.castShadow=true;g.add(b)}
  // glass band
  const P={sport:[.8,.42],sedan:[.98,.5],compact:[1.0,.48],suv:[1.18,.58],wagon:[1.0,.68],classic:[.98,.46],van:[1.32,.8],police:[.98,.5],pickup:[1.18,.34]}[type];
  add(Wd*1.005,(P[0]-.62)*.9,L*P[1],mat.carGlass,0,.66+(P[0]-.62)*.05,type==='pickup'?L*.16:-.02*L,false);
  if(type==='classic')for(const s of[1,-1])add(Wd*1.02,.1,.1,mat.chrome,0,.36,s*L*.5,false);
  if(type==='sport')add(Wd*.9,.06,.3,mat.dark,0,.86,-L*.46,false);
  for(const[x,z]of[[-1,.31],[1,.31],[-1,-.3],[1,-.3]])wheelX(g,x*Wd/2,z*L,type==='suv'||type==='pickup'?.36:.3);
  const hl=add(Wd*.72,.12,.05,mat.hl,0,.56,L/2+.01,false);const tl=add(Wd*.72,.12,.05,mat.tailOff,0,.6,-L/2-.01,false);g.userData.tl=tl;
  if(c.kind==='police'){for(const s of[1,-1])add(.05,.34,L*.34,mat.black,s*(Wd/2+.01),.36,-.03*L,false);add(Wd*.86,.04,L*.16,mat.black,0,1.24,-L*.06,false);g.userData.lb=[add(Wd*.38,.16,.28,M(0xff3b30,{emissive:0xff3b30,emissiveIntensity:2}),-Wd*.2,1.3,-L*.06,false),add(Wd*.38,.16,.28,M(0x2f6fd9,{emissive:0x2f6fd9,emissiveIntensity:2}),Wd*.2,1.3,-L*.06,false)]}
  if(c.kind==='van')add(Wd*1.01,.22,L*.6,mat.orange,0,.9,-L*.12,false);
  return g}
