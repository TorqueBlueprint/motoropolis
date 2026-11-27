//@ sim/drag.js - Phase 2C step 1: the Drag Strip. Car physics for a quarter mile, the daily automatic races and the weekly
//@ leaderboard. Pure and seeded: no Math.random, no Math.pow/exp/sin in the results (only + - * / and sqrt, which give the
//@ same bits in every browser), so every visitor sees the same races on the same UTC day. Uses MODELS, COLORS, L2
//@ (data/catalog.js), WALL (people/walkers.js), STATE (ui/panels.js), subs, MS, MAXCARS (sim/milestones.js).
//@ Closed until the Race Track milestone (1,000 subscribers); ?drag=1 (or DRAG.force(true), recorder "drag":1) opens it.
//@ tools/drag_day.js runs this file in node (same results), for checks and for the comment job of the next step.
// Data model (for the next step: predictions and tunes by comment, settled by the comment job):
//  entrant  {id:'n:<name>'|'a:<k>', name|null, plate, glb, model, color, rt0}   rt0 = the driver's usual reaction time
//  run      {rt, t60, t8, v8, et, vt, red, tune}                                seconds, m/s (shown in mph and km/h)
//  heat     {id:'q12'|'qf1'|'sf2'|'f', round, lanes:[{e,run}|null, ...], win:0|1}
//  STATE.drag.tunes = {"<name>":"launch"|"topspeed"} is read when present (written later by the comment job); bets will be
//  {name, pick:<entrant name>, coins, day} and are settled against day(date).heats.find(h=>h.id==='f').
const DRAG=(()=>{
 const SPEC=@@JSON:cars/drag_specs.json@@;
 const QM=402.336,EM=201.168,FT60=18.288,ROLL=.3,G=9.81,RHO=1.2,DT=.002;
 const FORCE0=typeof location!=='undefined'&&/[?&]drag=1\b/.test(location.search);let force=FORCE0;
 // ---- seeded numbers ----
 const h32=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)}return h>>>0};
 const rng=seed=>{let s=seed>>>0;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
 // n-th root with Newton steps (exact IEEE operations only)
 const root=(a,n)=>{if(n<=1)return a;let q=1+(a-1)/n;for(let k=0;k<60;k++){let p=1;for(let i=0;i<n-1;i++)p*=q;q=q-(p*q-a)/(n*p)}return q};
 // ---- the car: a small integrator with traction limit, gear shifts and aero drag ----
 // engine: power at the wheels P(x)=Pmax*(x+x^2-x^3), x=rpm/rpm at peak power (peak at 88% of the rev limiter)
 // launch: clutch slip holds the launch rpm until the car catches up with it in 1st gear
 // traction: mu * weight on the driven wheels, with weight transfer under acceleration (RWD gains, FWD loses)
 // tunes (chosen by comment in the next step): launch = stickier and shorter-geared but draggier and a softer top end;
 // topspeed = slippery and a stronger top end but less grip. Traction-limited cars gain from launch, the others from topspeed.
 const TUNES={stock:{grip:1,cda:1,gear:1,launch:0,power:1},launch:{grip:1.07,cda:1.1,gear:.93,launch:.08,power:.97},topspeed:{grip:.95,cda:.9,gear:1.05,launch:-.04,power:1.03}};
 function prep(glb,tune){const s=SPEC[glb]||SPEC.hothatch,tu=TUNES[tune]||TUNES.stock,n=s.gears;
  const eff=s.drive==='AWD'?.82:s.drive==='FWD'?.88:.86,v1=s.v1/3.6*tu.gear,vt=s.vtop/3.6*tu.gear,q=root(vt/v1,n-1);
  const vg=[];let v=v1;for(let g=0;g<n;g++){vg.push(v);v*=q}
  const wr=s.eng==='R'?.61:s.eng==='M'?.57:.5,wf=s.eng==='F'?.62:1-wr;
  return{m:s.kg+80,P:s.hp*745.7*eff*tu.power,vg,n,shift:s.shift,cda:s.cda*tu.cda,mu:s.mu*tu.grip,drive:s.drive,wr,wf,launch:Math.min(.75,Math.max(.25,s.launch+tu.launch))}}
 const pw=x=>{if(x<=0)return 0;const y=x+x*x-x*x*x;return y<.05?.05:y};
 // o: {glb, tune, grip (day x run), power (day air x run), shiftK (driver's shift time x), ldl (launch rpm +-)}; trace: also sample x every 0.05 s (for the 3D replay)
 function run(o,trace){const c=prep(o.glb,o.tune),m=c.m,mi=m*1.05,W=m*G,roll=.013*W;
  const shT=c.shift*(o.shiftK||1),lch=Math.min(.8,Math.max(.2,c.launch+(o.ldl||0)));let x=0,v=0,a=0,t=0,g=0,sh=0,tr=null,t60=0,t8=0,v8=0,tR=0,last=0;const out=trace?[0]:null;const P=c.P*(o.power||1),mu=c.mu*(o.grip||1);
  for(let it=0;it<20000;it++){
   let F=0;
   if(sh>0){sh-=DT;if(sh<=0)g++}
   else{const vmax=c.vg[g];let r=v/vmax;if(g===0&&r<lch)r=lch;
    if(r>=1&&g<c.n-1){sh=shT;F=0}
    else if(r<1.02){const vr=r*vmax;F=P*pw(r/.88)/(vr>v?vr:v>.5?v:.5)}}
   // traction limit
   const fr=c.drive==='AWD'?.98:c.drive==='FWD'?c.wf-.25*a/G:c.wr+.25*a/G,Tm=mu*W*(fr<.2?.2:fr);if(F>Tm)F=Tm;
   const Fd=.5*RHO*c.cda*v*v+(v>0?roll:0);a=(F-Fd)/mi;v+=a*DT;if(v<0)v=0;const x0=x;x+=v*DT;t+=DT;
   if(!tR&&x>=ROLL)tR=t-(x-ROLL)/(v||1);
   const cross=d=>t-(x-d)/(v||1);
   if(!t60&&x>=FT60+ROLL)t60=cross(FT60+ROLL)-tR;
   if(!t8&&x>=EM+ROLL){t8=cross(EM+ROLL)-tR;v8=v}
   if(trace&&t-last>=.05-1e-9){last+=.05;out.push(x)}
   if(x>=QM+ROLL){const et=cross(QM+ROLL)-tR;if(trace)out.push(x);return{t60,t8,v8,et,vt:v,tR,trace:out}}
   if(x0===x&&it>1000)break}
  return{t60:99,t8:99,v8:0,et:99,vt:0,tR:0,trace:out}}
 // ---- who races: every subscriber car (up to what the streets hold); Wall of Mechanics names drive theirs ----
 const plateOf=k=>{const r=rng(h32('plate|'+k)),l=()=>L2[Math.floor(r()*L2.length)];return `${l()}${l()}${l()} ${String(Math.floor(r()*10000)).padStart(4,'0')}`};
 function entrant(key,name){const hm=h32('car|'+key),m=MODELS[hm%MODELS.length],hc=h32('col|'+key),r=rng(h32('drv|'+key));
  return{id:(name?'n:':'a:')+key,name,plate:plateOf(key),glb:m.glb,model:m.n,color:m.taxi?'#f2b81d':COLORS[hc%COLORS.length],rt0:.415+r()*.11,cons:.3+r()*.7}}
 let eCache=null,eSig='';
 function entrants(){const nCars=Math.min(subs||0,typeof MAXCARS!=='undefined'?MAXCARS:400),named=WALL.slice(0,nCars);const sig=nCars+'|'+named.join('\n');if(sig===eSig)return eCache;
  const out=named.map(n=>entrant(n.toLowerCase(),n));for(let k=0;out.length<nCars;k++)out.push(entrant(String(k),null));eSig=sig;eCache=out;return out}
 const tuneOf=e=>{const T=typeof STATE!=='undefined'&&STATE.drag&&STATE.drag.tunes;return e.name&&T&&T[e.name]&&TUNES[T[e.name]]?T[e.name]:'stock'};
 // ---- one day of racing (run at 00:00 UTC; the strip replays it all day) ----
 // Heads-up racing: both cars get the green together and the first to the line wins (reaction time + elapsed time).
 // Red light (left before the green) loses. The weekly leaderboard is the raw quickest time. (dial = the car's expected time, info only)
 const ROUND={q:'Qualifying',qf:'Quarter-final',sf:'Semi-final',f:'Final'};
 const dayCache=new Map(),dialCache=new Map();
 const dialOf=(glb,tune)=>{const k=glb+'|'+tune;if(!dialCache.has(k))dialCache.set(k,Math.ceil((run({glb,tune,grip:.99}).et+.04)*100)/100);return dialCache.get(k)};
 // who wins a heat: 0 or 1
 function judge(a,b){if(!b)return 0;if(!a)return 1;if(a.red!==b.red)return a.red?1:0;if(a.red)return a.rt<=b.rt?1:0;
  return(a.rt+a.et)<=(b.rt+b.et)?0:1}
 function day(date){const E=entrants();const key=date+'|'+eSig+'|'+JSON.stringify((typeof STATE!=='undefined'&&STATE.drag&&STATE.drag.tunes)||0);if(dayCache.has(key))return dayCache.get(key);
  const r=rng(h32('drag|'+date)),air=.97+r()*.05,track=.96+r()*.06;
  const pass=(e,lane)=>{const tune=tuneOf(e),grip=track*(.97+r()*.05),power=air*(.99+r()*.02),shiftK=1+(r()-.4)*e.cons,ldl=(r()-.5)*.12*e.cons,rt=Math.round((e.rt0+(r()-.3)*.05)*1000)/1000,res=run({glb:e.glb,tune,grip,power,shiftK,ldl});
   return{e,lane,o:{glb:e.glb,tune,grip,power,shiftK,ldl},dial:dialOf(e.glb,tune),rt,red:rt<.4,t60:res.t60,t8:res.t8,v8:res.v8,et:res.et,vt:res.vt,tR:res.tR,tune}};
  const heat=(id,round,a,b)=>{const L=[a?pass(a,0):null,b?pass(b,1):null];
   return{id,round,label:round==='q'?ROUND.q:ROUND[round]+(/\d/.test(id)?' '+id.replace(/\D/g,''):''),lanes:L,win:judge(L[0],L[1])}};
  // qualifying: everyone, in pairs, in a seeded order
  const ord=E.slice();for(let i=ord.length-1;i>0;i--){const j=Math.floor(r()*(i+1));const t=ord[i];ord[i]=ord[j];ord[j]=t}
  const heats=[];for(let i=0;i<ord.length;i+=2)heats.push(heat('q'+(i/2+1),'q',ord[i],ord[i+1]||null));
  // qualifying order: the quickest pass (elapsed time; a red light last)
  const pk=l=>(l.red?100:0)+l.et;
  const quali=[];for(const h of heats)for(const l of h.lanes)if(l){l.pk=pk(l);quali.push(l)}quali.sort((a,b)=>a.pk-b.pk);
  // eliminations: the 8 best packages (4 or 2 on a small day), ladder 1-8, 4-5, 2-7, 3-6; higher seed in the left lane
  const nE=quali.length>=8?8:quali.length>=4?4:quali.length>=2?2:0,seeds=quali.slice(0,nE).map(l=>l.e);let champ=null;
  if(nE){const pairs=nE===8?[[0,7],[3,4],[1,6],[2,5]]:nE===4?[[0,3],[1,2]]:[[0,1]];let cur=pairs.map(([a,b])=>[seeds[a],seeds[b]]);
   const rounds=nE===8?['qf','sf','f']:nE===4?['sf','f']:['f'];
   for(const rd of rounds){const won=[];cur.forEach(([a,b],k)=>{const h=heat(rd==='f'?'f':rd+(k+1),rd,a,b);heats.push(h);won.push(h.lanes[h.win].e)});
    if(rd==='f')champ=won[0];else{const nx=[];for(let k=0;k<won.length;k+=2)nx.push([won[k],won[k+1]]);cur=nx}}}
  const fast=quali.slice().sort((a,b)=>a.et-b.et);
  const d={date,air,track,heats,quali,fast,champ,final:heats.find(h=>h.id==='f')||null};dayCache.set(key,d);if(dayCache.size>12)dayCache.delete(dayCache.keys().next().value);return d}
 // ---- dates (UTC) ----
 const today=()=>new Date().toISOString().slice(0,10);
 const addDays=(date,k)=>new Date(Date.parse(date+'T00:00:00Z')+k*864e5).toISOString().slice(0,10);
 const weekDays=date=>{const wd=(new Date(date+'T00:00:00Z').getUTCDay()+6)%7,out=[];for(let k=wd;k>=0;k--)out.push(addDays(date,-k));return out};
 // fastest this week: each entrant's best pass Monday..today
 function week(date){const best=new Map();for(const d of weekDays(date))for(const h of day(d).heats)for(const l of h.lanes){if(!l)continue;const b=best.get(l.e.id);if(!b||l.et<b.et)best.set(l.e.id,Object.assign({date:d},l))}
  return[...best.values()].sort((a,b)=>a.et-b.et)}
 function person(name,date){const k=String(name||'').toLowerCase();const e=entrants().find(q=>q.name&&q.name.toLowerCase()===k);if(!e)return null;
  const runs=[];for(const d of weekDays(date))for(const h of day(d).heats)for(const l of h.lanes)if(l&&l.e===e)runs.push(Object.assign({date:d,heat:h},l));
  const td=runs.filter(q=>q.date===date);let best=null;for(const q of runs)if(!best||q.et<best.et)best=q;return{e,today:td,best}}
 // ---- formatting: always both units ----
 const fmt={et:t=>t.toFixed(3)+' s',rt:t=>t.toFixed(3)+' s',mph:v=>(v*2.236936).toFixed(1)+' mph',kmh:v=>(v*3.6).toFixed(1)+' km/h',spd:v=>(v*2.236936).toFixed(1)+' mph · '+(v*3.6).toFixed(1)+' km/h',who:e=>e.name||e.plate,
  QM:'1/4 mile · 402 m',EM:'1/8 mile · 201 m',FT60:'60 ft · 18 m'};
 const isOpenNow=()=>force||(subs!==null&&subs>=MS.pista.n);
 return{SPEC,TUNES,judge,dialOf,QM,EM,FT60,ROLL,run,day,week,person,entrants,today,addDays,weekDays,fmt,isOpen:isOpenNow,force:v=>{force=!!v||FORCE0},forced:()=>force,h32,rng}})();
