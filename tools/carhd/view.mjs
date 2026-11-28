// node view.mjs out.png file.glb [jsonOpts]   -> 2x2 grid (3/4 front, side, rear 3/4, top) auto-normalised
import {createRequire} from 'module';const req=createRequire('/home/claude/tools/');const {chromium}=req('playwright');import fs from 'fs';
const THREE='/home/claude/tools/t169/node_modules/three';const mime=f=>f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':f.endsWith('.wasm')?'application/wasm':'application/octet-stream';
export async function browser(){const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage();p.on('console',m=>{if(m.type()==='error')console.log('console:',m.text())});
 await p.route('http://local/**',rt=>{const u=new URL(rt.request().url());let f=decodeURIComponent(u.pathname);if(f.startsWith('/three/'))f=THREE+f.slice(6);else if(f.startsWith('/abs/'))f=f.slice(4);else f='/home/claude/carhd_work/view.html';
  if(!fs.existsSync(f))return rt.fulfill({status:404,body:''});rt.fulfill({status:200,body:fs.readFileSync(f),headers:{'content-type':mime(f)}})});
 await p.goto('http://local/view.html');await p.waitForFunction('window.ready');return {b,p}}
export const VIEWS={front34:[[3.7,1.7,4.3],[0,.5,.1],38],side:[[6.3,.9,0],[0,.55,0],40],rear34:[[-4.6,2.0,-5.4],[0,.55,0],40],top:[[0,9,0.01],[0,0,0],38],front:[[0,.8,6.5],[0,.55,0],36],close:[[1.35,.95,2.85],[0,.55,1.55],42]};
if(process.argv[1].endsWith('view.mjs')){const [,,out,file,opts]=process.argv;const o=opts?JSON.parse(opts):{};if(o.hide)o.hide=new RegExp(o.hide,'i');
 const {b,p}=await browser();const vs=o.views||['front34','side','rear34','top'];
 const r=await p.evaluate(async([u,vs,o])=>{if(o.hide)o.hide=new RegExp(o.hide,'i');return window.shot(u,vs,o)},['http://local/abs'+file,vs.map(v=>VIEWS[v]||v),{...o,hide:o.hide?o.hide.source:undefined}]);
 const tmp=r.imgs.map((d,i)=>{const f=`/tmp/v_${i}.png`;fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'));return f});
 const {execFileSync}=await import('child_process');execFileSync('python3',['-c',`import sys;from PIL import Image
fs=sys.argv[2:];ims=[Image.open(f) for f in fs];w,h=ims[0].size;c=2 if len(ims)>1 else 1;rows=(len(ims)+1)//2
o=Image.new('RGB',(w*c,h*rows));[o.paste(im,((i%2)*w,(i//2)*h)) for i,im in enumerate(ims)];o.save(sys.argv[1])`,out,...tmp]);
 console.log(JSON.stringify({tris:r.tris,bb:r.bb}));await b.close()}
