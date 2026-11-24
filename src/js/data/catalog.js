//@ data/catalog.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- data ----------
const MODELS=@@JSON:cars/models.json@@;
// low-poly car models (no logos, no brand names): file in assets/cars, body colour cell in the palette texture
const CAR_GLB=@@JSON:cars/car_glb.json@@;
const ASSET_BASE=/\/(world|remake|xmas|perf)\//.test(location.pathname)?'../':'';
const COLORS=@@JSON:cars/colors.json@@;
const FAULTS=@@JSON:cars/faults.json@@;
const INSP=@@JSON:cars/inspections.json@@;
const PARTS=@@JSON:cars/parts.json@@;
function pickFault(kind){const list=kind?FAULTS.filter(f=>f.k===kind):FAULTS;let tw=0;for(const f of list)tw+=f.w;let r=R()*tw;for(const f of list){r-=f.w;if(r<=0)return f}return list[0]}
const L2='ABCDEFGHJKLMNPRSTUVWXYZ';
function plate(){const l=()=>L2[Math.floor(R()*L2.length)];return `${l()}${l()}${l()} ${String(Math.floor(R()*10000)).padStart(4,'0')}`}

