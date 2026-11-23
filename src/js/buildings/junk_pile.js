//@ buildings/junk_pile.js
//@ inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx.... Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
 // junk pile
 let pileG=null,pileN=-1;const pileCols=[0xb5272d,0x2f6fd9,0x8a95a3,0x22252b,0x7a3f2a,0xe8b931,0x2e8b57];
 function syncPile(){const n=isOpen('sucata')?Math.min(48,B.sucata.pile):0;if(n===pileN)return;pileN=n;if(pileG){scene.remove(pileG);pileG=null}if(!n)return;
  const L=LOT.sucata,list=[],cols=[];for(let k=0;k<n;k++){const col=k%6,row=Math.floor(k/6)%4,lay=Math.floor(k/24);list.push([L.x0+15+col*2.9,Y0+.55+lay*1.05,L.z0+8+row*3,0,((k*.37)%.5)-.25,0]);cols.push('#'+pileCols[k%pileCols.length].toString(16).padStart(6,'0'))}
  pileG=inst(new T.BoxGeometry(2.5,1,1.7),M(0xffffff,{roughness:.6,metalness:.3}),list,true,cols)}
