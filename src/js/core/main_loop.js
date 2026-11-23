//@ core/main_loop.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
drawBackground();setup();setSubs(SUBS_OVR!==null?SUBS_OVR:Math.max(0,Math.floor(Number(STATE.subs)||0)));
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{g.clearRect(0,0,CW,CH);drawBackground()});
let last=performance.now();
const SN2=XMAS?Array.from({length:420},()=>[Math.random(),Math.random(),.5+Math.random(),1.5+Math.random()*2.5]):null;
function snow2D(dt){ctx.save();ctx.fillStyle='rgba(255,255,255,.85)';for(const f of SN2){f[1]+=dt*.05*f[2];if(f[1]>1)f[1]-=1;const x=(f[0]+.01*Math.sin(simTime*.8+f[3]*9))*CW,y=f[1]*CH;ctx.beginPath();ctx.arc(x,y,f[3],0,TAU);ctx.fill()}ctx.restore()}
function loop(ts){
 const raw=Math.max(0,(ts-last)/1000),real=Math.min(.05,raw);last=ts;
 if(running){let dt=real*speed;while(dt>0){const s=Math.min(dt,1/30);update(s);dt-=s}}
 if(view3d&&R3)R3.frame(real);else{draw();if(XMAS)snow2D(real);present()}
 uiT-=real;if(uiT<=0){uiT=.25;updateStats();updateCard()}
 requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
ownerTools();
setTimeout(()=>{newsSeed();parkRanger()},1500);setInterval(newsSummary,55000);
setInterval(()=>{fetch('state.json?v='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{if(!j)return;if(SUBS_OVR===null&&Number.isFinite(+j.subs)&&+j.subs!==subs)setSubs(+j.subs);if(j.roles&&typeof j.roles==='object')for(const k in j.roles)ROLES[k.toLowerCase()]=String(j.roles[k]).toLowerCase();if(Array.isArray(j.names)){let add=0;for(const raw of j.names){const n=String(raw).trim().slice(0,24);if(n&&!WALL.some(x=>x.toLowerCase()===n.toLowerCase())){WALL.push(n);add++}}if(add){assignDrivers();assignJobs();WALL.slice(-add).forEach(n=>{const jb=jobOf(n);news(jb?`Welcome, ${n}! The city's newest ${jb}`:`Welcome, ${n}! Now looking for a job`,'people',`${n} joined Motoropolis from the comments.`)})}}}).catch(()=>{})},120000);
