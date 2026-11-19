import assert from 'node:assert/strict';
import {MONSTER_RARITIES,rollMonsterRarity} from '../js/monster-rarity.js';
globalThis.document={querySelector:()=>null};
globalThis.window={addEventListener(){}};
const {enemy}=await import('../js/monsters.js');
const {rt}=await import('../js/runtime.js');
import {maps} from '../js/data.js';
const {rewardFor}=await import('../js/loot.js');
const counts=Object.fromEntries(MONSTER_RARITIES.map(r=>[r.id,0]));
for(let i=0;i<100000;i++)counts[rollMonsterRarity().id]++;
for(const rarity of MONSTER_RARITIES){const expected=100000*rarity.chance;assert.ok(Math.abs(counts[rarity.id]-expected)<Math.max(100,6*Math.sqrt(expected*(1-rarity.chance))),`${rarity.label}: ${counts[rarity.id]}`)}
rt.state={lastEncounterSpecies:{}};
for(let region=0;region<10;region++){
 const seen=new Set();let previous=null;
 for(let i=0;i<300;i++){
  const lv=region*10+1,e=enemy(lv);seen.add(e.speciesIndex);
  assert.notEqual(e.speciesIndex,previous);previous=e.speciesIndex;
  assert.equal(e.baseName,maps[region][3+e.speciesIndex]);
  const rarity=MONSTER_RARITIES.find(r=>r.id===e.rarityId);
  assert.equal(e.maxhp,Math.floor((35+lv*13+lv**1.3)*rarity.hp));
  assert.equal(e.atk,Math.floor((7+lv*2.5)*rarity.attack));
  assert.equal(e.lv,lv);
  const drop=rewardFor(e,'guerreiro',false,()=>0);
  assert.ok(drop.items.every(item=>item.lv<=lv));
 }
 assert.equal(seen.size,3);
 const boss=enemy((region+1)*10,true);assert.equal(boss.rarityId,null);assert.equal(boss.boss,true);
}
console.log('OK: 100.000 sorteios:',counts,'; atributos, espécies, níveis, drops e chefes.');
