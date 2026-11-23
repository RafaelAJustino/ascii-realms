import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {maps} from '../js/data.js';
import {canonicalDungeonBosses} from '../js/ascii-validator.js';
import {HD_BOSS_NAMES,HD_REGIONAL_BOSSES,HD_DUNGEON_BOSSES,HD_BOSS_WIDTH,HD_BOSS_HEIGHT,highDensityBossArt,highDensityBossCacheSize} from '../js/high-density-bosses.js';
import {densityCreatureArtwork,DENSITY_REGIONAL_BOSSES,DENSITY_DUNGEON_BOSSES} from '../js/density-bestiary.js';
import {HD_MONSTER_NAMES,highDensityMonsterArt} from '../js/high-density-monsters.js';
import {estimateAsciiFont} from '../js/ascii-validator.js';

const expectArt=(art,w,h,label)=>{
 assert.equal(typeof art,'string',label);
 const rows=art.split('\n');
 assert.equal(rows.length,h,label+' lines');
 assert.ok(rows.every(s=>s.length===w),label+' width');
 assert.match(art,/^[\x20-\x7e\n]+$/,label+' printable ASCII');
 assert.ok((art.match(/[@%#*+=:.]/g)||[]).length>480,label+' shading');
 assert.ok((art.match(/\S/g)||[]).length>600,label+' recognizable silhouette area');
};
assert.deepEqual(HD_REGIONAL_BOSSES,maps.map(m=>m[2]));
assert.deepEqual(HD_DUNGEON_BOSSES,canonicalDungeonBosses);
assert.deepEqual(HD_BOSS_NAMES,[...DENSITY_REGIONAL_BOSSES,...DENSITY_DUNGEON_BOSSES]);
assert.equal(HD_BOSS_WIDTH,128);assert.equal(HD_BOSS_HEIGHT,88);
const main=new Set(),variants=new Set(),compact=new Set();
for(let i=0;i<HD_BOSS_NAMES.length;i++){
 const name=HD_BOSS_NAMES[i];
 const available=i<10?[1,2,3]:[1];
 const first=highDensityBossArt(name);
 expectArt(first,128,88,name);
 assert.ok(!main.has(first),name+' duplicated art'); main.add(first);
 assert.equal(densityCreatureArtwork(name),first,name+' bestiary shows full portrait');
 for(const phase of available){
  const full=highDensityBossArt(name,false,phase),mini=highDensityBossArt(name,true,phase);
  expectArt(full,128,88,name+' phase '+phase);
  expectArt(mini,76,52,name+' phase '+phase+' compact');
  assert.equal(densityCreatureArtwork(name,true,phase),mini,name+' combat phase integration');
  assert.ok(!variants.has(full),name+' duplicated phase');variants.add(full);
  assert.ok(!compact.has(mini),name+' duplicated compact');compact.add(mini);
  assert.equal(highDensityBossArt(name,false,phase),full,'deterministic full');
 }
 if(i>=10)assert.equal(highDensityBossArt(name,false,3),first,'dungeon boss has single phase');
}
assert.equal(main.size,20);assert.equal(variants.size,40);assert.equal(compact.size,40);
assert.equal(highDensityBossArt('Nome inexistente'),null);
assert.equal(highDensityBossArt(42),null);
assert.equal(highDensityBossArt(HD_BOSS_NAMES[0],false,100),highDensityBossArt(HD_BOSS_NAMES[0],false,3));
assert.equal(highDensityBossArt(HD_BOSS_NAMES[0],false,-20),highDensityBossArt(HD_BOSS_NAMES[0]));
// A etapa 4 mantem seus 150 retratos, sem nenhuma substituicao indevida.
assert.equal(HD_MONSTER_NAMES.length,150);
const originals=new Set(HD_MONSTER_NAMES.map(n=>highDensityMonsterArt(n)));
for(const art of main)assert.ok(!originals.has(art),'boss reused monster portrait');
assert.ok(highDensityBossCacheSize().full<=12,'bounded full cache');
assert.ok(highDensityBossCacheSize().compact<=12,'bounded compact cache');
for(const viewport of [320,375,390,430,720]){
 const font=estimateAsciiFont({columns:76,rows:52,containerWidth:viewport*.75,containerHeight:230,maxFont:6});
 assert.ok(font>0,'boss compact viewport '+viewport);
}
const ui=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');
assert.match(ui,/miniBossArtworkForArea\(e.miniBossArea\):null\)\|\|densityCreatureArtwork\(e.baseName,true,e.boss\?e.bossPhase\|\|1:1\)/,'phase-specific combat selection');
assert.match(ui,/escape\(artwork\)/,'HTML escaped');
assert.match(ui,/data-ascii="true"/,'fits existing responsive component');
assert.match(readFileSync(new URL('../js/progression-ui.js',import.meta.url),'utf8'),/densityCreatureArtwork\(name\)/);
assert.match(readFileSync(new URL('../js/state-schema.js',import.meta.url),'utf8'),/SAVE_VERSION\s*=\s*14/);
console.log('OK: Etapa 5, 20 chefes exclusivos, 40 artes (fases 1/2/3), 128x88 + 76x52, cache, UI, bosses de masmorra, saves v14.');
