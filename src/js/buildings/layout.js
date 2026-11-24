//@ buildings/layout.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- buildings ----------
const B={},buildings=[];
function mkB(type,i,j,side,doorX,name){
 if(WORLD&&WMAP[type])[i,j]=WMAP[type];
 const x0=XS[i]+HALF+12+GAPX,x1=XS[i+1]-HALF-12-GAPX,y0=YS[j]+HALF+12+GAPY,y1=YS[j+1]-HALF-12-GAPY;
 const b={type,name,i,j,x0,x1,y0,y1,w:x1-x0,h:y1-y0,side,slots:[]};
 if(side==='top'){b.seg=[nid(i,j),nid(i+1,j)];b.door={x:x0+doorX,y:y0-8}}
 else if(side==='bottom'){b.seg=[nid(i,j+1),nid(i+1,j+1)];b.door={x:x0+doorX,y:y1+8}}
 buildings.push(b);B[type]=b;return b;
}
// world page: the main buildings are spread over a bigger city grid; every other block is downtown, offices, flats or houses
const WMAP=@@JSON:buildings/world_map.json@@;
const TOWER_BLOCK=[4,2];
let _city=null;function cityFill(){if(_city)return _city;_city={blocks:[],items:[]};if(!WORLD)return _city;const XBL=XMAS&&B.park?[B.park.i-1,B.park.j]:null;let sd=9091;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
 const used=new Set(buildings.map(b=>b.i+','+b.j));used.add(TOWER_BLOCK.join(','));
 const BODY=['#f4efe4','#efe3cf','#e6e9ee','#f2dcc3','#dfe7d8','#f7f1e8'],ROOF=['#c0392b','#2f5fa8','#3d7a3a','#d9822b','#7a4a2a','#8a2f2f','#3a3f4a','#b5552b'];
 for(let i=0;i<NX-1;i++)for(let j=0;j<NY-1;j++){const x0=XS[i]+HALF+16,x1=XS[i+1]-HALF-16,y0=YS[j]+HALF+16,y1=YS[j+1]-HALF-16,cx=(x0+x1)/2,cy=(y0+y1)/2,w=x1-x0,h=y1-y0;
  const d=Math.hypot(((i+.5)/(NX-1)-.5)*1.1,((j+.5)/(NY-1)-.5)*1.3);const tb=i===TOWER_BLOCK[0]&&j===TOWER_BLOCK[1];
  const type=tb?'towerlot':used.has(i+','+j)?'lot':d<.2?'down':d<.33?'mid':d<.45?'flats':'res';_city.blocks.push({i,j,type,x0,y0,x1,y1,d});if(type==='lot'||type==='towerlot')continue;const it=_city.items;
  if(type==='down'){for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){if(r()<.1){it.push({k:'tree',x:cx+a*w/4,y:cy+b*h/4,r:14});continue}it.push({k:'tower',x:cx+a*w/4+(r()-.5)*10,y:cy+b*h/4+(r()-.5)*6,w:w/2-28-r()*20,h:h/2-22-r()*10,f:r(),d})}}
  else if(type==='mid'){for(let a=0;a<4;a++)for(const b of[-1,1]){if(r()<.12)continue;it.push({k:'mid',x:x0+(a+.5)*w/4,y:cy+b*h/4,w:w/4-14,h:h/2-20,f:r(),d})}}
  else if(type==='flats'){for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){if(r()<.28){for(let k=0;k<6;k++)it.push({k:'car',x:cx+a*w/4-60+k*24,y:cy+b*h/4,col:(r()<.5?BODY:ROOF)[Math.floor(r()*6)]});it.push({k:'park',x:cx+a*w/4,y:cy+b*h/4,w:w/2-20,h:h/2-24});continue}it.push({k:'flat',x:cx+a*w/4,y:cy+b*h/4,w:w/2-36-r()*16,h:h/2-28-r()*8,f:r(),d,body:BODY[Math.floor(r()*6)]})}}
  else{const xs=XBL&&i===XBL[0]&&j===XBL[1];if(xs)_city.xst={x0,y0,x1,y1,sx:x0+2*w/5};for(let a=0;a<5;a++){for(const b of[-1,1]){const hw=52+r()*10,hh=44+r()*8;if(xs&&a<2)continue;it.push({k:'house',x:x0+(a+.5)*w/5,y:b<0?y0+30:y1-30,w:hw,h:hh,ang:b<0?Math.PI:0,body:BODY[Math.floor(r()*6)],roof:ROOF[Math.floor(r()*8)]})}}
   for(let k=0;k<7;k++){const tr={k:'tree',x:x0+20+r()*(w-40),y:cy+(r()-.5)*40,r:10+r()*5};if(!xs)it.push(tr)}}}
 return _city}
