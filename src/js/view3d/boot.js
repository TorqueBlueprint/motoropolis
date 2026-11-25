//@ view3d/boot.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- 3D view (three.js, loaded on demand; the simulation above stays the same) ----------
const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
const ADDON=p=>'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/'+p;
let view3d=false,R3=null,r3Loading=null;
const screenEl=$('screen');
const c3=document.createElement('canvas');c3.id='city3d';c3.hidden=true;c3.setAttribute('aria-label','3D view of the city of Motoropolis. Drag to turn, scroll or pinch to zoom.');
// HUD overlay: labels are drawn in a virtual CH-high space (HUDW x HUDH); the canvas itself has the display's pixel
// size and the context is scaled by HUDK. The recorder page keeps the old full-size canvas (HUDK = 1).
const HUD_FULL=document.documentElement.dataset.rec==='1';let HUDW=CW,HUDH=CH,HUDK=1;
const hud=document.createElement('canvas');hud.id='hud3d';hud.width=CW;hud.height=CH;hud.hidden=true;hud.setAttribute('aria-hidden','true');
screenEl.insertBefore(hud,C.nextSibling);screenEl.insertBefore(c3,hud);
const hctx=hud.getContext('2d');
function hasGL(){try{const t=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(t.getContext('webgl2')||t.getContext('webgl')))}catch(e){return false}}
