//@ interiors/santa.js - Santa's workshop; continues the if(XMAS){ block opened in xmas/city.js (registers INTS.santa)
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
  // ===== inside Santa's workshop: the elves make the toys =====
  if(XSTB){const SW={built:false,home:{...STD_HOME,yaw:.2,dist:34}};
   const toyC=[0xd93a2f,0x2f6fd9,0x2e7d4f,0xffd34d,0x8e44ad,0xff7a1a];
   async function loadSW(R){const NM=['fireplace','shelf','tree','bench','wrap','belt','sack','horse','elf','desk','santa','sofa','gifts'],G={};
    await Promise.all(NM.map(async n=>{G[n]=(await X.ld.loadAsync(ASSET_BASE+'assets/world/xsw_'+n+'.glb')).scene}));
    const put=(n,dim,val,x,z,ry=0,y=0)=>{const src=G[n],bb=new T.Box3().setFromObject(src),sz=bb.getSize(new T.Vector3()),k=val/sz[dim];const o=src.clone();o.scale.setScalar(k);o.position.set(-(bb.min.x+bb.max.x)/2*k,-bb.min.y*k,-(bb.min.z+bb.max.z)/2*k);
     o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});const g=new T.Group();g.add(o);g.position.set(x,y,z);g.rotation.y=ry;R.add(g);g.userData.sz=sz.clone().multiplyScalar(k);return g};
    const split=(src,keep)=>{let mesh=null;src.traverse(o=>{if(o.isMesh&&!mesh)mesh=o});src.updateMatrixWorld(true);const g=mesh.geometry,P=g.attributes.position,I=g.index;g.computeBoundingBox();const b=g.boundingBox,sz=b.getSize(new T.Vector3());
     const A=[],B=[],v=new T.Vector3();for(let t=0;t<I.count;t+=3){v.set(0,0,0);for(let c=0;c<3;c++){const i=I.getX(t+c);v.x+=P.getX(i);v.y+=P.getY(i);v.z+=P.getZ(i)}v.divideScalar(3);const f=[(v.x-b.min.x)/sz.x,(v.y-b.min.y)/sz.y,(v.z-b.min.z)/sz.z];(keep(f)?A:B).push(I.getX(t),I.getX(t+1),I.getX(t+2))}
     const mk=ix=>{const ng=new T.BufferGeometry();for(const k in g.attributes)ng.setAttribute(k,g.attributes[k]);ng.setIndex(ix);const m=new T.Mesh(ng,mesh.material);m.matrix.copy(mesh.matrixWorld);m.matrixAutoUpdate=false;m.castShadow=true;return m};
     return{a:mk(A),b:mk(B),box:b,mw:mesh.matrixWorld.clone()}};
    // back wall: toy shelves, the tree, the fireplace and Santa's desk
    for(const x of[-16.6,-12.6,-8.6])put('shelf','y',6.2,x,-9.6);
    put('tree','y',6.4,-21.2,-7);put('fireplace','x',7.6,17.4,-9.2);{// armchair only (the set's own little desk is cut away), Santa sitting in it waving, and his new writing desk beside him
     put('sofa','x',5.6,12.2,-7,-.25);
     const sg=G.santa;const wave={};sg.traverse(o=>{if(o.isBone){const m=o.name.match(/(RightForeArm|RightHand|Head)$/);if(m){wave[m[1]]=o;wave[m[1]+'0']=o.rotation.clone()}}if(o.isMesh){o.castShadow=true;o.frustumCulled=false}});sg.updateMatrixWorld(true);
     const sb=new T.Box3().setFromObject(sg),sk=3.2/(sb.max.y-sb.min.y),sw=new T.Group();sw.add(sg);sg.scale.setScalar(sk);sg.position.set(-(sb.min.x+sb.max.x)/2*sk,-sb.min.y*sk+.15,-(sb.min.z+sb.max.z)/2*sk);sw.position.set(12.2+.08,.75,-7+1.1);sw.rotation.y=-.25;R.add(sw);
     SW.santa.visible=false;SW.santaM=sw;SW.wave=wave;put('desk','x',4.4,6.6,-7,.2)}
    // four workbenches with an elf each, a wrapping table, the toy machine, sacks and the rocking horse
    const elf=(x,z,ry,kind)=>{const e=X.SUc(G.elf);e.scale.setScalar(2.6/.68);e.traverse(m=>{if(m.isMesh){m.castShadow=true;m.frustumCulled=false}});const g=new T.Group();g.add(e);g.position.set(x,0,z);g.rotation.y=ry;g.userData.base=ry;R.add(g);
     const B={};e.traverse(o=>{if(o.isBone){const m=o.name.match(/(LeftArm|LeftForeArm|RightArm|RightForeArm|Head|Spine1)$/);if(m)B[m[1]]=o}});
     if(B.RightArm){const q=(b,x,y,z)=>{b.rotation.x+=x;b.rotation.y+=y;b.rotation.z+=z};q(B.LeftArm,1,.6,-1.6);q(B.RightArm,-.6,-.2,-1.4);q(B.LeftForeArm,0,0,.25);q(B.RightForeArm,0,0,-.25)}
     const R0={};for(const k in B)R0[k]=B[k].rotation.clone();SW.melves.push({g,B,R0,kind});SW.elves.push(g);return g};
    [[-13,-1.6],[-4,-1.6],[-13,4.4],[-4,4.4]].forEach(([x,z])=>{const b=put('bench','x',3.6,x,z,Math.PI);elf(x,z-b.userData.sz.z/2-.3,0,'hammer')});
    R.B2(4.6,1.4,2.6,M(0x9a6a3c),3.6,0,1.2);R.B2(4.8,.15,2.8,M(0x6b4423),3.6,1.4,1.2);put('wrap','x',4.2,3.6,1.2,Math.PI,1.55);elf(3.6,1.2-1.3-.3,0,'wrap');
    SW.beltG=put('belt','x',6.4,17.2,4.6,-Math.PI/2);SW.horse=put('horse','y',2.9,-20.6,3.2,.7);
    put('sack','y',2.6,21.6,8.2,-.4);put('sack','y',2.2,19.2,9,.3);put('sack','y',2,-21.8,8.8,.5);
    ambSW(R,G);SW.models=true}
   // life in the workshop: fire glow and sparks, snow outside the windows, twinkling string lights, a toy train, the rocking horse and the toy machine at work
   function ambSW(R,G){const L=SW.L={h:[],k:[],p:[]};R.S.traverse(o=>{if(o.isHemisphereLight)L.h.push([o,o.intensity]);else if(o.isDirectionalLight)L.k.push([o,o.intensity]);else if(o.isPointLight)L.p.push([o,o.intensity])});
    const fl=new T.PointLight(0xff7a1a,60,26,1.5);fl.position.set(17.4,1.4,-6.6);R.add(fl);SW.fl=fl;
    const pts=(n,col,size)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(n*3),3));const m=new T.Points(g,new T.PointsMaterial({color:col,size,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));m.frustumCulled=false;R.add(m);return{g,a:g.attributes.position,s:[...Array(n)].map(()=>[Math.random(),Math.random(),Math.random()])}};
    SW.spk=pts(36,0xffb347,.16);SW.snow=pts(160,0xffffff,.12);SW.snow.m=SW.snow.g;
    // string lights: a sagging garland under the ceiling on three walls, and one along the top of the toy shelves
    const lp=[];const run=(a,b,y,n,sag)=>{for(let i=0;i<=n;i++){const u=i/n,seg=(u*5)%1;lp.push([a[0]+(b[0]-a[0])*u,y-sag*4*seg*(1-seg),a[1]+(b[1]-a[1])*u])}};
    run([-25.3,-10.6],[25.3,-10.6],R.RH-.9,60,.7);run([-25.4,-10.4],[-25.4,10],R.RH-.9,26,.6);run([25.4,-10.4],[25.4,10],R.RH-.9,26,.6);run([-18.4,-9.05],[-6.8,-9.05],6.35,22,.25);
    const im=new T.InstancedMesh(new T.SphereGeometry(.13,8,6),new T.MeshBasicMaterial({toneMapped:false}),lp.length);const d=new T.Object3D();lp.forEach((q,i)=>{d.position.set(q[0],q[1],q[2]);d.updateMatrix();im.setMatrixAt(i,d.matrix);im.setColorAt(i,new T.Color(PAL[i%PAL.length]))});R.add(im);SW.lp={im,n:lp.length,c:new T.Color()};
    {const wire=new T.Line(new T.BufferGeometry().setFromPoints(lp.slice(0,61).map(q=>new T.Vector3(q[0],q[1]+.12,q[2]))),new T.LineBasicMaterial({color:0x1f3b26}));R.add(wire)}
    // Santa's nice list (Wall of Mechanics names) behind his desk, and a countdown calendar
    {const par=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#f3e6c6';x.fillRect(0,0,w,h);return[c,x]};const tex=c=>{const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t};
     const bg=new T.Mesh(new T.PlaneGeometry(4.4,6.5),new T.MeshStandardMaterial({color:0xf3e6c6,roughness:.95}));bg.position.set(6.6,5.1,-10.68);R.add(bg);
     const fr=new T.Mesh(new T.PlaneGeometry(4.2,6.3),new T.MeshBasicMaterial({color:0xb3261e}));fr.position.set(6.6,5.1,-10.675);R.add(fr);const in2=new T.Mesh(new T.PlaneGeometry(4.0,6.1),new T.MeshStandardMaterial({color:0xf3e6c6,roughness:.95}));in2.position.set(6.6,5.1,-10.67);R.add(in2);
     {const[c,x]=par(1024,384);x.textAlign='center';x.fillStyle='#b3261e';x.font='900 150px "Barlow Condensed",Arial';x.fillText("SANTA'S NICE LIST",512,170,980);x.fillStyle='#1f6b3a';x.font='700 70px "Barlow Condensed",Arial';x.fillText('Comment WORKSHOP to join',512,280,960);x.fillStyle='#b3261e';x.fillRect(80,320,864,8);
      const m=new T.Mesh(new T.PlaneGeometry(3.9,1.46),new T.MeshStandardMaterial({map:tex(c),roughness:.9}));m.position.set(6.6,7.42,-10.66);R.add(m)}
     {const N=WALL.slice(0,120),rows=Math.max(1,Math.ceil(N.length/2)),RP=96,[c,x]=par(1024,rows*RP);x.font='700 66px "Barlow Condensed",Arial';x.textAlign='left';
      N.forEach((n,i)=>{const cx=i<rows?30:540,cy=(i%rows)*RP+70;x.fillStyle='#2e7d4f';x.fillText('✓',cx,cy);x.fillStyle='#3a2a1c';x.fillText(n,cx+56,cy,440)});
      const t=tex(c),VIS=11;t.wrapT=T.RepeatWrapping;if(rows>VIS)t.repeat.y=VIS/rows;const m=new T.Mesh(new T.PlaneGeometry(3.9,4.4),new T.MeshStandardMaterial({map:t,roughness:.9}));m.position.set(6.6,4.4,-10.66);R.add(m);SW.list={t,rows,VIS}}
     const rod=new T.Mesh(new T.CylinderGeometry(.1,.1,4.8,10),M(0x8a5a35));rod.rotation.z=Math.PI/2;rod.position.set(6.6,8.4,-10.6);R.add(rod);const rod2=rod.clone();rod2.position.y=1.85;R.add(rod2)}
    {const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.scale(2,2);c.width=c.height=1024;x.setTransform(2,0,0,2,0,0);x.fillStyle='#fffaf0';x.fillRect(0,0,512,512);x.fillStyle='#b3261e';x.fillRect(0,0,512,120);x.fillStyle='#fff';x.textAlign='center';x.font='900 50px "Barlow Condensed",Arial';x.fillText('DAYS TO CHRISTMAS',256,80,470);
     const now=new Date();let xm=new Date(now.getFullYear(),11,25);if(now>new Date(now.getFullYear(),11,26))xm=new Date(now.getFullYear()+1,11,25);const days=Math.max(0,Math.ceil((xm-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/864e5));
     x.fillStyle=days?'#1f6b3a':'#b3261e';x.font=`900 ${days?260:110}px "Barlow Condensed",Arial`;x.fillText(days?String(days):'MERRY',256,days?380:300);if(!days)x.fillText('XMAS!',256,420);x.fillStyle='#7a5a3a';x.font='700 40px "Barlow Condensed",Arial';x.fillText('DECEMBER 25',256,478);
     const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;const m=new T.Mesh(new T.PlaneGeometry(2.6,2.6),new T.MeshStandardMaterial({map:t,roughness:.8}));m.position.set(-1.8,5,-10.66);R.add(m);const fr=R.B2(2.9,2.9,.12,M(0x6b4423),-1.8,3.55,-10.74,false)}
    // toy train circling the Christmas tree
    {const tg=new T.Group();tg.position.set(-21.2,0,-7);R.add(tg);const tr=new T.Mesh(new T.TorusGeometry(2.4,.06,6,64),M(0x6b4423));tr.rotation.x=Math.PI/2;tr.position.y=.06;tg.add(tr);
     const car=(c,eng)=>{const g=new T.Group();const b=new T.Mesh(new T.BoxGeometry(.75,.42,.42),M(c));b.position.y=.33;g.add(b);if(eng){const ch=new T.Mesh(new T.CylinderGeometry(.09,.11,.3,8),M(0x22252b));ch.position.set(.22,.68,0);g.add(ch);const cab=new T.Mesh(new T.BoxGeometry(.3,.3,.44),M(0x1f6b3a));cab.position.set(-.22,.66,0);g.add(cab)}else{const gift=new T.Mesh(new T.BoxGeometry(.32,.26,.3),M(PAL[(c>>3)%PAL.length]));gift.position.y=.67;g.add(gift)}for(const x of[-.22,.22])for(const z of[-.22,.22]){const w=new T.Mesh(new T.CylinderGeometry(.11,.11,.06,10),M(0x22252b));w.rotation.x=Math.PI/2;w.position.set(x,.12,z);g.add(w)}g.traverse(o=>{if(o.isMesh)o.castShadow=true});tg.add(g);return g};
     SW.train=[car(0xd93a2f,1),car(0x2f6fd9),car(0xffd34d),car(0x2e7d4f)]}
    // gift models (four kinds) used on the belt, in the pile and on the toy train
    const GIFT=[];if(G.gifts){G.gifts.updateMatrixWorld(true);G.gifts.traverse(o=>{if(o.isMesh&&/Gift_0[1-4]/.test(o.name)){const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);g.computeBoundingBox();const b=g.boundingBox,sz=b.getSize(new T.Vector3()),k=1/Math.max(sz.x,sz.y,sz.z);g.translate(-(b.min.x+b.max.x)/2,-b.min.y,-(b.min.z+b.max.z)/2);g.scale(k,k,k);GIFT.push({g,m:o.material})}})}
    const gift=(i,s)=>{if(!GIFT.length)return null;const q=GIFT[i%GIFT.length],m=new T.Mesh(q.g,q.m);m.scale.setScalar(s);m.castShadow=true;return m};
    // presents riding the toy machine's belt and dropping into a pile at the end
    if(SW.beltG){const bg=SW.beltG,h=bg.userData.sz.y,w=bg.userData.sz.x;SW.bp={y:h*.52,x0:w*.2,x1:-w*.48,list:[]};const pg=new T.Group();pg.rotation.y=bg.rotation.y;pg.position.copy(bg.position);R.add(pg);SW.bp.g=pg;
     for(let k=0;k<5;k++){const s=.5+(k%3)*.12,g=new T.Group();const gm=gift(k,s);if(gm){gm.rotation.y=k*.9;g.add(gm)}else{const b=new T.Mesh(new T.BoxGeometry(s,s,s),M(PAL[(k*3+1)%PAL.length]));b.position.y=s/2;g.add(b)}g.traverse(o=>{if(o.isMesh)o.castShadow=true});pg.add(g);SW.bp.list.push({g,ph:k/5,s})}
     for(let k=0;k<7;k++){const s=.55+(k%3)*.15,gm=gift(k+1,s),b=gm||new T.Mesh(new T.BoxGeometry(s,s,s),M(PAL[(k*5+2)%PAL.length]));b.position.set(-w*.5-.7-(k%3)*.5,(gm?0:s/2)+(k>3?.5:0),(k%2?.4:-.4)+(k>4?.2:0));b.rotation.y=k*.7;b.castShadow=true;pg.add(b)}}}
   function buildSanta(){const R=room({title:"SANTA'S WORKSHOP · NORTH POLE BRANCH",titleW:30,sbg:'#b3261e',trim:0x1f6b3a,wall:0x6b2a1e,wall2:0x5a2318,floor:0x8a5a35,h:12});SW.S=R.S;
    SW.fire=[];SW.toys=[];SW.belt=[];SW.elves=[];SW.melves=[];
    SW.santa=mkP(SW.S,'#c0392b',200);putP(SW.santa,{x:13.2,z:-2.6,ang:-.4},false);
    const oldFurn=()=>{
    // shelves of wrapped presents on the back wall
    for(let lv=0;lv<4;lv++){R.B2(30,.2,1.4,M(0x6b4423),-8,.8+lv*1.9,-10.1,false);for(let k=0;k<14;k++){const s=.7+((k+lv)%3)*.2;R.B2(s,s,s,M(toyC[(k+lv)%6]),-22+k*2.05,1+lv*1.9,-10.1,false);R.B2(s*1.02,.1,s*1.02,M(0xffd34d),-22+k*2.05,1+lv*1.9+s*.5,-10.1,false)}}
    // fireplace with stockings and Santa's armchair
    R.B2(6,5,1.6,M(0x8e3b2c),18,0,-10);R.B2(3.2,2.4,.4,M(0x1b1b1b),18,.3,-9.3);SW.fire=[];for(let i=0;i<3;i++){const f=new T.Mesh(new T.ConeGeometry(.45-.1*i,1.4-.3*i,8),new T.MeshBasicMaterial({color:[0xff7a1a,0xffb347,0xffe066][i],toneMapped:false}));f.position.set(17.3+i*.7,1,-9.2);R.add(f);SW.fire.push(f)}
    R.B2(6.6,.3,2,M(0x6b4423),18,5,-9.8);for(let k=0;k<4;k++){const st=R.B2(.6,1.1,.2,M([0xd93a2f,0x2e7d4f][k%2]),15.8+k*1.5,3.6,-9,false);R.B2(.65,.25,.22,M(0xf4f4f4),15.8+k*1.5,4.6,-9,false)}
    R.B2(2.6,1,2.4,M(0xb3261e),14,0,-5);R.B2(2.6,2.6,.6,M(0xb3261e),14,0,-6.1);putP(SW.santa,{x:14,z:-5.2,ang:0.25},false);SW.santa.position.y=.55;
    const list=R.B2(.7,1.1,.04,M(0xfffaf0),14.5,2.4,-4.4,false);list.rotation.x=-.5;
    // the Christmas tree
    {const tx=-21,tz=-6;for(const[r,h,y]of[[2.2,2.4,.2],[1.7,2.2,1.6],[1.1,2,2.9]]){const c=new T.Mesh(new T.ConeGeometry(r,h,9),M(0x1f6b3a,{flatShading:true}));c.position.set(tx,y+h/2,tz);c.castShadow=true;R.add(c)}const st=new T.Mesh(new T.OctahedronGeometry(.45),new T.MeshBasicMaterial({color:0xffd34d,toneMapped:false}));st.position.set(tx,5.4,tz);R.add(st);for(let i=0;i<26;i++){const u=i/26,a=i*2.3;const b=new T.Mesh(new T.SphereGeometry(.11,6,5),new T.MeshBasicMaterial({color:PAL[i%PAL.length],toneMapped:false}));b.position.set(tx+Math.cos(a)*(2-u*1.7),.5+u*4.4,tz+Math.sin(a)*(2-u*1.7));R.add(b)}}
    // two long workbenches with elves and toys
    SW.elves=[];SW.toys=[];[[-12,-1.5],[ -1,-1.5],[-12,4.5],[-1,4.5]].forEach(([bx,bz],bi)=>{R.B2(8,1.2,2.2,M(0x9a6a3c),bx,0,bz);R.B2(8.2,.15,2.4,M(0x6b4423),bx,1.2,bz);
     for(let k=0;k<3;k++){const x=bx-2.6+k*2.6,t=(bi+k)%4;if(t===0){R.B2(.9,.45,.45,M(toyC[(bi+k)%6]),x,1.35,bz);for(const dx of[-.3,.3]){const w=new T.Mesh(new T.CylinderGeometry(.15,.15,.5,10),M(0x1b1b1b));w.rotation.x=Math.PI/2;w.position.set(x+dx,1.4,bz);R.add(w)}}
      else if(t===1){const b=new T.Mesh(new T.SphereGeometry(.38,10,8),M(0x9b6b3d));b.position.set(x,1.7,bz);R.add(b);const hd=new T.Mesh(new T.SphereGeometry(.26,10,8),M(0x9b6b3d));hd.position.set(x,2.25,bz);R.add(hd);for(const dx of[-.18,.18]){const e=new T.Mesh(new T.SphereGeometry(.09,6,5),M(0x9b6b3d));e.position.set(x+dx,2.45,bz);R.add(e)}}
      else if(t===2){R.B2(.6,.6,.6,M(toyC[(bi+2*k)%6]),x,1.35,bz);R.B2(.62,.1,.62,M(0xffd34d),x,1.65,bz)}
      else{R.B2(.12,.9,.12,M(0xd62828),x,1.35,bz);const top=new T.Mesh(new T.ConeGeometry(.35,.5,10),M(toyC[(bi+k+1)%6]));top.position.set(x,1.65,bz);R.add(top);SW.toys.push(top)}
      const e=mkP(SW.S,'#2e7d4f',210+bi*3+k);e.scale.setScalar(1.15);putP(e,{x,z:bz+(bz<1?-1.6:1.6),ang:bz<1?0:Math.PI},false);e.userData.base=e.rotation.y;SW.elves.push(e)}});
    // conveyor belt of presents at the front
    R.B2(34,.9,1.4,M(0x2b3440),-4,0,9);R.B2(34,.1,1.2,M(0x1b1b1b),-4,.9,9);SW.belt=[];for(let k=0;k<12;k++){const s=.55+(k%3)*.15;const b=R.B2(s,s,s,M(toyC[k%6]),0,1,9,false);SW.belt.push(b)}
    // sacks by the door
    for(let k=0;k<3;k++){const s=new T.Mesh(new T.IcosahedronGeometry(.9,1),M(0x9b6b3d,{flatShading:true}));s.scale.y=1.2;s.position.set(21-k*1.6,1,4+k*.6);R.add(s)}
    };
    if(X&&X.ld&&X.SUc)loadSW(R).catch(e=>{console.warn('santa workshop models',e);oldFurn()});else oldFurn();
    SW.built=true}
   function syncSanta(){if(!SW.built)return;const t=simTime;SW.fire.forEach((f,i)=>{f.scale.y=1+.18*Math.sin(t*9+i*2);f.scale.x=1+.1*Math.sin(t*7+i)});SW.santa.rotation.y=.25+.15*Math.sin(t*.5);
    SW.elves.forEach((e,k)=>{e.position.y=.06*Math.abs(Math.sin(t*4+k));e.rotation.y=e.userData.base+.25*Math.sin(t*2+k*1.3)});SW.toys.forEach((o,k)=>o.rotation.y=t*6+k);
    SW.belt.forEach((b,k)=>{const x=-21+((t*2.2+k*34/12)%34);b.position.x=x});
    if(SW.L){const n=typeof nightLevel==='function'?nightLevel():0;SW.L.h.forEach(([o,i])=>o.intensity=i*(1-.6*n));SW.L.k.forEach(([o,i])=>o.intensity=i*(1-.75*n));SW.L.p.forEach(([o,i])=>o.intensity=i*(1-.45*n));
     SW.fl.intensity=(38+22*n)*(1+.18*Math.sin(t*11)+.12*Math.sin(t*17.3)+.08*Math.sin(t*5.1));
     {const a=SW.spk.a;SW.spk.s.forEach((q,i)=>{const u=(t*.45+q[0])%1;a.setXYZ(i,17.4+(q[1]-.5)*1.6+Math.sin(t*3+i)*.15*u,.9+u*4.2,-8.2+(q[2]-.5)*.6+u*.4)});a.needsUpdate=true}
     {const a=SW.snow.a,W=[[-25.55,-5],[-25.55,2],[25.55,-5],[25.55,2]];SW.snow.s.forEach((q,i)=>{const w=W[i%4],u=(t*.12+q[0])%1;a.setXYZ(i,w[0],5.5-u*3.05,w[1]+(q[1]-.5)*4.3+Math.sin(t*1.3+i)*.12)});a.needsUpdate=true}
     {const L2=SW.lp,on=Math.floor(t*2.2);for(let i=0;i<L2.n;i++){L2.c.set(PAL[i%PAL.length]);if((i+on)%3===0)L2.c.multiplyScalar(.25);L2.im.setColorAt(i,L2.c)}L2.im.instanceColor.needsUpdate=true}
     if(SW.list&&SW.list.rows>SW.list.VIS){const L3=SW.list,rep=L3.VIS/L3.rows;L3.t.offset.y=((((1-rep)-t*.45/L3.rows)%1)+1)%1}
     SW.train.forEach((c,k)=>{const a=t*.55-k*.36;c.position.set(Math.cos(a)*2.4,0,Math.sin(a)*2.4);c.rotation.y=-a-Math.PI/2});
     if(SW.horse)SW.horse.children[0].rotation.z=.13*Math.sin(t*2.1);
     if(SW.bp)SW.bp.list.forEach((p,k)=>{const cy=Math.floor(t*.16+p.ph),u=(t*.16+p.ph)%1,B=SW.bp;p.name=WALL.length?WALL[(cy*5+k*7)%WALL.length]:null;p.u=u;let x,y;if(u<.8){x=B.x0+(B.x1-B.x0)*(u/.8);y=B.y}else{const v=(u-.8)/.2;x=B.x1-v*1.2;y=Math.max(0,B.y-B.y*v*v)}p.g.position.set(x,y,0);p.g.visible=u<.97})}
    if(SW.wave&&SW.wave.RightForeArm){const w=SW.wave,a=Math.sin(t*6);w.RightForeArm.rotation.z=w.RightForeArm0.z+.28*a;if(w.RightHand)w.RightHand.rotation.z=w.RightHand0.z+.22*Math.sin(t*6-.6);if(w.Head)w.Head.rotation.x=w.Head0.x+.06*Math.sin(t*1.8)}if(SW.santaM)SW.santaM.position.y=.02*Math.sin(t*1.6);
    SW.melves.forEach((m,k)=>{const B=m.B,R0=m.R0;if(!B.RightArm)return;const ph=t*5.5+k*1.9,up=Math.max(0,Math.sin(ph));
     if(m.kind==='hammer'){B.RightForeArm.rotation.z=R0.RightForeArm.z-.7*up;B.LeftForeArm.rotation.z=R0.LeftForeArm.z+.08*Math.sin(ph*.5)}
     else{const w=Math.sin(t*2.6+k);B.RightForeArm.rotation.z=R0.RightForeArm.z-.3*Math.max(0,w);B.LeftForeArm.rotation.z=R0.LeftForeArm.z+.3*Math.max(0,-w)}
     if(B.Head)B.Head.rotation.x=R0.Head.x+.12*Math.sin(t*2.2+k);if(B.Spine1)B.Spine1.rotation.x=R0.Spine1.x+.05*up})}
   function labelsSanta(){if(SW.bp){const v=new T.Vector3();SW.bp.list.forEach((p,k)=>{if(k%2===0&&p.name&&p.g.visible&&p.u>.04&&p.u<.85){p.g.getWorldPosition(v);tag(v.x,v.y+p.s+.45,v.z,'🎁 '+p.name,'rgba(179,38,30,.9)','#fff')}})}SW.elves.forEach((e,k)=>staffTag(e,'park','Elf',k,3.1));header("INSIDE SANTA'S WORKSHOP")}
   INTS.santa={get scene(){return SW.S},build:buildSanta,isBuilt:()=>SW.built,sync:syncSanta,labels:labelsSanta,home:SW.home}}