function mkSlot(b,x,y,ang,o){return Object.assign({x:b.x0+x,y:b.y0+y,ang,b,car:null},o||{})}
function slot(b,x,y,ang,o){const s=mkSlot(b,x,y,ang,o);b.slots.push(s);return s}
const S=Math.PI/2;
{ let b;
 b=mkB('bomba',0,0,'top',36,'Gas station');for(const y of [72,150])for(const x of [120,215])slot(b,x,y,0,{fwd:true});
 b=mkB('oficina',1,0,'top',173,'Repair shop');for(let k=0;k<5;k++)slot(b,45+k*64,152,S);b.drop=mkSlot(b,b.w-50,30,0);b.parts=mkSlot(b,70,30,0);
 b=mkB('stand',2,0,'top',173,'Dealership');for(let k=0;k<4;k++)slot(b,62+k*74,150,S);
 b=mkB('fabrica',3,0,'bottom',286,'Car factory');slot(b,70,b.h-34,0,{fwd:true});slot(b,170,b.h-34,0,{fwd:true});
 b=mkB('lavagem',0,1,'top',36,'Car wash');slot(b,180,76,0,{fwd:true});slot(b,180,156,0,{fwd:true});
 b=mkB('pista',1,1,null,0,'Race track');
 b=mkB('pecas',2,1,'top',280,'Auto parts');b.vanHome=slot(b,286,150,S);
 b=mkB('pneus',3,1,'top',173,'Tire shop');for(let k=0;k<3;k++)slot(b,73+k*100,150,S);
 b=mkB('reboques',0,2,'top',173,'24h Towing');for(let k=0;k<3;k++)slot(b,73+k*100,145,S);
 b=mkB('inspecao',1,2,'top',36,'Inspection center');slot(b,200,80,0,{fwd:true});slot(b,200,158,0,{fwd:true});
 b=mkB('parque',2,2,'top',173,'Parking lot');for(const y of [74,166])for(let k=0;k<5;k++)slot(b,50+k*62,y,S);
 b=mkB('sucata',3,2,'top',90,'Junkyard');slot(b,90,140,S);b.pile=6;
 // the new district (row 4): leisure, the city newspaper and the next big updates
 b=mkB('park',0,3,null,0,'Motoropolis Park');
 b=mkB('news',1,3,'top',60,'Motoropolis Daily');
 b=mkB('police',2,3,'top',70,'Police station');slot(b,42,118,S);slot(b,98,118,S);
 b=mkB('court',3,3,'top',173,'Courthouse');
 // row 5: the supermarket and its parking lot (open from day one)
 b=mkB('market',1,4,'top',250,'Supermarket');for(let k=0;k<8;k++)slot(b,40+k*40,42,S);
}
const approach=s=>({x:s.x-Math.cos(s.ang)*36,y:s.y-Math.sin(s.ang)*36});
// the news kiosk stands on the plaza in front of the Motoropolis Daily building
const inKiosk=(x,y,m=6)=>{const b=B.news;return x>=b.x0-m&&x<=b.x1+m&&y>=b.y0-m&&y<=b.y1+m};

