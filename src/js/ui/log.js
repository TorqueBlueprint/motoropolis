//@ ui/log.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- UI ----------
const logEl=$('log');
function log(text,kind){
 const time=clockStr();ticker.unshift({text,kind,time});if(ticker.length>8)ticker.pop();
 const li=document.createElement('li');li.className=kind||'';
 const t=document.createElement('span');t.className='t';t.textContent=time;
 const s=document.createElement('span');s.textContent=text;li.append(t,s);logEl.prepend(li);
 while(logEl.children.length>120)logEl.lastChild.remove();
}
