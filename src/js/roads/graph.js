//@ roads/graph.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- road graph (Phase 1B: built from CITY, roads/layout.js; edges are curved polylines in px) ----------
const nodes=CITY.G.nodes;
const nid=(i,j)=>CITY.NI[i]; // kept for old call sites: nid(name)
const EDGE=(a,b)=>CITY.G.E.get(CITY.ekey(a,b));
// clearance at a node: where the lanes stop before it and start after it
for(const n of nodes){let w=0;for(const m of n.nb)w=Math.max(w,EDGE(nodes.indexOf(n),m).w);n.clr=n.round?n.round+46:n.nb.length>=3?w/2+26:n.nb.length===1?40:18}
// direction of the road leaving node a toward b (unit), measured a few metres in
function edgeTan(a,b,s){const e=EDGE(a,b);const p=atEdge(e,s||0),q=atEdge(e,Math.min(e.len,(s||0)+30));const dx=q.x-p.x,dy=q.y-p.y,l=Math.hypot(dx,dy)||1;return{x:dx/l,y:dy/l}}
// traffic lights: junctions of four or more roads (not roundabouts); the roads split into two phases by direction
for(let i=0;i<nodes.length;i++){const n=nodes[i];n.ax={};if(n.round||n.nb.length<3)continue;const ref=edgeTan(i,n.nb[0]),ra=Math.atan2(ref.y,ref.x);
 for(const m of n.nb){const t=edgeTan(i,m);n.ax[m]=Math.abs(Math.cos(Math.atan2(t.y,t.x)-ra))>.7?'h':'v'}
 if(n.nb.length>=4&&!n.round)n.light={t:R()*20}}
const CYCLE=20;
function lightState(n,axis){if(!n.light)return'g';const t=n.light.t%CYCLE;
 if(axis==='h')return t<8?'g':t<10?'y':'r';return t>=10&&t<18?'g':t>=18?'y':'r'}
// a point on an edge polyline at arc length s (px), with its tangent
function atEdge(e,s){const L=e.L,P=e.P;s=clamp(s,0,e.len);let lo=0,hi=L.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(L[m]<=s)lo=m;else hi=m}
 const a=P[lo],b=P[hi],l=(L[hi]-L[lo])||1,t=(s-L[lo])/l,tx=(b[0]-a[0])/l,ty=(b[1]-a[1])/l;return{x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,tx,ty}}
// arc length of the point of an edge closest to (x,y)
function edgeS(a,b,x,y){const e=EDGE(a,b),P=e.P;let best=1e18,bs=0;for(let i=1;i<P.length;i++){const p=P[i-1],q=P[i],dx=q[0]-p[0],dy=q[1]-p[1],l2=dx*dx+dy*dy||1,t=clamp(((x-p[0])*dx+(y-p[1])*dy)/l2,0,1),d=(x-p[0]-dx*t)**2+(y-p[1]-dy*t)**2;if(d<best){best=d;bs=e.L[i-1]+t*Math.sqrt(l2)}}return bs}
// chord direction, right-hand normal, length and end nodes (old call sites); dx/dy also at any s with segAt
function segDir(a,b){const A=nodes[a],B=nodes[b],e=EDGE(a,b);const p=atEdge(e,0),q=atEdge(e,Math.min(e.len,40));let dx=q.x-p.x,dy=q.y-p.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;return{dx,dy,rx:-dy,ry:dx,len:e.len,A,B,e}}
function segAt(a,b,s){const p=atEdge(EDGE(a,b),s);return{dx:p.tx,dy:p.ty,rx:-p.ty,ry:p.tx,x:p.x,y:p.y}}
function lanePt(a,b,s){const e=EDGE(a,b),c0=nodes[a].clr,c1=nodes[b].clr;s=e.len>c0+c1?clamp(s,c0,e.len-c1):e.len/2;const p=atEdge(e,s);return{x:p.x-p.ty*e.lane,y:p.y+p.tx*e.lane}}
function stopPt(a,b){const p=lanePt(a,b,1e9);p.stop=true;return p}
function bfs(start,avoid,goal){
 if(start===goal)return[];
 const prev=new Map([[start,-1]]),q=[start];
 while(q.length){const u=q.shift();for(const v of nodes[u].nb){
  if(u===start&&v===avoid&&nodes[u].nb.length>1)continue;if(prev.has(v))continue;prev.set(v,u);
  if(v===goal){const p=[];let w=v;while(w!==start){p.unshift(w);w=prev.get(w)}return p}q.push(v)}}
 return null;
}
// the path through node b, from the end of the lane a->b (car at p0) to the start of the lane b->c
function turnPts(p0,a,b,c){
 const p2=lanePt(b,c,0),N=nodes[b];
 if(N.round){const RR=N.round,a0=Math.atan2(p0.y-N.y,p0.x-N.x),a1=Math.atan2(p2.y-N.y,p2.x-N.x);let da=a0-a1;while(da<=0.35)da+=TAU;if(da>TAU+.35)da-=TAU;
  const out=[];out.push({x:N.x+Math.cos(a0-.35)*RR,y:N.y+Math.sin(a0-.35)*RR});const n=Math.max(6,Math.round(da/.2));for(let i=1;i<=n;i++){const t=a0-.35-(da-.7)*i/n;out.push({x:N.x+Math.cos(t)*RR,y:N.y+Math.sin(t)*RR})}out.push(p2);return out}
 const ea=EDGE(b,a),t1=atEdge(ea,0),t2=atEdge(EDGE(b,c),0);
 // incoming heading = minus the tangent of b->a at b; outgoing heading = tangent of b->c at b
 const h1x=-t1.tx,h1y=-t1.ty,h2x=t2.tx,h2y=t2.ty;const d=Math.hypot(p2.x-p0.x,p2.y-p0.y);const k=c===a?Math.max(26,d*.9):Math.max(8,d*.42);
 const c1={x:p0.x+h1x*k,y:p0.y+h1y*k},c2={x:p2.x-h2x*k,y:p2.y-h2y*k};const out=[];const n=c===a?12:Math.max(4,Math.min(12,Math.round(d/14)));
 for(let i=1;i<=n;i++){const t=i/n,u=1-t;out.push({x:u*u*u*p0.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*p2.x,y:u*u*u*p0.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*p2.y})}
 return out;
}
