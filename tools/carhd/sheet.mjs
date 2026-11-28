// node sheet.mjs out.png view label=file ...   (one view per car, grid 3 wide)
import {browser,VIEWS} from './view.mjs';import fs from 'fs';import {execFileSync} from 'child_process';
const [,,out,view,...items]=process.argv;const {b,p}=await browser();const cells=[];
for(const it of items){const [lab,f,fl,oj]=it.split('=');try{const r=await p.evaluate(([u,vs,o])=>window.shot(u,vs,o),['http://local/abs'+f,[VIEWS[view]],{W:640,H:400,flip:fl==='1',...(oj?JSON.parse(oj):{})}]);const o=`/tmp/sh_${cells.length}.png`;fs.writeFileSync(o,Buffer.from(r.imgs[0].split(',')[1],'base64'));cells.push([lab+` · ${r.tris.toLocaleString('pt-PT')} tri · ${(fs.statSync(f).size/1048576).toFixed(1)} MB`,o])}catch(e){console.log('ERR',lab,e.message)}}
await b.close();fs.writeFileSync('/tmp/sheet.json',JSON.stringify(cells));
execFileSync('python3',['-c',`import json,sys
from PIL import Image,ImageDraw,ImageFont
C=json.load(open('/tmp/sheet.json'));F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',20)
W,H=640,400;n=len(C);cols=int(__import__('os').environ.get('COLS','3'));rows=(n+cols-1)//cols;o=Image.new('RGB',(W*cols,(H+34)*rows),(18,24,38));d=ImageDraw.Draw(o)
for i,(l,f) in enumerate(C):
  x,y=(i%cols)*W,(i//cols)*(H+34);o.paste(Image.open(f),(x,y+34));d.text((x+8,y+6),l,font=F,fill=(255,255,255))
o.save(sys.argv[1])`,out]);console.log(out);
