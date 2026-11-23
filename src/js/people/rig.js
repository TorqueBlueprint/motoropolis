//@ people/rig.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // swap an interior person to the new job model (keeps the same object, so the building code that moves it keeps working)
 function upgP(m,job,i){if(!job||!(X&&X.ld&&X.SUc))return m;const f=job==='civ'?CIV_GLB[(i||0)%2]:JOB_GLB[job];if(!f)return m;jobScene(f).then(sc=>{const ng=personJob(sc);m.children.forEach(c=>c.visible=false);m.add(ng);const ph=m.userData.ph;Object.assign(m.userData,ng.userData);m.userData.ph=ph}).catch(e=>console.warn('upgP',job,e));return m}
 if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname))window.__WK={walk:(...a)=>walkPose(...a),job:(...a)=>personJob(...a),js:f=>jobScene(f)};
 function walkPose(g,t,on){const r=g.userData.rig;if(!r)return false;const mx=g.userData.mix;if(mx){if(!on){if(g.userData.won){for(const[b,q,p]of g.userData.rest){b.quaternion.copy(q);b.position.copy(p)}g.userData.won=false}return true}g.userData.won=true;mx.setTime((((t/(4*Math.PI))%1)+1)%1*g.userData.dur);return true}const A=(k,v)=>{const q=r[k];if(!q)return;WQ.setFromAxisAngle(q.ax,v);q.b.quaternion.copy(q.q0).multiply(WQ)};
  if(!on){for(const k in r)r[k].b.quaternion.copy(r[k].q0);return true}
  const f=Math.sin(t),c=Math.cos(t),kn=x=>x>0?x*x*(3-2*x):0;
  const S=g.userData.rigS||1;A('UpperLegL',-.42*f*S);A('UpperLegR',.42*f*S);A('LowerLegL',.12+.75*kn(c*S));A('LowerLegR',.12+.75*kn(-c*S));
  A('UpperArmL',.3*f*S);A('UpperArmR',-.3*f*S);A('LowerArmL',-.25);A('LowerArmR',-.25);const ln=.11;A('Spine',ln);A('Spine1',ln);A('Neck',-ln*.8);return true}
 function personMeshX(col,skin,hair){const fit0=OUTFIT[col]||'casual';if(X.man&&fit0!=='robe')return personGLB(col,skin,fit0);const g=new T.Group();const fit=fit0;
  const C={mech:['#1f2a44','#1f2a44'],hivis:['#c7e01f','#232c40'],police:['#151a26','#141821'],suit:['#22252b','#22252b'],robe:['#121214','#121214'],green:['#2e7d4f','#3b4a3a'],red:['#d93a2f','#2b2f38'],casual:[col,'#5d7fb0']}[fit];
  const top=XM(C[0]),pant=XM(C[1]),sk=XM(skin,{roughness:.6}),hr=XM(hair,{roughness:.55}),boot=XM(fit==='casual'?'#f4f4f0':'#1b1c1f',{roughness:.5});
  const legs=[];for(const dx of[-.1,.1]){const lg=new T.Group();lg.position.set(dx,.78,0);const l=new T.Mesh(XG.cap(.085,.5),pant);l.position.y=-.36;l.castShadow=true;lg.add(l);const b=new T.Mesh(BOX,boot);b.scale.set(.15,.12,.24);b.position.set(0,-.72,.04);lg.add(b);
   if(fit==='hivis'){const s=new T.Mesh(BOX,XM('#d8dde2',{metalness:.7,roughness:.2}));s.scale.set(.19,.04,.19);s.position.y=-.4;lg.add(s)}g.add(lg);legs.push(lg)}
  const tor=new T.Mesh(XG.cap(.17,.34),fit==='robe'?XM('#121214'):top);tor.scale.z=.72;tor.position.y=1.1;tor.castShadow=true;g.add(tor);
  if(fit==='robe'){const r=new T.Mesh(new T.CylinderGeometry(.2,.3,.7,10),XM('#121214'));r.position.y=.62;g.add(r)}
  const belt=new T.Mesh(BOX,XM('#18191c',{metalness:.4}));belt.scale.set(.36,.05,.26);belt.position.y=.84;g.add(belt);
  if(fit==='hivis'){for(const y of[1.02,1.2]){const s=new T.Mesh(BOX,XM('#d8dde2',{metalness:.7,roughness:.2}));s.scale.set(.37,.05,.27);s.position.y=y;g.add(s)}}
  if(fit==='mech'){const s=new T.Mesh(BOX,XM('#ff7a1a',{emissive:'#ff6a00',emissiveIntensity:.35}));s.scale.set(.03,.28,.03);s.position.set(.08,1.12,.13);g.add(s)}
  if(fit==='police'){const bd=new T.Mesh(BOX,XM('#e8c45a',{metalness:.9,roughness:.2}));bd.scale.set(.06,.07,.02);bd.position.set(-.09,1.22,.13);g.add(bd)}
  if(fit==='suit'){const t=new T.Mesh(BOX,XM('#c0392b'));t.scale.set(.04,.22,.02);t.position.set(0,1.16,.13);g.add(t);const sh=new T.Mesh(BOX,XM('#f4f4f0'));sh.scale.set(.1,.14,.02);sh.position.set(0,1.24,.125);g.add(sh)}
  for(const s of[-1,1]){const a=new T.Mesh(XG.cap(.06,.42),top);a.position.set(s*.25,1.07,0);a.rotation.z=s*.1;a.castShadow=true;g.add(a);const h=new T.Mesh(PG.head,fit==='mech'||fit==='police'?XM('#15161a'):sk);h.scale.setScalar(.27);h.position.set(s*.28,.76,0);g.add(h)}
  const hd=new T.Mesh(PG.head,sk);hd.scale.set(.66,.76,.68);hd.position.y=1.56;hd.castShadow=true;g.add(hd);
  for(const s of[-1,1]){const e=new T.Mesh(PG.head,XM('#1a1410'));e.scale.setScalar(.08);e.position.set(s*.05,1.58,.135);g.add(e)}
  const hc=new T.Mesh(PG.hair,hr);hc.scale.set(.68,.72,.7);hc.position.y=1.6;hc.rotation.x=-.2;g.add(hc);
  if(fit==='police'||fit==='hivis'||fit==='green'){const cm=XM(fit==='hivis'?'#1b2233':fit==='green'?'#3b4a3a':'#151a26');const c=new T.Mesh(PG.hair,cm);c.scale.set(.72,.62,.74);c.position.y=1.64;g.add(c);const br=new T.Mesh(BOX,cm);br.scale.set(.2,.02,.14);br.position.set(0,1.66,.16);g.add(br)}
  g.userData.legs=legs;return g}
 if(X){
  camera.near=2;camera.updateProjectionMatrix();renderer.toneMappingExposure=1.1;const pm2=new T.PMREMGenerator(renderer);scene.environment=pm2.fromScene(new X.RoomEnvironment(),.04).texture;scene.environmentIntensity=.25;
  mat.asphalt.roughness=.48;mat.asphalt.metalness=.12;mat.asphalt.color.setHex(0x2c2f36);
  mat.orange.emissive=new T.Color(0xff6a00);mat.orange.emissiveIntensity=.45;mat.yellow.emissive=new T.Color(0xffa000);mat.yellow.emissiveIntensity=.15;
  // skyline around the city
  if(!WORLD){const mk=()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const q=c.getContext('2d');q.fillStyle='#1d2433';q.fillRect(0,0,64,256);for(let yy=4;yy<256;yy+=10)for(let xx=4;xx<64;xx+=9)if(Math.random()<.45){q.fillStyle=Math.random()<.5?'#ffd59a':'#9fd0ff';q.fillRect(xx,yy,5,6)}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t};
   const texs=[mk(),mk(),mk()];const sk=new T.Group();for(let k=0;k<70;k++){const a=k/70*Math.PI*2+rnd()*.05,r=230+rnd()*60,w=8+rnd()*12,h=30+rnd()*80;const tx=texs[k%3];
    const m=new T.Mesh(new T.BoxGeometry(w,h,w),new T.MeshStandardMaterial({color:0x2a3346,map:tx,emissive:0xffffff,emissiveMap:tx,emissiveIntensity:.25,roughness:.4,metalness:.4}));m.position.set(CX+Math.cos(a)*r,h/2,CZ+Math.sin(a)*r*.8);sk.add(m);signMats.push(m.material)}scene.add(sk)}
 }
