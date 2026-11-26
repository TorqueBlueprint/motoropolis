//@ ui/panels.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
function stateText(c){
 const t=c.task;
 if(c.kind==='bus')return['Driving Line 1 around the city, stopping at every bus stop',''];
 if(c.kind==='garbage')return['Collecting the rubbish on every street of Motoropolis',''];
 if(c.m&&c.m.taxi)return[c.driver?'Taxi on duty, picking up passengers':'Taxi looking for a driver (comment WORKSHOP TAXI)',''];
 if(c.kind==='police')return c.siren&&t&&t.target?[`Chasing the stolen car ${t.target.plate}`,'']:c.idle?['Parked at the police station, ready','']:['Driving back to the police station',''];
 if(c.kind==='fire')return c.siren?['Racing to a car fire, sirens on','']:['Fire out, driving back to the fire station',''];
 if(c.kind==='amb')return c.siren?['Racing to a crash, sirens on','']:['All clear, driving back to the hospital',''];
 if(c.emerg)return c.emerg==='fire'?['ON FIRE! The fire engine is on its way','']:['Crashed. Waiting for the ambulance',''];
 if(c.stolen)return[`STOLEN by ${c.stolen.thief}! The police are chasing it`,''];
 switch(c.state){
  case 'broken':return c.towAssigned?['Broken down. The tow truck is on its way',c.fault&&c.fault.n]:['Broken down on the shoulder, waiting for a tow',c.fault&&c.fault.n];
  case 'towed':return['Being towed to the repair shop',c.fault&&c.fault.n];
  case 'waitlift':return['At the repair shop, waiting for a free lift',c.fault&&c.fault.n];
  case 'hooking':return['Hooking up the broken-down car',''];
  case 'service':{const b=c.slot&&c.slot.b;const left=isFinite(c.timer)?` (${Math.ceil(c.timer)}s left)`:'';
   if(!b)return['Parked',''];
   switch(b.type){case 'oficina':return c.kind==='van'?['Unloading parts at the repair shop'+left,'']:['On a lift at the repair shop'+left,c.fault?c.fault.n:'General service'];
    case 'bomba':return['Filling up'+left,''];case 'lavagem':return['In the car wash'+left,''];case 'pneus':return['At the tire shop'+left,c.fault&&c.fault.n];
    case 'inspecao':return['In the inspection lane'+left,''];case 'market':return['Shopping at the supermarket',''];case 'parque':return['Parked in the parking lot',''];case 'stand':return c.isNew?[`For sale at the dealership for ${eur(c.price)}`,'']:['At the dealership',''];
    case 'sucata':return['Being crushed at the junkyard',''];case 'reboques':return['On standby at the tow depot',''];case 'pecas':return['Loading parts at the warehouse'+left,''];case 'fabrica':return['Fresh off the assembly line','']}
   return['Parked',''];}
 }
 if(c.kind==='tow'&&t){if(t.type==='tow')return[`On its way to ${t.target.plate}, broken down`,''];if(t.type==='deliver')return['Taking the broken-down car to the repair shop',''];if(t.type==='home')return['Heading back to the tow depot','']}
 if(c.kind==='van'&&t)return[t.type==='parts'?'Delivering parts to the repair shop':'Heading back to the parts warehouse',''];
 if(t&&t.b){const dest={bomba:'the gas station',oficina:'the repair shop',pneus:'the tire shop',lavagem:'the car wash',inspecao:'the inspection center',parque:'the parking lot',stand:'the dealership',sucata:'the junkyard'};return['Heading to '+(dest[t.b.type]||'its destination'),c.fault&&c.fault.n]}
 return['Driving around',c.fault&&c.fault.n];
}
function gauge(label,val,color,txt){return `<div class="gauge"><div class="row"><span>${label}</span><span>${txt}</span></div><div class="bar"><i style="width:${clamp(val,0,100).toFixed(0)}%;background:${color}"></i></div></div>`}
function esc(s){return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
function updateCard(){
 const info=$('carInfo'),empty=$('carEmpty');
 if(!selected||selected.removed){selected=null;info.hidden=true;empty.hidden=false;return}
 const c=selected;info.hidden=false;empty.hidden=true;
 const[st,fault]=stateText(c);
 const model=c.kind==='bus'?c.model:c.kind==='tow'?'Tow truck':c.kind==='van'?'Parts van':c.model+(c.isNew?' (new)':'');
 const hcol=c.health>66?'var(--ok)':c.health>40?'#e8b931':'var(--bad)';
 let html=`<div class="car-head"><span class="plate"><span class="num">${esc(c.plate)}</span></span><span class="car-model">${esc(model)}</span></div>`;
 html+=`<p class="car-state">${esc(st)}${fault?` · <b>${esc(fault)}</b>`:''}</p><div class="gauges">`;
 html+=gauge('Fuel',c.fuel,'var(--accent)',Math.round(c.fuel)+'%');
 html+=gauge('Engine condition',c.health,hcol,Math.round(c.health)+'%');
 if(c.kind==='car')html+=gauge('Dirt',c.dirt,'#8a7f6a',Math.round(c.dirt)+'%');
 html+=`</div><dl class="kv">${c.driver?`<dt>Driver</dt><dd>★ ${esc(c.driver)}</dd>`:''}<dt>Mileage</dt><dd>${fmtKm(c.km)}</dd>`;
 if(c.kind==='car')html+=`<dt>Speed</dt><dd>${Math.round(c.v*.37)} mph</dd><dt>Shop visits</dt><dd>${c.repairs}</dd><dt>Next inspection</dt><dd>${c.km>=c.nextInsp?'Overdue':'in '+fmtKm(c.nextInsp-c.km)}</dd>`;
 html+='</dl>';
 if(c.kind==='car')html+=`<div class="car-actions"><button type="button" id="breakSel" ${c.state==='road'&&!c.forceBreak?'':'disabled'}>Break this car</button></div>`;
 info.innerHTML=html;
 const bs=$('breakSel');if(bs)bs.addEventListener('click',()=>{if(selected&&selected.state==='road'){selected.forceBreak=pickFault('tow');updateCard()}});
}
function updateStats(){
 $('stSubs').textContent=(subs||0).toLocaleString('en-US');
 $('stOpen').textContent=`${ALL_MS.filter(m=>isOpen(m.type)).length} of ${ALL_MS.length}`;
 $('stRoad').textContent=cars.filter(c=>c.state==='road'&&c.kind==='car').length;
 $('stMoney').textContent=eur(stats.money);$('stFaults').textContent=stats.faults;$('stRepairs').textContent=stats.repairs;
 $('stTows').textContent=stats.tows;$('stInsp').textContent=stats.insp;$('stFuel').textContent=Math.round(stats.fuel).toLocaleString('en-US');
 $('stSold').textContent=stats.sold;$('stWash').textContent=stats.wash;$('stScrap').textContent=stats.scrap;
}
C.addEventListener('click',ev=>{
 if(trailer)return;
 const r=C.getBoundingClientRect(),x=((ev.clientX-r.left)/r.width*CW-V2.ox)/V2.s,y=((ev.clientY-r.top)/r.height*CH-V2.oy)/V2.s;
 let best=null,bd=30*30;for(const c of cars){if(c.hidden)continue;const d=(c.x-x)**2+(c.y-y)**2;if(d<bd){bd=d;best=c}}
 if(!best){const O=B.oficina;if(x>=O.x0&&x<=O.x1&&y>=O.y0&&y<=O.y1){openWorkshop();return}if(inKiosk(x,y)){const n=$('news');if(n)n.closest('.card').scrollIntoView({behavior:'smooth',block:'center'});return}}
 selected=best;updateCard();
});
let trailer=null;
function present(){octx.setTransform(1,0,0,1,0,0);octx.drawImage(world,0,0)}
function setRunning(v){running=v}
channel='TorqueBlueprint';
const STATE=(()=>{let st={subs:0};try{st=JSON.parse(document.getElementById('state').textContent)}catch(e){}try{const x=new XMLHttpRequest();x.open('GET','state.json?v='+Date.now(),false);x.send();if(x.status===200){const j=JSON.parse(x.responseText);if(j&&typeof j==='object')st=Object.assign(st,j)}}catch(e){}return st})();
function refreshSubsUI(){
 const ol=$('metas'),next=nextMilestone();ol.innerHTML='';
 for(const m of ALL_MS){const li=document.createElement('li');const open=isOpen(m.type);li.className=open?'open':m===next?'next':'';
  const n=document.createElement('span');n.className='n';n.textContent=m.n.toLocaleString('en-US');
  const l=document.createElement('span');l.textContent=m.label;
  const c=document.createElement('span');c.className='chip';c.textContent=open?'Open':m===next?`${(m.n-(subs||0)).toLocaleString('en-US')} to go`:'Blueprint';
  li.append(n,l,c);ol.append(li)}
 $('heroSubs').textContent=(subs||0).toLocaleString('en-US');
 $('heroNext').textContent=next?`${(next.n-(subs||0)).toLocaleString('en-US')} more subscriber${next.n-(subs||0)===1?'':'s'} to open the ${next.label}.`:'Every building in the city is open. Thank you!';
 {const sv=subs||0,pv=[...ALL_MS].reverse().find(q=>q.n<=sv),base=pv?pv.n:0;$('heroBar').style.width=(next?clamp((sv-base)/Math.max(1,next.n-base),0,1)*100:100).toFixed(1)+'%'}
 updateStats();
}
(()=>{const el=$('updated');if(STATE.updated){const d=new Date(STATE.updated+'T12:00:00Z');if(!isNaN(d))el.textContent='Subscriber count updated '+d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})+'.'}})();
const RESET_FALLBACK=':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}';
function buildPage(state){
 const hs=document.head&&document.head.querySelector('style');
 const reset=hs?hs.textContent:RESET_FALLBACK;
 return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>'+reset+'</style></head><body>'
  +HEAD_TOP+'\n<style id="css">'+CSS0+'</style>\n<div id="app">'+APP0+'</div>\n<script id="state" type="application/json">'+JSON.stringify(state).replace(/</g,'\\u003c')+'<\/script>\n<script>'+SRC0+'<\/script></body></html>';
}
async function ownerTools(){
 const cl=window.claude;if(!cl||!cl.use)return;
 const[art,user]=await Promise.all([cl.use('artifact'),cl.use('user')]);
 if(!art||!user)return;
 let can=false;try{can=(await user.isOwner())||(await user.canEdit())}catch(e){can=false}
 if(!can)return;
 const box=$('owner'),inp=$('ownSubs'),btn=$('ownSave'),msg=$('ownMsg');
 box.hidden=false;inp.value=String(subs||0);const ta=$('ownNames');ta.value=(Array.isArray(STATE.names)?STATE.names:[]).join('\n');
 btn.addEventListener('click',async()=>{
  const v=Math.max(0,Math.floor(Number(inp.value)||0));
  btn.disabled=true;msg.textContent='Updating the city for everyone…';
  const names=[];for(const raw of $('ownNames').value.split('\n')){const nm=raw.trim().slice(0,24);if(nm&&!names.some(x=>x.toLowerCase()===nm.toLowerCase()))names.push(nm)}
  try{await art.publish(buildPage({subs:v,updated:new Date().toISOString().slice(0,10),names}));msg.textContent='Updated. The page is reloading with the new number.'}
  catch(e){const c=e&&e.code;btn.disabled=false;
   if(c==='conflict')msg.textContent='A newer version was just published. The page is reloading to it; update again after.';
   else if(c==='not_writer'||c==='not_granted'||c==='not_declared'||c==='consent_required'||c==='capability_disabled'||c==='capability_removed')box.hidden=true;
   else if(c==='rate_limited')msg.textContent='Too many updates in a row. Wait a minute and try again.';
   else if(c==='too_large'||c==='invalid_content'||c==='transform_error')msg.textContent='The page couldn’t be saved in this form. Ask Claude to update the number instead.';
   else msg.textContent='The update didn’t go through. Try again in a moment.'}
 });
}
