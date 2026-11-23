//@ view3d/resize.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- frame ----------
 let W0=0,H0=0;
 function resize(){const w=c3.clientWidth||screenEl.clientWidth,h=c3.clientHeight||screenEl.clientHeight;if(!w||!h)return;if(w===W0&&h===H0)return;W0=w;H0=h;{const hw=Math.max(400,Math.round(CH*w/h));if(hud.width!==hw||hud.height!==CH){hud.width=hw;hud.height=CH}HUDSC=hudSc(hw,CH)}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,QUAL==='low'?1:QUAL==='medium'?1.25:(w>1100?1.5:2)));renderer.setSize(w,h,false);if(composer){composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(w,h)}camera.aspect=w/h;camera.updateProjectionMatrix()}
 if(window.ResizeObserver)new ResizeObserver(()=>resize()).observe(screenEl);
