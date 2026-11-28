//@ interiors/reboques.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- 3D interior: 24h towing depot ----------
 const TW={scene:new T.Scene(),built:false,bays:[],home:{tx:0,tz:-1,yaw:-.3,pitch:.38,dist:44}};
 function buildTow(){
  const S=TW.scene;S.background=new T.Color(0x0d1420);S.fog=new T.Fog(0x0d1420,70,140);
  S.add(new T.HemisphereLight(0xfff0d8,0x262b33,.7));
  const key=new T.DirectionalLight(0xffeedd,1.5);key.position.set(16,26,20);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-30,right:30,top:18,bottom:-18,near:2,far:80});key.shadow.bias=-.0006;S.add(key);
  const RW=52,RD=22,RH=9,X0=-RW/2,Z0=-RD/2;const add=o=>{S.add(o);return o};const B2=(w,h,d,m,x,y,z,c)=>add(box(w,h,d,m,x,y,z,c));
  const fl=new T.Mesh(new T.PlaneGeometry(RW,RD+8),M(0x7c7f84,{roughness:.7}));fl.rotation.x=-Math.PI/2;fl.position.set(0,0,4);fl.receiveShadow=true;add(fl);
  const wallM=M(0x3a3f47,{roughness:.9});B2(RW,RH,.5,wallM,0,0,Z0,true);B2(.5,RH,RD,M(0x30353c),X0,0,0,true);B2(.5,RH,RD,M(0x30353c),-X0,0,0,true);
  // hazard stripe along the back wall
  for(let x=X0+1;x<-X0;x+=2)B2(1,.6,.1,(Math.round(x)%4===0)?mat.yellow:mat.black,x,0,Z0+.3,false);
  add(sign('24H TOWING · MOTOROPOLIS',20,1.9,'#f2a51a','#1d0f02',-4,RH-2.4,Z0+.4,0));
  const beacon=M(0xffb000,{emissive:0xffb000,emissiveIntensity:2});TW.beacon=beacon;
  for(let k=0;k<3;k++){const x=-16+k*11;
   // roll-up door behind each bay
   B2(8,6.2,.2,M(0x51575f),x,0,Z0+.4,false);for(let r=0;r<12;r++)B2(8,.06,.25,M(0x6b727b),x,.4+r*.5,Z0+.45,false);
   B2(.4,.4,.4,beacon,x+4.6,6.6,Z0+.6,false);
   for(const dx of[-3.4,3.4])B2(.18,.03,11,mat.yellow,x+dx,0,-3,false);
   B2(7,.03,.18,mat.yellow,x,0,2.5,false);
   const bay={x,truck:new T.Group(),id:null};bay.truck.position.set(x,0,-3.5);add(bay.truck);TW.bays.push(bay)}
  // dispatch corner (right)
  const dx=20;B2(6,1.3,2.4,M(0x2b5c8f),dx,0,4);B2(6.2,.15,2.6,M(0xc08a4a),dx,1.3,4);
  B2(.9,.5,.6,mat.dark,dx-1.8,1.45,3.8);B2(.3,1.2,.1,mat.steel,dx-1.5,1.95,3.6,false);
  const chair=G2();function G2(){return new T.Group()}chair.add(box(1,.15,1,mat.dark,0,.9,0));chair.add(box(1,1.1,.15,mat.dark,0,1,.5));chair.position.set(dx,0,5.6);add(chair);
  const disp=upgP(personMesh('#f2a51a','#d9a27e','#2b1d14'),'Dispatcher');disp.scale.setScalar(1.5);disp.position.set(dx,.3,5.3);disp.rotation.y=Math.PI;add(disp);TW.disp=disp;
  // live dispatch board + city map on the wall
  TW.boardC=document.createElement('canvas');TW.boardC.width=1024;TW.boardC.height=640;TW.boardT=new T.CanvasTexture(TW.boardC);TW.boardT.colorSpace=T.SRGBColorSpace;
  const bm=new T.Mesh(new T.PlaneGeometry(10,6.25),new T.MeshStandardMaterial({map:TW.boardT,emissiveMap:TW.boardT,emissive:0xffffff,emissiveIntensity:.35}));bm.position.set(dx+.5,4.6,Z0+.45);add(bm);B2(10.4,6.65,.2,mat.dark,dx+.5,1.27,Z0+.3,false);
  const mapT=new T.CanvasTexture(bg);mapT.colorSpace=T.SRGBColorSpace;const mm=new T.Mesh(new T.PlaneGeometry(9,5.06),new T.MeshStandardMaterial({map:mapT,roughness:.8}));mm.rotation.y=-Math.PI/2;mm.position.set(-X0-.3,4.4,-3);add(mm);B2(.15,5.4,9.4,mat.dark,-X0-.2,1.7,-3,false);
  TW.mapPins=new T.Group();add(TW.mapPins);
  // gear: chains, wheel dollies, cones
  for(let k=0;k<6;k++){const cn=new T.Mesh(new T.ConeGeometry(.35,.9,12),mat.orange);cn.position.set(-24+k*.9,.45,8.5);cn.castShadow=true;add(cn)}
  for(let k=0;k<3;k++){B2(1.4,.2,1,mat.yellow,-23.5,0,2+k*1.4);for(const dz of[-.35,.35]){const w=new T.Mesh(new T.CylinderGeometry(.18,.18,.2,10),mat.tire);w.rotation.z=Math.PI/2;w.position.set(-23.5+.6,.18,2+k*1.4+dz);add(w)}}
  for(let k=0;k<4;k++){const ch=new T.Mesh(new T.TorusGeometry(.35,.08,8,16),mat.steel);ch.position.set(-25.6,3+k*.5,-6+k*.2);ch.rotation.y=Math.PI/2;add(ch)}
  TW.built=true;TW.t=0}
 function drawBoard(){const c=TW.boardC.getContext('2d');c.fillStyle='#071a2d';c.fillRect(0,0,1024,640);c.strokeStyle='#46c8ff';c.lineWidth=6;c.strokeRect(8,8,1008,624);
  c.fillStyle='#f2a51a';c.font="800 60px 'Barlow Condensed','Arial Narrow',sans-serif";c.textAlign='left';c.textBaseline='middle';c.fillText('DISPATCH · LIVE',40,64);
  const ready=tows.filter(t=>t.idle&&!t.hidden).length,out=tows.filter(t=>!t.idle&&!t.hidden).length,broken=cars.filter(q=>q.state==='broken'||q.state==='towed');
  c.font="700 40px 'Barlow Condensed',sans-serif";c.fillStyle='#5cc98a';c.fillText(`READY: ${ready}`,40,140);c.fillStyle='#ffb36b';c.fillText(`ON A CALL: ${out}`,300,140);c.fillStyle='#ff5a4f';c.fillText(`BROKEN DOWN: ${broken.length}`,600,140);
  c.fillStyle='#9aa3ae';c.font="700 30px 'JetBrains Mono',monospace";c.fillText(`TOWS TODAY: ${stats.tows}`,40,200);
  c.fillStyle='#eef0f2';c.font="600 34px 'Barlow',sans-serif";
  broken.slice(0,7).forEach((q,i)=>{const st=q.state==='towed'?'ON THE HOOK':q.towAssigned?'TRUCK ON THE WAY':'WAITING';c.fillStyle=q.state==='towed'?'#5cc98a':q.towAssigned?'#ffb36b':'#ff5a4f';c.fillText('●',40,260+i*50);c.fillStyle='#eef0f2';c.fillText(`${q.plate}  ${q.driver?'★ '+q.driver+'  ':''}${(q.fault?q.fault.n:'').toUpperCase()}`,80,260+i*50);c.textAlign='right';c.fillStyle='#9aa3ae';c.fillText(st,980,260+i*50);c.textAlign='left'});
  if(!broken.length){c.fillStyle='#5cc98a';c.fillText('All quiet in Motoropolis. No breakdowns right now.',40,280)}
  TW.boardT.needsUpdate=true}
 function syncTow(dt){TW.t-=dt;if(TW.t<=0){TW.t=.5;drawBoard()}
  TW.beacon.emissiveIntensity=tows.some(t=>!t.idle&&!t.hidden)?(Math.sin(simTime*10)>0?3:.2):.4;
  TW.disp.rotation.y=Math.PI+Math.sin(simTime*.8)*.3;
  B.reboques.slots.forEach((s,k)=>{const bay=TW.bays[k];const t=tows.find(q=>q.home===s);const inBay=t&&t.idle&&!t.hidden;const id=inBay?t.id:null;
   if(id!==bay.id){bay.id=id;while(bay.truck.children.length)bay.truck.remove(bay.truck.children[0]);if(inBay){const m=carMesh(t,{hd:1});m.scale.setScalar(1.5);m.rotation.y=Math.PI;bay.truck.add(m)}}});
  // pins on the wall map for broken-down cars
  while(TW.mapPins.children.length)TW.mapPins.remove(TW.mapPins.children[0]);
  for(const q of cars){if(q.state!=='broken'&&q.state!=='towed')continue;const pin=new T.Mesh(new T.SphereGeometry(.14,8,6),q.state==='towed'?mat.tlG:mat.tlR);pin.position.set(25.6,4.4+2.53-q.y/CH*5.06,-3-4.5+q.x/1920*9);TW.mapPins.add(pin)}}
 function drawTowLabels(){hctx.textAlign='center';hctx.textBaseline='middle';const sz=clamp(1100/cam.dist,14,26);
  B.reboques.slots.forEach((s,k)=>{const bay=TW.bays[k];const t=tows.find(q=>q.home===s);if(!t||t.hidden)return;const p=toHud(bay.x,bay.id?4.2:1.4,-3.5);if(!p)return;
   if(bay.id)pill(`TRUCK ${t.plate} · READY`,p.x,p.y,sz,'rgba(16,19,24,.85)','#5cc98a');
   else{const tk=t.task;const txt=tk&&tk.type==='tow'?`OUT ON A CALL → ${tk.target.plate}`:tk&&tk.type==='deliver'?'TOWING TO THE REPAIR SHOP':'ON THE WAY BACK';pill(txt,p.x,p.y,sz,'rgba(242,165,26,.95)','#1d0f02')}});
  if(!isOpen('reboques')){const p=toHud(0,3,0);if(p)pill('THE TOW DEPOT OPENS AT 10 SUBS',p.x,p.y,sz,'rgba(15,47,92,.92)','#c8defa')}
  hctx.font="800 30px 'Barlow Condensed', sans-serif";const t='INSIDE THE 24H TOWING DEPOT',w=hctx.measureText(t).width+44;hctx.fillStyle='rgba(16,19,24,.86)';rrect(hctx,HUDW/2-w/2,64,w,48,10);hctx.fill();hctx.fillStyle='#fff';hctx.fillText(t,HUDW/2,89)}
