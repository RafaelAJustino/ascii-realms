import {normalizeInvested,earnedMilestones} from './attribute-milestones.js';
import {stats} from './player.js';
import {save} from './storage.js';

// Exclusivamente memória de sessão. Nunca faz parte do estado persistido.
let draft=null;
export const ATTRIBUTE_HELP=[
 'Aumenta o ataque físico (2 por ponto, antes dos multiplicadores).',
 'Aumenta o MP máximo (+4), ataque mágico (+2,7) e defesa mágica (+0,8).',
 'Aumenta a chance de esquiva (+0,23 ponto percentual, até o limite).',
 'Aumenta o ataque físico (+0,8) e a precisão (+0,3 ponto percentual, até o limite).',
 'Aumenta o HP máximo (+7), a defesa física (+1,2) e a defesa mágica (+0,6).',
 'Aumenta a chance crítica (+0,32 ponto percentual) e o multiplicador de dano crítico (+0,005).'
];
export function pending(){return !!draft&&draft.some(n=>n>0);}
export function distribution(state){
 if(!draft)draft=[0,0,0,0,0,0];
 const spent=draft.reduce((sum,n)=>sum+n,0);
 return {spent,remaining:state.points-spent,delta:[...draft],preview:stats(state.stats.map((n,i)=>n+draft[i]),normalizeInvested(state.investedStats).map((n,i)=>n+draft[i])),current:stats(),invested:normalizeInvested(state.investedStats),plannedInvested:normalizeInvested(state.investedStats).map((n,i)=>n+draft[i])};
}
export function changeDraft(state,index,direction){
 if(!Number.isInteger(index)||index<0||index>=6||![-1,1].includes(direction))return false;
 distribution(state);
 if(direction===1&&draft.reduce((a,b)=>a+b,0)>=state.points)return false;
 if(direction===-1&&draft[index]===0)return false;
 draft[index]+=direction;return true;
}
export function discardDraft(){draft=null;}
export function applyDraft(state){
 if(!pending())return false;
 const delta=[...draft],spent=delta.reduce((a,b)=>a+b,0);
 if(!Number.isSafeInteger(state.points)||spent>state.points||delta.some(n=>!Number.isSafeInteger(n)||n<0)||state.stats.some((n,i)=>!Number.isSafeInteger(n)||!Number.isSafeInteger(n+delta[i])))return false;
 const oldStats=[...state.stats],oldInvested=normalizeInvested(state.investedStats),oldPoints=state.points;
 const nextInvested=oldInvested.map((n,i)=>n+delta[i]);
 if(nextInvested.some(n=>n>297))return false;
 state.stats=state.stats.map((n,i)=>n+delta[i]);state.investedStats=nextInvested;state.points-=spent;
 if(!save()){state.stats=oldStats;state.investedStats=oldInvested;state.points=oldPoints;return false;}
 draft=null;return true;
}
export function confirmLeave(ask=()=>true){if(!pending())return true;if(!ask('Descartar a distribuição provisória de atributos?'))return false;discardDraft();return true;}
