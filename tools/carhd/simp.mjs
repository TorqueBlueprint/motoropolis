// node simp.mjs in.glb out.glb <targetTris> ['{"w":{"matRegex":weight},"drop":"regex","err":0.01,"keep":"regex"}']
import {io,F,MeshoptSimplifier,matTris,ptris} from './common.mjs';
await MeshoptSimplifier.ready;const [,,inp,out,tg,oj]=process.argv;const o=oj?JSON.parse(oj):{};const target=+tg;
const W=Object.entries(o.w||{}).map(([k,v])=>[new RegExp(k,'i'),v]);const keep=o.keep?new RegExp(o.keep,'i'):null;const drop=o.drop?new RegExp(o.drop,'i'):null;
async function load(){const d=await io.read(inp);const R=d.getRoot();
 if(drop)for(const n of R.listNodes()){const m=n.getMesh();if(!m)continue;if(drop.test(n.getName()))n.setMesh(null);else for(const p of m.listPrimitives())if(drop.test('mat:'+(p.getMaterial()?.getName()||'')))m.removePrimitive(p)}
 if(o.cabin){const [fx,fy0,fy1,fz]=o.cabin;const items=[];const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  for(const n of R.listNodes()){const m=n.getMesh();if(!m)continue;const W=n.getWorldMatrix();for(const p of m.listPrimitives()){const A=p.getAttribute('POSITION'),e=[];const a=[1e9,1e9,1e9],b=[-1e9,-1e9,-1e9];for(let i=0;i<A.getCount();i++){A.getElement(i,e);for(let r=0;r<3;r++){const v=W[r]*e[0]+W[4+r]*e[1]+W[8+r]*e[2]+W[12+r];a[r]=Math.min(a[r],v);b[r]=Math.max(b[r],v)}}for(let r=0;r<3;r++){mn[r]=Math.min(mn[r],a[r]);mx[r]=Math.max(mx[r],b[r])}items.push([m,p,a,b])}}
  const c=[0,1,2].map(r=>(mn[r]+mx[r])/2),S=[0,1,2].map(r=>mx[r]-mn[r]);const LA=S[0]>S[2]?0:2,WA=2-LA;let k=0;
  for(const [m,p,a,b] of items){const inW=Math.max(Math.abs(a[WA]-c[WA]),Math.abs(b[WA]-c[WA]))<fx*S[WA]/2,inL=Math.max(Math.abs(a[LA]-c[LA]),Math.abs(b[LA]-c[LA]))<fz*S[LA]/2,inY=a[1]>mn[1]+fy0*S[1]&&b[1]<mn[1]+fy1*S[1];
   if(inW&&inL&&inY&&!(o.cabinKeep&&new RegExp(o.cabinKeep,'i').test(p.getMaterial()?.getName()||''))&&!/glass|paint|body|cuerpo/i.test(p.getMaterial()?.getName()||'')){m.removePrimitive(p);k++}}if(!globalThis._cl){console.log('cabin drop prims',k);globalThis._cl=1}}
 await d.transform(F.prune({keepSolidTextures:true}),F.dequantize(),F.flatten(),F.join({keepNamed:false}),F.weld(),F.prune({keepSolidTextures:true}));return d}
function simp1(p,r){const P=p.getAttribute('POSITION'),N=p.getAttribute('NORMAL'),I=p.getIndices();if(!I||p.getMode()!==4||I.getCount()<3)return;const n=P.getCount();const pos=new Float32Array(n*3),nrm=new Float32Array(n*3),e=[];
 for(let i=0;i<n;i++){P.getElement(i,e);pos.set(e,i*3);if(N){N.getElement(i,e);nrm.set(e,i*3)}}
 const idx=new Uint32Array(I.getArray());const tgt=Math.floor(r*idx.length/3)*3;const fl=o.prune?['Prune']:[];
 const [out]=N?MeshoptSimplifier.simplifyWithAttributes(idx,pos,3,nrm,3,[o.nw??.5,o.nw??.5,o.nw??.5],null,tgt,o.err??.01,fl):MeshoptSimplifier.simplify(idx,pos,3,tgt,o.err??.01,fl);
 let res=out;if(res.length>Math.max(1.5*tgt,tgt+900)&&N){const [o3]=MeshoptSimplifier.simplifyWithAttributes(idx,pos,3,nrm,3,[o.nw??.5,o.nw??.5,o.nw??.5],null,tgt,o.err??.01,[...fl,'Permissive']);if(o3.length<res.length)res=o3}if(o.sloppy&&res.length>Math.max(1.5*tgt,tgt+900)){const [o2]=MeshoptSimplifier.simplifySloppy(idx,pos,3,null,tgt,o.sloppy);if(o2.length<res.length)res=o2}
 if(res.length===0){p.dispose();return}
 I.setArray(res);F.compactPrimitive(p)}
function run(d,k){for(const m of d.getRoot().listMeshes())for(const p of m.listPrimitives()){const nm=p.getMaterial()?.getName()||'';if(keep&&keep.test(nm))continue;let w=1;for(const [r,v] of W)if(r.test(nm)){w=v;break}
  const r=Math.min(1,k*w);if(r>=.999)continue;simp1(p,r)}return matTris(d).t}
let d=await load();const t0=matTris(d).t;if(t0<=target){await io.write(out,d);console.log(`${t0} (no simplification)`);process.exit(0)}
let lo=0,hi=1;let best=null;for(let it=0;it<8;it++){const k=(lo+hi)/2;const dd=it?await load():d;const t=run(dd,k);if(t>target)hi=k;else{lo=k;best={dd,t,k}}if(best&&Math.abs(best.t-target)/target<.03)break}
if(!best){const t=run(d=await load(),lo);best={dd:d,t,k:lo}}
await best.dd.transform(F.prune({keepSolidTextures:true}));await io.write(out,best.dd);const {M}=matTris(best.dd);
console.log(`${Math.round(t0)} -> ${Math.round(best.t)} (k=${best.k.toFixed(3)})`);if(o.v)console.log([...M].map(([a,b])=>a+':'+Math.round(b)).join(' '));
