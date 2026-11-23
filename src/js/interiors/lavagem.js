//@ interiors/lavagem.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- 3D interior: the car wash ----------
 const WS={scene:new T.Scene(),built:false,lanes:[],home:{tx:0,tz:-1,yaw:.32,pitch:.36,dist:44}};
 function buildWash(){
  const S=WS.scene;S.background=new T.Color(0x07182b);S.fog=new T.Fog(0x07182b,70,140);
  S.add(new T.HemisphereLight(0xd6f1ff,0x1d2a38,.8));
  const key=new T.DirectionalLight(0xe8f6ff,1.4);key.position.set(-12,26,22);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-30,right:30,top:18,bottom:-18,near:2,far:80});key.shadow.bias=-.0006;S.add(key);
  const RW=52,RD=20,RH=8,X0=-RW/2,Z0=-RD/2;const add=o=>{S.add(o);return o};const B2=(w,h,d,m,x,y,z,c)=>add(box(w,h,d,m,x,y,z,c));
  const fl=new T.Mesh(new T.PlaneGeometry(RW,RD+8),M(0x5f6b78,{roughness:.25,metalness:.2}));fl.rotation.x=-Math.PI/2;fl.position.set(0,0,4);fl.receiveShadow=true;add(fl);
  const tile=M(0xdfeaf2,{roughness:.5}),tile2=M(0xbcd3e3,{roughness:.5});
  B2(RW,RH,.5,tile,0,0,Z0,true);B2(.5,RH,RD,tile2,X0,0,0,true);B2(.5,RH,RD,tile2,-X0,0,0,true);
  for(let x=X0+1;x<-X0;x+=2)B2(.04,RH-.2,.04,M(0xa9c2d6),x,0,Z0+.28,false);for(let y=1;y<RH;y+=1)B2(RW-.2,.04,.04,M(0xa9c2d6),0,y,Z0+.28,false);
  const neon=M(0x46c8ff,{emissive:0x46c8ff,emissiveIntensity:1.6});B2(RW-1,.18,.18,neon,0,RH-1.2,Z0+.45,false);
  add(sign('MOTOROPOLIS CAR WASH',18,1.9,'#3fa7c4','#062a36',0,RH-2.7,Z0+.4,0));
  for(const x of[-16,0,16]){const pl=new T.PointLight(0xbfeaff,35,24,1.6);pl.position.set(x,RH-1,-1);add(pl)}
  const stages=[['SOAP',-12,0xff7ad1],['BRUSH',-3,0x46c8ff],['RINSE',6,0x3ee08f],['DRY',15,0xffd34d]];
  WS.brushes=[];WS.sprays=[];WS.fans=[];WS.stages=stages;
  for(const lz of[-4.2,4.2]){
   const lane={z:lz,car:new T.Group(),id:null};add(lane.car);
   B2(40,.06,2.6,M(0x2b333d),0,0,lz,false);for(let x=-19;x<20;x+=.9)B2(.2,.1,2.4,mat.steel,x,.05,lz,false);
   for(const dz of[-1.6,1.6])B2(40,.25,.25,M(0xffd34d),0,0,lz+dz,false);
   for(const[name,x,col]of stages){
    for(const dz of[-3,3])B2(.45,5.4,.45,M(col),x,0,lz+dz);B2(.6,.5,6.5,M(col),x,5.4,lz);
    if(name==='BRUSH'){for(const dz of[-2.1,2.1]){const br=new T.Group();br.position.set(x,0,lz+dz);const core=new T.Mesh(new T.CylinderGeometry(.75,.75,3.6,16),M(0x2f8fe0,{roughness:1}));core.position.y=2;br.add(core);
      for(let k=0;k<10;k++){const st=box(.08,3.6,1.6,M(0x7fd0ff,{roughness:1}),0,.2,0,false);st.rotation.y=k*Math.PI/10;br.add(st)}add(br);WS.brushes.push(br)}
     const top=new T.Mesh(new T.CylinderGeometry(.6,.6,4.4,16),M(0x2f8fe0,{roughness:1}));top.rotation.x=Math.PI/2;top.position.set(x+1.2,3.3,lz);add(top);WS.brushes.push(top)}
    if(name==='SOAP'||name==='RINSE'){WS.sprays.push({x,z:lz,col:name==='SOAP'?0xffd9f0:0xbfe9ff})}
    if(name==='DRY'){for(const dz of[-1.4,1.4]){const fan=new T.Mesh(new T.CylinderGeometry(.7,.7,.25,6),mat.dark);fan.rotation.x=Math.PI/2;fan.position.set(x,3.9,lz+dz);add(fan);WS.fans.push(fan)}}
   }
   WS.lanes.push(lane)}
  // water / foam particles
  const N=600,g=new T.BufferGeometry(),pos=new Float32Array(N*3),col=new Float32Array(N*3);g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(col,3));
  WS.pts=new T.Points(g,new T.PointsMaterial({size:.22,vertexColors:true,transparent:true,opacity:.85,depthWrite:false}));WS.pts.frustumCulled=false;add(WS.pts);WS.seeds=[...Array(N)].map(()=>Math.random());
  // waiting bench + pay station
  B2(2.4,2.2,1.2,M(0x22252b),-23.5,0,8);add(sign('PAY HERE',2.2,.7,'#ffd34d','#1d0f02',-23.5,2.7,8.65,0));
  WS.built=true}
 function syncWash(dt){
  const sp=WS.sprays;const cc=new T.Color();const p=WS.pts.geometry.attributes.position.array,c=WS.pts.geometry.attributes.color.array;let i=0;
  for(const b of WS.brushes)b.rotation.y+=dt*9;for(const f of WS.fans)f.rotation.y+=dt*14;
  for(let k=0;k<WS.seeds.length;k++){const s=sp[k%sp.length],r=WS.seeds[k];const ph=(simTime*1.4+r)%1;
   p[i]=s.x+(r-.5)*1.4;p[i+1]=5.2-ph*5;p[i+2]=s.z+(((r*97)%1)-.5)*5.4;cc.setHex(s.col);c[i]=cc.r;c[i+1]=cc.g;c[i+2]=cc.b;i+=3}
  WS.pts.geometry.attributes.position.needsUpdate=true;WS.pts.geometry.attributes.color.needsUpdate=true;
  B.lavagem.slots.forEach((s,k)=>{const L=WS.lanes[k];if(!L)return;const c=s.car&&s.car.state==='service'&&!s.car.removed?s.car:null;const id=c?c.id:null;
   if(id!==L.id){L.id=id;while(L.car.children.length)L.car.remove(L.car.children[0]);if(c){const m=carMesh(c);m.scale.setScalar(1.6);m.rotation.y=Math.PI/2;L.car.add(m)}}
   if(c){const tot=c.svcTotal||6,k2=clamp(1-c.timer/tot,0,1);L.car.position.set(-20+40*k2,.1,L.z)}});
 }
 function drawWashLabels(){hctx.textAlign='center';hctx.textBaseline='middle';const sz=clamp(1100/cam.dist,14,26);
  for(const[name,x,col]of WS.stages){const s=toHud(x,6.6,-4.2);if(s)pill(name,s.x,s.y,sz,'#'+col.toString(16).padStart(6,'0'),'#071a2d')}
  WS.lanes.forEach(L=>{if(!L.id)return;const c=cars.find(q=>q.id===L.id);if(!c)return;const s=toHud(L.car.position.x,3.4,L.z);if(s)pill(c.driver?'★ '+c.driver:c.plate,s.x,s.y,sz,c.driver?'rgba(255,122,26,.95)':'#fafafa',c.driver?'#1d0f02':'#111')});
  if(!WS.lanes.some(L=>L.id)){const s=toHud(0,2,0);if(s)pill('Waiting for the next dirty car…',s.x,s.y,sz,'rgba(16,19,24,.85)','#c8defa')}
  hctx.font="800 30px 'Barlow Condensed', sans-serif";const t='INSIDE THE MOTOROPOLIS CAR WASH',w=hctx.measureText(t).width+44;hctx.fillStyle='rgba(16,19,24,.86)';rrect(hctx,hud.width/2-w/2,64,w,48,10);hctx.fill();hctx.fillStyle='#fff';hctx.fillText(t,hud.width/2,89)}
