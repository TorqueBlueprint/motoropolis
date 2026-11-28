//@ buildings/stand_ext.js - the Car Dealership outside (BUILD.stand in buildings/exteriors.js calls standExt): MOTOROPOLIS MOTORS.
//@ A glass showroom (tall glazed front and left side, steel canopy over the entrance, lit sign on the fascia, a pylon by the
//@ drive-in), the turntable car turning slowly behind the glass, a second car and the sales desks inside; the forecourt with the
//@ hero car on a raised display ramp and two cars with windscreen price boards (TC + km / mi), feather flags and bunting, planters
//@ and trees; the service · delivery building with its roller door; customer parking; the NEW ARRIVALS bays (the city's own
//@ dealership slots, buildings/layout.js) where the factory's new cars park. Night: the signs glow (signMats), the showroom panels follow nightLevel(), lamp heads and
//@ canopy downlights use mat.lamp. Statics are merged (vertex colours, one atlas canvas), the glass is one mesh; cars are the
//@ city's car models (carMesh) and the turntable turns through CON_ANIM (buildings/construction.js). Locked: the blueprint ghost
//@ uses the box edges (userData.bp) and hides the cars (userData.bpHide). The cars on show are DEALJOBS.display() (sim/dealer.js).
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 const SX={cv:null,glow:null,glass:null};
 // the atlas canvas (2048 x 1024): signs, pylon, price boards, ground lettering. OFG maps regions on a square 2048 atlas, so the
 // y values handed to OFG are doubled (q2 below)
 const SXR={fascia:[0,0,2048,168],pylon:[0,176,336,840],svc:[352,176,1040,124],arr:[1408,176,640,124],cust:[1408,312,640,124],
  ent:[352,312,520,104],tdr:[880,312,520,104],p0:[352,432,340,232],p1:[700,432,340,232],p2:[1048,432,340,232],p3:[1060,860,340,150],back:[352,720,1040,140],flag:[1408,452,96,560],flag2:[1520,452,96,560],hours:[1632,452,400,260]};
 function sxPaint(D){const c=SX.cv||(SX.cv=document.createElement('canvas'));c.width=2048;c.height=1024;const x=c.getContext('2d'),FN="'Barlow Condensed','Arial Narrow',sans-serif",MONO="'JetBrains Mono',monospace";
  const P=(k,f)=>{const r=SXR[k];x.save();x.translate(r[0],r[1]);x.beginPath();x.rect(0,0,r[2],r[3]);x.clip();x.textAlign='center';x.textBaseline='middle';f(r[2],r[3]);x.restore()};
  const T_=(t,cx,cy,mw,sz,col,w,fam)=>{let s=sz;x.font=`${w||800} ${s}px ${fam||FN}`;while(x.measureText(t).width>mw&&s>10){s--;x.font=`${w||800} ${s}px ${fam||FN}`}x.fillStyle=col;x.fillText(t,cx,cy)};
  x.fillStyle='#22252b';x.fillRect(0,0,2048,1024);
  // the fascia sign: white letters, an orange underline, a speed swoosh (no car-brand names or emblems)
  P('fascia',(W,H)=>{x.fillStyle='#16181c';x.fillRect(0,0,W,H);const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(255,122,26,0)');g.addColorStop(.5,'rgba(255,122,26,.18)');g.addColorStop(1,'rgba(255,122,26,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
   T_('MOTOROPOLIS MOTORS',W/2,H/2-4,W-260,132,'#ffffff',800);x.fillStyle='#ff7a1a';x.fillRect(W*.2,H-20,W*.6,8);x.strokeStyle='#ff7a1a';x.lineWidth=7;for(const s of[-1,1]){x.beginPath();x.moveTo(W/2+s*W*.39,H*.3);x.lineTo(W/2+s*W*.46,H*.3);x.moveTo(W/2+s*W*.40,H*.5);x.lineTo(W/2+s*W*.47,H*.5);x.moveTo(W/2+s*W*.39,H*.7);x.lineTo(W/2+s*W*.45,H*.7);x.stroke()}});
  P('back',(W,H)=>{x.fillStyle='#16181c';x.fillRect(0,0,W,H);T_('MOTOROPOLIS MOTORS',W/2,H/2-6,W-60,92,'#ffffff');x.fillStyle='#ff7a1a';x.fillRect(W*.25,H-18,W*.5,7)});
  P('pylon',(W,H)=>{x.fillStyle='#16181c';x.fillRect(0,0,W,H);x.fillStyle='#ff7a1a';x.fillRect(0,0,W,14);x.fillRect(0,H-14,W,14);
   T_('MOTOROPOLIS',W/2,70,W-30,62,'#ffffff');T_('MOTORS',W/2,140,W-30,88,'#ff7a1a');x.fillStyle='#ffffff';x.fillRect(30,196,W-60,4);
   const L=[['NEW & USED','#ffffff'],['TEST DRIVES','#ffd34d'],['FINANCE','#ffffff'],['TRADE-INS','#ffd34d'],['SERVICE','#ffffff']];L.forEach(([t,c],i)=>T_(t,W/2,262+i*92,W-40,54,c,800));
   x.fillStyle='#2e8b57';x.fillRect(24,H-130,W-48,96);T_('OPEN TODAY',W/2,H-82,W-70,52,'#ffffff')});
  P('svc',(W,H)=>{x.fillStyle='#16181c';x.fillRect(0,0,W,H);T_('SERVICE · DELIVERY BAY',W/2,H/2,W-60,84,'#ffd34d')});
  P('arr',(W,H)=>{x.fillStyle='rgba(0,0,0,0)';x.clearRect(0,0,W,H);x.fillStyle='#50555d';x.fillRect(0,0,W,H);T_('NEW ARRIVALS',W/2,H/2,W-40,96,'#f2f0e8')});
  P('cust',(W,H)=>{x.fillStyle='#50555d';x.fillRect(0,0,W,H);T_('CUSTOMERS',W/2,H/2,W-40,96,'#f2f0e8')});
  P('ent',(W,H)=>{x.fillStyle='#16181c';x.fillRect(0,0,W,H);T_('SHOWROOM ENTRANCE',W/2,H/2,W-30,62,'#ffffff')});
  P('tdr',(W,H)=>{x.fillStyle='#ff7a1a';x.fillRect(0,0,W,H);T_('TEST DRIVES TODAY',W/2,H/2,W-30,64,'#1d0f02')});
  P('hours',(W,H)=>{x.fillStyle='#16181c';x.fillRect(0,0,W,H);T_('OPEN 7 DAYS',W/2,52,W-30,52,'#ffd34d');T_('Mon–Sat 09:00–20:00',W/2,118,W-30,34,'#ffffff',700);T_('Sun 10:00–18:00',W/2,164,W-30,34,'#ffffff',700);T_('Sales · Finance · Delivery',W/2,220,W-30,30,'#9aa3ae',700)});
  for(const[k,c,c2]of[['flag','#ff7a1a','#1d0f02'],['flag2','#22252b','#ffffff']])P(k,(W,H)=>{x.fillStyle=c;x.fillRect(0,0,W,H);x.save();x.translate(W/2,H/2);x.rotate(-Math.PI/2);T_(k==='flag'?'SALE':'NEW & USED',0,4,H-60,64,c2);x.restore()});
  // windscreen price boards: TC price, km / mi, NEW / USED, model name (read from MODELS at run time)
  D.fore.forEach((o,k)=>P('p'+k,(W,H)=>{x.fillStyle='#ffffff';x.fillRect(0,0,W,H);x.fillStyle=o.used?'#2f6fd9':'#ff7a1a';x.fillRect(0,0,W,H*.2);T_(o.used?'APPROVED USED':'BRAND NEW',W/2,H*.105,W-24,H*.15,'#ffffff');
   T_(`${o.price.toLocaleString('en-US')} TC`,W/2,H*.4,W-20,H*.27,'#16181c',800,MONO);T_(`${o.km.toLocaleString('en-US')} km · ${Math.round(o.km*.621371).toLocaleString('en-US')} mi`,W/2,H*.64,W-20,H*.14,'#4a4f57',700);T_(o.m.n,W/2,H*.85,W-16,H*.13,'#16181c',700);x.strokeStyle='#16181c';x.lineWidth=6;x.strokeRect(3,3,W-6,H-6)}));
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t}
 function standExt(L){const g=new T.Group(),{bx,cyl}=OFG,V=[],GL=[],LM=[],GW=[],Q=[],BP=[];
  const X0=L.x0,Z0=L.z0,Y=Y0;
  const b=(Lst,w,h,d,c,lx,ly,lz,ry,rx,rz)=>bx(Lst,w,h,d,c,X0+lx,Y+ly,Z0+lz,ry,rx,rz);
  const q2=(k,w,h,lx,ly,lz,ry,rx)=>{const r=SXR[k];Q.push({g:new T.PlaneGeometry(w,h),c:0xffffff,r:[r[0],r[1]*2,r[2],r[3]*2],m:OFG.xf(X0+lx,Y+ly,Z0+lz,rx||0,ry||0,0)})};
  const D=DEALJOBS.display();
  const WHITE=0xeef0f2,DARK=0x22252b,STEEL=0x9aa4b0,MUL=0x2a2f36,PAVE=0xd6d3cc,ASPH=0x50555d,LINE=0xf2f0e8,ORANGE=0xff7a1a,GRN=0x3f8f45,SOIL=0x6b4a2b;
  // ---- ground: paved forecourt, the drive-in and bays (asphalt), lawn strip on the left ----
  b(V,16.2,.04,9.8,PAVE,8.5,0,5.3);for(let k=1;k<8;k++)b(V,.04,.045,9.8,0xc4c0b7,.4+k*2.03,0,5.3);for(let k=1;k<5;k++)b(V,16.2,.045,.04,0xc4c0b7,8.5,0,.4+k*1.96);
  b(V,18,.035,12.8,ASPH,25.6,0,6.8);b(V,.6,.045,20.4,0x6e9c4e,.35,0,11);
  // NEW ARRIVALS bays (the city's dealership slots at x 30, z 2.4 / 5.2 / 8 / 10.8) and the customer bays
  for(const z of[1,3.8,6.6,9.4,12.2])b(V,4.6,.05,.12,LINE,30.3,0,z);b(V,.12,.05,11.3,LINE,32.7,0,6.6);
  for(const x of[17.1,19.4,21.7])b(V,.12,.05,3.6,LINE,x,0,8.3);b(V,4.7,.05,.12,LINE,19.4,0,6.55);
  // drive-in arrows
  for(const[x,z,r]of[[18.6,1.8,.66],[22.5,4.8,.66]]){b(V,.22,.05,1.6,LINE,x,0,z,r);b(V,.7,.05,.22,LINE,x+.42,0,z+.62,r+.8);b(V,.7,.05,.22,LINE,x-.12,0,z+.72,r-.8)}
  q2('arr',3.4,.66,33.9,.06,6.6,-Math.PI/2,-Math.PI/2);q2('cust',3.2,.62,19.4,.06,5.9,Math.PI,-Math.PI/2);
  // ---- the showroom: x 1 .. 24.6, z 10.2 .. 21, roof at 6.2, fascia to 7.4 ----
  const SX0=1,SX1=24.6,SZ0=10.2,SZ1=21,SH=6.2,SW=SX1-SX0,SCX=(SX0+SX1)/2,SD=SZ1-SZ0,SCZ=(SZ0+SZ1)/2;
  b(V,SW+.4,.3,SD+.4,0xe8e6e1,SCX,0,SCZ);b(V,SW,.02,SD-.4,0xf4f4f0,SCX,.3,SCZ+.1);
  for(let k=1;k<10;k++)b(V,.03,.025,SD-.6,0xdcdad4,SX0+k*SW/10,.3,SCZ+.1);
  b(BP,SW,SH,SD,WHITE,SCX,0,SCZ); // the blueprint outline (edges only)
  b(V,SW+.2,SH,.4,WHITE,SCX,0,SZ1-.2);b(V,.4,SH,SD,WHITE,SX1-.2,0,SCZ);
  b(V,SW+.9,.55,SD+.9,0xdfe2e6,SCX,SH,SCZ);b(V,SW+.95,1.25,.5,DARK,SCX,SH+.1,SZ0-.25);b(V,.5,1.25,SD+.9,DARK,SX0-.25,SH+.1,SCZ);
  b(V,SW+.95,.12,.56,ORANGE,SCX,SH-.02,SZ0-.26);
  q2('fascia',15.2,1.05,SCX,SH+.72,SZ0-.52,Math.PI);
  // front and left glass: mullions every ~2.36 m, a transom at 3.7 m; the glass panes are one transparent mesh
  const nm=10;for(let k=0;k<=nm;k++){const x=SX0+k*SW/nm;b(V,.16,SH,.2,MUL,x,.3,SZ0)}b(V,SW,.16,.22,MUL,SCX,3.7,SZ0);b(V,SW,.22,.24,MUL,SCX,.3,SZ0);
  for(let k=0;k<=4;k++){const z=SZ0+k*SD/4;b(V,.2,SH,.16,MUL,SX0,.3,z)}b(V,.22,.16,SD,MUL,SX0,3.7,SCZ);b(V,.24,.22,SD,MUL,SX0,.3,SCZ);
  b(GL,SW,SH-.5,.06,0xa9cfe6,SCX,.5,SZ0);b(GL,.06,SH-.5,SD,0xa9cfe6,SX0,.5,SCZ);
  // inside: ceiling light panels and the lit back wall (glow at night), the sign on the back wall, desks, plants
  for(let i=0;i<4;i++)for(let j=0;j<3;j++)b(GW,3.6,.06,1.2,0xffffff,SX0+3+i*6,SH-.08,SZ0+2.2+j*3.3);
  b(GW,SW-1.2,4.2,.05,0xf6f3ea,SCX,.4,SZ1-.43);
  q2('back',8.6,1.16,SCX-3,4.1,SZ1-.48,Math.PI);
  for(const[x,z]of[[16,18.6],[19.6,18.6]]){b(V,2.4,.95,1,0xf4f4f0,x,.3,z);b(V,2.5,.06,1.1,DARK,x,1.25,z);b(V,.8,.55,.06,DARK,x,1.31,z-.2)}
  b(V,4.4,1,1.2,DARK,6,.3,19.6);b(V,4.6,.08,1.3,0xb07a45,6,1.3,19.6);
  for(const x of[2,23.4]){cyl(V,.42,.34,.8,10,0xe8e6e1,X0+x,Y+.7,Z0+20.2);V.push({g:new T.IcosahedronGeometry(.7,0),c:GRN,m:OFG.xf(X0+x,Y+1.7,Z0+20.2,0,0,0,1,1.3,1)})}
  // the turntable (turns via CON_ANIM) and its ring light
  const TTX=8.6,TTZ=15.4;cyl(V,3.3,3.4,.18,40,0x30343b,X0+TTX,Y+.39,Z0+TTZ);
  {const rg=[];cyl(rg,2.2,2.2,.06,32,0xffffff,0,0,0);GW.push(...rg.map(e=>(e.m.premultiply(OFG.xf(X0+TTX,Y+SH-.4,Z0+TTZ)),e)))}
  // the steel canopy over the entrance with downlights, the glass doors and the entrance sign
  const CX=12.8;b(V,7.6,.34,3.6,0xcfd5dc,CX,4.1,SZ0-1.8);b(V,7.7,.12,3.7,STEEL,CX,4.44,SZ0-1.8);for(const dx of[-3.4,3.4]){b(V,.22,4.1,.22,STEEL,CX+dx,0,SZ0-3.3)}
  for(const dx of[-2.4,-.8,.8,2.4])for(const dz of[-2.6,-1])b(LM,.32,.04,.32,0xffffff,CX+dx,4.06,SZ0+dz);
  b(V,3.4,2.9,.1,0x3a3f46,CX,.3,SZ0-.12);b(GL,3.1,2.6,.07,0x7fb6d6,CX,.35,SZ0-.18);b(V,.06,2.6,.12,STEEL,CX,.35,SZ0-.2);
  q2('ent',3.6,.72,CX,4.27,SZ0-3.63,Math.PI);q2('tdr',3.4,.68,4.2,4.6,SZ0-.14,Math.PI);
  // the service · delivery building: x 25 .. 34.2, z 13.4 .. 21, roller door on the forecourt side
  const VX0=25,VX1=34.2,VZ0=13.4,VZ1=21,VH=5,VCX=(VX0+VX1)/2,VCZ=(VZ0+VZ1)/2;
  b(V,VX1-VX0,VH,VZ1-VZ0,0x3a3f46,VCX,0,VCZ);b(BP,VX1-VX0,VH,VZ1-VZ0,0x3a3f46,VCX,0,VCZ);b(V,VX1-VX0+.3,.4,VZ1-VZ0+.3,DARK,VCX,VH,VCZ);b(V,VX1-VX0+.04,.3,VZ1-VZ0+.04,ORANGE,VCX,VH-.9,VCZ);
  b(V,6,3.7,.1,0xc9ccd0,VCX,0,VZ0-.05);for(let k=1;k<9;k++)b(V,6.02,.05,.12,0x9aa3ae,VCX,k*.41,VZ0-.07);b(V,6.4,.25,.2,DARK,VCX,3.7,VZ0-.08);for(const dx of[-3.1,3.1])b(V,.2,3.8,.2,DARK,VCX+dx,0,VZ0-.08);
  q2('svc',6.2,.74,VCX,4.32,VZ0-.07,Math.PI);b(V,.9,.9,.08,0x2a3a4c,VX0+.8,2.2,VZ0-.05);
  hvac(g,X0+VCX+1.5,Y+VH+.4,Z0+VCZ+1);
  // ---- the forecourt: hero ramp, price-board cars, flags, bunting, planters, trees, lamp posts, the pylon ----
  // hero ramp: a dark plinth with a chrome edge and a lit strip; the deck rises 8 degrees to the front
  const RX=5,RZ=4.9,RRY=Math.PI-.5,TIL=.14,RL=4.5,RW_=2.3;
  {const R=[];bx(R,RW_+.5,.32,RL+.5,DARK,0,0,0);bx(R,RW_+.56,.05,RL+.56,STEEL,0,.32,0);bx(R,RW_,.12,RL,0x30343b,0,.4+RL/2*Math.sin(TIL),0,0,-TIL);bx(R,.06,.06,RL,ORANGE,RW_/2+.05,.33,0);bx(R,.06,.06,RL,ORANGE,-RW_/2-.05,.33,0);
   bx(R,RW_*.5,.6+RL*Math.sin(TIL),.3,0x30343b,0,.32,RL/2-.2);
   OFG.place(R,X0+RX,Z0+RZ,RRY);for(const e of R)e.m.premultiply(new T.Matrix4().makeTranslation(0,Y,0));V.push(...R)}
  // flags along the front and the left side, bunting between the poles
  const FL=[[3.6,.8],[6,.8],[8.4,.8],[10.8,.8],[13.2,.8],[.8,3.4],[.8,6],[.8,8.6]];
  FL.forEach(([x,z],i)=>{b(V,.08,4.6,.08,STEEL,x,0,z);b(V,.3,.2,.3,DARK,x,0,z);const fr=i>=5?-Math.PI/2:Math.PI,fx=i>=5?0:.36,fz=i>=5?.36:0;q2(i%2?'flag2':'flag',.62,3.3,x+fx,2.95,z+fz,fr);q2(i%2?'flag2':'flag',.62,3.3,x+fx,2.95,z+fz,fr+Math.PI)});
  {const pole=FL.slice(0,5);for(let k=0;k<pole.length-1;k++){const[a,za]=pole[k],[c2,zc]=pole[k+1];for(let s=1;s<8;s++){const u=s/8,x=a+(c2-a)*u,y=4.4-Math.sin(u*Math.PI)*.55;b(V,.26,.26,.03,[ORANGE,0xffffff,0x2f6fd9,0xffd34d][s%4],x,y-.13,za,0,0,Math.PI/4)}}}
  for(const[x0,x1]of[[.4,14.6],[20.4,33]]){b(V,x1-x0,.36,.6,0x9aa3ae,(x0+x1)/2,0,.32);b(V,x1-x0-.1,.06,.5,SOIL,(x0+x1)/2,.36,.32);for(let x=x0+.5;x<x1-.3;x+=.9)V.push({g:new T.IcosahedronGeometry(.32,0),c:[GRN,0x4f9f4a,0x2e7d4f][Math.round(x*3)%3],m:OFG.xf(X0+x,Y+.62,Z0+.32,0,x,0,1,.8,1)})}
  for(const[x,z]of[[.7,12.4],[24.9,.8]]){cyl(V,.14,.18,1.8,8,SOIL,X0+x,Y+.9,Z0+z);V.push({g:new T.IcosahedronGeometry(1.25,1),c:GRN,m:OFG.xf(X0+x,Y+2.5,Z0+z,0,x,0,1,1.15,1)})}
  for(const x of[CX-4.4,CX+4.4]){b(V,1.2,.6,1.2,0x9aa3ae,x,0,SZ0-3.3);V.push({g:new T.IcosahedronGeometry(.55,0),c:0x4f9f4a,m:OFG.xf(X0+x,Y+1,Z0+SZ0-3.3,0,0,0,1,.9,1)})}
  for(const[x,z]of[[16.4,.9],[34,.9],[34,12.6],[.8,9.6]]){b(V,.16,5.6,.16,DARK,x,0,z);b(V,1.2,.16,.36,DARK,x+(x>20?-.5:.5),5.5,z);b(LM,.9,.06,.28,0xffffff,x+(x>20?-.5:.5),5.47,z)}
  // the pylon by the drive-in (both faces)
  const PX=1.4,PZ=1.2;b(V,1.9,7.6,.6,DARK,PX,0,PZ);b(V,2.1,.3,.8,ORANGE,PX,7.6,PZ);b(BP,1.9,7.6,.6,DARK,PX,0,PZ);
  q2('pylon',1.7,4.25,PX,4.85,PZ-.31,Math.PI);q2('pylon',1.7,4.25,PX,4.85,PZ+.31,0);q2('hours',1.6,1.04,PX,1.5,PZ-.31,Math.PI);
  // the roof: membrane, parapet, skylights (glow at night), air-handling units and a solar array
  b(V,SW-.2,.04,SD-.2,0x8a9099,SCX,SH+.55,SCZ);for(const z of[SZ0+.05,SZ1-.05])b(V,SW+.9,.5,.2,0xe9ebee,SCX,SH+.55,z);b(V,.2,.5,SD+.9,0xe9ebee,SX1+.2,SH+.55,SCZ);
  for(let k=0;k<3;k++){b(GW,1.2,.18,SD-3,0xdff1ff,SX0+5+k*6.5,SH+.59,SCZ);b(V,1.5,.14,SD-2.7,0xb9c0c8,SX0+5+k*6.5,SH+.57,SCZ)}
  for(const[x,z]of[[SX0+18,SZ0+3],[SX0+21,SZ0+3],[SX0+19.5,SZ1-3]]){b(V,2,1,1.5,0xaab4c0,x,SH+.59,z);cyl(V,.5,.5,.1,14,DARK,X0+x,Y+SH+1.64,Z0+z)}
  for(let i=0;i<4;i++)for(let j=0;j<2;j++)b(V,2.4,.08,1.5,0x1f3a6e,SX0+2.2+i*2.7,SH+1,SZ1-2.2-j*2.4,0,-.35);
  // ---- merge: one vertex-coloured mesh, the glass, the night glow, the lamp heads, the atlas ----
  const edges=OFG.edges(BP.concat(V.filter(e=>e.box&&e.m.elements[5]>2.5)));
  const sm=new T.Mesh(OFG.merge(V),SX.vc||(SX.vc=new T.MeshStandardMaterial({vertexColors:true,roughness:.62,metalness:.12})));sm.castShadow=true;sm.receiveShadow=true;g.add(sm);
  const gm=SX.glass||(SX.glass=new T.MeshStandardMaterial({vertexColors:true,roughness:.05,metalness:.55,transparent:true,opacity:.34,depthWrite:false}));const glm=new T.Mesh(OFG.merge(GL),gm);g.add(glm);
  // the glow (ceiling panels, the lit back wall, skylights): brighter at night (set with the turntable in CON_ANIM; a map-less material: disposeGroup keeps it)
  if(!SX.glow)SX.glow=new T.MeshStandardMaterial({vertexColors:true,emissive:0xfff2d6,emissiveIntensity:.1,roughness:.5});g.add(new T.Mesh(OFG.merge(GW),SX.glow));
  g.add(new T.Mesh(OFG.merge(LM),mat.lamp));
  const tex=sxPaint(D),am=new T.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:0xffffff,emissiveIntensity:0,roughness:.55});signMats.push(am);const qm=new T.Mesh(OFG.merge(Q),am);qm.receiveShadow=true;g.add(qm);
  const ln=new T.LineSegments(edges,edgeMat);ln.visible=false;ln.userData.bp=1;g.add(ln);
  // ---- the cars: the city's car models (they swap in when their model file lands) ----
  const car=(o,lx,ly,lz,ry,rx)=>{const c=carMesh({kind:'car',len:o.m.len,wid:o.m.wid,color:o.col,m:o.m});const w=new T.Group();w.add(c);w.position.set(X0+lx,Y+ly,Z0+lz);w.rotation.set(rx||0,ry||0,0,'YXZ');w.userData.keepGeo=1;w.userData.bpHide=1;w.userData.nm=1;c.traverse(q=>{q.castShadow=true});g.add(w);return w};
  // the hero car on the ramp (nose up), two price-board cars
  {const dz=RL*.04;car(D.fore[0],RX+Math.sin(RRY)*dz,.47+RL/2*Math.sin(TIL),RZ+Math.cos(RRY)*dz,RRY,-TIL)}
  const PB=[];[[9.2,4.6,Math.PI+.2],[12.2,4.4,Math.PI-.06],[15,4.6,Math.PI-.2]].forEach(([x,z,ry],k)=>{const o=D.fore[k+1];car(o,x,0,z,ry);const cf=CAR_GLB[o.m.glb]||{},Lc=o.m.len/10,hh=cf.h&&cf.len?cf.h*Lc/cf.len:1.3;
   // the price board stands on the dashboard behind the windscreen, facing forward
   const fx=Math.sin(ry),fz=Math.cos(ry);PB.push([k,X0+x+fx*Lc*.1,Y+hh*.74,Z0+z+fz*Lc*.1,ry])});
  if(PB.length){const BQ=[];for(const[k,x,y,z,ry]of PB){const r=SXR['p'+(k+1)];BQ.push({g:new T.PlaneGeometry(.72,.47),c:0xffffff,r:[r[0],r[1]*2,r[2],r[3]*2],m:OFG.xf(x,y,z,-.62,ry,0)})}const pm=new T.Mesh(OFG.merge(BQ),am);pm.userData.nm=1;pm.userData.bpHide=1;g.add(pm)}
  // inside: the turntable car (turns slowly) and a second car
  const tt=car(D.show[0],TTX,.52,TTZ,0);const t0=new T.Group();{const rg=[];cyl(rg,3.05,3.05,.08,40,0x3d424a,0,0,0);for(let k=0;k<12;k++)bx(rg,.05,.02,2.9,0x8a95a3,0,.04,0,k*Math.PI/12);const m=new T.Mesh(OFG.merge(rg),SX.vc);t0.add(m)}t0.position.set(X0+TTX,Y+.48,Z0+TTZ);t0.userData.nm=1;g.add(t0);
  car(D.show[1],19.4,.32,14.6,Math.PI*.78);
  // a customer's car in the customer bays
  car({m:D.show[4].m,col:'#7a8088'},18.25,0,8.6,0);
  // one animation entry for every rebuild (the latest turntable turns)
  SX.tt=[tt,t0];if(CITY2&&!SX.anim){SX.anim={g:{parent:1},f:t=>{const a=t*.32;for(const o of SX.tt)o.rotation.y=a;SX.glow.emissiveIntensity=.1+1.7*nightLevel()}};CON_ANIM.push(SX.anim)}
  return g}
