//@ world/world3d.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- WORLD (test page only): river with arch bridges, ring road, districts that grow with subscribers ----------
 const W3={labels:[],anim:[],cars:[],tmats:[],bridges:[]};
 if(WORLD){
  const root=new T.Group();scene.add(root);
  // Phase 1B: the organic layout is in metres (src/data/world/city_layout.json via CITY); the old design-coordinate warp is the identity now
  const WX=x=>x,WZ=z=>z;W3.WX=WX;W3.WZ=WZ;const F=CITY.F,gh=CITY.h;
  const _v=new T.Vector3(),_m=new T.Matrix4(),_q=new T.Quaternion(),_s=new T.Vector3();
  const unit=(par,ax,az)=>{const u=new T.Group();u.userData.anchor=[ax,az];par.add(u);return u};
  function warp(o){if(o.userData.warped)return;o.userData.warped=1;if(o.userData.anchor){const[ax,az]=o.userData.anchor;o.position.x+=WX(ax)-ax;o.position.z+=WZ(az)-az;return}if(o.userData.wc){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,WX(p.getX(i)),p.getY(i),WZ(p.getZ(i)));p.needsUpdate=true;o.geometry.computeBoundingSphere();o.geometry.computeBoundingBox();return}
   if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,_m);_m.decompose(_v,_q,_s);_v.x=WX(_v.x);_v.z=WZ(_v.z);_m.compose(_v,_q,_s);o.setMatrixAt(i,_m)}o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere();return}
   if(o.isGroup&&o.position.x===0&&o.position.z===0){for(const c of o.children.slice())warp(c);return}o.position.x=WX(o.position.x);o.position.z=WZ(o.position.z)}
  const SH=new Set([BOX]);const sh=g=>{SH.add(g);return g};
  const mt={water:M(0x3f8fd2,{roughness:.5,metalness:0,envMapIntensity:.25}),sand:M(0xd8cb9f),stone:M(0xbab3a5),white:M(0xf4f4f0),offw:M(0xe9e4d8),glassB:M(0x79b4e0,{roughness:.08,metalness:.55}),
   red:M(0xd23b2c,{roughness:.5}),brick:M(0xa9483a),green:M(0x3f8f45),pitch:M(0x4f9a3f),track:M(0x3a3d44,{roughness:.9}),rail:M(0x8b8f96,{metalness:.7,roughness:.35}),sleeper:M(0x5a4634),
   arch:M(0xc8432b,{roughness:.45,metalness:.3}),archW:M(0xeef1f4,{roughness:.4,metalness:.3}),hill:M(0x6e9b4a,{flatShading:true}),rock:M(0x8e8a80,{flatShading:true}),
   tank:M(0xe6e8ea,{roughness:.4,metalness:.4}),corr:M(0xb9c0c8,{roughness:.6,metalness:.3}),corr2:M(0xd8c7a6,{roughness:.7}),dirtF:M(0x9c7b52),smoke:new T.MeshStandardMaterial({color:0xcfd3d8,transparent:true,opacity:.55,roughness:1,depthWrite:false}),
   flame:new T.MeshBasicMaterial({color:0xff8a1a,transparent:true,opacity:.9}),flame2:new T.MeshBasicMaterial({color:0xffe066,transparent:true,opacity:.95}),spray:new T.MeshBasicMaterial({color:0xbfe6ff,transparent:true,opacity:.55,depthWrite:false}),
   roofT:M(0xffffff,{side:T.DoubleSide,roughness:.7}),bodyT:M(0xffffff,{roughness:.8}),led:M(0x111111,{emissive:0x39c6ff,emissiveIntensity:1.4}),gold:M(0xe8c45a,{metalness:.8,roughness:.25})};
  // water: animated ripples
  {const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#3d8bd0';x.fillRect(0,0,256,256);for(let k=0;k<500;k++){x.fillStyle=Math.random()<.5?'rgba(255,255,255,.07)':'rgba(10,50,110,.07)';x.fillRect(Math.random()*256,Math.random()*256,4+Math.random()*8,1)}
   const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;mt.water.map=t;mt.water.color.setHex(0xffffff);W3.waterTex=t}
  // facade textures: one tile = 2 window bays x 1 floor, with frames, sills, slab bands and lit windows at night
  const winTex=(base,win,lit,style)=>{const S=128,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');const e=document.createElement('canvas');e.width=e.height=S;const y=e.getContext('2d');y.fillStyle='#000';y.fillRect(0,0,S,S);
   const sh=(hex,k)=>{const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=Math.max(0,Math.min(255,r+k));g=Math.max(0,Math.min(255,g+k));b=Math.max(0,Math.min(255,b+k));return`rgb(${r},${g},${b})`};
   const glass=(gx,gy,gw,gh)=>{const gr=x.createLinearGradient(0,gy,0,gy+gh);gr.addColorStop(0,sh(win,70));gr.addColorStop(.45,win);gr.addColorStop(1,sh(win,-25));x.fillStyle=gr;x.fillRect(gx,gy,gw,gh);x.fillStyle='rgba(255,255,255,.22)';x.beginPath();x.moveTo(gx,gy+gh*.65);x.lineTo(gx+gw*.55,gy);x.lineTo(gx+gw*.75,gy);x.lineTo(gx,gy+gh*.95);x.fill()};
   const litW=(gx,gy,gw,gh)=>{if(Math.random()<lit){y.fillStyle=Math.random()<.65?'#ffd38a':'#cfe6ff';y.fillRect(gx,gy,gw,gh);y.fillStyle='rgba(0,0,0,.35)';y.fillRect(gx+gw*.6,gy,gw*.4,gh)}};
   if(style==='glass'){glass(0,0,S,S);x.fillStyle=sh(base,-10);for(let q=0;q<=S;q+=32)x.fillRect(q-2,0,4,S);x.fillStyle=sh(base,-30);x.fillRect(0,S-14,S,14);x.fillStyle=sh(base,25);x.fillRect(0,S-14,S,3);for(let q=0;q<S;q+=32)litW(q+2,4,28,S-20)}
   else{x.fillStyle=base;x.fillRect(0,0,S,S);for(let k=0;k<700;k++){x.fillStyle=Math.random()<.5?'rgba(0,0,0,.035)':'rgba(255,255,255,.05)';x.fillRect(Math.random()*S,Math.random()*S,2,2)}
    x.fillStyle=sh(base,-28);x.fillRect(0,S-8,S,8);x.fillStyle=sh(base,18);x.fillRect(0,S-8,S,2);
    for(const q of[14,74]){const ww=40,wh=style==='res'?62:72,wy=style==='res'?26:18;x.fillStyle=sh(base,-45);x.fillRect(q-3,wy-3,ww+6,wh+6);x.fillStyle='#f4f4f0';x.fillRect(q-2,wy-2,ww+4,wh+4);glass(q,wy,ww,wh);x.fillStyle='#f4f4f0';x.fillRect(q+ww/2-1.5,wy,3,wh);x.fillRect(q,wy+wh*.42,ww,3);
     x.fillStyle=sh(base,-55);x.fillRect(q-5,wy+wh+2,ww+10,5);if(style==='res'){x.fillStyle='rgba(40,44,52,.85)';x.fillRect(q-6,wy+wh-16,ww+12,2);for(let k=q-6;k<=q+ww+6;k+=6)x.fillRect(k,wy+wh-16,1.5,18);x.fillRect(q-6,wy+wh+1,ww+12,2)}litW(q,wy,ww,wh)}}
   const a=new T.CanvasTexture(c),b=new T.CanvasTexture(e);for(const t of[a,b]){t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8}a.colorSpace=T.SRGBColorSpace;b.colorSpace=T.SRGBColorSpace;return[a,b]};
  const tMat=(base,win,o,style)=>{const[a,b]=winTex(base,win,.45,style);const m=new T.MeshStandardMaterial(Object.assign({map:a,emissiveMap:b,emissive:0xffffff,emissiveIntensity:0,roughness:.45,metalness:.15},o||{}));W3.tmats.push(m);return m};
  const TM=[tMat('#5d7590','#6f9fc9',{metalness:.55,roughness:.18},'glass'),tMat('#d9d2c2','#3a5a78',{},'office'),tMat('#8f9aa6','#4a6f92',{metalness:.35,roughness:.3},'office'),tMat('#c9b49a','#41607e',{},'office'),tMat('#3e5268','#5a8fbf',{metalness:.6,roughness:.12},'glass')];
  const AM=[tMat('#efe6d6','#4a6a8c',{},'res'),tMat('#e3d3bf','#456686',{},'res'),tMat('#d8dde3','#3f5f80',{},'res'),tMat('#f0dcc8','#4f6f90',{},'res')];
  // house walls: windows with white frames, shutters and a front door
  const houseM=(()=>{const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,256,128);for(let k=0;k<900;k++){x.fillStyle='rgba(0,0,0,.04)';x.fillRect(Math.random()*256,Math.random()*128,2,2)}
   x.fillStyle='#c9c4ba';x.fillRect(0,112,256,16);const e=document.createElement('canvas');e.width=256;e.height=128;const y=e.getContext('2d');y.fillStyle='#000';y.fillRect(0,0,256,128);
   const win=(wx,wy,ww,wh)=>{x.fillStyle='#6b4a2b';x.fillRect(wx-10,wy,8,wh);x.fillRect(wx+ww+2,wy,8,wh);x.fillStyle='#f6f6f2';x.fillRect(wx-3,wy-3,ww+6,wh+6);const gr=x.createLinearGradient(0,wy,0,wy+wh);gr.addColorStop(0,'#bfe0f5');gr.addColorStop(1,'#4d7ea6');x.fillStyle=gr;x.fillRect(wx,wy,ww,wh);x.fillStyle='#f6f6f2';x.fillRect(wx+ww/2-1.5,wy,3,wh);x.fillRect(wx,wy+wh/2-1.5,ww,3);x.fillStyle='#b9b4aa';x.fillRect(wx-5,wy+wh+2,ww+10,4);if(Math.random()<.6){y.fillStyle='#ffd38a';y.fillRect(wx,wy,ww,wh)}};
   win(34,34,40,46);win(182,34,40,46);x.fillStyle='#f6f6f2';x.fillRect(107,38,42,76);x.fillStyle='#7a3f2a';x.fillRect(111,42,34,72);x.fillStyle='#e8c45a';x.fillRect(138,78,4,4);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(116,48,24,20);x.fillStyle='#8a8f96';x.fillRect(100,112,56,8);
   const a=new T.CanvasTexture(c),b=new T.CanvasTexture(e);a.colorSpace=b.colorSpace=T.SRGBColorSpace;a.anisotropy=8;const m=new T.MeshStandardMaterial({map:a,emissiveMap:b,emissive:0xffffff,emissiveIntensity:0,roughness:.8});W3.tmats.push(m);return m})();
  function boxUV(w,h,d,ru,rv){const g=new T.BoxGeometry(w,h,d);g.translate(0,h/2,0);const uv=g.attributes.uv;for(let f=0;f<6;f++)for(let k=0;k<4;k++){const i=f*4+k;const su=f<2?d/ru:w/ru,sv=f===2||f===3?d/ru:h/rv;uv.setXY(i,uv.getX(i)*su,uv.getY(i)*sv)}return g}
  const rimM=M(0xc9c4ba,{roughness:.7}),acM=M(0xb9c0c8,{metalness:.5,roughness:.4}),podM=M(0x2b3440,{metalness:.5,roughness:.2});
  function bld(g,w,h,d,side,roof,x,z,ry){const m=new T.Mesh(boxUV(w,h,d,4.6,3.4),[side,side,roof,roof,side,side]);m.position.set(x,0,z);m.rotation.y=ry||0;m.castShadow=true;m.receiveShadow=true;g.add(m);
   if(w>4&&d>4){const t=.35,ph=.7;for(const q of[-1,1]){m.add(box(w,ph,t,rimM,0,h,q*(d/2-t/2),false));m.add(box(t,ph,d-2*t,rimM,q*(w/2-t/2),h,0,false))}
    const n=Math.min(3,Math.floor(w*d/50)+1);for(let k=0;k<n;k++){const ax=(k-(n-1)/2)*Math.min(3.2,w/(n+1)),az=((k%2)?1:-1)*d*.18;m.add(box(1.5,.9,1.1,acM,ax,h,az));}
    if(h>14&&w*d>90){const wt=new T.Mesh(W3.wtG||(W3.wtG=new T.CylinderGeometry(.9,.9,1.6,10)),acM);wt.position.set(w*.28,h+1.6,-d*.25);m.add(wt);m.add(box(.12,1,.12,acM,w*.28-.6,h,-d*.25,false));m.add(box(.12,1,.12,acM,w*.28+.6,h,-d*.25,false))}
    if(side.map&&h>12){m.add(box(w+.3,3.2,d+.3,podM,0,0,0,false))}}
   return m}
  const B0=(g,w,h,d,m,x,y,z,cast)=>{const b=box(w,h,d,m,x,y,z,cast);g.add(b);return b};
  function instG(g,geo,m,list,colors,cast){if(!list.length)return null;const im=new T.InstancedMesh(geo,m,list.length);const o=new T.Object3D(),col=new T.Color();
   list.forEach((p,k)=>{o.position.set(p.x,p.y||0,p.z);o.rotation.set(0,p.ry||0,0);o.scale.set(p.sx||1,p.sy||1,p.sz||1);o.updateMatrix();im.setMatrixAt(k,o.matrix);if(colors)im.setColorAt(k,col.set(colors[k]))});
   im.castShadow=cast!==false;im.receiveShadow=true;g.add(im);return im}
  const smooth=(P,n,closed)=>{const c=new T.CatmullRomCurve3(P.map(p=>new T.Vector3(p[0],0,p[1])),!!closed,'catmullrom',.5);const r=c.getSpacedPoints(n).map(v=>[v.x,v.z]);if(closed)r.pop();return r};
  function rrPath(x0,z0,x1,z1,r,seg){const P=[];for(const[cx,cz,a0]of[[x1-r,z0+r,-Math.PI/2],[x1-r,z1-r,0],[x0+r,z1-r,Math.PI/2],[x0+r,z0+r,Math.PI]])for(let k=0;k<=seg;k++){const a=a0+k/seg*Math.PI/2;P.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r])}return P}
  function ribbon(P,w,y,m,closed,g){const n=P.length,pos=[],nor=[],uv=[],idx=[];
   for(let i=0;i<n;i++){const p=P[i],a=P[closed?(i-1+n)%n:Math.max(0,i-1)],b=P[closed?(i+1)%n:Math.min(n-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const ww=(typeof w==='function'?w(p,i):w)/2,yy=typeof y==='function'?y(p):y;
    pos.push(p[0]-dz*ww,yy,p[1]+dx*ww,p[0]+dz*ww,yy,p[1]-dx*ww);nor.push(0,1,0,0,1,0);uv.push((p[0]-dz*ww)*.03,(p[1]+dx*ww)*.03,(p[0]+dz*ww)*.03,(p[1]-dx*ww)*.03)}
   const segs=closed?n:n-1;for(let i=0;i<segs;i++){const a=i*2,b=((i+1)%n)*2;idx.push(a,b,a+1,b,b+1,a+1)}
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(nor,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);
   const me=new T.Mesh(geo,m);me.receiveShadow=true;me.userData.wc=1;(g||root).add(me);return me}
  function along(P,step,off,cb,closed){const n=P.length,segs=closed?n:n-1;let carry=0;for(let i=0;i<segs;i++){const a=P[i],b=P[(i+1)%n];const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(!l)continue;const ux=dx/l,uz=dz/l;let s=carry;while(s<l){cb(a[0]+ux*s-uz*off,a[1]+uz*s+ux*off,Math.atan2(dx,dz));s+=step}carry=s-l}}
  function mkPath(P,closed){const L=[0],n=P.length,segs=closed?n:n-1;for(let i=0;i<segs;i++){const a=P[i],b=P[(i+1)%n];L.push(L[L.length-1]+Math.hypot(b[0]-a[0],b[1]-a[1]))}return{P,L,len:L[L.length-1],closed}}
  function atPath(p,s,off,o){s=((s%p.len)+p.len)%p.len;let lo=0,hi=p.L.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(p.L[m]<=s)lo=m;else hi=m}const a=p.P[lo],b=p.P[(lo+1)%p.P.length],l=(p.L[lo+1]-p.L[lo])||1,t=(s-p.L[lo])/l,dx=(b[0]-a[0])/l,dz=(b[1]-a[1])/l;
   o.x=a[0]+(b[0]-a[0])*t-dz*off;o.z=a[1]+(b[1]-a[1])*t+dx*off;o.ry=Math.atan2(dx,dz);return o}
  const segD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)};
  // ---- river (city_layout.json water.river) ----
  const riverZ=CITY.riverZ,riverW=CITY.riverW;
  const RP=[];for(let x=CITY.L.water.river[0][0];x<=1500;x+=6)RP.push([x,riverZ(x)]);
  ribbon(RP,p=>riverW(p[0])+12,.045,mt.sand);ribbon(RP,p=>riverW(p[0]),.16,mt.water);
   // nicer water (photo texture, glossier) and a fisherman in a little aluminium boat on the river
   if(X&&X.ld){new T.TextureLoader().load(ASSET_BASE+'assets/world/water.jpg',tx=>{tx.colorSpace=T.SRGBColorSpace;tx.wrapS=tx.wrapT=T.MirroredRepeatWrapping;tx.repeat.copy(W3.waterTex.repeat);tx.repeat.multiplyScalar(1.5);mt.water.map=tx;W3.waterTex=tx;mt.water.roughness=.18;mt.water.metalness=.08;mt.water.needsUpdate=true});
    const fx=F.fisher[0],fz=riverZ(fx)+riverW(fx)*.18,ang=Math.atan2(riverZ(fx+4)-riverZ(fx-4),8);
    X.ready1.then(()=>Promise.all([X.ld.loadAsync(ASSET_BASE+'assets/world/boat.glb'),X.ld.loadAsync(ASSET_BASE+'assets/world/fisherman.glb')])).then(([bg,fg])=>{
     const g=new T.Group(),hull=bg.scene;let bb=new T.Box3().setFromObject(hull);const sz=bb.getSize(new T.Vector3());const k=4.2/Math.max(sz.x,sz.z);hull.scale.setScalar(k);bb=new T.Box3().setFromObject(hull);hull.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y-.12,-(bb.min.z+bb.max.z)/2);g.add(hull);
     const fm=fg.scene;const mx=fg.animations.length?new T.AnimationMixer(fm):null;if(mx){mx.clipAction(fg.animations[0]).play();mx.update(.01)}fm.updateMatrixWorld(true);let fb=new T.Box3().setFromObject(fm,true);const fk=1.7/(fb.max.y-fb.min.y);fm.scale.setScalar(fk);fm.updateMatrixWorld(true);fb=new T.Box3().setFromObject(fm,true);fm.position.set(0,-fb.min.y+.05,0);g.add(fm);g.updateMatrixWorld(true);{let hip=null;fm.traverse(o=>{if(!hip&&o.isBone&&/hips?$/i.test(o.name))hip=o});if(hip){const hv=hip.getWorldPosition(new T.Vector3());fm.position.x-=hv.x;fm.position.z-=hv.z}}
     g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false}});
     g.position.set(W3.WX(fx),.16,W3.WZ(fz));g.rotation.y=-ang+Math.PI/2;scene.add(g);
     W3.fish={g,mx,y0:.16,r0:g.rotation.y};if(location.hostname==='localhost')window.__FISH=W3.fish}).catch(e=>console.warn('boat',e))}
  const isFree=(x,z,m)=>CITY.free(x,z,m);
  // ---- bridges (SimCity-style steel arches over the river) ----
  const brs=[];
  function bridge(x,w,col){const zc=riverZ(x),span=riverW(x)+12,Lr=14,H=2.6,half=span/2+Lr,ang=Math.atan2(H,Lr),hyp=Math.hypot(Lr,H);const g=new T.Group();g.userData.anchor=[x,zc];root.add(g);
   const ex=w/2+1.15,DW=2*ex+.5,lineM=mat.dash,swM=mat.pad,railM=mt.white;
   // deck: stone girder, asphalt, raised sidewalks, painted lines
   B0(g,DW,.8,span,mt.stone,x,H-.8,zc);B0(g,w,.08,span,mat.asphalt,x,H,zc,false);
   for(const q of[-1,1]){B0(g,1.1,.28,span,swM,x+q*(w/2+.55),H,zc,false);B0(g,.12,.02,span,lineM,x+q*(w/2-.35),H+.08,zc,false);B0(g,.14,1,span,railM,x+q*ex,H+.28,zc,false);for(let z=zc-span/2+1;z<=zc+span/2-1;z+=2.2)B0(g,.12,1,.12,railM,x+q*ex,H+.28,z,false)}
   for(let z=zc-span/2+1.5;z<zc+span/2-1;z+=3.6)B0(g,.16,.02,1.8,lineM,x,H+.08,z,false);
   // approach ramps: solid stone embankment + asphalt + sidewalks, rails and lines following the slope
   const ramp=(gm,mt2,wd,ht,ox,yo,s,t0,len)=>{const m=new T.Mesh(gm||BOX,mt2);const tc=t0+len/2;m.scale.set(wd,ht,len*hyp);m.position.set(x+ox,H*(1-tc)+yo,zc+s*(span/2+Lr*tc));m.rotation.x=s*ang;m.receiveShadow=true;m.castShadow=ht>.5;g.add(m);return m};
   for(const s of[-1,1]){
    const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(Lr,0);sh.lineTo(0,H);sh.lineTo(0,0);const wg=new T.ExtrudeGeometry(sh,{depth:DW,bevelEnabled:false});wg.translate(0,0,-DW/2);wg.rotateY(s>0?-Math.PI/2:Math.PI/2);
    const wm=new T.Mesh(wg,mt.stone);wm.position.set(x,-.02,zc+s*span/2);wm.receiveShadow=true;wm.castShadow=true;g.add(wm);
    ramp(null,mat.asphalt,w,.3,0,-.12,s,0,1);
    for(const q of[-1,1]){ramp(null,swM,1.1,.3,q*(w/2+.55),.02,s,0,1);ramp(null,railM,.14,.9,q*ex,.55,s,0,.92);ramp(null,lineM,.12,.04,q*(w/2-.35),.04,s,0,1)}
    for(let t=.06;t<.96;t+=.13)ramp(null,lineM,.16,.04,0,.04,s,t,.06);
    B0(g,DW+.4,1.6,.8,mt.stone,x,0,zc+s*(span/2-.4))}
   // piers in the river
   for(const s of[-1,1]){B0(g,DW-.6,H-.8,2.2,mt.stone,x,-.2,zc+s*span*.22);B0(g,DW+.2,.4,2.8,mt.stone,x,H-1.2,zc+s*span*.22)}
   // steel arches with hangers
   const peak=Math.min(14,span*.32);
   for(const q of[-1,1]){const xx=x+q*ex;const cv=new T.QuadraticBezierCurve3(new T.Vector3(xx,H+.2,zc-span/2+1.5),new T.Vector3(xx,H+peak*2,zc),new T.Vector3(xx,H+.2,zc+span/2-1.5));
    const tb=new T.Mesh(new T.TubeGeometry(cv,40,.45,8,false),col);tb.castShadow=true;tb.userData.wc=1;g.add(tb);
    for(let t=.1;t<.91;t+=.1){const p=cv.getPoint(t);const hh=p.y-H;if(hh<.5)continue;const hg=new T.Mesh(new T.CylinderGeometry(.07,.07,hh,5),mt.white);hg.position.set(xx,H+hh/2,p.z);g.add(hg)}
    for(const s of[-1,1])B0(g,1.4,.9,1.4,col,xx,H-.1,zc+s*(span/2-1.5))}
   for(const t of[.35,.5,.65]){const p=new T.QuadraticBezierCurve3(new T.Vector3(0,H,zc-span/2+1.5),new T.Vector3(0,H+peak*2,zc),new T.Vector3(0,H,zc+span/2-1.5)).getPoint(t);B0(g,2*ex+.9,.3,.3,col,x,p.y-.15,p.z,false)}
   for(const s of[-1,1])for(const q of[-1,1]){const lp=new T.Mesh(new T.CylinderGeometry(.08,.08,2.4,6),mat.dark);lp.position.set(x+q*ex,H+1.5,zc+s*span*.4);g.add(lp);const lb=new T.Mesh(new T.SphereGeometry(.22,8,6),mat.lamp);lb.position.set(lp.position.x,H+2.75,lp.position.z);g.add(lb)}
   batchBoxes(g);
   const b={x,w,zc,span,Lr,H,half,g};brs.push(b);return b}
  const deckY=CITY.deck;
  for(const b of CITY.bridges)bridge(b.x,b.w,b.x>300?mt.archW:mt.arch);
  const vline=(x,z0,z1)=>{const P=[];const st=z1>z0?4:-4;for(let z=z0;st>0?z<=z1:z>=z1;z+=st)P.push([x,z]);return P};
  const hline=(z,x0,x1)=>{const P=[];const st=x1>x0?4:-4;for(let x=x0;st>0?x<=x1:x>=x1;x+=st)P.push([x,z]);return P};
  // the drivable roads are built in roads/ground3d.js from the city graph; road() here is for unlock-only roads (highway)
  function road(P,w,y,g,dash,closed){ribbon(P,w,y||.012,mat.asphalt,closed,g);if(dash){const L=[];along(P,4,0,(x,z,a)=>{L.push({x,y:(y||.012)+.023,z,ry:a,sx:.18,sz:1.6})},closed);instG(g||root,sh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2)),mat.dash,L,null,false)}}
  const HWY=smooth(CITY.hwy,260);
  // ---- farm fields ----
  {const FC=[mt.field1=M(0xcdb85e),mt.field2=M(0x92b65c),mt.dirtF,M(0xa9c46a),M(0xd9c27a)];let k=0;
   const field=(x0,z0,x1,z1)=>{const w=x1-x0,d=z1-z0;const n=Math.max(2,Math.round(w/40));for(let i=0;i<n;i++){const m=FC[(k++)%FC.length];const p=new T.Mesh(new T.PlaneGeometry(w/n-2,d-2),m);p.rotation.x=-Math.PI/2;p.position.set(x0+(i+.5)*w/n,.008+gh(x0+(i+.5)*w/n,(z0+z1)/2),(z0+z1)/2);p.receiveShadow=true;root.add(p)}};
   for(const f of CITY.fields)field(...f)}
  // ---- forests between the districts, a few lone trees on the open land ----
  {const tr=[],cr=[],cc=[],cn=[],cnc=[];let tries=0;const nz=(x,z)=>Math.sin(x*.021)*Math.cos(z*.017)+Math.sin((x+z)*.011)*.6+Math.cos(x*.007-z*.013)*.5;const BX=CITY.bounds;
   while(tr.length+cn.length<4200&&tries<90000){tries++;const x=BX.x0+rnd()*(BX.x1-BX.x0),z=BX.z0+rnd()*(BX.z1-BX.z0);const fk=CITY.forestK(x,z),n=nz(x,z);
    if(fk>0){if(rnd()>fk*.9+.05)continue}else if(n<.6||rnd()>.06)continue;if(!isFree(x,z,1.5))continue;const y0=.2+gh(x,z);
    const s=.8+rnd()*.7;if(rnd()<(fk>0?.4:.25)){cn.push({x,y:y0,z,sx:s,sy:s*(1+rnd()*.4),sz:s});cnc.push(['#2f6a35','#3a7a3c','#2a5e33'][Math.floor(rnd()*3)])}else{tr.push({x,y:y0,z,sx:s,sy:s,sz:s});cr.push({x,y:y0+2.4*s,z,sx:s*1.25,sy:s*1.1,sz:s*1.25,ry:rnd()*3});cc.push(['#4f8a3c','#3f7a34','#5c9445','#6a9c45','#467f38'][Math.floor(rnd()*5)])}}
   instG(root,sh(new T.CylinderGeometry(.16,.24,1.6,5).translate(0,.8,0)),mat.trunk,tr.concat(cn.map(p=>({x:p.x,y:p.y,z:p.z,sx:p.sx,sy:p.sy*.5,sz:p.sx}))));
   instG(root,sh(new T.IcosahedronGeometry(1.4,0)),M(0xffffff,{flatShading:true,roughness:.9}),cr,cc);instG(root,sh(new T.ConeGeometry(1.5,4.4,7).translate(0,3,0)),M(0xffffff,{flatShading:true,roughness:.9}),cn,cnc)}
  // marina: pontoons and sailing boats on the north shore of the bay
  {const[mx,mz]=F.marina,g=root;let zb=mz;while(CITY.inSea(mx,zb-2)&&zb>mz-80)zb-=2;for(let k=0;k<4;k++){const x=mx-33+k*22;B0(g,2.2,.4,16,mat.wood,x,.2,zb+8,false);for(const s of[-1,1])for(let q=0;q<2;q++){const bx=x+s*3.4,bz=zb+6+q*6;B0(g,1.8,.7,4.6,mt.white,bx,.1,bz);const mast=new T.Mesh(new T.CylinderGeometry(.06,.06,5,5),mt.white);mast.position.set(bx,3,bz);g.add(mast)}}
   B0(g,92,.4,4,mat.wood,mx,.2,zb+1,false);B0(g,9,3.4,7,mt.offw,mx+52,0,zb-4);g.add(sign('MARINA',8,1.6,'#0f2f5c','#ffffff',mx+52,4.6,zb-.4,0))}
  // the far tunnel hill gets a few pines (the hill itself is terrain, roads/ground3d.js)
  {const q=CITY.L.hills[1];for(let k=0;k<18;k++){const a=rnd()*6.28,r=10+rnd()*q.rx*.7;const x=q.x+Math.cos(a)*r,z=q.z+Math.sin(a)*r*.75;if(Math.abs(z-q.z)<16&&x<q.x)continue;const t=new T.Mesh(new T.ConeGeometry(2,6,6),mt.green);t.position.set(x,gh(x,z)+2.6,z);root.add(t)}}
  // ambient traffic (highway, Grand Prix) uses these
  const carBody=sh(new T.BoxGeometry(2.1,.95,4.4).translate(0,.75,0)),carCab=sh(new T.BoxGeometry(1.86,.72,2.3).translate(0,1.55,-.2)),CCOL=['#d93a2f','#2f6fd9','#f4f4f0','#22252b','#e8b931','#2e8b57','#8a95a3','#ff7a1a','#6b3fa0','#b5272d'];
  const AMBK=X&&X.cars?MODELS.filter(m=>m.glb&&X.cars[m.glb]):[],AMBB=X&&X.cars?['van','garbage','tow'].filter(k=>X.cars[k]):[];
  function mkCar(col,g,big){if(AMBK.length){let c;if(big&&AMBB.length){const k=AMBB[Math.floor(rnd()*AMBB.length)];c=glbCar({len:{van:38,garbage:62,tow:46}[k],color:col},k)}else{const m=AMBK[Math.floor(rnd()*AMBK.length)];c=glbCar({len:m.len,color:m.taxi?'#f2b81d':col},m.glb)}c.scale.multiplyScalar(1.25);(g||root).add(c);return c}
   const c=new T.Group();const b=new T.Mesh(carBody,colMat(col));b.castShadow=true;c.add(b);const k=new T.Mesh(carCab,mat.carGlass);c.add(k);if(big)c.scale.set(1.2,1.5,2);(g||root).add(c);return c}
   {const f=mkCar;mkCar=(col,g,big)=>{const c=f(col,g,big);c.userData.col=col;return c}} // the colour for the far-away box (view3d/lod.js)
  function traffic(P,closed,n,speed,g,both,list,rig){const p=mkPath(P,closed);n=Math.max(1,Math.round(n*(QUAL==='high'?1:QUAL==='medium'?.6:.3)));for(let k=0;k<n;k++){for(const dir of both?[1,-1]:[1]){const car={p,s:(k+rnd()*.5)/n*p.len,v:speed*(.85+rnd()*.3),dir,off:dir>0?2:-2,g:mkCar(CCOL[Math.floor(rnd()*CCOL.length)],g,rnd()<.12),rig};(list||W3.cars).push(car)}}}
  // ambient traffic on the country roads that leave the map (not part of the simulation graph)
  for(const r of CITY.roads)if(r.amb)traffic(r.P.slice(6),false,3,13,null,true);
  // ---- labels: the districts (city_layout.json districts) ----
  const lab=(t,x,z,y,type)=>W3.labels.push({t,x,z,y:y||8,type});
  for(const d of CITY.districts)if(d.id!=='village')W3.labels.push({t:d.t,x:d.x,z:d.z,y:(d.id==='centre'?40:16)+gh(d.x,d.z),core:d.id==='centre'});
  lab('MOTOR RIVER',260,riverZ(260),6);lab('MARINA',F.marina[0],F.marina[1],8);lab('AIRPORT RESERVE',(CITY.AIR[0]+CITY.AIR[2])/2,CITY.AIR[1]+20,6);
  warp(root);
  // ---- dynamic part: rebuilt when subscribers or unlocks change ----
  let dyn=null,dsig='';const bpTex=(()=>{// blueprint grid: few, soft, thick lines + anisotropic filtering, so it doesn't shimmer when the camera moves
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#1d5aa8';x.fillRect(0,0,512,512);x.strokeStyle='rgba(255,255,255,.12)';x.lineWidth=6;for(let k=0;k<=512;k+=128){x.beginPath();x.moveTo(k,0);x.lineTo(k,512);x.moveTo(0,k);x.lineTo(512,k);x.stroke()}x.strokeStyle='rgba(255,255,255,.26)';x.lineWidth=12;x.beginPath();x.moveTo(0,0);x.lineTo(0,512);x.moveTo(512,0);x.lineTo(512,512);x.moveTo(0,0);x.lineTo(512,0);x.moveTo(0,512);x.lineTo(512,512);x.stroke();const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t})();
  const bpMat=new T.MeshStandardMaterial({map:bpTex,roughness:.9,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}),bpLine=M(0xe8f3ff,{emissive:0x9fc8ff,emissiveIntensity:.25});
  const coreG=()=>{const u=new T.Group();u.userData.warped=1;dyn.add(u);return u};
  function bpLot(g,type,cx,cz,w,d,anc){g=anc==='core'?coreG():unit(g,anc?anc[0]:cx,anc?anc[1]:cz);const m=MS[type];const pg=new T.PlaneGeometry(w,d);const uv=pg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/24,uv.getY(i)*d/24);const p=new T.Mesh(pg,bpMat);p.rotation.x=-Math.PI/2;p.position.set(cx,.06,cz);p.receiveShadow=true;g.add(p);
   for(const s of[-1,1]){B0(g,w,.08,.4,bpLine,cx,.06,cz+s*(d/2-.2),false);B0(g,.4,.08,d,bpLine,cx+s*(w/2-.2),.06,cz,false)}
   const sw=clamp(w*.55,14,26),shh=sw*.38,nx=m===nextMilestone();g.add(panel([[(nx?'NEXT · ':'')+m.label.toUpperCase(),104,'#ffffff'],[`OPENS AT ${m.n.toLocaleString('en-US')} SUBS`,72,nx?'#ffd34d':'#ffb36b']],nx?'#b4500f':'#0f2f5c',sw,shh,cx,shh/2+3.2,cz,0));
   for(const s of[-1,1])B0(g,.35,3.4,.35,mat.dark,cx+s*sw*.4,0,cz)}
  const open=t=>isOpen(t);
  function rebuild(){if(dyn){root.remove(dyn);dyn.traverse(o=>{if(o.geometry&&!SH.has(o.geometry))o.geometry.dispose();if(o.material&&!Array.isArray(o.material)){const i=signMats.indexOf(o.material);if(i>=0){signMats.splice(i,1);if(o.material.map)o.material.map.dispose();o.material.dispose()}}})}
   W3.anim=[];W3.cars=W3.cars.filter(c=>!c.dyn);seed=777;const sv=subs||0;const g=dyn=new T.Group();g.userData.mergeRoot=1;root.add(g);const lbl=[];W3.dlabels=lbl;
   const L2=(t,x,z,y,type,core)=>lbl.push({t,x,z,y,type,core});
   // houses
   const HB=[],HR=[],HBc=[],HRc=[],TRx=[],CHx=[];const BODY=['#f4efe4','#efe3cf','#e6e9ee','#f2dcc3','#dfe7d8','#f7f1e8'],ROOF=['#c0392b','#2f5fa8','#3d7a3a','#d9822b','#7a4a2a','#8a2f2f','#3a3f4a','#b5552b'];
   const house=(x,z,ry)=>{const w=5+rnd()*2,d=4.4+rnd()*1.6,h=2.8+rnd()*.9,y0=CITY.hmin(x,z,3.4);HB.push({x,y:y0,z,ry,sx:w,sy:h,sz:d});HBc.push(BODY[Math.floor(rnd()*BODY.length)]);HR.push({x,y:y0+h,z,ry,sx:w+.7,sy:1.5+rnd()*.8,sz:d+.9});CHx.push({x:x+Math.cos(ry)*w*.28,y:y0+h+.3,z:z-Math.sin(ry)*w*.28,sx:.7,sy:1.9,sz:.7});HRc.push(ROOF[Math.floor(rnd()*ROOF.length)]);if(rnd()<.6)TRx.push({x:x+Math.cos(ry)*5,z:z-Math.sin(ry)*5})};
   // Maple Grove houses fill the suburb streets from the entrance outwards as the channel grows (slots from roads/layout.js)
   {const S1=CITY.slots.suburb,nS=Math.min(S1.length,20+Math.floor(sv*1.2));for(let k=0;k<nS;k++)house(...S1[k])}
   {const S2=CITY.slots.village,vc=CITY.nodes[CITY.NI.VIL];
    if(open('w_res')){const n=Math.min(S2.length,40+Math.floor((sv-100)*1.5));for(let k=0;k<n;k++)house(...S2[k]);const[sx,sz]=F.school;B0(g,24,5,14,AM[2],sx,gh(sx,sz),sz);g.add(sign('RIVERSIDE SCHOOL',14,1.8,'#2e7d4f','#ffffff',sx,6+gh(sx,sz),sz+7.2,0));L2('RIVERSIDE HEIGHTS',vc.x,vc.z,14,'w_res')}
    else{bpLot(g,'w_res',vc.x-40,vc.z+5,150,90);L2('RIVERSIDE HEIGHTS',vc.x,vc.z,14,'w_res')}}
   const roofG=sh(W3.roofG||(W3.roofG=(()=>{const p=[-.5,0,-.5,.5,0,-.5,.5,1,0, -.5,0,-.5,.5,1,0,-.5,1,0, .5,0,.5,-.5,0,.5,-.5,1,0, .5,0,.5,-.5,1,0,.5,1,0, -.5,0,-.5,-.5,1,0,-.5,0,.5, .5,0,-.5,.5,0,.5,.5,1,0];const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(p,3));gg.computeVertexNormals();return gg})()));
   const bodyG=sh(W3.bodyG||(W3.bodyG=new T.BoxGeometry(1,1,1).translate(0,.5,0)));
   instG(g,bodyG,houseM,HB,HBc);instG(g,bodyG,mt.brick,CHx);instG(g,roofG,mt.roofT,HR,HRc);
   if(XMAS){W3.xmasHouses=HR.map(r=>({x:WX(r.x),z:WZ(r.z),ry:r.ry,sx:r.sx,sz:r.sz,y:r.y,sy:r.sy}));W3.xmasSig=(W3.xmasSig||0)+1}
   instG(g,sh(new T.IcosahedronGeometry(1.5,0)),M(0xffffff,{flatShading:true}),TRx.map(p=>({x:p.x,y:2.2,z:p.z})),TRx.map(()=>['#4f8a3c','#5c9445','#3f7a34'][Math.floor(rnd()*3)]));
   // apartments (Maple Grove)
   {const slots=CITY.slots.apart;const n=Math.min(slots.length,3+Math.floor(sv/12));for(let k=0;k<n;k++){const[x,z]=slots[k];const h=8+((k*7)%5)*2.4+Math.min(10,sv/150);bld(g,11,h,11,AM[k%AM.length],mat.roof,x,z);B0(g,3,1,2,mat.steel,x+2,h,z)}}
   // the city: downtown, offices, flats and houses between the main buildings
   {const cg=coreG(),C3=cityFill(),CA2=[],NB=[],NBc=[],NR=[],NRc=[],TT=[],TTc=[],CA=[],CAc=[],PD=[],PDc=[];const gr=.78+.22*Math.min(1,sv/3000);
    for(const f of C3.items){const x=U(f.x),z=U(f.y),y0=f.k==='house'?CITY.hmin(x,z,U(f.w)*.55):gh(x,z),ry=f.ry||0,fs=Math.sin(ry),fc=Math.cos(ry);
     if(f.k==='tree'){const s=U(f.r)/1.1;TT.push({x,y:y0+2.1*s,z,sx:s*1.2,sy:s,sz:s*1.2,ry:rnd()*3});TTc.push(['#4f8a3c','#3f7a34','#5c9445','#6a9c45'][Math.floor(rnd()*4)]);continue}
     if(f.k==='car'){CA.push({x,y:y0,z,sx:1.8,sy:1.3,sz:4});CAc.push(f.col);continue}
     if(f.k==='park'){B0(cg,U(f.w),.06,U(f.h),mat.lotAsph,x,y0,z,false);continue}
     const w=U(f.w),d=U(f.h);
     if(f.k==='house'){const h=(f.villa?4.6:2.9)+f.w%3*.2;NB.push({x,y:y0,z,sx:w,sy:h,sz:d,ry});NBc.push(f.body);CA2.push({x:x+fc*w*.28,y:y0+h+.3,z:z-fs*w*.28,sx:.7,sy:1.9,sz:.7});NR.push({x,y:y0+h,z,sx:w+.7,sy:f.villa?2.4:1.7,sz:d+.9,ry});NRc.push(f.roof)}
     else if(f.k==='tower'){const h=(18+Math.max(0,1-f.d/.2)*22+f.f*10)*gr,m=TM[Math.floor(f.f*TM.length)];if(f.f>.6){bld(cg,w,h*.65,d,m,mat.roof,x,z,ry);const t2=bld(cg,w*.72,h*.35,d*.72,m,mat.roof,x,z,ry);t2.position.y=h*.65}else bld(cg,w,h,d,m,mat.roof,x,z,ry);B0(cg,w*.3,1.3,d*.3,mat.steel,x,h,z).rotation.y=ry}
     else if(f.k==='mid'){const h=(8+f.f*10)*gr;bld(cg,w,h,d,TM[1+Math.floor(f.f*3)],mat.roof,x,z,ry);B0(cg,w*.4,1,d*.3,mat.steel,x,h,z).rotation.y=ry}
     else{const h=5+f.f*7;bld(cg,w,h,d,AM[Math.floor(f.f*AM.length)],mat.roof,x,z,ry);B0(cg,w*.85,.25,1.3,M(['#d93a2f','#2e7d4f','#2f6fd9','#e8b931'][Math.floor(f.f*4)]),x+fs*(d/2+.65),2.6,z+fc*(d/2+.65),false).rotation.y=ry}}
    instG(cg,bodyG,houseM,NB,NBc);instG(cg,bodyG,mt.brick,CA2);instG(cg,roofG,mt.roofT,NR,NRc);instG(cg,bodyG,M(0xffffff,{roughness:.35,metalness:.3}),CA,CAc);
    instG(cg,sh(W3.trG||(W3.trG=new T.IcosahedronGeometry(1.3,0))),M(0xffffff,{flatShading:true}),TT,TTc);instG(cg,sh(W3.tkG||(W3.tkG=new T.CylinderGeometry(.14,.2,1.6,5).translate(0,-1.4,0))),mat.trunk,TT.map(p=>({x:p.x,y:p.y,z:p.z})));
     if(W3.cityHook)W3.cityHook(cg,C3,gr)}
   // industrial zone
   {const slots=CITY.slots.industry;
    const n=Math.min(slots.length,5+Math.floor(sv/14));const CT=[],CTc=[];
    for(let k=0;k<n;k++){const[sx0,sz0,sry,sw,sdp]=slots[k];const g0=g;{const g=new T.Group();g.position.set(sx0,gh(sx0,sz0),sz0);g.rotation.y=sry;g0.add(g);const x=0,z=0;const w=sw-2+rnd()*2,d=sdp-1,h=6+rnd()*3;B0(g,w,h,d,k%2?mt.corr:mt.corr2,x,0,z);B0(g,w+.6,.5,d+.6,mat.roofD,x,h,z);for(let q=0;q<3;q++)B0(g,3,3.4,.2,mat.dark,x-w/3+q*w/3,0,z+d/2+.05,false);
     if(k%3===0){const ch=new T.Group();ch.position.set(x+w/2-2,0,z-d/2+2);for(let q=0;q<4;q++){const c=new T.Mesh(new T.CylinderGeometry(1.1-q*.08,1.2-q*.08,5.5,10),q%2?mt.white:mt.red);c.position.y=2.75+q*5.5;c.castShadow=true;ch.add(c)}g.add(ch);const puffs=[];for(let q=0;q<6;q++){const p=new T.Mesh(new T.SphereGeometry(1,8,6),mt.smoke);g.add(p);puffs.push(p)}const ph=rnd()*6;W3.anim.push(t=>{const cx=ch.position.x,cz=ch.position.z;puffs.forEach((p,q)=>{const k2=((t*.18+q/6+ph)%1);p.position.set(cx+k2*6,22+k2*14,cz-k2*3);p.scale.setScalar(1+k2*3.2);p.material.opacity=.5})})}
     if(k%4===1){for(let q=0;q<2;q++){const tk=new T.Mesh(new T.CylinderGeometry(4,4,6,16),mt.tank);tk.position.set(x-6+q*10,3,z-d/2-8);tk.castShadow=true;g.add(tk)}}
     if(k%4===2)for(let q=0;q<10;q++){const lx=-8+(q%5)*3.1,lz=-d/2-9,c=Math.cos(sry),sn=Math.sin(sry);CT.push({x:sx0+c*lx+sn*lz,y:gh(sx0,sz0)+Math.floor(q/5)*2.6,z:sz0-sn*lx+c*lz,ry:sry,sx:2.6,sy:2.5,sz:6});CTc.push(['#c0392b','#2f6fd9','#e8b931','#2e8b57','#ff7a1a'][q%5])}}}
    instG(g,bodyG,mt.bodyT,CT,CTc)}
   // fire station
   if(open('w_fire')){const[x,z]=F.w_fire,g=unit(dyn,x,z);B0(g,26,.08,12,mat.pad,x,.02,z-14,false);B0(g,24,7,16,mt.brick,x,0,z);B0(g,24.6,.6,16.6,mat.roofD,x,7,z);for(let q=0;q<3;q++)B0(g,5.4,5,.2,mat.dark,x-7.6+q*7.6,0,z-8.05,false);B0(g,3,12,3,mt.brick,x+9,0,z+4);g.add(sign('FIRE STATION',14,1.8,'#d93a2f','#ffffff',x,8.4,z-8.2,0));const ft=mkCar('#d93a2f',g,true);ft.position.set(x-7.6,0,z-12);L2('FIRE STATION',x,z,12,'w_fire')}
   else{bpLot(g,'w_fire',F.w_fire[0],F.w_fire[1]-6,26,28);L2('FIRE STATION',F.w_fire[0],F.w_fire[1],10,'w_fire')}
   // hospital
   if(open('w_hosp')){const[x,z]=F.w_hosp,g=unit(dyn,x,z);B0(g,30,.08,10,mat.pad,x,.02,z-16,false);bld(g,34,12,22,AM[2],mat.roof,x,z);bld(g,14,20,14,AM[2],mat.roof,x+8,z+2);const hp=new T.Mesh(new T.CylinderGeometry(4.5,4.5,.2,24),mat.dark);hp.position.set(x+8,20.1,z+2);g.add(hp);B0(g,1,.05,5,mt.white,x+8,20.2,z+2,false);
    for(const s of[-1,1]){B0(g,.4,4,1.2,mt.red,x-12+s*.1,7,z-11.1,false);B0(g,4,1.2,.4,mt.red,x-12,8.4,z-11.1,false)}g.add(sign('HOSPITAL',12,1.8,'#ffffff','#d93a2f',x,13.4,z-11.2,0));for(let q=0;q<2;q++){const a=mkCar('#f4f4f0',g,true);a.position.set(x+4+q*5,0,z-15)}L2('HOSPITAL',x,z,22,'w_hosp')}
   else{bpLot(g,'w_hosp',F.w_hosp[0],F.w_hosp[1]-5,36,30);L2('HOSPITAL',F.w_hosp[0],F.w_hosp[1],10,'w_hosp')}
   // stadium + league
   if(open('w_stad')){const[x,z]=F.w_stad,g=unit(dyn,x,z);const sh2=new T.Shape();sh2.absellipse(0,0,36,29,0,Math.PI*2);const hole=new T.Path();hole.absellipse(0,0,27,20,0,Math.PI*2,true);sh2.holes.push(hole);
    const st=new T.Mesh(new T.ExtrudeGeometry(sh2,{depth:9,bevelEnabled:false,curveSegments:40}),M(0xd8dde3));st.rotation.x=-Math.PI/2;st.position.set(x,0,z);st.castShadow=true;g.add(st);
    const seats=new T.Mesh(new T.RingGeometry(20.5,27,48,1),M(0x2f6fd9,{side:T.DoubleSide}));seats.scale.set(1,1,1);seats.rotation.x=-Math.PI/2;seats.position.set(x,9.05,z);seats.scale.set(1.33,1,1);g.add(seats);
    const pc=document.createElement('canvas');pc.width=256;pc.height=160;const q=pc.getContext('2d');for(let k=0;k<10;k++){q.fillStyle=k%2?'#4f9a3f':'#5aa848';q.fillRect(k*25.6,0,25.6,160)}q.strokeStyle='#fff';q.lineWidth=3;q.strokeRect(10,10,236,140);q.beginPath();q.moveTo(128,10);q.lineTo(128,150);q.stroke();q.beginPath();q.arc(128,80,20,0,7);q.stroke();q.strokeRect(10,50,30,60);q.strokeRect(216,50,30,60);
    const ptx=new T.CanvasTexture(pc);ptx.colorSpace=T.SRGBColorSpace;const pitch=new T.Mesh(new T.PlaneGeometry(40,25),new T.MeshStandardMaterial({map:ptx,roughness:.9}));pitch.rotation.x=-Math.PI/2;pitch.position.set(x,.08,z);g.add(pitch);
    for(const[a,b]of[[1,1],[1,-1],[-1,1],[-1,-1]]){const p=new T.Mesh(new T.CylinderGeometry(.3,.3,18,6),mat.steel);p.position.set(x+a*31,9,z+b*22);g.add(p);B0(g,4,1.6,.6,mat.lamp,x+a*31,18,z+b*22,false)}
    const sb=document.createElement('canvas');sb.width=512;sb.height=160;const sbt=new T.CanvasTexture(sb);sbt.colorSpace=T.SRGBColorSpace;const sbm=new T.Mesh(new T.PlaneGeometry(14,4.4),new T.MeshBasicMaterial({map:sbt}));sbm.position.set(x,13,z+29.5);g.add(sbm);B0(g,14.6,5,.4,mat.dark,x,10.8,z+29.2,false);
    W3.board={c:sb,t:sbt,last:''};const pl=[];for(let k=0;k<10;k++){const m=new T.Mesh(sh(W3.plG||(W3.plG=new T.CapsuleGeometry(.35,.9,3,6))),k<5?M(0xd93a2f):M(0x2f6fd9));m.position.y=.9;g.add(m);pl.push(m)}const ball=new T.Mesh(new T.SphereGeometry(.35,10,8),mt.white);g.add(ball);
    const P0=pitch.position;W3.anim.push(t=>{if(W3.fb)return;const x=P0.x,z=P0.z;const bx=x+Math.sin(t*.7)*15,bz=z+Math.sin(t*1.3)*8;ball.position.set(bx,.4,bz);pl.forEach((m,k)=>{const side=k<5?-1:1,hx=x+side*(6+(k%5)*3);m.position.x+=((bx*.4+hx*.6)+Math.sin(t+k)*2-m.position.x)*.03;m.position.z+=((bz*.5+(z+((k%5)-2)*4)*.5)-m.position.z)*.03})});if(X&&X.ld)stadPlayers(g,P0,pl,ball);L2('STADIUM · MOTOROPOLIS LEAGUE',x,z,16,'w_stad')}
   else{W3.board=null;bpLot(g,'w_stad',F.w_stad[0],F.w_stad[1],74,56);L2('STADIUM',F.w_stad[0],F.w_stad[1],10,'w_stad')}
   // mall + first tower
   if(open('w_mall')){const[x,z]=F.w_mall;bld(g,46,9,22,AM[0],mat.roof,x,z);B0(g,46.4,.15,1.2,mt.glassB,x,4,z-11.2,false);for(let q=0;q<4;q++)B0(g,8,6,.3,mt.glassB,x-16+q*10.6,0,z-11.1,false);g.add(sign('MOTOROPOLIS MALL',22,2.6,'#ff7a1a','#1d0f02',x,10.8,z-11.3,0));
    const P=[],Pc=[];for(let q=0;q<22;q++){P.push({x:x-20+(q%11)*4,y:0,z:z+17+Math.floor(q/11)*7,sx:2,sy:1.4,sz:4.2});Pc.push(CCOL[q%CCOL.length])}const pk=new T.Mesh(new T.PlaneGeometry(48,18),mat.lotAsph);pk.rotation.x=-Math.PI/2;pk.position.set(x,.05,z+20);g.add(pk);instG(g,bodyG,mt.bodyT,P,Pc);
    bld(g,13,46,13,TM[4],mat.roof,x+28,z-4);L2('MALL',x,z,14,'w_mall')}
   else{bpLot(g,'w_mall',F.w_mall[0]+4,F.w_mall[1]+8,64,46);L2('SHOPPING MALL',F.w_mall[0],F.w_mall[1]+8,10,'w_mall')}
   // train station + railway (city_layout.json rail; the station by the centre)
   {const RAIL=smooth(CITY.rail,400),rp=mkPath(RAIL,false),o={};const sx=F.w_train[0];let s0=0,bd=1e9;for(let s2=0;s2<rp.len;s2+=2){atPath(rp,s2,0,o);if(Math.abs(o.x-sx)<bd){bd=Math.abs(o.x-sx);s0=s2}}atPath(rp,s0,0,o);const sz=o.z-13;
    const offL=d=>{const P=[];for(let s2=0;s2<=rp.len;s2+=4){atPath(rp,s2,d,o);P.push([o.x,o.z])}return P};
    if(open('w_train')){ribbon(RAIL,5,.18,mt.stone,false,g);for(const q of[-1,1])ribbon(offL(q*.8),.22,.4,mt.rail,false,g);const SL=[];along(RAIL,2.4,0,(x,z,a)=>SL.push({x,y:.12,z,ry:a,sx:2.6,sy:.14,sz:.5}));instG(g,bodyG,mt.sleeper,SL,null,false);
     B0(g,44,6,10,mt.offw,sx,0,sz);B0(g,46,.6,12,mat.roofD,sx,6,sz);B0(g,60,.9,3,mat.pad,sx,0,sz+8.5);g.add(sign('MOTOROPOLIS CENTRAL',20,2.2,'#0f2f5c','#ffffff',sx,7.6,sz-5.2,0));
     const tr=new T.Group();g.add(tr);const cars2=[];for(let k=0;k<5;k++){const c=new T.Group();B0(c,9.2,3,2.8,k?M(0xe8ecf0):M(0xd93a2f),0,.5,0);B0(c,9.25,.9,2.85,mat.carGlass,0,2,0,false);B0(c,9.2,.3,2.9,k?M(0x2f6fd9):M(0x22252b),0,3.5,0,false);tr.add(c);cars2.push(c)}
     let ts=s0-260,dir=1,wait=0;const sMin=60,sMax=rp.len-80;W3.anim.push((t,dt)=>{if(wait>0)wait-=dt;else{const prev=ts;ts+=dir*24*dt;if((prev-s0)*(ts-s0)<=0){ts=s0;wait=5}if(ts>sMax){ts=sMax;dir=-1;wait=3}if(ts<sMin){ts=sMin;dir=1;wait=3}}
      cars2.forEach((c,k)=>{atPath(rp,ts-dir*k*9.6,0,o);c.position.set(o.x,0,o.z);c.rotation.y=o.ry-Math.PI/2})});L2('TRAIN STATION',sx,sz,12,'w_train')}
    else{bpLot(g,'w_train',sx,sz,46,14);ribbon(RAIL,4,.05,bpMat,false,g);L2('RAILWAY & STATION',sx,sz,10,'w_train')}}
   // highway with toll plaza and tunnel
   {const hp=mkPath(HWY,false),o={};let ts=0;for(let s2=0;s2<hp.len;s2+=4){atPath(hp,s2,0,o);if(o.x>=760){ts=s2;break}}atPath(hp,ts,0,o);const tx=o.x,tz=o.z;let pt=hp.len;for(let s2=ts;s2<hp.len;s2+=4){atPath(hp,s2,0,o);if(gh(o.x,o.z)>=9){pt=s2;break}}atPath(hp,pt,0,o);const px=o.x,pz=o.z,HWYc=HWY.filter(p=>p[0]<=px+6);
   if(open('w_hwy')){road(HWY,13,.015,g,true);
    for(let q=-2;q<=2;q++)B0(g,3,3,1.6,mt.offw,tx,0,tz+q*3);B0(g,6,.5,18,mt.red,tx,3.4,tz,false);g.add(sign('TOLL',6,1.4,'#e8b931','#1d0f02',tx-3.1,5.1,tz,-Math.PI/2));
    const por=new T.Mesh(new T.TorusGeometry(8,1.6,8,16,Math.PI),mt.stone);por.position.set(px,0,pz);por.rotation.y=Math.PI/2;g.add(por);B0(g,1,9,13,mat.black,px+1.5,0,pz,false);
    const hl=[];traffic(HWYc,false,6,26,g,true,hl);hl.forEach(c=>{c.dyn=true;W3.cars.push(c)});L2('HIGHWAY · TOLL',tx,tz,10,'w_hwy')}
   else{ribbon(HWY,13,.02,bpMat,false,g);L2('HIGHWAY & TUNNEL',tx,tz,10,'w_hwy')}}
   // airport
   if(open('w_air')){const AX=F.w_air[0]+280,AZ=F.w_air[1]-106,g=new T.Group();g.position.set(AX,0,AZ);g.userData.warped=1;dyn.add(g);const ap=new T.Mesh(new T.PlaneGeometry(290,212),M(0x86a35e));ap.rotation.x=-Math.PI/2;ap.position.set(-280,.03,106);ap.receiveShadow=true;g.add(ap);
    B0(g,14,.05,200,mat.asphalt,-300,0,105,false);for(let z=12;z<200;z+=10)B0(g,.5,.06,5,mt.white,-300,0,z,false);for(const zz of[9,201])for(let q=-5;q<=5;q++)B0(g,.6,.06,4,mt.white,-300+q*1.2,0,zz,false);
    B0(g,6,.05,190,mat.asphalt,-270,0,105,false);for(const zz of[20,105,190])B0(g,30,.05,6,mat.asphalt,-285,0,zz,false);B0(g,50,.05,100,mat.pad,-232,0,105,false);
    bld(g,18,8,110,TM[0],mt.white,-196,105);B0(g,20,.8,112,mt.white,-196,8,105);g.add(sign('MOTOROPOLIS INTERNATIONAL',30,3,'#0f2f5c','#ffffff',-205.6,10.4,105,Math.PI/2));
    const tw=new T.Mesh(new T.CylinderGeometry(1.4,2,22,12),mt.offw);tw.position.set(-232,11,36);g.add(tw);const cab=new T.Mesh(new T.CylinderGeometry(3.4,2.6,3,12),mt.glassB);cab.position.set(-232,23.5,36);g.add(cab);const cr=new T.Mesh(new T.CylinderGeometry(3.8,3.8,.5,12),mt.white);cr.position.set(-232,25.2,36);g.add(cr);
    for(const zz of[170,192]){const hg=new T.Mesh(new T.CylinderGeometry(9,9,22,16,1,false,0,Math.PI),mt.corr);hg.rotation.z=Math.PI/2;hg.rotation.y=Math.PI/2;hg.position.set(-236,0,zz);g.add(hg)}
    const plane=(c)=>{const p=new T.Group();const f=new T.Mesh(new T.CapsuleGeometry(1.6,14,6,12),mt.white);f.rotation.x=Math.PI/2;f.position.y=2.4;p.add(f);B0(p,22,.35,3.4,mt.white,0,2,.5);B0(p,8,.3,2,mt.white,0,2.8,-7);B0(p,.35,4,2.6,c,0,3.4,-7.4);B0(p,3.3,.5,12,c,0,2.1,0,false);(p.userData.f=f);g.add(p);return p};
    for(const[zz,c]of[[70,M(0x2f6fd9)],[110,M(0xd93a2f)],[150,M(0xff7a1a)]]){const p=plane(c);p.position.set(-226,0,zz);p.rotation.y=Math.PI/2}
    const fl=plane(M(0x2f6fd9));dyn.add(fl);const cv=new T.CatmullRomCurve3([[-300,.1,190],[-300,.1,120],[-300,6,40],[-300,30,-60],[-200,62,-240],[150,78,-290],[520,80,-60],[520,75,240],[200,66,420],[-150,48,420],[-300,24,330],[-300,6,240]].map(p=>new T.Vector3(...p)),true,'centripetal');
    const pp=new T.Vector3(),pn=new T.Vector3();W3.anim.push(t=>{const u=(t/70)%1;cv.getPointAt(u,pp);cv.getPointAt((u+.002)%1,pn);fl.position.set(pp.x+AX,pp.y,pp.z+AZ);pn.x+=AX;pn.z+=AZ;fl.lookAt(pn)});L2('AIRPORT',F.w_air[0]+20,F.w_air[1],16,'w_air')}
   else{bpLot(g,'w_air',F.w_air[0],F.w_air[1],288,210);L2('AIRPORT',F.w_air[0],F.w_air[1],12,'w_air')}
   // arena + event zone
   if(open('w_arena')){const[x,z]=F.w_arena;const d=new T.Mesh(new T.SphereGeometry(18,28,12,0,Math.PI*2,0,Math.PI/2),M(0xe6eaef,{metalness:.4,roughness:.3}));d.scale.y=.55;d.position.set(x,4,z);d.castShadow=true;g.add(d);
    const ring=new T.Mesh(new T.CylinderGeometry(18.2,18.2,4,32,1,true),mt.led);ring.position.set(x,2,z);g.add(ring);g.add(sign('ARENA',10,2,'#6b3fa0','#ffffff',x,7,z-18.6,0));
    const TE=['#d93a2f','#e8b931','#2f6fd9','#2e8b57'];for(let q=0;q<6;q++){const tn=new T.Mesh(new T.ConeGeometry(2.4,3,4),M(TE[q%4]));tn.position.set(x-16+q*6.4,1.5,z+24);tn.rotation.y=Math.PI/4;g.add(tn)}
    const beams=[];for(let q=0;q<3;q++){const b=new T.Mesh(new T.CylinderGeometry(.3,3,70,10,1,true),new T.MeshBasicMaterial({color:0xbfe0ff,transparent:true,opacity:.12,depthWrite:false}));g.add(b);b.userData.nm=1;beams.push(b)}
    W3.anim.push(t=>{ring.material.emissive.setHSL((t*.05)%1,.8,.5);beams.forEach((b,q)=>{b.position.set(d.position.x-8+q*8,35,d.position.z);b.rotation.z=Math.sin(t*.6+q*2)*.35;b.rotation.x=Math.cos(t*.5+q)*.25;b.visible=mat.win.emissiveIntensity>.3})});L2('ARENA · EVENTS',x,z,16,'w_arena')}
   else{bpLot(g,'w_arena',F.w_arena[0],F.w_arena[1]+4,72,50);L2('ARENA & EVENTS',F.w_arena[0],F.w_arena[1]+4,10,'w_arena')}
   // harbor
   // harbor: the quay along the east shore of the bay (built along local x, the water on local +z)
   {const[hx,hz]=F.w_port;if(open('w_port')){const hg=new T.Group();hg.position.set(hx,0,hz);hg.rotation.y=-Math.PI/2;hg.userData.warped=1;g.add(hg);const g0=g;{const g=hg;
    B0(g,150,1.2,8,mt.stone,0,0,-4);const CT=[],CTc=[];for(let q=0;q<40;q++){CT.push({x:-65+(q%10)*6.4,y:Math.floor(q/10)%2*2.6,z:-11-Math.floor(q/20)*3,sx:6,sy:2.5,sz:2.6});CTc.push(['#c0392b','#2f6fd9','#e8b931','#2e8b57','#ff7a1a','#8a95a3'][q%6])}instG(g,bodyG,mt.bodyT,CT,CTc);
    for(const x of[-35,15,55]){const c=new T.Group();c.position.set(x,0,-3);for(const a of[-1,1])for(const b of[-1,1])B0(c,.8,18,.8,mt.red,a*3,0,b*3);B0(c,7,1.4,7,mt.red,0,18,0);B0(c,1.2,1.2,24,mt.red,0,19.4,6);g.add(c)}
    const ship=new T.Group();const hs=new T.Shape();hs.moveTo(-20,-4);hs.lineTo(16,-4);hs.lineTo(22,0);hs.lineTo(16,4);hs.lineTo(-20,4);hs.lineTo(-20,-4);const hull=new T.Mesh(new T.ExtrudeGeometry(hs,{depth:3,bevelEnabled:false}),M(0x22252b));hull.rotation.x=-Math.PI/2;ship.add(hull);B0(ship,6,6,7,mt.white,-14,3,0);
    for(let q=0;q<12;q++)B0(ship,5.6,2.4,2.4,M(['#c0392b','#2f6fd9','#e8b931','#2e8b57'][q%4]),-6+(q%4)*5.8,3,-2.6+Math.floor(q/4)*2.6,false);ship.position.set(-5,0,24);g.add(ship);W3.anim.push(t=>{ship.position.y=Math.sin(t*.8)*.15})}L2('HARBOR',hx+8,hz,12,'w_port')}
    else{bpLot(g,'w_port',hx+15,hz,22,150);L2('HARBOR',hx+15,hz,10,'w_port')}}
   // Motoropolis Tower (city centre block)
   {const tb=cityFill().blocks.find(b=>b.type==='towerlot'),x=U((tb.x0+tb.x1)/2),z=U((tb.y0+tb.y1)/2);if(open('w_tower')){const g=coreG();B0(g,U(tb.x1-tb.x0),.3,U(tb.y1-tb.y0),mat.pad,x,0,z,false);bld(g,20,34,16,TM[4],mat.roof,x,z);const t2=bld(g,14,34,12,TM[0],mat.roof,x,z);t2.position.y=34;const t3=bld(g,9,26,8,TM[4],mat.roof,x,z);t3.position.y=68;const sp=new T.Mesh(new T.CylinderGeometry(.3,1.1,18,8),mat.steel);sp.position.set(x,103,z);g.add(sp);
     const bc=new T.Mesh(new T.SphereGeometry(.9,10,8),M(0xff3b30,{emissive:0xff3b30,emissiveIntensity:2}));bc.position.set(x,112.5,z);g.add(bc);for(const r of[0,Math.PI/2,Math.PI,-Math.PI/2])g.add(sign('MOTOROPOLIS',8,1.6,'#ff7a1a','#1d0f02',x+Math.sin(r)*4.6,88,z+Math.cos(r)*4.6,r));bc.userData.nm=1;W3.anim.push(t=>{bc.visible=Math.floor(t*1.5)%2===0});L2('MOTOROPOLIS TOWER',x,z,118,'w_tower',true)}
    else{bpLot(g,'w_tower',x,z,U(tb.x1-tb.x0),U(tb.y1-tb.y0),'core');L2('MOTOROPOLIS TOWER',x,z,10,'w_tower',true)}}
   // Grand Prix
   {const GPd=[F.gp[0]+305,F.gp[1]-282],gpG=new T.Group();gpG.position.set(GPd[0],0,GPd[1]);gpG.userData.warped=1;g.add(gpG);{const g=gpG;const GP=smooth([[-440,252],[-300,242],[-200,250],[-160,282],[-185,322],[-260,314],[-300,288],[-350,324],[-430,322],[-452,288]],300,true);
    if(open('w_gp')){ribbon(GP,10,.04,mt.track,true,g);const K=[],Kc=[];for(const o of[-5.4,5.4]){let q=0;along(GP,2,o,(x,z,a)=>{K.push({x,y:.05,z,ry:a,sx:1.2,sy:.15,sz:2});Kc.push(q++%2?'#e33b2e':'#f4f4f0')},true)}instG(g,bodyG,mt.bodyT,K,Kc,false);
     B0(g,60,6,8,M(0x8a95a3),-300,0,233);{const pk=new T.Mesh(new T.PlaneGeometry(36,8),mat.lotAsph);pk.rotation.x=-Math.PI/2;pk.position.set(-235,.05,235);g.add(pk);const P=[],Pc=[];for(let q=0;q<8;q++){P.push({x:-250+q*4.2,y:0,z:235,sx:2,sy:1.4,sz:4.2});Pc.push(CCOL[q%CCOL.length])}instG(g,W3.bodyG,mt.bodyT,P,Pc)}for(let q=0;q<5;q++)B0(g,58,.5,1.4,M(['#d93a2f','#2f6fd9','#e8b931','#2e8b57','#f4f4f0'][q]),-300,1+q,236+q*1.2,false);g.add(sign('GRAND PRIX',18,2.6,'#111111','#ffffff',-300,8.6,242.5,0));
     const gp=mkPath(GP,true);const rc=[];for(let q=0;q<8;q++){const c=new T.Group();B0(c,2,.6,4.6,colMat(CCOL[q%CCOL.length]),0,.15,0);B0(c,2.6,.15,.8,mat.dark,0,.6,-2.2,false);B0(c,2.4,.15,.6,mat.dark,0,.25,2.3,false);B0(c,.8,.5,1,mat.carGlass,0,.7,0,false);g.add(c);rc.push({c,s:q*14,v:52+q*1.5})}
     const o={};W3.anim.push((t,dt)=>{for(const r of rc){r.s+=r.v*dt;atPath(gp,r.s,0,o);r.c.position.set(WX(o.x),0,WZ(o.z));r.c.rotation.y=o.ry}});L2('GRAND PRIX',F.gp[0]+5,F.gp[1],12,'w_gp')}
    else{bpLot(g,'w_gp',-305,282,320,105);L2('GRAND PRIX CIRCUIT',F.gp[0],F.gp[1],10,'w_gp')}}}
   warp(g);applyNight(true)}
  // emergency effects (fire on a car, water spray)
  const flame=new T.Group();for(let q=0;q<3;q++){const f=new T.Mesh(new T.ConeGeometry(.9-q*.2,2.4+q*.6,8),q?mt.flame2:mt.flame);f.position.set((q-1)*.5,1.6+q*.3,0);flame.add(f)}flame.visible=false;scene.add(flame);
  const spray=new T.Mesh(new T.CylinderGeometry(.12,.5,1,8,1,true),mt.spray);spray.visible=false;scene.add(spray);
  const tmp={},v1=new T.Vector3(),v2=new T.Vector3();let wt=0;
  W3.sync=(dt)=>{const sv=subs||0;
   // Phase 1B: the map is bigger; push the fog and the far plane out when the camera is far away (overview)
   {const fn=Math.max(1000,cam.dist*.9);if(scene.fog&&scene.fog.near!==fn){scene.fog.near=fn;scene.fog.far=fn+1800;const cf=Math.max(3400,cam.dist+2600);if(camera.far!==cf){camera.far=cf;camera.updateProjectionMatrix()}}}
const sig=ALL_MS.map(m=>isOpen(m.type)?1:0).join('')+'|'+sv+'|'+(nextMilestone()||{}).type;if(sig!==dsig){dsig=sig;rebuild()}
   wt+=dt;W3.waterTex.offset.set(wt*.01,wt*.004);if(W3.fish){const F=W3.fish;if(F.mx)F.mx.update(dt);F.g.position.y=F.y0+.06*Math.sin(wt*1.6);F.g.rotation.z=.03*Math.sin(wt*1.1);F.g.rotation.y=F.r0+.05*Math.sin(wt*.3)}for(const m of W3.tmats)m.emissiveIntensity=mat.win.emissiveIntensity*.75;
   for(const c of W3.cars){c.s+=c.v*dt*c.dir;atPath(c.p,c.s,c.off,tmp);if(c.rig){c.g.position.set(tmp.x+c.rig[0],0,tmp.z+c.rig[1]);c.g.rotation.y=tmp.ry+(c.dir<0?Math.PI:0)}else{atPath(c.p,c.s,0,tmp);const px=tmp.x,pz=tmp.z,x0=WX(px),z0=WZ(pz);atPath(c.p,c.s+1,0,tmp);let hx=WX(tmp.x)-x0,hz=WZ(tmp.z)-z0;const hl=Math.hypot(hx,hz)||1;hx/=hl;hz/=hl;const o=c.off>0?1.55:-1.55;c.g.position.set(x0-hz*o,deckY(px,pz),z0+hx*o);c.g.rotation.y=Math.atan2(hx,hz)+(c.dir<0?Math.PI:0)}if(c.g.userData.col)lodCar(c.g,{color:c.g.userData.col})}
   for(const a of W3.anim)a(wt,dt);
   if(W3.board&&simTime-(W3.board.at||-99)>1){W3.board.at=simTime;const L=LEAGUE;const txt=L.home+' '+L.hs+' - '+L.as+' '+L.away+'|'+L.min;if(txt!==W3.board.last){W3.board.last=txt;const x=W3.board.c.getContext('2d');x.fillStyle='#0b0e13';x.fillRect(0,0,512,160);x.fillStyle='#ffd34d';x.font="800 30px 'Barlow Condensed',sans-serif";x.textAlign='center';x.fillText('MOTOROPOLIS LEAGUE · '+(L.min>=90?'FULL TIME':L.min+"'"),256,40);x.fillStyle='#fff';x.font="800 50px 'Barlow Condensed',sans-serif";x.fillText(`${L.home.toUpperCase()} ${L.hs}-${L.as} ${L.away.toUpperCase()}`,256,112);W3.board.t.needsUpdate=true}}
   const e=emerg;flame.visible=false;spray.visible=false;
   if(e&&e.type==='fire'){const gv=meshes.get(e.car.id);if(gv){flame.visible=true;flame.position.copy(gv.position);const k=e.arrived?Math.max(.15,1-(e.t-(e.fix-8))/8):1;flame.scale.set(k,k*(1+.25*Math.sin(wt*20)),k);
     const gr=meshes.get(e.resp.id);if(gr&&e.arrived){v1.set(gr.position.x,2.6,gr.position.z);v2.set(gv.position.x,1.2,gv.position.z);const d=v1.distanceTo(v2);spray.visible=true;spray.scale.set(1,d,1);spray.position.copy(v1).add(v2).multiplyScalar(.5);spray.lookAt(v2);spray.rotateX(Math.PI/2)}}}}
  W3.labelsDraw=()=>{if(cam.dist<120)return;const a=clamp((cam.dist-120)/80,0,1);hctx.globalAlpha=a;const sz=clamp(2400/cam.dist,12,20);
   for(const l of W3.labels.concat(W3.dlabels||[])){const s=l.core?toHud(l.x,l.y,l.z):toHud(WX(l.x),l.y,WZ(l.z));if(!s||s.x<-80||s.x>CW+80||s.y<0||s.y>CH)continue;const m=l.type?MS[l.type]:null;
    if(m&&!isOpen(l.type)){const nx=m===nextMilestone();pill(`${l.t} · ${m.n.toLocaleString('en-US')} SUBS${nx?' · NEXT':''}`,s.x,s.y,sz,nx?'rgba(255,122,26,.95)':'rgba(15,47,92,.92)',nx?'#1d0f02':'#e8f3ff')}
    else pill(l.t,s.x,s.y,sz,'rgba(16,19,24,.82)','#ffffff')}
   hctx.globalAlpha=1};
