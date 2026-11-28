//@ people/jobs.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- jobs: the Wall of Mechanics works in the city ----------
const CIVIC=@@JSON:jobs/civic.json@@;
const ROLES=(()=>{const o={},r=(STATE&&STATE.roles)||{};for(const k in r)o[String(k).toLowerCase()]=String(r[k]).toLowerCase();return o})();
const JOB_LIST=@@JSON:jobs/job_list.json@@.concat(XMAS?[['park','Elf',5],['park','Market Vendor',3]]:[]);
let JOBS={},JOBSIG='',WAITING={},WAITOF={};
function assignJobs(){const slots=[];for(const m of ALL_MS){if(!isOpen(m.type))continue;for(const j of JOB_LIST)if(j[0]===m.type)for(let k=0;k<j[2];k++)slots.push({b:m.type,title:j[1],k})}
 for(const m of CIVIC)for(const j of JOB_LIST)if(j[0]===m.type)for(let k=0;k<j[2];k++)slots.push({b:m.type,title:j[1],k});
 const nj={},used=new Set(),want={police:['Police Officer','Detective'],lawyer:['Lawyer'],judge:['Judge','Lawyer'],bus:['Bus Driver'],taxi:['Taxi Driver'],garbage:['Garbage Collector','Garbage Truck Driver']};
 for(const j of JOB_LIST){const sl=j[1].toLowerCase().replace(/[^a-z]/g,'');if(!want[sl])want[sl]=[j[1]]}
 const wl={},wo={};// waiting list: asked for a job whose posts are all taken by people who asked first (Wall order)
 for(const n of WALL){const r=ROLE_OF(n);if(!want[r])continue;const i=slots.findIndex((q,k)=>!used.has(k)&&want[r].includes(q.title));if(i>=0){nj[n]=slots[i];used.add(i)}else if(slots.some(q=>want[r].includes(q.title))){const t=want[r][0];(wl[t]=wl[t]||[]).push(n);wo[n]={title:t,pos:wl[t].length}}}// a job in a building that is not open yet: they get another job meanwhile
 {let h=0;for(const n of WALL)if(ROLE_OF(n)==='homeless')nj[n]={b:'park',title:'Homeless',k:h++,free:1}}
 const XJ=new Set(['Elf','Market Vendor','Supermarket CEO']);// these only go to people who asked for them (WORKSHOP ELF / VENDOR / SUPERMARKET CEO)
 let k=0;for(const n of WALL){if(nj[n]||wo[n]||ROLE_OF(n)==='thief')continue;while(k<slots.length&&(used.has(k)||XJ.has(slots[k].title)))k++;if(k>=slots.length)break;nj[n]=slots[k];used.add(k);k++}
 JOBS=nj;WAITING=wl;WAITOF=wo;const sig=WALL.length+'|'+slots.length+'|'+Object.keys(ROLES).length+'|'+Object.keys(wo).length;if(sig!==JOBSIG){JOBSIG=sig;renderJobs();renderCrime()}}
