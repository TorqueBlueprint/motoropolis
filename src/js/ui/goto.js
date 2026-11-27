//@ ui/goto.js - the "📍 GO TO" menu: one button (viewbar on computers, bottom nav on phones) opens a panel with three tabs
//@ (Places, Jobs, People) that flies the 3D camera to a building, a district or a resident, with a STEP INSIDE button for
//@ interiors. Deep links ?go=<place> ?home=<name> ?find=<name>. Lists are built when the panel opens or a tab changes (no
//@ per-frame DOM). Never shows the subscriber total: locked places only say how many MORE subscribers they need.
//@ Hidden on the recorder page and in trailer mode. closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt
{
 const REC=document.documentElement.dataset.rec==='1';
 const P=$('goto'),body=$('gtBody'),dock=$('gtDock'),vB=$('vGoto'),nB=$('nbGoto');
 const phone=()=>matchMedia('(max-width: 700px)').matches;
 const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
 const btn=(cls,txt,fn,label)=>{const b=el('button',cls,txt);b.type='button';if(label)b.setAttribute('aria-label',label);b.addEventListener('click',fn);return b};
 const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const hid=n=>!!(window.__HIDE&&n&&window.__HIDE.some(h=>String(n).includes(h)));// recordings can hide names (view3d/labels.js pill())
 const more=n=>{const l=Math.max(0,n-(subs||0));return `${l.toLocaleString('en-US')} more subscriber${l===1?'':'s'} to open`};
 const initials=n=>String(n).replace(/[^A-Za-z0-9]/g,'').slice(0,2).toUpperCase()||'?';
 const HOSP_PV=WORLD&&/[?&]hosp=1\b/.test(location.search);// same switch as interiors/hospital.js
 const MAYOR_ON=CITY2&&!!(CITY.F&&CITY.F.cityhall&&CITY.F.oldtown)&&!/[?&]mayor=0\b/.test(location.search);// same as interiors/mayor_office.js
 // registered interiors: the live registry once the 3D city is loaded, otherwise what the page would register
 const reg=k=>{if(R3)return R3.ints().includes(k);return k==='mayor'?MAYOR_ON:k==='santa'?XMAS:k==='fire'||k==='hosp'?WORLD:true};
 const gy=(x,z)=>WORLD&&CITY.gy?CITY.gy(x,z):0;
 // ---------- places ----------
 // at() -> {x,z (metres), dist, pitch, yaw?}; the camera looks from the door side when the lot has a door
 const lotAt=(t,dist)=>()=>{const b=B[t];if(!b)return null;const o={x:b.cx/10,z:b.cy/10,dist:dist||78,pitch:.62};if(b.door)o.yaw=Math.atan2(b.door.x-b.cx,b.door.y-b.cy)+.35;return o};
 const fAt=(f,dist,pitch,yaw)=>()=>{const p=CITY.F&&CITY.F[f];return p?{x:p[0],z:p[1],dist,pitch,yaw}:null};
 const lbl=(t,d)=>MS[t]?MS[t].label:d;
 const PL=[];const add=o=>{o.alias=o.alias||[];PL.push(o);return o};
 // buildings with an interior (the milestone ones open with the channel)
 for(const[t,ic,al]of[['oficina','🔧',['repair','repairshop','workshop','garage','mechanic']],['market','🛒',['supermarket','shop','store']],['reboques','🛻',['tow','towing']],['bomba','⛽',['gas','gasstation','fuel','petrol']],
  ['pneus','🛞',['tires','tyres','tire','tireshop']],['lavagem','🫧',['wash','carwash']],['inspecao','📋',['inspection']],['parque','🅿️',['parking','parkinglot']],['pecas','⚙️',['parts','autoparts']],
  ['stand','🚗',['dealership','dealer','cardealership']],['sucata','♻️',['junkyard','scrapyard','scrap']],['fabrica','🏭',['factory','carfactory']],['pista','🏁',['track','racetrack','race']]])
  add({k:t,g:'b',ic,alias:al,label:lbl(t,t),int:t,ms:t,open:()=>isOpen(t)&&reg(t),at:lotAt(t,t==='pista'?170:t==='market'?90:78)});
 add({k:'police',g:'b',ic:'🚓',alias:['policestation','cops','station'],label:'Police station',int:'police',open:()=>reg('police'),at:lotAt('police')});
 add({k:'court',g:'b',ic:'⚖️',alias:['courthouse','judge','law'],label:'Courthouse',int:'court',open:()=>reg('court'),at:lotAt('court')});
 add({k:'news',g:'b',ic:'📰',alias:['newspaper','daily','kiosk','motoropolisdaily'],label:'Motoropolis Daily',int:'news',open:()=>reg('news'),at:lotAt('news',70)});
 add({k:'fire',g:'b',ic:'🚒',alias:['firestation','firefighters','wfire'],label:lbl('w_fire','Fire station'),int:'fire',ms:'w_fire',open:()=>WORLD&&!!MS.w_fire&&isOpen('w_fire')&&reg('fire'),at:fAt('w_fire',72,.5,Math.PI-.45)});
 add({k:'mayor',g:'b',ic:'🏛️',alias:['cityhall','townhall','mayorsoffice','office'],label:"City Hall · Mayor's office",int:'mayor',open:()=>MAYOR_ON&&reg('mayor'),
  at:()=>{const F=CITY.F,h=F.cityhall,o=F.oldtown;if(!h||!o)return null;return{x:h[0],z:h[1],dist:82,pitch:.42,yaw:Math.atan2(o[0]-h[0],o[1]-h[1])+.3}}});
 add({k:'hosp',g:'b',ic:'🏥',alias:['hospital','doctor','er'],label:lbl('w_hosp','Hospital'),int:'hosp',ms:'w_hosp',pv:()=>HOSP_PV&&!isOpen('w_hosp'),open:()=>WORLD&&!!MS.w_hosp&&(isOpen('w_hosp')||HOSP_PV)&&reg('hosp'),at:fAt('w_hosp',92,.5,Math.PI-.45)});
 add({k:'santa',g:'b',ic:'🎅',alias:['santasworkshop','xmas','christmas','northpole'],label:"Santa's workshop",int:'santa',open:()=>XMAS&&reg('santa'),at:()=>{const p=R3&&R3.santaAt&&R3.santaAt();return p?{x:p.x,z:p.z,dist:70,pitch:.55}:null}});
 // landmarks: fly there (no interior open to visitors)
 add({k:'park',g:'l',ic:'🌳',alias:['motoropolispark'],label:'Motoropolis Park',open:()=>!!B.park,at:lotAt('park',120)});
 add({k:'stadium',g:'l',ic:'🏟️',alias:['football','wstad'],label:lbl('w_stad','Football stadium'),ms:'w_stad',open:()=>WORLD&&!!MS.w_stad&&isOpen('w_stad'),at:fAt('w_stad',170,.62)});
 add({k:'drag',g:'l',ic:'🚦',alias:['dragstrip','dragway','strip'],label:'Drag Strip',open:()=>typeof DRAG!=='undefined'&&DRAG.isOpen(),
  at:()=>{const c=window.__DRAG&&window.__DRAG.cam&&window.__DRAG.cam('stands');if(c)return{x:c.tx,z:c.tz,dist:c.dist,pitch:c.pitch,yaw:c.yaw};const d=CITY.F&&CITY.F.dragway;return d?{x:d[0],z:d[1],dist:220,pitch:.6}:null}});
 for(const[t,f,ic,al,dist]of[['w_mall','w_mall','🛍️',['mall','shopping'],180],['w_train','w_train','🚉',['train','trainstation','station'],170],['w_arena','w_arena','🎤',['arena','events'],190],['w_air','w_air','✈️',['airport'],420],['w_port','w_port','⚓',['port','harbor'],260]])
  add({k:t.slice(2),g:'l',ic,alias:al,label:lbl(t,t),ms:t,open:()=>WORLD&&!!MS[t]&&isOpen(t),at:fAt(f,dist,.6)});
 add({k:'tvtower',g:'l',ic:'📡',alias:['tower','tv'],label:'TV tower',open:()=>CITY2&&!!(CITY.F&&CITY.F.tvtower),at:fAt('tvtower',260,.35)});
 add({k:'lighthouse',g:'l',ic:'🗼',alias:['cape'],label:'Lighthouse',open:()=>CITY2&&!!(CITY.F&&CITY.F.lighthouse),at:fAt('lighthouse',150,.4)});
 const byKeyRaw=k=>PL.find(p=>p.k===k);
 // districts: the camera only (coordinates from the layout data)
 {const D={};for(const d of CITY.districts||[])D[d.id]=d;
  const dz=(id,k,ic,label,al)=>{const d=D[id];if(!d)return;add({k,g:'d',ic,alias:al,label,open:()=>(subs||0)>=(d.n||0),at:()=>({x:d.x,z:d.z,dist:clamp(d.r*2.4,180,560),pitch:.8})})};
  if(CITY.P0)add({k:'roundabout',g:'d',ic:'⭕',alias:['plaza','downtownroundabout','centre','center'],label:'Downtown roundabout',open:()=>true,at:()=>({x:CITY.P0.x,z:CITY.P0.z,dist:170,pitch:.7})});
  dz('centre','downtown','🏙️','Downtown',['city']);
  if(CITY.F&&CITY.F.oldtown)add({k:'oldtown',g:'d',ic:'⛲',alias:['oldtownsquare','square','cityhallsquare'],label:'Old Town · City Hall square',open:()=>true,at:fAt('oldtown',120,.62)});
  if(CITY.F&&CITY.F.marina)add({k:'harbour',g:'d',ic:'⛵',alias:['harbor','marina','quay','bay'],label:'Harbour & marina',open:()=>true,at:fAt('marina',230,.6)});
  dz('village','riverside','🏡','Riverside Heights',['riversideheights','homes','houses','village']);
  // Riverside Heights: frame the first 40 houses (the ones always built, interiors/home.js) rather than the district label point
  {const pl=byKeyRaw('riverside'),S2=CITY.slots&&CITY.slots.village;if(pl&&S2&&S2.length){const h=S2.slice(0,40);let x=0,z=0;for(const q of h){x+=q[0];z+=q[1]}x/=h.length;z/=h.length;pl.at=()=>({x,z,dist:200,pitch:.72})}}
  dz('suburbs','maple','🌲','Maple Grove',['maplegrove','suburbs','apartments','flats']);
  dz('hills','hills','⛰️','The Hills',['thehills']);
  dz('industry','industrial','🏗️','Industrial zone',['industry','industrialzone']);
  dz('auto','automotive','🚘','Automotive zone',['auto','autozone']);
  dz('farms','farms','🌾','Farms',['farm','countryside'])}
 const byKey=k=>{k=norm(k);if(!k)return null;return PL.find(p=>norm(p.k)===k)||PL.find(p=>p.alias.includes(k))||null};
 // ---------- 3D: ready, fly, follow, enter ----------
 let FL=null,FOL=null,folT=0,folI=0;
 function ready3D(cb){if(!hasGL())return;if(!view3d||!R3)setView(true,true);let n=0;
  const t=setInterval(()=>{if(++n>3000){clearInterval(t);return}if(!R3||!view3d)return;if(R3.mode()==='in'){R3.exitIn();return}clearInterval(t);cb()},100)}
 const ease=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
 // smooth camera flight to a (possibly moving) target; long hops rise a little in the middle
 function fly(get,o){const c=R3.cam,p=get();if(!p)return;const d=Math.hypot(p.x-c.tx,p.z-c.tz);
  FL={t0:performance.now(),dur:clamp(900+d*1.4,1000,2600),hop:d>160?Math.min(520,d*.35):0,a:{tx:c.tx,tz:c.tz,d:c.dist,p:c.pitch,y:c.yaw,ty:c.ty||0},o,get,last:p};requestAnimationFrame(step)}
 function step(){const f=FL;if(!f||!R3)return;if(R3.mode()==='in'){FL=null;return}
  const u=Math.min(1,(performance.now()-f.t0)/f.dur),e=ease(u),p=f.get()||f.last;f.last=p;const c=R3.cam,a=f.a,o=f.o;
  c.tx=a.tx+(p.x-a.tx)*e;c.tz=a.tz+(p.z-a.tz)*e;c.dist=a.d+(o.dist-a.d)*e+f.hop*Math.sin(Math.PI*e);c.pitch=a.p+(o.pitch-a.p)*e;
  if(o.yaw!=null)c.yaw=angLerp(a.y,o.yaw,e);c.ty=a.ty+(gy(p.x,p.z)-a.ty)*e;
  if(u>=1){FL=null;if(o.done)o.done()}else requestAnimationFrame(step)}
 const stopCam=()=>{FL=null;FOL=null};
 c3.addEventListener('pointerdown',stopCam);c3.addEventListener('wheel',stopCam,{passive:true});
 // where a resident is now: drivers by their vehicle first, everyone else on foot first (people/walkers.js, people/jobs.js)
 const DRIVES=/Driver$/;
 function whereN(n){const j=jobOf(n),p=peds.find(q=>q.name===n),c=cars.find(q=>q.driver===n&&!q.removed&&!q.hidden);
  if(c&&j&&DRIVES.test(j))return{kind:'car',o:c};if(p)return{kind:'ped',o:p};if(c)return{kind:'car',o:c};return null}
 const posW=w=>({x:w.o.x/10,z:w.o.y/10});
 // keep the camera on the person for a while (like Find my name); a drag or zoom on the city stops it
 function follow(n){FOL=n;folT=0;if(folI)return;folI=setInterval(()=>{if(!FOL){clearInterval(folI);folI=0;return}if(!R3||R3.mode()==='in')return;folT+=.05;
  const w=whereN(FOL);if(!w||folT>45){FOL=null;return}const p=posW(w),c=R3.cam;c.tx+=(p.x-c.tx)*.2;c.tz+=(p.z-c.tz)*.2},50)}
 function enter(k){if(!R3)return;R3.enterIn(k);let n=0;const t=setInterval(()=>{if(!R3||R3.mode()==='in'||++n>30){clearInterval(t);return}R3.enterIn(k)},120);hideDock()}
 // ---------- actions ----------
 const afterPick=()=>{if(phone())P.hidden=true};
 function goPlace(pl,opt){opt=opt||{};afterPick();ready3D(()=>{const at=pl.at();if(!at)return;FOL=null;
  const canIn=!!(pl.int&&pl.open());
  if(opt.enter&&canIn){const c=R3.cam;FL=null;Object.assign(c,{tx:at.x,tz:at.z,dist:at.dist,pitch:at.pitch,ty:gy(at.x,at.z)});if(at.yaw!=null)c.yaw=at.yaw;enter(pl.int);return}
  fly(()=>at,{dist:at.dist,pitch:at.pitch,yaw:at.yaw});
  showDock(pl.ic,pl.label,canIn?(pl.pv&&pl.pv()?'Preview · step inside':'Open · step inside to look around'):pl.open()?'':'Blueprint · '+more(MS[pl.ms]?MS[pl.ms].n:0),canIn?[['STEP INSIDE ▶','gt-in',()=>enter(pl.int)]]:[])})}
 // the interior where a resident works (every interior shows its staff with their name tags, interiors/_staff.js)
 const WORK_IN={w_fire:'fire',w_hosp:'hosp'};
 function workPlace(n){const j=JOBS[n];if(!j||j.free)return null;const k=WORK_IN[j.b]||j.b;const pl=PL.find(p=>p.k===k)||(j.b==='w_res'?byKey('riverside'):j.b==='w_stad'?byKey('stadium'):null);return pl&&pl.open()?pl:null}
 function goPerson(n){afterPick();ready3D(()=>{const w=whereN(n),j=jobOf(n),wp=workPlace(n),hm=UIX.homeOf&&UIX.homeOf(n);
  const acts=[];if(wp&&wp.int)acts.push(['AT WORK ▶','gt-in',()=>goPlace(wp,{enter:true})]);if(hm)acts.push(['HOME ▶','gt-in2',()=>{stopCam();hideDock();hm.go()}]);
  const sub=(j&&j!=='Homeless'?j:'Looking for a job')+(w?(w.kind==='car'?' · driving':' · walking'):wp?' · at work':'');
  if(w){const get=()=>{const q=whereN(n);return q?posW(q):null};FOL=null;fly(get,{dist:34,pitch:.62,done:()=>follow(n)});showDock('★',hid(n)?'A resident':n,sub,acts);return}
  if(wp){const at=wp.at();if(at)fly(()=>at,{dist:at.dist,pitch:at.pitch,yaw:at.yaw});showDock('★',hid(n)?'A resident':n,sub,acts);return}
  if(hm){stopCam();hm.go()}})}
 // ---------- the dock: what you flew to, and STEP INSIDE ----------
 let dockI=0;
 function hideDock(){dock.hidden=true;if(dockI){clearInterval(dockI);dockI=0}}
 function showDock(ic,title,sub,acts){dock.textContent='';const i=el('span','gt-dk-ic',ic);const tx=el('div','gt-dk-tx');tx.append(el('b',ic==='★'?'gt-nm':null,title));if(sub)tx.append(el('small',null,sub));dock.append(i,tx);
  const a=el('div','gt-dk-acts');for(const[t,c,f]of acts)a.append(btn(c,t,f));if(acts.length)dock.append(a);
  dock.append(btn('fd-x gt-dk-x','',()=>{hideDock()},'Close'));dock.lastChild.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  dock.classList.toggle('pn-open',!P.hidden);dock.hidden=false;
  if(!dockI)dockI=setInterval(()=>{if(R3&&R3.mode()==='in')hideDock();else dock.classList.toggle('pn-open',!P.hidden)},300)}
 dock.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();hideDock()}});
 // ---------- rows ----------
 function placeRow(pl){const li=el('li','gt-row'+(pl.open()?'':' soon'));const go=btn('gt-go','',()=>goPlace(pl));
  const tx=el('span','gt-tx');tx.append(el('b',null,pl.label));
  let sub='';if(!pl.open())sub=more(MS[pl.ms]?MS[pl.ms].n:0);else if(pl.pv&&pl.pv())sub='Preview (not open yet)';else if(pl.int)sub=pl.k==='mayor'?'Meet Mayor TorqueBlueprint':'Fly there · step inside';else sub='Fly there';
  const sm=el('small',pl.open()?null:'gt-soon',sub);tx.append(sm);go.append(el('span','gt-ic',pl.ic),tx);go.setAttribute('aria-label',pl.label+' · '+sub);li.append(go);
  if(pl.int&&pl.open())li.append(btn('gt-in','Inside ▶',()=>goPlace(pl,{enter:true}),'Step inside '+pl.label));return li}
 function personRow(n,opt){const li=el('li','gt-row gt-pr');const w=whereN(n),j=jobOf(n),hm=UIX.homeOf&&UIX.homeOf(n),wp=workPlace(n);
  const go=btn('gt-go','',()=>goPerson(n));const tx=el('span','gt-tx');tx.append(el('b','gt-nm',n));
  tx.append(el('small',null,(j&&j!=='Homeless'?j:'Looking for a job')+(w?(w.kind==='car'?' · driving':' · walking'):wp?' · at work':'')));
  if(hm)tx.append(el('small','gt-hm','Home: '+hm.label));go.append(el('span','fd-av gt-av',initials(n)),tx);go.setAttribute('aria-label','Go to '+n);li.append(go);
  if(opt&&opt.home&&hm)li.append(btn('gt-in2','Home ▶',()=>{afterPick();ready3D(()=>{stopCam();hideDock();hm.go()})},'Go to the home of '+n));return li}
 // ---------- jobs (the city's own assignment: JOBS from people/jobs.js, read with staffOf) ----------
 const ORDER=['police','w_fire','w_hosp','court','news','bus','taxi','sanit','park','market','oficina','reboques','bomba','pneus','lavagem','inspecao','parque','pecas','stand','sucata','fabrica','pista','w_res','w_stad','w_mall','w_train','w_hwy','w_air','w_arena','w_port','w_tower','w_gp'];
 function jobGroups(){const out=[],seen={};const addJ=(b,place,j)=>{const key=b+'|'+j[1];if(seen[key])return;seen[key]=1;const g={b,place,title:j[1],slots:[]};for(let k=0;k<j[2];k++)g.slots.push(staffOf(b,j[1],k));out.push(g)};
  for(const m of ALL_MS)if(isOpen(m.type))for(const j of JOB_LIST)if(j[0]===m.type)addJ(m.type,m.label,j);
  for(const m of CIVIC)for(const j of JOB_LIST)if(j[0]===m.type)addJ(m.type,m.label,j);
  const o=b=>{const i=ORDER.indexOf(b);return i<0?99:i};return out.map((g,i)=>(g.i=i,g)).sort((a,b)=>o(a.b)-o(b.b)||a.i-b.i)}
 function jobCard(g){const box=el('div','gt-job');const h=el('div','gt-jh');const f=g.slots.filter(Boolean).length;h.append(el('b',null,g.title),el('small',null,`${g.place} · ${f}/${g.slots.length}`));box.append(h);
  const ch=el('div','gt-chips');g.slots.forEach(n=>{if(n){const c=btn('gt-chip','',()=>goPerson(n),'Go to '+(hid(n)?'a resident':n)+', '+g.title);c.append(el('span','fd-av gt-av',hid(n)?'★':initials(n)),el('span','gt-cn',hid(n)?'A resident':n));ch.append(c)}
   else{const c=el('div','gt-chip gt-open');c.append(el('b',null,'JOB OPEN'),el('span',null,'Comment WORKSHOP '+g.title.toUpperCase()));ch.append(c)}});box.append(ch);return box}
 // ---------- tabs ----------
 let tab='places',q='';
 function places(){body.textContent='';const sec=(h,list)=>{if(!list.length)return;body.append(el('h3','gt-h',h));const ul=el('ul','gt-list');for(const p of list)ul.append(placeRow(p));body.append(ul)};
  sec('Buildings',PL.filter(p=>p.g==='b'&&p.open()));sec('Landmarks',PL.filter(p=>p.g==='l'&&p.open()));sec('Districts',PL.filter(p=>p.g==='d'&&p.open()));
  // coming soon: locked milestones (only how many more subscribers each needs)
  if(subs!==null){const soon=ALL_MS.filter(m=>!isOpen(m.type));if(soon.length){body.append(el('h3','gt-h','Coming soon'));const ul=el('ul','gt-list');
   for(const m of soon){const pl=PL.find(p=>p.ms===m.type)||(m.type==='w_res'?byKey('riverside'):null);if(pl&&pl.at()&&!pl.open()){ul.append(placeRow(Object.assign({},pl,{label:m.label,ms:m.type,open:()=>false})));continue}
    const li=el('li','gt-row soon');const s=el('div','gt-go gt-static');const tx=el('span','gt-tx');tx.append(el('b',null,m.label),el('small','gt-soon',more(m.n)));s.append(el('span','gt-ic','🔒'),tx);li.append(s);ul.append(li)}body.append(ul)}}}
 function jobs(){body.textContent='';body.append(el('p','pn-sub','Every job in the city and who does it. Tap a name to go to them.'));for(const g of jobGroups())body.append(jobCard(g));
  body.append(el('p','gt-note','New residents get the next free job. Want a certain one? Comment WORKSHOP and the job on any TorqueBlueprint video. Your newest comment wins.'))}
 function people(){body.textContent='';const lb=el('label',null,'Search names, places and jobs');lb.htmlFor='gtIn';const inp=el('input');inp.id='gtIn';inp.type='text';inp.autocomplete='off';inp.spellcheck=false;inp.placeholder='Your name, “police”, “doctor”…';inp.value=q;
  const out=el('div','gt-res');body.append(lb,inp,out);
  const show=()=>{q=inp.value;out.textContent='';const s=norm(q);if(!s){out.append(el('p','pn-sub','Type a name (yours too!), a place or a job.'));return}
   const pl=PL.filter(p=>p.open()&&(norm(p.label).includes(s)||norm(p.k).startsWith(s)||p.alias.some(a=>a.startsWith(s))));
   const jg=jobGroups().filter(g=>norm(g.title).includes(s)||norm(g.place).includes(s));
   const all=WALL.filter(n=>!hid(n)&&norm(n).includes(s)),ppl=all.slice(0,20);
   if(ppl.length){out.append(el('h3','gt-h','People'));const ul=el('ul','gt-list');for(const n of ppl)ul.append(personRow(n,{home:true}));out.append(ul);if(all.length>ppl.length)out.append(el('p','gt-note',`${all.length-ppl.length} more · keep typing`))}
   if(pl.length){out.append(el('h3','gt-h','Places'));const ul=el('ul','gt-list');for(const p of pl.slice(0,8))ul.append(placeRow(p));out.append(ul)}
   if(jg.length){out.append(el('h3','gt-h','Jobs'));for(const g of jg.slice(0,6))out.append(jobCard(g))}
   if(!ppl.length&&!pl.length&&!jg.length){out.append(el('p','pn-sub','Nothing here with that name yet.'));out.append(btn('pn-link','Not in the city yet? How to move in',()=>{P.hidden=true;const m=document.querySelector('[data-open="moveIn"]');if(m)m.click()}))}};
  inp.addEventListener('input',show);show();return inp}
 function render(){for(const b of P.querySelectorAll('[data-gt]'))b.setAttribute('aria-selected',String(b.dataset.gt===tab));body.setAttribute('aria-labelledby','gtT-'+tab);body.scrollTop=0;
  if(tab==='jobs')jobs();else if(tab==='people')return people();else places()}
 for(const b of P.querySelectorAll('[data-gt]'))b.addEventListener('click',()=>{tab=b.dataset.gt;const i=render();if(i&&!phone())i.focus()});
 // re-render once when the 3D city (and its interior registry) arrives while the panel is open
 let r3Seen=!!R3,openI=0;
 function open(t){if(UIX.only)UIX.only('goto');if(t)tab=t;P.hidden=false;const i=render();dock.classList.toggle('pn-open',true);
  if(i&&!phone())i.focus();else{const s=P.querySelector('[data-gt][aria-selected="true"]');if(s&&!phone())try{s.focus({preventScroll:true})}catch(e){}}
  if(!openI)openI=setInterval(()=>{if(P.hidden){clearInterval(openI);openI=0;return}if(!r3Seen&&R3){r3Seen=true;if(tab!=='people')render()}},500)}
 const toggle=()=>{if(P.hidden){if(phone()){const r=$('screen').getBoundingClientRect();if(r.top<-40||r.top>innerHeight*.35)$('screen').scrollIntoView({block:'start'})}open()}else P.hidden=true};
 UIX.openGoto=open;
 if(REC){vB.hidden=true;nB.hidden=true}
 else{
  vB.addEventListener('click',toggle);nB.addEventListener('click',toggle);
  P.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();P.hidden=true;try{vB.focus({preventScroll:true})}catch(x){}}});
  // Esc closes the panel first (then a second Esc leaves an interior as before)
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!P.hidden){e.stopPropagation();P.hidden=true}},true);
  // trailer mode (recorder hook) films the city only
  setInterval(()=>{const t=!!trailer;vB.hidden=t;nB.hidden=t;if(t){P.hidden=true;hideDock()}},1000);
  // ---------- deep links: ?go=<place> ?home=<name> ?find=<name> ----------
  const sp=new URLSearchParams(location.search),dGo=(sp.get('go')||'').slice(0,40),dHome=(sp.get('home')||'').trim().slice(0,24),dFind=(sp.get('find')||'').trim().slice(0,24);
  const nameOf=v=>{if(!v)return null;const l=v.toLowerCase();return WALL.find(n=>n===v)||WALL.find(n=>n.toLowerCase()===l)||WALL.find(n=>norm(n)===norm(v))||null};
  if((dGo||dHome||dFind)&&hasGL()){let n=0;const t=setInterval(()=>{if(++n>4000){clearInterval(t);return}
    if(!R3||subs===null||!JOBSIG)return;if(dHome&&!UIX.homeOf&&n<200)return;clearInterval(t);
    const wc=$('welcome');if(wc&&!wc.hidden)$('wcGo').click();else if(!view3d)setView(true,true);
    if(dHome){const nm=nameOf(dHome),hm=nm&&UIX.homeOf&&UIX.homeOf(nm);if(hm){ready3D(()=>hm.go());return}}
    if(dFind){const nm=nameOf(dFind);if(nm){q=nm;open('people');goPerson(nm);return}}
    if(dGo){const pl=byKey(dGo);if(pl&&pl.at())goPlace(pl)}},150)}
 }
}
