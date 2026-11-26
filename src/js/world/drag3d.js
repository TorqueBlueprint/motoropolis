//@ world/drag3d.js - Phase 2C step 1: the Drag Strip in 3D (layout feature `dragway` [x0, z, x1]). Locked until the Race Track
//@ milestone (1,000 subscribers): a blueprint footprint with the "OPENS AT 1,000 SUBS / N MORE SUBSCRIBERS TO OPEN" board.
//@ Open (or ?drag=1): start line with a christmas tree, burnout box, lane markings, grandstand, timing board at the finish,
//@ and a loop through the day's heats from sim/drag.js (synced to the UTC clock, so everyone sees the same heat).
//@ The quarter mile (402 m) is drawn at half scale (the strip is 300 m long); times and speeds are the real ones.
//@ inside the if(WORLD){ block of world/world3d.js (after city2_landmarks). window.__DRAG: recorder / test hooks.
  if(CITY2){const[x0,zc,x1]=F.dragway,S=.5,XS=x0+22,XF=XS+DRAG.QM*S,XE=x1-6,XB=XS-10,LZ=[zc-3.3,zc+3.3],ZR=zc+12,CYC=36;
   W3.c2.clearRect(x0-10,zc-40,x1+10,zc+30);
   const lab={t:'DRAG STRIP',x:(x0+x1)/2,z:zc,y:16,type:'pista'};W3.labels.push(lab);
   const D3={g:null,sig:'',open:false,clock:null,heat:-1,day:null,dayKey:'',cars:[null,null],board:null,tree:null,treeSig:'',boardSig:'',last:null,lanes:[null,null],puffs:[],tag:null};
   // the ground under the strip is not perfectly flat: lift the whole strip just above its highest point
   const YG=(()=>{let y=0;for(let x=x0-12;x<=x1+12;x+=6)for(let dz=-32;dz<=26;dz+=4)y=Math.max(y,gh(x,zc+dz));return y+.04})();
   const own=new Set();const ownTex=t=>{own.add(t);return t};
   function dispose(g){root.remove(g);g.traverse(o=>{if(o.userData.keepGeo)return;if(o.geometry&&o.geometry!==BOX&&!SH.has(o.geometry)&&!o.userData.carPart)o.geometry.dispose();const m=o.material;if(m&&!Array.isArray(m)){const i=signMats.indexOf(m);if(i>=0){signMats.splice(i,1);if(m.map)m.map.dispose();m.dispose()}else if(m.map&&own.has(m.map)){own.delete(m.map);m.map.dispose();m.dispose()}}})}
   const cvTex=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const t=ownTex(new T.CanvasTexture(c));t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return{c,x:c.getContext('2d'),t}};
   // ---------- locked: blueprint footprint + board ----------
   function buildLocked(){const g=new T.Group();g.position.y=YG;g.userData.mergeRoot=1;g.userData.warped=1;const cx=(x0+x1)/2,cz=zc-6,w=x1-x0+16,d=40;
    const pg=new T.PlaneGeometry(w,d),uv=pg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/24,uv.getY(i)*d/24);const p=new T.Mesh(pg,bpMat);p.rotation.x=-Math.PI/2;p.position.set(cx,.06,cz);p.receiveShadow=true;g.add(p);
    for(const s of[-1,1]){B0(g,w,.08,.4,bpLine,cx,.06,cz+s*(d/2-.2),false);B0(g,.4,.08,d,bpLine,cx+s*(w/2-.2),.06,cz,false)}
    // ghost of the strip: lane lines, start and finish
    for(const z of[zc-7,zc,zc+7])B0(g,x1-x0,.09,.25,bpLine,cx,.06,z,false);for(const x of[XS,XF])B0(g,.5,.09,14,bpLine,x,.06,zc,false);
    const m=MS.pista,left=Math.max(0,m.n-(subs||0)),nx=m===nextMilestone();
    const sw=30,shh=9;g.add(panel([[(nx?'NEXT · ':'')+'DRAG STRIP · OPENS AT '+m.n.toLocaleString('en-US')+' SUBS',84,'#ffffff'],[`${left.toLocaleString('en-US')} MORE SUBSCRIBER${left===1?'':'S'} TO OPEN`,70,nx?'#ffd34d':'#ffb36b']],nx?'#b4500f':'#0f2f5c',sw,shh,cx,shh/2+3.4,zc-14,0));
    for(const s of[-1,1])B0(g,.45,3.6,.45,mat.dark,cx+s*sw*.4,0,zc-14);
    return g}
   // ---------- open: the strip ----------
   function bulbs(){const{c,x,t}=D3.tree;const L=D3.lanes;x.fillStyle='#15181d';x.fillRect(0,0,256,640);x.fillStyle='#2a2f37';x.fillRect(124,0,8,640);
    const ph=D3.ph||[];const B=(cx,cy,r,on,col,off)=>{x.beginPath();x.arc(cx,cy,r,0,7);x.fillStyle=on?col:off;x.fill();if(on){x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.arc(cx-r*.3,cy-r*.3,r*.35,0,7);x.fill()}};
    for(let k=0;k<2;k++){const cx=k?184:72,s=ph[k]||{};B(cx-18,44,13,s.p,'#fff7d6','#3b3a33');B(cx+18,44,13,s.p,'#fff7d6','#3b3a33');B(cx-18,96,13,s.s,'#fff7d6','#3b3a33');B(cx+18,96,13,s.s,'#fff7d6','#3b3a33');
     for(let a=0;a<3;a++)B(cx,180+a*92,36,s.a,'#ffb000','#4a3a12');B(cx,470,36,s.g,'#38e07b','#123a22');B(cx,566,36,s.r,'#ff3b30','#4a1512')}
    t.needsUpdate=true}
   const ftxt=(x,txt,px,max,weight,font)=>{let f=px;x.font=`${weight||800} ${f}px ${font||"'Barlow Condensed','Arial Narrow',sans-serif"}`;while(x.measureText(txt).width>max&&f>12){f-=2;x.font=`${weight||800} ${f}px ${font||"'Barlow Condensed','Arial Narrow',sans-serif"}`}};
   const hidden=n=>window.__HIDE&&n&&window.__HIDE.some(h=>String(n).includes(h));
   const who=e=>e.name&&!hidden(e.name)?e.name:e.plate;
   function drawBoard(){const{c,x,t}=D3.board,W=1024,H=512,F2=DRAG.fmt,r=D3.last;x.fillStyle='#0b0e13';x.fillRect(0,0,W,H);x.strokeStyle='#ff7a1a';x.lineWidth=8;x.strokeRect(6,6,W-12,H-12);
    x.fillStyle='#ff7a1a';x.fillRect(6,6,W-12,64);x.fillStyle='#1d0f02';x.textBaseline='middle';x.textAlign='left';ftxt(x,'MOTOROPOLIS DRAG STRIP · '+(r?r.h.label.toUpperCase():'TODAY'),40,600);x.fillText('MOTOROPOLIS DRAG STRIP · '+(r?r.h.label.toUpperCase():'TODAY'),26,40);
    x.textAlign='right';ftxt(x,'1/4 MILE · 402 M',40,330);x.fillText('1/4 MILE · 402 M',W-26,40);
    x.fillStyle='#2a2f37';x.fillRect(W/2-3,80,6,H-96);
    for(let k=0;k<2;k++){const ox=k?W/2+22:28,cw=W/2-50,l=r&&r.h.lanes[k],done=r&&r.done[k];x.textAlign='left';
     x.fillStyle='#9aa3ae';x.font="700 26px 'Barlow Condensed',sans-serif";x.fillText(k?'RIGHT LANE':'LEFT LANE',ox,104);
     if(!l){x.fillStyle='#5a6270';x.font="800 44px 'Barlow Condensed',sans-serif";x.fillText(r?'BYE RUN':'',ox,200);continue}
     x.fillStyle='#ffffff';ftxt(x,who(l.e),44,cw);x.fillText(who(l.e),ox,146);x.fillStyle='#9aa3ae';ftxt(x,l.e.model,26,cw,600);x.fillText(l.e.model,ox,184);
     x.fillStyle=done?(l.red?'#ff5a4f':'#ffd34d'):'#3a4050';x.font="800 132px 'JetBrains Mono',monospace";x.fillText(done?l.et.toFixed(3):'--.---',ox-6,276);
     x.font="800 40px 'Barlow Condensed',sans-serif";x.fillStyle=done?'#ffd34d':'#3a4050';x.fillText('s',ox+404,296);
     x.fillStyle=done?'#ffffff':'#3a4050';ftxt(x,done?F2.spd(l.vt):'--- mph · --- km/h',46,cw);x.fillText(done?F2.spd(l.vt):'--- mph · --- km/h',ox,364);
     x.fillStyle='#9aa3ae';x.font="600 28px 'Barlow Condensed',sans-serif";x.fillText(`RT ${done||r.started[k]?l.rt.toFixed(3):'-.---'} s · DIAL ${l.dial.toFixed(2)} s`,ox,412);
     const fin=r.done[0]||!r.h.lanes[0],fin2=r.done[1]||!r.h.lanes[1];
     if(l.red&&(done||r.started[k])){x.fillStyle='#ff3b30';x.fillRect(ox,438,cw,52);x.fillStyle='#fff';x.font="800 40px 'Barlow Condensed',sans-serif";x.fillText('RED LIGHT',ox+16,465)}
     else if(fin&&fin2&&r.h.win===k){x.fillStyle='#38e07b';x.fillRect(ox,438,cw,52);x.fillStyle='#062a14';x.font="800 40px 'Barlow Condensed',sans-serif";x.fillText('WIN ▲',ox+16,465)}
     else if(done&&l.et<l.dial){x.fillStyle='#e8b931';x.fillRect(ox,438,cw,52);x.fillStyle='#1d0f02';x.font="800 40px 'Barlow Condensed',sans-serif";x.fillText('BREAKOUT',ox+16,465)}}
    t.needsUpdate=true}
   function buildOpen(){const g=new T.Group();g.position.y=YG;g.userData.mergeRoot=1;g.userData.warped=1;const L=x1-x0,cx=(x0+x1)/2;
    const conc=M(0xa9acb0,{roughness:.9}),burn=M(0x24272c,{roughness:.35,metalness:.15}),yel=M(0xe8b931),wall=M(0xd9d6cf,{roughness:.85});
    // strip: asphalt, a concrete launch pad, the burnout box, lane lines
    const strip=new T.Mesh(new T.PlaneGeometry(L,16),M(0x2b2e34,{roughness:.9}));strip.rotation.x=-Math.PI/2;strip.position.set(cx,.04,zc);strip.receiveShadow=true;g.add(strip);
    B0(g,XS+50-x0,.02,15,conc,(x0+XS+50)/2,.04,zc,false);for(const z of LZ)B0(g,XS-3-(x0+3),.025,5.6,burn,(x0+3+XS-3)/2,.05,z,false);
    B0(g,L,.03,.3,mt.white,cx,.07,zc,false);for(const s of[-1,1])B0(g,L,.03,.25,yel,cx,.07,zc+s*7,false);
    B0(g,.6,.03,14,mt.white,XS,.07,zc,false);for(let k=0;k<14;k++)B0(g,1,.031,1,k%2?mt.white:mat.dark,XF-.5+(k%2)*0,.07,zc-6.5+k,false);for(let k=0;k<14;k++)B0(g,1,.031,1,k%2?mat.dark:mt.white,XF+.5,.07,zc-6.5+k,false);
    for(const s of[-1,1])B0(g,XE-2-x0,1,.5,wall,(x0+XE-2)/2,0,zc+s*8.2);
    // return road (south of the wall) and the exit at the far end
    const rr2=new T.Mesh(new T.PlaneGeometry(XE+6-x0,6),mat.asphalt);rr2.rotation.x=-Math.PI/2;rr2.position.set((x0+XE+6)/2,.035,ZR);rr2.receiveShadow=true;g.add(rr2);
    B0(g,10,.02,ZR-zc+3,mat.asphalt,XE+1,.035,(zc+ZR)/2,false);
    // distance markers (both units)
    for(const[d,txt]of[[18.288,'60 FT · 18 M'],[100.584,'330 FT · 101 M'],[201.168,'1/8 MILE · 201 M'],[304.8,'1000 FT · 305 M'],[402.336,'1/4 MILE · 402 M']]){const x=XS+d*S;g.add(sign(txt,6,1,'#22252b','#ffd34d',x,2.2,zc-9.4,0));B0(g,.2,1.7,.2,mat.dark,x,0,zc-9.4)}
    // christmas tree (staging lights) between the lanes, just past the start line; faces the drivers (and the cameras behind)
    {const tr=new T.Group();tr.position.set(XS+5,0,zc);B0(tr,.3,3,.3,mat.dark,0,0,0);B0(tr,.5,2.9,1.1,mat.dark,0,3,0);D3.tree=cvTex(256,640);
     const tm=new T.MeshBasicMaterial({map:D3.tree.t});const pl=new T.PlaneGeometry(.95,2.38);for(const s of[-1,1]){const m=new T.Mesh(pl,tm);m.position.set(s*.26,4.45,0);m.rotation.y=s*Math.PI/2;if(s>0)m.scale.x=-1;tr.add(m)}
     tr.userData.nm=1;g.add(tr);bulbs()}
    // timing board at the finish, south side, facing the grandstand
    {const bd=new T.Group();bd.position.set(XF-12,0,zc+22);D3.board=cvTex(1024,512);const bm=new T.MeshBasicMaterial({map:D3.board.t});
     B0(bd,20.6,10.6,.5,mat.dark,0,4.7,0);for(const s of[-1,1])B0(bd,.6,5,.6,mat.dark,s*7,0,0);const m=new T.Mesh(new T.PlaneGeometry(20,10),bm);m.position.set(0,10,-.27);m.rotation.y=Math.PI;bd.add(m);
     const m2=new T.Mesh(new T.PlaneGeometry(20,10),bm);m2.position.set(0,10,.27);bd.add(m2);bd.userData.nm=1;g.add(bd);drawBoard()}
    // grandstand along the north side, with a crowd, a roof and the strip's name
    {const gx=XS+60,gl=120,r2=DRAG.rng(77),P=[],PC=[];for(let s=0;s<5;s++){B0(g,gl,1,2,s%2?M(0xd93a2f):M(0x2f6fd9),gx,s,zc-13-s*2);
      for(let q=0;q<70;q++)if(r2()<.6)P.push({x:gx-gl/2+1+q*(gl-2)/70+r2()*.6,y:s+1,z:zc-13.2-s*2+r2()*.4,ry:0,sx:.5,sy:1.1,sz:.4})}
     for(const p of P)PC.push(['#d93a2f','#2f6fd9','#f2f2ee','#e8b931','#22252b','#2e8b57','#ff7a1a'][Math.floor(r2()*7)]);instG(g,sh(W3.bodyG||new T.BoxGeometry(1,1,1).translate(0,.5,0)),mt.bodyT,P,PC);
     B0(g,gl+4,.4,12,mat.roofD,gx,8.6,zc-18,false);for(let q=-3;q<=3;q++)B0(g,.4,8.6,.4,mat.dark,gx+q*gl/6,0,zc-23.6);
     g.add(sign('MOTOROPOLIS DRAG STRIP',30,3.4,'#ff7a1a','#1d0f02',gx,11.2,zc-12.4,0))}
    // timing tower at the start
    bld(g,8,12,8,TM[1],mat.roof,XS-4,zc-30);g.add(sign('TIMING',5,1.1,'#22252b','#ff7a1a',XS-4,10.2,zc-25.9,0));
    // light poles
    for(let q=0;q<5;q++)for(const s of[-1,1]){const x=x0+20+q*(L-40)/4,z=zc+s*(s<0?26:16.5);if(s>0&&Math.abs(x-(XF-12))<16)continue;B0(g,.3,12,.3,mat.dark,x,0,z);B0(g,2.4,.4,.8,mat.dark,x,12,z)}
    // the two race cars (rebuilt for every heat) and the burnout smoke
    const cg=new T.Group();cg.userData.nm=1;g.add(cg);D3.cg=cg;D3.cars=[null,null];
    D3.puffs=[];const smk=mt.smoke;for(let k=0;k<2;k++)for(let q=0;q<5;q++){const p=new T.Mesh(new T.SphereGeometry(1,10,8),smk);p.visible=false;p.castShadow=false;cg.add(p);D3.puffs.push({m:p,k,q})}
    return g}
   // ---------- the loop through the day's heats ----------
   const secOfDay=()=>{const n=Date.now();return(n%864e5)/1000};
   function carFor(e){const c={kind:'car',len:(MODELS.find(m=>m.glb===e.glb)||{len:32}).len,wid:16,color:e.color,m:MODELS.find(m=>m.glb===e.glb)||{}};
    const g=X&&X.cars&&X.cars[e.glb]?glbCar(c,e.glb):carMesh(c);g.traverse(o=>{o.userData.carPart=1});return g}
   function setHeat(i){const d=D3.day,h=d.heats[i];D3.heat=i;D3.h=h;
    for(let k=0;k<2;k++){if(D3.cars[k]){D3.cg.remove(D3.cars[k].g);D3.cars[k]=null}const l=h.lanes[k];if(!l)continue;const tr=DRAG.run(l.o,true);const g=new T.Group();g.add(carFor(l.e));g.rotation.y=Math.PI/2;g.position.set(x0-8,0,LZ[k]);D3.cg.add(g);
     D3.cars[k]={g,l,tr:tr.trace,tR:tr.tR,cross:false,x:x0-8,z:LZ[k],a:0}}
    const dm=Math.max(h.lanes[0]?h.lanes[0].dial:0,h.lanes[1]?h.lanes[1].dial:0);D3.ta=h.lanes.map(l=>l?9+(dm-l.dial):0);
    D3.cur={h,done:[false,false],started:[false,false]};if(!D3.last&&i>0)D3.last={h:d.heats[i-1],done:[true,true],started:[true,true]}}
   const ease=u=>u<0?0:u>1?1:u*u*(3-2*u);
   function laneAt(k,t){const C=D3.cars[k];if(!C)return null;const l=C.l,ta=D3.ta[k],tl=ta+l.rt-C.tR;let x,z=LZ[k],a=0,ph={p:false,s:false,a:false,g:false,r:false},vis=true,smoke=0;
    if(t<3){x=x0-8+(XB-(x0-8))*ease(t/3)}
    else if(t<5){x=XB;smoke=1}
    else if(t<7.4){x=XB+(XS-1.6-XB)*ease((t-5)/2.4)}
    else x=XS-1.6;
    ph.p=x>XS-4;ph.s=t>=7.4;
    if(t>=ta){ph.a=t<ta+.4||(l.red&&t<tl);if(!l.red)ph.g=t>=ta+.4}
    if(l.red&&t>=tl)ph.r=true;
    if(t>=tl){const tt=t-tl,i=tt/.05,tr=C.tr,n=tr.length-1;const xr=i<n?tr[Math.floor(i)]+(tr[Math.min(n,Math.floor(i)+1)]-tr[Math.floor(i)])*(i-Math.floor(i)):tr[n];
     const tc=l.et+C.tR;// time from moving to the finish line
     if(tt<tc){x=XS-1.6+(xr-DRAG.ROLL)*S+DRAG.ROLL*S;ph.s=ph.p=false}
     else{if(!D3.cur.done[k]){D3.cur.done[k]=true;D3.last=D3.cur;D3.boardSig=''}const vs=l.vt*S,Dst=XE-10-XF,dec=vs*vs/(2*Dst),ts=vs/dec,u=Math.min(tt-tc,ts);x=XF+vs*u-.5*dec*u*u;ph.s=ph.p=false;
      const after=tt-tc-ts;if(after>1){const w=after-1;// turn off through the exit and drive back on the return road
       if(w<2.5){const q=ease(w/2.5);x=x+6*Math.sin(q*Math.PI/2);z=LZ[k]+(ZR+(k?1.5:-1.5)-LZ[k])*(1-Math.cos(q*Math.PI/2));a=-q*Math.PI*.98}
       else{x=x+6-(w-2.5)*11;z=ZR+(k?1.5:-1.5);a=-Math.PI;if(x<x0-6)vis=false}}}
     if(!D3.cur.started[k]){D3.cur.started[k]=true;D3.boardSig=''}}
    return{x,z,a,ph,vis,smoke}}
   function tick(dt){const open=DRAG.isOpen(),m=MS.pista;const sig=open?'open':'lock|'+Math.max(0,m.n-(subs||0))+'|'+(m===nextMilestone()?1:0);
    lab.type=open?undefined:'pista';
    if(sig!==D3.sig){D3.sig=sig;if(D3.g)dispose(D3.g);D3.open=open;D3.heat=-1;D3.last=null;D3.cur=null;D3.g=open?buildOpen():buildLocked();root.add(D3.g)}
    if(!open)return;
    if(D3.clock==null)D3.clock=secOfDay();D3.clock+=dt;
    const date=DRAG.today(),dk=date+'|'+(subs||0);if(dk!==D3.dayKey){D3.dayKey=dk;D3.day=DRAG.day(date);D3.heat=-1}
    const d=D3.day,N=d.heats.length;if(!N)return;
    const sec=((D3.clock%86400)+86400)%86400,i=Math.floor(sec/CYC)%N,t=sec%CYC;if(i!==D3.heat){setHeat(i);D3.boardSig=''}
    const ph=[{},{}];
    for(let k=0;k<2;k++){const s=laneAt(k,t),C=D3.cars[k];if(!s||!C)continue;C.g.visible=s.vis;C.g.position.set(s.x,0,s.z);C.g.rotation.y=Math.PI/2+s.a;C.x=s.x;C.z=s.z;C.a=s.a;ph[k]=s.ph;
     for(const p of D3.puffs)if(p.k===k){p.m.visible=s.smoke>0;if(s.smoke){const u=((t*1.7+p.q*.2)%1);p.m.position.set(s.x-1.8-u*3,.4+u*1.1,s.z+(p.q%2?.9:-.9));p.m.scale.setScalar(.35+u*1.1)}}}
    for(const p of D3.puffs)if(!D3.cars[p.k])p.m.visible=false;
    D3.ph=ph;const ts=JSON.stringify(ph);if(ts!==D3.treeSig){D3.treeSig=ts;bulbs()}
    const bs=D3.last?D3.last.h.id+D3.last.done.join()+D3.last.started.join():'';if(bs!==D3.boardSig){D3.boardSig=bs;drawBoard()}}
   W3.dragTick=tick;
   // name tags over the cars (driver name, or the plate for a subscriber without a name), and the round over the tree
   W3.dragDraw=()=>{if(!D3.open||!D3.h||cam.dist>420)return;const sz=clamp(2400/cam.dist,12,20);
    for(let k=0;k<2;k++){const C=D3.cars[k];if(!C||!C.g.visible)continue;const s=toHud(C.x,2.5+YG,C.z);if(!s)continue;if(C.l.e.name)pill('★ '+C.l.e.name,s.x,s.y,sz,'rgba(255,122,26,.95)','#1d0f02');else pill(C.l.e.plate,s.x,s.y,sz,'rgba(250,250,250,.95)','#111')}
    if(cam.dist<260){const s=toHud(XS+5,7.2+YG,zc);if(s)pill(D3.h.label.toUpperCase()+' · NOW RACING',s.x,s.y,sz*.9,'rgba(13,38,80,.94)','#ffd34d')}};
   // recorder / test hooks: force open, jump to a heat, car positions, camera presets
   const CAMS={overview:{tx:(x0+x1)/2,tz:zc,yaw:Math.PI-.55,pitch:.5,dist:250},start:{tx:XS-2,tz:zc,yaw:-Math.PI/2+.42,pitch:.22,dist:30},tree:{tx:XS+5,tz:zc,ty:3.4,yaw:-Math.PI/2-.35,pitch:.1,dist:13},
    stands:{tx:XS+90,tz:zc,yaw:Math.PI-.25,pitch:.28,dist:60},finish:{tx:XF,tz:zc,yaw:Math.PI/2+.5,pitch:.2,dist:55},board:{tx:XF-12,tz:zc+22,ty:9,yaw:Math.PI+.15,pitch:.12,dist:30},
    burnout:{tx:XB,tz:zc,yaw:-.6,pitch:.25,dist:24}};
   window.__DRAG={force:v=>{DRAG.force(v)},open:()=>DRAG.isOpen(),
    seek:(h,t)=>{const d=DRAG.day(DRAG.today()),N=d.heats.length,i=typeof h==='number'?h:d.heats.findIndex(q=>q.id===h);if(i<0||i>=N)return false;let c=(Math.floor(secOfDay()/(CYC*N))*N+i)*CYC;if(c+CYC>86400)c=i*CYC;D3.clock=c+(t||0);D3.heat=-1;return true},
    pos:k=>{const C=D3.cars[k||0];return C?{x:C.x,z:C.z,y:YG,a:-C.a}:null},cam:n=>CAMS[n]?Object.assign({fov:50},CAMS[n]):null,cams:()=>Object.keys(CAMS),
    info:()=>D3.h?{heat:D3.h.id,label:D3.h.label,t:D3.clock%CYC,lanes:D3.h.lanes.map(l=>l&&{who:l.e.name||l.e.plate,et:l.et,dial:l.dial})}:null};
  }
