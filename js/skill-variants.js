import {active} from './data.js';
export const SKILL_VARIANTS={
 standard:{name:'Original',description:'Custo e efeito padrão da habilidade.'},
 power:{name:'Potência',description:'Efeito mais forte, com consumo maior de MP.'},
 economy:{name:'Economia',description:'Menor consumo de MP, com efeito reduzido.'}
};
export function normalizeSkillVariants(s){
 const raw=s&&typeof s==='object'&&!Array.isArray(s)?s:{};
 return Object.fromEntries(Object.entries(raw).filter(([key,id])=>/^[0-3]$/.test(key)&&Object.hasOwn(SKILL_VARIANTS,id)));
}
export function skillAt(state,index){return Number.isInteger(index)?active[state?.cls]?.[index]:null;}
export function configuredVariant(state,index){return normalizeSkillVariants(state?.skillVariants)[index]||'standard';}
export function effectiveSkill(state,index){
 const base=skillAt(state,index);if(!base)return null;
 const [name,level,cost,mult,type]=base,variant=configuredVariant(state,index),guard=type==='guard';
 let actualCost=cost,actualMult=mult,guardTurns=3;
 if(variant==='power'){actualCost=Math.ceil(cost*1.25);if(guard)guardTurns=4;else actualMult=+(mult*1.12).toFixed(4);}
 if(variant==='economy'){actualCost=Math.max(1,Math.ceil(cost*.75));if(guard)guardTurns=2;else actualMult=+(mult*.92).toFixed(4);}
 return {name,level,cost:actualCost,mult:actualMult,type,guardTurns,variant,baseCost:cost,baseMult:mult};
}
export function selectSkillVariant(state,index,id){
 if(!state||state.combat||!Number.isInteger(index)||!Object.hasOwn(SKILL_VARIANTS,id))return false;
 const skill=skillAt(state,index);
 if(!skill||state.lv<skill[1]||configuredVariant(state,index)===id)return false;
 state.skillVariants=normalizeSkillVariants(state.skillVariants);
 if(id==='standard')delete state.skillVariants[index];else state.skillVariants[index]=id;
 return true;
}
