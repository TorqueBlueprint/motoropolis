//@ world/drag_hud.js - Phase 2C step 2: the Drag Strip telemetry HUD, drawn on the HUD canvas (so the recorder films it) while
//@ the camera is at the strip or follows a car on it. Per lane: tachometer with shift lights, gear, speed (km/h and mph),
//@ boost (bar and psi), intake air and exhaust gas temperatures (C and F), throttle and wheelspin, and the timing ladder
//@ (R/T, 60 ft, 330 ft, 1/8, 1000 ft, 1/4 with trap speeds); a live commentary line above. Every value is read from the
//@ lane's telemetry state (world/drag3d.js telAt(), from the pass's own time-series in sim/drag.js), never made up.
//@ Full or compact (the button on the 3D view; remembered per viewer). Hidden names (window.__HIDE) show the plate.
//@ inside the if(WORLD){ block of world/world3d.js, after world/drag3d.js. Recorder: window.__DRAG.hud(...), see README.
  if(CITY2&&W3.dragS){const S0=W3.dragS,D3=S0.D3,ACC=['#ff7a1a','#46c8ff'],FONT="'Barlow Condensed','Arial Narrow',sans-serif",MONO="'JetBrains Mono',ui-monospace,monospace";
   // default: full cards on a computer, one line per lane on a phone (the button switches; the choice is remembered)
   let userMode=(screenEl.clientWidth||999)<=640?'mini':'full';try{const v=localStorage.getItem('mtp-drag-tel');if(v==='mini'||v==='full')userMode=v}catch(e){}
   const btn=document.createElement('button');btn.type='button';btn.id='dgTelBtn';btn.className='dg-telbtn';btn.hidden=true;screenEl.appendChild(btn);
   const btnText=()=>{btn.textContent=userMode==='full'?'▾ TELEMETRY':'▸ TELEMETRY';btn.setAttribute('aria-expanded',String(userMode==='full'));btn.title=userMode==='full'?'Collapse the drag telemetry':'Show the full drag telemetry'};btnText();
   btn.addEventListener('click',e=>{e.stopPropagation();userMode=userMode==='full'?'mini':'full';btnText();try{localStorage.setItem('mtp-drag-tel',userMode)}catch(err){}});
   for(const ev of['pointerdown','mousedown','touchstart','wheel'])btn.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
   let btnCss='',lastDraw=0;
   // the button goes away with the HUD (inside a building, the 2D map: no 3D frame draws it)
   setInterval(()=>{if(!btn.hidden&&performance.now()-lastDraw>400)btn.hidden=true},500);
   const x=hctx,f1=n=>n.toFixed(1),f3=n=>n.toFixed(3),C2F=c=>c*9/5+32;
   const font=(px,w,mono)=>{x.font=`${w||700} ${px}px ${mono?MONO:FONT}`};
   const T=(s,px,py,size,col,align,w,mono)=>{font(size,w,mono);x.fillStyle=col;x.textAlign=align||'left';x.fillText(s,px,py)};
   const fit=(s,max,size,w,mono)=>{font(size,w,mono);if(x.measureText(s).width<=max)return s;let t=s;while(t.length>1&&x.measureText(t+'…').width>max)t=t.slice(0,-1);return t+'…'};
   const box=(px,py,w,h,r,fill)=>{rrect(x,px,py,w,h,r);x.fillStyle=fill;x.fill()};
   const xAt=(C,tt)=>{const tr=C.tr,i=tt/.05,n=tr.length-1;if(tt<=0)return 0;if(i>=n)return tr[n];const k=Math.floor(i);return tr[k]+(tr[k+1]-tr[k])*(i-k)};
   const rpmTxt=r=>Math.round(r/10)*10;
   const LAD=[['R/T',''],['60 ft','18 m'],['330 ft','101 m'],['1/8','201 m'],['1000 ft','305 m'],['1/4','402 m']];
   // the commentary: who leads by how much, then the result with the margin at the line
   function comment(){const A=D3.cars[0],B=D3.cars[1],h=D3.h,t=D3.t||0,one=A&&B?null:(A||B);
    if(one){const s=one.st,n=S0.who(one.l.e);if(s.ph<4)return[`${n} · ${h.label} · solo run (bye)`,'#ffffff'];if(!s.fin)return[`${n} · ${f1(s.el>0?s.x-DRAG.ROLL:0)} m · ${f1((s.el>0?s.x-DRAG.ROLL:0)*3.28084)} ft down the strip`,'#ffffff'];
     return[`${n} · ${f3(one.l.et)} s @ ${f1(one.l.vt*2.236936)} mph · ${f1(one.l.vt*3.6)} km/h`,'#ffd34d']}
    if(!A)return['',''];const nA=S0.who(A.l.e),nB=S0.who(B.l.e),sa=A.st,sb=B.st;
    const red=[A,B].findIndex(C=>C.l.red&&C.st.tt>=0);
    if(red>=0){const W=red?A:B;return[`${S0.who(D3.cars[red].l.e)} RED LIGHT · ${S0.who(W.l.e)} WINS`,'#ff5a4f']}
    if(sa.fin&&sb.fin){const w=h.win,W=w?B:A,L=w?A:B,m=DRAG.margin(h);
     // the loser's distance from the line when the winner crossed it (both greens at the same moment)
     const tl=W.l.rt+W.l.et-L.l.rt+L.tR,gap=Math.max(0,DRAG.QM+DRAG.ROLL-xAt(L,tl));
     return[`${S0.who(W.l.e)} WINS by ${f3(m)} s · ${f1(gap)} m / ${Math.round(gap*3.28084)} ft`,'#38e07b']}
    if(sa.fin||sb.fin){const F=sa.fin?A:B;return[`${S0.who(F.l.e)} takes the stripe · ${f3(F.l.et)} s @ ${f1(F.l.vt*2.236936)} mph · ${f1(F.l.vt*3.6)} km/h`,'#ffd34d']}
    if(sa.tt>=0||sb.tt>=0){if(sa.tt<0||sb.tt<0){const F=sa.tt>=0?A:B;return[`${S0.who(F.l.e)} leaves first`,'#ffffff']}
     const g=sa.x-sb.x,ga=Math.abs(g);if(ga<.3)return['Side by side!','#ffffff'];return[`${g>0?nA:nB} leads by ${f1(ga)} m / ${Math.round(ga*3.28084)} ft`,'#ffffff']}
    if(sa.ph===3)return[`Launch control · ${nA} ${rpmTxt(sa.r*A.tel.rpm).toLocaleString('en-US')} rpm · ${nB} ${rpmTxt(sb.r*B.tel.rpm).toLocaleString('en-US')} rpm`,'#ffd34d'];
    if(t>=5)return[`${nA} and ${nB} roll into the beams`,'#ffffff'];
    if(t>=3)return[`Burnouts · ${h.label}`,'#ffffff'];return[`${nA} vs ${nB} · ${h.label}`,'#ffffff']}
   // shift lights: 5 LEDs from 80 % to 96 % of the rev limiter, all flashing at the limiter
   function leds(px,py,w,r){const n=5,col=['#38e07b','#38e07b','#ffd34d','#ff5a4f','#ff5a4f'],fl=r>=.965&&(Math.floor((D3.t||0)*14)%2===0);
    for(let i=0;i<n;i++){const on=fl||r>=.8+i*.04;x.beginPath();x.arc(px+(i+.5)*w/n,py,3,0,7);x.fillStyle=on?(fl?'#7fb2ff':col[i]):'rgba(255,255,255,.12)';x.fill()}}
   function tach(cx,cy,R,s,T2,g){const a0=Math.PI*.75,sw=Math.PI*1.5,r=Math.max(0,Math.min(1.02,s.r));x.lineCap='butt';
    x.lineWidth=4.5;x.strokeStyle='rgba(255,255,255,.13)';x.beginPath();x.arc(cx,cy,R,a0,a0+sw);x.stroke();
    x.strokeStyle='#ff3b30';x.lineWidth=2;x.beginPath();x.arc(cx,cy,R+3,a0+sw*.92,a0+sw);x.stroke();
    x.lineWidth=4.5;x.strokeStyle=r>.92?'#ff5a4f':r>.8?'#ffd34d':'#38e07b';x.beginPath();x.arc(cx,cy,R,a0,a0+sw*Math.min(1,r));x.stroke();
    const k=Math.ceil(T2.rpm/1000);x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=1;for(let i=0;i<=k;i++){const a=a0+sw*Math.min(1,i*1000/T2.rpm);x.beginPath();x.moveTo(cx+Math.cos(a)*(R-7),cy+Math.sin(a)*(R-7));x.lineTo(cx+Math.cos(a)*(R-3.5),cy+Math.sin(a)*(R-3.5));x.stroke()}
    const a=a0+sw*Math.min(1,r);x.strokeStyle='#ffffff';x.lineWidth=1.5;x.beginPath();x.moveTo(cx+Math.cos(a)*9,cy+Math.sin(a)*9);x.lineTo(cx+Math.cos(a)*(R-2),cy+Math.sin(a)*(R-2));x.stroke();
    T(g,cx,cy+6,17,'#ffffff','center',800,true);T(rpmTxt(r*T2.rpm).toLocaleString('en-US')+' rpm',cx,cy+R+8,8,'#c9d6e6','center',700)}
   // the ladder's time-of-day: the splits reached so far
   const lastSplit=(C,s)=>{if(C.l.red&&s.tt>=0)return'R/T '+f3(C.l.rt)+' s · RED LIGHT';if(s.fin)return`ET ${f3(C.l.et)} s · ${Math.round(mph0(C))} mph · ${Math.round(C.l.vt*3.6)} km/h`;
    if(s.el>=0){let j=-1;for(let q=0;q<4;q++)if(s.el>=C.spl[q])j=q;return j<0?'R/T '+f3(C.l.rt)+' s':`${LAD[j+1][0]} · ${LAD[j+1][1]}  ${f3(C.spl[j])} s`}return s.ph===3?'LAUNCH CONTROL':s.ph===1?'BURNOUT':''};
   function card(C,k,px,py,w,h,md){const s=C.st,T2=C.tel,e=C.l.e,acc=ACC[k],h0=D3.h,both=D3.cars.every((q,i)=>!h0.lanes[i]||(q&&q.st.fin)),win=both&&h0.win===k&&!!h0.lanes[1-k],m=DRAG.margin(h0);
    box(px,py,w,h,7,'rgba(7,13,23,.82)');x.fillStyle=acc;x.fillRect(px,py+4,3,h-8);
    const g=s.ph<4&&s.ph!==3&&s.ph!==1?'N':String(s.g+1),kmh=s.v*3.6,mph=s.v*2.236936;
    // result badge: WIN for the winner, the margin in seconds for the other lane, RED LIGHT
    let badge=null;if(C.l.red&&s.tt>=0)badge=['RED LIGHT','#ff3b30','#ffffff'];else if(both&&h0.lanes[1-k])badge=win?['WIN ▲','#38e07b','#062a14']:[m!=null?`+${f3(m)} s`:'','rgba(255,255,255,.16)','#e6edf5'];
    const bw=badge?(font(9,800),x.measureText(badge[0]).width+10):0;x.textBaseline='alphabetic';
    if(md==='mini'){const sp=`${Math.round(kmh)} km/h · ${Math.round(mph)} mph`;font(10,800);const spw=x.measureText(sp).width;
     T(fit(S0.who(e),w-spw-bw-36,11,800),px+8,py+13,11,'#ffffff','left',800);
     let rx=px+w-6;if(badge){box(rx-bw,py+3,bw,14,7,badge[1]);T(badge[0],rx-bw/2,py+13.5,9,badge[2],'center',800);rx-=bw+5}
     else{T(sp,rx,py+13,10,'#ffffff','right',800);rx-=spw+5;box(rx-13,py+2.5,13,15,3,'rgba(255,255,255,.14)');T(g,rx-6.5,py+14,11,'#ffd34d','center',800,true)}
     const bwid=w*.3,r=Math.min(1,s.r);box(px+8,py+21,bwid,6,3,'rgba(255,255,255,.12)');box(px+8,py+21,Math.max(6,bwid*r),6,3,r>.92?'#ff5a4f':r>.8?'#ffd34d':'#38e07b');
     T(fit(lastSplit(C,s),w-bwid-20,9,700),px+w-6,py+28,9,'#c9d6e6','right',700);return}
    // ---- full card ----
    T(fit(S0.who(e),w-18-bw,12,800),px+8,py+13,12,'#ffffff','left',800);
    if(badge){box(px+w-6-bw,py+3,bw,14,7,badge[1]);T(badge[0],px+w-6-bw/2,py+13.5,9,badge[2],'center',800)}else T(k?'RIGHT LANE':'LEFT LANE',px+w-7,py+13,8,acc,'right',800);
    const spec=`${T2.hp} hp · ${Math.round(T2.hp*.7457)} kW · ${T2.fuel==='D'?'DIESEL ':''}${T2.asp==='T'?'TURBO':T2.asp==='S'?'SUPERCHARGED':'NA'} · ${T2.drive}`;
    T(fit(spec,w-15,8,700),px+8,py+24,8,'#9fb0c4','left',700);
    leds(px+7,py+32,50,s.r);tach(px+32,py+59,20,s,T2,g);
    // speed, boost, temperatures, throttle
    const cx=px+64,cw=w-64-15;
    T(String(Math.round(kmh)),cx+cw*.5,py+47,19,'#ffffff','right',800,true);T('km/h',cx+cw*.5+2,py+47,8,'#9fb0c4','left',700);
    T(`${Math.round(mph)}`,cx+cw,py+47,12,'#ffffff','right',800,true);T('mph',cx+cw,py+34,7.5,'#9fb0c4','right',700);
    if(s.sp>.05){box(cx,py+27,36,10,5,'#ff7a1a');T(`SPIN ${Math.round(s.sp*100)}%`,cx+18,py+35,7.5,'#1d0f02','center',800)}
    const bmax=Math.max(1,(T2.boost||0)*1.15),bv=Math.max(0,s.b);
    T('BOOST',cx,py+58,7.5,'#7d8a9a','left',800);T(T2.asp==='NA'?'NA · 0.00 bar · 0.0 psi':`${bv.toFixed(2)} bar · ${f1(bv*14.5038)} psi`,cx+cw,py+58,9,'#ffffff','right',700);
    box(cx,py+60.5,cw,3,1.5,'rgba(255,255,255,.12)');if(bv>0)box(cx,py+60.5,Math.max(3,cw*Math.min(1,bv/bmax)),3,1.5,'#46c8ff');
    T('IAT',cx,py+74,7.5,'#7d8a9a','left',800);T(`${Math.round(s.iat)}°C · ${Math.round(C2F(s.iat))}°F`,cx+cw,py+74,9,'#ffffff','right',700);
    T('EGT',cx,py+85,7.5,'#7d8a9a','left',800);T(`${Math.round(s.egt)}°C · ${Math.round(C2F(s.egt))}°F`,cx+cw,py+85,9,s.egt>880?'#ffb36b':'#ffffff','right',700);
    const tx=px+w-10,th=s.th;box(tx,py+28,4.5,52,2,'rgba(255,255,255,.12)');if(th>0)box(tx,py+28+52*(1-th),4.5,52*th,2,'#38e07b');T('THR',tx+2.2,py+88,6,'#7d8a9a','center',800);
    // timing ladder: label (both units), time, and the speeds at 1/8 and 1/4 (trap)
    const ly=py+93,rh=(h-97)/6,tc=px+92;
    x.fillStyle='rgba(255,255,255,.1)';x.fillRect(px+6,ly-1,w-12,1);
    for(let q=0;q<6;q++){const yy=ly+rh*(q+.8),last=q===5;let tv=null,red=false;
     if(q===0){if(s.tt>=0){tv=C.l.rt;red=C.l.red}}else if(s.el>=0&&s.el>=C.spl[q-1]-1e-9)tv=C.spl[q-1];
     if(last&&tv!=null){x.fillStyle='rgba(255,211,77,.14)';x.fillRect(px+5,ly+rh*q,w-10,rh)}
     T(LAD[q][0],px+8,yy,8.5,'#c9d6e6','left',800);if(LAD[q][1])T(LAD[q][1],px+8+(font(8.5,800),x.measureText(LAD[q][0]).width)+3,yy,7.5,'#7d8a9a','left',700);
     T(tv==null?'—':f3(tv)+(red?' RED':''),tc,yy,9,red?'#ff5a4f':tv==null?'#4a5566':last?'#ffd34d':'#ffffff','right',800,true);
     if((q===3||q===5)&&tv!=null){const v=q===3?C.v8:C.vt;T(fit(`${f1(v*2.236936)} mph · ${f1(v*3.6)} km/h`,w-(tc-px)-10,8.5,700),px+w-7,yy,8.5,last?'#ffd34d':'#c9d6e6','right',700)}
     else if(q===5)T('ET · TRAP',px+w-7,yy,7.5,'#4a5566','right',700)}}
   const mph0=C=>C.l.vt*2.236936;
   // two steps per frame: dragHud() with the labels decides whether it shows (and tells the page HUD, drawn next, to leave
   // the bottom corners free: DRAG.hudAt), dragHudDraw() at the very end of the frame draws it over everything
   let curMd=null;
   W3.dragHud=()=>{const F=W3.dragHudForce,near=cam.tx>S0.x0-40&&cam.tx<S0.x1+40&&cam.tz>S0.zc-70&&cam.tz<S0.zc+60&&cam.dist<(F?600:340);
    const on=D3.open&&D3.h&&mode!=='in'&&near&&D3.cars.some(c=>c),md=!on||F===false?null:F?(F==='mini'?'mini':'full'):trailer?null:userMode;
    const showBtn=!!md&&!F&&!trailer;if(btn.hidden===showBtn)btn.hidden=!showBtn;curMd=md;if(!md)return;lastDraw=DRAG.hudAt=performance.now()};
   W3.dragHudDraw=()=>{const md=curMd;curMd=null;if(!md)return;
    const sh=screenEl.clientHeight||HUDH,swc=screenEl.clientWidth||HUDW,u=HUDH/sh,f=Math.max(1,Math.min(1.35,swc/390,sh/520)),K=u*f,W=swc/f,H=sh/f;
    const phone=swc<=640,BOT=(phone?34:8)/f,G=6,cw=Math.min(240,(W-3*G)/2),chh=md==='mini'?32:160,cy=H-BOT-chh,ty=cy-24;
    x.save();x.scale(K,K);x.textBaseline='alphabetic';
    for(let k=0;k<2;k++){const C=D3.cars[k];const px=k?W-G-cw:G;if(C)card(C,k,px,cy,cw,chh,md);else{box(px,cy,cw,chh,7,'rgba(7,13,23,.6)');T('BYE RUN',px+cw/2,cy+chh/2+4,11,'#7d8a9a','center',800)}}
    const [txt,col]=comment();if(txt){const bw=2*cw+G;font(11.5,800);const tw=Math.min(bw,x.measureText(txt).width+24),bx=W/2-tw/2;box(bx,ty,tw,19,9.5,'rgba(7,13,23,.88)');T(fit(txt,tw-14,11.5,800),W/2,ty+13.5,11.5,col,'center',800)}
    x.restore();
    // the collapse button sits at the right end of the commentary line (CSS pixels)
    const css=`right:${Math.round(G*f)}px;bottom:${Math.round((H-ty+3)*f)}px`;if(css!==btnCss){btnCss=css;btn.style.cssText=css}};
  }
