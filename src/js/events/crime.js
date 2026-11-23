//@ events/crime.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- crime & justice: thieves, police chases and the courthouse ----------
const police=[];let crime=null,crimeT=45;const CASES=[];let caseNo=1;
const ROLE_OF=n=>ROLES[String(n).toLowerCase()]||null;
const thieves=()=>WALL.filter(n=>ROLE_OF(n)==='thief');
const FAKE_THIEVES=['the Midnight Mechanic','a masked thief','"Fast Eddie"','the Hubcap Bandit','"Slim Jim"'];
function officerName(k){return staffOf('police','Police Officer',k)}
function setupPolice(){B.police.slots.forEach((s,k)=>{const p=newCar({kind:'police',model:{n:'Police car',len:42,wid:18,price:0,v:[120,130]},color:'#f4f4f0'});p.len=42;p.wid=18;p.vmax=125;p.fuel=100;p.health=100;p.home=s;p.k=k;parkIn(p,s,Infinity);p.idle=true;police.push(p)})}
function startCrime(){
 const pool=cars.filter(c=>c.kind==='car'&&c.state==='road'&&!c.task&&!c.fault&&!c.forceBreak&&!c.hidden&&!c.removed&&!c.stolen&&!c.emerg);if(!pool.length)return;
 const c=pick(pool),tn=thieves(),thief=tn.length?pick(tn):pick(FAKE_THIEVES),isSub=tn.includes(thief);
 c.stolen={thief,isSub,v0:c.vmax};c.vmax=Math.min(118,c.vmax*1.3);const owner=c.driver;
 crime={car:c,thief,isSub,t:0,cops:[]};
 log(`🚨 Car stolen: ${c.plate}${owner?` (${owner}'s car)`:''}. Police are on the way.`,'bad');
 news(owner?`${owner}'s car stolen by ${thief}!`:`Car theft downtown: ${c.plate} stolen by ${thief}`,'crime',`The ${c.model} was taken in broad daylight. Every police car in Motoropolis is on the chase.`);
 const free=police.filter(p=>p.idle||(p.task&&p.task.type==='home'));for(const p of free.slice(0,2)){p.task={type:'chase',target:c};p.route=[];p.siren=true;p.driver=officerName(p.k)||null;if(p.idle){p.idle=false;exitBuilding(p)}crime.cops.push(p)}}
function endChase(caught){const c=crime.car,cops=crime.cops;
 for(const p of cops){p.siren=false;p.task={type:'home',b:B.police};p.route=[]}
 if(caught){const cop=cops.find(p=>p.driver);const officer=cop?cop.driver:'Officer on duty';
  c.arrestT=4;cops.forEach(p=>p.arrestT=4);
  log(`🚔 Arrested! ${crime.thief} was caught in ${c.plate} by ${officer}.`,'ok');
  news(`Caught! ${officer} arrests ${crime.thief} after a chase`,'crime',`The stolen car ${c.plate} is back with its owner. The case goes to the Motoropolis Courthouse.`);
  openCase(crime.thief,crime.isSub,c.plate,officer)}
 else{log(`The thief got away with ${c.plate}... for now. The car was found abandoned.`,'info');news(`${crime.thief} escapes the police!`,'crime',`Car ${c.plate} was found abandoned across town. Detectives are on the case.`)}
 c.vmax=c.stolen.v0;c.stolen=null;crime=null;crimeT=rr(70,110);renderCrime()}
function openCase(thief,isSub,plate,officer){
 const lawyer=staffOf('court','Lawyer',caseNo%2)||staffOf('court','Lawyer',(caseNo+1)%2)||'Public defender',judge=staffOf('court','Judge',0)||'Judge Ironside';
 const cs={no:caseNo++,thief,isSub,plate,officer,lawyer,judge,at:simTime+rr(35,55),verdict:null,time:clockStr()};CASES.unshift(cs);if(CASES.length>8)CASES.pop();
 news(`Trial set: Motoropolis vs ${thief}`,'court',`Judge: ${judge}. Defense lawyer: ${lawyer}. The verdict comes later today.`);renderCrime()}
