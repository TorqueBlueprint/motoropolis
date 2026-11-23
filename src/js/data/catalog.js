//@ data/catalog.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- data ----------
const MODELS=[
 {n:'Hot hatch 2.0 turbo',len:32,wid:15,price:45900,v:[100,120],glb:'hothatch'},
 {n:'Italian GT V12',len:33,wid:16,price:265000,v:[110,128],sport:true,glb:'gt12'},
 {n:'1963 American coupe V8',len:33,wid:16,price:120000,v:[95,115],classic:true,glb:'v8sport'},
 {n:'Sport saloon 4-door',len:35,wid:16,price:112000,v:[100,120],glb:'sportsaloon'},
 {n:'German sport sedan 3.0',len:34,wid:15,price:82000,v:[104,122],sport:true,glb:'sport3'},
 {n:'1990 Evo sedan 2.5',len:32,wid:15,price:48000,v:[95,112],classic:true,glb:'saloon90'},
 {n:'City taxi',len:34,wid:15,price:31000,v:[90,105],glb:'taxi',taxi:true},
 {n:'Off-road pickup 3.0 V6',len:39,wid:17,price:78000,v:[90,108],pickup:true,glb:'offroad'},
 {n:'1985 German coupe 2.3',len:31,wid:15,price:38000,v:[92,110],classic:true,glb:'coupe85'},
 {n:'1998 German sedan 2.5',len:32,wid:15,price:14900,v:[88,104],glb:'sedan98'},
 {n:'1965 American fastback V8',len:33,wid:16,price:95000,v:[92,112],classic:true,glb:'fastback65'},
 {n:'Mid-engine supercar V10',len:32,wid:16,price:195000,v:[112,130],sport:true,glb:'midv10'},
 {n:'1998 Japanese GT 3.0 turbo',len:32,wid:15,price:90000,v:[105,124],sport:true,glb:'jgt98'},
 {n:'1999 Japanese AWD coupe',len:33,wid:15,price:160000,v:[106,125],sport:true,glb:'awd99'},
 {n:'German rear-engine turbo coupe',len:32,wid:16,price:250000,v:[112,130],sport:true,glb:'rearturbo'},
 {n:'Japanese RWD coupe 2.4',len:31,wid:15,price:32000,v:[100,118],sport:true,glb:'rwd24'},
 {n:'1983 Japanese hatchback coupe 1.6',len:30,wid:15,price:35000,v:[98,116],classic:true,sport:true,glb:'ae86'},
 {n:'1987 Italian twin-turbo supercar',len:31,wid:16,price:2500000,v:[114,132],classic:true,sport:true,glb:'f40'},
 {n:'American twin-turbo V8 hypercar',len:33,wid:16,price:2100000,v:[116,134],sport:true,glb:'venom'},
 {n:'German F1-engine hypercar',len:33,wid:16,price:2700000,v:[115,133],sport:true,glb:'amgone'},
 {n:'British hybrid hypercar',len:32,wid:16,price:1350000,v:[115,133],sport:true,glb:'p1'},
 {n:'1961 British roadster',len:31,wid:15,price:180000,v:[98,116],classic:true,glb:'etype'},
 {n:'1992 American V10 roadster',len:31,wid:16,price:70000,v:[106,124],classic:true,sport:true,glb:'viper'},
 {n:'1989 Japanese roadster 1.6',len:28,wid:15,price:25000,v:[96,114],classic:true,sport:true,glb:'miata'},
 {n:'Italian V12 supercar',len:33,wid:17,price:520000,v:[116,134],sport:true,glb:'svj'},
 {n:'1989 Japanese AWD coupe 2.6',len:32,wid:15,price:60000,v:[104,122],classic:true,sport:true,glb:'r32'},
 {n:'1970 American muscle car V8 supercharged',len:33,wid:16,price:150000,v:[104,124],classic:true,sport:true,glb:'charger'},
 {n:'2020 American muscle coupe V8 supercharged',len:33,wid:15,price:90000,v:[108,128],sport:true,glb:'challenger'},
 {n:'Italian super SUV V8',len:34,wid:17,price:230000,v:[106,124],glb:'urus'},
 {n:'2006 Japanese rally sedan AWD',len:31,wid:15,price:45000,v:[102,120],sport:true,glb:'evo9'}
];
// low-poly car models (no logos, no brand names): file in assets/cars, body colour cell in the palette texture
const CAR_GLB={hothatch:{file:'hothatch.glb',len:4.59,cell:[16,0,8,8]},gt12:{file:'gt12.glb',len:4.64,cell:[8,0,8,8]},v8sport:{file:'v8sport.glb',len:4.64,cell:[24,0,8,8]},sportsaloon:{file:'sportsaloon.glb',len:2.99,cell:[8,0,8,8]},
 sport3:{file:'sport3.glb',paint:'CarPaint'},
 saloon90:{file:'saloon90.glb',paint:'Car_paint',fix:{blackplastic:[0x16181c],matt:[0x2a2c30],yellow_glow:[0xffb000,1],transparent:[0x1d2a38,0,.6],white_glow:[0xfff4d0,1],red_glow:[0xcc1010,1],windshield:[0x1d2a38,0,.75],disc:[0x777c82],brake_color:[0xd93a2f],rims_color:[0xb8bec6],rubber:[0x151517]}},
 police:{file:'cs_police_sedan.glb',yaw:49.9,flip:1,keep:1},bus:{file:'cs_citybus.glb',keep:1},tow:{file:'cs_towtruck.glb',yaw:19.9,flip:1,keep:1},fire:{file:'cs_fire_truck.glb',yaw:-55,flip:1,keep:1},amb:{file:'cs_ambulance.glb',yaw:19.7,keep:1,lenK:1.36},
 offroad:{file:'offroad.glb',flip:1,paint:['Material.003']},coupe85:{file:'coupe85.glb',paint:['Body'],tint:1},sedan98:{file:'sedan98.glb',keep:1},fastback65:{file:'fastback65.glb',flip:1,paint:['CarPrimaryColor']},
 midv10:{file:'midv10.glb',paint:['body']},jgt98:{file:'jgt98.glb',paint:['wigeon']},awd99:{file:'awd99.glb',paint:['body']},rearturbo:{file:'rearturbo.glb',flip:1,paint:['New_Material']},rwd24:{file:'rwd24.glb',paint:['cuerpo']},ae86:{file:'ae86.glb',flip:1,keep:1},f40:{file:'f40.glb',keep:1},venom:{file:'venom.glb',paint:['hen_venom_paint']},amgone:{file:'amgone.glb',keep:1},p1:{file:'p1.glb',keep:1},etype:{file:'etype.glb',keep:1},viper:{file:'viper.glb',keep:1},miata:{file:'miata.glb',keep:1},svj:{file:'svj.glb',keep:1},r32:{file:'r32.glb',paint:['paint']},charger:{file:'charger.glb',keep:1},challenger:{file:'challenger.glb',paint:['carpaint.001']},urus:{file:'urus.glb',flip:1,keep:1},evo9:{file:'evo9.glb',paint:['mM_CarPaint_Max_002','mM_CarPaintNormal_Max1']},
 garbage:{file:'cs_garbage_truck.glb',yaw:55.3,keep:1},taxi:{file:'cs_taxi.glb',yaw:-50,keep:1},van:{file:'cs_postvan.glb',yaw:-20.5,keep:1}};
