/** Identidades estáveis das quatro classes. Os recursos pertencem ao combate, não ao save. */
import {active} from './data.js';
export const CLASS_RESOURCES=Object.freeze({
 guerreiro:{id:'determination',name:'Determinação',max:5},mago:{id:'concentration',name:'Concentração Arcana',max:5},
 arqueiro:{id:'aim',name:'Mira',max:5},ladino:{id:'opportunity',name:'Oportunidade',max:5}
});
const skillDescriptions={
 guerreiro:[['martial_strike','Ataque físico forte; reforçado por Determinação.'],['sunder','Enfraquece o ataque adversário por dois turnos.'],['iron_guard','Proteção curta que produz Determinação.'],['devastating_charge','Gasta 3 Determinação; rompe parte da defesa inimiga.']],
 mago:[['arcane_bolt','Projétil mágico eficiente que acumula Concentração.'],['flame_burst','Fogo intenso com queimadura de duração limitada.'],['frost_prison','Lentidão mágica e dano de gelo; chefes resistem.'],['arcane_storm','Gasta 3 Concentração; ataque elemental de grande impacto.']],
 arqueiro:[['precise_shot','Maior precisão, útil contra alvos evasivos.'],['piercing_arrow','Ignora parcialmente a armadura do alvo.'],['hunters_mark','Marca um inimigo durante três turnos, sem acumular.'],['arrow_rain','Gasta 3 de Mira para um disparo composto no alvo.']],
 ladino:[['twin_strike','Dois golpes independentes de menor potência.'],['venomed_blade','Veneno gradual; não acumula com outro veneno.'],['shadow_step','Eleva a esquiva temporariamente, sem ultrapassar o teto global.'],['execution','Gasta 3 Oportunidade e explora HP baixo ou veneno.']]
};
export const CLASS_SKILLS=Object.freeze(Object.fromEntries(Object.entries(skillDescriptions).map(([cls,rows])=>[cls,Object.freeze(rows.map(([id,description],i)=>Object.freeze({id,name:active[cls][i][0],description,resourceCost:i===3?3:0})))])));
export const CLASS_PASSIVES=Object.freeze({
 guerreiro:[{id:'martial_mastery',name:'Maestria Marcial',level:1,description:'+4% de dano físico; aperfeiçoa-se nos níveis 50, 75 e 100.'},{id:'tenacity',name:'Tenacidade',level:10,description:'Reduz em até 30% a duração de efeitos negativos.'},{id:'counterattack',name:'Contra-ataque',level:25,description:'Após bloquear, pequena chance de revidar uma vez.'},{id:'last_bastion',name:'Último Bastião',level:40,description:'Uma vez por combate: resistência extra com HP baixo.'}],
 mago:[{id:'elemental_affinity',name:'Afinidade Elemental',level:1,description:'+5% de dano elemental; aperfeiçoa-se nos níveis 50, 75 e 100.'},{id:'arcane_flow',name:'Fluxo Arcano',level:10,description:'Ao usar magias, recupera MP limitado por turno.'},{id:'arcane_knowledge',name:'Conhecimento Arcano',level:25,description:'+7% de eficiência mágica.'},{id:'resonance',name:'Ressonância Elemental',level:40,description:'Amplifica uma reação elemental existente, sem repeti-la.'}],
 arqueiro:[{id:'eagle_eye',name:'Olho de Águia',level:1,description:'+4 pontos percentuais de acerto; aperfeiçoa-se nos níveis 50, 75 e 100.'},{id:'hunter_instinct',name:'Instinto do Caçador',level:10,description:'+10% de dano em inimigos marcados.'},{id:'critical_shot',name:'Tiro Crítico',level:25,description:'+6% de dano crítico, respeitando o teto de chance.'},{id:'firing_rhythm',name:'Ritmo de Disparo',level:40,description:'Cada ataque consecutivo eleva o dano em até 9%.'}],
 ladino:[{id:'sneak_attack',name:'Ataque Furtivo',level:1,description:'+8% de dano em inimigos vulneráveis; aperfeiçoa-se nos níveis 50, 75 e 100.'},{id:'cat_reflexes',name:'Reflexos Felinos',level:10,description:'+3 pontos percentuais de esquiva até o teto.'},{id:'poison_master',name:'Mestre dos Venenos',level:25,description:'+20% de eficiência de venenos aplicados.'},{id:'opportunist_predator',name:'Predador Oportunista',level:40,description:'+9% de dano sob debuff ou ferimento grave.'}]
});
export function unlockedPassives(cls,lv){return (CLASS_PASSIVES[cls]||[]).filter(x=>lv>=x.level);}
export function hasPassive(state,id){return unlockedPassives(state.cls,state.lv).some(x=>x.id===id);}
export function passiveTier(level){return 1+(level>=50)+(level>=75)+(level>=100);}
export function initCombatResource(combat,cls){combat.classResource={key:cls,value:0};combat.passiveUses={};combat.sequence=0;return combat.classResource;}
export function resourceValue(combat){return Math.max(0,Math.min(5,combat?.classResource?.value||0));}
export function gainResource(combat,cls,amount=1){if(!combat||!CLASS_RESOURCES[cls])return 0;combat.classResource??={key:cls,value:0};combat.classResource.key=cls;const old=resourceValue(combat);combat.classResource.value=Math.min(CLASS_RESOURCES[cls].max,old+Math.max(0,amount));return combat.classResource.value-old;}
export function consumeResource(combat,cls,cost){if(cost<=0)return true;if(!combat||combat.classResource?.key!==cls||resourceValue(combat)<cost)return false;combat.classResource.value-=cost;return true;}
export function skillInfo(cls,index){return CLASS_SKILLS[cls]?.[index]||null;}
export function canPaySkillResource(combat,cls,index){return resourceValue(combat)>=(skillInfo(cls,index)?.resourceCost||0);}
