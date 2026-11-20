/** Comparação exata da ficha produzida pelo próprio motor de atributos.
 *  A simulação não substitui itens, não aplica mudanças e não persiste nada.
 */
import {stats} from './player.js';
const FIELDS=Object.freeze([
 ['atk','Ataque físico',''],['mag','Ataque mágico',''],
 ['def','Defesa física',''],['md','Defesa mágica',''],
 ['maxhp','HP máximo',''],['maxmp','MP máximo',''],
 ['hit','Precisão','%'],['dodge','Esquiva','%'],
 ['crit','Crítico','%'],['regen','Regeneração','']
]);
export const EQUIPMENT_SLOTS=Object.freeze({weapon:'Arma',head:'Cabeça',body:'Peitoral',hands:'Mãos',feet:'Pés',ring:'Anel',amulet:'Amuleto'});
export function compareEquipment(state,item){
 if(!state||!item||!Object.hasOwn(EQUIPMENT_SLOTS,item.slot)||!state.items?.some(it=>it.uid===item.uid))return null;
 const before=stats(),after=stats(state.stats,state.investedStats,{...state.equip,[item.slot]:item.uid});
 const fields=FIELDS.map(([key,label,unit])=>({key,label,unit,before:before[key],after:after[key],difference:after[key]-before[key]}));
 return {currentItem:state.items.find(it=>it.uid===state.equip[item.slot])||null,item,fields,changed:fields.filter(x=>Math.abs(x.difference)>0.0001)};
}
export function formatValue(value,unit=''){
 const clean=Math.abs(value)<0.0001?0:value;
 return (Number.isInteger(clean)?String(clean):clean.toFixed(1))+unit;
}
