/** Unified combat status/event dispatch. Applied at most once per status per target. */
export const STATUS=Object.freeze({
 poison:{name:'Veneno',duration:3,power:.028,periodic:true},burn:{name:'Queimadura',duration:3,power:.027,periodic:true},bleed:{name:'Sangramento',duration:2,power:.022,periodic:true},
 weaken:{name:'Enfraquecimento',duration:2,power:.16},mark:{name:'Marca do Caçador',duration:3,power:.12},freeze:{name:'Lentidão Glacial',duration:2,power:.10},evade:{name:'Passo Sombrio',duration:2,power:.08},
 guard:{name:'Guarda',duration:2,power:.55},defdown:{name:'Defesa reduzida',duration:2,power:.2},stun:{name:'Atordoamento',duration:1,power:0}
});
export function statusActive(effects,type){return Array.isArray(effects)&&effects.some(x=>x.type===type&&x.duration>0);}
export function applyStatus(effects,type,{duration=null,power=null,boss=false}={}){
 if(!Array.isArray(effects)||!STATUS[type])return false;
 if(boss&&type==='stun')type='freeze';
 const base=STATUS[type],dur=Math.max(1,Math.min(4,Math.trunc(duration??base.duration)-(boss&&['weaken','freeze','mark'].includes(type)?1:0))),amount=Math.max(0,Math.min(.3,power??base.power));
 const old=effects.find(e=>e.type===type);
 if(old){old.duration=Math.max(old.duration,dur);old.power=Math.max(old.power||0,amount);return false;}
 effects.push({type,name:base.name,duration:dur,power:amount});return true;
}
export function expireStatuses(effects){if(!Array.isArray(effects))return;for(const e of [...effects]){e.duration--;if(e.duration<=0)effects.splice(effects.indexOf(e),1);}}
export function periodicStatuses(target,effects,{poisonBoost=0,log=()=>{}}={}){if(!Array.isArray(effects))return 0;let damage=0;
 for(const e of effects){if(!STATUS[e.type]?.periodic||e.duration<=0)continue;const amount=Math.max(1,Math.floor(Math.max(1,target.maxhp)*Math.min(.065,(e.power||0)*(e.type==='poison'?1+poisonBoost:1))));target.hp=Math.max(0,target.hp-amount);damage+=amount;log(`${e.name}: -${amount} HP.`);}return damage;
}
export function statusValue(effects,type){const e=effects?.find(x=>x.type===type&&x.duration>0);return e?.power||0;}
/** Non-recursive event order: dispatch returns one-shot signals; no event invokes dispatch. */
export function combatEvent(event,context){switch(event){
 case 'onDodge':return {resource:1,log:'Esquiva bem-sucedida'};
 case 'onGuard':return {resource:1,log:'Bloqueio bem-sucedido'};
 case 'onHit':return {resource:1,log:'Ataque conectado'};
 case 'onKill':return {resource:0,log:'Inimigo derrotado'};
 default:return {resource:0,log:''};
}}
