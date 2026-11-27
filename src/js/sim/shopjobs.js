//@ sim/shopjobs.js - the TorqueBlueprint Repair Shop as a business (Phase 3 step 1): a seeded job timetable for the 6 lifts.
//@ Pure and deterministic: every job comes from the UTC clock and state.json names only (no Math.random), so everyone sees the same
//@ job list at the same time. A new job starts every STEP seconds; job g goes on lift g % 6 and runs ARRIVED -> DIAGNOSIS -> QUOTE ->
//@ APPROVED -> REPAIR -> INSPECTION -> READY -> HANDED OVER inside its lift's 600 s window. Mechanic = staffOf('oficina','Mechanic', g % 5).
//@ Torque Coins (TC) are display-only: nothing is saved, there is no economy yet. The city's own breakdown -> tow -> repair loop
//@ (sim/services.js) is untouched and keeps running per viewer.
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
const SHOP=(()=>{
 const LIFTS=6,STEP=100,MECHS=5,OUT=8; // OUT: seconds the car takes to drive off the lift after the handover
 const STAGES=['ARRIVED','DIAGNOSIS','QUOTE','APPROVED','REPAIR','INSPECTION','READY','HANDED OVER'];
 const SPLIT=[.05,.12,.08,.04,.47,.12,.12];
 const h32=(...a)=>{let h=2166136261;for(const v of a){const s=String(v);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}h^=124;h=Math.imul(h,16777619)}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return h>>>0};
 const rng=seed=>{let s=seed>>>0;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
 // what each fault means for the shop: service name, what the mechanic is doing, wheels off?, labour hours, parts [name, SKU, TC each, qty]
 const COOL=['Coolant 5 L / 1.3 gal','CL-0050',22,1],OIL=['Engine oil 5 L / 5.3 qt','EO-5W30',42,1],BELT=['Drive belt','DB-0006',24,1],WPUMP=['Water pump','WP-0610',72,1];
 const SVC={
  'Flat tire':['PUNCTURE REPAIR','repairing a puncture on',1,.5,[['Tyre plug kit','TP-0110',12,1],['Valve stem','VS-0020',3,1]]],
  'Bald tire':['NEW TYRES ×4','fitting new tyres to',1,1,[['Tyre 225/45 R17','TY-2254',95,4],['Balance weights','WB-0005',2,8]]],
  'Worn brake pads':['BRAKES · PADS + DISCS','changing the brakes on',1,1.6,[['Brake pad set','BP-4410',48,1],['Brake disc 320 mm / 12.6 in','BD-3200',62,2],['Brake fluid 1 L / 1.1 qt','BF-0001',14,1]]],
  'Check engine light':['ENGINE DIAGNOSTICS','tracing the check-engine light on',0,1,[['Oxygen sensor','OS-0230',58,1],['Spark plug','SP-0700',9,4]]],
  'Blown exhaust':['EXHAUST','replacing the exhaust on',0,1.4,[['Rear silencer','EX-5010',140,1],['Exhaust gasket kit','EG-0410',18,1],['Exhaust clamp','EC-0055',6,2]]],
  'Worn shocks':['SHOCK ABSORBERS','replacing the shocks on',1,2.5,[['Shock absorber','SA-2200',96,2],['Top mount','TM-0880',34,2]]],
  'Dead battery':['BATTERY','fitting a new battery to',0,.4,[['Battery 12 V 70 Ah','BA-0070',118,1]]],
  'Snapped timing belt':['TIMING BELT','fitting a timing belt to',0,4.5,[['Timing belt kit','TB-1450',165,1],WPUMP,COOL]],
  'Blown head gasket':['HEAD GASKET','rebuilding the cylinder head on',0,8,[['Head gasket set','HG-3300',145,1],['Cylinder head bolts','HB-0110',48,1],COOL,OIL]],
  'Failed alternator':['ALTERNATOR','replacing the alternator on',0,2,[['Rebuilt alternator 120 A','AL-1200',210,1],BELT]],
  'Failed starter motor':['STARTER MOTOR','replacing the starter motor on',0,1.5,[['Starter motor','ST-1400',185,1]]],
  'Worn-out clutch':['CLUTCH','changing the clutch on',1,5,[['Clutch kit','CK-2400',260,1],['Release bearing','RB-0330',45,1],['Gearbox oil 2 L / 2.1 qt','GO-0075',30,1]]],
  'Failed turbo':['TURBO','rebuilding the turbo on',0,4,[['Rebuilt turbocharger','TC-0900',620,1],['Turbo oil feed line','TL-0120',38,1],OIL]],
  'Leaking radiator':['RADIATOR','replacing the radiator on',0,2,[['Radiator','RD-0650',150,1],COOL]],
  'Failed water pump':['WATER PUMP','replacing the water pump on',0,2.5,[WPUMP,BELT,COOL]]};
 const FL=FAULTS.filter(f=>SVC[f.n]).map(f=>({f,w:f.k==='tire'?f.w*.35:f.w}));
 // price class from the car's price: parts cost more on dearer cars, the hourly rate a little more
 const cls=p=>p<40000?1:p<100000?1.25:p<300000?1.7:p<1000000?2.6:4;
 const RATE=60;
 // a resident's own car: the same seeded pick as their home garage (interiors/home.js homeParams), so the car on the lift is theirs
 const hh=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return h>>>0};
 const HCOLS=['#d93a2f','#2f6fd9','#f2f2ee','#22252b','#2e8b57','#ff7a1a','#e8b931','#7a8088'];
 let HC=null;const homeCars=()=>HC||(HC=MODELS.filter(m=>m.glb&&!m.taxi&&!m.pickup&&m.price<=90000&&CAR_GLB[m.glb]&&!CAR_GLB[m.glb].keep));
 let HOV=null;const hov=()=>HOV||(HOV=(typeof STATE==='object'&&STATE&&STATE.homes&&typeof STATE.homes==='object'&&!Array.isArray(STATE.homes))?STATE.homes:{});
 const HPAL={red:'#c8392b',orange:'#ff7a1a',yellow:'#e8b931',green:'#2e7d4f',mint:'#9fd8b5',teal:'#2a8c8c',blue:'#2f6fd9',navy:'#1f3a6e',purple:'#6a3fa0',pink:'#e58fb0',brown:'#7a4b2e',black:'#22252b',grey:'#8e949b',white:'#f4f4f0',cream:'#eadfca',beige:'#d9c49a'};
 function residentCar(n){const h=hh('look:'+String(n).toLowerCase()),L=homeCars();let m=L.length?L[(h>>>11)%L.length]:MODELS[0],col=HCOLS[(h>>>15)%HCOLS.length];
  const HV=hov();let o=Object.prototype.hasOwnProperty.call(HV,n)?HV[n]:null;if(!o){const k=Object.keys(HV).find(q=>q.toLowerCase()===String(n).toLowerCase());if(k)o=HV[k]}
  if(o&&typeof o==='object'){if(typeof o.model==='string'){const q=L.find(x=>x.glb===o.model.toLowerCase());if(q)m=q}if(typeof o.car==='string'){const v=o.car.trim().toLowerCase();if(HPAL[v])col=HPAL[v];else if(/^#[0-9a-f]{6}$/.test(v))col=v}}
  return{m,col}}
 const cache=new Map();
 function job(g){let j=cache.get(g);if(j)return j;const r=rng(h32('shop',g));
  const t0=g*STEP+Math.floor(r()*10),N=WALL.length;
  // the customer: a resident (never the same one on two lifts at once: 6 jobs in a row get different names) or a car shown by plate
  let name=null;if(N>=LIFTS){const ok=r()<.65;let st=Math.max(1,Math.round(N*.618));const gcd=(a,b)=>b?gcd(b,a%b):a;while(gcd(st,N)!==1)st++;if(ok)name=WALL[((g*st)%N+N)%N]}else{r();const q=((g%LIFTS)+LIFTS)%LIFTS;if(q<N)name=WALL[q]}
  let m,col;if(name){const c=residentCar(name);m=c.m;col=c.col}else{const L=MODELS.filter(q=>q.price<=300000||r()<.08);m=L[Math.floor(r()*L.length)]||MODELS[0];col=m.taxi?'#f2b81d':COLORS[Math.floor(r()*COLORS.length)]}
  const pl=()=>L2[Math.floor(r()*L2.length)];const plate=`${pl()}${pl()}${pl()} ${String(Math.floor(r()*10000)).padStart(4,'0')}`;
  // the fault: weighted like the city's breakdowns; a turbo job only on a car that has a turbo
  let f=null;for(let k=0;k<8&&!f;k++){let tw=0;for(const q of FL)tw+=q.w;let x=r()*tw;for(const q of FL){x-=q.w;if(x<=0){f=q.f;break}}if(!f)f=FL[0].f;if(f.n==='Failed turbo'&&!/turbo/i.test(m.n))f=null}
  const S=SVC[f.n],k=cls(m.price),rate=Math.round(RATE*(1+(k-1)*.35)),parts=S[4].map(p=>({n:p[0],sku:p[1],each:Math.round(p[2]*k),qty:p[3]}));
  const partsTC=parts.reduce((a,p)=>a+p.each*p.qty,0),labTC=Math.round(S[3]*rate),total=partsTC+labTC;
  const dur=Math.round(Math.min(575,Math.max(420,400+S[3]*30))),st=[t0];let acc=t0;for(const s of SPLIT){acc+=s*dur;st.push(Math.round(acc))}st[7]=t0+dur;
  const no=1000+((g%9000)+9000)%9000;
  j={g,no:'J-'+no,lift:((g%LIFTS)+LIFTS)%LIFTS,mech:((g%MECHS)+MECHS)%MECHS,t0,t1:t0+dur,st,name,m,model:m.n,color:col,plate,fault:f.n,svc:S[0],verb:S[1],wheels:!!S[2],lab:S[3],rate,parts,partsTC,labTC,total,
   ordered:r()<.22?parts[0]:null,km:Math.round(8000+r()*240000)};
  cache.set(g,j);if(cache.size>2400)cache.delete(cache.keys().next().value);return j}
 const now=()=>Date.now()/1000;
 // stage index at time t (7 = handed over, -1 = not here yet)
 const stageAt=(j,t)=>{if(t<j.t0)return-1;for(let i=6;i>=0;i--)if(t>=j.st[i])return t>=j.t1?7:i;return 0};
 // the six lifts at time t: {j, s (stage), left (seconds to READY), inS (seconds into the stage), out (0..1 driving off after the handover)}
 function lifts(t){t=t==null?now():t;const out=new Array(LIFTS).fill(null),g1=Math.floor(t/STEP);
  for(let g=g1-LIFTS;g<=g1;g++){const j=job(g);if(t<j.t0||t>=j.t1+OUT)continue;const s=stageAt(j,t);out[j.lift]={j,s,left:Math.max(0,j.st[6]-t),inS:t-(s===7?j.t1:j.st[s]),out:s===7?(t-j.t1)/OUT:0}}
  return out}
 // invoices: the last n jobs handed over before t, newest first
 function invoices(t,n){t=t==null?now():t;const L=[];for(let g=Math.floor(t/STEP);L.length<(n||20)&&g>Math.floor(t/STEP)-400;g--){const j=job(g);if(j.t1<=t)L.push(j)}return L}
 // the till: jobs handed over since 00:00 UTC today
 let TK='',TV=null;
 function today(t){t=t==null?now():t;const d0=Math.floor(t/86400)*86400,key=d0+':'+Math.floor(t/STEP)+':'+WALL.length;if(key===TK)return TV;let n=0,tc=0;
  for(let g=Math.floor(d0/STEP)-LIFTS;g<=Math.floor(t/STEP);g++){const j=job(g);if(j.t1>=d0&&j.t1<=t){n++;tc+=j.total}}TK=key;TV={n,tc};return TV}
 const mechName=j=>staffOf('oficina','Mechanic',j.mech);
 const hidden=n=>!!(n&&window.__HIDE&&window.__HIDE.some(h=>String(n).includes(h)));
 // "<Mechanic> is changing the brakes on <Owner>'s car"
 function line(j,s,left){const mn=mechName(j),who=j.name&&!hidden(j.name)?`${j.name}’s car`:`the car ${j.plate}`,me=mn&&!hidden(mn)?mn:'The shop crew';
  const doing=s<=1?`is checking out ${who}`:s===2?`is waiting for the go-ahead on ${who}`:s===3?`is getting the parts for ${who}`:s===4?`is ${j.verb} ${who}`:s===5?`is test-driving ${who}`:`has finished ${who}`;
  const tl=s<6?` · ${Math.max(1,Math.ceil(left/60))} min left`:s===6?' · ready to collect':' · handed over';
  return `${me} ${doing} · ${j.no}${tl}`+(mn?'':' · MECHANIC JOB OPEN')}
 const tc=v=>`${Math.round(v).toLocaleString('en-US')} TC`;
 return{LIFTS,STEP,STAGES,job,lifts,invoices,today,stageAt,line,mechName,hidden,tc,now,h32,rng}})();
