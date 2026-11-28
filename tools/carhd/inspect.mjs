import {io,getBounds,matTris} from './common.mjs';import fs from 'fs';
const f=process.argv[2];const doc=await io.read(f);const r=doc.getRoot();const {t,M}=matTris(doc);
const a=r.getAsset();console.log('FILE',f,(fs.statSync(f).size/1048576).toFixed(2)+'MB');console.log('asset',JSON.stringify(a.extras||{}).slice(0,600),a.copyright||'',a.generator);
const b=getBounds(r.listScenes()[0]);console.log('bbox',b.min.map(v=>v.toFixed(3)),b.max.map(v=>v.toFixed(3)));
console.log('tris',Math.round(t),'meshes',r.listMeshes().length,'nodes',r.listNodes().length,'mats',r.listMaterials().length,'tex',r.listTextures().length,'anim',r.listAnimations().length,'skins',r.listSkins().length,'ext',r.listExtensionsUsed().map(e=>e.extensionName).join(','));
for(const m of r.listMaterials()){const bc=m.getBaseColorFactor().map(v=>v.toFixed(2)).join(',');const tx=[['bc',m.getBaseColorTexture()],['n',m.getNormalTexture()],['mr',m.getMetallicRoughnessTexture()],['e',m.getEmissiveTexture()],['o',m.getOcclusionTexture()]].filter(x=>x[1]).map(x=>x[0]+':'+(x[1].getSize()||[]).join('x')).join(' ');
 console.log(' M',JSON.stringify(m.getName()),m.getAlphaMode(),'['+bc+']','met',m.getMetallicFactor().toFixed(2),'rou',m.getRoughnessFactor().toFixed(2),tx,'tris',Math.round(M.get(m.getName())||0))}
const tsz=r.listTextures().map(x=>(x.getSize()||[0]).join('x')+' '+x.getMimeType()+' '+(x.getImage()?.byteLength/1024|0)+'KB');console.log('textures',tsz.join(' | '));
if(process.argv[3])for(const n of r.listNodes()){const m=n.getMesh();console.log(' N',JSON.stringify(n.getName()),m?('mesh '+JSON.stringify(m.getName())+' '+m.listPrimitives().map(p=>(p.getMaterial()?.getName())+':'+Math.round(require_t(p))).join(',')):'')}
function require_t(p){const i=p.getIndices();return (i?i.getCount():p.getAttribute('POSITION').getCount())/3}
