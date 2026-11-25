//@ view3d/shadowfit.js - shadows near the camera (performance): close up, the sun's shadow box shrinks to the area around
//@ the camera target (sharper shadows, and casters outside it are culled from the shadow pass); from far away it is the
//@ original whole-city box. inside make3D(T,X). The recorder page and ?eager keep the original fixed box.
 const SF={k:'',cx:CX,cz:CZ,S0:sun.shadow.camera.right,H0:sun.shadow.camera.top,off:sun.position.clone().sub(sun.target.position)};
 function fitShadow(){if(LAZY_EAGER||!WORLD)return;const k=clamp((cam.dist-250)/150,0,1),S=(1-k)*clamp(cam.dist*.55,45,SF.S0)+k*SF.S0,H=S*SF.H0/SF.S0;
  const tex=2*S/sun.shadow.mapSize.x;let x=(1-k)*cam.tx+k*SF.cx,z=(1-k)*cam.tz+k*SF.cz;x=Math.round(x/tex)*tex;z=Math.round(z/tex)*tex;
  const key=x.toFixed(2)+','+z.toFixed(2)+','+S.toFixed(1);if(key===SF.k)return;SF.k=key;
  const c=sun.shadow.camera;c.left=-S;c.right=S;c.top=H;c.bottom=-H;c.updateProjectionMatrix();sun.target.position.set(x,0,z);sun.position.set(x,0,z).add(SF.off);sun.target.updateMatrixWorld();sun.updateMatrixWorld();renderer.shadowMap.needsUpdate=true}
