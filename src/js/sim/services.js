//@ sim/services.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- services ----------
function serviceTime(c,Bd){switch(Bd.type){
 case 'bomba':return 12;case 'lavagem':return 6;case 'pneus':return c.fault?c.fault.t:5;
 case 'oficina':return c.task&&c.task.type==='parts'?4:c.fault?c.fault.t:6;
 case 'inspecao':return 5;case 'market':return rr(10,26);case 'parque':return rr(14,32);case 'stand':return rr(18,40);
 case 'sucata':return 3;case 'pecas':return rr(14,22);case 'fabrica':return 3;default:return 5}}
function arrive(c){
 const s=c.slot;c.v=0;c.ang=s.ang;c.x=s.x;c.y=s.y;
 if(c.task&&c.task.type==='deliver'){releaseTow(c);return}
 if((c.kind==='tow'||c.kind==='police')&&c.task&&c.task.type==='home'){c.state='service';c.idle=true;c.timer=Infinity;c.task=null;c.driver=null;return}
 c.state='service';c.timer=serviceTime(c,s.b);c.svcTotal=c.timer;
}
function exitBuilding(c){const s=c.slot;if(s&&s.car===c)s.car=null;c.slot=null;leave(c,s.b,s)}
function leave(c,Bd,s){
 const[a0,b0]=Bd.seg,dir=R()<.5,a=dir?a0:b0,b=dir?b0:a0;
 const sp=edgeS(a,b,Bd.door.x,Bd.door.y);
 c.state='lot';c.route=[];c.waitRed=false;
 const pts=[];
 if(s){if(s.fwd)pts.push({x:s.x+Math.cos(s.ang)*46,y:s.y+Math.sin(s.ang)*46});else{const ap=approach(s);ap.rev=true;pts.push(ap)}}
 pts.push({x:Bd.door.x,y:Bd.door.y});
 const lp=lanePt(a,b,sp+14);lp.cb=()=>{c.state='road';c.mergeT=0};lp.merge=true;pts.push(lp,stopPt(a,b));
 c.pts=pts;c.from=a;c.to=b;
}
function finishService(c){
 const Bd=c.slot.b,keep=c.task;c.task=null;
 switch(Bd.type){
  case 'bomba':stats.fuel+=(100-c.fuel)*.13;c.fuel=100;break;
  case 'lavagem':c.dirt=0;stats.wash++;break;
  case 'pneus':if(c.fault){stats.money+=c.fault.c;stats.repairs++;log(`${c.plate}: ${c.fault.n.toLowerCase()} fixed at the tire shop (${eur(c.fault.c)}).`,'ok')}c.fault=null;c.limp=false;break;
  case 'oficina':
   if(keep&&keep.type==='parts'){log(`Parts delivered to the repair shop: ${pick(PARTS)}.`,'info');c.task={type:'home',b:B.pecas};break}
   if(c.fault){stats.money+=c.fault.c;stats.repairs++;c.repairs++;log(`Repaired: ${c.plate}, ${c.fault.n.toLowerCase()} (${eur(c.fault.c)}).`,'ok')}
   c.fault=null;c.limp=false;c.health=Math.min(100,c.health+rr(30,55));
   if((c.repairs>=4||c.km>420000)&&isOpen('sucata')){c.task={type:'svc',b:B.sucata};log(`The mechanic says ${c.plate} isn’t worth fixing anymore. Off to the junkyard.`,'info')}
   break;
  case 'inspecao':stats.insp++;c.nextInsp=c.km+rr(90000,130000);
   if(c.health<55){const f=pick(INSP);c.fault=f;c.task={type:'svc',b:B.oficina};log(`${c.plate} failed inspection: ${f.n.toLowerCase()}. Heading to the repair shop.`,'bad');news(who(c)?`${who(c)} fails inspection: ${f.n.toLowerCase()}`:`Inspection fail: ${c.plate}, ${f.n.toLowerCase()}`,who(c)?'people':'cars','',35)}
   else if(R()<.45)log(`${c.plate} passed inspection.`,'ok');break;
  case 'stand':if(c.isNew){c.isNew=false;stats.sold++;log(`Sold at the dealership: a brand-new ${c.model} for ${eur(c.price)}.`,'ok');news(`New ${c.model} sold for ${eur(c.price)}`,'biz','',40)}break;
  case 'sucata':scrap(c);return;
  case 'pecas':c.task={type:'parts',b:B.oficina};break;
  case 'fabrica':{
   const free=B.stand.slots.filter(s=>!s.car).length-cars.filter(o=>o!==c&&o.task&&o.task.b===B.stand&&!o.slot).length;
   if(isOpen('stand')&&free>0){c.task={type:'svc',b:B.stand};log(`A new ${c.model} just rolled off the line, heading to the dealership.`,'info')}
   else{c.isNew=false;if(isOpen('stand'))stats.sold++;log(isOpen('stand')?`The dealership is full: a new ${c.model} was sold straight from the factory.`:`A new ${c.model} just rolled off the line.`,'info')}
   break;}
 }
 exitBuilding(c);
}
function scrap(c){
 c.removed=true;if(c.slot)c.slot.car=null;stats.scrap++;B.sucata.pile++;
 log(`${c.plate} was crushed at the junkyard with ${fmtKm(c.km)} on the clock.`,'info');news(`End of the road: ${c.plate} crushed with ${fmtKm(c.km)} (${Math.round(c.km).toLocaleString('en-US')} km) on the clock`,'cars','',40);
 for(let k=0;k<14;k++)particles.push({x:c.x+rr(-12,12),y:c.y+rr(-12,12),vx:rr(-20,20),vy:rr(-30,-5),life:rr(.8,1.6),t:0,kind:'dust',r:rr(4,9)});
 if(selected===c)selected=null;
}
function canBreak(c){return c.state==='road'&&c.pts.length===1&&c.pts[0].stop&&dist(c,c.pts[0])>90&&!c.towing&&c.kind==='car'}
function breakDown(c,f){
 c.fault=f;c.state='broken';c.task=null;c.route=[];c.towAssigned=null;c.forceBreak=null;
 if(c.slot){c.slot.car=null;c.slot=null}
 const d=segAt(c.from,c.to,edgeS(c.from,c.to,c.x,c.y));
 c.pts=[{x:c.x+d.dx*16+d.rx*12,y:c.y+d.dy*16+d.ry*12}];
 log(`${c.plate} broke down: ${f.n.toLowerCase()}. Tow truck called.`,'bad');newsBreakdown(c,f);
}
function hookPath(t,a,b){
 const tc=t.task.target;
 const sp=edgeS(a,b,tc.x,tc.y),d=segAt(a,b,sp);
 const back=(t.len+tc.len)/2+4;
 t.pts.push(lanePt(a,b,sp-back-40),{x:tc.x-d.dx*back,y:tc.y-d.dy*back,cb:()=>{t.state='hooking';t.timer=2;t.v=0}});
}
function finishHook(t){
 const tc=t.task.target;tc.state='towed';tc.towedBy=t;t.towing=tc;stats.tows++;
 log(`Tow truck ${t.plate} is taking ${tc.plate} to the repair shop.`,'info');
 t.task={type:'deliver',b:B.oficina};t.state='road';t.route=[];t.pts=[stopPt(t.from,t.to)];
}
function releaseTow(t){
 const tc=t.towing,O=B.oficina;t.towing=null;tc.towedBy=null;tc.towAssigned=null;
 tc.task={type:'svc',b:O};
 O.drop.car=tc;tc.slot=O.drop;tc.state='waitlift';
 t.slot=null;t.task={type:'home',b:B.reboques};leave(t,O,null);
}
function tryLift(c){
 const s=B.oficina.slots.find(s=>!s.car);if(!s)return;
 B.oficina.drop.car=null;s.car=c;c.slot=s;c.state='lot';
 c.pts=[approach(s),{x:s.x,y:s.y,cb:()=>arrive(c)}];
}
function dispatch(){
 if(!isOpen('reboques'))return;
 for(const c of cars){
  if(c.state!=='broken'||c.towAssigned||c.pts.length)continue;
  const t=tows.find(t=>t.idle)||tows.find(t=>t.task&&t.task.type==='home'&&t.state==='road'&&!t.slot);
  if(!t)return;
  c.towAssigned=t;t.task={type:'tow',target:c};t.route=[];
  if(t.idle){t.idle=false;exitBuilding(t)}
 }
}
function brain(c){
 if(c.kind!=='car'||c.state!=='road'||c.stolen||c.emerg)return;
 if(c.forceBreak){
  if(!isOpen('reboques')){const f=c.forceBreak;c.forceBreak=null;stats.faults++;c.fault=f;c.limp=true;c.task={type:'svc',b:B.oficina};
   log(`${c.plate} broke down: ${f.n.toLowerCase()}. No tow trucks in town yet, so it’s limping to the repair shop.`,'bad');newsBreakdown(c,f);return}
  if(canBreak(c)){stats.faults++;breakDown(c,c.forceBreak)}return}
 if(c.task)return;
 const tireShop=isOpen('pneus')?B.pneus:B.oficina;
 if(!c.fault&&R()<(.0012+(1-c.health/100)*.004)*(WORLD?.55:1)){
  const f=pickFault();
  if(f.k==='tow'){c.forceBreak=f;return}
  stats.faults++;c.fault=f;
  if(f.k==='tire'){c.task={type:'svc',b:tireShop};log(`${c.plate}: ${f.n.toLowerCase()}! Crawling to the ${tireShop===B.pneus?'tire shop':'repair shop'}.`,'bad')}
  else{c.task={type:'svc',b:B.oficina};log(`${c.plate}: ${f.n.toLowerCase()}. The driver is heading to the repair shop.`,'bad')}
  return;
 }
 if(c.fault){c.task={type:'svc',b:c.fault.k==='tire'?tireShop:B.oficina};return}
 if(c.fuel<22&&isOpen('bomba')){c.task={type:'svc',b:B.bomba};return}
 if((c.repairs>=4||c.km>440000)&&isOpen('sucata')){c.task={type:'svc',b:B.sucata};return}
 if(c.km>=c.nextInsp&&isOpen('inspecao')){c.task={type:'svc',b:B.inspecao};return}
 if(c.dirt>80&&R()<.25&&isOpen('lavagem')){c.task={type:'svc',b:B.lavagem};return}
 if(R()<.007&&isOpen('market')){c.task={type:'svc',b:B.market};return}
 if(R()<.006&&isOpen('parque'))c.task={type:'svc',b:B.parque};
}

