//@ view3d/particles.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- particles ----------
 const PMAX=500,pGeo=new T.BufferGeometry(),pPos=new Float32Array(PMAX*3),pCol=new Float32Array(PMAX*3);
 pGeo.setAttribute('position',new T.BufferAttribute(pPos,3));pGeo.setAttribute('color',new T.BufferAttribute(pCol,3));
 const pts=new T.Points(pGeo,new T.PointsMaterial({size:.55,vertexColors:true,sizeAttenuation:true,transparent:true,opacity:.95,depthWrite:false}));pts.frustumCulled=false;scene.add(pts);
 const smokeMat=new T.MeshStandardMaterial({color:0x9aa0a8,transparent:true,opacity:.5,roughness:1,depthWrite:false});const puffs=[];for(let k=0;k<40;k++){const s=new T.Mesh(new T.SphereGeometry(1,10,8),smokeMat.clone());s.visible=false;scene.add(s);puffs.push(s)}
 const tc=new T.Color();const PC={spark:'#ffb04a',bubble:'#d8f2ff',dust:'#8a7a60'};
 function syncParticles(){let n=0,sm=0;const F=B.fabrica;
  for(const p of particles){if(p.kind==='smoke'||p.kind==='dust'){if(sm>=puffs.length)continue;const s=puffs[sm++];const k=p.t/p.life;
    if(p.h0===undefined)p.h0=(p.kind==='smoke'&&p.y<F.y0+60&&p.x>F.x0)?13.2:.9;if(p.h0>5&&!isOpen('fabrica')){sm--;s.visible=false;continue}s.visible=true;s.position.set(U(p.x),p.h0+p.t*(p.h0>5?3:1.6),U(p.y));s.scale.setScalar(U(p.r)*1.3);s.material.opacity=(p.kind==='dust'?.4:.48)*(1-k);s.material.color.set(p.kind==='dust'?0xa08a66:0x9aa0a8);continue}
   if(n>=PMAX)continue;let h;if(p.kind==='confetti'){if(p.h0===undefined)p.h0=4+R()*3;h=Math.max(.35,p.h0+9*p.t-9*p.t*p.t)}else if(p.kind==='bubble')h=.6+p.t*1.2;else h=.9+p.t*2;
   pPos[n*3]=U(p.x);pPos[n*3+1]=h;pPos[n*3+2]=U(p.y);tc.set(p.col||PC[p.kind]||'#ffffff');pCol[n*3]=tc.r;pCol[n*3+1]=tc.g;pCol[n*3+2]=tc.b;n++}
  for(let k=sm;k<puffs.length;k++)puffs[k].visible=false;pGeo.setDrawRange(0,n);pGeo.attributes.position.needsUpdate=true;pGeo.attributes.color.needsUpdate=true}
