//@ world/city2_roads.js - phase 1 roads, on the Phase 1B organic layout: STOP signs and stop lines where a smaller road
//@ meets a bigger one, zebra crossings at every junction and roundabout entry (under the walkers' path), solid edge lines on the main roads, on-street parking on the shopping street,
//@ bus stops (line 2). inside the if(WORLD){ block of world/world3d.js (uses along(), instG(), sign() ...). Off with ?city=1.
  if(CITY2){const g=new T.Group();root.add(g);const C2=W3.c2={pts:[]},gh=CITY.h;
   // own random sequence, so the rest of the city (and every interior) keeps its numbers
   let s2=4242;const r2=C2.rnd=()=>{s2=(s2*16807)%2147483647;return s2/2147483647};
   // junctions where a smaller road meets a bigger one (no lights, no roundabout): [x, z, dx, dz (travel into the junction), half width, the road's lane]
   // road paint lies on the asphalt (which uses polygon offset -3, roads/ground3d.js): pull it a bit further so it always shows
   const dashPO=mat.dash.clone();dashPO.polygonOffset=true;dashPO.polygonOffsetFactor=-5;dashPO.polygonOffsetUnits=-10;
   const JN=[];
   CITY.nodes.forEach((n,ni)=>{if(n.round||n.edges.length<3||nodes[ni].light)return;let wmax=0;for(const ei of n.edges)wmax=Math.max(wmax,CITY.edges[ei].w);
    for(const m of nodes[ni].nb){const e=EDGE(m,ni);if(e.w>=wmax*10-1)continue;const sp=stopPt(m,ni),t=edgeTan(ni,m);JN.push([U(sp.x),U(sp.y),-t.x,-t.y,e.w/20,e.lane/10])}});
   const SP=[],SG=[],SL=[],ZB=[];
   for(const[x0,z0,dx,dz,hw,ln]of JN){const rx=-dz,rz=dx,ry=Math.atan2(-dx,-dz);const cx=x0-rx*ln,cz=z0-rz*ln,y=gh(cx,cz);
    // STOP sign on the right, facing the cars that arrive
    const sx=cx+rx*(hw+.9),sz=cz+rz*(hw+.9);SP.push({x:sx,y,z:sz});SG.push({x:sx,y:y+2.15,z:sz,ry});C2.pts.push([sx,sz]);
    // stop line across the right lane and a zebra crossing just before it
    SL.push({x:cx+rx*hw/2,y:y+.036,z:cz+rz*hw/2,ry,sx:hw-.2,sz:.4});
}
   const stopTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.translate(64,64);x.beginPath();for(let k=0;k<8;k++){const a=(k+.5)*Math.PI/4;x.lineTo(Math.cos(a)*62,Math.sin(a)*62)}x.closePath();x.fillStyle='#ffffff';x.fill();
    x.beginPath();for(let k=0;k<8;k++){const a=(k+.5)*Math.PI/4;x.lineTo(Math.cos(a)*55,Math.sin(a)*55)}x.closePath();x.fillStyle='#c8102e';x.fill();x.fillStyle='#fff';x.font="800 34px 'Barlow Condensed','Arial Narrow',sans-serif";x.textAlign='center';x.textBaseline='middle';x.fillText('STOP',0,2);
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t})();
   instG(g,sh(new T.CylinderGeometry(.05,.05,2.2,6).translate(0,1.1,0)),mat.grey,SP);
   const sgm=new T.MeshStandardMaterial({map:stopTex,alphaTest:.5,side:T.DoubleSide,roughness:.6});signMats.push(sgm);instG(g,sh(new T.PlaneGeometry(.75,.75)),sgm,SG,null,false);
   // zebra crossings on every road at every junction and roundabout, where the walkers cross (people/walkers.js walks an
   // arc round the node at about hypot(trim, kerb offset) from its centre, so the stripes sit right under their path)
   CITY.nodes.forEach(n=>{if(!n.round&&n.edges.length<3)return;for(const ei of n.edges){const e=CITY.edges[ei];if(e.k==='hwy')continue;
    const r=n.round?Math.hypot(n.round+11,e.w/2+1.1):Math.hypot(e.w/2+3.5,e.w/2+(e.road==='west'?2:1.1));
    const P=e.a===CITY.nodes.indexOf(n)?e.P:e.P.slice().reverse();let acc=0,pt=null;
    for(let i=1;i<P.length&&!pt;i++){const a=P[i-1],b=P[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(acc+l>=r){const t=(r-acc)/l;pt=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,(b[0]-a[0])/l,(b[1]-a[1])/l]}acc+=l}
    if(!pt||CITY.bridges.some(q=>Math.abs(pt[0]-q.x)<q.w&&Math.abs(pt[1]-q.zc)<q.half))continue;
    const[x0,z0,dx,dz]=pt,rx=-dz,rz=dx,ry=Math.atan2(dx,dz),hw=e.w/2,y=gh(x0,z0);
    for(let k=-hw+.4;k<=hw-.39;k+=.8)ZB.push({x:x0+rx*k,y:y+.04,z:z0+rz*k,ry,sx:.45,sz:2.2})}});
   const flat=sh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2));instG(g,flat,dashPO,SL,null,false);instG(g,flat,dashPO,ZB,null,false);
   // solid white edge lines on the main roads (broken at the junctions and on the bridges)
   const EL=[];
   for(const e of CITY.edges){if(e.k!=='main')continue;const na=CITY.nodes[e.a],nb=CITY.nodes[e.b],ca=na.round?na.round+8:na.edges.length>2?e.w+3:0,cb=nb.round?nb.round+8:nb.edges.length>2?e.w+3:0;let s=0;
    for(const o of[-(e.w/2-.45),e.w/2-.45]){s=0;along(e.P,2,o,(x,z,a)=>{s+=2;if(s<ca||s>e.len-cb)return;if(CITY.bridges.some(q=>Math.abs(x-q.x)<q.w&&Math.abs(z-q.zc)<q.half))return;EL.push({x,y:gh(x,z)+.03,z,ry:a,sx:.14,sz:2.1})})}}
   instG(g,flat,dashPO,EL,null,false);
   // on-street parking on the shopping street (the west avenue between the plaza and the old town): painted bays and parked cars
   const BY=[],PC=[],PCc=[],PG=[];let k=0;
   {const w=CITY.roads.find(r=>r.id==='west');for(const s of[-1,1])along(w.P,6,s*(w.w/2+.2),(x,z,a)=>{if(x<-60||x>80||buildings.some(b=>inLotB(b,x*10,z*10,30)))return;if(JN.some(j=>Math.hypot(x-j[0],z-j[1])<12)||CITY.nodes.some(n=>n.edges.length>2&&Math.hypot(x-n.x,z-n.z)<12))return;
     BY.push({x,y:.03,z,ry:a,sx:2.3,sy:.1,sz:.12});if(r2()<.62){const ry=a+(r2()<.5?0:Math.PI);PC.push({x,y:.05,z,ry,sx:1.9,sy:.85,sz:4.2});PCc.push(CCOL[k++%CCOL.length]);PG.push({x,y:.85,z,ry,sx:1.7,sy:.62,sz:2.2});C2.pts.push([x,z])}})}
   const bodyG=sh(W3.bodyG||(W3.bodyG=new T.BoxGeometry(1,1,1).translate(0,.5,0)));
   instG(g,flat,dashPO,BY,null,false);
   // parked cars: the city's own car models (the same licensed models as the traffic), boxes only if the models aren't there
   if(AMBK.length){PC.forEach((q,i)=>{const m=AMBK[Math.floor(r2()*AMBK.length)],c=glbCar({len:m.len,color:m.taxi?'#f2b81d':PCc[i]},m.glb);c.scale.multiplyScalar(1.25);c.position.set(q.x,gh(q.x,q.z),q.z);c.rotation.y=q.ry;g.add(c)})}
   else{instG(g,bodyG,M(0xffffff,{roughness:.35,metalness:.3}),PC,PCc);instG(g,bodyG,mat.carGlass,PG,null,false)}
   // bus stops (line 2) on the avenues out of the plaza
   {const shM=M(0x2b3038,{metalness:.5,roughness:.4}),glM=M(0x9fc8e8,{roughness:.05,metalness:.3,transparent:true,opacity:.45}),o={};
    for(const[id,u]of[['west',.35],['east',.5],['south',.18],['se',.22],['north',.12]]){const r=CITY.roads.find(q=>q.id===id),rp=mkPath(r.P,false);atPath(rp,u*rp.len,r.w/2+2.6,o);if(CITY.roadD(o.x,o.z)<.8)continue;const b=new T.Group();b.position.set(o.x,gh(o.x,o.z),o.z);b.rotation.y=o.ry+Math.PI/2;
     B0(b,3.4,.1,1.3,shM,0,2.3,0);B0(b,3.4,2,.05,glM,0,.3,-.6,false);for(const q of[-1,1])B0(b,.09,2.3,.09,shM,q*1.65,0,-.6);B0(b,2.8,.12,.45,M(0x7a5a3a),0,.6,-.3);B0(b,3.6,.08,1.8,mat.pad,0,0,0,false);
     b.add(sign('BUS 2',1.1,.42,'#2f6fd9','#ffffff',2.1,2.2,0,0));g.add(b);C2.pts.push([o.x,o.z])}}
   warp(g);
   // keep the forest clear of the new street furniture
   C2.clear=(pts,r)=>{const P=pts.map(([x,z])=>[WX(x),WZ(z)]),m=new T.Matrix4(),v=new T.Vector3();
    for(const im of root.children){if(!im.isInstancedMesh||im.parent!==root)continue;const ty=im.geometry.type;if(!(im.material===mat.trunk||ty==='IcosahedronGeometry'||ty==='ConeGeometry'))continue;
     let n=0;for(let i=0;i<im.count;i++){im.getMatrixAt(i,m);v.setFromMatrixPosition(m);if(P.some(p=>Math.abs(p[0]-v.x)<r&&Math.abs(p[1]-v.z)<r))continue;if(n!==i)im.setMatrixAt(n,m);if(im.instanceColor&&n!==i){const c=new T.Color();im.getColorAt(i,c);im.setColorAt(n,c)}n++}
     if(n!==im.count){im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere()}}};
   C2.clear(C2.pts,3)}
