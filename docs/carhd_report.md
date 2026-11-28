# Car LOD report (tools/car_lod_check.mjs)

Original = assets/cars/<id>.glb (unchanged). LEVE/light = assets/cars/lod/<id>.glb (traffic and far cars).
HD = assets/cars/hd/<id>.glb when a better source exists, otherwise the original (the best model in the repo).
Cells: triangles / largest texture / file size. Check = bounding box vs original (max deviation as % of the car
length, must be <= 1%) and every original material name present (paint recolouring).

| id | car | original | light | check | HD | check |
|---|---|---|---|---|---|---|
| challenger | Dodge Challenger (2020) | 63,915 / 512 px / 1.65 MB | 39,927 / 512 px / 0.72 MB | OK (0.00%) | = original | = |
| huracan | Lamborghini Huracán | 58,820 / 1024 px / 1.81 MB | 39,715 / 512 px / 0.79 MB | OK (0.06%) | = original | = |
| mach1 | Ford Mustang Mach 1 | 42,434 / 512 px / 0.72 MB | 39,383 / 512 px / 0.64 MB | OK (0.00%) | = original | = |
| rearturbo | Porsche 911 GT2 (997.1) | 49,729 / 512 px / 1.20 MB | 39,377 / 512 px / 0.83 MB | OK (0.00%) | = original | = |
| rwd24 | Subaru BRZ (ZD8) | 75,401 / 512 px / 1.36 MB | 39,105 / 512 px / 0.69 MB | OK (0.42%) | = original | = |
| svj | Lamborghini Aventador SVJ | 41,909 / 1024 px / 0.67 MB | 39,386 / 512 px / 0.48 MB | OK (0.01%) | = original | = |
| urus | Lamborghini Urus | 44,930 / 1024 px / 0.79 MB | 39,531 / 512 px / 0.67 MB | OK (0.00%) | = original | = |
| etype | Jaguar E-Type | 40,841 / - px / 0.65 MB | 39,316 / - px / 0.48 MB | OK (0.00%) | = original | = |
| f40 | Ferrari F40 | 40,705 / - px / 0.75 MB | 39,348 / - px / 0.53 MB | OK (0.00%) | = original | = |
| amgone | Mercedes-AMG One | 28,315 / 1024 px / 1.15 MB | 28,315 / 512 px / 0.81 MB | OK (0.00%) | = original | = |
| miata | Mazda MX-5 (NA) | 27,570 / 1024 px / 0.52 MB | 27,570 / 512 px / 0.49 MB | OK (0.00%) | = original | = |
| p1 | McLaren P1 | 37,981 / 1024 px / 0.79 MB | 37,981 / 512 px / 0.74 MB | OK (0.00%) | = original | = |
| sedan98 | BMW E46 | 18,447 / 1024 px / 0.73 MB | 18,447 / 512 px / 0.46 MB | OK (0.00%) | = original | = |

Notes: the light files come from tools/car_lod.sh (gltfpack 1.3 -si <ratio> -slb -km -kn -ke, then gltf-transform resize
512). rwd24 uses tools/car_lod_sel.mjs instead (body paint, glass, lights and chrome untouched, the rest at 0.3): a
uniform 0.52 pass let the roll cage show through the roof. Cars with <= 40k triangles and <= 512 px textures have no
light file (they are already light). No HD file yet: the repo has no higher-quality source than assets/cars/<id>.glb,
so HD = the original; drop a better source in ../car_sources/<id>.glb and run tools/car_lod.sh <id> to make hd/<id>.glb
(then set "hd" in src/data/cars/car_lod.json).

All checks passed.
