//@ world/city2_landmarks.js - phase 1 landmarks seen from far (Phase 1B places): City Hall on the Old Town square, the TV
//@ tower on the top of the hills, the Motoropolis Dragway beside the industrial zone in the south. (The stadium stays a milestone: it opens at its subscriber goal.)
//@ inside the if(WORLD){ block of world/world3d.js. Off with ?city=1.
  if(CITY2){const C2=W3.c2,g=new T.Group();root.add(g);const stone=M(0xe9e4d8,{roughness:.8}),stone2=M(0xd2cbbd,{roughness:.85});
   // ---- CITY HALL: west side of the Old Town square, facing it ----
   {const[hx,hz]=F.cityhall,h=new T.Group();h.position.set(hx,0,hz);h.rotation.y=Math.atan2(F.oldtown[0]-hx,F.oldtown[1]-hz);
    B0(h,24,1.2,18,stone2,0,0,0);for(let s=0;s<3;s++)B0(h,10,.9-s*.3,1,stone2,0,0,9.5+s,false); // three 0.3 m steps down from the 1.2 m plinth
    B0(h,22,11,14,stone,0,1.2,-1);B0(h,22.8,1,14.8,stone2,0,12.2,-1);
    const WN=[];for(let f=0;f<2;f++)for(let q=-4;q<=4;q++)if(Math.abs(q)>1)WN.push({x:q*2.3,y:3+f*4.4,z:6.05,sx:1.2,sy:2.6,sz:.1});instG(h,sh(W3.bodyG),mat.win,WN,null,false);
    const col=new T.CylinderGeometry(.45,.5,9.6,12);for(let q=-3;q<=3;q++){const c=new T.Mesh(col,stone);c.position.set(q*1.6,6.0,7.6);c.castShadow=true;h.add(c)}
    B0(h,12,1.1,3.4,stone2,0,10.8,7.4);const ped=new T.Mesh(W3.c2gable,stone);ped.scale.set(12.2,3,3.4);ped.position.set(0,11.9,7.4);ped.castShadow=true;h.add(ped);
    const dr=new T.Mesh(new T.CylinderGeometry(4.6,4.6,4,24),stone);dr.position.set(0,15.2,-1);dr.castShadow=true;h.add(dr);
    const dm=new T.Mesh(new T.SphereGeometry(4.8,24,12,0,Math.PI*2,0,Math.PI/2),M(0x4f8a7a,{roughness:.4,metalness:.5}));dm.position.set(0,17.2,-1);dm.castShadow=true;h.add(dm);
    const fp=new T.Mesh(new T.CylinderGeometry(.08,.08,5,6),mat.grey);fp.position.set(0,24.4,-1);h.add(fp);const fl=new T.Mesh(new T.PlaneGeometry(2.2,1.3),M(0x2f6fd9,{side:T.DoubleSide}));fl.position.set(1.15,26.2,-1);h.add(fl);
    h.add(sign('CITY HALL',9,1.3,'#3a2f22','#f2d27a',0,9.6,9.25,0));C2.town.add(h);W3.labels.push({t:'CITY HALL',x:hx,z:hz,y:30})}
   // ---- TV TOWER: north of the residential district ----
   {const[x,z]=F.tvtower,t=new T.Group();t.position.set(x,CITY.h(x,z),z);C2.clearRect(x-16,z-16,x+16,z+16);const cc=M(0xd8dde3,{roughness:.6});
    const shaft=new T.Mesh(new T.CylinderGeometry(1.5,3,96,16),cc);shaft.position.y=48;shaft.castShadow=true;t.add(shaft);
    const base=new T.Mesh(new T.CylinderGeometry(7,8,4,16),cc);base.position.y=2;t.add(base);
    const pod=new T.Mesh(new T.CylinderGeometry(6,4.5,6,24),M(0x9fb4c8,{roughness:.3,metalness:.4}));pod.position.y=86;pod.castShadow=true;t.add(pod);
    const ring=new T.Mesh(new T.CylinderGeometry(6.2,6.2,1.6,24),mat.win);ring.position.y=86.6;t.add(ring);
    const disc=new T.Mesh(new T.CylinderGeometry(7,6,1,24),cc);disc.position.y=90;t.add(disc);
    const ant=new T.Mesh(new T.CylinderGeometry(.35,.6,34,8),M(0xd93a2f));ant.position.y=107;t.add(ant);
    const bc=new T.Mesh(new T.SphereGeometry(.9,10,8),M(0xff3b30,{emissive:0xff3b30,emissiveIntensity:2}));bc.position.y=124.5;t.add(bc);
    bc.userData.nm=1;W3.anim.push(tt=>{bc.visible=Math.floor(tt*1.2)%2===0});g.add(t);W3.labels.push({t:'TV TOWER',x,z,y:130+CITY.h(x,z)})}
   // ---- MOTOROPOLIS DRAGWAY: a quarter-mile strip east of the highway ----
   {const[x0,z,x1]=F.dragway,L=x1-x0;C2.clearRect(x0-10,z-40,x1+10,z+24);const d=new T.Group();
    const strip=new T.Mesh(new T.PlaneGeometry(L,14),mat.asphalt);strip.rotation.x=-Math.PI/2;strip.position.set((x0+x1)/2,.04,z);strip.receiveShadow=true;d.add(strip);
    B0(d,L,.03,.3,mt.white,(x0+x1)/2,.05,z,false);for(const s of[-1,1])B0(d,L,.03,.3,M(0xe8b931),(x0+x1)/2,.05,z+s*6.6,false);
    B0(d,.8,.03,14,mt.white,x0+18,.05,z,false);B0(d,.8,.03,14,mt.white,x0+18+402/2.5,.05,z,false);
    for(const s of[-1,1])B0(d,L,.9,.5,mt.stone,(x0+x1)/2,0,z+s*7.6);
    // start lights ("tree") and the timing tower
    const tr=new T.Group();tr.position.set(x0+16,0,z);const pole=new T.Mesh(new T.CylinderGeometry(.15,.15,4,6),mat.dark);pole.position.y=2;tr.add(pole);
    const lamps=[];for(let q=0;q<5;q++){const c=q<3?0xffb000:q===3?0x38e07b:0xff3b30;const m=new T.Mesh(new T.SphereGeometry(.22,10,8),M(c,{emissive:c,emissiveIntensity:0}));m.position.set(0,2.4+q*.4,0);tr.add(m);lamps.push(m)}d.add(tr);
    bld(d,8,14,8,TM[1],mat.roof,x0+24,z-16);d.add(sign('DRAGWAY',7,1.4,'#22252b','#ff7a1a',x0+24,12,z-11.9,0));
    // grandstand along the north side
    for(let s=0;s<5;s++)B0(d,120,1,2,s%2?M(0xd93a2f):M(0x2f6fd9),x0+80,s,z-12-s*2);B0(d,124,.4,12,mat.roofD,x0+80,7.5,z-16,false);
    d.add(sign('MOTOROPOLIS DRAGWAY',28,3.4,'#ff7a1a','#1d0f02',x0+80,11,z-10,0));
    // two dragsters race down the strip every 20 s
    const dc=[0xd93a2f,0x2f6fd9].map((c,k)=>{const car=new T.Group();B0(car,1.6,.5,5.6,M(c,{roughness:.35,metalness:.3}),0,.2,0);B0(car,1.2,.6,1.4,mat.carGlass,0,.6,-.4,false);B0(car,2.2,.12,.6,mat.dark,0,1.4,-2.6,false);car.position.set(x0+14,0,z+(k?3.3:-3.3));car.rotation.y=Math.PI/2;d.add(car);return car});
    W3.anim.push(tt=>{const ph=tt%20;lamps.forEach((m,q)=>{m.material.emissiveIntensity=(q<3&&ph>q*.5&&ph<3)||(q===3&&ph>=1.5&&ph<6)?2.5:0});dc.forEach((c,k)=>{const t2=Math.max(0,ph-1.5),s=Math.min(L-30,.5*(18+k*1.5)*t2*t2);c.position.x=x0+14+s})});
    g.add(d);W3.labels.push({t:'DRAGWAY',x:(x0+x1)/2,z,y:16})}
   warp(g)}
