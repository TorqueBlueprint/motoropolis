// node finish.mjs in.glb out.glb <maxTex> : textures capped (never upscaled), opaque PNGs -> JPEG q88, then write
import {io,F} from './common.mjs';import {createRequire} from 'module';const req=createRequire('/home/claude/tools/');const sharp=req('sharp');
const [,,inp,out,mx]=process.argv;const max=+mx;const d=await io.read(inp);const R=d.getRoot();
for(const t of R.listTextures()){const img=t.getImage();if(!img)continue;let s=sharp(Buffer.from(img));const meta=await s.metadata();
 // alpha needed? only if used as baseColor of a non-OPAQUE material
 const alpha=t.listParents().some(p=>p.getBaseColorTexture&&p.getBaseColorTexture()===t&&p.getAlphaMode()!=='OPAQUE');
 const w=meta.width,h=meta.height,k=Math.min(1,max/Math.max(w,h));if(k<1)s=s.resize(Math.round(w*k),Math.round(h*k),{kernel:'lanczos3'});
 let buf,mime;if(alpha&&meta.hasAlpha){buf=await s.png({compressionLevel:9}).toBuffer();mime='image/png'}else{buf=await s.flatten().jpeg({quality:88,mozjpeg:true}).toBuffer();mime='image/jpeg'}
 if(k===1&&buf.length>=img.byteLength&&t.getMimeType()===mime)continue;t.setImage(buf).setMimeType(mime).setURI('')}
await d.transform(F.dedup(),F.prune({keepSolidTextures:true}));await io.write(out,d);
