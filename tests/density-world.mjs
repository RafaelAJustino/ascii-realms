import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {maps} from '../js/data.js';
import {canonicalDungeons,estimateAsciiFont} from '../js/ascii-validator.js';
import {SCENE_WIDTH,SCENE_HEIGHT,DENSITY_CITIES,DENSITY_BIOMES,DENSITY_DUNGEONS,densityCityArtwork,densityBiomeArtwork,densityDungeonArtwork} from '../js/density-world.js';
const registries=[['cities',DENSITY_CITIES,maps.map(m=>m[1])],['biomes',DENSITY_BIOMES,maps.map(m=>m[0])],['dungeons',DENSITY_DUNGEONS,canonicalDungeons]];
const all=[];
for(const [kind,registry,names] of registries){
 assert.deepEqual(Object.keys(registry).sort(),names.slice().sort(),kind+' identifiers');
 for(const name of names){
  const art=registry[name];assert.equal(typeof art,'string');
  const lines=art.split('\n');assert.equal(lines.length,SCENE_HEIGHT,name);
  assert.ok(lines.every(line=>line.length===SCENE_WIDTH),name+' columns');
  assert.match(art,/^[\x20-\x7e\n]+$/,name+' ASCII only');
  assert.ok((art.match(/[@%#*+=:/\\|]/g)||[]).length>75,name+' structured shading');
  assert.ok(art.trim().length>250,name+' no placeholder');
  all.push(art);
  for(const width of [320,375,390,430,720]){
   const f=estimateAsciiFont({columns:SCENE_WIDTH,rows:SCENE_HEIGHT,containerWidth:width-48,containerHeight:410,maxFont:6});
   assert.ok(f*SCENE_WIDTH*.61<width-48,name+' responsive '+width);
  }
 }
}
assert.equal(all.length,30);assert.equal(new Set(all).size,30);
for(const m of maps){assert.equal(densityCityArtwork(m[1]),DENSITY_CITIES[m[1]]);assert.equal(densityBiomeArtwork(m[0]),DENSITY_BIOMES[m[0]]);}
for(const d of canonicalDungeons)assert.equal(densityDungeonArtwork(d),DENSITY_DUNGEONS[d]);
for(const getter of [densityCityArtwork,densityBiomeArtwork,densityDungeonArtwork])assert.equal(getter('nao encontrado'),null);
const ui=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');
assert.match(ui,/densityCityArtwork\(m\[1\]\)/);
assert.match(ui,/densityBiomeArtwork\(m\[0\]\)/);
assert.match(ui,/densityDungeonArtwork\(d\.name\)/);
assert.match(ui,/escape\(highDensityCityArtwork\(/);
assert.match(ui,/escape\(highDensityBiomeArtwork\(/);
assert.match(ui,/escape\(highDensityDungeonArtwork\(/);
console.log('OK: 10 cidades, 10 biomas e 10 masmorras ASCII, 112x42, 30 desenhos diferentes, escape seguro e interface integrada.');
