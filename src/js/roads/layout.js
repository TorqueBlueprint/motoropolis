//@ roads/layout.js - Phase 1B: the organic city layout, built from src/data/world/city_layout.json (data-driven).
//@ closure scope (top level of the page IIFE), before roads/graph.js. Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
//@ CITY = { nodes, edges, roads (sampled polylines in metres), lots, xst, towerlot, fill items, house/shed slots, bridges,
//@   inSea(), inRiver(), riverZ(), h() (hill height), gy() (ground + bridge decks), free() (open land test), ... }.
//@ Everything is in metres (x east, z south); the simulation uses px = metres x 10. Own random sequence (never Math.random).
const LAYOUT=@@JSON:world/city_layout.json@@;
const CITY=(()=>{
 const L=LAYOUT,TW=Math.PI*2;let sd=20261126;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
 const W={main:8,street:6.5,lane:5,hwy:13};
 // ---- curves ----
 function cr(P,step){// centripetal Catmull-Rom through P (open), sampled every ~step m; returns pts and the index of every control point
  if(P.length<3){const out=[],idx=[0];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));for(let k=0;k<n;k++)out.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);idx.push(out.length)}out.push(P[P.length-1].slice());return{pts:out,idx}}
  const Q=[[2*P[0][0]-P[1][0],2*P[0][1]-P[1][1]],...P,[2*P[P.length-1][0]-P[P.length-2][0],2*P[P.length-1][1]-P[P.length-2][1]]];
  const out=[],idx=[0];
  for(let i=1;i<Q.length-2;i++){const p0=Q[i-1],p1=Q[i],p2=Q[i+1],p3=Q[i+2];
   const tj=(a,b)=>Math.pow(Math.hypot(b[0]-a[0],b[1]-a[1])||1e-3,.5),t0=0,t1=t0+tj(p0,p1),t2=t1+tj(p1,p2),t3=t2+tj(p2,p3);
   const n=Math.max(1,Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/step));
   for(let k=0;k<n;k++){const t=t1+(t2-t1)*k/n,r=[0,1].map(c=>{const A1=(t1-t)/(t1-t0)*p0[c]+(t-t0)/(t1-t0)*p1[c],A2=(t2-t)/(t2-t1)*p1[c]+(t-t1)/(t2-t1)*p2[c],A3=(t3-t)/(t3-t2)*p2[c]+(t-t2)/(t3-t2)*p3[c];
     const B1=(t2-t)/(t2-t0)*A1+(t-t0)/(t2-t0)*A2,B2=(t3-t)/(t3-t1)*A2+(t-t1)/(t3-t1)*A3;return (t2-t)/(t2-t1)*B1+(t-t1)/(t2-t1)*B2});out.push(r)}
   idx.push(out.length)}
  out.push(P[P.length-1].slice());return{pts:out,idx}}
 function arcPts(c,A,B,step){const a0=Math.atan2(A[1]-c[1],A[0]-c[0]);let a1=Math.atan2(B[1]-c[1],B[0]-c[0]);while(a1<=a0)a1+=TW;const n=Math.max(2,Math.ceil((a1-a0)*c[2]/step)),o=[];for(let k=0;k<n;k++){const a=a0+(a1-a0)*k/n;o.push([c[0]+Math.cos(a)*c[2],c[1]+Math.sin(a)*c[2]])}return o}
 const plen=P=>{let s=0;for(let i=1;i<P.length;i++)s+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return s};
 // ---- nodes and edges ----
 const nodes=[],NI={};
 const addNode=(name,x,z,o)=>{const n={name,x,z,round:o&&o.round||0,edges:[]};NI[name]=nodes.length;nodes.push(n);return NI[name]};
 for(const k in L.nodes){const v=L.nodes[k];addNode(k,v[0],v[1],v[2])}
 let anon=0;const edges=[],roads=[];
 for(const r of L.roads){const w=W[r.k];let pts=[],marks=[];
  const ctrl=r.p.map(p=>typeof p==='string'?{n:NI[p],p:[nodes[NI[p]].x,nodes[NI[p]].z]}:{n:-1,p});
  if(ctrl[0].n<0){ctrl[0].n=addNode('_'+(anon++),ctrl[0].p[0],ctrl[0].p[1])}const e=ctrl[ctrl.length-1];if(e.n<0)e.n=addNode('_'+(anon++),e.p[0],e.p[1]);
  if(r.arc){for(let i=0;i<ctrl.length-1;i++){marks.push([pts.length,ctrl[i].n]);pts.push(...arcPts(r.arc,ctrl[i].p,ctrl[i+1].p,4))}marks.push([pts.length,ctrl[ctrl.length-1].n]);pts.push(ctrl[ctrl.length-1].p.slice())}
  else{const c=cr(ctrl.map(q=>q.p),4);pts=c.pts;ctrl.forEach((q,i)=>{if(q.n>=0)marks.push([c.idx[i],q.n])})}
  roads.push({id:r.id,k:r.k,w,P:pts,n:r.n||0,amb:!!r.amb});
  for(let i=0;i<marks.length-1;i++){const[i0,a]=marks[i],[i1,b]=marks[i+1];const P=pts.slice(i0,i1+1);P[0]=[nodes[a].x,nodes[a].z];P[P.length-1]=[nodes[b].x,nodes[b].z];
   const ed={a,b,P,w,k:r.k,road:r.id,len:plen(P),amb:!!r.amb};const ei=edges.length;edges.push(ed);nodes[a].edges.push(ei);nodes[b].edges.push(ei)}}
 const edgeOf=(a,b)=>{for(const ei of nodes[a].edges){const e=edges[ei];if((e.a===a&&e.b===b)||(e.a===b&&e.b===a))return e}return null};
 // ---- geometry helpers ----
 const segD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l2));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)};
 const inPoly=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
 // ---- water ----
 const SEA=L.water.coast.concat([[-3000,900],[-3000,-900]]);const inSea=(x,z,m)=>{if(x<-520)return true;if(x>-160)return false;if(inPoly(x,z,SEA))return true;if(!m)return false;for(let i=0;i<L.water.coast.length-1;i++)if(segD(x,z,L.water.coast[i],L.water.coast[i+1])<m)return true;return false};
 const RV=L.water.river;const riverZ=x=>{if(x<=RV[0][0])return RV[0][1];for(let i=1;i<RV.length;i++)if(x<=RV[i][0]){const a=RV[i-1],b=RV[i],t=(x-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t}return RV[RV.length-1][1]};
 const riverW=x=>{const w=L.water.riverW,m=L.water.mouthW;return x<-330?w+(m-w)*Math.min(1,(-330-x)/110):w};
 const inRiver=(x,z,m)=>Math.abs(z-riverZ(x))<riverW(x)/2+(m||0);
 // ---- hills (gentle mounds; roads, cars, trees and houses on them follow h) ----
 const h=(x,z)=>{let y=0;for(const q of L.hills){const dx=(x-q.x)/q.rx,dz=(z-q.z)/q.rz,d=Math.sqrt(dx*dx+dz*dz);if(d<1)y+=q.h*.5*(1+Math.cos(Math.PI*d))*(1+.06*Math.sin(x*.05+z*.03))}return y};
 // ---- bridges: where a road crosses the river (the roads are laid out to cross it running north-south) ----
 const bridges=[];for(const e of edges){for(let i=1;i<e.P.length;i++){const a=e.P[i-1],b=e.P[i],sa=a[1]-riverZ(a[0]),sb=b[1]-riverZ(b[0]);if(sa*sb<0){const t=sa/(sa-sb),x=a[0]+(b[0]-a[0])*t;bridges.push({x,zc:riverZ(x),w:e.w+.2,span:riverW(x)+12,Lr:14,H:2.6,e})}}}
 for(const b of bridges)b.half=b.span/2+b.Lr;
 const deck=(x,z)=>{for(const b of bridges){if(Math.abs(x-b.x)>b.w/2+1.5)continue;const dz=Math.abs(z-b.zc);if(dz>b.half)continue;return dz<b.span/2?b.H:b.H*(b.half-dz)/b.Lr}return 0};
 const gy=(x,z)=>h(x,z)+deck(x,z);
 // ---- spatial hash of road segments ----
 const CS=16,RH=new Map();const ck=(i,j)=>i*100003+j;
 for(const r of roads)for(let i=1;i<r.P.length;i++){const a=r.P[i-1],b=r.P[i];const i0=Math.floor(Math.min(a[0],b[0])/CS),i1=Math.floor(Math.max(a[0],b[0])/CS),j0=Math.floor(Math.min(a[1],b[1])/CS),j1=Math.floor(Math.max(a[1],b[1])/CS);
  for(let ii=i0;ii<=i1;ii++)for(let jj=j0;jj<=j1;jj++){const k=ck(ii,jj);let l=RH.get(k);if(!l)RH.set(k,l=[]);l.push([a,b,r.w/2])}}
 const roadD=(x,z)=>{let best=1e9;const i=Math.floor(x/CS),j=Math.floor(z/CS);for(let ii=i-1;ii<=i+1;ii++)for(let jj=j-1;jj<=j+1;jj++){const l=RH.get(ck(ii,jj));if(!l)continue;for(const[a,b,hw]of l){const d=segD(x,z,a,b)-hw;if(d<best)best=d}}return best};
 const railD=(x,z)=>{let b=1e9;for(let i=1;i<L.rail.length;i++)b=Math.min(b,segD(x,z,L.rail[i-1],L.rail[i]));return b};
 const hwyD=(x,z)=>{let b=1e9;for(let i=1;i<L.hwy.length;i++)b=Math.min(b,segD(x,z,L.hwy[i-1],L.hwy[i]));return b};
 // ---- service lots ----
 const LW=34.6,LH=21.6,lots={};
 for(const s of L.lots){if(!s.e){lots[s.t]={x0:s.x0,z0:s.z0,seg:null};continue}
  const a=NI[s.e[0]],b=NI[s.e[1]],e=edgeOf(a,b);if(!e){console.warn('lot edge missing',s.t);continue}
  const x0=s.x-LW/2,x1=s.x+LW/2;let zs=[];for(let i=1;i<e.P.length;i++){const p=e.P[i-1],q=e.P[i];for(const x of[x0,x1,s.x])if((p[0]-x)*(q[0]-x)<=0&&p[0]!==q[0]){zs.push(p[1]+(q[1]-p[1])*(x-p[0])/(q[0]-p[0]))}if(p[0]>=x0&&p[0]<=x1)zs.push(p[1])}
  if(!zs.length){console.warn('lot off road',s.t);zs=[e.P[0][1]]}
  const off=e.w/2+1.2,N=s.side==='N',z0=N?Math.min(...zs)-off-LH:Math.max(...zs)+off;lots[s.t]={x0,z0,seg:[a,b],side:N?'bottom':'top',slope:Math.max(...zs)-Math.min(...zs)}}
 const XST={x0:L.xst[0],z0:L.xst[1],w:L.xst[2],d:L.xst[3]},TL=L.towerlot,F=L.features,P0=L.plaza;
 // ---- occupancy: what a new building or tree must keep clear of ----
 const rects=[];const blockRect=(x0,z0,x1,z1,tag)=>rects.push([x0,z0,x1,z1,tag||'']);
 for(const k in lots){const l=lots[k];blockRect(l.x0-2.5,l.z0-2.5,l.x0+LW+2.5,l.z0+LH+2.5,'lot')}
 blockRect(XST.x0-2,XST.z0-2,XST.x0+XST.w+2,XST.z0+XST.d+2,'lot');blockRect(TL[0]-TL[2]/2-2,TL[1]-TL[3]/2-2,TL[0]+TL[2]/2+2,TL[1]+TL[3]/2+2,'lot');
 const AIR=L.airport;blockRect(AIR[0],AIR[1],AIR[2],AIR[3],'air');
 const fp={w_fire:[30,32,0,-6],w_hosp:[40,36,0,-5],w_stad:[78,62,0,0],w_mall:[70,46,6,10],w_arena:[76,60,0,4],w_train:[64,22,0,2],w_port:[26,150,11,0],apartments:[70,60,0,0],school:[34,26,0,0],tvtower:[34,34,0,0],cityhall:[30,28,0,0]};
 for(const k in fp){const p=F[k],q=fp[k];if(p)blockRect(p[0]+q[2]-q[0]/2,p[1]+q[3]-q[1]/2,p[0]+q[2]+q[0]/2,p[1]+q[3]+q[1]/2,k)}
 {const d=F.dragway;blockRect(d[0]-12,d[1]-36,d[2]+12,d[1]+14,'drag');const g=F.gp;blockRect(g[0]-170,g[1]-62,g[0]+170,g[1]+62,'gp')}
 const fieldR=L.fields.map(f=>f.slice());
 const inRect=(x,z,m,tags)=>{for(const r of rects)if(x>r[0]-m&&x<r[2]+m&&z>r[1]-m&&z<r[3]+m&&(!tags||tags.includes(r[4])))return r;return null};
 const inField=(x,z,m)=>fieldR.some(r=>x>r[0]-m&&x<r[2]+m&&z>r[1]-m&&z<r[3]+m);
 const plazaD=(x,z)=>Math.hypot(x-P0.x,z-P0.z);
 // items: oriented rectangles in a hash, overlap by separating axes
 const IH=new Map(),ICS=24;
 const obb=(cx,cz,w,d,ry)=>{const c=Math.cos(ry),s=Math.sin(ry);const ux=[c,-s],uz=[s,c];return{cx,cz,hw:w/2,hd:d/2,ux,uz}};
 const sat=(A,B)=>{for(const ax of[A.ux,A.uz,B.ux,B.uz]){const pa=Math.abs(A.ux[0]*ax[0]+A.ux[1]*ax[1])*A.hw+Math.abs(A.uz[0]*ax[0]+A.uz[1]*ax[1])*A.hd,pb=Math.abs(B.ux[0]*ax[0]+B.ux[1]*ax[1])*B.hw+Math.abs(B.uz[0]*ax[0]+B.uz[1]*ax[1])*B.hd,dd=Math.abs((B.cx-A.cx)*ax[0]+(B.cz-A.cz)*ax[1]);if(dd>pa+pb)return false}return true};
 const ihKeys=o=>{const r=Math.hypot(o.hw,o.hd),out=[];for(let i=Math.floor((o.cx-r)/ICS);i<=Math.floor((o.cx+r)/ICS);i++)for(let j=Math.floor((o.cz-r)/ICS);j<=Math.floor((o.cz+r)/ICS);j++)out.push(ck(i,j));return out};
 const ihHit=o=>{for(const k of ihKeys(o)){const l=IH.get(k);if(l)for(const q of l)if(sat(o,q))return true}return false};
 const ihAdd=o=>{for(const k of ihKeys(o)){let l=IH.get(k);if(!l)IH.set(k,l=[]);l.push(o)}};
 // a building footprint is free when it keeps clear of roads, water, lots, reserved areas, fields and other buildings
 function footFree(o,rm,opt){opt=opt||{};const pts=[[0,0]];for(const a of[-1,0,1])for(const b of[-1,0,1])if(a||b)pts.push([a,b]);
  for(const[a,b]of pts){const x=o.cx+o.ux[0]*o.hw*a+o.uz[0]*o.hd*b,z=o.cz+o.ux[1]*o.hw*a+o.uz[1]*o.hd*b;
   if(roadD(x,z)<rm)return false;if(inSea(x,z,6)||inRiver(x,z,7))return false;if(inRect(x,z,1.5))return false;if(!opt.field&&inField(x,z,2))return false;
   if(railD(x,z)<6||hwyD(x,z)<12)return false;if(!opt.plaza&&plazaD(x,z)<P0.paved+2)return false;if(opt.maxH!==undefined&&h(x,z)>opt.maxH)return false}
  return !ihHit(o)}
 const fill=[],slots={suburb:[],village:[],industry:[],apart:[]},town=[];
 // walk along roads and put buildings on one or both sides, facing the road
 function along(ids,o){const out=[];for(const id of ids){const r=roads.find(q=>q.id===id);if(!r)continue;const P=r.P;
   for(const side of o.sides||[1,-1]){let s=o.start||6,carry=0;const segs=[];let acc=0;for(let i=1;i<P.length;i++){const l=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);segs.push([acc,l,i]);acc+=l}
    const at=s2=>{for(const[a,l,i]of segs)if(s2<=a+l){const t=(s2-a)/(l||1),p=P[i-1],q=P[i];return[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,(q[0]-p[0])/(l||1),(q[1]-p[1])/(l||1)]}return null};
    while(s<acc-(o.end||6)){const w=o.w[0]+rnd()*(o.w[1]-o.w[0]),d=o.d[0]+rnd()*(o.d[1]-o.d[0]);const p=at(s+w/2);if(!p)break;
     const nx=-p[3]*side,nz=p[2]*side,off=r.w/2+(o.set||3)+d/2,cx=p[0]+nx*off,cz=p[1]+nz*off,ry=Math.atan2(-nx,-nz);
     const ob=obb(cx,cz,w,d,ry);if((!o.where||o.where(cx,cz))&&footFree(ob,o.rm||2,o)){ihAdd(ob);out.push({x:cx,z:cz,w,d,ry,side,road:id});s+=w+(o.gap||2)}else s+=o.skip||3}}}
  return out}
 const BODY=['#f4efe4','#efe3cf','#e6e9ee','#f2dcc3','#dfe7d8','#f7f1e8'],ROOF=['#c0392b','#2f5fa8','#3d7a3a','#d9822b','#7a4a2a','#8a2f2f','#3a3f4a','#b5552b'];
 const px=v=>v*10,item=(k,b,extra)=>Object.assign({k,x:px(b.x),y:px(b.z),w:px(b.w),h:px(b.d),ang:b.ry,ry:b.ry,f:rnd(),d:plazaD(b.x,b.z)/650,road:b.road},extra||{});
 // keep the reserved feature lots and the district centres free first
 for(const k of['apartments']){const p=F[k];for(let i=0;i<3;i++)for(let j=0;j<2;j++)slots.apart.push([p[0]-24+i*24,p[1]-12+j*24])}
 // downtown: towers round the plaza, offices further out
 const nearC=(x,z)=>plazaD(x,z)<215;
 for(const b of along(['ring','east','west','spokeN','spokeE','spokeS','se','south','north','ne'],{w:[14,22],d:[12,18],set:4,gap:3,rm:2.2,where:(x,z)=>nearC(x,z)&&plazaD(x,z)>P0.paved+2})){const dd=plazaD(b.x,b.z);fill.push(item(dd<175?'tower':'mid',b))}
 for(const b of along(['ring'],{sides:[1],w:[12,16],d:[10,13],set:3.5,gap:7,rm:2,plaza:true,where:(x,z)=>plazaD(x,z)>34&&plazaD(x,z)<P0.ring-8}))fill.push(item('mid',b));
 // flats along the automotive streets and the avenues
 for(const b of along(['garage','auto1','auto2','west','east','south','se'],{w:[12,18],d:[10,14],set:3,gap:3,where:(x,z)=>plazaD(x,z)<330}))fill.push(item('flat',b,{body:BODY[Math.floor(rnd()*6)]}));
 // old town: narrow gabled townhouses along the crooked lanes and the quay
 for(const b of along(['otA','otB','otC','otD','quay','west'],{w:[4.4,6.2],d:[7.5,9],set:1.6,gap:.15,skip:1.5,rm:1.2,where:(x,z)=>Math.hypot(x-F.oldtown[0],z-F.oldtown[1])<120}))town.push(b);
 // the hills: villas on the winding road
 for(const b of along(['ne','villa1','villa2'],{w:[9,12],d:[8,10],set:6,gap:14,rm:2,where:(x,z)=>h(x,z)>3}))fill.push(item('house',b,{villa:1,body:BODY[Math.floor(rnd()*6)],roof:ROOF[Math.floor(rnd()*8)]}));
 // suburbs (Maple Grove houses, they appear as the channel grows), the village (Riverside Heights) and the industrial sheds
 for(const b of along(['se','loopA','cul1','cul2','cul3','stadium'],{w:[5.5,7],d:[5,6.4],set:4,gap:4.2,rm:1.6,where:(x,z)=>x>470}))slots.suburb.push([b.x,b.z,b.ry]);
 for(const b of along(['north','vloop','veast','vmouth'],{w:[5.5,7],d:[5,6.4],set:4,gap:4.2,rm:1.6,where:(x,z)=>Math.hypot(x-nodes[NI.VIL].x,z-nodes[NI.VIL].z)<190}))slots.village.push([b.x,b.z,b.ry]);
 for(const b of along(['factory','mill','south'],{w:[20,26],d:[13,17],set:4,gap:6,rm:2,where:(x,z)=>z>300&&z<470}))slots.industry.push([b.x,b.z,b.ry,b.w,b.d]);
 // farmhouses and barns by the fields, a few houses along the coast road and the riverside
 for(const b of along(['farm','coast','river'],{w:[6,9],d:[6,8],set:5,gap:40,rm:2,where:(x,z)=>plazaD(x,z)>260}))fill.push(item('house',b,{body:BODY[Math.floor(rnd()*6)],roof:ROOF[Math.floor(rnd()*8)]}));
 const dSort=(a,p)=>a.sort((u,v)=>Math.hypot(u[0]-p[0],u[1]-p[1])-Math.hypot(v[0]-p[0],v[1]-p[1]));
 dSort(slots.suburb,[nodes[NI.SB0].x,nodes[NI.SB0].z]);dSort(slots.village,[nodes[NI.VIL].x,nodes[NI.VIL].z]);dSort(slots.industry,[nodes[NI.SS1].x,nodes[NI.SS1].z]);
 // street trees in the plaza ring and along the avenues
 for(const b of along(['ring','spokeN','spokeE','spokeS','east','west','se'],{w:[2,2],d:[2,2],set:1.2,gap:9,rm:.8,plaza:true,where:(x,z)=>plazaD(x,z)<300}))fill.push({k:'tree',x:px(b.x),y:px(b.z),r:12+rnd()*5});
 // ---- open land: forests ----
 const forestK=(x,z)=>{let k=0;for(const f of L.forests){const dx=(x-f[0])/f[2],dz=(z-f[1])/f[3],d=dx*dx+dz*dz;if(d<1)k=Math.max(k,1-d*.7)}return k};
 const free=(x,z,m)=>{m=m||0;if(roadD(x,z)<1.5+m)return false;if(inSea(x,z,3+m)||inRiver(x,z,5+m))return false;if(inRect(x,z,m+1))return false;if(inField(x,z,m))return false;if(railD(x,z)<5+m||hwyD(x,z)<9+m)return false;if(plazaD(x,z)<P0.paved+m)return false;
  if(ihHit(obb(x,z,2+m*2,2+m*2,0)))return false;return true};
 // ---- the simulation graph in px ----
 const G={nodes:nodes.map(n=>({x:px(n.x),y:px(n.z),name:n.name,round:n.round?px(n.round):0,nb:[],light:null})),E:new Map()};
 const ekey=(a,b)=>a*65536+b;
 for(const e of edges){if(e.amb)continue;const P=e.P.map(p=>[px(p[0]),px(p[1])]);const Lc=[0];for(let i=1;i<P.length;i++)Lc.push(Lc[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
  const lane=Math.max(14,Math.min(24,px(e.w)/4)),f={P,L:Lc,len:Lc[Lc.length-1],lane,w:px(e.w),k:e.k};
  const R={P:P.slice().reverse(),L:null,len:f.len,lane,w:f.w,k:e.k};R.L=[0];for(let i=1;i<R.P.length;i++)R.L.push(R.L[i-1]+Math.hypot(R.P[i][0]-R.P[i-1][0],R.P[i][1]-R.P[i-1][1]));
  G.E.set(ekey(e.a,e.b),f);G.E.set(ekey(e.b,e.a),R);G.nodes[e.a].nb.push(e.b);G.nodes[e.b].nb.push(e.a)}
 const lotsPx={};for(const k in lots){const l=lots[k];lotsPx[k]={x0:px(l.x0),y0:px(l.z0),seg:l.seg,side:l.side}}
 const bounds={x0:-560,z0:-700,x1:1250,z1:700};
 return{L,nodes,NI,edges,roads,edgeOf,lots,lotsPx,LW,LH,XST,TL,F,P0,AIR,G,ekey,bridges,deck,h,gy,inSea,inRiver,riverZ,riverW,roadD,railD,hwyD,free,forestK,inField,fill,town,slots,rnd,segD,bounds,W,
  districts:L.districts,fields:L.fields,forests:L.forests,rail:L.rail,hwy:L.hwy,busLoop:L.busLoop.map(n=>NI[n])};
})();
