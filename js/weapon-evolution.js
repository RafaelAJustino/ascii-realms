import {FORGE_MATERIALS} from './forge-materials.js';

// Evolução aditiva, independente do aprimoramento +0 a +10. Máximo 3 estágios.
export const EVOLUTION_STAGES=[
 {stage:1,kills:8,bosses:0,quests:0,materials:2,label:'Despertar'},
 {stage:2,kills:25,bosses:1,quests:1,materials:3,label:'Ressonância'},
 {stage:3,kills:50,bosses:2,quests:2,materials:4,label:'Legado'}
];
export const MAX_EVOLUTION=EVOLUTION_STAGES.length;
export function isEvolvableWeapon(item){return !!item&&item.slot==='weapon'&&(item.rarity>=3||String(item.name||'').startsWith('Relíquia de '));}
export function normalizeWeaponEvolution(item){
 if(!isEvolvableWeapon(item)){delete item?.evolution;return null;}
 const e=item.evolution&&typeof item.evolution==='object'?item.evolution:{};
 item.evolution={stage:Number.isInteger(e.stage)?Math.max(0,Math.min(MAX_EVOLUTION,e.stage)):0,kills:Number.isInteger(e.kills)?Math.max(0,Math.min(1000000,e.kills)):0,bosses:Number.isInteger(e.bosses)?Math.max(0,Math.min(1000000,e.bosses)):0};
 return item.evolution;
}
export function nextEvolution(item){if(!isEvolvableWeapon(item))return null;return EVOLUTION_STAGES[item.evolution?.stage||0]||null;}
export function evolutionRequirement(state,item){
 const step=nextEvolution(item);if(!step)return null;
 const region=Math.max(0,Math.min(9,Number.isInteger(item.region)?item.region:Math.floor((item.lv-1)/10)));
 const material=FORGE_MATERIALS[region];
 const kills=item.evolution?.kills||0,bosses=item.evolution?.bosses||0,quests=state.quests?.claimed?.length||0;
 return {...step,material,killsDone:kills,bossesDone:bosses,questsDone:quests,materialsDone:state.materials?.[material]||0,ready:kills>=step.kills&&bosses>=step.bosses&&quests>=step.quests&&(state.materials?.[material]||0)>=step.materials};
}
export function recordWeaponVictory(state,enemy){
 if(!state||!enemy)return false;
 const item=state.items?.find(it=>it.uid===state.equip?.weapon);
 if(!isEvolvableWeapon(item))return false;
 normalizeWeaponEvolution(item);
 item.evolution.kills=Math.min(1000000,item.evolution.kills+1);
 if(enemy.boss||enemy.dungeonBoss)item.evolution.bosses=Math.min(1000000,item.evolution.bosses+1);
 return true;
}
export function evolveWeapon(state,uid){
 if(!state||state.combat||typeof uid!=='string')return false;
 const item=state.items?.find(it=>it.uid===uid);
 if(!isEvolvableWeapon(item))return false;
 normalizeWeaponEvolution(item);
 const req=evolutionRequirement(state,item);if(!req?.ready)return false;
 state.materials[req.material]-=req.materials;
 item.evolution.stage=req.stage;
 return true;
}
export function evolutionBonus(item){
 if(!isEvolvableWeapon(item))return {attack:0,magic:0};
 const stage=Math.max(0,Math.min(MAX_EVOLUTION,item.evolution?.stage||0));
 // Máximo: +9% sobre o poder BASE da arma, sem multiplicar a progressão +10.
 return {attack:Math.floor((item.attack||0)*stage*.03),magic:Math.floor((item.magic||0)*stage*.03)};
}
