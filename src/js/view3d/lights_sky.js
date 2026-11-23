//@ view3d/lights_sky.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // lights & sky
 const hemi=new T.HemisphereLight(0xdbe8ff,0x4a5a33,.6);scene.add(hemi);
 const sun=new T.DirectionalLight(0xfff1dc,3.3);sun.position.set(CX+70,95,CZ-80);sun.target.position.set(CX,0,CZ);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,WORLD?{left:-220,right:220,top:150,bottom:-150,near:10,far:600}:{left:-125,right:125,top:100,bottom:-100,near:10,far:420});sun.shadow.bias=WORLD?-.0012:-.0005;sun.shadow.normalBias=WORLD?.35:.05;scene.add(sun,sun.target);
 let lastN=-1;const duskC=new T.Color(0x7d86b0),dayC=new T.Color(0xa9cdf0),nightC=new T.Color(0x0b1430),bgC=new T.Color();scene.fog=WORLD?new T.Fog(0xa9cdf0,1000,2600):new T.Fog(0xa9cdf0,230,520);
 function applyNight(force){const XL=X&&!WORLD;const nv0=nightLevel(),nv=XL?Math.max(nv0,.42):nv0;if(!force&&Math.abs(nv-lastN)<.004)return;lastN=nv;bgC.lerpColors(XL?duskC:dayC,nightC,XL?Math.max(0,(nv-.42)/.58):nv);scene.background=bgC;scene.fog.color.copy(bgC);
  hemi.intensity=.6-.32*nv;sun.intensity=3.3-2.95*nv;sun.color.setHex(nv>.5?0x8fb0ff:0xfff1dc);mat.win.emissiveIntensity=1.6*nv;mat.lamp.emissiveIntensity=3*nv;mat.hl.emissiveIntensity=.15+2.4*nv;
  renderer.toneMappingExposure=XL?.92+.2*nv:1.05+.25*nv;if(XL){sun.color.setHex(nv>.6?0x8fb0ff:0xffbf86);hemi.color.setHex(0x9fb2e0);hemi.groundColor.setHex(0x3a2c26)}for(const m of signMats)m.emissiveIntensity=(XL?.22:0)+.5*nv;for(const p of pls)p.intensity=nv*30}
