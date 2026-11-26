//@ world/city2_detail.js - phase 1 small detail on the Phase 1B layout: benches, bins, planters and fire hydrants along the
//@ plaza ring and the avenues out of it (the sidewalks and street lamps of every town road are built in roads/ground3d.js and
//@ roads/street_props.js); balconies, lit ground-floor windows and awnings on the city buildings, turned with them.
//@ inside the if(WORLD){ block of world/world3d.js, after world/city2_zones.js. Off with ?city=1.
  if(CITY2){const C2=W3.c2,r2=C2.rnd,g=new T.Group();root.add(g);const gh=CITY.h,P0=CITY.P0;
   const bodyG=sh(W3.bodyG||(W3.bodyG=new T.BoxGeometry(1,1,1).translate(0,.5,0)));
   const BN=[],BI=[],PL=[],PB=[],HY=[];let k=0;
   for(const e of CITY.edges){if(!['ring','east','west','spokeN','spokeE','spokeS','south','se','north','ne'].includes(e.road))continue;const na=CITY.nodes[e.a],nb=CITY.nodes[e.b],ca=na.round?na.round+10:e.w+6,cb=nb.round?nb.round+10:e.w+6;
    for(const side of[-1,1]){let s=0;along(e.P,9,side*(e.w/2+1.6),(x,z,a)=>{s+=9;if(s<ca||s>e.len-cb)return;if(Math.hypot(x-P0.x,z-P0.z)>260)return;if(CITY.roadD(x,z)<1)return;
     if(buildings.some(b=>inLotB(b,x*10,z*10,20)))return;const q=(k++)%5,y=gh(x,z),p={x,y,z,ry:a};
     if(q===0)BN.push({...p,sx:1.7,sy:.45,sz:.5});else if(q===1)BI.push({...p,sx:.5,sy:.9,sz:.5});else if(q===2){PL.push({...p,sx:1.3,sy:.55,sz:1.3});PB.push({x,y:y+1.05,z,sx:.85,sy:.7,sz:.85})}else if(q===3)HY.push({x,y,z});C2.pts.push([x,z])})}}
   instG(g,bodyG,M(0x7a5a3a),BN);instG(g,sh(new T.CylinderGeometry(.25,.22,1,10)),M(0x2b3f2f,{roughness:.5,metalness:.3}),BI.map(p=>({...p,y:p.y+.45,sx:1,sy:.9,sz:1})));
   instG(g,bodyG,M(0x9a948a),PL);instG(g,sh(new T.IcosahedronGeometry(.6,0)),M(0x4f8a3c,{flatShading:true}),PB);
   instG(g,sh(new T.CylinderGeometry(.13,.15,.65,8).translate(0,.33,0)),M(0xd93a2f,{roughness:.4}),HY);
   C2.lampHeads=lampPos.length;warp(g);C2.clear(C2.pts,2.5);
   // city buildings (rebuilt with the city as it grows): balconies on the flats, lit shop windows and awnings on the ground floors
   W3.cityHook=(cg,C3,gr)=>{const BA=[],RA=[],SW=[],AW=[],AWc=[];
    for(const f of C3.items){if(f.k==='tree'||f.k==='car'||f.k==='park'||f.k==='house')continue;const x=U(f.x),z=U(f.y),w=U(f.w),d=U(f.h),ry=f.ry||0,fs=Math.sin(ry),fc=Math.cos(ry),ax=fc,az=-fs,y0=gh(x,z);
     if(f.k==='tower'||f.k==='mid'){for(const s of[-1,1])SW.push({x:x+fs*s*(d/2+.03),y:y0+.35,z:z+fc*s*(d/2+.03),ry,sx:w*.86,sy:2.2,sz:.08});if(f.k==='mid'){AW.push({x:x+fs*(d/2+.7),y:y0+2.75,z:z+fc*(d/2+.7),ry,sx:w*.8,sy:.14,sz:1.4});AWc.push(['#d93a2f','#2e7d4f','#2f6fd9','#e8b931','#6b3fa0'][Math.floor(f.f*5)])}}
     else{const h=5+f.f*7;for(let y=3.4;y<h-1;y+=3.1)for(const q of[-1,1]){const lx=q*w*.24;BA.push({x:x+ax*lx+fs*(d/2+.42),y:y0+y,z:z+az*lx+fc*(d/2+.42),ry,sx:w*.3,sy:.14,sz:.85});RA.push({x:x+ax*lx+fs*(d/2+.82),y:y0+y+.14,z:z+az*lx+fc*(d/2+.82),ry,sx:w*.3,sy:.55,sz:.05})}}}
    instG(cg,bodyG,mat.pad,BA,null,false);instG(cg,bodyG,mat.grey,RA,null,false);instG(cg,bodyG,mat.win,SW,null,false);instG(cg,bodyG,M(0xffffff,{roughness:.7}),AW,AWc)}}
