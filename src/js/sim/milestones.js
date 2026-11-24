//@ sim/milestones.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- subscriber milestones ----------
const MILESTONES=@@JSON:buildings/milestones.json@@;
const MS={};for(const m of MILESTONES)MS[m.type]=m;
const MAXCARS=WORLD?400:150; // 1 subscriber = 1 car (up to what the streets can hold)
let subs=null;
const isOpen=type=>subs!==null&&subs>=MS[type].n;
// world test page: extra unlocks outside the core city
const WORLD_MS=WORLD?@@JSON:buildings/world_milestones.json@@:[];
for(const m of WORLD_MS)MS[m.type]=m;
const ALL_MS=MILESTONES.concat(WORLD_MS).sort((a,b)=>a.n-b.n);
const nextMilestone=()=>ALL_MS.find(m=>subs===null||subs<m.n)||null;
const SUBS_OVR=(()=>{if(!WORLD)return null;const v=parseInt(new URLSearchParams(location.search).get('subs'),10);return Number.isFinite(v)&&v>=0?v:null})();

