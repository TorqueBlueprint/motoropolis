//@ interiors/fire.js - FIRE STATION inside (milestone w_fire): the apparatus bay with Engine 1 and Ladder 2, open rear roller doors,
//@ turnout-gear racks, hose rack, lockers, the brass pole from the upper floor, the kitchen corner, the ON SHIFT duty board (staffOf
//@ w_fire), the LAST CALLS dispatch board (live fire calls from events/world_calls.js via `emerg` and the NEWS feed, seeded history
//@ below them) and a DAYS WITHOUT INCIDENT sign. Registers INTS.fire and FIRE (hit / lp: the click and the STEP INSIDE board on
//@ the exterior in world/world3d.js, used by view3d/camera.js and view3d/labels.js; only when isOpen('w_fire')).
//@ Static furniture is merged into 3 meshes (vertex-coloured, metal, one 2048 canvas atlas for every board and sign; the live boards
//@ redraw their part of it only when their content changes). Seeded (no Math.random). While a fire call is live Engine 1 is out.
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // the exterior (world/world3d.js, w_fire): the 24 x 16 m station centred on CITY.F.w_fire, doors facing -z, hose tower behind
 const FIRE={hit:null,lp:null};
 if(WORLD&&CITY.F&&CITY.F.w_fire){const[fx,fz]=CITY.F.w_fire,bb=new T.Box3(new T.Vector3(fx-12.4,0,fz-8.6),new T.Vector3(fx+12.4,12,fz+8.4));FIRE.hit=r=>r.intersectsBox(bb);FIRE.lp={x:fx,y:11.4,z:fz-8.6}}
 {
  const FS={built:false,clk:0,t0:-99,v:'',home:{tx:0,tz:-1.5,yaw:.22,pitch:.36,dist:42}};
  let sd=125125;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
  // ---------- atlas: every board and sign on one canvas ----------
  const AW=2048,RG={out1:[0,0,768,590],out2:[768,0,768,590],days:[1536,0,512,280],menu:[1536,280,512,384],title:[0,600,1536,140],
   shift:[0,750,800,600],calls:[800,750,880,600],poster:[1680,750,368,512],eng1:[0,1360,640,128],lad2:[640,1360,640,128],clr:[1280,1360,640,96],
   spd:[1280,1460,400,280],bunk:[0,1500,640,128],nm0:[0,1640,528,96],nm1:[528,1640,528,96],nm2:[1056,1640,528,96],nm3:[0,1740,528,96],nm4:[528,1740,528,96],nm5:[1056,1740,528,96]};
  const FN="'Barlow Condensed','Arial Narrow',sans-serif",MONO="'JetBrains Mono',monospace";
  const paint=(k,fn)=>{const r=RG[k],x=FS.cx;x.save();x.translate(r[0],r[1]);x.beginPath();x.rect(0,0,r[2],r[3]);x.clip();x.textAlign='center';x.textBaseline='middle';fn(x,r[2],r[3]);x.restore()};
  const font=(x,sz,w,fam)=>{x.font=`${w||800} ${sz}px ${fam||FN}`};
  const fit=(x,t,maxW,sz,w,fam)=>{font(x,sz,w,fam);while(x.measureText(t).width>maxW&&sz>10){sz-=2;font(x,sz,w,fam)}return sz};
  const txt=(x,t,cx,cy,maxW,sz,col,w,fam)=>{fit(x,t,maxW,sz,w,fam);x.fillStyle=col;x.fillText(t,cx,cy)};
  // the street seen through the open rear doors
  function paintOut(x,W,H,v){const sk=x.createLinearGradient(0,0,0,H*.6);sk.addColorStop(0,'#8cc8f0');sk.addColorStop(1,'#e9f3f8');x.fillStyle=sk;x.fillRect(0,0,W,H);
   x.fillStyle='rgba(255,255,255,.8)';for(let k=0;k<3;k++){const cx=rnd()*W,cy=30+rnd()*90;for(let j=0;j<4;j++){x.beginPath();x.ellipse(cx+j*30-45,cy+(j%2)*7,38,15,0,0,Math.PI*2);x.fill()}}
   // houses and shops across the street
   const BC=['#e9dcc4','#d9c2a0','#c9d3dc','#efe6d6','#d8b7a0','#bfcbb8'],RC=['#b8452f','#5a6472','#8a5a3a','#3d5a7a'];let px=-30+rnd()*20;
   while(px<W){const w=110+rnd()*70,h=150+rnd()*110,y0=H*.66;x.fillStyle=BC[Math.floor(rnd()*BC.length)];x.fillRect(px,y0-h,w,h);x.fillStyle=RC[Math.floor(rnd()*RC.length)];x.fillRect(px-6,y0-h-16,w+12,18);
    x.fillStyle='#5f7f9f';for(let r=0;r<Math.floor(h/70);r++)for(let c=0;c<Math.floor(w/44);c++)x.fillRect(px+14+c*44,y0-h+24+r*70,24,34);px+=w+8+rnd()*14}
   // a tree, the sidewalk, the street, the apron with the yellow line
   for(const tx of[W*(v?.18:.78)]){x.fillStyle='#6b4a2b';x.fillRect(tx-7,H*.5,14,H*.17);x.fillStyle='#4f8a3c';for(let j=0;j<5;j++){x.beginPath();x.arc(tx+(j-2)*20,H*.46-(j%2)*22,42,0,Math.PI*2);x.fill()}}
   x.fillStyle='#cfcac0';x.fillRect(0,H*.66,W,H*.06);x.fillStyle='#3b3f46';x.fillRect(0,H*.72,W,H*.14);x.fillStyle='#f2f0e8';for(let k=0;k<W;k+=90)x.fillRect(k+20,H*.785,50,7);
   x.fillStyle='#bdb8ad';x.fillRect(0,H*.86,W,H*.14);x.fillStyle='#e8b931';x.fillRect(W*.47,H*.86,14,H*.14);
   if(!v){const hx=W*.3,hy=H*.7;x.fillStyle='#d93a2f';x.fillRect(hx-14,hy-46,28,46);x.fillRect(hx-22,hy-34,44,10);x.beginPath();x.arc(hx,hy-46,16,Math.PI,0);x.fill()} // hydrant
   else{const cx=W*.62,cy=H*.81;x.fillStyle='#2f6fd9';x.beginPath();x.moveTo(cx-90,cy);x.lineTo(cx-84,cy-30);x.lineTo(cx-40,cy-34);x.lineTo(cx-18,cy-58);x.lineTo(cx+40,cy-58);x.lineTo(cx+64,cy-32);x.lineTo(cx+92,cy-28);x.lineTo(cx+94,cy);x.fill();
    x.fillStyle='#9fd0ff';x.fillRect(cx-12,cy-52,22,18);x.fillRect(cx+16,cy-52,22,18);x.fillStyle='#16181c';for(const wx of[-56,58]){x.beginPath();x.arc(cx+wx,cy,17,0,Math.PI*2);x.fill()}}} // a parked car (unbranded)
  const shield=(x,cx,cy,r)=>{x.fillStyle='#ffd34d';x.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,rr=i%2?r*.72:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill();x.fillStyle='#c8231c';x.beginPath();x.arc(cx,cy,r*.55,0,Math.PI*2);x.fill()};
  function paintStatic(){
   paint('out1',(x,W,H)=>paintOut(x,W,H,0));paint('out2',(x,W,H)=>paintOut(x,W,H,1));
   paint('title',(x,W,H)=>{x.fillStyle='#c8231c';x.fillRect(0,0,W,H);x.strokeStyle='#ffd34d';x.lineWidth=6;x.strokeRect(8,8,W-16,H-16);shield(x,70,H/2,44);shield(x,W-70,H/2,44);txt(x,'MOTOROPOLIS FIRE STATION · No. 1',W/2,H/2+4,W-220,96,'#ffffff')});
   paint('eng1',(x,W,H)=>{x.fillStyle='#c8231c';x.fillRect(0,0,W,H);txt(x,'ENGINE 1',W/2,H/2+4,W-40,104,'#ffd34d')});
   paint('lad2',(x,W,H)=>{x.fillStyle='#c8231c';x.fillRect(0,0,W,H);txt(x,'LADDER 2',W/2,H/2+4,W-40,104,'#ffd34d')});
   paint('clr',(x,W,H)=>{x.fillStyle='#ffd34d';x.fillRect(0,0,W,H);x.fillStyle='#16181c';for(let k=-2;k<W/40;k++){x.beginPath();x.moveTo(k*40,H);x.lineTo(k*40+20,H);x.lineTo(k*40+20+H*.4,0);x.lineTo(k*40+H*.4,0);x.fill()}
    x.fillStyle='#ffd34d';x.fillRect(70,8,W-140,H-16);txt(x,'CLEARANCE 14 ft · 4.3 m',W/2,H/2+3,W-160,64,'#16181c')});
   paint('spd',(x,W,H)=>{x.fillStyle='#ffffff';x.fillRect(0,0,W,H);x.strokeStyle='#16181c';x.lineWidth=10;x.strokeRect(12,12,W-24,H-24);txt(x,'BAY SPEED LIMIT',W/2,62,W-60,46,'#16181c');txt(x,'5 mph',W/2,140,W-60,92,'#16181c');txt(x,'8 km/h',W/2,220,W-60,56,'#c8231c')});
   paint('bunk',(x,W,H)=>{x.fillStyle='#1f3a6e';x.fillRect(0,0,W,H);txt(x,'BUNK ROOM · QUIET PLEASE',W/2,H/2+3,W-40,64,'#ffffff')});
   paint('poster',(x,W,H)=>{x.fillStyle='#fff8e6';x.fillRect(0,0,W,H);x.fillStyle='#c8231c';x.fillRect(0,0,W,96);txt(x,'SAFETY FIRST',W/2,50,W-30,62,'#ffffff');
    // a smoke alarm drawn on the poster
    x.fillStyle='#e9ecef';x.beginPath();x.arc(W/2,200,72,0,Math.PI*2);x.fill();x.strokeStyle='#9aa3ad';x.lineWidth=6;x.stroke();x.fillStyle='#c8231c';x.beginPath();x.arc(W/2+30,175,9,0,Math.PI*2);x.fill();
    x.strokeStyle='#9aa3ad';x.lineWidth=3;for(let k=0;k<4;k++){x.beginPath();x.arc(W/2,200,18+k*12,.4,2.6);x.stroke()}
    txt(x,'TEST YOUR',W/2,320,W-30,44,'#16181c');txt(x,'SMOKE ALARM',W/2,366,W-30,44,'#16181c');txt(x,'EVERY MONTH',W/2,412,W-30,44,'#c8231c');font(x,22,600);x.fillStyle='#555';x.fillText('MOTOROPOLIS FIRE STATION',W/2,480)})}
  // ---------- live boards ----------
  const crew=()=>({chief:staffOf('w_fire','Fire Chief',0),ff:[0,1,2].map(k=>staffOf('w_fire','Firefighter',k))});
  const liveCall=()=>typeof emerg!=='undefined'&&emerg&&emerg.type==='fire'?emerg:null;
  // fire calls seen in the news feed (events/world_calls.js writes them), kept beyond the 14 news items
  FS.calls=[];
  function seenCalls(){for(const n of NEWS){const m=/^Car on fire in Motoropolis: (.+)!$/.exec(n.h);if(m&&!FS.calls.some(c=>c.h===n.h&&c.day===n.day))FS.calls.unshift({h:n.h,plate:m[1],time:n.time,day:n.day,out:false});
    const o=/^Fire out! (.+) saved/.exec(n.h);if(o){const c=FS.calls.find(c=>c.plate===o[1]);if(c)c.out=true}}FS.calls.length=Math.min(FS.calls.length,6);return FS.calls}
  const D=(CITY.L&&CITY.L.districts||[]).map(d=>d.t.split(' · ')[0]);const dn=k=>D.length?D[k%D.length]:['DOWNTOWN','OLD TOWN','MAPLE GROVE'][k%3];
  const PAST=[['KITTEN STUCK IN A TREE',5,'LADDER 2','YESTERDAY 16:40'],['SMOKE ALARM CHIRPING',2,'ENGINE 1','YESTERDAY 09:15'],['BBQ FLARE-UP',3,'ENGINE 1','2 DAYS AGO 19:55'],
   ['HYDRANT FLUSH TEST',6,'ENGINE 1','2 DAYS AGO 11:20'],['FALSE ALARM · BURNT TOAST',0,'LADDER 2','3 DAYS AGO 07:45'],['ENGINE OVERHEATING',1,'ENGINE 1','3 DAYS AGO 14:05']];
  function paintShift(x,W,H){const c=crew(),lc=liveCall();x.fillStyle='#f7f5ef';x.fillRect(0,0,W,H);x.fillStyle='#c8231c';x.fillRect(0,0,W,92);txt(x,'ON SHIFT · CREW A',W/2,48,W-60,66,'#ffffff');
   font(x,26,600,MONO);x.fillStyle='#4a4f57';x.fillText(`DAY ${dayNo()} · ${clockStr()}`,W/2,122);
   const rows=[['CAR 1','FIRE CHIEF',c.chief,'IN STATION'],['ENGINE 1','DRIVER',c.ff[0],lc?'ON A CALL':'IN STATION'],['ENGINE 1','FIREFIGHTER',c.ff[1],'KITCHEN DUTY'],['LADDER 2','FIREFIGHTER',c.ff[2],'IN STATION']];
   rows.forEach(([u,role,n,st],i)=>{const y=160+i*82;x.fillStyle=i%2?'#ffffff':'#efebe0';x.fillRect(20,y,W-40,72);
    x.fillStyle=u==='LADDER 2'?'#1f3a6e':u==='CAR 1'?'#22252b':'#c8231c';x.fillRect(28,y+10,150,52);txt(x,u,103,y+38,136,32,'#ffffff');
    font(x,22,700);x.fillStyle='#6b7280';x.textAlign='left';x.fillText(role,196,y+20);x.textAlign='center';
    if(n){fit(x,n,330,38,800);x.textAlign='left';x.fillStyle='#16181c';x.fillText(n,196,y+50);x.textAlign='center'}else{font(x,30,700);x.textAlign='left';x.fillStyle='#9aa3ae';x.fillText('JOB OPEN',196,y+50);x.textAlign='center'}
    const on=st==='ON A CALL';x.fillStyle=on?'#c8231c':st==='KITCHEN DUTY'?'#e8b931':'#2e8b57';x.fillRect(W-200,y+18,172,36);txt(x,st,W-114,y+37,160,24,on?'#ffffff':'#16181c',800)});
   x.fillStyle='#22252b';x.fillRect(0,H-76,W,76);font(x,22,600);x.fillStyle='#ffd34d';x.fillText('ENGINE 1 · TANK 750 gal / 2,840 L',W/2,H-52);x.fillText('LADDER 2 · REACH 100 ft / 30 m',W/2,H-22)}
  function paintCalls(x,W,H){const lc=liveCall(),L=seenCalls();x.fillStyle='#0d1014';x.fillRect(0,0,W,H);x.strokeStyle='#3a3f46';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);
   txt(x,'LAST CALLS',W/2,52,W-60,64,'#ffb000');x.fillStyle='#ffb000';x.fillRect(30,92,W-60,3);
   const rows=[];for(const c of L){const live=lc&&lc.car&&lc.car.plate===c.plate&&!c.out;rows.push({t:`DAY ${c.day} ${c.time}`,w:`CAR FIRE · ${c.plate}`,u:'ENGINE 1',s:live?(lc.arrived?'ON SCENE':'RESPONDING'):c.out?'FIRE OUT':'CLEARED',live})}
   if(lc&&!rows.some(r=>r.live))rows.unshift({t:'NOW',w:`CAR FIRE · ${lc.car.plate}`,u:'ENGINE 1',s:lc.arrived?'ON SCENE':'RESPONDING',live:true});
   for(const p of PAST){if(rows.length>=6)break;rows.push({t:p[3],w:`${p[0]} · ${dn(p[1])}`,u:p[2],s:'CLEARED'})}
   rows.slice(0,6).forEach((r,i)=>{const y=128+i*72;if(r.live){x.fillStyle='rgba(217,58,47,.28)';x.fillRect(22,y-4,W-44,66)}
    x.textAlign='left';fit(x,r.t,230,24,600,MONO);x.fillStyle=r.live?'#ff6b5e':'#9aa3ae';x.fillText(r.t,34,y+14);
    fit(x,r.w,W-80,32,700,MONO);x.fillStyle=r.live?'#ffffff':'#ffd58a';x.fillText(r.w,34,y+44);
    x.textAlign='right';fit(x,`${r.u} · ${r.s}`,W-300,24,700,MONO);x.fillStyle=r.live?'#ff6b5e':'#5cc98a';x.fillText(`${r.u} · ${r.s}`,W-34,y+14);x.textAlign='center'})}
  function paintDays(x,W,H){x.fillStyle='#ffffff';x.fillRect(0,0,W,H);x.strokeStyle='#2e7d4f';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);x.fillStyle='#2e7d4f';x.fillRect(5,5,W-10,58);txt(x,'THIS STATION HAS WORKED',W/2,36,W-40,40,'#ffffff');
   const n=String(36+dayNo());x.fillStyle='#16181c';x.fillRect(W/2-110,78,220,120);txt(x,n,W/2,142,200,112,'#ffd34d');txt(x,'DAYS WITHOUT A',W/2,222,W-40,36,'#16181c');txt(x,'LOST-TIME INCIDENT',W/2,256,W-40,36,'#c8231c')}
  function paintMenu(x,W,H){const c=crew();x.fillStyle='#22302a';x.fillRect(0,0,W,H);x.strokeStyle='#8a6a42';x.lineWidth=18;x.strokeRect(9,9,W-18,H-18);
   txt(x,"TODAY'S MENU",W/2,62,W-60,54,'#f5f3ee');x.strokeStyle='rgba(245,243,238,.6)';x.lineWidth=3;x.beginPath();x.moveTo(60,96);x.lineTo(W-60,96);x.stroke();
   txt(x,'FIREHOUSE CHILI',W/2,140,W-60,46,'#ffd34d',700);txt(x,'CORNBREAD · SALAD',W/2,190,W-60,38,'#f5f3ee',600);txt(x,'COFFEE IS ALWAYS ON',W/2,240,W-60,34,'#9fe0b8',600);
   txt(x,c.ff[1]?`COOK: ${c.ff[1]}`:'COOK: JOB OPEN',W/2,316,W-60,34,'#f5f3ee',700)}
  const BAYS=[['FIRE CHIEF',c=>c.chief],['FIREFIGHTER',c=>c.ff[0]],['FIREFIGHTER',c=>c.ff[1]],['FIREFIGHTER',c=>c.ff[2]],['SPARE GEAR',()=>null],['SPARE GEAR',()=>null]];
  function liveBoards(){const c=crew(),lc=liveCall();seenCalls();
   const key=[c.chief,c.ff.join(','),lc?lc.car.plate+(lc.arrived?'!':''):'',FS.calls.map(q=>q.h+q.out).join('|'),dayNo(),clockStr()].join('#');if(key===FS.v)return;FS.v=key;
   paint('shift',paintShift);paint('calls',paintCalls);paint('days',paintDays);paint('menu',paintMenu);
   BAYS.forEach(([role,f],k)=>paint('nm'+k,(x,W,H)=>{const n=f(c);const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fbe39a');g.addColorStop(1,'#c4952e');x.fillStyle=g;x.fillRect(0,0,W,H);x.strokeStyle='#7a5a1a';x.lineWidth=4;x.strokeRect(3,3,W-6,H-6);
    txt(x,n?`${role==='FIRE CHIEF'?'CHIEF · ':''}${n}`:role==='SPARE GEAR'?'SPARE GEAR':'JOB OPEN',W/2,H/2+3,W-30,56,'#2b1d0a')}));
   FS.tex.needsUpdate=true}
  // ---------- merged geometry (same scheme as the other merged interiors: vertex colours, atlas UVs remapped per part) ----------
  const UB=new T.BoxGeometry(1,1,1),xf=(x,y,z,rx,ry,rz,sx,sy,sz)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,'YXZ')),new T.Vector3(sx||1,sy||sx||1,sz||sx||1));
  function mergeParts(list){let nv=0,ni=0;for(const q of list){nv+=q.g.attributes.position.count;ni+=q.g.index?q.g.index.count:q.g.attributes.position.count}
   const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),col=new Float32Array(nv*3),ind=new Uint32Array(ni),v=new T.Vector3(),nm=new T.Matrix3(),c=new T.Color();let vo=0,io=0;
   for(const q of list){const g=q.g,P=g.attributes.position,N=g.attributes.normal,UV=g.attributes.uv,r=q.r;nm.getNormalMatrix(q.m);c.set(q.c==null?0xffffff:q.c);
    for(let i=0;i<P.count;i++){const o=vo+i;v.fromBufferAttribute(P,i).applyMatrix4(q.m);pos[o*3]=v.x;pos[o*3+1]=v.y;pos[o*3+2]=v.z;v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[o*3]=v.x;nor[o*3+1]=v.y;nor[o*3+2]=v.z;
     let u=UV?UV.getX(i):0,w=UV?UV.getY(i):0;if(r){u=(r[0]+1+u*(r[2]-2))/AW;w=1-(r[1]+1+(1-w)*(r[3]-2))/AW}uv[o*2]=u;uv[o*2+1]=w;col[o*3]=c.r;col[o*3+1]=c.g;col[o*3+2]=c.b}
    const I=g.index,n=I?I.count:P.count,flip=q.m.determinant()<0;for(let k=0;k<n;k+=3){const a=I?I.getX(k):k,b=I?I.getX(k+1):k+1,cc=I?I.getX(k+2):k+2;ind[io++]=vo+a;if(flip){ind[io++]=vo+cc;ind[io++]=vo+b}else{ind[io++]=vo+b;ind[io++]=vo+cc}}
    vo+=P.count;if(g!==UB)g.dispose()}
   const o=new T.BufferGeometry();o.setAttribute('position',new T.BufferAttribute(pos,3));o.setAttribute('normal',new T.BufferAttribute(nor,3));o.setAttribute('uv',new T.BufferAttribute(uv,2));o.setAttribute('color',new T.BufferAttribute(col,3));
   o.setIndex(new T.BufferAttribute(ind,1));o.computeBoundingSphere();return o}
  const bx=(L,w,h,d,c,x,y,z,ry,rx,rz)=>L.push({g:UB,c,m:xf(x,y+h/2,z,rx,ry,rz,w,h,d)});
  const cyl=(L,rt,rb,h,n,c,x,y,z,rx,ry,rz)=>L.push({g:new T.CylinderGeometry(rt,rb,h,n),c,m:xf(x,y,z,rx,ry,rz)});
  const geo=(L,g,c,x,y,z,rx,ry,rz,sx,sy,sz)=>L.push({g,c,m:xf(x,y,z,rx,ry,rz,sx,sy,sz)});
  const RED=0xc8231c,WHITE=0xf2f2ee,DARK=0x1b1d22,GLS=0x22364a,TIRE=0x141518,ALU=0xb9c0c8,CHR=0xdfe5ec,YEL=0xf2c12e,TAN=0xc9a86a,STEEL=0x5b6470,WOOD=0x9a6a3e,CONC=0x9aa0a6;
  // a fire engine (nose +z, wheels on y = 0): body parts (vertex colours), text planes (atlas), red and blue lights
  function engine(ladder,tk){const B=[],A=[],LR=[],LB=[],W=3.8,hw=1.9,hl=7;
   bx(B,W*.86,.55,13.4,DARK,0,.5,0);
   // cab: crew cab with windows, white roof, grille, bumper, lamps, mirrors and the unit name on both doors
   bx(B,W,3.5,3.4,RED,0,1.0,hl-1.7);bx(B,W*.9,1.3,.06,GLS,0,2.95,hl+.02);bx(B,W+.02,.14,3.42,WHITE,0,4.5,hl-1.7);
   for(const s of[-1,1]){bx(B,.06,1.1,1.3,GLS,s*(hw+.02),3.1,hl-.9);bx(B,.06,1.0,1.0,GLS,s*(hw+.02),3.15,hl-2.6);bx(B,.1,.6,.3,DARK,s*(hw+.35),2.9,hl-.2);bx(B,.4,.08,.08,DARK,s*(hw+.18),3.3,hl-.2);
    bx(B,.5,.35,.06,0xfff4c2,s*1.35,1.85,hl+.03);A.push({g:new T.PlaneGeometry(2.2,.44),r:RG[tk],m:xf(s*(hw+.03),2.15,hl-1.75,0,s*Math.PI/2,0)})}
   bx(B,W*.5,1.0,.08,CHR,0,1.4,hl+.04);bx(B,W+.2,.5,.5,CHR,0,.65,hl+.25);
   // body with roll-up compartment doors, white and yellow stripes, rear step and tail lights
   bx(B,W,3.0,10.5,RED,0,1.0,-1.75);bx(B,W+.06,.3,13.8,WHITE,0,1.05,0);bx(B,W+.07,.08,13.8,YEL,0,1.38,0);
   for(const s of[-1,1])for(const cz of[-5.2,-2.4,.4]){bx(B,.06,2.0,2.3,ALU,s*(hw+.03),1.6,cz);for(let k=0;k<4;k++)bx(B,.07,.05,2.3,0x7e858e,s*(hw+.035),1.95+k*.42,cz)}
   if(!ladder)for(const s of[-1,1]){bx(B,.08,1.7,.95,CHR,s*(hw+.04),1.6,2.75);for(let k=0;k<3;k++)geo(B,new T.CylinderGeometry(.12,.12,.04,10),DARK,s*(hw+.09),2.0+k*.42,2.75,0,0,Math.PI/2)}
   bx(B,W*.8,.15,.6,ALU,0,.85,-hl-.25);for(const s of[-1,1])bx(B,.45,.4,.06,0xd01010,s*1.5,1.6,-hl-.03);bx(B,W*.5,.25,.06,YEL,0,2.4,-hl-.03);
   // wheels: single front axle, tandem rear
   for(const z of[hl-2.0,-hl+2.6,-hl+4.3])for(const s of[-1,1]){geo(B,new T.CylinderGeometry(.78,.78,.55,18),TIRE,s*(hw-.22),.78,z,0,0,Math.PI/2);geo(B,new T.CylinderGeometry(.36,.36,.58,10),CHR,s*(hw-.22),.78,z,0,0,Math.PI/2)}
   if(!ladder){// hose bed (folded hose in layers), deck gun, ground ladders on the roof rack
    bx(B,W*.86,.3,5.6,DARK,0,4.0,-4.0);[YEL,RED,YEL,WHITE].forEach((c,k)=>bx(B,W*.8,.11,5.4,c,0,4.3+k*.11,-4.0));
    cyl(B,.3,.36,.35,12,CHR,0,4.17,.6);bx(B,.2,.2,1.1,CHR,0,4.45,.95,0,-.35);bx(B,.3,.12,7,ALU,hw-.35,4.0,-2.2);bx(B,.3,.12,7,ALU,-hw+.35,4.0,-2.2)}
   else{// aerial ladder on its turntable, bedded over the cab
    cyl(B,1.2,1.3,.5,20,ALU,0,4.25,-4.9);bx(B,1.2,.9,1.6,RED,0,4.5,-4.9);bx(B,.5,.85,.5,DARK,0,4.5,4.8);
    const lz0=-5.6,len=12.8,y0=5.35;for(const s of[-1,1]){bx(B,.12,.36,len,ALU,s*.78,y0,lz0+len/2);bx(B,.1,.1,len,ALU,s*.78,y0+.6,lz0+len/2)}
    for(let z=lz0+.3;z<lz0+len;z+=.55)bx(B,1.5,.07,.07,ALU,0,y0+.15,z);for(const s of[-1,1])for(let z=lz0+.6;z<lz0+len;z+=1.6)bx(B,.06,.6,.06,ALU,s*.78,y0+.1,z)}
   // light bar (red left, blue right) and the rear corner lights
   bx(LR,W*.38,.24,.45,0xff3b30,-W*.2,4.64,hl-.6);bx(LB,W*.38,.24,.45,0x2f6fd9,W*.2,4.64,hl-.6);bx(LR,.08,.32,.32,0xff3b30,-(hw+.04),3.6,-hl+.3);bx(LB,.08,.32,.32,0x2f6fd9,hw+.04,3.6,-hl+.3);
   bx(LR,.3,.2,.06,0xff3b30,-.9,2.15,hl+.05);bx(LB,.3,.2,.06,0x2f6fd9,.9,2.15,hl+.05);
   return{B,A,LR,LB}}
  function buildFire(){
   const RW=52,RD=22,RH=12,X0=-RW/2+.25,X1=RW/2-.25,Z0=-RD/2+.25; // inner faces: side walls x = +-25.75, back wall z = -10.75
   const R=room({w:RW,d:RD,h:RH,wall:0x8c3b2e,wall2:0x7a3428,floor:0x8f959b,bg:0x101722,light:0xfff1d6,deco:false});FS.S=R.S;
   const VM=[],GM=[],AT=[];
   const ap=(k,w,h,x,y,z,ry,rx)=>AT.push({g:new T.PlaneGeometry(w,h),r:RG[k],m:xf(x,y,z,rx,ry,0)});
   // ---- walls: concrete wainscot, white band, a darker plinth ----
   for(const[a,b]of[[X0,-19.1],[-10.9,-8.6],[-.4,X1]]){bx(VM,b-a,1.6,.12,0x9b9f9f,(a+b)/2,0,Z0+.06);bx(VM,b-a,.16,.16,WHITE,(a+b)/2,1.6,Z0+.08)}for(const s of[-1,1]){bx(VM,.12,1.6,RD,0x9b9f9f,s*(X1-.06),0,0);bx(VM,.16,.16,RD,WHITE,s*(X1-.08),1.6,0)}
   // ---- floor: lane lines for both bays, a red keep-clear box at the pole ----
   for(const ex of[-15,-4.5])for(const s of[-1,1])bx(VM,.18,.04,19.5,YEL,ex+s*2.9,0,-.9);
   for(const[w,d,x,z]of[[2.6,.16,16.4,-7.5],[2.6,.16,16.4,-4.9],[.16,2.6,15.1,-6.2],[.16,2.6,17.7,-6.2]])bx(VM,w,.04,d,0xd93a2f,x,0,z);
   // ---- the two open rear roller doors (the street outside painted on the atlas), jambs, roll housings, bollards ----
   const DW=8.2,DH=6.3;for(const[dx,k]of[[-15,'out1'],[-4.5,'out2']]){ap(k,DW,DH,dx,DH/2,Z0+.08,0);
    for(const s of[-1,1]){bx(VM,.5,DH+.2,.5,0x6e7378,dx+s*(DW/2+.25),0,Z0+.2);cyl(VM,.22,.22,1.4,12,YEL,dx+s*(DW/2+.75),.7,Z0+.9);bx(VM,.46,.12,.46,DARK,dx+s*(DW/2+.75),1.4,Z0+.9)}
    bx(VM,DW+1.4,1.1,1.1,0x4a4f57,dx,DH,Z0+.6);bx(VM,DW,.45,.12,0x9aa3ad,dx,DH-.45,Z0+.5);for(let k=0;k<3;k++)bx(VM,DW,.04,.14,0x6e7378,dx,DH-.4+k*.13,Z0+.5);
    ap('clr',3.6,.54,dx,DH+.55,Z0+1.17,0)}
   ap('title',18,1.64,-9.75,10.3,Z0+.12,0);bx(VM,18.3,1.94,.1,DARK,-9.75,9.33,Z0+.05);
   ap('spd',1.2,.84,-9.75,3.4,Z0+.14,0);
   // fire bell over the boards and the wall alarm beacon between the doors (flashes with the engines)
   geo(GM,new T.SphereGeometry(.55,16,8,0,Math.PI*2,0,Math.PI/2),0xd9b45a,1.6,7.5,Z0+.6,Math.PI/2,0,0);cyl(GM,.08,.08,.5,8,0xd9b45a,1.6,7.5,Z0+.25,Math.PI/2);
   // ---- duty board and calls board on the back wall ----
   const frame=(cx,cy,w,h,t,c)=>{for(const[a,b,x,y]of[[w+t*2,t,cx,cy-h/2-t],[w+t*2,t,cx,cy+h/2],[t,h,cx-w/2-t/2,cy-h/2],[t,h,cx+w/2+t/2,cy-h/2]])bx(VM,a,b,.22,c,x,y,Z0+.12)};
   ap('shift',6,4.5,3.4,4.05,Z0+.1,0);frame(3.4,4.05,6,4.5,.2,0x3a3f46);ap('calls',6.6,4.5,10.3,4.05,Z0+.1,0);frame(10.3,4.05,6.6,4.5,.2,0x3a3f46);
   // ---- hose rack (back-left corner): coiled hoses on two steel arms, couplings, nozzles; poster above ----
   {const z=Z0+.5;for(const y of[2.1,4.5]){bx(GM,5.6,.12,.9,STEEL,-22.6,y-.06,z);for(const hx of[-24.4,-22.6,-20.8]){bx(GM,.1,.6,.1,STEEL,hx,y-.6,Z0+.1)}}
    const HC=[0xe9e2cf,0xc8231c,0xf2c12e,0xc8231c,0xe9e2cf,0x2f6fd9];let k=0;for(const y of[2.1,4.5])for(const hx of[-24.4,-22.6,-20.8]){const c=HC[k++];geo(VM,new T.TorusGeometry(.62,.2,8,20),c,hx,y+.72,z+.05);geo(VM,new T.TorusGeometry(.32,.18,8,16),c,hx,y+.72,z+.05);cyl(GM,.13,.13,.3,10,0xd9b45a,hx+.62,y+.3,z+.2)}
    for(const nx of[-24,-21.4]){cyl(GM,.12,.2,.8,10,0xd9b45a,nx,1.0,Z0+.35);cyl(VM,.16,.16,.25,10,DARK,nx,1.45,Z0+.35)}
    ap('poster',2.3,3.2,-22.6,7.6,Z0+.1,0);frame(-22.6,7.6,2.3,3.2,.12,0x22252b)}
   // a training hydrant and an extinguisher
   cyl(VM,.32,.36,1.3,12,0xd93a2f,-20,0.65,Z0+2.2);geo(VM,new T.SphereGeometry(.34,12,6,0,Math.PI*2,0,Math.PI/2),0xd93a2f,-20,1.3,Z0+2.2);cyl(VM,.14,.14,.9,8,0xd93a2f,-20,.85,Z0+2.2,0,0,Math.PI/2);cyl(VM,.5,.5,.12,14,0xd93a2f,-20,.06,Z0+2.2);
   cyl(VM,.22,.22,.9,12,0xd93a2f,19.6,1.25,-4.3);bx(VM,.5,.5,.1,0xd93a2f,19.6,2.0,-4.5);
   // ---- turnout gear racks along the left wall: helmet, coat, pants in boots, a brass name plate per bay ----
   {const HEL=[WHITE,YEL,YEL,0x16181c,YEL,0x16181c];for(let k=0;k<6;k++){const z=-8.7+k*2.5,x=X0+.6;
     for(const s of[-1,1])bx(GM,.1,5,.1,STEEL,X0+1.1,0,z+s*1.2);bx(GM,1.2,.08,2.5,STEEL,X0+.6,4.4,z);bx(GM,.08,.08,2.4,STEEL,X0+.9,3.85,z);
     geo(VM,new T.SphereGeometry(.4,14,8,0,Math.PI*2,0,Math.PI/2),HEL[k],x,4.48,z,0,0,0,1,.9,1.15);cyl(VM,.56,.6,.06,16,HEL[k],x,4.5,z+.08);
     if(k<5){bx(VM,.55,2.0,1.5,TAN,X0+.5,1.85,z);bx(VM,.57,.12,1.52,YEL,X0+.5,2.25,z);bx(VM,.57,.12,1.52,YEL,X0+.5,3.2,z);for(const s of[-1,1])bx(VM,.42,1.6,.34,TAN,X0+.55,2.15,z+s*.92);
      bx(VM,.62,.55,.95,TAN,X0+.9,.62,z);bx(VM,.64,.08,.97,YEL,X0+.9,.86,z);for(const s of[-1,1])bx(VM,.55,.68,.32,0x16181c,X0+.92,0,z+s*.22)}
     ap('nm'+k,2.2,.4,X0+.08,5.15,z,Math.PI/2)}
    bx(VM,1.1,.65,14.2,WOOD,X0+2.7,0,-2.45);for(const z of[-9.2,-2.45,4.3])bx(VM,.9,.6,.2,DARK,X0+2.7,0,z)}
   // ---- lockers along the left wall (front) ----
   {for(let k=0;k<5;k++){const z=5.9+k*.98,x=X0+.6;bx(VM,1.1,4.6,.94,k%2?0x8d969f:0x99a2ab,x,0,z);for(let v=0;v<3;v++)bx(VM,.04,.06,.5,0x3a3f46,x+.56,3.7+v*.18,z);bx(VM,.06,.32,.06,CHR,x+.57,2.3,z+.3);bx(VM,.04,.3,.6,WHITE,x+.56,4.0,z)}
    bx(VM,1.15,.15,4.95,0x6e7378,X0+.6,4.6,7.86)}
   // ---- upper floor (back-right): slab around the pole hole, fascia, columns, railings, stairs down along the right wall ----
   {const y=5.6,t=.4,zb=Z0,zf=-4.5,hx0=15.5,hx1=17.3,hz0=-7.1,hz1=-5.3;
    const slab=(x0,x1,z0,z1)=>bx(VM,x1-x0,t,z1-z0,CONC,(x0+x1)/2,y,(z0+z1)/2);slab(14,hx0,zb,zf);slab(hx1,X1,zb,zf);slab(hx0,hx1,hz1,zf);slab(hx0,hx1,zb,hz0);
    bx(VM,X1-14,.42,.08,RED,(14+X1)/2,y-.01,zf+.04);bx(VM,.08,.42,zf-zb,RED,13.96,y-.01,(zb+zf)/2);
    for(const cx of[14.3,19.6])bx(VM,.4,y,.4,STEEL,cx,0,zf-.25);
    const rail=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(x1-x0,z1-z0);for(const ry of[6.55,7.1])bx(GM,.08,.08,L,CHR,(x0+x1)/2,ry,(z0+z1)/2,a);const n=Math.max(1,Math.round(L/1.5));for(let i=0;i<=n;i++)bx(GM,.08,1.1,.08,CHR,x0+(x1-x0)*i/n,6,z0+(z1-z0)*i/n)};
    rail(14.1,zf-.12,22.9,zf-.12);rail(14.1,zb+.2,14.1,zf-.12);rail(hx0-.1,hz0-.1,hx0-.1,hz1+.1);rail(hx0-.1,hz0-.1,hx1,hz0-.1);rail(hx0-.1,hz1+.1,hx1,hz1+.1);
    // stairs: 12 steps from the floor at z = 3.5 up to the slab at z = -4.5, along the right wall
    for(let i=0;i<12;i++){const zc=3.5-(i+.5)*.667;bx(VM,2.5,(i+1)*.5,.667,i%2?0x8a9096:0x949aa0,24.45,0,zc);bx(VM,2.5,.04,.12,YEL,24.45,(i+1)*.5,zc+.3)}
    for(const sx of[23.1])bx(GM,.08,.08,10,CHR,sx,4.15,-.5,0,.6435);for(const[sx,sz,sy]of[[23.1,3.4,0],[23.1,-.5,0],[23.1,-4.4,0]])bx(GM,.08,sy+1.1+(3.5-sz)*.75,.08,CHR,sx,0,sz);
    // the pole: brass, floor to ceiling through the hole, a landing mat at its foot
    cyl(GM,.13,.13,RH,12,0xe0bb5a,16.4,RH/2,-6.2);cyl(VM,1.05,1.05,.06,24,0x3a2a24,16.4,.03,-6.2);
    // on the upper floor: couch, coffee table, the bunk room door and its sign, the DAYS WITHOUT INCIDENT sign
    bx(VM,4,.7,1.4,0x2f4f7a,19.8,y+t,-9.5);bx(VM,4,1.3,.4,0x2f4f7a,19.8,y+t,-10.25);for(const s of[-1,1])bx(VM,.4,1.0,1.4,0x2f4f7a,19.8+s*2.2,y+t,-9.5);bx(VM,2,.5,1,WOOD,19.8,y+t,-7.6);
    bx(VM,2.2,3.9,.12,WOOD,24,y+t,Z0+.08);bx(VM,.1,.1,.2,CHR,23.2,y+t+1.9,Z0+.2);ap('bunk',3.5,.7,24,y+t+4.45,Z0+.08,0);
    ap('days',4.8,2.62,18.6,y+t+3.5,Z0+.1,0);frame(18.6,y+t+3.5,4.8,2.62,.18,0x2e7d4f);
    // lockers under the upper floor
    for(let k=0;k<9;k++){const x=15.4+k*1.05;bx(VM,1,4.4,1.05,k%2?0xa8261e:0xb52f25,x,0,Z0+.55);for(let v=0;v<3;v++)bx(VM,.5,.06,.04,0x3a2020,x,3.6+v*.18,Z0+1.09);bx(VM,.06,.32,.06,CHR,x+.3,2.2,Z0+1.1)}}
   // ---- kitchen corner (front-right): peninsula counter with sink, stove, coffee machine; fridge; mess table with benches; menu board ----
   {const cz=2.8;bx(VM,9,1.45,1.3,0x5b4636,15,0,cz);bx(VM,9.2,.12,1.45,0xd9d4c8,15,1.45,cz);bx(VM,1.4,.04,.9,0x9aa3ad,12.3,1.57,cz);bx(GM,.08,.6,.08,CHR,12.3,1.57,cz-.4);
    bx(VM,1.7,.05,1.1,DARK,17.6,1.57,cz);cyl(GM,.42,.42,.6,14,0xc0c6cc,17.4,1.92,cz);cyl(VM,.4,.4,.04,14,0x7a2a18,17.4,2.21,cz);
    bx(VM,.7,.85,.6,DARK,10.9,1.57,cz-.1);bx(VM,.1,.1,.04,0xff3b30,10.75,2.2,cz+.21);for(const mx of[11.6,13.6,14.1])cyl(VM,.1,.09,.22,8,mx===13.6?0xc8231c:WHITE,mx,1.68,cz+.3);
    bx(VM,1.6,4.2,1.5,0xe9ecef,20.9,0,2.9);bx(VM,.06,1.4,.06,CHR,20.3,2.4,3.67);bx(VM,1.62,.05,1.52,0xb9c0c8,20.9,2.75,2.9);
    const tz=7.2;bx(VM,6,.15,2.6,WOOD,15,1.5,tz);for(const s of[-1,1])for(const u of[-1,1])bx(VM,.15,1.5,.15,0x6b4a2b,15+s*2.7,0,tz+u*1.1);
    for(const u of[-1,1]){bx(VM,6,.12,.8,WOOD,15,.92,tz+u*1.95);for(const s of[-1,1])bx(VM,.12,.92,.6,0x6b4a2b,15+s*2.6,0,tz+u*1.95)}
    for(let k=0;k<6;k++){const px=12.8+(k%3)*2.2,pz=tz+(k<3?-.75:.75);cyl(VM,.32,.32,.04,14,WHITE,px,1.67,pz);cyl(VM,.22,.22,.05,12,0x8a2f1a,px,1.7,pz)}
    cyl(GM,.45,.4,.55,14,0xc0c6cc,15,1.93,tz);cyl(VM,.42,.42,.04,14,0x7a2a18,15,2.2,tz);bx(VM,.9,.3,.5,0xe8b931,16.6,1.58,tz);
    // A-frame menu board facing the room
    {const mx=20.4,mz=7.6;AT.push({g:new T.PlaneGeometry(2.1,1.58),r:RG.menu,m:xf(mx,1.6,mz+.19,-.18,0,0)});bx(VM,2.3,2.5,.1,0x8a6a42,mx,.2,mz+.12,0,-.18);bx(VM,2.3,2.5,.1,0x8a6a42,mx,.2,mz-.38,0,.18)}}
   // ---- build the meshes ----
   const cv=document.createElement('canvas');cv.width=cv.height=AW;FS.cx=cv.getContext('2d');const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;FS.tex=tex;paintStatic();
   const add=(par,L,m,cast)=>{if(!L.length)return null;const o=new T.Mesh(mergeParts(L),m);o.castShadow=cast;o.receiveShadow=true;par.add(o);return o};
   const VCM=new T.MeshStandardMaterial({vertexColors:true,roughness:.75,metalness:0}),GMM=new T.MeshStandardMaterial({vertexColors:true,roughness:.32,metalness:.55}),
    ATM=new T.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.42,roughness:.8,side:T.DoubleSide}),ENM=new T.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:.15});
   FS.red=new T.MeshStandardMaterial({color:0xff3b30,emissive:0xff3b30,emissiveIntensity:.4});FS.blue=new T.MeshStandardMaterial({color:0x2f6fd9,emissive:0x2f6fd9,emissiveIntensity:.4});
   add(R.S,VM,VCM,true);add(R.S,GM,GMM,true);add(R.S,AT,ATM,false);
   // the wall beacon between the doors
   {const b=new T.Mesh(new T.CylinderGeometry(.3,.3,.4,14),FS.red);b.position.set(-9.75,7.9,Z0+.35);b.rotation.x=Math.PI/2;R.add(b)}
   FS.E=[[-15,false,'eng1'],[-4.5,true,'lad2']].map(([ex,lad,tk])=>{const p=engine(lad,tk),g=new T.Group();g.position.set(ex,0,-1.5);R.add(g);add(g,p.B,ENM,true);add(g,p.A,ATM,false);add(g,p.LR,FS.red,false);add(g,p.LB,FS.blue,false);g.userData.nm=1;return g});
   FS.alarm=new T.PointLight(0xff3020,0,30,1.6);FS.alarm.position.set(-9.75,7,-6);R.add(FS.alarm);
   liveBoards();
   // the crew: the chief by the duty board, Engine 1's driver checking the engine, the cook, the firefighter on the pole
   FS.chief=mkP(FS.S,'#22252b',300,'Fire Chief');FS.ff=[0,1,2].map(k=>mkP(FS.S,'#c8231c',301+k,'Firefighter'));
   FS.built=true}
  // the pole run: walk on the upper floor to the hole, slide down, check Ladder 2, walk to the stairs, climb, back to the hole
  const PR=(()=>{const P=[[18.4,6,-6.2,2.2],[16.4,6,-6.2,0],[16.4,0,-6.2,.6,1],[12.5,0,-2.4,0],[-1.6,0,-2.4,4],[12.5,0,-.6,0],[22.2,0,.6,0],[22.4,0,4.5,0],[24.4,0,4.4,.3],[24.4,6,-4.6,0],[24.2,6,-6,0],[18.4,6,-6.2,0]];
   const S=[{a:P[0],b:P[0],t0:0,t1:P[0][3],wait:1}];let t=P[0][3];for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],slide=b[4],d=Math.hypot(b[0]-a[0],b[2]-a[2]),dur=slide?1.3:Math.max(.4,(d+Math.abs(b[1]-a[1])*.6)/2.4);S.push({a,b,t0:t,t1:t+dur,slide});t+=dur;if(b[3]){S.push({a:b,b,t0:t,t1:t+b[3],wait:1});t+=b[3]}}
   return{S,T:t}})();
  function poleRun(m,t){t=((t%PR.T)+PR.T)%PR.T;const s=PR.S.find(q=>t>=q.t0&&t<q.t1)||PR.S[PR.S.length-1],u=clamp((t-s.t0)/((s.t1-s.t0)||1),0,1),a=s.a,b=s.b;
   const x=a[0]+(b[0]-a[0])*u,z=a[2]+(b[2]-a[2])*u,y=a[1]+(b[1]-a[1])*(s.slide?u*u:u),moving=!s.wait&&!s.slide;
   let ang=m.userData.fa==null?-Math.PI/2:m.userData.fa;if(moving&&Math.hypot(b[0]-a[0],b[2]-a[2])>.01)ang=Math.atan2(b[0]-a[0],b[2]-a[2]);if(s.slide)ang+=.05;if(s.wait&&b[0]<0)ang=-Math.PI/2;m.userData.fa=ang;
   putP(m,{x,z,ang},moving);m.position.y+=y;m.userData.slide=s.slide&&u<1}
  function syncFire(dt){FS.clk+=dt||0;liveBoards();const t=simTime,lc=liveCall();
   // alarm flash: 4 s when you come in, and all the time while Engine 1 is out on a fire call
   const e=FS.clk-FS.t0,on=lc||e<4,ph=Math.floor(FS.clk*6)%2;FS.red.emissiveIntensity=on?(ph?3:.3):.4;FS.blue.emissiveIntensity=on?(ph?.3:3):.4;FS.alarm.intensity=on?(ph?55:8):0;
   FS.E[0].visible=!lc;
   loopP(FS.chief,[[3.4,-8.3],[3.4,-5.6],[-1.6,-4.4]],30,.15,.32);
   const f0=FS.ff[0];f0.visible=!lc;if(!lc)loopP(f0,[[-12.4,5],[-12.4,-9.4],[-17.6,-9.6]],26,0,.25);
   loopP(FS.ff[1],[[17.2,1.75],[12.6,1.75]],14,.4,.3);if(Math.floor(t/7)%2===0&&FS.ff[1].position.x>16.8)FS.ff[1].rotation.y=0;
   poleRun(FS.ff[2],t)}
  function labelsFire(){const lc=liveCall();staffTag(FS.chief,'w_fire','Fire Chief',0,4.4);FS.ff.forEach((m,k)=>staffTag(m,'w_fire','Firefighter',k,4.0+m.position.y));
   if(FS.ff[2].userData.slide){const m=FS.ff[2];tag(m.position.x,m.position.y+5.2,m.position.z,'WHOOSH! DOWN THE POLE','rgba(255,211,77,.95)','#1d0f02')}
   if(lc){tag(-15,3.2,-1.5,`ENGINE 1 OUT · CAR FIRE · ${lc.car.plate}`,'rgba(217,58,47,.95)','#fff');pill(`🚒 LIVE CALL: car fire, ${lc.car.plate}${lc.resp&&lc.resp.driver?' · '+lc.resp.driver+' driving':''}`,HUDW/2,200,26,'rgba(217,58,47,.95)','#fff')}
   else if(FS.clk-FS.t0<4)pill('🚨 ALARM DRILL · CREW TO THE ENGINES',HUDW/2,200,24,'rgba(217,58,47,.95)','#fff');
   header('INSIDE THE FIRE STATION')}
  INTS.fire={get scene(){return FS.S},build:buildFire,isBuilt:()=>FS.built,sync:syncFire,labels:labelsFire,get home(){return FS.home},onEnter(){FS.t0=FS.clk}};
  // ---------- the exterior in the city (world/world3d.js calls FIRE.ext when w_fire is open): one vertex-coloured mesh + one for the lights ----------
  // local frame: doors face -z, the building is 24 x 16 m; the two engines are the interior's models at 0.6 scale (Engine 1 out on the apron, Ladder 2 in its bay)
  FIRE.ext=(g,x,z)=>{const L=[],LT=[],BR=0xa9483a,BR2=0x8f3b2f,TR=0xf1eee6,DR=0xb8241c,DRL=0x93201a,IN=0x15171b,CONC=0xc9cbc8,ROOF=0x3b3f46,GL=0x2c4a66,BRASS=0xd9b24a;
   // apron, kerb stripe and bay lines
   bx(L,26,.08,12.5,CONC,0,0,-14.2);for(let k=0;k<13;k++)bx(L,2,.1,.5,k%2?TR:DR,-12+k*2,.01,-20.3);
   for(const bx0 of[-7.6,0,7.6])for(const s of[-1,1])bx(L,.16,.1,10.5,YEL,bx0+s*2.9,.02,-13.6);
   // main block: plinth, brick walls, white cornice, flat roof with parapet
   bx(L,24.4,.7,16.4,CONC,0,0,0);bx(L,24,8.6,16,BR,0,.7,0);bx(L,24.2,.18,16.2,BR2,0,5.95,0);bx(L,24.9,.55,16.9,TR,0,9.3,0);bx(L,24.3,.35,16.3,ROOF,0,9.85,0);
   for(const s of[-1,1]){bx(L,24.6,.7,.3,TR,0,9.85,s*8.2);bx(L,.3,.7,16.6,TR,s*12.2,9.85,0)}
   // three bays: white pillars and header, two open bays (dark inside), one closed red roller door
   for(const px of[-11.6,-3.8,3.8,11.6])bx(L,.9,5.9,.6,TR,px,.7,-8.1);bx(L,24.2,.6,.6,TR,0,6.0,-8.1);
   for(const bx0 of[-7.6,0]){bx(L,6.8,5.3,.2,IN,bx0,.7,-7.9);bx(L,6.8,.35,.3,DR,bx0,5.65,-8.05)} // rolled-up doors in their boxes
   bx(L,6.8,5.3,.25,DR,7.6,.7,-8.05);for(let k=0;k<10;k++)bx(L,6.8,.06,.28,DRL,7.6,1.1+k*.5,-8.07);for(let k=0;k<4;k++)bx(L,1.2,.5,.3,GL,7.6-2.4+k*1.6,3.6,-8.09);
   // bay numbers (gold discs) and upper windows with white sills
   [-7.6,0,7.6].forEach((bx0,k)=>{geo(L,new T.CylinderGeometry(.34,.34,.08,20),BRASS,bx0,6.3,-8.45,Math.PI/2);for(const d of[-2.2,0,2.2]){bx(L,1.3,1.4,.12,GL,bx0+d,7.0+(d?0:0),-8.06);bx(L,1.6,.14,.3,TR,bx0+d,6.92,-8.12);bx(L,1.5,.12,.2,TR,bx0+d,8.44,-8.1)}});
   // side walls: windows on both floors, a side door with a canopy on the left
   for(const s of[-1,1])for(const wz of[-4.5,-1.5,1.5,4.5]){bx(L,.12,1.3,1.2,GL,s*12.04,2.6,wz);bx(L,.12,1.3,1.2,GL,s*12.04,7.0,wz);bx(L,.3,.12,1.4,TR,s*12.1,2.5,wz);bx(L,.3,.12,1.4,TR,s*12.1,6.9,wz)}
   bx(L,.15,2.6,1.4,DR,-12.08,.7,6.6);bx(L,1.2,.12,2.0,TR,-12.6,3.5,6.6);
   // hose-drying tower (back right): white bands, louvres, a pyramid cap and a flag
   bx(L,3.6,15,3.6,BR,9,0,4);bx(L,3.8,.4,3.8,TR,9,9.6,4);bx(L,3.9,.5,3.9,TR,9,15,4);for(let k=0;k<5;k++)bx(L,1.6,.18,.12,IN,9,10.6+k*.75,2.15);
   geo(L,new T.ConeGeometry(2.8,2.2,4),ROOF,9,16.6,4,0,Math.PI/4);cyl(L,.06,.06,3.2,6,TR,9,19.2,4);bx(L,.05,.9,1.5,DR,9,19.6,4.78);
   // the brass bell on a bracket, hydrants, bollards, a bench and the flagpole
   bx(L,.12,.12,1.0,IN,12.2,6.6,-8.6);geo(L,new T.CylinderGeometry(.18,.42,.6,14),BRASS,12.2,6.25,-9.0);
   for(const s of[-1,1]){cyl(L,.26,.3,.8,10,DR,s*13.4,.4,-19.2);cyl(L,.32,.32,.12,10,DR,s*13.4,.86,-19.2);bx(L,.7,.16,.16,DR,s*13.4,.55,-19.2)}
   for(const px of[-11.6,-3.8,3.8,11.6]){cyl(L,.16,.16,1.0,8,YEL,px,.5,-9.2);bx(L,.34,.12,.34,IN,px,1.0,-9.2)}
   bx(L,2.2,.12,.6,0x8a5a32,-14.2,.55,-4);for(const s of[-1,1])bx(L,.12,.5,.5,IN,-14.2+s*.95,0,-4);
   cyl(L,.08,.1,11,8,0xd0d4da,-14.4,5.5,-11);bx(L,.04,1.2,2.0,DR,-14.4,10.0,-10.0);
   // engines: Engine 1 nose out on the apron, Ladder 2 half out of bay 2 (the interior's builder, scaled down, no door lettering)
   for(const [ex,ez,lad] of[[-7.6,-13.2,false],[0,-9.6,true]]){const P=xf(ex,0,ez,0,Math.PI,0,.6,.6,.6),p=engine(lad,lad?'lad2':'eng1');
    for(const q of p.B){q.m=P.clone().multiply(q.m);L.push(q)}for(const q of[...p.LR,...p.LB]){q.m=P.clone().multiply(q.m);LT.push(q)}}
   const m1=new T.Mesh(mergeParts(L),new T.MeshStandardMaterial({vertexColors:true,roughness:.72,metalness:.05}));m1.castShadow=true;m1.receiveShadow=true;m1.position.set(x,0,z);g.add(m1);
   const m2=new T.Mesh(mergeParts(LT),new T.MeshBasicMaterial({vertexColors:true}));m2.position.set(x,0,z);g.add(m2);
   g.add(sign('MOTOROPOLIS FIRE STATION · No. 1',16,1.5,'#d93a2f','#ffffff',x,10.5,z-8.45,0))};
 }
