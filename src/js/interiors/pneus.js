//@ interiors/pneus.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== TIRE SHOP =====
 const TS={built:false,home:STD_HOME};
 function buildTires(){const R=room({title:'TIRES · ALIGNMENT',sbg:'#22252b',trim:0x22252b,wall:0x2d3a4a,recep:'RECEPTION'});TS.S=R.S;
  // car tyre: rounded-square profile turned on a lathe (axis along z), fine tread grooves, chrome alloy rims on some
  const tireG=(()=>{const P=[[.44,-.24],[.6,-.25],[.72,-.235],[.79,-.2],[.81,-.12],[.81,.12],[.79,.2],[.72,.235],[.6,.25],[.44,.24]].map(p=>new T.Vector2(p[0],p[1]));const g=new T.LatheGeometry(P,36);g.rotateX(Math.PI/2);return g})();
  const treadM=M(0x1b1c20,{roughness:.92}),grooveM=M(0x0c0d0f,{roughness:1}),rimM=mat.chrome;const grooveG=new T.TorusGeometry(.812,.012,4,40);
  const tyre=(x,y,z,rx,ry,rim)=>{const g=new T.Group();const t=new T.Mesh(tireG,treadM);t.castShadow=true;g.add(t);for(const gz of[-.08,0,.08]){const gr=new T.Mesh(grooveG,grooveM);gr.position.z=gz;g.add(gr)}
   if(rim){const r=new T.Mesh(new T.CylinderGeometry(.45,.45,.34,20),rimM);r.rotation.x=Math.PI/2;g.add(r);const hub=new T.Mesh(new T.CylinderGeometry(.1,.1,.4,10),M(0x5a6068,{metalness:.8,roughness:.3}));hub.rotation.x=Math.PI/2;g.add(hub);for(let k=0;k<5;k++){const sp=box(.09,.34,.05,M(0x8a95a3,{metalness:.8,roughness:.25}),0,0,.18,false);sp.rotation.z=k/5*Math.PI*2;g.add(sp)}}
   else{const d=new T.Mesh(new T.CircleGeometry(.44,20),M(0x2a2c31));d.position.z=.2;g.add(d)}
   g.position.set(x,y,z);g.rotation.set(rx||0,ry||0,0);R.add(g);return g};
  for(let c=0;c<8;c++)for(let r=0;r<4;r++)tyre(-24+c*1.8,.95+r*1.7,-10.2,0,0,r===3&&c%2===0);
  // tyre stacks, tire changer, wheel balancer and alignment computer
  for(let k=0;k<4;k++)tyre(-23.4,.32+k*.62,-4,Math.PI/2,0,false);for(let k=0;k<3;k++)tyre(-21.6,.32+k*.62,-4.6,Math.PI/2,0,false);
  {const x=20,z=-2;R.B2(1.6,1,1.6,M(0xd93a2f),x,0,z);const tt=new T.Mesh(new T.CylinderGeometry(.75,.75,.12,20),mat.steel);tt.position.set(x,1.06,z);R.add(tt);R.B2(.2,2.2,.2,mat.dark,x+.75,1,z-.6);R.B2(1,.16,.16,mat.dark,x+.3,3.1,z-.6,false);tyre(x,1.4,z,Math.PI/2,0,true)}
  {const x=23.5,z=3.4;R.B2(1.4,1.3,1.1,M(0x2f6fd9),x,0,z);const sh=new T.Mesh(new T.CylinderGeometry(.08,.08,.8,8),mat.steel);sh.rotation.z=Math.PI/2;sh.position.set(x-.9,1.3,z);R.add(sh);tyre(x-1.3,1.3,z,0,Math.PI/2,true);R.B2(1.5,.12,1.2,mat.dark,x,1.3,z,false);R.B2(.9,.55,.06,M(0x111827,{emissive:0x3ee08f,emissiveIntensity:.7}),x,1.5,z-.58,false)}
  {const c=document.createElement('canvas');c.width=256;c.height=160;const q=c.getContext('2d');q.fillStyle='#071a2d';q.fillRect(0,0,256,160);q.fillStyle='#3ee08f';q.font='700 18px sans-serif';q.fillText('ALIGNMENT',12,24);for(const[lx,v,ok]of[[20,'+0.1°',1],[140,'-1.4°',0],[20,'+0.0°',1],[140,'+0.2°',1]]){}
   [['FL',' +0.1°',1],['FR',' -1.4°',0],['RL',' +0.0°',1],['RR',' +0.2°',1]].forEach(([n,v,ok],k)=>{const bx=12+(k%2)*124,by=40+Math.floor(k/2)*58;q.fillStyle=ok?'#1f5b3a':'#5b1f1f';q.fillRect(bx,by,110,48);q.fillStyle=ok?'#3ee08f':'#ff5a4f';q.font='800 22px sans-serif';q.fillText(n+v,bx+8,by+31)});
   const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const st=new T.Group();st.position.set(0,0,5.6);st.add(box(.25,2.6,.25,mat.dark,0,0,0));st.add(box(.9,.6,.6,mat.dark,0,0,0));const sc=new T.Mesh(new T.PlaneGeometry(2.4,1.5),new T.MeshBasicMaterial({map:tx}));sc.position.set(0,3.3,.14);st.add(sc);st.add(box(2.6,1.7,.2,mat.dark,0,2.45,-.12,false));R.add(st)}
  // compressor hose reels on the back wall
  for(const x of[-2,9]){const hr=new T.Mesh(new T.TorusGeometry(.5,.12,8,16),M(0xe8b931));hr.position.set(x,4.2,-10.6);R.add(hr)}
  for(let r=0;r<4;r++)R.B2(15,.12,1,mat.steel,-17.7,.1+r*1.7,-10.2);
  TS.wheels=[];for(let k=0;k<3;k++){const x=-8+k*11;R.B2(6,.03,9,M(0x6f757d),x,0,-2,false);for(const dx of[-2.4,2.4])R.B2(.5,1.1,4.6,mat.yellow,x+dx,0,-2);
   R.B2(1.4,1.2,1.4,M(0x2f6fd9),x+4.4,0,2.5);const w=new T.Group();const tw=new T.Mesh(new T.CylinderGeometry(.75,.75,.45,18),mat.tire);tw.rotation.z=Math.PI/2;w.add(tw);const rim=new T.Mesh(new T.CylinderGeometry(.45,.45,.5,12),mat.chrome);rim.rotation.z=Math.PI/2;w.add(rim);w.position.set(x+4.4,1.95,2.5);R.add(w);TS.wheels.push(w)}
  R.B2(2,1.4,1.4,mat.red,20,0,-7);R.add(sign('BALANCE · ALIGN · REPAIR',10,1.2,'#ffd34d','#1d0f02',14,5.6,-10.6,0));
  TS.h=holderRow(R,3,[-8,3,14],-2);TS.built=true}
 function syncTires(dt){for(const w of TS.wheels)w.rotation.x+=dt*8;mirror(B.pneus.slots,TS.h,1.55,(h,c)=>{h.g.position.y=c?1.1:0;h.g.rotation.y=Math.PI})}
 function labelsTires(){carTags(TS.h,3.4,c=>c.fault?c.fault.n.toUpperCase():'NEW TIRES');lockedNote('pneus');header('INSIDE THE TIRE SHOP')}

