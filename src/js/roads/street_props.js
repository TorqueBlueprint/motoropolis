//@ roads/street_props.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // trees, lamps, traffic lights
 {const tr=[],lf=[],lc=[];for(let k=0;k<(WORLD?0:560);k++){const x=CX+(rnd()-.5)*420,z=CZ+(rnd()-.5)*300;if(x>XS3[0]-H3-3&&x<XS3[NX-1]+H3+3&&z>YS3[0]-H3-3&&z<YS3[NY-1]+H3+3)continue;const s=.8+rnd()*.9;
   tr.push([x,.7*s,z,0,0,0,s]);lf.push([x,2.1*s,z,rnd(),rnd(),0,s]);lc.push(['#4f8a3c','#3f7a34','#5c9445','#467f38'][Math.floor(rnd()*4)])}
  inst(new T.CylinderGeometry(.18,.25,1.4,6),mat.trunk,tr,true);inst(new T.IcosahedronGeometry(1.25,0),M(0xffffff),lf,true,lc)}
 const lampPos=[];if(!WORLD){const poles=[],heads=[];for(let i=0;i<NX-1;i++)for(const z of YS3)for(let x=XS3[i]+9;x<XS3[i+1]-5;x+=14)for(const s of[-1,1]){const px=x+(s>0?7:0);if(px>XS3[i+1]-H3-3)continue;poles.push([px,2,z+s*(H3+.8),0,0,0,1]);heads.push([px,4.05,z+s*(H3+.35)]);lampPos.push([px,3.7,z+s*(H3+.2)])}
  inst(new T.BoxGeometry(.16,4,.16),mat.dark,poles,true);inst(new T.BoxGeometry(.65,.22,.42),mat.lamp,heads,false)}
 else{// Phase 1B: street lamps along the town roads (both sides, staggered), as two instanced meshes
  const poles=[],heads=[];const gh=CITY.h,P0=CITY.P0;for(const e of CITY.edges){if(e.k==='hwy')continue;let acc=0,side=1;const na=CITY.nodes[e.a],nb=CITY.nodes[e.b],ca=(na.round?na.round+10:e.w+4),cb=(nb.round?nb.round+10:e.w+4);
   for(let i=1;i<e.P.length;i++){const a=e.P[i-1],b=e.P[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!l)continue;const tx=(b[0]-a[0])/l,tz=(b[1]-a[1])/l;let t=(e.k==='lane'?16:20)-acc%(e.k==='lane'?16:20);
    for(;t<l;t+=e.k==='lane'?16:20){const s2=acc+t;if(s2<ca||s2>e.len-cb)continue;const x0=a[0]+tx*t,z0=a[1]+tz*t;if(!CITY.districts.some(d=>d.id!=='farms'&&Math.hypot(x0-d.x,z0-d.z)<d.r+30)&&Math.hypot(x0-P0.x,z0-P0.z)>330)continue;
     if(CITY.bridges.some(q=>Math.abs(x0-q.x)<q.w&&Math.abs(z0-q.zc)<q.half+2))continue;side=-side;const o=e.w/2+1.4,x=x0-tz*o*side,z=z0+tx*o*side,y=gh(x,z);if(CITY.roadD(x,z)<.6)continue;
     poles.push([x,y+2,z,0,0,0,1]);heads.push([x+tz*side*.45,y+4.05,z-tx*side*.45]);lampPos.push([x,y+3.7,z])}acc+=l}}
  inst(new T.BoxGeometry(.16,4,.16),mat.dark,poles,true);inst(new T.BoxGeometry(.65,.22,.42),mat.lamp,heads,false);
  lampPos.sort((p,q)=>Math.hypot(p[0]-P0.x,p[2]-P0.z)-Math.hypot(q[0]-P0.x,q[2]-P0.z));lampPos.length=Math.min(lampPos.length,64)}
 const pls=[];for(let k=0;k<8;k++){const p=lampPos[Math.floor((k+.5)*lampPos.length/8)];const pl=new T.PointLight(0xffc77a,0,22,1.5);pl.position.set(p[0],p[1],p[2]);scene.add(pl);pls.push(pl)}
 const W3P={poles:[]};const tls=[];
 // Phase 1B: a signal head for every road arriving at a lit junction, at the right-hand kerb before the stop line
 const tlSpots=[];if(WORLD)nodes.forEach((n,ni)=>{if(!n.light)return;for(const m of n.nb){const sp=stopPt(m,ni),t=edgeTan(ni,m),e=EDGE(m,ni),o=(e.w/2-e.lane+12)/10;
  // cars arrive travelling along -t (t = the road leaving the junction toward m); the right of (dx,dy) is (-dy,dx)
  const dx=-t.x,dy=-t.y,rx=-dy,ry=dx,X2=U(sp.x)+rx*o,Z2=U(sp.y)+ry*o;tlSpots.push({n,ax:n.ax[m]||'h',x:X2,z:Z2,ry:Math.atan2(-dx,-dy)})}});
 if(WORLD&&X&&X.tlight){const TL=X.tlight,K=.95,lens=new T.SphereGeometry(.085,10,8),TLM=[];W3P.poles=[];
  for(const q of tlSpots){W3P.poles.push([q.x,q.z]);const g=new T.Group();const L={};
   for(const[k,y]of[['r',3.30],['y',3.04],['g',2.80]]){const l=new T.Mesh(lens,k==='r'?mat.tlR:k==='y'?mat.tlY:mat.tlG);l.position.set(TL.hx,y,TL.front+.02);l.visible=false;l.userData.nm=1;g.add(l);L[k]=l}
   g.scale.setScalar(K);g.rotation.y=q.ry;g.position.set(q.x,0,q.z);g.updateMatrix();TLM.push(g.matrix.clone());scene.add(g);tls.push({n:q.n,ax:q.ax,L})}
  // the pole bodies: one InstancedMesh instead of one mesh per signal head (same model, material and shadows)
  {const im=new T.InstancedMesh(TL.g,TL.m,Math.max(1,TLM.length));TLM.forEach((m,i)=>im.setMatrixAt(i,m));im.count=TLM.length;im.castShadow=true;im.userData.tf=1;im.computeBoundingSphere();scene.add(im)}}
 else if(WORLD)for(const q of tlSpots){scene.add(box(.16,3.2,.16,mat.dark,q.x,0,q.z));const hh=new T.Mesh(new T.SphereGeometry(.26,10,8),mat.tlG);hh.position.set(q.x+Math.sin(q.ry)*.2,3.15,q.z+Math.cos(q.ry)*.2);hh.userData.nm=1;scene.add(hh);tls.push({n:q.n,ax:q.ax,h1:hh})}
 else if(!WORLD)for(const n of nodes){if(!n.light)continue;const x=U(n.x)+H3+.5,z=U(n.y)+H3+.5;scene.add(box(.16,3.2,.16,mat.dark,x,0,z));
  const hh=new T.Mesh(new T.SphereGeometry(.26,10,8),mat.tlG);hh.position.set(x-.05,3.15,z-.25);scene.add(hh);const hv=new T.Mesh(new T.SphereGeometry(.26,10,8),mat.tlG);hv.position.set(x-.25,2.55,z-.05);scene.add(hv);
  scene.add(box(.5,1.6,.5,mat.black,x-.05,2.2,z-.05,false));hh.userData.nm=1;hv.userData.nm=1;tls.push({n,hh,hv})}
