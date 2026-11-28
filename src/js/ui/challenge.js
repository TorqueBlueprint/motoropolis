//@ ui/challenge.js - Phase 2D: "Challenge to a drag race" from the car panel (and the GO TO person dock). Pick an opponent
//@ (search over the residents, or random), then a heads-up 1v1 result card: reaction time, 60 ft (18 m), 1/4 mile (402 m)
//@ elapsed time and trap speed (mph and km/h) of both cars, the winner and the margin. Deterministic: seeded from the two
//@ entrants and the UTC date, so everyone sees the same result for the same pair on the same day. Nothing is saved.
//@ Residents race their Drag Strip car (the one sim/drag.js gives them, the same in every browser); a car without a driver
//@ races as itself (by plate). "Watch on the strip" appears only when the strip is open here and the strip exposes its
//@ heads-up API. closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt
{
 // ================= RACE1V1: the one place that talks to the Drag Strip (swap it for the strip's own API) =================
 // Today it runs sim/drag.js run() for both cars with a seed of its own. When the strip publishes its heads-up API
 // (branch wip-drag2, see its README), point run() and watch() at it; nothing else in this file needs to change.
 //   run(a, b, date) -> {date, lanes:[A, B], win:0|1, margin}   lane: {e, rt, red, t60, t8, v8, et, vt, tune, o}
 //   canWatch()      -> true when a one-off race can be replayed on the 3D strip on this page
 //   watch(a, b, res) -> replays it there (camera to the strip)
 const RACE1V1=(()=>{
  const cache=new Map();
  const tuneOf=e=>{const T=typeof STATE!=='undefined'&&STATE.drag&&STATE.drag.tunes;return e.name&&T&&T[e.name]&&DRAG.TUNES[T[e.name]]?T[e.name]:'stock'};
  function run(A,B,date){const P=A.id<=B.id?A:B,Q=P===A?B:A,key=date+'|'+P.id+'|'+P.glb+'|'+Q.id+'|'+Q.glb;
   if(cache.has(key)){const c=cache.get(key);return P===A?c:{date,lanes:[c.lanes[1],c.lanes[0]],win:1-c.win,margin:c.margin}}
   const r=DRAG.rng(DRAG.h32('chal|'+key)),air=.97+r()*.05,track=.96+r()*.06;
   // the same pass as a heat of the daily races (sim/drag.js day()): grip, air, the driver's shifting and launch, reaction time
   const pass=e=>{const tune=tuneOf(e),grip=track*(.97+r()*.05),power=air*(.99+r()*.02),shiftK=1+(r()-.4)*e.cons,ldl=(r()-.5)*.12*e.cons,rt=Math.round((e.rt0+(r()-.3)*.05)*1000)/1000;
    const o={glb:e.glb,tune,grip,power,shiftK,ldl},res=DRAG.run(o);return{e,rt,red:rt<.4,t60:res.t60,t8:res.t8,v8:res.v8,et:res.et,vt:res.vt,tune,o}};
   const lp=pass(P),lq=pass(Q),win=DRAG.judge(lp,lq),out={date,lanes:[lp,lq],win,margin:Math.abs((lp.rt+lp.et)-(lq.rt+lq.et))};
   cache.set(key,out);if(cache.size>40)cache.delete(cache.keys().next().value);
   return P===A?out:{date,lanes:[lq,lp],win:1-win,margin:out.margin}}
  const api=()=>{const D=window.__DRAG;return D&&typeof D.headsUp==='function'?D.headsUp:null};
  return{run,canWatch:()=>!!(DRAG.isOpen()&&api()&&R3),watch:(a,b,res)=>{const f=api();if(f)f(a,b,res)}}})();
 // ================= entrants =================
 const REC=document.documentElement.dataset.rec==='1';
 const hid=n=>!!(window.__HIDE&&n&&window.__HIDE.some(h=>String(n).includes(h)));
 const who=e=>e.name?(hid(e.name)?'A resident':e.name):e.plate;
 // a resident: their Drag Strip entrant (same formulas as sim/drag.js entrant(), for names beyond the strip's field too)
 function byName(n){const k=String(n).toLowerCase(),f=DRAG.entrants().find(e=>e.name&&e.name.toLowerCase()===k);if(f)return f;
  const hm=DRAG.h32('car|'+k),m=MODELS[hm%MODELS.length],r=DRAG.rng(DRAG.h32('drv|'+k));return{id:'n:'+k,name:n,plate:'',glb:m.glb,model:m.n,rt0:.415+r()*.11,cons:.3+r()*.7}}
 // a car on the street: its driver's entrant, or the car itself (no driver: its plate and model)
 function byCar(c){if(c.driver)return byName(c.driver);const r=DRAG.rng(DRAG.h32('drv|p:'+c.plate));return{id:'p:'+c.plate+'|'+(c.m&&c.m.glb),name:null,plate:c.plate,glb:c.m&&c.m.glb||'hothatch',model:c.model,rt0:.415+r()*.11,cons:.3+r()*.7}}
 const spec=e=>DRAG.SPEC[e.glb]||DRAG.SPEC.hothatch;
 // ================= the panel =================
 const P=$('chal'),body=$('chBody');let A=null,q='';
 const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
 const btn=(cls,txt,fn,label)=>{const b=el('button',cls,txt);b.type='button';if(label)b.setAttribute('aria-label',label);b.addEventListener('click',fn);return b};
 const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const initials=n=>String(n).replace(/[^A-Za-z0-9]/g,'').slice(0,2).toUpperCase()||'?';
 const carLine=e=>{const s=spec(e);return `${e.model} · ${s.hp} hp · ${Math.round(s.hp*.7457)} kW · ${s.kg.toLocaleString('en-US')} kg · ${Math.round(s.kg*2.20462).toLocaleString('en-US')} lb · ${s.drive}`};
 function head(){const h=el('div','ch-me');h.append(el('span','fd-av gt-av',A.name?(hid(A.name)?'★':initials(A.name)):'🚗'));const t=el('div','gt-tx');t.append(el('b',A.name?'gt-nm':null,who(A)),el('small',null,carLine(A)));h.append(t);return h}
 function picker(){body.textContent='';body.append(el('p','pn-sub','Heads-up drag race over a quarter mile (402 m). Pick who to race:'),head());
  const lb=el('label',null,'Opponent');lb.htmlFor='chIn';const inp=el('input');inp.id='chIn';inp.type='text';inp.autocomplete='off';inp.spellcheck=false;inp.placeholder='Search the residents…';inp.value=q;
  const rnd=btn('gt-act ch-rnd','🎲 Random opponent',()=>{const pool=WALL.filter(n=>!hid(n)&&byName(n).id!==A.id);if(!pool.length)return;let i=0;try{const a=new Uint32Array(1);crypto.getRandomValues(a);i=a[0]%pool.length}catch(e){i=Math.floor(performance.now()%pool.length)}result(byName(pool[i]))});
  const out=el('ul','gt-list ch-list');body.append(lb,inp,rnd,out);
  const show=()=>{q=inp.value;out.textContent='';const s=norm(q);const list=WALL.filter(n=>!hid(n)&&(!s||norm(n).includes(s))&&byName(n).id!==A.id).slice(0,s?8:5);
   if(!list.length){out.append(el('li','pn-sub',s?'No resident with that name yet.':'No residents to race yet.'));return}
   for(const n of list){const e=byName(n),li=el('li','gt-row');const g=btn('gt-go','',()=>result(e),'Race '+n);const tx=el('span','gt-tx');tx.append(el('b','gt-nm',n),el('small',null,e.model));g.append(el('span','fd-av gt-av',initials(n)),tx);li.append(g,btn('gt-in','Race ▶',()=>result(e),'Race '+n));out.append(li)}};
  inp.addEventListener('input',show);show();return inp}
 const f3=t=>t.toFixed(3)+' s';
 function result(B){const res=RACE1V1.run(A,B,DRAG.today()),[a,b]=res.lanes,w=res.lanes[res.win],l=res.lanes[1-res.win];body.textContent='';
  const ban=el('div','ch-win');ban.append(el('div','dg-k','Heads-up · 1/4 mile · 402 m'));
  if(a.red||b.red){const red=a.red&&b.red?l:(a.red?a:b);ban.append(el('div','dg-champ','🏆 '+who(w.e)),el('div','dg-sub',`${who(red.e)} left before the green (red light).`))}
  else{const dm=res.margin*l.vt;ban.append(el('div','dg-champ','🏆 '+who(w.e)+' wins'),el('div','dg-sub',`by ${res.margin.toFixed(3)} s · about ${dm.toFixed(1)} m · ${Math.round(dm*3.28084)} ft at the line`))}
  body.append(ban);
  // the two lanes side by side; the better number of each row is marked
  const tb=el('table','ch-tb');const tr=(lab,va,vb,better)=>{const r=el('tr');r.append(el('th',null,lab));const ca=el('td',better===0?'ch-b':null,va),cb=el('td',better===1?'ch-b':null,vb);r.append(ca,cb);tb.append(r)};
  {const r=el('tr','ch-who');r.append(el('th'));for(const ln of[a,b]){const td=el('td',ln===w?'ch-w':null);td.append(el('b',ln.e.name?'gt-nm':null,who(ln.e)),el('small',null,ln.e.model));r.append(td)}tb.append(r)}
  const sa=spec(a.e),sb=spec(b.e),lo=(x,y)=>x<y?0:y<x?1:-1,hi=(x,y)=>x>y?0:y>x?1:-1;
  tr('Power',`${sa.hp} hp · ${Math.round(sa.hp*.7457)} kW`,`${sb.hp} hp · ${Math.round(sb.hp*.7457)} kW`,-1);
  tr('Weight',`${sa.kg.toLocaleString('en-US')} kg · ${Math.round(sa.kg*2.20462).toLocaleString('en-US')} lb`,`${sb.kg.toLocaleString('en-US')} kg · ${Math.round(sb.kg*2.20462).toLocaleString('en-US')} lb`,-1);
  tr('Reaction (R/T)',a.red?f3(a.rt)+' · red':f3(a.rt),b.red?f3(b.rt)+' · red':f3(b.rt),a.red||b.red?(a.red&&!b.red?1:b.red&&!a.red?0:-1):lo(a.rt,b.rt));
  tr('60 ft · 18 m',f3(a.t60),f3(b.t60),lo(a.t60,b.t60));
  tr('1/4 mile · 402 m',f3(a.et),f3(b.et),lo(a.et,b.et));
  tr('Trap speed',(a.vt*2.236936).toFixed(1)+' mph',(b.vt*2.236936).toFixed(1)+' mph',hi(a.vt,b.vt));
  tr('',(a.vt*3.6).toFixed(1)+' km/h',(b.vt*3.6).toFixed(1)+' km/h',hi(a.vt,b.vt));
  tr('R/T + ET',f3(a.rt+a.et),f3(b.rt+b.et),lo(a.rt+a.et,b.rt+b.et));
  body.append(tb);
  body.append(el('p','dg-note','First to the line wins: reaction time plus elapsed time. Today’s conditions (UTC), the same result for everyone. Residents race their Drag Strip car.'));
  const acts=el('div','ch-acts');
  if(RACE1V1.canWatch())acts.append(btn('gt-in','Watch on the strip ▶',()=>{if(DRV&&DRV.on)DRV.stop();RACE1V1.watch(A,B,res);if(matchMedia('(max-width: 700px)').matches)P.hidden=true}));
  acts.append(btn('gt-act','Race someone else',()=>{const i=picker();try{i.focus({preventScroll:true})}catch(e){}}));body.append(acts);body.scrollTop=0;P.scrollTop=0}
 // from the car panel (a car), the GO TO dock ({name}) or a test hook
 function open(x,opp){if(REC||trailer||!x)return;A=x.plate!==undefined&&x.id!==undefined&&x.m?byCar(x):x.name?byName(x.name):null;if(!A)return;
  if(UIX.only)UIX.only('chal');P.hidden=false;
  if(matchMedia('(max-width: 700px)').matches){const r=$('screen').getBoundingClientRect();if(r.top<-40||r.top>innerHeight*.35)$('screen').scrollIntoView({block:'start'})}
  if(opp){result(byName(opp));return}const i=picker();if(!matchMedia('(max-width: 700px)').matches)try{i.focus({preventScroll:true})}catch(e){}}
 UIX.challenge=open;UIX.race1v1=RACE1V1;
 if(location.hostname==='localhost')window.__CHAL={run:(a,b,d)=>{const r=RACE1V1.run(byName(a),byName(b),d||DRAG.today());return{win:r.win,margin:+r.margin.toFixed(4),lanes:r.lanes.map(l=>({who:l.e.name,model:l.e.model,rt:l.rt,t60:+l.t60.toFixed(3),et:+l.et.toFixed(3),mph:+(l.vt*2.236936).toFixed(1)}))}}};// test hook
 setInterval(()=>{if(trailer&&!P.hidden)P.hidden=true},1000);
}
