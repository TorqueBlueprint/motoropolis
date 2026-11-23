//@ events/world_calls.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- world test page: fire engine / ambulance calls and the football league ----------
let emerg=null,emergT=30;
function emergStart(){
 const types=[];if(isOpen('w_fire'))types.push('fire');if(isOpen('w_hosp'))types.push('amb');if(!types.length)return;
 const type=pick(types),fire=type==='fire';
 const pool=cars.filter(c=>c.kind==='car'&&c.state==='road'&&!c.task&&!c.fault&&!c.stolen&&!c.hidden&&!c.removed&&!c.emerg&&!c.forceBreak);if(!pool.length)return;
 const v=pick(pool);v.emerg=type;v.arrestT=1e6;
 const r=newCar({kind:fire?'fire':'amb',model:{n:fire?'Fire engine':'Ambulance',len:fire?56:46,wid:20,price:0,v:[130,140]},color:fire?'#d93a2f':'#f4f4f0'});
 r.len=fire?56:46;r.wid=20;r.vmax=135;r.fuel=100;r.health=100;r.siren=true;r.task={type:'resc',target:v};r.route=[];
 const i=fire?1:2,a=nid(i,NY-1),b=nid(i,NY-2),d=segDir(a,b),p=lanePt(a,b,HALF+8);r.x=p.x;r.y=p.y;r.ang=Math.atan2(d.dy,d.dx);r.from=a;r.to=b;r.pts=[stopPt(a,b)];r.v=60;r.state='road';
 r.driver=staffOf(fire?'w_fire':'w_hosp',fire?'Firefighter':'Paramedic',0)||null;
 emerg={type,car:v,resp:r,t:0,arrived:false};const owner=v.driver;
 if(fire){log(`🔥 Car fire: ${v.plate}${owner?` (${owner}'s car)`:''}. The fire engine is on its way.`,'bad');news(`Car on fire in Motoropolis: ${v.plate}!`,'city',`Smoke over the city. ${r.driver?r.driver+' and the':'The'} fire crew are racing in from the fire station.`)}
 else{log(`🚑 Crash: ${v.plate} hit a lamp post. An ambulance is on its way.`,'bad');news(`Crash in Motoropolis: ${v.plate} hits a lamp post`,'city',`Nobody badly hurt. ${r.driver?'Paramedic '+r.driver:'An ambulance'} is coming from the hospital.`)}}
function emergTick(dt){
 if(!WORLD)return;
 for(const c of cars)if(c.ttl!==undefined&&!c.removed){c.ttl-=dt;if(c.ttl<=0){c.removed=true;if(selected===c)selected=null}}
 if(emerg){const e=emerg,v=e.car,r=e.resp;e.t+=dt;
  if(!e.arrived&&r.state==='road'&&Math.hypot(r.x-v.x,r.y-v.y)<100){e.arrived=true;r.arrestT=8;r.task=null;r.route=[];e.fix=e.t+8}
  if((e.arrived&&e.t>=e.fix)||e.t>80||v.removed){v.arrestT=0;v.emerg=null;r.siren=false;r.task=null;r.arrestT=0;r.ttl=22;
   if(e.type==='fire'){v.dirt=100;news(`Fire out! ${v.plate} saved by the fire crew`,'city',`${r.driver||'The fire crew'} put out the flames in seconds. The car is heading to the car wash.`)}
   else news(`All OK after the crash: ${v.plate} driver checked by paramedics`,'city',`${r.driver||'The paramedics'} gave the all-clear. The hospital thanks every subscriber.`);
   emerg=null;emergT=rr(55,95)}
  return}
 emergT-=dt;if(emergT<=0){emergT=rr(55,95);emergStart()}}
const LEAGUE={teams:['Motoropolis FC','Torque United','Piston Rovers','Gearbox City','Turbo Athletic','Redline Wanderers'],home:'Motoropolis FC',away:'Torque United',hs:0,as:0,min:0,t:0};
function leagueTick(dt){if(!WORLD||!isOpen('w_stad'))return;const L=LEAGUE;L.t+=dt;
 if(L.min<90){const m=Math.min(90,Math.floor(L.t/1.2));while(L.min<m){L.min++;if(R()<.03){if(R()<.55)L.hs++;else L.as++}}
  if(L.min>=90)news(`Full time: ${L.home} ${L.hs}-${L.as} ${L.away}`,'city',L.hs>L.as?`Home win at the Motoropolis stadium! The fans go wild.`:L.hs<L.as?`${L.away} silence the stadium with an away win.`:`Honours even in the Motoropolis League.`)}
 else if(L.t>125){const t=L.teams.slice().sort(()=>R()-.5);L.home=t[0];L.away=t[1];L.hs=L.as=0;L.min=0;L.t=0;news(`Kick-off: ${L.home} vs ${L.away}`,'city','Live now at the Motoropolis stadium.')}}
function crimeTick(dt){
 if(!police.length)return;
 for(const p of police)p.hidden=false;
 for(const cs of CASES)if(!cs.verdict&&simTime>=cs.at){const r=R();
  cs.verdict=r<.6?'guilty':r<.85?'community':'free';cs.vtime=clockStr();
  const txt=cs.verdict==='guilty'?`GUILTY: ${cs.thief} must pay a $${(Math.round(rr(5,20))*100).toLocaleString('en-US')} fine`:cs.verdict==='community'?`${cs.thief} sentenced to wash cars for 30 days`:`Not guilty! ${cs.lawyer} gets ${cs.thief} off the hook`;
  log(`⚖️ Verdict in case #${cs.no}: ${txt}.`,cs.verdict==='free'?'info':'ok');news(txt,'court',`${cs.judge} closed case #${cs.no} (car ${cs.plate}).`);renderCrime()}
 if(crime){crime.t+=dt;const c=crime.car;
  if(c.removed||c.state!=='road'&&c.state!=='lot'){endChase(false);return}
  for(const p of crime.cops){if(p.state==='road'&&Math.hypot(p.x-c.x,p.y-c.y)<60){endChase(true);return}}
  if(crime.t>75)endChase(false);return}
 crimeT-=dt;if(crimeT<=0){crimeT=rr(70,110);startCrime();renderCrime()}}
function renderCrime(){const el=$('crime');if(!el)return;const th=thieves();
 const st=crime?`<p class="cr-live">🚨 <b>LIVE CHASE:</b> ${esc(crime.thief)} in ${esc(crime.car.plate)}</p>`:'<p class="cr-calm">✅ The streets are calm. For now.</p>';
 const cs=CASES.slice(0,5).map(c=>`<li><span class="cr-no">#${c.no}</span><span><b>Motoropolis vs ${esc(c.thief)}</b><br><small>Judge ${esc(c.judge.replace(/^Judge /,''))} · Lawyer ${esc(c.lawyer)} · Arrested by ${esc(c.officer)}</small></span><span class="cr-v ${c.verdict||'pending'}">${c.verdict==='guilty'?'GUILTY':c.verdict==='community'?'CAR WASH DUTY':c.verdict==='free'?'NOT GUILTY':'PENDING'}</span></li>`).join('');
 el.innerHTML=st+`<h3>Wanted</h3><p class="cr-w">${th.length?th.map(n=>`<span>${esc(n)}</span>`).join(''):'<i>No thieves yet. Be the first!</i>'}</p><h3>Court docket</h3>${cs?`<ol class="cr-list">${cs}</ol>`:'<p class="cr-calm">No cases yet.</p>'}<p class="cr-tip">Pick your side: comment <b>WORKSHOP POLICE</b>, <b>WORKSHOP THIEF</b> or <b>WORKSHOP LAWYER</b> on any video.</p>`}

