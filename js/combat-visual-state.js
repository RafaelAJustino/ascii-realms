/** Estado exclusivamente visual. Nunca faz parte do save nem da simulação de combate. */
let nextSessionId=0;
let nextEventId=0;
export function resetCombatVisualState(runtime){
 runtime.combatVisualId=++nextSessionId;
 runtime.float=null;
 runtime.impactMeta=null;
 runtime.phase='idle';
 return runtime.combatVisualId;
}
export function invalidateCombatVisualState(runtime){return resetCombatVisualState(runtime);}
export function currentVisualSession(runtime,id,combat){
 return runtime.combatVisualId===id&&runtime.state?.combat===combat;
}
/** Apenas ações que realmente alteraram HP criam números de dano ou cura. */
export function impactResult(before,after,side,meta=null){
 const delta=(side==='enemy'?before.enemy-after.enemy:before.player-after.player);
 if(!Number.isFinite(delta)||delta===0)return null;
 return {side,amount:Math.abs(delta),heal:delta<0,critical:delta>0&&side==='enemy'&&!!meta?.critical,
  element:side==='enemy'?meta?.element||null:null,key:++nextEventId};
}

export function activeVisualSession(id){return id==null||id===nextSessionId;}
