//@ view3d/frame.js - frame()/reset(), returns the R3 object, closes make3D
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 function frame(dt){if(renderer.shadowMap.enabled){AQ.acc+=dt;AQ.n++;if(AQ.acc>=2){AQ.fps=AQ.n/AQ.acc;AQ.acc=0;AQ.n=0;const f=AQ.fps;if(f<32)AQ.shEvery=Math.min(5,AQ.shEvery+1);else if(f>52)AQ.shEvery=Math.max(2,AQ.shEvery-1)}if(++AQ.shN>=(window.__MANUAL?1:AQ.shEvery)){AQ.shN=0;renderer.shadowMap.needsUpdate=true}}
  if(WORLD&&(tfT-=dt)<=0){tfT=2;treeify()}resize();idle+=dt;stepFade(dt);if(idle>25&&!dragging)cam.yaw+=dt*(mode==='in'?.04:.025);
  if(mode==='in'){cur.sync(dt);placeCam();RENDER(cur.scene);hctx.clearRect(0,0,hud.width,hud.height);cur.labels()}
  else{syncBuildings();syncPile();syncCars(dt);syncPeople();syncParticles();syncDetails();if(WORLD&&W3.sync)W3.sync(dt);if(XMAS)XMS.sync(dt);applyNight(false);placeCam();RENDER(scene);
  hctx.clearRect(0,0,hud.width,hud.height);drawLabels();if(XMAS)XMS.labels();const keep=ctx;ctx=hctx;try{if(showHud&&!trailer)hudScaled(drawHUD);if(!trailer)hudScaled(drawCeleb)}finally{ctx=keep}}
  if(fadeTo){const a=fade<1?fade:2-fade;hctx.fillStyle=`rgba(5,9,15,${clamp(a,0,1).toFixed(3)})`;hctx.fillRect(0,0,hud.width,hud.height)}}
 function reset(){Object.assign(cam,mode==='in'?cur.home:home);idle=0}
 syncBuildings();if(X)decorateRoofs(scene);
 return{scene,frame,reset,resize,cam,renderer,camera,enterIn,exitIn,mode:()=>mode,setOnMode:f=>{onMode=f}};
}
