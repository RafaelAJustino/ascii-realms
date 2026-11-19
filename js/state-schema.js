// Estrutura aditiva: os campos antigos permanecem na raiz do salvamento.
export const SAVE_VERSION = 5;
export const EQUIPMENT_SLOTS = ['weapon','head','body','hands','feet','ring','amulet'];
export function extensionDefaults(){return {quests:{active:{},completed:[],claimed:[]},bestiary:{},statistics:{playTimeSeconds:0,monstersDefeated:0,bossesDefeated:0,deaths:0,damageDealt:0,highestDamage:0,damageTaken:0,goldEarned:0,goldSpent:0,itemsFound:0,questsCompleted:0,dungeonsCompleted:0},dungeons:{completed:[],rewards:[],best:{},attempt:null},specializations:{selected:null,unlocked:[]},enhancements:{}};}
export function normalizeSave(source){
 if(!source||typeof source!=='object'||Array.isArray(source))throw Error('Salvamento inválido');
 const s=structuredClone(source);
 if(!Number.isInteger(s.version)||s.version<1||s.version>SAVE_VERSION)throw Error('Versão incompatível');
 if(!['guerreiro','mago','arqueiro','ladino'].includes(s.cls)||!Array.isArray(s.stats)||s.stats.length!==6||!s.stats.every(n=>Number.isFinite(n)&&n>=0)||!Number.isInteger(s.lv)||s.lv<1||s.lv>100||!Number.isFinite(s.xp)||s.xp<0||!Number.isFinite(s.gold)||s.gold<0||!Array.isArray(s.items)||!s.equip||typeof s.equip!=='object')throw Error('Dados essenciais inválidos');
 s.name=typeof s.name==='string'?s.name.slice(0,24):'Herói';
 s.points=Number.isFinite(s.points)&&s.points>=0?s.points:0;
 s.hp=Number.isFinite(s.hp)?Math.max(0,s.hp):1;s.mp=Number.isFinite(s.mp)?Math.max(0,s.mp):1;
 s.area=Number.isInteger(s.area)&&s.area>=1&&s.area<=100?s.area:1;
 s.bosses=Array.isArray(s.bosses)?s.bosses.filter(n=>Number.isInteger(n)&&n>=0&&n<10):[];
 s.materials=s.materials&&typeof s.materials==='object'&&!Array.isArray(s.materials)?s.materials:{};
 s.consumables={hp:3,mp:2,elixir:0,antidote:0,...(s.consumables||{})};
 s.equip=Object.fromEntries(EQUIPMENT_SLOTS.map(slot=>[slot,s.equip[slot]??null]));
 s.lastEncounterSpecies=s.lastEncounterSpecies&&typeof s.lastEncounterSpecies==='object'?s.lastEncounterSpecies:{};
 for(const [key,initial] of Object.entries(extensionDefaults())){
  const value=s[key];s[key]=value&&typeof value==='object'&&!Array.isArray(value)?{...initial,...value}:structuredClone(initial);
 }
 s.quests.active=s.quests.active&&typeof s.quests.active==='object'?s.quests.active:{};
 s.quests.completed=Array.isArray(s.quests.completed)?s.quests.completed:[];
 s.quests.claimed=Array.isArray(s.quests.claimed)?s.quests.claimed:[];
 for(const [key,value] of Object.entries(extensionDefaults().statistics))if(!Number.isFinite(s.statistics[key])||s.statistics[key]<0)s.statistics[key]=value;
 // Retomar combates seria inseguro: evita duplicação de recompensas após recarga.
 for(const it of s.items){if(!it||typeof it!=='object')continue;it.upgrade=Number.isInteger(it.upgrade)&&it.upgrade>=0&&it.upgrade<=10?it.upgrade:0;if(typeof it.setId!=='string')delete it.setId;}
 // Uma batalha interrompida em masmorra retorna ao início da sala sem gerar recompensa.
 const attempt=s.dungeons?.attempt;
 if(attempt){if(typeof attempt.id!=='string'||!Number.isInteger(attempt.room)||attempt.room<1||attempt.room>5){s.dungeons.attempt=null;}else if(s.combat){attempt.roomResolved=false;}}
 s.dungeons.completed=Array.isArray(s.dungeons.completed)?s.dungeons.completed:[];
 s.dungeons.rewards=Array.isArray(s.dungeons.rewards)?s.dungeons.rewards:[];
 s.dungeons.best=s.dungeons.best&&typeof s.dungeons.best==='object'?s.dungeons.best:{};
 if(!['guerreiro','mago','arqueiro','ladino'].includes(s.cls))s.specializations.selected=null;
 if(!Array.isArray(s.specializations.unlocked))s.specializations.unlocked=[];
 s.combat=null;s.version=SAVE_VERSION;
 return s;
}
