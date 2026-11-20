import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {maps} from '../js/data.js';
import {canonicalDungeons,estimateAsciiFont} from '../js/ascii-validator.js';
import {WORLD_WIDTH,WORLD_HEIGHT,WORLD_IDS,worldCacheSize,highDensityCityArtwork,highDensityBiomeArtwork,highDensityDungeonArtwork} from '../js/high-density-world.js';
const collections=[['cidade',WORLD_IDS.cities,highDensityCityArtwork],['bioma',WORLD_IDS.biomes,highDensityBiomeArtwork],['masmorra',WORLD_IDS.dungeons,highDensityDungeonArtwork]];
assert.deepEqual(WORLD_IDS.cities,maps.map(m=>m[1]));
assert.deepEqual(WORLD_IDS.biomes,maps.map(m=>m[0]));
assert.deepEqual(WORLD_IDS.dungeons,canonicalDungeons);
const seen=new Set();
for(const [kind,ids,fn] of collections){
 assert.equal(ids.length,10);assert.equal(new Set(ids).size,10);
 for(const id of ids){
  const art=fn(id),rows=art.split('\n');
  assert.equal(rows.length,WORLD_HEIGHT,`${kind}: ${id}: linhas`);
  assert.ok(rows.every(r=>r.length===WORLD_WIDTH),`${kind}: ${id}: colunas`);
  assert.match(art,/^[\x20-\x7e\n]+$/,`${kind}: ${id}: ASCII imprimível`);
  assert.ok((art.match(/[@%#*+=\-:./\\|]/g)||[]).length>1100,`${kind}: ${id}: volume e sombras`);
  assert.ok(!seen.has(art),`${kind}: ${id}: sem arte duplicada`);seen.add(art);
  assert.equal(fn(id),art,'mesma arte estável e reaproveitada');
  assert.ok(worldCacheSize()<=8,'cache LRU limita cenas em memória');
  for(const viewport of [320,375,390,430,720]){
   const font=estimateAsciiFont({columns:WORLD_WIDTH,rows:WORLD_HEIGHT,containerWidth:viewport-48,containerHeight:340,maxFont:6});
   assert.ok(font>0&&font*WORLD_WIDTH*.61<=viewport-48,`${id}: ${viewport}px`);
  }
 }
 assert.equal(fn('localidade inexistente'),null);
}
assert.equal(seen.size,30);
const ui=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');
for(const key of ['highDensityCityArtwork(m[1])','highDensityBiomeArtwork(m[0])','highDensityDungeonArtwork(d.name)','escape(highDensityCityArtwork(', 'escape(highDensityBiomeArtwork(', 'escape(highDensityDungeonArtwork('])assert.ok(ui.includes(key),'integração da interface: '+key);
assert.match(ui,/hd-world-scene/);
assert.match(ui,/function fitAscii\(el\)/);
assert.match(ui,/ascii-zoomable/);
const css=readFileSync(new URL('../css/high-density-world.css',import.meta.url),'utf8');assert.match(css,/white-space:pre/);assert.match(css,/prefers-reduced-motion/);
console.log('OK: etapa 6, 10 cidades, 10 biomas e 10 masmorras de 140x64, exclusividade textual, ASCII, cache, viewport e integração.');
