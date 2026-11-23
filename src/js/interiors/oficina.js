//@ interiors/oficina.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- 3D interior: the TorqueBlueprint repair shop ----------
 let mode='city',fade=0,fadeTo=null,cityCam=null;
 const IN={scene:new T.Scene(),lifts:[],built:false};
 const inHome={tx:0,tz:-4,yaw:.2,pitch:.34,dist:46};
 function buildInterior(){
  const S=IN.scene;S.background=new T.Color(0x0b1626);S.fog=new T.Fog(0x0b1626,70,140);
  S.add(new T.HemisphereLight(0xdfe9ff,0x2a2f38,.75));
  const key=new T.DirectionalLight(0xfff3e0,1.6);key.position.set(14,26,22);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-32,right:32,top:20,bottom:-20,near:2,far:80});key.shadow.bias=-.0006;S.add(key);
  const RW=56,RD=24,RH=14,X0=-RW/2,Z0=-RD/2;
  const add=(o)=>{S.add(o);return o};
  const B2=(w,h,d,m,x,y,z,cast)=>add(box(w,h,d,m,x,y,z,cast));
  // floor with painted bays
  const fl=new T.Mesh(new T.PlaneGeometry(RW,RD+8),M(0x8b9097,{roughness:.6,metalness:.05}));fl.rotation.x=-Math.PI/2;fl.position.set(0,0,4);fl.receiveShadow=true;add(fl);
  for(let k=0;k<5;k++){const x=-16+k*8;B2(6.4,.02,9,M(0x6f757d),x,0,-2,false);for(const dx of[-3.2,3.2])B2(.14,.03,9,mat.stripe||(mat.stripe=M(0xffd34d)),x+dx,0,-2,false)}
  B2(RW,.03,.3,M(0xffd34d),0,0,5.2,false);
  // walls
  const wallM=M(0x1d3b5c,{roughness:.9}),wallM2=M(0x16304d,{roughness:.9});
  B2(RW,RH,.5,wallM,0,0,Z0,true);B2(.5,RH,RD,wallM2,X0,0,0,true);B2(.5,RH,RD,wallM2,-X0,0,0,true);
  for(let y=1;y<RH;y+=1.2)B2(RW-.2,.05,.05,M(0x24476d),0,y,Z0+.3,false);
  B2(RW,.5,.6,M(0xff7a1a),0,RH-3.1,Z0+.5,false);
  // ceiling beams + lamps
  const lampM=M(0xfff6d6,{emissive:0xfff6d6,emissiveIntensity:1.2});
  for(let k=0;k<5;k++){const x=-16+k*8;const pl=new T.PointLight(0xfff1d0,40,22,1.6);pl.position.set(x,RH-1,-2);add(pl)}
  // big sign + wall of mechanics
  add(sign('TORQUEBLUEPRINT REPAIR SHOP',22,2,'#ff7a1a','#1d0f02',0,RH-1.5,Z0+.4,0));
  // the wall of mechanics runs along the back wall above the lifts, so nothing stands in front of it
  IN.board=new T.Group();IN.board.position.set(0,7.75,Z0+.45);add(IN.board);IN.boardKey='';
  // lifts (one per city lift slot)
  for(let k=0;k<5;k++){const x=-16+k*8,g=new T.Group();g.position.set(x,0,-2);
   for(const dx of[-2.6,2.6]){g.add(box(.55,5.2,.55,mat.yellow,dx,0,0));g.add(box(.9,.15,.9,mat.dark,dx,0,0,false))}
   g.add(box(5.75,.35,.55,mat.yellow,0,5.2,0));const arms=new T.Group();for(const dx of[-1.2,1.2])arms.add(box(.22,.16,3.2,mat.steel,dx,0,0));g.add(arms);
   add(g);const car=new T.Group();car.position.set(x,0,-2);add(car);
   const mech=upgP(personMesh('#1d4fb8','#f0c9a0','#2b1d14'),'Mechanic',k);mech.scale.setScalar(1.5);mech.visible=false;add(mech);
   IN.lifts.push({x,arms,car,mech,id:null})}
  // workbench (left) with the bolt jar
  const bx=-23;B2(4.5,1.5,2.2,M(0x8a5a2b),bx,0,-8.5);B2(4.7,.2,2.4,M(0xc08a4a),bx,1.5,-8.5);
  const jar=new T.Mesh(new T.CylinderGeometry(.8,.8,2,24,1,true),new T.MeshStandardMaterial({color:0xbfe9ff,transparent:true,opacity:.25,roughness:.05,metalness:.1,side:T.DoubleSide,depthWrite:false}));jar.position.set(bx,2.7,-8.5);add(jar);
  B2(1.75,.25,1.75,mat.steel,bx,3.7,-8.5,false);
  IN.boltGeo=new T.CylinderGeometry(.12,.12,.08,6);IN.boltMat=M(0xcfd9e5,{metalness:.7,roughness:.3});IN.bolts=null;IN.boltN=-1;
  IN.crates=new T.Group();add(IN.crates);IN.cratesN=-1;
  // unlockable gear, each with its blueprint ghost
  const gear=(n,name,build,x,z,ry)=>{const real=build();real.position.set(x,0,z);real.rotation.y=ry||0;add(real);const ghost=build();ghost.position.set(x,0,z);ghost.rotation.y=ry||0;
   ghost.traverse(o=>{if(o.isMesh){o.material=ghostMat;o.castShadow=false;if(o.geometry===BOX&&o.scale.x*o.scale.y*o.scale.z>.3)o.add(new T.LineSegments(EDGES,edgeMat))}});add(ghost);return{n,name,real,ghost,x,z}};
  const G=()=>new T.Group();
  IN.gear=[
   gear(10,'TOOL CHEST',()=>{const g=G();g.add(box(1.8,2.4,1,mat.red,0,0,0));for(let k=0;k<5;k++)g.add(box(1.6,.06,.05,mat.steel,0,.4+k*.42,.52,false));return g},-19.2,-9.6),
   gear(25,'TIRE RACK',()=>{const g=G();const tg=new T.CylinderGeometry(.75,.75,.45,18);for(let r=0;r<3;r++)for(let k=0;k<4;k++){const t=new T.Mesh(tg,mat.tire);t.rotation.x=Math.PI/2;t.position.set(-1.5+k*1,.9+r*1.7,0);t.castShadow=true;g.add(t)}g.add(box(4.4,.12,.9,mat.steel,0,.1,0));g.add(box(4.4,.12,.9,mat.steel,0,1.8,0));g.add(box(4.4,.12,.9,mat.steel,0,3.5,0));return g},-25,0,Math.PI/2),
   gear(50,'AIR COMPRESSOR',()=>{const g=G();const tk=new T.Mesh(new T.CylinderGeometry(.6,.6,2.2,18),mat.red);tk.rotation.z=Math.PI/2;tk.position.y=.8;tk.castShadow=true;g.add(tk);g.add(box(.9,.7,.7,mat.dark,0,1.4,0));return g},-22.5,4),
   gear(1000,'PAINT BOOTH',()=>{const g=G();g.add(box(7,5.6,.2,mat.glass,0,0,2.4,false));g.add(box(7,5.6,.2,mat.glass,0,0,-2.4,false));g.add(box(.2,5.6,5,mat.glass,3.5,0,0,false));g.add(box(7.4,.4,5.4,M(0x3ee08f),0,5.6,0));return g},22,-6),
   gear(5000,'DYNO',()=>{const g=G();g.add(box(4.6,.3,2.4,mat.dark,0,0,0));for(const dz of[-.6,.6]){const r=new T.Mesh(new T.CylinderGeometry(.35,.35,2,16),mat.chrome);r.rotation.x=Math.PI/2;r.position.set(dz*2.2,.35,0);g.add(r)}g.add(box(.2,2.4,.2,mat.dark,3,0,-1.4));g.add(box(1.6,1,.15,M(0x071a2d,{emissive:0x3ee08f,emissiveIntensity:.4}),3,2.4,-1.4,false));return g},22,4)];
  IN.built=true;
 }
 const BOARD_ROWS=5,BOARD_COLS=14,BOARD_PER=BOARD_ROWS*BOARD_COLS;
 function boardTex(names,page,pages){const W=4096,H=448,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.fillStyle='#5a3d22';x.fillRect(0,0,W,H);
  x.fillStyle='rgba(0,0,0,.35)';for(let i=14;i<W;i+=26)for(let j=14;j<H;j+=26){x.beginPath();x.arc(i,j,3,0,Math.PI*2);x.fill()}
  x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ffd34d';x.fillRect(W/2-560,10,1120,62);x.fillStyle='#071a2d';x.font="800 50px 'Barlow Condensed','Arial Narrow',sans-serif";x.fillText(`WALL OF MECHANICS · ${names.length} IN THE CITY`,W/2,42);
  if(pages>1){x.fillStyle='#ffd34d';x.font="800 34px 'Barlow Condensed',sans-serif";x.textAlign='right';x.fillText(`PAGE ${page+1}/${pages}`,W-30,42);x.textAlign='center'}
  if(!names.length){x.fillStyle='#eef3fb';x.font="700 64px 'Barlow Condensed',sans-serif";x.fillText('Comment WORKSHOP to get your name here',W/2,260);}
  const shown=names.slice(page*BOARD_PER,(page+1)*BOARD_PER),n=shown.length;
  const cols=Math.max(1,Math.min(BOARD_COLS,Math.ceil(n/BOARD_ROWS))),rows=Math.min(BOARD_ROWS,Math.max(1,Math.ceil(n/cols))),gw=(W-40)/cols,gh=(H-96)/BOARD_ROWS;
  const font=Math.min(56,gh*.62,gw/7.5);
  shown.forEach((nm,i)=>{const col=Math.floor(i/rows),row=i%rows;const px=20+col*gw+6,py=86+row*gh+5,w=gw-12,h=gh-10;x.fillStyle='#e9b531';x.fillRect(px,py,w,h);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(px,py+h-5,w,5);
   x.fillStyle='#2b1f05';let f=font;x.font=`800 ${f}px 'Barlow Condensed','Arial Narrow',sans-serif`;while(x.measureText(nm).width>w-16&&f>18){f-=2;x.font=`800 ${f}px 'Barlow Condensed','Arial Narrow',sans-serif`}
   let t=nm;while(x.measureText(t).width>w-16&&t.length>4)t=t.slice(0,-2)+'…';x.fillText(t,px+w/2,py+h/2+2)});
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t}
 function syncInterior(dt){
  const sv=subs||0;
  // wall of mechanics
  const pages=Math.max(1,Math.ceil(WALL.length/BOARD_PER)),page=Math.floor(simTime/8)%pages;const key=WALL.join('|')+'#'+page;if(key!==IN.boardKey){IN.boardKey=key;while(IN.board.children.length){const o=IN.board.children[0];IN.board.remove(o);if(o.material&&o.material.map){o.material.map.dispose();o.material.dispose()}}
   IN.board.add(box(44.8,5,.3,mat.dark,0,-2.5,0,false));const pm2=new T.Mesh(new T.PlaneGeometry(44,4.8),new T.MeshStandardMaterial({map:boardTex(WALL,page,pages),roughness:.8}));pm2.position.z=.2;IN.board.add(pm2)}
  // bolts, crates, pallets
  const nb=sv%100;if(nb!==IN.boltN){IN.boltN=nb;if(IN.bolts)IN.scene.remove(IN.bolts);const im=new T.InstancedMesh(IN.boltGeo,IN.boltMat,Math.max(1,nb));const o=new T.Object3D();
   for(let i=0;i<nb;i++){const a=i*2.399,r=.62*Math.sqrt((i%9+.5)/9);o.position.set(-23+Math.cos(a)*r,1.82+Math.floor(i/9)*.1,-8.5+Math.sin(a)*r);o.rotation.set(Math.random()*.4,a,0);o.updateMatrix();im.setMatrixAt(i,o.matrix)}
   im.count=nb;IN.bolts=im;IN.scene.add(im)}
  const nc=Math.floor(sv/100)%10,np=Math.floor(sv/1000)%10,ck=nc+'/'+np;if(ck!==IN.cratesN){IN.cratesN=ck;while(IN.crates.children.length)IN.crates.remove(IN.crates.children[0]);
   for(let i=0;i<nc;i++)IN.crates.add(box(1.1,.9,1.1,M(0xc08a4a),-25+(i%3)*1.25,Math.floor(i/3)*.92,-5.4));
   for(let i=0;i<np;i++){IN.crates.add(box(1.8,.2,1.8,M(0x7a5126),-24.4,0,8-i*2.2));IN.crates.add(box(1.6,1.4,1.6,M(0xc08a4a),-24.4,.2,8-i*2.2))}}
  for(const gq of IN.gear){const on=sv>=gq.n;gq.real.visible=on;gq.ghost.visible=!on}
  // cars on the lifts mirror the city's repair shop
  B.oficina.slots.forEach((s,k)=>{const L=IN.lifts[k];const c=s.car&&s.car.state==='service'&&!s.car.removed?s.car:null;const id=c?c.id:null;
   if(id!==L.id){L.id=id;while(L.car.children.length)L.car.remove(L.car.children[0]);if(c){const m=carMesh(c);m.scale.setScalar(1.55);m.rotation.y=Math.PI;L.car.add(m)}}
   let lift=0;if(c&&c.kind==='car'&&c.task&&c.task.type!=='parts'){const tot=c.svcTotal||6,el=tot-c.timer;lift=Math.min(2.4,el*1.4,Math.max(0,c.timer)*1.4)}
   L.car.position.y=lift;L.arms.position.y=lift+.2;
   L.mech.visible=!!c||!!staffOf('oficina','Mechanic',k);if(!c&&L.mech.visible){L.mech.position.set(L.x+3.4,0,1.6);L.mech.rotation.y=Math.PI+Math.sin(simTime*.6+k)*.5}if(c){const ph=simTime*2+k;L.mech.position.set(L.x+3.4+Math.sin(ph)*.3,0,-2+Math.cos(ph*.7)*1.6);L.mech.rotation.y=-Math.PI/2+Math.sin(ph)*.4}});
 }
 function drawInteriorLabels(){hctx.textAlign='center';hctx.textBaseline='middle';const sz=clamp(1100/cam.dist,14,26);
  for(const gq of IN.gear){if(gq.real.visible)continue;const s=toHud(gq.x,4.4,gq.z);if(s)pill(`${gq.name} · UNLOCKS AT ${gq.n.toLocaleString('en-US')} SUBS`,s.x,s.y,sz*.85,'rgba(15,47,92,.92)','#c8defa','#9fd0ff')}
  IN.lifts.forEach((L,k)=>{if(!L.id)return;const c=cars.find(q=>q.id===L.id);if(!c)return;const s=toHud(L.x,L.car.position.y+3.6,-2);if(!s)return;
   pill(c.driver?'★ '+c.driver:c.plate,s.x,s.y,sz,c.driver?'rgba(255,122,26,.95)':'#fafafa',c.driver?'#1d0f02':'#111');
   if(c.fault){const s2=toHud(L.x,L.car.position.y+2.8,-2);if(s2)pill(c.fault.n.toUpperCase(),s2.x,s2.y,sz*.8,'rgba(16,19,24,.85)','#ffb36b')}});
  const s=toHud(-23,4.6,-8.5);if(s)pill('1 BOLT = 1 SUBSCRIBER',s.x,s.y,sz*.85,'rgba(16,19,24,.85)','#ffd34d');
  hctx.globalAlpha=1;
  // header
  hctx.font="800 30px 'Barlow Condensed', sans-serif";const t='INSIDE THE TORQUEBLUEPRINT REPAIR SHOP',w=hctx.measureText(t).width+44;hctx.fillStyle='rgba(16,19,24,.86)';rrect(hctx,hud.width/2-w/2,64,w,48,10);hctx.fill();hctx.fillStyle='#fff';hctx.fillText(t,hud.width/2,89);
 }
