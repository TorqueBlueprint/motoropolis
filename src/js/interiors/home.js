//@ interiors/home.js - Riverside Heights: every subscriber has a home. A car fan's house with an attached garage, one interior template
//@ parameterised per person (wall, sofa, rug, curtains, kitchen, posters, car model and colour: seeded from the name, overridable from
//@ state.json "homes", see README "Homes"). Registers INTS.home, W3.homeHit (click on a house or a flat block, view3d/camera.js),
//@ W3.homeLabels (one STEP INSIDE board for the nearest home + a few "★ name" tags when close, view3d/labels.js) and UIX.homeOf
//@ (Find my name: "Go to my home", ui/welcome.js). Only when isOpen('w_res'). Inside the if(WORLD){ block of world/world3d.js.
//@ Launch gate HOMES_AT (0 = off; preview ?homes=1). Seeded (no Math.random). Static furniture is merged into 4 meshes (vertex-coloured, metal, glass, one atlas for every board, poster
//@ and screen); the room is rebuilt when you enter a different person's home.
  // launch gate: the homes go live at HOMES_AT (ms since epoch, UTC; 0 = not yet). Preview with ?homes=1; always on in the recorder and on localhost
  const HOMES_AT=1795860000000/* 2026-11-28 10:00 Lisbon (UTC) */,HOMES_ON=(HOMES_AT>0&&Date.now()>=HOMES_AT)||/[?&]homes=1\b/.test(location.search)||document.documentElement.dataset.rec==='1'||/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  window.__HOMES_ON=HOMES_ON;
  if(HOMES_ON){
   const hshort=(n,k)=>n.length>k?n.slice(0,k-1)+'…':n;
   const hhash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return h>>>0};
   // ---------- who lives where ----------
   // Stable: names are processed in WALL order (state.json "names" only ever grows at the end) and each takes the first free slot from
   // its own hash, so a newcomer never moves anyone. Tier 1: the first 40 Riverside Heights houses (always built once the district opens);
   // tier 2: 48 flats in the three Maple Grove apartment blocks (16 each, floors 1-4, flats A-D); tier 3: the rest of the Riverside
   // Heights house slots (the house appears when the district grows that far; the interior is open already).
   const HN=40,FB=3,FPB=16,S2=CITY.slots.village,SA=CITY.slots.apart,HC=Math.min(HN,S2.length);
   let HA=null,HAsig='';
   function homeAssign(){const sig=WALL.length+'|'+(WALL[WALL.length-1]||'');if(HA&&sig===HAsig)return HA;HAsig=sig;const houses=new Map(),flats=new Map(),by={};
    for(const n of WALL){const h=hhash(n.toLowerCase());let a=null;
     for(let i=0;i<HC&&!a;i++){const k=(h+i)%HC;if(!houses.has(k)){houses.set(k,n);a={kind:'house',k}}}
     if(!a&&SA.length>=FB)for(let i=0;i<FB*FPB&&!a;i++){const f=((h>>>7)+i)%(FB*FPB);if(!flats.has(f)){flats.set(f,n);a={kind:'flat',f}}}
     if(!a&&S2.length>HN)for(let i=0;i<S2.length-HN&&!a;i++){const k=HN+((h>>>3)+i)%(S2.length-HN);if(!houses.has(k)){houses.set(k,n);a={kind:'house',k}}}
     if(a)by[n]=a}
    HA={by,houses,flats};return HA}
   const housesBuilt=()=>isOpen('w_res')?Math.min(S2.length,40+Math.floor(((subs||0)-100)*1.5)):0; // same count as world/world3d.js rebuild()
   const flatName=a=>{const r=a.f%FPB;return`FLAT ${Math.floor(r/4)+1}${'ABCD'[r%4]}`},blockName=a=>`MAPLE GROVE COURT ${Math.floor(a.f/FPB)+1}`;
   const homeAddr=a=>a.kind==='house'?`No. ${a.k+1} RIVERSIDE HEIGHTS`:`${flatName(a)} · ${blockName(a)}`;
   // ---------- per-person look: seeded defaults + validated overrides from state.json "homes" (README "Homes") ----------
   const HPAL={red:'#c8392b',orange:'#ff7a1a',yellow:'#e8b931',green:'#2e7d4f',mint:'#9fd8b5',teal:'#2a8c8c',blue:'#2f6fd9',navy:'#1f3a6e',purple:'#6a3fa0',pink:'#e58fb0',
    brown:'#7a4b2e',black:'#22252b',grey:'#8e949b',white:'#f4f4f0',cream:'#eadfca',beige:'#d9c49a'};
   const HCOL=['wall','sofa','rug','curtains','kitchen','car'],HPOST=['kestrel','rally','drag'];
   const HDEF={wall:['#eadfca','#e3e8dc','#e6dccf','#dde6ee','#efe2d0','#eadada'],sofa:['#3e5a7a','#7a2a22','#2e5a40','#5a5f6b','#8a6a3a','#5a3f80'],rug:['#1f3a6e','#8a1a14','#2e5a40','#3a2f55','#22252b'],
    curtains:['#2e7d4f','#c8392b','#1f3a6e','#d9822b','#7a8088'],kitchen:['#f3efe6','#9fb7c9','#2f3b4c','#c9d8c0','#e8dcc0'],car:['#d93a2f','#2f6fd9','#f2f2ee','#22252b','#2e8b57','#ff7a1a','#e8b931','#7a8088']};
   const HCARS=MODELS.filter(m=>m.glb&&!m.taxi&&!m.pickup&&m.price<=90000&&CAR_GLB[m.glb]&&!CAR_GLB[m.glb].keep); // everyday models that take a paint colour
   const HOVR=(typeof STATE==='object'&&STATE&&STATE.homes&&typeof STATE.homes==='object'&&!Array.isArray(STATE.homes))?STATE.homes:{};
   const hcolour=v=>{if(typeof v!=='string')return null;v=v.trim().toLowerCase();if(Object.prototype.hasOwnProperty.call(HPAL,v))return HPAL[v];return /^#[0-9a-f]{6}$/.test(v)?v:null};
   function homeParams(n){const h=hhash('look:'+String(n).toLowerCase()),P={};HCOL.forEach((k,i)=>{const L=HDEF[k];P[k]=L[(h>>>(i*3))%L.length]});P.poster=HPOST[(h>>>20)%3];P.model=HCARS.length?HCARS[(h>>>11)%HCARS.length]:null;
    let o=Object.prototype.hasOwnProperty.call(HOVR,n)?HOVR[n]:null;if(!o){const k=Object.keys(HOVR).find(q=>q.toLowerCase()===String(n).toLowerCase());if(k)o=HOVR[k]}
    if(o&&typeof o==='object'){for(const k of HCOL){const c=hcolour(o[k]);if(c)P[k]=c}if(typeof o.poster==='string'&&HPOST.includes(o.poster.toLowerCase()))P.poster=o.poster.toLowerCase();
     if(typeof o.model==='string'){const m=HCARS.find(q=>q.glb===o.model.toLowerCase());if(m)P.model=m}}
    return P}
   // ---------- in the city: click a house (or a flat block), labels ----------
   const HY=[],HM4=[],hv=new T.Vector3(),hr=new T.Ray(),hb=new T.Box3(new T.Vector3(-3.8,-.5,-3.6),new T.Vector3(3.8,7,3.6));
   const houseM4=k=>HM4[k]||(HM4[k]=(()=>{const[x,z,ry]=S2[k],y=CITY.hmin(x,z,3.4);HY[k]=y;return new T.Matrix4().makeRotationY(ry).setPosition(x,y,z).invert()})());
   const blockH=b=>8+((b*7)%5)*2.4+Math.min(10,(subs||0)/150); // as world/world3d.js (Maple Grove apartments)
   const flatPt=a=>{const b=Math.floor(a.f/FPB),r=a.f%FPB,[x,z]=SA[b],h=blockH(b);return{x:x+((r%4)-1.5)*2.4,y:1.6+Math.floor(r/4)*(h-2.4)/4,z:z+5.7}};
   W3.homeHit=ray=>{if(!INTS.home||!isOpen('w_res'))return false;const A=homeAssign(),nb=housesBuilt();let best=null,bd=1e9;
    for(const[k,n]of A.houses){if(k>=nb)continue;hr.copy(ray).applyMatrix4(houseM4(k));if(hr.intersectBox(hb,hv)){const d=hv.distanceTo(hr.origin);if(d<bd){bd=d;best=n}}}
    const bb=new T.Box3();for(let b=0;b<FB&&b<SA.length;b++){const[x,z]=SA[b];bb.min.set(x-5.5,0,z-5.5);bb.max.set(x+5.5,blockH(b),z+5.5);if(ray.intersectBox(bb,hv)){const d=hv.distanceTo(ray.origin);if(d<bd){
     let fb=null,fd=1e9;for(const[f,n]of A.flats){if(Math.floor(f/FPB)!==b)continue;const q=flatPt(A.by[n]);const dd=ray.distanceSqToPoint(hv.set(q.x,q.y,q.z));if(dd<fd){fd=dd;fb=n}}if(fb){bd=d;best=fb}}}}
    if(!best)return false;HM.want=best;return true};
   W3.homeLabels=zk=>{if(!INTS.home||!isOpen('w_res')||zk<=0)return;const A=homeAssign(),nb=housesBuilt(),near=[];
    for(const[k,n]of A.houses){if(k>=nb)continue;const[x,z]=S2[k],d=Math.hypot(x-cam.tx,z-cam.tz);if(d<140){houseM4(k);near.push({d,n,x,y:HY[k]+6.2,z,f:0,t:`HOME OF ${hshort(n,20)}`})}}
    for(const[f,n]of A.flats){const q=flatPt(A.by[n]),d=Math.hypot(q.x-cam.tx,q.z-cam.tz);if(d<140)near.push({d,n,x:q.x,y:q.y,z:q.z,f:1,t:`${flatName(A.by[n])} · ${hshort(n,18)}`})}
    if(!near.length)return;near.sort((a,b)=>a.d-b.d);const sz=clamp(2300/cam.dist,13,22),q=near[0],k=zk*clamp((140-q.d)/40,0,1);
    if(cam.dist<170)for(const o of near.slice(1,8)){if(o.d>70)break;if(o.f)continue;const sp=toHud(o.x,o.y-1.2,o.z);if(sp){hctx.globalAlpha=zk*clamp((70-o.d)/20,0,1)*.9;pill('★ '+hshort(o.n,18),sp.x,sp.y,sz*.72,'rgba(16,19,24,.78)','#ffd34d');hctx.globalAlpha=1}}
    const sp=k>0&&toHud(q.x,q.y,q.z);if(sp){hctx.globalAlpha=(.82+.18*Math.sin(simTime*3+9))*k;pill(`STEP INSIDE · ${q.t} ▶`,sp.x,sp.y,sz,'#22252b','#ffffff','#5cc98a');hctx.globalAlpha=1}};
   // Find my name: "Go to my home"
   function enterHome(n){HM.want=n;const go=()=>{if(fadeTo){setTimeout(go,120);return}if(mode==='in'){if(cur===INTS.home&&HM.who===n)return;exitIn();setTimeout(go,120);return}enterIn('home')};go()}
   UIX.homeOf=n=>{const a=homeAssign().by[n];if(!a||!isOpen('w_res'))return null;const wait=a.kind==='house'&&a.k>=housesBuilt();return{label:homeAddr(a)+(wait?' · being built':''),go:()=>enterHome(n)}};

   // ---------- inside ----------
   const HM={built:false,who:null,want:null,clk:0,wt:0,t0:-99,home:{tx:1,tz:-1,yaw:.1,pitch:.4,dist:44}};
   const wantName=()=>{const A=homeAssign();if(HM.want&&A.by[HM.want])return HM.want;return WALL.find(n=>A.by[n])||null};
   let sd=20261128;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
   const AW=2048,RG={tv:[0,0,1024,576],sotd:[1024,0,512,640],lap:[1536,0,512,320],pA:[1536,320,384,544],pB:[0,576,384,544],pC:[384,576,384,544],win:[768,576,512,512],
    home:[1280,864,768,192],plaque:[1280,1056,512,160],gsign:[1280,1216,768,144],peg:[0,1120,768,448],notes:[768,1120,512,320],jack:[768,1440,384,96],coll:[1152,1440,512,96],glow:[1920,320,128,128]};
   const FN="'Barlow Condensed','Arial Narrow',sans-serif",SERIF="Georgia,'Times New Roman',serif",SCRIPT="'Brush Script MT','Segoe Script',cursive";
   const paint=(k,fn)=>{const r=RG[k],x=HM.cx;x.save();x.translate(r[0],r[1]);x.beginPath();x.rect(0,0,r[2],r[3]);x.clip();x.textAlign='center';x.textBaseline='middle';fn(x,r[2],r[3]);x.restore()};
   const font=(x,sz,w,fam)=>{x.font=`${w||800} ${sz}px ${fam||FN}`};
   const fit=(x,t,maxW,sz,w,fam)=>{font(x,sz,w,fam);while(x.measureText(t).width>maxW&&sz>10){sz-=2;font(x,sz,w,fam)}return sz};
   const star=(x,cx,cy,r,col)=>{x.fillStyle=col;x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill()};
   // a generic side-view car silhouette (no make, no badge)
   function carSide(x,cx,cy,L,col,wheel){const H=L*.26;x.fillStyle=col;x.beginPath();x.moveTo(cx-L*.5,cy);x.lineTo(cx-L*.5,cy-H*.45);x.quadraticCurveTo(cx-L*.46,cy-H*.62,cx-L*.3,cy-H*.66);
    x.lineTo(cx-L*.16,cy-H*1.05);x.quadraticCurveTo(cx+L*.02,cy-H*1.18,cx+L*.16,cy-H*.98);x.lineTo(cx+L*.32,cy-H*.62);x.quadraticCurveTo(cx+L*.48,cy-H*.56,cx+L*.5,cy-H*.3);x.lineTo(cx+L*.5,cy);x.closePath();x.fill();
    x.fillStyle='rgba(20,30,45,.85)';x.beginPath();x.moveTo(cx-L*.13,cy-H*.66);x.lineTo(cx-L*.1,cy-H*.98);x.quadraticCurveTo(cx+L*.02,cy-H*1.08,cx+L*.12,cy-H*.92);x.lineTo(cx+L*.24,cy-H*.66);x.closePath();x.fill();
    for(const wx of[cx-L*.3,cx+L*.31]){x.fillStyle='#15161a';x.beginPath();x.arc(wx,cy,H*.33,0,Math.PI*2);x.fill();x.fillStyle=wheel||'#c8ccd2';x.beginPath();x.arc(wx,cy,H*.18,0,Math.PI*2);x.fill()}}
   function paintTV(x,W,H){const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0f2f5c');g.addColorStop(.6,'#1d5aa8');g.addColorStop(1,'#ff7a1a');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(255,255,255,.12)';x.lineWidth=2;for(let k=0;k<W;k+=48){x.beginPath();x.moveTo(k,0);x.lineTo(k,H);x.stroke()}for(let k=0;k<H;k+=48){x.beginPath();x.moveTo(0,k);x.lineTo(W,k);x.stroke()}
    x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=5;for(let k=0;k<5;k++){x.beginPath();x.moveTo(60+k*14,300+k*26);x.lineTo(220+k*10,300+k*26);x.stroke()}
    carSide(x,W*.66,H*.68,520,'#e8392b');
    x.strokeStyle='#ffd34d';x.lineWidth=12;x.lineCap='round';x.beginPath();x.moveTo(W*.36,H*.2);x.quadraticCurveTo(W*.44,H*.44,W*.52,H*.62);x.stroke();x.fillStyle='#ffd34d';x.beginPath();x.moveTo(W*.54,H*.68);x.lineTo(W*.48,H*.6);x.lineTo(W*.56,H*.57);x.closePath();x.fill();
    x.textAlign='left';x.lineJoin='round';const big=(t,y,sz,col)=>{font(x,sz,800);x.lineWidth=14;x.strokeStyle='#0b0e13';x.strokeText(t,40,y);x.fillStyle=col;x.fillText(t,40,y)};
    big('MYTH',92,118,'#ffffff');big('vs PHYSICS',198,96,'#ffd34d');font(x,40,800);x.lineWidth=8;x.strokeStyle='#0b0e13';x.strokeText('WHAT REALLY MAKES A CAR FAST?',40,268);x.fillStyle='#ffffff';x.fillText('WHAT REALLY MAKES A CAR FAST?',40,268);
    // player bar: progress, time, channel
    const bg=x.createLinearGradient(0,H-110,0,H);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(1,'rgba(0,0,0,.75)');x.fillStyle=bg;x.fillRect(0,H-110,W,110);
    x.fillStyle='rgba(255,255,255,.3)';x.fillRect(30,H-44,W-60,8);x.fillStyle='#ff7a1a';x.fillRect(30,H-44,(W-60)*.38,8);x.beginPath();x.arc(30+(W-60)*.38,H-40,11,0,Math.PI*2);x.fill();
    x.fillStyle='#ffffff';x.beginPath();x.moveTo(36,H-28);x.lineTo(36,H-6);x.lineTo(54,H-17);x.closePath();x.fill();font(x,26,700);x.fillText('4:51 / 12:48',72,H-16);
    x.fillStyle='#ff7a1a';x.beginPath();x.arc(52,H-82,22,0,Math.PI*2);x.fill();font(x,24,800);x.fillStyle='#1d0f02';x.textAlign='center';x.fillText('TB',52,H-81);x.textAlign='left';font(x,28,700);x.fillStyle='#ffffff';x.fillText('TorqueBlueprint · Myth vs Physics, ep. 12',86,H-80)}
   function paintCard(x,W,H,n,j,addr){x.fillStyle='#152a50';x.fillRect(0,0,W,H);x.strokeStyle='#f2c14e';x.lineWidth=8;x.strokeRect(10,10,W-20,H-20);
    x.fillStyle='#ff7a1a';x.fillRect(14,14,W-28,96);fit(x,'WELCOME HOME',W-60,58,800);x.fillStyle='#1d0f02';x.fillText('WELCOME HOME',W/2,64);
    star(x,W/2,190,62,'#f2c14e');star(x,W/2,190,30,'#152a50');
    if(!n){fit(x,'YOUR NAME HERE',W-60,64,800);x.fillStyle='#ffffff';x.fillText('YOUR NAME HERE',W/2,330);font(x,30,600);x.fillStyle='#ffd34d';x.fillText('SUBSCRIBE TO MOVE IN',W/2,390);return}
    const nm=hshort(n,20);fit(x,nm,W-56,80,800);x.fillStyle='#ffffff';x.fillText(nm,W/2,320);
    const jt=(j||'Resident').toUpperCase();fit(x,jt,W-70,38,700);x.fillStyle='#ffd34d';x.fillText(jt,W/2,388);
    x.fillStyle='#f2c14e';x.fillRect(70,428,W-140,3);font(x,28,600);fit(x,addr,W-60,28,600);x.fillStyle='#c8defa';x.fillText(addr,W/2,470);
    font(x,30,800);x.fillStyle='#ffffff';x.fillText('A MOTOROPOLIS RESIDENT',W/2,530);font(x,24,600);x.fillStyle='#9fb7d9';x.fillText('YOUR OWN COLOURS · COMING SOON',W/2,H-56)}
   function paintLap(x,W,H){x.fillStyle='#e6e9ee';x.fillRect(0,0,W,40);for(const[i,c]of['#ff5f57','#febc2e','#28c840'].entries()){x.fillStyle=c;x.beginPath();x.arc(22+i*22,20,7,0,Math.PI*2);x.fill()}
    x.fillStyle='#ffffff';x.fillRect(96,9,W-120,22);font(x,17,600);x.fillStyle='#5a6370';x.textAlign='left';x.fillText('motoropolis · the city of subscribers',106,21);x.textAlign='center';
    x.fillStyle='#0f2f5c';x.fillRect(0,40,W,H-40);x.strokeStyle='rgba(255,255,255,.08)';x.lineWidth=1;for(let k=0;k<W;k+=24){x.beginPath();x.moveTo(k,40);x.lineTo(k,H);x.stroke()}
    x.strokeStyle='#e8f3ff';x.lineWidth=6;x.lineCap='round';x.beginPath();x.moveTo(30,250);x.quadraticCurveTo(200,150,480,190);x.moveTo(140,70);x.lineTo(250,300);x.moveTo(330,60);x.quadraticCurveTo(360,180,300,300);x.stroke();
    x.strokeStyle='#5aa0d0';x.lineWidth=10;x.beginPath();x.moveTo(0,300);x.quadraticCurveTo(250,240,512,290);x.stroke();
    for(let k=0;k<26;k++){x.fillStyle=['#f2dcc3','#e6e9ee','#ffb36b','#c8defa'][k%4];x.fillRect(40+rnd()*430,70+rnd()*200,14,14)}
    font(x,52,800);x.fillStyle='#ff7a1a';x.fillText('MOTOROPOLIS',W/2,96);star(x,392,214,16,'#ffd34d');font(x,20,800);x.fillStyle='#ffd34d';x.textAlign='right';x.fillText('YOU LIVE HERE',374,216);x.textAlign='center'}
   function paintPosterA(x,W,H){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#ffcf6b');g.addColorStop(.55,'#ff7a1a');g.addColorStop(1,'#5a1e10');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.fillStyle='rgba(255,240,200,.85)';x.beginPath();x.arc(W/2,H*.42,110,0,Math.PI*2);x.fill();x.fillStyle='#2a1a14';x.fillRect(0,H*.6,W,H*.4);
    carSide(x,W/2,H*.63,330,'#1f3a6e','#f2c14e');font(x,64,800);x.fillStyle='#fff6e0';x.fillText('KESTREL',W/2,70);font(x,30,700);x.fillStyle='#2a1a14';x.fillText('GRAN TURISMO · 1972',W/2,118);
    font(x,26,700);x.fillStyle='#ffd34d';x.fillText('0-100 km/h (62 mph)',W/2,H-92);font(x,44,800);x.fillStyle='#ffffff';x.fillText('6.8 s',W/2,H-50)}
   function paintPosterB(x,W,H){x.fillStyle='#f5f3ee';x.fillRect(0,0,W,H);x.fillStyle='#2e7d4f';x.fillRect(0,H*.62,W,H*.38);x.fillStyle='#8fbcd9';x.fillRect(0,0,W,H*.62);
    x.fillStyle='#c8b48a';x.beginPath();x.moveTo(0,H*.62);x.lineTo(W*.55,H*.5);x.lineTo(W,H*.62);x.closePath();x.fill();
    x.save();x.translate(W/2,H*.5);x.rotate(-.18);carSide(x,0,0,260,'#f5f3ee','#ff7a1a');x.fillStyle='#ff7a1a';x.fillRect(-60,-48,120,10);x.restore();
    x.fillStyle='rgba(200,180,138,.7)';for(let k=0;k<14;k++){x.beginPath();x.arc(W*.25+rnd()*W*.2,H*.58+rnd()*30,6+rnd()*12,0,Math.PI*2);x.fill()}
    x.fillStyle='#c8232c';x.fillRect(0,0,W,96);font(x,52,800);x.fillStyle='#ffffff';x.fillText("RIVERSIDE RALLY '98",W/2,50);font(x,30,700);x.fillStyle='#f5f3ee';x.fillText('GRAVEL STAGE · 24 km (15 mi)',W/2,H-60)}
   function paintPosterC(x,W,H){x.fillStyle='#0b0e13';x.fillRect(0,0,W,H);const vx=W/2,vy=H*.42;x.fillStyle='#3a3d44';x.beginPath();x.moveTo(vx-6,vy);x.lineTo(vx+6,vy);x.lineTo(W+60,H);x.lineTo(-60,H);x.fill();
    x.strokeStyle='#ffd34d';x.lineWidth=3;x.beginPath();x.moveTo(vx,vy);x.lineTo(vx,H);x.stroke();for(let i=0;i<4;i++){x.fillStyle=i<3?'#ffd34d':'#5cc98a';x.beginPath();x.arc(vx,vy-150+i*30,11,0,Math.PI*2);x.fill()}
    x.fillStyle='#22252b';x.fillRect(vx-4,vy-170,8,170);font(x,62,800);x.fillStyle='#ff7a1a';x.fillText('DRAG NIGHT',W/2,64);font(x,28,700);x.fillStyle='#ffffff';x.fillText('MOTOROPOLIS DRAG STRIP',W/2,110);
    font(x,32,800);x.fillStyle='#ffd34d';x.fillText('1/4 MILE · 402 m',W/2,H-60)}
   function paintWin(x,W,H){const sk=x.createLinearGradient(0,0,0,H*.6);sk.addColorStop(0,'#7fc0ee');sk.addColorStop(1,'#e8f3ff');x.fillStyle=sk;x.fillRect(0,0,W,H);
    x.fillStyle='rgba(255,255,255,.85)';for(let k=0;k<4;k++){const cx=rnd()*W,cy=40+rnd()*90;for(let j=0;j<3;j++){x.beginPath();x.ellipse(cx+j*30-30,cy+(j%2)*6,36,14,0,0,Math.PI*2);x.fill()}}
    x.fillStyle='#7aa35a';x.fillRect(0,H*.55,W,H*.45);x.fillStyle='#3a3d44';x.fillRect(0,H*.8,W,H*.2);x.fillStyle='#f5f3ee';for(let k=0;k<W;k+=70)x.fillRect(k,H*.89,36,6);
    const BC=['#f4efe4','#f2dcc3','#dfe7d8','#e6e9ee'],RC=['#c0392b','#2f5fa8','#3d7a3a','#d9822b'];
    for(let k=0;k<3;k++){const hx=20+k*170,hy=H*.62,w=130,h=90;x.fillStyle=BC[k];x.fillRect(hx,hy-h,w,h);x.fillStyle=RC[k];x.beginPath();x.moveTo(hx-10,hy-h);x.lineTo(hx+w/2,hy-h-60);x.lineTo(hx+w+10,hy-h);x.fill();
     x.fillStyle='#4a6a8a';x.fillRect(hx+16,hy-h+22,28,26);x.fillRect(hx+w-44,hy-h+22,28,26);x.fillStyle='#7a4b2e';x.fillRect(hx+w/2-14,hy-46,28,46)}
    for(const tx of[150,330]){x.fillStyle='#5a3a22';x.fillRect(tx-6,H*.55,12,60);x.fillStyle='#3f7a34';x.beginPath();x.arc(tx,H*.5,46,0,Math.PI*2);x.fill()}
    carSide(x,W*.7,H*.88,150,'#2f6fd9')}
   function paintHome(x,W,H,n){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#a8754a');g.addColorStop(1,'#7a4b2e');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(60,35,20,.35)';x.lineWidth=2;for(let k=1;k<4;k++){x.beginPath();x.moveTo(0,k*H/4+rnd()*6);x.lineTo(W,k*H/4+rnd()*6);x.stroke()}
    const t=n?'Home of '+hshort(n,18):'Home sweet home';fit(x,t,W-150,104,400,SCRIPT);x.fillStyle='#fff6e0';x.fillText(t,W/2,H/2+6);star(x,52,H/2,26,'#f2c14e');star(x,W-52,H/2,26,'#f2c14e')}
   function paintPlaque(x,W,H,t){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fbe39a');g.addColorStop(.5,'#e8c45a');g.addColorStop(1,'#b8862a');x.fillStyle=g;x.fillRect(0,0,W,H);x.strokeStyle='#8a6420';x.lineWidth=6;x.strokeRect(8,8,W-16,H-16);
    fit(x,t,W-50,64,800);x.fillStyle='#2b1d0a';x.fillText(t,W/2,H/2+3);for(const sx of[22,W-22]){x.fillStyle='#8a6420';x.beginPath();x.arc(sx,H/2,6,0,Math.PI*2);x.fill()}}
   function paintGsign(x,W,H,n){x.fillStyle='#ff7a1a';x.fillRect(0,0,W,H);x.strokeStyle='#1d0f02';x.lineWidth=8;x.strokeRect(10,10,W-20,H-20);x.strokeStyle='#ffffff';x.lineWidth=3;x.strokeRect(20,20,W-40,H-40);
    const t=n?`${hshort(n,16).toUpperCase()}'S GARAGE`:'THE GARAGE';fit(x,t,W-120,84,800);x.fillStyle='#1d0f02';x.fillText(t,W/2,H/2+3);
    for(const sx of[52,W-52]){x.fillStyle='#1d0f02';x.beginPath();x.arc(sx,H/2,20,0,Math.PI*2);x.fill();x.fillStyle='#ff7a1a';x.beginPath();x.arc(sx,H/2,8,0,Math.PI*2);x.fill()}}
   function paintPeg(x,W,H){x.fillStyle='#c9a978';x.fillRect(0,0,W,H);x.fillStyle='rgba(60,40,20,.45)';for(let yy=14;yy<H;yy+=24)for(let xx=14;xx<W;xx+=24){x.beginPath();x.arc(xx,yy,3,0,Math.PI*2);x.fill()}
    const wr=(cx,cy,L,a)=>{x.save();x.translate(cx,cy);x.rotate(a);x.fillStyle='#b8bec6';x.fillRect(-7,-L/2,14,L);x.beginPath();x.arc(0,-L/2,16,0,Math.PI*2);x.fill();x.beginPath();x.arc(0,L/2,13,0,Math.PI*2);x.fill();x.fillStyle='#c9a978';x.fillRect(-6,-L/2-18,12,14);x.beginPath();x.arc(0,L/2,6,0,Math.PI*2);x.fill();x.restore()};
    for(let k=0;k<6;k++)wr(40+k*34,120,110+k*14,0);
    const sd2=(cx,col,L)=>{x.fillStyle=col;x.fillRect(cx-9,40,18,70);x.fillStyle='#9aa0a8';x.fillRect(cx-3,110,6,L)};sd2(300,'#c8232c',90);sd2(332,'#ffd34d',80);sd2(364,'#2f6fd9',100);sd2(396,'#2e7d4f',70);
    x.fillStyle='#5a3a22';x.fillRect(460,60,22,170);x.fillStyle='#6b6f78';x.fillRect(430,40,82,40);
    x.save();x.translate(590,140);x.fillStyle='#c8232c';x.fillRect(-10,0,20,120);x.fillRect(22,0,20,120);x.fillStyle='#9aa0a8';x.beginPath();x.moveTo(-10,0);x.lineTo(0,-80);x.lineTo(12,-80);x.lineTo(42,0);x.closePath();x.fill();x.restore();
    x.fillStyle='#ff7a1a';x.fillRect(660,50,70,180);x.fillStyle='#22252b';x.fillRect(672,62,46,60);
    for(let k=0;k<5;k++){x.fillStyle='#9aa0a8';x.beginPath();x.arc(80+k*70,340,14+k*4,0,Math.PI*2);x.fill();x.fillStyle='#c9a978';x.beginPath();x.arc(80+k*70,340,7+k*2,0,Math.PI*2);x.fill()}
    x.strokeStyle='#22252b';x.lineWidth=10;x.beginPath();x.arc(560,360,48,0,Math.PI*2);x.stroke();x.fillStyle='#ffd34d';x.fillRect(640,300,100,110)}
   function paintNotes(x,W,H){x.fillStyle='#fbfbf8';x.fillRect(0,0,W,H);x.strokeStyle='#9aa0a8';x.lineWidth=10;x.strokeRect(0,0,W,H);
    font(x,40,800);x.fillStyle='#c8232c';x.fillText('PROJECT CAR · TO DO',W/2,40);x.textAlign='left';
    const L=[[1,'Tyres: 2.3 bar / 33 psi'],[1,'Oil every 15,000 km / 9,300 mi'],[0,'Wheel nuts: 110 N·m / 81 lb·ft'],[0,'Wash & wax on Sunday']];
    L.forEach(([ok,t],i)=>{const y=100+i*56;x.strokeStyle='#1f3a6e';x.lineWidth=4;x.strokeRect(24,y-16,30,30);if(ok){x.strokeStyle='#2e8b57';x.lineWidth=6;x.beginPath();x.moveTo(28,y);x.lineTo(38,y+10);x.lineTo(58,y-20);x.stroke()}
     fit(x,t,W-90,32,700);x.fillStyle='#1f3a6e';x.fillText(t,70,y+1)});x.textAlign='center'}
   function paintStatic(){paint('tv',paintTV);paint('lap',paintLap);paint('win',paintWin);paint('peg',paintPeg);paint('notes',paintNotes);
    paint('jack',(x,W,H)=>{x.fillStyle='#ffd34d';x.fillRect(0,0,W,H);fit(x,'MAX 3,000 kg / 6,614 lb',W-20,56,800);x.fillStyle='#1d0f02';x.fillText('MAX 3,000 kg / 6,614 lb',W/2,H/2+2)});
    paint('coll',(x,W,H)=>{x.fillStyle='#22252b';x.fillRect(0,0,W,H);fit(x,'MY COLLECTION · DO NOT TOUCH',W-30,52,800);x.fillStyle='#ffd34d';x.fillText('MY COLLECTION · DO NOT TOUCH',W/2,H/2+2)});
    paint('glow',(x,W,H)=>{x.fillStyle='#fff3d6';x.fillRect(0,0,W,H)})}
   // the person's boards and posters (repainted for every home you enter)
   function paintPerson(n,a,P){const j=n?jobOf(n):null,PP={kestrel:paintPosterA,rally:paintPosterB,drag:paintPosterC},o=HPOST.indexOf(P.poster);
    paint('pA',PP[HPOST[o]]);paint('pB',PP[HPOST[(o+1)%3]]);paint('pC',PP[HPOST[(o+2)%3]]);
    paint('sotd',(x,W,H)=>paintCard(x,W,H,n,j==='Homeless'?null:j,a?homeAddr(a):'RIVERSIDE HEIGHTS'));paint('home',(x,W,H)=>paintHome(x,W,H,n));
    paint('plaque',(x,W,H)=>paintPlaque(x,W,H,!n?'RIVERSIDE HEIGHTS':a&&a.kind==='flat'?`${flatName(a)} · ${hshort(n,14).toUpperCase()}`:`THE ${hshort(n,16).toUpperCase()} RESIDENCE`));
    paint('gsign',(x,W,H)=>paintGsign(x,W,H,n));HM.tex.needsUpdate=true}
   // ---------- merged static geometry ----------
   const UB=new T.BoxGeometry(1,1,1),xf=(x,y,z,rx,ry,rz,sx,sy,sz)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,'YXZ')),new T.Vector3(sx||1,sy||sx||1,sz||sx||1));
   function mergeParts(list){let nv=0,ni=0;for(const q of list){nv+=q.g.attributes.position.count;ni+=q.g.index?q.g.index.count:q.g.attributes.position.count}
    const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),col=new Float32Array(nv*3),ind=new Uint32Array(ni),v=new T.Vector3(),nm=new T.Matrix3(),c=new T.Color();let vo=0,io=0;
    for(const q of list){const g=q.g,P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,r=q.r;nm.getNormalMatrix(q.m);c.set(q.c==null?0xffffff:q.c);
     for(let i=0;i<P.count;i++){const o=vo+i;v.fromBufferAttribute(P,i).applyMatrix4(q.m);pos[o*3]=v.x;pos[o*3+1]=v.y;pos[o*3+2]=v.z;v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[o*3]=v.x;nor[o*3+1]=v.y;nor[o*3+2]=v.z;
      let u=U?U.getX(i):0,w=U?U.getY(i):0;if(r){u=(r[0]+1+u*(r[2]-2))/AW;w=1-(r[1]+1+(1-w)*(r[3]-2))/AW}uv[o*2]=u;uv[o*2+1]=w;col[o*3]=c.r;col[o*3+1]=c.g;col[o*3+2]=c.b}
     const I=g.index,n=I?I.count:P.count,flip=q.m.determinant()<0;for(let k=0;k<n;k+=3){const a=I?I.getX(k):k,b=I?I.getX(k+1):k+1,cc=I?I.getX(k+2):k+2;ind[io++]=vo+a;if(flip){ind[io++]=vo+cc;ind[io++]=vo+b}else{ind[io++]=vo+b;ind[io++]=vo+cc}}
     vo+=P.count;if(g!==UB)g.dispose()}
    const o=new T.BufferGeometry();o.setAttribute('position',new T.BufferAttribute(pos,3));o.setAttribute('normal',new T.BufferAttribute(nor,3));o.setAttribute('uv',new T.BufferAttribute(uv,2));o.setAttribute('color',new T.BufferAttribute(col,3));
    o.setIndex(new T.BufferAttribute(ind,1));o.computeBoundingSphere();return o}
   function buildHome(){
    // a different person: drop the previous room (geometries, room materials, floor texture; the car and person models are shared)
    if(HM.S){HM.S.traverse(o=>{if(o.isLight&&o.dispose){o.dispose();return}if(!o.isMesh||o.userData.keep)return;let q=o.parent;while(q&&q!==HM.S){if(q.userData.share)return;q=q.parent}if(o.geometry!==BOX&&o.geometry!==UB)o.geometry.dispose();
     for(const m of[].concat(o.material)){if(m.map&&m.map!==HM.tex)m.map.dispose();m.dispose()}});HM.S=null}
    const n=wantName(),a=n?homeAssign().by[n]:null,P=homeParams(n||''),hh=hhash(n||'');HM.who=n;HM.n=n;HM.a=a;HM.P=P;sd=20261128+hh%100000;
    const WALLC=new T.Color(P.wall).getHex(),WALL2=new T.Color(P.wall).multiplyScalar(.94).getHex(),SOFA=new T.Color(P.sofa).getHex(),SOFA2=new T.Color(P.sofa).lerp(new T.Color(0xffffff),.12).getHex();
    const RW=52,RD=22,RH=9,XL=-RW/2+.25,XR=RW/2-.25,Zb=-RD/2+.25,PX=5; // inner faces: left wall x=-25.75, right wall x=25.75, back wall z=-10.75; the garage starts at x=5
    const R=room({w:RW,d:RD,h:RH,wall:WALLC,wall2:WALL2,floor:0xffffff,bg:0x14202e,light:0xffe2b8,deco:false});HM.S=R.S;
    for(const o of R.S.children)if(o.isPointLight&&o.position.x>8)o.color.setHex(0xe8f0ff);
    // wooden floor (planks) under the whole room; the garage gets a concrete slab on top
    {const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const PC=['#b98a5a','#a97b4e','#c4966a','#b08255'];for(let k=0;k<8;k++){x.fillStyle=PC[k%4];x.fillRect(0,k*32,256,32);x.fillStyle='rgba(60,35,20,.35)';x.fillRect(0,k*32,256,2);x.fillRect((k*97)%256,k*32,2,32)}
     for(let k=0;k<300;k++){x.fillStyle='rgba(80,50,25,.08)';x.fillRect(rnd()*256,rnd()*256,18,1)}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;t.repeat.set(RW/6,(RD+8)/6);
     const fm=R.S.children.find(o=>o.isMesh&&o.geometry.type==='PlaneGeometry').material;fm.map=t;fm.roughness=.55;fm.needsUpdate=true}
    const VM=[],GM=[],GL=[],AT=[];
    const bx=(L,w,h,d,c,x,y,z,ry,rx,rz)=>L.push({g:UB,c,m:xf(x,y+h/2,z,rx,ry,rz,w,h,d)});
    const cyl=(L,rt,rb,h,n,c,x,y,z,rx,ry,rz)=>L.push({g:new T.CylinderGeometry(rt,rb,h,n),c,m:xf(x,y,z,rx,ry,rz)});
    const geo=(L,g,c,x,y,z,rx,ry,rz,sx,sy,sz)=>L.push({g,c,m:xf(x,y,z,rx,ry,rz,sx,sy,sz)});
    const ap=(k,w,h,x,y,z,ry,rx)=>AT.push({g:new T.PlaneGeometry(w,h),r:RG[k],m:xf(x,y,z,rx,ry,0)});
    const WD=0x8a5a36,WD2=0x6e4428,CRM=new T.Color(P.kitchen).getHex(),DK=0x22252b,STL=0xc8ccd2,ORG=0xff7a1a,GRY=0xb9bec4,CON=0x9ea3a8,H2=Math.PI/2;
    // ---- walls: white skirting in the living room, grey paint and a concrete slab in the garage, the partition with a doorway ----
    bx(VM,PX-XL,.4,.12,0xffffff,(XL+PX)/2,0,Zb+.06);bx(VM,.12,.4,RD,0xffffff,XL+.06,0,0);
    bx(VM,XR-PX,RH,.1,GRY,(PX+XR)/2,0,Zb+.05);bx(VM,.1,RH,RD,GRY,XR-.05,0,0);bx(VM,XR-PX,1.2,.12,0x8e949b,(PX+XR)/2,0,Zb+.11);bx(VM,.12,1.2,RD,0x8e949b,XR-.11,0,0);
    bx(VM,XR-PX,.04,RD+8,CON,(PX+XR)/2,0,4);bx(VM,.25,.05,6.2,0xffd34d,10.2,0,-1.2);bx(VM,.25,.05,6.2,0xffd34d,21.2,0,-1.2);
    geo(VM,new T.CylinderGeometry(1,1,.02,20),0x6b6f75,15.8,.05,-.6,0,0,0,1.6,1,.9);
    const D0=-6.4,D1=-3.6,PZ=2;
    for(const[z0,z1]of[[Zb,D0],[D1,PZ]]){const zc=(z0+z1)/2,l=z1-z0;bx(VM,.2,RH,l,WALL2,PX-.1,0,zc);bx(VM,.2,RH,l,GRY,PX+.1,0,zc)}
    bx(VM,.2,RH-5.4,D1-D0,WALL2,PX-.1,5.4,(D0+D1)/2);bx(VM,.2,RH-5.4,D1-D0,GRY,PX+.1,5.4,(D0+D1)/2);
    for(const z of[D0,D1])bx(VM,.5,5.4,.18,0xffffff,PX,0,z);bx(VM,.5,.2,D1-D0+.36,0xffffff,PX,5.3,(D0+D1)/2);bx(VM,.46,RH,.3,0xffffff,PX,0,PZ);
    // ---- kitchen (back-left corner): fridge, base cabinets, hob and oven, sink, wall cabinets, hood ----
    {const kz=Zb+1;bx(VM,2.4,6.2,2,0xe9ecef,-24.5,0,kz);bx(VM,2.42,.05,2.02,0xb9bec4,-24.5,4,kz);bx(GM,.12,1.4,.12,STL,-23.6,4.5,kz+1.05);bx(GM,.12,1.6,.12,STL,-23.6,2,kz+1.05);
     for(const[c,x,y]of[[0xff7a1a,-24.9,5],[0x2f6fd9,-24.2,5.4],[0x5cc98a,-25,3.2],[0xffd34d,-24.3,2.7]])bx(VM,.35,.35,.06,c,x,y,kz+1.02);
     bx(VM,7.6,2.3,1.9,CRM,-19.5,0,Zb+.95);bx(VM,7.8,.18,2.1,0x3a3d44,-19.5,2.3,Zb+1.05);bx(VM,7.6,.25,1.7,0x6b5a48,-19.5,0,Zb+.85);
     for(let k=0;k<5;k++){const x=-23+k*1.52;bx(VM,.05,1.9,.03,0xd8d0c0,x,.3,Zb+1.92);if(k<4&&k!==1)bx(GM,.6,.08,.08,STL,x+.76,1.95,Zb+1.95)}
     bx(VM,1.5,1.3,.05,0x15161a,-20.97,.45,Zb+1.93);bx(GM,1.2,.08,.1,STL,-20.97,1.85,Zb+1.97);
     for(const[dx,dz]of[[-.45,-.35],[.45,-.35],[-.45,.35],[.45,.35]])cyl(VM,.28,.28,.03,16,0x15161a,-20.97+dx,2.5,Zb+1.05+dz);
     bx(GM,1.7,.08,1.2,STL,-17.6,2.46,Zb+1);cyl(GM,.06,.06,.9,8,STL,-17.6,2.95,Zb+.5);bx(GM,.08,.08,.5,STL,-17.6,3.36,Zb+.72);
     bx(VM,2.4,.6,1.5,0xd8dde3,-20.97,5.5,Zb+.75);bx(VM,1,2.9,.8,0xd8dde3,-20.97,6.1,Zb+.4);
     for(const x0 of[-23.6+1.1,-18.5])bx(VM,x0===-18.5?3.4:1.9,2.2,1.1,CRM,x0,5.2,Zb+.55);for(const x of[-17.6,-19.3])bx(GM,.08,.5,.08,STL,x+.3,5.5,Zb+1.12);
     cyl(VM,.28,.32,.62,14,0xd93a2f,-23,2.79,Zb+1.1);bx(VM,1.3,.08,.9,0xc79a62,-19,2.48,Zb+1.3,.2);
     cyl(VM,.55,.35,.3,16,0xf4f4f0,-16.5,2.63,Zb+1.3);for(const[c,dx]of[[0xff8a1a,-.15],[0x5cc98a,.18],[0xffd34d,0]])geo(VM,new T.SphereGeometry(.2,10,8),c,-16.5+dx,2.86+(dx===0?.18:0),Zb+1.3+dx*.5)}
    // ---- window with curtains (painted view of the street) ----
    {const wx=-13,wy=5.2;ap('win',4.4,3.6,wx,wy,Zb+.04,0);for(const[w,h,x,y]of[[4.9,.25,wx,wy-2.05],[4.9,.25,wx,wy+1.8],[.25,3.85,wx-2.33,wy-1.92],[.25,3.85,wx+2.33,wy-1.92],[.14,3.6,wx,wy-1.8],[4.4,.14,wx,wy-.05]])bx(VM,w,h,.22,0xffffff,x,y,Zb+.1);
     bx(VM,5.4,.18,.6,0xffffff,wx,wy-2.15,Zb+.3);for(const s of[-1,1])bx(VM,1.1,5.2,.25,new T.Color(P.curtains).getHex(),wx+s*3,2.6,Zb+.35);bx(GM,7.6,.1,.1,0x9aa0a8,wx,7.9,Zb+.35);
     cyl(VM,.4,.32,.6,12,0xc8553a,wx-1.2,3.25,Zb+.4);geo(VM,new T.IcosahedronGeometry(.42,0),0x3f8f45,wx-1.2,3.8,Zb+.4)}
    // ---- the model car collection: three wall shelves of little cars ----
    {const sx=-6.8,MC=[0xd93a2f,0x2f6fd9,0xffd34d,0xf4f4f0,0x22252b,0x2e8b57,0xff7a1a,0x7a3fb0,0x3fa7c4,0xc0c4ca,0x8a1a14,0xe8b931];let k=0;
     for(const y of[3.2,4.8,6.4]){bx(VM,5.4,.12,.9,WD,sx,y,Zb+.45);for(let i=0;i<4;i++){const cx=sx-1.95+i*1.3,c=MC[k%12],L=.95,cz=Zb+.5,yy=y+.12;k++;
      bx(VM,L,.22,.42,c,cx,yy+.08,cz);bx(VM,L*.5,.18,.36,c,cx-L*.06,yy+.3,cz);bx(VM,L*.44,.12,.37,0x1a2433,cx-L*.06,yy+.33,cz);if(k%3===0)bx(VM,.08,.12,.4,c,cx-L*.46,yy+.32,cz);if(k%4===1)bx(VM,L,.02,.08,0xffffff,cx,yy+.305,cz);
      for(const dx of[-.3,.3])for(const dz of[-.2,.2])cyl(VM,.09,.09,.06,10,0x15161a,cx+dx*L,yy+.09,cz+dz,H2,0,0)}}
     for(const y of[3.2,4.8,6.4])for(const s of[-1,1])bx(GM,.08,.4,.5,0x9aa0a8,sx+s*2.4,y-.4,Zb+.25);ap('coll',3.4,.32,sx,2.75,Zb+.04,0)}
    // ---- the desk: laptop showing Motoropolis, lamp, mug, chair; the resident's card above it ----
    {const dx=-.6,dz=Zb+1.15;bx(VM,4.8,.16,2.1,WD,dx,1.9,dz);for(const s of[-1,1])bx(VM,.14,1.9,1.9,WD2,dx+s*2.25,0,dz);bx(VM,4.4,.9,.1,WD2,dx,1,Zb+.25);
     bx(GM,1.6,.07,1.05,0x9aa0a8,dx,2.06,dz+.25);bx(GM,1.6,1,.05,0x6b6f78,dx,2.1,dz-.29,0,-.2);ap('lap',1.5,.94,dx,2.6,dz-.25,0,-.2);
     cyl(GM,.3,.36,.08,14,DK,dx+1.7,2.1,dz-.4);bx(GM,.08,1.2,.08,DK,dx+1.7,2.1,dz-.4,0,0,.25);geo(VM,new T.ConeGeometry(.32,.45,14,1,true),ORG,dx+1.45,3.25,dz-.3,0,0,.7);
     cyl(VM,.16,.14,.32,12,0xf4f4f0,dx-1.4,2.22,dz+.3);bx(VM,.9,.05,.6,0xffffff,dx-1.5,2.07,dz-.3,.25);
     const cz=dz+2.1;cyl(GM,.1,.1,1,8,DK,dx,.55,cz);for(let k=0;k<5;k++){const a=k*1.2566;bx(GM,.9,.1,.12,DK,dx+Math.cos(a)*.4,.04,cz+Math.sin(a)*.4,-a)}
     bx(VM,1.5,.25,1.4,0x2f3b4c,dx,1.05,cz);bx(VM,1.4,1.7,.25,0x2f3b4c,dx,1.3,cz+.65);
     ap('sotd',3.2,4,dx,6.1,Zb+.06,0);for(const[w,h,x,y]of[[3.6,.2,dx,4.0],[3.6,.2,dx,8.1],[.2,4.1,dx-1.7,4.0],[.2,4.1,dx+1.7,4.0]])bx(GM,w,h,.2,0xe8c45a,x,y,Zb+.12)}
    // ---- a tall plant by the partition ----
    const plant=(x,z,s)=>{cyl(VM,.55*s,.42*s,.9*s,12,0x8a5a3a,x,.45*s,z);for(let k=0;k<6;k++)geo(VM,new T.IcosahedronGeometry(.55*s,0),[0x3f8f45,0x4f9a4a,0x367a3a][k%3],x+Math.cos(k*1.05)*.35*s,(1.3+(k%3)*.45)*s,z+Math.sin(k*1.05)*.35*s,rnd(),rnd(),0,1,1.3,1)};
    plant(3.6,Zb+1,1.25);plant(-24.6,10.2,1.1);plant(3.8,9.6,.9);
    // ---- left wall: TV on a console, "Home of …" sign, two posters, the front door with the residence plaque ----
    {const tz=-2.5;bx(VM,1.6,1.1,6.6,0x3a2c22,XL+.8,0,tz);bx(VM,1.66,.08,6.66,0x2a1f18,XL+.8,1.1,tz);for(const dz of[-2.2,0,2.2])bx(VM,.04,.7,2,0x2a1f18,XL+1.62,.2,tz+dz);
     bx(VM,.2,4.1,7.2,0x0d0e11,XL+.12,2.15,tz);ap('tv',6.9,3.88,XL+.24,4.2,tz,H2);geo(VM,new T.CylinderGeometry(.18,.22,.9,12),0x15161a,XL+.6,1.6,tz-3,0,0,0);geo(VM,new T.CylinderGeometry(.18,.22,.9,12),0x15161a,XL+.6,1.6,tz+3,0,0,0);
     bx(VM,.12,1.25,4.6,0x5a3a22,XL+.08,6.7,tz);ap('home',4.4,1.1,XL+.16,7.32,tz,H2);
     for(const[k,z]of[['pA',-7.3],['pB',3.4]]){ap(k,2.4,3.4,XL+.1,4.5,z,H2);for(const[w,h,dz,y]of[[2.7,.15,0,2.65],[2.7,.15,0,6.2],[.15,3.7,-1.27,2.65],[.15,3.7,1.27,2.65]])bx(VM,.12,h,w,DK,XL+.06,y,z+dz)}
     const dz=7.9;bx(VM,.14,5.4,2.9,0xffffff,XL+.07,0,dz);bx(VM,.12,5,2.5,0x7a4b2e,XL+.12,0,dz);bx(VM,.04,.8,.8,0x9fd0ff,XL+.2,3.6,dz);for(const y of[.8,2.2])bx(VM,.04,1,1.8,0x6e4428,XL+.2,y,dz);
     geo(GM,new T.SphereGeometry(.12,10,8),0xe8c45a,XL+.3,2.5,dz-.9);ap('plaque',2,.62,XL+.14,4.4,dz-2.6,H2);bx(VM,.06,.72,2.12,0x8a6420,XL+.06,4.04,dz-2.6);
     bx(VM,1.6,.03,2.4,0x8a6a3a,XL+1.1,0,dz);bx(VM,1.5,.035,2.2,0xa8834e,XL+1.1,0,dz);
     bx(VM,.1,.14,1.8,0x5a3a22,XL+.1,5.05,10.1);for(let k=0;k<3;k++)geo(GM,new T.SphereGeometry(.09,8,6),0x9aa0a8,XL+.25,5.12,9.5+k*.6)}
    // ---- the living room: rug, sofa facing the TV, coffee table, floor lamp, the dog asleep in its basket ----
    {bx(VM,8.6,.03,7.4,0x9a3b2e,-18.6,0,-2.5);bx(VM,7.8,.035,6.6,0xd9c49a,-18.6,0,-2.5);bx(VM,7,.04,5.8,new T.Color(P.rug).getHex(),-18.6,0,-2.5);for(const z of[-4.6,-.4])bx(VM,6,.045,.25,ORG,-18.6,0,z);
     const sx=-13.4,SC=SOFA,SC2=SOFA2;bx(VM,2.4,.9,6.2,SC,sx,.25,-2.5);bx(VM,.8,2.4,6.2,SC,sx+1.2,.25,-2.5);for(const s of[-1,1])bx(VM,2.8,1.6,.6,SC,sx+.2,.25,-2.5+s*3.4);
     for(const s of[-1,1]){bx(VM,2.1,.4,2.9,SC2,sx-.2,1.15,-2.5+s*1.5);bx(VM,.5,1.5,2.8,SC2,sx+.65,1.5,-2.5+s*1.5,0,0,-.12)}geo(VM,new T.BoxGeometry(.4,1,1),ORG,sx+.2,2,-.9,0,.3,-.2);
     for(const s of[-1,1])for(const t of[-1,1])bx(VM,.2,.25,.2,0x2a1f18,sx+s*1.1,0,-2.5+t*3.4);
     const cx=-19;bx(VM,2.2,.14,3.6,WD,cx,1,-2.5);for(const s of[-1,1])for(const t of[-1,1])bx(VM,.14,1,.14,WD2,cx+s*.95,0,-2.5+t*1.65);bx(VM,2,.08,3.4,WD2,cx,.3,-2.5);
     bx(VM,.9,.05,1.2,0xc8232c,cx-.3,1.14,-3.2,.3);bx(VM,.18,.06,.5,DK,cx+.4,1.14,-1.6,-.4);cyl(VM,.16,.14,.32,12,ORG,cx+.4,1.3,-3);
     const lx=-11.6,lz=1.7;cyl(GM,.35,.4,.08,14,DK,lx,.04,lz);cyl(GM,.05,.05,4.4,8,DK,lx,2.2,lz);geo(VM,new T.CylinderGeometry(.45,.7,.8,16,1,true),0xf3e3c0,lx,4.6,lz);
     // the dog: curled up in a round basket
     const bxz=[-21.6,3.8];geo(VM,new T.TorusGeometry(.95,.32,8,20),0x8a5a3a,bxz[0],.3,bxz[1],H2,0,0);cyl(VM,.95,.95,.12,20,0xc8553a,bxz[0],.12,bxz[1]);
     const DC=0xc9924e;geo(VM,new T.SphereGeometry(.6,14,10),DC,bxz[0],.6,bxz[1],0,.4,0,1.15,.62,.85);geo(VM,new T.SphereGeometry(.32,12,8),DC,bxz[0]+.55,.62,bxz[1]+.35,0,0,0,1,.85,1.1);
     geo(VM,new T.SphereGeometry(.15,8,6),0x3a2416,bxz[0]+.86,.6,bxz[1]+.45);for(const s of[-1,1])geo(VM,new T.SphereGeometry(.14,8,6),0x8a5a2a,bxz[0]+.5+s*.12,.84,bxz[1]+.38-s*.18,0,0,s*.6,.6,1.3,.5);
     geo(VM,new T.CylinderGeometry(.08,.05,.8,6),DC,bxz[0]-.2,.62,bxz[1]+.62,H2,0,1.2)}
    // ---- the garage: roller door (right wall), workbench and pegboard, tool chest, tyre rack, project notes, jack and stands ----
    {const dz=-1.2;for(let k=0;k<15;k++)bx(VM,.12,.4,7.6,k%2?0xd6d9dd:0xc4c8cd,XR-.12,k*.4,dz);for(let k=0;k<5;k++)bx(VM,.06,.3,1.1,0x2a3a4c,XR-.2,4.05,dz-3+k*1.5);
     for(const s of[-1,1])bx(VM,.3,6.3,.3,0x6b6f78,XR-.15,0,dz+s*3.95);bx(VM,.4,.6,8.2,0x6b6f78,XR-.2,6,dz);bx(GM,.1,.1,.6,0x22252b,XR-.25,1,dz)}
    {const wx=11.2,wz=Zb+1;bx(VM,6,.22,2,0x9a6a3c,wx,2.2,wz);for(const s of[-1,1])for(const t of[-1,1])bx(GM,.15,2.2,.15,0x4a4f57,wx+s*2.8,0,wz+t*.8);bx(VM,5.8,.12,1.8,0x6b6f78,wx,.5,wz);
     bx(GM,.5,.4,.6,0x2f6fd9,wx+2.4,2.42,wz+.4);bx(GM,.2,.2,.7,0x2f6fd9,wx+2.4,2.82,wz+.4);
     for(const[c,x]of[[0xd93a2f,-2.3],[0x2e7d4f,-1.9],[0x1f3a6e,-1.5]])cyl(VM,.16,.16,.7,12,c,wx+x,2.77,wz-.4);bx(VM,1.4,.6,.9,0xc8232c,wx-.2,2.42,wz-.2);bx(GM,.6,.08,.08,STL,wx-.2,3.06,wz-.2);
     for(const[c,x]of[[0x3a3d44,-1.6],[0x5a3a22,0],[0x3a3d44,1.6]])bx(VM,1.2,.7,1.2,c,wx+x,.62,wz+.1);
     ap('peg',6,3.5,wx,4.85,Zb+.17,0);bx(VM,6.3,3.8,.06,0x8a6a44,wx,3.0,Zb+.13);ap('gsign',5,.94,wx,7.45,Zb+.14,0);
     const tx=16.9;bx(VM,2.6,3,1.6,0xc8232c,tx,.3,Zb+.9);for(let k=0;k<6;k++){bx(VM,2.5,.04,.02,0x8a1a14,tx,.6+k*.45,Zb+1.71);bx(GM,1.4,.07,.08,STL,tx,.85+k*.45,Zb+1.74)}bx(VM,2.4,1.3,1.4,0xc8232c,tx,3.3,Zb+.8);bx(VM,2.45,.06,1.45,0x8a1a14,tx,4.1,Zb+.8);
     for(const s of[-1,1])for(const t of[-1,1])cyl(VM,.14,.14,.12,10,DK,tx+s*1.1,.15,Zb+.9+t*.6,0,0,H2);bx(GM,.1,.1,1.2,STL,tx+1.35,2.2,Zb+.9,0,H2,0);
     // tyre rack: two shelves, four wheels standing up
     const rx=22.6;for(const s of[-1,1])bx(GM,.12,5.6,1.5,0x2f3b4c,rx+s*3,0,Zb+.8);for(const y of[.3,3])bx(GM,6.1,.12,1.5,0x2f3b4c,rx,y,Zb+.8);
     for(const y of[.42,3.12])for(const s of[-1,1]){const tx2=rx+s*1.35,ty=y+1.12;geo(VM,new T.TorusGeometry(.82,.32,10,24),0x15161a,tx2,ty,Zb+.85);cyl(GM,.62,.62,.32,16,0xc0c4ca,tx2,ty,Zb+.85,H2,0,0);cyl(GM,.15,.15,.36,8,0x6b6f78,tx2,ty,Zb+.85,H2,0,0)}
     ap('notes',4.2,2.62,rx,7.2,Zb+.14,0);bx(VM,4.4,2.82,.04,0x9aa0a8,rx,5.79,Zb+.11);
     // floor jack, two axle stands, a creeper, an oil drip tray
     const jx=11.4,jz=2.5;bx(VM,2.2,.35,.9,0xd93a2f,jx,.12,jz);bx(VM,.8,.3,.6,0xd93a2f,jx-.7,.47,jz);cyl(GM,.2,.2,.12,12,STL,jx+.9,.62,jz);geo(GM,new T.CylinderGeometry(.05,.05,2.4,6),0x6b6f78,jx-1.9,.9,jz,0,0,1.15);
     for(const s of[-1,1])for(const t of[-1,1])cyl(VM,.12,.12,.1,10,DK,jx+s*.8,.12,jz+t*.38,H2,0,0);ap('jack',.9,.22,jx+.3,.3,jz+.46,0);
     for(const sx2 of[13,19]){const z2=2.3;for(let k=0;k<3;k++){const a=k*2.094;geo(GM,new T.CylinderGeometry(.04,.04,1.3,5),0xffd34d,sx2+Math.cos(a)*.3,.55,z2+Math.sin(a)*.3,Math.sin(a)*.4,0,-Math.cos(a)*.4)}cyl(GM,.08,.08,.7,8,0xffd34d,sx2,1.2,z2)}
     bx(VM,1.1,.12,2.6,0x2a3a4c,8,.12,4.6);for(const s of[-1,1])for(const t of[-1,1])cyl(VM,.07,.07,.06,8,DK,8+s*.4,.06,4.6+t*1.1);
     bx(VM,1.6,.08,1,0x2a2c30,15.8,.04,-.6);
     ap('pC',2.4,3.4,PX+.25,4.5,-8.6,H2)}
    // ---- build the meshes ----
    if(!HM.tex){const cv=document.createElement('canvas');cv.width=cv.height=AW;HM.cx=cv.getContext('2d');HM.tex=new T.CanvasTexture(cv);HM.tex.colorSpace=T.SRGBColorSpace;HM.tex.anisotropy=8}const tex=HM.tex;paintStatic();paintPerson(n,a,P);
    const add=(L,m,cast)=>{if(!L.length)return;const o=new T.Mesh(mergeParts(L),m);o.castShadow=cast;o.receiveShadow=true;R.add(o);return o};
    add(VM,new T.MeshStandardMaterial({vertexColors:true,roughness:.75,metalness:0}),true);
    add(GM,new T.MeshStandardMaterial({vertexColors:true,color:0xffffff,roughness:.35,metalness:.5}),true);
    add(AT,new T.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.45,roughness:.8}),false);
    const gl=add(GL,new T.MeshStandardMaterial({color:0xcfe8ff,transparent:true,opacity:.16,roughness:.05,metalness:.1,depthWrite:false}),false);if(gl)gl.renderOrder=2;
    // the resident's car (the city's own car models, same as the traffic), picked for the resident; faces the roller door
    const cm=P.model,car=carMesh({kind:'car',len:cm?cm.len:32,wid:cm?cm.wid:15,color:P.car,m:cm||{}});car.scale.setScalar(2);car.position.set(15.5,0,-1.1);car.rotation.y=H2;car.userData.share=1;R.add(car);HM.car=car;HM.cm=cm;
    // the resident (civilian clothes at home) and a walk round the house
    HM.p=mkP(HM.S,null,(hh>>>8)%40,'civ');HM.p.userData.share=1;HM.wt=0;putP(HM.p,{x:-16.3,z:-2.5,ang:-H2},false);
    const S1=[-16.3,-2.5],K2=[-20,-7.6],S3=[1.3,-7.3],S4=[11.2,-8],S5=[20.6,-1.2],DL=[3,-5],DR=[7.2,-5];
    HM.legs=[{p:[S1,[-16.3,-6.9],K2],w:6,a:Math.PI},{p:[K2,[-10,-6.4],S3],w:7,a:-2.4},{p:[S3,DL,DR,S4],w:6,a:Math.PI},{p:[S4,[13,-4.4],[20.6,-4.4],S5],w:8,a:-H2},
     {p:[S5,[20.6,3.2],[9,3.4],DR,DL,[-9,3.2],[-16.3,3.2],S1],w:9,a:-H2}];
    for(const L of HM.legs){let d=0;for(let i=1;i<L.p.length;i++)d+=Math.hypot(L.p[i][0]-L.p[i-1][0],L.p[i][1]-L.p[i-1][1]);L.t=d/3.2}HM.cyc=HM.legs.reduce((s,L)=>s+L.t+L.w,0);
    HM.built=true}
   // the wave: the right upper arm raised sideways (about the model's forward axis), the forearm swinging
   const WQ2=new T.Quaternion(),WQ3=new T.Quaternion(),WV=new T.Vector3();
   function homeWave(m,k,t){const r=m.userData.rig;if(!r||!r.UpperArmR||!r.LowerArmR)return;const ua=r.UpperArmR,la=r.LowerArmR;
    if(!ua.az){for(const q of[ua,la]){q.b.quaternion.copy(q.q0)}m.updateMatrixWorld(true);m.getWorldQuaternion(WQ2).invert();for(const q of[ua,la]){q.b.getWorldQuaternion(WQ3);WQ3.premultiply(WQ2).invert();q.az=new T.Vector3(0,0,1).applyQuaternion(WQ3).normalize()}}
    ua.b.quaternion.copy(ua.q0).multiply(WQ2.setFromAxisAngle(ua.az,-2.5*k));la.b.quaternion.copy(la.q0).multiply(WQ3.setFromAxisAngle(la.az,(-.35+.45*Math.sin(t*9))*k))}
   function syncHome(dt){dt=dt||0;HM.clk+=dt;const m=HM.p;if(!m)return;const e=HM.clk-HM.t0,win=(u,a,b)=>u>a&&u<b?Math.min(1,(u-a)/.35,(b-u)/.35):0,greet=win(e,.05,3.9);HM.greet=greet;
    if(e>=0&&e<3.9){m.position.y=0;const ty=Math.atan2(camera.position.x-m.position.x,camera.position.z-m.position.z);let d=ty-m.rotation.y;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;m.rotation.y+=d*Math.min(1,dt*8);walkPose(m,0,false);homeWave(m,greet,HM.clk);return}
    HM.wt+=dt;let u=HM.wt%HM.cyc;for(const L of HM.legs){if(u<L.t){putP(m,pathPos(L.p,u/L.t),true);return}u-=L.t;if(u<L.w){const end=L.p[L.p.length-1];putP(m,{x:end[0],z:end[1],ang:L.a},false);homeWave(m,0,0);return}u-=L.w}}
   function labelsHome(){const m=HM.p,n=HM.n;if(m){const j=n?jobOf(n):null,sz=clamp(1000/cam.dist,13,22);
     if(n)tag(m.position.x,4.2,m.position.z,`★ ${hshort(n,22)} · ${(j&&j!=='Homeless'?j:'Resident').toUpperCase()}`,'rgba(46,139,87,.95)','#fff');
     if(HM.greet>.2){const p=toHud(m.position.x,4.2,m.position.z);if(p){hctx.globalAlpha=Math.min(1,HM.greet*1.5);pill('HI! WELCOME TO MY PLACE!',p.x,p.y-sz*2.4,sz,'#ffffff','#1f3a6e','#1f3a6e');hctx.globalAlpha=1}}}
    if(HM.car&&HM.cm)tag(HM.car.position.x,4.2,HM.car.position.z,HM.cm.n.toUpperCase(),'rgba(16,19,24,.85)','#ffb36b');
    const a=HM.a;if(MS.w_res)lockedNote('w_res');header(!n?'INSIDE RIVERSIDE HEIGHTS':a&&a.kind==='flat'?`INSIDE ${blockName(a)} · ${flatName(a)} · ${hshort(n,18).toUpperCase()}`:`INSIDE RIVERSIDE HEIGHTS · HOME OF ${hshort(n,18).toUpperCase()}`)}
   if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)||document.documentElement.dataset.rec==='1')window.__HOME={by:()=>homeAssign().by,want:n=>{HM.want=n},who:()=>HM.who,params:n=>homeParams(n),p:()=>HM.p&&{x:HM.p.position.x,z:HM.p.position.z},
    pt:n=>{const a=homeAssign().by[n];if(!a)return null;if(a.kind==='flat')return flatPt(a);const[x,z]=S2[a.k];houseM4(a.k);return{x,y:HY[a.k]+6.2,z}},hit:(x,y)=>{const r=new T.Raycaster();r.setFromCamera(new T.Vector2(x,y),camera);return W3.homeHit(r.ray)?HM.want:null}};
   INTS.home={get scene(){return HM.S},build:buildHome,isBuilt:()=>HM.built&&HM.who===wantName(),sync:syncHome,labels:labelsHome,get home(){return HM.home},onEnter(){HM.t0=HM.clk}};
  }
