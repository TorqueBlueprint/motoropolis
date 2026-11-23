//@ view3d/batch.js - static batching helper (city-v2 phase 0 performance groundwork)
//@ inside make3D(T,X). batchBoxes(g) merges the plain unit boxes (box()/B0() with the shared BOX geometry) that are
//@ direct children of a group built once and never edited again into one InstancedMesh per material and shadow
//@ setting: same transforms, same materials, same shadows, far fewer draw calls. Only call it on such groups.
 function batchBoxes(g,min){const by=new Map();
  for(const o of g.children){if(!o.isMesh||o.isInstancedMesh||o.geometry!==BOX||o.children.length||!o.visible||Array.isArray(o.material)||o.material.transparent||o.renderOrder||!o.frustumCulled)continue;
   const k=o.material.uuid+'|'+o.castShadow+'|'+o.receiveShadow;if(!by.has(k))by.set(k,[]);by.get(k).push(o)}
  for(const L of by.values()){if(L.length<(min||4))continue;const im=new T.InstancedMesh(BOX,L[0].material,L.length);
   L.forEach((o,i)=>{o.updateMatrix();im.setMatrixAt(i,o.matrix);g.remove(o)});im.castShadow=L[0].castShadow;im.receiveShadow=L[0].receiveShadow;im.userData.tf=1;im.userData.batched=L.length;im.computeBoundingSphere();g.add(im)}
  return g}
