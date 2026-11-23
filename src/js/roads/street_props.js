//@ roads/street_props.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // trees, lamps, traffic lights
 {const tr=[],lf=[],lc=[];for(let k=0;k<(WORLD?0:560);k++){const x=CX+(rnd()-.5)*420,z=CZ+(rnd()-.5)*300;if(x>XS3[0]-H3-3&&x<XS3[NX-1]+H3+3&&z>YS3[0]-H3-3&&z<YS3[NY-1]+H3+3)continue;const s=.8+rnd()*.9;
   tr.push([x,.7*s,z,0,0,0,s]);lf.push([x,2.1*s,z,rnd(),rnd(),0,s]);lc.push(['#4f8a3c','#3f7a34','#5c9445','#467f38'][Math.floor(rnd()*4)])}
  inst(new T.CylinderGeometry(.18,.25,1.4,6),mat.trunk,tr,true);inst(new T.IcosahedronGeometry(1.25,0),M(0xffffff),lf,true,lc)}
 const lampPos=[];{const poles=[],heads=[];for(let i=0;i<NX-1;i++)for(const z of YS3)for(let x=XS3[i]+9;x<XS3[i+1]-5;x+=14)for(const s of[-1,1]){const px=x+(s>0?7:0);if(px>XS3[i+1]-H3-3)continue;poles.push([px,2,z+s*(H3+.8),0,0,0,1]);heads.push([px,4.05,z+s*(H3+.35)]);lampPos.push([px,3.7,z+s*(H3+.2)])}
  inst(new T.BoxGeometry(.16,4,.16),mat.dark,poles,true);inst(new T.BoxGeometry(.65,.22,.42),mat.lamp,heads,false)}
 const pls=[];for(let k=0;k<8;k++){const p=lampPos[Math.floor((k+.5)*lampPos.length/8)];const pl=new T.PointLight(0xffc77a,0,22,1.5);pl.position.set(p[0],p[1],p[2]);scene.add(pl);pls.push(pl)}
 const W3P={poles:[]};const tls=[];if(WORLD&&X&&X.tlight){const TL=X.tlight,K=.95,lens=new T.SphereGeometry(.085,10,8);W3P.poles=[];
  for(const n of nodes){if(!n.light)continue;const x=U(n.x)+H3+.5,z=U(n.y)+H3+.5;W3P.poles.push([x,z]);const heads={};
   for(const[ax,ry]of[['h',Math.PI/2],['v',0]]){const g=new T.Group();const me=new T.Mesh(TL.g,TL.m);me.castShadow=true;g.add(me);const L={};
    for(const[k,y]of[['r',3.30],['y',3.04],['g',2.80]]){const l=new T.Mesh(lens,k==='r'?mat.tlR:k==='y'?mat.tlY:mat.tlG);l.position.set(TL.hx,y,TL.front+.02);l.visible=false;g.add(l);L[k]=l}
    g.scale.setScalar(K);g.rotation.y=ry;g.position.set(x,0,z);scene.add(g);heads[ax]=L}
   tls.push({n,L:heads})}}
 else for(const n of nodes){if(!n.light)continue;const x=U(n.x)+H3+.5,z=U(n.y)+H3+.5;scene.add(box(.16,3.2,.16,mat.dark,x,0,z));
  const hh=new T.Mesh(new T.SphereGeometry(.26,10,8),mat.tlG);hh.position.set(x-.05,3.15,z-.25);scene.add(hh);const hv=new T.Mesh(new T.SphereGeometry(.26,10,8),mat.tlG);hv.position.set(x-.25,2.55,z-.05);scene.add(hv);
  scene.add(box(.5,1.6,.5,mat.black,x-.05,2.2,z-.05,false));tls.push({n,hh,hv})}
