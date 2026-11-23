//@ interiors/pista.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== RACE TRACK PIT GARAGE =====
 const RT={built:false,home:STD_HOME};
 function buildPits(){const R=room({title:'TORQUEBLUEPRINT RACING · PIT LANE',titleW:22,sbg:'#22252b',sfg:'#ff7a1a',wall:0x15171b,wall2:0x22252b,floor:0x3a3e45,bg:0x07090d,deco:false});RT.S=R.S;
  RT.screenC=document.createElement('canvas');RT.screenC.width=1024;RT.screenC.height=512;RT.screenT=new T.CanvasTexture(RT.screenC);RT.screenT.colorSpace=T.SRGBColorSpace;
  const sm=new T.Mesh(new T.PlaneGeometry(12,6),new T.MeshStandardMaterial({map:RT.screenT,emissiveMap:RT.screenT,emissive:0xffffff,emissiveIntensity:.6}));sm.position.set(14,4.4,-10.6);R.add(sm);
  RT.cars=race.map((r,k)=>{const x=-16+k*10;R.B2(8,.03,7,M(k%2?0x2b2f36:0x23272d),x,0,-3,false);R.add(sign(String(r.num),1.6,1.2,r.col,'#111',x,6,-10.6,0));
   const g=carMesh({kind:'car',len:30,wid:16,color:r.col,m:{sport:true,n:'race'}});g.scale.setScalar(1.7);g.position.set(x,0,-3);g.rotation.y=Math.PI;R.add(g);
   for(let t=0;t<3;t++){const ti=new T.Mesh(new T.CylinderGeometry(.75,.75,.5,16),mat.tire);ti.position.set(x+3,.25+t*.52,-8);R.add(ti)}
   const mech=upgP(personMesh('#d93a2f','#f1c7a5','#111'),'Pit Crew');mech.scale.setScalar(1.5);mech.position.set(x-2.6,0,-1);R.add(mech);return{g,r,mech}});
  RT.timer=0;RT.built=true}
 function syncPits(dt){RT.timer-=dt;RT.cars.forEach((c,k)=>{c.mech.rotation.y=Math.sin(simTime+k)*.6;c.g.position.y=Math.max(0,Math.sin(simTime*1.3+k*2))*.25});
  if(RT.timer<=0){RT.timer=.5;const x=RT.screenC.getContext('2d');x.fillStyle='#071a2d';x.fillRect(0,0,1024,512);x.fillStyle='#ff7a1a';x.font="800 56px 'Barlow Condensed',sans-serif";x.textAlign='left';x.textBaseline='middle';x.fillText('LIVE TIMING',36,56);
   [...race].sort((a,b)=>(b.laps+b.t)-(a.laps+a.t)).forEach((r,i)=>{const y=150+i*110;x.fillStyle=r.col;x.fillRect(36,y-40,80,80);x.fillStyle='#111';x.font="800 48px 'Barlow Condensed',sans-serif";x.textAlign='center';x.fillText(String(r.num),76,y+2);x.textAlign='left';x.fillStyle='#fff';x.fillText(`P${i+1}`,150,y);x.fillStyle='#c8defa';x.font="700 44px 'JetBrains Mono',monospace";x.fillText(`LAP ${r.laps+1}`,330,y);x.fillText(`${Math.round(r.t*100)}%`,700,y)});RT.screenT.needsUpdate=true}}
 function labelsPits(){lockedNote('pista');header('INSIDE THE RACE TRACK PIT GARAGE')}

