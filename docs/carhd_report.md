# Car LOD report (tools/car_lod_check.mjs)

Original = assets/cars/<id>.glb (unchanged). LEVE/light = assets/cars/lod/<id>.glb (traffic and far cars).
HD = assets/cars/hd/<id>.glb when a better source exists, otherwise the original (the best model in the repo).
Cells: triangles / largest texture / file size. Check = bounding box vs src/data/cars/car_bounds.json (max deviation as % of the car length, must be <= 1%; for
placeholders whose new model has other proportions the width/height can differ) and the paint material names of
car_glb.json (paint, fix, Car_Main for cell paint) present.

| id | car | original | light | check | HD | check |
|---|---|---|---|---|---|---|
| challenger | Dodge Challenger (2020) | 63,915 / 512 px / 1.65 MB | 39,927 / 512 px / 0.72 MB | OK (0.00%) | = original | = |
| huracan | Lamborghini Huracán | 39,066 / 512 px / 0.71 MB | 39,066 / 512 px / 0.71 MB | OK (0.14%) | 244,916 / 2048 px / 4.49 MB | OK (0.08%) |
| mach1 | Ford Mustang Mach 1 | 39,389 / 512 px / 1.27 MB | 39,389 / 512 px / 1.27 MB | OK (0.02%) | 243,900 / 1024 px / 6.08 MB | OK (0.01%) |
| rearturbo | Porsche 911 GT2 (997.1) | 49,729 / 512 px / 1.20 MB | 39,377 / 512 px / 0.83 MB | OK (0.00%) | = original | = |
| rwd24 | Subaru BRZ (ZD8) | 36,121 / 512 px / 0.77 MB | 36,121 / 512 px / 0.77 MB | OK (0.23%) | 268,112 / 1024 px / 5.36 MB | OK (0.05%) |
| svj | Lamborghini Aventador SVJ | 38,613 / 512 px / 0.54 MB | 38,613 / 512 px / 0.54 MB | OK (0.12%) | 247,620 / 2048 px / 3.31 MB | OK (0.14%) |
| urus | Lamborghini Urus | 33,508 / 512 px / 0.93 MB | 33,508 / 512 px / 0.93 MB | OK (0.12%) | 248,473 / 1024 px / 5.56 MB | OK (0.05%) |
| etype | Jaguar E-Type | 33,617 / - px / 0.69 MB | 33,617 / - px / 0.69 MB | FAIL (2.72%) | 125,497 / - px / 2.89 MB | FAIL (2.73%) |
| f40 | Ferrari F40 | 38,317 / - px / 0.55 MB | 38,317 / - px / 0.55 MB | OK (0.10%) | 243,604 / - px / 3.13 MB | OK (0.10%) |
| amgone | Mercedes-AMG One | 28,315 / 1024 px / 1.15 MB | 28,315 / 512 px / 0.81 MB | OK (0.00%) | = original | = |
| miata | Mazda MX-5 (NA) | 38,732 / 512 px / 0.56 MB | 38,732 / 512 px / 0.56 MB | OK (0.01%) | 51,316 / 1024 px / 0.75 MB | OK (0.01%) |
| p1 | McLaren P1 | 38,590 / 512 px / 1.08 MB | 38,590 / 512 px / 1.08 MB | OK (0.21%) | 196,914 / 1024 px / 3.65 MB | OK (0.04%) |
| sedan98 | BMW E46 | 18,447 / 1024 px / 0.73 MB | 18,447 / 512 px / 0.46 MB | OK (0.00%) | = original | = |
| ae86 | Toyota AE86 Trueno | 38,926 / 512 px / 1.11 MB | 38,926 / 512 px / 1.11 MB | OK (0.08%) | 86,343 / 1024 px / 1.96 MB | OK (0.02%) |
| viper | Dodge Viper RT/10 | 39,003 / 512 px / 1.04 MB | 39,003 / 512 px / 1.04 MB | OK (0.12%) | 232,800 / 512 px / 4.41 MB | OK (0.03%) |
| venom | Hennessey Venom F5 | 38,941 / - px / 0.57 MB | 38,941 / - px / 0.57 MB | OK (0.04%) | 161,368 / - px / 2.27 MB | OK (0.04%) |
| evo9 | Mitsubishi Lancer Evolution IX | 38,449 / 512 px / 1.08 MB | 38,449 / 512 px / 1.08 MB | OK (0.05%) | 51,728 / 1024 px / 1.51 MB | OK (0.00%) |
| offroad | Ford Ranger Raptor | 39,422 / - px / 0.63 MB | 39,422 / - px / 0.63 MB | OK (0.12%) | 245,250 / - px / 3.56 MB | OK (0.13%) |
| fastback65 | Ford Mustang 1965 fastback | 38,546 / 256 px / 0.74 MB | 38,546 / 256 px / 0.74 MB | OK (0.02%) | 72,511 / 256 px / 1.27 MB | OK (0.02%) |
| awd99 | Nissan Skyline R34 GT-R | 38,693 / - px / 0.59 MB | 38,693 / - px / 0.59 MB | OK (0.03%) | 84,208 / - px / 1.48 MB | OK (0.03%) |
| midv10 | Audi R8 V10 Performance (4S) | 38,743 / 512 px / 0.97 MB | 38,743 / 512 px / 0.97 MB | OK (0.69%) | 216,438 / 1024 px / 3.78 MB | OK (0.69%) |
| hothatch | Honda Civic Type R (FL5) | 38,594 / 512 px / 0.85 MB | 38,594 / 512 px / 0.85 MB | OK (0.76%) | 243,838 / 1024 px / 5.48 MB | OK (0.75%) |
| v8sport | Chevrolet Corvette (C7) | 39,334 / 512 px / 0.94 MB | 39,334 / 512 px / 0.94 MB | FAIL (3.96%) | 242,717 / 2048 px / 5.13 MB | FAIL (3.96%) |
| sportsaloon | Porsche Panamera Sport Turismo | 30,360 / 512 px / 0.90 MB | 30,360 / 512 px / 0.90 MB | OK (0.67%) | 30,360 / 1024 px / 1.13 MB | OK (0.67%) |
| sport3 | BMW M3 (G80) | 38,144 / 512 px / 1.54 MB | 38,144 / 512 px / 1.54 MB | OK (0.68%) | 248,278 / 1024 px / 7.62 MB | OK (0.68%) |

Notes (HD v2): every replaced car comes from its original high-quality Sketchfab source (credits in src/page/app.html),
processed by tools/carhd/ (prep.mjs: badges/plates removed, open doors closed, skins baked, BLEND windows named *_glass,
oriented and scaled to the old assets/cars/<id>.glb bounding box so car_bounds.json/car_glb.json still apply;
simp.mjs: per-material meshoptimizer simplification with normals as attributes; finish.mjs: textures capped, opaque
PNG -> JPEG). HD = full detail (simplified to ~250k triangles only when the source had more), textures <= 2048 px.
LEVE = ~40k triangles, 512 px textures, interior parts that pierced the roof dropped (rwd24, sport3).
assets/cars/<id>.glb (fallback / pages without LOD) is now the same file as the light level. Placeholders hothatch,
v8sport and sportsaloon keep car_glb.json "cell" paint: their body paint is the Car_Main material (white 64 px
texture, every paint vertex mapped to the cell). Cars without "hd" (challenger, sedan98, rearturbo, amgone ...) had
no better source. Known FAILs (proportions of the new model, not a bug): etype (new E-Type source is 10.7% taller
than the old model at the same length), v8sport (the C7 is 20% wider / 5% lower than the old stylised placeholder).