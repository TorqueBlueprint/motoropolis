//@ view3d/geo_merge.js - geoMerge(T, [[mesh, group]...], inverseRootMatrix, material): one indexed BufferGeometry
//@ (position, normal, uv, colour) from parts of several meshes, in the root's space. Used by view3d/merge.js and the car loader.
//@ closure scope (top level of the page IIFE).
function geoMerge(T,items,inv,m){const _mm=new T.Matrix4(),_mn=new T.Matrix3(),_v=new T.Vector3();let nv=0,ni=0;const wantC=!!m.vertexColors;
  const prep=items.map(([o,gr])=>{const g=o.geometry,P=g.attributes.position,idx=g.index;const dr=g.drawRange;let s=Math.max(gr.start,dr.start),e=Math.min(gr.start+(gr.count===Infinity?1e12:gr.count),dr.start+(dr.count===Infinity?1e12:dr.count));
   const n=idx?idx.count:P.count;e=Math.min(e,n);if(e<=s)return null;nv+=P.count;ni+=e-s;return{o,g,s,e}}).filter(Boolean);
  if(!prep.length)return null;const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),col=wantC?new Float32Array(nv*3):null,ind=new Uint32Array(ni);let vo=0,io=0;
  for(const{o,g,s,e}of prep){_mm.multiplyMatrices(inv,o.matrixWorld);_mn.getNormalMatrix(_mm);const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,C=g.attributes.color;
   for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i).applyMatrix4(_mm);pos[(vo+i)*3]=_v.x;pos[(vo+i)*3+1]=_v.y;pos[(vo+i)*3+2]=_v.z;
    if(N){_v.fromBufferAttribute(N,i).applyMatrix3(_mn).normalize();nor[(vo+i)*3]=_v.x;nor[(vo+i)*3+1]=_v.y;nor[(vo+i)*3+2]=_v.z}
    if(U){uv[(vo+i)*2]=U.getX(i);uv[(vo+i)*2+1]=U.getY(i)}if(col){if(C){col[(vo+i)*3]=C.getX(i);col[(vo+i)*3+1]=C.getY(i);col[(vo+i)*3+2]=C.getZ(i)}else col.fill(1,(vo+i)*3,(vo+i)*3+3)}}
   const flip=_mm.determinant()<0,idx=g.index;
   for(let k=s;k<e;k+=3){const a=idx?idx.getX(k):k,b2=idx?idx.getX(k+1):k+1,c=idx?idx.getX(k+2):k+2;ind[io++]=vo+a;if(flip){ind[io++]=vo+c;ind[io++]=vo+b2}else{ind[io++]=vo+b2;ind[io++]=vo+c}}
   vo+=P.count}
  const out=new T.BufferGeometry();out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));out.setAttribute('uv',new T.BufferAttribute(uv,2));if(col)out.setAttribute('color',new T.BufferAttribute(col,3));
  out.setIndex(new T.BufferAttribute(ind,1));out.computeBoundingBox();out.computeBoundingSphere();return out}
