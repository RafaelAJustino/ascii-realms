import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {maps} from '../js/data.js';
import {INTERIOR_TYPES} from '../js/density-settlements.js';
import {INTERIOR_HD_WIDTH,INTERIOR_HD_HEIGHT,HIGH_DENSITY_INTERIOR_TYPES,highDensityInteriorArtwork,interiorCacheSize} from '../js/high-density-interiors.js';
assert.equal(maps.length,10);assert.equal(INTERIOR_TYPES.length,7);assert.deepEqual(HIGH_DENSITY_INTERIOR_TYPES,INTERIOR_TYPES);
const seen=new Set();
for(let region=0;region<maps.length;region++)for(const type of INTERIOR_TYPES){
 const key=`${region}:${type}`,art=highDensityInteriorArtwork(region,type);
 assert.equal(art.split('\n').length,INTERIOR_HD_HEIGHT,`${key}: altura`);
 assert.ok(art.split('\n').every(line=>line.length===INTERIOR_HD_WIDTH),`${key}: largura`);
 assert.match(art,/^[\x20-\x7e\n]+$/,`${key}: ASCII`);
 assert.ok((art.match(/[@%#*+=\-:./\\|]/g)||[]).length>1200,`${key}: volume e sombras`);
 assert.ok(!seen.has(art),`${key}: arte diferente`);seen.add(art);
 assert.equal(highDensityInteriorArtwork(region,type),art,'arte estável');
 assert.ok(interiorCacheSize()<=10,'cache limitado');
}
assert.equal(seen.size,70);
for(const input of [[-1,'tavern'],[10,'forge'],['0','weapon'],[2,'nonexistent'],[.5,'tavern']])assert.equal(highDensityInteriorArtwork(...input),null);
const ui=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');
for(const text of ["highDensityInteriorArtwork(region,type)||densityInteriorArtwork(region,type)","interiorScene(region,'tavern')","interiorScene(region,'forge')","interiorScene(region,'materials')", "interiorScene(region,'potion')", 'hd-interior-scene','escape(art)'])assert.ok(ui.includes(text),text);
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/high-density-world\.css/);
console.log('OK: etapa 6, 70 estabelecimentos de 124x54 (7 por cidade), ASCII, cache, ids válidos, escape e UI.');
