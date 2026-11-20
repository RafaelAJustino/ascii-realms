import assert from 'node:assert/strict';
import {SPECIES_PROFILES,BOSS_PROFILES,applyElementalDamage,elementMultiplier,PLAYER_SKILL_ELEMENTS} from '../js/elements.js';
import {ARCHETYPES,availableMonsterActions,chooseMonsterAction,finishMonsterAction,scoreMonsterAction} from '../js/monster-ai.js';
import {maps,active} from '../js/data.js';
import {MONSTER_RARITIES} from '../js/monster-rarity.js';
assert.equal(Object.keys(SPECIES_PROFILES).length,30);
assert.equal(Object.keys(BOSS_PROFILES).length,10);
for(const m of maps){for(const name of m.slice(3,6))assert.ok(SPECIES_PROFILES[name]);assert.ok(BOSS_PROFILES[m[2]]);}
assert.equal(new Set(Object.values(SPECIES_PROFILES).map(p=>p.archetype)).size,6);
for(const archetype of ARCHETYPES)assert.ok(Object.values(SPECIES_PROFILES).some(p=>p.archetype===archetype));
for(const multiplier of [0,.65,.85,1,1.25,1.5])assert.equal(applyElementalDamage(100,{affinities:{fire:multiplier}},'fire'),Math.floor(100*multiplier));
assert.equal(applyElementalDamage(100,{affinities:{fire:.65}},'ice'),100);
assert.equal(elementMultiplier({affinities:{poison:0}},'poison'),0);
for(const [cls,skills] of Object.entries(active))assert.equal(PLAYER_SKILL_ELEMENTS[cls].length,skills.length);
const player={hp:200,maxhp:200,effects:[],affinities:{fire:1.5,physical:.65}};
const e={lv:50,hp:400,maxhp:400,atk:90,mp:0,maxmp:120,archetype:'magical',rarityId:'common',cooldowns:{},effects:[]};
assert.deepEqual(availableMonsterActions(e).map(a=>a.id),['strike']);
e.mp=120;assert.ok(availableMonsterActions(e).length>1);
let a=availableMonsterActions(e).find(a=>a.id==='element');finishMonsterAction(e,a);
assert.equal(e.mp,98);assert.ok(!availableMonsterActions(e).some(a=>a.id==='element'));
for(let i=0;i<3;i++)finishMonsterAction(e,{id:'strike',cost:0,cooldown:0});
assert.ok(availableMonsterActions(e).some(a=>a.id==='element'));
e.hp=40;e.archetype='defensive';e.mp=120;assert.equal(chooseMonsterAction(e,player,{playerStats:{def:10,md:10},random:()=>.5}).id,'heal');
e.hp=400;e.archetype='aggressive';assert.notEqual(chooseMonsterAction(e,player,{playerStats:{def:10,md:10},random:()=>.5}).id,'heal');
const strike=availableMonsterActions(e).find(a=>a.id==='strike');const fire=availableMonsterActions(e).find(a=>a.id==='element');
e.archetype='strategic';assert.ok(scoreMonsterAction(fire,e,player,{playerStats:{def:10,md:10},random:()=>.5})>scoreMonsterAction(strike,e,player,{playerStats:{def:10,md:10},random:()=>.5}));
for(const rarity of MONSTER_RARITIES){e.rarityId=rarity.id;assert.ok(availableMonsterActions(e).length>0);assert.ok(chooseMonsterAction(e,player));}
console.log('OK: 30 espécies, 10 chefes, 6 arquétipos, elementos, habilidades, MP, recargas e cinco categorias.');
