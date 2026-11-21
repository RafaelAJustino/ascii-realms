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

// Talentos adicionais. Somente os valores investidos e confirmados desbloqueiam efeitos.
export const SPECIAL_MILESTONES=Object.freeze({
 for:[['impact',15,'Golpe Impactante','8% de chance de enfraquecer por um turno.'],['brutal',30,'Poder Brutal','+5% para ataques físicos de impacto.'],['implacable',50,'Força Implacável','+6% de dano contra armaduras elevadas.'],['titan',75,'Titã','+4% de dano físico adicional.']],
 int:[['clarity',15,'Clareza Arcana','Recupera até 2 MP ao usar magia.'],['channel',30,'Canalização','+4% de dano mágico ao gastar concentração.'],['master_element',50,'Mestre Elemental','+5% de dano elemental.'],['archmage',75,'Arquimago','+4% de dano mágico.']],
 agi:[['fast_reflexes',15,'Reflexos Rápidos','Ganha 1 recurso de classe ao esquivar, limitado.'],['fluid',30,'Movimento Fluido','+2pp de esquiva por um turno após defesa.'],['survival',50,'Instinto de Sobrevivência','+3pp esquiva com HP abaixo de 30%.'],['untouchable',75,'Intocável','+2pp esquiva respeitando teto de 40%.']],
 des:[['accuracy',15,'Precisão Aprimorada','+3pp de precisão.'],['calculated',30,'Golpe Calculado','+5% no multiplicador crítico.'],['technique',50,'Mestre da Técnica','+4% de dano em golpes precisos.'],['lethal',75,'Precisão Letal','+5% de dano crítico.']],
 vit:[['robust',15,'Constituição Robusta','Reduz a duração de efeitos negativos.'],['recovery',30,'Recuperação Natural','Recupera 1% de HP após se proteger, limitado.'],['survivor',50,'Sobrevivente','Reduz 5% do dano sofrido com HP baixo.'],['living_fortress',75,'Fortaleza Viva','Reduz 3% do dano sofrido.']],
 sor:[['fortunate',15,'Afortunado','Chance limitada de consumível extra após vitórias elegíveis.'],['unexpected',30,'Descoberta Inesperada','Pequeno bônus em recompensas raras elegíveis.'],['destiny',50,'Destino Favorável','Recuperação ocasional e limitada ao fim do combate.'],['favor',75,'Favor da Fortuna','Bônus limitado de chance de equipamento.']]
});
export function specialMilestones(value){const invested=normalizeInvested(value);return Object.fromEntries(A.map((key,i)=>[key,SPECIAL_MILESTONES[key].map(([id,points,name,description])=>({id,points,name,description,unlocked:invested[i]>=points}))]));}
export function hasMilestone(invested,key,id){return specialMilestones(invested)[key]?.some(x=>x.id===id&&x.unlocked)||false;}

