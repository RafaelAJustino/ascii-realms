import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {REGION_SPECIES} from '../js/expanded-species.js';
import {densityCreatureArtwork,DENSITY_DUNGEON_BOSSES,DENSITY_REGIONAL_BOSSES} from '../js/density-bestiary.js';
import {HD_MONSTER_NAMES,HD_MONSTER_WIDTH,HD_MONSTER_HEIGHT,highDensityMonsterArt,hdMonsterCacheSize} from '../js/high-density-monsters.js';
import {estimateAsciiFont} from '../js/ascii-validator.js';
const species=REGION_SPECIES.flat();
assert.equal(species.length,150);
assert.equal(HD_MONSTER_NAMES.length,150);
assert.deepEqual(new Set(HD_MONSTER_NAMES),new Set(species.map(e=>e.name)));
assert.equal(HD_MONSTER_WIDTH,112);assert.equal(HD_MONSTER_HEIGHT,78);
const seen=new Set();const compactSeen=new Set();
const silhouettes=new Map();
for(const creature of species){
 const name=creature.name,art=highDensityMonsterArt(name),compact=highDensityMonsterArt(name,true);
 const rows=art.split('\n'),mini=compact.split('\n');
 assert.equal(rows.length,78,name+' full rows');assert.ok(rows.every(r=>r.length===112),name+' full cols');
 assert.equal(mini.length,52,name+' compact rows');assert.ok(mini.every(r=>r.length===76),name+' compact cols');
 assert.match(art,/^[\x20-\x7E\n]+$/,name+' ascii only');
 assert.match(compact,/^[\x20-\x7E\n]+$/,name+' compact ascii only');
 assert.ok((art.match(/[@%#*+==:.]/g)||[]).length>400,name+' high density');
 assert.ok((art.match(/\S/g)||[]).length>500,name+' nonempty composition');
 assert.ok(!seen.has(art),name+' duplicate');seen.add(art);
 assert.ok(!compactSeen.has(compact),name+' compact duplicate');compactSeen.add(compact);
 assert.equal(densityCreatureArtwork(name),art,name+' bestiary integration');
 assert.equal(densityCreatureArtwork(name,true),compact,name+' combat integration');
 assert.equal(highDensityMonsterArt(name),art,name+' reproducible');
}
assert.equal(seen.size,150);assert.equal(compactSeen.size,150);
assert.ok(hdMonsterCacheSize()<=14,'lazy LRU cache bound');
for(const boss of [...DENSITY_REGIONAL_BOSSES,...DENSITY_DUNGEON_BOSSES]){
 assert.equal(highDensityMonsterArt(boss),null,boss+' reserved for stage 5');
 assert.ok(densityCreatureArtwork(boss),'boss art integrated');
}
assert.equal(highDensityMonsterArt('monstro inexistente'),null);
for(const viewport of [320,390,430,720]){
 const columns=viewport<480?76:112,rows=viewport<480?52:78;
 const font=estimateAsciiFont({columns,rows,containerWidth:viewport<480?viewport*.45:viewport*.8,containerHeight:viewport<480?230:650,maxFont:18});
 assert.ok(font>0,viewport+' scaling');
}
const ui=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');
const bestiary=readFileSync(new URL('../js/progression-ui.js',import.meta.url),'utf8');
assert.match(ui,/miniBossArtworkForArea\(e.miniBossArea\):null\)\|\|densityCreatureArtwork\(e.baseName,true,e.boss\?e.bossPhase\|\|1:1\)/);
assert.match(bestiary,/densityCreatureArtwork\(name\)/);
assert.match(ui,/escape\(artwork\)/,'combat output escaped');
assert.match(bestiary,/escape\(densityCreatureArtwork\(name\)/,'bestiary escaped');
const schema=readFileSync(new URL('../js/state-schema.js',import.meta.url),'utf8');
assert.match(schema,/SAVE_VERSION\s*=\s*14/,'unchanged save version');
const generator=readFileSync(new URL('../tools/generate-monsters-hd.py',import.meta.url),'utf8');
assert.match(generator,/assert len\(set\(ARTS.values\(\)\)\)==150/);
console.log('OK: Etapa 4, 150 especies com atlas HD 112x78, combate 76x52, unicidade textual, 26 familias, cache LRU, bosses integrados, interface e save v14.');
