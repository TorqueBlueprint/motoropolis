//@ core/boot.js - opens the page IIFE; page flags (WORLD, XMAS, PERF, QUAL, REMAKE), grid constants, canvases, helpers
//@ closure scope (top level of the page IIFE). Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py

(function(){
'use strict';
const APP0=document.getElementById('app').innerHTML;
const CSS0=document.getElementById('css').textContent;
const SRC0=document.currentScript.textContent;
const HEAD_TOP="<title>Motoropolis by TorqueBlueprint</title>\n<meta name=\"claude:viewport-fit-sides\" content=\"cover\">\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap\">";
const WORLD=document.documentElement.dataset.world!=='0';
// Christmas city: the xmas page always (data-xmas-always, see tools/build_xmas.py) and ?xmas=1; the other pages
// built with data-xmas="1" show it only for the season, until the end of December 2026
const XMAS=document.documentElement.dataset.xmas==='1'&&(document.documentElement.dataset.xmasAlways==='1'||/[?&]xmas=1/.test(location.search)||Date.now()<new Date(2027,0,1).getTime());
// performance test build (tools/build_perf.py): adaptive resolution, throttled shadows, level of detail for far cars and people
const PERF=document.documentElement.dataset.perf==='1';const AQ={pr:1,acc:0,n:0,shEvery:2,shN:0,fps:60};
// graphics quality: high / medium / low. Everyone starts on high; Medium/Low only if the viewer picks them (remembered).
const QUAL=(()=>{if(document.documentElement.dataset.rec==='1')return 'high';let q=null;try{q=localStorage.getItem('mtp-quality')}catch(e){}if(q==='high'||q==='medium'||q==='low')return q;
 // phones and tablets (touch, no hover) start on Medium unless the viewer picked a quality; desktops and the recorder start on High
 try{if(document.documentElement.dataset.rec!=='1'&&matchMedia('(hover:none) and (pointer:coarse)').matches)return 'medium'}catch(e){}return 'high'})();const CW=WORLD?3640:1920,CH=WORLD?1980:1680,TAU=Math.PI*2,HALF=30,LANE=14,KM=1.5;
const REMAKE=document.documentElement.dataset.remake!=='0';
// city-v2 phase 1 (city structure): on by default on this branch; ?city=1 shows the phase-0 city for comparison
const CITY2=!/[?&]city=1\b/.test(location.search);
const CANAL_I=REMAKE&&!WORLD?2:-1;const ROUND_IJ=REMAKE?[[1,1],[3,3],[1,3]]:[];
const XS=WORLD?[100,530,960,1390,1820,2250,2680,3110,3540]:[100,530,960,1390,1820],YS=WORLD?[100,400,700,1000,1300,1600,1900]:[100,400,700,1000,1300,1600],NX=XS.length,NY=YS.length,GAPX=0,GAPY=0;
const C=document.getElementById('city');C.width=CW;C.height=CH;const octx=C.getContext('2d');
const world=document.createElement('canvas');world.width=CW;world.height=CH;let ctx=world.getContext('2d');
const bg=document.createElement('canvas');bg.width=CW;bg.height=CH;const g=bg.getContext('2d');
const $=id=>document.getElementById(id);
const R=Math.random,rr=(a,b)=>a+(b-a)*R(),pick=a=>a[Math.floor(R()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function angLerp(a,b,t){let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*t}
const eur=v=>'$'+Math.round(v).toLocaleString('en-US');
const fmtKm=v=>Math.round(v*.621).toLocaleString('en-US')+' mi';
function rrect(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h)}

