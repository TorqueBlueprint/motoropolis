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
   const YG=(()=>{let y=0;for(let x=x0-12;x<=x1+12;x+=6)for(let dz=-32;dz<=26;dz+=4)y=Math.max(y,gh(x,zc+dz));return y+.15})();
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
}
    t.needsUpdate=true}
   function buildOpen(){const g=new T.Group();g.position.y=YG;g.userData.mergeRoot=1;g.userData.warped=1;const L=x1-x0,cx=(x0+x1)/2;
    const PO={polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4},asp=M(0x2b2e34,Object.assign({roughness:.9},PO)),conc=M(0xa9acb0,Object.assign({roughness:.9},PO)),burn=M(0x24272c,Object.assign({roughness:.35,metalness:.15},PO)),yel=M(0xe8b931),wall=M(0xd9d6cf,{roughness:.85});
    // strip: asphalt, a concrete launch pad, the burnout box, lane lines
    const strip=new T.Mesh(new T.PlaneGeometry(L,16),asp);strip.rotation.x=-Math.PI/2;strip.position.set(cx,.04,zc);strip.receiveShadow=true;g.add(strip);
    B0(g,XS+50-x0,.02,15,conc,(x0+XS+50)/2,.04,zc,false);for(const z of LZ)B0(g,XS-3-(x0+3),.025,5.6,burn,(x0+3+XS-3)/2,.05,z,false);
    B0(g,L,.03,.3,mt.white,cx,.12,zc,false);for(const s of[-1,1])B0(g,L,.03,.25,yel,cx,.12,zc+s*7,false);
    B0(g,.6,.03,14,mt.white,XS,.12,zc,false);for(let k=0;k<14;k++)B0(g,1,.031,1,k%2?mt.white:mat.dark,XF-.5+(k%2)*0,.12,zc-6.5+k,false);for(let k=0;k<14;k++)B0(g,1,.031,1,k%2?mat.dark:mt.white,XF+.5,.12,zc-6.5+k,false);
    for(const s of[-1,1])B0(g,XE-2-x0,1,.5,wall,(x0+XE-2)/2,0,zc+s*8.2);
    // return road (south of the wall) and the exit at the far end
    const rr2=new T.Mesh(new T.PlaneGeometry(XE+6-x0,6),asp);rr2.rotation.x=-Math.PI/2;rr2.position.set((x0+XE+6)/2,.035,ZR);rr2.receiveShadow=true;g.add(rr2);
    B0(g,10,.02,ZR-zc+3,asp,XE+1,.035,(zc+ZR)/2,false);
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
    fxBuild(cg);
    return g}
   // ---------- effects: one instanced mesh for all the smoke, one for the exhaust flames (2 draw calls, none when idle) ----------
   // fixed pools, no allocation per frame. Tyre smoke: the burnout and wheelspin at the launch (the traction limit of the
   // pass); diesel: black smoke while the fuel is ahead of the air (launch, every shift); petrol cars of 450 hp and more pop
   // flames on every upshift; turbo petrol cars crackle on the 2-step before the green.
   const NS=140,NF=24,FX={sm:null,fl:null,p:new Float32Array(NS*3),v:new Float32Array(NS*3),age:new Float32Array(NS),life:new Float32Array(NS),s0:new Float32Array(NS),s1:new Float32Array(NS),kind:new Uint8Array(NS),
    fp:new Float32Array(NF*3),fk:new Int8Array(NF),fage:new Float32Array(NF),flife:new Float32Array(NF),flen:new Float32Array(NF),si:0,fi:0,live:0,flive:0,seed:12345,m4:new T.Matrix4(),col:new T.Color(),c0:new T.Color(0xdfe1e4),c1:new T.Color(0x18181a),c2:new T.Color(0x8d9096),c3:new T.Color(0xffffff),c4:new T.Color(0xff6a3a)};
   const frnd=()=>{FX.seed=(FX.seed*1664525+1013904223)>>>0;return FX.seed/4294967296}; // visual jitter only (not Math.random, not the races)
   // exhaust flame: a slim teardrop (narrow at the pipe, fullest a quarter of the way out, tapering to a point): a blue-ish
   // root, an orange outer flame that reddens and fades out to the tip, and a short white-yellow core at the pipe. Colours
   // carry alpha (normal blending, so it still reads as orange on the snow and the pale concrete).
   function flameGeo(){const P=[],C=[],I=[];
    // stops: [t, r, g, b, a] along the flame (t 0 at the pipe, 1 at the tip)
    function layer(len,rad,stops){const prof=[],N=10;for(let k=0;k<=N;k++){const t=k/N,r=rad*(t<.22?.42+2.6*t:Math.max(0,(1-t)/.78)**.8);prof.push(new T.Vector2(Math.max(r,k===N?0:.004),t*len))}
     const g=new T.LatheGeometry(prof,10),pos=g.attributes.position,b=P.length/3;
     for(let v=0;v<pos.count;v++){const t=Math.min(1,pos.getY(v)/len);let s=0;while(s<stops.length-2&&t>stops[s+1][0])s++;const A=stops[s],B=stops[s+1],f=Math.min(1,Math.max(0,(t-A[0])/(B[0]-A[0])));
      P.push(pos.getX(v),pos.getY(v),pos.getZ(v));for(let q=1;q<5;q++)C.push(A[q]+(B[q]-A[q])*f)}
     const ix=g.index.array;for(let k=0;k<ix.length;k++)I.push(ix[k]+b);g.dispose()}
    layer(1,.08,[[0,.4,.5,1,.5],[.1,1,.55,.1,.92],[.45,1,.34,.02,.88],[.8,.88,.14,0,.4],[1,.6,.06,0,0]]);
    layer(.36,.036,[[0,1,1,.92,1],[.5,1,.9,.5,.95],[1,1,.6,.1,0]]);
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('color',new T.Float32BufferAttribute(C,4));g.setIndex(I);g.rotateZ(Math.PI/2);return g}
   function fxBuild(cg){const sm=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),new T.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.45,roughness:1,depthWrite:false}),NS);
    const fl=new T.InstancedMesh(flameGeo(),new T.MeshBasicMaterial({color:0xffffff,vertexColors:true,transparent:true,depthWrite:false,fog:false,toneMapped:false,side:T.DoubleSide}),NF);
    FX.m4.makeScale(0,0,0);for(let i=0;i<NS;i++){sm.setMatrixAt(i,FX.m4);sm.setColorAt(i,FX.c0);FX.age[i]=FX.life[i]=0}for(let i=0;i<NF;i++){fl.setMatrixAt(i,FX.m4);fl.setColorAt(i,FX.c3);FX.fage[i]=FX.flife[i]=0}
    for(const m of[sm,fl]){m.frustumCulled=false;m.castShadow=false;m.receiveShadow=false;m.visible=false;m.userData.nm=1;cg.add(m)}FX.sm=sm;FX.fl=fl;FX.live=FX.flive=0}
   // kind: 0 tyre smoke (light grey), 1 diesel soot (black, greys as it thins), 2 exhaust haze
   function puff(x,y,z,vx,vy,vz,life,s0,s1,kind){const i=FX.si;FX.si=(i+1)%NS;const j=i*3;FX.p[j]=x;FX.p[j+1]=y;FX.p[j+2]=z;FX.v[j]=vx;FX.v[j+1]=vy;FX.v[j+2]=vz;FX.age[i]=0;FX.life[i]=life;FX.s0[i]=s0;FX.s1[i]=s1;FX.kind[i]=kind;FX.live=NS}
   // flames ride with the car: fp holds the offset from the car's tail (fk = its lane)
   function flame(C,x,y,z,life,len){const i=FX.fi;FX.fi=(i+1)%NF;const j=i*3;FX.fk[i]=D3.cars.indexOf(C);FX.fp[j]=x;FX.fp[j+1]=y;FX.fp[j+2]=z;FX.fage[i]=0;FX.flife[i]=life;FX.flen[i]=len;FX.flive=NF}
   function fxLane(C,t,dt){if(!FX.sm||!C.g.visible)return;const S2=C.st,A=C.acc,ex=C.x+C.rear,y0=.42;
    // tyre smoke: the burnout, then the launch while the tyres spin
    let rate=S2.ph===1?30:S2.ph===4&&S2.sp>.1&&S2.v<28?24*S2.sp*(1-S2.v/28):0;
    if(rate){A[0]+=rate*dt;while(A[0]>=1){A[0]--;const side=frnd()<.5?-1:1,b=S2.ph===1;puff(ex+.9+frnd()*.3,.35,C.z+side*C.half,-.6-frnd()*.8,.5+frnd()*.5,side*(.3+frnd()*.4),b?1.1+frnd()*.6:.7+frnd()*.4,.3,b?1.7+frnd()*.7:1+frnd()*.5,0)}}
    // diesel: soot while the fuel is ahead of the air
    rate=C.dsl&&(S2.ph===3||S2.ph===4)?(S2.so>.2?S2.so*30:S2.so*8):0;
    if(rate){A[1]+=rate*dt;while(A[1]>=1){A[1]--;puff(ex-.1,y0,C.z-.45,-1.2-frnd(),.9+frnd()*.6,(frnd()-.5)*.6,1+frnd()*.5,.18,.8+frnd()*.6*S2.so,1)}}
    // flames: upshifts (petrol, 450 hp and more), the 2-step crackle before the green (turbo petrol)
    const sh=C.tel.sh;if(S2.ph===4){if(C.ptt<0)C.shI=0;while(C.shI<sh.length&&sh[C.shI]<=S2.tt){if(C.pops&&S2.tt-sh[C.shI]<.3){for(const s of[-.42,.42])flame(C,0,y0,s,.16,.8+frnd()*.4);A[3]=.09}C.shI++}C.ptt=S2.tt}else C.ptt=-1;
    if(A[3]>0){A[3]-=dt;if(A[3]<=0&&C.pops)for(const s of[-.42,.42])flame(C,0,y0,s,.1,.55+frnd()*.3)}
    if(S2.ph===3&&C.two){A[2]+=dt*(5+frnd()*4);if(A[2]>=1){A[2]=0;flame(C,0,y0,frnd()<.5?-.42:.42,.07,.4+frnd()*.3);puff(ex-.1,y0,C.z,-.5,.6,0,.6,.15,.6,2)}}}
   function fxStep(dt){if(!FX.sm)return;const M4=FX.m4;
    if(FX.live){let live=0;for(let i=0;i<NS;i++){if(FX.age[i]>=FX.life[i]){continue}FX.age[i]+=dt;const j=i*3,u=FX.age[i]/FX.life[i];
      if(u>=1){M4.makeScale(0,0,0);FX.sm.setMatrixAt(i,M4);continue}live++;const dr=1-1.6*dt;FX.v[j]*=dr;FX.v[j+2]*=dr;FX.p[j]+=FX.v[j]*dt;FX.p[j+1]+=FX.v[j+1]*dt;FX.p[j+2]+=FX.v[j+2]*dt;
      const sc=(FX.s0[i]+(FX.s1[i]-FX.s0[i])*Math.sqrt(u))*(u>.75?1-(u-.75)*3.2:1);M4.makeScale(sc,sc*.8,sc).setPosition(FX.p[j],FX.p[j+1],FX.p[j+2]);FX.sm.setMatrixAt(i,M4);
      const k=FX.kind[i];if(k===1)FX.col.copy(FX.c1).lerp(FX.c2,u*.8);else FX.col.copy(k===2?FX.c2:FX.c0);FX.sm.setColorAt(i,FX.col)}
     FX.sm.instanceMatrix.needsUpdate=true;FX.sm.instanceColor.needsUpdate=true;FX.live=live;FX.sm.visible=live>0;if(!live){M4.makeScale(0,0,0);for(let i=0;i<NS;i++)FX.sm.setMatrixAt(i,M4)}}
    if(FX.flive){let live=0;for(let i=0;i<NF;i++){if(FX.fage[i]>=FX.flife[i])continue;FX.fage[i]+=dt;const u=FX.fage[i]/FX.flife[i];if(u>=1){M4.makeScale(0,0,0);FX.fl.setMatrixAt(i,M4);continue}const Cf=D3.cars[FX.fk[i]];if(!Cf||!Cf.g.visible){FX.fage[i]=FX.flife[i];M4.makeScale(0,0,0);FX.fl.setMatrixAt(i,M4);continue}live++;
      const j=i*3,L=FX.flen[i]*(u<.2?.45+2.75*u:1.25-.75*u),w=(1-.4*u)*(.88+.24*Math.sin(FX.fage[i]*90+i));M4.makeScale(L,w,w).setPosition(Cf.x+Cf.rear+FX.fp[j],FX.fp[j+1],Cf.z+FX.fp[j+2]);FX.fl.setMatrixAt(i,M4);FX.col.copy(FX.c3).lerp(FX.c4,u);FX.fl.setColorAt(i,FX.col)}
     FX.fl.instanceMatrix.needsUpdate=true;FX.fl.instanceColor.needsUpdate=true;FX.flive=live;FX.fl.visible=live>0}}
   // ---------- the loop through the day's heats ----------
   const secOfDay=()=>{const n=Date.now();return(n%864e5)/1000};
   function carFor(e){const c={kind:'car',len:(MODELS.find(m=>m.glb===e.glb)||{len:32}).len,wid:16,color:e.color,m:MODELS.find(m=>m.glb===e.glb)||{}};
    const g=X&&X.cars&&X.cars[e.glb]?glbCar(c,e.glb):carMesh(c);g.traverse(o=>{o.userData.carPart=1});return g}
   // a heat: the day's heat i, or hh (a one-off challenge race, i = -2). The pass is run again with its telemetry (same
   // inputs, same times) for the replay, the HUD and the effects.
   function setHeat(i,hh){const d=D3.day,h=hh||d.heats[i];D3.heat=hh?-2:i;D3.h=h;
    for(let k=0;k<2;k++){if(D3.cars[k]){D3.cg.remove(D3.cars[k].g);D3.cars[k]=null}const l=h.lanes[k];if(!l)continue;const tr=DRAG.run(l.o,true);const g=new T.Group(),cm=carFor(l.e),bb=new T.Box3().setFromObject(cm);g.add(cm);g.rotation.y=Math.PI/2;g.position.set(x0-8,0,LZ[k]);D3.cg.add(g);
     const sp=DRAG.SPEC[l.e.glb]||{};
     D3.cars[k]={g,l,tr:tr.trace,tR:tr.tR,tel:tr.tel,spl:[tr.t60,tr.t330,tr.t8,tr.t1000,tr.et],v8:tr.v8,vt:tr.vt,rear:bb.min.z,half:Math.max(.6,bb.max.x*.78),
      pops:sp.fuel!=='D'&&sp.hp>=450,two:sp.asp==='T'&&sp.fuel!=='D'&&sp.hp>=250,dsl:sp.fuel==='D',cross:false,x:x0-8,z:LZ[k],a:0,
      st:{ph:0,tt:-1,el:-1,x:0,v:0,r:0,g:0,th:0,sp:0,b:0,iat:0,egt:0,so:0,fin:false,vis:true},shI:0,ptt:-1,acc:[0,0,0,0]}}
    D3.ta=h.lanes.map(l=>l?9:0); // heads-up: both greens at the same moment
    D3.cur={h,done:[false,false],started:[false,false]};if(!D3.last&&i>0&&!hh)D3.last={h:d.heats[i-1],done:[true,true],started:[true,true]}}
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
    telAt(C,t,tl);
    return{x,z,a,ph,vis,smoke}}
   // ---------- telemetry state of a lane at cycle time t (the car moves at tl); read by the HUD (world/drag_hud.js) ----------
   // before the car moves: idle, the burnout, rolling into the beams, then the launch-control rev from 8.2 s (the values the
   // integrator starts from); the run: the pass's own time-series (0.05 s samples, interpolated); after the line: coasting.
   const lerp=(a,b,u)=>a+(b-a)*u;
   function telAt(C,t,tl){const S2=C.st,T2=C.tel,lc=T2.lc,id=T2.idle,tc=C.l.et+C.tR;S2.vis=C.g.visible;
    if(t<tl){S2.tt=-1;S2.el=-1;S2.x=0;S2.v=0;S2.g=0;S2.sp=0;S2.so=0;S2.fin=false;
     if(t>=3&&t<5){S2.ph=1;S2.r=.55+.03*Math.sin(t*23);S2.th=.75;S2.sp=1;S2.b=lc.b*.8;S2.iat=id.iat;S2.egt=lerp(id.egt,lc.egt,Math.min(1,(t-3)/1.2))}
     else if(t>=8.2){const u=1-Math.exp(-(t-8.2)/.35),w=1-Math.exp(-(t-8.2)/.7);S2.ph=3;S2.r=lerp(id.r,lc.r,u)*(1+.014*Math.sin(t*41)*u);S2.th=1;S2.b=lerp(0,lc.b,w);S2.iat=lerp(id.iat,lc.iat,w);S2.egt=lerp(id.egt,lc.egt,w);S2.so=C.dsl?.25*u:0}
     else{S2.ph=t<3?0:2;S2.r=id.r;S2.th=0;S2.b=0;S2.iat=id.iat;S2.egt=t>=5?lerp(id.egt,lc.egt,Math.max(0,1-(t-5)/2)):id.egt}
     return}
    const tt=t-tl;S2.tt=tt;S2.el=tt-C.tR;
    if(tt<tc){S2.ph=4;S2.fin=false;const fi=tt/T2.dt,n=T2.v.length-1,i0=fi<n?Math.floor(fi):n,i1=i0<n?i0+1:n,u=fi<n?fi-i0:0;
     const tr=C.tr;S2.x=tr[Math.min(i0,tr.length-1)]+(tr[Math.min(i1,tr.length-1)]-tr[Math.min(i0,tr.length-1)])*u;
     S2.v=lerp(T2.v[i0],T2.v[i1],u);S2.r=lerp(T2.r[i0],T2.r[i1],u);S2.g=T2.g[i1];S2.th=T2.th[i1];S2.sp=lerp(T2.sp[i0],T2.sp[i1],u);S2.b=lerp(T2.b[i0],T2.b[i1],u);S2.iat=lerp(T2.iat[i0],T2.iat[i1],u);S2.egt=lerp(T2.egt[i0],T2.egt[i1],u);S2.so=lerp(T2.so[i0],T2.so[i1],u)}
    else{const n=T2.v.length-1,vs=C.vt*S,Dst=XE-10-XF,dec=vs*vs/(2*Dst),ts=vs/dec,q=tt-tc,u=Math.min(q,ts);S2.ph=5;S2.fin=true;S2.x=DRAG.QM+DRAG.ROLL+(vs*u-.5*dec*u*u)/S;
     S2.v=Math.max(0,(vs-dec*u)/S);const ratio=T2.r[n]/(T2.v[n]||1);S2.g=T2.g[n];S2.r=Math.max(id.r,S2.v*ratio);S2.th=0;S2.sp=0;S2.so=0;const e1=Math.exp(-q/.25),e2=Math.exp(-q/2.5);
     S2.b=T2.b[n]*e1;S2.iat=lerp(id.iat,T2.iat[n],e2);S2.egt=lerp(id.egt,T2.egt[n],e2)}}
   function tick(dt){const open=DRAG.isOpen(),m=MS.pista;const sig=open?'open':'lock|'+Math.max(0,m.n-(subs||0))+'|'+(m===nextMilestone()?1:0);
    lab.type=open?undefined:'pista';
    if(sig!==D3.sig){D3.sig=sig;if(D3.g)dispose(D3.g);D3.open=open;D3.heat=-1;D3.last=null;D3.cur=null;D3.g=open?buildOpen():buildLocked();root.add(D3.g)}
    if(!open)return;
    if(D3.clock==null)D3.clock=secOfDay();D3.clock+=dt;
    const date=DRAG.today(),dk=date+'|'+(subs||0);if(dk!==D3.dayKey){D3.dayKey=dk;D3.day=DRAG.day(date);D3.heat=-1}
    const d=D3.day,N=d.heats.length;
    let t;
    if(D3.one){const o=D3.one;o.t+=dt;if(o.t>=CYC){D3.one=null;D3.heat=-1;D3.last={h:o.h,done:[true,true],started:[true,true]};D3.boardSig='';if(o.onEnd)try{o.onEnd(o.res)}catch(e){console.error(e)}}
     else{t=o.t;if(D3.heat!==-2){setHeat(-2,o.h);D3.boardSig=''}}}
    if(t==null){if(!N)return;const sec=((D3.clock%86400)+86400)%86400,i=Math.floor(sec/CYC)%N;t=sec%CYC;if(i!==D3.heat){setHeat(i);D3.boardSig=''}}
    D3.t=t;const ph=[{},{}];
    for(let k=0;k<2;k++){const s=laneAt(k,t),C=D3.cars[k];if(!s||!C)continue;C.g.visible=s.vis;C.g.position.set(s.x,0,s.z);C.g.rotation.y=Math.PI/2+s.a;C.x=s.x;C.z=s.z;C.a=s.a;ph[k]=s.ph;
     // launch control: the car shakes on the limiter and squats a little
     const lc=C.st.ph===3?Math.min(1,(t-8.2)/.3):0;C.g.rotation.z=lc*.006*Math.sin(t*47+k);C.g.position.y=lc*.012*Math.sin(t*61+k*2);
     fxLane(C,t,dt)}
    fxStep(dt);
    D3.ph=ph;const ts=JSON.stringify(ph);if(ts!==D3.treeSig){D3.treeSig=ts;bulbs()}
    const bs=D3.last?D3.last.h.id+D3.last.done.join()+D3.last.started.join():'';if(bs!==D3.boardSig){D3.boardSig=bs;drawBoard()}}
   W3.dragTick=tick;
   // name tags over the cars (driver name, or the plate for a subscriber without a name), and the round over the tree
   W3.dragDraw=()=>{tags();if(W3.dragHud)W3.dragHud()};
   function tags(){if(!D3.open||!D3.h||cam.dist>420)return;const sz=clamp(2400/cam.dist,12,20);
    for(let k=0;k<2;k++){const C=D3.cars[k];if(!C||!C.g.visible)continue;const s=toHud(C.x,2.5+YG,C.z);if(!s)continue;if(C.l.e.name)pill('★ '+C.l.e.name,s.x,s.y,sz,'rgba(255,122,26,.95)','#1d0f02');else pill(C.l.e.plate,s.x,s.y,sz,'rgba(250,250,250,.95)','#111')}
    if(cam.dist<260){const s=toHud(XS+5,7.2+YG,zc);if(s)pill(D3.h.label.toUpperCase()+' · NOW RACING',s.x,s.y,sz*.9,'rgba(13,38,80,.94)','#ffd34d')}}
   // recorder / test hooks: force open, jump to a heat, car positions, camera presets
   const CAMS={overview:{tx:(x0+x1)/2,tz:zc,yaw:Math.PI-.55,pitch:.5,dist:250},start:{tx:XS-2,tz:zc,yaw:-Math.PI/2+.42,pitch:.22,dist:30},tree:{tx:XS+5,tz:zc,ty:3.4,yaw:-Math.PI/2-.35,pitch:.1,dist:13},
    stands:{tx:XS+90,tz:zc,yaw:Math.PI-.25,pitch:.28,dist:60},finish:{tx:XF,tz:zc,yaw:Math.PI/2+.5,pitch:.2,dist:55},board:{tx:XF-12,tz:zc+22,ty:9,yaw:Math.PI+.15,pitch:.12,dist:30},
    burnout:{tx:XB,tz:zc,yaw:-.6,pitch:.25,dist:24}};
   // a one-off race summary (both units are formatted by the caller with DRAG.fmt); who = the name, or the plate when hidden
   const sumOf=h=>({id:h.id,label:h.label,date:h.date,win:h.win,margin:h.margin,winner:h.lanes[h.win]?who(h.lanes[h.win].e):null,
    lanes:h.lanes.map(l=>l&&{who:who(l.e),name:l.e.name,plate:l.e.plate,model:l.e.model,glb:l.e.glb,color:l.e.color,rt:l.rt,red:l.red,t60:l.t60,t8:l.t8,v8:l.v8,et:l.et,vt:l.vt,mph:l.vt*2.236936,kmh:l.vt*3.6})});
   // the telemetry HUD reads the strip through this (world/drag_hud.js)
   W3.dragS={D3,CYC,XS,XF,x0,x1,zc,who,hidden};
   window.__DRAG={force:v=>{DRAG.force(v)},open:()=>DRAG.isOpen(),
    // race(a, b, {seed, label, play, onEnd, t}): a one-off heads-up race between two cars, played on the strip (one 36 s
    // cycle: staging, launch control, the run, the board), then the daily loop carries on. a / b: a Wall of Mechanics
    // name or {glb, name?, plate?, color?}. Returns the summary at once (also when the strip is closed: played = false).
    race:(a,b,o)=>{o=o||{};const h=DRAG.heads(a,b,o);if(!h)return null;const res=sumOf(h);res.played=false;
     if(o.play!==false&&D3.open){D3.one={h,t:Math.max(0,Math.min(CYC-1,o.t||0)),onEnd:o.onEnd||null,res};D3.heat=-1;D3.last=null;D3.boardSig='';res.played=true}return res},
    stopRace:()=>{if(!D3.one)return false;D3.one=null;D3.heat=-1;return true},racing:()=>D3.one?{t:D3.one.t,cycle:CYC,heat:D3.one.res}:null,
    // telemetry HUD: hud(null) = normal (the viewer's toggle), hud(false) = off, hud('full' | 'mini' | true) = on (also in
    // the recorder's trailer mode); tel() = both lanes' telemetry now (for checks)
    hud:v=>{W3.dragHudForce=v===true?'full':v===false?false:v==null?null:String(v)},
    tel:()=>D3.cars.map(C=>C&&Object.assign({who:who(C.l.e),glb:C.l.e.glb,shifts:Array.from(C.tel.sh),moves:D3.ta[C.l.lane]+C.l.rt-C.tR},C.st)),fx:()=>({smoke:FX.live,flames:FX.flive,t:D3.t}),
    seek:(h,t)=>{D3.one=null;const d=DRAG.day(DRAG.today()),N=d.heats.length,i=typeof h==='number'?h:d.heats.findIndex(q=>q.id===h);if(i<0||i>=N)return false;let c=(Math.floor(secOfDay()/(CYC*N))*N+i)*CYC;if(c+CYC>86400)c=i*CYC;D3.clock=c+(t||0);D3.heat=-1;return true},
    pos:k=>{const C=D3.cars[k||0];return C?{x:C.x,z:C.z,y:YG,a:-C.a}:null},cam:n=>CAMS[n]?Object.assign({fov:50},CAMS[n]):null,cams:()=>Object.keys(CAMS),
    info:()=>D3.h?{heat:D3.h.id,label:D3.h.label,t:D3.one?D3.one.t:D3.clock%CYC,lanes:D3.h.lanes.map(l=>l&&{who:l.e.name||l.e.plate,et:l.et,dial:l.dial})}:null};
  }