function JOB_SLOTS(){let n=0;for(const m of CIVIC)for(const j of JOB_LIST)if(j[0]===m.type)n+=j[2];for(const m of ALL_MS)if(isOpen(m.type))for(const j of JOB_LIST)if(j[0]===m.type)n+=j[2];return n}
function staffOf(b,title,k){for(const n in JOBS){const j=JOBS[n];if(j.b===b&&j.title===title&&j.k===k)return n}return null}
function jobOf(n){return JOBS[n]?JOBS[n].title:null}
const hidN=n=>(window.__HIDE&&window.__HIDE.some(h=>String(n).includes(h)))?'A resident':n;
function waitOf(n){return WAITOF[n]||null}// {title, pos}: on the waiting list for that job
function renderJobs(){const el=$('jobs');if(!el)return;let h='';let open=0,taken=0;
 for(const m of ALL_MS){const js=JOB_LIST.filter(j=>j[0]===m.type);const isO=isOpen(m.type);
  h+=`<li class="${isO?'open':''}"><div class="jh"><b>${esc(m.label)}</b><span class="chip">${isO?'Hiring':'Opens at '+m.n.toLocaleString('en-US')}</span></div>`;
  if(isO){h+='<ul>';for(const j of js)for(let k=0;k<j[2];k++){const n=staffOf(m.type,j[1],k);if(n)taken++;else open++;h+=`<li>${esc(j[1])}: ${n?'<b>★ '+esc(n)+'</b>':'<i>open · comment WORKSHOP</i>'}</li>`}h+='</ul>'}
  else h+=`<p>${js.map(j=>j[2]+'× '+esc(j[1])).join(' · ')}</p>`;h+='</li>'}
 for(const m of CIVIC){h+=`<li class="open"><div class="jh"><b>${esc(m.label)}</b><span class="chip">Hiring</span></div><ul>`;for(const j of JOB_LIST.filter(j=>j[0]===m.type))for(let k=0;k<j[2];k++){const n=staffOf(m.type,j[1],k);if(n)taken++;else open++;h+=`<li>${esc(j[1])}: ${n?'<b>★ '+esc(n)+'</b>':'<i>open · comment WORKSHOP</i>'}</li>`}h+='</ul></li>'}
 const waiting=Math.max(0,WALL.length-Object.keys(JOBS).length-Object.keys(WAITOF).length);
 {const wk=Object.keys(WAITING);if(wk.length){h+=`<li class="open wait"><div class="jh"><b>Waiting list</b><span class="chip">Next free post</span></div><ul>`;for(const t of wk)h+=`<li>${esc(t)}: ${WAITING[t].map((n,i)=>(i+1)+'. '+esc(hidN(n))).join(' · ')}</li>`;h+='</ul></li>'}}
 el.innerHTML=`<p class="jsum"><b>${taken}</b> people working · <b>${open}</b> jobs open${waiting?` · <b>${waiting}</b> looking for a job`:''}</p><ol class="jobs">${h}</ol>`}
function assignDrivers(){
 cars.filter(c=>c.kind==='bus'&&!c.removed).forEach((c,k)=>{c.driver=staffOf('bus','Bus Driver',k)||null});
 cars.filter(c=>c.kind==='garbage'&&!c.removed).forEach(c=>{c.driver=staffOf('sanit','Garbage Truck Driver',0)||null});
 {const tx=cars.filter(c=>c.m&&c.m.taxi&&!c.removed);const td=[0,1,2,3].map(k=>staffOf('taxi','Taxi Driver',k)).filter(Boolean);tx.forEach(c=>{if(c.driver&&!td.includes(c.driver))c.driver=null});td.forEach((n,k)=>{if(tx[k]&&!tx.some(c=>c.driver===n))tx[k].driver=n})}
 if(!WALL.length)return;const taken=new Set();for(const c of cars)if(c.driver&&!c.removed)taken.add(c.driver);
 for(const n of WALL){if(taken.has(n))continue;const c=cars.find(c=>c.kind==='car'&&!c.removed&&!c.driver&&!c.isNew&&!(c.m&&c.m.taxi));if(!c)break;c.driver=n;taken.add(n)}
}
function drawPeople(){
 for(const p of peds){ctx.save();ctx.translate(p.x,p.y);ctx.scale(Math.min(2.4,V2.k),Math.min(2.4,V2.k));ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.arc(1.5,2,4.6,0,TAU);ctx.fill();
  ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(0,0,4.6,0,TAU);ctx.fill();ctx.fillStyle=p.hair;ctx.beginPath();ctx.arc(0,0,2.7,0,TAU);ctx.fill();ctx.restore()}
}
function drawPeopleNames(){
 ctx.save();ctx.font="700 14px 'Barlow Condensed', sans-serif";ctx.textAlign='center';ctx.textBaseline='middle';
 for(const p of peds){if(!p.name)continue;const w=ctx.measureText(p.name).width+14;ctx.save();ctx.translate(p.x,p.y);ctx.scale(V2.k,V2.k);ctx.fillStyle='rgba(16,19,24,.84)';rrect(ctx,-w/2,-26,w,17,8.5);ctx.fill();ctx.fillStyle='#ffd34d';ctx.fillText(p.name,0,-17);ctx.restore()}
 ctx.restore();
}

