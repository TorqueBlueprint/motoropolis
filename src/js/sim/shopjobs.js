//@ sim/shopjobs.js - the city's shops as businesses (Phase 3): one seeded job engine, SHOPS.make(cfg), shared by every shop.
//@ Pure and deterministic: every job comes from the UTC clock and state.json names only (no Math.random), so everyone sees the same
//@ job list at the same time. A new job starts every cfg.step seconds; job g goes on bay g % act (bays past act wait for staff: JOB OPEN)
//@ and runs through cfg.stages inside its bay's act*step window. Staff k works bay k = staffOf(cfg.b, cfg.role, g % act).
//@ SHOP = the Repair Shop (Phase 3 step 1, unchanged results); TYREJOBS, WASHJOBS, INSPJOBS = tire shop, car wash, inspection (step 2).
//@ Torque Coins (TC) are display-only: nothing is saved, there is no economy yet. The city's own service loops (sim/services.js)
//@ are untouched and keep running per viewer.
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
const SHOPS=(()=>{
 const h32=(...a)=>{let h=2166136261;for(const v of a){const s=String(v);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}h^=124;h=Math.imul(h,16777619)}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return h>>>0};
 const rng=seed=>{let s=seed>>>0;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
 // price class from the car's price: parts cost more on dearer cars, the hourly rate a little more
 const cls=p=>p<40000?1:p<100000?1.25:p<300000?1.7:p<1000000?2.6:4;
 // a resident's own car: the same seeded pick as their home garage (interiors/home.js homeParams), so the car in the shop is theirs
 const hh=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return h>>>0};
 const HCOLS=['#d93a2f','#2f6fd9','#f2f2ee','#22252b','#2e8b57','#ff7a1a','#e8b931','#7a8088'];
 let HC=null;const homeCars=()=>HC||(HC=MODELS.filter(m=>m.glb&&!m.taxi&&!m.pickup&&m.price<=90000&&CAR_GLB[m.glb]&&!CAR_GLB[m.glb].keep));
 let HOV=null;const hov=()=>HOV||(HOV=(typeof STATE==='object'&&STATE&&STATE.homes&&typeof STATE.homes==='object'&&!Array.isArray(STATE.homes))?STATE.homes:{});
 const HPAL={red:'#c8392b',orange:'#ff7a1a',yellow:'#e8b931',green:'#2e7d4f',mint:'#9fd8b5',teal:'#2a8c8c',blue:'#2f6fd9',navy:'#1f3a6e',purple:'#6a3fa0',pink:'#e58fb0',brown:'#7a4b2e',black:'#22252b',grey:'#8e949b',white:'#f4f4f0',cream:'#eadfca',beige:'#d9c49a'};
 function residentCar(n){const h=hh('look:'+String(n).toLowerCase()),L=homeCars();let m=L.length?L[(h>>>11)%L.length]:MODELS[0],col=HCOLS[(h>>>15)%HCOLS.length];
  const HV=hov();let o=Object.prototype.hasOwnProperty.call(HV,n)?HV[n]:null;if(!o){const k=Object.keys(HV).find(q=>q.toLowerCase()===String(n).toLowerCase());if(k)o=HV[k]}
  if(o&&typeof o==='object'){if(typeof o.model==='string'){const q=L.find(x=>x.glb===o.model.toLowerCase());if(q)m=q}if(typeof o.car==='string'){const v=o.car.trim().toLowerCase();if(HPAL[v])col=HPAL[v];else if(/^#[0-9a-f]{6}$/.test(v))col=v}}
  return{m,col}}
 // turbocharged? from the drag spec (asp 'T'); DRAG is defined later in the page (sim/drag.js), so look it up lazily
 const hasTurbo=m=>{let s=null;try{s=DRAG.SPEC[m.glb]}catch(e){}return s?s.asp==='T':/turbo/i.test(m.n||'')};
 const now=()=>Date.now()/1000;
 const hidden=n=>!!(n&&window.__HIDE&&window.__HIDE.some(h=>String(n).includes(h)));
 const tc=v=>`${Math.round(v).toLocaleString('en-US')} TC`;
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 // pick one entry of a weighted list [{w,...}] with r()
 const pickW=(L,r)=>{let tw=0;for(const q of L)tw+=q.w;let x=r()*tw;for(const q of L){x-=q.w;if(x<=0)return q}return L[0]};
 /* make(cfg): a shop's job engine.
    cfg = {b: building type, role: staff job title, bays, act (bays with a post), step (s between jobs), out (s to drive off),
           stages: [...names, 'DONE'] (the second last is READY), split: default fractions per stage (length stages-1),
           seed: seed key, prefix: job number prefix, nameOff: offset into the Wall for customers, resident: share of resident customers,
           crew: who works when the post is empty or hidden, open(): is the shop open, fill(r, ctx): the job's own content,
           doing(j, s, who): what the staff member is doing (panel line), ready / done: panel line tails}
    fill(r, {g, m, col, name, k}) returns the job's fields: at least svc, dur (s) and total (TC); optional split (per job), lines... */
 function make(cfg){
  const BAYS=cfg.bays,ACT=cfg.act,STEP=cfg.step,OUT=cfg.out||8,STAGES=cfg.stages,NS=STAGES.length,RD=NS-2,SEED=cfg.seed,PFX=cfg.prefix||'J-',OFF=cfg.nameOff||0,RES=cfg.resident==null?.65:cfg.resident;
  const isOpenNow=cfg.open||(()=>true);
  const cache=new Map();
  function job(g){let j=cache.get(g);if(j)return j;const r=rng(h32(SEED,g));
   const t0=g*STEP+Math.floor(r()*10),N=WALL.length;
   // the customer: a resident (never the same one on two bays at once: BAYS jobs in a row get different names) or a car shown by plate
   let name=null;if(N>=BAYS){const ok=r()<RES;let st=Math.max(1,Math.round(N*.618));while(gcd(st,N)!==1)st++;if(ok)name=WALL[(((g*st+OFF)%N)+N)%N]}else{r();const q=((g%ACT)+ACT)%ACT;if(q<N)name=WALL[(q+OFF)%N]}
   let m,col;if(name){const c=residentCar(name);m=c.m;col=c.col}else{const L=MODELS.filter(q=>q.price<=300000||r()<.08);m=L[Math.floor(r()*L.length)]||MODELS[0];col=m.taxi?'#f2b81d':COLORS[Math.floor(r()*COLORS.length)]}
   const pl=()=>L2[Math.floor(r()*L2.length)];const plate=`${pl()}${pl()}${pl()} ${String(Math.floor(r()*10000)).padStart(4,'0')}`;
   const x=cfg.fill(r,{g,m,col,name,k:cls(m.price)});
   const dur=x.dur,sp=x.split||cfg.split,st=[t0];let acc=t0;for(const s of sp){acc+=s*dur;st.push(Math.round(acc))}st[NS-1]=t0+dur;
   const no=1000+((g%9000)+9000)%9000,bay=((g%ACT)+ACT)%ACT;
   j=Object.assign({g,no:PFX+no,bay,post:bay,lift:bay,mech:bay,t0,t1:t0+dur,st,name,m,model:m.n,color:col,plate},x);
   cache.set(g,j);if(cache.size>2400)cache.delete(cache.keys().next().value);return j}
  // stage index at time t (NS-1 = done, -1 = not here yet)
  const stageAt=(j,t)=>{if(t<j.t0)return-1;for(let i=NS-2;i>=0;i--)if(t>=j.st[i])return t>=j.t1?NS-1:i;return 0};
  // the bays at time t: {j, s (stage), left (seconds to READY), inS (seconds into the stage), out (0..1 driving off after the handover)}
  function bays(t){t=t==null?now():t;const out=new Array(BAYS).fill(null);if(!isOpenNow())return out;const g1=Math.floor(t/STEP);
   for(let g=g1-ACT;g<=g1;g++){const j=job(g);if(t<j.t0||t>=j.t1+OUT)continue;const s=stageAt(j,t);out[j.bay]={j,s,left:Math.max(0,j.st[RD]-t),inS:t-(s===NS-1?j.t1:j.st[s]),out:s===NS-1?(t-j.t1)/OUT:0}}
   return out}
  // invoices: the last n jobs handed over before t, newest first
  function invoices(t,n){t=t==null?now():t;const L=[];if(!isOpenNow())return L;for(let g=Math.floor(t/STEP);L.length<(n||20)&&g>Math.floor(t/STEP)-400;g--){const j=job(g);if(j.t1<=t)L.push(j)}return L}
  // the till: jobs handed over since 00:00 UTC today
  let TK='',TV=null;
  function today(t){t=t==null?now():t;const d0=Math.floor(t/86400)*86400,key=d0+':'+Math.floor(t/STEP)+':'+WALL.length;if(key===TK)return TV;let n=0,tcs=0;
   if(isOpenNow())for(let g=Math.floor(d0/STEP)-ACT;g<=Math.floor(t/STEP);g++){const j=job(g);if(j.t1>=d0&&j.t1<=t){n++;tcs+=j.total}}TK=key;TV={n,tc:tcs};return TV}
  const staffName=j=>staffOf(cfg.b,cfg.role,j.post);
  const ROLE=cfg.role.toUpperCase();
  // "<Staff> is <doing> <Owner>'s car · J-2148 · 6 min left"
  function line(j,s,left){const sn=staffName(j),who=j.name&&!hidden(j.name)?`${j.name}’s car`:`the car ${j.plate}`,me=sn&&!hidden(sn)?sn:cfg.crew;
   const doing=cfg.doing(j,s,who);
   const tl=s<RD?` · ${Math.max(1,Math.ceil(left/60))} min left`:s===RD?(cfg.ready||' · ready to collect'):(cfg.done||' · handed over');
   return `${me} ${doing} · ${j.no}${tl}`+(sn?'':` · ${ROLE} JOB OPEN`)}
  const busy=t=>bays(t).filter(a=>a&&a.s<NS-1).length;
  return{cfg,BAYS,LIFTS:BAYS,ACT,STEP,STAGES,NS,RD,ROLE,OPEN:`Comment WORKSHOP ${ROLE}`,job,bays,lifts:bays,invoices,today,stageAt,line,staffName,mechName:staffName,busy,hidden,tc,now,h32,rng,open:isOpenNow}}
 return{make,h32,rng,cls,residentCar,hidden,tc,now,pickW,hasTurbo}})();

// ===== the Repair Shop (Phase 3 step 1): 6 lifts, 5 mechanics, a job every 12 min, 40-55 min each =====
const SHOP=(()=>{
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
 const RATE=60;
 return SHOPS.make({b:'oficina',role:'Mechanic',bays:6,act:5,step:720,out:8,seed:'shop',prefix:'J-',crew:'The shop crew',
  stages:['ARRIVED','DIAGNOSIS','QUOTE','APPROVED','REPAIR','INSPECTION','READY','HANDED OVER'],split:[.05,.12,.08,.04,.47,.12,.12],
  fill(r,c){const m=c.m;
   // the fault: weighted like the city's breakdowns; a turbo job only on a car that has a turbo (drag_specs asp 'T', not the display name)
   let f=null;for(let k=0;k<8&&!f;k++){let tw=0;for(const q of FL)tw+=q.w;let x=r()*tw;for(const q of FL){x-=q.w;if(x<=0){f=q.f;break}}if(!f)f=FL[0].f;if(f.n==='Failed turbo'&&!SHOPS.hasTurbo(m))f=null}
   const S=SVC[f.n],k=c.k,rate=Math.round(RATE*(1+(k-1)*.35)),parts=S[4].map(p=>({n:p[0],sku:p[1],each:Math.round(p[2]*k),qty:p[3]}));
   const partsTC=parts.reduce((a,p)=>a+p.each*p.qty,0),labTC=Math.round(S[3]*rate),total=partsTC+labTC;
   const dur=Math.round(Math.min(3300,Math.max(2400,2250+S[3]*140)));
   return{dur,fault:f.n,svc:S[0],verb:S[1],wheels:!!S[2],lab:S[3],rate,parts,partsTC,labTC,total,ordered:r()<.22?parts[0]:null,km:Math.round(8000+r()*240000)}},
  doing:(j,s,who)=>s<=1?`is checking out ${who}`:s===2?`is waiting for the go-ahead on ${who}`:s===3?`is getting the parts for ${who}`:s===4?`is ${j.verb} ${who}`:s===5?`is test-driving ${who}`:`has finished ${who}`})})();

// ===== the Tire Shop (Phase 3 step 2): 4 bays, 3 tire technicians, a job every 11 min, 16-31 min each =====
const TYREJOBS=(()=>{
 // tyre sizes by price class: [size, rim inches, TC per tyre]
 const SIZES=[['195/65 R15',15,62],['205/55 R16',16,74],['225/45 R17',17,95],['235/40 R18',18,128],['255/35 R19',19,165],['275/30 R20',20,240]];
 const sizeFor=(k,r)=>{const b=k<=1?1:k<=1.25?2:k<=1.7?3:k<=2.6?4:5;return SIZES[Math.max(0,Math.min(5,b-1+(r()<.5?0:1)))]};
 const S_=(svc,verb,w,dur,split,lab)=>({svc,verb,w,dur,split,lab});
 // stages: ARRIVED, LIFT UP, WHEELS OFF, TYRE CHANGER, BALANCER, REFIT · TORQUE, ALIGNMENT | READY
 const SV=[S_('PUNCTURE REPAIR','plugging a puncture on',.24,1140,[.06,.07,.08,.30,.18,.12,0],.4),
  S_('NEW TYRES ×2','fitting two new tyres to',.2,1500,[.05,.06,.1,.32,.2,.13,0],.6),
  S_('NEW TYRES ×4','fitting four new tyres to',.16,1620,[.04,.05,.1,.36,.2,.11,0],.9),
  S_('WHEEL BALANCING','balancing the wheels on',.14,1020,[.06,.07,.12,0,.42,.13,0],.5),
  S_('WHEEL ALIGNMENT','aligning the wheels on',.12,1560,[.06,.08,0,0,0,0,.66],.8),
  S_('SEASONAL SWAP','swapping the tyre sets on',.14,1380,[.05,.06,.15,0,.33,.21,0],.6)];
 const RATE=52,mm32=mm=>Math.max(1,Math.round(mm/.79375));
 return Object.assign(SHOPS.make({b:'pneus',role:'Tire Technician',bays:4,act:3,step:660,out:8,seed:'tyres',prefix:'J-',nameOff:17,crew:'The tire crew',
  open:()=>isOpen('pneus'),
  stages:['ARRIVED','LIFT UP','WHEELS OFF','TYRE CHANGER','BALANCER','REFIT · TORQUE','ALIGNMENT','READY','DRIVEN OFF'],split:[.06,.07,.08,.30,.18,.12,0],
  fill(r,c){const S=SHOPS.pickW(SV,r),sz=sizeFor(c.k,r),rate=Math.round(RATE*(1+(c.k-1)*.3)),rim=sz[1];
   const d=new Date((c.g*660)*1000),mo=d.getUTCMonth(),winter=mo>=9||mo<=2;
   let svc=S.svc,verb=S.verb,split=S.split.slice(),dur=S.dur,lab=S.lab;
   if(svc==='SEASONAL SWAP'){svc=winter?'SWAP TO WINTER TYRES':'SWAP TO SUMMER TYRES';verb=winter?'fitting the winter set to':'fitting the summer set to'}
   // a new set of four comes with an alignment now and then
   const withAlign=svc==='NEW TYRES ×4'&&r()<.35;if(withAlign){split=[.04,.04,.08,.28,.16,.1,.18];dur+=300;lab+=.5}
   const n=svc==='NEW TYRES ×4'?4:svc==='NEW TYRES ×2'?2:svc==='PUNCTURE REPAIR'?1:svc==='WHEEL ALIGNMENT'?0:4;
   const parts=[],P=(nm,sku,each,qty)=>parts.push({n:nm,sku,each:Math.round(each),qty});
   const sku='TY-'+sz[0].replace(/\D/g,'').slice(0,5);
   if(svc==='PUNCTURE REPAIR'){P('Plug-patch repair kit','TP-0110',12,1);P('Valve stem','VS-0020',3,1);P('Balance weights','WB-0005',2,3)}
   else if(svc.startsWith('NEW TYRES')){P('Tyre '+sz[0],sku,sz[2],n);P('Valve stem','VS-0020',3,n);P('Balance weights','WB-0005',2,n*3);P('Old tyre recycling','EC-TYRE',3,n)}
   else if(svc==='WHEEL BALANCING')P('Balance weights','WB-0005',2,12);
   else if(svc==='WHEEL ALIGNMENT')P('4-wheel alignment report','AL-4WHL',18,1);
   else{P('Tyre hotel · one season','TH-0001',40,1);P('Balance weights','WB-0005',2,8)}
   if(withAlign)P('4-wheel alignment report','AL-4WHL',18,1);
   const partsTC=parts.reduce((a,p)=>a+p.each*p.qty,0),labTC=Math.round(lab*rate);
   // the numbers on the card: tread before / after (mm and 32nds), pressure, torque, DOT date code (week + year)
   const R1=v=>Math.round(v*10)/10,before=R1(svc==='PUNCTURE REPAIR'||svc==='WHEEL BALANCING'||svc==='WHEEL ALIGNMENT'?4+r()*3:1.4+r()*1.4);
   const after=svc.startsWith('NEW')||svc.startsWith('SWAP')?(svc.startsWith('SWAP')?R1(6+r()*1.5):8):before;
   const bar=Math.round((2.2+r()*.5+(rim>=18?.1:0))*10)/10,psi=Math.round(bar*14.5038);
   const wk=1+Math.floor(r()*52),yr=(d.getUTCFullYear()-(r()<.5?0:1))%100;
   const dot=`DOT ${['4X','7K','2B','9M'][Math.floor(r()*4)]}${['A1','C3','E7','H2'][Math.floor(r()*4)]} ${String(wk).padStart(2,'0')}${String(yr).padStart(2,'0')}`;
   const nm=rim>=19?140:120,lbft=Math.round(nm*.737562);
   const toe=[0,1,2,3].map(()=>Math.round((r()-.5)*(svc==='WHEEL ALIGNMENT'||withAlign?1.2:.3)*10)/10);
   return{dur,split,svc,verb,size:sz[0],rim,n,parts,lines:parts,partsTC,lab,rate,labTC,total:partsTC+labTC,wheels:svc!=='WHEEL ALIGNMENT',align:svc==='WHEEL ALIGNMENT'||withAlign,
    before,after,b32:mm32(before),a32:mm32(after),bar,psi,dot,nm,lbft,toe,km:Math.round(8000+r()*200000)}},
  doing:(j,s,who)=>s===0?`is checking in ${who}`:s===1?`is lifting ${who}`:s===2?`is taking the wheels off ${who}`:s===3?(j.svc==='PUNCTURE REPAIR'?`is plugging the puncture on ${who}`:`is fitting the tyres on the changer for ${who}`)
   :s===4?`is balancing the wheels on ${who}`:s===5?`is torquing the wheel nuts on ${who} to ${j.nm} N·m / ${j.lbft} lb·ft`:s===6?`is aligning the wheels on ${who}`:`has finished ${who}`}),{SIZES})})();

// ===== the Car Wash (Phase 3 step 2): 2 lanes, 2 wash attendants, a job every 9 min, 7.5-17 min each =====
const WASHJOBS=(()=>{
 // packages: what is included, price, how long, the share of each stage (QUEUE, PRE-WASH, FOAM, BRUSHES · RINSE, DRY, VACUUM · VALET | READY)
 const PK=[{svc:'BASIC WASH',w:.5,tc:12,dur:450,split:[.1,.14,.18,.3,.18,0],inc:['Pre-wash + snow foam','Brushes + rinse','Air dry']},
  {svc:'PREMIUM WASH',w:.32,tc:24,dur:660,split:[.07,.12,.17,.26,.14,.12],inc:['Pre-wash + snow foam','Wheels + underbody','Brushes + hot wax','Air dry + quick vacuum']},
  {svc:'FULL VALET',w:.18,tc:48,dur:1020,split:[.05,.08,.12,.17,.1,.38],inc:['Premium wash','Interior vacuum + mats','Dashboard + glass','Tyre shine']}];
 const ADD=[['Air freshener','AF-0001',2],['Tyre shine','TS-0250',4],['Rain repellent glass','RR-0100',5]];
 return SHOPS.make({b:'lavagem',role:'Wash Attendant',bays:2,act:2,step:540,out:7,seed:'wash',prefix:'W-',nameOff:31,crew:'The wash crew',
  open:()=>isOpen('lavagem'),
  stages:['QUEUE','PRE-WASH','FOAM','BRUSHES · RINSE','DRY','VACUUM · VALET','READY','DRIVEN OFF'],split:PK[0].split,
  fill(r,c){const p=SHOPS.pickW(PK,r),lines=[{n:p.svc[0]+p.svc.slice(1).toLowerCase(),sku:'WP-'+p.svc.slice(0,4),each:p.tc,qty:1}];
   if(r()<.3){const a=ADD[Math.floor(r()*ADD.length)];if(!(p.svc==='FULL VALET'&&a[0]==='Tyre shine'))lines.push({n:a[0],sku:a[1],each:a[2],qty:1})}
   const big=c.m.len>=34||c.m.pickup;if(big)lines.push({n:'Large vehicle',sku:'WP-XL',each:4,qty:1});
   const total=lines.reduce((a,q)=>a+q.each*q.qty,0);
   // what the wash uses: water and foam per car (the Basic programme uses less)
   const water=Math.round((p.svc==='BASIC WASH'?110:p.svc==='PREMIUM WASH'?150:170)*(big?1.2:1)+r()*20);
   return{dur:p.dur+Math.round(r()*40),split:p.split,svc:p.svc,pkg:p,inc:p.inc,lines,parts:lines,total,water,gal:Math.round(water*.264172),foam:Math.round((p.svc==='BASIC WASH'?.15:.25)*100)/100,temp:38+Math.floor(r()*6)}},
  ready:' · ready to drive off',done:' · driven off',
  doing:(j,s,who)=>s===0?`is waving in ${who}`:s===1?`is pressure-washing ${who}`:s===2?`is covering ${who} in snow foam`:s===3?`is running the brushes over ${who}`:s===4?`is drying ${who}`:s===5?`is vacuuming and valeting ${who}`:`has finished ${who}`})})();

// ===== the Inspection Centre (Phase 3 step 2): 2 lanes, 2 inspectors, a job every 10 min, 15-19 min each =====
const INSPJOBS=(()=>{
 // the failure list: [item, the stage it is found at (1 lights, 2 brakes, 3 emissions, 4 suspension / tyres), weight]
 const FAILS=[['Headlight aim too high',1,.12],['Brake imbalance on the front axle',2,.22],['Service brake efficiency too low',2,.1],['Emissions over the limit',3,.18],
  ['Tyre tread below 1.6 mm / 2/32 in',4,.14],['Worn suspension ball joint',4,.12],['Oil leak',4,.12]].map(f=>({n:f[0],at:f[1],w:f[2]}));
 const G=9.80665,lbf=kn=>Math.round(kn*224.809);
 return SHOPS.make({b:'inspecao',role:'Inspector',bays:2,act:2,step:600,out:8,seed:'insp',prefix:'I-',nameOff:43,crew:'The inspection crew',
  open:()=>isOpen('inspecao'),
  stages:['CHECK-IN','LIGHTS','BRAKES','EMISSIONS','SUSPENSION · TYRES','RESULT','DRIVEN OFF'],split:[.1,.16,.22,.18,.2],
  fill(r,c){const m=c.m,diesel=!!m.pickup,retest=r()<.14,fail=!retest&&r()<.26;const f=fail?SHOPS.pickW(FAILS,r):null;
   const sp=(typeof DRAG!=='undefined'&&DRAG.SPEC&&DRAG.SPEC[m.glb])||null,kg=sp&&sp.kg?sp.kg:Math.round(900+m.len*18),lb=Math.round(kg*2.20462);
   // roller brake tester: brake force per wheel (kN), efficiency = total force / weight
   const W=kg*G/1000,eff=f&&f.n==='Service brake efficiency too low'?38+Math.round(r()*8):58+Math.round(r()*24),tot=W*eff/100;
   const fr=tot*.68,rr=tot-fr,imb=f&&f.n==='Brake imbalance on the front axle'?34+Math.round(r()*10):Math.round(r()*14);
   const fl=fr/2*(1+imb/200),frr=fr/2*(1-imb/200),rl=rr/2*(1+(r()-.5)*.08),rrr=rr-rl;const park=19+Math.round(r()*12);
   const R2=v=>Math.round(v*100)/100;
   const brakes={fl:R2(fl),fr:R2(frr),rl:R2(rl),rr:R2(rrr),eff,imb,park,limEff:50,limImb:30,limPark:16};
   // emissions: CO % and HC ppm (petrol, limits 0.3 % and 200 ppm), or smoke opacity (diesel, limit 1.5 m-1)
   const bad=f&&f.n==='Emissions over the limit';
   const emis=diesel?{diesel:1,k:R2(bad?1.7+r()*.9:.15+r()*.75),lim:1.5}:{diesel:0,co:R2(bad?.42+r()*.5:.02+r()*.18),hc:bad?230+Math.round(r()*140):18+Math.round(r()*110),lam:Math.round((.98+r()*.04)*1000)/1000,limCo:.3,limHc:200};
   const tread=Math.round((f&&f.n.startsWith('Tyre tread')?1.1+r()*.4:2.6+r()*5)*10)/10,aim=f&&f.n.startsWith('Headlight')?Math.round((.4+r()*.8)*10)/10:-Math.round((.6+r()*1.2)*10)/10;
   const shock=f&&f.n==='Worn suspension ball joint'?0:62+Math.round(r()*30);
   const fee=retest?12:diesel?42:36,lines=[{n:retest?'Retest (within 30 days)':'Periodic inspection · light vehicle',sku:retest?'IN-RTST':'IN-PER1',each:fee,qty:1}];
   if(diesel&&!retest)lines.push({n:'Smoke opacity test',sku:'IN-OPAC',each:6,qty:1});
   const total=lines.reduce((a,q)=>a+q.each*q.qty,0);
   const dur=860+Math.round(r()*240)+(diesel?60:0);
   return{dur,svc:retest?'RETEST':'PERIODIC INSPECTION',retest,diesel,pass:!fail,fail:f?f.n:null,failAt:f?f.at:0,kg,lb,brakes,emis,tread,t32:Math.max(1,Math.round(tread/.79375)),aim,shock,
    lines,parts:lines,total,cert:'MTP-'+String(100000+(c.g%900000+900000)%900000),km:Math.round(12000+r()*220000),lbf}},
  ready:' · result handed over',done:' · driven off',
  doing:(j,s,who)=>s===0?`is checking in ${who}`:s===1?`is checking the lights on ${who}`:s===2?`is testing the brakes on ${who}`:s===3?(j.emis.diesel?`is running the smoke test on ${who}`:`is testing the exhaust gas on ${who}`)
   :s===4?`is checking the suspension and tyres on ${who}`:j.pass?`has passed ${who}`:`has failed ${who} · ${j.fail.toLowerCase()}`})})();
