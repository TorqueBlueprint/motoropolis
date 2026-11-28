// node prep.mjs <id>  -> work/<id>_fit.glb : badges removed, doors fixed, materials renamed, oriented+scaled to assets/cars/<base>.glb
import {io,F,matTris} from './common.mjs';import {CFG} from './cfg.mjs';import fs from 'fs';
const id=process.argv[2],c=CFG[id];if(!c)throw 'no cfg '+id;const REPO='/home/claude/motoropolis';
const doc=await io.read(c.src);const R=doc.getRoot();const log=[];
const mul=(a,b)=>{const o=new Array(16).fill(0);for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)o[j*4+i]+=a[k*4+i]*b[j*4+k];return o};
const re=s=>s?new RegExp(s,'i'):null;
// --- 1. removals
const rmN=re(c.remove),rmM=re(c.removeMat);let rmT=0;
for(const n of R.listNodes()){const m=n.getMesh();if(!m)continue;
 if(rmN&&rmN.test(n.getName()+' '+m.getName())){for(const p of m.listPrimitives())rmT+=tri(p);log.push('rm node '+n.getName());n.setMesh(null);continue}
 if(rmM)for(const p of m.listPrimitives())if(rmM.test(p.getMaterial()?.getName()||'')){rmT+=tri(p);m.removePrimitive(p);log.push('rm prim '+n.getName()+' / '+p.getMaterial()?.getName())}}
function tri(p){const i=p.getIndices();return (i?i.getCount():p.getAttribute('POSITION').getCount())/3}
// --- 1b. remove whole subtrees by node name
if(c.removeTree){const rt=re(c.removeTree);const kill=n=>{if(n.getMesh()){for(const p of n.getMesh().listPrimitives())rmT+=tri(p);n.setMesh(null)}for(const ch of n.listChildren())kill(ch)};for(const n of R.listNodes())if(rt.test(n.getName())){log.push('rm tree '+n.getName());kill(n)}}
// --- 1c. bake skins (rest pose) into plain meshes at the scene root
{const sc0=R.listScenes()[0];for(const n of R.listNodes()){const sk=n.getSkin(),m=n.getMesh();if(!sk||!m)continue;const J=sk.listJoints().map(j=>j.getWorldMatrix());const IB=sk.getInverseBindMatrices();const M=J.map((w,i)=>{const ib=IB?IB.getElement(i,[]):[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];return mul(w,ib)});
 const nm=doc.createMesh(m.getName()+'_baked');for(const p of m.listPrimitives()){const q=p.clone();for(const s of q.listSemantics())q.setAttribute(s,p.getAttribute(s).clone());if(p.getIndices())q.setIndices(p.getIndices().clone());
  const P=q.getAttribute('POSITION'),N=q.getAttribute('NORMAL'),JJ=q.getAttribute('JOINTS_0'),WW=q.getAttribute('WEIGHTS_0');const e=[],jn=[],wt=[],nn=[];
  const Pf=new Float32Array(P.getCount()*3),Nf=N?new Float32Array(N.getCount()*3):null;
  for(let i=0;i<P.getCount();i++){P.getElement(i,e);JJ.getElement(i,jn);WW.getElement(i,wt);const o=[0,0,0],on=[0,0,0];if(N)N.getElement(i,nn);
   for(let k=0;k<4;k++){const w=wt[k];if(!w)continue;const A=M[jn[k]];for(let r=0;r<3;r++){o[r]+=w*(A[r]*e[0]+A[4+r]*e[1]+A[8+r]*e[2]+A[12+r]);if(N)on[r]+=w*(A[r]*nn[0]+A[4+r]*nn[1]+A[8+r]*nn[2])}}
   Pf.set(o,i*3);if(N){const l=Math.hypot(...on)||1;Nf.set(on.map(v=>v/l),i*3)}}
  q.setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(Pf).setBuffer(P.getBuffer()));if(N)q.setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(Nf).setBuffer(P.getBuffer()));
  for(const s of q.listSemantics())if(/^(JOINTS|WEIGHTS)_/.test(s))q.setAttribute(s,null);nm.addPrimitive(q)}
 n.setMesh(null);sc0.addChild(doc.createNode(n.getName()+'_baked').setMesh(nm));log.push('baked skin '+n.getName())}
 for(const sk of R.listSkins())sk.dispose();for(const a of R.listAnimations())a.dispose()}
// --- 2. mirror copies (close an open door by mirroring the closed one across the car's centre plane)
if(c.mirror){const src=re(c.mirror.nodes),ax={x:0,y:1,z:2}[c.mirror.axis],cen=c.mirror.center;const sc=R.listScenes()[0];
 const Mi=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];Mi[ax*5]=-1;Mi[12+ax]=2*cen;
 for(const n of R.listNodes()){const m=n.getMesh();if(!m||!src.test(n.getName()))continue;const W=mul(Mi,n.getWorldMatrix());
  const nm=doc.createMesh(m.getName()+'_mir');for(const p of m.listPrimitives()){const q=p.clone();for(const s of q.listSemantics())q.setAttribute(s,p.getAttribute(s).clone());if(p.getIndices())q.setIndices(p.getIndices().clone());
   F.transformPrimitive(q,W);
   nm.addPrimitive(q)}
  const nn=doc.createNode(n.getName()+'_mir').setMesh(nm);sc.addChild(nn);log.push('mirror '+n.getName())}}
