//@ world/city2_detail.js - phase 1 small detail: kerbed sidewalks, street lamps, benches, bins, planters, fire hydrants
//@ and varied trees along the ring road; balconies, lit ground-floor shop windows and awnings on the city blocks.
//@ inside the if(WORLD){ block of world/world3d.js, after world/city2_zones.js. Off with ?city=1.
  if(CITY2){const C2=W3.c2,r2=C2.rnd,g=new T.Group();root.add(g);
   const bodyG=sh(W3.bodyG||(W3.bodyG=new T.BoxGeometry(1,1,1).translate(0,.5,0)));
   const JN=[[96,-34],...conN.map(x=>[x,-34]),...conS.map(x=>[x,174]),...conEW.flatMap(z=>[[-30,z],[222,z]]),[-30,110]];
   const nearJ=(x,z,r)=>JN.some(j=>Math.abs(x-j[0])<r&&Math.abs(z-j[1])<r);
   // ring road (the city-centre part is stretched by warp(), so the strips overlap): kerb + raised sidewalk on both sides, furniture on the outer side, trees on the inner verge
   const KB=[],SWK=[],LP=[],LA=[],LH=[],BN=[],BI=[],PL=[],PB=[],HY=[],TK=[],TL=[],TLc=[],TC=[],TCc=[];let k=0;
   for(const side of[-1,1]){
    along(RING,2,side*4.25,(x,z,a)=>{if(!nearJ(x,z,7.5))KB.push({x,y:0,z,ry:a,sx:.3,sy:.16,sz:4.2})},true);
    along(RING,2,side*5.55,(x,z,a)=>{if(!nearJ(x,z,7.5))SWK.push({x,y:0,z,ry:a,sx:2.3,sy:.13,sz:4.2})},true);
    along(RING,18,side*6.3,(x,z,a)=>{if(nearJ(x,z,9))return;k++;LP.push({x,y:0,z});LA.push({x:x+Math.cos(a)*side*.8,y:5.4,z:z-Math.sin(a)*side*.8,ry:a,sx:1.7,sy:.1,sz:.1});
     LH.push({x:x+Math.cos(a)*side*1.6,y:5.2,z:z-Math.sin(a)*side*1.6,ry:a,sx:.55,sy:.18,sz:.35})},true);
    along(RING,9,side*6.2,(x,z,a)=>{if(nearJ(x,z,9))return;const q=(k++)%5;const p={x,y:0,z,ry:a};
     if(q===0)BN.push({...p,sx:1.7,sy:.45,sz:.5});else if(q===1)BI.push({...p,sx:.5,sy:.9,sz:.5});else if(q===2){PL.push({...p,sx:1.3,sy:.55,sz:1.3});PB.push({x,y:1.05,z,sx:.85,sy:.7,sz:.85})}else if(q===3)HY.push({x,y:0,z})},true);
    if(side<0)continue;
    along(RING,11,-side*7.6,(x,z,a)=>{if(nearJ(x,z,10))return;const t=Math.floor(r2()*3),s=.8+r2()*.5;TK.push({x,y:0,z,sx:s,sy:s,sz:s});
     if(t===2){TC.push({x,y:1.2*s,z,sx:s,sy:s*1.3,sz:s});TCc.push(['#2f6a35','#3a7a3c'][Math.floor(r2()*2)])}else{TL.push({x,y:2.3*s,z,sx:s*(t?0.8:1.2),sy:s*(t?1.7:1),sz:s*(t?0.8:1.2),ry:r2()*3});TLc.push(['#4f8a3c','#5c9445','#6a9c45','#3f7a34'][Math.floor(r2()*4)])}},true)}
   instG(g,bodyG,mat.curb,KB,null,false);instG(g,bodyG,mat.pad,SWK,null,false);
   instG(g,sh(new T.CylinderGeometry(.08,.11,5.5,6).translate(0,2.75,0)),mat.dark,LP);instG(g,bodyG,mat.dark,LA,null,false);instG(g,bodyG,mat.lamp,LH,null,false);
   instG(g,bodyG,M(0x7a5a3a),BN);instG(g,sh(new T.CylinderGeometry(.25,.22,1,10)),M(0x2b3f2f,{roughness:.5,metalness:.3}),BI.map(p=>({...p,y:.45,sx:1,sy:.9,sz:1})));
   instG(g,bodyG,M(0x9a948a),PL);instG(g,sh(new T.IcosahedronGeometry(.6,0)),M(0x4f8a3c,{flatShading:true}),PB);
   instG(g,sh(new T.CylinderGeometry(.13,.15,.65,8).translate(0,.33,0)),M(0xd93a2f,{roughness:.4}),HY);
   instG(g,sh(new T.CylinderGeometry(.14,.2,1.7,5).translate(0,.85,0)),mat.trunk,TK);
   instG(g,sh(new T.IcosahedronGeometry(1.3,0)),M(0xffffff,{flatShading:true}),TL,TLc);instG(g,sh(new T.ConeGeometry(1.4,3.8,7).translate(0,1.9,0)),M(0xffffff,{flatShading:true}),TC,TCc);
   C2.lampHeads=LH.length;warp(g);
   // city blocks (rebuilt with the city as it grows): balconies on the flats, lit shop windows and awnings on the ground floors
   W3.cityHook=(cg,C3,gr)=>{const BA=[],RA=[],SW=[],AW=[],AWc=[];
    for(const f of C3.items){if(f.k==='tree'||f.k==='car'||f.k==='park'||f.k==='house')continue;const x=U(f.x),z=U(f.y),w=U(f.w),d=U(f.h);
     if(f.k==='tower'||f.k==='mid'){for(const s of[-1,1])SW.push({x,y:.35,z:z+s*(d/2+.03),sx:w*.86,sy:2.2,sz:.08});if(f.k==='mid'){AW.push({x,y:2.75,z:z+d/2+.7,sx:w*.8,sy:.14,sz:1.4});AWc.push(['#d93a2f','#2e7d4f','#2f6fd9','#e8b931','#6b3fa0'][Math.floor(f.f*5)])}}
     else{const h=5+f.f*7;for(let y=3.4;y<h-1;y+=3.1)for(const q of[-1,1]){BA.push({x:x+q*w*.24,y,z:z+d/2+.42,sx:w*.3,sy:.14,sz:.85});RA.push({x:x+q*w*.24,y:y+.14,z:z+d/2+.82,sx:w*.3,sy:.55,sz:.05})}}}
    instG(cg,bodyG,mat.pad,BA,null,false);instG(cg,bodyG,mat.grey,RA,null,false);instG(cg,bodyG,mat.win,SW,null,false);instG(cg,bodyG,M(0xffffff,{roughness:.7}),AW,AWc)}}
