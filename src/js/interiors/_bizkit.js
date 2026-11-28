//@ interiors/_bizkit.js - shared kit for the shops as businesses (Phase 3): merged geometry (OFG), materials (OFM), the car re-baker (OFC),
//@ one atlas per shop (bizAtlas), shared painters (BIZP: job card, job board, till, invoice + stamp), the panel line, hover / click,
//@ walking, staff tags and the exterior "SERVICE IN PROGRESS" pill. Used by interiors/oficina.js, pneus.js, lavagem.js, inspecao.js.
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- merged geometry: vertex colours, atlas UVs remapped per part (same scheme as the fire station / hospital); every atlas is 2048 px ----------
 const OFG=(()=>{
  const UB=new T.BoxGeometry(1,1,1),AW=2048;
  const xf=(x,y,z,rx,ry,rz,sx,sy,sz)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,'YXZ')),new T.Vector3(sx||1,sy||sx||1,sz||sx||1));
  function merge(list){let nv=0,ni=0;for(const q of list){nv+=q.g.attributes.position.count;ni+=q.g.index?q.g.index.count:q.g.attributes.position.count}
   const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),col=new Float32Array(nv*3),ind=new Uint32Array(ni),v=new T.Vector3(),nm=new T.Matrix3(),c=new T.Color();let vo=0,io=0;
   for(const q of list){const g=q.g,P=g.attributes.position,N=g.attributes.normal,UV=g.attributes.uv,r=q.r;nm.getNormalMatrix(q.m);c.set(q.c==null?0xffffff:q.c);
    for(let i=0;i<P.count;i++){const o=vo+i;v.fromBufferAttribute(P,i).applyMatrix4(q.m);pos[o*3]=v.x;pos[o*3+1]=v.y;pos[o*3+2]=v.z;v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[o*3]=v.x;nor[o*3+1]=v.y;nor[o*3+2]=v.z;
     let u=UV?UV.getX(i):0,w=UV?UV.getY(i):0;if(r){u=(r[0]+1+u*(r[2]-2))/AW;w=1-(r[1]+1+(1-w)*(r[3]-2))/AW}uv[o*2]=u;uv[o*2+1]=w;col[o*3]=c.r;col[o*3+1]=c.g;col[o*3+2]=c.b}
    const I=g.index,n=I?I.count:P.count,flip=q.m.determinant()<0;for(let k=0;k<n;k+=3){const a=I?I.getX(k):k,b=I?I.getX(k+1):k+1,cc=I?I.getX(k+2):k+2;ind[io++]=vo+a;if(flip){ind[io++]=vo+cc;ind[io++]=vo+b}else{ind[io++]=vo+b;ind[io++]=vo+cc}}
    vo+=P.count}
   for(const q of list)if(q.g!==UB&&!q.keep)q.g.dispose();
   const o=new T.BufferGeometry();o.setAttribute('position',new T.BufferAttribute(pos,3));o.setAttribute('normal',new T.BufferAttribute(nor,3));o.setAttribute('uv',new T.BufferAttribute(uv,2));o.setAttribute('color',new T.BufferAttribute(col,3));
   o.setIndex(new T.BufferAttribute(ind,1));o.computeBoundingSphere();return o}
  // box: (w,h,d) with its base at y (like box())
  const bx=(L,w,h,d,c,x,y,z,ry,rx,rz)=>{L.push({g:UB,c,m:xf(x,y+h/2,z,rx,ry,rz,w,h,d),box:1});return L};
  const cyl=(L,rt,rb,h,n,c,x,y,z,rx,ry,rz)=>{L.push({g:new T.CylinderGeometry(rt,rb,h,n),c,m:xf(x,y,z,rx,ry,rz)});return L};
  // quad: a plane showing atlas region k (of the atlas A, default the repair shop's)
  const quad=(L,k,w,h,x,y,z,ry,rx,A)=>{L.push({g:new T.PlaneGeometry(w,h),c:0xffffff,r:(A||OFA).RG[k],m:xf(x,y,z,rx||0,ry||0,0)});return L};
  const place=(L,x,z,ry)=>{const P=xf(x,0,z,0,ry||0,0);for(const q of L)q.m.premultiply(P);return L};
  // one LineSegments geometry with the edges of every box part (the blueprint ghosts)
  function edges(list){const E=new T.EdgesGeometry(UB),P=E.attributes.position,out=[],v=new T.Vector3();for(const q of list){if(!q.box)continue;for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(q.m);out.push(v.x,v.y,v.z)}}
   E.dispose();const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(out,3));return g}
  return{UB,xf,merge,bx,cyl,quad,place,edges}})();
 const OFM={vc:new T.MeshStandardMaterial({vertexColors:true,roughness:.72,metalness:.08}),body:new T.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:.25}),
  glass:new T.MeshStandardMaterial({vertexColors:true,roughness:.08,metalness:.4,transparent:true,opacity:.62,depthWrite:false}),wheel:new T.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:.3})};
 // ---------- a car for a lift: the city's own car model, re-baked into 3 meshes (body, glass, wheels) so the wheels can come off ----------
 const OFC=(()=>{
  const pix=new Map();
  function texData(t){if(!t||!t.image)return null;const id=t.uuid;if(pix.has(id))return pix.get(id);let d=null;try{const im=t.image,w=im.width||im.videoWidth,h=im.height||im.videoHeight;if(w&&h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);d={w,h,a:x.getImageData(0,0,w,h).data,flip:t.flipY}}}catch(e){d=null}pix.set(id,d);return d}
  const glbReady=m=>!!(X&&X.cars&&m&&m.glb&&X.cars[m.glb]&&!X.cars[m.glb].lazyCar);
  function build(j){const spec={kind:'car',len:j.m.len,wid:j.m.wid,color:j.color,m:j.m};const root=carMesh(spec);if(!glbReady(j.m))return{g:root,wh:null,hub:null,lazy:!!(X&&X.cars&&j.m.glb)};
   try{const r=split(root);if(r)return r}catch(e){console.warn('lift car',e)}return{g:root,wh:null,hub:null,lazy:false}}
  function split(root){root.updateMatrixWorld(true);const inv=new T.Matrix4().copy(root.matrixWorld).invert(),ms=[];root.traverse(o=>{if(o.isMesh&&o.visible&&o.geometry&&o.geometry.attributes.position&&!Array.isArray(o.material))ms.push(o)});
   if(!ms.length)return null;const v=new T.Vector3();let y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;const mats=ms.map(o=>new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));
   ms.forEach((o,i)=>{const P=o.geometry.attributes.position;for(let k=0;k<P.count;k++){v.fromBufferAttribute(P,k).applyMatrix4(mats[i]);if(v.y<y0)y0=v.y;if(v.y>y1)y1=v.y;if(v.z<z0)z0=v.z;if(v.z>z1)z1=v.z}});
   const H=y1-y0,Lz=z1-z0,cz=(z0+z1)/2,Q=[0,1,2,3].map(()=>({x:0,z:0,n:0}));
   ms.forEach((o,i)=>{const P=o.geometry.attributes.position;for(let k=0;k<P.count;k++){v.fromBufferAttribute(P,k).applyMatrix4(mats[i]);if(v.y>y0+.03*H)continue;const q=(v.x>0?1:0)+(v.z>cz?2:0);Q[q].x+=v.x;Q[q].z+=v.z;Q[q].n++}});
   if(Q.some(q=>!q.n))return null;const rad=clamp(.073*Lz,.24,.42),W=Q.map(q=>({x:q.x/q.n,z:q.z/q.n}));
   const inW=(x,y,z)=>{for(const w of W){const ax=Math.abs(x),aw=Math.abs(w.x);if(ax<aw-.17||ax>aw+.22||Math.sign(x)!==Math.sign(w.x))continue;const dy=y-(y0+rad),dz=z-w.z;if(dy*dy+dz*dz<rad*rad*1.12)return true}return false};
   const B={p:[],n:[],c:[]},G={p:[],n:[],c:[]},Wh={p:[],n:[],c:[]},nm=new T.Matrix3(),c=new T.Color(),tc=new T.Color(),e=new T.Color(),vA=[new T.Vector3(),new T.Vector3(),new T.Vector3()],nA=[new T.Vector3(),new T.Vector3(),new T.Vector3()],cA=[new T.Color(),new T.Color(),new T.Color()];
   ms.forEach((o,i)=>{const g=o.geometry,P=g.attributes.position,N=g.attributes.normal,UV=g.attributes.uv,CO=g.attributes.color,I=g.index,mt=o.material;nm.getNormalMatrix(mats[i]);
    const glass=(mt.transparent&&mt.opacity<.98)||/glass|window/i.test(mt.name||''),td=mt.map?texData(mt.map):null;c.copy(mt.color||tc.set(0xffffff));e.copy(mt.emissive||tc.set(0)).multiplyScalar(Math.min(1,(mt.emissiveIntensity||0)*.5));
    const n=I?I.count:P.count;for(let t=0;t<n;t+=3){let cxs=0,cys=0,czs=0;for(let q=0;q<3;q++){const k=I?I.getX(t+q):t+q;vA[q].fromBufferAttribute(P,k).applyMatrix4(mats[i]);cxs+=vA[q].x;cys+=vA[q].y;czs+=vA[q].z;
      if(N)nA[q].fromBufferAttribute(N,k).applyMatrix3(nm).normalize();else nA[q].set(0,1,0);const cc=cA[q].copy(c);
      if(td&&UV){let u=UV.getX(k),w=UV.getY(k);u=u-Math.floor(u);w=w-Math.floor(w);const px=Math.min(td.w-1,Math.floor(u*td.w)),py=Math.min(td.h-1,Math.floor((td.flip?1-w:w)*td.h)),ii=(py*td.w+px)*4;tc.setRGB(td.a[ii]/255,td.a[ii+1]/255,td.a[ii+2]/255,T.SRGBColorSpace);cc.multiply(tc)}
      if(CO)cc.multiply(tc.setRGB(CO.getX(k),CO.getY(k),CO.getZ(k)));cc.add(e)}
     const D=glass?G:inW(cxs/3,cys/3,czs/3)?Wh:B;for(let q=0;q<3;q++){D.p.push(vA[q].x,vA[q].y,vA[q].z);D.n.push(nA[q].x,nA[q].y,nA[q].z);D.c.push(cA[q].r,cA[q].g,cA[q].b)}}});
   const mk=(D,m)=>{if(!D.p.length)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(D.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(D.n,3));g.setAttribute('color',new T.Float32BufferAttribute(D.c,3));g.computeBoundingSphere();return new T.Mesh(g,m)};
   const out=new T.Group(),body=mk(B,OFM.body),gl=mk(G,OFM.glass),wh=mk(Wh,OFM.wheel);if(body){body.castShadow=true;out.add(body)}if(gl)out.add(gl);
   // brake discs, calipers and hubs (seen only with the wheels off)
   const HL=[];for(const w of W){const s=Math.sign(w.x)||1,hx=w.x-s*.08,hy=y0+rad;OFG.cyl(HL,rad*.72,rad*.72,.05,18,0xb9c0c8,hx,hy,w.z,0,0,Math.PI/2);OFG.cyl(HL,rad*.28,rad*.28,.09,10,0x3a3f46,hx+s*.03,hy,w.z,0,0,Math.PI/2);OFG.bx(HL,.1,rad*.55,rad*.5,0xc8231c,hx-s*.02,hy+rad*.3,w.z+(w.z>cz?-1:1)*rad*.38)}
   const hub=new T.Mesh(OFG.merge(HL),OFM.vc);hub.visible=false;out.add(hub);
   const wg=new T.Group();if(wh){wh.castShadow=true;wg.add(wh)}
   return{g:out,wh:wg,hub,lazy:false}}
  return{build,glbReady}})();
 // ---------- one atlas canvas per shop: every card and board of the shop on one 2048 px canvas, redrawn only when its content changes ----------
 function bizAtlas(RG){
  const AW=2048,FN="'Barlow Condensed','Arial Narrow',sans-serif",MONO="'JetBrains Mono',monospace";
  const A={AW,RG,FN,MONO,cx:null,tex:null};
  A.paint=(k,fn)=>{const r=RG[k],x=A.cx;x.save();x.translate(r[0],r[1]);x.beginPath();x.rect(0,0,r[2],r[3]);x.clip();x.textAlign='center';x.textBaseline='middle';fn(x,r[2],r[3]);x.restore()};
  A.font=(x,sz,w,fam)=>{x.font=`${w||800} ${sz}px ${fam||FN}`};
  A.fit=(x,t,maxW,sz,w,fam)=>{A.font(x,sz,w,fam);while(x.measureText(t).width>maxW&&sz>9){sz-=1;A.font(x,sz,w,fam)}return sz};
  A.txt=(x,t,cx,cy,maxW,sz,col,w,fam,al)=>{t=String(t);A.fit(x,t,maxW,sz,w,fam);x.fillStyle=col;if(al)x.textAlign=al;x.fillText(t,cx,cy);x.textAlign='center'};
  A.bar=(x,sku,x0,y0,w,h)=>{x.fillStyle='#ffffff';x.fillRect(x0,y0,w,h);x.fillStyle='#111';let s=SHOPS.h32('bar',sku),px=x0+4;while(px<x0+w-5){const bw=1+(s&3);x.fillRect(px,y0+3,bw,h-6);px+=bw+1+((s>>>2)&3);s=Math.imul(s^(s>>>7),2654435761)>>>0}};
  A.init=()=>{const cv=document.createElement('canvas');cv.width=cv.height=AW;A.cx=cv.getContext('2d');const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;A.tex=tex;return tex};
  A.mat=()=>new T.MeshStandardMaterial({map:A.tex,emissive:0xffffff,emissiveMap:A.tex,emissiveIntensity:.5,roughness:.85});
  return A}
 // ---------- shared painters for every shop (E = the shop's engine from sim/shopjobs.js) ----------
 const BIZP=(()=>{
  const hm=ts=>{const d=new Date(ts*1000);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
  const who=(E,j)=>j.name&&!E.hidden(j.name)?j.name:null;
  const min=s=>Math.max(1,Math.ceil(s/60))+' min';
  const kmmi=km=>`${Math.round(km).toLocaleString('en-US')} km / ${Math.round(km*.621371).toLocaleString('en-US')} mi`;
  const staffLbl=(E,j)=>{const n=E.staffName(j);return n&&!E.hidden(n)?n:n?E.ROLE:E.ROLE+' JOB OPEN'};
  // a rubber stamp (PAID red, PASS green, FAIL red): rgb like '200,35,28'
  function stamp(A,x,cx,cy,text,rgb,w,h,size,rot){x.save();x.translate(cx,cy);x.rotate(rot==null?-.24:rot);w=w||256;h=h||96;x.strokeStyle=`rgba(${rgb},.88)`;x.lineWidth=9;x.strokeRect(-w/2,-h/2,w,h);x.lineWidth=3;x.strokeRect(-w/2+12,-h/2+11,w-24,h-22);
   A.fit(x,text,w-40,size||76,800);x.fillStyle=`rgba(${rgb},.9)`;x.fillText(text,0,6);x.restore()}
  /* a bay's job card. o: {bay: 'LIFT', free: 'BAY FREE', col: stage colours, dark: stages with dark header text, pipW, readyTxt, doneTxt, rows(x,A,j,a,W,H)}
     no job on a bay past E.ACT = the empty post: "<BAY> n · NO <ROLE> / <ROLE> / JOB OPEN / Comment WORKSHOP <ROLE>" */
  function card(A,key,k,a,t,E,o){const txt=A.txt;A.paint(key,(x,W,H)=>{const ky=H/256;x.fillStyle='#f7f5ef';x.fillRect(0,0,W,H);x.strokeStyle='#22252b';x.lineWidth=6;x.strokeRect(3,3,W-6,H-6);
    if(!a&&k>=E.ACT){x.fillStyle='#16181c';x.fillRect(6,6,W-12,52);txt(x,`${o.bay} ${k+1} · NO ${E.ROLE}`,W/2,33,W-30,38,'#ffffff');txt(x,E.ROLE,W/2,100*ky,W-40,30,'#6b7280',700);txt(x,'JOB OPEN',W/2,146*ky,W-40,46,'#e0482f',900);txt(x,E.OPEN,W/2,192*ky,W-40,24,'#4a4f57',700);return}
    if(!a){x.fillStyle='#3a3f46';x.fillRect(6,6,W-12,52);txt(x,`${o.bay} ${k+1} · ${o.free||'BAY FREE'}`,W/2,33,W-30,38,'#ffffff');const g=Math.floor(t/E.STEP);let nx=null;for(let q=g;q<g+8&&!nx;q++){const j=E.job(q);if(j.bay===k&&j.t0>t)nx=j}
     txt(x,o.nextTxt||'NEXT CAR',W/2,100*ky,W-40,30,'#6b7280',700);if(!E.open())txt(x,'CLOSED',W/2,142*ky,W-40,40,'#16181c',800);else if(nx){txt(x,`${nx.no} · ${hm(nx.t0)}`,W/2,142*ky,W-40,40,'#16181c',800,A.MONO);txt(x,nx.svc,W/2,190*ky,W-40,28,'#4a4f57',700)}return}
    const j=a.j,s=a.s,RD=E.RD,col=o.col[Math.min(s,o.col.length-1)];x.fillStyle=col;x.fillRect(6,6,W-12,52);txt(x,j.no,20,33,170,40,'#ffffff',800,A.MONO,'left');txt(x,E.STAGES[s],W-18,33,190,30,(o.dark||[]).includes(s)?'#16181c':'#ffffff',800,null,'right');
    x.fillStyle='#ffd34d';x.fillRect(16,70,156,40);x.strokeStyle='#16181c';x.lineWidth=3;x.strokeRect(16,70,156,40);txt(x,j.plate,94,91,146,28,'#16181c',800,A.MONO);
    txt(x,`${o.bay} ${k+1} · IN ${hm(j.t0)}`,W-16,90,190,22,'#4a4f57',700,null,'right');
    txt(x,j.svc,W/2,135,W-30,32,'#16181c',800);const wn=who(E,j);txt(x,wn?`★ ${wn}`:'CUSTOMER · '+j.plate,W/2,170,W-30,24,wn?'#b5520e':'#4a4f57',700);
    if(o.rows)o.rows(x,A,j,a,W,H);
    const np=RD+1,pw=o.pipW||Math.floor((W-36)/np);for(let i=0;i<np;i++){const skip=i<RD&&j.st[i]===j.st[i+1];x.fillStyle=i<s?(skip?'#b9d8c6':'#2e8b57'):i===s?o.col[Math.min(s,o.col.length-1)]:skip?'#ece9e0':'#d5d2c8';x.fillRect(18+i*pw,H-64,pw-6,12)}
    const ml=staffLbl(E,j),mn=E.staffName(j);
    txt(x,s<RD?`${min(a.left)} LEFT`:s===RD?(typeof o.readyTxt==='function'?o.readyTxt(j):o.readyTxt||'READY TO COLLECT'):(o.doneTxt||'HANDED OVER ✓'),20,H-26,170,26,s<RD?'#c8231c':o.readyCol?o.readyCol(j):'#2e8b57',800,null,'left');txt(x,ml,W-18,H-26,180,22,mn?'#16181c':'#9aa3ae',700,null,'right')})}
  /* the job board (kanban). o: {title, cols: [[name, [stages], colour]], darkCols, bay, readyTxt, doneTxt, foot} */
  function board(A,key,A0,t,E,o){const txt=A.txt;A.paint(key,(x,W,H)=>{x.fillStyle='#f4f2ec';x.fillRect(0,0,W,H);x.strokeStyle='#8a6a42';x.lineWidth=14;x.strokeRect(7,7,W-14,H-14);
    x.fillStyle='#22252b';x.fillRect(14,14,W-28,74);txt(x,o.title,W/2-120,52,W-330,46,'#ffd34d');txt(x,hm(t),W-80,52,140,40,'#ffffff',700,A.MONO);
    const cols=o.cols,cw=(W-40)/cols.length,dk=o.darkCols||[0];
    cols.forEach(([nm,ss,cc],ci)=>{const x0=20+ci*cw;x.fillStyle=cc;x.fillRect(x0+6,98,cw-12,46);txt(x,nm,x0+cw/2,122,cw-30,32,dk.includes(ci)?'#16181c':'#ffffff');
     const L=A0.filter(a=>a&&ss.includes(a.s)).sort((a,b)=>a.j.t0-b.j.t0);
     L.slice(0,3).forEach((a,i)=>{const j=a.j,y=156+i*176;x.fillStyle=a.s===E.NS-1?'#e4e2da':'#fff8d6';x.fillRect(x0+10,y,cw-20,164);x.fillStyle='rgba(0,0,0,.12)';x.fillRect(x0+10,y+158,cw-20,6);x.fillStyle=cc;x.fillRect(x0+10,y,cw-20,8);
      txt(x,j.no,x0+22,y+32,140,32,'#16181c',800,A.MONO,'left');txt(x,j.plate,x0+cw-22,y+32,130,24,'#4a4f57',700,A.MONO,'right');
      txt(x,j.svc,x0+cw/2,y+70,cw-40,28,'#16181c',800);const wn=who(E,j);txt(x,wn?`★ ${wn}`:'CUSTOMER',x0+cw/2,y+102,cw-40,22,wn?'#b5520e':'#6b7280',700);
      txt(x,`${o.bay} ${j.bay+1} · ${staffLbl(E,j)}`,x0+cw/2,y+128,cw-40,20,'#4a4f57',600);
      txt(x,a.s<E.RD?`${E.STAGES[a.s]} · ${min(a.left)} LEFT`:a.s===E.RD?(typeof o.readyTxt==='function'?o.readyTxt(j):o.readyTxt||'READY · AWAITING PAYMENT'):(o.doneTxt||'COLLECTED · PAID ✓'),x0+cw/2,y+150,cw-40,20,a.s<E.RD?'#c8231c':'#2e8b57',800)});
     if(!L.length)txt(x,'—',x0+cw/2,300,80,40,'#b9b6aa',700)});
    txt(x,o.foot||'Hover or click a car on a lift to see who is working on it',W/2,H-30,W-80,22,'#6b7280',600)})}
  /* the till: "TODAY: n JOBS · X TC" since 00:00 UTC and the latest invoices with their PAID tag. o: {title, tag(j) -> [text, colour]} */
  function till(A,key,t,E,o){o=o||{};const txt=A.txt,td=E.today(t),L=E.invoices(t,7);A.paint(key,(x,W,H)=>{x.fillStyle='#0d1014';x.fillRect(0,0,W,H);x.strokeStyle='#2e8b57';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);
    txt(x,o.title||'THE TILL · TODAY (UTC)',W/2,40,W-40,36,'#5cc98a');x.fillStyle='#16241c';x.fillRect(22,68,W-44,92);txt(x,`TODAY: ${td.n} JOBS · ${E.tc(td.tc)}`,W/2,114,W-70,52,'#ffd34d',800,A.MONO);
    txt(x,'LATEST INVOICES',W/2,186,W-40,26,'#9aa3ae',800);L.forEach((j,i)=>{const y=222+i*40,wn=who(E,j);x.fillStyle=i%2?'#151a20':'#11161b';x.fillRect(22,y-17,W-44,36);
     txt(x,j.no,36,y+1,110,20,'#9fd0ff',700,A.MONO,'left');txt(x,wn?`★ ${wn}`:j.plate,150,y+1,220,20,'#eef3fb',700,null,'left');txt(x,E.tc(j.total),W-130,y+1,120,20,'#ffd34d',700,A.MONO,'right');
     const tg=o.tag?o.tag(j):['PAID','#c8231c'];x.fillStyle=tg[1];x.fillRect(W-118,y-12,82,26);txt(x,tg[0],W-77,y+2,74,20,'#ffffff',800)});
    if(!L.length)txt(x,E.open()?'No jobs finished yet today':'CLOSED',W/2,300,W-60,24,'#6b7280',700);
    txt(x,'Torque Coins (TC) · display only for now',W/2,H-24,W-40,18,'#6b7280',600)})}
  /* the latest invoice with its red PAID stamp. o: {name, doc, accent, docCol, rows(j) -> [[label, value]], head, lines(j) -> [[text, TC]], note(j), stamp: [text, rgb]} */
  function invoice(A,key,j,E,o){const txt=A.txt;A.paint(key,(x,W,H)=>{x.fillStyle='#fdfcf8';x.fillRect(0,0,W,H);x.fillStyle=o.accent||'#ff7a1a';x.fillRect(0,0,W,14);
    txt(x,o.name,W/2,48,W-40,32,'#16181c');txt(x,o.doc||'INVOICE',W/2,86,W-40,28,o.docCol||'#b5520e',800);
    if(!j){txt(x,'No invoices yet today',W/2,300,W-60,28,'#6b7280',700);return}
    const rows=o.rows(j);rows.forEach(([a,b],i)=>{const y=124+i*30;txt(x,a,24,y,120,20,'#6b7280',700,null,'left');txt(x,b,150,y,W-170,22,'#16181c',700,null,'left')});
    const sy=124+rows.length*30+6;x.fillStyle='#22252b';x.fillRect(18,sy,W-36,3);let y=sy+28;txt(x,o.head||'PARTS + LABOUR',24,y,200,20,'#6b7280',800,null,'left');txt(x,'TC',W-24,y,80,20,'#6b7280',800,null,'right');
    for(const[a,v]of o.lines(j)){y+=34;txt(x,a,24,y,W-150,22,'#16181c',700,null,'left');txt(x,v.toLocaleString('en-US'),W-24,y,110,22,'#16181c',700,A.MONO,'right')}
    y+=22;x.fillStyle='#22252b';x.fillRect(18,y,W-36,3);y+=34;txt(x,'TOTAL',24,y,160,28,'#16181c',800,null,'left');txt(x,E.tc(j.total),W-24,y,240,30,'#16181c',800,A.MONO,'right');
    y+=36;txt(x,o.note(j),W/2,y,W-40,19,'#4a4f57',700);
    const sp=o.stamp||['PAID','200,35,28'];stamp(A,x,W*.62,H-120,sp[0],sp[1]);
    txt(x,`Thank you! · ${E.tc(j.total)} into the city's till`,W/2,H-24,W-40,20,'#4a4f57',700)})}
  return{hm,who,min,kmmi,staffLbl,stamp,card,board,till,invoice}})();
 // the panel line at the bottom of the screen: who is doing what (accent = the shop's colour)
 function bizPanelLine(ln,accent){if(!ln||(window.__HIDE&&window.__HIDE.some(n=>ln.includes(n))))return;let f=34*(HUDH===CH?HUDSC:1);hctx.font=`700 ${f}px 'Barlow Condensed', sans-serif`;while(hctx.measureText(ln).width>HUDW-90&&f>11){f--;hctx.font=`700 ${f}px 'Barlow Condensed', sans-serif`}
  const lw=hctx.measureText(ln).width+48,lh=f*1.9,ly=HUDH-lh-Math.max(18,HUDH*.04);hctx.fillStyle='rgba(16,19,24,.9)';rrect(hctx,HUDW/2-lw/2,ly,lw,lh,10);hctx.fill();hctx.fillStyle=accent||'#ff7a1a';hctx.fillRect(HUDW/2-lw/2,ly+6,5,lh-12);
  hctx.fillStyle='#ffffff';hctx.textAlign='center';hctx.textBaseline='middle';hctx.fillText(ln,HUDW/2+2,ly+lh/2+1)}
 // hover / click inside a shop: st.hover / st.pin = hit(hudX, hudY) ({k: bay} or {m: staff index})
 function bizPointer(type,st,hit){const dom=renderer.domElement,h=e=>{const r=dom.getBoundingClientRect();return hit((e.clientX-r.left)/r.width*HUDW,(e.clientY-r.top)/r.height*HUDH)};
  dom.addEventListener('pointermove',e=>{if(mode==='in'&&cur===INTS[type]&&e.pointerType!=='touch')st.hover=h(e)});
  let pd=null;dom.addEventListener('pointerdown',e=>{pd=[e.clientX,e.clientY]});
  dom.addEventListener('click',e=>{if(pd&&Math.hypot(e.clientX-pd[0],e.clientY-pd[1])>8)return;if(mode==='in'&&cur===INTS[type]){const q=h(e);st.pin=q&&st.pin&&q.k===st.pin.k&&q.m===st.pin.m?null:q}})}
 // nearest car (cars: [{k, x, y, z, r}]) or staff member (people: meshes) on screen
 function bizHit(hx,hy,cars,people){let best=null,bd=1e9;
  for(const c of cars){const p=toHud(c.x,c.y,c.z),p2=toHud(c.x+c.r,c.y,c.z);if(!p||!p2)continue;const r=Math.max(30,Math.hypot(p2.x-p.x,p2.y-p.y)),d=Math.hypot(hx-p.x,hy-p.y);if(d<r&&d<bd){bd=d;best={k:c.k}}}
  people.forEach((m,i)=>{if(!m.visible)return;const p=toHud(m.position.x,1.6,m.position.z),p2=toHud(m.position.x,4.6,m.position.z);if(!p||!p2)return;const r=Math.max(26,Math.abs(p2.y-p.y)*.7);const d=Math.min(Math.hypot(hx-p.x,hy-p.y),Math.hypot(hx-p2.x,hy-p2.y));if(d<r&&d<bd){bd=d;best={m:i}}});
  return best}
 // walk a person towards a target (no allocation once m.userData.p exists)
 function bizMove(m,tx,tz,ang,dt,speed){const p=m.userData.p||(m.userData.p={x:tx,z:tz});const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz),st=(speed||4.2)*Math.min(dt,.1);let moving=false;
  if(d>.05){const k=Math.min(1,st/d);p.x+=dx*k;p.z+=dz*k;moving=d>st}putP(m,{x:p.x,z:p.z,ang:moving?Math.atan2(dx,dz):ang},moving)}
 const bizEase=u=>u<0?0:u>1?1:u*u*(3-2*u);
 // a staff member's tag: "★ Name · ROLE · J-1234" or "ROLE · JOB OPEN · Comment WORKSHOP ROLE"
 function bizStaffTag(m,E,k,a,y){if(!m||!m.visible)return;const n=staffOf(E.cfg.b,E.cfg.role,k);tag(m.position.x,y||4.6,m.position.z,n?`★ ${n} · ${E.ROLE}${a?' · '+a.j.no:''}`:`${E.ROLE} · JOB OPEN · ${E.OPEN}`,n?'rgba(46,139,87,.95)':'rgba(16,19,24,.8)',n?'#fff':'#9aa3ae')}
 // which job a staff member is on (the bay's job when it is in a stage where they work), else null
 function bizStaffJobs(E,A0,want){const out=[];for(let m=0;m<E.ACT;m++){const a=A0[m];out.push(a&&a.j.post===m&&want(a.s)?a:null)}return out}
 // the panel line: the pinned / hovered car or staff member, otherwise it cycles through the busy bays
 function bizLine(E,st,A0,staffJob,idle){const sel=st.pin||st.hover;let a=null;
  if(sel&&sel.k!=null)a=A0[sel.k];else if(sel&&sel.m!=null)a=staffJob&&staffJob[sel.m];
  if(sel&&sel.m!=null&&!a){const n=staffOf(E.cfg.b,E.cfg.role,sel.m);return n?(E.hidden(n)?null:`${n} ${idle}`):`${E.ROLE} · JOB OPEN · ${E.OPEN}`}
  if(!a){const L=A0.filter(q=>q&&q.s<E.NS-1);if(!L.length)return E.open()?'All bays are free · the next car is on its way':null;a=L[Math.floor(simTime/6)%L.length]}
  return E.line(a.j,a.s,a.left)}
 // a shop's car: re-baked by OFC (body / glass / wheels / hubs) and swapped when the bay's job changes
 function bizCar(L,a,scale){const id=a?a.j.g:null;if(id===L.id&&!(L.lazy&&a&&OFC.glbReady(a.j.m)))return false;L.id=id;
  if(L.cur){L.car.remove(L.cur.g);if(L.cur.wh)L.wh.remove(L.cur.wh);L.cur.g.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry!==BOX&&(o.material===OFM.body||o.material===OFM.glass||o.material===OFM.vc))o.geometry.dispose()});if(L.cur.wh)L.cur.wh.traverse(o=>{if(o.isMesh)o.geometry.dispose()})}
  L.cur=null;L.lazy=false;if(a){const c=OFC.build(a.j);c.g.scale.setScalar(scale);L.car.add(c.g);if(c.wh){c.wh.scale.setScalar(scale);L.wh.add(c.wh)}L.cur=c;L.lazy=c.lazy}return true}
 // the scene, lights and fog shared by the new shop interiors
 function bizScene(S,o){S.background=new T.Color(o.bg||0x0b1626);S.fog=new T.Fog(o.bg||0x0b1626,70,140);S.add(new T.HemisphereLight(o.sky||0xdfe9ff,0x2a2f38,.8));
  const key=new T.DirectionalLight(o.key||0xfff3e0,1.5);key.position.set(14,26,22);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-32,right:32,top:20,bottom:-20,near:2,far:80});key.shadow.bias=-.0006;S.add(key);
  for(const x of o.lamps||[-16,0,16]){const pl=new T.PointLight(o.light||0xfff1d0,o.lampI||38,24,1.6);pl.position.set(x,(o.h||10)-1,-1);S.add(pl)}}
 // exterior: "SERVICE IN PROGRESS · n/N BAYS BUSY" under a shop's STEP INSIDE board (view3d/labels.js)
 const BIZ_EXT={pneus:()=>[TYREJOBS,'BAYS'],lavagem:()=>[WASHJOBS,'LANES'],inspecao:()=>[INSPJOBS,'LANES'],
  // the dealership (sim/dealer.js): its own wording, [engine, unit, text(n busy) -> [text, background, colour]]
  stand:()=>[DEALJOBS,'DESKS',n=>{const k=9+B.stand.slots.filter(q=>q.car&&q.car.isNew&&q.car.state==='service').length;return[`OPEN · ${k} CARS ON DISPLAY`+(n?` · ${n} SALE${n>1?'S':''} IN PROGRESS`:''),'rgba(46,139,87,.95)','#ffffff']}]};
 function bizExtPill(type,s,sz,alpha){const f=BIZ_EXT[type];if(!f||!s)return;const[E,w,tx]=f(),n=E.busy(),z=sz*.8;hctx.globalAlpha=alpha==null?1:alpha;if(tx){const o=tx(n);pill(o[0],s.x,s.y+z*1.9,z,o[1],o[2]);hctx.globalAlpha=1;return}pill(n?`SERVICE IN PROGRESS · ${n}/${E.BAYS} ${w} BUSY`:`ALL ${w} OPEN`,s.x,s.y+z*1.9,z,n?'rgba(255,122,26,.95)':'rgba(46,139,87,.95)',n?'#1d0f02':'#ffffff');hctx.globalAlpha=1}
