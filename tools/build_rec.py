#!/usr/bin/env python3
"""Build rec/index.html: the Motoropolis recorder. Films a Short from rec/shots/<name>.json
on the viewer's own GPU (open rec/?s=<name>, press RECORD, the video downloads)."""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
s = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
def R(a, b):
    global s
    assert a in s, a[:60]
    s = s.replace(a, b, 1)
R("<html>", '<html data-rec="1">')
R("<head>", "<head><script>try{localStorage.setItem('mtp-view','3d')}catch(e){}</script>")
s = s.replace("'state.json?v='", "'../state.json?v='")
R("<title>Motoropolis by TorqueBlueprint</title>", "<title>Motoropolis · Recorder</title>")
R("function loop(ts){", "function loop(ts){if(window.__MANUAL){requestAnimationFrame(loop);return}")
R("renderer.setPixelRatio(Math.min(", "renderer.setPixelRatio(window.__PR||Math.min(")
R("const ASSET_BASE=/\\/(world|remake|xmas)\\//", "const ASSET_BASE=/\\/(world|remake|xmas|rec)\\//")
R("if(location.hostname==='localhost')window.__mtpBuild=",
  "window.__H={step:dt=>{let d=dt;while(d>0){const s=Math.min(d,1/30);update(s);d-=s}},R3:()=>R3,light:m=>{lightMode=m},hud:v=>{showHud=v},trailer:v=>{trailer=v},"
  "pick:(g,ex)=>{let best=null,bs=-1;for(const c of cars){if(c.kind!=='car'||!c.m||c.m.glb!==g||c.state!=='road'||c.hidden||c.removed||c.task||(ex&&ex.includes(c.id)))continue;if(c.v>bs){bs=c.v;best=c}}return best?{id:best.id}:null},"
  "pos:id=>{const c=cars.find(q=>q.id===id);return c?{x:c.x/10,z:c.y/10,a:c.ang,v:c.v}:null}};\n"
  "if(location.hostname==='localhost')window.__mtpBuild=")
i = s.rindex("</body>")
s = s[:i] + '<script src="rec.js?v=2"></script>' + s[i:]
os.makedirs(os.path.join(ROOT, "rec", "shots"), exist_ok=True)
open(os.path.join(ROOT, "rec", "index.html"), "w", encoding="utf-8").write(s)
print("rec/index.html built", len(s))
