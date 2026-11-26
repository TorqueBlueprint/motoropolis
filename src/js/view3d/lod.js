//@ view3d/lod.js - level of detail and shadow distance for cars and people (performance)
//@ inside make3D(T,X). Defaults on the city pages: cars beyond 200 m are drawn as boxes in their colour (all of them in
//@ ONE instanced draw call), pedestrians beyond 100 m keep their pose, cars beyond 200 m cast no shadow.
//@ The recorder page and ?eager keep full detail. Override: ?lod=cars:250,people:120,shadow:300, ?lod=off, window.__LOD3.
 const LOD3=(()=>{const full=LAZY_EAGER;const o=full?{cars:Infinity,people:Infinity,shadow:Infinity}:{cars:200,people:100,shadow:200};
  try{Object.assign(o,window.__LOD3||{});const q=new URLSearchParams(location.search).get('lod');if(q==='off'){o.cars=o.people=o.shadow=Infinity}else if(q)for(const kv of q.split(',')){const[k,v]=kv.split(':');if(k in o&&+v>0)o[k]=+v}}catch(e){}
  o.on=isFinite(o.cars)||isFinite(o.people)||isFinite(o.shadow);return o})();
 const _lodV=new T.Vector3(),_lodM=new T.Matrix4(),_lodC=new T.Color();
 function lodDist(g){return camera.position.distanceTo(g.getWorldPosition(_lodV))}
 // all far cars: one instanced box mesh, refilled every frame by syncCars
 const LODB={im:null,n:0,max:0};
 function lodBegin(){LODB.n=0}
 function lodEnd(){if(LODB.im){LODB.im.count=LODB.n;LODB.im.instanceMatrix.needsUpdate=true;if(LODB.im.instanceColor)LODB.im.instanceColor.needsUpdate=true}}
 function lodBox(g,c){if(!LODB.im||LODB.n>=LODB.max){const max=Math.max(256,LODB.max*2),im=new T.InstancedMesh(BOX,M(0xffffff,{roughness:.45,metalness:.25}),max);im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;im.userData.tf=1;im.userData.nm=1;
   if(LODB.im){for(let i=0;i<LODB.n;i++){LODB.im.getMatrixAt(i,_lodM);im.setMatrixAt(i,_lodM);LODB.im.getColorAt(i,_lodC);im.setColorAt(i,_lodC)}scene.remove(LODB.im)}else im.setColorAt(0,_lodC.set(1,1,1));LODB.im=im;LODB.max=max;scene.add(im)}
  const ud=g.userData;g.updateMatrix();_lodM.copy(g.matrix).multiply(ud.lodBM);LODB.im.setMatrixAt(LODB.n,_lodM);LODB.im.setColorAt(LODB.n,_lodC.set(c.color||'#2f6fd9'));LODB.n++}
 // called by syncCars after it has positioned a car group
 function lodCar(g,c){if(!LOD3.on)return;const d=lodDist(g),far=d>LOD3.cars,ud=g.userData;
  if(far){if(!ud.lodFar){ud.lodKids=g.children.slice();ud.lodVis=ud.lodKids.map(o=>o.visible);ud.lodFar=true}
   // a lazy model that lands while the car is far: hide it too and size the box again
   for(const o of g.children)if(!ud.lodKids.includes(o)){ud.lodKids.push(o);ud.lodVis.push(o.visible);ud.lodBM=null}
   if(!ud.lodBM){const bb=new T.Box3();g.updateMatrixWorld(true);const inv=new T.Matrix4().copy(g.matrixWorld).invert();g.traverse(o=>{if(o.isMesh&&o!==ud.tl&&!(ud.lb&&ud.lb.includes(o))){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();bb.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld).applyMatrix4(inv))}});
    if(bb.isEmpty())bb.set(new T.Vector3(-1,0,-2),new T.Vector3(1,1.4,2));const sz=bb.getSize(new T.Vector3()),ce=bb.getCenter(new T.Vector3());ud.lodBM=new T.Matrix4().compose(ce,new T.Quaternion(),sz)}
   for(const o of ud.lodKids)o.visible=false;lodBox(g,c)}
  else if(ud.lodFar){ud.lodKids.forEach((o,i)=>{o.visible=ud.lodVis[i]});ud.lodFar=false}
  if(isFinite(LOD3.shadow)){const cs=d<=LOD3.shadow;if(ud.lodCS!==cs){ud.lodCS=cs;g.traverse(o=>{if(o.isMesh){if(o.userData.cs0===undefined)o.userData.cs0=o.castShadow;o.castShadow=cs&&o.userData.cs0}})}}}
 // called by syncPeople: true = skip the walk animation for this person this frame
 function lodPersonFrozen(g){return LOD3.on&&isFinite(LOD3.people)&&lodDist(g)>LOD3.people}
 if(location.hostname==='localhost')window.__LOD=LOD3;
