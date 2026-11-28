#!/usr/bin/env bash
# Build the car LOD files (src/data/cars/car_lod.json says which cars have them).
#
#   tools/car_lod.sh <id> [<id> ...]        e.g. tools/car_lod.sh mach1 huracan
#
#   LIGHT (traffic, far cars) -> assets/cars/lod/<id>.glb (+ .glb.gz)
#     gltfpack simplification to <= 40k triangles (only if the source has more), keeping named materials and
#     nodes (the paint is found by material name), plain KHR_mesh_quantization like the existing files
#     (no -c meshopt compression and no KTX2: the page loads no meshopt/basis decoder), textures <= 512 px.
#   HD (garage, interiors, close-up, recorder) -> assets/cars/hd/<id>.glb (+ .gz), only when a higher-quality
#     source exists in SRC_HD/<id>.glb: no simplification, textures <= 2048 px (never upscaled). Without a source
#     the HD level is the current assets/cars/<id>.glb (the best version in the repo).
#
# Needs gltfpack and @gltf-transform/cli (npm i gltfpack @gltf-transform/cli in a scratch folder; set TOOLS to it).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS="${TOOLS:-/home/claude/tools}"
GP="$TOOLS/node_modules/.bin/gltfpack"; GT="$TOOLS/node_modules/.bin/gltf-transform"
SRC_HD="${SRC_HD:-$ROOT/../car_sources}"
MAXTRI="${MAXTRI:-40000}"
# cars whose body shell is too thin for a uniform pass (interior/roll cage showed through the roof at 0.52):
# "<ratio for the other materials> <materials kept untouched> <error>"
declare -A KEEP=( [rwd24]="0.3 cuerpo,glass_ext,luces,chromes 0.05" )
A="$ROOT/assets/cars"; mkdir -p "$A/lod" "$A/hd"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
tris() { "$GP" -i "$1" -o "$tmp/_probe.glb" -v 2>&1 | sed -n 's/^input: .*mesh primitives (\([0-9]*\) triangles.*/\1/p' | head -1; }
gz() { python3 -c "import gzip,sys;d=open(sys.argv[1],'rb').read();open(sys.argv[1]+'.gz','wb').write(gzip.compress(d,9,mtime=0))" "$1"; }
for id in "$@"; do
  src="$A/$id.glb"; t=$(tris "$src")
  # LIGHT
  if [ -n "${KEEP[$id]:-}" ]; then   # per-material pass (see KEEP above)
    read -r kr km ke <<<"${KEEP[$id]}"
    (cd "$TOOLS" && node "$ROOT/tools/car_lod_sel.mjs" "$src" "$tmp/$id.s.glb" "$kr" "$km" "$ke" >/dev/null)
  elif [ "$t" -gt "$MAXTRI" ]; then
    r=$(python3 -c "print(round(($MAXTRI*0.985)/$t,4))")
    "$GP" -i "$src" -o "$tmp/$id.s.glb" -si "$r" -slb -km -kn -ke
  else cp "$src" "$tmp/$id.s.glb"; fi
  "$GT" resize "$tmp/$id.s.glb" "$A/lod/$id.glb" --width 512 --height 512 >/dev/null
  gz "$A/lod/$id.glb"
  # HD (only from a better source)
  if [ -f "$SRC_HD/$id.glb" ]; then
    "$GP" -i "$SRC_HD/$id.glb" -o "$tmp/$id.h.glb" -km -kn -ke
    "$GT" resize "$tmp/$id.h.glb" "$A/hd/$id.glb" --width 2048 --height 2048 >/dev/null
    gz "$A/hd/$id.glb"
  fi
  echo "$id: $t tris -> lod/$id.glb"
done
