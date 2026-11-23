//@ ui/view_controls.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
const vMsg=$('vMsg'),v3b=$('v3d'),v2b=$('v2d'),vRes=$('vReset');
{// full screen: real full screen where the browser allows it (Android, computers), otherwise the city fills the window (iPhone)
 const fb=$('vFull'),scr=$('screen'),canReal=!!(document.fullscreenEnabled&&scr.requestFullscreen);let fake=false;
 const isFs=()=>fake||document.fullscreenElement===scr;
 const label=()=>{const on=isFs();$('vFullT').textContent=on?'✕ Exit full screen':'⛶ Full screen';$('vFullS').textContent=on?'✕':'⛶';fb.setAttribute('aria-pressed',on)};
 const setFake=on=>{fake=on;scr.classList.toggle('fsfake',on);document.body.classList.toggle('fs-lock',on);label()};
 fb.addEventListener('click',async()=>{if(isFs()){if(fake)setFake(false);else{try{await document.exitFullscreen()}catch(e){}}return}
  if(canReal){try{await scr.requestFullscreen({navigationUI:'hide'});try{if(matchMedia('(pointer:coarse)').matches)await screen.orientation.lock('landscape')}catch(e){}label();return}catch(e){}}setFake(true)});
 document.addEventListener('fullscreenchange',label);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fake)setFake(false)});}
{const QN={high:'High',medium:'Medium',low:'Low'},QS={high:'HQ',medium:'MQ',low:'LQ'},ORD=['high','medium','low'];$('vQualT').textContent=QN[QUAL];$('vQualS').textContent=QS[QUAL];
 $('vQual').addEventListener('click',()=>{const nx=ORD[(ORD.indexOf(QUAL)+1)%3];try{localStorage.setItem('mtp-quality',nx)}catch(e){}location.reload()})}
function store(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function readStore(k){try{return localStorage.getItem(k)}catch(e){return null}}
async function setView(want3d,save){
 if(want3d&&!R3){vMsg.textContent='Loading the 3D city…';vMsg.hidden=false;if(!r3Loading)r3Loading=loadR3();await r3Loading;vMsg.hidden=true;
  if(!R3){v3b.disabled=true;v3b.title='3D isn’t available in this browser';want3d=false;vMsg.textContent='3D isn’t available in this browser, showing the map.';vMsg.hidden=false;setTimeout(()=>{vMsg.hidden=true},3500)}}
 view3d=!!want3d;C.hidden=view3d;c3.hidden=!view3d;hud.hidden=!view3d;vRes.hidden=!view3d;v3b.setAttribute('aria-pressed',String(view3d));v2b.setAttribute('aria-pressed',String(!view3d));
 if(view3d&&R3){R3.resize();R3.setOnMode(m=>{$('vBack').hidden=m!=='in'})}
 if(save)store('mtp-view',view3d?'3d':'2d');
}
v3b.addEventListener('click',()=>setView(true,true));v2b.addEventListener('click',()=>{if(R3&&R3.mode()==='in')R3.exitIn();setView(false,true)});$('vBack').addEventListener('click',()=>{if(R3)R3.exitIn()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&R3&&R3.mode()==='in'&&!wsOpenFlag)R3.exitIn()});vRes.addEventListener('click',()=>{if(R3)R3.reset()});
if(!hasGL()){v3b.disabled=true;v3b.title='3D isn’t available in this browser'}
else if(readStore('mtp-view')!=='2d')setView(true,false);

