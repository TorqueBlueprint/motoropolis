import json,sys
from PIL import Image,ImageDraw,ImageFont
M=json.load(open('/tmp/v2meta.json'));F=lambda s:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',s)
W,H=960,600;top=150;c=Image.new('RGB',(W*3,H*3+top),(18,24,38));d=ImageDraw.Draw(c)
d.text((20,16),M['title'],font=F(36),fill=(255,255,255))
for i,m in enumerate(M['meta']):
    d.text((i*W+16,70),m['lab'],font=F(32),fill=(255,214,90) if i else (200,200,200))
    d.text((i*W+16,112),f"{m['tris']:,} triângulos · {m['mb']:.2f} MB".replace(',','.'),font=F(24),fill=(220,220,220))
    for j,f in enumerate(m['imgs']): c.paste(Image.open(f),(i*W,top+j*H))
c.save(sys.argv[1])
