//@ view3d/renderer.js - opens make3D(T,X) (closed in view3d/frame.js)
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
function make3D(T,X){
 const renderer=new T.WebGLRenderer({canvas:c3,antialias:QUAL!=='low',powerPreference:'high-performance'});
 renderer.shadowMap.enabled=QUAL!=='low';renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene();const camera=new T.PerspectiveCamera(34,16/9,1,WORLD?3400:1600);
 const U=v=>v/10,XS3=XS.map(U),YS3=YS.map(U),H3=U(HALF),CX=U(CW/2),CZ=U((YS[0]+YS[NY-1])/2);
 const M=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o||{}));
 const mat={grass:M(0x76a253),grass2:M(0x5f8f45),asphalt:M(0x363a42,{roughness:.95}),curb:M(0xc9c3b6),pad:M(0xd9d4c8),dash:M(0xf2f0e8),lotAsph:M(0x8f949b),
  wall:M(0xe9e5dc),wall2:M(0xcfd6de),wall3:M(0xd8c9b0),roof:M(0x59616d),roofD:M(0x3d434c),glass:M(0x7fbfe8,{roughness:.12,metalness:.25,transparent:true,opacity:.62}),
  carGlass:M(0x1d2a38,{roughness:.15,metalness:.4}),orange:M(0xff7a1a),yellow:M(0xf2b81d),red:M(0xd93a2f),blue:M(0x2f6fd9),cyan:M(0x3fa7c4),dark:M(0x22252b),
  steel:M(0xaab4c0,{metalness:.6,roughness:.35}),chrome:M(0xdfe6ee,{metalness:.9,roughness:.2}),dirt:M(0xa08a66),trunk:M(0x6b4a2b),tire:M(0x16181c),
  win:M(0x2a3a4c,{emissive:0xffd58a,emissiveIntensity:0}),track:M(0x3a3e45),kerbR:M(0xe33b2e),kerbW:M(0xf4f4f0),black:M(0x15171b),grey:M(0x8a95a3),
  frame:M(0x7d8a99,{metalness:.5,roughness:.4}),wood:M(0xb08a5a),hl:M(0xfff4c2,{emissive:0xfff4c2,emissiveIntensity:.15}),tailOff:M(0x8a1a14,{emissive:0xff2a1a,emissiveIntensity:.25}),
  tailOn:M(0xff3a2a,{emissive:0xff2a1a,emissiveIntensity:2.2}),beacon:M(0xffb000,{emissive:0xffb000,emissiveIntensity:1}),lamp:M(0xfff1cc,{emissive:0xffd58a,emissiveIntensity:0}),
  tlG:new T.MeshBasicMaterial({color:0x38e07b}),tlY:new T.MeshBasicMaterial({color:0xffc83a}),tlR:new T.MeshBasicMaterial({color:0xff3b30}),
  lampOn:M(0x38e07b,{emissive:0x38e07b,emissiveIntensity:1.5}),lampOff:M(0x555a62)};
 const signMats=[];
 const BOX=new T.BoxGeometry(1,1,1);
 function box(w,h,d,m,x,y,z,cast){const g=new T.Mesh(BOX,m);g.scale.set(w,h,d);g.position.set(x,y+h/2,z);g.castShadow=cast!==false;g.receiveShadow=true;return g}
 function labelTex(txt,bg,fg,w,h,font){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);
  x.fillStyle=fg;let f=font;x.font=`800 ${f}px 'Barlow Condensed','Arial Narrow',sans-serif`;x.textAlign='center';x.textBaseline='middle';while(x.measureText(txt).width>w-36&&f>14){f-=2;x.font=`800 ${f}px 'Barlow Condensed','Arial Narrow',sans-serif`}
  x.fillText(txt,w/2,h/2+3);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t}
 function sign(txt,w,h,bg,fg,x,y,z,ry){const cw=Math.min(2048,Math.max(256,Math.round(128*w/h)));const tex=labelTex(txt,bg,fg,cw,128,78);
  const sm=new T.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:0xffffff,emissiveIntensity:0,roughness:.6});signMats.push(sm);
  const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry||0;const back=new T.Mesh(BOX,mat.dark);back.scale.set(w+.3,h+.3,.25);back.castShadow=true;g.add(back);
  const pg=new T.PlaneGeometry(w,h);const m=new T.Mesh(pg,sm);m.position.z=.14;g.add(m);const m2=new T.Mesh(pg,sm);m2.position.z=-.14;m2.rotation.y=Math.PI;g.add(m2);return g}
 function inst(geo,m,list,cast,colors){const im=new T.InstancedMesh(geo,m,list.length);const o=new T.Object3D();const col=new T.Color();
  list.forEach((p,k)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(p[3]||0,p[4]||0,p[5]||0);const s=p[6]||1;o.scale.set(s,p[7]||s,s);o.updateMatrix();im.setMatrixAt(k,o.matrix);if(colors)im.setColorAt(k,col.set(colors[k]))});
  im.castShadow=!!cast;im.receiveShadow=true;scene.add(im);return im}
 let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
