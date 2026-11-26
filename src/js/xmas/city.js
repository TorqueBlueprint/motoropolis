//@ xmas/city.js - opens if(XMAS){ ... closed at the end of xmas/sleigh_snow.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ---------- CHRISTMAS (pages with data-xmas="1"): snow, lights, the city tree, market, Santa's sleigh, the light truck ----------
 const XMS={};
 if(XMAS){
  const L=LOT.park,Y=.3,PAL=[0xff3b30,0x2ecc71,0xffc83d,0x3d8bff,0xffffff,0xff7ad9];
  const bulbG=new T.SphereGeometry(.13,6,4),bulbA=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}),bulbB=bulbA.clone();
  const col=new T.Color(),o3=new T.Object3D();
  function bulbs(list,cols,m){const im=new T.InstancedMesh(bulbG,m,Math.max(1,list.length));list.forEach((p,k)=>{o3.position.set(p[0],p[1],p[2]);o3.scale.setScalar(p[3]||1);o3.updateMatrix();im.setMatrixAt(k,o3.matrix);im.setColorAt(k,col.setHex(cols[k]))});im.count=list.length;im.frustumCulled=false;scene.add(im);return im}
  // garlands around every city lot (two sets that blink in turn)
  {const A=[],Ac=[],B2=[],Bc=[];let n=0;for(const k in LOT){const l=LOT[k];if(k==='park')continue;const pts=[];const st=1.25;
    for(let x=l.x0;x<=l.x0+l.w;x+=st){pts.push([x,l.z0]);pts.push([x,l.z0+l.d])}for(let z=l.z0+st;z<l.z0+l.d;z+=st){pts.push([l.x0,z]);pts.push([l.x0+l.w,z])}
    for(const[x0,z0]of pts){const[x,z]=lotP3(l.b,x0,z0);const h=Y+.55+.18*Math.sin(n*.9);const c=PAL[n%PAL.length];if(n%2){A.push([x,h,z]);Ac.push(c)}else{B2.push([x,h,z]);Bc.push(c)}n++}}
   XMS.gA=bulbs(A,Ac,bulbA);XMS.gB=bulbs(B2,Bc,bulbB)}
  // ice rink on the pond, and the fountain is gone: the tree stands in the middle of the park
  // the city Christmas tree: grows with the channel, the star goes on at 150 subscribers
  const tree=new T.Group();tree.position.set(L.cx,Y,L.cz);scene.add(tree);
  const needle=M(0x1f6b3a,{flatShading:true}),trunk=M(0x5a3b22);
  const XT=X&&X.xtree;if(XT){const m=XT.clone(true);const w=new T.Group();w.add(m);w.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(w),sz=bb.getSize(new T.Vector3()),k=8.2/sz.y;w.scale.setScalar(k);w.position.set(-(bb.min.x+bb.max.x)/2*k,-bb.min.y*k,-(bb.min.z+bb.max.z)/2*k);w.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});tree.add(w)}
  else{const tr=new T.Mesh(new T.CylinderGeometry(.35,.45,1.2,8),trunk);tr.position.y=.6;tr.castShadow=true;tree.add(tr);
   [[3.2,2.6,1.2],[2.6,2.4,2.9],[2.0,2.2,4.4],[1.3,2.0,5.8]].forEach(([r,h,y])=>{const c=new T.Mesh(new T.ConeGeometry(r,h,9),needle);c.position.y=y+h/2-.2;c.castShadow=true;c.receiveShadow=true;tree.add(c)});
   const pot=new T.Mesh(new T.CylinderGeometry(1.1,1.3,.5,12),M(0xb3261e));pot.position.y=.25;tree.add(pot)}
  const starShape=new T.Shape();for(let k=0;k<10;k++){const a=k/10*Math.PI*2+Math.PI/2,r=k%2?.32:.75;k?starShape.lineTo(Math.cos(a)*r,Math.sin(a)*r):starShape.moveTo(Math.cos(a)*r,Math.sin(a)*r)}
  const star=new T.Mesh(new T.ExtrudeGeometry(starShape,{depth:.18,bevelEnabled:false}),new T.MeshBasicMaterial({color:0xffd34d,toneMapped:false}));star.position.y=XT?8.6:8.05;star.geometry.center();tree.add(star);
  let tBulbs=null,tSig='';
  function treeBulbs(nb){if(tBulbs){tree.remove(tBulbs);tBulbs.dispose()}const list=[],cs=[];let s=7;const rnd2=()=>(s=(s*16807)%2147483647)/2147483647;
   for(let k=0;k<nb;k++){const u=rnd2(),y=1.2+u*6.4,r=3.1*(1-u*.88)+.05,a=rnd2()*Math.PI*2;list.push([Math.cos(a)*r,y,Math.sin(a)*r,1.1]);cs.push(PAL[k%PAL.length])}
   tBulbs=new T.InstancedMesh(bulbG,bulbA,nb);list.forEach((p,k)=>{o3.position.set(p[0],p[1],p[2]);o3.scale.setScalar(p[3]);o3.updateMatrix();tBulbs.setMatrixAt(k,o3.matrix);tBulbs.setColorAt(k,col.setHex(cs[k]))});tree.add(tBulbs)}
  // presents under the tree: one for every name on the Wall of Mechanics
  const gifts=new T.Group();gifts.userData.mergeRoot=1;tree.userData.mergeRoot=1;tree.add(gifts);let gSig='';XMS.giftPos=[];
  const ribbon=M(0xffd34d);
  function buildGifts(){gifts.clear();XMS.giftPos=[];const names=WALL.slice(0,80);names.forEach((n,k)=>{const ring=k<14?0:k<34?1:2,per=[14,20,46][ring],idx=ring?k-(ring===1?14:34):k,a=idx/per*Math.PI*2+ring*.4,r=[3.9,5.2,6.5][ring];
    const s=.55+((k*37)%5)*.08,g=new T.Group();const b=new T.Mesh(BOX,M([0xd93a2f,0x2f6fd9,0x2e7d4f,0xf2a51a,0x8e44ad,0xffffff][k%6]));b.scale.set(s,s*.8,s);b.position.y=s*.4;b.castShadow=true;g.add(b);
    const r1=new T.Mesh(BOX,ribbon);r1.scale.set(s*1.02,s*.82,.09);r1.position.y=s*.4;g.add(r1);const r2=r1.clone();r2.scale.set(.09,s*.82,s*1.02);g.add(r2);
    g.position.set(Math.cos(a)*r,0,Math.sin(a)*r);g.rotation.y=a*1.7;gifts.add(g);XMS.giftPos.push([n,L.cx+Math.cos(a)*r,L.cz+Math.sin(a)*r,s])})}
  // Christmas market along the park's main path: eight stalls, each selling something different
  const stallsAt=[[.217,.588],[.298,.588],[.723,.588],[.809,.588],[.723,.412],[.809,.412],[.434,.792]];XMS.stalls=[];
  const STRIPE=[0xd93a2f,0x2e7d4f,0x2f6fd9,0xd93a2f,0x8e44ad,0x2e7d4f,0xf2a51a],wood=M(0x8a5a32),wood2=M(0x6b4423),glow=new T.MeshBasicMaterial({color:0xffc56b,toneMapped:false}),gGreen=M(0x1f6b3a,{flatShading:true}),bowM=M(0xd93a2f);
  const stallTops=[];
  const XS1=X&&X.xstall;let stK=0,stB=null;if(XS1){stB=new T.Box3().setFromObject(XS1);const sz=stB.getSize(new T.Vector3());stK=2.9/sz.x}
  stallsAt.forEach(([fx,fz],k)=>{const g=new T.Group(),x=L.x0+L.w*fx,z=L.z0+L.d*fz;g.position.set(x,Y,z);g.rotation.y=fz>.5?Math.PI:0;
   if(XS1){const m=XS1.clone(true);m.scale.setScalar(stK);m.position.set(-(stB.min.x+stB.max.x)/2*stK,-stB.min.y*stK,-(stB.min.z+stB.max.z)/2*stK);m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});g.add(m);const tag=new T.Object3D();g.add(tag);XMS.stalls.push(tag);scene.add(g);g.updateMatrixWorld(true);const hz=(stB.max.z-stB.min.z)/2*stK,hy=(stB.max.y-stB.min.y)*stK;if(X.ld&&X.SUc)jobScene('p_christmas_market_vendor').then(sc=>{const v=personJob(sc);v.position.set(0,0,-hz*.78);g.add(v);XMS.vendors=XMS.vendors||[];XMS.vendors.push(v)}).catch(e=>console.warn('vendor',e));for(const dx of[-1.35,1.35])stallTops.push(g.localToWorld(new T.Vector3(dx,hy*.8,hz)));return}
   g.add(box(2.6,.95,1.3,wood,0,0,0));for(let i=0;i<5;i++)g.add(box(.04,.9,.02,wood2,-1.04+i*.52,.02,.66));g.add(box(2.75,.08,1.45,wood2,0,.95,0));
   for(const dx of[-1.25,1.25]){g.add(box(.13,2.3,.13,wood,dx,0,-.55));g.add(box(.13,2.0,.13,wood,dx,0,.55))}
   g.add(box(2.7,1.3,.08,wood2,0,.95,-.62));
   for(let i=0;i<6;i++)g.add(box(.47,.1,1.9,M(i%2?0xffffff:STRIPE[k]),-1.175+i*.47,2.25,-.15));
   for(let i=0;i<6;i++){const sc=new T.Mesh(new T.CylinderGeometry(.235,.235,.06,10,1,false,0,Math.PI),M(i%2?0xffffff:STRIPE[k]));sc.rotation.set(Math.PI/2,0,Math.PI/2);sc.position.set(-1.175+i*.47,2.2,.8);g.add(sc)}
   const sign=box(1.6,.38,.06,M(STRIPE[k]),0,2.42,.82);g.add(sign);g.add(box(1.7,.06,.07,M(0xffd34d),0,2.42,.83));
   // goods on the counter
   const goods=[[0xc8873e,0xf4e1c1],[0x8b4513,0xffffff],[0xd93a2f,0x2e7d4f],[0xffd34d,0x2f6fd9],[0xffffff,0xd93a2f],[0x2e7d4f,0xffd34d],[0xf2a51a,0x8e44ad],[0xc8873e,0xd93a2f]][k];
   for(let i=0;i<7;i++){const gx=-1.05+i*.35;const t=(k+i)%3;let o;if(t===0){o=new T.Mesh(new T.CylinderGeometry(.09,.08,.18,8),M(goods[i%2]));o.position.set(gx,1.08,.25)}else if(t===1){o=new T.Mesh(new T.SphereGeometry(.11,8,6),M(goods[i%2]));o.position.set(gx,1.1,.25)}else{o=box(.2,.2,.2,M(goods[i%2]),gx,.99,.25)}g.add(o)}
   // pine garland with bows along the front
   for(let i=0;i<11;i++){const s=new T.Mesh(new T.IcosahedronGeometry(.12,0),gGreen);s.position.set(-1.2+i*.24,1.92-.12*Math.sin(i/10*Math.PI),.82);g.add(s)}for(const dx of[-1.2,0,1.2]){g.add(box(.16,.16,.06,bowM,dx,1.78,.85))}
   const lanternA=new T.Mesh(new T.SphereGeometry(.13,8,6),glow);lanternA.position.set(-.9,1.75,.55);g.add(lanternA);const lanternB=lanternA.clone();lanternB.position.x=.9;g.add(lanternB);
   const sb=[],sc=[];for(let i=0;i<11;i++){sb.push([-1.25+i*.25,2.13,.85,.8]);sc.push(PAL[(i+k)%PAL.length])}const im=bulbs(sb,sc,bulbA);scene.remove(im);g.add(im);
   const tag=new T.Object3D();g.add(tag);XMS.stalls.push(tag);
   g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});scene.add(g);g.updateMatrixWorld(true);
   for(const dx of[-1.25,1.25]){stallTops.push(g.localToWorld(new T.Vector3(dx,2.3,.8)))}});
  // strings of lights across the market, sagging between the stalls
  {const lb=[],lc=[];let n=0;const sag=(a,b)=>{const steps=Math.max(6,Math.round(a.distanceTo(b)/.35));for(let i=1;i<steps;i++){const t=i/steps,p=a.clone().lerp(b,t);p.y-=Math.sin(t*Math.PI)*.45;lb.push([p.x,p.y,p.z,.85]);lc.push(PAL[n++%PAL.length])}};
   const T2=i=>stallTops[i*2],T1=i=>stallTops[i*2+1];sag(T1(0),T2(1));sag(T1(2),T2(3));sag(T1(4),T2(5));sag(T2(2),T2(4));sag(T1(3),T1(5));sag(T2(3),T1(4));
   XMS.lights=bulbs(lb,lc,bulbB)}
  // Christmas carousel on the Motoropolis Daily plaza, turning slowly
  if(X&&X.xcarousel&&LOT.news){const NL=LOT.news,cg=new T.Group();const cp=lotP3(NL.b,NL.x0+6.4,NL.z0+14.3);cg.position.set(cp[0],Y,cp[1]);const m=X.xcarousel.clone(true);const bb=new T.Box3().setFromObject(m),sz=bb.getSize(new T.Vector3()),k=5.6/Math.max(sz.x,sz.z);m.scale.setScalar(k);m.position.set(-(bb.min.x+bb.max.x)/2*k,-bb.min.y*k,-(bb.min.z+bb.max.z)/2*k);m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});cg.add(m);scene.add(cg);XMS.carousel=cg}
  // snowmen around the park
  const coal=M(0x1b1b1b),snowW=M(0xf6f9fc),carrot=M(0xf07a1a);
  [[.08,.3,0.6],[.5,.92,3.1],[.92,.78,-2.2],[.3,.12,1.2],[.62,.92,2.5]].forEach(([fx,fz,ry],k)=>{const g=new T.Group();g.position.set(L.x0+L.w*fx,Y,L.z0+L.d*fz);g.rotation.y=ry;
   [[.75,.7],[.55,1.75],[.38,2.55]].forEach(([r,y])=>{const b=new T.Mesh(new T.SphereGeometry(r,14,10),snowW);b.position.y=y;g.add(b)});
   const hat=new T.Mesh(new T.CylinderGeometry(.27,.27,.45,12),coal);hat.position.y=3.07;g.add(hat);const brim=new T.Mesh(new T.CylinderGeometry(.42,.42,.05,14),coal);brim.position.y=2.86;g.add(brim);g.add(box(.56,.07,.56,M([0xd93a2f,0x2e7d4f,0x2f6fd9][k%3]),0,2.92,0));
   const nose=new T.Mesh(new T.ConeGeometry(.07,.38,8),carrot);nose.rotation.x=Math.PI/2;nose.position.set(0,2.58,.52);g.add(nose);
   for(const dx of[-.13,.13]){const e=new T.Mesh(new T.SphereGeometry(.045,6,5),coal);e.position.set(dx,2.7,.33);g.add(e)}for(let i=0;i<3;i++){const b=new T.Mesh(new T.SphereGeometry(.05,6,5),coal);b.position.set(0,1.55+i*.22,.53);g.add(b)}
   const sf=new T.Mesh(new T.TorusGeometry(.4,.09,6,14),M([0xd93a2f,0x2e7d4f,0x2f6fd9][k%3]));sf.rotation.x=Math.PI/2;sf.position.y=2.2;g.add(sf);g.add(box(.18,.6,.05,sf.material,.2,1.65,.38));
   for(const sd of[-1,1]){const a=new T.Mesh(new T.CylinderGeometry(.03,.04,.9,5),wood2);a.position.set(sd*.8,1.95,0);a.rotation.z=sd*-1.0;g.add(a)}
   g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g)});
  // skaters on the ice rink
  XMS.skaters=[];{const cx=L.x0+L.w*.3,cz=L.z0+L.d*.3;[['#d93a2f','#f1c7a5'],['#2f6fd9','#d9a27e'],['#2e7d4f','#f5d3b8'],['#8e44ad','#a8714f'],['#f2a51a','#f1c7a5']].forEach(([c,sk],k)=>{let p;try{p=personMesh(c,sk,'#3a2414')}catch(e){p=null}if(!p)return;scene.add(p);XMS.skaters.push({p,ph:k/5*Math.PI*2,cx,cz,rx:3.2-(k%2)*.8,rz:1.6-(k%2)*.4,sp:.45+(k%3)*.08,dir:k%2?-1:1})})}
  // old street lamps with wreaths along the paths
  {const iron=M(0x1f2a24,{metalness:.4,roughness:.5});const ix0=L.x0+2.6,ix1=L.x0+L.w-2.6,iz0=L.z0+2.6,iz1=L.z0+L.d-2.6;
   const pts=[[ix0,iz0],[ix1,iz0],[ix0,iz1],[ix1,iz1],[(ix0+ix1)/2-6,iz0],[(ix0+ix1)/2+6,iz1],[ix0,(iz0+iz1)/2-4],[ix1,(iz0+iz1)/2+4]];
   for(const[x,z]of pts){const g=new T.Group();g.position.set(x+.9,Y,z+.9);const pole=new T.Mesh(new T.CylinderGeometry(.07,.11,3.2,8),iron);pole.position.y=1.6;g.add(pole);g.add(box(.36,.1,.36,iron,0,3.2,0));
    const lan=new T.Mesh(new T.CylinderGeometry(.17,.13,.42,6),glow);lan.position.y=3.5;g.add(lan);const cap=new T.Mesh(new T.ConeGeometry(.25,.25,6),iron);cap.position.y=3.84;g.add(cap);
    const wr=new T.Mesh(new T.TorusGeometry(.28,.09,6,12),gGreen);wr.position.set(0,2.35,.1);g.add(wr);g.add(box(.18,.16,.06,bowM,0,2.08,.18));scene.add(g)}}
  // snow on the benches, little lit pines and piles of presents by the stalls
  for(const[fx,fz,r]of[[.07,.85,0],[.9,.5,Math.PI/2],[.6,.17,0],[.35,.75,0]]){const s=box(2.3,.07,.62,snowW,0,0,0);s.position.set(L.x0+L.w*fx,Y+.57,L.z0+L.d*fz);s.rotation.y=r;scene.add(s)}
  {const lb=[],lc=[];let n=0;for(const[fx,fz]of[[.62,.75],[.92,.3],[.15,.75],[.5,.2],[.38,.82]]){const x=L.x0+L.w*fx,z=L.z0+L.d*fz;for(const[r,h,y]of[[.75,1.2,.2],[.55,1.0,.9],[.35,.8,1.5]]){const c=new T.Mesh(new T.ConeGeometry(r,h,8),gGreen);c.position.set(x,Y+y+h/2,z);c.castShadow=true;scene.add(c)}
    for(let i=0;i<14;i++){const u=i/14,a=i*2.4;lb.push([x+Math.cos(a)*(.7-u*.5),Y+.4+u*1.9,z+Math.sin(a)*(.7-u*.5),.7]);lc.push(PAL[n++%PAL.length])}}XMS.pineLights=bulbs(lb,lc,bulbA)}
  [[.867,.6],[.867,.4],[.49,.8]].forEach(([fx,fz],k)=>{const x=L.x0+L.w*fx,z=L.z0+L.d*fz;for(let i=0;i<3;i++){const sz=.3+.1*((k+i)%3);const b=box(sz,sz*.8,sz,M([0xd93a2f,0x2f6fd9,0x2e7d4f,0xffd34d][(k+i)%4]),x+(i%2)*.35,Y+(i===2?.32:0),z+(i>0?.3:0));b.castShadow=true;scene.add(b)}});
  // ===== CHRISTMAS STREET: the houses block next to the park =====
  const XSTB=cityFill().xst;XMS.santaRect=null;XMS.carolers=[];XMS.kids=[];XMS.balls=[];XMS.smoke=[];
  if(XSTB){const sx0=U(XSTB.x0),sx1=U(XSTB.sx),sz0=U(XSTB.y0),sz1=U(XSTB.y1),mx=(sx0+sx1)/2;
   const red=M(0xb3261e),white=M(0xf4f4f4),snowR=M(0xf2f6fa),green=M(0x1f6b3a),gold=M(0xd4a017,{metalness:.5,roughness:.4}),winG=new T.MeshBasicMaterial({color:0xffd27a,toneMapped:false}),brick=M(0x8e3b2c),dkw=M(0x5a3b22);
   const gable=(w,d,h,m)=>{const sh=new T.Shape();sh.moveTo(-d/2,0);sh.lineTo(d/2,0);sh.lineTo(0,h);sh.lineTo(-d/2,0);const g=new T.ExtrudeGeometry(sh,{depth:w,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(-w/2,0,0);const me=new T.Mesh(g,m);me.castShadow=true;me.receiveShadow=true;return me};
   const caneM=[M(0xd62828),M(0xf8f8f8)];
   const cane=(par,x,z,h,ry)=>{const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry||0;const n=Math.round(h/.18);for(let i=0;i<n;i++){const c=new T.Mesh(new T.CylinderGeometry(.07,.07,.18,8),caneM[i%2]);c.position.y=.09+i*.18;g.add(c)}const hk=new T.Mesh(new T.TorusGeometry(.2,.07,6,12,Math.PI),caneM[0]);hk.position.set(.2,h,0);g.add(hk);g.traverse(o=>{if(o.isMesh)o.castShadow=true});par.add(g);return g};
   // --- Santa's house (door to the north road) ---
   {const g=new T.Group(),W=10.5,D=8,H=4.6,cz=sz0+D/2+2.6;g.position.set(mx,Y,cz);g.rotation.y=Math.PI;scene.add(g);
    g.add(box(W,H,D,red,0,0,0));for(const[x,z]of[[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2]])g.add(box(.35,H,.35,white,x,0,z));g.add(box(W+.3,.3,D+.3,white,0,H-.15,0));g.add(box(W+.4,.35,D+.4,M(0x6b4423),0,0,0));
    const roof=gable(W+1,D+1.4,3.2,snowR);roof.position.y=H;g.add(roof);g.add(box(W+1.05,.22,.25,red,0,H-.05,(D+1.4)/2-.1));g.add(box(W+1.05,.22,.25,red,0,H-.05,-(D+1.4)/2+.1));
    g.add(box(1.2,2.6,1.2,brick,W/2-2,H+1.2,-1));g.add(box(1.4,.25,1.4,snowR,W/2-2,H+3.8,-1));XMS.chimL=new T.Vector3(W/2-2,H+4.2,-1);
    // front (local +z) door, wreath, windows with shutters, sign
    g.add(box(1.7,2.7,.15,M(0x1f5e3a),0,0,D/2+.05));g.add(box(.12,.12,.1,gold,.55,1.3,D/2+.15));const wr=new T.Mesh(new T.TorusGeometry(.42,.13,8,16),green);wr.position.set(0,2.2,D/2+.2);g.add(wr);g.add(box(.3,.25,.08,M(0xd62828),0,1.85,D/2+.28));
    for(const sd of[-1,1])for(const y of[1.4]){const wx=sd*3.2;g.add(box(1.4,1.3,.08,winG,wx,y,D/2+.04));g.add(box(1.6,.14,.12,white,wx,y+1.3,D/2+.08));g.add(box(1.6,.14,.12,white,wx,y-.1,D/2+.08));for(const s of[-1,1])g.add(box(.45,1.4,.1,M(0x1f5e3a),wx+s*1.0,y-.05,D/2+.07))}
    for(const sd of[-1,1]){g.add(box(.08,1.1,1.1,winG,sd*(W/2+.04),1.6,0))}
    const sgn=sign("SANTA'S WORKSHOP",7,1.2,'#b3261e','#ffffff',0,H+1.25,D/2+.75,0);g.add(sgn);
    // porch, candy canes along the path, letters-to-Santa mailbox
    g.add(box(3.2,.25,1.6,M(0x6b4423),0,0,D/2+.8));for(let i=0;i<2;i++){cane(g,-1.3,D/2+1.0+i*.9,1.2,0);cane(g,1.3,D/2+1.0+i*.9,1.2,Math.PI)}
    const mb=new T.Group();mb.position.set(2.9,0,D/2+1.9);mb.add(box(.12,1,.12,dkw,0,0,0));mb.add(box(.7,.55,.95,M(0xd62828),0,1,0));const mtop=new T.Mesh(new T.CylinderGeometry(.35,.35,.95,10,1,false,0,Math.PI),M(0xd62828));mtop.rotation.set(0,0,Math.PI/2);mtop.rotation.x=Math.PI/2;mtop.position.y=1.55;mb.add(mtop);g.add(mb);
    const ms=sign('LETTERS TO SANTA',2.2,.45,'#ffd34d','#b3261e',2.9,2.3,D/2+1.9,0);g.add(ms);
    // roof lights
    {const lb=[],lc=[];let n=0;const seg=(a,b)=>{const st=Math.max(4,Math.round(a.distanceTo(b)/.38));for(let i=0;i<=st;i++){const p=a.clone().lerp(b,i/st);lb.push([p.x,p.y,p.z,.9]);lc.push(PAL[n++%PAL.length])}};const e=(D+1.4)/2,hw=(W+1)/2;
     seg(new T.Vector3(-hw,H,e),new T.Vector3(hw,H,e));seg(new T.Vector3(-hw,H,e),new T.Vector3(-hw,H+3.2,0));seg(new T.Vector3(hw,H,e),new T.Vector3(hw,H+3.2,0));const im=bulbs(lb,lc,bulbA);scene.remove(im);g.add(im)}
    g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});g.updateMatrixWorld(true);XMS.santaG=g;XMS.chim=g.localToWorld(XMS.chimL.clone());
    XMS.santaRect=[(mx-W/2-.5)*10,(mx+W/2+.5)*10,(cz-D/2-2.6)*10,(cz+D/2+.5)*10]}
   // --- Gingerbread house (door to the south road) ---
   {const g=new T.Group(),W=8,D=6,H=3.6,cz=sz1-5.6;g.position.set(mx,Y,cz);scene.add(g);const gb=M(0xb5713a,{roughness:.8}),gbD=M(0x7a4520),ice=M(0xfffaf2,{roughness:.4});
    g.add(box(W,H,D,gb,0,0,0));const roof=gable(W+1,D+1.6,2.8,gbD);roof.position.y=H;g.add(roof);
    // icing on every edge, scalloped icing drips under the eaves
    for(const sd of[-1,1]){g.add(box(W+1.1,.22,.3,ice,0,H-.05,sd*((D+1.6)/2-.12)));for(let i=0;i<11;i++){const d=new T.Mesh(new T.SphereGeometry(.17,8,6),ice);d.scale.y=1.5;d.position.set(-W/2+.2+i*(W-.4)/10,H-.35,sd*((D+1.6)/2-.12));g.add(d)}}
    for(const[x,z]of[[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2]])g.add(box(.3,H,.3,ice,x,0,z));
    const rl=Math.hypot((D+1.6)/2,2.8),ra=Math.atan2(2.8,(D+1.6)/2);for(const sd of[-1,1])for(const ex of[-1,1]){const b=box(.25,.25,rl,ice,0,0,0);b.position.set(ex*(W+1)/2,H+1.4,sd*(D+1.6)/4);b.rotation.x=sd*ra;g.add(b)}
    // candy buttons on the roof, gumdrops along the base, round icing windows
    const cc=[0xe63946,0x2a9d8f,0xf4a261,0x8e44ad,0x3d8bff,0xffd34d];for(const sd of[-1,1])for(let i=0;i<5;i++)for(let j=0;j<2;j++){const c=new T.Mesh(new T.SphereGeometry(.18,8,6),M(cc[(i+j*2+(sd>0?1:0))%6]));const t=(j+.6)/2.4;c.position.set(-W/2+.8+i*(W-1.6)/4,H+2.8*t+.12,sd*(D+1.6)/2*(1-t));g.add(c)}
    for(let i=0;i<12;i++){const c=new T.Mesh(new T.SphereGeometry(.22,8,6),M(cc[i%6]));c.scale.y=.8;c.position.set(-W/2+.3+i*(W-.6)/11,.22,D/2+.15);g.add(c)}
    for(const sd of[-1,1]){const w=new T.Mesh(new T.CircleGeometry(.6,16),winG);w.position.set(sd*2.4,2,D/2+.02);g.add(w);const rim=new T.Mesh(new T.TorusGeometry(.62,.08,6,16),ice);rim.position.copy(w.position);g.add(rim);g.add(box(1.4,.08,.1,ice,sd*2.4,1.97,D/2+.05))}
    g.add(box(1.4,2.3,.12,M(0x5a2d12),0,0,D/2+.05));const dt=new T.Mesh(new T.TorusGeometry(.7,.09,6,16,Math.PI),ice);dt.position.set(0,2.3,D/2+.1);g.add(dt);
    cane(g,-1.1,D/2+.6,2.2,0);cane(g,1.1,D/2+.6,2.2,Math.PI);
    // lollipops in the yard
    for(const[x,z,c]of[[-3.3,D/2+1.6,0],[3.3,D/2+1.6,3],[-2.2,D/2+2.3,4],[2.2,D/2+2.3,1]]){g.add(box(.08,1.3,.08,white,x,0,z));const l=new T.Mesh(new T.CylinderGeometry(.45,.45,.12,16),M(cc[c]));l.rotation.x=Math.PI/2;l.position.set(x,1.55,z);g.add(l);const sw=new T.Mesh(new T.TorusGeometry(.28,.06,6,14),white);sw.position.set(x,1.55,z+.07);g.add(sw)}
    g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});XMS.gingerG=g}
   // --- the remaining houses get roof lights, wreaths, window candles and candy canes ---
   const SCHEMES=[[0xfff1c1],PAL,[0x6cb6ff,0xffffff],[0xff3b30,0x2ecc71],[0xfff1c1],PAL];let hi=0;const lb=[],lc=[],cand=[];
   const houses=cityFill().items.filter(f=>f.k==='house'&&f.x>XSTB.sx&&f.x<XSTB.x1&&f.y>XSTB.y0&&f.y<XSTB.y1);
   for(const f of houses){const x=U(f.x),z=U(f.y),w=U(f.w),d=U(f.h),h=2.9+f.w%3*.2,ry=f.ang||0,c=Math.cos(ry),s=Math.sin(ry),sc=SCHEMES[hi%SCHEMES.length];let n=0;
    const P=(lx,ly,lz)=>new T.Vector3(x+lx*c+lz*s,ly,z-lx*s+lz*c);const seg=(a,b)=>{const st=Math.max(4,Math.round(a.distanceTo(b)/.36));for(let i=0;i<=st;i++){const p=a.clone().lerp(b,i/st);lb.push([p.x,p.y,p.z,.8]);lc.push(sc[n++%sc.length])}};
    const sxr=(w+.7)/2,szr=(d+.9)/2,yb=.3+h,yt=yb+1.7;seg(P(-sxr,yb,szr),P(sxr,yb,szr));seg(P(-sxr,yb,-szr),P(sxr,yb,-szr));for(const ex of[-1,1]){seg(P(ex*sxr,yb,szr),P(ex*sxr,yt,0));seg(P(ex*sxr,yb,-szr),P(ex*sxr,yt,0))}seg(P(-sxr,yt,0),P(sxr,yt,0));
    const fz=d/2+.06;const wr=new T.Mesh(new T.TorusGeometry(.32,.1,8,14),green);wr.position.copy(P(0,.3+1.9,fz+.05));wr.rotation.y=ry;scene.add(wr);const bw=box(.24,.2,.08,M(0xd62828),0,0,0);bw.position.copy(P(0,.3+1.6,fz+.09));bw.rotation.y=ry;scene.add(bw);
    for(const sd of[-1,1]){const cd=new T.Mesh(new T.CylinderGeometry(.06,.06,.3,8),white);cd.position.copy(P(sd*w*.3,.3+1.25,fz));scene.add(cd);const fl=new T.Mesh(new T.SphereGeometry(.07,6,5),winG);fl.position.copy(P(sd*w*.3,.3+1.47,fz));scene.add(fl);cand.push(fl)}
    for(const sd of[-1,1]){const p=P(sd*.75,0,d/2+.45);cane(scene,p.x,p.z,.9,ry+(sd>0?Math.PI:0)).position.y=Y}hi++}
   XMS.roofLights=bulbs(lb,lc,bulbA);

   // --- the garden band between the two rows: inflatables, light reindeer, lit pines ---
   const gz=(U(XSTB.y0)+U(XSTB.y1))/2,gx0=sx1+1.5,gx1=U(XSTB.x1)-1.5;
   const infl=(kind,x,z,ry)=>{const g=new T.Group();g.position.set(x,Y,z);g.rotation.y=ry;const sm=(r,m,px,py,pz,sy)=>{const o=new T.Mesh(new T.SphereGeometry(r,14,10),m);o.position.set(px,py,pz);if(sy)o.scale.y=sy;o.castShadow=true;g.add(o);return o};
    if(kind===0){sm(1.0,M(0xd62828,{roughness:.35}),0,1.1,0,1.15);sm(.62,M(0xf1c7a5,{roughness:.4}),0,2.55,0);sm(.5,white,0,2.25,.25,.9);const h=new T.Mesh(new T.ConeGeometry(.55,1,12),M(0xd62828,{roughness:.35}));h.position.set(0,3.35,-.05);h.rotation.x=-.3;g.add(h);sm(.16,white,0,3.85,-.25);g.add(box(1.9,.22,1.9,M(0x1b1b1b),0,1.0,0))}
    else if(kind===1){sm(1.0,white,0,1,0);sm(.7,white,0,2.4,0);const h=new T.Mesh(new T.CylinderGeometry(.42,.42,.6,12),M(0x1b1b1b));h.position.y=3.35;g.add(h);const n=new T.Mesh(new T.ConeGeometry(.1,.45,8),M(0xf07a1a));n.rotation.x=Math.PI/2;n.position.set(0,2.45,.75);g.add(n);const sf=new T.Mesh(new T.TorusGeometry(.6,.14,6,14),M(0x2f6fd9));sf.rotation.x=Math.PI/2;sf.position.y=1.85;g.add(sf)}
    else{sm(.75,M(0x8a5a35,{roughness:.4}),0,1.3,0,.8).scale.set(1.5,.8,1);sm(.42,M(0x8a5a35,{roughness:.4}),.9,2.25,0);sm(.14,M(0xff2a2a,{roughness:.3}),1.32,2.2,0);for(const lx of[-.6,.6])for(const lz of[-.35,.35]){const l=new T.Mesh(new T.CylinderGeometry(.14,.14,1,8),M(0x8a5a35));l.position.set(lx,.5,lz);g.add(l)}for(const az of[-.18,.18]){const a=new T.Mesh(new T.CylinderGeometry(.05,.05,.7,6),M(0xe0c9a0));a.position.set(.8,2.85,az);a.rotation.z=.3;g.add(a)}}
    scene.add(g)};
   const pts=[];for(let i=0;i<6;i++)pts.push(gx0+(gx1-gx0)*(i+.5)/6);
   infl(0,pts[0],gz-1.3,Math.PI);infl(1,pts[2],gz+1.4,0);infl(2,pts[4],gz-1.2,Math.PI/2);infl(0,pts[5],gz+1.5,0);infl(1,pts[1],gz+1.6,0.4);
   // light reindeer: glowing wire sculptures
   const lw=new T.MeshBasicMaterial({color:0xfff1c1,toneMapped:false});XMS.lightDeer=[];
   const rod=(g,a,b,r)=>{const v=b.clone().sub(a),L2=v.length();const m=new T.Mesh(new T.CylinderGeometry(r||.045,r||.045,L2,5),lw);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());g.add(m)};
   for(const[x,z,ry]of[[pts[1],gz-1.6,0],[pts[3],gz+.2,.6],[pts[3]+2,gz-1.9,-.3]]){const g=new T.Group();g.position.set(x,Y,z);g.rotation.y=ry;const V=(a,b,c)=>new T.Vector3(a,b,c);
    const body=[V(-.8,1.2,0),V(.8,1.2,0)];rod(g,body[0],body[1],.06);rod(g,V(-.8,1.2,0),V(-.9,1.5,0));for(const lx of[-.65,.65])for(const lz of[-.18,.18])rod(g,V(lx,1.2,lz*.5),V(lx+(lx>0?.05:-.05),0,lz));
    const hd=new T.Group();hd.position.set(.8,1.2,0);g.add(hd);rod(hd,V(0,0,0),V(.35,.8,0),.05);rod(hd,V(.35,.8,0),V(.75,.75,0),.05);for(const az of[-.15,.15]){rod(hd,V(.35,.85,az),V(.25,1.4,az*2));rod(hd,V(.27,1.2,az*1.5),V(.05,1.35,az*2.5))}
    scene.add(g);XMS.lightDeer.push(hd)}
   {const lb2=[],lc2=[];let n=0;for(const[x,z]of[[pts[0]+1.8,gz+1.2],[pts[2]+1.6,gz-1.5],[pts[5]-1.5,gz-.3]]){for(const[r,hh,y]of[[.8,1.3,.2],[.6,1.1,1],[.38,.9,1.7]]){const c=new T.Mesh(new T.ConeGeometry(r,hh,8),green);c.position.set(x,Y+y+hh/2,z);c.castShadow=true;scene.add(c)}for(let i=0;i<16;i++){const u=i/16,a=i*2.4;lb2.push([x+Math.cos(a)*(.75-u*.55),Y+.4+u*2.1,z+Math.sin(a)*(.75-u*.55),.7]);lc2.push(PAL[n++%PAL.length])}}XMS.streetPines=bulbs(lb2,lc2,bulbA)}
   // --- CHRISTMAS STREET arch over the road between the park and the street ---
   {const ax=U(XSTB.x1)+4.6,g=new T.Group();g.position.set(ax,Y,gz);scene.add(g);const span=7.6;for(const sd of[-1,1]){cane(g,sd*span/2,0,4.2,sd>0?0:Math.PI)}
    const arc=new T.Mesh(new T.TorusGeometry(span/2,.14,8,40,Math.PI),M(0xd62828));arc.position.y=4.2;g.add(arc);
    const lb3=[],lc3=[];for(let i=0;i<=30;i++){const a=Math.PI*i/30;lb3.push([Math.cos(a)*span/2,4.2+Math.sin(a)*span/2,.18,1]);lb3.push([Math.cos(a)*span/2,4.2+Math.sin(a)*span/2,-.18,1]);lc3.push(PAL[i%PAL.length],PAL[(i+3)%PAL.length])}const im=bulbs(lb3,lc3,bulbB);scene.remove(im);g.add(im);
    const sg=sign('CHRISTMAS STREET',6,1.1,'#1f6b3a','#ffffff',0,8.6,.12,0);g.add(sg);const sg2=sign('CHRISTMAS STREET',6,1.1,'#1f6b3a','#ffffff',0,8.6,-.12,Math.PI);g.add(sg2);g.add(box(.12,1,.12,M(0xd62828),-2,7.6,0));g.add(box(.12,1,.12,M(0xd62828),2,7.6,0));
    XMS.archAt=[ax,gz]}
   // --- carolers walking around the street and kids with snowballs ---
   {const route=[[gx0-.5,gz-2.8],[gx1,gz-2.8],[gx1,gz+2.8],[gx0-.5,gz+2.8]];XMS.carolRoute=route;
    [['#7a1f2b','#f1c7a5'],['#1f4a7a','#d9a27e'],['#2e5d3a','#f5d3b8'],['#6b3fa0','#a8714f']].forEach(([c,sk],k)=>{let p=null;try{p=personMesh(c,sk,'#3a2414')}catch(e){}if(!p)return;const lan=new T.Group();lan.add(box(.04,.5,.04,M(0x2b2b2b),0,0,0));const gl=new T.Mesh(new T.CylinderGeometry(.11,.09,.22,6),winG);gl.position.y=-.05;lan.add(gl);lan.position.set(.32,1.25,.25);if(k%2===0)p.add(lan);const bk=box(.32,.4,.06,M(0x8a1d1d),0,0,0);bk.position.set(-.2,1.2,.3);if(k%2)p.add(bk);scene.add(p);XMS.carolers.push({p,off:k*.9})})
    const kz=gz,kxs=[pts[2]-1.2,pts[2]+1.4];[['#d93a2f',0],['#2f6fd9',1],['#f2a51a',0],['#3ee08f',1]].forEach(([c,side],k)=>{let p=null;try{p=personMesh(c,['#f1c7a5','#d9a27e','#a8714f','#f5d3b8'][k],'#2b1d14')}catch(e){}if(!p)return;p.scale.setScalar(.62);const x=kxs[side]+(k>1?.5:0),z=kz+(k>1?.9:-.9);p.position.set(x,Y,z);p.rotation.y=side?-Math.PI/2:Math.PI/2;scene.add(p);XMS.kids.push({p,side,x,z,k})});
    for(let i=0;i<3;i++){const b=new T.Mesh(new T.SphereGeometry(.12,8,6),white);scene.add(b);XMS.balls.push({b,ph:i/3})}
    // a snowman half built: two balls, the third being rolled by a kid
    const sx2=pts[4]+.6,sz2=gz+1.9;const b1=new T.Mesh(new T.SphereGeometry(.6,12,10),white);b1.position.set(sx2,Y+.6,sz2);scene.add(b1);const b2=new T.Mesh(new T.SphereGeometry(.42,12,10),white);b2.position.set(sx2,Y+1.55,sz2);scene.add(b2);
    const b3=new T.Mesh(new T.SphereGeometry(.32,12,10),white);b3.position.set(sx2+1.2,Y+.32,sz2+.4);scene.add(b3);let kk=null;try{kk=personMesh('#8e44ad','#f1c7a5','#5a3a22')}catch(e){}if(kk){kk.scale.setScalar(.62);kk.position.set(sx2+1.75,Y,sz2+.45);kk.rotation.y=-Math.PI/2;scene.add(kk)}}
   // smoke puffs from Santa's chimney
   for(let i=0;i<6;i++){const s=new T.Mesh(new T.SphereGeometry(.35,8,6),new T.MeshStandardMaterial({color:0xdddddd,transparent:true,opacity:.6,depthWrite:false}));scene.add(s);XMS.smoke.push({s,ph:i/6})}
  }
  // ===== roof lights on every house in the city =====
  const cityBulbG=new T.OctahedronGeometry(.12,0);
  function roofLightList(list){const lb=[],lc=[];const SC=[[0xfff1c1],PAL,[0x6cb6ff,0xffffff],[0xff3b30,0x2ecc71],[0xfff1c1,0xffd34d],[0xd62828,0xffffff]];let hi=0;
   for(const r of list){const sc=SC[hi++%SC.length],c=Math.cos(r.ry||0),s=Math.sin(r.ry||0);let n=0;const P=(lx,ly,lz)=>[r.x+lx*c+lz*s,ly,r.z-lx*s+lz*c];
    const seg=(a,b)=>{const L2=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),st=Math.max(3,Math.round(L2/.55));for(let i=0;i<=st;i++){const u=i/st;lb.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u,1]);lc.push(sc[n++%sc.length])}};
    const hx=r.sx/2,hz=r.sz/2,yb=r.y,yt=r.y+r.sy;seg(P(-hx,yb,hz),P(hx,yb,hz));seg(P(-hx,yb,-hz),P(hx,yb,-hz));for(const ex of[-1,1]){seg(P(ex*hx,yb,hz),P(ex*hx,yt,0));seg(P(ex*hx,yb,-hz),P(ex*hx,yt,0))}}
   return[lb,lc]}
  function cityBulbs(lb,lc){const im=new T.InstancedMesh(cityBulbG,bulbA,Math.max(1,lb.length));lb.forEach((p,k)=>{o3.position.set(p[0],p[1],p[2]);o3.scale.setScalar(1);o3.updateMatrix();im.setMatrixAt(k,o3.matrix);im.setColorAt(k,col.setHex(lc[k]))});im.count=lb.length;im.frustumCulled=false;scene.add(im);return im}
  if(QUAL!=='low'){const xb=cityFill().xst;const core=cityFill().items.filter(f=>f.k==='house'&&!(xb&&f.x>=xb.x0&&f.x<=xb.x1&&f.y>=xb.y0&&f.y<=xb.y1)).map(f=>{const h=2.9+f.w%3*.2;return{x:U(f.x),z:U(f.y),ry:f.ang||0,sx:U(f.w)+.7,sz:U(f.h)+.9,y:.3+h,sy:1.7}});const[a,b]=roofLightList(core);XMS.coreRoofLights=cityBulbs(a,b)}
  XMS.w3sig=-1;XMS.w3Lights=null;
