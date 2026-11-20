import assert from 'node:assert/strict';
import {REGION_SPECIES,pickRegionalSpecies,EXTENDED_ARTWORKS} from '../js/expanded-species.js';
import {maps} from '../js/data.js';
import {validateArtwork} from '../js/ascii-validator.js';
assert.equal(REGION_SPECIES.length,10);
const seen=new Set();
for(let r=0;r<10;r++){
 const entries=REGION_SPECIES[r];
 assert.equal(entries.length,15);
 assert.equal(entries.filter(e=>e.kind==='common').length,12);
 assert.equal(entries.filter(e=>e.kind==='special').length,3);
 assert.ok(entries.filter(e=>e.humanoid).length>=2,`humanoids map ${r}`);
 for(const entry of entries){
  assert.ok(!seen.has(entry.id));seen.add(entry.id);
  assert.ok(entry.originalIndex>=0&&entry.originalIndex<=2);
  assert.ok(entry.hpFactor>0&&entry.atkFactor>0&&entry.defFactor>0);
  assert.ok(entry.profile?.archetype);
  if(!entry.id.includes('original'))assert.deepEqual(validateArtwork('expanded',entry.name,EXTENDED_ARTWORKS[entry.name]),[]);
 }
 for(let i=0;i<200;i++){
  const choice=pickRegionalSpecies(r,entries[0].id,()=>i%2===0?.01:.99);
  assert.notEqual(choice.id,entries[0].id);
  assert.ok(entries.includes(choice));
 }
 assert.equal(entries[0].name,maps[r][3]);
}
assert.equal(seen.size,150);
console.log('OK: 150 inimigos regionalizados, 12 comuns + 3 especiais por mapa, humanoides, arte ASCII e escolhas seguras.');
