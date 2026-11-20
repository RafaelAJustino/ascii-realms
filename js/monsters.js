import { initBossPhases } from './boss-phases.js';
import {monsterHealth,monsterAttack} from './final-balance.js';
import { rt } from './runtime.js';
import { maps, classes, active, passiveLevels, passiveNames, art, A, N, KEY } from './data.js';
import { clamp, rand, escape, mapId, tier, xpNeed, bar } from './utils.js';

import { SPECIES_PROFILES, BOSS_PROFILES } from './elements.js';
import { rollMonsterRarity } from './monster-rarity.js';
import {regionSpecies,pickRegionalSpecies} from './expanded-species.js';
export function enemy(level,boss=false,forcedSpeciesId=null){
 const region=mapId(level),m=maps[region];
 // Evita encontros consecutivos com a mesma espécie na região.
 // A memória fica no salvamento e não interfere nas lutas contra chefes.
 const previous=rt.state?.lastEncounterSpecies?.[region];
 const creature=boss?null:(regionSpecies(region).find(s=>s.id===forcedSpeciesId)||pickRegionalSpecies(region,previous));
 const speciesIndex=creature?.originalIndex??0; // Legacy loot material and equipment slot mapping.
 if(!boss&&rt.state){
  rt.state.lastEncounterSpecies??={};
  rt.state.lastEncounterSpecies[region]=creature.id;
 }
 const baseName=boss?m[2]:creature.name;
 const rarity=boss?null:rollMonsterRarity();
 const name=baseName;
 const hp=monsterHealth(level,boss,rarity?.hp,creature?.hpFactor);
 const mp=20+level*2;
 const profile=boss?BOSS_PROFILES[baseName]||{archetype:'wild',affinities:{}}:creature.profile;
 return initBossPhases({archetype:profile.archetype,attackElement:['physical','fire','poison','lightning','dark','ice','dark','fire','holy','dark'][region],affinities:{...profile.affinities},cooldowns:{},guardTurns:0,name,baseName,speciesIndex,speciesId:creature?.id||null,humanoid:creature?.humanoid||false,lv:level,hp,maxhp:hp,mp,maxmp:mp,atk:monsterAttack(level,boss,rarity?.attack,creature?.atkFactor),rarityId:rarity?.id??null,def:Math.floor(level*.85*(boss?1:creature.defFactor)),boss,effects:[],turn:0,aiCooldown:0});
}
