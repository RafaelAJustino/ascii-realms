import {A} from './data.js';

// Apenas pontos confirmados pelo jogador. Nunca inclui classe, nível ou equipamentos.
export const MILESTONE_INTERVAL=5;
export const MILESTONE_RULES=Object.freeze({
 for:{label:'Dano físico',per:1,unit:'%',max:20},
 int:{label:'Dano mágico',per:1,unit:'%',max:20},
 agi:{label:'Esquiva',per:.5,unit:'pp',max:10},
 des:{label:'Chance crítica',per:.5,unit:'pp',max:10},
 vit:{label:'HP máximo',per:1,unit:'%',max:20},
 sor:{label:'Chance de equipamento',per:.5,unit:'pp',max:5}
});
export function normalizeInvested(value){
 return A.map((_,i)=>{const n=Array.isArray(value)?value[i]:undefined;return Number.isSafeInteger(n)&&n>=0&&n<=297?n:0;});
}
export function investedMilestones(value){const invested=normalizeInvested(value);return Object.fromEntries(A.map((key,i)=>{
 const rule=MILESTONE_RULES[key],points=invested[i],count=Math.floor(points/MILESTONE_INTERVAL);
 const total=Math.min(rule.max,count*rule.per);
 return [key,{points,count,progress:points%MILESTONE_INTERVAL,next:(count+1)*MILESTONE_INTERVAL,total,rule}];
}));}
export function earnedMilestones(before,after){const a=investedMilestones(before),b=investedMilestones(after);return A.filter(key=>b[key].count>a[key].count).map(key=>({...b[key],key,gained:b[key].count-a[key].count}));}
export function equipmentDropBonus(invested){return investedMilestones(invested).sor.total/100;}
