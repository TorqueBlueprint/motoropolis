//@ ui/nav.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// Redesign (option A), step 2: the phone bottom nav (Explore / Find me / Unlocks / Subscribe), the Unlocks and
// "How to move in" panels over the city (one panel open at a time, shared with Find my name from ui/welcome.js),
// and the collapsible cards below the city. Never shows the subscriber total: the Unlocks list copies #metas
// (milestone thresholds, "Open", "N more to go", "Blueprint").
{
 const PN={finder:$('finder'),unlocks:$('unlocks'),moveIn:$('moveIn')},scr=$('screen'),ul=$('ulList');
 const phone=()=>matchMedia('(max-width: 700px)').matches;
 const only=keep=>{for(const k in PN)if(k!==keep)PN[k].hidden=true};UIX.only=only;
 // the panels live over the city: on a phone, bring the city back into view first
 const toCity=()=>{const r=scr.getBoundingClientRect();if(r.top<-40||r.top>innerHeight*.35)scr.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
 function fillUnlocks(){ul.innerHTML=$('metas').innerHTML;const c=ul.querySelector('li.next .chip');if(c)c.textContent=c.textContent.replace(/ to go$/,' more to go')}
 function open(id){if(id==='finder'){UIX.openFinder();return}only(id);const el=PN[id];if(id==='unlocks')fillUnlocks();el.hidden=false;el.scrollTop=0;
  // the open milestones come first: start the list at the next one
  if(id==='unlocks'){const nx=ul.querySelector('li.next');if(nx)el.scrollTop=Math.max(0,nx.offsetTop-el.clientHeight*.4)}
  const x=el.querySelector('.fd-x');if(x)try{x.focus({preventScroll:true})}catch(e){}}
 const close=id=>{PN[id].hidden=true};
 const toggle=id=>{if(PN[id].hidden){if(phone())toCity();open(id)}else close(id)};
 $('vUnlocks').addEventListener('click',()=>toggle('unlocks'));
 $('nbFind').addEventListener('click',()=>toggle('finder'));
 $('nbUnlocks').addEventListener('click',()=>toggle('unlocks'));
 $('nbExplore').addEventListener('click',()=>{only(null);toCity();if(hasGL()&&!view3d)setView(true,true)});
 document.addEventListener('click',e=>{const o=e.target.closest&&e.target.closest('[data-open]');if(o){open(o.dataset.open);return}
  const c=e.target.closest&&e.target.closest('[data-close]');if(c)close(c.dataset.close)});
 for(const id of ['unlocks','moveIn'])PN[id].addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close(id)}});
 setInterval(()=>{if(!PN.unlocks.hidden)fillUnlocks()},5000);
 // keep the buttons in step with whichever panel is open (Find my name can also close itself)
 const sync=()=>{const f=!PN.finder.hidden,u=!PN.unlocks.hidden,m=!PN.moveIn.hidden;
  for(const[b,on]of[[$('vFind'),f],[$('nbFind'),f],[$('vUnlocks'),u],[$('nbUnlocks'),u]]){b.setAttribute('aria-expanded',String(on));b.classList.toggle('is-on',on)}
  $('nbExplore').classList.toggle('is-on',!f&&!u&&!m)};
 const mo=new MutationObserver(sync);for(const k in PN)mo.observe(PN[k],{attributes:true,attributeFilter:['hidden']});sync();
 // ---- cards below the city: every header folds its card; phones start with only the news open ----
 const cards=[...document.querySelectorAll('.cards .card')];
 const setCard=(c,on)=>{const b=c.querySelector('.card-h button'),body=c.querySelector('.card-b');if(!b||!body)return;b.setAttribute('aria-expanded',String(on));body.hidden=!on;c.classList.toggle('is-shut',!on)};
 const defaults=()=>{const p=phone();for(const c of cards)setCard(c,!p||c.dataset.card==='news')};
 defaults();try{matchMedia('(max-width: 700px)').addEventListener('change',defaults)}catch(e){}
 for(const c of cards){const b=c.querySelector('.card-h button');if(b)b.addEventListener('click',()=>setCard(c,b.getAttribute('aria-expanded')!=='true'))}
 // a car picked on the map opens its card
 {const info=$('carInfo'),cc=$('carCard');new MutationObserver(()=>{if(!info.hidden)setCard(cc,true)}).observe(info,{attributes:true,attributeFilter:['hidden']})}
}
