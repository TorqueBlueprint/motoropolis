//@ people/walkers.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- people: the Wall of Mechanics walks the sidewalks and drives the cars ----------
const WALL=(()=>{const out=[];for(const raw of(Array.isArray(STATE.names)?STATE.names:[])){const n=String(raw).trim().slice(0,24);if(n&&!out.some(x=>x.toLowerCase()===n.toLowerCase()))out.push(n)}return out})();
const PED_COLS=@@JSON:people/shirt_colors.json@@;
const SKIN=@@JSON:people/skin_tones.json@@;
const peds=[];
// Phase 1B sidewalks: the walkers follow the town roads on either side and cross at the junctions (a random walk through
// the streets, more of them downtown). Own random sequence, so Math.random (and every interior) keeps its numbers.
const SWK=(()=>{let sd=97531;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};const P0=CITY.P0;
 const town=(x,z)=>CITY.districts.some(d=>d.id!=='farms'&&Math.hypot(x-d.x,z-d.z)<d.r+40)||Math.hypot(x-P0.x,z-P0.z)<330;
 const E=[];CITY.edges.forEach(e=>{if(e.amb||e.k==='hwy'||e.len<12)return;const m=e.P[Math.floor(e.P.length/2)];if(!town(m[0],m[1]))return;
  const L=[0];for(let k=1;k<e.P.length;k++)L.push(L[k-1]+Math.hypot(e.P[k][0]-e.P[k-1][0],e.P[k][1]-e.P[k-1][1]));
  const trim=n=>CITY.nodes[n].round?CITY.nodes[n].round+11:CITY.nodes[n].edges.length>2?e.w/2+3.5:CITY.nodes[n].edges.length===1?0:1;
  E.push({e,L,len:L[L.length-1],t0:trim(e.a),t1:trim(e.b),off:e.w/2+(e.k==='lane'?.7:e.road==='west'?2.0:1.1)/* west: the shopping street has parked cars along the kerb (world/city2_roads.js), walk behind them */,wt:1/(1+Math.hypot(m[0]-P0.x,m[1]-P0.z)/120)})});
 const by=new Map();E.forEach((q,k)=>{for(const n of[q.e.a,q.e.b]){if(!by.has(n))by.set(n,[]);by.get(n).push(k)}});
 const tot=E.reduce((a,q)=>a+q.wt,0);
 const pickE=()=>{let u=r()*tot;for(let k=0;k<E.length;k++){u-=E[k].wt;if(u<=0)return k}return E.length-1};
 // point on edge k at arc length s (m), side +1 right of a->b, -1 left; returns px
 const at=(k,s,side)=>{const q=E[k],P=q.e.P,L=q.L;s=Math.max(0,Math.min(q.len,s));let i=1;while(i<L.length-1&&L[i]<s)i++;const a=P[i-1],b=P[i],l=(L[i]-L[i-1])||1,t=(s-L[i-1])/l,tx=(b[0]-a[0])/l,tz=(b[1]-a[1])/l;
  return{x:(a[0]+(b[0]-a[0])*t-tz*q.off*side)*10,y:(a[1]+(b[1]-a[1])*t+tx*q.off*side)*10,tx,tz}};
 return{r,E,by,pickE,at}})();
function wkStart(p){const W=SWK,k=W.pickE(),q=W.E[k];p.wk={k,dir:W.r()<.5?1:-1,side:W.r()<.5?1:-1,s:q.t0+W.r()*Math.max(0,q.len-q.t0-q.t1),cross:null}}
function wkPos(p){const w=p.wk,W=SWK;if(w.cross){const c=w.cross,t=Math.min(1,c.t/c.len);
 if(c.arc){const a=c.a0+c.da*t,r=c.r0+(c.r1-c.r0)*t;return{x:c.cx+Math.cos(a)*r,y:c.cy+Math.sin(a)*r,ang:a+(c.da>0?Math.PI/2:-Math.PI/2)}}
 return{x:c.x0+(c.x1-c.x0)*t,y:c.y0+(c.y1-c.y0)*t,ang:Math.atan2(c.y1-c.y0,c.x1-c.x0)}}
 const q=W.at(w.k,w.s,w.side);return{x:q.x,y:q.y,ang:Math.atan2(q.tz*w.dir,q.tx*w.dir)}}
