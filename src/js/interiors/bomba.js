//@ interiors/bomba.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== GAS STATION SHOP =====
 const GS={built:false,home:{...STD_HOME,yaw:-.2}};
 function buildGas(){const R=room({title:'MOTOROPOLIS FUEL · SNACKS',sbg:'#d93a2f',trim:0xd93a2f,wall:0x2b3440,floor:0xc9c3b6,gloss:1});GS.S=R.S;
  const cols=[0xff7a1a,0x2f6fd9,0x3ee08f,0xffd34d,0xd93a2f,0x7a3fb0];
  for(let r=0;r<3;r++){const z=-6+r*4;R.B2(14,2.6,1.2,M(0xe9e5dc),-12,0,z);for(let k=0;k<26;k++)R.B2(.42,.5,.4,M(cols[(k+r)%6]),-18.4+(k%13)*1,.3+Math.floor(k/13)*1.1,z+.62,false)}
  const fr=M(0x9fe3ff,{emissive:0x46c8ff,emissiveIntensity:.5,transparent:true,opacity:.7});R.B2(10,5,1.6,M(0xdfe7f1),-18,0,-10);R.B2(9.4,4.4,.1,fr,-18,.3,-9.15,false);
  for(let k=0;k<20;k++)R.B2(.35,.7,.35,M(cols[k%6]),-22+(k%10)*.9,.6+Math.floor(k/10)*1.5,-9.6,false);
  R.B2(9,1.3,2.2,M(0xd93a2f),8,0,-4);R.B2(9.2,.15,2.4,M(0xe9e5dc),8,1.3,-4);R.B2(.9,.7,.7,mat.dark,6,1.45,-4.2);
  const cashier=upgP(personMesh('#d93a2f','#f1c7a5','#5a3a22'),'Cashier');cashier.scale.setScalar(1.5);cashier.position.set(8,.3,-6.4);R.add(cashier);GS.cashier=cashier;
  R.B2(1.4,2.2,1,M(0x22252b),14,0,-9.5);R.add(sign('COFFEE',1.6,.6,'#5b4a3a','#fff',14,2.6,-8.95,0));
  R.add(sign('REGULAR $3.49 · DIESEL $3.89',10,1.2,'#071a2d','#ffd34d',8,3.6,-10.6,0));
  // glass front with the pumps outside
  R.B2(52,.25,.25,mat.steel,0,0,10.5,false);R.B2(52,.25,.25,mat.steel,0,6,10.5,false);
  for(const x of[6,18]){R.B2(.8,1.8,.7,mat.wall2,x,0,15);R.B2(.82,.45,.72,mat.red,x,1.4,15,false)}
  GS.h=holderRow(R,4,[2,10,14,22],13);GS.built=true}
 function syncGas(){GS.cashier.rotation.y=Math.sin(simTime)*.4;mirror(B.bomba.slots,GS.h,1.5,(h,c,k)=>{h.g.position.set([2,10,14,22][k],0,k<2?13:17);h.g.rotation.y=Math.PI/2})}
 function labelsGas(){carTags(GS.h,3,c=>'FILLING UP');lockedNote('bomba');header('INSIDE THE GAS STATION SHOP')}

