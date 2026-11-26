//@ ui/welcome.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// Redesign (option A): welcome screen with loading progress, the "next unlock" card over the city and "Find my name".
// Never shows the subscriber count itself: only how many more are needed for the next unlock (like the boards in the city).
const UIX={};// shared with ui/nav.js (bottom nav, Unlocks, How to move in)
{
 const REC=document.documentElement.dataset.rec==='1',BOT=!!navigator.webdriver,PERF=/\/perf\//.test(location.pathname);
 // ---- next unlock card (over the city) ----
 const nuCard=$('nuCard');
 function nuUpdate(){const next=nextMilestone();if(!next||subs===null){nuCard.hidden=true;return}
  const sv=subs||0,left=next.n-sv,pv=[...ALL_MS].reverse().find(q=>q.n<=sv),base=pv?pv.n:0;
  $('nuName').textContent=next.label;$('nuLeft').textContent=`${left.toLocaleString('en-US')} more subscriber${left===1?'':'s'} to open`;
  $('nuBar').style.width=(clamp((sv-base)/Math.max(1,next.n-base),0,1)*100).toFixed(1)+'%';nuCard.hidden=REC}
 nuUpdate();setInterval(nuUpdate,5000);
 // ---- Find my name ----
 const fd=$('finder'),fin=$('fdIn'),flist=$('fdList');let follow=null,followT=0;
 const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 function where(n){const p=peds.find(q=>q.name===n);if(p)return{kind:'ped',p};const c=cars.find(q=>q.driver===n&&!q.removed&&!q.hidden);if(c)return{kind:'car',c};return null}
 function posOf(f){if(f.kind==='ped')return{x:f.p.x/10,z:f.p.y/10};return{x:f.c.x/10,z:f.c.y/10}}
 function render(){const q=norm(fin.value);flist.textContent='';if(!q){return}
  const hits=WALL.filter(n=>norm(n).includes(q)).slice(0,6);
  if(!hits.length){const li=document.createElement('li');li.className='fd-none';li.textContent='No one with that name lives here yet.';flist.append(li);return}
  for(const n of hits){const li=document.createElement('li');const w=where(n),job=jobOf(n);
   const av=document.createElement('span');av.className='fd-av';av.textContent=n.replace(/[^A-Za-z0-9]/g,'').slice(0,2).toUpperCase()||'?';
   const tx=document.createElement('span');tx.className='fd-tx';const b=document.createElement('b');b.textContent=n;const sm=document.createElement('small');
   sm.textContent=(job?job:'Looking for a job')+(w?(w.kind==='car'?' · driving':' · walking'):' · at work');tx.append(b,sm);{const db=UIX.dragBest&&UIX.dragBest(n);if(db){const d=document.createElement('small');d.className='fd-dg';d.textContent=db;tx.append(d)}}li.append(av,tx);
   if(w&&R3){const go=document.createElement('button');go.type='button';go.className='fd-go';go.textContent='Fly to me';go.addEventListener('click',()=>flyTo(n));li.append(go)}
   flist.append(li)}}
 function flyTo(n){const w=where(n);if(!w||!R3)return;if(!view3d)setView(true,true);if(R3.mode()==='in')R3.exitIn();follow={n,w};followT=0;const c=R3.cam,p=posOf(w);c.tx=p.x;c.tz=p.z;c.dist=34;c.pitch=.62;
  if(matchMedia('(max-width: 700px)').matches)fd.hidden=true}
 // keep the camera on the person for a while (they walk or drive); any drag on the city stops it
 setInterval(()=>{if(!follow||!R3||R3.mode()==='in')return;followT+=.05;const w=where(follow.n);if(!w||followT>45){follow=null;return}const p=posOf(w),c=R3.cam;c.tx+=(p.x-c.tx)*.2;c.tz+=(p.z-c.tz)*.2},50);
 $('screen').addEventListener('pointerdown',e=>{if(!fd.contains(e.target)&&!nuCard.contains(e.target))follow=null});
 const openFinder=()=>{if(UIX.only)UIX.only('finder');fd.hidden=false;fin.focus();render()};UIX.openFinder=openFinder;
 $('vFind').addEventListener('click',()=>{if(fd.hidden)openFinder();else fd.hidden=true});$('fdClose').addEventListener('click',()=>{fd.hidden=true});
 fin.addEventListener('input',render);fin.addEventListener('keydown',e=>{if(e.key==='Escape')fd.hidden=true});
 // ---- welcome screen ----
 const wc=$('welcome');
 if(!REC&&!BOT&&!PERF&&!/[?&]nowelcome\b/.test(location.search)){
  wc.hidden=false;document.body.classList.add('wc-lock');const t0=performance.now();let shown=0;
  const close=()=>{wc.hidden=true;document.body.classList.remove('wc-lock');clearInterval(tick)};
  const tick=setInterval(()=>{const L=window.__mtpLoad||{st:0,n:0,d:0};let p;
   if(R3)p=100;else if(!hasGL())p=100;else{const files=L.n?L.d/L.n:0;p=5+L.st*60+files*30;p=Math.min(95,Math.max(p,Math.min(60,(performance.now()-t0)/250)))}
   shown+=(p-shown)*.25;if(p>=100&&shown>99)shown=100;$('wcPct').textContent=Math.round(shown)+'%';$('wcBar').style.width=shown.toFixed(1)+'%';
   if(shown>=100){$('wcLt').textContent='The city is ready';$('wcPct').textContent='100%'}},120);
  $('wcGo').addEventListener('click',()=>{close();if(hasGL()&&!view3d)setView(true,true)});
  $('wcFind').addEventListener('click',()=>{close();if(hasGL()&&!view3d)setView(true,true);openFinder()});
  wc.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  setTimeout(()=>{try{$('wcGo').focus()}catch(e){}},50)}
}
