//@ view3d/merge.js - static-geometry merging at run time (performance): fewer draw calls, same pictures.
//@ inside make3D(T,X). Every city frame mergeTick(dt) watches the meshes of the city scene; a mesh whose transform,
//@ visibility, material and geometry have not changed for MERGE_T seconds is merged with the other quiet meshes that
//@ share its material and shadow flags, per merge root (a direct child of the scene, or a group marked
//@ userData.mergeRoot because the code replaces it) and per 120 m chunk, so frustum culling still works.
//@ Never merged: anything that ever moved or changed while watched, instanced/skinned meshes, points, lines,
//@ transparent materials, meshes with children, renderOrder, morph targets or tangents, and anything under an
//@ object with userData.nm (things that change rarely: traffic-light lenses, blinking beacons, night-only beams...).
//@ Nothing is baked into files: it works on whatever the city code builds (also after unlocks, rebuilds, Phase 1B).
//@ Off on the recorder page and with ?merge=0. Localhost: window.__MERGE_T (seconds), R3.mergeStats().
 const MERGE=(()=>{const on=document.documentElement.dataset.rec!=='1'&&!/[?&]merge=0\b/.test(location.search);let MT=12;try{if(location.hostname==='localhost'&&window.__MERGE_T>0)MT=+window.__MERGE_T}catch(e){}return{on,T:MT,CH:120}})();
 const MW={why:{},seen:new Map(),bad:new WeakSet(),t:0,scan:0,pass:0,stats:{merged:0,into:0,passes:0}};
 const _mm=new T.Matrix4(),_mi=new T.Matrix4(),_mn=new T.Matrix3(),_v=new T.Vector3(),_bx=new T.Box3();
 function mergeRootOf(o){if(o.parent===scene)return scene;let q=o.parent;while(q&&q.parent!==scene&&!q.userData.mergeRoot){if(q===scene)return null;q=q.parent}return q}
 function eligible(o){return !whyNot(o)}
 function whyNot(o){if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh)return 'type';if(o.renderOrder)return 'order';if(!o.frustumCulled)return 'cull';if(o.onBeforeRender!==T.Object3D.prototype.onBeforeRender)return 'cb';
  const m=o.material;if(!m)return 'nomat';if(Array.isArray(m)?m.some(x=>x.transparent):m.transparent)return 'transparent';
  const g=o.geometry;if(!g||!g.attributes.position)return 'nogeo';if(g.morphAttributes&&Object.keys(g.morphAttributes).length)return 'morph';
  for(const k in g.attributes)if(!['position','normal','uv','color'].includes(k)&&!(k==='tangent'&&!(Array.isArray(m)?m.some(x=>x.normalMap):m.normalMap)))return 'attr:'+k;return ''}
 function sigOf(o,vis){const e=o.matrixWorld.elements;let h=vis?1:0;for(let i=0;i<16;i++)h=(h*31+Math.round(e[i]*1000))|0;return h+'|'+(Array.isArray(o.material)?o.material.map(m=>m.id).join(','):o.material.id)+'|'+o.geometry.id}
 // watch: record when each mesh was last seen changing
 function mergeScan(now){const walk=(o,vis,nm)=>{vis=vis&&o.visible;nm=nm||!!(o.userData.nm||o.userData.spin);
   if(o.isMesh&&o!==scene){if(nm||MW.bad.has(o)){}else if(!vis){MW.seen.delete(o)}else if(!eligible(o)){MW.bad.add(o);const w=whyNot(o);MW.why[w]=(MW.why[w]||0)+1}else{const s=sigOf(o,vis),r=MW.seen.get(o);if(!r)MW.seen.set(o,{s,t:now});else if(r.s!==s){MW.bad.add(o);MW.seen.delete(o)}}}
   if(o.userData.lodP!==undefined||o.userData.tl!==undefined){for(const c of o.children)markBad(c);return}
   for(const c of o.children)walk(c,vis,nm)};
  const markBad=o=>o.traverse(c=>{if(c.isMesh){MW.bad.add(c);MW.seen.delete(c)}});
  for(const c of scene.children)walk(c,true,false)}
 // merge every quiet mesh, grouped by merge root, chunk, material and shadow flags
 function mergePass(now){const B=new Map();
  for(const[o,r]of MW.seen){if(now-r.t<MERGE.T)continue;if(!o.parent){MW.seen.delete(o);continue}const root=mergeRootOf(o);if(!root)continue;
   o.updateWorldMatrix(true,false);if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();_bx.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);_bx.getCenter(_v);
   const ck=Math.floor(_v.x/MERGE.CH)+','+Math.floor(_v.z/MERGE.CH);const mats=Array.isArray(o.material)?o.material:[o.material];
   const parts=Array.isArray(o.material)?(o.geometry.groups.length?o.geometry.groups:[{start:0,count:Infinity,materialIndex:0}]):[{start:0,count:Infinity,materialIndex:0}];
   for(const gr of parts){const m=mats[gr.materialIndex];if(!m)continue;const k=root.id+'|'+ck+'|'+m.id+'|'+o.castShadow+'|'+o.receiveShadow;let b=B.get(k);if(!b)B.set(k,b={root,m,cast:o.castShadow,recv:o.receiveShadow,items:[]});b.items.push([o,gr])}}
  const done=new Set();let made=0;
  for(const b of B.values()){if(b.items.length<2&&!b.items.some(([o])=>Array.isArray(o.material)))continue;
   b.root.updateWorldMatrix(true,false);_mi.copy(b.root.matrixWorld).invert();const g=geoMerge(T,b.items,_mi,b.m);if(!g)continue;
   const me=new T.Mesh(g,b.m);me.castShadow=b.cast;me.receiveShadow=b.recv;me.userData.merged=b.items.length;me.userData.nm=1;b.root.add(me);made++;for(const[o]of b.items)done.add(o)}
  // a mesh leaves the scene only when every part of it went into a merged mesh
  for(const o of done){if(o.children.length){const k=new T.Object3D();k.position.copy(o.position);k.quaternion.copy(o.quaternion);k.scale.copy(o.scale);k.userData=o.userData;for(const c of o.children.slice())k.add(c);o.parent.add(k)}o.parent.remove(o);MW.seen.delete(o);MW.stats.merged++}
  MW.stats.into+=made;MW.stats.passes++}
 function mergeTick(dt){if(!MERGE.on)return;MW.t+=dt;if(MW.t-MW.scan>=.5){MW.scan=MW.t;mergeScan(MW.t)}if(MW.t-MW.pass>=3&&MW.t>=MERGE.T){MW.pass=MW.t;mergePass(MW.t)}}
