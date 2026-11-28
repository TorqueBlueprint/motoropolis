//@ buildings/layout.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- buildings ----------
const B={},buildings=[];
function mkB(type,i,j,side,doorX,name){
 // Phase 1B: the lot comes from the city layout (CITY.lotsPx); its size and door side stay what they always were.
 // x0..y1 is the lot in its own axes (centred on the lot); rot turns it round its centre to follow the road
 const Lp=CITY.lotsPx[type],x0=Lp.x0,y0=Lp.y0,x1=x0+CITY.LW*10,y1=y0+CITY.LH*10,rot=Lp.rot||0;
 const b={type,name,i,j,x0,x1,y0,y1,w:x1-x0,h:y1-y0,side,slots:[],rot,cx:(x0+x1)/2,cy:(y0+y1)/2,cs:Math.cos(rot),sn:Math.sin(rot)};
 if(side==='top'){b.seg=Lp.seg;b.door=lotPt(b,x0+doorX,y0-8)}
 else if(side==='bottom'){b.seg=Lp.seg;b.door=lotPt(b,x0+doorX,y1+8)}
 buildings.push(b);B[type]=b;return b;
}
// a point given in the lot's own axes (x0..x1, y0..y1) -> the city (ux/uy keep the lot-axes point for the 3D builders)
function lotPt(b,x,y){const dx=x-b.cx,dy=y-b.cy;return{x:b.cx+dx*b.cs-dy*b.sn,y:b.cy+dx*b.sn+dy*b.cs,ux:x,uy:y}}
// a city point -> the lot's own axes
function lotLocal(b,x,y){const dx=x-b.cx,dy=y-b.cy;return{x:b.cx+dx*b.cs+dy*b.sn,y:b.cy-dx*b.sn+dy*b.cs}}
function inLotB(b,x,y,m){m=m||0;const p=lotLocal(b,x,y);return p.x>b.x0-m&&p.x<b.x1+m&&p.y>b.y0-m&&p.y<b.y1+m}
// the decorative city between the main buildings (Phase 1B: generated along the roads by roads/layout.js)
let _city=null;function cityFill(){if(_city)return _city;const T=CITY.TL,X=CITY.XST;_city={blocks:[{type:'towerlot',x0:(T[0]-T[2]/2)*10,y0:(T[1]-T[3]/2)*10,x1:(T[0]+T[2]/2)*10,y1:(T[1]+T[3]/2)*10}],items:CITY.fill,
 xst:XMAS?{x0:X.x0*10,y0:X.z0*10,x1:(X.x0+X.w)*10,y1:(X.z0+X.d)*10,sx:(X.x0+X.w)*10}:null};return _city}
function mkSlot(b,x,y,ang,o){const p=lotPt(b,b.x0+x,b.y0+y);return Object.assign({x:p.x,y:p.y,ux:p.ux,uy:p.uy,ang:ang+b.rot,uang:ang,b,car:null},o||{})}
function slot(b,x,y,ang,o){const s=mkSlot(b,x,y,ang,o);b.slots.push(s);return s}
const S=Math.PI/2;
{ let b;
 b=mkB('bomba',0,0,'top',36,'Gas station');for(const y of [72,150])for(const x of [120,215])slot(b,x,y,0,{fwd:true});
 b=mkB('oficina',1,0,'top',173,'Repair shop');for(let k=0;k<5;k++)slot(b,45+k*64,152,S);b.drop=mkSlot(b,b.w-50,30,0);b.parts=mkSlot(b,70,30,0);
 b=mkB('stand',2,0,'top',173,'Dealership');for(let k=0;k<4;k++)slot(b,300,24+k*28,0); // the NEW ARRIVALS bays beside the drive-in (buildings/stand_ext.js)
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
const inKiosk=(x,y,m=6)=>inLotB(B.news,x,y,m);

