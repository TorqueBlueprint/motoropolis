// node v2.mjs <id> <title> <out.png> <antes.glb> <leve.glb> <hd.glb> [flip]
import {browser,VIEWS} from './view.mjs';import fs from 'fs';import {execFileSync} from 'child_process';
const [,,id,title,out,a,l,h,flip]=process.argv;const {b,p}=await browser();const cols=[['ANTES',a],['NOVO LEVE',l],['NOVO HD',h]];const meta=[];
for(const [lab,f] of cols){const r=await p.evaluate(([u,vs,o])=>window.shot(u,vs,o),['http://local/abs'+f,['front34','side','close'].map(v=>VIEWS[v]),{W:960,H:600,flip:flip==='1'}]);
 const fs_=r.imgs.map((d,i)=>{const o=`/tmp/v2_${lab.replace(' ','_')}_${i}.png`;fs.writeFileSync(o,Buffer.from(d.split(',')[1],'base64'));return o});meta.push({lab,tris:r.tris,mb:fs.statSync(f).size/1048576,imgs:fs_})}
await b.close();fs.writeFileSync('/tmp/v2meta.json',JSON.stringify({title,meta}));
execFileSync('python3',['/home/claude/carhd_work/v2compose.py',out]);console.log(out,meta.map(m=>m.lab+' '+m.tris+' '+m.mb.toFixed(2)).join(' | '));
