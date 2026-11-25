//@ world/city2_terrain.js - phase 1 terrain: the river reaches the sea on the west coast (beach, pier, sailing boats),
//@ gentle hills on the horizon. The river, its bridges, the marina and the central park were already there.
//@ inside the if(WORLD){ block of world/world3d.js. Off with ?city=1.
  if(CITY2){const C2=W3.c2,r2=C2.rnd,g=new T.Group();root.add(g);
   // sea and beach beyond the river mouth
   const sea=new T.Mesh(new T.PlaneGeometry(420,2000),mt.water);sea.rotation.x=-Math.PI/2;sea.position.set(-1010,.15,100);sea.receiveShadow=true;g.add(sea);
   const beach=new T.Mesh(new T.PlaneGeometry(46,2000),mt.sand);beach.rotation.x=-Math.PI/2;beach.position.set(-785,.06,100);beach.receiveShadow=true;g.add(beach);
   C2.clearRect(-820,-900,-700,1100);
   // coastal marina: a pier with moored sailing boats and a lighthouse
   {const px=-860,pz=-230;B0(g,60,.5,4,mat.wood,px-12,.3,pz,false);for(let q=0;q<5;q++)B0(g,3,.4,12,mat.wood,px-30+q*9,.3,pz+8,false);
    for(let q=0;q<5;q++)for(const s of[-1,1]){const b=new T.Group();b.position.set(px-30+q*9+s*3.2,.2,pz+10);B0(b,1.6,.8,5,mt.white,0,0,0);const m=new T.Mesh(new T.CylinderGeometry(.06,.06,7,5),mat.grey);m.position.y=4;b.add(m);
     const sl=new T.Mesh(new T.PlaneGeometry(2.4,5.5),M(0xf4f4f0,{side:T.DoubleSide}));sl.position.set(0,4.4,-.9);sl.rotation.y=Math.PI/2;b.add(sl);g.add(b)}
    const lh=new T.Group();lh.position.set(px+24,0,pz-6);for(let q=0;q<4;q++){const c=new T.Mesh(new T.CylinderGeometry(1.6-q*.18,1.75-q*.18,4,14),q%2?mt.white:mt.red);c.position.y=2+q*4;c.castShadow=true;lh.add(c)}
    const top=new T.Mesh(new T.CylinderGeometry(1,1,1.6,10),mat.lamp);top.position.y=16.8;lh.add(top);const cap=new T.Mesh(new T.ConeGeometry(1.3,1.5,10),mt.red);cap.position.y=18.3;lh.add(cap);g.add(lh);
    W3.labels.push({t:'COAST · MARINA',x:px,z:pz+30,y:10})}
   // gentle hills on the horizon (clear of the roads, fields and districts)
   const HILL=[[-560,-560,190,.14],[980,300,230,.13],[180,780,230,.12],[-620,640,210,.15],[640,-640,200,.13],[1050,-260,170,.16]];
   const hg=new T.SphereGeometry(1,40,14,0,Math.PI*2,0,Math.PI/2);
   for(const[x,z,r,k]of HILL){const h=new T.Mesh(hg,mat.grass2);h.scale.set(r,r*k,r);h.position.set(x,-.3,z);h.receiveShadow=true;g.add(h);C2.clearRect(x-r*.8,z-r*.8,x+r*.8,z+r*.8)}
   warp(g)}
