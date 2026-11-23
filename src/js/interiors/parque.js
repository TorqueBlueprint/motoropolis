//@ interiors/parque.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== PARKING GARAGE =====
 const PK={built:false,home:{...STD_HOME,pitch:.5}};
 function buildPark(){const R=room({title:'PARKING · LEVEL 1',sbg:'#1d4fb8',wall:0x3a3f47,floor:0x6f747b,h:6,recep:'PAY STATION'});PK.S=R.S;
  const xs=[-20,-10,0,10,20];for(const z of[-6,4])xs.forEach((x,k)=>{for(const dx of[-3.6,3.6])R.B2(.12,.03,6,mat.dash,x+dx,0,z,false);R.add(sign(String(k+1+(z>0?5:0)),1,.8,'#1d4fb8','#fff',x,.5,z+3.3,0))});
  for(const x of[-15,-5,5,15])R.B2(.9,6,.9,M(0x9aa3ad),x,0,-1);
  R.B2(1.4,2.2,1,M(0x1d4fb8),24,0,9);R.B2(5,.25,.25,mat.red,20,1,10,false);
  PK.h=[];for(const z of[-6,4])for(const x of xs){const g=new T.Group();g.position.set(x,0,z);R.add(g);PK.h.push({g,id:null})}
  PK.built=true}
 function syncPark(){mirror(B.parque.slots,PK.h,1.5,(h)=>{h.g.rotation.y=0})}
 function labelsPark(){carTags(PK.h,2.8);lockedNote('parque');header('INSIDE THE PARKING GARAGE')}

