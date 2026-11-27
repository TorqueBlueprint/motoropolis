//@ view3d/camera.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- camera ----------
 const cam=WORLD?{tx:205,tz:70,yaw:.5,pitch:.85,dist:760}:{tx:CX,tz:CZ-9,yaw:Math.PI-.3,pitch:.86,dist:235},home={...cam};let idle=0,dragging=false;
 const clampCam=()=>{if(mode==='in'){cam.pitch=clamp(cam.pitch,.12,1.2);cam.dist=clamp(cam.dist,10,62);cam.tx=clamp(cam.tx,-24,24);cam.tz=clamp(cam.tz,-10,8);return}cam.pitch=clamp(cam.pitch,.28,1.42);cam.dist=clamp(cam.dist,28,WORLD?1600:270);cam.tx=clamp(cam.tx,WORLD?CITY.bounds.x0:XS3[0]-10,WORLD?CITY.bounds.x1:XS3[NX-1]+10);cam.tz=clamp(cam.tz,WORLD?CITY.bounds.z0:YS3[0]-10,WORLD?CITY.bounds.z1:YS3[NY-1]+10)};
 function placeCam(){const cp=Math.cos(cam.pitch);const ly=mode==='in'?3:(cam.ty||0);camera.position.set(cam.tx+Math.sin(cam.yaw)*cp*cam.dist,ly+Math.sin(cam.pitch)*cam.dist,cam.tz+Math.cos(cam.yaw)*cp*cam.dist);camera.lookAt(cam.tx,ly,cam.tz)}
 const ptrs=new Map();let down=null,pinch=null;
 function pan(dx,dy){const k=cam.dist/700;const sx=Math.cos(cam.yaw),sz=-Math.sin(cam.yaw);const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw);cam.tx-=(dx*sx-dy*fx)*k;cam.tz-=(dx*sz-dy*fz)*k;clampCam()}
 c3.addEventListener('pointerdown',e=>{c3.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});idle=0;
  if(ptrs.size===1)down={x:e.clientX,y:e.clientY,moved:0,btn:e.button,shift:e.shiftKey};else{down&&(down.moved=99);const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2}}});
 c3.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;idle=0;
  if(ptrs.size>=2&&pinch){const[a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;cam.dist*=pinch.d/Math.max(1,d);pan(mx-pinch.mx,my-pinch.my);pinch={d,mx,my};clampCam();return}
  if(!down)return;down.moved+=Math.abs(dx)+Math.abs(dy);if(down.moved>4){dragging=true;c3.classList.add('drag')}
  if(down.btn===2||down.btn===1||down.shift)pan(dx,dy);else{cam.yaw-=dx*.006;cam.pitch+=dy*.004;clampCam()}});
 const endPtr=e=>{if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;
  if(ptrs.size===0){if(down&&down.moved<=4&&e.type==='pointerup')clickAt(e.clientX,e.clientY);down=null;dragging=false;c3.classList.remove('drag')}};
 c3.addEventListener('pointerup',endPtr);c3.addEventListener('pointercancel',endPtr);c3.addEventListener('contextmenu',e=>e.preventDefault());
 c3.addEventListener('wheel',e=>{e.preventDefault();idle=0;cam.dist*=Math.exp(e.deltaY*.0012);clampCam()},{passive:false});
 c3.addEventListener('keydown',e=>{const k=e.key;let h=true;if(k==='ArrowLeft')cam.yaw+=.08;else if(k==='ArrowRight')cam.yaw-=.08;else if(k==='ArrowUp')cam.pitch+=.05;else if(k==='ArrowDown')cam.pitch-=.05;else if(k==='+'||k==='=')cam.dist*=.9;else if(k==='-')cam.dist*=1.1;else h=false;if(h){e.preventDefault();idle=0;clampCam()}});
 c3.tabIndex=0;
 const v3=new T.Vector3();
 function toHud(x,y,z){v3.set(x,y,z).project(camera);if(v3.z>1||v3.z<-1)return null;return{x:(v3.x+1)/2*HUDW,y:(1-v3.y)/2*HUDH}}
 const ray=new T.Raycaster(),ndc=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),-Y0),hit=new T.Vector3();
 function clickAt(cx,cy){if(trailer||mode==='in')return;const r=c3.getBoundingClientRect(),hx=(cx-r.left)/r.width*CW,hy=(cy-r.top)/r.height*CH;
  let best=null,bd=40*40;for(const c of cars){if(c.hidden||c.removed)continue;const g=meshes.get(c.id);if(!g)continue;const s=toHud(g.position.x,g.position.y+.7,g.position.z);if(!s)continue;const d=(s.x-hx)**2+(s.y-hy)**2;if(d<bd){bd=d;best=c}}
  if(!best){ndc.set((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);if(ray.ray.intersectPlane(plane,hit)){const px=hit.x*10,py=hit.z*10,O=B.oficina;if(XMAS&&typeof XMS!=='undefined'&&XMS.santaRect){const sr=XMS.santaRect;if(px>=sr[0]&&px<=sr[1]&&py>=sr[2]&&py<=sr[3]){enterIn('santa');return}}if(inKiosk(px,py,4)){enterIn('news');return}if(inLotB(O,px,py)){enterIn('oficina');return}const Lw=B.lavagem;if(isOpen('lavagem')&&inLotB(Lw,px,py)){enterIn('lavagem');return}const Rb=B.reboques;if(isOpen('reboques')&&inLotB(Rb,px,py)){enterIn('reboques');return}const bb=buildings.find(b=>inLotB(b,px,py));if(bb&&INTS[bb.type]){enterIn(bb.type);return}}
   const og=groups.oficina;if(og){const hits=ray.intersectObject(og,true);if(hits.length){enterIn('oficina');return}}const lg=groups.lavagem;if(lg&&isOpen('lavagem')){const h2=ray.intersectObject(lg,true);if(h2.length){enterIn('lavagem');return}}const rg=groups.reboques;if(rg&&isOpen('reboques')){const h3=ray.intersectObject(rg,true);if(h3.length){enterIn('reboques');return}}}
  if(!best&&WORLD&&W3.homeHit&&INTS.home&&isOpen('w_res')&&W3.homeHit(ray.ray)){enterIn('home');return} // a subscriber's house or flat (interiors/home.js)
  selected=best;updateCard()}
