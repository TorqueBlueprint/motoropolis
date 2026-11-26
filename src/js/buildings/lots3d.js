//@ buildings/lots3d.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // lots (sidewalk + pad) and buildings. Everything of a lot is built in the lot's own axes (LOT[k].x0.., slot ux/uy) and
 // lotWrap() turns it round the lot centre to follow the road (b.rot); lotP3() maps one lot-axes point (3D units) to the city.
 function lotWrap(b,o){if(!b||!b.rot){scene.add(o);return o}const w=new T.Group(),i=new T.Group();w.position.set(U(b.cx),0,U(b.cy));w.rotation.y=-b.rot;i.position.set(-U(b.cx),0,-U(b.cy));i.add(o);w.add(i);w.userData.lotOf=b.type;scene.add(w);return w}
 function lotP3(b,x,z){const p=lotPt(b,x*10,z*10);return[U(p.x),U(p.y)]}
 const LOT={};for(const b of buildings){const x0=U(b.x0),z0=U(b.y0),w=U(b.w),d=U(b.h);LOT[b.type]={b,x0,z0,w,d,cx:x0+w/2,cz:z0+d/2,rot:b.rot};
  if(X){const rr=(w2,d2,r,h,m,y)=>{const sh=new T.Shape();const x=-w2/2,z=-d2/2;sh.moveTo(x+r,z);sh.lineTo(x+w2-r,z);sh.quadraticCurveTo(x+w2,z,x+w2,z+r);sh.lineTo(x+w2,z+d2-r);sh.quadraticCurveTo(x+w2,z+d2,x+w2-r,z+d2);sh.lineTo(x+r,z+d2);sh.quadraticCurveTo(x,z+d2,x,z+d2-r);sh.lineTo(x,z+r);sh.quadraticCurveTo(x,z,x+r,z);const gg=new T.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false,curveSegments:10});gg.rotateX(Math.PI/2);gg.translate(0,h+y,0);const mm=new T.Mesh(gg,m);mm.position.set(x0+w/2,0,z0+d/2);mm.rotation.y=-b.rot;mm.receiveShadow=true;return mm};scene.add(rr(w+2.4,d+2.4,2.6,.25,mat.curb,0));scene.add(rr(w,d,1.4,.3,mat.pad,0))}
  else{const c1=box(w+2.4,.25,d+2.4,mat.curb,x0+w/2,0,z0+d/2,false),c2=box(w,.3,d,mat.pad,x0+w/2,0,z0+d/2,false);c1.rotation.y=c2.rotation.y=-b.rot;scene.add(c1);scene.add(c2)}}
 const Y0=.3;