if(c.flipNormals){const fr=re(c.flipNormals);for(const n of R.listNodes()){if(!n.getMesh()||!fr.test(n.getName()))continue;for(const p of n.getMesh().listPrimitives()){const N=p.getAttribute('NORMAL');if(!N)continue;const N2=N.clone();const a=N2.getArray().slice();for(let i=0;i<a.length;i++)a[i]=-a[i];N2.setArray(a);p.setAttribute('NORMAL',N2)}log.push('flip normals '+n.getName())}}
// --- 3. texture edits
for(const [mn,e] of Object.entries(c.tex||{})){const m=R.listMaterials().find(x=>x.getName()===mn);if(!m){log.push('!! tex: no material '+mn);continue}
 if(e.file){const t=doc.createTexture(mn+'_clean').setImage(fs.readFileSync(e.file)).setMimeType(e.file.endsWith('.png')?'image/png':'image/jpeg');m.setBaseColorTexture(t);log.push('tex replaced '+mn)}
 if(e.drop){m.setBaseColorTexture(null);if(e.color)m.setBaseColorFactor(e.color);log.push('tex dropped '+mn)}}
// --- 4. material renames + glass naming (the game makes non-"glass" BLEND materials opaque)
for(const m of R.listMaterials()){const o=m.getName();if(c.rename&&c.rename[o]!=null){m.setName(c.rename[o]);log.push(`rename ${o} -> ${c.rename[o]}`)}
 else if(m.getAlphaMode()==='BLEND'&&m.getBaseColorFactor()[3]<0.99&&!/glass/i.test(o)&&!(c.noGlass||[]).includes(o)){m.setName(o+'_glass');log.push(`rename ${o} -> ${o}_glass (BLEND)`)}}
for(const [k,v] of Object.entries(c.props||{})){const m=R.listMaterials().find(x=>x.getName()===k);if(!m){log.push('!! props: no material '+k);continue}if(v.color)m.setBaseColorFactor(v.color);if(v.met!=null)m.setMetallicFactor(v.met);if(v.rou!=null)m.setRoughnessFactor(v.rou);if(v.alpha)m.setAlphaMode(v.alpha)}
// --- 4b. placeholder "cell" paint (car_glb.json cell: the loader recolours one 8x8 cell of Car_Main's 64x64 texture):
// the body paint becomes Car_Main with a white 64x64 texture and every paint vertex pointing at the cell centre
if(c.cellPaint){const m=R.listMaterials().find(x=>x.getName()===c.cellPaint.mat);const [cx,cy,cw,ch]=c.cellPaint.cell;const u=(cx+cw/2)/64,v=(cy+ch/2)/64;
 const t=doc.createTexture('car_main_white').setImage(fs.readFileSync('/home/claude/carhd_work/white64.png')).setMimeType('image/png');
 m.setName('Car_Main').setBaseColorTexture(t).setBaseColorFactor([1,1,1,1]).setNormalTexture(null).setMetallicRoughnessTexture(null).setOcclusionTexture(null);
 for(const mm of R.listMeshes())for(const p of mm.listPrimitives()){if(p.getMaterial()!==m)continue;const n=p.getAttribute('POSITION').getCount();const a=new Float32Array(n*2);for(let i=0;i<n;i++){a[i*2]=u;a[i*2+1]=v}
  p.setAttribute('TEXCOORD_0',doc.createAccessor().setType('VEC2').setArray(a).setBuffer(p.getAttribute('POSITION').getBuffer()))}
 m.getBaseColorTextureInfo().setTexCoord(0);log.push(`cell paint ${c.cellPaint.mat} -> Car_Main @ ${u},${v}`)}
