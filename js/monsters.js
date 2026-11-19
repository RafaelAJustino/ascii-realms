import { initBossPhases } from './boss-phases.js';
import { rt } from './runtime.js';
import { maps, classes, active, passiveLevels, passiveNames, art, A, N, KEY } from './data.js';
import { clamp, rand, escape, mapId, tier, xpNeed, bar } from './utils.js';

import { SPECIES_PROFILES, BOSS_PROFILES } from './elements.js';
import { rollMonsterRarity } from './monster-rarity.js';
export function enemy(level,boss=false){
 const region=mapId(level),m=maps[region];
 // Evita encontros consecutivos com a mesma espécie na região.
 // A memória fica no salvamento e não interfere nas lutas contra chefes.
 const previous=rt.state?.lastEncounterSpecies?.[region];
 const candidates=[0,1,2].filter(i=>i!==previous);
 const speciesIndex=boss?0:candidates[rand(0,candidates.length-1)];
 if(!boss&&rt.state){
  rt.state.lastEncounterSpecies??={};
  rt.state.lastEncounterSpecies[region]=speciesIndex;
 }
 const baseName=boss?m[2]:m[3+speciesIndex];
 const rarity=boss?null:rollMonsterRarity();
 const name=baseName;
 const hp=Math.floor((35+level*13+level**1.3)*(boss?6:rarity.hp));
 const mp=20+level*2;
 const profile=(boss?BOSS_PROFILES:SPECIES_PROFILES)[baseName]||{archetype:'wild',affinities:{}};
 return initBossPhases({archetype:profile.archetype,attackElement:['physical','fire','poison','lightning','dark','ice','dark','fire','holy','dark'][region],affinities:{...profile.affinities},cooldowns:{},guardTurns:0,name,baseName,speciesIndex,lv:level,hp,maxhp:hp,mp,maxmp:mp,atk:Math.floor((7+level*2.5)*(boss?1:rarity.attack)),rarityId:rarity?.id??null,def:Math.floor(level*.85),boss,effects:[],turn:0,aiCooldown:0});
}
