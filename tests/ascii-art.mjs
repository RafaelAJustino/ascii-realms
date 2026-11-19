import assert from 'node:assert/strict';
import { validateArtwork,validateFrames,validateArtRegistry,estimateAsciiFont,canonicalSpecies,canonicalCities } from '../js/ascii-validator.js';
import {detailedArtworks} from '../js/artworks-detailed.js';
import {detailedCities} from '../js/cities-detailed.js';
import {dungeonBossArt,dungeonScenes} from '../js/dungeon-artworks.js';
import {heroArtworks} from '../js/hero-artworks.js';
import {creatureFrames} from '../js/ascii-animation.js';
const issues=validateArtRegistry();
assert.deepEqual(issues,[],issues.join('\n'));
assert.equal(Object.keys(detailedArtworks).length,40);
assert.equal(Object.keys(detailedCities).length,10);
assert.equal(Object.keys(dungeonBossArt).length,10);
assert.equal(Object.keys(dungeonScenes).length,10);
assert.equal(Object.keys(heroArtworks).length,4);
assert.equal(new Set(canonicalSpecies).size,40);
assert.equal(new Set(canonicalCities).size,10);
for(const [name,art] of Object.entries(detailedArtworks)){
 const frames=creatureFrames(art);
 assert.equal(frames.length,4);
 assert.deepEqual(validateFrames('animation',name,frames),[]);
 assert.ok(new Set(frames).size>1,`${name}: animacao sem diferencas visiveis`);
}
assert.ok(validateArtwork('bad.js','Teste','x'.repeat(51)).some(s=>s.includes('linha 1')));
assert.ok(validateArtwork('bad.js','Teste','ab\u2588').some(s=>s.includes('U+2588')));
assert.ok(validateFrames('bad.js','Teste',['abc','ab']).some(s=>s.includes('incompativeis')));
for(const width of [320,375,430,720]){
  const area=width-48;
  for(const art of [...Object.values(detailedArtworks),...Object.values(detailedCities),...Object.values(dungeonScenes),...Object.values(dungeonBossArt),...Object.values(heroArtworks)]){
    const rows=art.split('\n').length,cols=Math.max(...art.split('\n').map(s=>s.length));
    const font=estimateAsciiFont({columns:cols,rows,containerWidth:area,containerHeight:410});
    assert.ok(cols*font*.61 <= area-7,`${width} width`);
    assert.ok(rows*font*1.1<=402,`${width} height`);
  }
}
console.log('OK: 40 criaturas, 10 cidades, 10 masmorras, 10 chefes de masmorra, 4 herois, 4 quadros/creatura, ASCII 32-126, 50 colunas e estimativa 320/375/430/720.');
