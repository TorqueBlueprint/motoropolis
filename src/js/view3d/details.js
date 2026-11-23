//@ view3d/details.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- dynamic bits ----------
 function syncDetails(){
  for(const t of tls){const h=lightState(t.n,'h'),v=lightState(t.n,'v');if(t.L){for(const k of['r','y','g']){t.L.h[k].visible=h===k;t.L.v[k].visible=v===k}continue}t.hh.material=h==='g'?mat.tlG:h==='y'?mat.tlY:mat.tlR;t.hv.material=v==='g'?mat.tlG:v==='y'?mat.tlY:mat.tlR}
  const ins=groups.inspecao;if(ins&&ins.userData.lamps)for(const l of ins.userData.lamps){const on=l.s.car&&l.s.car.state==='service';l.m.material=on?(Math.floor(simTime*2)%2?mat.lampOn:mat.yellow):mat.lampOff}
  const sj=groups.sucata;if(sj&&sj.userData.press){const s=B.sucata.slots[0],c=s.car;const k=c&&c.state==='service'?clamp(1-c.timer/3,0,1):0;sj.userData.press.position.y=Y0+3.2-k*1.6}
  const wa=groups.lavagem;if(wa)wa.traverse(o=>{if(o.userData.spin)o.rotation.y+=.25})}
