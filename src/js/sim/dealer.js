//@ sim/dealer.js - the Car Dealership as a business (Phase 3 step 3): DEALJOBS = SHOPS.make({...}) (sim/shopjobs.js).
//@ Three sales desks, two Car Salesmen (staffOf('stand','Car Salesman',k)); desk 3 waits for a third one (JOB OPEN).
//@ A deal every 25 min (1500 s), 38-48 min each: BROWSING -> TEST DRIVE -> OFFER -> FINANCE -> SOLD -> PREP · VALET ->
//@ READY FOR COLLECTION (key handover) -> DRIVEN HOME. The buyer is a Wall resident (their own home-garage car is the
//@ trade-in) or a walk-in customer; the car comes from the dealership's stock (MODELS, read at run time, never the taxi).
//@ The cars on display change once a day (UTC) and are the same for everyone: DEALJOBS.display(t). Specs (hp / kW, kg / lb,
//@ 0-100 km/h, 0-60 mph) come from the drag strip specs (DRAG.SPEC, DRAG.run), computed once per model on first use.
//@ TC is display-only (nothing is saved). The city's own new-car loop (sim/services.js: factory -> dealership slots) is unchanged.
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
const DEALJOBS=(()=>{
 const STEP=1500;
 // the stock: every model with a 3D car except the taxi; cheaper cars sell more often
 let ST=null;const stock=()=>ST||(ST=MODELS.filter(m=>m.glb&&!m.taxi&&CAR_GLB[m.glb]));
 const wOf=m=>m.price<=60000?3:m.price<=130000?2.2:m.price<=300000?1:m.price<=700000?.35:.12;
 const PAINT=['#d93a2f','#2f6fd9','#f2f2ee','#22252b','#7a8088','#1f3a6e','#2e7d4f','#ff7a1a','#e8b931','#c8c9cc'];
 const r50=v=>Math.round(v/50)*50,r100=v=>Math.round(v/100)*100;
 // specs from the drag strip data (same numbers as the Drag Strip); 0-100 km/h and 0-60 mph from one simulated launch
 function DSPEC(m){return(typeof DRAG!=='undefined'&&DRAG.SPEC&&m&&DRAG.SPEC[m.glb])||null}
 const SPC={};
 function spec(m){const k=m.glb||m.n;if(SPC[k])return SPC[k];const s=DSPEC(m);let o;
  if(s){let t100=0,t60=0;try{const R=DRAG.run({glb:m.glb,tune:'stock'},true),X=R.trace;for(let i=1;i<X.length&&!t100;i++){const v=(X[i]-X[i-1])/.05;if(!t60&&v>=26.8224)t60=i*.05-.025;if(v>=27.7778)t100=i*.05-.025}}catch(e){}
   o={hp:s.hp,kw:Math.round(s.hp*.7457),kg:s.kg,lb:Math.round(s.kg*2.20462),t100:t100?Math.round(t100*10)/10:null,t60:t60?Math.round(t60*10)/10:null,drive:s.drive,eng:s.eng,asp:s.asp,fuel:s.fuel,gears:s.gears,vmax:s.vtop}}
  else o={hp:null,kw:null,kg:Math.round(900+m.len*18),lb:Math.round((900+m.len*18)*2.20462),t100:null,t60:null};
  return SPC[k]=o}
 // the cars on display today: 5 in the showroom (index 0 = the turntable, a dearer car), 4 on the forecourt (0 = the ramp)
 const DISP={};
 function display(t){t=t==null?SHOPS.now():t;const d=Math.floor(t/86400);if(DISP[d])return DISP[d];const r=SHOPS.rng(SHOPS.h32('dealdisp',d)),L=stock().slice(),out=[];
  const take=f=>{const C=L.filter(f);const pool=C.length?C:L;const m=SHOPS.pickW(pool.map(q=>({q,w:1})),r).q;L.splice(L.indexOf(m),1);
   const keep=CAR_GLB[m.glb]&&CAR_GLB[m.glb].keep;return{m,col:keep?'#ffffff':PAINT[Math.floor(r()*PAINT.length)],km:r()<.7?5+Math.floor(r()*20):8000+Math.floor(r()*70000)}};
  out.push(take(m=>m.price>=150000&&m.price<=2000000));for(let k=0;k<4;k++)out.push(take(m=>m.price<=300000));
  const fc=[take(m=>m.sport&&m.price<=600000),take(m=>m.price<=120000),take(m=>m.price<=120000),take(m=>m.price<=200000)];
  for(const o of out.concat(fc))o.used=o.km>1000,o.price=o.used?r100(o.m.price*(.62+r()*.2)):o.m.price;
  for(const k in DISP)delete DISP[k];return DISP[d]={show:out,fore:fc}}
 const E=SHOPS.make({b:'stand',role:'Car Salesman',bays:3,act:2,step:STEP,out:10,seed:'deal',prefix:'D-',nameOff:23,resident:.8,crew:'The sales team',
  open:()=>isOpen('stand'),
  stages:['BROWSING','TEST DRIVE','OFFER','FINANCE','SOLD','PREP · VALET','READY FOR COLLECTION','DRIVEN HOME'],split:[.14,.24,.1,.14,.04,.18],
  fill(r,c){const L=stock().filter(m=>!c.name||m!==c.m);const m=SHOPS.pickW(L.map(q=>({q,w:wOf(q)})),r).q||L[0];const keep=CAR_GLB[m.glb]&&CAR_GLB[m.glb].keep;
   const used=r()<.3,km=used?8000+Math.floor(r()*82000):5+Math.floor(r()*20),list=used?r100(m.price*(.6+r()*.25)):m.price;
   const disc=r50(list*(list>=1000000?r()*.02:.015+r()*.045));
   // the trade-in: the resident's own car (the one in their home garage)
   const tv=c.name?r100(c.m.price*(.3+r()*.25)):0,trade=c.name&&tv<=list*.7?{m:c.m,col:c.col,val:tv}:null;
   const fees=[['Registration + plates','DL-REG',120],['Delivery prep + valet','DL-PREP',180]];if(r()<.4)fees.push(['Paint + interior protection','DL-PROT',240+Math.floor(r()*4)*40]);if(r()<.35)fees.push(['Extended warranty · 3 years','DL-WAR',r50(Math.max(450,list*.012))]);
   const price=list-disc,feeTC=fees.reduce((a,f)=>a+f[2],0),total=price+feeTC,due=Math.max(0,total-(trade?trade.val:0));
   // payment: cash, or finance (deposit, term, APR, monthly)
   const fin=r()<.62&&due>4000?(()=>{const dep=r100(due*(.1+r()*.2)),n=[36,48,60][Math.floor(r()*3)],apr=Math.round((4.9+r()*3)*10)/10,P=due-dep,i=apr/1200;return{dep,n,apr,mo:Math.round(P*i/(1-Math.pow(1+i,-n)))}})():null;
   const dur=2280+Math.round(r()*600);
   return{dur,m,model:m.n,color:keep?'#ffffff':PAINT[Math.floor(r()*PAINT.length)],svc:(used?'USED · ':'NEW · ')+m.n,used,km,list,disc,price,fees,feeTC,total,due,trade,fin,
    stockNo:'STK-'+String(1000+SHOPS.h32('stk',c.g)%9000),keyNo:1+SHOPS.h32('key',c.g)%40}},
  ready:' · ready for collection',done:' · driven home',
  doing:(j,s,who)=>''});
 // the panel line: "<Salesman> is selling the <model> to <Buyer> · deal D-1042 · 12 min left"
 const buyer=j=>j.name&&!E.hidden(j.name)?j.name:'a customer';
 E.buyer=buyer;
 E.line=function(j,s,left){const sn=E.staffName(j),me=sn&&!E.hidden(sn)?sn:E.cfg.crew,b=buyer(j),md=j.model;
  const d=s===0?`is showing ${b} the ${md}`:s===1?`is out on a test drive in the ${md} with ${b}`:s===2?`is selling the ${md} to ${b}`:s===3?(j.fin?`is doing the finance paperwork with ${b} · ${j.fin.n} months`:`is doing the paperwork with ${b} · paying cash`)
   :s===4?`has sold the ${md} to ${b}`:s===5?`is getting the ${md} ready for ${b}`:s===6?`is handing ${b} the keys to the ${md}`:`waved off ${b} in the new ${md}`;
  const tl=s<E.RD?` · ${Math.max(1,Math.ceil(left/60))} min left`:s===E.RD?' · ready for collection':' · driven home';
  return `${me} ${d} · deal ${j.no}${tl}`+(sn?'':` · ${E.ROLE} JOB OPEN`)};
 // sold = past the SOLD stage (st[4]); the last n sold before t, newest first
 function sold(t,n){t=t==null?SHOPS.now():t;const L=[];if(!E.open())return L;for(let g=Math.floor(t/STEP);L.length<(n||8)&&g>Math.floor(t/STEP)-500;g--){const j=E.job(g);if(j.st[4]<=t)L.push(j)}return L}
 // today since 00:00 UTC (cars sold, TC) and the sales leaderboard (today, last 7 days) per salesman
 let LK='',LV=null;
 function board(t){t=t==null?SHOPS.now():t;const g1=Math.floor(t/STEP),key=g1+':'+WALL.length+':'+E.open();if(key===LK)return LV;const d0=Math.floor(t/86400)*86400,w0=t-7*86400;
  const per=[0,1].map(k=>({k,day:0,week:0,tc:0}));let n=0,tcs=0;
  if(E.open())for(let g=g1;g>Math.floor(w0/STEP)-2;g--){const j=E.job(g);if(j.st[4]>t||j.st[4]<w0)continue;const p=per[j.post];if(!p)continue;p.week++;if(j.st[4]>=d0){p.day++;p.tc+=j.total;n++;tcs+=j.total}}
  LK=key;return LV={n,tc:tcs,per}}
 E.today=t=>{const b=board(t);return{n:b.n,tc:b.tc}};
 return Object.assign(E,{display,spec,sold,board,stock,STEP_S:STEP})})();
