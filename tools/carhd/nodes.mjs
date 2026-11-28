import {io,getBounds,ptris} from './common.mjs';
const f=process.argv[2],pat=process.argv[3]?new RegExp(process.argv[3],'i'):null;const doc=await io.read(f);const r=doc.getRoot();
for(const n of r.listNodes()){const m=n.getMesh();if(!m)continue;const t=m.listPrimitives().reduce((s,p)=>s+ptris(p),0);const b=getBounds(n);
 const s=`${JSON.stringify(n.getName())} m=${JSON.stringify(m.getName())} t=${t} mats=${[...new Set(m.listPrimitives().map(p=>p.getMaterial()?.getName()))].join('|')} min=${b.min.map(v=>v.toFixed(2))} max=${b.max.map(v=>v.toFixed(2))}`;
 if(!pat||pat.test(s))console.log(s)}
