//@ interiors/hospital.js - the Hospital inside (world milestone w_hosp, 200 subscribers): emergency entrance with the ambulance bay,
//@ reception, waiting area with the NOW SEEING ticket board, the ON DUTY staff board (staffOf('w_hosp', Doctor/Nurse/Paramedic)),
//@ a recovery ward with beds and curtains (two crash-test dummies) and car-themed notices. Registers INTS.hosp,
//@ W3.hospHit (click on the hospital, view3d/camera.js) and W3.hospLbl (the STEP INSIDE board, view3d/labels.js).
//@ City entry only when the hospital is open; ?hosp=1 (HOSP_PV) forces the building open and enterable for testing only
//@ (world/world3d.js reads it too). Seeded (no Math.random). Static furniture is merged into a few meshes: vertex-coloured
//@ paint/fabric, chrome, glass, glow, one 2048 atlas for every printed board and one small live canvas (NOW SEEING, ON DUTY)
//@ that is redrawn only when its content changes.
//@ top level of make3D, after world/world3d_end.js (needs W3).
 const HOSP_PV=WORLD&&/[?&]hosp=1\b/.test(location.search);
 const hospOpen=()=>!!(WORLD&&MS.w_hosp&&(HOSP_PV||isOpen('w_hosp')));
 if(WORLD&&MS.w_hosp&&CITY.F.w_hosp){
  // the hospital in the city (world/world3d.js: 34 x 22 m block + the 20 m tower, entrance and ambulance pad on its -z side)
  {const[hx,hz]=CITY.F.w_hosp,hb=new T.Box3(new T.Vector3(hx-17,0,hz-21),new T.Vector3(hx+17,20.5,hz+11));
   W3.hospHit=ray=>hospOpen()&&ray.intersectsBox(hb);W3.hospLbl={x:hx,y:16.6,z:hz-11}}
  const HP={built:false,clk:0,v:'',vt:-9,home:{tx:0,tz:-3,yaw:.12,pitch:.4,dist:40}};
  let sd=20261127;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
  const FN="'Barlow Condensed','Arial Narrow',sans-serif";
  // ---------- the staff: real names from the job board; in the preview (not open yet) the free names of the WALL fill in ----------
  const ROLES_H=[['Doctor',0],['Doctor',1],['Nurse',0],['Paramedic',0],['Paramedic',1]];
  function crew(){const op=isOpen('w_hosp'),spare=op?[]:WALL.filter(n=>!jobOf(n));let s=0;return ROLES_H.map(([t,k])=>({t,k,n:staffOf('w_hosp',t,k)||(!op&&spare[s++])||null}))}
  function visitors(cr){const used=cr.map(c=>c.n);return WALL.filter(n=>!used.includes(n)).slice(-3).reverse()}
  // ---------- canvases: the static atlas (2048) and the live boards (1024) ----------
  const AW=2048,LW=1024;
  const RG={street:[0,0,1024,704],dummy:[1024,0,512,704],aid:[1536,0,512,704],side:[0,704,1024,640],rear:[1024,704,512,576],front:[1536,704,512,128],hand:[1536,832,512,448],
   clear:[1024,1280,512,128],ticket:[1536,1280,256,256],screen:[1792,1280,256,160],recep:[0,1344,1024,160],speed:[1024,1408,512,256],dsk:[1792,1440,256,96],target:[1536,1536,128,128],
   mag:[1664,1536,128,160],mag2:[1792,1536,128,160],bay:[0,1504,1024,160],ward:[0,1664,1024,160],floor:[1024,1664,1024,192],title:[0,1856,1024,128],exit:[1024,1856,256,96],cup:[1280,1856,256,96]};
  const LR={now:[0,0,1024,448],duty:[0,448,1024,576]};
  const paint=(cx,r,fn)=>{cx.save();cx.translate(r[0],r[1]);cx.beginPath();cx.rect(0,0,r[2],r[3]);cx.clip();cx.textAlign='center';cx.textBaseline='middle';fn(cx,r[2],r[3]);cx.restore()};
  const font=(x,sz,w,fam)=>{x.font=`${w||800} ${sz}px ${fam||FN}`};
  const fit=(x,t,maxW,sz,w,fam)=>{font(x,sz,w,fam);while(x.measureText(t).width>maxW&&sz>10){sz-=2;font(x,sz,w,fam)}return sz};
  const txt=(x,t,cx,cy,maxW,sz,col,w,fam)=>{fit(x,t,maxW,sz,w,fam);x.fillStyle=col;x.fillText(t,cx,cy)};
  const rr=(x,a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
  // the "star" of the hospital: six rounded bars (a generic medical mark, no real emblem)
  const star=(x,cx,cy,r,col)=>{x.save();x.translate(cx,cy);x.fillStyle=col;for(let k=0;k<3;k++){x.rotate(Math.PI/3);rr(x,-r*.22,-r,r*.44,r*2,r*.12);x.fill()}x.fillStyle='#ffffff';x.beginPath();x.arc(0,0,r*.2,0,Math.PI*2);x.fill();x.restore()};
  const target=(x,cx,cy,r)=>{x.fillStyle='#f2d21b';x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.fill();x.fillStyle='#16181c';for(const a of[0,Math.PI]){x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,r,a,a+Math.PI/2);x.closePath();x.fill()}x.strokeStyle='#16181c';x.lineWidth=r*.12;x.beginPath();x.arc(cx,cy,r*.94,0,Math.PI*2);x.stroke()};
  const checker=(x,y,w,h,n,c1,c2)=>{const s=h/n;for(let i=0;i*s<w;i++)for(let j=0;j<n;j++){x.fillStyle=(i+j)%2?c1:c2;x.fillRect(i*s,y+j*s,s+.5,s+.5)}};
  const dummyFace=(x,cx,cy,r)=>{x.fillStyle='#f2c230';x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.fill();x.strokeStyle='#8a6a10';x.lineWidth=4;x.stroke();
   target(x,cx-r*.98,cy,r*.2);target(x,cx+r*.98,cy,r*.2);x.fillStyle='#16181c';for(const s of[-1,1]){x.beginPath();x.arc(cx+s*r*.32,cy-r*.12,r*.09,0,Math.PI*2);x.fill()}
   x.strokeStyle='#16181c';x.lineWidth=r*.07;x.lineCap='round';x.beginPath();x.arc(cx,cy+r*.12,r*.36,.25*Math.PI,.75*Math.PI);x.stroke();
   x.fillStyle='#ffffff';x.save();x.translate(cx,cy-r*.62);x.rotate(-.12);x.fillRect(-r*.95,-r*.13,r*1.9,r*.26);x.strokeStyle='#d9d4c8';x.lineWidth=2;x.strokeRect(-r*.95,-r*.13,r*1.9,r*.26);x.restore()};
  function paintStreet(x,W,H){const sk=x.createLinearGradient(0,0,0,H*.55);sk.addColorStop(0,'#7cc0ee');sk.addColorStop(1,'#e8f2f4');x.fillStyle=sk;x.fillRect(0,0,W,H);
   x.fillStyle='rgba(255,255,255,.8)';for(let k=0;k<4;k++){const cx=rnd()*W,cy=40+rnd()*120;for(let j=0;j<4;j++){x.beginPath();x.ellipse(cx+j*30-45,cy+(j%2)*7,40,15,0,0,Math.PI*2);x.fill()}}
   // town across the street
   const WLL=['#e9dcc4','#d9c7a8','#cfd8de','#efe6d2','#c9b79a'],RF=['#c8553a','#a8452f','#5a6a7a','#d9693e'];let px=-10;while(px<W){const w=90+rnd()*80,h=150+rnd()*170,y0=H*.58;x.fillStyle=WLL[Math.floor(rnd()*5)];x.fillRect(px,y0-h,w,h);
    x.fillStyle=RF[Math.floor(rnd()*4)];x.fillRect(px-4,y0-h-12,w+8,14);x.fillStyle='#5f7f9a';for(let wy=y0-h+24;wy<y0-30;wy+=42)for(let wx=px+12;wx<px+w-22;wx+=30)x.fillRect(wx,wy,16,24);px+=w+6}
   // trees, the pavement, the road and its markings
   for(let k=0;k<6;k++){const tx=60+k*180+rnd()*40,ty=H*.6;x.fillStyle='#6b4a2b';x.fillRect(tx-5,ty-60,10,60);x.fillStyle=k%2?'#4f8a3c':'#5c9445';x.beginPath();x.arc(tx,ty-80,38,0,Math.PI*2);x.fill()}
   x.fillStyle='#c9c6be';x.fillRect(0,H*.58,W,H*.08);x.fillStyle='#55585e';x.fillRect(0,H*.66,W,H*.34);x.fillStyle='#f4f4f0';for(let k=0;k<W;k+=120)x.fillRect(k+20,H*.82,70,8);
   x.fillStyle='#e8e4da';x.fillRect(0,H*.655,W,8);
   // a little unbranded hatchback passing by
   {const cx=W*.68,cy=H*.78;x.fillStyle='#2f6fd9';rr(x,cx-110,cy-46,220,52,16);x.fill();rr(x,cx-64,cy-84,120,46,18);x.fill();x.fillStyle='#bfe0f5';rr(x,cx-54,cy-76,48,32,8);x.fill();rr(x,cx+2,cy-76,46,32,8);x.fill();
    x.fillStyle='#16181c';for(const s of[-62,62]){x.beginPath();x.arc(cx+s,cy+8,22,0,Math.PI*2);x.fill()}x.fillStyle='#c8ccd2';for(const s of[-62,62]){x.beginPath();x.arc(cx+s,cy+8,9,0,Math.PI*2);x.fill()}x.fillStyle='#ffe9a8';x.fillRect(cx+100,cy-34,10,12)}}
  function paintDummy(x,W,H){x.fillStyle='#fdf7ea';x.fillRect(0,0,W,H);x.fillStyle='#1f6f8b';x.fillRect(0,0,W,150);checker(x,150,W,22,2,'#f2d21b','#16181c');
   txt(x,'CRASH-TEST DUMMY',W/2,52,W-40,58,'#ffffff');txt(x,'RECOVERY WARD',W/2,110,W-40,58,'#f2d21b');
   dummyFace(x,W/2,300,96);
   font(x,30,700);x.fillStyle='#22313a';x.fillText('Bumps, dents and airbag hugs',W/2,442);x.fillText('treated every day.',W/2,478);
   x.fillStyle='#1f6f8b';rr(x,40,512,W-80,70,14);x.fill();txt(x,'Tested at 56 km/h (35 mph)',W/2,535,W-110,30,'#ffffff',700);txt(x,'and still smiling!',W/2,563,W-110,26,'#f2d21b',700);
   txt(x,'All patients leave in showroom condition.',W/2,620,W-50,26,'#22313a',600);txt(x,'VISITING HOURS 2 - 8 PM',W/2,668,W-50,28,'#1f6f8b',800)}
  function paintAid(x,W,H){x.fillStyle='#b78a55';x.fillRect(0,0,W,H);for(let k=0;k<700;k++){x.fillStyle=rnd()<.5?'rgba(90,58,30,.28)':'rgba(240,210,160,.25)';x.fillRect(rnd()*W,rnd()*H,3,3)}
   x.strokeStyle='#7a5530';x.lineWidth=14;x.strokeRect(7,7,W-14,H-14);
   x.save();x.translate(W/2,286);x.rotate(-.025);x.fillStyle='#ffffff';x.fillRect(-212,-246,424,500);x.fillStyle='rgba(0,0,0,.12)';x.fillRect(-212,254,424,6);
   x.fillStyle='#2e9e5b';x.fillRect(-212,-246,424,86);x.fillStyle='#ffffff';x.fillRect(-176,-212,46,18);x.fillRect(-162,-226,18,46);txt(x,"MECHANICS'",28,-224,300,40,'#ffffff');txt(x,'FIRST-AID COURSE',28,-186,300,36,'#ffffff');
   txt(x,'Every Thursday · 7 pm · Room 2',0,-128,390,28,'#2e9e5b',700);
   font(x,25,600);x.fillStyle='#22313a';x.textAlign='left';const L=['• A plaster is not duct tape','• Wash the grease off first','• Hot exhaust burn? Cool it under','   running water for 20 minutes','• Wrench wrist? Rest, then stretch','• Always wear your safety glasses'];
   L.forEach((t,i)=>x.fillText(t,-186,-80+i*40));x.textAlign='center';txt(x,'FREE · BRING YOUR OVERALLS',0,180,380,30,'#c0392b',800);x.fillStyle='#d93a2f';x.beginPath();x.arc(0,-236,8,0,Math.PI*2);x.fill();x.restore();
   // the little note pinned in the corner
   x.save();x.translate(W-110,H-92);x.rotate(.08);x.fillStyle='#fff3a6';x.fillRect(-88,-60,176,124);font(x,24,700,"'Comic Sans MS','Segoe Print',cursive");x.fillStyle='#3a3a3a';x.fillText('LOST:',0,-30);x.fillText('one 10 mm',0,2);x.fillText('socket :(',0,32);
   x.fillStyle='#2f6fd9';x.beginPath();x.arc(0,-52,7,0,Math.PI*2);x.fill();x.restore()}
  function paintSide(x,W,H){x.fillStyle='#f6f6f2';x.fillRect(0,0,W,H);checker(x,H*.52,W,96,2,'#f2d21b','#2e9e5b');x.fillStyle='#d93a2f';x.fillRect(0,H*.52+96,W,16);x.fillRect(0,H*.52-16,W,10);
   txt(x,'AMBULANCE',W/2,H*.22,W*.62,120,'#1f4fa0');star(x,90,H*.24,58,'#1f4fa0');star(x,W-90,H*.24,58,'#1f4fa0');txt(x,'MOTOROPOLIS GENERAL',W/2,H*.41,W*.6,40,'#1f4fa0',700)}
  function paintRear(x,W,H){x.fillStyle='#f6f6f2';x.fillRect(0,0,W,H);x.fillStyle='#2a3440';rr(x,40,40,180,140,14);x.fill();rr(x,W-220,40,180,140,14);x.fill();
   checker(x,H*.5,W,72,2,'#f2d21b','#2e9e5b');x.fillStyle='#9aa3ae';x.fillRect(W/2-3,0,6,H);x.fillRect(0,0,W,6);x.fillStyle='#2a3440';x.fillRect(W/2-60,H*.43,30,10);x.fillRect(W/2+30,H*.43,30,10);
   star(x,W/2,H*.82,54,'#1f4fa0');x.fillStyle='#d93a2f';x.fillRect(30,H*.8,90,26);x.fillRect(W-120,H*.8,90,26)}
  function paintFront(x,W,H){x.fillStyle='#f6f6f2';x.fillRect(0,0,W,H);x.save();x.translate(W,0);x.scale(-1,1);txt(x,'AMBULANCE',W/2,H/2+4,W-40,92,'#1f4fa0');x.restore()}
  function paintHand(x,W,H){x.fillStyle='#e8f6f2';x.fillRect(0,0,W,H);x.fillStyle='#2a8f86';x.fillRect(0,0,W,96);txt(x,'WASH YOUR HANDS',W/2,50,W-40,56,'#ffffff');
   x.fillStyle='rgba(120,190,230,.6)';for(let k=0;k<18;k++){x.beginPath();x.arc(60+rnd()*(W-120),130+rnd()*170,8+rnd()*18,0,Math.PI*2);x.fill()}
   x.fillStyle='#f1c7a5';for(const s of[-1,1]){x.save();x.translate(W/2+s*58,236);x.rotate(s*.35);rr(x,-48,-70,96,140,40);x.fill();x.restore()}
   txt(x,'at least 20 seconds',W/2,350,W-40,40,'#22313a',700);txt(x,'soap · rinse · dry',W/2,400,W-40,32,'#2a8f86',600)}
  function paintSign(x,W,H,t,bg,fg,ic){x.fillStyle=bg;x.fillRect(0,0,W,H);x.fillStyle=fg;x.fillRect(0,H-10,W,4);if(ic){star(x,H*.6,H/2,H*.32,fg);txt(x,t,W/2+H*.3,H/2+3,W-H*1.6,H*.62,fg)}else txt(x,t,W/2,H/2+3,W-40,H*.62,fg)}
  function paintStatic(cx){
   const P=(k,fn)=>paint(cx,RG[k],fn);
   P('street',paintStreet);P('dummy',paintDummy);P('aid',paintAid);P('side',paintSide);P('rear',paintRear);P('front',paintFront);P('hand',paintHand);
   P('recep',(x,W,H)=>paintSign(x,W,H,'RECEPTION · EMERGENCY','#ffffff','#1f6f8b',true));
   P('bay',(x,W,H)=>paintSign(x,W,H,'AMBULANCE BAY','#d93a2f','#ffffff',true));
   P('ward',(x,W,H)=>paintSign(x,W,H,'WARD A · RECOVERY','#2e9e5b','#ffffff',false));
   P('title',(x,W,H)=>{x.fillStyle='#1f6f8b';x.fillRect(0,0,W,H);star(x,70,H/2,40,'#ffffff');star(x,W-70,H/2,40,'#ffffff');txt(x,'MOTOROPOLIS GENERAL HOSPITAL',W/2,H/2+3,W-200,76,'#ffffff')});
   P('clear',(x,W,H)=>{checker(x,0,W,H,1,'#f2d21b','#16181c');x.fillStyle='#f2d21b';x.fillRect(40,12,W-80,H-24);txt(x,'CLEARANCE 3.2 m · 10 ft 6 in',W/2,H/2+2,W-100,56,'#16181c')});
   P('speed',(x,W,H)=>{x.fillStyle='#ffffff';x.fillRect(0,0,W,H);x.strokeStyle='#d93a2f';x.lineWidth=18;x.beginPath();x.arc(110,H/2,92,0,Math.PI*2);x.stroke();txt(x,'8',110,H/2+4,120,110,'#16181c');
    txt(x,'SLOW',W*.66,H*.27,280,62,'#d93a2f');txt(x,'8 km/h · 5 mph',W*.66,H*.56,290,44,'#16181c',700);txt(x,'AMBULANCES TURNING',W*.66,H*.8,290,28,'#5a6472',700)});
   P('ticket',(x,W,H)=>{x.fillStyle='#d93a2f';x.fillRect(0,0,W,H);txt(x,'TAKE A',W/2,50,W-30,44,'#ffffff');txt(x,'NUMBER',W/2,96,W-30,44,'#ffffff');x.fillStyle='#16181c';rr(x,60,140,W-120,60,10);x.fill();x.fillStyle='#ffffff';x.fillRect(84,196,W-168,40)});
   P('screen',(x,W,H)=>{x.fillStyle='#071612';x.fillRect(0,0,W,H);x.strokeStyle='#3ee08f';x.lineWidth=4;x.beginPath();let y=H*.42;x.moveTo(0,y);
    for(let px=0;px<W;px+=4){const m=px%84;y=H*.42-(m>40&&m<46?-14:m>=46&&m<52?46:m>=52&&m<58?-20:0);x.lineTo(px,y)}x.stroke();txt(x,'HR 72',60,H*.82,110,34,'#3ee08f',700);txt(x,'SpO2 98%',W-70,H*.82,130,30,'#46c8ff',700)});
   P('dsk',(x,W,H)=>{x.fillStyle='#0e2233';x.fillRect(0,0,W,H);for(let k=0;k<4;k++){x.fillStyle=k?'#46c8ff':'#ffd34d';x.fillRect(16,14+k*20,(k?120:200)-k*14,10)}});
   P('target',(x,W,H)=>{x.clearRect(0,0,W,H);target(x,W/2,H/2,W/2-2)});
   P('mag',(x,W,H)=>{x.fillStyle='#d93a2f';x.fillRect(0,0,W,H);txt(x,'WHEELS',W/2,24,W-10,32,'#ffffff');x.fillStyle='#ffd34d';rr(x,14,70,W-28,46,14);x.fill();x.fillStyle='#16181c';x.beginPath();x.arc(36,118,12,0,Math.PI*2);x.arc(W-36,118,12,0,Math.PI*2);x.fill();txt(x,'WEEKLY',W/2,148,W-10,22,'#ffffff')});
   P('mag2',(x,W,H)=>{x.fillStyle='#1f4fa0';x.fillRect(0,0,W,H);txt(x,'TORQUE',W/2,24,W-10,32,'#ffd34d');x.fillStyle='#c8ccd2';x.beginPath();x.arc(W/2,94,38,0,Math.PI*2);x.fill();x.fillStyle='#1f4fa0';x.beginPath();x.arc(W/2,94,14,0,Math.PI*2);x.fill();txt(x,'TIPS',W/2,148,W-10,22,'#ffffff')});
   P('floor',(x,W,H)=>{x.clearRect(0,0,W,H);txt(x,'AMBULANCE ONLY',W/2,H/2+4,W-40,130,'#f2d21b')});
   P('exit',(x,W,H)=>{x.fillStyle='#2e9e5b';x.fillRect(0,0,W,H);txt(x,'EXIT ▶',W/2,H/2+3,W-30,64,'#ffffff')});
   P('cup',(x,W,H)=>{x.fillStyle='#ffffff';x.fillRect(0,0,W,H);txt(x,'WATER',W/2,H/2+3,W-30,56,'#2a8f86')})}
  // ---------- the live boards ----------
  function tickets(t){const a=Math.floor(t/8),b=Math.floor((t+3)/13),c=Math.floor((t+6)/19);return[['A',41+a,'DESK 1'],['B',17+b,'ROOM 2'],['C',5+c,'X-RAY']]}
  const pad=n=>String(n%1000).padStart(3,'0');
  function paintNow(x,W,H){const tk=tickets(HP.clk),blink=HP.clk-HP.tchg<2.5;x.fillStyle='#10161d';x.fillRect(0,0,W,H);x.strokeStyle='#3a4552';x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);
   x.fillStyle='#1f6f8b';x.fillRect(10,10,W-20,84);txt(x,'NOW SEEING',W/2,54,W-60,62,'#ffffff');
   tk.forEach((r,i)=>{const y=150+i*96,hi=i===HP.tlast&&blink;if(hi){x.fillStyle='rgba(255,211,77,.18)';x.fillRect(16,y-44,W-32,88)}font(x,74,800,"'JetBrains Mono',monospace");x.textAlign='left';x.fillStyle=hi?'#ffffff':'#ffd34d';x.fillText(`${r[0]}-${pad(r[1])}`,70,y);
    x.fillStyle='#46c8ff';x.fillText('▶',430,y);x.textAlign='right';x.fillStyle=hi?'#ffffff':'#3ee08f';x.fillText(r[2],W-60,y);x.textAlign='center'})}
  function paintDuty(x,W,H,cr){x.fillStyle='#f4f8f7';x.fillRect(0,0,W,H);x.fillStyle='#2e9e5b';x.fillRect(0,0,W,92);txt(x,'ON DUTY TODAY',W/2,48,W-60,64,'#ffffff');
   const IC={Doctor:['#1f6f8b','DR'],Nurse:['#2a8f86','RN'],Paramedic:['#2e9e5b','PM']};
   cr.forEach((c,i)=>{const y=134+i*88,ic=IC[c.t];x.fillStyle=i%2?'#e3eeec':'#ecf4f2';x.fillRect(14,y-40,W-28,82);x.fillStyle=ic[0];x.beginPath();x.arc(66,y,32,0,Math.PI*2);x.fill();txt(x,ic[1],66,y+2,50,30,'#ffffff');
    x.textAlign='left';if(c.n){fit(x,c.n,540,50,800);x.fillStyle='#16232b';x.fillText(c.n,118,y+2)}else{fit(x,'JOB OPEN · comment WORKSHOP',540,40,600);x.fillStyle='#8a96a0';x.fillText('JOB OPEN · comment WORKSHOP',118,y+2)}
    x.textAlign='right';font(x,36,700);x.fillStyle=ic[0];x.fillText(c.t.toUpperCase(),W-40,y+2);x.textAlign='center'})}
  function liveBoards(force){if(!force&&HP.clk-HP.vt<.5)return;HP.vt=HP.clk;HP.cr=crew();const tk=tickets(HP.clk);
   if(HP.tk&&tk.some((r,i)=>r[1]!==HP.tk[i][1])){HP.tchg=HP.clk;HP.tlast=tk.findIndex((r,i)=>r[1]!==HP.tk[i][1])}HP.tk=tk;
   const key=tk.map(r=>r[1]).join(',')+'|'+(HP.clk-HP.tchg<2.5)+'|'+HP.cr.map(c=>c.n).join(',');if(key===HP.v)return;HP.v=key;
   paint(HP.lx,LR.now,paintNow);paint(HP.lx,LR.duty,(x,W,H)=>paintDuty(x,W,H,HP.cr));HP.ltex.needsUpdate=true}
  // ---------- merged static geometry ----------
  const UB=new T.BoxGeometry(1,1,1);let PM=new T.Matrix4();
  const xf=(x,y,z,rx,ry,rz,sx,sy,sz)=>PM.clone().multiply(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,'YXZ')),new T.Vector3(sx||1,sy||sx||1,sz||sx||1)));
  const inM=(m,fn)=>{const o=PM;PM=o.clone().multiply(m);fn();PM=o};
  function mergeParts(list){let nv=0,ni=0;for(const q of list){nv+=q.g.attributes.position.count;ni+=q.g.index?q.g.index.count:q.g.attributes.position.count}
   const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),col=new Float32Array(nv*3),ind=new Uint32Array(ni),v=new T.Vector3(),nm=new T.Matrix3(),c=new T.Color();let vo=0,io=0;
   for(const q of list){const g=q.g,P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,r=q.r,S=q.S||AW;nm.getNormalMatrix(q.m);c.set(q.c==null?0xffffff:q.c);
    for(let i=0;i<P.count;i++){const o=vo+i;v.fromBufferAttribute(P,i).applyMatrix4(q.m);pos[o*3]=v.x;pos[o*3+1]=v.y;pos[o*3+2]=v.z;v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[o*3]=v.x;nor[o*3+1]=v.y;nor[o*3+2]=v.z;
     let u=U?U.getX(i):0,w=U?U.getY(i):0;if(r){u=(r[0]+1+u*(r[2]-2))/S;w=1-(r[1]+1+(1-w)*(r[3]-2))/S}uv[o*2]=u;uv[o*2+1]=w;col[o*3]=c.r;col[o*3+1]=c.g;col[o*3+2]=c.b}
    const I=g.index,n=I?I.count:P.count,flip=q.m.determinant()<0;for(let k=0;k<n;k+=3){const a=I?I.getX(k):k,b=I?I.getX(k+1):k+1,cc=I?I.getX(k+2):k+2;ind[io++]=vo+a;if(flip){ind[io++]=vo+cc;ind[io++]=vo+b}else{ind[io++]=vo+b;ind[io++]=vo+cc}}
    vo+=P.count;if(g!==UB)g.dispose()}
   const o=new T.BufferGeometry();o.setAttribute('position',new T.BufferAttribute(pos,3));o.setAttribute('normal',new T.BufferAttribute(nor,3));o.setAttribute('uv',new T.BufferAttribute(uv,2));o.setAttribute('color',new T.BufferAttribute(col,3));
   o.setIndex(new T.BufferAttribute(ind,1));o.computeBoundingSphere();return o}
  function buildHospital(){
   const RW=52,RD=22,RH=12,Z0=-RD/2+.25,XL=-RW/2+.25,XR=RW/2-.25; // inner faces: back wall z = -10.75, side walls x = +-25.75
   const R=room({w:RW,d:RD,h:RH,wall:0xcfe6df,wall2:0xbcd9d1,floor:0xc9d3d6,bg:0x0f2028,light:0xf6fbff,deco:false});HP.S=R.S;
   const VM=[],GM=[],GL=[],AT=[],LV=[],GW=[];
   const bx=(L,w,h,d,c,x,y,z,ry,rx,rz)=>L.push({g:UB,c,m:xf(x,y+h/2,z,rx,ry,rz,w,h,d)});
   const cyl=(L,rt,rb,h,n,c,x,y,z,rx,ry,rz)=>L.push({g:new T.CylinderGeometry(rt,rb,h,n),c,m:xf(x,y,z,rx,ry,rz)});
   const geo=(L,g,c,x,y,z,rx,ry,rz,sx,sy,sz)=>L.push({g,c,m:xf(x,y,z,rx,ry,rz,sx,sy,sz)});
   const ap=(k,w,h,x,y,z,ry,rx,rz)=>AT.push({g:new T.PlaneGeometry(w,h),r:RG[k],m:xf(x,y,z,rx,ry,rz)});
   const WH=0xf6f6f2,TEAL=0x1f6f8b,MINT=0x8fd0c4,DK=0x2a3038,STL=0xc8ccd2,YEL=0xf2d21b,RED=0xd93a2f,GRN=0x2e9e5b,DUM=0xf2c230;
   // ---- walls: skirting, a white hand rail, a teal band at the top; the floor zones and the wayfinding lines ----
   const wallRun=(len,place)=>{place(len,.35,.12,0x7aa9a0,0,0,0);place(len,.14,.18,WH,0,1.9,.04);place(len,.5,.08,TEAL,0,RH-1.4,0)};
   wallRun(RW,(w,h,d,c,s,y,o)=>bx(VM,w,h,d,c,s,y,Z0+d/2+o));for(const sx of[-1,1])wallRun(RD,(w,h,d,c,s,y,o)=>bx(VM,d,h,w,c,sx*(XR-d/2-o),y,s));
   bx(VM,15.6,.03,23,0x3b4048,-17.9,0,.8);for(const s of[-1,1])bx(VM,.25,.04,23,YEL,-17.9+s*7.6,0,.8);
   for(let k=0;k<9;k++)bx(VM,.35,.045,3.2,YEL,-23.4+k*1.4,0,-8.9,.7); // hatching in front of the bay door
   bx(VM,15.2,.035,6.6,0xd9e7e4,17.9,0,-7.6); // the ward floor
   const line=(c,pts,y)=>{for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]],len=Math.hypot(b[0]-a[0],b[1]-a[1]);bx(VM,.28,y,len+.28,c,(a[0]+b[0])/2,0,(a[1]+b[1])/2,Math.atan2(b[0]-a[0],b[1]-a[1]))}};
   line(GRN,[[4.2,13],[4.2,-2],[11,-2],[11,-4.6]],.05);line(0x2f6fd9,[[3.6,13],[3.6,-1.6],[1.2,-1.6]],.055);line(RED,[[3,13],[3,8.6],[-9.4,8.6]],.06);
   // ---- title over the boards ----
   ap('title',9.6,1.2,0,10.45,Z0+.06,0);
   // ---- AMBULANCE BAY: the open roller door with the street outside, hazard posts, the clearance and speed signs ----
   {const dx=-18.3,dw=11.4,dh=7.4;ap('street',dw,dh,dx,dh/2,Z0+.04,0);
    for(const s of[-1,1]){bx(VM,.7,dh+.4,.6,DK,dx+s*(dw/2+.35),0,Z0+.3);for(let k=0;k<5;k++)bx(VM,.74,.5,.64,k%2?YEL:DK,dx+s*(dw/2+.35),.3+k*1.1,Z0+.3)}
    bx(VM,dw+1.4,.9,1.2,0xaeb8bc,dx,dh,Z0+.6);bx(VM,dw+1.4,.12,1.24,0x8a969c,dx,dh+.3,Z0+.6); // the rolled-up shutter box
    ap('bay',7.2,1.12,dx,9.25,Z0+.06,0);ap('clear',3.4,.85,dx,dh-.5,Z0+1.22,0);
    ap('floor',7,1.3,dx,.06,-6.4,0,-Math.PI/2);
    {const sx=-11.4,sz=-7.2;bx(VM,.12,1.6,.12,DK,sx,0,sz);bx(VM,1.9,.95,.08,WH,sx,1.6,sz);ap('speed',1.8,.9,sx,2.075,sz+.05,0)}
    // bollards between the bay and the waiting area
    for(const z of[3,6.2,9.4]){cyl(VM,.22,.22,1.3,12,YEL,-10.2,.65,z);cyl(VM,.23,.23,.18,12,DK,-10.2,1.0,z)}}
   // ---- THE AMBULANCE (unbranded, merged): box body, cab, wheels, livery panels, light bar ----
   HP.beac=[];
   inM(xf(-18.3,0,-2.6,0,.42,0),()=>{const W=3,BL=5.4,Bz=-1.5,CZ=1.2;
    bx(VM,W,3.4,BL,WH,0,.62,Bz);bx(VM,W*1.01,.16,BL*1.005,0xe6e6e0,0,3.92,Bz); // the box
    bx(VM,W*.97,2.25,1.6,WH,0,.62,CZ+.8);bx(VM,W*.97,1.13,1.65,WH,0,.62,CZ+2.4); // cab and bonnet
    {const a=1.045,ny=.5,nz=.862,cz=CZ+1.925,cy=2.31;VM.push({g:UB,c:WH,m:xf(0,cy-ny*.3,cz-nz*.3,a,0,0,W*.97,.6,1.3)});VM.push({g:UB,c:0x24323f,m:xf(0,cy+ny*.02,cz+nz*.02,a,0,0,W*.86,.04,1.05)})} // the sloped windscreen
    bx(VM,W*1.02,.42,.3,DK,0,.42,CZ+3.27);bx(VM,W*1.02,.42,.3,DK,0,.42,Bz-BL/2-.1);bx(VM,W*1.02,.28,BL+3.6,0x9aa3ae,0,.38,.3); // bumpers and sills
    for(const s of[-1,1]){VM.push({g:UB,c:0x24323f,m:xf(s*W*.487,2.3,CZ+.85,0,0,0,.04,.85,1.2)});
     for(const z of[CZ+2.4,Bz-BL/2+1.1]){cyl(VM,.62,.62,.46,18,0x1b1d22,s*(W/2-.15),.62,z,0,0,Math.PI/2);cyl(VM,.32,.32,.48,12,STL,s*(W/2-.13),.62,z,0,0,Math.PI/2)}
     bx(VM,.28,.24,.1,0x30353d,s*(W/2+.12),2.3,CZ+1.7); // mirrors
     ap('side',BL,3.4,s*(W/2+.012),2.32,Bz,s*Math.PI/2)}
    ap('rear',W,3.4,0,2.32,Bz-BL/2-.012,Math.PI);ap('front',W*.96,.9,0,3.4,Bz+BL/2+.012,0);
    for(const s of[-1,1]){GW.push({g:UB,c:0xfff6d0,m:xf(s*1.05,1.25,CZ+3.24,0,0,0,.6,.28,.06)});GW.push({g:UB,c:0xff5a4a,m:xf(s*1.2,1.0,Bz-BL/2-.04,0,0,0,.3,.5,.06)})}
    bx(VM,W*.8,.12,.5,DK,0,2.87,CZ+1.6);HP.beac=[0,1].map(s=>{const m=new T.Mesh(UB,new T.MeshBasicMaterial({color:s?0x2f6fd9:0xff3b30}));m.applyMatrix4(xf((s?1:-1)*.6,3.12,CZ+1.6,0,0,0,1.05,.26,.42));return m})});
   HP.beac.forEach(m=>R.add(m));
   // the stretcher by the ambulance, folded blanket and pillow
   {const sx=-13.6,sz=-4.6;bx(GM,.9*1.4,.08,3.1,STL,sx,1.25,sz);for(const a of[-1,1])for(const b of[-1,1]){bx(GM,.07,1.2,.07,STL,sx+a*.55,.05,sz+b*1.35);cyl(VM,.12,.12,.1,8,DK,sx+a*.55,.1,sz+b*1.35,0,0,Math.PI/2)}
    bx(VM,1.2,.18,2.9,0xeaf2f0,sx,1.33,sz);bx(VM,1.22,.22,1.3,0xd3613a,sx,1.5,sz+.4);bx(VM,.9,.2,.55,WH,sx,1.5,sz-1.05);bx(GM,1.2,.06,.06,STL,sx,1.95,sz+1.5)}
   // ---- RECEPTION: the desk, its sign, the screens, the bell; staff side with a chair and a filing cabinet ----
   {const dz=-3.6;bx(VM,10,1.45,1,WH,0,0,dz);bx(VM,10.04,.5,1.04,TEAL,0,.2,dz);bx(VM,10.3,.1,1.5,0xe0ecea,0,1.45,dz-.15);bx(VM,10.3,.5,.45,WH,0,1.55,dz+.3);bx(VM,10.4,.08,.6,0xd8e6e3,0,2.05,dz+.3);
    for(const s of[-1,1]){bx(VM,1,1.45,2.6,WH,s*5.5,0,dz-1.3);bx(VM,1.2,.1,2.8,0xe0ecea,s*5.5,1.45,dz-1.3)}
    for(const x of[-2.4,1.8]){bx(VM,1.3,.85,.08,DK,x,1.95,dz-.2,0,0,0);bx(VM,.14,.4,.14,DK,x,1.55,dz-.15);AT.push({g:new T.PlaneGeometry(1.2,.75),r:RG.dsk,m:xf(x,2.375,dz-.25,0,Math.PI,0)})}
    geo(GM,new T.SphereGeometry(.16,12,6,0,Math.PI*2,0,Math.PI/2),0xe8c45a,3.6,2.13,dz+.3);cyl(VM,.15,.12,.5,10,0x7ab8d9,-4.2,2.33,dz+.3);for(let k=0;k<4;k++)geo(VM,new T.SphereGeometry(.13,8,6),[0xff7a1a,0xffd34d,0xd93a2f,0xf06292][k],-4.2+Math.cos(k*1.6)*.12,2.68,dz+.3+Math.sin(k*1.6)*.12);
    bx(VM,.9,.12,.9,DK,-1.2,1.0,dz-2.6);bx(VM,.9,1,.12,DK,-1.2,1.0,dz-3.05);cyl(VM,.07,.07,.95,8,DK,-1.2,.5,dz-2.6);
    bx(VM,1.4,2.6,1,0xaeb8bc,3.6,0,Z0+.55);for(let k=0;k<4;k++)bx(VM,1.2,.04,.04,DK,3.6,.5+k*.62,Z0+1.06);
    // the hanging sign
    ap('recep',7,1.1,0,5.75,dz+.1,0);for(const s of[-1,1])bx(GM,.04,5.6,.04,STL,s*3.1,6.3,dz+.1);bx(VM,7.2,1.25,.08,WH,0,5.13,dz+.05)}
   // ---- the ticket machine, the water cooler, plants ----
   {const tx=-8.6,tz=-1.4;bx(VM,.9,2.5,.7,RED,tx,0,tz);ap('ticket',.86,.86,tx,2.0,tz+.36,0);bx(VM,.5,.08,.2,WH,tx,1.4,tz+.4)}
   {const wx=-9.6,wz=Z0+.8;bx(VM,.9,1.8,.9,WH,wx,0,wz);GL.push({g:new T.CylinderGeometry(.36,.36,.95,14),c:0x9fd0ff,m:xf(wx,2.28,wz)});ap('cup',.8,.3,wx,1.4,wz+.46,0)}
   const plant=(x,z,s)=>{cyl(VM,.55*s,.42*s,.9*s,12,0xe9eef0,x,.45*s,z);for(let k=0;k<5;k++)geo(VM,new T.IcosahedronGeometry(.55*s,0),0x3f8f45,x+Math.cos(k*1.26)*.35*s,(1.3+(k%3)*.4)*s,z+Math.sin(k*1.26)*.35*s,rnd(),rnd(),0,1,1.3,1)};
   plant(-5.6,Z0+.9,1.1);plant(9.4,6.6,1.1);plant(-9.2,11,1);
   // ---- the boards on the back wall: ON DUTY, NOW SEEING (live canvas), the first-aid course corkboard, wash your hands ----
   const frame=(L,c,cx,cy,w,h,t)=>{for(const[a,b,x,y]of[[w+t*2,t,cx,cy-h/2-t],[w+t*2,t,cx,cy+h/2],[t,h,cx-w/2-t/2,cy-h/2],[t,h,cx+w/2+t/2,cy-h/2]])bx(L,a,b,.22,c,x,y,Z0+.12)};
   LV.push({g:new T.PlaneGeometry(7.2,3.15),r:LR.now,S:LW,m:xf(0,8,Z0+.16,0,0,0)});frame(VM,0x30353d,0,8,7.2,3.15,.24);
   LV.push({g:new T.PlaneGeometry(6.2,3.49),r:LR.duty,S:LW,m:xf(-8.05,6.6,Z0+.1,0,0,0)});frame(VM,GRN,-8.05,6.6,6.2,3.49,.18);
   ap('aid',3.1,4.26,6.3,5.8,Z0+.1,0);ap('hand',1.9,1.66,8.95,3.6,Z0+.08,0);
   {const sx=8.95;bx(VM,1.4,.35,.8,WH,sx,1.45,Z0+.45);bx(VM,.3,1.45,.3,WH,sx,0,Z0+.3);cyl(GM,.04,.04,.4,8,STL,sx,1.95,Z0+.25)}
   // exit sign over the front of the left wall
   ap('exit',1.7,.64,XL+.05,8.4,9,Math.PI/2);
   // ---- the waiting area: two rows of beam seats facing the boards, a magazine table, a teddy on a seat ----
   const SEAT=[0x2a8f86,0x2a8f86,0x2a8f86,0xff7a1a,0x2a8f86,0x2a8f86,0x2a8f86];
   for(const rz of[1.8,5])for(let k=0;k<7;k++){const x=-7.4+k*1.12;bx(VM,1,.14,.95,SEAT[(k+(rz>3?2:0))%7],x,.95,rz);bx(VM,1,.95,.12,SEAT[(k+(rz>3?2:0))%7],x,1.12,rz+.48,0,-.12);if(k%3===0)for(const s of[-1,1])bx(VM,.08,.95,.08,DK,x-.45,0,rz+s*.32)}
   for(const rz of[1.8,5])bx(GM,7.9,.1,.1,STL,-4.04,.8,rz);
   {const tx=.6,tz=3.4;bx(VM,1.8,.85,1.8,0xb07a45,tx,0,tz);AT.push({g:new T.PlaneGeometry(.55,.69),r:RG.mag,m:xf(tx-.35,.87,tz-.2,-Math.PI/2,0,.2)});AT.push({g:new T.PlaneGeometry(.55,.69),r:RG.mag2,m:xf(tx+.38,.875,tz+.25,-Math.PI/2,0,-.3)})}
   {const bx0=-4.04,bz=1.8;const BR=0x9a6a3a;geo(VM,new T.SphereGeometry(.34,12,10),BR,bx0,1.42,bz);geo(VM,new T.SphereGeometry(.24,12,10),BR,bx0,1.92,bz);for(const s of[-1,1])geo(VM,new T.SphereGeometry(.09,8,6),BR,bx0+s*.17,2.1,bz);
    cyl(VM,.26,.26,.12,12,RED,bx0,2.06,bz);geo(VM,new T.SphereGeometry(.04,6,4),DK,bx0-.08,1.95,bz-.22);geo(VM,new T.SphereGeometry(.04,6,4),DK,bx0+.08,1.95,bz-.22)}
   // ---- WARD A: three beds, curtains on rails, bedside cabinets, an IV stand and a monitor, two crash-test dummies ----
   const BX=[13.2,18.4,23.4],BZ=-8.2;
   ap('ward',6.4,1,18.4,7.05,-5.1,0);for(const s of[-1,1])bx(GM,.04,4.4,.04,STL,18.4+s*2.9,7.6,-5.1);
   ap('dummy',3.4,4.68,18.4,9.2,Z0+.06,0);frame(VM,TEAL,18.4,9.2,3.4,4.68,.16);
   const bed=(x,blk,up)=>{bx(GM,2.3,.12,4.4,STL,x,.95,BZ);for(const a of[-1,1])for(const b of[-1,1])bx(GM,.1,.95,.1,STL,x+a*1.05,0,BZ+b*2.05);
    bx(VM,2.4,1.9,.14,WH,x,.7,BZ-2.25);bx(VM,2.4,1.1,.12,WH,x,.7,BZ+2.2);bx(VM,2.2,.3,4.2,0xeef3f2,x,1.07,BZ);
    if(up){bx(VM,2.15,.3,1.6,0xeef3f2,x,1.6,BZ-1.75,0,-.75)}bx(VM,1.4,.26,.75,WH,x,up?2.35:1.37,BZ-1.7+(up?.25:0),0,up?-.75:0);bx(VM,2.26,.18,2.9,blk,x,1.37,BZ+.6);bx(VM,2.28,.1,.5,WH,x,1.48,BZ-.75)};
   bed(BX[0],0x8fc0e6,false);bed(BX[1],0xf3b38a,true);bed(BX[2],0xb7dbb0,false);
   for(const[i,x]of BX.entries()){const cx=x+1.75;bx(VM,.95,1.45,.95,0xe8eef0,cx,0,BZ-1.3);bx(VM,.97,.08,.97,0xd0dadd,cx,1.45,BZ-1.3);if(i<2)cyl(VM,.12,.1,.4,10,0x7ab8d9,cx,1.73,BZ-1.3)}
   for(let k=0;k<3;k++)geo(VM,new T.SphereGeometry(.12,8,6),[0xffd34d,0xf06292,0xff7a1a][k],BX[0]+1.75+(k-1)*.09,2.02,BZ-1.3+(k%2)*.08);
   // balloons by bed 2 (sitting dummy)
   for(const[k,c]of[[0,0xff7a1a],[1,0x46c8ff]].values()){const bxp=BX[1]+1.6+k*.38,by=4.3+k*.35;geo(VM,new T.SphereGeometry(.38,14,10),c,bxp,by,BZ-1.3,0,0,0,1,1.18,1);bx(VM,.02,by-1.55,.02,0x666666,bxp,1.5,BZ-1.3)}
   // curtain rails and curtains: side curtains drawn, the front ones bunched at the posts, bed 3 half closed
   const RY=6.4;for(const x of[10.6,15.8,21])bx(GM,.08,.08,5.9,STL,x,RY,-7.85);bx(GM,15.2,.08,.08,STL,18.15,RY,-4.9);for(const x of[10.6,15.8,21])bx(GM,.05,RH-RY,.05,STL,x,RY,-4.9);
   const curtain=(x0,z0,x1,z1,folds,c)=>{const n=folds*2,len=Math.hypot(x1-x0,z1-z0),a=Math.atan2(x1-x0,z1-z0);for(let i=0;i<n;i++){const u=(i+.5)/n,px=x0+(x1-x0)*u,pz=z0+(z1-z0)*u,tw=(i%2?.38:-.38);
     L_c(px,pz,len/n*1.08,a+tw,i%2?c:shade(c))}};
   const shade=c=>{const t=new T.Color(c).multiplyScalar(.88);return t.getHex()};
   const L_c=(px,pz,w,a,c)=>bx(VM,.06,RY-.7,w,c,px,.6,pz,a);
   const CU=0x86c9bd;curtain(10.6,-10.5,10.6,-5.2,6,CU);curtain(15.8,-10.5,15.8,-5.2,6,CU);curtain(21,-10.5,21,-5.2,6,CU);
   for(const x of[10.6,15.8])curtain(x+.1,-4.9,x+.9,-4.9,2,CU);curtain(21.1,-4.9,23.2,-4.9,4,CU);curtain(24.9,-4.9,25.6,-4.9,2,CU);
   // IV stand and monitor by bed 1
   {const ix=BX[0]-1.65,iz=BZ-1.4;cyl(GM,.04,.04,4.2,8,STL,ix,2.1,iz);for(let k=0;k<4;k++)bx(GM,.6,.04,.06,STL,ix,.05,iz,k*Math.PI/4);bx(GM,.8,.04,.04,STL,ix,4.15,iz);
    bx(VM,.32,.5,.14,0xd8eefc,ix+.32,3.55,iz);bx(VM,.02,1.3,.02,0x9fd0ff,ix+.32,2.3,iz);
    bx(VM,1.1,.75,.25,DK,ix,2.7,iz+.2);AT.push({g:new T.PlaneGeometry(.98,.62),r:RG.screen,m:xf(ix,3.075,iz+.33,0,0,0)})}
   // dummy 1: lying down, head bandage, leg in a cast on the traction frame
   const dummy=(x,lying)=>{const hz=lying?BZ-1.7:BZ-1.35,hy=lying?1.88:2.75;geo(VM,new T.SphereGeometry(.42,18,14),DUM,x,hy,hz);geo(VM,new T.TorusGeometry(.42,.07,6,20),WH,x,hy+.1,hz,lying?0:Math.PI/2-.2,0,0,1,1,1);
    for(const s of[-1,1])AT.push({g:new T.PlaneGeometry(.28,.28),r:RG.target,m:xf(x+s*.425,hy,hz,0,s*Math.PI/2,0)});
    for(const s of[-1,1]){geo(VM,new T.SphereGeometry(.06,8,6),0x16181c,x+s*.15,hy+(lying?.42:.06),hz+(lying?.06:.4))}
    if(lying){geo(VM,new T.CapsuleGeometry(.16,.9,4,8),DUM,x-.75,1.62,BZ-.4,Math.PI/2,0,0);
     // the cast on the left leg, lifted on a sling
     geo(VM,new T.CapsuleGeometry(.24,1.5,4,10),WH,x+.45,2.2,BZ+1.65,Math.PI/2-.45,0,0);bx(GM,.06,3.6,.06,STL,x-1.05,.95,BZ+2.15);bx(GM,.06,3.6,.06,STL,x+1.05,.95,BZ+2.15);bx(GM,2.2,.06,.06,STL,x,4.5,BZ+2.15);
     bx(VM,.03,1.65,.03,0xd8d0c0,x+.45,2.85,BZ+2.15);bx(VM,.6,.16,.6,0x5a6472,x+.45,2.72,BZ+2.15)}
    else{geo(VM,new T.CapsuleGeometry(.16,.7,4,8),DUM,x-.62,2.0,BZ-.5,Math.PI/2-.6,0,.2);geo(VM,new T.CapsuleGeometry(.2,.7,4,8),WH,x+.62,2.05,BZ-.45,Math.PI/2-.4,0,-.2);
     bx(VM,.3,.06,.9,WH,x+.38,2.4,BZ-.85,0,0,.9); // the sling
     bx(VM,.62,.02,.78,WH,x,2.3,BZ-.1,0,-.9,0);AT.push({g:new T.PlaneGeometry(.55,.69),r:RG.mag,m:xf(x,2.32,BZ-.12,-Math.PI/2+.9,Math.PI,0)})}};
   dummy(BX[0],true);dummy(BX[1],false);
   // ---- build the meshes ----
   const cv=document.createElement('canvas');cv.width=cv.height=AW;const cx=cv.getContext('2d');paintStatic(cx);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;
   const lv=document.createElement('canvas');lv.width=lv.height=LW;HP.lx=lv.getContext('2d');HP.ltex=new T.CanvasTexture(lv);HP.ltex.colorSpace=T.SRGBColorSpace;HP.ltex.anisotropy=8;HP.tchg=-9;HP.tlast=-1;liveBoards(true);
   const add=(L,m,cast)=>{if(!L.length)return;const o=new T.Mesh(mergeParts(L),m);o.castShadow=cast;o.receiveShadow=true;R.add(o);return o};
   add(VM,new T.MeshStandardMaterial({vertexColors:true,roughness:.62,metalness:0}),true);
   add(GM,new T.MeshStandardMaterial({vertexColors:true,roughness:.3,metalness:.55}),true);
   add(AT,new T.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.38,roughness:.8,side:T.DoubleSide,transparent:true,alphaTest:.5}),false);
   add(LV,new T.MeshStandardMaterial({map:HP.ltex,emissive:0xffffff,emissiveMap:HP.ltex,emissiveIntensity:.6,roughness:.7}),false);
   add(GW,new T.MeshBasicMaterial({vertexColors:true}),false);
   const gl=add(GL,new T.MeshStandardMaterial({vertexColors:true,transparent:true,opacity:.55,roughness:.08,metalness:.3,depthWrite:false}),false);if(gl)gl.renderOrder=2;
   // ---- the people: staff (names from the job board) and three visitors from the WALL ----
   const S=HP.S;HP.cr=crew();
   HP.doc=[mkP(S,'#f4f4f0',230),mkP(S,'#f4f4f0',231)];HP.nurse=mkP(S,'#3fa7c4',232);HP.para=[mkP(S,'#2e7d4f',233),mkP(S,'#2e7d4f',234)];
   HP.vis=[0,1,2].map(i=>mkP(S,null,235+i,'civ'));
   HP.built=true;syncHospital(0)}
  function syncHospital(dt){HP.clk+=dt||0;liveBoards();const t=simTime;
   // staff
   putP(HP.nurse,{x:-1.2,z:-5.2,ang:Math.sin(t*.45)*.45},false);
   putP(HP.doc[0],{x:BXd(),z:-5.6,ang:Math.PI*.85+Math.sin(t*.6)*.25},false);
   loopP(HP.doc[1],[[2.6,-1.6],[8,-2.2],[17,-4.1],[22.4,-4.1]],30,.1,.22);
   putP(HP.para[0],{x:-12.4,z:-3,ang:-Math.PI/2+Math.sin(t*.5)*.4},false);
   loopP(HP.para[1],[[-14.5,.8],[-9.6,1.4],[-6.2,-1.9]],18,.4,.28);
   // visitors: one at the desk, one waiting by the seats, one coming in to take a number and sit down
   putP(HP.vis[0],{x:1.9,z:-1.9,ang:Math.PI+Math.sin(t*.4)*.2},false);
   putP(HP.vis[1],{x:-6.2,z:3.3,ang:Math.PI+Math.sin(t*.3+1)*.5},false);
   loopP(HP.vis[2],[[2.4,12],[-6.2,6],[-8.6,-.4],[-1.6,3.3]],26,.6,.25);
   // the light bar: slow alternate flash
   const ph=(HP.clk*1.6)%1;if(HP.beac.length){HP.beac[0].material.color.setHex(ph<.5?0xff3b30:0x5a1410);HP.beac[1].material.color.setHex(ph<.5?0x10204a:0x2f6fd9)}}
  const BXd=()=>11.9;
  function labelsHospital(){const cr=HP.cr||crew(),sz=clamp(1000/cam.dist,13,22);
   const st=(m,c,y)=>{if(!m||!m.visible)return;tag(m.position.x,y||4.3,m.position.z,c.n?`★ ${c.n} · ${c.t.toUpperCase()}`:`${c.t.toUpperCase()} · JOB OPEN`,c.n?'rgba(46,139,87,.95)':'rgba(16,19,24,.8)',c.n?'#fff':'#9aa3ae')};
   st(HP.doc[0],cr[0]);st(HP.doc[1],cr[1]);st(HP.nurse,cr[2],4.5);st(HP.para[0],cr[3]);st(HP.para[1],cr[4],4.7);
   const vs=visitors(cr);HP.vis.forEach((m,i)=>{const n=vs[i];m.visible=!!n;if(n)tag(m.position.x,3.75+(i===0?.5:0),m.position.z,`★ ${n} · VISITING`,'rgba(16,19,24,.85)','#ffd34d')});
   {const p=toHud(-18.3,6.4,-2.6);if(p)pill('AMBULANCE · READY',p.x,p.y,sz,'rgba(217,58,47,.95)','#ffffff')}
   if(!isOpen('w_hosp')){const p=toHud(0,.2,9);if(p)pill(`BLUEPRINT PREVIEW · OPENS AT ${MS.w_hosp.n.toLocaleString('en-US')} SUBS`,p.x,p.y,sz*1.1,'rgba(15,47,92,.94)','#c8defa','#9fd0ff')}header('INSIDE THE HOSPITAL')}
  INTS.hosp={get scene(){return HP.S},build:buildHospital,isBuilt:()=>HP.built,sync:syncHospital,labels:labelsHospital,get home(){return HP.home}};
 }
