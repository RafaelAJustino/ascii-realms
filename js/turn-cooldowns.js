// Cooldowns de combate: apenas oportunidades de ação, nunca tempo real.
// O contador recém-ativado não é reduzido durante a própria ação.
import {active} from './data.js';
import {specSkills} from './specializations.js';

// Cada índice aponta para a identidade estável da habilidade existente.
export const PLAYER_COOLDOWNS=Object.freeze({
 guerreiro:[2,3,3,4], // dano forte, proteção por 3 turnos, fúria, execução
 mago:[2,3,3,5],      // queimadura, barreira, tempestade, meteoro
 arqueiro:[1,2,3,4],  // tiro simples, múltiplas flechas, perfuração, disparo mortal
 ladino:[1,2,3,4]     // furtivo, veneno, dança, assassinato
});
export const SPECIALIZATION_COOLDOWNS=Object.freeze({
 berserker:[2,4],guardiao:[3,4],arquimago:[3,5],feiticeiro:[2,4],
 atirador:[2,4],cacador:[2,4],assassino:[2,4],sombra:[2,4]
});
export function skillKey(cls,index){return `${cls}:skill:${index}`;}
export function specKey(specId,index){return `${specId}:spec:${index}`;}
export function playerSkillCooldown(cls,index){return PLAYER_COOLDOWNS[cls]?.[index]??0;}
export function specSkillCooldown(specId,index){return SPECIALIZATION_COOLDOWNS[specId]?.[index]??0;}
export function turnsRemaining(holder,key){return Math.max(0,Math.trunc(holder?.cooldowns?.[key]||0));}
export function canUse(holder,key){return turnsRemaining(holder,key)===0;}
export function tickCooldowns(holder){if(!holder)return;holder.cooldowns??={};for(const key of Object.keys(holder.cooldowns)){const remaining=turnsRemaining(holder,key)-1;if(remaining>0)holder.cooldowns[key]=remaining;else delete holder.cooldowns[key];}}
export function finishCooldownTurn(holder,usedKey=null,duration=0){tickCooldowns(holder);if(usedKey&&duration>0)holder.cooldowns[usedKey]=Math.trunc(duration);}
export function resetCooldowns(holder){if(holder)holder.cooldowns={};}
export function normalizeCombatCooldowns(holder){if(!holder)return;const clean={};for(const [key,value] of Object.entries(holder.cooldowns||{})){if(typeof key==='string'&&Number.isInteger(value)&&value>0&&value<=9)clean[key]=value;}holder.cooldowns=clean;}
export function playerCooldownDetails(state,index){const cls=state.cls;const skill=active[cls]?.[index];if(!skill)return null;return {id:skillKey(cls,index),turns:playerSkillCooldown(cls,index)};}
export function specCooldownDetails(state,index){const specId=state.specializations?.selected;const skill=specSkills(state)[index];if(!specId||!skill)return null;return {id:specKey(specId,index),turns:specSkillCooldown(specId,index)};}
