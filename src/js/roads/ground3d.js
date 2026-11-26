//@ roads/ground3d.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ground & roads
 if(!WORLD){ {const gr=new T.Mesh(new T.PlaneGeometry(WORLD?2400:700,WORLD?1800:500),mat.grass);gr.rotation.x=-Math.PI/2;gr.position.set(CX,-.02,CZ);gr.receiveShadow=true;scene.add(gr);
  const rx0=XS3[0]-H3,rx1=XS3[NX-1]+H3,rz0=YS3[0]-H3,rz1=YS3[NY-1]+H3;
  for(const z of YS3){const r=new T.Mesh(new T.PlaneGeometry(rx1-rx0,H3*2),mat.asphalt);r.rotation.x=-Math.PI/2;r.position.set(CX,.01,z);r.receiveShadow=true;scene.add(r)}
  for(const x of XS3){if(XS3.indexOf(x)===CANAL_I)continue;const r=new T.Mesh(new T.PlaneGeometry(H3*2,rz1-rz0),mat.asphalt);r.rotation.x=-Math.PI/2;r.position.set(x,.012,(rz0+rz1)/2);r.receiveShadow=true;scene.add(r)}
  const dash=[],dashV=[],cw=[];
  for(const z of YS3)for(let i=0;i<NX-1;i++)for(let x=XS3[i]+H3+1.5;x<XS3[i+1]-H3-1;x+=3)dash.push([x,.03,z]);
  for(const x of XS3)if(XS3.indexOf(x)!==CANAL_I)for(let j=0;j<NY-1;j++)for(let z=YS3[j]+H3+1.5;z<YS3[j+1]-H3-1;z+=3)dashV.push([x,.03,z]);
  for(const x of XS3)for(const z of YS3)for(const[dx,dz,hz]of[[H3+.9,0,0],[-H3-.9,0,0],[0,H3+.9,1],[0,-H3-.9,1]])for(let k=-2.2;k<=2.2;k+=.75)if(!(XS3.indexOf(x)===CANAL_I))cw.push([x+dx+(hz?k:0),.031,z+dz+(hz?0:k),0,hz?Math.PI/2:0,0]);
  inst(new T.PlaneGeometry(1.4,.18).rotateX(-Math.PI/2),mat.dash,dash);inst(new T.PlaneGeometry(.18,1.4).rotateX(-Math.PI/2),mat.dash,dashV);inst(new T.PlaneGeometry(1.2,.42).rotateX(-Math.PI/2),mat.dash,cw)}}
 // Phase 1B: the organic city (CITY, roads/layout.js): grass, hill terrain, the plaza, every road of the graph as merged ribbons
 const C3R={};
 if(WORLD){const gh=CITY.h;
  {const gr=new T.Mesh(new T.PlaneGeometry(7000,6000),mat.grass);gr.rotation.x=-Math.PI/2;gr.position.set(CX,-.02,CZ);gr.receiveShadow=true;scene.add(gr)}
  for(const q of CITY.L.hills){const w=q.rx*2+10,d=q.rz*2+10,nx=Math.ceil(w/4),nz=Math.ceil(d/4);const pg=new T.PlaneGeometry(w,d,nx,nz);pg.rotateX(-Math.PI/2);const P=pg.attributes.position;
   for(let k=0;k<P.count;k++){const x=P.getX(k)+q.x,z=P.getZ(k)+q.z;P.setXYZ(k,x,gh(x,z)-.03,z)}pg.computeVertexNormals();
   // shade the slopes (vertex colours), so the hills read even under snow: darker the steeper, a little darker up high
   const Nn=pg.attributes.normal,col=new Float32Array(P.count*3);for(let k=0;k<P.count;k++){const sl=Math.sqrt(Math.max(0,1-Nn.getY(k)**2)),hk=P.getY(k)/q.h,s=Math.max(.5,1-1.5*sl)*(1-.1*hk);col[k*3]=XMAS?s*.9:s*.92;col[k*3+1]=XMAS?s*.94:s;col[k*3+2]=XMAS?s:s*.86}
   pg.setAttribute('color',new T.Float32BufferAttribute(col,3));if(!mat.hill){mat.hill=mat.grass.clone();mat.hill.vertexColors=true}const m=new T.Mesh(pg,mat.hill);m.receiveShadow=true;scene.add(m)}
  // merged ribbons: one mesh per material for the whole map
  const RB={};const addRib=(key,P,w,y,closed)=>{const o=RB[key]||(RB[key]={pos:[],idx:[]});const n=P.length,base=o.pos.length/3;if(n<2)return;
   for(let i=0;i<n;i++){const p=P[i],a=P[closed?(i-1+n)%n:Math.max(0,i-1)],b=P[closed?(i+1)%n:Math.min(n-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
    const ww=w/2,x1=p[0]-dz*ww,z1=p[1]+dx*ww,x2=p[0]+dz*ww,z2=p[1]-dx*ww;o.pos.push(x1,gh(x1,z1)+y,z1,x2,gh(x2,z2)+y,z2)}
   const segs=closed?n:n-1;for(let i=0;i<segs;i++){const a=base+i*2,b=base+((i+1)%n)*2;o.idx.push(a,b,a+1,b,b+1,a+1)}};
  const flush=(key,m)=>{const o=RB[key];if(!o||!o.idx.length)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(o.pos,3));
   const uv=[];for(let i=0;i<o.pos.length;i+=3)uv.push(o.pos[i]*.12,o.pos[i+2]*.12);g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(o.idx);g.computeVertexNormals();const me=new T.Mesh(g,m);me.receiveShadow=true;scene.add(me);return me};
  // cobbles for the old town lanes
  mat.cobble=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#6f6a63';x.fillRect(0,0,256,256);let sd=77;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
   for(let j=0;j<32;j++)for(let i=0;i<32;i++){const o=(j%2)*4;const v=150+Math.floor(r()*50);x.fillStyle=`rgb(${v},${v-8},${v-18})`;x.beginPath();x.ellipse(i*8+o+4,j*8+4,3.4,3.1,0,0,Math.PI*2);x.fill()}
   const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return M(0xffffff,{map:t,roughness:.9})})();
  // cut a road where a bridge carries it over the river (world/world3d.js builds the deck and ramps)
  const cutB=P=>{const out=[[]];for(const p of P){const onB=CITY.bridges.some(b=>Math.abs(p[0]-b.x)<b.w&&Math.abs(p[1]-b.zc)<b.half-.5);if(onB){if(out[out.length-1].length)out.push([])}else out[out.length-1].push(p)}return out.filter(q=>q.length>1)};
  const town=(x,z)=>CITY.districts.some(d=>d.id!=='farms'&&Math.hypot(x-d.x,z-d.z)<d.r+40)||Math.hypot(x-CITY.P0.x,z-CITY.P0.z)<330;
  const P0=CITY.P0;
  // the round plaza: paving inside the ring road, the roundabout and its garden
  {const pv=new T.Mesh(new T.CircleGeometry(P0.ring+7,96),mat.pad);pv.rotation.x=-Math.PI/2;pv.position.set(P0.x,.004,P0.z);pv.receiveShadow=true;scene.add(pv)}
  for(const e of CITY.edges){for(const P of cutB(e.P)){
   if(e.k!=='hwy'&&e.k!=='lane'){// sidewalks in town (drawn under the asphalt: junctions cover them), grass verges outside
    let run=[];const fl=()=>{if(run.length>1)addRib('sw',run,e.w+4.6,.007);run=[]};for(const p of P){if(town(p[0],p[1]))run.push(p);else{fl()}}fl()}
   addRib(e.k==='lane'?'cob':'asph',P,e.w,e.k==='lane'?.013:.012)}}
  // junction patches (the ribbons meet at angles)
  const disc=(key,x,z,r,y,seg)=>{const P=[];for(let k=0;k<=(seg||20);k++){const a=k/(seg||20)*TAU;P.push([x+Math.cos(a)*r/2,z+Math.sin(a)*r/2])}addRib(key,P,r,y,true)};
  CITY.nodes.forEach((n,i)=>{if(n.round||n.edges.length<3)return;let w=0;for(const ei of n.edges)w=Math.max(w,CITY.edges[ei].w);disc('asph',n.x,n.z,w*.75,.0125)});
  // turning bulbs at the dead ends (traffic/routing.js drives round them), each with a small kerbed island
  for(const q of CITY.bulbs)disc(q.w<6?'cob':'asph',q.x,q.z,q.r+2.7,.0128,28);
  // roundabout ring
  {const r0=(P0.island+P0.rb+8)/2,P=[];for(let k=0;k<64;k++){const a=k/64*TAU;P.push([P0.x+Math.cos(a)*r0,P0.z+Math.sin(a)*r0])}addRib('asph',P,P0.rb+8-P0.island,.0135,true)}
  C3R.asph=flush('asph',mat.asphalt);C3R.sw=flush('sw',mat.pad);C3R.cob=flush('cob',mat.cobble);
  {const ig=new T.CylinderGeometry(1,1.06,.3,24),gg=new T.CylinderGeometry(.82,.82,.32,24);for(const q of CITY.bulbs){const r=q.r-2,y=gh(q.x,q.z);const k=new T.Mesh(ig,mat.curb);k.scale.set(r,1,r);k.position.set(q.x,y+.15,q.z);k.receiveShadow=true;scene.add(k);const gi=new T.Mesh(gg,mat.grass2);gi.scale.set(r,1,r);gi.position.set(q.x,y+.17,q.z);gi.receiveShadow=true;scene.add(gi)}}
  {const isl=new T.Mesh(new T.CylinderGeometry(P0.island,P0.island+.2,.3,48),mat.curb);isl.position.set(P0.x,.15,P0.z);isl.receiveShadow=true;scene.add(isl);const gi=new T.Mesh(new T.CylinderGeometry(P0.island-.6,P0.island-.6,.32,48),mat.grass2);gi.position.set(P0.x,.17,P0.z);gi.receiveShadow=true;scene.add(gi)}
  // centre lines (dashed) away from the junctions, as one instanced mesh
  {const D=[];const o=new T.Object3D();for(const e of CITY.edges){if(e.k==='lane')continue;const na=CITY.nodes[e.a],nb=CITY.nodes[e.b],ca=na.round?na.round+8:na.edges.length>2?e.w:2,cb=nb.round?nb.round+8:nb.edges.length>2?e.w:2;let acc=0;
    for(let i=1;i<e.P.length;i++){const a=e.P[i-1],b=e.P[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=(4-acc%4)%4;t<l;t+=4){const s2=acc+t;if(s2<ca||s2>e.len-cb)continue;const x=a[0]+(b[0]-a[0])*t/l,z=a[1]+(b[1]-a[1])*t/l;if(CITY.bridges.some(q=>Math.abs(x-q.x)<q.w&&Math.abs(z-q.zc)<q.half))continue;D.push([x,gh(x,z)+.03,z,Math.atan2(b[0]-a[0],b[1]-a[1])])}acc+=l}}
   const im=new T.InstancedMesh(new T.PlaneGeometry(.18,1.6).rotateX(-Math.PI/2),mat.dash,D.length);D.forEach((p,k)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(0,p[3],0);o.updateMatrix();im.setMatrixAt(k,o.matrix)});im.receiveShadow=true;scene.add(im)
   const RD=[];for(let k=0;k<32;k++){if(k%2)continue;const a=k/32*TAU;RD.push([P0.x+Math.cos(a)*(P0.rb+.5),.031,P0.z+Math.sin(a)*(P0.rb+.5),-a])}const im2=new T.InstancedMesh(new T.PlaneGeometry(.18,2.2).rotateX(-Math.PI/2),mat.dash,RD.length);RD.forEach((p,k)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(0,p[3],0);o.updateMatrix();im2.setMatrixAt(k,o.matrix)});scene.add(im2)}
 }
