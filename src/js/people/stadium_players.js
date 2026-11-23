//@ people/stadium_players.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---- football: 22 animated Mixamo players (assets/world/player.glb) ----
 function stadPlayers(g,P0,caps,ball,OP){OP=OP||{};const HL=OP.HL||20,HW=OP.HW||12.5,PH=OP.ph||1.55,SC=HL/20;
  const go=async()=>{let n=0;while(!X.SUc&&n++<100)await new Promise(r=>setTimeout(r,200));if(!X.SUc)return;
   const gl=await X.ld.loadAsync(ASSET_BASE+'assets/world/player.glb');const CL={};gl.animations.forEach(a=>CL[a.name]=a);
   const kit=(hex)=>{const m0=[];gl.scene.traverse(o=>{if(o.isMesh)m0.push(o.material)});const m=m0[0].clone();const c=new T.Color(hex);
    m.onBeforeCompile=sh=>{sh.uniforms.kitC={value:c};sh.fragmentShader='uniform vec3 kitC;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{vec3 cc=diffuseColor.rgb;float mx=max(cc.r,max(cc.g,cc.b)),mn=min(cc.r,min(cc.g,cc.b));float w=smoothstep(.14,.04,mx-mn)*smoothstep(.22,.45,mx);diffuseColor.rgb=mix(cc,kitC*min(1.,mx*1.35),w);}')};m.customProgramCacheKey=()=>'kit'+hex;return m};
   const KITS=[kit(0xd93a2f),kit(0x2f6fd9),kit(0x111111)];
   const bb=new T.Box3().setFromObject(gl.scene);const K=PH/(bb.max.y-bb.min.y);
   // 4-4-2, x along pitch (−20..20), z across (−12.5..12.5)
   const F=[[-18.5,0],[-13,-8],[-13,-3],[-13,3],[-13,8],[-6,-8],[-6,-3],[-6,3],[-6,8],[-1.5,-3],[-1.5,3]].map(([a,b])=>[a*SC,b*HW/12.5]);
   const P=[];const ld=(team,k)=>{const o=X.SUc(gl.scene);o.scale.setScalar(K);const mat=k===0?KITS[2]:KITS[team];o.traverse(m=>{if(m.isMesh){m.material=mat;m.castShadow=true;m.frustumCulled=false}});
    const h=new T.Group();h.add(o);(OP.parent||g).add(h);const side=team?1:-1;const home=new T.Vector3(P0.x+F[k][0]*(team?-1:1),0,P0.z+F[k][1]);
    h.position.copy(home);h.rotation.y=team?-Math.PI/2:Math.PI/2;const mx=new T.AnimationMixer(o);const A={};for(const nm in CL)A[nm]=mx.clipAction(CL[nm]);
    for(const nm of['Kick_Soccerball','Soccer_Header','Soccer_Tackle','Goalkeeper_Diving_Save','Goalkeeper_Catch','Victory','Disappointed']){A[nm].setLoop(T.LoopOnce);A[nm].clampWhenFinished=true}
    const cur=k===0?'Goalkeeper_Idle':'Breathing_Idle';A[cur].play();mx.update(Math.random()*3);return{h,mx,A,cur,home,team,k,v:new T.Vector3(),busy:0}};
   for(let t=0;t<2;t++)for(let k=0;k<11;k++)P.push(ld(t,k));
   caps.forEach(c=>c.visible=false);const FB={P,ball,score:[0,0]};if(OP.onGoal)FB.onGoal=OP.onGoal;if(!OP.inside)W3.fb=FB;if(location.hostname==='localhost')window.__FB=FB;
   const play=(p,nm,fade=.25)=>{if(p.cur===nm)return;const a=p.A[nm];a.reset().play();p.A[p.cur].crossFadeTo(a,fade,false);p.cur=nm};
   const bp=new T.Vector3(P0.x,.25,P0.z),bv=new T.Vector3();let owner=null,ot=0,tq=0;const tmp=new T.Vector3();
   const step=(t,dt)=>{dt=Math.min(dt||.016,.05);
    // ball: rolls with friction, bounces inside pitch
    bp.addScaledVector(bv,dt);bv.multiplyScalar(Math.pow(.55,dt));
    if(Math.abs(bp.x-P0.x)>HL-.5){if(Math.abs(bp.z-P0.z)<3*SC){const tm=bp.x>P0.x?0:1;FB.score[tm]++;FB.onGoal&&FB.onGoal(FB.score,tm);for(const p of P){if(p.k){play(p,p.team===tm?'Victory':'Disappointed',.2);p.busy=2.4}}bp.set(P0.x,.25,P0.z);bv.set(0,0,0)}else{bv.x*=-.6;bp.x=P0.x+Math.sign(bp.x-P0.x)*(HL-.5)}}
    if(Math.abs(bp.z-P0.z)>HW-.5){bv.z*=-.6;bp.z=P0.z+Math.sign(bp.z-P0.z)*(HW-.5)}
    ball.position.copy(bp);ball.rotation.x+=bv.z*dt*2;ball.rotation.z-=bv.x*dt*2;
    // nearest player of each team chases; the rest hold shape shifted toward the ball
    const near=[null,null];for(const p of P){if(p.k===0)continue;const d=p.h.position.distanceToSquared(bp);if(!near[p.team]||d<near[p.team].d)near[p.team]={p,d}}
    for(const p of P){const side=p.team?-1:1;let tg;
     if(p.k===0){tg=tmp.set(P0.x-side*(HL-1.5),0,P0.z+T.MathUtils.clamp(bp.z-P0.z,-3,3)*.8)}
     else if(near[p.team].p===p){tg=tmp.copy(bp);tg.y=0}
     else{tg=tmp.set(p.home.x+(bp.x-P0.x)*.55,0,p.home.z+(bp.z-P0.z)*.35)}
     const d=tmp.sub(p.h.position);d.y=0;const L=d.length();const fast=near[p.team].p===p&&L>3;const sp=p.busy>0?0:(L<.4?0:Math.min(L*1.4,fast?7:3.6));
     p.v.lerp(d.normalize().multiplyScalar(sp),Math.min(1,dt*4));p.h.position.addScaledVector(p.v,dt);
     const vs=p.v.length();if(vs>.3){const ry=Math.atan2(p.v.x,p.v.z);let dr=ry-p.h.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));p.h.rotation.y+=dr*Math.min(1,dt*8)}
     if(p.busy>0){p.busy-=dt;if(p.busy<=0)play(p,p.k===0?'Goalkeeper_Idle':'Breathing_Idle',.3)}
     else if(vs>4.5){play(p,'Sprint');p.A.Sprint.timeScale=vs/6.5}else if(vs>.5){play(p,'Jog_Forward');p.A.Jog_Forward.timeScale=vs/3}else play(p,p.k===0?'Goalkeeper_Idle':'Breathing_Idle',.4);
     // kick when close to the ball
     if(p.busy<=0&&p.k>0&&p.h.position.distanceTo(bp)<.9&&t>tq){tq=t+.6;play(p,'Kick_Soccerball',.12);p.busy=.55;const gx=P0.x+(p.team?-HL:HL);const shoot=Math.abs(gx-bp.x)<12*SC;const aim=tmp.set(gx-bp.x,0,(P0.z+(Math.random()-.5)*(shoot?5*SC:HW*1.6))-bp.z);aim.normalize().multiplyScalar(shoot?16*Math.sqrt(SC):(7+Math.random()*5)*Math.sqrt(SC));bv.copy(aim)}
     if(p.k===0&&p.busy<=0&&Math.abs(bp.x-p.h.position.x)<2.5&&bv.length()>8){play(p,Math.abs(bp.z-p.h.position.z)>1.2?'Goalkeeper_Diving_Save':'Goalkeeper_Catch',.1);p.busy=1.6;bv.multiplyScalar(-.3)}
     p.mx.update(dt)}
   };if(OP.inside)OP.inside.step=step;else W3.anim.push(step)};
  go().catch(e=>console.warn('players',e))}
 function personJob(src){const g=new T.Group();const m=X.SUc(src);g.add(m);m.updateMatrixWorld(true);const B={},MAP={LeftUpLeg:'UpperLegL',RightUpLeg:'UpperLegR',LeftLeg:'LowerLegL',RightLeg:'LowerLegR',LeftArm:'UpperArmL',RightArm:'UpperArmR',LeftForeArm:'LowerArmL',RightForeArm:'LowerArmR',Spine:'Spine',Spine1:'Spine1',Neck:'Neck'};
  m.traverse(o=>{if(o.isBone){const k=o.name.match(/(LeftUpLeg|RightUpLeg|LeftLeg|RightLeg|LeftArm|RightArm|LeftForeArm|RightForeArm|Spine|Spine1|Neck)$/);if(k)B[MAP[k[1]]]=o}if(o.isMesh){o.castShadow=true;o.frustumCulled=false}});
  const a=new T.Vector3(),b=new T.Vector3(),q=new T.Quaternion(),pq=new T.Quaternion();
  for(const[k,sd]of[['UpperArmL',1],['UpperArmR',-1]]){const bn=B[k],ch=B['LowerArm'+k.slice(-1)];if(!bn||!ch)continue;bn.getWorldPosition(a);ch.getWorldPosition(b);const d=b.sub(a).normalize(),tg=new T.Vector3(.22*sd,-1,.06).normalize();
   bn.getWorldQuaternion(q);q.premultiply(new T.Quaternion().setFromUnitVectors(d,tg));bn.parent.getWorldQuaternion(pq);bn.quaternion.copy(pq.invert().multiply(q));m.updateMatrixWorld(true)}
  const bb=new T.Box3().setFromObject(m,true),h=bb.max.y-bb.min.y,sc=1.8/h;m.scale.multiplyScalar(sc);m.position.y=-bb.min.y*sc;g.updateMatrixWorld(true);
  const rig={},wq=new T.Quaternion();for(const k in B){B[k].getWorldQuaternion(wq);rig[k]={b:B[k],q0:B[k].quaternion.clone(),ax:new T.Vector3(1,0,0).applyQuaternion(wq.clone().invert()).normalize()}}
  g.userData.rig=rig;g.userData.rigS=-1;const clip=src.userData.clip;if(clip){const rest=[];m.traverse(o=>{if(o.isBone)rest.push([o,o.quaternion.clone(),o.position.clone()])});const mx=new T.AnimationMixer(m),ac=mx.clipAction(clip);ac.play();g.userData.mix=mx;g.userData.dur=clip.duration;g.userData.rest=rest}g.userData.legs=[new T.Object3D(),new T.Object3D()];return g}
