//@ world/city2_landmarks.js - phase 1 landmarks seen from far (Phase 1B places): City Hall on the Old Town square, the TV
//@ tower on the top of the hills. (The Drag Strip in the south is world/drag3d.js.) (The stadium stays a milestone: it opens at its subscriber goal.)
//@ inside the if(WORLD){ block of world/world3d.js. Off with ?city=1.
  if(CITY2){const C2=W3.c2,g=new T.Group();root.add(g);const stone=M(0xe9e4d8,{roughness:.8}),stone2=M(0xd2cbbd,{roughness:.85});
   // ---- CITY HALL: west side of the Old Town square, facing it ----
   {const[hx,hz]=F.cityhall,h=new T.Group();h.position.set(hx,0,hz);h.rotation.y=Math.atan2(F.oldtown[0]-hx,F.oldtown[1]-hz);
    B0(h,24,1.2,18,stone2,0,0,0);for(let s=0;s<3;s++)B0(h,10,.4,1.2,stone2,0,1.2-s*.4,9.6+s*1.1,false);
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
   // (the Drag Strip is built by world/drag3d.js: locked until 1,000 subscribers)
   warp(g)}
