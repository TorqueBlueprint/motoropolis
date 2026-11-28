//@ sim/update.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- update ----------
let homeT=2;
function update(dt){
 simTime+=dt;
 for(const n of nodes)if(n.light)n.light.t+=dt;
 // keep the streets flowing: when too many cars are out, some idle ones go home for a while (they still count as subscribers' cars)
 homeT-=dt;if(homeT<=0){homeT=1.5;const cap=Math.round(nodes.reduce((t,n)=>t+n.nb.length,0)*(WORLD?.4:.55));let onRoad=0;for(const c of cars)if(c.state==='road'&&!c.removed)onRoad++;
  if(onRoad>cap){const idle=cars.filter(c=>c.kind==='car'&&c.state==='road'&&!c.task&&!c.fault&&!c.stolen&&!c.emerg&&!c.removed&&!c.towedBy&&!c.forceBreak&&c.ghost<=0);for(let k=0;k<Math.min(onRoad-cap,3)&&idle.length;k++){const c=idle.splice(Math.floor(R()*idle.length),1)[0];c.state='home';c.homeLeft=rr(25,70);c.hx=c.x;c.hy=c.y;c.x=-9000;c.y=-9000;c.v=0;c.pts=[];c.route=[]}}
  else if(onRoad<cap-2){const home=cars.filter(c=>c.state==='home'&&c.homeLeft<=0);for(let k=0;k<Math.min(cap-2-onRoad,2)&&k<home.length;k++){const c=home[k];if(!placeOnRoad(c)){c.x=-9000;c.y=-9000;c.state='home'}}}}
 for(const c of cars){
  if(c.removed)continue;
  if(c.state==='home'){c.homeLeft-=dt;continue}
  if(c.state==='service'){c.timer-=dt;if(c.timer<=0)finishService(c);continue}
  if(c.state==='hooking'){c.timer-=dt;if(c.timer<=0)finishHook(c);continue}
  if(c.state==='drive')continue; // a viewer is driving it (cars/drive.js)
  stepCar(c,dt);
  c.checkT-=dt;if(c.checkT<=0){c.checkT=1;brain(c);if(c.state==='waitlift')tryLift(c)}
 }
 for(const c of cars)if(c.towing){const t=c,tc=c.towing,k=(t.len+tc.len)/2+4;tc.ang=t.ang;tc.x=t.x-Math.cos(t.ang)*k;tc.y=t.y-Math.sin(t.ang)*k}
 cars=cars.filter(c=>!c.removed);
 dispatchT-=dt;if(dispatchT<=0){dispatchT=.5;dispatch()}
 crimeTick(dt);emergTick(dt);leagueTick(dt);
 secT-=dt;if(secT<=0){secT=1;if(subs!==null)cityHousekeeping()}
 for(const c of cars)if(c.newT>0)c.newT-=dt;
 if(subToast){subToast.t+=dt;if(subToast.t>3)subToast=null}
 if(!celeb&&celebQ.length)celeb={...celebQ.shift(),t:0};
 if(celeb){celeb.t+=dt;if(celeb.t>(trailer?1.8:4.5))celeb=null}
 stepPeds(dt);
 // effects
 for(const c of cars){
  if(c.state==='broken'&&c.fault&&c.fault.smoke&&R()<dt*14)particles.push({x:c.x+Math.cos(c.ang)*c.len*.4,y:c.y+Math.sin(c.ang)*c.len*.4,vx:rr(-8,8),vy:rr(-26,-12),life:rr(1.4,2.6),t:0,kind:'smoke',r:rr(5,9)});
  if(c.state==='service'&&c.slot){const t=c.slot.b.type;
   if(t==='oficina'&&c.task&&c.task.type!=='parts'&&R()<dt*10){const a=R()*TAU;particles.push({x:c.x+rr(-8,8),y:c.y+rr(-10,10),vx:Math.cos(a)*70,vy:Math.sin(a)*70,life:.35,t:0,kind:'spark',r:2})}
   if(t==='lavagem'&&R()<dt*30)particles.push({x:c.x+rr(-16,16),y:c.y+rr(-12,12),vx:rr(-10,10),vy:rr(-10,10),life:rr(.8,1.5),t:0,kind:'bubble',r:rr(2,5)});
  }
 }
 if(emerg&&emerg.type==='fire'&&!emerg.arrived||emerg&&emerg.type==='fire'&&emerg.t<emerg.fix-3){const c=emerg.car;if(R()<dt*30)particles.push({x:c.x+rr(-8,8),y:c.y+rr(-6,6),vx:rr(-6,6),vy:rr(-40,-20),life:rr(.4,.8),t:0,kind:'flame',r:rr(5,8),col:'#ff8a1a'});if(R()<dt*8)particles.push({x:c.x,y:c.y,vx:rr(-8,8),vy:rr(-30,-14),life:rr(1.6,2.6),t:0,kind:'smoke',r:rr(6,10)})}
 const F=B.fabrica;if(R()<dt*5){const sp=lotPt(F,F.x0+F.w-48,F.y0+30);particles.push({x:sp.x+rr(-3,3),y:sp.y,vx:rr(4,14),vy:rr(-22,-10),life:rr(2,3.5),t:0,kind:'smoke',r:rr(6,11)})}
 for(const p of particles){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.kind==='smoke'||p.kind==='dust')p.r+=dt*6;if(p.kind==='confetti'){p.vy+=260*dt;p.vx*=.99}}
 particles=particles.filter(p=>p.t<p.life);if(particles.length>500)particles.splice(0,particles.length-500);
 for(const r of race){r.sp=1+Math.sin(simTime*.7+r.num)*.12;const before=r.t;r.t=(r.t+dt*.085*r.sp)%1;if(r.t<before)r.laps++}
}

