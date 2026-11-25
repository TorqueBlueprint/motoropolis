//@ xmas/sleigh_snow.js - continues and closes the if(XMAS){ block
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
  // Santa's sleigh flies a loop over the city: modelled here in low poly (sleigh, Santa, presents, four reindeer)
  const sleigh=new T.Group();scene.add(sleigh);const XLEG=[];
  if(X&&X.xsl&&X.xrd){const A=new T.Group();sleigh.add(A);const sm=X.xsl.clone(true);A.add(sm);const sb=new T.Box3().setFromObject(sm),front=sb.max.z;const rb=new T.Box3().setFromObject(X.xrd),RS=.68,rlen=(rb.max.x-rb.min.x)*RS,GAP=.06,SP=.32;
   const RD=[];for(let k=0;k<4;k++){const g=X.xrd.clone(true);g.rotation.y=Math.PI/2;g.scale.setScalar(RS);const w=new T.Group();w.add(g);const row=Math.floor(k/2),side=k%2?1:-1;w.position.set(side*SP/2,.12,front+GAP+rlen/2+row*(rlen+GAP));w.userData.ph=k*1.37;w.userData.legs=[['legFL',1],['legBR',1],['legFR',-1],['legBL',-1]].map(([n,sg])=>[g.getObjectByName(n),sg]).filter(q=>q[0]);A.add(w);RD.push([w,g])}
   // lazy reindeer model: find the legs again once the real meshes are in
   (X.lazyHooks.xmas_reindeer=X.lazyHooks.xmas_reindeer||[]).push(c=>{for(const[w,g]of RD)if(g===c)w.userData.legs=[['legFL',1],['legBR',1],['legFR',-1],['legBL',-1]].map(([n,sg])=>[g.getObjectByName(n),sg]).filter(q=>q[0])});
   const rm=M(0x5a2e17),reins=[null,null],_c=new T.Vector3();
   XMS.reins=()=>{A.updateMatrixWorld(true);const col=RD.map(([w,g])=>A.worldToLocal(g.localToWorld(_c.set(-.2,.6,0)).clone()));for(const i of[0,1]){const sd=i?1:-1;const geo=new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(sd*.12,.42,.12),col[i],col[2+i]],false,'catmullrom',.1),24,.006,5,false);if(reins[i]){reins[i].geometry.dispose();reins[i].geometry=geo}else{reins[i]=new T.Mesh(geo,rm);A.add(reins[i])}}};
   XMS.RD=RD;XMS.reins();A.traverse(o=>{if(o.isMesh)o.castShadow=true});A.updateMatrixWorld(true);const ab=new T.Box3().setFromObject(A),asz=ab.getSize(new T.Vector3()),k=16/Math.max(asz.x,asz.z);A.scale.setScalar(k);A.position.set(-(ab.min.x+ab.max.x)/2*k,-ab.min.y*k,-(ab.min.z+ab.max.z)/2*k)}
  else{const red=M(0xc62828,{roughness:.55}),dred=M(0x8e1b1b),gold=M(0xd4a017,{metalness:.6,roughness:.35}),wood=M(0x5a3b22),white=M(0xf4f4f4),skin=M(0xf1c7a5),blk=M(0x1b1b1b),fur=M(0x8a5a35,{flatShading:true}),belly=M(0xe8d3b0,{flatShading:true}),horn=M(0xd9c3a0),sack=M(0x9b6b3d,{flatShading:true});
   const S=new T.Group();sleigh.add(S);
   // body: a side profile with a curled front, extruded across the width
   const sh=new T.Shape();sh.moveTo(-1.7,.45);sh.lineTo(-1.7,1.45);sh.quadraticCurveTo(-1.65,1.65,-1.4,1.6);sh.lineTo(-.9,1.25);sh.lineTo(.7,1.0);sh.quadraticCurveTo(1.35,1.0,1.55,1.45);sh.quadraticCurveTo(1.75,1.9,1.45,2.0);sh.quadraticCurveTo(1.2,2.0,1.3,1.75);
   sh.quadraticCurveTo(1.4,1.25,1.0,.75);sh.quadraticCurveTo(.8,.45,.4,.45);sh.lineTo(-1.7,.45);
   const bg=new T.ExtrudeGeometry(sh,{depth:1.5,bevelEnabled:true,bevelThickness:.06,bevelSize:.05,bevelSegments:1,curveSegments:8});bg.translate(0,0,-.75);bg.rotateY(-Math.PI/2);const body=new T.Mesh(bg,red);body.castShadow=true;S.add(body);
   S.add(box(1.62,.08,2.7,gold,0,1.0,-.35));S.add(box(1.3,.35,1.1,dred,0,.75,-1.05));S.add(box(1.3,.2,1.0,dred,0,.75,.15));
   // runners and struts
   for(const x of[-.65,.65]){const c=new T.CatmullRomCurve3([new T.Vector3(x,.12,-1.9),new T.Vector3(x,.05,-1.0),new T.Vector3(x,.05,.6),new T.Vector3(x,.15,1.5),new T.Vector3(x,.6,2.05),new T.Vector3(x,1.0,1.95),new T.Vector3(x,.95,1.65)]);const rn=new T.Mesh(new T.TubeGeometry(c,40,.06,6,false),gold);S.add(rn);
    for(const z of[-1.4,-.4,.5])S.add(box(.07,.42,.07,gold,x,.05,z))}
   // presents and the sack
   const sk=new T.Mesh(new T.IcosahedronGeometry(.62,1),sack);sk.scale.set(1.05,1.15,.95);sk.position.set(.1,1.75,-1.2);S.add(sk);const tie=new T.Mesh(new T.CylinderGeometry(.12,.2,.25,8),sack);tie.position.set(.1,2.45,-1.2);S.add(tie);
   [[-.45,1.0,-1.55,.45,0x2f6fd9],[.48,1.0,-1.6,.4,0x2e7d4f],[-.5,1.42,-1.45,.32,0xffd34d]].forEach(([x,y,z,s,c])=>{S.add(box(s,s,s,M(c),x,y,z));S.add(box(s*1.03,s*1.02,.07,gold,x,y,z));S.add(box(.07,s*1.02,s*1.03,gold,x,y,z))});
   // Santa
   const sa=new T.Group();sa.position.set(0,1.0,-.2);S.add(sa);
   const tor=new T.Mesh(new T.SphereGeometry(.55,12,10),red);tor.scale.set(1,1.1,.9);tor.position.y=.6;sa.add(tor);
   const belt=new T.Mesh(new T.CylinderGeometry(.56,.56,.14,14),blk);belt.position.y=.5;belt.scale.set(1,1,.9);sa.add(belt);sa.add(box(.2,.16,.06,gold,0,.42,.5));
   sa.add(box(.95,.3,.5,red,0,.1,.45));for(const x of[-.25,.25])sa.add(box(.26,.3,.3,blk,x,0,.8));
   const head=new T.Mesh(new T.SphereGeometry(.3,12,10),skin);head.position.y=1.35;sa.add(head);
   const beard=new T.Mesh(new T.SphereGeometry(.3,10,8),white);beard.scale.set(1,1.15,.7);beard.position.set(0,1.18,.15);sa.add(beard);
   const nose=new T.Mesh(new T.SphereGeometry(.07,8,6),M(0xe8968a));nose.position.set(0,1.36,.29);sa.add(nose);for(const x of[-.11,.11]){const e=new T.Mesh(new T.SphereGeometry(.035,6,5),blk);e.position.set(x,1.45,.26);sa.add(e)}
   const hat=new T.Mesh(new T.ConeGeometry(.3,.6,12),red);hat.position.set(0,1.82,-.05);hat.rotation.x=-.4;sa.add(hat);const brim=new T.Mesh(new T.TorusGeometry(.29,.07,6,14),white);brim.rotation.x=Math.PI/2;brim.position.y=1.58;sa.add(brim);
   const pom=new T.Mesh(new T.SphereGeometry(.09,8,6),white);pom.position.set(0,2.05,-.25);sa.add(pom);
   for(const x of[-1,1]){const arm=new T.Mesh(new T.CapsuleGeometry(.13,.5,4,8),red);arm.position.set(x*.5,.75,.35);arm.rotation.x=-1.1;arm.rotation.z=x*.25;sa.add(arm);const mit=new T.Mesh(new T.SphereGeometry(.12,8,6),blk);mit.position.set(x*.42,.62,.68);sa.add(mit)}
   // reindeer, two pairs in front
   const reins=[];
   for(let k=0;k<4;k++){const d=new T.Group(),px=k%2?.55:-.55,pz=3.0+Math.floor(k/2)*2.3;d.position.set(px,.9,pz);sleigh.add(d);
    const bd=new T.Mesh(new T.CapsuleGeometry(.32,.9,4,8),fur);bd.rotation.x=Math.PI/2;d.add(bd);const bl=new T.Mesh(new T.CapsuleGeometry(.24,.6,4,8),belly);bl.rotation.x=Math.PI/2;bl.position.y=-.12;d.add(bl);
    const nk=new T.Mesh(new T.CylinderGeometry(.14,.2,.6,8),fur);nk.position.set(0,.4,.6);nk.rotation.x=.6;d.add(nk);
    const hd=new T.Group();hd.position.set(0,.72,.82);d.add(hd);const sk2=new T.Mesh(new T.SphereGeometry(.22,10,8),fur);sk2.scale.set(.85,.9,1.1);hd.add(sk2);const mz=new T.Mesh(new T.SphereGeometry(.13,8,6),belly);mz.scale.set(1,.8,1.2);mz.position.set(0,-.06,.22);hd.add(mz);
    const ns=new T.Mesh(new T.SphereGeometry(k===2?.08:.05,8,6),k===2?new T.MeshBasicMaterial({color:0xff2a2a,toneMapped:false}):blk);ns.position.set(0,-.03,.36);hd.add(ns);
    for(const x of[-1,1]){const ear=new T.Mesh(new T.ConeGeometry(.06,.18,6),fur);ear.position.set(x*.18,.12,-.02);ear.rotation.z=x*-1.1;hd.add(ear);
     const a1=new T.Mesh(new T.CylinderGeometry(.025,.035,.42,5),horn);a1.position.set(x*.1,.33,-.05);a1.rotation.z=x*-.45;hd.add(a1);const a2=new T.Mesh(new T.CylinderGeometry(.02,.025,.22,5),horn);a2.position.set(x*.22,.47,.05);a2.rotation.set(.6,0,x*-.9);hd.add(a2);
     const a3=new T.Mesh(new T.CylinderGeometry(.02,.025,.2,5),horn);a3.position.set(x*.16,.42,-.12);a3.rotation.set(-.5,0,x*-.3);hd.add(a3);
     const e=new T.Mesh(new T.SphereGeometry(.03,6,5),blk);e.position.set(x*.1,.05,.17);hd.add(e)}
    const har=new T.Mesh(new T.TorusGeometry(.34,.05,6,14),red);har.position.set(0,0,.25);d.add(har);const bell=new T.Mesh(new T.SphereGeometry(.07,8,6),gold);bell.position.set(0,-.38,.3);d.add(bell);
    const tl=new T.Mesh(new T.ConeGeometry(.08,.2,6),white);tl.position.set(0,.18,-.75);tl.rotation.x=-2.2;d.add(tl);
    for(const[lx,lz,ph]of[[-.17,.4,0],[.17,.4,Math.PI],[-.17,-.4,Math.PI],[.17,-.4,0]]){const hip=new T.Group();hip.position.set(lx,-.1,lz);d.add(hip);const lg=new T.Mesh(new T.CylinderGeometry(.06,.05,.7,6),fur);lg.position.y=-.35;hip.add(lg);const hf=new T.Mesh(new T.CylinderGeometry(.06,.07,.1,6),M(0x2b1d14));hf.position.y=-.72;hip.add(hf);XLEG.push([hip,ph+k*.7])}
    d.traverse(o=>{if(o.isMesh)o.castShadow=true});d.userData.bob=k*.9;XLEG.push([d,null]);reins.push(new T.Vector3(px,.95,pz+.1))}
   // reins from Santa's hands to the front pair
   const rm=new T.LineBasicMaterial({color:0x8a1d1d});for(const x of[-1,1]){const pts=[new T.Vector3(x*.42,1.62,.48),reins[x<0?0:1].clone(),reins[x<0?2:3].clone()];sleigh.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),rm))}
   S.traverse(o=>{if(o.isMesh)o.castShadow=true});
   sleigh.scale.setScalar(1.7)}
  // ground snow: grass, park lawns and open fields turn white
  const snowC=new T.Color(0xeef3f8),done=new WeakSet(),hsl={};
  const _bb=new T.Box3();function snowify(){scene.traverse(ob=>{if(!ob.isMesh||ob.isInstancedMesh&&ob.instanceColor||ob.userData.xs)return;ob.userData.xs=1;const ms=Array.isArray(ob.material)?ob.material:[ob.material];for(const m of ms){if(!m||!m.color||done.has(m))continue;done.add(m);if(m.map)continue;m.color.getHSL(hsl);if(hsl.h>.17&&hsl.h<.45&&hsl.s>.22&&hsl.l>.18&&hsl.l<.7)m.color.lerp(snowC,.86)}})}
  // falling snow around whatever the camera looks at
  const NS=QUAL==='low'?1600:QUAL==='medium'?3200:5200,sp=new Float32Array(NS*3),sv=new Float32Array(NS);
  for(let k=0;k<NS;k++){sp[k*3]=Math.random()-.5;sp[k*3+1]=Math.random();sp[k*3+2]=Math.random()-.5;sv[k]=.6+Math.random()*.6}
  const sGeo=new T.BufferGeometry();sGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(NS*3),3));
  const fl=document.createElement('canvas');fl.width=fl.height=32;{const x=fl.getContext('2d'),g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,'rgba(255,255,255,.8)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32)}
  const sMat=new T.PointsMaterial({size:.35,map:new T.CanvasTexture(fl),transparent:true,depthWrite:false,opacity:.95,sizeAttenuation:true,toneMapped:false});
  const snow=new T.Points(sGeo,sMat);snow.frustumCulled=false;scene.add(snow);
  let st=0,boost=0,lastSubs=null,lastOpen=null,blinkT=0,blink=0,snowT=0,truckCar=null;
  // the light truck: one of the cars on the ring roads becomes a truck covered in lights
  function makeTruck(){if(X&&X.xtruck){const g=new T.Group(),m=X.xtruck.clone(true);{const b0=new T.Box3().setFromObject(m),s0=b0.getSize(new T.Vector3());m.rotation.y=s0.x>s0.z?-Math.PI/2:0}const w=new T.Group();w.add(m);w.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(w),sz=bb.getSize(new T.Vector3()),k=11/Math.max(sz.x,sz.z);w.scale.setScalar(k);w.position.set(-(bb.min.x+bb.max.x)/2*k,-bb.min.y*k,-(bb.min.z+bb.max.z)/2*k);w.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});g.add(w);g.userData.xmasTruck=true;return g}
   const g=new T.Group(),red=M(0xb3261e),wh=M(0xf4f4f4);g.add(box(2.3,2.3,5.4,red,0,.55,-.9));g.add(box(2.2,1.7,1.9,wh,0,.55,2.6));g.add(box(2,.6,.06,M(0x9fd3ff),0,1.65,3.56));
   for(const[x,z]of[[-1.05,2.4],[1.05,2.4],[-1.05,-1.9],[1.05,-1.9],[-1.05,-.4],[1.05,-.4]]){const w=new T.Mesh(new T.CylinderGeometry(.45,.45,.3,10),mat.dark);w.rotation.z=Math.PI/2;w.position.set(x,.45,z);g.add(w)}
   const lb=[],lc=[];let n=0;for(let z=-3.5;z<=1.7;z+=.42)for(const y of[.75,1.5,2.25,2.85]){for(const x of[-1.17,1.17]){lb.push([x,y,z,.9]);lc.push(PAL[n++%PAL.length])}}
   for(let x=-1.1;x<=1.1;x+=.42){lb.push([x,2.88,-3.6,.9]);lc.push(PAL[n++%PAL.length]);lb.push([x,2.88,1.75,.9]);lc.push(PAL[n++%PAL.length])}
   const im=bulbs(lb,lc,bulbA);scene.remove(im);g.add(im);g.scale.setScalar(.62);g.userData.xmasTruck=true;return g}
  XMS.sync=dt=>{st+=dt;const nv=nightLevel();
   // blinking garlands, brighter at night
   blinkT-=dt;if(blinkT<=0){blinkT=.7;blink^=1}const kDay=.62+.38*nv;bulbA.color.setScalar(kDay*1.25);bulbB.color.setScalar(kDay*1.25);XMS.gA.userData.nm=1;XMS.gB.userData.nm=1;XMS.gA.visible=!blink||nv<.3;XMS.gB.visible=!!blink||nv<.3;
   glow.color.setRGB(1,.77*(.7+.3*nv),.42*(.7+.3*nv));
   // tree size and lights follow the subscribers
   const sv0=subs||0;const sig=Math.floor(sv0/5)+'';if(sig!==tSig){tSig=sig;const g=.75+.55*clamp(sv0/1000,0,1);tree.scale.setScalar(g);if(!XT)treeBulbs(Math.round(clamp(30+sv0*.9,30,320)))}
   star.userData.nm=1;star.visible=sv0>=150;star.rotation.y+=dt*1.2;
   const ws=WALL.length+'|'+(WALL[WALL.length-1]||'');if(ws!==gSig){gSig=ws;buildGifts()}
   // more snow when someone subscribes, a blizzard when a milestone opens
   const op=ALL_MS.filter(m=>isOpen(m.type)).length;if(lastSubs!=null&&sv0>lastSubs)boost=Math.max(boost,10);if(lastOpen!=null&&op>lastOpen){boost=90;news('Snowstorm! Motoropolis celebrates a new milestone','city','A new building just opened and the whole city is covered in fresh snow.')}lastSubs=sv0;lastOpen=op;boost=Math.max(0,boost-dt);
   const span=clamp(cam.dist*1.1,60,420),hgt=clamp(cam.dist*.8,30,240),fall=clamp(cam.dist*.05,3,14);sMat.size=clamp(cam.dist*.006,.3,2.2);
   const show=Math.round(NS*(boost>0?1:.55)),p=sGeo.attributes.position.array;
   for(let k=0;k<show;k++){let y=sp[k*3+1]-dt*sv[k]*fall/hgt*(boost>0?1.6:1);if(y<0)y+=1;sp[k*3+1]=y;p[k*3]=cam.tx+sp[k*3]*span+Math.sin(st*.7+k)*.6;p[k*3+1]=y*hgt;p[k*3+2]=cam.tz+sp[k*3+2]*span}
   sGeo.setDrawRange(0,show);sGeo.attributes.position.needsUpdate=true;
   // sleigh loop
   if(!XMS.freeze){const RXs=75,RZs=50,w=st/40*Math.PI*2,x=92+Math.cos(w)*RXs,z=75+Math.sin(w)*RZs;sleigh.position.set(x,26+2*Math.sin(st*1.3),z);sleigh.rotation.y=Math.atan2(-Math.sin(w)*RXs,Math.cos(w)*RZs);sleigh.rotation.z=.08*Math.sin(st*1.3)}
   if(XMS.carousel)XMS.carousel.rotation.y+=dt*.35;
   if(QUAL!=='low'&&WORLD&&W3.xmasHouses&&XMS.w3sig!==W3.xmasSig){XMS.w3sig=W3.xmasSig;if(XMS.w3Lights){scene.remove(XMS.w3Lights);XMS.w3Lights.dispose()}const[a,b]=roofLightList(W3.xmasHouses);XMS.w3Lights=cityBulbs(a,b)}
   if(XMS.chim)for(const q of XMS.smoke){if(!q.s)continue;const u=(st*.25+q.ph)%1;q.s.position.set(XMS.chim.x+Math.sin(u*5+q.ph*9)*.3*u,XMS.chim.y+u*3.5,XMS.chim.z+u*.6);q.s.scale.setScalar(.6+u*1.4);q.s.material.opacity=.55*(1-u)}
   if(XMS.carolRoute){const R2=XMS.carolRoute;let per=0;const segs=[];for(let i=0;i<R2.length;i++){const a=R2[i],b=R2[(i+1)%R2.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push([a,b,l]);per+=l}
    for(const c of XMS.carolers){let d=((st*.55+c.off*1.1)%per+per)%per;for(const[a,b,l]of segs){if(d<=l){const u=d/l;c.p.position.set(a[0]+(b[0]-a[0])*u,Y+Math.abs(Math.sin(st*5+c.off))*.04,a[1]+(b[1]-a[1])*u);c.p.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);break}d-=l}}}
   if(XMS.kids.length>1){const A=XMS.kids.filter(k=>k.side===0),Bk=XMS.kids.filter(k=>k.side===1);XMS.balls.forEach((q,i)=>{const u=(st*.7+q.ph)%1,dir=Math.floor(st*.7+q.ph)%2,fa=(dir?Bk:A)[i%Math.max(1,(dir?Bk:A).length)],ta=(dir?A:Bk)[(i+1)%Math.max(1,(dir?A:Bk).length)];if(!fa||!ta)return;q.b.position.set(fa.x+(ta.x-fa.x)*u,Y+1+Math.sin(u*Math.PI)*1.6,fa.z+(ta.z-fa.z)*u)});for(const k of XMS.kids)k.p.position.y=Y+Math.max(0,Math.sin(st*4+k.k*1.7))*.15}
   if(XMS.lightDeer)XMS.lightDeer.forEach((h,i)=>{h.rotation.z=-.25+.25*Math.sin(st*1.2+i*2)});
   for(const q of XMS.skaters){const a=q.ph+st*q.sp*q.dir;q.p.position.set(q.cx+Math.cos(a)*q.rx,Y+.08,q.cz+Math.sin(a)*q.rz);q.p.rotation.y=Math.atan2(-Math.sin(a)*q.rx*q.dir,Math.cos(a)*q.rz*q.dir);q.p.rotation.z=.12*q.dir}
   if(XMS.RD){for(const[w]of XMS.RD){w.position.y=.12+.035*Math.sin(st*5+w.userData.ph);w.rotation.x=.08*Math.sin(st*5+w.userData.ph+1);for(const[o,sg]of w.userData.legs)o.rotation.z=sg*.5*Math.sin(st*7+w.userData.ph)}XMS.reins()}
   for(const[o,ph]of XLEG){if(ph==null){o.position.y=.9+.12*Math.sin(st*7+o.userData.bob)}else o.rotation.x=.75*Math.sin(st*7+ph)}
   // ground snow (new buildings get it too)
   snowT-=dt;if(snowT<=0){snowT=4;snowify()}
   // the light truck
   if(WORLD&&W3.cars&&W3.cars.length&&(!truckCar||!W3.cars.includes(truckCar))){truckCar=W3.cars.find(c=>!c.rig)||W3.cars[0];if(truckCar){truckCar.g.children.forEach(ch=>ch.visible=false);const tg=makeTruck();truckCar.g.add(tg);truckCar.v*=.45}}};
  XMS.labels=()=>{const sv0=subs||0;if(XMS.vendors&&cam.dist<160){const v=new T.Vector3();XMS.vendors.forEach((m,k)=>{m.getWorldPosition(v);const f=staffOf('park','Market Vendor',k);tag(v.x,v.y+(k%2?3.1:2.4),v.z,(f?f.toUpperCase():'JOB OPEN')+' · MARKET VENDOR',f?'rgba(10,20,30,.78)':'rgba(46,125,79,.85)',f?'#ffd34d':'#fff')})}if(XMS.santaG&&cam.dist<300){const p=XMS.santaG.position,q=toHud(p.x,Y+10.5,p.z);if(q)pill("🎅 STEP INSIDE SANTA'S WORKSHOP ▶",q.x,q.y,clamp(2400/cam.dist,12,20),'rgba(179,38,30,.94)','#ffffff')}if(XMS.gingerG&&cam.dist<200){const p=XMS.gingerG.position,q=toHud(p.x,Y+8,p.z);if(q)pill('🍪 GINGERBREAD HOUSE',q.x,q.y,clamp(2200/cam.dist,11,18),'rgba(122,69,32,.94)','#ffffff')}{const q=toHud(sleigh.position.x,sleigh.position.y+5,sleigh.position.z);if(q&&q.x>-60&&q.x<HUDW+60&&q.y>0&&q.y<HUDH)pill('🎅 SANTA',q.x,q.y,clamp(2600/cam.dist,12,20),'rgba(179,38,30,.92)','#ffffff')}const near=Math.hypot(cam.tx-L.cx,cam.tz-L.cz)<70&&cam.dist<130;
   const s=toHud(L.cx,Y+11*tree.scale.y,L.cz);if(s&&cam.dist<260)pill(sv0>=150?'🎄 MOTOROPOLIS CHRISTMAS TREE':'🎄 CHRISTMAS TREE · STAR AT 150 SUBS',s.x,s.y,clamp(2600/cam.dist,13,24),'rgba(179,38,30,.92)','#ffffff');
   if(near&&cam.dist<70){const sz=clamp(1500/cam.dist,10,16),G=XMS.giftPos,per=8,pg=Math.floor(performance.now()/2600)%Math.max(1,Math.ceil(G.length/per));for(const[n,x,z,sc]of G.slice(pg*per,pg*per+per)){const q=toHud(x,Y+sc*tree.scale.y+.5,z);if(q&&q.x>-40&&q.x<HUDW+40&&q.y>0&&q.y<HUDH)pill('🎁 '+n,q.x,q.y,sz,'rgba(16,19,24,.78)','#ffd34d')}}
   for(const g of [0]){const st0=XMS.stalls[g];if(!st0||cam.dist>110)continue;const wp=new T.Vector3();st0.parent.getWorldPosition(wp);const q=toHud(wp.x,Y+3.2,wp.z);if(q&&g===0)pill('CHRISTMAS MARKET',q.x,q.y,clamp(2000/cam.dist,11,18),'rgba(46,125,79,.92)','#ffffff')}};
  if(mat.grass2)mat.grass2.color.lerp(snowC,.86);snowify();if(location.hostname==='localhost')window.__XMS={park:[L.cx,L.cz],vend:()=>(XMS.vendors||[]).map(v=>{const w=v.getWorldPosition(new T.Vector3());return [w.x.toFixed(1),w.y.toFixed(2),w.z.toFixed(1),v.visible]}),sleigh:()=>[sleigh.position.x,sleigh.position.z,sleigh.position.y,sleigh.visible,sleigh.parent===scene],truck:()=>truckCar&&[truckCar.g.position.x,truckCar.g.position.z],night:v=>{lightMode=v?'noite':'auto'},carousel:()=>XMS.carousel&&[XMS.carousel.position.x,XMS.carousel.position.z],santa:()=>XMS.santaG&&[XMS.santaG.position.x,XMS.santaG.position.z],ginger:()=>XMS.gingerG&&[XMS.gingerG.position.x,XMS.gingerG.position.z],arch:()=>XMS.archAt,sleighAt:(x,y,z,r)=>{XMS.freeze=1;sleigh.position.set(x,y,z);sleigh.rotation.set(0,r||0,0)}};
 }
