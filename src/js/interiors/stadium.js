//@ interiors/stadium.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---- STADIUM interior (hidden: only reachable from the recorder / localhost tests until it is announced) ----
 const SD={built:false,home:{tx:0,tz:2,yaw:.55,pitch:.42,dist:62},step:null};
 function buildStadium(){const S=new T.Scene();SD.S=S;SD.built=true;S.background=new T.Color(0x8fb8e0);S.fog=new T.Fog(0x8fb8e0,140,260);
  S.add(new T.HemisphereLight(0xeef4ff,0x3a4a30,1.1));const key=new T.DirectionalLight(0xfff3e0,1.6);key.position.set(30,60,25);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-40,right:40,top:30,bottom:-30,near:5,far:160});key.shadow.bias=-.0005;S.add(key);
  const HL=20.5,HW=14.5;
  // grass apron under everything
  const ap=new T.Mesh(new T.PlaneGeometry(80,60),M(0x3b7d34,{roughness:.95}));ap.rotation.x=-Math.PI/2;ap.position.y=-.02;ap.receiveShadow=true;S.add(ap);
  // stands: four tiered blocks with seats and a crowd
  const seatC=[0xd93a2f,0x2f6fd9];const crowd=[];
  const stand=(len,x,z,ry,col)=>{const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry;S.add(g);
   for(let r=0;r<8;r++){const st=box(len,1,1.6,M(r%2?0xc9ced6:0xb8bec8),0,r*1+.5,r*1.6+.8,true);g.add(st);const sr=box(len,.35,.5,M(col),0,r*1+1.15,r*1.6+.5,false);g.add(sr);for(let k=0;k<len/0.9;k++)if(Math.random()<.78)crowd.push({g,x:-len/2+.45+k*.9,y:r*1+1.6,z:r*1.6+.55})}
   const bk=box(len,9.5,.6,M(0x2a2f38),0,4.75,13.3,true);g.add(bk);const rf=box(len+2,.4,8,M(0xe8ecf1),0,10.2,10,true);g.add(rf);return g};
  stand(50,0,-HW-3,Math.PI,seatC[0]);stand(50,0,HW+3,0,seatC[1]);stand(36,-HL-3.5,0,-Math.PI/2,seatC[0]);stand(36,HL+3.5,0,Math.PI/2,seatC[1]);
  // crowd as one instanced mesh of little people-blocks
  const cg=new T.BoxGeometry(.45,.75,.35);const cm=new T.MeshStandardMaterial({roughness:.8});const IM=new T.InstancedMesh(cg,cm,crowd.length);const mm=new T.Matrix4(),v=new T.Vector3(),q=new T.Quaternion(),one=new T.Vector3(1,1,1),cc=new T.Color();
  const pal=[0xd93a2f,0x2f6fd9,0xf4f1e6,0x222428,0xf2b81d,0x3ee08f,0x7a3fb0,0xff7a1a];
  crowd.forEach((c,i)=>{c.g.updateMatrixWorld(true);v.set(c.x,c.y,c.z).applyMatrix4(c.g.matrixWorld);q.setFromEuler(new T.Euler(0,c.g.rotation.y,0));mm.compose(v,q,one);IM.setMatrixAt(i,mm);IM.setColorAt(i,cc.setHex(pal[(Math.random()*pal.length)|0]))});S.add(IM);SD.crowd={IM,list:crowd,base:crowd.map((c,i)=>{const m=new T.Matrix4();IM.getMatrixAt(i,m);return m})};
  // floodlights
  for(const[a,b]of[[1,1],[1,-1],[-1,1],[-1,-1]]){const p=new T.Mesh(new T.CylinderGeometry(.35,.45,26,8),mat.steel);p.position.set(a*(HL+9),13,b*(HW+9));S.add(p);const h=box(5,2.4,.6,mat.lamp,a*(HL+9),26.5,b*(HW+9),false);h.lookAt(0,0,0);S.add(h)}
  // scoreboard
  const sb=document.createElement('canvas');sb.width=512;sb.height=160;const sbt=new T.CanvasTexture(sb);sbt.colorSpace=T.SRGBColorSpace;const sbm=new T.Mesh(new T.PlaneGeometry(14,4.4),new T.MeshBasicMaterial({map:sbt}));sbm.position.set(0,16,-HW-17.5);S.add(sbm);S.add(box(14.8,5,.4,mat.dark,0,16,-HW-17.8,false));
  const draw=(sc)=>{const c=sb.getContext('2d');c.fillStyle='#0c0f14';c.fillRect(0,0,512,160);c.font="800 34px 'Barlow Condensed',sans-serif";c.textAlign='center';c.fillStyle='#ff7a1a';c.fillText('MOTOROPOLIS LEAGUE',256,40);c.font="800 64px 'Barlow Condensed',sans-serif";c.fillStyle='#ff5a4f';c.fillText('RED',110,120);c.fillStyle='#ffffff';c.fillText(sc[0]+' - '+sc[1],256,120);c.fillStyle='#5aa2ff';c.fillText('BLUE',402,120);sbt.needsUpdate=true};draw([0,0]);
  // pitch model
  X.ld.loadAsync(ASSET_BASE+'assets/world/field.glb').then(gf=>{const f=gf.scene;f.rotation.y=Math.PI/2;f.traverse(o=>{if(o.isMesh){o.receiveShadow=true;const c=o.material.color.getHex();if(c===0x27b811)o.material.color.setHex(0x3f8f37);if(c===0x07e057)o.material.color.setHex(0x4ea443);o.material.roughness=.9}});S.add(f)}).catch(e=>console.warn('field',e));
  const ball=new T.Mesh(new T.SphereGeometry(.22,14,10),M(0xffffff));ball.castShadow=true;S.add(ball);
  stadPlayers(S,new T.Vector3(0,0,0),[],ball,{HL,HW,ph:1.8,inside:SD,parent:S,onGoal:sc=>{draw(sc);SD.cheer=2}})}
 function syncStadium(dt){if(SD.step)SD.step(simTime,dt);
  if(SD.crowd){const {IM,base}=SD.crowd;const m=new T.Matrix4(),tr=new T.Matrix4();const amp=SD.cheer>0?.5:.06;if(SD.cheer>0)SD.cheer-=dt;
   for(let i=0;i<base.length;i+=1){const hop=Math.max(0,Math.sin(simTime*(SD.cheer>0?9:2)+i*1.7))*amp;tr.makeTranslation(0,hop,0);m.multiplyMatrices(tr,base[i]);IM.setMatrixAt(i,m)}IM.instanceMatrix.needsUpdate=true}}
 function labelsStadium(){header('INSIDE MOTOROPOLIS STADIUM')}