function wkStep(p,d){const w=p.wk,W=SWK;if(w.cross){w.cross.t+=d;if(w.cross.t>=w.cross.len)w.cross=null;return}
 const q=W.E[w.k];w.s+=d*w.dir;const end=w.dir>0?q.len-q.t1:q.t0;if(w.dir>0?w.s<end:w.s>end)return;
 // end of the block: carry on along another street of this junction (back the same way only at a dead end)
 const node=w.dir>0?q.e.b:q.e.a,here=W.at(w.k,end,w.side);let opts=(W.by.get(node)||[]).filter(k=>k!==w.k);if(!opts.length)opts=[w.k];
 const k2=opts[Math.floor(W.r()*opts.length)],q2=W.E[k2],dir2=q2.e.a===node?1:-1,rel=w.side*w.dir,keep=W.r()<.7?rel:-rel,side2=keep*dir2,s2=dir2>0?q2.t0:q2.len-q2.t1;
 const there=W.at(k2,s2,side2);w.k=k2;w.dir=dir2;w.side=side2;w.s=s2;// at the roundabout and at junctions walk round the corner (an arc around the node, crossing each road near its stop line), never diagonally through the middle
 const nd=CITY.nodes[node];if(nd.round||nd.edges.length>2){const cx=nd.x*10,cy=nd.z*10,a0=Math.atan2(here.y-cy,here.x-cx),r0=Math.hypot(here.x-cx,here.y-cy),r1=Math.hypot(there.x-cx,there.y-cy);
  let da=Math.atan2(there.y-cy,there.x-cx)-a0;while(da>Math.PI)da-=2*Math.PI;while(da<=-Math.PI)da+=2*Math.PI;
  const len=Math.abs(da)*(r0+r1)/20;if(len>.3)w.cross={arc:true,cx,cy,a0,da,r0,r1,t:0,len};return}
 const len=Math.hypot(there.x-here.x,there.y-here.y)/10;if(len>.3)w.cross={x0:here.x,y0:here.y,x1:there.x,y1:there.y,t:0,len}}
function pedPos(p){if(p.wk){const q=wkPos(p);p.h=CITY.gy(q.x/10,q.y/10)+(buildings.some(b=>inLotB(b,q.x,q.y,14))?.3:.02);return q}p.h=null;const r=p.loop,w=r.x1-r.x0,h=r.y1-r.y0,P=2*(w+h);let s=((p.s%P)+P)%P;
 if(s<w)return{x:r.x0+s,y:r.y0,ang:0};s-=w;if(s<h)return{x:r.x1,y:r.y0+s,ang:Math.PI/2};s-=h;if(s<w)return{x:r.x1-s,y:r.y1,ang:Math.PI};s-=w;return{x:r.x0,y:r.y1-s,ang:-Math.PI/2}}
function mkPed(name,k){
 const b=buildings[(k*5+2)%buildings.length],o=6;
 const p={name,loop:{x0:b.x0-o,y0:b.y0-o,x1:b.x1+o,y1:b.y1+o},s:R()*1200,v:rr(10,15)*(R()<.5?-1:1),col:pick(PED_COLS),skin:pick(SKIN),hair:pick(['#2b1d14','#5a3a22','#c9a25a','#111','#8a4b2a']),pause:0,phase:R()*TAU,x:0,y:0,ang:0};
 wkStart(p);Object.assign(p,pedPos(p));peds.push(p);return p}
// every subscriber on the wall walks in the city; fewer anonymous walkers as the wall grows
WALL.slice(0,150).forEach((n,k)=>mkPed(n,k));
for(let k=0,na=Math.max(6,26-Math.max(0,WALL.length-40));k<na;k++)mkPed(null,k+WALL.length);
// strollers and joggers on the loop path of Motoropolis Park
const PARK_LOOP=(()=>{const b=B.park;return{x0:b.x0+26,y0:b.y0+26,x1:b.x1-26,y1:b.y1-26}})();
for(let k=0;k<9;k++){const p=mkPed(null,k+90);p.wk=null;p.loop={...PARK_LOOP};p.s=k*140;p.v=(k%3===0?rr(26,32):rr(8,12))*(k%2?-1:1);Object.assign(p,pedPos(p))}
function parkRanger(){for(const q of peds){if(q.name&&jobOf(q.name)==='Homeless'&&(q.wk||q.loop.x0!==PARK_LOOP.x0)){q.wk=null;q.loop={...PARK_LOOP};q.v=rr(4,6)*(R()<.5?-1:1);q.col='#7a6a55';Object.assign(q,pedPos(q))}}
 const n=staffOf('park','Park Ranger',0);if(!n)return;const p=peds.find(q=>q.name===n);if(p&&(p.wk||p.loop.x0!==PARK_LOOP.x0)){p.wk=null;p.loop={...PARK_LOOP};p.col='#2e7d4f';Object.assign(p,pedPos(p))}}
