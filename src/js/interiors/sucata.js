//@ interiors/sucata.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== JUNKYARD CRUSHER =====
 const JY={built:false,home:STD_HOME};
 function buildJunk(){const R=room({title:'JUNKYARD · CRUSHER',sbg:'#5b4a3a',wall:0x4a3f35,wall2:0x3e352d,floor:0x8d7b5e,bg:0x15110d,deco:false});JY.S=R.S;
  R.B2(7,3,6,mat.yellow,-6,0,-3);R.B2(5,.3,5,mat.dark,-6,3,-3,false);const press=box(6,.8,5.6,M(0xc9971a),-6,0,-3);press.position.y=7;R.add(press);JY.press=press;
  for(const dx of[-3.2,3.2])R.B2(.5,8,.5,mat.dark,-6+dx,0,-3);R.B2(7,.6,.6,mat.dark,-6,8,-3,false);
  R.B2(.8,9,.8,mat.yellow,16,0,-8);const arm=box(14,.6,.6,mat.yellow,11,9,-8);R.add(arm);const mag=new T.Mesh(new T.CylinderGeometry(1,1,.4,16),mat.dark);mag.position.set(6,7,-8);R.add(mag);JY.mag=mag;
  JY.pile=new T.Group();R.add(JY.pile);JY.pileN=-1;JY.h=[{g:(()=>{const g=new T.Group();g.position.set(-6,3.1,-3);R.add(g);return g})(),id:null}];JY.built=true}
 function syncJunk(){const n=Math.min(60,B.sucata.pile);if(n!==JY.pileN){JY.pileN=n;while(JY.pile.children.length)JY.pile.remove(JY.pile.children[0]);
   const cs=[0xb5272d,0x2f6fd9,0x8a95a3,0x22252b,0x7a3f2a,0xe8b931];for(let k=0;k<n;k++){const b=box(2.4,1,1.6,M(cs[k%6],{metalness:.3}),6+(k%6)*2.6,Math.floor(k/18)*1.05,2+Math.floor(k/6)%3*2);b.rotation.y=(k*.37)%.5-.25;JY.pile.add(b)}}
  mirror(B.sucata.slots,JY.h,1.4,(h,c)=>{const k=c?clamp(1-c.timer/3,0,1):0;JY.press.position.y=7-k*3.4;h.g.scale.y=c?Math.max(.3,1-k*.7):1});JY.mag.position.x=6+Math.sin(simTime*.5)*4}
 function labelsJunk(){carTags(JY.h,3,()=>'BEING CRUSHED');const p=toHud(10,4,4);if(p)pill(`${B.sucata.pile} CARS CRUSHED`,p.x,p.y,20,'rgba(16,19,24,.85)','#ffd34d');lockedNote('sucata');header('INSIDE THE JUNKYARD')}

