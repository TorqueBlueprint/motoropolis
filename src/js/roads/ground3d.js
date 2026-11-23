//@ roads/ground3d.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ground & roads
 {const gr=new T.Mesh(new T.PlaneGeometry(WORLD?2400:700,WORLD?1800:500),mat.grass);gr.rotation.x=-Math.PI/2;gr.position.set(CX,-.02,CZ);gr.receiveShadow=true;scene.add(gr);
  const rx0=XS3[0]-H3,rx1=XS3[NX-1]+H3,rz0=YS3[0]-H3,rz1=YS3[NY-1]+H3;
  for(const z of YS3){const r=new T.Mesh(new T.PlaneGeometry(rx1-rx0,H3*2),mat.asphalt);r.rotation.x=-Math.PI/2;r.position.set(CX,.01,z);r.receiveShadow=true;scene.add(r)}
  for(const x of XS3){if(XS3.indexOf(x)===CANAL_I)continue;const r=new T.Mesh(new T.PlaneGeometry(H3*2,rz1-rz0),mat.asphalt);r.rotation.x=-Math.PI/2;r.position.set(x,.012,(rz0+rz1)/2);r.receiveShadow=true;scene.add(r)}
  const dash=[],dashV=[],cw=[];
  for(const z of YS3)for(let i=0;i<NX-1;i++)for(let x=XS3[i]+H3+1.5;x<XS3[i+1]-H3-1;x+=3)dash.push([x,.03,z]);
  for(const x of XS3)if(XS3.indexOf(x)!==CANAL_I)for(let j=0;j<NY-1;j++)for(let z=YS3[j]+H3+1.5;z<YS3[j+1]-H3-1;z+=3)dashV.push([x,.03,z]);
  for(const x of XS3)for(const z of YS3)for(const[dx,dz,hz]of[[H3+.9,0,0],[-H3-.9,0,0],[0,H3+.9,1],[0,-H3-.9,1]])for(let k=-2.2;k<=2.2;k+=.75)if(!(XS3.indexOf(x)===CANAL_I))cw.push([x+dx+(hz?k:0),.031,z+dz+(hz?0:k),0,hz?Math.PI/2:0,0]);
  inst(new T.PlaneGeometry(1.4,.18).rotateX(-Math.PI/2),mat.dash,dash);inst(new T.PlaneGeometry(.18,1.4).rotateX(-Math.PI/2),mat.dash,dashV);inst(new T.PlaneGeometry(1.2,.42).rotateX(-Math.PI/2),mat.dash,cw)}
