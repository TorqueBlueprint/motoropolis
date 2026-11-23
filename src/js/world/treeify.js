//@ world/treeify.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- world: swap the simple trees for the low-poly tree models, keep them clear of the traffic lights ----------
 let tfT=0;const _tm=new T.Matrix4(),_tp=new T.Vector3(),_tq=new T.Quaternion(),_ts=new T.Vector3(),_tinv=new T.Matrix4();
 function treeify(){if(!WORLD||!X||!X.trees)return;const leaves=[],trunks=[];scene.traverse(o=>{if(!o.isInstancedMesh||o.userData.tf)return;const ty=o.geometry.type;if(o.material===mat.trunk)trunks.push(o);else if(ty==='IcosahedronGeometry'||ty==='ConeGeometry')leaves.push(o)});if(!leaves.length)return;
  const key=(x,z)=>Math.round(x*4)+','+Math.round(z*4),tb=new Map();
  for(const m of trunks){m.updateMatrixWorld(true);if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();const by=m.geometry.boundingBox.min.y;for(let i=0;i<m.count;i++){m.getMatrixAt(i,_tm);_tm.premultiply(m.matrixWorld);_tm.decompose(_tp,_tq,_ts);const k=key(_tp.x,_tp.z),y=_tp.y+by*_ts.y;if(!tb.has(k)||tb.get(k)>y)tb.set(k,y)}}
  const BRD=X.trees.filter(t=>!t.pine),PIN=X.trees.filter(t=>t.pine),poles=W3P.poles;
  for(const m of leaves){m.updateMatrixWorld(true);if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();const top=m.geometry.boundingBox.max.y,pine=m.geometry.type==='ConeGeometry',pool=pine?PIN:BRD;
   const stride=Math.max(1,Math.ceil(m.count/(QUAL==='high'?1400:QUAL==='medium'?700:300))),buckets=pool.map(()=>[]);let found=0;
   for(let i=0;i<m.count;i++){m.getMatrixAt(i,_tm);_tm.premultiply(m.matrixWorld);_tm.decompose(_tp,_tq,_ts);const g=tb.get(key(_tp.x,_tp.z));if(g===undefined)continue;found++;if(i%stride)continue;
    let near=false;for(const q of poles)if(Math.abs(q[0]-_tp.x)<2.8&&Math.abs(q[1]-_tp.z)<2.8){near=true;break}if(near)continue;
    const H=Math.max(1.5,(_tp.y+top*_ts.y-g)*(stride>1?1.25:1.12)),h=Math.abs(Math.sin(_tp.x*12.9898+_tp.z*78.233)*43758.5);buckets[Math.floor(h%1*pool.length)].push([_tp.x,g,_tp.z,H,(h*7)%6.283])}
   if(!found)continue;const par=m.parent;par.updateMatrixWorld(true);_tinv.copy(par.matrixWorld).invert();
   pool.forEach((t,k)=>{const L=buckets[k];if(!L.length)return;const im=new T.InstancedMesh(t.g,t.m,L.length);L.forEach((p,i)=>{_tq.setFromAxisAngle(_ts.set(0,1,0),p[4]);_tm.compose(_tp.set(p[0],p[1],p[2]),_tq,_ts.set(p[3],p[3],p[3]));_tm.premultiply(_tinv);im.setMatrixAt(i,_tm)});im.castShadow=L.length<900;im.receiveShadow=false;im.userData.tf=1;im.computeBoundingSphere();par.add(im)});
   m.visible=false;m.userData.tf=1}
  for(const m of trunks){m.visible=false;m.userData.tf=1}}
