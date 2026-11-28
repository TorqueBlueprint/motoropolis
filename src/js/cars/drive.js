//@ cars/drive.js - Phase 2D: "Drive" a subscriber's car through the city (third-person chase camera, keyboard + touch).
//@ The car leaves the AI traffic (state 'drive': sim/update.js skips it, traffic/routing.js gapAhead treats it as an obstacle),
//@ is moved by a small arcade model built from its real specs (src/data/cars/drag_specs.json via DRAG.SPEC: power, mass, drive,
//@ gears, top speed, drag, grip) on a fixed 120 Hz step, and goes back to the AI at the nearest lane point when the viewer exits.
//@ World scale: 1 m/s of the physics moves the car 6.05 px/s, the same scale the car card uses for the AI cars (c.v*.37 = mph),
//@ so a car shown at 40 mph moves like the AI cars at 40 mph. Collisions: an occupancy mask (roads + kerb, the service lots,
//@ the turning bulbs) built once on the first drive, and simple bumps against the other cars. No allocations in the step.
//@ Off on the recorder page and in trailer mode. Deep link ?drive=<name>. Car panel actions (Follow, Drive, Drag race) live
//@ here too (UIX.carActs, called by ui/panels.js updateCard). closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt
var DRV=null;// read by view3d/frame.js, view3d/labels.js, ui/goto.js, ui/welcome.js (var: hoisted, so the earlier partials can test it before this runs)
{
 const REC=document.documentElement.dataset.rec==='1';
 const KPX=6.046,VS=KPX/10;            // px/s per m/s of the physics; visual metres per physics metre
 const H=1/120,G=9.81,RL=7000;         // fixed step; rev limiter shown on the rpm bar (generic, the specs give speeds per gear, not rpm)
 const phone=()=>matchMedia('(max-width: 700px)').matches;
 const hid=n=>!!(window.__HIDE&&n&&window.__HIDE.some(h=>String(n).includes(h)));
 // ---------- the car's numbers (same reading of the specs as sim/drag.js prep()) ----------
 const SP={m:1500,P:1e5,vg:new Float64Array(10),n:6,shift:.3,cda:.7,mu:1,drive:'FWD',wr:.5,wf:.5,launch:.4,wb:2,kw:0,hp:0,kg:0};
 function specOf(c){const S=DRAG.SPEC,s=S[c.m&&c.m.glb]||S.hothatch;const eff=s.drive==='AWD'?.82:s.drive==='FWD'?.88:.86;
  SP.m=s.kg+80;SP.P=s.hp*745.7*eff;SP.n=Math.min(10,s.gears);const v1=s.v1/3.6,vt=s.vtop/3.6,q=Math.pow(vt/v1,1/Math.max(1,SP.n-1));
  for(let g=0,v=v1;g<SP.n;g++,v*=q)SP.vg[g]=v;SP.shift=s.shift;SP.cda=s.cda;SP.mu=s.mu*.92;SP.drive=s.drive;
  SP.wr=s.eng==='R'?.61:s.eng==='M'?.57:.5;SP.wf=s.eng==='F'?.62:1-SP.wr;SP.launch=s.launch;SP.wb=Math.max(1.6,c.len/10*.62);SP.hp=s.hp;SP.kg=s.kg}
 const pw=x=>{if(x<=0)return 0;const y=x+x*x-x*x*x;return y<.05?.05:y};
 // ---------- where the car may go: roads (+1.2 m of kerb), the service lots and the turning bulbs; 1 m cells ----------
 let MK=null,MX0=0,MZ0=0,MW=0,MH=0;
 function buildMask(){const b=CITY.bounds;MX0=Math.floor(b.x0);MZ0=Math.floor(b.z0);MW=Math.ceil(b.x1-MX0)+1;MH=Math.ceil(b.z1-MZ0)+1;MK=new Uint8Array(MW*MH);
  const disc=(x,z,r)=>{const i0=Math.max(0,Math.floor(x-r-MX0)),i1=Math.min(MW-1,Math.ceil(x+r-MX0)),j0=Math.max(0,Math.floor(z-r-MZ0)),j1=Math.min(MH-1,Math.ceil(z+r-MZ0));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const dx=i+MX0+.5-x,dz=j+MZ0+.5-z;if(dx*dx+dz*dz<=r*r)MK[j*MW+i]=1}};
  // each road segment: the cells within half the road width (+1.2 m of kerb) of it
  for(const r of CITY.roads||[]){const hw=r.w/2+1.2,P=r.P;for(let k=1;k<P.length;k++){const ax=P[k-1][0],az=P[k-1][1],bx=P[k][0],bz=P[k][1],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;
    const i0=Math.max(0,Math.floor(Math.min(ax,bx)-hw-MX0)),i1=Math.min(MW-1,Math.ceil(Math.max(ax,bx)+hw-MX0)),j0=Math.max(0,Math.floor(Math.min(az,bz)-hw-MZ0)),j1=Math.min(MH-1,Math.ceil(Math.max(az,bz)+hw-MZ0));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=i+MX0+.5,z=j+MZ0+.5;let t=((x-ax)*dx+(z-az)*dz)/l2;t=t<0?0:t>1?1:t;const ex=x-ax-dx*t,ez=z-az-dz*t;if(ex*ex+ez*ez<=hw*hw)MK[j*MW+i]=1}}}
  for(const q of CITY.bulbs||[])disc(q.x,q.z,q.r+4);
  for(const n of nodes)if(n.round)disc(n.x/10,n.y/10,n.round/10+6);
  for(const B0 of buildings){if(!B0||B0.cx==null)continue;const r=Math.hypot(B0.x1-B0.x0,B0.y1-B0.y0)/20+2,cx=B0.cx/10,cz=B0.cy/10;
   const i0=Math.max(0,Math.floor(cx-r-MX0)),i1=Math.min(MW-1,Math.ceil(cx+r-MX0)),j0=Math.max(0,Math.floor(cz-r-MZ0)),j1=Math.min(MH-1,Math.ceil(cz+r-MZ0));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)if(inLotB(B0,(i+MX0+.5)*10,(j+MZ0+.5)*10))MK[j*MW+i]=1}
  // the cars parked along the shopping street (world/city2_roads.js) are solid
  for(const q of CITY.parked||[]){const cs=Math.cos(q[2]),sn=Math.sin(q[2]),i0=Math.max(0,Math.floor(q[0]-3-MX0)),i1=Math.min(MW-1,Math.ceil(q[0]+3-MX0)),j0=Math.max(0,Math.floor(q[1]-3-MZ0)),j1=Math.min(MH-1,Math.ceil(q[1]+3-MZ0));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const dx=i+MX0+.5-q[0],dz=j+MZ0+.5-q[1],u=dx*cs-dz*sn,v=dx*sn+dz*cs;if(Math.abs(u)<1.2&&Math.abs(v)<2.3)MK[j*MW+i]=0}}
  // the roundabout island stays solid (the ring road covers it otherwise)
  for(const n of nodes)if(n.round){const r=Math.max(0,n.round/10-5.5),x=n.x/10,z=n.y/10;const i0=Math.max(0,Math.floor(x-r-MX0)),i1=Math.min(MW-1,Math.ceil(x+r-MX0)),j0=Math.max(0,Math.floor(z-r-MZ0)),j1=Math.min(MH-1,Math.ceil(z+r-MZ0));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const dx=i+MX0+.5-x,dz=j+MZ0+.5-z;if(dx*dx+dz*dz<=r*r)MK[j*MW+i]=0}}}
 const okPx=(x,y)=>{const i=Math.floor(x/10-MX0),j=Math.floor(y/10-MZ0);return i>=0&&j>=0&&i<MW&&j<MH&&MK[j*MW+i]===1};
 // ---------- state (scalars only: the step allocates nothing) ----------
 const ST={on:false,c:null,x:0,y:0,px:0,py:0,a:0,pa:0,vx:0,vy:0,g:0,shT:0,rev:false,revT:0,steer:0,acc:0,r:.13,spin:false,thr:0,brk:0,acc0:0,
  bump:0,nW:0,nC:0,lastHit:0,ct:0,cam0:null,fov0:34,fs:false,sel:null,t:0,lastK:-1,lastM:-1,lastG:-1,lastR:-1};
 const K={up:false,dn:false,l:false,r:false,hb:false};const TK={up:0,dn:0,l:0,r:0,hb:0};// keyboard / touch (counted per finger)
 const kOn=k=>K[k]||TK[k]>0;
 function step(){const c=ST.c,ca=Math.cos(ST.a),sa=Math.sin(ST.a);
  let vF=ST.vx*ca+ST.vy*sa,vL=-ST.vx*sa+ST.vy*ca;const up=kOn('up'),dn=kOn('dn'),hb=kOn('hb');
  // pedals: S / brake holds the car, then (stopped, still held) engages reverse; W / gas leaves reverse
  let thr=0,brk=0;
  if(!ST.rev){thr=up?1:0;brk=dn?1:0;if(dn&&!up&&vF<.4){ST.revT+=H;if(ST.revT>.3){ST.rev=true;ST.revT=0}}else ST.revT=0}
  else{thr=dn?1:0;brk=up?1:0;if(up&&!dn&&vF>-.4)ST.rev=false}
  ST.thr=thr;ST.brk=brk||(hb?1:0);
  // steering: eased, a little slower at speed
  const want=(kOn('r')?1:0)-(kOn('l')?1:0),sp=Math.abs(vF),rate=(want===0?6:3.4)/(1+sp/40);ST.steer+=clamp(want-ST.steer,-rate*H,rate*H);
  // engine and gearbox (automatic): power curve P(x)=P*(x+x^2-x^3) like the drag sim, clutch slip at launch
  let F=0;ST.spin=false;
  if(!ST.rev){
   if(ST.shT>0){ST.shT-=H;if(ST.shT<=0&&ST.g<SP.n-1)ST.g++}
   const vf=vF>0?vF:0;let r=vf/SP.vg[ST.g];
   if(ST.shT<=0){if(r>=.97&&ST.g<SP.n-1&&thr>0)ST.shT=SP.shift;else if(ST.g>0&&vf/SP.vg[ST.g-1]<.8){ST.g--;r=vf/SP.vg[ST.g]}}
   let rr=r;if(ST.g===0&&thr>0&&rr<SP.launch)rr=SP.launch;
   if(thr>0&&ST.shT<=0&&r<1.02){const vr=rr*SP.vg[ST.g];F=thr*SP.P*pw(rr/.88)/(vr>vf?vr:vf>.5?vf:.5)}
   ST.r=clamp(rr<.13?.13:rr,0,1.02);
  }else{ST.g=0;ST.shT=0;if(thr>0&&vF>-7){const f=SP.P/(Math.abs(vF)>3?Math.abs(vF):3);F=-(f<.45*SP.m*G?f:.45*SP.m*G)}ST.r=clamp(.13+Math.abs(vF)/9,0,1)}
  // traction: grip x weight on the driven wheels, with weight transfer (RWD gains under acceleration, FWD loses)
  const fr=SP.drive==='AWD'?.98:SP.drive==='FWD'?SP.wf-.25*ST.acc/G:SP.wr+.25*ST.acc/G,Tm=SP.mu*SP.m*G*(fr<.2?.2:fr);
  if(F>Tm){F=Tm;ST.spin=true}else if(F<-Tm){F=-Tm;ST.spin=true}
  const v0=vF,sg=vF>0?1:vF<0?-1:0;
  let Fd=.5*1.2*SP.cda*vF*Math.abs(vF)+.014*SP.m*G*sg;if(!thr&&!ST.rev&&vF>0)Fd+=.035*SP.m*G;
  vF+=(F-Fd)/(SP.m*1.05)*H;
  const Bk=(brk?SP.mu*G*.95:0)+(hb?.5*G:0);if(Bk>0){if(vF>0)vF=Math.max(0,vF-Bk*H);else vF=Math.min(0,vF+Bk*H)}
  if(Math.abs(vF)<.05&&!thr)vF=0;
  ST.acc=clamp((vF-v0)/H,-12,12);
  // sideways: the tyres pull the velocity back in line with the car (less with the handbrake or spinning rear wheels: a light drift)
  const grip=hb?1.6:ST.spin&&SP.drive==='RWD'?3.2:ST.spin&&SP.drive==='AWD'?6:9;vL/=1+grip*H;
  ST.vx=ca*vF-sa*vL;ST.vy=sa*vF+ca*vL;
  // yaw from the steering (kinematic at low speed, limited by a lateral acceleration at speed); angles grow clockwise from above
  const vv=vF*VS;let yr=vv/SP.wb*Math.tan(.6*ST.steer);const cap=(hb?16:11.5)/(Math.abs(vv)>.1?Math.abs(vv):.1);yr=yr>cap?cap:yr<-cap?-cap:yr;
  ST.px=ST.x;ST.py=ST.y;ST.pa=ST.a;ST.a+=yr*H;
  // move, then the world and the other cars
  let nx=ST.x+ST.vx*KPX*H,ny=ST.y+ST.vy*KPX*H;
  if(!fits(nx,ny,ST.a)){
   if(!fits(ST.x,ST.y,ST.a)){ST.x=nx;ST.y=ny}// already in a bad spot (e.g. spawned on a kerb): let it drive out
   else wall(c)}
  else{ST.x=nx;ST.y=ny}
  carHits(c)}
 // against a kerb or a wall: the wall's normal from the mask around the car; the velocity into it is bounced off (20 %),
 // the rest slides on with a little friction, and the car turns a little to run along the wall
 const DX=new Float64Array(8),DY=new Float64Array(8);for(let k=0;k<8;k++){DX[k]=Math.cos(k*Math.PI/4);DY[k]=Math.sin(k*Math.PI/4)}
 function wall(c){const R=c.len*.62;let wx=0,wy=0;for(let k=0;k<8;k++)if(!okPx(ST.x+DX[k]*R,ST.y+DY[k]*R)){wx-=DX[k];wy-=DY[k]}
  const wl=Math.hypot(wx,wy);if(wl<1e-6){ST.vx*=-.3;ST.vy*=-.3;ST.a=ST.pa;ST.nW++;return}wx/=wl;wy/=wl;
  const vn=ST.vx*wx+ST.vy*wy;if(vn<0){ST.vx-=1.2*vn*wx;ST.vy-=1.2*vn*wy;ST.vx*=.992;ST.vy*=.992;if(vn<-3){ST.bump=.25;ST.nW++}}
  let tx=-wy,ty=wx;const ca=Math.cos(ST.a),sa=Math.sin(ST.a);if(tx*ca+ty*sa<0){tx=-tx;ty=-ty}
  if(Math.abs(tx*ca+ty*sa)>.35)ST.a=angLerp(ST.a,Math.atan2(ty,tx),.06);
  const nx=ST.x+ST.vx*KPX*H,ny=ST.y+ST.vy*KPX*H;if(fits(nx,ny,ST.a)){ST.x=nx;ST.y=ny}else if(!fits(ST.x,ST.y,ST.a))ST.a=ST.pa}
 // the four corners of the car (a little inside) must be on drivable ground
 function fits(x,y,a){const c=ST.c,ca=Math.cos(a),sa=Math.sin(a),hl=c.len*.46,hw=c.wid*.42;
  return okPx(x+ca*hl-sa*hw,y+sa*hl+ca*hw)&&okPx(x+ca*hl+sa*hw,y+sa*hl-ca*hw)&&okPx(x-ca*hl-sa*hw,y-sa*hl+ca*hw)&&okPx(x-ca*hl+sa*hw,y-sa*hl-ca*hw)}
 // the other cars: two circles each (front and back); push out and bounce off (the AI car is not moved)
 function carHits(c){const r1=c.wid*.5,d1=c.len*.5-r1,ca=Math.cos(ST.a),sa=Math.sin(ST.a);
  for(let i=0;i<cars.length;i++){const o=cars[i];if(o===c||o.hidden||o.removed||o.state==='home'||o.ghost>0)continue;
   const dx=o.x-ST.x,dy=o.y-ST.y,R=(c.len+o.len)*.5;if(dx*dx+dy*dy>R*R)continue;
   const r2=o.wid*.5,d2=o.len*.5-r2,oc=Math.cos(o.ang),os=Math.sin(o.ang),ov=(o.v||0)/KPX;
   for(let s1=-1;s1<=1;s1+=2)for(let s2=-1;s2<=1;s2+=2){const ex=ST.x+ca*d1*s1-(o.x+oc*d2*s2),ey=ST.y+sa*d1*s1-(o.y+os*d2*s2),d=Math.hypot(ex,ey),m=r1+r2;
    if(d>=m||d<1e-3)continue;const nx=ex/d,ny=ey/d;ST.x+=nx*(m-d);ST.y+=ny*(m-d);
    const vn=(ST.vx-oc*ov)*nx+(ST.vy-os*ov)*ny;if(vn<0){ST.vx-=1.3*vn*nx;ST.vy-=1.3*vn*ny;ST.bump=.25;ST.nC++;ST.lastHit=o.id}}}}
 // ---------- leave / rejoin the AI ----------
 const canDrive=c=>!!(c&&!REC&&!trailer&&R3&&c.kind==='car'&&!c.removed&&!c.hidden&&(c.state==='road'||c.state==='home')&&!c.stolen&&!c.emerg&&!c.towing&&!c.towedBy&&!c.forceBreak&&!(typeof crime!=='undefined'&&crime&&crime.car===c));
 function start(c){if(ST.on){if(ST.c===c)return true;stop(true)}if(!canDrive(c))return false;
  if(c.state==='home'&&!placeOnRoad(c))return false;
  if(!view3d)setView(true,true);if(R3.mode()==='in')return false;
  if(!MK)buildMask();specOf(c);
  c.state='drive';c.pts=[];c.route=[];c.waitRed=false;c.waitWhy='';c.boxN=-1;c.stuck=0;c.ghost=0;c.rn=null;
  ST.c=c;ST.on=true;ST.x=ST.px=c.x;ST.y=ST.py=c.y;ST.a=ST.pa=c.ang;const v=(c.v||0)/KPX;ST.vx=Math.cos(c.ang)*v;ST.vy=Math.sin(c.ang)*v;
  ST.g=0;while(ST.g<SP.n-1&&v>SP.vg[ST.g]*.9)ST.g++;ST.shT=0;ST.rev=false;ST.steer=0;ST.acc=0;ST.acc0=0;ST.ct=0;ST.t=0;
  ST.sel=selected===c?c:null;selected=null;updateCard();
  const cm=R3.cam;ST.cam0={tx:cm.tx,tz:cm.tz,yaw:cm.yaw,pitch:cm.pitch,dist:cm.dist,ty:cm.ty||0};ST.fov0=R3.camera.fov;
  if(UIX.gotoStop)UIX.gotoStop();if(UIX.unfollow)UIX.unfollow();FOLc=null;if(UIX.only)UIX.only(null);
  for(const k in K)K[k]=false;for(const k in TK)TK[k]=0;
  ST.fs=false;if(phone()&&!scr.classList.contains('fsfake')&&document.fullscreenElement!==scr){scr.classList.add('fsfake');document.body.classList.add('fs-lock');ST.fs=true}
  hudShow(c);return true}
 // the nearest lane point (of a road whose direction is closest to the car's heading)
 function rejoin(c){const ca=Math.cos(ST.a),sa=Math.sin(ST.a);let best=1e18,ba=-1,bb=-1,bs=0;
  for(const[k,e]of CITY.G.E){const a=Math.floor(k/65536),b=k%65536;if(!nodes[a]||!nodes[b])continue;const s=edgeS(a,b,c.x,c.y),p=lanePt(a,b,s);
   const t=atEdge(e,p.s),d=Math.hypot(p.x-c.x,p.y-c.y)+(1-(t.tx*ca+t.ty*sa))*60;if(d<best){best=d;ba=a;bb=b;bs=p.s}}
  if(ba<0)return false;
  // a free spot on that lane (no car within ~4.5 m), a little further along if needed
  const len=EDGE(ba,bb).len;let p=lanePt(ba,bb,bs);
  for(let k=0;k<8;k++){const q=lanePt(ba,bb,bs+(k%2?1:-1)*Math.ceil(k/2)*50);if(!cars.some(o=>o!==c&&!o.hidden&&!o.removed&&o.state!=='home'&&Math.hypot(o.x-q.x,o.y-q.y)<45)){p=q;break}}
  const t=atEdge(EDGE(ba,bb),p.s);c.x=p.x;c.y=p.y;c.ang=Math.atan2(t.ty,t.tx);c.from=ba;c.to=bb;c.pts=[stopPt(ba,bb)];c.route=[];
  c.v=Math.min(c.vmax,Math.max(0,(ST.vx*ca+ST.vy*sa))*KPX);c.state='road';c.stuck=0;c.ghost=.8;c.waitRed=false;c.blockT=0;c.stopT=0;c.stopAt=-1;c.brake=false;void len;return true}
 // quick: no camera move (trailer, 2D view); noSel: entering an interior (the camera is handed over, the car is not picked)
 function stop(quick,noSel){if(!ST.on)return;const c=ST.c;ST.on=false;
  if(c&&!c.removed){c.x=ST.x;c.y=ST.y;c.ang=ST.a;if(!rejoin(c)){c.state='road';c.pts=[stopPt(c.from,c.to)]}}
  hudHide();
  if(R3){const cm=R3.cam;
   if(!quick&&c&&!noSel)outTween(c);
   else{if(R3.camera.fov!==34){R3.camera.fov=34;R3.camera.updateProjectionMatrix()}if(!quick&&c){cm.tx=c.x/10;cm.tz=c.y/10;cm.dist=34;cm.pitch=.62;cm.ty=WORLD&&CITY.gy?CITY.gy(cm.tx,cm.tz):0}}}
  if(ST.fs){scr.classList.remove('fsfake');document.body.classList.remove('fs-lock');ST.fs=false}
  for(const k in K)K[k]=false;for(const k in TK)TK[k]=0;
  if(c&&!c.removed&&!quick&&!noSel){selected=c;updateCard()}ST.c=null}
 // after a normal exit: the camera rises from the chase view to the usual one over the car (0.9 s), then follows it for a while
 function outTween(c){const cm=R3.cam,a={dist:cm.dist,pitch:cm.pitch,fov:R3.camera.fov},t0=performance.now();
  const tick=()=>{if(ST.on||!R3||R3.mode()==='in'){if(!ST.on&&R3&&R3.camera.fov!==34){R3.camera.fov=34;R3.camera.updateProjectionMatrix()}return}
   const u=Math.min(1,(performance.now()-t0)/900),e=ease(u),x=c.x/10,z=c.y/10;cm.tx+=(x-cm.tx)*.35;cm.tz+=(z-cm.tz)*.35;if(WORLD&&CITY.gy)cm.ty=(cm.ty||0)+(CITY.gy(x,z)-(cm.ty||0))*.35;
   cm.dist=a.dist+(34-a.dist)*e;cm.pitch=a.pitch+(.62-a.pitch)*e;R3.camera.fov=a.fov+(34-a.fov)*e;R3.camera.updateProjectionMatrix();
   if(u<1)requestAnimationFrame(tick);else followCar(c,20)};requestAnimationFrame(tick)}
 // ---------- the frame (from view3d/frame.js, before the cars are synced): fixed steps, then the chase camera ----------
 function frame(dt,fading){const c=ST.c;
  if(!c||c.removed||fading==='in'||R3.mode()==='in'||!view3d||trailer){if(fading==='in'&&c&&!c.removed)stop(false,true);else stop(true);return}
  ST.ct+=dt;if(ST.ct>.25)ST.ct=.25;while(ST.ct>=H){step();ST.ct-=H}
  const al=ST.ct/H;c.x=ST.px+(ST.x-ST.px)*al;c.y=ST.py+(ST.y-ST.py)*al;c.ang=angLerp(ST.pa,ST.a,al);
  const ca=Math.cos(ST.a),sa=Math.sin(ST.a),vF=ST.vx*ca+ST.vy*sa;c.v=Math.abs(vF)*KPX;c.brake=ST.brk>0||(Math.abs(vF)<.3&&!ST.thr);if(ST.bump>0)ST.bump-=dt;
  // chase camera: behind the car, looking a little ahead; a bit further back at speed; never under the hill behind
  ST.t+=dt;const cm=R3.cam,cam0=ST.cam0,vv=Math.abs(vF)*VS,wx=c.x/10,wz=c.y/10;
  const tx=wx+Math.cos(c.ang)*2.2,tz=wz+Math.sin(c.ang)*2.2,ty=(WORLD&&CITY.gy?CITY.gy(wx,wz):0)+1.25;
  const yawT=Math.atan2(-Math.cos(c.ang),-Math.sin(c.ang)),dist=8.8+vv*.11;let pitch=.2;
  if(WORLD&&CITY.gy){const cp=Math.cos(pitch),bx=tx+Math.sin(yawT)*cp*dist,bz=tz+Math.cos(yawT)*cp*dist,need=CITY.gy(bx,bz)+1.4-ty;if(Math.sin(pitch)*dist<need)pitch=clamp(Math.asin(clamp(need/dist,-1,1)),.2,.9)}
  const e=ST.t<1.1?ease(ST.t/1.1):1,k=1-Math.exp(-dt*(e<1?30:14));
  if(e<1){cm.tx=cam0.tx+(tx-cam0.tx)*e;cm.tz=cam0.tz+(tz-cam0.tz)*e;cm.ty=cam0.ty+(ty-cam0.ty)*e;cm.dist=cam0.dist+(dist-cam0.dist)*e;cm.pitch=cam0.pitch+(pitch-cam0.pitch)*e;cm.yaw=angLerp(cam0.yaw,yawT,e)}
  else{cm.tx+=(tx-cm.tx)*k;cm.tz+=(tz-cm.tz)*k;cm.ty+=(ty-cm.ty)*k;cm.dist+=(dist-cm.dist)*k;cm.pitch+=(pitch-cm.pitch)*k;cm.yaw=angLerp(cm.yaw,yawT,1-Math.exp(-dt*(ST.rev?2:4.5)))}
  const fov=ST.fov0+(56-ST.fov0)*e;if(Math.abs(R3.camera.fov-fov)>.01){R3.camera.fov=fov;R3.camera.updateProjectionMatrix()}
  hudTick(vF)}
 const ease=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
 // ---------- HUD (DOM over the city; strings made once, a value only touches the DOM when it changes) ----------
 const scr=$('screen'),hud=$('drv'),dvK=$('dvKmh'),dvM=$('dvMph'),dvG=$('dvGear'),dvR=$('dvRpm'),dvRN=$('dvRpmN'),dvT=$('dvTouch'),dvHelp=$('dvHelp');
 const NUM=Array.from({length:501},(_,i)=>String(i)),RPMS=Array.from({length:51},(_,i)=>`scaleX(${(i/50).toFixed(2)})`),RPMN=Array.from({length:81},(_,i)=>(i/10).toFixed(1)+'k'),GEARS=['R','1','2','3','4','5','6','7','8','9','10'];
 let touchSeen=false;
 function hudShow(c){$('dvName').textContent=c.driver?(hid(c.driver)?'★ A resident':'★ '+c.driver):c.plate;
  $('dvModel').textContent=`${c.model} · ${SP.hp} hp · ${Math.round(SP.hp*.7457)} kW · ${SP.kg.toLocaleString('en-US')} kg · ${Math.round(SP.kg*2.20462).toLocaleString('en-US')} lb · ${SP.drive}`;
  ST.lastK=ST.lastM=ST.lastG=ST.lastR=-1;scr.classList.add('driving');hud.hidden=false;
  const coarse=touchSeen||matchMedia('(hover: none), (pointer: coarse)').matches;dvT.hidden=!coarse;dvHelp.hidden=coarse;hud.classList.toggle('dv-coarse',coarse);dvHelp.classList.remove('dv-fade');setTimeout(()=>dvHelp.classList.add('dv-fade'),7000);
  try{(coarse?$('dvExit'):c3).focus({preventScroll:true})}catch(e){}}
 function hudHide(){hud.hidden=true;scr.classList.remove('driving')}
 function hudTick(vF){const v=Math.abs(vF),kmh=Math.min(500,Math.round(v*3.6)),mph=Math.min(500,Math.round(v*2.236936)),g=ST.rev?0:ST.g+1,r=Math.round(ST.r/1.02*50),rn=Math.round((900+ST.r/1.02*(RL-900))/100);
  if(kmh!==ST.lastK){ST.lastK=kmh;dvK.textContent=NUM[kmh]}if(mph!==ST.lastM){ST.lastM=mph;dvM.textContent=NUM[mph]}
  if(g!==ST.lastG){ST.lastG=g;dvG.textContent=GEARS[g]}if(r!==ST.lastR){ST.lastR=r;dvR.style.transform=RPMS[r];dvRN.textContent=RPMN[rn>80?80:rn];hud.classList.toggle('dv-red',r>=47)}}
 // ---------- controls ----------
 const KEY={KeyW:'up',ArrowUp:'up',KeyS:'dn',ArrowDown:'dn',KeyA:'l',ArrowLeft:'l',KeyD:'r',ArrowRight:'r',Space:'hb'};
 const typing=e=>{const t=e.target;return !!(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))};
 window.addEventListener('keydown',e=>{if(!ST.on||typing(e))return;
  if(e.key==='Escape'){const open=document.querySelector('.finder:not([hidden])');if(open)return;e.preventDefault();e.stopPropagation();stop();return}
  const k=KEY[e.code]||KEY[e.key];if(!k)return;K[k]=true;e.preventDefault();e.stopPropagation()},true);
 window.addEventListener('keyup',e=>{const k=KEY[e.code]||KEY[e.key];if(k)K[k]=false},true);
 window.addEventListener('blur',()=>{for(const k in K)K[k]=false;for(const k in TK)TK[k]=0});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const k in K)K[k]=false;for(const k in TK)TK[k]=0}});
 for(const b of dvT.querySelectorAll('[data-k]')){const k=b.dataset.k,held=new Set();
  const dn=e=>{e.preventDefault();touchSeen=true;try{b.setPointerCapture(e.pointerId)}catch(x){}if(!held.has(e.pointerId)){held.add(e.pointerId);TK[k]=held.size}b.classList.add('on')};
  const up=e=>{if(held.delete(e.pointerId)){TK[k]=held.size;if(!held.size)b.classList.remove('on')}};
  b.addEventListener('pointerdown',dn);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);b.addEventListener('contextmenu',e=>e.preventDefault())}
 window.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touchSeen=true},{passive:true,capture:true});
 $('dvExit').addEventListener('click',()=>stop());
 // ---------- follow a car with the camera (any car; a drag or zoom on the city stops it) ----------
 let FOLc=null,folT=0,folI=0;
 function followCar(c,secs){FOLc=c;folT=secs||45;if(folI)return;folI=setInterval(()=>{const f=FOLc;if(!f||!R3||R3.mode()==='in'||ST.on||f.removed||f.hidden||(folT-=.05)<=0){FOLc=null;clearInterval(folI);folI=0;return}
  const cm=R3.cam,x=f.x/10,z=f.y/10;cm.tx+=(x-cm.tx)*.2;cm.tz+=(z-cm.tz)*.2;if(WORLD&&CITY.gy){const ty=CITY.gy(x,z);cm.ty=(cm.ty||0)+(ty-(cm.ty||0))*.2}},50)}
 c3.addEventListener('pointerdown',()=>{FOLc=null});c3.addEventListener('wheel',()=>{FOLc=null},{passive:true});
 function follow(c){if(!c||!R3)return;if(!view3d)setView(true,true);if(R3.mode()==='in')R3.exitIn();if(UIX.gotoStop)UIX.gotoStop();if(UIX.unfollow)UIX.unfollow();
  const cm=R3.cam;cm.tx=c.x/10;cm.tz=c.y/10;cm.dist=34;cm.pitch=.62;cm.ty=WORLD&&CITY.gy?CITY.gy(cm.tx,cm.tz):0;followCar(c,45)}
 // ---------- car panel actions: in the "Car details" card and in a dock over the city ----------
 const acts=$('carActs'),dock=$('carDock');let dockFor=null,dockSeen=null,actFor=null,actSig='';
 const mk=(cls,txt,fn,label)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=txt;if(label)b.setAttribute('aria-label',label);b.addEventListener('click',fn);return b};
 const can3D=()=>hasGL()&&!REC;
 function fill(box,c,inDock){box.textContent='';const ok=canDrive(c)&&!trailer;
  box.append(mk(inDock?'gt-in2 cd-b cd-fol':'cd-b cd-fol','Follow',()=>{follow(c);hideDock()},'Follow this car with the camera'));
  const d=mk(inDock?'gt-in cd-b':'cd-b cd-drv','Drive ▶',()=>{hideDock();if(!start(c))note('This car can’t be driven right now.')},'Drive this car');d.disabled=!ok||!can3D();box.append(d);
  box.append(mk(inDock?'gt-in cd-b cd-race':'cd-b cd-race','Drag race ⚑',()=>{hideDock();if(UIX.challenge)UIX.challenge(c)},'Challenge this car to a drag race'))}
 function note(t){const m=$('vMsg');if(!m)return;m.textContent=t;m.hidden=false;setTimeout(()=>{m.hidden=true},2500)}
 function hideDock(){dock.hidden=true;dockFor=null}
 function showDock(c){dock.textContent='';const ic=document.createElement('span');ic.className='gt-dk-ic';ic.textContent=c.driver?'★':'🚗';
  const tx=document.createElement('div');tx.className='gt-dk-tx';const b=document.createElement('b');b.className=c.driver?'gt-nm':'';b.textContent=c.driver?(hid(c.driver)?'A resident':c.driver):c.plate;
  const sm=document.createElement('small');sm.textContent=c.model+(c.driver?' · '+c.plate:'');tx.append(b,sm);const a=document.createElement('div');a.className='gt-dk-acts';fill(a,c,true);
  const x=mk('fd-x gt-dk-x','',hideDock,'Close');x.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  dock.append(ic,tx,a,x);const gd=$('gtDock');if(gd)gd.hidden=true;dock.hidden=false;dockFor=c}
 // called by updateCard() (ui/panels.js) every 0.25 s and on every pick; the buttons are rebuilt only when the car or its state changes
 UIX.carActs=c=>{const ok=!!(c&&c.kind==='car'&&!c.removed);if(!ok){acts.hidden=true;actFor=null;dockSeen=null;if(dockFor&&(!c||c!==dockFor))hideDock();return}
  const sig=c.id+'|'+canDrive(c)+'|'+!!trailer;if(c!==actFor||sig!==actSig){actFor=c;actSig=sig;fill(acts,c,false)}acts.hidden=false;
  if(c!==dockSeen&&view3d&&R3&&R3.mode()!=='in'&&!ST.on&&!trailer&&!REC){dockSeen=c;showDock(c)}}; // once per pick (closing it keeps it closed)
 setInterval(()=>{if(dockFor&&(trailer||(R3&&R3.mode()==='in')||!view3d||dockFor.removed))hideDock()},400);
 dock.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();hideDock()}});
 DRV={get on(){return ST.on},car:()=>ST.c,start,stop:()=>stop(),frame,follow,canDrive,
  info:()=>ST.on?{x:ST.x/10,z:ST.y/10,a:ST.a,kmh:Math.hypot(ST.vx,ST.vy)*3.6,gear:ST.rev?'R':ST.g+1,rpm:Math.round(900+ST.r/1.02*(RL-900)),spin:ST.spin,bumps:ST.nW,hits:ST.nC,lastHit:ST.lastHit}:null,
  keys:(o)=>{for(const k in K)K[k]=!!(o&&o[k])}};// keys(): test hook (recorder/localhost captures)
 if(location.hostname==='localhost'){window.__DRV=DRV;DRV.maskAt=(x,z,r)=>{if(!MK)buildMask();let o='';for(let j=-r;j<=r;j++){for(let i=-r;i<=r;i++)o+=okPx((x+i)*10,(z+j)*10)?'#':'.';o+='\n'}return o}}
 // ---------- deep link ?drive=<name> (after the 3D city has loaded; unknown names are ignored) ----------
 {const dv=(new URLSearchParams(location.search).get('drive')||'').trim().slice(0,24);
  if(dv&&!REC&&hasGL()){let n=0;const t=setInterval(()=>{if(++n>2400){clearInterval(t);return}if(!R3||subs===null||!WALL.length)return;
    const l=dv.toLowerCase(),norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,''),nm=WALL.find(x=>x===dv)||WALL.find(x=>x.toLowerCase()===l)||WALL.find(x=>norm(x)===norm(dv));
    if(!nm){if(n>200)clearInterval(t);return}
    const c=cars.find(q=>q.driver===nm&&q.kind==='car'&&!q.removed);if(!c){if(n>200)clearInterval(t);return}
    if(!canDrive(c))return;// at a shop or towed: wait until it is back on the road
    const wc=$('welcome');if(wc&&!wc.hidden)$('wcGo').click();
    if(start(c))clearInterval(t)},150)}}
}
