//@ people/people3d.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- people ----------
 const PG={body:new T.CylinderGeometry(.24,.3,.62,10),head:new T.SphereGeometry(.22,12,10),leg:new T.BoxGeometry(.13,.5,.15),hair:new T.SphereGeometry(.23,12,8,0,Math.PI*2,0,Math.PI/2)};
 const pMat={};const pm=c=>pMat[c]||(pMat[c]=M(c));
 // ---------- REMAKE look (only on the preview page): game-style people, glossy cars, glow, skyline and bloom ----------
 const OUTFIT={'#1d4fb8':'mech','#f2a51a':'hivis','#e8b931':'hivis','#141a28':'police','#22252b':'suit','#111':'robe','#2e7d4f':'green','#d93a2f':'red','#c0392b':'red'};
 const XG=X?{cap:(r,l)=>new T.CapsuleGeometry(r,l,5,10)}:null;const xm={};const XM=(c,o)=>{const k=c+JSON.stringify(o||{});return xm[k]||(xm[k]=M(c,Object.assign({roughness:.7},o||{})))};
 const MANMAT={};
 function santaHat(col){const h=new T.Group(),red=XM('#c62828'),wh=XM('#ffffff');const c=new T.Mesh(new T.ConeGeometry(.13,.3,10),red);c.position.set(0,1.86,-.03);c.rotation.x=-.35;h.add(c);const b=new T.Mesh(new T.CylinderGeometry(.14,.14,.06,12),wh);b.position.y=1.74;h.add(b);const pp=new T.Mesh(new T.SphereGeometry(.045,8,6),wh);pp.position.set(0,1.99,-.1);h.add(pp);
  if(col==='#c0392b'){const bd=new T.Mesh(new T.SphereGeometry(.12,10,8),wh);bd.scale.set(1,1.2,.6);bd.position.set(0,1.5,.1);h.add(bd)}h.traverse(o=>{if(o.isMesh)o.castShadow=true});return h}
 function personGLB(col,skin,fit){const C={mech:['#1f2a44','#1f2a44'],hivis:['#c7e01f','#232c40'],police:['#151a26','#141821'],suit:['#22252b','#22252b'],robe:['#121214','#121214'],green:['#2e7d4f','#3b4a3a'],red:['#d93a2f','#2b2f38'],casual:[col,'#3c5a85']}[fit];
  const key=C[0]+C[1]+skin;const g=new T.Group();const m=X.man.clone(X.man.scene);const s=1.8/X.man.h;m.scale.multiplyScalar(s);m.position.y=-X.man.y0*s;g.add(m);
  const legs=[],rig={};m.traverse(o=>{if(o.isBone){const mm=/^(UpperLeg|LowerLeg|UpperArm|LowerArm)\.?([LR])/.exec(o.name);if(mm){rig[mm[1]+mm[2]]={b:o,q0:o.quaternion.clone()}}}if(!o.isMesh)return;o.castShadow=true;o.frustumCulled=false;
   if(!MANMAT[key]){const base=o.material,img=base.map.image;const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;const x=cv.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,cv.width,cv.height),p=d.data;
     const hx=h=>{const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]};const top=hx(C[0]),pan=hx(C[1]),sk=hx(skin);
     for(let i=0;i<p.length;i+=4){const r=p[i],gg=p[i+1],b=p[i+2],l=(r+gg+b)/3;let t=null,k=1;
      if(r>150&&r>gg&&gg>b&&r-b>55){t=sk;k=l/185}else if(b>r+18&&b>95){t=top;k=l/130}else if(Math.abs(r-b)<20&&Math.abs(gg-b)<14&&l>50&&l<100&&i/4%cv.width>10){t=pan;k=l/75}
      if(t){p[i]=Math.min(255,t[0]*k);p[i+1]=Math.min(255,t[1]*k);p[i+2]=Math.min(255,t[2]*k)}}
     x.putImageData(d,0,0);const tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;tx.flipY=base.map.flipY;tx.magFilter=T.NearestFilter;const nm=base.clone();nm.map=tx;MANMAT[key]=nm}
   o.material=MANMAT[key]});
  g.userData.legs=[new T.Object3D(),new T.Object3D()];if(rig.UpperLegL&&rig.UpperLegR){g.updateMatrixWorld(true);const wq=new T.Quaternion();for(const k in rig){rig[k].b.getWorldQuaternion(wq);rig[k].ax=new T.Vector3(1,0,0).applyQuaternion(wq.invert()).normalize()}g.userData.rig=rig}return g}
 const WQ=X?new T.Quaternion():null;
