import {emptyChallenge,normalizeChallenge} from './exploration-challenge.js';
import {dynamicDefaults,normalizeDynamic} from './dynamic-quests.js';
import {adventureDefaults,normalizeAdventure,stringHash} from './procedural-adventures.js';
import {secretDefaults,normalizeSecrets} from './secrets.js';
// Estrutura aditiva: os campos antigos permanecem na raiz do salvamento.
export const SAVE_VERSION = 14;
import {normalizeInvested} from './attribute-milestones.js';
import {emptyJourney,normalizeJourney} from './journey-paths.js';
import {worldClimateDefaults,normalizeWorldClimate} from './world-climate.js';
import {normalizeAchievements,syncAchievements} from './achievements.js';
import {normalizeSkillVariants} from './skill-variants.js';
import {normalizeWeaponEvolution} from './weapon-evolution.js';
import {cityLifeDefaults,normalizeCityLife} from './city-life.js';
import {narrativeDefaults,normalizeNarrative,EVENT_BY_ID} from './journey-events.js';
export const EQUIPMENT_SLOTS = ['weapon','head','body','hands','feet','ring','amulet'];
export function extensionDefaults(){return {quests:{active:{},completed:[],claimed:[]},bestiary:{},statistics:{playTimeSeconds:0,monstersDefeated:0,bossesDefeated:0,deaths:0,damageDealt:0,highestDamage:0,damageTaken:0,goldEarned:0,goldSpent:0,itemsFound:0,questsCompleted:0,dungeonsCompleted:0},dungeons:{completed:[],rewards:[],best:{},attempt:null},specializations:{selected:null,unlocked:[]},enhancements:{},journey:emptyJourney(),worldClimate:worldClimateDefaults(),secrets:secretDefaults(),narrative:narrativeDefaults(),cityLife:cityLifeDefaults(),achievements:normalizeAchievements(null),skillVariants:{},investedStats:[0,0,0,0,0,0],dynamicQuests:dynamicDefaults(),adventure:adventureDefaults(),explorationChallenge:emptyChallenge()};}
export function normalizeSave(source){
 if(!source||typeof source!=='object'||Array.isArray(source))throw Error('Salvamento inválido');
 const s=structuredClone(source);
 if(!Number.isInteger(s.version)||s.version<1||s.version>SAVE_VERSION)throw Error('Versão incompatível');
 if(!['guerreiro','mago','arqueiro','ladino'].includes(s.cls)||!Array.isArray(s.stats)||s.stats.length!==6||!s.stats.every(n=>Number.isFinite(n)&&n>=0)||!Number.isInteger(s.lv)||s.lv<1||s.lv>100||!Number.isFinite(s.xp)||s.xp<0||!Number.isFinite(s.gold)||s.gold<0||!Array.isArray(s.items)||!s.equip||typeof s.equip!=='object')throw Error('Dados essenciais inválidos');
 s.name=typeof s.name==='string'?s.name.slice(0,24):'Herói';
 s.points=Number.isFinite(s.points)&&s.points>=0?s.points:0;
 // Salvamentos anteriores não registravam a origem dos pontos: nunca inferir investimentos.
 s.investedStats=normalizeInvested(s.investedStats);
 s.hp=Number.isFinite(s.hp)?Math.max(0,s.hp):1;s.mp=Number.isFinite(s.mp)?Math.max(0,s.mp):1;
 s.area=Number.isInteger(s.area)&&s.area>=1&&s.area<=100?s.area:1;
 s.bosses=Array.isArray(s.bosses)?s.bosses.filter(n=>Number.isInteger(n)&&n>=0&&n<10):[];
 s.materials=s.materials&&typeof s.materials==='object'&&!Array.isArray(s.materials)?s.materials:{};
 s.consumables={hp:3,mp:2,elixir:0,antidote:0,...(s.consumables||{})};
 s.equip=Object.fromEntries(EQUIPMENT_SLOTS.map(slot=>[slot,s.equip[slot]??null]));
 s.lastEncounterSpecies=s.lastEncounterSpecies&&typeof s.lastEncounterSpecies==='object'?s.lastEncounterSpecies:{};
 for(const [key,initial] of Object.entries(extensionDefaults())){
  if(key==='investedStats')continue;
  const value=s[key];s[key]=value&&typeof value==='object'&&!Array.isArray(value)?{...initial,...value}:structuredClone(initial);
 }
 s.dynamicQuests=normalizeDynamic(s.dynamicQuests);
 // A migração não altera missões ou atributos antigos. A semente permanece fixa após salvar.
 const legacySeed=stringHash([s.name,s.cls,s.lv,s.area,s.xp,s.gold,(s.stats||[]).join(','),s.statistics?.monstersDefeated||0].join('|'));
 s.adventure=normalizeAdventure(source.adventure,legacySeed);
 s.quests.active=s.quests.active&&typeof s.quests.active==='object'?s.quests.active:{};
 s.quests.completed=Array.isArray(s.quests.completed)?s.quests.completed:[];
 s.quests.claimed=Array.isArray(s.quests.claimed)?s.quests.claimed:[];
 for(const [key,value] of Object.entries(extensionDefaults().statistics))if(!Number.isFinite(s.statistics[key])||s.statistics[key]<0)s.statistics[key]=value;
 // Retomar combates seria inseguro: evita duplicação de recompensas após recarga.
 for(const it of s.items){if(!it||typeof it!=='object')continue;it.upgrade=Number.isInteger(it.upgrade)&&it.upgrade>=0&&it.upgrade<=10?it.upgrade:0;if(typeof it.setId!=='string')delete it.setId;normalizeWeaponEvolution(it);}
 // Uma batalha interrompida em masmorra retorna ao início da sala sem gerar recompensa.
 const attempt=s.dungeons?.attempt;
 if(attempt){if(typeof attempt.id!=='string'||!/^dungeon-[0-9]$/.test(attempt.id)||!Number.isInteger(attempt.room)||attempt.room<1||attempt.room>5){s.dungeons.attempt=null;}else if(s.combat){attempt.roomResolved=false;}}
 s.dungeons.completed=Array.isArray(s.dungeons.completed)?s.dungeons.completed:[];
 s.dungeons.rewards=Array.isArray(s.dungeons.rewards)?s.dungeons.rewards:[];
 s.dungeons.best=s.dungeons.best&&typeof s.dungeons.best==='object'?s.dungeons.best:{};
 if(!['guerreiro','mago','arqueiro','ladino'].includes(s.cls))s.specializations.selected=null;
 if(!Array.isArray(s.specializations.unlocked))s.specializations.unlocked=[];
 s.journey=normalizeJourney(s.journey,s.area);
 s.explorationChallenge=normalizeChallenge(source.explorationChallenge,s);
 // Combates comuns interrompidos não podem deixar uma etapa pendente irrecuperável.
 if(source.combat&&!s.explorationChallenge.miniBossEncounterPending&&s.journey.pendingKind==='combat')s.journey.pendingKind=null;
 if(s.explorationChallenge.miniBossEncounterPending){s.journey.event=null;s.journey.pendingKind=null;}
 s.worldClimate=normalizeWorldClimate(s.worldClimate);
 s.secrets=normalizeSecrets(s.secrets);
 // Compatibilidade com a antiga Etapa 7 descartada: nenhum aliado permanece ativo ou salvo.
 delete s.companions;
 s.narrative=normalizeNarrative(s.narrative);
 s.cityLife=normalizeCityLife(s.cityLife);
 if(s.journey.event&&(!EVENT_BY_ID[s.journey.event]||s.narrative.completed.includes(s.journey.event)))s.journey.event=null;
 // Eventos narrativos já pendentes em salvamentos legados também devem concluir uma única exploração.
 if(s.journey.event&&!s.journey.pendingKind)s.journey.pendingKind='event';
 if(!s.journey.event&&s.journey.pendingKind==='event')s.journey.pendingKind=null;
 s.achievements=normalizeAchievements(s.achievements);
 s.skillVariants=normalizeSkillVariants(s.skillVariants);
 syncAchievements(s);
 s.combat=null;s.version=SAVE_VERSION;
 return s;
}
