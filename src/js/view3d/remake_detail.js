//@ view3d/remake_detail.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 const composer=X&&/[?&]bloom/.test(location.search)?(()=>{const c=new X.EffectComposer(renderer,new T.WebGLRenderTarget(1024,1024,{samples:4,type:T.HalfFloatType}));const rp=new X.RenderPass(scene,camera);c.addPass(rp);c.addPass(new X.ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(any(isnan(c))||any(isinf(c)))c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=clamp(c,0.0,8.0);}'}));c.addPass(new X.UnrealBloomPass(new T.Vector2(512,512),.45,.45,.9));c.addPass(new X.OutputPass());c.rp=rp;return c})():null;
 // ---------- REMAKE detail: world-space textures, rooftop equipment, street dressing ----------
 function canvasTex(sz,draw){const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d');draw(x,sz);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t}
 const noise=(x,sz,base,n,a,b)=>{x.fillStyle=base;x.fillRect(0,0,sz,sz);for(let k=0;k<n;k++){x.fillStyle=Math.random()<.5?a:b;const s=1+Math.random()*2.5;x.fillRect(Math.random()*sz,Math.random()*sz,s,s)}};
 function worldMap(m,tex,scale){m.map=tex;m.color.setHex(0xffffff);m.onBeforeCompile=sh=>{sh.uniforms.wScale={value:scale};
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWPos;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWPos=(modelMatrix*vec4(transformed,1.0)).xyz;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWPos;uniform float wScale;').replace('#include <map_fragment>','vec4 sampledDiffuseColor=texture2D(map,vWPos.xz*wScale);diffuseColor*=sampledDiffuseColor;')};m.customProgramCacheKey=()=>'wm'+scale;m.needsUpdate=true}
 function decorateRoofs(root){if(!X)return;const add=[];root.traverse(o=>{if(!o.isMesh||o.userData.dec||o.material!==mat.roof)return;o.userData.dec=1;const sx=o.scale.x,sz=o.scale.z;if(sx<5||sz<4)return;
   const top=o.position.y+o.scale.y/2,n=Math.min(4,Math.floor(sx*sz/60)+1);for(let k=0;k<n;k++){const x=o.position.x+(k-(n-1)/2)*Math.min(4,sx/(n+1)),z=o.position.z+((k%2)?1:-1)*sz*.18;
    const P=o.parent;add.push([P,box(1.6,.7,1.2,mat.steel,x,top,z)]);const f=new T.Mesh(new T.CylinderGeometry(.4,.4,.08,12),mat.dark);f.position.set(x,top+.74,z);add.push([P,f])}
   if(sx>8){const v=new T.Mesh(new T.CylinderGeometry(.14,.14,1.1,8),mat.grey);v.position.set(o.position.x+sx*.36,top+.55,o.position.z-sz*.3);add.push([o.parent,v]);add.push([o.parent,box(sx*.3,.06,.06,mat.grey,o.position.x-sx*.15,top+.08,o.position.z+sz*.38,false)])}});
  for(const[p,a]of add)p.add(a)}
 if(X){
  sun.shadow.mapSize.set(QUAL==='high'?4096:QUAL==='medium'?2048:1024,QUAL==='high'?4096:QUAL==='medium'?2048:1024);
  worldMap(mat.asphalt,canvasTex(256,(x,s)=>{noise(x,s,'#34373e',5200,'#2b2e34','#41454d');x.strokeStyle='rgba(20,22,26,.6)';x.lineWidth=1;for(let k=0;k<5;k++){x.beginPath();let px=Math.random()*s,py=Math.random()*s;x.moveTo(px,py);for(let q=0;q<6;q++){px+=Math.random()*30-15;py+=Math.random()*30-15;x.lineTo(px,py)}x.stroke()}}),.06);
  const concrete=(base,a,b)=>canvasTex(256,(x,s)=>{noise(x,s,base,3800,a,b);x.strokeStyle='rgba(0,0,0,.13)';x.lineWidth=2;for(let k=0;k<=s;k+=64){x.beginPath();x.moveTo(k,0);x.lineTo(k,s);x.stroke();x.beginPath();x.moveTo(0,k);x.lineTo(s,k);x.stroke()}});
  worldMap(mat.pad,concrete('#d8d2c5','#cdc6b8','#e2ddd1'),.09);worldMap(mat.curb,concrete('#c4bdb0','#b8b1a3','#cfc9bd'),.12);
  worldMap(mat.grass,canvasTex(256,(x,s)=>{if(XMAS)noise(x,s,'#e8eef4',7000,'#dbe4ec','#f6f9fc');else noise(x,s,'#6f9c4c',7000,'#5f8c40','#82ad59')}),.03);
  worldMap(mat.roof,canvasTex(256,(x,s)=>{noise(x,s,'#5c636e',6000,'#4f5560','#6b727c');x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=2;for(let k=0;k<=s;k+=85){x.beginPath();x.moveTo(k,0);x.lineTo(k,s);x.stroke()}}),.12);
  // corner trees and street furniture on every block
  {const tr=[],lf=[],lc=[],bn=[],bins=[],hyd=[];for(const b of buildings){const x0=U(b.x0)-.6,x1=U(b.x1)+.6,z0=U(b.y0)-.6,z1=U(b.y1)+.6;
    for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]]){const s=.75+rnd()*.3;tr.push([x,.3+.7*s,z,0,0,0,s]);lf.push([x,.3+2.1*s,z,rnd(),rnd(),0,s]);lc.push(['#4f8a3c','#3f7a34','#5c9445','#467f38'][Math.floor(rnd()*4)])}
    const mx=(x0+x1)/2;bins.push([mx+3.2,.3+.45,z1,0,0,0]);hyd.push([x1,.3+.3,(z0+z1)/2+2,0,0,0]);bn.push([mx-3,.3+.25,z1,0,0,0])}
   inst(new T.CylinderGeometry(.14,.2,1.4,6),mat.trunk,tr,true);inst(new T.IcosahedronGeometry(1,0),M(0xffffff,{flatShading:true}),lf,true,lc);
   inst(new T.CylinderGeometry(.25,.22,.9,10),M(0x2b3f2f,{roughness:.5,metalness:.3}),bins,true);inst(new T.CylinderGeometry(.13,.15,.6,8),M(0xd93a2f,{roughness:.4}),hyd,true);inst(new T.BoxGeometry(1.6,.12,.45),M(0x7a5a3a),bn,true)}
 }
 function RENDER(sc){if(composer){composer.rp.scene=sc;composer.render()}else renderer.render(sc,camera)}
