//@ interiors/fabrica.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== CAR FACTORY =====
 const FC={built:false,home:{...STD_HOME,dist:48}};
 function buildFactory(){const R=room({title:'MOTOROPOLIS CAR FACTORY',sbg:'#22252b',trim:0xff7a1a,wall:0x2b3440,h:11,w:56,recep:'SECURITY'});FC.S=R.S;FC.arms=[];FC.bodies=[];
  R.B2(44,.8,3,M(0x2b333d),0,0,-3);for(let x=-21;x<22;x+=1)R.B2(.15,.1,2.8,mat.steel,x,.8,-3,false);
  for(const x of[-14,-4,6,16]){const a=new T.Group();a.position.set(x,0,-6.5);a.add(box(1.2,1,1.2,mat.orange,0,0,0));const up=new T.Group();up.position.y=1;up.add(box(.5,3,.5,mat.orange,0,0,0));const fore=new T.Group();fore.position.y=3;fore.add(box(.4,.4,2.6,mat.orange,0,0,1.3));up.add(fore);a.add(up);R.add(a);FC.arms.push({up,fore})}
  for(let k=0;k<5;k++){const b=new T.Group();b.add(box(1.7,.7,3.6,M(COLORS.length?0x9aa3ad:0x9aa3ad),0,0,0));R.add(b);FC.bodies.push(b)}
  R.B2(6,5,4,M(0x3ee08f,{transparent:true,opacity:.35}),11,0,-3,false);R.add(sign('PAINT',3,.9,'#3ee08f','#071a2d',11,5.6,-.9,0));
  FC.h=holderRow(R,2,[-10,4],7);FC.built=true}
 function syncFactory(){FC.arms.forEach((a,k)=>{a.up.rotation.z=Math.sin(simTime*2+k)*.5;a.fore.rotation.x=Math.sin(simTime*3+k)*.6});
  FC.bodies.forEach((b,k)=>{const p=(simTime*.05+k/5)%1;b.position.set(-21+42*p,.9,-3);b.rotation.y=Math.PI/2;b.children[0].material=p>.68&&p<.82?(mat.green||(mat.green=M(0x3ee08f))):p>.82?(mat.bb||(mat.bb=M(0x2f6fd9))):mat.grey});
  mirror(B.fabrica.slots,FC.h,1.5,(h)=>{h.g.rotation.y=Math.PI/2})}
 function labelsFactory(){carTags(FC.h,3,()=>'FRESH OFF THE LINE');lockedNote('fabrica');header('INSIDE THE CAR FACTORY')}

