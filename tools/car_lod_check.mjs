// Compare every car LOD file with its original and write docs/carhd_report.md
//   cd <folder with @gltf-transform/core, /extensions and draco3dgltf in node_modules> && node <repo>/tools/car_lod_check.mjs
// Checks: bounding box within 1% of the car length (same scale, orientation, ground and pivot), material names kept
// (the paint is found by name: car_glb.json "paint"/"fix" and Car_Main), triangle count, texture size, file size.
import {createRequire} from 'module';import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
const req=createRequire(process.cwd()+'/');
const {NodeIO,getBounds}=req('@gltf-transform/core'),{ALL_EXTENSIONS}=req('@gltf-transform/extensions'),draco3d=req('draco3dgltf');
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..'),A=path.join(ROOT,'assets/cars');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
const LOD=JSON.parse(fs.readFileSync(path.join(ROOT,'src/data/cars/car_lod.json'),'utf8'));
const GLB=JSON.parse(fs.readFileSync(path.join(ROOT,'src/data/cars/car_glb.json'),'utf8'));
const BOX=JSON.parse(fs.readFileSync(path.join(ROOT,'src/data/cars/car_bounds.json'),'utf8'));
async function info(f){const doc=await io.read(f),r=doc.getRoot();let tris=0;
 for(const n of r.listNodes()){const m=n.getMesh();if(!m)continue;for(const p of m.listPrimitives()){if(p.getMode()!==4)continue;const i=p.getIndices();tris+=(i?i.getCount():p.getAttribute('POSITION').getCount())/3}}
 const tex=r.listTextures().map(t=>{const s=t.getSize();return s?Math.max(...s):0});const b=getBounds(r.listScenes()[0]);
 return{tris:Math.round(tris),tex:tex.length?Math.max(...tex):0,size:fs.statSync(f).size,gz:fs.existsSync(f+'.gz')?fs.statSync(f+'.gz').size:0,mats:new Set(r.listMaterials().map(m=>m.getName())),b}}
const mb=n=>(n/1048576).toFixed(2)+' MB',rows=[],bad=[];
for(const[id,e]of Object.entries(LOD)){const o=await info(path.join(A,GLB[id].file));
 const lvl=async rel=>rel?await info(path.join(ROOT,rel)):null;const L=await lvl(e.light),H=await lvl(e.hd);
 const bx=BOX[id]&&BOX[id].box;if(bx)o.b={min:bx.slice(0,3),max:bx.slice(3)};const len=Math.max(o.b.max[0]-o.b.min[0],o.b.max[2]-o.b.min[2]);
 const chk=x=>{if(!x)return'=';const d=Math.max(...[0,1,2].flatMap(i=>[Math.abs(x.b.min[i]-o.b.min[i]),Math.abs(x.b.max[i]-o.b.max[i])]))/len;const need=[].concat(GLB[id].paint||[],Object.keys(GLB[id].fix||{}),GLB[id].cell?['Car_Main']:[]);const miss=need.filter(n=>!x.mats.has(n));
  const ok=d<=.01&&!miss.length;if(!ok)bad.push(id+': box '+(d*100).toFixed(2)+'% missing '+miss.join(','));return(ok?'OK':'FAIL')+' ('+(d*100).toFixed(2)+'%)'};
 const cell=x=>x?`${x.tris.toLocaleString('en')} / ${x.tex||'-'} px / ${mb(x.size)}`:'= original';
 rows.push(`| ${id} | ${e.name||''} | ${o.tris.toLocaleString('en')} / ${o.tex||'-'} px / ${mb(o.size)} | ${cell(L)} | ${chk(L)} | ${cell(H)} | ${chk(H)} |`)}
const md=`# Car LOD report (tools/car_lod_check.mjs)

Original = assets/cars/<id>.glb (unchanged). LEVE/light = assets/cars/lod/<id>.glb (traffic and far cars).
HD = assets/cars/hd/<id>.glb when a better source exists, otherwise the original (the best model in the repo).
Cells: triangles / largest texture / file size. Check = bounding box vs src/data/cars/car_bounds.json (max deviation as % of the car length, must be <= 1%; for
placeholders whose new model has other proportions the width/height can differ) and the paint material names of
car_glb.json (paint, fix, Car_Main for cell paint) present.

| id | car | original | light | check | HD | check |
|---|---|---|---|---|---|---|
${rows.join('\n')}

Notes (HD v2): every replaced car comes from its original high-quality Sketchfab source (credits in src/page/app.html),
processed by tools/carhd/ (prep.mjs: badges/plates removed, open doors closed, skins baked, BLEND windows named *_glass,
oriented and scaled to the old assets/cars/<id>.glb bounding box so car_bounds.json/car_glb.json still apply;
simp.mjs: per-material meshoptimizer simplification with normals as attributes; finish.mjs: textures capped, opaque
PNG -> JPEG). HD = full detail (simplified to ~250k triangles only when the source had more), textures <= 2048 px.
LEVE = ~40k triangles, 512 px textures, interior parts that pierced the roof dropped (rwd24, sport3).
assets/cars/<id>.glb (fallback / pages without LOD) is now the same file as the light level. Placeholders hothatch,
v8sport and sportsaloon keep car_glb.json "cell" paint: their body paint is the Car_Main material (white 64 px
texture, every paint vertex mapped to the cell). Cars without "hd" (challenger, sedan98, rearturbo, amgone ...) had
no better source. Known FAILs (proportions of the new model, not a bug): etype (new E-Type source is 10.7% taller
than the old model at the same length), v8sport (the C7 is 20% wider / 5% lower than the old stylised placeholder), amgone (+8% wide, +3% tall),
gt12 (599 GTO +7% wide), coupe85 (M3 E30 box flares +8% wide), saloon90 (roof antenna +16% tall), sedan98 (M3 E46
coupe 2-3% narrower/lower than the old saloon).`;
fs.writeFileSync(path.join(ROOT,'docs/carhd_report.md'),md);console.log(md);process.exit(bad.length?1:0);
