// Regras puras: não alteram as fórmulas de dano nem a ordem dos turnos.
import {availableMonsterActions} from './monster-ai.js';
import {ELEMENT_LABELS} from './elements.js';

export const TELEGRAPH_PROBABILITY=Object.freeze({elite:.18,champion:.24,legendary:.30});
export const MONSTER_PATTERNS=Object.freeze({
 aggressive:'Prioriza ataques ofensivos.',
 defensive:'Procura se curar e proteger quando ameaçado.',
 strategic:'Considera defesas e afinidades elementais.',
 opportunist:'Pressiona alvos com pouca vida.',
 magical:'Prefere habilidades mágicas e debuffs.',
 wild:'Alterna ações com maior imprevisibilidade.'
});
export function selectAnnouncedAction(enemy,{random=Math.random}={}){
 if(!enemy||enemy.boss||enemy.telegraph||(enemy.telegraphCooldown||0)>0)return null;
 const chance=TELEGRAPH_PROBABILITY[enemy.rarityId]||0;
 if(!chance||random()>=chance)return null;
 // A mesma seleção de habilidades existentes, sem criar golpes de dano extra.
 const available=availableMonsterActions(enemy).filter(a=>a.kind==='damage'&&a.power>=1.3);
 if(!available.length)return null;
 const chosen=available.find(a=>a.id==='element')||available.find(a=>a.id==='heavy');
 if(!chosen)return null;
 return chosen.id==='element'?{...chosen,element:enemy.attackElement||'fire'}:{...chosen};
}
export function announceMonsterAction(enemy,action){
 if(!action)return false;
 enemy.telegraph={kind:'monster',action:{...action},message:`${enemy.name} prepara ${action.name}. Você tem um turno para reagir.`};
 return true;
}
export function consumeAnnouncedAction(enemy){
 if(enemy?.telegraph?.kind!=='monster')return null;
 const action=enemy.telegraph.action;
 enemy.telegraph=null;
 enemy.telegraphCooldown=4;
 return action;
}

// Só reações com efeitos que o combate já aplica ao inimigo.
// Cada reação consome um efeito e adiciona no máximo 20% do dano efetivo.
export const ELEMENT_REACTIONS=Object.freeze({
 fire:{type:'poison',factor:.20,label:'Combustão: o fogo consumiu o veneno!'},
 ice:{type:'burn',factor:.10,label:'Choque térmico: o gelo dissipou a queimadura!'}
});
export function resolveElementReaction(enemy,element,damage){
 const rule=ELEMENT_REACTIONS[element];
 if(!rule||!enemy||!Array.isArray(enemy.effects)||!(damage>0))return {bonus:0,message:null};
 const idx=enemy.effects.findIndex(x=>x.type===rule.type&&x.duration>0);
 if(idx<0)return {bonus:0,message:null};
 enemy.effects.splice(idx,1);
 const bonus=Math.min(enemy.hp,Math.max(1,Math.floor(damage*rule.factor)));
 enemy.hp=Math.max(0,enemy.hp-bonus);
 return {bonus,message:`${rule.label} +${bonus} de dano.`,reaction:element};
}
export function observedElementLabel(element,factor){
 return `${ELEMENT_LABELS[element]||element}: ${factor===0?'Imune':factor>1?'Fraco':factor<1?'Resistente':'Neutro'} (${factor}x)`;
}
