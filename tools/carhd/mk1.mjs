// node mk1.mjs out.png file.glb view rx1 rx2 ... -> one view per regex, model loaded once per regex (cached by browser)
import {browser,VIEWS} from './view.mjs';import fs from 'fs';import {execFileSync} from 'child_process';
const [,,out,file,view,...rxs]=process.argv;const {b,p}=await browser();const cells=[];
for(const rx of rxs){const r=await p.evaluate(([u,vs,o])=>window.shot(u,vs,o),['http://local/abs'+file,[VIEWS[view]],{W:560,H:350,mark:'(^| )('+rx+')$'}]);const o=`/tmp/m1_${cells.length}.png`;fs.writeFileSync(o,Buffer.from(r.imgs[0].split(',')[1],'base64'));cells.push([rx,o])}
await b.close();fs.writeFileSync('/tmp/sheet.json',JSON.stringify(cells));
execFileSync('python3',['-c',`import json,sys
from PIL import Image,ImageDraw,ImageFont
C=json.load(open('/tmp/sheet.json'));F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',18)
W,H=560,350;cols=4;rows=(len(C)+cols-1)//cols;o=Image.new('RGB',(W*cols,(H+28)*rows),(18,24,38));d=ImageDraw.Draw(o)
for i,(l,f) in enumerate(C):
  x,y=(i%cols)*W,(i//cols)*(H+28);o.paste(Image.open(f),(x,y+28));d.text((x+8,y+4),l,font=F,fill=(255,255,255))
o.save(sys.argv[1])`,out]);console.log(out);
