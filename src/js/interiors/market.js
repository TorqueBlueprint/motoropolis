//@ interiors/market.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== SUPERMARKET =====
 const MK={built:false,home:{...STD_HOME,yaw:.08,pitch:.34,dist:50},sh:[],mix:null};
 function buildMarket(){const R=room({w:50,d:28,h:12,bg:0x9ec0d8,floor:0xeceef0,wall:0xe6ebee,wall2:0xdbe2e7,trim:0x2e7d4f,sbg:'#2e7d4f',title:'MOTOROPOLIS SUPERMARKET',titleW:28,light:0xfff6e6});MK.S=R.S;
  // aisle guides painted on the floor and a green entrance mat
  R.B2(44,.02,.12,M(0xd7dde2),0,.02,6.4,false);
  const mat0=new T.Mesh(new T.PlaneGeometry(9,3.4),M(0x2e7d4f,{roughness:.9}));mat0.rotation.x=-Math.PI/2;mat0.position.set(0,.03,12.4);R.add(mat0);
  MK.people=[];MK.staff=[];
  if(X&&X.ld)X.ld.loadAsync(ASSET_BASE+'assets/world/market_props.glb').then(gl=>{
   const src=gl.scene;const get=n=>src.getObjectByName(n);
   const put=(n,x,z,ry,sc)=>{const o=get(n);if(!o)return null;const h=new T.Group();const c=o.clone(true);h.add(c);h.scale.setScalar(sc||1);h.position.set(x,.04,z);h.rotation.y=ry||0;c.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true}});R.add(h);return h};
   const PI=Math.PI;
   // back wall: deli and butcher counters
   put('showcase_meat',-17,-11.6,0,1.05);put('showcase_meat',-13.6,-11.6,0,1.05);put('showcase_cheese',-10.2,-11.6,0,1.05);put('showcase_cheese',-6.8,-11.6,0,1.05);
   // back wall right: drinks fridges in a row
   for(let k=0;k<5;k++)put('big_fridge',1+k*3.3,-11.9,0,1.12);
   // left wall: milk fridges
   for(let k=0;k<4;k++)put('fridge',-23.4,-8+k*2.2,PI/2,1);
   // right wall: display fridges
   for(let k=0;k<4;k++)put('stillage1',23.2,-7.5+k*2.6,-PI/2,1.25);
   // three aisles of shelves down the middle
   for(let a=0;a<3;a++){const x=-11+a*10.5;for(let k=0;k<7;k++){put('stillage',x-1.1,-6.5+k*1.9,PI/2,1.35);put('stillage',x+1.1,-6.5+k*1.9,-PI/2,1.35)}
    R.add(sign(['FRESH · DAIRY','PANTRY · SNACKS','DRINKS · HOME'][a],5,.9,'#2e7d4f','#ffffff',x,6.1,-6.9,0))}
   // checkouts across the front
   for(let k=0;k<4;k++){const x=-12+k*8;put('cash_register',x,8.6,0,.75);put('shopping_bag',x+1.6,9.1,0,1.1)}
   // trolleys by the entrance and a few around the shop
   for(let k=0;k<9;k++)put('cart',-22+k*1.25,12.1,.06,.8);
   MK.carts=[0,1,2,3,4].map(()=>put('cart',-22,12.1,0,.8));
   for(const[px,pz]of[[-23,11.4],[23,11.4],[-23,-11.4],[23,-11.4]])put('plant',px,pz,0,1.4);
  }).catch(e=>console.warn('market props',e));
  // staff and shoppers
  // back-office corner for the manager and the CEO
  R.B2(6,1.5,2.6,M(0xb07a45),19,0,-9.2);R.B2(6.2,.14,2.8,M(0xe9e5dc),19,1.5,-9.2,false);R.B2(1.8,1.2,.14,mat.dark,18,1.64,-9.9,false);
  R.B2(1.6,1,.05,M(0x46c8ff,{emissive:0x46c8ff,emissiveIntensity:.5}),18,1.74,-9.8,false);R.B2(2.4,2.4,.2,M(0x2e7d4f),19,3.4,-10.8,false);
  MK.till=[0,1,2].map(i=>{const m=mkP(MK.S,'#2e7d4f',180+i,'Supermarket Cashier');putP(m,{x:-12+i*8,z:7.1,ang:Math.PI},false);return m});
  MK.mgr=(()=>{const m=mkP(MK.S,'#22252b',184,'Store Manager');putP(m,{x:11.5,z:6.4,ang:Math.PI},false);return m})();
  MK.ceo=(()=>{const m=mkP(MK.S,'#22252b',185,'Supermarket CEO');putP(m,{x:19,z:-7.2,ang:0},false);return m})();
  MK.sh=[0,1,2,3,4].map(i=>mkP(MK.S,null,186+i,'civ'));
  MK.built=true}
 const MKPATH=[[[0,14],[-6,6],[-6,-5],[-16,-9],[-6,-5],[-6,6],[-11,8.4],[0,14]],
  [[0,14],[5,6],[5,-6],[12,-9],[5,-6],[5,8],[-4,8.4],[0,14]],
  [[0,14],[-18,8],[-21,-6],[-12,-9.8],[-21,-6],[-18,8],[4,8.4],[0,14]],
  [[0,14],[16,6],[20,-5],[20,5],[12,8.4],[0,14]],
  [[0,14],[-6,8],[6,2],[16,-4],[20,2],[8,8.4],[0,14]]];
 function syncMarket(){MK.till.forEach((m,k)=>{m.rotation.y=Math.PI+Math.sin(simTime*(.7+k*.3))*.5});
  MK.mgr.rotation.y=Math.PI+Math.sin(simTime*.45)*.9;MK.ceo.rotation.y=Math.sin(simTime*.3)*.5;
  MK.sh.forEach((m,k)=>{loopP(m,MKPATH[k],26+k*4,k*.19,.1);const c=MK.carts&&MK.carts[k];if(!c)return;
   const a=m.rotation.y;c.position.set(m.position.x+Math.sin(a)*1.4,.04,m.position.z+Math.cos(a)*1.4);c.rotation.y=a-Math.PI/2})}
 function labelsMarket(){MK.till.forEach((m,k)=>staffTag(m,'market','Supermarket Cashier',k,4.4));
  staffTag(MK.mgr,'market','Store Manager',0,4.4);staffTag(MK.ceo,'market','Supermarket CEO',0,4.4);header('INSIDE THE SUPERMARKET')}
