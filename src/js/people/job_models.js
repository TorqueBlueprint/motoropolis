//@ people/job_models.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // job outfits made in Tripo (Mixamo rig): loaded on demand, arms lowered from the T-pose, walk with the same walkPose as everyone else
 const JOB_GLB=@@JSON:jobs/job_models.json@@,CIV_GLB=['p_young_man_civil','p_young_woman_civil'],JOBP={};
 const jobScene=f=>JOBP[f]||(JOBP[f]=X.ready1.then(()=>X.ld.loadAsync(ASSET_BASE+'assets/people/'+f+'.glb')).then(g=>{g.scene.userData.clip=g.animations[0]||null;return g.scene}));

