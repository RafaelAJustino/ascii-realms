import assert from 'node:assert/strict';
globalThis.document={querySelector:()=>null};
globalThis.window={addEventListener(){}};
const {rewardFor,dropProfiles}=await import('../js/loot.js');
import {maps} from '../js/data.js';
assert.equal(dropProfiles.length,10);
for(let region=0;region<10;region++){
 const level=region*10+1;
 for(let species=0;species<3;species++){
  const e={lv:level,boss:false,speciesIndex:species};
  const drops=rewardFor(e,'guerreiro',false,()=>0);
  assert.ok(Object.keys(drops.materials)[0]===dropProfiles[region].materials[species]);
  assert.equal(drops.items[0].region,region);
  assert.equal(drops.items[0].slot,dropProfiles[region].equipment[species]);
  const noDrops=rewardFor(e,'guerreiro',false,()=>.99);
  assert.equal(noDrops.items.length,0);
 }
 const boss={lv:level+9,boss:true};
 const first=rewardFor(boss,'mago',true,()=>.5);
 assert.equal(first.items.length,1);assert.ok(first.items[0].rarity>=2);
 assert.equal(first.items[0].region,region);
}
console.log('OK: 10 regiões, 30 espécies, materiais temáticos, raridade e prêmio de primeiro chefe.');
