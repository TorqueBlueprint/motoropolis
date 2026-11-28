// Per-material simplification for cars where a plain gltfpack pass lets the interior poke through the thin body shell:
// the listed materials (body paint, glass, lights, chrome) stay untouched, every other primitive is simplified.
//   cd $TOOLS && node <repo>/tools/car_lod_sel.mjs in.glb out.glb <ratio> <keep,material,names> [error]
import {createRequire} from 'module';const req=createRequire(process.cwd()+'/');
const {NodeIO}=req('@gltf-transform/core'),{ALL_EXTENSIONS}=req('@gltf-transform/extensions');
const {simplifyPrimitive}=await import(req.resolve('@gltf-transform/functions'));const {MeshoptSimplifier}=await import(req.resolve('meshoptimizer'));
await MeshoptSimplifier.ready;const [,,inp,out,r,keep,err]=process.argv;const K=new Set((keep||'').split(',').filter(Boolean));
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),doc=await io.read(inp);let a=0,b=0;
const tri=p=>{const i=p.getIndices();return(i?i.getCount():p.getAttribute('POSITION').getCount())/3};
for(const m of doc.getRoot().listMeshes())for(const p of m.listPrimitives()){a+=tri(p);if(!K.has(p.getMaterial()?.getName()||''))simplifyPrimitive(p,{simplifier:MeshoptSimplifier,ratio:+r,error:+(err||.01),lockBorder:false});b+=tri(p)}
await io.write(out,doc);console.log(Math.round(a)+' -> '+Math.round(b)+' triangles');
