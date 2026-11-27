//@ interiors/mayor_office.js - City Hall inside: "The Mayor's Office" (Mayor TorqueBlueprint by his desk). Registers INTS.mayor,
//@ W3.hallHit (click on City Hall, view3d/camera.js) and W3.hallLbl (the STEP INSIDE CITY HALL board, view3d/labels.js).
//@ inside the if(WORLD){ block of world/world3d.js, right after world/mayor.js (uses mayorBuild/mayorPose and F). Off with ?mayor=0
//@ like the Mayor himself. Seeded (no Math.random). Static furniture is merged into 4 meshes: vertex-coloured wood/fabric, gold/metal,
//@ glass, and one atlas mesh for every board and picture (one 2048 canvas; the live boards redraw their part of it).
  // ---- CITY DECREE OF THE WEEK: edit this one constant ----
  const MAYOR_DECREE={no:1,title:'Every subscriber gets a parking spot.',body:'By order of the Mayor, every new subscriber moves into Motoropolis with a car of their own and a place to park it.'};
  if(CITY2&&F.cityhall&&F.oldtown&&!/[?&]mayor=0\b/.test(location.search)){
   const[hx,hz]=F.cityhall,hry=Math.atan2(F.oldtown[0]-hx,F.oldtown[1]-hz);
   // City Hall in the city: a ray against its box (plinth, hall, dome and steps, in the hall's own axes) and the label point over the portico
   {const hm=new T.Matrix4().makeRotationY(hry).setPosition(hx,0,hz),inv=hm.clone().invert(),hb=new T.Box3(new T.Vector3(-12,0,-8.5),new T.Vector3(12,22,12.6)),r=new T.Ray();
    W3.hallHit=ray=>r.copy(ray).applyMatrix4(inv).intersectsBox(hb);const lp=new T.Vector3(0,16.5,7.4).applyMatrix4(hm);W3.hallLbl={x:lp.x,y:lp.y,z:lp.z}}
   const MO={built:false,clk:0,t0:-99,v:'',home:{tx:0,tz:-3,yaw:0,pitch:.3,dist:36}};
   let sd=20261127;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
   // ---------- the atlas: every board and picture of the room on one canvas ----------
   const AW=2048,RG={map:[0,0,1024,704],win:[1024,0,1024,800],next:[0,704,512,312],drag:[512,704,512,312],decree:[0,1024,512,728],wom:[512,1024,512,728],
    plate:[1024,800,1024,128],flag:[1024,928,512,320],tlab:[1536,928,512,64],key:[1536,992,256,96],globe:[1536,1248,512,256],crest:[1024,1248,512,128]};
   const FN="'Barlow Condensed','Arial Narrow',sans-serif";
   const paint=(k,fn)=>{const r=RG[k],x=MO.cx;x.save();x.translate(r[0],r[1]);x.beginPath();x.rect(0,0,r[2],r[3]);x.clip();x.textAlign='center';x.textBaseline='middle';fn(x,r[2],r[3]);x.restore()};
   const font=(x,sz,w,fam)=>{x.font=`${w||800} ${sz}px ${fam||FN}`};
   const fit=(x,t,maxW,sz,w,fam)=>{font(x,sz,w,fam);while(x.measureText(t).width>maxW&&sz>10){sz-=2;font(x,sz,w,fam)}return sz};
   const wrap=(x,t,cx,y,maxW,lh)=>{const ws=String(t).split(' ');let line='';for(const w of ws){const tt=line?line+' '+w:w;if(x.measureText(tt).width>maxW&&line){x.fillText(line,cx,y);y+=lh;line=w}else line=tt}if(line)x.fillText(line,cx,y);return y+lh};
   const cog=(x,cx,cy,r,n,col)=>{x.fillStyle=col;x.beginPath();for(let i=0;i<n*2;i++){const a0=i/(n*2)*Math.PI*2,a1=(i+1)/(n*2)*Math.PI*2,rr=i%2?r*.82:r;x.arc(cx,cy,rr,a0,a1)}x.closePath();x.fill()};
   const gold=(x,y0,y1)=>{const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#fbe39a');g.addColorStop(.5,'#f2c14e');g.addColorStop(1,'#b8862a');return g};
   // the framed map: drawn top-down from the city layout (src/data/world/city_layout.json via CITY)
   function paintMap(x,W,H){x.fillStyle='#efe4c8';x.fillRect(0,0,W,H);const L=CITY.L,b={x0:-540,z0:-640,x1:1240,z1:660},m=26,top=78;
    const s=Math.min((W-2*m)/(b.x1-b.x0),(H-top-m)/(b.z1-b.z0)),ox=(W-(b.x1-b.x0)*s)/2,oz=top+((H-top-m)-(b.z1-b.z0)*s)/2,X=v=>ox+(v-b.x0)*s,Z=v=>oz+(v-b.z0)*s,mw=(b.x1-b.x0)*s,mh=(b.z1-b.z0)*s;
    x.save();x.beginPath();x.rect(ox,oz,mw,mh);x.clip();x.fillStyle='#e6dcb8';x.fillRect(ox,oz,mw,mh);
    x.fillStyle='#ece3a6';for(const f of L.fields||[])x.fillRect(X(f[0]),Z(f[1]),(f[2]-f[0])*s,(f[3]-f[1])*s);
    x.fillStyle='rgba(120,160,90,.45)';for(const h of L.hills||[]){x.beginPath();x.ellipse(X(h.x),Z(h.z),h.rx*s,h.rz*s,0,0,Math.PI*2);x.fill()}
    x.fillStyle='rgba(62,120,64,.55)';for(const f of L.forests||[]){x.beginPath();x.ellipse(X(f[0]),Z(f[1]),f[2]*s,f[3]*s,0,0,Math.PI*2);x.fill()}
    if(L.airport){const a=L.airport;x.fillStyle='#cfc8b4';x.fillRect(X(a[0]),Z(a[1]),(a[2]-a[0])*s,(a[3]-a[1])*s)}
    const sea=L.water.coast.concat([[-3000,900],[-3000,-900]]);x.fillStyle='#8fbcd9';x.beginPath();sea.forEach((p,i)=>i?x.lineTo(X(p[0]),Z(p[1])):x.moveTo(X(p[0]),Z(p[1])));x.closePath();x.fill();
    x.strokeStyle='#6f9fc2';x.lineWidth=1.5;x.beginPath();L.water.coast.forEach((p,i)=>i?x.lineTo(X(p[0]),Z(p[1])):x.moveTo(X(p[0]),Z(p[1])));x.stroke();
    const line=(P,w,col,dash)=>{x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';x.lineJoin='round';x.setLineDash(dash||[]);x.beginPath();P.forEach((p,i)=>i?x.lineTo(X(p[0]),Z(p[1])):x.moveTo(X(p[0]),Z(p[1])));x.stroke();x.setLineDash([])};
    line(L.water.river,Math.max(3,(L.water.riverW||26)*s),'#8fbcd9');if(L.rail)line(L.rail,2,'#6b5a48',[6,4]);if(L.hwy)line(L.hwy,5,'#e8a04a');
    const RW={main:4.2,street:3,lane:2,hwy:5};for(const pass of[0,1])for(const r of CITY.roads){if(r.amb&&pass)continue;const w=RW[r.k]||2;line(r.P,pass?w:w+2.2,pass?(r.k==='hwy'?'#f2b35a':r.k==='main'?'#fffaf0':'#f7f0de'):'#9a8a70')}
    if(L.plaza){x.fillStyle='#fffaf0';x.strokeStyle='#9a8a70';x.lineWidth=1.5;x.beginPath();x.arc(X(L.plaza.x),Z(L.plaza.z),Math.max(4,L.plaza.rb*s),0,Math.PI*2);x.fill();x.stroke()}
    x.restore();
    x.textAlign='center';for(const d of L.districts||[]){fit(x,d.t,170,15,800);x.lineWidth=3;x.strokeStyle='rgba(239,228,200,.9)';x.strokeText(d.t,X(d.x),Z(d.z));x.fillStyle='#4a3a26';x.fillText(d.t,X(d.x),Z(d.z))}
    // City Hall: a red star, "YOU ARE HERE"
    {const cx=X(hx),cy=Z(hz);x.fillStyle='#c8232c';x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?5:12;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill();
     font(x,15,800);x.fillStyle='#c8232c';x.textAlign='left';x.fillText('CITY HALL · YOU ARE HERE',cx+14,cy-12);x.textAlign='center'}
    // compass, frame lines, title cartouche
    {const cx=W-62,cy=top+40;x.strokeStyle='#4a3a26';x.lineWidth=2;x.beginPath();x.arc(cx,cy,22,0,Math.PI*2);x.stroke();x.fillStyle='#4a3a26';x.beginPath();x.moveTo(cx,cy-28);x.lineTo(cx+7,cy);x.lineTo(cx-7,cy);x.closePath();x.fill();font(x,16,800);x.fillText('N',cx,cy-38)}
    x.strokeStyle='#7a6448';x.lineWidth=2;x.strokeRect(ox,oz,mw,mh);x.strokeRect(6,6,W-12,H-12);
    x.fillStyle='#1f3a6e';x.fillRect(W/2-250,14,500,52);x.strokeStyle='#f2c14e';x.lineWidth=3;x.strokeRect(W/2-246,18,492,44);fit(x,'CITY OF MOTOROPOLIS · OFFICIAL MAP',470,34,800);x.fillStyle='#f2c14e';x.fillText('CITY OF MOTOROPOLIS · OFFICIAL MAP',W/2,41)}
   // the window: a painted view of the old town and the bay
   function paintWindow(x,W,H){const sk=x.createLinearGradient(0,0,0,H*.5);sk.addColorStop(0,'#7fc0ee');sk.addColorStop(1,'#f7e2bf');x.fillStyle=sk;x.fillRect(0,0,W,H);
    x.fillStyle='rgba(255,255,255,.75)';for(let k=0;k<5;k++){const cx=rnd()*W,cy=40+rnd()*160;for(let j=0;j<4;j++){x.beginPath();x.ellipse(cx+j*34-50,cy+(j%2)*8,44,18,0,0,Math.PI*2);x.fill()}}
    x.fillStyle='#8fb0b8';x.beginPath();x.moveTo(0,H*.44);for(let i=0;i<=8;i++)x.lineTo(i*W/8,H*.44-30-rnd()*50);x.lineTo(W,H*.48);x.lineTo(0,H*.48);x.fill();
    const sea=x.createLinearGradient(0,H*.46,0,H*.66);sea.addColorStop(0,'#5aa0d0');sea.addColorStop(1,'#2f78b4');x.fillStyle=sea;x.fillRect(0,H*.46,W,H*.22);
    x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=2;for(let k=0;k<22;k++){const sx=rnd()*W,sy=H*.48+rnd()*H*.16;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx+18,sy);x.stroke()}
    // the cape and its lighthouse
    x.fillStyle='#7aa35a';x.beginPath();x.moveTo(W*.62,H*.5);x.quadraticCurveTo(W*.8,H*.43,W,H*.45);x.lineTo(W,H*.62);x.lineTo(W*.6,H*.62);x.fill();
    {const lx=W*.86,ly=H*.45;for(let k=0;k<5;k++){x.fillStyle=k%2?'#c8232c':'#f5f3ee';x.fillRect(lx-9+k*.6,ly-20-k*14,18-k*1.2,14)}x.fillStyle='#ffd34d';x.fillRect(lx-7,ly-100,14,12);x.fillStyle='#333';x.beginPath();x.moveTo(lx-10,ly-100);x.lineTo(lx,ly-114);x.lineTo(lx+10,ly-100);x.fill()}
    // sailboats
    for(const[bx,by]of[[W*.18,H*.55],[W*.42,H*.5],[W*.3,H*.6]]){x.fillStyle='#5a3a22';x.fillRect(bx-16,by,32,6);x.fillStyle='#f5f3ee';x.beginPath();x.moveTo(bx,by-34);x.lineTo(bx,by-2);x.lineTo(bx+16,by-2);x.fill();x.fillStyle='#ff7a1a';x.beginPath();x.moveTo(bx-2,by-28);x.lineTo(bx-2,by-2);x.lineTo(bx-14,by-2);x.fill()}
    // old town roofs, rows getting closer
    const RF=['#c8553a','#d9693e','#b8452f','#e07b4a'],WL=['#f3e6cc','#efd9b0','#f7efe0','#e8d2a8','#f0dcc0'];
    for(let row=0;row<3;row++){const y0=H*(.62+row*.12),hh=60+row*30;let px=-20+rnd()*30;while(px<W){const w=50+rnd()*40+row*20,h=hh*(.7+rnd()*.5);x.fillStyle=WL[Math.floor(rnd()*5)];x.fillRect(px,y0-h*.3,w,H);
      x.fillStyle=RF[Math.floor(rnd()*4)];x.beginPath();x.moveTo(px-6,y0-h*.3);x.lineTo(px+w/2,y0-h*.3-h*.45);x.lineTo(px+w+6,y0-h*.3);x.fill();
      x.fillStyle='#4a6a8a';for(let wx=px+10;wx<px+w-14;wx+=22+row*6)x.fillRect(wx,y0-h*.1,10+row*3,14+row*5);px+=w+4}
     if(row===0){const tx=W*.58,ty=y0-30;x.fillStyle='#e9e4d8';x.fillRect(tx-18,ty-150,36,170);x.fillStyle='#f5f3ee';x.beginPath();x.arc(tx,ty-120,13,0,Math.PI*2);x.fill();x.strokeStyle='#333';x.lineWidth=2;x.beginPath();x.moveTo(tx,ty-120);x.lineTo(tx,ty-130);x.moveTo(tx,ty-120);x.lineTo(tx+7,ty-118);x.stroke();
      x.fillStyle='#4f8a7a';x.beginPath();x.moveTo(tx-22,ty-150);x.lineTo(tx,ty-190);x.lineTo(tx+22,ty-150);x.fill()}}}
   function paintDrag(x,W,H){x.fillStyle='#f5f3ee';x.fillRect(0,0,W,H);const p=14,pw=W-2*p,ph=H-58;x.save();x.beginPath();x.rect(p,p,pw,ph);x.clip();
    const sk=x.createLinearGradient(0,p,0,p+ph*.5);sk.addColorStop(0,'#2a2f5a');sk.addColorStop(1,'#f08a4b');x.fillStyle=sk;x.fillRect(p,p,pw,ph);
    const vx=W/2,vy=p+ph*.42;x.fillStyle='#5a6a4a';x.fillRect(p,vy,pw,ph);x.fillStyle='#3a3d44';x.beginPath();x.moveTo(vx-8,vy);x.lineTo(vx+8,vy);x.lineTo(W-p+40,p+ph);x.lineTo(p-40,p+ph);x.fill();
    x.strokeStyle='#f5f3ee';x.lineWidth=3;x.beginPath();x.moveTo(vx,vy);x.lineTo(vx,p+ph);x.stroke();x.strokeStyle='#ffd34d';x.lineWidth=2;for(const s of[-1,1]){x.beginPath();x.moveTo(vx+s*8,vy);x.lineTo(vx+s*(pw/2+40),p+ph);x.stroke()}
    for(const s of[-1,1]){x.fillStyle='#6b6f78';x.beginPath();x.moveTo(vx+s*12,vy-4);x.lineTo(vx+s*(pw/2),vy+30);x.lineTo(vx+s*(pw/2),vy-40);x.lineTo(vx+s*12,vy-10);x.fill()}
    x.fillStyle='#22252b';x.fillRect(vx-6,vy-70,12,70);const LC=['#ffd34d','#ffd34d','#ffd34d','#5cc98a'];LC.forEach((c,i)=>{for(const s of[-1,1]){x.fillStyle=c;x.beginPath();x.arc(vx+s*9,vy-62+i*14,5,0,Math.PI*2);x.fill()}});x.restore();
    font(x,30,800);x.fillStyle='#22252b';x.fillText('THE DRAG STRIP',W/2,H-26);
    const open=isOpen('pista'),t=open?'NOW OPEN':`OPENS AT ${MS.pista.n.toLocaleString('en-US')} SUBS`;x.save();x.translate(W-120,64);x.rotate(.18);x.fillStyle=open?'#2e8b57':'#ff7a1a';x.fillRect(-120,-22,240,44);fit(x,t,224,30,800);x.fillStyle='#1d0f02';x.fillText(t,0,1);x.restore()}
   function paintNext(x,W,H){x.fillStyle='#152a50';x.fillRect(0,0,W,H);x.strokeStyle='#f2c14e';x.lineWidth=6;x.strokeRect(8,8,W-16,H-16);x.fillStyle='#ff7a1a';x.fillRect(8,8,W-16,58);font(x,40,800);x.fillStyle='#1d0f02';x.fillText('NEXT UNLOCK',W/2,39);
    const nx=nextMilestone();if(!nx||subs===null){font(x,46,800);x.fillStyle='#ffffff';x.fillText(nx?'COMING SOON':'EVERYTHING IS OPEN',W/2,H/2+30);return}
    const sv=subs||0,left=Math.max(0,nx.n-sv),pv=[...ALL_MS].reverse().find(q=>q.n<=sv),base=pv?pv.n:0,k=clamp((sv-base)/Math.max(1,nx.n-base),0,1);
    fit(x,nx.label.toUpperCase(),W-60,64,800);x.fillStyle='#ffffff';x.fillText(nx.label.toUpperCase(),W/2,124);
    fit(x,`${left.toLocaleString('en-US')} more subscriber${left===1?'':'s'} to open`,W-60,36,700);x.fillStyle='#ffd34d';x.fillText(`${left.toLocaleString('en-US')} more subscriber${left===1?'':'s'} to open`,W/2,184);
    x.fillStyle='#0b1626';x.fillRect(40,224,W-80,40);x.fillStyle='#ff7a1a';x.fillRect(44,228,(W-88)*k,32);x.strokeStyle='#f2c14e';x.lineWidth=3;x.strokeRect(40,224,W-80,40)}
   function paintDecree(x,W,H){x.fillStyle='#b8865a';x.fillRect(0,0,W,H);for(let k=0;k<900;k++){x.fillStyle=rnd()<.5?'rgba(90,58,34,.25)':'rgba(240,210,160,.25)';x.fillRect(rnd()*W,rnd()*H,3,3)}
    x.fillStyle='#1f3a6e';x.fillRect(20,20,W-40,70);fit(x,'CITY DECREE OF THE WEEK',W-70,44,800);x.fillStyle='#f2c14e';x.fillText('CITY DECREE OF THE WEEK',W/2,57);
    x.save();x.translate(W/2,H/2+50);x.rotate(-.02);x.fillStyle='#fbf7ec';x.fillRect(-200,-260,400,540);x.fillStyle='rgba(0,0,0,.12)';x.fillRect(-200,276,400,6);
    font(x,40,800);x.fillStyle='#1f3a6e';x.fillText(`DECREE No. ${MAYOR_DECREE.no}`,0,-212);x.fillStyle='#c8232c';x.fillRect(-150,-184,300,3);
    font(x,38,700,"Georgia,'Times New Roman',serif");x.fillStyle='#22252b';let y=wrap(x,MAYOR_DECREE.title,0,-136,350,44);
    font(x,23,400,"Georgia,'Times New Roman',serif");x.fillStyle='#4a4f57';wrap(x,MAYOR_DECREE.body,0,y+14,340,30);
    cog(x,-110,196,46,12,'#f2c14e');x.fillStyle='#b8862a';x.beginPath();x.arc(-110,196,30,0,Math.PI*2);x.fill();font(x,36,800);x.fillStyle='#fbf7ec';x.fillText('M',-110,198);
    font(x,26,400,"'Brush Script MT',cursive");x.fillStyle='#1f3a6e';x.fillText('Mayor TorqueBlueprint',60,190);x.fillStyle='#4a4f57';x.fillRect(-20,210,170,2);x.restore();
    for(const[px,py]of[[W/2-180,H/2-196],[W/2+180,H/2-196]]){x.fillStyle='#c8232c';x.beginPath();x.arc(px,py,9,0,Math.PI*2);x.fill()}}
   function honours(){const w=WALL.filter(n=>jobOf(n));for(const n of WALL){if(w.length>=7)break;if(!w.includes(n))w.push(n)}return w.slice(0,7)}
   function paintWom(x,W,H){const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#4a2c18');g.addColorStop(1,'#2e1a0e');x.fillStyle=g;x.fillRect(0,0,W,H);x.strokeStyle=gold(x,0,H);x.lineWidth=10;x.strokeRect(12,12,W-24,H-24);
    fit(x,'WALL OF MECHANICS',W-60,52,800);x.fillStyle=gold(x,30,80);x.fillText('WALL OF MECHANICS',W/2,58);font(x,22,600);x.fillStyle='#e8d2a8';x.fillText('HONOURED CITIZENS OF MOTOROPOLIS',W/2,96);x.fillStyle='#f2c14e';x.fillRect(60,116,W-120,2);
    const L=honours();if(!L.length){font(x,36,800);x.fillStyle='#f2c14e';x.fillText('YOUR NAME HERE',W/2,H/2);return}
    L.forEach((n,i)=>{const y=162+i*76,j=jobOf(n);fit(x,n,W-80,40,800);x.fillStyle='#f7e3a6';x.fillText(n,W/2,y);font(x,21,600);x.fillStyle='#c9b48a';x.fillText(j?j.toUpperCase():'CITIZEN',W/2,y+30)});
    font(x,20,600);x.fillStyle='#e8d2a8';x.fillText('SUBSCRIBE TO JOIN THE WALL',W/2,H-34)}
   function paintStatic(){
    paint('map',paintMap);paint('win',paintWindow);paint('decree',paintDecree);
    paint('plate',(x,W,H)=>{x.fillStyle=gold(x,0,H);x.fillRect(0,0,W,H);x.strokeStyle='#8a6420';x.lineWidth=6;x.strokeRect(6,6,W-12,H-12);fit(x,'MAYOR TORQUEBLUEPRINT',W-60,84,800);x.fillStyle='#2b1d0a';x.fillText('MAYOR TORQUEBLUEPRINT',W/2,H/2+4)});
    // the Motoropolis city flag (invented): navy field, orange band, gold cog with an M
    paint('flag',(x,W,H)=>{x.fillStyle='#1f3a6e';x.fillRect(0,0,W,H);x.fillStyle='#ff7a1a';x.fillRect(0,H*.66,W,H*.16);x.fillStyle='#f2c14e';x.fillRect(0,H*.82,W,H*.05);x.fillRect(0,0,W*.06,H);
     cog(x,W*.5,H*.38,78,12,'#f2c14e');x.fillStyle='#1f3a6e';x.beginPath();x.arc(W*.5,H*.38,50,0,Math.PI*2);x.fill();font(x,72,800);x.fillStyle='#f2c14e';x.fillText('M',W*.5,H*.38+4)});
    paint('tlab',(x,W,H)=>{x.fillStyle=gold(x,0,H);x.fillRect(0,0,W,H);fit(x,'DRAG NIGHT CHAMPIONS · COMING SOON',W-30,40,800);x.fillStyle='#2b1d0a';x.fillText('DRAG NIGHT CHAMPIONS · COMING SOON',W/2,H/2+2)});
    paint('key',(x,W,H)=>{x.fillStyle=gold(x,0,H);x.fillRect(0,0,W,H);x.strokeStyle='#8a6420';x.lineWidth=4;x.strokeRect(4,4,W-8,H-8);fit(x,'KEY TO THE CITY',W-24,40,800);x.fillStyle='#2b1d0a';x.fillText('KEY TO THE CITY',W/2,H/2+2)});
    paint('globe',(x,W,H)=>{x.fillStyle='#3f7fb8';x.fillRect(0,0,W,H);x.fillStyle='#d9c48a';for(let k=0;k<9;k++){const cx=rnd()*W,cy=40+rnd()*(H-80);for(let j=0;j<6;j++){x.beginPath();x.ellipse(cx+(rnd()-.5)*60,cy+(rnd()-.5)*30,20+rnd()*26,10+rnd()*16,rnd()*3,0,Math.PI*2);x.fill()}}
     x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=1;for(let k=1;k<8;k++){x.beginPath();x.moveTo(k*W/8,0);x.lineTo(k*W/8,H);x.stroke()}for(let k=1;k<4;k++){x.beginPath();x.moveTo(0,k*H/4);x.lineTo(W,k*H/4);x.stroke()}});
    paint('crest',(x,W,H)=>{x.fillStyle='#1f3a6e';x.fillRect(0,0,W,H);x.strokeStyle='#f2c14e';x.lineWidth=5;x.strokeRect(6,6,W-12,H-12);fit(x,'★ CITY OF MOTOROPOLIS ★',W-40,60,800);x.fillStyle='#f2c14e';x.fillText('★ CITY OF MOTOROPOLIS ★',W/2,H/2+3)})}
   // the live boards: redrawn when the next unlock, the open state of the drag strip or the names change
   function liveBoards(){const nx=nextMilestone(),key=[subs,nx&&nx.type,isOpen('pista'),WALL.length,honours().map(n=>n+':'+jobOf(n)).join(',')].join('|');if(key===MO.v)return;MO.v=key;
    paint('next',paintNext);paint('drag',paintDrag);paint('wom',paintWom);MO.tex.needsUpdate=true}
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
   function buildMayorOffice(){
    const RW=50,RD=22,RH=12,X1=RW/2-.25,Z0=-RD/2+.25; // inner faces: side walls at x = +-24.75, back wall at z = -10.75
    const R=room({w:RW,d:RD,h:RH,wall:0x22375a,wall2:0x1e3150,floor:0x7a4e2c,bg:0x0e1a2b,light:0xffe4bc,deco:false});MO.S=R.S;
    const VM=[],GM=[],GL=[],AT=[];
    const bx=(L,w,h,d,c,x,y,z,ry,rx,rz)=>L.push({g:UB,c,m:xf(x,y+h/2,z,rx,ry,rz,w,h,d)});
    const cyl=(L,rt,rb,h,n,c,x,y,z,rx,ry,rz)=>L.push({g:new T.CylinderGeometry(rt,rb,h,n),c,m:xf(x,y,z,rx,ry,rz)});
    const geo=(L,g,c,x,y,z,rx,ry,rz,sx,sy,sz)=>L.push({g,c,m:xf(x,y,z,rx,ry,rz,sx,sy,sz)});
    const ap=(k,w,h,x,y,z,ry,rx,g)=>AT.push({g:g||new T.PlaneGeometry(w,h),r:RG[k],m:xf(x,y,z,rx,ry,0)});
    const WD=0x5a3a22,WD2=0x7a5232,WD3=0x8f6a3e,GD=0xf2c14e,NAVY=0x1f3a6e,ORG=0xff7a1a;
    // wood panelling (wainscot) on the three walls, a chair rail and a crown moulding
    const wall=(len,place)=>{place(len,3,.16,WD,0,0,0);for(let s=-len/2+1.6;s<len/2-1;s+=2.6)place(2.1,2.1,.08,WD2,s,.45,.12);place(len,.22,.3,WD3,0,3,.06);place(len,.4,.3,WD3,0,RH-.6,.06)};
    wall(RW,(w,h,d,c,s,y,o)=>bx(VM,w,h,d,c,s,y,Z0+.08+o));
    for(const sx of[-1,1])wall(RD,(w,h,d,c,s,y,o)=>bx(VM,d,h,w,c,sx*(X1-.08-o),y,s));
    // the rug: gold border, navy field, orange band
    bx(VM,20,.03,11,GD,0,.01,-.5);bx(VM,19.2,.04,10.2,NAVY,0,.01,-.5);bx(VM,14,.05,.3,ORG,0,.01,-3.6);bx(VM,14,.05,.3,ORG,0,.01,2.6);
    // ---- the window (painted view) with curtains and the city crest over it ----
    ap('win',8.4,6.6,0,5.9,Z0+.05,0);
    for(const[w,h,x,y]of[[9,.35,0,2.4],[9,.35,0,9.2],[.35,7.1,-4.4,2.4],[.35,7.1,4.4,2.4],[.16,6.7,0,2.6],[8.4,.16,0,6.2]])bx(VM,w,h,.3,0xf1ead8,x,y,Z0+.12);
    bx(VM,9.6,.3,.9,0xf1ead8,0,2.2,Z0+.4);
    for(const s of[-1,1]){bx(VM,1.6,8.4,.4,NAVY,s*5.3,1.2,Z0+.45);bx(VM,1.75,.25,.5,GD,s*5.3,4.4,Z0+.55)}bx(VM,12.4,1,.5,ORG,0,9.4,Z0+.5);bx(VM,12.4,.12,.55,GD,0,9.4,Z0+.5);
    ap('crest',3.6,.9,0,10.85,Z0+.06,0);
    // ---- the framed map (left of the window) ----
    ap('map',9.2,6.3,-11.6,6.4,Z0+.2,0);
    // ---- the boards (right of the window): NEXT UNLOCK, the Drag Strip photo, the decree, the Wall of Mechanics ----
    const frame=(L,c,cx,cy,w,h,t)=>{for(const[a,b,x,y]of[[w+t*2,t,cx,cy-h/2-t],[w+t*2,t,cx,cy+h/2],[t,h,cx-w/2-t/2,cy-h/2],[t,h,cx+w/2+t/2,cy-h/2]])bx(L,a,b,.3,c,x,y,Z0+.18)};
    frame(GM,GD,-11.6,6.4,9.2,6.3,.3);
    ap('next',5.4,3.3,9.6,8.4,Z0+.2,0);frame(GM,GD,9.6,8.4,5.4,3.3,.22);
    ap('drag',5.4,3.3,9.6,4.4,Z0+.2,0);frame(VM,0x2b2b30,9.6,4.4,5.4,3.3,.18);
    ap('decree',5,7.1,16,6.4,Z0+.2,0);frame(VM,WD,16,6.4,5,7.1,.25);
    ap('wom',5,7.1,21.7,6.4,Z0+.2,0);frame(GM,GD,21.7,6.4,5,7.1,.25);
    // ---- bookshelf (back-left corner) ----
    {const cx=-20.6,cz=Z0+.75,w=7,h=8.2,d=1.4;bx(VM,w,h,.15,WD,cx,0,Z0+.1);for(const s of[-1,1])bx(VM,.25,h,d,WD2,cx+s*(w/2-.12),0,cz);bx(VM,w,.3,d+.1,WD3,cx,h,cz);
     for(let k=0;k<5;k++){const y=.25+k*1.6;bx(VM,w-.4,.12,d,WD2,cx,y,cz);if(k===4)continue;const BC=[0x8a1a14,0x1f3a6e,0x2e7d4f,0x5a3a22,0xc8a24a,0x3a2f55,0x7a4b32,0xd8cba6];let px=cx-w/2+.4;
      while(px<cx+w/2-.6){const bw=.16+rnd()*.14,bh=.9+rnd()*.5;if(k===1&&px>cx+.8&&px<cx+1.8){px+=1.1;continue}bx(VM,bw,bh,.9,BC[Math.floor(rnd()*8)],px+bw/2,y+.12,cz+.1,0,0,rnd()<.08?.15:0);px+=bw+.02}}
     cyl(GM,.25,.3,.5,12,GD,cx+1.3,1.85+.25,cz+.1)}
    // ---- globe on a stand ----
    {const gx=-19.6,gz=-5.6;for(let k=0;k<3;k++){const a=k*2.09;bx(VM,.12,1.6,.12,WD,gx+Math.cos(a)*.55,0,gz+Math.sin(a)*.55,-a,Math.cos(a)*.0,0)}cyl(VM,.7,.7,.1,16,WD2,gx,1.6,gz);
     geo(GM,new T.TorusGeometry(1.08,.05,6,32),GD,gx,2.75,gz,0,.4,.41);AT.push({g:new T.SphereGeometry(1,24,16),r:RG.globe,m:xf(gx,2.75,gz,0,.9,.41)})}
    // ---- the desk, the chair and what is on the desk ----
    {const dz=-5.4;bx(VM,9,1.5,3.2,WD,0,0,dz);bx(VM,9.4,.16,3.5,WD2,0,1.5,dz);bx(VM,6,.03,2.2,0x2e5a3a,0,1.66,dz-.2);
     for(const s of[-1,1])bx(VM,2.4,1.1,.06,WD2,s*2.6,.2,dz+1.62);bx(GM,7.6,.08,.06,GD,0,1.25,dz+1.63);bx(GM,7.6,.08,.06,GD,0,.12,dz+1.63);
     // gold nameplate on the front edge, facing the visitors
     bx(VM,4,.12,.6,WD,0,1.66,dz+1.2);bx(GM,4,.6,.12,GD,0,1.72,dz+1.25,0,-.35);ap('plate',3.8,.48,0,2.045,dz+1.316,0,-.35);
     // papers, inkwell and pen, a banker's lamp, the city stamp
     bx(VM,1.4,.04,1,0xf5f3ee,-.8,1.69,dz-.1,.15);bx(VM,1.4,.04,1,0xfbf7ec,-.6,1.73,dz-.2,-.08);cyl(VM,.18,.2,.3,10,0x22252b,1.6,1.83,dz-.3);bx(GM,.04,.6,.04,GD,1.7,1.85,dz-.3,0,0,.4);
     cyl(GM,.3,.36,.1,14,GD,-3.2,1.71,dz-.6);bx(GM,.08,.9,.08,GD,-3.2,1.71,dz-.6);bx(VM,1.4,.35,.5,0x1f6a3a,-3.2,2.55,dz-.6);
     cyl(VM,.22,.22,.3,12,0xc8232c,3.1,1.82,dz+.1);cyl(GM,.08,.08,.35,8,GD,3.1,2.1,dz+.1);
     // leather chair behind the desk
     const cz=-8.2,cx=-1.5,LC=0x6e1f1f;cyl(VM,.14,.14,.8,8,0x22252b,cx,.4,cz);bx(VM,1.6,.12,.12,0x22252b,cx,.02,cz);bx(VM,.12,.12,1.6,0x22252b,cx,.02,cz);
     bx(VM,2,.45,1.8,LC,cx,.8,cz);bx(VM,2.1,2.9,.45,LC,cx,1.1,cz-.9);bx(VM,2.2,.3,.5,LC,cx,3.9,cz-.9);for(const s of[-1,1])bx(VM,.3,.7,1.6,LC,cx+s*1.05,1.25,cz-.05);
     for(let k=0;k<5;k++)geo(GM,new T.SphereGeometry(.05,6,4),GD,cx-.8+k*.4,3.98,cz-.64)}
    // two leather armchairs facing the desk
    for(const s2 of[-1,1]){const ax=s2*3,az=-.8,AC=0x7a2a22;bx(VM,1.9,.9,1.8,AC,ax,0,az);bx(VM,1.9,1.9,.4,AC,ax,.9,az+.75);for(const t of[-1,1])bx(VM,.35,.55,1.8,AC,ax+t*.95,.9,az);for(const t of[-1,1])for(const u of[-1,1])bx(VM,.14,.25,.14,WD,ax+t*.8,0,az+u*.75)}
    // ---- the city flag on a pole (right of the desk, by the trophy cabinet) ----
    {const fx=22.4,fz=1.4;cyl(GM,.45,.55,.3,16,GD,fx,.15,fz);cyl(VM,.07,.07,7.6,10,WD,fx,4.05,fz);geo(GM,new T.SphereGeometry(.18,10,8),GD,fx,7.95,fz);
     const fg=new T.PlaneGeometry(3,1.9,14,2),P=fg.attributes.position;for(let i=0;i<P.count;i++){const u=(P.getX(i)+1.5)/3;P.setZ(i,Math.sin(u*5.2)*.22*u);P.setY(i,P.getY(i)-u*u*.35)}fg.computeVertexNormals();
     AT.push({g:fg,r:RG.flag,m:xf(fx-1.55,6.6,fz,0,Math.PI,0)})}
    // ---- trophy cabinet on the right wall: shelves of city trophies and one empty shelf waiting for the Drag Night champions ----
    {const cz=-4.6,w=6.4,h=7.2,d=1.4,cx=X1-d/2;bx(VM,.12,h,w,0x3a2416,X1-.06,0,cz);for(const s2 of[-1,1])bx(VM,d,h,.22,WD,cx,0,cz+s2*(w/2-.11));bx(VM,d+.1,.3,w+.2,WD3,cx,h,cz);bx(VM,d,.6,w,WD,cx,0,cz);
     for(const y of[2.3,4,5.6])bx(VM,d-.1,.1,w-.44,0xe8dcc0,cx,y,cz);
     const cup=(x,y,z,s)=>{geo(GM,new T.LatheGeometry([[0,0],[.32,0],[.3,.08],[.1,.16],[.08,.42],[.36,.62],[.42,1.02],[.38,1.04],[0,.66]].map(p=>new T.Vector2(p[0],p[1])),16),GD,x,y,z,0,0,0,s,s,s);
      for(const sd2 of[-1,1])geo(GM,new T.TorusGeometry(.16*s,.035*s,5,10,Math.PI),GD,x,y+.8*s,z+sd2*.42*s,Math.PI/2,0,sd2*Math.PI/2)};
     cup(cx-.1,5.7,cz-1.6,1.1);cup(cx-.1,5.7,cz+1.6,.9);bx(GM,.2,1,.8,GD,cx+.2,5.7,cz,0,0,-.1);cup(cx-.1,4.1,cz-1.2,.9);bx(GM,.2,.9,1.2,GD,cx+.3,4.1,cz+1.2,0,0,-.12);
     cup(cx-.1,.6,cz-1.8,.8);cup(cx-.1,.6,cz,1.3);cup(cx-.1,.6,cz+1.8,.8);
     ap('tlab',4.6,.58,cx-d/2-.02,2.72,cz,-Math.PI/2); // the empty shelf (2.3 .. 4.0) with its label at the front
     GL.push({g:UB,c:0xffffff,m:xf(cx-d/2+.02,h/2,cz,0,0,0,.04,h-.2,w-.2)})}
    // ---- the key to the city: a gold key on a navy cushion in a glass case on a pedestal ----
    {const kx=21.4,kz=6.4;bx(VM,1.6,2.4,1.6,WD,kx,0,kz);bx(VM,1.8,.15,1.8,WD3,kx,2.4,kz);bx(VM,1.3,.12,1.1,NAVY,kx,2.55,kz);ap('key',1.3,.48,kx,1.6,kz+.81,0);
     const ky=2.8;geo(GM,new T.TorusGeometry(.16,.05,8,16),GD,kx-.38,ky,kz,Math.PI/2,0,0);bx(GM,.7,.07,.07,GD,kx+.05,ky-.035,kz);bx(GM,.07,.06,.18,GD,kx+.3,ky-.03,kz+.1);bx(GM,.07,.06,.12,GD,kx+.18,ky-.03,kz+.07);
     GL.push({g:UB,c:0xffffff,m:xf(kx,2.55+.55,kz,0,0,0,1.4,1.1,1.2)})}
    // ---- waiting bench (left wall), plants ----
    {const bx0=-13.6;bx(VM,1.3,.2,5,WD2,bx0,.9,3.4);bx(VM,.2,1.4,5,WD2,bx0-.6,1.1,3.4);bx(VM,1.2,.12,4.8,0x6e1f1f,bx0,1.1,3.4);for(const z of[1.2,5.6])for(const dx of[-.5,.5])bx(VM,.12,.9,.12,WD,bx0+dx,0,z)}
    const plant=(x,z,s)=>{cyl(VM,.55*s,.42*s,.9*s,12,0x8a5a3a,x,.45*s,z);for(let k=0;k<5;k++)geo(VM,new T.IcosahedronGeometry(.55*s,0),0x3f8f45,x+Math.cos(k*1.26)*.35*s,(1.3+(k%3)*.4)*s,z+Math.sin(k*1.26)*.35*s,rnd(),rnd(),0,1,1.3,1)};
    plant(-13.6,7.4,1);plant(-23.4,8.6,1.2);plant(-7.2,-9.8,1);plant(23.2,9,1.2);plant(-23.6,-1.6,.9);
    // ---- build the meshes ----
    const cv=document.createElement('canvas');cv.width=cv.height=AW;MO.cx=cv.getContext('2d');const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;MO.tex=tex;paintStatic();liveBoards();
    const add=(L,m,cast)=>{if(!L.length)return;const o=new T.Mesh(mergeParts(L),m);o.castShadow=cast;o.receiveShadow=true;R.add(o);return o};
    add(VM,new T.MeshStandardMaterial({vertexColors:true,roughness:.7,metalness:0}),true);
    add(GM,new T.MeshStandardMaterial({vertexColors:true,color:0xffffff,roughness:.35,metalness:.45}),true);
    add(AT,new T.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.42,roughness:.8,side:T.DoubleSide}),false);
    const gl=add(GL,new T.MeshStandardMaterial({color:0xcfe8ff,transparent:true,opacity:.16,roughness:.05,metalness:.1,depthWrite:false}),false);if(gl)gl.renderOrder=2;
    // the Mayor (the same rig as in the city), beside his desk, and two visitors waiting on the bench
    const M2=mayorBuild(T);M2.g.scale.setScalar(1.5);M2.g.position.set(5.9,0,-6.6);R.add(M2.g);MO.R=M2;
    const hon=honours(),vis=WALL.filter(n=>!hon.includes(n)).slice(0,2);MO.vis=vis.map((n,i)=>{const m=mkP(MO.S,null,210+i,'civ');putP(m,{x:-12,z:2.4+i*2.4,ang:Math.PI/2},false);m.userData.nm=n;return m});
    MO.built=true}
   function syncMayorOffice(dt){MO.clk+=dt||0;liveBoards();const t=MO.clk,e=t-MO.t0,R=MO.R,g=R.g;
    // a wave when you come in, then now and then a smaller one; he turns to the visitor (the camera) and looks around in between
    const win=(u,a,b)=>u>a&&u<b?Math.min(1,(u-a)/.35,(b-u)/.35):0,c=t%17,greet=win(e,.1,3.8),wave=Math.max(greet,win(c,11,13.2)*.85);MO.greet=greet;
    const toCam=Math.atan2(camera.position.x-g.position.x,camera.position.z-g.position.z);g.rotation.y=toCam*.8+(1-greet)*Math.sin(t*.35)*.35;
    mayorPose(R,0,0,wave,t);MO.vis.forEach((m,k)=>{m.rotation.y=Math.PI/2+Math.sin(t*(.4+k*.15)+k)*.35})}
   function labelsMayorOffice(){const g=MO.R.g,p=toHud(g.position.x,4.3,g.position.z),sz=clamp(1000/cam.dist,13,22);
    if(p){pill('MAYOR TORQUEBLUEPRINT',p.x,p.y,sz*1.06,'rgba(255,211,77,.96)','#1d0f02','#ff7a1a');if(MO.greet>.2){hctx.globalAlpha=Math.min(1,MO.greet*1.5);pill('WELCOME TO CITY HALL!',p.x,p.y-sz*2.6,sz,'#ffffff','#1f3a6e','#1f3a6e');hctx.globalAlpha=1}}
    for(const m of MO.vis){const n=m.userData.nm,j=jobOf(n);tag(m.position.x,3.5+(m===MO.vis[0]?1:0),m.position.z,`★ ${n}${j?' · '+j.toUpperCase():''}`,'rgba(16,19,24,.85)','#ffd34d')}
    header("INSIDE CITY HALL · THE MAYOR'S OFFICE")}
   INTS.mayor={get scene(){return MO.S},build:buildMayorOffice,isBuilt:()=>MO.built,sync:syncMayorOffice,labels:labelsMayorOffice,get home(){return MO.home},onEnter(){MO.t0=MO.clk}};
  }
