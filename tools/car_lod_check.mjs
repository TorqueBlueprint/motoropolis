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
async function info(f){const doc=await io.read(f),r=doc.getRoot();let tris=0;
 for(const n of r.listNodes()){const m=n.getMesh();if(!m)continue;for(const p of m.listPrimitives()){if(p.getMode()!==4)continue;const i=p.getIndices();tris+=(i?i.getCount():p.getAttribute('POSITION').getCount())/3}}
 const tex=r.listTextures().map(t=>{const s=t.getSize();return s?Math.max(...s):0});const b=getBounds(r.listScenes()[0]);
 return{tris:Math.round(tris),tex:tex.length?Math.max(...tex):0,size:fs.statSync(f).size,gz:fs.existsSync(f+'.gz')?fs.statSync(f+'.gz').size:0,mats:new Set(r.listMaterials().map(m=>m.getName())),b}}
const mb=n=>(n/1048576).toFixed(2)+' MB',rows=[],bad=[];
for(const[id,e]of Object.entries(LOD)){const o=await info(path.join(A,GLB[id].file));
 const lvl=async rel=>rel?await info(path.join(ROOT,rel)):null;const L=await lvl(e.light),H=await lvl(e.hd);
 const len=Math.max(o.b.max[0]-o.b.min[0],o.b.max[2]-o.b.min[2]);
 const chk=x=>{if(!x)return'=';const d=Math.max(...[0,1,2].flatMap(i=>[Math.abs(x.b.min[i]-o.b.min[i]),Math.abs(x.b.max[i]-o.b.max[i])]))/len;const miss=[...o.mats].filter(n=>!x.mats.has(n));
  const ok=d<=.01&&!miss.length;if(!ok)bad.push(id+': box '+(d*100).toFixed(2)+'% missing '+miss.join(','));return(ok?'OK':'FAIL')+' ('+(d*100).toFixed(2)+'%)'};
 const cell=x=>x?`${x.tris.toLocaleString('en')} / ${x.tex||'-'} px / ${mb(x.size)}`:'= original';
 rows.push(`| ${id} | ${e.name||''} | ${o.tris.toLocaleString('en')} / ${o.tex||'-'} px / ${mb(o.size)} | ${cell(L)} | ${chk(L)} | ${cell(H)} | ${chk(H)} |`)}
const md=`# Car LOD report (tools/car_lod_check.mjs)

Original = assets/cars/<id>.glb (unchanged). LEVE/light = assets/cars/lod/<id>.glb (traffic and far cars).
HD = assets/cars/hd/<id>.glb when a better source exists, otherwise the original (the best model in the repo).
Cells: triangles / largest texture / file size. Check = bounding box vs original (max deviation as % of the car
length, must be <= 1%) and every original material name present (paint recolouring).

| id | car | original | light | check | HD | check |
|---|---|---|---|---|---|---|
${rows.join('\n')}

Notes: the light files come from tools/car_lod.sh (gltfpack 1.3 -si <ratio> -slb -km -kn -ke, then gltf-transform resize
512). rwd24 uses tools/car_lod_sel.mjs instead (body paint, glass, lights and chrome untouched, the rest at 0.3): a
uniform 0.52 pass let the roll cage show through the roof. Cars with <= 40k triangles and <= 512 px textures have no
light file (they are already light). No HD file yet: the repo has no higher-quality source than assets/cars/<id>.glb,
so HD = the original; drop a better source in ../car_sources/<id>.glb and run tools/car_lod.sh <id> to make hd/<id>.glb
(then set "hd" in src/data/cars/car_lod.json).

${bad.length?'**Problems:**\n'+bad.map(s=>'- '+s).join('\n'):'All checks passed.'}
`;
fs.writeFileSync(path.join(ROOT,'docs/carhd_report.md'),md);console.log(md);process.exit(bad.length?1:0);
