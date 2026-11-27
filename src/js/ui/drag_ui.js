//@ ui/drag_ui.js - Phase 2C step 1: the Drag Strip panel (today's races, fastest this week, a person's best), opened from
//@ the Unlocks panel. Hidden entirely while the strip is locked (only the board in 3D shows then). Every number in both
//@ units (seconds; mph and km/h). Never shows the subscriber total, nor how many cars or heats there are.
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt
{
 const P=$('drag'),body=$('dgBody'),link=$('ulDrag'),F=DRAG.fmt;let tab='today',meName='';
 const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
 const day=()=>DRAG.day(DRAG.today());
 const dayName=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'});
 function vis(){const o=DRAG.isOpen();link.hidden=!o;if(!o&&!P.hidden)P.hidden=true}
 vis();setInterval(vis,3000);
 // one lane of a heat: who, the car, the time and the trap speed
 function lane(l,win){const r=el('div','dg-ln'+(win?' w':''));if(!l){r.append(el('span','dg-who','Bye run'));return r}
  const a=el('span','dg-who');a.append(el('b',null,F.who(l.e)),el('small',null,l.e.model));
  const b=el('span','dg-t');b.append(el('b',null,l.red?'RED LIGHT':F.et(l.et)),el('small',null,F.spd(l.vt)));
  const c=el('span','dg-r',(win?'WIN · ':'')+'RT '+l.rt.toFixed(3)+' s · ET '+l.et.toFixed(3)+' s'+(l.red?' · red light':''));r.append(a,b,c);return r}
 function heat(h){const box=el('div','dg-heat');box.append(el('div','dg-hl',h.label));box.append(lane(h.lanes[0],h.win===0&&!!h.lanes[1]),lane(h.lanes[1],h.win===1));return box}
 function today(){const d=day(),f=d.final;body.textContent='';
  const top=el('div','dg-final');top.append(el('div','dg-k',`Today · ${dayName(d.date)}`));
  if(f){const w=f.lanes[f.win];top.append(el('div','dg-champ','🏆 '+F.who(w.e)),el('div','dg-sub',`${w.e.model} · won the final in ${F.et(w.et)} at ${F.spd(w.vt)}`))}
  else top.append(el('div','dg-sub','The first races start at midnight (UTC).'));body.append(top);
  const el2=d.heats.filter(h=>h.round!=='q');if(el2.length){body.append(el('h3','dg-h','Eliminations'));for(const h of el2.slice().reverse())body.append(heat(h))}
  if(d.quali.length){body.append(el('h3','dg-h','Best qualifiers'));const ol=el('ol','dg-list');d.quali.slice(0,8).forEach(l=>{const li=el('li');const a=el('span','dg-who');a.append(el('b',null,F.who(l.e)),el('small',null,l.e.model));const b=el('span','dg-t');b.append(el('b',null,l.red?'RED LIGHT':F.et(l.et)),el('small',null,F.spd(l.vt)));li.append(a,b);ol.append(li)});body.append(ol)}
  body.append(el('p','dg-note','Heads-up racing: both cars get the green together and the first to the line wins. Leave before the green (red light) and you lose. The races run at midnight UTC and the strip replays every heat all day. Quarter mile · 402 m.'))}
 function week(){const w=DRAG.week(DRAG.today());body.textContent='';body.append(el('p','dg-note','The quickest quarter mile (402 m) of each car since Monday (UTC).'));
  const ol=el('ol','dg-list dg-rank');w.slice(0,10).forEach(l=>{const li=el('li');const a=el('span','dg-who');a.append(el('b',null,F.who(l.e)),el('small',null,l.e.model+' · '+dayName(l.date)));const b=el('span','dg-t');b.append(el('b',null,F.et(l.et)),el('small',null,F.spd(l.vt)));li.append(a,b);ol.append(li)});body.append(ol)}
 function me(){body.textContent='';const lb=el('label',null,'Your YouTube name');lb.htmlFor='dgIn';const inp=el('input');inp.id='dgIn';inp.type='text';inp.autocomplete='off';inp.spellcheck=false;inp.placeholder='Start typing your name…';inp.value=meName;
  const out=el('div','dg-me');body.append(lb,inp,out);
  const show=()=>{meName=inp.value;out.textContent='';const q=inp.value.trim().toLowerCase();if(!q)return;
   const hit=WALL.find(n=>n.toLowerCase()===q)||WALL.find(n=>n.toLowerCase().includes(q));const p=hit&&DRAG.person(hit,DRAG.today());
   if(!p){out.append(el('p','dg-note',hit?`${hit} doesn’t have a car in the races yet.`:'No one with that name lives here yet. Comment WORKSHOP on any video to move in.'));return}
   const card=el('div','dg-final');card.append(el('div','dg-k',p.e.name),el('div','dg-sub',p.e.model+' · plate '+p.e.plate));
   if(p.best){card.append(el('div','dg-champ',F.et(p.best.et)),el('div','dg-sub',`Best this week · ${F.spd(p.best.vt)} · ${dayName(p.best.date)}`))}out.append(card);
   if(p.today.length){out.append(el('h3','dg-h','Today'));for(const r of p.today)out.append(heat(r.heat))}};
  inp.addEventListener('input',show);show()}
 function render(){for(const b of P.querySelectorAll('[data-dg]'))b.setAttribute('aria-selected',String(b.dataset.dg===tab));(tab==='week'?week:tab==='me'?me:today)()}
 UIX.fillDrag=()=>{if(!meName){const f=$('fdIn');if(f&&f.value.trim())meName=f.value.trim()}render()};
 for(const b of P.querySelectorAll('[data-dg]'))b.addEventListener('click',()=>{tab=b.dataset.dg;render();if(tab==='me'){const i=$('dgIn');if(i&&!matchMedia('(max-width: 700px)').matches)i.focus()}});
 // fly the camera to the strip
 $('dgWatch').addEventListener('click',()=>{if(!hasGL())return;if(!view3d)setView(true,true);const go=()=>{if(!R3){setTimeout(go,300);return}if(R3.mode()==='in')R3.exitIn();const c=window.__DRAG&&window.__DRAG.cam('stands');if(c)Object.assign(R3.cam,{tx:c.tx,tz:c.tz,yaw:c.yaw,pitch:c.pitch,dist:c.dist})};go();if(matchMedia('(max-width: 700px)').matches)P.hidden=true});
 // Find my name: a person's best quarter mile this week, when the strip is open
 UIX.dragBest=n=>{if(!DRAG.isOpen())return null;const p=DRAG.person(n,DRAG.today());return p&&p.best?`Drag best ${F.et(p.best.et)} · ${F.spd(p.best.vt)}`:null};
}
