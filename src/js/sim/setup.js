//@ sim/setup.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- setup ----------
const tows=[];let van=null;
const race=[{t:0,sp:1,col:'#e8b931',num:7,laps:0},{t:.03,sp:1,col:'#2f6fd9',num:21,laps:0},{t:.06,sp:1,col:'#d93a2f',num:44,laps:0}];
function setup(){
 setupPolice();
 if(REMAKE){const loop=[];for(let i=0;i<NX;i++)loop.push(nid(i,0));for(let j=1;j<NY;j++)loop.push(nid(NX-1,j));for(let i=NX-2;i>=0;i--)loop.push(nid(i,NY-1));for(let j=NY-2;j>0;j--)loop.push(nid(0,j));
  for(let k=0;k<2;k++){const bu=newCar({kind:'bus',model:{n:'City bus · Line 1',len:66,wid:19,price:0,v:[62,68]},color:k?'#2f6fd9':'#ff7a1a'});bu.len=66;bu.wid=19;bu.vmax=64;bu.fuel=100;bu.health=100;bu.loop=loop;
   const i0=k?Math.floor(loop.length/2):0,a=loop[i0],b=loop[(i0+1)%loop.length],d=segDir(a,b);bu.from=a;bu.to=b;const p=lanePt(a,b,120);bu.x=p.x;bu.y=p.y;bu.ang=Math.atan2(d.dy,d.dx);bu.pts=[lanePt(a,b,d.len/2),stopPt(a,b)];bu.pts[0].cb=()=>{bu.arrestT=2.2};bu.state='road';bu.driver=null}
  {const rl=loop.slice().reverse();const gt=newCar({kind:'garbage',model:{n:'Garbage truck',len:62,wid:20,price:0,v:[50,56]},color:'#2e7d4f'});gt.len=62;gt.wid=20;gt.vmax=52;gt.fuel=100;gt.health=100;gt.loop=rl;
   const a=rl[3],b=rl[4],d=segDir(a,b);gt.from=a;gt.to=b;const p=lanePt(a,b,120);gt.x=p.x;gt.y=p.y;gt.ang=Math.atan2(d.dy,d.dx);gt.pts=[lanePt(a,b,d.len/2),stopPt(a,b)];gt.pts[0].cb=()=>{gt.arrestT=4};gt.state='road';gt.driver=null}}
 B.reboques.slots.forEach((s,k)=>{const t=newCar({kind:'tow',model:{n:'Tow truck',len:46,wid:17,price:0,v:[85,95]},color:'#f2a51a'});t.len=46;t.wid=17;t.vmax=WORLD?130:92;t.fuel=100;t.health=100;t.home=s;parkIn(t,s,Infinity);t.idle=true;t.hidden=true;tows.push(t)});
 van=newCar({kind:'van',model:{n:'Parts van',len:38,wid:17,price:0,v:[80,90]},color:'#f4f4f0'});van.len=38;van.wid=17;van.vmax=85;van.home=B.pecas.vanHome;parkIn(van,van.home,Infinity);van.hidden=true;
 log('Good morning, Motoropolis. The repair shop is open.','info');
}
const carCount=()=>cars.filter(c=>c.kind==='car'&&!c.removed).length;
const targetCars=()=>Math.min(subs||0,MAXCARS);
function reconcile(initial){
 let n=carCount();const t=targetCars();
 let spawned=0;
 while(n<t){
  if(!initial&&isOpen('fabrica')){
   const s=B.fabrica.slots.find(s=>!s.car);if(!s)break;
   const c=newCar();c.isNew=true;c.km=rr(5,30);c.health=100;c.dirt=0;c.fuel=60;c.task={type:'make'};c.newT=6;parkIn(c,s,3);
  }else{
   const c=newCar();if(!placeOnRoad(c)){c.removed=true;break}
   if(!initial){c.newT=6;for(let k=0;k<10;k++)particles.push({x:c.x,y:c.y,vx:rr(-40,40),vy:rr(-40,40),life:rr(.5,1),t:0,kind:'confetti',r:3,col:pick(['#ff7a1a','#5cc98a','#6cb6ff','#e8b931'])})}
  }
  n++;spawned++;if(!initial&&spawned>=3)break;
 }
 if(n>t){
  const extra=cars.filter(c=>c.kind==='car'&&!c.removed&&c.state==='road'&&!c.task&&!c.forceBreak&&!c.fault&&!c.emerg);
  for(const c of extra){if(n<=t)break;c.removed=true;if(selected===c)selected=null;n--}
 }
 cars=cars.filter(c=>!c.removed);
}
function cityHousekeeping(){
 const tw=isOpen('reboques');
 for(const t of tows)if(t.idle)t.hidden=!tw;
 if(!isOpen('pecas')){if(van.state==='service'&&van.slot===van.home){van.hidden=true;van.timer=Infinity}}
 else if(van.hidden){van.hidden=false;van.timer=rr(2,5)}
 if(!tw)for(const c of cars){if(c.state==='broken'&&!c.towAssigned&&!c.pts.length){c.state='road';c.limp=true;c.task={type:'svc',b:B.oficina};c.route=[];c.pts=[stopPt(c.from,c.to)]}}
 reconcile(false);assignDrivers();assignJobs();
}
function setSubs(v,silent){
 v=Math.max(0,Math.floor(Number(v)||0));
 const prev=subs;subs=v;
 if(prev===null||silent){cityHousekeeping();reconcile(true);refreshSubsUI();return}
 if(v===prev){refreshSubsUI();return}
 if(v>prev){
  const d=v-prev;subToast={text:`+${d.toLocaleString('en-US')} SUBSCRIBER${d>1?'S':''}`,t:0};
  log(d===1?'New subscriber! One more car just arrived in town.':`${d.toLocaleString('en-US')} new subscribers! The city is growing.`,'ok');
  for(const m of ALL_MS)if(m.n>prev&&m.n<=v){
   log(`Now open: ${m.label}! Thanks to all ${m.n} subscribers.`,'ok');news(`Grand opening: the ${m.label} is open!`,'city',`Unlocked by the community at ${m.n.toLocaleString('en-US')} subscribers. New jobs are available.`);
   celebQ.push({title:m.label,sub:`Unlocked at ${m.n} subscribers. Thank you!`});if(celebQ.length>3)celebQ.shift();
   const b=B[m.type];if(b)for(let k=0;k<60;k++)particles.push({x:b.x0+b.w/2,y:b.y0+b.h/2,vx:rr(-160,160),vy:rr(-220,-40),life:rr(1.2,2.4),t:0,kind:'confetti',r:rr(3,5),col:pick(['#ff7a1a','#5cc98a','#6cb6ff','#e8b931','#ff5a4f'])});
  }
 }else{
  for(const m of ALL_MS)if(m.n<=prev&&m.n>v)log(`${m.label} closed for works: the city now has fewer than ${m.n} subscribers.`,'info');
 }
 cityHousekeeping();refreshSubsUI();
}