const ASSET_BASE=/\/(world|remake|xmas|perf)\//.test(location.pathname)?'../':'';
const COLORS=['#d93a2f','#2f6fd9','#f2f2ee','#22252b','#9aa3ad','#e8b931','#2e8b57','#7a3fb0','#e8742a','#5a6b7d','#b5272d','#3fa7c4','#c9c3b5'];
const FAULTS=[
 {n:'Flat tire',k:'tire',t:5,c:25,w:3},
 {n:'Bald tire',k:'tire',t:6,c:140,w:1.5},
 {n:'Worn brake pads',k:'warn',t:7,c:90,w:2},
 {n:'Check engine light',k:'warn',t:6,c:60,w:1.5},
 {n:'Blown exhaust',k:'warn',t:7,c:180,w:1},
 {n:'Worn shocks',k:'warn',t:9,c:320,w:1},
 {n:'Dead battery',k:'tow',t:5,c:110,w:2},
 {n:'Snapped timing belt',k:'tow',t:14,c:550,w:1},
 {n:'Blown head gasket',k:'tow',t:16,c:900,w:.6,smoke:true},
 {n:'Failed alternator',k:'tow',t:9,c:320,w:1},
 {n:'Failed starter motor',k:'tow',t:8,c:250,w:1},
 {n:'Worn-out clutch',k:'tow',t:12,c:480,w:1},
 {n:'Failed turbo',k:'tow',t:12,c:850,w:.7,smoke:true},
 {n:'Leaking radiator',k:'tow',t:8,c:280,w:.9,smoke:true},
 {n:'Failed water pump',k:'tow',t:9,c:260,w:.9,smoke:true}
];
const INSP=[
 {n:'Loose steering',k:'warn',t:8,c:210},{n:'Misaligned headlights',k:'warn',t:4,c:35},
 {n:'Emissions over the limit',k:'warn',t:9,c:290},{n:'Worn brake rotors',k:'warn',t:8,c:240},
 {n:'Oil leak',k:'warn',t:8,c:170}
];
const PARTS=['brake pads and rotors','a rebuilt alternator','a clutch kit','oil and air filters','a timing belt kit','four new tires','a 70 Ah battery','a rebuilt turbo'];
function pickFault(kind){const list=kind?FAULTS.filter(f=>f.k===kind):FAULTS;let tw=0;for(const f of list)tw+=f.w;let r=R()*tw;for(const f of list){r-=f.w;if(r<=0)return f}return list[0]}
const L2='ABCDEFGHJKLMNPRSTUVWXYZ';
function plate(){const l=()=>L2[Math.floor(R()*L2.length)];return `${l()}${l()}${l()} ${String(Math.floor(R()*10000)).padStart(4,'0')}`}