// road crossings: a walker about to step off the kerb waits for a gap in the traffic (at most 8 s; up to 40 s while a car
// stands on the crossing) and, once on the asphalt, keeps going: no stopping in the middle of the road, only a moment's
// hesitation (2 s at most) to let a moving car clear the spot right in front. The cars brake for the walkers on the road
// (pedGap, traffic/routing.js stepCar)
const onAsph=(x,y)=>CITY.roadD(x/10,y/10)<0;
var pedsOnRoad=[];// var: the cars may ask (pedGap) before this line has run
function wkPeek(p,d){const c=p.wk.cross,t0=c.t;c.t=Math.min(c.len,t0+d);const q=wkPos(p);c.t=t0;return q}
const carBoxD=(o,x,y)=>{const cs=Math.cos(o.ang),sn=Math.sin(o.ang),dx=x-o.x,dy=y-o.y;return Math.hypot(Math.max(0,Math.abs(dx*cs+dy*sn)-o.len/2),Math.max(0,Math.abs(dy*cs-dx*sn)-o.wid/2))};
const roadCar=o=>o.state==='road'&&!o.hidden&&!o.removed&&!(o.ghost>0);
// at the kerb: 0 go, 2 a car stands on (or is driving over) the way across, 1 a car is coming (within ~15 m and heading this way, or within ~6 m)
function kerbBlock(p){const c=p.wk.cross,e=wkPeek(p,.8);if(!onAsph(e.x,e.y))return 0;const near=[];
 for(const o of cars)if(roadCar(o)&&Math.abs(o.x-e.x)<260&&Math.abs(o.y-e.y)<260)near.push(o);if(!near.length)return 0;
 for(let s=.8;s<=Math.min(c.len-c.t,20);s+=1){const q=wkPeek(p,s);if(!onAsph(q.x,q.y))continue;for(const o of near)if(carBoxD(o,q.x,q.y)<10)return 2}
 for(const o of near){const dx=e.x-o.x,dy=e.y-o.y,d=Math.hypot(dx,dy);if(o.v>3&&(d<60+o.len/2||d<150+o.len/2&&dx*Math.cos(o.ang)+dy*Math.sin(o.ang)>d*.3))return 1}
 return 0}
// px from the front of car c to the nearest walker on the asphalt in its lane ahead (1e9 when none). A crossing walker
// counts with the rest of their way over the road (xPts), so the car stops short of the crossing, not on it
function pedGap(c){if(!pedsOnRoad||!pedsOnRoad.length)return 1e9;const lw=Math.max(20,c.wid/2+11);let g=1e9;
 // along the car's heading and, while it turns, toward the point it is steering for
 const dirs=[[Math.cos(c.ang),Math.sin(c.ang)]],t=c.pts[0];if(t){const tx=t.x-c.x,ty=t.y-c.y,tl=Math.hypot(tx,ty);if(tl>8&&(tx*dirs[0][0]+ty*dirs[0][1])/tl<.97)dirs.push([tx/tl,ty/tl])}
 for(const p of pedsOnRoad){if(Math.abs(p.x-c.x)>300||Math.abs(p.y-c.y)>300)continue;for(const q of p.xPts)for(const[hx,hy]of dirs){const dx=q.x-c.x,dy=q.y-c.y,al=dx*hx+dy*hy-c.len/2;if(al<-3||al>110)continue;if(Math.abs(-dx*hy+dy*hx)<lw&&al<g)g=Math.max(0,al)}}return g}
function stepPeds(dt){pedsOnRoad=[];for(const p of peds){
 const asph=!!p.wk&&onAsph(p.x,p.y),xr=asph&&!!p.wk.cross;
 if(asph){p.xPts=[p];if(xr)for(let d=1.2;d<20&&d<p.wk.cross.len-p.wk.cross.t;d+=1.2){const q=wkPeek(p,d);if(onAsph(q.x,q.y))p.xPts.push(q)}pedsOnRoad.push(p)}
 if(!(p.wk&&p.wk.cross))p.xWait=p.xHold=0;
 if(p.pause>0){p.pause-=dt;continue}
 if(R()<dt*.025&&!asph)p.pause=rr(1.5,4);
 // a sidewalk that runs over the asphalt (inside of a bend): turn back rather than walk into a car standing there
 if(asph&&!xr){const q=wkPos(p),hx=Math.cos(q.ang),hy=Math.sin(q.ang),fx=p.x+hx*8,fy=p.y+hy*8;if(cars.some(o=>roadCar(o)&&Math.abs(o.x-fx)<60&&Math.abs(o.y-fy)<60&&carBoxD(o,fx,fy)<8))p.wk.dir=-p.wk.dir}
 if(xr){p.xWait=0;if((p.xHold||0)<2){const q=wkPeek(p,.7);if(cars.some(o=>roadCar(o)&&o.v>5&&Math.abs(o.x-q.x)<60&&Math.abs(o.y-q.y)<60&&carBoxD(o,q.x,q.y)<6)){p.pause=.15;p.xHold=(p.xHold||0)+.15;continue}}}
 else if(p.wk&&p.wk.cross&&(p.xWait||0)<40){p.xHold=0;const k=kerbBlock(p);if(k===2||k===1&&(p.xWait||0)<8){p.pause=.25;p.xWait=(p.xWait||0)+.25;continue}}
 p.phase+=dt*Math.abs(p.v)*.6;if(p.wk){wkStep(p,Math.abs(p.v)*dt/10);const q=pedPos(p);p.x=q.x;p.y=q.y;p.ang=q.ang;continue}
 p.s+=p.v*dt;const q=pedPos(p);p.x=q.x;p.y=q.y;p.ang=p.v<0?q.ang+Math.PI:q.ang}}

