//@ view3d/loader.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- lazy assets (city-v2): the first 3D frame needs only three.js, the base person, the trees and the
// traffic light; car models, Christmas props, job outfits and the boat load right after it, cars first.
// loading progress for the welcome screen (ui/welcome.js): st = stage reached, n/d = model files started/finished
window.__mtpLoad={st:0,n:0,d:0};
// The recorder page (data-rec) and ?eager load everything before the first frame, as before.
const LAZY_EAGER=document.documentElement.dataset.rec==='1'||/[?&]eager\b/.test(location.search);
const CAR_BOX=@@JSON:cars/car_bounds.json@@,XMAS_BOX=@@JSON:world/xmas_bounds.json@@;
// a stand-in scene with the real model's bounding box (invisible): code can clone it and measure it at once;
// when the model lands every clone gets the real meshes (keeping the shadow flags set on the stand-in)
function lazyScene(T,X,name,b){const root=new T.Group(),list=[root];
 const ph=new T.Mesh(new T.BoxGeometry(b[3]-b[0],b[4]-b[1],b[5]-b[2]).translate((b[0]+b[3])/2,(b[1]+b[4])/2,(b[2]+b[5])/2),new T.MeshBasicMaterial());ph.visible=false;ph.userData.lazyPh=1;root.add(ph);
 root.clone=function(r){const c=T.Group.prototype.clone.call(this,r);list.push(c);return c};
 X.lazyFill[name]=real=>{for(const c of list){const p=c.children.find(o=>o.userData.lazyPh);if(!p)continue;const rc=real.clone(true);rc.traverse(o=>{if(o.isMesh){if(p.castShadow)o.castShadow=true;if(p.receiveShadow)o.receiveShadow=true}});c.remove(p);c.add(rc);for(const f of X.lazyHooks[name]||[])f(c)}};
 return root}
function startLazy(X){const q=X.lazyQ.sort((a,b)=>a.pri-b.pri);let left=q.length,i=0;window.__lazyLeft=left;
 const next=async()=>{while(i<q.length){const t=q[i++];try{await t.run()}catch(e){console.warn('lazy asset',t.name,e)}window.__lazyLeft=--left;if(!q.slice(i).some(o=>o.pri===1)&&X._ready1){X._ready1();X._ready1=null}}};
 // after the first frame is on screen (or 250 ms, whichever comes first)
 let go=false;const kick=()=>{if(go)return;go=true;if(!q.some(o=>o.pri===1)&&X._ready1){X._ready1();X._ready1=null}for(let k=0;k<4;k++)next()};
 requestAnimationFrame(()=>requestAnimationFrame(kick));setTimeout(kick,250)}
// car models arrive as dozens of small meshes, each with its own material: merge the ones whose materials are equal
// in everything but their name (one draw call each), keeping apart the materials glbCar repaints or treats by name
function slimCar(T,root,v){root.updateMatrixWorld(true);const inv=new T.Matrix4().copy(root.matrixWorld).invert();const keep=new Set([].concat(v.paint||[],'Car_Main'));const B=new Map(),out=[];
 const hx=c=>c&&c.isColor?c.getHexString():'';
 root.traverse(o=>{if(!o.isMesh||Array.isArray(o.material)||o.children.length)return;const g=o.geometry;for(const k in g.attributes)if(!['position','normal','uv','color'].includes(k))return;if(g.morphAttributes&&Object.keys(g.morphAttributes).length)return;
  const m=o.material,nm=m.name||'';const k=keep.has(nm)?'n:'+nm+':'+m.uuid:['v',m.type,hx(m.color),hx(m.emissive),m.emissiveIntensity,m.roughness,m.metalness,m.map&&m.map.uuid,m.normalMap&&m.normalMap.uuid,m.roughnessMap&&m.roughnessMap.uuid,m.metalnessMap&&m.metalnessMap.uuid,m.emissiveMap&&m.emissiveMap.uuid,m.aoMap&&m.aoMap.uuid,m.alphaMap&&m.alphaMap.uuid,m.transparent,m.opacity,m.alphaTest,m.side,m.vertexColors,m.flatShading,m.depthWrite,/glass/i.test(nm),m.clearcoat,m.transmission,m.sheen,m.specularIntensity,!!g.attributes.uv,!!g.attributes.color,o.castShadow,o.receiveShadow].join('|');
  let b=B.get(k);if(!b)B.set(k,b={m,items:[],o});b.items.push(o)});
 for(const b of B.values()){if(b.items.length<2)continue;const geo=geoMerge(T,b.items.map(o=>[o,{start:0,count:Infinity}]),inv,b.m);if(!geo)continue;const me=new T.Mesh(geo,b.m);me.castShadow=b.o.castShadow;me.receiveShadow=b.o.receiveShadow;me.name=b.o.name;out.push([me,b.items])}
 for(const[me,items]of out){for(const o of items)o.parent.remove(o);root.add(me)}}
