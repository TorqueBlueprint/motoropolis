//@ people/walkers.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- people: the Wall of Mechanics walks the sidewalks and drives the cars ----------
const WALL=(()=>{const out=[];for(const raw of(Array.isArray(STATE.names)?STATE.names:[])){const n=String(raw).trim().slice(0,24);if(n&&!out.some(x=>x.toLowerCase()===n.toLowerCase()))out.push(n)}return out})();
const PED_COLS=['#ff7a1a','#2f6fd9','#5cc98a','#e8b931','#d93a2f','#7a3fb0','#3fa7c4','#f2f2ee','#3a4150','#b5272d'];
const SKIN=['#f1c7a5','#d9a27e','#a8714f','#7a4b32','#f5d3b8','#c68a62'];
const peds=[];
function pedPos(p){const r=p.loop,w=r.x1-r.x0,h=r.y1-r.y0,P=2*(w+h);let s=((p.s%P)+P)%P;
 if(s<w)return{x:r.x0+s,y:r.y0,ang:0};s-=w;if(s<h)return{x:r.x1,y:r.y0+s,ang:Math.PI/2};s-=h;if(s<w)return{x:r.x1-s,y:r.y1,ang:Math.PI};s-=w;return{x:r.x0,y:r.y1-s,ang:-Math.PI/2}}
function mkPed(name,k){
 const b=buildings[(k*5+2)%buildings.length],o=6;
 const p={name,loop:{x0:b.x0-o,y0:b.y0-o,x1:b.x1+o,y1:b.y1+o},s:R()*1200,v:rr(10,15)*(R()<.5?-1:1),col:pick(PED_COLS),skin:pick(SKIN),hair:pick(['#2b1d14','#5a3a22','#c9a25a','#111','#8a4b2a']),pause:0,phase:R()*TAU,x:0,y:0,ang:0};
 Object.assign(p,pedPos(p));p.ang=p.v<0?p.ang+Math.PI:p.ang;peds.push(p);return p}
// every subscriber on the wall walks in the city; fewer anonymous walkers as the wall grows
WALL.slice(0,150).forEach((n,k)=>mkPed(n,k));
for(let k=0,na=Math.max(6,26-Math.max(0,WALL.length-40));k<na;k++)mkPed(null,k+WALL.length);
// strollers and joggers on the loop path of Motoropolis Park
const PARK_LOOP=(()=>{const b=B.park;return{x0:b.x0+26,y0:b.y0+26,x1:b.x1-26,y1:b.y1-26}})();
for(let k=0;k<9;k++){const p=mkPed(null,k+90);p.loop={...PARK_LOOP};p.s=k*140;p.v=(k%3===0?rr(26,32):rr(8,12))*(k%2?-1:1);Object.assign(p,pedPos(p))}
function parkRanger(){for(const q of peds){if(q.name&&jobOf(q.name)==='Homeless'&&q.loop.x0!==PARK_LOOP.x0){q.loop={...PARK_LOOP};q.v=rr(4,6)*(R()<.5?-1:1);q.col='#7a6a55';Object.assign(q,pedPos(q))}}
 const n=staffOf('park','Park Ranger',0);if(!n)return;const p=peds.find(q=>q.name===n);if(p&&p.loop.x0!==PARK_LOOP.x0){p.loop={...PARK_LOOP};p.col='#2e7d4f';Object.assign(p,pedPos(p))}}
function stepPeds(dt){for(const p of peds){
 if(p.pause>0){p.pause-=dt;continue}
 if(R()<dt*.025)p.pause=rr(1.5,4);
 p.s+=p.v*dt;p.phase+=dt*Math.abs(p.v)*.6;const q=pedPos(p);p.x=q.x;p.y=q.y;p.ang=p.v<0?q.ang+Math.PI:q.ang}}

