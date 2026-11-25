//@ world/city2_zones.js - phase 1 zones: the Old Town (cobbled streets, a square with a fountain and a clock tower,
//@ narrow gabled townhouses), a shopping street with shops and restaurants on the avenue, zone names on the map.
//@ inside the if(WORLD){ block of world/world3d.js, after world/city2_roads.js. Off with ?city=1.
  if(CITY2){const C2=W3.c2,r2=C2.rnd;let g=new T.Group();root.add(g);
   // clear the forest from a rectangle (design coordinates)
   C2.clearRect=(x0,z0,x1,z1)=>{const a=[WX(x0),WZ(z0)],b=[WX(x1),WZ(z1)],m=new T.Matrix4(),v=new T.Vector3(),c=new T.Color();
    for(const im of root.children){if(!im.isInstancedMesh)continue;const ty=im.geometry.type;if(!(im.material===mat.trunk||ty==='IcosahedronGeometry'||ty==='ConeGeometry'))continue;
     let n=0;for(let i=0;i<im.count;i++){im.getMatrixAt(i,m);v.setFromMatrixPosition(m);if(v.x>a[0]&&v.x<b[0]&&v.z>a[1]&&v.z<b[1])continue;if(n!==i){im.setMatrixAt(n,m);if(im.instanceColor){im.getColorAt(i,c);im.setColorAt(n,c)}}n++}
     if(n!==im.count){im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere()}}};
   const gable=sh(W3.c2gable||(W3.c2gable=(()=>{const P=[-.5,0,.5,.5,0,.5,.5,1,0,-.5,0,.5,.5,1,0,-.5,1,0, .5,0,-.5,-.5,0,-.5,-.5,1,0,.5,0,-.5,-.5,1,0,.5,1,0, -.5,0,-.5,-.5,0,.5,-.5,1,0, .5,0,.5,.5,0,-.5,.5,1,0];
    const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(P,3));gg.computeVertexNormals();return gg})()));
   const bodyG=sh(W3.bodyG||(W3.bodyG=new T.BoxGeometry(1,1,1).translate(0,.5,0)));
   const cobble=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#6f6a63';x.fillRect(0,0,256,256);
    for(let j=0;j<32;j++)for(let i=0;i<32;i++){const o=(j%2)*4;const v=150+Math.floor(r2()*50);x.fillStyle=`rgb(${v},${v-8},${v-18})`;x.beginPath();x.ellipse(i*8+o+4,j*8+4,3.4,3.1,0,0,Math.PI*2);x.fill()}
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(4,4);t.anisotropy=8;return t})();
   const cobM=M(0xffffff,{map:cobble,roughness:.9});
   // ---- OLD TOWN, west of the ring road ----
   // built as one anchored unit: warp() only moves it to where the ring road's z=110 junction ends up, it is not stretched
   const OX=-88,OZ=145,town=unit(root,OX,110);C2.town=town;C2.clearRect(-132,74,-40,214);{const dz=WZ(110)-110;C2.clearRect(-132,74+dz-30,-40,214+dz)}
   const gOut=g;g=town;
   ribbon(vline(OX,72,212),6,.02,cobM,false,g);for(const z of[120,170])ribbon(hline(z,-128,-44),5,.021,cobM,false,g);ribbon(hline(110,-31,-44),6,.02,mat.asphalt,false,g);ribbon(vline(-44,107,173),5,.022,cobM,false,g);
   {const sq=new T.Mesh(new T.PlaneGeometry(34,24),cobM);sq.rotation.x=-Math.PI/2;sq.position.set(OX,.025,OZ);sq.receiveShadow=true;g.add(sq)}
   // fountain
   {const f=new T.Group();f.position.set(OX,0,OZ+3);const st=M(0xc9c3b6,{roughness:.8});const b1=new T.Mesh(new T.CylinderGeometry(3.2,3.4,.7,24),st);b1.position.y=.35;b1.castShadow=true;f.add(b1);
    const w=new T.Mesh(new T.CylinderGeometry(2.9,2.9,.1,24),M(0x4f9bd1,{roughness:.1,metalness:.2}));w.position.y=.66;f.add(w);const p=new T.Mesh(new T.CylinderGeometry(.35,.5,2.2,12),st);p.position.y=1.1;p.castShadow=true;f.add(p);
    const b2=new T.Mesh(new T.CylinderGeometry(1.2,.9,.35,16),st);b2.position.y=2.2;f.add(b2);g.add(f)}
   // clock tower on the east side of the square
   {const t=new T.Group();t.position.set(OX+15,0,OZ-8);const st=M(0xb9a88a,{roughness:.85});B0(t,5,24,5,st,0,0,0);B0(t,5.6,.6,5.6,M(0x8c7c63),0,24,0);
    const cl=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#f4efe0';x.beginPath();x.arc(64,64,60,0,7);x.fill();x.strokeStyle='#2b2b2b';x.lineWidth=5;x.stroke();
     for(let k=0;k<12;k++){const a=k*Math.PI/6;x.fillStyle='#2b2b2b';x.fillRect(64+Math.cos(a)*48-3,64+Math.sin(a)*48-3,6,6)}x.lineWidth=6;x.beginPath();x.moveTo(64,64);x.lineTo(64,30);x.moveTo(64,64);x.lineTo(90,72);x.stroke();
     const tt=new T.CanvasTexture(c);tt.colorSpace=T.SRGBColorSpace;return tt})();
    const cm=new T.MeshStandardMaterial({map:cl,emissiveMap:cl,emissive:0xffffff,emissiveIntensity:0,roughness:.6});signMats.push(cm);
    for(let k=0;k<4;k++){const a=k*Math.PI/2,p=new T.Mesh(new T.CircleGeometry(1.8,24),cm);p.position.set(Math.sin(a)*2.52,20,Math.cos(a)*2.52);p.rotation.y=a;t.add(p)}
    const rf=new T.Mesh(new T.ConeGeometry(4.2,6,4),M(0x3f5a4a,{roughness:.6,metalness:.3}));rf.rotation.y=Math.PI/4;rf.position.y=27.6;rf.castShadow=true;t.add(rf);g.add(t)}
   // townhouses along the cobbled streets
   const TB=[],TBc=[],TR=[],TRc=[],TW=[],TD=[],FAC=['#e8c9a0','#d98c6a','#f0e2c4','#b8cfd8','#e6b8b0','#c9d6a8','#f2d27a','#d4b08c','#eadfd0'],RF=['#7a3b2a','#5c3324','#8a4a2f','#4a3a35','#6b2f2a'];
   const row=(ax,az,dx,dz,len,side)=>{let s=0;while(s<len){const w=4.4+r2()*1.6,d=8,h=7+Math.floor(r2()*3)*2.2;const cx=ax+dx*(s+w/2),cz=az+dz*(s+w/2);const nx=-dz*side,nz=dx*side;
     const x=cx+nx*(d/2+3.6),z=cz+nz*(d/2+3.6),ry=Math.atan2(dx,dz)+Math.PI/2;TB.push({x,y:0,z,ry,sx:w,sy:h,sz:d});TBc.push(FAC[Math.floor(r2()*FAC.length)]);TR.push({x,y:h,z,ry,sx:w+.3,sy:2.6+r2()*.8,sz:d+.6});TRc.push(RF[Math.floor(r2()*RF.length)]);
     const fx=x-nx*(d/2+.03),fz=z-nz*(d/2+.03);for(let f=0;f<Math.floor(h/3.3);f++)for(const q of[-1,1]){const o=q*w*.22;TW.push({x:fx+dx*o,y:1.2+f*3.3+(f?0:.6),z:fz+dz*o,ry,sx:1,sy:1.4,sz:.12})}
     TD.push({x:fx,y:0,z:fz,ry,sx:1.1,sy:2.1,sz:.14});s+=w+.15}};
   for(const side of[-1,1]){row(-126,120,1,0,30,side);row(-75,120,1,0,28,side);row(-126,170,1,0,30,side);row(-75,170,1,0,28,side)}
   row(OX,74,0,1,32,1);row(OX,74,0,1,32,-1);row(OX,184,0,1,26,1);row(OX,184,0,1,26,-1);
   instG(g,bodyG,M(0xffffff,{roughness:.85}),TB,TBc);instG(g,gable,M(0xffffff,{roughness:.7,flatShading:true}),TR,TRc);instG(g,bodyG,mat.win,TW,null,false);instG(g,bodyG,M(0x5a3a26),TD,null,false);
   g=gOut;warp(town);W3.labels.push({t:'OLD TOWN',x:OX,z:OZ+(WZ(110)-110)-(WZ(OZ)-OZ),y:30});
   // ---- SHOPPING STREET: shops and restaurants facing the avenue ----
   const aveZ=x=>{let best=AVE[0];for(const p of AVE)if(Math.abs(p[0]-x)<Math.abs(best[0]-x))best=p;return best[1]};
   const SHOP=[['CAFÉ','#6b3f2a'],['PIZZA','#c62828'],['BAKERY','#c58b2a'],['DINER','#1f6fb8'],['FLOWERS','#2e8b57'],['BOOKS','#4a3a7a'],['NOODLES','#d9822b'],['PHARMACY','#2e7d4f'],['BURGERS','#b5272d'],['ICE CREAM','#e86a9a'],['SUSHI','#22252b']];
   C2.clearRect(-75,-176,45,-154);
   const AW=[],AWc=[],SW=[];let n=0;
   for(const x0 of[-70,-61,-52,-41,-10,-1,8,17,26,35]){const z=aveZ(x0)-13,w=8.4,d=8,h=4.6+(n%3)*1.4,[nm,col]=SHOP[n%SHOP.length];n++;
    B0(g,w,h,d,M(['#efe6d6','#e3d3bf','#d8dde3','#f0dcc8'][n%4],{roughness:.85}),x0,0,z);B0(g,w+.3,.4,d+.3,mat.roofD,x0,h,z);
    SW.push({x:x0,y:.5,z:z+d/2+.04,sx:w*.8,sy:2.4,sz:.1});AW.push({x:x0,y:3.2,z:z+d/2+.9,sx:w*.92,sy:.18,sz:1.8});AWc.push(col);
    g.add(sign(nm,w*.7,1.1,col,'#ffffff',x0,h-.9,z+d/2+.08,0))}
   instG(g,bodyG,mat.win,SW,null,false);instG(g,bodyG,M(0xffffff,{roughness:.7}),AW,AWc);
   {const pv=new T.Mesh(new T.PlaneGeometry(118,3.4),mat.pad);pv.rotation.x=-Math.PI/2;pv.position.set(-17,.03,aveZ(-17)-7.4);pv.receiveShadow=true;g.add(pv)}
   W3.labels.push({t:'SHOPPING STREET',x:-17,z:aveZ(-17)-14,y:12});
   warp(g);
   // ---- AUTOMOTIVE ZONE: the repair shop, tire shop, parts and the dealership in the city centre ----
   {const L=['oficina','pneus','pecas','stand'].map(k=>LOT[k]).filter(Boolean);if(L.length){const x=L.reduce((a,l)=>a+l.x0+l.w/2,0)/L.length,z=L.reduce((a,l)=>a+l.z0+l.d/2,0)/L.length;W3.labels.push({t:'AUTOMOTIVE ZONE',x,z,y:16,core:true})}}
   W3.labels.push({t:'RESIDENTIAL',x:50,z:300,y:12})}
