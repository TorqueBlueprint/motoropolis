//@ interiors/news.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // ===== NEWS KIOSK (Motoropolis Daily) =====
 const NK={built:false,v:-1,home:{...STD_HOME,yaw:.1,dist:40}};
 function frontPage(){const c=NK.cv,x=c.getContext('2d'),W=c.width,H=c.height;x.fillStyle='#f4f1e6';x.fillRect(0,0,W,H);x.fillStyle='#1c1d20';
  x.font="800 92px 'Barlow Condensed','Arial Narrow',sans-serif";x.textAlign='center';x.textBaseline='alphabetic';x.fillText('MOTOROPOLIS DAILY',W/2,104);
  x.fillRect(40,124,W-80,5);x.fillRect(40,136,W-80,2);const L=NEWS[0];
  x.font="500 26px 'JetBrains Mono',monospace";x.fillStyle='#5b5f66';x.fillText(L?`DAY ${L.day} · ${L.time} EDITION`:'FIRST EDITION',W/2,172);
  const wrap=(t,y,size,maxL,col)=>{x.font=`700 ${size}px Georgia,'Times New Roman',serif`;x.fillStyle=col;x.textAlign='left';const words=String(t).split(' ');let line='',n=0;
   for(const w of words){const tt=line?line+' '+w:w;if(x.measureText(tt).width>W-100&&line){x.fillText(line,50,y);y+=size*1.12;line=w;if(++n>=maxL-1){}}else line=tt}x.fillText(line,50,y);return y+size*1.12};
  let y=240;if(L){const c2=NCAT[L.k]||NCAT.city;x.fillStyle='#1c1d20';x.fillRect(50,196,190,40);x.fillStyle=c2[1];x.font="800 26px 'Barlow Condensed',sans-serif";x.textAlign='center';x.fillText(c2[0],145,226);y=wrap(L.h,290,58,3,'#1c1d20')+6}
  x.fillStyle='#c9c3b6';x.fillRect(50,y-30,W-100,2);
  for(const n of NEWS.slice(1,5)){if(y>H-40)break;y=wrap('• '+n.h,y+14,32,2,'#33363b')}
  NK.tex.needsUpdate=true}
 function buildKiosk(){const R=room({title:'MOTOROPOLIS DAILY · NEWSROOM & KIOSK',titleW:30,sbg:'#d93a2f',trim:0x2e7d4f,wall:0x1f3a2c,wall2:0x183024,floor:0xb9b2a3,h:14});NK.S=R.S;
  const cols=[0xd93a2f,0x2f6fd9,0xf2b81d,0x3ee08f,0xff7a1a,0x7a3fb0,0xf4f1e6,0x46c8ff];
  // magazine wall on the left
  for(let lv=0;lv<4;lv++){R.B2(20,.18,1.2,mat.wood,-14,.6+lv*1.6,-10.2,false);for(let k=0;k<12;k++){const mg=R.B2(1.2,1.4,.1,M(cols[(k*3+lv)%8]),-23.2+k*1.65,.8+lv*1.6,-10.3,false);mg.rotation.x=-.15}}
  // newspaper stacks on two tables
  for(const tx of[-14,-6]){R.B2(5,1.6,2.6,mat.wood,tx,0,-3);for(let k=0;k<3;k++){R.B2(1.3,.35+k*.12,1.8,M(0xf4f1e6),tx-1.6+k*1.6,1.6,-3,false);R.B2(1.3,.04,1.8,M(0x1c1d20),tx-1.6+k*1.6,1.95+k*.12,-3.2,false)}}
  // the newsroom: reporters' desks with screens
  NK.rep=[];[-18,-10,-2].forEach((dx,i)=>{R.B2(5,1.5,2.4,M(0xe9e5dc),dx,0,5);R.B2(1.8,1.2,.15,mat.dark,dx-1,1.5,4.4);const sc=R.B2(1.6,1,.05,M(0x46c8ff,{emissive:0x46c8ff,emissiveIntensity:.6}),dx-1,1.6,4.5,false);R.B2(.9,.06,.4,mat.dark,dx+.9,1.5,4.8,false);R.B2(.6,.4,.6,mat.dark,dx-1,1.5,4.4,false);const pr=R.B2(.9,.12,1.2,M(0xf4f1e6),dx+1.4,1.5,5.1,false);pr.rotation.y=.3;R.B2(1.2,.9,.5,M(0x2b3440),dx-1,0,7.5);if(i!==1){const m=mkP(NK.S,['#7a3fb0','#3fa7c4'][i?1:0],170+i,'Reporter');putP(m,{x:dx-1,z:6.7,ang:Math.PI},false);NK.rep.push(m)}});
  // today's front page on the back wall
  NK.cv=document.createElement('canvas');NK.cv.width=1024;NK.cv.height=640;NK.tex=new T.CanvasTexture(NK.cv);NK.tex.colorSpace=T.SRGBColorSpace;NK.tex.anisotropy=8;
  R.B2(13.4,8.6,.3,mat.dark,12,1.1,-10.6,false);const fp=new T.Mesh(new T.PlaneGeometry(12.8,8),new T.MeshBasicMaterial({map:NK.tex,toneMapped:false}));fp.position.set(12,5.4,-10.4);R.add(fp);
  // counter with the vendor
  R.B2(8,1.4,2.4,M(0x2e7d4f),14,0,2);R.B2(8.3,.15,2.6,M(0xe9e5dc),14,1.4,2);R.B2(.9,.7,.7,mat.dark,12.4,1.55,1.8);for(let k=0;k<4;k++)R.B2(.5,.6,.5,M(cols[k]),15+k*.7,1.55,2.4,false);
  const v=mkP(NK.S,'#2e7d4f',160,'Newspaper Vendor');putP(v,{x:14,z:-.4,ang:0},false);NK.vendor=v;
  NK.L=[0,1,2,3].map(i=>mkP(NK.S,null,161+i,'civ'));NK.v=-1;frontPage();NK.built=true}
 function syncKiosk(){if(NK.v!==NEWSV){NK.v=NEWSV;frontPage()}
  NK.vendor.rotation.y=Math.sin(simTime*.7)*.5;
  const paths=[[[24,9],[14,4.6],[24,9]],[[24,9],[4,-.6],[-6,-.6],[14,4.6],[24,9]],[[24,9],[4,-.6],[-14,-.6],[-16,-8.4],[-14,-.6],[14,4.6],[24,9]],[[24,9],[12,-7.8],[8,-1],[9,4.6],[14,4.6],[24,9]]];
  NK.rep.forEach((m,k)=>{m.rotation.y=Math.PI+Math.sin(simTime*(.6+k*.2))*.25;m.position.y=0});
  NK.L.forEach((m,k)=>loopP(m,paths[k],22+k*3,k*.27,.12))}
 function labelsKiosk(){staffTag(NK.vendor,'news','Newspaper Vendor',0,4.4);NK.rep.forEach((m,k)=>staffTag(m,'news','Reporter',k,4.4));header('INSIDE MOTOROPOLIS DAILY')}
