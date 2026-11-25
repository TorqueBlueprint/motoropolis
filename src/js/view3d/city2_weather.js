//@ view3d/city2_weather.js - phase 1 day/night and weather: headlight beams on the road at night, rain (wet roads,
//@ grey sky), fog and snow. ?weather=rain|fog|snow|clear (clear by default); localhost test hook window.__WEATHER(mode).
//@ inside make3D(T,X), called every city frame from view3d/frame.js. Off with ?city=1.
 const C2W={sync(){}};
 if(CITY2){const W=C2W;W.mode=(new URLSearchParams(location.search).get('weather')||'clear').toLowerCase();
  const F0={near:scene.fog.near,far:scene.fog.far},grey=new T.Color(0x76808c),wc=new T.Color(),asph0=mat.asphalt.roughness;
  // falling particles (rain streaks or snowflakes) in a box that follows the camera target
  const N=4000,BX=180,BY=70;const pos=new Float32Array(N*6),sp=new Float32Array(N);let seed=77;const rr=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  for(let i=0;i<N;i++){const x=(rr()-.5)*BX,y=rr()*BY,z=(rr()-.5)*BX;pos.set([x,y,z,x,y-1.2,z],i*6);sp[i]=.8+rr()*.4}
  const rg=new T.BufferGeometry();rg.setAttribute('position',new T.BufferAttribute(pos,3));
  const rain=new T.LineSegments(rg,new T.LineBasicMaterial({color:0xb8c8da,transparent:true,opacity:.45,depthWrite:false}));rain.frustumCulled=false;rain.visible=false;scene.add(rain);
  const sg=new T.BufferGeometry();const spos=new Float32Array(N*3);for(let i=0;i<N;i++)spos.set([pos[i*6],pos[i*6+1],pos[i*6+2]],i*3);sg.setAttribute('position',new T.BufferAttribute(spos,3));
  const snow=new T.Points(sg,new T.PointsMaterial({color:0xffffff,size:.35,transparent:true,opacity:.9,depthWrite:false}));snow.frustumCulled=false;snow.visible=false;scene.add(snow);
  // headlight beams: one additive quad on the road in front of every car that is driving, only at night
  const hlT=(()=>{const c=document.createElement('canvas');c.width=64;c.height=128;const x=c.getContext('2d');const gr=x.createRadialGradient(32,128,4,32,96,96);gr.addColorStop(0,'rgba(255,240,200,1)');gr.addColorStop(1,'rgba(255,240,200,0)');x.fillStyle=gr;x.fillRect(0,0,64,128);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t})();
  const HM=400,hlM=new T.MeshBasicMaterial({map:hlT,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
  const hl=new T.InstancedMesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),hlM,HM);hl.count=0;hl.frustumCulled=false;hl.userData.tf=1;scene.add(hl);const o=new T.Object3D();
  if(location.hostname==='localhost')window.__WEATHER=m=>{W.mode=m};
  let tint=false;
  W.sync=dt=>{const m=W.mode,nv=nightLevel();
   // weather tint: recompute the day/night light first, then darken and close in the fog
   if(m!=='clear'){applyNight(true);const k=m==='rain'?.6:m==='fog'?.5:.35;wc.copy(scene.background).lerp(grey,k);scene.background=wc;scene.fog.color.copy(wc);
    sun.intensity*=m==='rain'?.35:m==='fog'?.45:.6;hemi.intensity*=m==='snow'?1.1:.9;scene.fog.near=m==='fog'?40:m==='rain'?160:240;scene.fog.far=m==='fog'?420:m==='rain'?900:1200;
    mat.asphalt.roughness=m==='rain'?.42:asph0;tint=true}
   else if(tint){tint=false;scene.fog.near=F0.near;scene.fog.far=F0.far;mat.asphalt.roughness=asph0;applyNight(true)}
   rain.visible=m==='rain';snow.visible=m==='snow';
   if(rain.visible||snow.visible){const cx=cam.tx,cz=cam.tz;rain.position.set(cx,0,cz);snow.position.set(cx,0,cz);
    if(rain.visible){for(let i=0;i<N;i++){let y=pos[i*6+1]-dt*60*sp[i];if(y<0)y+=BY;pos[i*6+1]=y;pos[i*6+4]=y-1.2}rg.attributes.position.needsUpdate=true}
    else{for(let i=0;i<N;i++){let y=spos[i*3+1]-dt*4*sp[i];if(y<0)y+=BY;spos[i*3+1]=y;spos[i*3]+=Math.sin((y+i)*.3)*dt*.3}sg.attributes.position.needsUpdate=true}}
   // headlights
   hlM.opacity=Math.max(0,(nv-.25)/.75)*.55;let n=0;
   if(hlM.opacity>0)for(const c of cars){if(n>=HM)break;if(c.removed||c.hidden||c.state!=='road')continue;const g=meshes.get(c.id);if(!g||!g.visible)continue;const L=c.len/10,a=g.rotation.y;
    o.position.set(g.position.x+Math.sin(a)*(L/2+3.2),.06,g.position.z+Math.cos(a)*(L/2+3.2));o.rotation.set(0,a+Math.PI,0);o.scale.set(2.8,1,6);o.updateMatrix();hl.setMatrixAt(n++,o.matrix)}
   hl.count=n;hl.instanceMatrix.needsUpdate=true}}
