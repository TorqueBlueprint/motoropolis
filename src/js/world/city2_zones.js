//@ world/city2_zones.js - phase 1 zones on the Phase 1B layout: the Old Town by the bay (crooked cobbled lanes from the
//@ city layout, a square with a fountain and a clock tower, narrow gabled townhouses along the lanes and the quay) and the
//@ shopping street (shops and restaurants on the ground floors along the west avenue).
//@ inside the if(WORLD){ block of world/world3d.js, after world/city2_roads.js. Off with ?city=1.
  if(CITY2){const C2=W3.c2,r2=C2.rnd,gh=CITY.h;let g=new T.Group();root.add(g);
   // clear the forest from a rectangle (design coordinates)
   C2.clearRect=(x0,z0,x1,z1)=>{const a=[WX(x0),WZ(z0)],b=[WX(x1),WZ(z1)],m=new T.Matrix4(),v=new T.Vector3(),c=new T.Color();
    for(const im of root.children){if(!im.isInstancedMesh)continue;const ty=im.geometry.type;if(!(im.material===mat.trunk||ty==='IcosahedronGeometry'||ty==='ConeGeometry'))continue;
     let n=0;for(let i=0;i<im.count;i++){im.getMatrixAt(i,m);v.setFromMatrixPosition(m);if(v.x>a[0]&&v.x<b[0]&&v.z>a[1]&&v.z<b[1])continue;if(n!==i){im.setMatrixAt(n,m);if(im.instanceColor){im.getColorAt(i,c);im.setColorAt(n,c)}}n++}
     if(n!==im.count){im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere()}}};
   const gable=sh(W3.c2gable||(W3.c2gable=(()=>{const P=[-.5,0,.5,.5,0,.5,.5,1,0,-.5,0,.5,.5,1,0,-.5,1,0, .5,0,-.5,-.5,0,-.5,-.5,1,0,.5,0,-.5,-.5,1,0,.5,1,0, -.5,0,-.5,-.5,0,.5,-.5,1,0, .5,0,.5,.5,0,-.5,.5,1,0];
    const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(P,3));gg.computeVertexNormals();return gg})()));
   const bodyG=sh(W3.bodyG||(W3.bodyG=new T.BoxGeometry(1,1,1).translate(0,.5,0)));
   const cobM=mat.cobble||M(0x9a948a);
   // ---- OLD TOWN, on the east shore of the bay (its lanes are city roads: otA..otD, the quay) ----
   const[OX,OZ]=F.oldtown,town=new T.Group();root.add(town);C2.town=town;C2.clearRect(OX-110,OZ-110,OX+110,OZ+110);
   const gOut=g;g=town;
   {const sq=new T.Mesh(new T.CircleGeometry(15,28),cobM);sq.rotation.x=-Math.PI/2;sq.position.set(OX,.025,OZ);sq.receiveShadow=true;g.add(sq)}
   // fountain
   {const f=new T.Group();f.position.set(OX,0,OZ);const st=M(0xc9c3b6,{roughness:.8});const b1=new T.Mesh(new T.CylinderGeometry(3.2,3.4,.7,24),st);b1.position.y=.35;b1.castShadow=true;f.add(b1);
    const w=new T.Mesh(new T.CylinderGeometry(2.9,2.9,.1,24),M(0x4f9bd1,{roughness:.1,metalness:.2}));w.position.y=.66;f.add(w);const p=new T.Mesh(new T.CylinderGeometry(.35,.5,2.2,12),st);p.position.y=1.1;p.castShadow=true;f.add(p);
    const b2=new T.Mesh(new T.CylinderGeometry(1.2,.9,.35,16),st);b2.position.y=2.2;f.add(b2);g.add(f)}
   // clock tower on the square
   {const t=new T.Group();t.position.set(OX+11,0,OZ+9);const st=M(0xb9a88a,{roughness:.85});B0(t,5,24,5,st,0,0,0);B0(t,5.6,.6,5.6,M(0x8c7c63),0,24,0);
    const cl=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#f4efe0';x.beginPath();x.arc(64,64,60,0,7);x.fill();x.strokeStyle='#2b2b2b';x.lineWidth=5;x.stroke();
     for(let k=0;k<12;k++){const a=k*Math.PI/6;x.fillStyle='#2b2b2b';x.fillRect(64+Math.cos(a)*48-3,64+Math.sin(a)*48-3,6,6)}x.lineWidth=6;x.beginPath();x.moveTo(64,64);x.lineTo(64,30);x.moveTo(64,64);x.lineTo(90,72);x.stroke();
     const tt=new T.CanvasTexture(c);tt.colorSpace=T.SRGBColorSpace;return tt})();
    const cm=new T.MeshStandardMaterial({map:cl,emissiveMap:cl,emissive:0xffffff,emissiveIntensity:0,roughness:.6});signMats.push(cm);
    for(let k=0;k<4;k++){const a=k*Math.PI/2,p=new T.Mesh(new T.CircleGeometry(1.8,24),cm);p.position.set(Math.sin(a)*2.52,20,Math.cos(a)*2.52);p.rotation.y=a;t.add(p)}
    const rf=new T.Mesh(new T.ConeGeometry(4.2,6,4),M(0x3f5a4a,{roughness:.6,metalness:.3}));rf.rotation.y=Math.PI/4;rf.position.y=27.6;rf.castShadow=true;t.add(rf);g.add(t)}
   // townhouses along the crooked lanes (footprints from roads/layout.js CITY.town, facing their lane)
   const TB=[],TBc=[],TR=[],TRc=[],TW=[],TD=[],FAC=['#e8c9a0','#d98c6a','#f0e2c4','#b8cfd8','#e6b8b0','#c9d6a8','#f2d27a','#d4b08c','#eadfd0'],RF=['#7a3b2a','#5c3324','#8a4a2f','#4a3a35','#6b2f2a'];
   for(const t of CITY.town){if(Math.hypot(t.x-OX-11,t.z-OZ-9)<5)continue;const w=t.w,d=t.d,h=7+Math.floor(r2()*3)*2.2,ry=t.ry,x=t.x,z=t.z,y=gh(x,z),fx0=Math.sin(ry),fz0=Math.cos(ry),ax=Math.cos(ry),az=-Math.sin(ry);
    TB.push({x,y,z,ry,sx:w,sy:h,sz:d});TBc.push(FAC[Math.floor(r2()*FAC.length)]);TR.push({x,y:y+h,z,ry,sx:w+.3,sy:2.6+r2()*.8,sz:d+.6});TRc.push(RF[Math.floor(r2()*RF.length)]);
    const fx=x+fx0*(d/2+.03),fz=z+fz0*(d/2+.03);for(let f=0;f<Math.floor(h/3.3);f++)for(const q of[-1,1]){const o=q*w*.22;TW.push({x:fx+ax*o,y:y+1.2+f*3.3+(f?0:.6),z:fz+az*o,ry,sx:1,sy:1.4,sz:.12})}
    TD.push({x:fx,y,z:fz,ry,sx:1.1,sy:2.1,sz:.14})}
   instG(g,bodyG,M(0xffffff,{roughness:.85}),TB,TBc);instG(g,gable,M(0xffffff,{roughness:.7,flatShading:true}),TR,TRc);instG(g,bodyG,mat.win,TW,null,false);instG(g,bodyG,M(0x5a3a26),TD,null,false);
   g=gOut;
   // ---- SHOPPING STREET: shops and restaurants on the ground floors along the west avenue ----
   const SHOP=[['CAFÉ','#6b3f2a'],['PIZZA','#c62828'],['BAKERY','#c58b2a'],['DINER','#1f6fb8'],['FLOWERS','#2e8b57'],['BOOKS','#4a3a7a'],['NOODLES','#d9822b'],['PHARMACY','#2e7d4f'],['BURGERS','#b5272d'],['ICE CREAM','#e86a9a'],['SUSHI','#22252b']];
   const AW=[],AWc=[],SW=[];let n=0,sx=0,sz=0;
   for(const f of CITY.fill){if(f.road!=='west'||(f.k!=='flat'&&f.k!=='mid'))continue;const x=f.x/10,z=f.y/10;if(x<-70||x>90)continue;const w=f.w/10,d=f.h/10,ry=f.ry,fs=Math.sin(ry),fc=Math.cos(ry),[nm,col]=SHOP[n%SHOP.length];n++;sx+=x;sz+=z;
    const fx=x+fs*(d/2),fz=z+fc*(d/2);SW.push({x:fx+fs*.04,y:.5,z:fz+fc*.04,ry,sx:w*.8,sy:2.4,sz:.1});AW.push({x:fx+fs*.9,y:3.2,z:fz+fc*.9,ry,sx:w*.92,sy:.18,sz:1.8});AWc.push(col);
    g.add(sign(nm,Math.min(w*.7,7),1.1,col,'#ffffff',fx+fs*.12,4.2,fz+fc*.12,ry))}
   instG(g,bodyG,mat.win,SW,null,false);instG(g,bodyG,M(0xffffff,{roughness:.7}),AW,AWc);
   if(n)W3.labels.push({t:'SHOPPING STREET',x:sx/n,z:sz/n,y:12});
   warp(g)}
