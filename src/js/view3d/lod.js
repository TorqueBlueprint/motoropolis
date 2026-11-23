//@ view3d/lod.js - level-of-detail and shadow-distance hooks (city-v2 phase 0)
//@ inside make3D(T,X). All distances default to Infinity, so nothing changes unless a page or a test turns them on:
//@   ?lod=cars:250,people:120,shadow:300   or   window.__LOD3={cars:250,...} before the 3D view loads.
//@ cars: beyond this distance from the camera a car is drawn as one coloured box (its own model is hidden)
//@ people: beyond this distance pedestrians keep their pose (no skeleton update)
//@ shadow: beyond this distance cars stop casting shadows
 const LOD3=(()=>{const o={cars:Infinity,people:Infinity,shadow:Infinity};try{Object.assign(o,window.__LOD3||{});const q=new URLSearchParams(location.search).get('lod');if(q)for(const kv of q.split(',')){const[k,v]=kv.split(':');if(k in o&&+v>0)o[k]=+v}}catch(e){}o.on=isFinite(o.cars)||isFinite(o.people)||isFinite(o.shadow);return o})();
 const _lodV=new T.Vector3();
 function lodDist(g){return camera.position.distanceTo(g.getWorldPosition(_lodV))}
 // called by syncCars after it has positioned a car group
 function lodCar(g,c){if(!LOD3.on)return;const d=lodDist(g),far=d>LOD3.cars,ud=g.userData;
  if(far){if(!ud.lodP){const bb=new T.Box3();g.updateMatrixWorld(true);const inv=new T.Matrix4().copy(g.matrixWorld).invert();g.traverse(o=>{if(o.isMesh&&o.visible&&o!==ud.tl){const b=new T.Box3().setFromBufferAttribute(o.geometry.attributes.position).applyMatrix4(o.matrixWorld).applyMatrix4(inv);bb.union(b)}});
    const p=new T.Mesh(BOX,colMat(c.color||'#2f6fd9'));if(bb.isEmpty())bb.set(new T.Vector3(-1,0,-2),new T.Vector3(1,1.4,2));bb.getSize(p.scale);bb.getCenter(p.position);p.castShadow=true;p.visible=false;ud.lodP=p;ud.lodKids=g.children.slice();g.add(p)}
   if(!ud.lodFar){ud.lodVis=ud.lodKids.map(o=>o.visible);ud.lodFar=true}for(const o of ud.lodKids)o.visible=false;ud.lodP.visible=true}
  else if(ud.lodFar){ud.lodKids.forEach((o,i)=>{o.visible=ud.lodVis[i]});ud.lodP.visible=false;ud.lodFar=false}
  if(isFinite(LOD3.shadow)){const cs=d<=LOD3.shadow;if(ud.lodCS!==cs){ud.lodCS=cs;g.traverse(o=>{if(o.isMesh){if(o.userData.cs0===undefined)o.userData.cs0=o.castShadow;o.castShadow=cs&&o.userData.cs0}})}}}
 // called by syncPeople: true = skip the walk animation for this person this frame
 function lodPersonFrozen(g){return LOD3.on&&isFinite(LOD3.people)&&lodDist(g)>LOD3.people}
 if(location.hostname==='localhost')window.__LOD=LOD3;
