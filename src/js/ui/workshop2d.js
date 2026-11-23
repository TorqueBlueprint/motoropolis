//@ ui/workshop2d.js
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py
// ---------- the workshop (inside the repair shop) ----------
const Workshop=(function(){
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const back=x=>{x=clamp(x);const c1=1.15,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);};
const eo=x=>1-Math.pow(1-clamp(x),3);
const eio=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;};
const pop=(t,s,d=0.6)=>t<s?0:back((t-s)/d);
const f=n=>(+n).toFixed(2);
function G(inner,{x=0,y=0,s=1,r=0,o=1}={}){return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(${f(s)})" opacity="${f(o)}">${inner}</g>`;}
function popG(inner,t,s,x,y,r=0,base=1){const k=pop(t,s);if(k<=0)return '';return G(inner,{x,y,s:k*base,r,o:clamp(k*3)});}
// ================= TORQUE BLUEPRINT WORKSHOP v2 (9:16, detailed 2D) =================
const UNLOCKS=[[10,'TOOL CHEST'],[25,'TIRE RACK'],[50,'AIR COMPRESSOR'],[100,'CAR LIFT'],[250,'PROJECT CAR'],[500,'SECOND CAR'],[1000,'PAINT BOOTH'],[5000,'DYNO'],[10000,'NEON HQ SIGN']];
const RX=40,RY=430,RW=1000,RH=1220,WALLB=1300,FRONT=1600;
const P={wall1:'#14304f',wall2:'#0c2038',floor1:'#1a3554',floor2:'#0a1a2e',wood1:'#c08a4a',wood2:'#8a5a2b',red1:'#ff6b57',red2:'#c23a2c',chrome1:'#f2f6fb',chrome2:'#8aa0b8',tyre:'#151a22',glass:'#7fd7ff',brass:'#e9c46a',ink:'#eef3fb',dark:'#071a2d',yel:'#ffd34d',green:'#3ee08f'};
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
const DEF2=`<defs>
<linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.wall2}"/><stop offset="1" stop-color="${P.wall1}"/></linearGradient>
<linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22466c"/><stop offset="1" stop-color="${P.floor2}"/></linearGradient>
<linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.wood1}"/><stop offset="1" stop-color="${P.wood2}"/></linearGradient>
<linearGradient id="gRed" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.red2}"/><stop offset=".35" stop-color="${P.red1}"/><stop offset="1" stop-color="${P.red2}"/></linearGradient>
<linearGradient id="gChrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.chrome1}"/><stop offset=".5" stop-color="${P.chrome2}"/><stop offset="1" stop-color="#dfe7f1"/></linearGradient>
<linearGradient id="gYel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9a91f"/><stop offset=".4" stop-color="#ffd34d"/><stop offset="1" stop-color="#c9971a"/></linearGradient>
<linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fe3ff" stop-opacity=".55"/><stop offset=".5" stop-color="#46c8ff" stop-opacity=".18"/><stop offset="1" stop-color="#9fe3ff" stop-opacity=".4"/></linearGradient>
<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6fa8"/><stop offset="1" stop-color="#8fd3ff"/></linearGradient>
<linearGradient id="gBooth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfffe0"/><stop offset="1" stop-color="#3ee08f"/></linearGradient>
<linearGradient id="gCarBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd7ff"/><stop offset=".55" stop-color="#2a86c9"/><stop offset="1" stop-color="#174d7a"/></linearGradient>
<linearGradient id="gCarRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a85"/><stop offset=".55" stop-color="#e2402f"/><stop offset="1" stop-color="#8f2219"/></linearGradient>
<linearGradient id="gCarYel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".55" stop-color="#f2b81d"/><stop offset="1" stop-color="#9a6d06"/></linearGradient>
<radialGradient id="gCone" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff6d6" stop-opacity=".38"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>
<radialGradient id="gPool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d6" stop-opacity=".22"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>
<radialGradient id="gShadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<radialGradient id="gHalo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd34d" stop-opacity=".35"/><stop offset="1" stop-color="#ffd34d" stop-opacity="0"/></radialGradient>
<pattern id="pBrick" width="80" height="40" patternUnits="userSpaceOnUse"><rect width="80" height="40" fill="none"/><path d="M0 0H80M0 20H80M0 0V20M40 20V40" stroke="#ffffff" stroke-opacity=".05" stroke-width="2"/></pattern>
<pattern id="pPeg" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="2.6" fill="#1b130b"/></pattern>
<pattern id="pWood" width="120" height="14" patternUnits="userSpaceOnUse"><path d="M0 7 Q30 4 60 7 T120 7" stroke="#6b4320" stroke-opacity=".35" stroke-width="2" fill="none"/></pattern>
<filter id="soft"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="neon"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<clipPath id="room"><rect x="${RX}" y="${RY}" width="${RW}" height="${RH}" rx="34"/></clipPath>
</defs>`;
const sh=(x,y,w,h=26,o=1)=>`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w/2)}" ry="${f(h/2)}" fill="url(#gShadow)" opacity="${f(o)}"/>`;
const tx=(s,x,y,size,col=P.ink,w=900,a='middle',extra='')=>`<text x="${f(x)}" y="${f(y)}" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="${w}" font-size="${size}" fill="${col}" text-anchor="${a}" ${extra}>${s}</text>`;

// ---------- detailed props ----------
function wheel2(x,y,r,rot=0){let o=`<circle cx="${x}" cy="${y}" r="${r}" fill="${P.tyre}"/><circle cx="${x}" cy="${y}" r="${r*0.92}" fill="none" stroke="#2a3140" stroke-width="${r*0.08}"/><circle cx="${x}" cy="${y}" r="${r*0.62}" fill="url(#gChrome)"/>`;
  for(let k=0;k<5;k++){const a=rot+k*Math.PI*2/5;o+=`<line x1="${x}" y1="${y}" x2="${f(x+r*0.55*Math.cos(a))}" y2="${f(y+r*0.55*Math.sin(a))}" stroke="#5c6f86" stroke-width="${f(r*0.16)}" stroke-linecap="round"/>`;}
  return o+`<circle cx="${x}" cy="${y}" r="${r*0.16}" fill="#3a4a5e"/>`;}
function coupe(x,y,s,grad,rot=0){ // y = ground line, centered x; length ~ 420*s
  const g=v=>f(v*s);let o=`<g transform="translate(${f(x)} ${f(y)})">`;
  o+=`<path d="M ${g(-205)} ${g(-40)} Q ${g(-210)} ${g(-78)} ${g(-170)} ${g(-88)} L ${g(-95)} ${g(-100)} Q ${g(-55)} ${g(-150)} ${g(10)} ${g(-152)} Q ${g(75)} ${g(-150)} ${g(118)} ${g(-104)} L ${g(185)} ${g(-92)} Q ${g(214)} ${g(-84)} ${g(212)} ${g(-50)} L ${g(208)} ${g(-26)} Q ${g(205)} ${g(-14)} ${g(190)} ${g(-14)} L ${g(-190)} ${g(-14)} Q ${g(-206)} ${g(-16)} ${g(-205)} ${g(-40)} Z" fill="url(#${grad})" stroke="${P.dark}" stroke-width="${g(3)}"/>`;
  o+=`<path d="M ${g(-80)} ${g(-102)} Q ${g(-48)} ${g(-142)} ${g(5)} ${g(-143)} L ${g(5)} ${g(-102)} Z" fill="#0d2238" opacity=".9"/><path d="M ${g(15)} ${g(-143)} Q ${g(70)} ${g(-140)} ${g(102)} ${g(-104)} L ${g(15)} ${g(-102)} Z" fill="#0d2238" opacity=".9"/>`;
  o+=`<path d="M ${g(-70)} ${g(-108)} Q ${g(-45)} ${g(-136)} ${g(-15)} ${g(-138)}" stroke="#ffffff" stroke-opacity=".45" stroke-width="${g(4)}" fill="none"/>`;
  o+=`<path d="M ${g(-190)} ${g(-60)} L ${g(195)} ${g(-60)}" stroke="#ffffff" stroke-opacity=".25" stroke-width="${g(3)}"/><rect x="${g(188)}" y="${g(-76)}" width="${g(20)}" height="${g(12)}" rx="${g(4)}" fill="#fff6c2"/><rect x="${g(-206)}" y="${g(-72)}" width="${g(14)}" height="${g(12)}" rx="${g(3)}" fill="#ff5a4e"/>`;
  o+=`<line x1="${g(10)}" y1="${g(-100)}" x2="${g(10)}" y2="${g(-30)}" stroke="${P.dark}" stroke-opacity=".35" stroke-width="${g(2)}"/><rect x="${g(30)}" y="${g(-66)}" width="${g(22)}" height="${g(5)}" rx="${g(2)}" fill="#dfe7f1"/>`;
  o+=wheel2(g(-122),g(-14),g(38),rot)+wheel2(g(128),g(-14),g(38),rot);
  return o+'</g>';}
function bench(x,y){ // x left, y floor; width 380
  let o=sh(x+190,y+4,420,30);
  o+=`<rect x="${x+12}" y="${y-190}" width="16" height="190" fill="#3a4a5e"/><rect x="${x+352}" y="${y-190}" width="16" height="190" fill="#3a4a5e"/>`;
  o+=`<rect x="${x+200}" y="${y-180}" width="150" height="170" rx="6" fill="#2b5c8f" stroke="${P.dark}" stroke-width="3"/>`;
  for(let i=0;i<4;i++)o+=`<rect x="${x+208}" y="${y-172+i*41}" width="134" height="35" rx="4" fill="#3c76b0"/><rect x="${x+255}" y="${y-158+i*41}" width="40" height="7" rx="3" fill="url(#gChrome)"/>`;
  o+=`<rect x="${x}" y="${y-212}" width="380" height="26" rx="4" fill="url(#gWood)" stroke="${P.dark}" stroke-width="3"/><rect x="${x}" y="${y-212}" width="380" height="26" rx="4" fill="url(#pWood)"/>`;
  return o;}
function jar2(x,y,n,t,dropFrom){ // y = bench top
  let o=sh(x,y,170,14,.6);
  o+=`<path d="M ${x-70} ${y-230} L ${x-70} ${y-14} Q ${x-70} ${y} ${x-56} ${y} L ${x+56} ${y} Q ${x+70} ${y} ${x+70} ${y-14} L ${x+70} ${y-230}" fill="rgba(160,225,255,.10)" stroke="#bfe9ff" stroke-width="4"/>`;
  for(let i=0;i<n;i++){const col=i%7,row=Math.floor(i/7);let bx=x-54+col*18+(row%2?9:0),by=y-12-row*15.5;
    if(dropFrom!=null&&i>=dropFrom){const k=clamp((t-0.5-(i-dropFrom)*Math.min(0.06,2/Math.max(1,n-dropFrom)))/0.45);if(k<=0)continue;by=y-330+(by-y+330)*(1-Math.pow(1-k,3));}
    const c=i%9===0?'#e9b54a':'#cfd9e5';let p='';for(let q=0;q<6;q++){const a=Math.PI/3*q;p+=(q?'L':'M')+f(bx+8*Math.cos(a))+' '+f(by+8*Math.sin(a));}
    o+=`<path d="${p}Z" fill="${c}" stroke="#2c3e55" stroke-width="1.5"/><circle cx="${f(bx)}" cy="${f(by)}" r="2.6" fill="#2c3e55"/>`;}
  o+=`<rect x="${x-76}" y="${y-252}" width="152" height="26" rx="8" fill="url(#gChrome)" stroke="#5c6f86" stroke-width="2"/>`;
  o+=`<path d="M ${x-56} ${y-212} L ${x-56} ${y-30}" stroke="#ffffff" stroke-opacity=".45" stroke-width="6" stroke-linecap="round"/>`;
  o+=`<rect x="${x-50}" y="${y-150}" width="100" height="40" rx="6" fill="#f4f1e6"/>`+tx('BOLTS',x,y-122,22,P.dark);
  return o;}
function crate2(x,y,label,w=74,h=50){return `<rect x="${x-w/2}" y="${y-h}" width="${w}" height="${h}" rx="4" fill="url(#gWood)" stroke="#5a3a1a" stroke-width="2.5"/><rect x="${x-w/2}" y="${y-h}" width="${w}" height="${h}" fill="url(#pWood)"/><line x1="${x-w/2}" y1="${y-h/2}" x2="${x+w/2}" y2="${y-h/2}" stroke="#5a3a1a" stroke-width="2" opacity=".5"/>`+tx(label,x,y-h/2+8,20,'#2b1a08');}
function chest(x,y){let o=sh(x,y+2,130,22);o+=`<rect x="${x-55}" y="${y-170}" width="110" height="160" rx="8" fill="url(#gRed)" stroke="${P.dark}" stroke-width="3"/>`;
  for(let i=0;i<5;i++)o+=`<rect x="${x-46}" y="${y-160+i*30}" width="92" height="24" rx="3" fill="#ff7d6b" opacity=".35"/><rect x="${x-22}" y="${y-151+i*30}" width="44" height="6" rx="3" fill="url(#gChrome)"/>`;
  o+=`<circle cx="${x-40}" cy="${y-4}" r="8" fill="#1d232c"/><circle cx="${x+40}" cy="${y-4}" r="8" fill="#1d232c"/>`;return o;}
function tireRack2(x,y){let o=sh(x,y+2,120,22);o+=`<rect x="${x-52}" y="${y-300}" width="8" height="300" fill="#4b5d73"/><rect x="${x+44}" y="${y-300}" width="8" height="300" fill="#4b5d73"/>`;
  for(let i=0;i<4;i++){const yy=y-36-i*70;o+=`<rect x="${x-50}" y="${yy-30}" width="100" height="62" rx="30" fill="${P.tyre}"/>`;for(let k=0;k<5;k++)o+=`<line x1="${x-38+k*18}" y1="${yy-28}" x2="${x-44+k*18}" y2="${yy+30}" stroke="#2a3140" stroke-width="5"/>`;o+=`<rect x="${x-56}" y="${yy+30}" width="112" height="6" fill="#4b5d73"/>`;}
  return o;}
function compressor2(x,y){let o=sh(x,y+2,180,24);o+=`<rect x="${x-80}" y="${y-86}" width="160" height="70" rx="35" fill="url(#gRed)" stroke="${P.dark}" stroke-width="3"/><rect x="${x-50}" y="${y-140}" width="70" height="50" rx="8" fill="#4b5d73"/><circle cx="${x+40}" cy="${y-110}" r="18" fill="#f4f1e6" stroke="${P.dark}" stroke-width="3"/><line x1="${x+40}" y1="${y-110}" x2="${x+50}" y2="${y-118}" stroke="${P.dark}" stroke-width="3"/>`;
  o+=`<circle cx="${x-55}" cy="${y-12}" r="12" fill="#1d232c"/><circle cx="${x+55}" cy="${y-12}" r="12" fill="#1d232c"/><path d="M ${x+80} ${y-60} q 30 8 24 40" fill="none" stroke="#ffd34d" stroke-width="6"/>`;return o;}
function lift2(x,y,carOn,t){let o=sh(x,y+4,420,30);const H=300;
  for(const px of [x-180,x+180])o+=`<rect x="${px-18}" y="${y-H}" width="36" height="${H}" fill="url(#gYel)" stroke="${P.dark}" stroke-width="3"/><rect x="${px-26}" y="${y-8}" width="52" height="10" fill="#4b5d73"/><rect x="${px-10}" y="${y-H+20}" width="20" height="${H-40}" fill="#b78a12" opacity=".35"/>`;
  o+=`<rect x="${x-200}" y="${y-H-14}" width="400" height="14" rx="4" fill="url(#gYel)" stroke="${P.dark}" stroke-width="3"/>`;
  const ay=y-150;o+=`<rect x="${x-172}" y="${ay}" width="140" height="10" fill="url(#gChrome)"/><rect x="${x+32}" y="${ay}" width="140" height="10" fill="url(#gChrome)"/>`;
  if(carOn)o+=coupe(x,ay,0.82,'gCarRed',0);
  o+=tx('2-POST LIFT',x,y-H-24,18,'#ffd34d',800,'middle','letter-spacing="3"');return o;}
function boothWin(x,y,w,h,t){let o=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="url(#gBooth)" opacity=".85"/>`;
  o+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="url(#gGlass)"/>`;
  o+=`<path d="M ${x+40} ${y+h-30} q ${w/2-40} -70 ${w-80} 0 z" fill="#0f5a39" opacity=".5"/>`;
  for(let i=0;i<5;i++){const p=(t*0.5+i/5)%1;o+=`<circle cx="${f(x+w*0.3+p*w*0.4)}" cy="${f(y+h*0.45-20*Math.sin(p*6))}" r="${f(14+20*p)}" fill="#e8fff3" opacity="${f(0.35*(1-p))}"/>`;}
  o+=`<rect x="${x+w/2-110}" y="${y-44}" width="220" height="36" rx="8" fill="${P.dark}" stroke="${P.green}" stroke-width="3"/>`+tx('PAINT BOOTH',x+w/2,y-18,22,P.green,900,'middle','letter-spacing="3"');return o;}
function dyno2(x,y,t){let o=`<rect x="${x-190}" y="${y-22}" width="380" height="26" rx="6" fill="#26384e" stroke="${P.dark}" stroke-width="3"/>`;
  for(const dx of [-120,120])o+=`<rect x="${x+dx-50}" y="${y-30}" width="100" height="16" rx="8" fill="url(#gChrome)"/>`;
  o+=`<rect x="${x+262}" y="${y-130}" width="12" height="130" fill="#4b5d73"/><rect x="${x+210}" y="${y-200}" width="120" height="80" rx="8" fill="${P.dark}" stroke="#46c8ff" stroke-width="3"/>`;
  let pth='';for(let i=0;i<=20;i++){const u=i/20;pth+=(i?'L':'M')+f(x+220+u*100)+' '+f(y-132-50*Math.sin(u*2.6)*(0.6+0.4*Math.sin(t*3+u)));}o+=`<path d="${pth}" fill="none" stroke="${P.green}" stroke-width="3"/>`+tx('DYNO',x+270,y-208,18,'#46c8ff');return o;}
function pallet2(x,y){let o=`<rect x="${x-40}" y="${y-10}" width="80" height="10" fill="#7a5126"/>`;for(let r=0;r<2;r++)for(let c=0;c<2;c++)o+=crate2(x-19+c*38,y-10-r*30,'',36,30);
  o+=`<rect x="${x-26}" y="${y-58}" width="52" height="18" rx="3" fill="#f4f1e6"/>`+tx('1,000',x,y-44,14,P.dark);return o;}
function container2(x,y){return `<rect x="${x-80}" y="${y-60}" width="160" height="60" fill="#2a86c9" stroke="${P.dark}" stroke-width="3"/>`+[...Array(9)].map((_,i)=>`<line x1="${x-70+i*17.5}" y1="${y-54}" x2="${x-70+i*17.5}" y2="${y-6}" stroke="#174d7a" stroke-width="3"/>`).join('')+`<rect x="${x-36}" y="${y-42}" width="72" height="22" rx="3" fill="#f4f1e6"/>`+tx('10,000',x,y-25,15,P.dark);}
function jack(x,y){let o=sh(x+10,y+2,170,18);o+=`<rect x="${x-70}" y="${y-30}" width="150" height="24" rx="8" fill="url(#gRed)" stroke="#071a2d" stroke-width="3"/><path d="M ${x+50} ${y-30} L ${x+70} ${y-70} L ${x+96} ${y-70}" fill="none" stroke="#4b5d73" stroke-width="8" stroke-linecap="round"/><line x1="${x-60}" y1="${y-24}" x2="${x-140}" y2="${y-90}" stroke="url(#gChrome)" stroke-width="8" stroke-linecap="round"/><circle cx="${x-50}" cy="${y-4}" r="9" fill="#1d232c"/><circle cx="${x+60}" cy="${y-4}" r="9" fill="#1d232c"/>`;return o;}
function lamp(x,y0,len,t){const sw=3*Math.sin(t*0.9+x);let o=`<line x1="${x}" y1="${y0}" x2="${f(x+sw)}" y2="${y0+len}" stroke="#4b5d73" stroke-width="3"/>`;const lx=x+sw,ly=y0+len;
  o+=`<path d="M ${f(lx-150)} ${WALLB+160} L ${f(lx-26)} ${ly+20} L ${f(lx+26)} ${ly+20} L ${f(lx+150)} ${WALLB+160} Z" fill="url(#gCone)"/>`;
  o+=`<path d="M ${f(lx-34)} ${ly+22} Q ${f(lx-30)} ${ly-6} ${f(lx)} ${ly-8} Q ${f(lx+30)} ${ly-6} ${f(lx+34)} ${ly+22} Z" fill="#2b4a6b" stroke="${P.dark}" stroke-width="3"/><ellipse cx="${f(lx)}" cy="${ly+22}" rx="20" ry="6" fill="#fff6d6"/>`;
  o+=`<ellipse cx="${f(lx)}" cy="${WALLB+120}" rx="190" ry="40" fill="url(#gPool)"/>`;return o;}
function nameBoard(names){const x=70,y=550,w=470,h=320;let o=`<rect x="${x-8}" y="${y-8}" width="${w+16}" height="${h+16}" rx="14" fill="#2c3e55"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#5a3d22"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#pPeg)"/>`;
  o+=`<rect x="${x+w/2-170}" y="${y-30}" width="340" height="50" rx="10" fill="url(#gYel)" stroke="${P.dark}" stroke-width="3"/>`+tx('WALL OF MECHANICS',x+w/2,y+4,26,P.dark,900,'middle','letter-spacing="2"');
  const shown=names.slice(0,14);
  if(!shown.length){o+=tx('Comment',x+w/2,y+110,34,P.ink,800)+tx('WORKSHOP',x+w/2,y+160,48,P.yel)+tx('to get your name here',x+w/2,y+205,30,P.ink,800);
    // tool silhouettes
    o+=`<g opacity=".55"><path d="M ${x+60} ${y+290} l 70 -70 m -10 -10 a 18 18 0 1 1 22 22" stroke="#c9d6e6" stroke-width="10" fill="none" stroke-linecap="round"/><rect x="${x+330}" y="${y+270}" width="80" height="16" rx="6" fill="#c9d6e6"/><rect x="${x+402}" y="${y+260}" width="14" height="36" rx="4" fill="#c9d6e6"/></g>`;}
  shown.forEach((n,i)=>{const c=i%2,r=Math.floor(i/2);const px=x+20+c*225,py=y+36+r*38;const nm=n.length>15?n.slice(0,14)+'…':n;
    o+=`<rect x="${px}" y="${py}" width="205" height="34" rx="5" fill="url(#gYel)" stroke="#8a6a12" stroke-width="2"/><circle cx="${px+10}" cy="${py+17}" r="3" fill="#6b5210"/><circle cx="${px+195}" cy="${py+17}" r="3" fill="#6b5210"/>`+tx(esc(nm),px+102,py+24,20,'#2b1f05',800);});
  if(names.length>14)o+=tx(`+${names.length-14} more mechanics`,x+w/2,y+h-6,22,P.yel);
  return o;}
function windowWide(x,y,w,h,t){let o=`<rect x="${x-10}" y="${y-10}" width="${w+20}" height="${h+20}" rx="10" fill="#2c3e55"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#gSky)"/>`;
  o+=`<path d="M ${x} ${y+h*0.72} L ${x+w*0.18} ${y+h*0.55} L ${x+w*0.35} ${y+h*0.68} L ${x+w*0.55} ${y+h*0.5} L ${x+w*0.78} ${y+h*0.66} L ${x+w} ${y+h*0.58} L ${x+w} ${y+h} L ${x} ${y+h} Z" fill="#1f4f7d" opacity=".8"/>`;
  for(let i=1;i<4;i++)o+=`<line x1="${x+w*i/4}" y1="${y}" x2="${x+w*i/4}" y2="${y+h}" stroke="#2c3e55" stroke-width="8"/>`;o+=`<line x1="${x}" y1="${y+h/2}" x2="${x+w}" y2="${y+h/2}" stroke="#2c3e55" stroke-width="8"/>`;
  o+=`<path d="M ${x+20} ${y+h-10} L ${x+90} ${y+10}" stroke="#ffffff" stroke-opacity=".25" stroke-width="14"/>`;return o;}

function room(st,t,shownN){const N=st.subs,P0=st.prev??N;const has=v=>N>=v;
  const tenK=Math.floor(N/10000),k1=Math.floor(N%10000/1000),h1=Math.floor(N%1000/100),b1=N%100;const sameBlock=Math.floor(P0/100)===Math.floor(N/100);
  let o=`<g clip-path="url(#room)">`;
  o+=`<rect x="${RX}" y="${RY}" width="${RW}" height="${WALLB-RY}" fill="url(#gWall)"/><rect x="${RX}" y="${RY}" width="${RW}" height="${WALLB-RY}" fill="url(#pBrick)"/>`;
  o+=`<rect x="${RX}" y="${WALLB-60}" width="${RW}" height="60" fill="#0e2742"/><rect x="${RX}" y="${WALLB-64}" width="${RW}" height="6" fill="#ffd34d" opacity=".8"/>`;
  // ceiling beam
  o+=`<rect x="${RX}" y="${RY}" width="${RW}" height="40" fill="#0a1c31"/>`;for(let i=0;i<12;i++)o+=`<line x1="${RX+i*90}" y1="${RY+40}" x2="${RX+i*90+40}" y2="${RY}" stroke="#16314f" stroke-width="5"/>`;
  // window or booth
  if(has(1000))o+=boothWin(600,560,410,330,t);else o+=windowWide(600,540,410,290,t);
  // logo sign / neon
  if(has(10000)){const fl=0.8+0.2*Math.sin(t*11)*Math.sin(t*3.7);o+=`<rect x="630" y="915" width="350" height="70" rx="12" fill="#0a1c31"/><g opacity="${f(fl)}" filter="url(#neon)">${tx('TORQUE BLUEPRINT HQ',805,962,30,'#ff8a7e')}</g>`;}
  else o+=`<rect x="640" y="925" width="330" height="56" rx="10" fill="#0a1c31" stroke="#46c8ff" stroke-width="3"/>`+tx('TORQUE <tspan fill="#ffd34d">BLUEPRINT</tspan>',805,962,28,P.ink,900,'middle','letter-spacing="3"');
  o+=nameBoard(st.names||[]);
  // floor
  o+=`<rect x="${RX}" y="${WALLB}" width="${RW}" height="${RY+RH-WALLB}" fill="url(#gFloor)"/>`;
  for(let i=-8;i<=8;i++)o+=`<line x1="${540+i*70}" y1="${WALLB}" x2="${540+i*190}" y2="${RY+RH}" stroke="#ffffff" stroke-opacity=".05" stroke-width="2"/>`;
  for(let j=1;j<6;j++){const yy=WALLB+Math.pow(j/6,1.6)*(RY+RH-WALLB);o+=`<line x1="${RX}" y1="${f(yy)}" x2="${RX+RW}" y2="${f(yy)}" stroke="#ffffff" stroke-opacity=".05" stroke-width="2"/>`;}
  o+=`<path d="M ${RX} ${WALLB+250} L ${RX+RW} ${WALLB+250}" stroke="#ffd34d" stroke-width="6" stroke-dasharray="40 26" opacity=".55"/>`;
  o+=`<ellipse cx="470" cy="1500" rx="70" ry="14" fill="#050d18" opacity=".55"/>`+(has(500)?'':jack(500,FRONT));
  // lamps
  o+=lamp(570,RY+40,8,t)+lamp(330,RY+40,-6,t)+lamp(820,RY+40,8,t);
  // back row props
  o+=bench(70,WALLB+30);
  o+=jar2(380,WALLB-182,b1,t,sameBlock?(P0%100):0);
  for(let i=0;i<h1;i++)o+=crate2(110+(i%3)*58,WALLB-182-Math.floor(i/3)*50,'100',54,46);
  if(has(10))o+=chest(510,WALLB+30);
  if(has(100))o+=lift2(780,WALLB+40,has(250),t);
  if(has(25))o+=tireRack2(990,WALLB+40);
  // front row
  if(has(50))o+=compressor2(150,FRONT);
  for(let i=0;i<k1;i++)o+=pallet2(270+(i%2)*82,FRONT-Math.floor(i/2)*60);
  for(let i=0;i<Math.min(tenK,6);i++)o+=container2(150+(i%2)*170,FRONT-170-Math.floor(i/2)*62);
  if(has(5000))o+=dyno2(700,FRONT,t);
  if(has(500)){const cx=has(5000)?700:760;o+=sh(cx,FRONT,440,34);o+=coupe(cx,FRONT-(has(5000)?26:0),0.95,'gCarBlue',has(5000)?t*12:0);}
  // vignette inside room
  o+=`<rect x="${RX}" y="${RY}" width="${RW}" height="${RH}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="40" filter="url(#soft)"/>`;
  o+='</g>';
  o+=`<rect x="${RX}" y="${RY}" width="${RW}" height="${RH}" rx="34" fill="none" stroke="#46c8ff" stroke-width="4" opacity=".8"/>`;
  return o;}

function scene(st,t){const N=st.subs,P0=st.prev??N;const shownN=Math.round(P0+(N-P0)*eio(clamp((t-0.4)/2.2)));
  let o=DEF2;
  o+=tx('THE TORQUE BLUEPRINT',540,140,34,'#46c8ff',800,'middle','letter-spacing="8"')+tx('WORKSHOP',540,205,70,P.ink,900,'middle','letter-spacing="6"');
  o+=`<ellipse cx="540" cy="300" rx="260" ry="80" fill="url(#gHalo)"/>`+tx(shownN.toLocaleString('en-US'),540,345,150,P.yel);
  o+=tx('SUBSCRIBERS · EVERY ONE IS A BOLT IN THE SHOP',540,400,26,'#9fb6d3',700,'middle','letter-spacing="2"');
  o+=room(st,t,shownN);
  // next unlock card
  const nx=UNLOCKS.find(([v])=>N<v);const y0=1680;
  o+=`<rect x="60" y="${y0}" width="960" height="96" rx="22" fill="#0f2e50" stroke="#46c8ff" stroke-width="3" opacity=".95"/>`;
  if(nx){const pv=[...UNLOCKS].reverse().find(([v])=>v<=N);const base=pv?pv[0]:0;const k=clamp((shownN-base)/(nx[0]-base));
    o+=tx('NEXT UNLOCK',90,y0+38,22,'#9fb6d3',800,'start','letter-spacing="3"')+tx(nx[1],90,y0+76,34,P.ink,900,'start');
    o+=`<rect x="520" y="${y0+34}" width="370" height="30" rx="15" fill="#0a1c31"/><rect x="524" y="${y0+38}" width="${f(Math.max(0,362*k))}" height="22" rx="11" fill="${P.green}"/>`+tx(`${shownN}/${nx[0]}`,1000,y0+58,26,P.ink,900,'end');}
  else o+=tx('EVERY UNLOCK COMPLETE',540,y0+62,38,P.green);
  const fresh=UNLOCKS.filter(([v])=>P0<v&&N>=v).pop();
  if(fresh&&t>2.6&&t<5.2)o+=popG(`<rect x="-360" y="-80" width="720" height="160" rx="28" fill="${P.green}" stroke="${P.dark}" stroke-width="5"/>`+tx('UNLOCKED!',0,-14,36,P.dark)+tx(fresh[1],0,48,62,P.dark),t,2.6,540,1040,-3,clamp((5.2-t)/0.3));
  o+=popG(`<rect x="-330" y="-52" width="660" height="104" rx="52" fill="#ff3b30"/><path d="M -285 -20 L -285 20 L -250 0 Z" fill="#fff"/>`+tx('SUBSCRIBE = +1 BOLT',25,18,46,'#fff'),t,1.2,540,1850,0,1+0.03*Math.sin(t*5));
  return o;}
function bgGrid(){let o='<rect width="1080" height="1920" fill="#0d2742"/>';for(let x=0;x<=1080;x+=60)o+=`<line x1="${x}" y1="0" x2="${x}" y2="1920" stroke="#46c8ff" stroke-opacity="${x%300?.06:.12}"/>`;for(let y=0;y<=1920;y+=60)o+=`<line x1="0" y1="${y}" x2="1080" y2="${y}" stroke="#46c8ff" stroke-opacity="${y%300?.06:.12}"/>`;return o;}
const GRID=bgGrid();
return {svg:(st,t)=>`<svg viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid meet" role="img" aria-label="The TorqueBlueprint workshop with ${st.subs} subscribers">${GRID}${scene(st,t)}</svg>`};
})();
let wsT=0,wsRaf=0,wsLast=0,wsOpenFlag=false;
function wsState(){const n=subs||0;return{subs:n,prev:Math.max(0,n-Math.min(n,25)),names:Array.isArray(STATE.names)?STATE.names.map(String):[]}}
function wsFrame(ts){if(!wsOpenFlag)return;const dt=Math.min(.1,(ts-(wsLast||ts))/1000);wsLast=ts;wsT+=dt;
 $('wsStage').innerHTML=Workshop.svg(wsState(),wsT);wsRaf=setTimeout(()=>requestAnimationFrame(wsFrame),45)}
function openWorkshop(){if(wsOpenFlag)return;wsOpenFlag=true;wsT=0;wsLast=0;$('wsOverlay').hidden=false;$('wsClose').focus();requestAnimationFrame(wsFrame)}
function closeWorkshop(){wsOpenFlag=false;clearTimeout(wsRaf);$('wsOverlay').hidden=true;$('wsOpen').focus()}
$('wsOpen').addEventListener('click',()=>{if(typeof view3d!=='undefined'&&view3d&&R3)R3.enterIn();else openWorkshop()});
$('wsClose').addEventListener('click',closeWorkshop);
$('wsOverlay').addEventListener('click',ev=>{if(ev.target.id==='wsOverlay')closeWorkshop()});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&wsOpenFlag)closeWorkshop()});
