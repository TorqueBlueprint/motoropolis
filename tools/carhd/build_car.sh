#!/usr/bin/env bash
# build_car.sh <id> <outname> <hdTarget> <hdOpts> <lightOpts> [hdTex]
set -euo pipefail
id=$1; on=$2; HT=$3; HO=${4:-'{}'}; LO=${5:-'{}'}; HTEX=${6:-2048}
W=/home/claude/carhd_work; A=/home/claude/motoropolis/assets/cars; GP=/home/claude/tools/node_modules/.bin/gltfpack
cd $W; mkdir -p work out/hd out/lod
gz(){ python3 -c "import gzip,sys;d=open(sys.argv[1],'rb').read();open(sys.argv[1]+'.gz','wb').write(gzip.compress(d,9,mtime=0))" "$1"; }
[ -n "${SKIPH:-}" ] || node simp.mjs work/${id}_fit.glb work/${id}_hds.glb $HT "$HO"
$GP -i work/${id}_hds.glb -o work/${id}_hdp.glb -km -ke ${GPX:-} >/dev/null
node finish.mjs work/${id}_hdp.glb out/hd/$on.glb $HTEX
[ -n "${SKIPL:-}" ] || node simp.mjs work/${id}_fit.glb work/${id}_ls.glb 39500 "$LO"
$GP -i work/${id}_ls.glb -o work/${id}_lp.glb -km -ke ${GPX:-} >/dev/null
node finish.mjs work/${id}_lp.glb out/lod/$on.glb 512
ls -la out/hd/$on.glb out/lod/$on.glb
