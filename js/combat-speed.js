/** Visual timing only. Never modifies combat probabilities or turn order. */
export const COMBAT_SPEED_KEY = 'ascii-realms-combat-speed';
export const COMBAT_SPEEDS = Object.freeze({
 normal: Object.freeze({label:'Normal',feedback:100,playerImpact:230,enemyPrepare:350,enemyImpact:240}),
 fast: Object.freeze({label:'Rápido',feedback:40,playerImpact:160,enemyPrepare:230,enemyImpact:150}),
 instant: Object.freeze({label:'Instantâneo',feedback:0,playerImpact:0,enemyPrepare:0,enemyImpact:0})
});
let selected='fast';
export function initCombatSpeed(store=globalThis.localStorage){
 try{const value=store?.getItem(COMBAT_SPEED_KEY);selected=Object.hasOwn(COMBAT_SPEEDS,value)?value:'fast';}catch{selected='fast';}
 return selected;
}
export function getCombatSpeed(){return selected;}
export function combatTimings(){return COMBAT_SPEEDS[selected];}
export function setCombatSpeed(value,store=globalThis.localStorage){
 if(!Object.hasOwn(COMBAT_SPEEDS,value))return false;
 selected=value;
 try{store?.setItem(COMBAT_SPEED_KEY,value);}catch{}
 return true;
}
export async function visualPause(ms){if(ms>0)await new Promise(resolve=>setTimeout(resolve,ms));}
initCombatSpeed();
