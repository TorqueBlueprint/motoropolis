import {createRequire} from 'module';const req=createRequire('/home/claude/tools/');
export const {NodeIO,getBounds}=req('@gltf-transform/core');export const {ALL_EXTENSIONS}=req('@gltf-transform/extensions');
export const F=await import(req.resolve('@gltf-transform/functions'));
export const {MeshoptSimplifier}=await import(req.resolve('meshoptimizer'));
const draco3d=req('draco3dgltf');
export const io=new NodeIO().setLogger({debug(){},info(){},warn(m){console.warn(m)},error(m){console.error(m)}}).registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule(),'draco3d.encoder':await draco3d.createEncoderModule()});
export const ptris=p=>{if(p.getMode()!==4)return 0;const i=p.getIndices();return (i?i.getCount():p.getAttribute('POSITION').getCount())/3};
// world-space triangle count (instances counted) per material
export function matTris(doc){const M=new Map();let t=0;for(const n of doc.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;for(const p of m.listPrimitives()){const c=ptris(p);t+=c;const k=p.getMaterial()?.getName()||'(none)';M.set(k,(M.get(k)||0)+c)}}return {t,M}}
