//@ sim/state.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- state ----------
let cars=[],particles=[],simTime=0,running=true,speed=1,lightMode='auto',showHud=true,channel='';
let selected=null,dispatchT=0,uiT=0,secT=0,celebQ=[],celeb=null,subToast=null;
const stats={money:0,faults:0,repairs:0,tows:0,insp:0,fuel:0,sold:0,wash:0,scrap:0};
const ticker=[];
let nextId=1;
function newCar(o){
 const{model,...rest}=o||{};const m=model||pick(MODELS);o=rest;
 const c={id:nextId++,kind:'car',plate:plate(),model:m.n,m,color:m.taxi?'#f2b81d':pick(COLORS),len:m.len,wid:m.wid,price:Math.round(m.price*rr(.95,1.08)/100)*100,
  vmax:rr(m.v[0],m.v[1]),x:0,y:0,ang:0,v:0,from:0,to:1,pts:[],route:[],task:null,state:'road',fuel:rr(35,100),health:rr(45,100),dirt:rr(0,70),
  km:rr(2000,300000),repairs:0,fault:null,timer:0,slot:null,stuck:0,ghost:0,brake:false,towing:null,towedBy:null,isNew:false,checkT:R(),waitRed:false};
 if(m.classic){c.health=rr(35,70);c.km=rr(150000,330000)}
 c.nextInsp=c.km+rr(5000,120000);
 Object.assign(c,o);cars.push(c);return c;
}
function placeOnRoad(c){
 for(let k=0;k<120;k++){
  const a=Math.floor(R()*nodes.length);if(!nodes[a].nb.length)continue;const b=pick(nodes[a].nb),d=segDir(a,b);if(d.len<nodes[a].clr+nodes[b].clr+60)continue;const s=rr(nodes[a].clr+20,d.len-nodes[b].clr-40),p=lanePt(a,b,s),t=segAt(a,b,s);
  if(cars.some(o=>o!==c&&o.state==='road'&&Math.hypot(o.x-p.x,o.y-p.y)<45))continue;
  c.x=p.x;c.y=p.y;c.ang=Math.atan2(t.dy,t.dx);c.from=a;c.to=b;c.pts=[stopPt(a,b)];c.v=c.vmax*.6;c.state='road';return true;
 }
 return false;
}
function parkIn(c,s,timer){c.x=s.x;c.y=s.y;c.ang=s.ang;s.car=c;c.slot=s;c.state='service';c.timer=timer;c.v=0}

