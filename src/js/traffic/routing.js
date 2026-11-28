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
 const n=nodes[c.to];let opts=n.nb.filter(v=>v!==c.from);if(!opts.length)return c.from;
 // cars out for a drive seldom turn into a dead end (cul-de-sacs, the end of the east avenue)
 {const thru=opts.filter(v=>nodes[v].nb.length>1);if(thru.length&&thru.length<opts.length&&R()<.85)opts=thru}
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
// the turn a car makes through node b (from a to c): 'R' right, 'L' left, 'S' straight, 'U' U-turn (right-hand traffic)
function turnOf(a,b,c){if(c===a)return'U';const t1=edgeTan(b,a),t2=edgeTan(b,c),hx=-t1.x,hy=-t1.y,cr=hx*t2.y-hy*t2.x,dt=hx*t2.x+hy*t2.y;return dt<-.8?'U':cr>.38?'R':cr<-.38?'L':'S'}
const nodeIx=n=>nodes.indexOf(n);
// is car o still crossing node n's junction box?
const inBox=(o,ni)=>o.boxN===ni&&o.from===ni&&o.state==='road'&&!o.hidden&&!o.removed&&Math.hypot(o.x-nodes[ni].x,o.y-nodes[ni].y)<nodes[ni].clr+o.len*.5+8;
// junction rules for a car standing at the stop point of a->b and about to drive through b toward pk:
// returns a reason to wait, or '' to go. Lights are checked before; sirens skip all of it.
function mustWait(c,pk,dt){const b=c.to,n=nodes[b];
 // 1. don't block the box: there must be room for the whole car on the road we turn into
 {const need=n.clr+c.len+(n.round?6:14);for(const o of cars){if(o===c||o.state!=='road'||o.hidden||o.removed||o.from!==b||o.to!==pk)continue;
   if(o.boxN===b&&inBox(o,b))continue; // still turning in front of us: the box rules below handle it
   const d=Math.hypot(o.x-n.x,o.y-n.y)-o.len/2;if(d<need&&o.v<45)return'room'}}
 // 2. roundabout: give way to the cars already going round (they come anticlockwise, from the larger angles)
 if(n.round){const a0=Math.atan2(c.y-n.y,c.x-n.x)-.35;let inside=0;
  for(const o of cars){if(o===c||o.state!=='road'||o.hidden||o.removed||o.from!==b)continue;const r=Math.hypot(o.x-n.x,o.y-n.y);if(r>n.round+42)continue;inside++;
   let u=Math.atan2(o.y-n.y,o.x-n.x)-a0;while(u>Math.PI)u-=TAU;while(u<=-Math.PI)u+=TAU;if(u>-.32&&u<1.35)return'yield'}
  return inside>=5?'full':''}
 // 3. dead end: one car at a time in the turning bulb
 if(n.loop){const L=n.loop,jx=L.x-L.hy*L.r,jy=L.y+L.hx*L.r;let k=0;for(const o of cars){if(o===c||o.state!=='road'||o.hidden||o.removed||o.from!==b||o.to!==c.from)continue;if(Math.hypot(o.x-L.x,o.y-L.y)>L.r+34)continue;k++;if(Math.hypot(o.x-jx,o.y-jy)<(c.len+o.len)/2+14||Math.hypot(o.x-c.x,o.y-c.y)<(c.len+o.len)/2+14)return'bulb'}return k>=2?'bulb':''}
 if(n.nb.length<3)return'';
 // 4. junction box: only cars whose paths cannot cross may be in it together (same approach, or opposite approaches
 //    with nobody turning left)
 const my=turnOf(c.from,b,pk),opp=m=>{const t1=edgeTan(b,c.from),t2=edgeTan(b,m);return t1.x*t2.x+t1.y*t2.y<-.7};
 for(const o of cars){if(o===c||!inBox(o,b))continue;if(o.boxFrom===c.from)continue;if(opp(o.boxFrom)&&my!=='L'&&o.boxTurn!=='L'&&my!=='U'&&o.boxTurn!=='U')continue;return'box'}
 if(n.light)return'';
 // 5. no lights: STOP for the narrower road (a full stop, then give way); equal roads give way to the right
 const myE=EDGE(c.from,b),minor=myE.w<n.wmax-1;
 if(minor&&c.stopAt!==b){c.stopT=(c.stopT||0)+dt;if(c.stopT<.9||c.v>4)return'stop';c.stopAt=b}
 const h=edgeTan(b,c.from),rx=h.y,ry=-h.x; // right of a car arriving (heading -h)
 for(const o of cars){if(o===c||o.state!=='road'||o.hidden||o.removed||o.to!==b||o.from===c.from)continue;const d=Math.hypot(o.x-n.x,o.y-n.y);if(d>n.clr+150)continue;
  if(o.waitRed&&o.waitWhy&&o.waitWhy!=='room'&&d<n.clr+20)continue; // it is waiting for us (or for the box)
  if(o.v<6&&d>n.clr+25)continue; // queued further back
  const oMinor=EDGE(o.from,b).w<n.wmax-1;if(minor&&!oMinor)return'giveway';if(!minor&&oMinor)continue;
  if((o.x-n.x)*rx+(o.y-n.y)*ry>0)return'right'}
 return''}