async function loadR3(){
 try{const T=await import(THREE_URL);window.__mtpLoad.st=.2;let X=null;if(REMAKE){try{const[a,b,c,d,e,f]=await Promise.all(['environments/RoomEnvironment.js','postprocessing/EffectComposer.js','postprocessing/RenderPass.js','postprocessing/UnrealBloomPass.js','postprocessing/OutputPass.js','postprocessing/ShaderPass.js'].map(p=>import(ADDON(p))));X={RoomEnvironment:a.RoomEnvironment,EffectComposer:b.EffectComposer,RenderPass:c.RenderPass,UnrealBloomPass:d.UnrealBloomPass,OutputPass:e.OutputPass,ShaderPass:f.ShaderPass}}catch(err){console.warn('remake addons unavailable',err)}
  if(X){X.cars={};X.lazyQ=[];X.lazyFill={};X.lazyHooks={};X.ready1=LAZY_EAGER?Promise.resolve():new Promise(r=>{X._ready1=r});try{const{GLTFLoader}=await import(ADDON('loaders/GLTFLoader.js'));const ld0=new GLTFLoader();
   // people, world and Christmas models are Draco-compressed (optimised in Blender); the decoder comes from the same CDN as three
   try{const{DRACOLoader}=await import(ADDON('loaders/DRACOLoader.js'));const dl=new DRACOLoader();dl.setDecoderPath(ADDON('libs/draco/gltf/'));ld0.setDRACOLoader(dl)}catch(e){console.warn('draco loader unavailable',e)}
   const GZ=typeof DecompressionStream!=='undefined';
   // models are shipped twice: .glb.gz (about 2.5x smaller, unpacked in the browser) and plain .glb for older browsers
   const ld={loadAsync:async u=>{const L=window.__mtpLoad;L.n++;try{return await ld1(u)}finally{L.d++}}},ld1=async u=>{if(GZ){try{const r=await fetch(u+'.gz');if(r.ok){const buf=await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();return await ld0.parseAsync(buf,u.slice(0,u.lastIndexOf('/')+1))}}catch(e){}}return ld0.loadAsync(u)};X.ld=ld;
   try{const[SU,gm]=await Promise.all([import(ADDON('utils/SkeletonUtils.js')),ld.loadAsync(ASSET_BASE+'assets/people/man.glb')]);const bb=new T.Box3().setFromObject(gm.scene);X.SUc=SU.clone;X.man={scene:gm.scene,clone:SU.clone,h:bb.max.y-bb.min.y,y0:bb.min.y}}catch(e){console.warn('person model',e)}
   if(WORLD){try{const norm=sc=>{sc.updateMatrixWorld(true);let mesh=null;sc.traverse(o=>{if(o.isMesh&&!mesh)mesh=o});const g=mesh.geometry.clone();for(const k in g.attributes){const at=g.attributes[k];if(at.normalized||!(at.array instanceof Float32Array)){const n=at.count,sz=at.itemSize,fa=new Float32Array(n*sz);for(let i=0;i<n;i++)for(let c=0;c<sz;c++)fa[i*sz+c]=at.getComponent(i,c);g.setAttribute(k,new T.BufferAttribute(fa,sz))}}g.applyMatrix4(mesh.matrixWorld);g.computeBoundingBox();const b=g.boundingBox;return{g,m:mesh.material,b}};
     const tr=await Promise.all([1,2,3,4,5,6,7,8,9,10].map(n=>ld.loadAsync(ASSET_BASE+'assets/world/tree'+n+'.glb')));X.trees=tr.map((t,i)=>{const o=norm(t.scene),b=o.b,h=b.max.y-b.min.y;o.g.translate(-(b.min.x+b.max.x)/2,-b.min.y,-(b.min.z+b.max.z)/2);o.g.scale(1/h,1/h,1/h);o.pine=[0,1,7,8].includes(i);return o});
     const tl=await ld.loadAsync(ASSET_BASE+'assets/world/tlight.glb');const o=norm(tl.scene);const P=o.g.attributes.position;let px=0,pz=0,c=0;for(let i=0;i<P.count;i++)if(P.getY(i)<2){px+=P.getX(i);pz+=P.getZ(i);c++}px/=c;pz/=c;o.g.translate(-px,-o.b.min.y,-pz);o.g.computeBoundingBox();o.front=o.g.boundingBox.max.z;o.hx=(o.g.boundingBox.min.x+o.g.boundingBox.max.x)/2;o.m.emissiveIntensity=.12;X.tlight=o}catch(e){console.warn('world props',e)}
     if(XMAS){const XM=[['xmas_truck','xtruck'],['xmas_tree','xtree'],['xmas_stall','xstall'],['xmas_carousel','xcarousel'],['xmas_sleigh','xsl'],['xmas_reindeer','xrd']];
      if(LAZY_EAGER){try{const g=await ld.loadAsync(ASSET_BASE+'assets/world/xmas_truck.glb');X.xtruck=g.scene}catch(e){console.warn('xmas truck',e)}try{X.xtree=(await ld.loadAsync(ASSET_BASE+'assets/world/xmas_tree.glb')).scene}catch(e){console.warn('xmas tree',e)}try{const[a,b]=await Promise.all(['xmas_stall','xmas_carousel'].map(n=>ld.loadAsync(ASSET_BASE+'assets/world/'+n+'.glb')));X.xstall=a.scene;X.xcarousel=b.scene}catch(e){console.warn('xmas market',e)}try{const[a,b]=await Promise.all([ld.loadAsync(ASSET_BASE+'assets/world/xmas_sleigh.glb'),ld.loadAsync(ASSET_BASE+'assets/world/xmas_reindeer.glb')]);X.xsl=a.scene;X.xrd=b.scene}catch(e){console.warn('xmas sleigh',e)}}
      else for(const[n,key]of XM){X[key]=lazyScene(T,X,n,XMAS_BOX[n]);X.lazyQ.push({pri:2,name:n,run:async()=>{const g=await ld.loadAsync(ASSET_BASE+'assets/world/'+n+'.glb');X.lazyFill[n](g.scene)}})}}}
   if(LAZY_EAGER){await Promise.all(Object.entries(CAR_GLB).map(async([k,v])=>{try{const g=await ld.loadAsync(ASSET_BASE+'assets/cars/'+v.file);if(v.yaw!=null){g.scene.rotation.y=(v.yaw-90)*Math.PI/180;g.scene.updateMatrixWorld(true)}const bb=new T.Box3().setFromObject(g.scene,v.yaw!=null),sz=bb.getSize(new T.Vector3());v.len=Math.max(sz.x,sz.z);v.h=sz.y;v.y0=bb.min.y;v.cx=(bb.min.x+bb.max.x)/2;v.cz=(bb.min.z+bb.max.z)/2;if(v.rot==null)v.rot=(sz.x>sz.z?Math.PI/2:0)+(v.flip?Math.PI:0);
   if(v.fix)g.scene.traverse(o=>{if(!o.isMesh||!o.material)return;const f=v.fix[o.material.name];if(!f)return;const m=o.material;m.color.setHex(f[0]);m.map=null;if(f[1]){m.emissive.setHex(f[0]);m.emissiveIntensity=1.2}if(f[2]){m.transparent=true;m.opacity=f[2]}m.metalness=Math.min(m.metalness,.4);m.needsUpdate=true});slimCar(T,g.scene,v);X.cars[k]=g.scene}catch(e){console.warn('car model',k,e)}}))}
   else{X.carBox={};X.carWait={};
    // car models arrive after the first frame: sizes come from src/data/cars/car_bounds.json (measured from the same
    // files), every car is built at once with a low-poly stand-in that the real model replaces when it lands
    for(const[k,v]of Object.entries(CAR_GLB)){const b=CAR_BOX[k];if(!b)continue;v.len=b.len;v.h=b.h;v.y0=b.y0;v.cx=b.cx;v.cz=b.cz;if(v.rot==null&&b.rot!=null)v.rot=b.rot;X.carBox[k]=b.box;X.cars[k]={lazyCar:true};
     X.lazyQ.push({pri:1,name:k,run:async()=>{const g=await ld.loadAsync(ASSET_BASE+'assets/cars/'+v.file);if(v.yaw!=null){g.scene.rotation.y=(v.yaw-90)*Math.PI/180;g.scene.updateMatrixWorld(true)}
      if(v.fix)g.scene.traverse(o=>{if(!o.isMesh||!o.material)return;const f=v.fix[o.material.name];if(!f)return;const m=o.material;m.color.setHex(f[0]);m.map=null;if(f[1]){m.emissive.setHex(f[0]);m.emissiveIntensity=1.2}if(f[2]){m.transparent=true;m.opacity=f[2]}m.metalness=Math.min(m.metalness,.4);m.needsUpdate=true});slimCar(T,g.scene,v);X.cars[k]=g.scene;if(X.carArrived)X.carArrived(k)}})}}}catch(e){console.warn('gltf loader unavailable',e)}}}if(document.fonts&&document.fonts.ready)await Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]);R3=make3D(T,X);if(X&&X.lazyQ)startLazy(X);return R3}
 catch(e){console.warn('3D view unavailable',e);R3=null;return null}
}
