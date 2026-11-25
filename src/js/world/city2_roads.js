//@ world/city2_roads.js - phase 1 roads: STOP signs and stop lines where the side roads meet the ring road and the
//@ avenue, zebra crossings there, solid edge lines, on-street parking along the avenue, bus stops on the ring.
//@ inside the if(WORLD){ block of world/world3d.js (uses its RING, AVE, along(), instG(), warp() ...). Off with ?city=1.
  if(CITY2){const g=new T.Group();root.add(g);const C2=W3.c2={pts:[]};
   // own random sequence, so the rest of the city (and every interior) keeps its numbers
   let s2=4242;const r2=C2.rnd=()=>{s2=(s2*16807)%2147483647;return s2/2147483647};
   // junctions where a side road meets a main road: [x, z, dx, dz (direction of travel into the junction), main road half width]
   const JN=[[96,-34,0,-1,4]];
   for(const x of conN){JN.push([x,-34,0,-1,4],[x,-34,0,1,4],[x,-150,0,-1,3.5])}
   for(const x of conS)JN.push([x,174,0,1,4]);
   for(const z of conEW){JN.push([-30,z,-1,0,4],[222,z,1,0,4])}
   const SP=[],SG=[],SL=[],ZB=[];
   for(const[x,z,dx,dz,hw]of JN){const rx=-dz,rz=dx,ry=Math.atan2(-dx,-dz);
    // STOP sign on the right, facing the cars that arrive
    const sx=x-dx*(hw+1.6)+rx*3.7,sz=z-dz*(hw+1.6)+rz*3.7;SP.push({x:sx,y:0,z:sz});SG.push({x:sx,y:2.15,z:sz,ry});C2.pts.push([sx,sz]);
    // stop line across the right lane and a zebra crossing just before it
    SL.push({x:x-dx*(hw+.55)+rx*1.5,y:.036,z:z-dz*(hw+.55)+rz*1.5,ry,sx:2.9,sz:.4});
    for(let k=-2.4;k<=2.41;k+=.8)ZB.push({x:x-dx*(hw+2.7)+rx*k,y:.034,z:z-dz*(hw+2.7)+rz*k,ry,sx:.45,sz:1.7})}
   const stopTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.translate(64,64);x.beginPath();for(let k=0;k<8;k++){const a=(k+.5)*Math.PI/4;x.lineTo(Math.cos(a)*62,Math.sin(a)*62)}x.closePath();x.fillStyle='#ffffff';x.fill();
    x.beginPath();for(let k=0;k<8;k++){const a=(k+.5)*Math.PI/4;x.lineTo(Math.cos(a)*55,Math.sin(a)*55)}x.closePath();x.fillStyle='#c8102e';x.fill();x.fillStyle='#fff';x.font="800 34px 'Barlow Condensed','Arial Narrow',sans-serif";x.textAlign='center';x.textBaseline='middle';x.fillText('STOP',0,2);
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t})();
   instG(g,sh(new T.CylinderGeometry(.05,.05,2.2,6).translate(0,1.1,0)),mat.grey,SP);
   const sgm=new T.MeshStandardMaterial({map:stopTex,alphaTest:.5,side:T.DoubleSide,roughness:.6});signMats.push(sgm);instG(g,sh(new T.PlaneGeometry(.75,.75)),sgm,SG,null,false);
   const flat=sh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2));instG(g,flat,mat.dash,SL,null,false);instG(g,flat,mat.dash,ZB,null,false);
   // solid white edge lines on the ring road and the avenue (broken where a side road joins)
   const EL=[],near=(x,z)=>JN.some(j=>Math.abs(x-j[0])<j[4]+4&&Math.abs(z-j[1])<j[4]+4);
   for(const o of[-3.55,3.55])along(RING,2,o,(x,z,a)=>{if(!near(x,z))EL.push({x,y:.03,z,ry:a,sx:.14,sz:4.2})},true);
   for(const o of[-3.1,3.1])along(AVE,2,o,(x,z,a)=>{if(!near(x,z))EL.push({x,y:.03,z,ry:a,sx:.14,sz:2})});
   instG(g,flat,mat.dash,EL,null,false);
   // on-street parking along the avenue: painted bays and parked cars (simple shapes, one draw call per part)
   const BY=[],PC=[],PCc=[],PG=[];let k=0;
   for(const s of[-1,1])along(AVE,6,s*4.75,(x,z,a)=>{if(x<-140||x>330||near(x,z)||Math.abs(x-53)<9||Math.abs(x-139)<9)return;BY.push({x,y:.03,z,ry:a,sx:2.3,sz:.12});
    if(r2()<.62){const ry=a+(r2()<.5?0:Math.PI);PC.push({x,y:.05,z,ry,sx:1.9,sy:.85,sz:4.2});PCc.push(CCOL[k++%CCOL.length]);PG.push({x,y:.85,z,ry,sx:1.7,sy:.62,sz:2.2});C2.pts.push([x,z])}});
   const bodyG=sh(W3.bodyG||(W3.bodyG=new T.BoxGeometry(1,1,1).translate(0,.5,0)));
   instG(g,flat,mat.dash,BY,null,false);instG(g,bodyG,M(0xffffff,{roughness:.35,metalness:.3}),PC,PCc);instG(g,bodyG,mat.carGlass,PG,null,false);
   // bus stops on the ring road (line 2)
   {const shM=M(0x2b3038,{metalness:.5,roughness:.4}),glM=M(0x9fc8e8,{roughness:.05,metalness:.3,transparent:true,opacity:.45});const rp=mkPath(RING,true),o={};
    for(const u of[.08,.33,.58,.83]){atPath(rp,u*rp.len,5.6,o);const b=new T.Group();b.position.set(o.x,0,o.z);b.rotation.y=o.ry+Math.PI/2;
     B0(b,3.4,.1,1.3,shM,0,2.3,0);B0(b,3.4,2,.05,glM,0,.3,-.6,false);for(const q of[-1,1])B0(b,.09,2.3,.09,shM,q*1.65,0,-.6);B0(b,2.8,.12,.45,M(0x7a5a3a),0,.6,-.3);B0(b,3.6,.08,1.8,mat.pad,0,0,0,false);
     b.add(sign('BUS 2',1.1,.42,'#2f6fd9','#ffffff',2.1,2.2,0,0));g.add(b);C2.pts.push([o.x,o.z])}}
   warp(g);
   // keep the forest clear of the new street furniture
   C2.clear=(pts,r)=>{const P=pts.map(([x,z])=>[WX(x),WZ(z)]),m=new T.Matrix4(),v=new T.Vector3();
    for(const im of root.children){if(!im.isInstancedMesh||im.parent!==root)continue;const ty=im.geometry.type;if(!(im.material===mat.trunk||ty==='IcosahedronGeometry'||ty==='ConeGeometry'))continue;
     let n=0;for(let i=0;i<im.count;i++){im.getMatrixAt(i,m);v.setFromMatrixPosition(m);if(P.some(p=>Math.abs(p[0]-v.x)<r&&Math.abs(p[1]-v.z)<r))continue;if(n!==i)im.setMatrixAt(n,m);if(im.instanceColor&&n!==i){const c=new T.Color();im.getColorAt(i,c);im.setColorAt(n,c)}n++}
     if(n!==im.count){im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere()}}};
   C2.clear(C2.pts,3)}