function atNode(c){
 const n=nodes[c.to];
 if(!c.siren&&lightState(n,axisOf(c))!=='g'){c.waitRed=true;c.waitWhy='red';return}
 if(!c.siren){const pk=c.loop?c.loop[(c.loop.indexOf(c.to)+1)%c.loop.length]:c.route.length?c.route[0]:(c.rn!=null&&nodes[c.to].nb.includes(c.rn)&&c.rnAt===c.to?c.rn:(c.rnAt=c.to,c.rn=randomNext(c)));
  const why=mustWait(c,pk,c.ldt||1/60);
  // nobody waits for ever: after a while the car goes (a deadlock between junctions would otherwise freeze the town)
  if(why){c.blockT=(c.blockT||0)+(c.ldt||1/60);if(c.blockT<(why==='stop'?3:why==='box'||why==='bulb'?22:why==='room'?16:9)){c.waitRed=true;c.waitWhy=why;return}}
  c.blockT=0}
 c.waitRed=false;c.waitWhy='';c.stopT=0;c.stopAt=-1;
 if(c.task&&c.task.type==='chase')c.route=[];
 if(c.task&&!c.route.length)planRoute(c);
 const next=c.loop?c.loop[(c.loop.indexOf(c.to)+1)%c.loop.length]:c.route.length?c.route.shift():(c.rn!=null&&c.rnAt===c.to&&nodes[c.to].nb.includes(c.rn)?c.rn:randomNext(c));c.rn=null;c.rnAt=null;
 const tp=turnPts({x:c.x,y:c.y},c.from,c.to,next);
 c.boxN=c.to;c.boxFrom=c.from;c.boxTurn=turnOf(c.from,c.to,next);
 const a=c.to,b=next;c.from=a;c.to=b;c.pts=tp;
 const t=c.task;
 if(t&&t.type==='tow'){const tc=t.target;if(tc.state==='broken'&&tc.from===a&&tc.to===b){hookPath(c,a,b);return}}
 else if(t&&t.b&&t.b.seg&&((t.b.seg[0]===a&&t.b.seg[1]===b)||(t.b.seg[0]===b&&t.b.seg[1]===a))){if(tryEnter(c,a,b))return}
 if(c.kind==='bus'||c.kind==='garbage'){const mp=lanePt(a,b,segDir(a,b).len/2);const k=c;mp.cb=()=>{k.arrestT=k.kind==='garbage'?2.5:2.2};c.pts.push(mp)}
 c.pts.push(stopPt(a,b));
}
function gapAhead(c){
 const hx=Math.cos(c.ang),hy=Math.sin(c.ang);let gp=1e9;c.gapO=null;
 for(const o of cars){
  // the car a viewer drives (cars/drive.js): anything in our path, whatever way it faces
  if(o.state==='drive'){if(o===c||o.hidden)continue;const dx=o.x-c.x,dy=o.y-c.y,al=dx*hx+dy*hy;if(al>0&&al<120&&Math.abs(-dx*hy+dy*hx)<(c.wid+o.wid)/2+8){const gg=al-(c.len+o.len)/2;if(gg<gp){gp=gg;c.gapO=o}}continue}
  if(o===c||o===c.towing||o.state==='lot'||o.state==='service'||o.state==='waitlift'||o.hidden||(c.task&&c.task.target===o))continue;
  // same directed road: measure along the road, so cars still finishing a turn see the queue in front of them
  if(o.state==='road'&&o.from===c.from&&o.to===c.to){const dx=o.x-c.x,dy=o.y-c.y,dd=Math.hypot(dx,dy),al=dx*hx+dy*hy;if(dd<120&&(al>4||al>-4&&o.id<c.id)){const gg=dd-(c.len+o.len)/2;if(gg<gp){gp=gg;c.gapO=o}}continue}
  const dx=o.x-c.x,dy=o.y-c.y,al=dx*hx+dy*hy;if(al<=0||al>90)continue;
  // oncoming cars (other lane, or curving past) are not a queue in front of us unless they really are in our way
  if(Math.cos(o.ang-c.ang)<-.3&&(Math.abs(-dx*hy+dy*hx)>6||al>(c.len+o.len)/2+6))continue;
  if(Math.abs(-dx*hy+dy*hx)<11){const gg=al-(c.len+o.len)/2;if(gg<gp){gp=gg;c.gapO=o}}
 }
 return gp;
}
function wear(c,d){c.fuel=Math.max(2,c.fuel-d*.004);c.health=Math.max(5,c.health-d*.0004*(c.m.classic?1.6:1));c.dirt=Math.min(100,c.dirt+d*.003);c.km+=d*KM}
function stepCar(c,dt){
 if(c.arrestT>0){c.arrestT-=dt;c.v=0;c.brake=true;return}
 if(c.state==='towed'||c.state==='service'||c.state==='hooking'||c.state==='waitlift')return;
 const tgt=c.pts[0];let want=c.vmax;
 if((c.fault&&c.fault.k==='tire')||c.limp)want*=.45;
 if(c.state==='lot'){want=Math.min(want,50);if(tgt&&tgt.merge){for(const o of cars){if(o===c||o.hidden||o.state!=='road'&&!(o.state==='lot'&&o.id<c.id&&o.pts[0]&&o.pts[0].merge&&dist(o,o.pts[0])<40))continue;const dd=Math.hypot(o.x-tgt.x,o.y-tgt.y);if(dd<(c.len+o.len)/2+4||dd<(c.len+o.len)/2+16&&(c.mergeT=(c.mergeT||0)+dt)<20){const dm=dist(c,tgt);want=Math.min(want,Math.max(0,(dm-22)*2.5));break}}}}
 if(c.state==='broken')want=Math.min(want,30);
 if(c.state==='road'){
  if(c.ghost<=0){const gp=gapAhead(c);if(gp<6)want=0;else if(gp<46)want=Math.min(want,(gp-6)*3)
   // walkers crossing the road in front: brake and stop ~2.5 m short of them (people/walkers.js)
   const pg=pedGap(c);c.pedStop=pg<25;if(pg<25)want=0;else if(pg<110)want=Math.min(want,(pg-25)*2.2)}
  if(!c.siren&&tgt&&tgt.stop&&c.pts.length===1){const N=nodes[c.to];const red=lightState(N,axisOf(c))!=='g';if(red||(!N.light&&!N.round&&N.nb.length>=3&&c.stopAt!==c.to&&EDGE(c.from,c.to).w<N.wmax-1)||N.round||N.loop){const d=dist(c,tgt);want=Math.min(want,Math.max(red?0:N.round||N.loop?28:8,(d-1)*2.6))}}
 }
 if(tgt&&tgt.rev)want=Math.min(want,28);
 if(!tgt)want=0;
 const acc=want>c.v?120:320;c.v+=clamp(want-c.v,-acc*dt,acc*dt);
 c.brake=want<c.v-4||(c.v<2&&c.state==='road');
 let mv=c.v*dt;
 while(mv>0&&c.pts.length){
  const p=c.pts[0];let dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy);
  // a point further along the lane of the road the car is on: follow the curve of the road (a carrot ~4 m ahead on the lane)
  if(p.ln&&d>44&&c.state==='road'&&c.from===p.ln[0]&&c.to===p.ln[1]){const sc=edgeS(p.ln[0],p.ln[1],c.x,c.y),q=lanePt(p.ln[0],p.ln[1],Math.min(p.s,sc+40)),qd=Math.hypot(q.x-c.x,q.y-c.y);
   if(qd>1&&Math.hypot(q.x-p.x,q.y-p.y)>2){dx=(q.x-c.x)/qd;dy=(q.y-c.y)/qd;const m=Math.min(mv,qd*.5);c.ang=angLerp(c.ang,Math.atan2(dy,dx),Math.min(1,dt*12));c.x+=dx*m;c.y+=dy*m;wear(c,m);mv-=m;if(m<mv*.01||m<=0)break;continue}}
  if(d>.5&&!p.rev)c.ang=angLerp(c.ang,Math.atan2(dy,dx),Math.min(1,dt*12));
  if(d<=mv){c.x=p.x;c.y=p.y;mv-=d;c.pts.shift();if(c.state==='road')wear(c,d);if(p.cb)p.cb()}
  else{c.x+=dx/d*mv;c.y+=dy/d*mv;if(c.state==='road')wear(c,mv);mv=0}
 }
 if(c.state==='road'){
  const atRed=c.waitRed||(tgt&&tgt.stop&&c.pts.length===1&&lightState(nodes[c.to],axisOf(c))!=='g');
  // queued: the chain of cars in front ends at one that moves or waits at a junction (not a ring of cars blocking each other)
  let queued=false;{let q=c.gapO;if(q&&Math.cos(q.ang-c.ang)>.3&&gapAhead(c)<16)for(let k=0;q&&k<40;k++){if(q===c||q.state!=='road'||q.removed||q.hidden)break;if(q.v>=2||q.waitRed){queued=true;break}q=q.gapO}}
  if(c.v<2&&!atRed&&!queued){c.stuck+=dt;if(c.stuck>25){c.ghost=1.6;c.stuck=0}}else if(!queued||c.v>=2)c.stuck=0;
  if(c.ghost>0)c.ghost-=dt;
  if(!c.pts.length){c.ldt=dt;atNode(c)}
 }
}

