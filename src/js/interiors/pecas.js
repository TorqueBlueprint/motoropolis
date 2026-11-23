//@ interiors/pecas.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== AUTO PARTS WAREHOUSE =====
 const PW={built:false,home:STD_HOME};
 function buildParts(){const R=room({title:'AUTO PARTS',sbg:'#c0392b',trim:0xc0392b,wall:0x2b3440,h:10,recep:'PICK-UP'});PW.S=R.S;
  const cols=[0xc79a62,0x2f6fd9,0xd93a2f,0x9aa3ad];
  for(let r=0;r<3;r++){const z=-9+r*5;for(let lv=0;lv<4;lv++)R.B2(30,.15,1.8,mat.steel,-6,lv*2,z,false);for(const x of[-21,-6,9])R.B2(.2,8,.2,mat.orange,x,0,z);
   for(let k=0;k<40;k++)R.B2(1.2,1,1.2,M(cols[(k+r)%4]),-20+(k%14)*2.1,.15+Math.floor(k/14)*2,z,false)}
  const fk=new T.Group();fk.add(box(2,1.4,3,mat.yellow,0,.3,0));fk.add(box(.2,4,.2,mat.dark,0,0,1.6));fk.add(box(1.6,.1,1.4,mat.steel,0,.6,2.3));fk.add(box(1.2,1,1.2,M(0xc79a62),0,.7,2.3));R.add(fk);PW.fk=fk;
  R.B2(7,1.3,2,M(0xc0392b),17,0,6);R.B2(7.2,.15,2.2,M(0xe9e5dc),17,1.3,6);
  PW.van={g:new T.Group(),id:null};PW.van.g.position.set(20,0,-4);R.add(PW.van.g);PW.built=true}
 function syncParts(){const p=(simTime*.08)%2,k=p<1?p:2-p;PW.fk.position.set(-18+k*30,0,-4.5);PW.fk.rotation.y=p<1?Math.PI/2:-Math.PI/2;
  const v=van&&!van.hidden&&van.state==='service'&&van.slot===van.home?van:null;const id=v?v.id:null;if(id!==PW.van.id){PW.van.id=id;while(PW.van.g.children.length)PW.van.g.remove(PW.van.g.children[0]);if(v){const m=carMesh(v);m.scale.setScalar(1.5);PW.van.g.add(m)}}}
 function labelsParts(){const p=toHud(20,4,-4);if(p)pill(PW.van.id?'PARTS VAN · LOADING':'PARTS VAN · OUT ON DELIVERY',p.x,p.y,20,'rgba(16,19,24,.85)','#ffd34d');lockedNote('pecas');header('INSIDE THE AUTO PARTS WAREHOUSE')}

