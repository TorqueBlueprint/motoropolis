//@ ui/news.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- Motoropolis Daily: the city's own newspaper ----------
const NEWS=[];let NEWSV=0;const newsCool={};
const NCAT={city:['CITY','#46c8ff'],people:['PEOPLE','#ffd34d'],cars:['ON THE ROAD','#ff5a4f'],biz:['BUSINESS','#5cc98a'],jobs:['CLASSIFIEDS','#ff7a1a'],crime:['CRIME','#ff5a4f'],court:['COURT','#e8b931']};
const dayNo=()=>Math.floor((70+simTime)/240)+1;
function news(h,k,body,cool){
 if(cool){const key=k+':'+cool;if(newsCool[key]!=null&&simTime-newsCool[key]<cool)return;newsCool[key]=simTime}
 if(NEWS.some(n=>n.h===h))return;
 NEWS.unshift({h,k:k||'city',body:body||'',time:clockStr(),day:dayNo()});if(NEWS.length>14)NEWS.pop();NEWSV++;renderNews()}
function renderNews(){
 const el=$('news');if(el&&NEWS.length){const L=NEWS[0],c=NCAT[L.k]||NCAT.city;
  let h=`<div class="np-mast"><b>MOTOROPOLIS DAILY</b><span>Day ${L.day} · ${esc(L.time)} edition · free for every subscriber</span></div>`;
  h+=`<article class="np-lead"><span class="np-cat" style="--c:${c[1]}">${c[0]}</span><h3>${esc(L.h)}</h3>${L.body?`<p>${esc(L.body)}</p>`:''}</article><ul class="np-list">`;
  for(const n of NEWS.slice(1,9)){const cc=NCAT[n.k]||NCAT.city;h+=`<li><span class="np-cat" style="--c:${cc[1]}">${cc[0]}</span><span class="np-h">${esc(n.h)}</span><span class="np-t">${esc(n.time)}</span></li>`}
  el.innerHTML=h+'</ul><p class="np-tip">Want to make the news? Comment <b>WORKSHOP</b> on any video and you join the city.</p>'}
 const tk=$('newsTicker');if(tk&&NEWS.length){const txt=NEWS.slice(0,8).map(n=>n.h).join('   ●   ');const run=tk.querySelector('.tk-run');
  if(run&&run.dataset.t!==txt){run.dataset.t=txt;run.innerHTML=`<span>${esc(txt)}   ●   </span><span aria-hidden="true">${esc(txt)}   ●   </span>`;run.style.animationDuration=Math.max(30,txt.length*.16)+'s'}}}
const who=c=>c&&c.driver?c.driver:null;
function newsBreakdown(c,f){const n=who(c),fault=f.n.toLowerCase();
 if(n)news(pick([`${n}'s car breaks down: ${fault}`,`Bad day for ${n}: ${fault}`,`${n} stuck on the side of the road with a ${fault.replace(/^an? /,'')}`]),'people',`${c.model?c.model+' ':''}${c.plate} needs help.${isOpen('reboques')?' A tow truck is on the way.':' No tow trucks in town yet.'}`,25);
 else news(pick([`Breakdown downtown: ${c.plate}, ${fault}`,`Another one: ${c.plate} breaks down (${fault})`]),'cars','',45)}
function newsSeed(){
 if(XMAS)news(xmasLine().replace(/^\S+ /,'').replace(/^./,c=>c)+' in Motoropolis','city','The Christmas market is open in Motoropolis Park, the city tree grows with every subscriber and Santa has been spotted over the city. Comment WORKSHOP ELF or WORKSHOP VENDOR to work at the market.');
 news('First edition: Motoropolis gets its own newspaper','city','Everything that happens in the city now makes the news, from breakdowns to new jobs. Pick up your copy at the kiosk in front of the Motoropolis Daily building, in the new district next to Motoropolis Park.');
 const nm=nextMilestone();if(nm)news(`Coming soon: the ${nm.label} opens at ${nm.n.toLocaleString('en-US')} subscribers`,'city','Every new subscriber brings the next building closer.');
 const open=Object.keys(JOBS).length,slots=JOB_SLOTS();if(slots>open)news(`Help wanted: ${slots-open} job${slots-open>1?'s':''} open in Motoropolis`,'jobs','Comment WORKSHOP on any TorqueBlueprint video and you get a job in the city.');
 WALL.slice(-3).forEach(n=>{const j=jobOf(n);news(j?`Welcome, ${n}! The city's newest ${j}`:`Welcome, ${n}! Now looking for a job`,'people',j?`${n} joined Motoropolis from the comments and starts work today.`:'')})}
function newsSummary(){const s=stats;const opts=[];
 if(s.repairs)opts.push([`Repair shop busy: ${s.repairs} car${s.repairs>1?'s':''} fixed so far`,'biz',`Shop revenue: $${Math.round(s.money).toLocaleString('en-US')}.`]);
 if(s.tows)opts.push([`Tow trucks answered ${s.tows} call${s.tows>1?'s':''}`,'biz','']);
 if(s.fuel)opts.push([`Gas station sold ${Math.round(s.fuel).toLocaleString('en-US')} gallons (${Math.round(s.fuel*3.785).toLocaleString('en-US')} L)`,'biz','']);
 if(s.insp)opts.push([`Inspection center checked ${s.insp} car${s.insp>1?'s':''}`,'biz','']);
 if(s.wash)opts.push([`Car wash: ${s.wash} cars sparkling clean`,'biz','']);
 if(opts.length){const o=pick(opts);news(o[0],o[1],o[2])}}