await doc.transform(F.prune({keepSolidTextures:true}));
// --- 5. world vertices
function verts(d){const out=[];for(const n of d.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;const W=n.getWorldMatrix();for(const p of m.listPrimitives()){const A=p.getAttribute('POSITION'),e=[];const N=A.getCount(),st=Math.max(1,Math.floor(N/4000));for(let i=0;i<N;i+=st){A.getElement(i,e);out.push([W[0]*e[0]+W[4]*e[1]+W[8]*e[2]+W[12],W[1]*e[0]+W[5]*e[1]+W[9]*e[2]+W[13],W[2]*e[0]+W[6]*e[1]+W[10]*e[2]+W[14]])}}}return out}
// exact bounds (all vertices)
function bounds(d){const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(const n of d.getRoot().listNodes()){const m=n.getMesh();if(!m)continue;const W=n.getWorldMatrix();for(const p of m.listPrimitives()){const A=p.getAttribute('POSITION'),e=[];for(let i=0;i<A.getCount();i++){A.getElement(i,e);const v=[W[0]*e[0]+W[4]*e[1]+W[8]*e[2]+W[12],W[1]*e[0]+W[5]*e[1]+W[9]*e[2]+W[13],W[2]*e[0]+W[6]*e[1]+W[10]*e[2]+W[14]];for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],v[k]);mx[k]=Math.max(mx[k],v[k])}}}}return {mn,mx}}
const old=await io.read(c.ref||`/home/claude/carhd_work/orig/${c.base||id}.glb`);const ob=bounds(old),ov=verts(old);
const oLA=(ob.mx[0]-ob.mn[0])>(ob.mx[2]-ob.mn[2])?0:2,oWA=2-oLA,oLen=ob.mx[oLA]-ob.mn[oLA];
const NB=48;function prof(V,b){const L=b.mx[oLA]-b.mn[oLA],cw=(b.mx[oWA]+b.mn[oWA])/2,H=new Float64Array(NB),Wd=new Float64Array(NB),Lo=new Float64Array(NB).fill(1);for(const v of V){const i=Math.min(NB-1,Math.floor((v[oLA]-b.mn[oLA])/L*NB));if(i<0)continue;const h=(v[1]-b.mn[1])/L;H[i]=Math.max(H[i],h);Lo[i]=Math.min(Lo[i],h);Wd[i]=Math.max(Wd[i],Math.abs(v[oWA]-cw)/L)}return {H,Wd,Lo}}
const op=prof(ov,ob);const nv0=verts(doc);
let best=null;for(const deg of (c.yaw!=null?[c.yaw]:[0,90,180,270])){const t=deg*Math.PI/180,co=Math.cos(t),si=Math.sin(t);const V=nv0.map(v=>[v[0]*co+v[2]*si,v[1],-v[0]*si+v[2]*co]);
 const b={mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9]};for(const v of V)for(let k=0;k<3;k++){b.mn[k]=Math.min(b.mn[k],v[k]);b.mx[k]=Math.max(b.mx[k],v[k])}
 const p=prof(V,b);let d=0;for(let i=0;i<NB;i++)d+=Math.abs(p.H[i]-op.H[i])+Math.abs(p.Wd[i]-op.Wd[i])+.5*Math.abs(p.Lo[i]-op.Lo[i]);log.push(`yaw ${deg}: profile diff ${d.toFixed(3)}`);if(!best||d<best.d)best={d,deg,co,si}}
// exact rotated bounds
const nb0=bounds(doc);const {co,si}=best;const corners=[];for(const x of [nb0.mn[0],nb0.mx[0]])for(const z of [nb0.mn[2],nb0.mx[2]])corners.push([x*co+z*si,-x*si+z*co]);
// rotation of a box is exact only at 90° steps (it is)
const qmn=[Math.min(...corners.map(v=>v[0])),nb0.mn[1],Math.min(...corners.map(v=>v[1]))],qmx=[Math.max(...corners.map(v=>v[0])),nb0.mx[1],Math.max(...corners.map(v=>v[1]))];
const s=oLen/(qmx[oLA]-qmn[oLA]);const cq=[(qmn[0]+qmx[0])/2,qmn[1],(qmn[2]+qmx[2])/2],co_=[(ob.mn[0]+ob.mx[0])/2,ob.mn[1],(ob.mn[2]+ob.mx[2])/2];
// M = T(co - s*cq) * S(s) * Ry   (column-major)
const M=[s*co,0,-s*si,0, 0,s,0,0, s*si,0,s*co,0, co_[0]-s*cq[0],co_[1]-s*cq[1],co_[2]-s*cq[2],1];
const sc=R.listScenes()[0];const root=doc.createNode(id+'_root').setMatrix(M);for(const ch of sc.listChildren()){sc.removeChild(ch);root.addChild(ch)}sc.addChild(root);
const nb=bounds(doc);const dims=b=>[b.mx[0]-b.mn[0],b.mx[1]-b.mn[1],b.mx[2]-b.mn[2]];const od=dims(ob),nd=dims(nb);
const fit={yaw:best.deg,scale:s,old:od.map(v=>+v.toFixed(4)),new:nd.map(v=>+v.toFixed(4)),dev_pct:od.map((v,i)=>+((nd[i]-v)/v*100).toFixed(2)),oldMin:ob.mn.map(v=>+v.toFixed(4)),newMin:nb.mn.map(v=>+v.toFixed(4)),newMax:nb.mx.map(v=>+v.toFixed(4)),oldMax:ob.mx.map(v=>+v.toFixed(4)),removedTris:rmT,tris:Math.round(matTris(doc).t)};
fs.mkdirSync('work',{recursive:true});await io.write(`work/${id}_fit.glb`,doc);
fs.writeFileSync(`work/${id}_prep.json`,JSON.stringify({fit,log},null,1));console.log(log.filter(l=>!l.startsWith('rm prim')).join('\n'));console.log(JSON.stringify(fit));
