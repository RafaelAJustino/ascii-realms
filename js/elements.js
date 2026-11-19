// Multiplicador aplicado APÓS a mitigação por defesa, uma única vez.
export const ELEMENTS = Object.freeze(['physical','fire','ice','lightning','poison','dark','holy']);
export const ELEMENT_LABELS = Object.freeze({physical:'Físico',fire:'Fogo',ice:'Gelo',lightning:'Raio',poison:'Veneno',dark:'Sombrio',holy:'Sagrado'});
export const ELEMENT_MULTIPLIERS = Object.freeze({immune:0,strongResist:.65,resist:.85,neutral:1,weak:1.25,strongWeak:1.5});
// Dados adicionais por espécie; não substituem as definições originais.
const profiles = [
 [['Lobo','wild',{},{}],['Aranha','opportunist',{poison:.65},{fire:1.5}],['Ent','defensive',{physical:.85,poison:0},{fire:1.5}]],
 [['Escorpião','opportunist',{poison:.65},{ice:1.25}],['Serpente','wild',{poison:.65},{ice:1.25}],['Nômade','strategic',{fire:.85},{ice:1.25}]],
 [['Sapo','wild',{poison:.85},{lightning:1.25}],['Sanguessuga','opportunist',{poison:.65},{fire:1.25}],['Bruxa','magical',{dark:.65},{holy:1.5}]],
 [['Troll','aggressive',{physical:.85},{fire:1.25}],['Harpia','opportunist',{lightning:.85},{ice:1.25}],['Autômato','defensive',{poison:0,physical:.85},{lightning:1.5}]],
 [['Esqueleto','aggressive',{poison:0,dark:.85},{holy:1.5}],['Espectro','magical',{physical:.65,poison:0,dark:.65},{holy:1.5}],['Sentinela','defensive',{physical:.85},{lightning:1.25}]],
 [['Yeti','aggressive',{ice:.65},{fire:1.5}],['Lobo Polar','wild',{ice:.85},{fire:1.25}],['Elemental','magical',{ice:0},{fire:1.5}]],
 [['Carniçal','opportunist',{poison:.65,dark:.85},{holy:1.5}],['Banshee','magical',{physical:.65,dark:.65},{holy:1.5}],['Cavaleiro','strategic',{dark:.85},{holy:1.25}]],
 [['Diabrete','wild',{fire:.65},{ice:1.5}],['Salamandra','aggressive',{fire:0},{ice:1.5}],['Cultista','magical',{fire:.85,dark:.85},{holy:1.25}]],
 [['Arconte','strategic',{holy:.65},{dark:1.5}],['Quimera','aggressive',{fire:.85},{ice:1.25}],['Vigia','defensive',{holy:.85},{dark:1.25}]],
 [['Sombra','opportunist',{dark:0,physical:.85},{holy:1.5}],['Aberração','aggressive',{dark:.65},{holy:1.25}],['Eco','magical',{dark:.85,physical:.65},{holy:1.5}]]
];
export const SPECIES_PROFILES = Object.freeze(Object.fromEntries(profiles.flat().map(([name,archetype,resist,weak])=>[name,{archetype,affinities:{...resist,...weak}}])));
export const BOSS_PROFILES = Object.freeze({
 'Guardião das Raízes':{archetype:'defensive',affinities:{fire:1.5,poison:0}},'Escorpião Imperial':{archetype:'opportunist',affinities:{poison:.65,ice:1.25}},'Hidra Venenosa':{archetype:'strategic',affinities:{poison:0,fire:1.25}},'Golem Ancestral':{archetype:'defensive',affinities:{physical:.65,lightning:1.5}},'Rei Esquecido':{archetype:'strategic',affinities:{dark:.65,holy:1.5}},'Dragão Glacial':{archetype:'aggressive',affinities:{ice:0,fire:1.5}},'Senhor dos Mortos':{archetype:'magical',affinities:{dark:0,holy:1.5}},'Demônio das Chamas':{archetype:'aggressive',affinities:{fire:0,ice:1.5}},'Serafim Corrompido':{archetype:'strategic',affinities:{holy:.65,dark:1.5}},'Entidade Primordial':{archetype:'strategic',affinities:{dark:.65,holy:1.25}}
});
export function elementMultiplier(target,element='physical') {return target?.affinities?.[element]??1;}
export function applyElementalDamage(mitigated,target,element='physical') {return Math.max(0,Math.floor(Math.max(0,mitigated)*elementMultiplier(target,element)));}
export function elementalMessage(target,element){const factor=elementMultiplier(target,element);if(factor===0)return 'O ataque não causou dano!';if(factor>1)return `O inimigo é vulnerável a ${ELEMENT_LABELS[element]}!`;if(factor<1)return 'O inimigo resistiu ao ataque!';return null;}
export const PLAYER_SKILL_ELEMENTS = Object.freeze({guerreiro:['physical','physical','physical','physical'],mago:['fire','holy','lightning','fire'],arqueiro:['physical','physical','physical','physical'],ladino:['physical','poison','dark','physical']});
