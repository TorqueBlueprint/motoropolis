//@ view3d/resize.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- frame ----------
 let W0=0,H0=0;
 // the size comes from the screen box (the canvas keeps its old pixel size until we change it, so it can't be the source)
 function resize(){const w=screenEl.clientWidth||c3.clientWidth,h=screenEl.clientHeight||c3.clientHeight;if(!w||!h)return;if(w===W0&&h===H0)return;W0=w;H0=h;{const hw=Math.max(400,Math.round(CH*w/h));HUDW=hw;HUDH=CH;const pr=Math.min(window.devicePixelRatio||1,2),rw=HUD_FULL?hw:Math.min(hw,Math.round(w*pr)),rh=HUD_FULL?CH:Math.round(rw*CH/hw);HUDK=rw/hw;if(hud.width!==rw||hud.height!==rh){hud.width=rw;hud.height=rh}HUDSC=hudSc(hw,CH)}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,QUAL==='low'?1:QUAL==='medium'?1.25:(w>1100?1.5:2)));renderer.setSize(w,h,false);if(composer){composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(w,h)}camera.aspect=w/h;camera.updateProjectionMatrix()}
 if(window.ResizeObserver)new ResizeObserver(()=>resize()).observe(screenEl);window.addEventListener('resize',()=>resize());document.addEventListener('fullscreenchange',()=>resize());
