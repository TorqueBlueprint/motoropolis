//@ sim/milestones.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- subscriber milestones ----------
const MILESTONES=[
 {n:0,type:'oficina',label:'Repair shop'},
 {n:0,type:'market',label:'Supermarket'},
 {n:10,type:'reboques',label:'24h Towing'},
 {n:15,type:'bomba',label:'Gas station'},
 {n:20,type:'pneus',label:'Tire shop'},
 {n:30,type:'lavagem',label:'Car wash'},
 {n:50,type:'inspecao',label:'Inspection center'},
 {n:75,type:'parque',label:'Parking lot'},
 {n:100,type:'pecas',label:'Auto parts'},
 {n:150,type:'stand',label:'Car dealership'},
 {n:250,type:'sucata',label:'Junkyard'},
 {n:500,type:'fabrica',label:'Car factory'},
 {n:1000,type:'pista',label:'Race track'}
];
const MS={};for(const m of MILESTONES)MS[m.type]=m;
const MAXCARS=WORLD?400:150; // 1 subscriber = 1 car (up to what the streets can hold)
let subs=null;
const isOpen=type=>subs!==null&&subs>=MS[type].n;
// world test page: extra unlocks outside the core city
const WORLD_MS=WORLD?[
 {n:100,type:'w_res',label:'Riverside Heights',w:1},
 {n:125,type:'w_fire',label:'Fire station',w:1},
 {n:200,type:'w_hosp',label:'Hospital',w:1},
 {n:300,type:'w_stad',label:'Football stadium',w:1},
 {n:400,type:'w_mall',label:'Shopping mall',w:1},
 {n:650,type:'w_train',label:'Train station',w:1},
 {n:800,type:'w_hwy',label:'Highway & tunnel',w:1},
 {n:1500,type:'w_air',label:'Airport',w:1},
 {n:2000,type:'w_arena',label:'Arena & events',w:1},
 {n:3000,type:'w_port',label:'Harbor',w:1},
 {n:5000,type:'w_tower',label:'Motoropolis Tower',w:1},
 {n:10000,type:'w_gp',label:'Grand Prix',w:1}]:[];
for(const m of WORLD_MS)MS[m.type]=m;
const ALL_MS=MILESTONES.concat(WORLD_MS).sort((a,b)=>a.n-b.n);
const nextMilestone=()=>ALL_MS.find(m=>subs===null||subs<m.n)||null;
const SUBS_OVR=(()=>{if(!WORLD)return null;const v=parseInt(new URLSearchParams(location.search).get('subs'),10);return Number.isFinite(v)&&v>=0?v:null})();

