//@ buildings/construction.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // phase 1 (city-v2): scaffolding round the frame, a tower crane that slews and lifts, workers in hard hats
 const CON_ANIM=[];
 function conSite(g,L,fx,fz,fw,fd,hgt,progress){const P=[],PK=[],H=Math.max(2,hgt+1);
  for(const[x0,z0,x1,z1]of[[fx-fw/2-.9,fz-fd/2-.9,fx+fw/2+.9,fz-fd/2-.9],[fx-fw/2-.9,fz+fd/2+.9,fx+fw/2+.9,fz+fd/2+.9],[fx-fw/2-.9,fz-fd/2-.9,fx-fw/2-.9,fz+fd/2+.9],[fx+fw/2+.9,fz-fd/2-.9,fx+fw/2+.9,fz+fd/2+.9]]){
   const len=Math.hypot(x1-x0,z1-z0),n=Math.max(2,Math.round(len/2.2)),hz=z0===z1;
   for(let k=0;k<=n;k++){const x=x0+(x1-x0)*k/n,z=z0+(z1-z0)*k/n;P.push([x,Y0+H/2,z,0,0,0,1]);}
   for(let y=1.8;y<H;y+=1.8)PK.push([(x0+x1)/2,Y0+y,(z0+z1)/2,0,hz?0:Math.PI/2,0,1])}
  const pm=new T.InstancedMesh(BOX,mat.steel,P.length),o=new T.Object3D();P.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(0,0,0);o.scale.set(.1,H,.1);o.updateMatrix();pm.setMatrixAt(i,o.matrix)});pm.castShadow=true;g.add(pm);
  const kl=Math.max(fw,fd)+1.8,km=new T.InstancedMesh(BOX,mat.wood,PK.length);PK.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(0,p[4],0);const along=p[4]?fd+1.8:fw+1.8;o.scale.set(along,.08,.7);o.updateMatrix();km.setMatrixAt(i,o.matrix)});km.castShadow=true;g.add(km);
  // tower crane: mast, slewing jib with counterweight, trolley and hook going up and down
  const cx=L.x0+4,cz=L.z1-5,mh=16;g.add(box(1,mh,1,mat.yellow,cx,Y0,cz));const jib=new T.Group();jib.position.set(cx,Y0+mh,cz);g.add(jib);
  jib.add(box(18,.5,.6,mat.yellow,6,0,0));jib.add(box(6,.5,.6,mat.yellow,-4,0,0));jib.add(box(2,1.4,1.4,mat.dark,-6.5,-.9,0));jib.add(box(1.4,1.6,1.4,mat.yellow,0,.5,0));
  const cab=box(.9,1,1,mat.carGlass,.9,-1.1,0,false);jib.add(cab);const trolley=box(.8,.3,.8,mat.dark,8,-.3,0,false);jib.add(trolley);
  const cable=new T.Mesh(BOX,mat.dark);cable.scale.set(.04,1,.04);jib.add(cable);const hook=box(.5,.5,.5,mat.orange,8,-4,0);jib.add(hook);
  // workers
  const W=[0,1,2].map(k=>{const m=personMesh(['#ff7a1a','#e8b931','#2f6fd9'][k],['#f1c7a5','#a8714f','#d9a27e'][k],'#2b1d14');const hat=new T.Mesh(new T.SphereGeometry(.2,10,6,0,Math.PI*2,0,Math.PI/2),M(0xf2b81d));hat.position.y=1.72;m.add(hat);m.position.set(fx,Y0,fz+fd/2+2);g.add(m);return m});
  const ph0=fx*.37;CON_ANIM.push({g,f:t=>{const a=Math.sin(t*.25+ph0)*1.6;jib.rotation.y=a;const tx=4+((t*.7)%10),hy=-2-2.5*(1+Math.sin(t*.9));trolley.position.x=tx;hook.position.set(tx,hy-.5,0);cable.position.set(tx,hy/2,0);cable.scale.y=Math.max(.1,-hy);
   W.forEach((m,k)=>{const u=t*.35+k*2.1,ax=fx+Math.sin(u)*fw*.5,az=fz+fd/2+1.6+(k-1)*.7;const px=m.position.x;m.position.set(ax,Y0,az);m.rotation.y=Math.cos(u)>0?Math.PI/2:-Math.PI/2;if(m.userData.legs){const sw=Math.sin(t*6+k)*.5;m.userData.legs[0].rotation.x=sw;m.userData.legs[1].rotation.x=-sw}else walkPose(m,t*3+k,true)})}})}
 function conTick(t){for(let i=CON_ANIM.length-1;i>=0;i--){const c=CON_ANIM[i];if(!c.g.parent){CON_ANIM.splice(i,1);continue}c.f(t)}}
 function construction(L,label,n,progress,isNext,opening){const g=new T.Group();g.add(box(L.w-.6,.08,L.d-.6,mat.dirt,L.cx,Y0,L.cz,false));
  for(let k=0;k<16;k++){const hz=k<8,len=hz?(L.w-2)/4:(L.d-2)/4,idx=k%4,side=(k>>2)&1;const x=hz?L.x0+1+len*(idx+.5):(side?L.x1-.6:L.x0+.6),z=hz?(side?L.z1-.6:L.z0+.6):L.z0+1+len*(idx+.5);
   g.add(box(hz?len*.92:.18,1.1,hz?.18:len*.92,idx%2?mat.yellow:mat.dark,x,Y0,z))}
  const fw=L.w*.55,fd=L.d*.5,fx=L.cx-L.w*.12,fz=L.cz-1.5;g.add(box(fw,.45,fd,M(0xb9b4aa),fx,Y0,fz,false));
  const hgt=Math.max(.6,progress*9);for(let a=0;a<4;a++)for(let c=0;c<3;c++)g.add(box(.42,hgt,.42,mat.frame,fx-fw/2+.6+a*(fw-1.2)/3,Y0+.45,fz-fd/2+.6+c*(fd-1.2)/2));
  if(progress>.45)for(let c=0;c<3;c++)g.add(box(fw-.8,.32,.32,mat.frame,fx,Y0+.45+hgt-.35,fz-fd/2+.6+c*(fd-1.2)/2));
  for(let k=0;k<6;k++){const pp=new T.Mesh(new T.CylinderGeometry(.22,.22,5.5,10),mat.steel);pp.rotation.z=Math.PI/2;pp.position.set(L.x1-6,Y0+.3+(k%3)*.45,L.z1-8+Math.floor(k/3)*.45);pp.castShadow=true;g.add(pp)}
  if(isNext){const ex=new T.Group();ex.add(box(3,1.1,4,mat.yellow,0,.2,0));ex.add(box(2.2,1.5,2,mat.yellow,0,1.3,.6));ex.add(box(.5,.5,5,mat.yellow,0,2.6,-2.5));ex.add(box(1.2,1,1,mat.dark,0,1.6,-5));ex.position.set(fx+fw/2+3,Y0,fz+2);ex.rotation.y=.6;g.add(ex)}
  for(let k=0;k<5;k++){const cn=new T.Mesh(new T.ConeGeometry(.32,.85,10),mat.orange);cn.position.set(L.x0+4+k*((L.w-8)/4),Y0+.43,L.z1-2.4);cn.castShadow=true;g.add(cn)}
  g.add(box(.6,11,.6,mat.yellow,L.x1-5,Y0,L.z0+4.5));g.add(box(16,.45,.45,mat.yellow,L.x1-10,Y0+11,L.z0+4.5));
  const left=Math.max(0,n-(subs||0));g.add(panel(opening?[['UNLOCKED · NOW BUILDING',46,'#1d0f02'],[label.toUpperCase(),104,'#1d0f02'],['OPENING SOON',58,'#ffffff']]:[['NEXT UP · UNDER CONSTRUCTION',46,'#1d0f02'],[label.toUpperCase(),104,'#1d0f02'],[`${left.toLocaleString('en-US')} MORE SUBSCRIBER${left===1?'':'S'} TO OPEN`,58,'#ffffff']],'#ff7a1a',13,5.2,L.cx,Y0+3.6,L.z0+2.2,0));
  if(CITY2)conSite(g,L,fx,fz,fw,fd,hgt,progress);
  g.add(box(.25,1.2,.25,mat.dark,L.cx-5,Y0,L.z0+2.2));g.add(box(.25,1.2,.25,mat.dark,L.cx+5,Y0,L.z0+2.2));return g}
 let bpTex=null;const EDGES=new T.EdgesGeometry(BOX);
 const ghostMat=new T.MeshBasicMaterial({color:0xbfe3ff,transparent:true,opacity:.16,depthWrite:false});const edgeMat=new T.LineBasicMaterial({color:0xe6f3ff,transparent:true,opacity:.55});
 function panelTex(lines,bg,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=6;x.strokeRect(10,10,w-20,h-20);
  x.textAlign='center';x.textBaseline='middle';let y=0;const tot=lines.reduce((a,l)=>a+l[1]*1.12,0);y=h/2-tot/2;
  for(const[t,sz,col,fam]of lines){let f=sz;x.font=`800 ${f}px ${fam||"'Barlow Condensed','Arial Narrow',sans-serif"}`;while(x.measureText(t).width>w-60&&f>12){f-=2;x.font=`800 ${f}px ${fam||"'Barlow Condensed','Arial Narrow',sans-serif"}`}x.fillStyle=col;x.fillText(t,w/2,y+sz*.56);y+=sz*1.12}
  const tt=new T.CanvasTexture(c);tt.colorSpace=T.SRGBColorSpace;tt.anisotropy=8;return tt}
 function panel(lines,bg,w,h,x,y,z,tilt){const tex=panelTex(lines,bg,1024,Math.round(1024*h/w));const sm=new T.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:0xffffff,emissiveIntensity:0,roughness:.6});signMats.push(sm);
  const g=new T.Group();g.position.set(x,y,z);g.rotation.x=-(tilt||0);const back=new T.Mesh(BOX,mat.dark);back.scale.set(w+.3,h+.3,.25);back.castShadow=true;g.add(back);const pg=new T.PlaneGeometry(w,h);const m=new T.Mesh(pg,sm);m.position.z=.14;g.add(m);const m2=new T.Mesh(pg,sm);m2.position.z=-.14;m2.rotation.y=Math.PI;g.add(m2);return g}
 function blueprint(m,L){
  if(!bpTex){const c=document.createElement('canvas');c.width=692;c.height=432;const x=c.getContext('2d');x.fillStyle='#1d5aa8';x.fillRect(0,0,692,432);
   for(let k=0;k<692;k+=20){x.fillStyle=k%100?'rgba(255,255,255,.1)':'rgba(255,255,255,.22)';x.fillRect(k,0,1.5,432)}for(let k=0;k<432;k+=20){x.fillStyle=k%100?'rgba(255,255,255,.1)':'rgba(255,255,255,.22)';x.fillRect(0,k,692,1.5)}
   x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=4;x.strokeRect(14,14,664,404);bpTex=new T.CanvasTexture(x.canvas);bpTex.colorSpace=T.SRGBColorSpace;bpTex.anisotropy=8}
  const g=new T.Group();const gp=new T.Mesh(new T.PlaneGeometry(L.w-.4,L.d-.4),new T.MeshStandardMaterial({map:bpTex,roughness:.9}));gp.rotation.x=-Math.PI/2;gp.position.set(L.cx,Y0+.02,L.cz);gp.receiveShadow=true;g.add(gp);
  const ghost=BUILD[m.type](L);ghost.traverse(o=>{if(!o.isMesh)return;if(o.material&&o.material.map&&o.material!==bpTex){const i=signMats.indexOf(o.material);if(i>=0){signMats.splice(i,1);o.material.map.dispose();o.material.dispose()}}
   o.material=ghostMat;o.castShadow=false;o.receiveShadow=false;if(o.geometry===BOX&&o.scale.x*o.scale.y*o.scale.z>1.5){const e=new T.LineSegments(EDGES,edgeMat);o.add(e)}});g.add(ghost);
  const idx=MILESTONES.indexOf(m);
  g.add(panel([[`BLUEPRINT ${String(idx).padStart(2,'0')}/${MILESTONES.length-1}`,46,'#c8defa',"'JetBrains Mono',monospace"],[m.label.toUpperCase(),104,'#ffffff'],[`OPENS AT ${m.n.toLocaleString('en-US')} SUBS`,72,'#ffb36b']],'#0f2f5c',13,5.2,L.cx,Y0+3.6,L.z0+2.2,0));
  g.add(box(.25,1.2,.25,mat.dark,L.cx-5,Y0,L.z0+2.2));g.add(box(.25,1.2,.25,mat.dark,L.cx+5,Y0,L.z0+2.2));
  return g}
 const groups={},gwrap={};let sig='';
 function disposeGroup(g){g.traverse(o=>{if(o.geometry&&o.geometry!==BOX)o.geometry.dispose();if(o.material&&o.material.map){const i=signMats.indexOf(o.material);if(i>=0)signMats.splice(i,1);o.material.map.dispose();o.material.dispose()}})}
 const CB={init:null,at:{},dur:40};
 function syncBuildings(){
  const nm=nextMilestone(),sv=subs||0;const pv=[...ALL_MS].reverse().find(m=>m.n<=sv),base=pv?pv.n:0;const prog=nm?clamp((sv-base)/Math.max(1,nm.n-base),0,1):1;
  // phase 1: a building that unlocks while the city is open is built first (40 s of construction, frame growing), then opens
  if(CITY2){if(!CB.init){CB.init=new Set(MILESTONES.filter(m=>isOpen(m.type)).map(m=>m.type))}for(const m of MILESTONES)if(isOpen(m.type)&&!CB.init.has(m.type)&&CB.at[m.type]==null)CB.at[m.type]=simTime}
  const building=t=>CITY2&&CB.at[t]!=null&&simTime-CB.at[t]<CB.dur;
  const s=MILESTONES.map(m=>isOpen(m.type)?(building(m.type)?'b'+Math.floor((simTime-CB.at[m.type])/8):1):0).join('')+'|'+(nm?nm.type:'')+'|'+sv+'|'+chan();
  if(s===sig)return;sig=s;
  for(const m of MILESTONES){const L=LOT[m.type];if(groups[m.type]){scene.remove(gwrap[m.type]||groups[m.type]);disposeGroup(groups[m.type])}
   const g=isOpen(m.type)?(building(m.type)?construction(L,m.label,m.n,.15+.85*(simTime-CB.at[m.type])/CB.dur,true,true):BUILD[m.type](L)):m===nm?construction(L,m.label,m.n,prog,true):blueprint(m,L);gwrap[m.type]=lotWrap(L.b,g);groups[m.type]=g;if(X&&isOpen(m.type))decorateRoofs(g)}
  applyNight(true);
 }
