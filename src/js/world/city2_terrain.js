//@ world/city2_terrain.js - phase 1 terrain on the Phase 1B layout: the sea along the irregular west coast (the bay and the
//@ cape from city_layout.json water.coast), a beach along it, the lighthouse with a pier and sailing boats on the cape,
//@ gentle hills on the horizon. The river, its bridges and the marina are built in world/world3d.js, the hills in the map in
//@ roads/ground3d.js. inside the if(WORLD){ block of world/world3d.js. Off with ?city=1.
  if(CITY2){const C2=W3.c2,r2=C2.rnd,g=new T.Group();root.add(g);
   // the sea: the coast line closed far to the west
   {const sh2=new T.Shape(),C=CITY.L.water.coast.concat([[-3200,900],[-3200,-900]]);C.forEach((p,i)=>i?sh2.lineTo(p[0],-p[1]):sh2.moveTo(p[0],-p[1]));const sg=new T.ShapeGeometry(sh2);sg.rotateX(-Math.PI/2);
    const sea=new T.Mesh(sg,mt.water);sea.position.y=.15;sea.receiveShadow=true;sea.userData.wc=1;g.add(sea);ribbon(CITY.L.water.coast,18,.06,mt.sand,false,g)}
   // the lighthouse on the cape, with a pier and moored sailing boats
   {const[lx,lz]=F.lighthouse,px=lx-24,pz=lz+6;B0(g,60,.5,4,mat.wood,px-12,.3,pz,false);for(let q=0;q<5;q++)B0(g,3,.4,12,mat.wood,px-30+q*9,.3,pz+8,false);
    for(let q=0;q<5;q++)for(const s of[-1,1]){const b=new T.Group();b.position.set(px-30+q*9+s*3.2,.2,pz+10);B0(b,1.6,.8,5,mt.white,0,0,0);const m=new T.Mesh(new T.CylinderGeometry(.06,.06,7,5),mat.grey);m.position.y=4;b.add(m);
     const sl=new T.Mesh(new T.PlaneGeometry(2.4,5.5),M(0xf4f4f0,{side:T.DoubleSide}));sl.position.set(0,4.4,-.9);sl.rotation.y=Math.PI/2;b.add(sl);g.add(b)}
    const lh=new T.Group();lh.position.set(lx,CITY.h(lx,lz),lz);for(let q=0;q<4;q++){const c=new T.Mesh(new T.CylinderGeometry(1.6-q*.18,1.75-q*.18,4,14),q%2?mt.white:mt.red);c.position.y=2+q*4;c.castShadow=true;lh.add(c)}
    const top=new T.Mesh(new T.CylinderGeometry(1,1,1.6,10),mat.lamp);top.position.y=16.8;lh.add(top);const cap=new T.Mesh(new T.ConeGeometry(1.3,1.5,10),mt.red);cap.position.y=18.3;lh.add(cap);g.add(lh);
    W3.labels.push({t:'CAPE · LIGHTHOUSE',x:lx,z:lz-20,y:22})}
   // gentle hills on the horizon (outside the map)
   const hg=new T.SphereGeometry(1,40,14,0,Math.PI*2,0,Math.PI/2);
   for(const[x,z,r,k]of CITY.L.farHills){const h=new T.Mesh(hg,mat.grass2);h.scale.set(r,r*k,r);h.position.set(x,-.3,z);h.receiveShadow=true;g.add(h)}
   warp(g)}
