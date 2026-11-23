//@ buildings/kit3d.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 function shellB(g,w,h,d,x,z,wallM,trim){g.add(box(w,h,d,wallM,x,Y0,z));g.add(box(w+.4,.45,d+.4,mat.roof,x,Y0+h,z));
  for(const[dx,dz,ww,dd]of[[0,-d/2,w+.4,.25],[0,d/2,w+.4,.25],[-w/2,0,.25,d+.4],[w/2,0,.25,d+.4]])g.add(box(ww,.55,dd,wallM,x+dx,Y0+h+.2,z+dz,false));
  if(trim)g.add(box(w+.08,.45,d+.08,trim,x,Y0+h-1,z,false))}
 function rowWin(g,x0,x1,y,z,n,face){for(let k=0;k<n;k++){const x=x0+(x1-x0)*(k+.5)/n;g.add(box((x1-x0)/n*.58,1.05,.1,mat.win,x,y,z+face*.06,false))}}
 function hvac(g,x,y,z){g.add(box(2,.9,1.5,mat.steel,x,y,z));const f=new T.Mesh(new T.CylinderGeometry(.5,.5,.1,14),mat.dark);f.position.set(x,y+.95,z);g.add(f)}
 function bays(g,L,xs,zFront,w,h){for(const x of xs){g.add(box(w,h,.12,mat.black,L.x0+x,Y0,zFront-.02,false));for(let r=0;r<3;r++)g.add(box(w,.08,.18,mat.steel,L.x0+x,Y0+h-.35-r*.3,zFront-.04,false))}}
 function backShop(g,L,z0,label,col,fg,bayXs){const d=L.d-z0+.0,zc=L.z0+z0+(L.d-z0)/2-.2;shellB(g,L.w-1.2,5.6,L.d-z0-.6,L.cx,zc,mat.wall,mat.orange);
  const zf=L.z0+z0+.1;bays(g,L,bayXs,zf,4.4,4.1);rowWin(g,L.x0+2,L.x1-2,3.2,L.z0+L.d-.5,10,1);
  g.add(sign(label,L.w-6,1.9,col,fg,L.cx,Y0+5.1,zf-.18,Math.PI));g.add(sign(label,L.w-6,1.9,col,fg,L.cx,Y0+4.6,L.z0+L.d-.35,0));
  hvac(g,L.cx-9,Y0+6.05,zc);hvac(g,L.cx+9,Y0+6.05,zc)}
 L_ext();function L_ext(){for(const k in LOT){LOT[k].x1=LOT[k].x0+LOT[k].w;LOT[k].z1=LOT[k].z0+LOT[k].d}}
 const P=(L,lx,lz)=>[L.x0+lx,L.z0+lz];
