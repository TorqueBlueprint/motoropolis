#!/usr/bin/env bash
# bc.sh <id> '<extra HD weights json>' '<extra light weights json>' [hdTex] [light extra opts json]
. /home/claude/carhd_work/gen_opts.sh
id=$1; HX=${2:-'{}'}; LX=${3:-'{}'}; TX=${4:-2048}; LO=${5:-'{}'}
H=$(python3 -c "import json,sys;a=json.loads(sys.argv[1]);a['w']={**json.loads(sys.argv[2]),**a['w']};print(json.dumps(a))" "$HD_OPTS" "$HX")
L=$(python3 -c "import json,sys;a=json.loads(sys.argv[1]);a['w']={**json.loads(sys.argv[2]),**a['w']};a.update(json.loads(sys.argv[3]));print(json.dumps(a))" "$LIGHT_OPTS" "$LX" "$LO")
NODE_OPTIONS=--max-old-space-size=12000 /home/claude/carhd_work/build_car.sh $id $id 250000 "$H" "$L" $TX 2>&1 | grep -E "\->|glb|rror"
