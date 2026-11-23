//@ interiors/_transitions.js - enterIn / exitIn / fade between city and interiors
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 function enterIn(type){if(mode==='in'||fadeTo)return;cur=INTS[type]||INTS.oficina;if(!cur.isBuilt())cur.build();fadeTo='in';fade=0;onMode&&onMode('in')}
 function exitIn(){if(mode!=='in'||fadeTo)return;fadeTo='city';fade=0;onMode&&onMode('city')}
 let onMode=null;
 function stepFade(dt){if(!fadeTo)return;fade+=dt/.35;if(fade>=1&&mode!==fadeTo){if(fadeTo==='in'){cityCam={...cam};Object.assign(cam,cur.home);camera.fov=40;camera.updateProjectionMatrix()}else{Object.assign(cam,cityCam||home);camera.fov=34;camera.updateProjectionMatrix()}mode=fadeTo}if(fade>=2){fadeTo=null;fade=0}}
