//@ interiors/inspecao.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== INSPECTION CENTER =====
 const IC={built:false,home:STD_HOME};
 function buildInsp(){const R=room({title:'INSPECTION CENTER',sbg:'#1d4fb8',trim:0x1d4fb8,wall:0x1e2f45,recep:'CHECK-IN'});IC.S=R.S;IC.lamps=[];
  for(const z of[-4,4]){R.B2(40,.04,3.2,M(0x2b333d),0,0,z,false);for(let k=0;k<20;k++)R.B2(1,.05,.3,k%2?mat.black:M(0xffd34d),-19.5+k*2,0,z+1.8,false);
   for(const x of[-8,0,8]){for(const dz of[-2.2,2.2])R.B2(.3,4.6,.3,mat.steel,x,0,z+dz);R.B2(.4,.3,4.7,M(0x1d4fb8),x,4.6,z)}
   const r1=new T.Mesh(new T.CylinderGeometry(.3,.3,2.8,12),mat.chrome);r1.rotation.x=Math.PI/2;r1.position.set(-2,.1,z);R.add(r1);
   const lamp=new T.Mesh(new T.SphereGeometry(.35,10,8),mat.lampOff);lamp.position.set(10,4.8,z);R.add(lamp);IC.lamps.push(lamp)}
  R.B2(1.2,1.6,.8,M(0x22252b),12,0,-8.5);R.B2(1.1,.8,.1,M(0x9fe3ff,{emissive:0x46c8ff,emissiveIntensity:.8}),12,1.7,-8.1,false);
  const insp=upgP(personMesh('#e8b931','#d9a27e','#2b1d14'),'Inspector');insp.scale.setScalar(1.5);insp.position.set(6,0,0);R.add(insp);IC.insp=insp;
  IC.h=holderRow(R,2,[-20,-20],-4);IC.built=true}
 function syncInsp(){IC.insp.position.x=6+Math.sin(simTime*.5)*5;mirror(B.inspecao.slots,IC.h,1.55,(h,c,k)=>{h.g.position.set(c?-2:-20,0,k?4:-4);h.g.rotation.y=Math.PI/2;IC.lamps[k].material=c?(Math.floor(simTime*2)%2?mat.lampOn:mat.yellow):mat.lampOff})}
 function labelsInsp(){carTags(IC.h,3.2,c=>c.health<55?'LIKELY TO FAIL':'LOOKING GOOD');lockedNote('inspecao');header('INSIDE THE INSPECTION CENTER')}

