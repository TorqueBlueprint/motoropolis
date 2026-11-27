//@ world/mayor.js - Mayor TorqueBlueprint, the city mascot (design A "classic"): stands at the City Hall entrance on the
//@ Old Town square and now and then strolls a short loop across the square and back, waving. "MAYOR'S OFFICE" sign at the steps,
//@ a gold name tag (view3d/labels.js asks W3.tags). Seeded by time only (no Math.random). Off with ?mayor=0.
//@ The builder between the MAYOR-BUILD markers is self-contained (it only uses T) so a stand-alone page can load the same
//@ meshes (the reference sheet). 8 meshes / 3 materials: the static body is merged into one vertex-coloured mesh.
//@ Recorder: window.__MAYOR = {pos(), seek(t), g()} on the recorder page and on localhost; rec.js: follow:{mayor:true}.
//@ inside the if(WORLD){ block of world/world3d.js, after world/city2_landmarks.js.
  /*MAYOR-BUILD*/
  const mayorBuild=(T)=>{
   const PAL={suit:0x1f3a6e,trous:0x1a2f58,shirt:0xf5f3ee,tie:0xc8232c,sash:0xff7a1a,gold:0xf2c14e,skin:0xf1c7a5,hair:0x4a3020,brow:0x5a3a22,eye:0x2b2b33,mouth:0x7a2f2f,hat:0x1b1b1f,shoe:0x1b1b1f};
   // rounded box: a subdivided box whose vertices are pushed onto a rounded shell (corner radius r)
   const RB=(w,h,d,r,s)=>{s=s||2;const n=2*s+1,g=new T.BoxGeometry(1,1,1,n,n,n),P=g.attributes.position,N=g.attributes.normal,H=[w/2,h/2,d/2],v=[0,0,0],p=[0,0,0];r=Math.min(r,w/2,h/2,d/2)*.999;
    for(let i=0;i<P.count;i++){v[0]=P.getX(i);v[1]=P.getY(i);v[2]=P.getZ(i);let l=0;
     for(let a=0;a<3;a++){const k=Math.round((v[a]+.5)*n);p[a]=k<=s?-Math.cos(k/s*Math.PI/2):Math.sin((k-s-1)/s*Math.PI/2);if(Math.abs(p[a])<1e-6)p[a]=k<=s?-1e-6:1e-6;l+=p[a]*p[a]}l=Math.sqrt(l)||1;
     const o=[0,0,0];for(let a=0;a<3;a++){const dn=p[a]/l;o[a]=Math.sign(p[a])*(H[a]-r)+dn*r;v[a]=dn}P.setXYZ(i,o[0],o[1],o[2]);N.setXYZ(i,v[0],v[1],v[2])}
    return g};
   const vc=new T.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:0}),gold=new T.MeshStandardMaterial({color:PAL.gold,metalness:.85,roughness:.3});
   // parts: [geometry, colour, x,y,z, rx,ry,rz, sx,sy,sz] merged into one geometry with a colour attribute
   const _m=new T.Matrix4(),_e=new T.Euler(),_q=new T.Quaternion(),_v=new T.Vector3(),_s=new T.Vector3(),_n=new T.Matrix3(),_c=new T.Color();
   const merge=(parts,withCol)=>{let nv=0,ni=0;for(const q of parts){nv+=q[0].attributes.position.count;ni+=q[0].index?q[0].index.count:q[0].attributes.position.count}
    const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),col=withCol?new Float32Array(nv*3):null,ind=new Uint32Array(ni);let vo=0,io=0;
    for(const[g,c,x,y,z,rx,ry,rz,sx,sy,sz]of parts){_m.compose(_v.set(x||0,y||0,z||0),_q.setFromEuler(_e.set(rx||0,ry||0,rz||0)),_s.set(sx||1,sy||sx||1,sz||sx||1));_n.getNormalMatrix(_m);if(col)_c.set(c);
     const P=g.attributes.position,N=g.attributes.normal;for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i).applyMatrix4(_m);pos.set([_v.x,_v.y,_v.z],(vo+i)*3);_v.fromBufferAttribute(N,i).applyMatrix3(_n).normalize();nor.set([_v.x,_v.y,_v.z],(vo+i)*3);if(col)col.set([_c.r,_c.g,_c.b],(vo+i)*3)}
     const I=g.index,cnt=I?I.count:P.count;for(let k=0;k<cnt;k++)ind[io++]=vo+(I?I.getX(k):k);vo+=P.count;g.dispose()}
    const o=new T.BufferGeometry();o.setAttribute('position',new T.BufferAttribute(pos,3));o.setAttribute('normal',new T.BufferAttribute(nor,3));if(col)o.setAttribute('color',new T.BufferAttribute(col,3));o.setIndex(new T.BufferAttribute(ind,1));o.computeBoundingSphere();return o};
   const S=(r,a,b)=>new T.SphereGeometry(r,a||16,b||12),CY=(a,b,h,n)=>new T.CylinderGeometry(a,b,h,n||24),HY=1.92;
   const mesh=(geo,m,par,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x||0,y||0,z||0);o.castShadow=true;o.receiveShadow=true;par.add(o);return o};
   const g=new T.Group(),m=new T.Group();g.add(m);m.scale.setScalar(.85); // ~2.35 m to the top of the hat: about 1.35x a citizen
   // ---- body, head and hat: one vertex-coloured mesh ----
   const B=[[RB(.82,.86,.52,.16,3),PAL.suit,0,1.08,0],[RB(.26,.24,.03,.02),PAL.shirt,0,1.36,.262],[RB(.08,.3,.03,.015),PAL.tie,0,1.2,.282],[RB(.11,.07,.035,.015),PAL.tie,0,1.36,.29],
    [new T.BoxGeometry(1.0,.17,.04),PAL.sash,0,1.12,-.285,0,0,.62],[new T.BoxGeometry(.92,.17,.04),PAL.sash,-.01,1.11,.285,0,0,-.62],
    [RB(.3,.1,.3,.05),PAL.skin,0,1.52,0], // neck
    [S(.42,28,20),PAL.skin,0,HY,0,0,0,0,1,1.02,.95],[S(.09),PAL.skin,0,HY-.02,.4]];
   for(const s of[-1,1]){B.push([S(.055,12,10),PAL.eye,s*.15,HY+.08,.36],[S(.018,8,6),PAL.shirt,s*.15+.018,HY+.1,.405],[RB(.14,.035,.03,.012),PAL.brow,s*.15,HY+.19,.37,0,0,s*-.12],[S(.09,12,10),PAL.skin,s*.42,HY,0],
    [new T.CapsuleGeometry(.04,.14,4,8),PAL.hair,s*.09,HY-.08,.4,0,0,s*1.25],[S(.16,12,10),PAL.hair,s*.32,HY+.1,-.16,0,0,0,.6,1,1.35])}
   B.push([new T.TorusGeometry(.12,.018,6,16,Math.PI),PAL.mouth,0,HY-.13,.37,0,0,Math.PI],
    [CY(.5,.5,.04,32),PAL.hat,0,HY+.36,0],[CY(.3,.32,.48,24),PAL.hat,0,HY+.6,0],[CY(.325,.325,.09,24),PAL.sash,0,HY+.42,0]);
   const body=mesh(merge(B,true),vc,m);
   // gold buttons and the medal on the sash
   mesh(merge([[S(.028,10,8),0,0,.98,.27],[S(.028,10,8),0,0,.84,.27],[CY(.09,.09,.04,20),0,.25,.8,.3,Math.PI/2],[CY(.05,.05,.05,14),0,.25,.8,.31,Math.PI/2]],false),gold,m);
   // MAYOR lettering on the front of the sash
   {const c=document.createElement('canvas');c.width=512;c.height=88;const x=c.getContext('2d');x.fillStyle='#ff7a1a';x.fillRect(0,0,512,88);x.strokeStyle='#f2c14e';x.lineWidth=8;x.strokeRect(4,4,504,80);
    x.fillStyle='#ffffff';x.font='bold 60px Arial, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('MAYOR',256,47);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;
    const p=mesh(new T.PlaneGeometry(.92,.17),new T.MeshStandardMaterial({map:t,roughness:.5}),m,-.01,1.11,.308);p.rotation.z=-.62;p.castShadow=false}
   // ---- legs (hip pivots) and arms (shoulder pivots) ----
   const legG=merge([[RB(.26,.62,.3,.08),PAL.trous,0,-.31,0],[RB(.3,.14,.44,.06),PAL.shoe,0,-.6,.06]],true);
   const armG=merge([[RB(.22,.62,.24,.09),PAL.suit,0,-.28,0],[RB(.2,.06,.22,.025),PAL.shirt,0,-.58,0],[S(.12,14,10),PAL.skin,0,-.68,0]],true);
   const legs=[-1,1].map(s=>{const p=new T.Group();p.position.set(s*.16,.67,0);m.add(p);mesh(legG,vc,p);return p});
   const arms=[-1,1].map(s=>{const p=new T.Group();p.position.set(s*.5,1.42,0);m.add(p);mesh(armG,vc,p);return p});
   // ---- the golden wrench, held as a cane in his left hand (the right one waves) (grip at the hand, ring end on the ground) ----
   const wr=mesh(merge([[RB(.095,.74,.065,.025),0,0,-.17,0],[RB(.3,.12,.07,.03),0,0,.24,0],[RB(.085,.2,.07,.03),0,-.108,.38,0],[RB(.085,.2,.07,.03),0,.108,.38,0],[new T.TorusGeometry(.1,.04,8,20),0,0,-.66,0]],false),gold,arms[1],0,-.68,.1);
   g.userData.nm=1; // it moves: never merged
   return {g,m,body,legs,arms,wr,PAL,mats:[vc,gold]}};
  // pose: ph = walk phase (radians), walk 0..1, wave 0..1 (left arm up), t = time (s)
  const mayorPose=(R,ph,walk,wave,t)=>{const sw=Math.sin(ph)*walk;R.legs[0].rotation.x=sw*.5;R.legs[1].rotation.x=-sw*.5;
   R.arms[1].rotation.set(-.3+sw*.22,0,.12);R.wr.rotation.set(.3-sw*.12,0,-.12);
   const wv=wave*wave*(3-2*wave);R.arms[0].rotation.set(-sw*.4*(1-wv)-.15*wv,0,-.1-wv*(2.45+.32*Math.sin(t*9)));
   R.m.position.y=Math.abs(Math.sin(ph))*.045*walk+(1-walk)*.008*Math.sin(t*2.2);R.m.rotation.z=Math.sin(ph)*.03*walk;R.m.rotation.x=.03*walk};
  /*MAYOR-BUILD-END*/
  if(CITY2&&F.cityhall&&F.oldtown&&!/[?&]mayor=0\b/.test(location.search)){
   const[hx,hz]=F.cityhall,[OX,OZ]=F.oldtown,ry=Math.atan2(OX-hx,OZ-hz),cs=Math.cos(ry),sn=Math.sin(ry);
   const L2W=(lx,lz)=>[hx+lx*cs+lz*sn,hz-lx*sn+lz*cs],W2Lz=(x,z)=>(x-hx)*sn+(z-hz)*cs;
   // "MAYOR'S OFFICE" sign on two posts beside the City Hall steps
   {const[sx,sz]=L2W(7,10.8),sg=new T.Group();sg.position.set(sx,0,sz);sg.rotation.y=ry;for(const s of[-1,1])B0(sg,.14,1.5,.14,mat.dark,s*1.55,0,0);
    sg.add(sign("MAYOR'S OFFICE",3.2,.72,'#1f3a6e','#ffd34d',0,1.75,0,0));B0(sg,3.5,.1,.3,M(0xff7a1a),0,2.27,0,false);root.add(sg)}
   const R=mayorBuild(T),g=R.g;root.add(g);
   // the loop: entrance (top of the steps) -> down the steps -> an arc on the City Hall side of the square (clear of the
   // fountain, the clock tower and the lanes) -> back up the steps. Metres along the path.
   const P=[L2W(0,8.6),L2W(0,13.4)],HA=Math.atan2(hz-OZ,hx-OX),ARC=[HA+.85,HA-.55];
   for(let k=0;k<=12;k++){const a=ARC[0]+(ARC[1]-ARC[0])*k/12;P.push([OX+Math.cos(a)*9,OZ+Math.sin(a)*9])}
   P.push(L2W(0,13.4),L2W(0,8.6));const SL=[0];for(let k=1;k<P.length;k++)SL.push(SL[k-1]+Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]));const LEN=SL[SL.length-1],sMid=(SL[2]+SL[14])/2;
   const at=s=>{s=Math.max(0,Math.min(LEN,s));let k=1;while(k<SL.length-1&&SL[k]<s)k++;const u=(s-SL[k-1])/((SL[k]-SL[k-1])||1);return[P[k-1][0]+(P[k][0]-P[k-1][0])*u,P[k-1][1]+(P[k][1]-P[k-1][1])*u]};
   // ground height: the plinth (1.2 m) and its three 0.3 m steps (local z 9..12 in front of the hall)
   const ss=x=>x<=0?0:x>=1?1:x*x*(3-2*x),hgt=(x,z)=>{const lz=W2Lz(x,z);let y=1.2;for(const e of[9,10,11,12])y-=.3*ss((lz-e)/.2+.5);return Math.max(y,.02)};
   const V=1.05,IDLE=30,STOP=4.5,T1=IDLE,T2=T1+sMid/V,T3=T2+STOP,T4=T3+(LEN-sMid)/V,CYC=T4;
   const angTo=(a,b,u)=>{let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return a+d*Math.min(1,Math.max(0,u))};
   const head=s=>{const a=at(s-.7),b=at(s+.7);return Math.atan2(b[0]-a[0],b[1]-a[1])};const toSq=(x,z)=>Math.atan2(OX-x,OZ-z);
   let mt=2;const st={x:0,z:0,y:0,ry:ry,walk:0,state:'idle'};
   const place=dt=>{const t=((mt%CYC)+CYC)%CYC;let s=0,walk=0,wave=0,face=ry;
    if(t<T1){face=angTo(head(LEN-.01),ry,t/1.6);const w=(a,b)=>t>a&&t<b?Math.min(1,(t-a)/.35,(b-t)/.35):0;wave=Math.max(w(3.5,7),w(18,21.5))}
    else if(t<T2){s=(t-T1)*V;walk=Math.min(1,(t-T1)/.4,(T2-t)/.4);face=head(s)}
    else if(t<T3){s=sMid;const u=t-T2,p=at(s);face=angTo(head(s),toSq(p[0],p[1]),u/.8);if(u>STOP-.8)face=angTo(toSq(p[0],p[1]),head(s),(u-(STOP-.8))/.8);wave=u>.8&&u<STOP-1?Math.min(1,(u-.8)/.35,(STOP-1-u)/.35):0}
    else{s=sMid+(t-T3)*V;walk=Math.min(1,(t-T3)/.4,(T4-t)/.4);face=head(s)}
    const p=at(s);st.x=p[0];st.z=p[1];st.y=hgt(p[0],p[1]);st.ry=face;st.walk=walk;st.state=walk>0?'walk':wave>0?'wave':'idle';
    g.position.set(st.x,st.y,st.z);g.rotation.y=face;
    if(!lodPersonFrozen(g))mayorPose(R,s/.95*Math.PI,walk,wave,mt)};
   place(0);W3.anim.push((tt,dt)=>{mt+=dt||0;place(dt)});
   // name tag (drawn by view3d/labels.js with the people tags)
   W3.tags=items=>{if(g.visible)items.push({w:g.position,h:2.75,t:'MAYOR TORQUEBLUEPRINT',kind:'m'})};
   W3.mayor=R;
   // recorder / test hook: pos() = {x,z,y,a,state} (a = heading like the cars: atan2(dz,dx)); seek(t) jumps in the 0..cycle loop
   if(location.hostname==='localhost'||document.documentElement.dataset.rec==='1')window.__MAYOR={pos:()=>({x:st.x,z:st.z,y:st.y,a:Math.PI/2-st.ry,state:st.state,t:((mt%CYC)+CYC)%CYC}),seek:t=>{mt=t;place(0)},cycle:CYC,
    times:{idle:[0,T1],walkOut:[T1,T2],waveSquare:[T2,T3],walkBack:[T3,T4]},g:()=>g}}
