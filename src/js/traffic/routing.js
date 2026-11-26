//@ traffic/routing.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- routing & driving ----------
const axisOf=c=>nodes[c.to].ax[c.from]||'h';
function pathTo(c,goal){if(c.to===goal)return[];return bfs(c.to,c.from,goal)||bfs(c.to,-1,goal)||[]} // dead ends (cul-de-sacs): turn round if there is no way on
// route search over (node, came-from) states: never plans a U-turn in the middle of the road unless it is a dead end
function routeNoU(c,ok){if(ok.here&&ok(c.to,c.from))return[];const key=(u,p)=>u*4096+p,k0=key(c.to,c.from),prev=new Map([[k0,-1]]),q=[[c.to,c.from]];
 while(q.length){const[u,p]=q.shift(),k=key(u,p);if(k!==k0&&ok(u,p)){const r=[];let w=k;while(w!==k0){r.unshift(Math.floor(w/4096));w=prev.get(w)}return r}
  const nb=nodes[u].nb;for(const v of nb){if(v===p&&nb.length>1)continue;const k2=key(v,u);if(prev.has(k2))continue;prev.set(k2,k);q.push([v,u])}}
 return null}
function planRoute(c){
 const t=c.task;
 if(t.type==='tow'||t.type==='resc'){const tc=t.target;c.route=routeNoU(c,(u,p)=>u===tc.to&&p===tc.from)||pathTo(c,tc.from).concat([tc.to]);return}
 if(t.type==='chase'){const g=t.target.to,f=(u)=>u===g;f.here=true;c.route=routeNoU(c,f)||pathTo(c,g);return}
 if(!t.b||!t.b.seg){c.task=null;return}
 const[a,b]=t.b.seg;
 const r=routeNoU(c,(u,p)=>(u===b&&p===a)||(u===a&&p===b));
 if(r){c.route=r;return}
 const p1=pathTo(c,a).concat([b]),p2=pathTo(c,b).concat([a]);c.route=p1.length<=p2.length?p1:p2;
}
function randomNext(c){
 const n=nodes[c.to],opts=n.nb.filter(v=>v!==c.from);if(!opts.length)return c.from;
 // prefer going straight on half of the time (the road whose start points most like our heading)
 const t=edgeTan(c.to,c.from),hx=-t.x,hy=-t.y;let straight,bd=.7;for(const v of opts){const e=edgeTan(c.to,v),dd=e.x*hx+e.y*hy;if(dd>bd){bd=dd;straight=v}}
 if(straight!==undefined&&R()<.5)return straight;return pick(opts);
}
function freeSlot(Bd,c){const t=c.task;
 if(t.type==='deliver')return Bd.drop.car?null:Bd.drop;
 if(t.type==='parts')return Bd.parts.car?null:Bd.parts;
 if(t.type==='home')return c.home;
 return Bd.slots.find(s=>!s.car)||null;
}
function tryEnter(c,a,b){
 const Bd=c.task.b,s=freeSlot(Bd,c);
 if(!s){c.task.fails=(c.task.fails||0)+1;if(c.task.fails>(c.task.type==='svc'?0:3))giveUp(c);return false}
 s.car=c;c.slot=s;
 const sp=edgeS(a,b,Bd.door.x,Bd.door.y);
 const ap=approach(s);
 const lp=lanePt(a,b,sp-12);lp.cb=()=>{c.state='lot'};c.pts.push(lp,{x:Bd.door.x,y:Bd.door.y,cb:()=>{c.state='lot'}},ap,{x:s.x,y:s.y,cb:()=>arrive(c)});
 return true;
}
function giveUp(c){
 const t=c.task;if(t.type!=='svc'){t.fails=0;return}c.task=null;
 if(c.isNew&&t.b===B.stand){c.isNew=false;stats.sold++;log(`The dealership is full: a new ${c.model} was sold straight from the factory.`,'ok')}
}
function atNode(c){
 const n=nodes[c.to];
 if(!c.siren&&lightState(n,axisOf(c))!=='g'){c.waitRed=true;return}
 // roundabouts: give way to the cars already going round (at most 2 inside), so the circle never locks up
 // don't drive into the junction unless there is room on the road we are turning into (stops cars stacking on top of each other)
 if(!c.siren){const pk=c.loop?c.loop[(c.loop.indexOf(c.to)+1)%c.loop.length]:c.route.length?c.route[0]:(c.rn!=null&&nodes[c.to].nb.includes(c.rn)&&c.rnAt===c.to?c.rn:(c.rnAt=c.to,c.rn=randomNext(c)));
  let blk=false;for(const o of cars){if(o===c||o.state!=='road'||o.hidden||o.from!==c.to||o.to!==pk)continue;if(o.v>25)continue;if(Math.hypot(o.x-n.x,o.y-n.y)<HALF+(c.len+o.len)/2+14){blk=true;break}}
  if(blk&&(c.blockT=(c.blockT||0)+(c.ldt||1/60))<12){c.waitRed=true;return}c.blockT=0}
 if(n.round&&!c.siren){let inside=0;for(const o of cars)if(o!==c&&o.roundNode===c.to&&!o.removed)inside++;if(inside>=3){c.waitRed=true;return}c.roundNode=c.to}
 c.waitRed=false;
 if(c.task&&c.task.type==='chase')c.route=[];
 if(c.task&&!c.route.length)planRoute(c);
 const next=c.loop?c.loop[(c.loop.indexOf(c.to)+1)%c.loop.length]:c.route.length?c.route.shift():(c.rn!=null&&c.rnAt===c.to&&nodes[c.to].nb.includes(c.rn)?c.rn:randomNext(c));c.rn=null;c.rnAt=null;
 const tp=turnPts({x:c.x,y:c.y},c.from,c.to,next);
 const a=c.to,b=next;c.from=a;c.to=b;c.pts=tp;
 const t=c.task;
 if(t&&t.type==='tow'){const tc=t.target;if(tc.state==='broken'&&tc.from===a&&tc.to===b){hookPath(c,a,b);return}}
 else if(t&&t.b&&t.b.seg&&((t.b.seg[0]===a&&t.b.seg[1]===b)||(t.b.seg[0]===b&&t.b.seg[1]===a))){if(tryEnter(c,a,b))return}
 if(c.kind==='bus'||c.kind==='garbage'){const mp=lanePt(a,b,segDir(a,b).len/2);const k=c;mp.cb=()=>{k.arrestT=k.kind==='garbage'?2.5:2.2};c.pts.push(mp)}
 c.pts.push(stopPt(a,b));
}
function gapAhead(c){
 const hx=Math.cos(c.ang),hy=Math.sin(c.ang);let gp=1e9;
 for(const o of cars){
  if(o===c||o===c.towing||o.state==='lot'||o.state==='service'||o.state==='waitlift'||o.hidden||(c.task&&c.task.target===o))continue;
  // same directed road: measure along the road, so cars still finishing a turn see the queue in front of them
  if(o.state==='road'&&o.from===c.from&&o.to===c.to){const dx=o.x-c.x,dy=o.y-c.y,dd=Math.hypot(dx,dy);if(dd<120&&dx*hx+dy*hy>-4){const gg=dd-(c.len+o.len)/2;if(gg<gp)gp=gg}continue}
  const dx=o.x-c.x,dy=o.y-c.y,al=dx*hx+dy*hy;if(al<=0||al>90)continue;
  if(Math.abs(-dx*hy+dy*hx)<11){const gg=al-(c.len+o.len)/2;if(gg<gp)gp=gg}
 }
 return gp;
}
function wear(c,d){c.fuel=Math.max(2,c.fuel-d*.004);c.health=Math.max(5,c.health-d*.0004*(c.m.classic?1.6:1));c.dirt=Math.min(100,c.dirt+d*.003);c.km+=d*KM}
function stepCar(c,dt){
 if(c.arrestT>0){c.arrestT-=dt;c.v=0;c.brake=true;return}
 if(c.state==='towed'||c.state==='service'||c.state==='hooking'||c.state==='waitlift')return;
 const tgt=c.pts[0];let want=c.vmax;
 if((c.fault&&c.fault.k==='tire')||c.limp)want*=.45;
 if(c.state==='lot'){want=Math.min(want,50);if(tgt&&tgt.merge){for(const o of cars){if(o===c||o.state!=='road'||o.hidden)continue;const dd=Math.hypot(o.x-tgt.x,o.y-tgt.y);if(dd<(c.len+o.len)/2+16&&(c.mergeT=(c.mergeT||0)+dt)<8){const dm=dist(c,tgt);want=Math.min(want,Math.max(0,(dm-22)*2.5));break}}}}
 if(c.state==='broken')want=Math.min(want,30);
 if(c.state==='road'){
  if(c.ghost<=0){const gp=gapAhead(c);if(gp<6)want=0;else if(gp<46)want=Math.min(want,(gp-6)*3)}
  if(!c.siren&&tgt&&tgt.stop&&c.pts.length===1&&lightState(nodes[c.to],axisOf(c))!=='g'){const d=dist(c,tgt);want=Math.min(want,Math.max(0,(d-1)*2.6))}
 }
 if(tgt&&tgt.rev)want=Math.min(want,28);
 if(!tgt)want=0;
 const acc=want>c.v?120:320;c.v+=clamp(want-c.v,-acc*dt,acc*dt);
 c.brake=want<c.v-4||(c.v<2&&c.state==='road');
 let mv=c.v*dt;
 while(mv>0&&c.pts.length){
  const p=c.pts[0],dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy);
  if(d>.5&&!p.rev)c.ang=angLerp(c.ang,Math.atan2(dy,dx),Math.min(1,dt*12));
  if(d<=mv){c.x=p.x;c.y=p.y;mv-=d;c.pts.shift();if(c.state==='road')wear(c,d);if(p.cb)p.cb()}
  else{c.x+=dx/d*mv;c.y+=dy/d*mv;if(c.state==='road')wear(c,mv);mv=0}
 }
 if(c.roundNode!=null){const rn=nodes[c.roundNode];if(!rn||c.state!=='road'||Math.hypot(c.x-rn.x,c.y-rn.y)>HALF+22&&c.to!==c.roundNode)c.roundNode=null}
 if(c.state==='road'){
  const atRed=c.waitRed||(tgt&&tgt.stop&&c.pts.length===1&&lightState(nodes[c.to],axisOf(c))!=='g');
  if(c.v<2&&!atRed){c.stuck+=dt;if(c.stuck>25){c.ghost=1.6;c.stuck=0}}else c.stuck=0;
  if(c.ghost>0)c.ghost-=dt;
  if(!c.pts.length){c.ldt=dt;atNode(c)}
 }
}

