import assert from 'node:assert/strict';
import {MONSTER_RARITIES,rollMonsterRarity} from '../js/monster-rarity.js';
globalThis.document={querySelector:()=>null};
globalThis.window={addEventListener(){}};
const {enemy}=await import('../js/monsters.js');
const {rt}=await import('../js/runtime.js');
import {maps} from '../js/data.js';
import {monsterHealth,monsterAttack} from '../js/final-balance.js';
import {regionSpecies} from '../js/expanded-species.js';
const {rewardFor}=await import('../js/loot.js');
const counts=Object.fromEntries(MONSTER_RARITIES.map(r=>[r.id,0]));
for(let i=0;i<100000;i++)counts[rollMonsterRarity().id]++;
for(const rarity of MONSTER_RARITIES){const expected=100000*rarity.chance;assert.ok(Math.abs(counts[rarity.id]-expected)<Math.max(100,6*Math.sqrt(expected*(1-rarity.chance))),`${rarity.label}: ${counts[rarity.id]}`)}
rt.state={lastEncounterSpecies:{}};
for(let region=0;region<10;region++){
 const seen=new Set();let previous=null;
 for(let i=0;i<300;i++){
  const lv=region*10+1,e=enemy(lv);seen.add(e.speciesId);
  assert.notEqual(e.speciesId,previous);previous=e.speciesId;
  const record=regionSpecies(region).find(x=>x.id===e.speciesId);
  assert.equal(e.baseName,record.name);
  const rarity=MONSTER_RARITIES.find(r=>r.id===e.rarityId);
  assert.equal(e.maxhp,monsterHealth(lv,false,rarity.hp,record.hpFactor));
  assert.equal(e.atk,monsterAttack(lv,false,rarity.attack,record.atkFactor));
  assert.equal(e.lv,lv);
  const drop=rewardFor(e,'guerreiro',false,()=>0);
  assert.ok(drop.items.every(item=>item.lv<=lv));
 }
 assert.ok(seen.size>=12);
 const boss=enemy((region+1)*10,true);assert.equal(boss.rarityId,null);assert.equal(boss.boss,true);
}
console.log('OK: 100.000 sorteios:',counts,'; atributos, espécies, níveis, drops e chefes.');
