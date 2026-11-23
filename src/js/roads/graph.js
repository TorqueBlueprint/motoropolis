//@ roads/graph.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- road graph ----------
const nid=(i,j)=>j*NX+i;
const nodes=[];
for(let j=0;j<NY;j++)for(let i=0;i<NX;i++)nodes.push({i,j,x:XS[i],y:YS[j],nb:[],light:null});
for(const n of nodes){
 if(n.i>0)n.nb.push(nid(n.i-1,n.j));if(n.i<NX-1)n.nb.push(nid(n.i+1,n.j));
 if(n.i!==CANAL_I){if(n.j>0)n.nb.push(nid(n.i,n.j-1));if(n.j<NY-1)n.nb.push(nid(n.i,n.j+1))}
 n.round=ROUND_IJ.some(([i,j])=>i===n.i&&j===n.j);
 if(n.nb.length>=3&&!n.round)n.light={t:R()*20};
}
const CYCLE=20;
function lightState(n,axis){if(!n.light)return'g';const t=n.light.t%CYCLE;
 if(axis==='h')return t<8?'g':t<10?'y':'r';return t>=10&&t<18?'g':t>=18?'y':'r'}
function segDir(a,b){const A=nodes[a],B=nodes[b];const dx=Math.sign(B.x-A.x),dy=Math.sign(B.y-A.y);return{dx,dy,rx:-dy,ry:dx,len:Math.abs(B.x-A.x)+Math.abs(B.y-A.y),A,B}}
function lanePt(a,b,s){const d=segDir(a,b);s=clamp(s,HALF+6,d.len-HALF-40);return{x:d.A.x+d.dx*s+d.rx*LANE,y:d.A.y+d.dy*s+d.ry*LANE}}
function stopPt(a,b){const p=lanePt(a,b,1e9);p.stop=true;return p}
function bfs(start,avoid,goal){
 if(start===goal)return[];
 const prev=new Map([[start,-1]]),q=[start];
 while(q.length){const u=q.shift();for(const v of nodes[u].nb){
  if(u===start&&v===avoid&&nodes[u].nb.length>1)continue;if(prev.has(v))continue;prev.set(v,u);
  if(v===goal){const p=[];let w=v;while(w!==start){p.unshift(w);w=prev.get(w)}return p}q.push(v)}}
 return null;
}
function turnPts(p0,a,b,c){
 const d1=segDir(a,b),p2=lanePt(b,c,0);
 if(nodes[b].round){const N=nodes[b],RR=25,a0=Math.atan2(p0.y-N.y,p0.x-N.x),a1=Math.atan2(p2.y-N.y,p2.x-N.x);let da=a0-a1;while(da<=0.35)da+=TAU;if(da>TAU+.35)da-=TAU;
  const out=[];const e0={x:N.x+Math.cos(a0-.35)*RR,y:N.y+Math.sin(a0-.35)*RR};out.push(e0);const n=Math.max(6,Math.round(da/.3));for(let i=1;i<=n;i++){const a=a0-.35-(da-.7)*i/n;out.push({x:N.x+Math.cos(a)*RR,y:N.y+Math.sin(a)*RR})}out.push(p2);return out}
 let cx,cy;
 if(c===a){cx=p0.x+d1.dx*34;cy=p0.y+d1.dy*34;const d2=segDir(b,c);cx+=d2.rx*0+(-d1.rx)*14;cy+=(-d1.ry)*14}
 else{const k=(p2.x-p0.x)*d1.dx+(p2.y-p0.y)*d1.dy;cx=p0.x+d1.dx*k;cy=p0.y+d1.dy*k}
 const out=[];for(let i=1;i<=8;i++){const t=i/8,u=1-t;out.push({x:u*u*p0.x+2*u*t*cx+t*t*p2.x,y:u*u*p0.y+2*u*t*cy+t*t*p2.y})}
 return out;
}

