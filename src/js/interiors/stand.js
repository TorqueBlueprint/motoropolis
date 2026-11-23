//@ interiors/stand.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== DEALERSHIP =====
 const DS={built:false,home:{...STD_HOME,pitch:.32}};
 function buildDeal(){const R=room({title:'MOTOROPOLIS MOTORS · NEW & USED',titleW:22,sbg:'#22252b',wall:0xe9e5dc,wall2:0xd6d1c6,floor:0xf2f2ee,gloss:1,light:0xffffff,recep:'SALES DESK'});DS.S=R.S;DS.plates=[];
  const xs=[-15,-5,5,15];xs.forEach(x=>{const tt=new T.Mesh(new T.CylinderGeometry(3.2,3.2,.3,40),M(0x22252b,{metalness:.5,roughness:.2}));tt.position.set(x,.15,-2);tt.receiveShadow=true;R.add(tt);DS.plates.push(tt)});
  R.B2(6,1.2,2,M(0x22252b),18,0,7);R.add(sign('DRIVE IT HOME TODAY',10,1.2,'#ff7a1a','#1d0f02',-14,3.4,-10.6,0));
  const sp=upgP(personMesh('#22252b','#f1c7a5','#2b1d14'),'Car Salesman');sp.scale.setScalar(1.5);sp.position.set(18,0,5);sp.rotation.y=Math.PI;R.add(sp);
  DS.h=xs.map(x=>{const g=new T.Group();g.position.set(x,.3,-2);R.add(g);return{g,id:null}});
  DS.demo=xs.map((x,k)=>{const d=carMesh({kind:'car',len:[30,32,28,34][k],wid:16,color:['#d93a2f','#2f6fd9','#f2f2ee','#22252b'][k],m:[{sport:true},{n:'SUV'},{},{pickup:true}][k]});d.scale.setScalar(1.6);d.position.set(x,.3,-2);R.add(d);return d});DS.built=true}
 function syncDeal(){mirror(B.stand.slots,DS.h,1.6,(h,c,k)=>{h.g.rotation.y=simTime*.4+k;DS.plates[k].rotation.y=h.g.rotation.y;DS.demo[k].visible=!c;DS.demo[k].rotation.y=h.g.rotation.y})}
 function labelsDeal(){carTags(DS.h,3.6,c=>c.isNew?'FOR SALE · '+eur(c.price):null);lockedNote('stand');header('INSIDE THE DEALERSHIP')}

