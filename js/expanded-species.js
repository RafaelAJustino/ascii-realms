// Expansion 1: fixed, region-specific opponents. No new maps, levels or rarities.
// New enemies use the existing monster AI; each receives its own deterministic profile.
import {maps} from './data.js';
import {SPECIES_PROFILES} from './elements.js';
const local = [
 [ ['Corvo Carniceiro','opportunist'],['Javali Espinhoso','aggressive'],['Cervo Corrompido','wild'],['Lince das Brumas','opportunist'],['Raiz Faminta','defensive'],['Vespa do Musgo','wild'],['Saqueador da Mata','aggressive',true],['Arqueiro Fora da Lei','strategic',true],['Urso da Clareira','defensive'],['Capitão dos Salteadores','strategic',true],['Aranha Matriarca','opportunist'],['Espírito do Carvalho','magical'] ],
 [ ['Víbora de Dunas','opportunist'],['Abutre Carmesim','wild'],['Chacal do Sal','aggressive'],['Besouro Solar','defensive'],['Lagarto de Vidro','wild'],['Escaravelho Dourado','defensive'],['Saqueador do Oásis','aggressive',true],['Desertor das Dunas','strategic',true],['Hiena Escarlate','opportunist'],['Capitão das Areias','strategic',true],['Serpente de Cristal','magical'],['Guardião de Obsidiana','defensive'] ],
 [ ['Mosquito Sepulcral','wild'],['Crocodilo do Lodo','aggressive'],['Aranha do Charco','opportunist'],['Raiz Pútrida','defensive'],['Enguia Sombria','wild'],['Bolha Ácida','magical'],['Contrabandista do Pântano','strategic',true],['Assaltante das Barcas','aggressive',true],['Corvo Pestilento','opportunist'],['Alquimista Exilado','magical',true],['Fera dos Juncos','aggressive'],['Ídolo Envenenado','defensive'] ],
 [ ['Cabra da Escarpa','wild'],['Gárgula de Basalto','defensive'],['Águia Serrana','opportunist'],['Aranha de Pedra','defensive'],['Morcego das Minas','wild'],['Vermes de Ferro','aggressive'],['Bandido da Passagem','strategic',true],['Desertor da Forja','aggressive',true],['Urso de Granito','defensive'],['Capataz Renegado','strategic',true],['Sentinela de Bronze','defensive'],['Titã de Rocha','aggressive'] ],
 [ ['Rato de Catacumba','wild'],['Múmia Rachada','defensive'],['Corvo Funerário','opportunist'],['Aranha Ossuária','wild'],['Cão Espectral','aggressive'],['Ídolo Esquecido','magical'],['Saqueador de Tumbas','opportunist',true],['Mercenário das Ruínas','strategic',true],['Armadura Vazia','defensive'],['Profanador do Selo','magical',true],['Guardião de Mármore','defensive'],['Lamento Ancestral','magical'] ],
 [ ['Raposa de Neve','opportunist'],['Coruja Boreal','wild'],['Aranha de Gelo','defensive'],['Alce Congelado','defensive'],['Foca das Fendas','wild'],['Vento Encarnado','magical'],['Caçador Desertor','strategic',true],['Saqueador de Trenós','aggressive',true],['Urso Glacial','aggressive'],['Capitão da Nevasca','strategic',true],['Colosso de Geada','defensive'],['Espectro de Gelo','magical'] ],
 [ ['Cão do Ossuário','aggressive'],['Corvo Maldito','wild'],['Aranha Cadavérica','opportunist'],['Morcego Espectral','wild'],['Armadura Profana','defensive'],['Vulto do Sino','magical'],['Ladrão de Relíquias','opportunist',true],['Cavaleiro Desertor','strategic',true],['Abutre de Ossos','wild'],['Necromante Errante','magical',true],['Algoz Sepulcral','aggressive'],['Arauto Espectral','magical'] ],
 [ ['Cão de Cinzas','aggressive'],['Morcego Incandescente','wild'],['Aranha de Brasa','opportunist'],['Serpente Magmática','wild'],['Besouro de Escória','defensive'],['Fagulha Viva','magical'],['Saqueador de Cinzas','aggressive',true],['Mercenário Infernal','strategic',true],['Carniçal de Enxofre','opportunist'],['Inquisidor Caído','magical',true],['Golem de Lava','defensive'],['Arauto do Calor','magical'] ],
 [ ['Leão Alado','aggressive'],['Corvo de Prata','wild'],['Cervo Astral','wild'],['Aranha Luminosa','opportunist'],['Estátua Animada','defensive'],['Serpente Radiante','magical'],['Desertor Celestial','strategic',true],['Saqueador de Relíquias','opportunist',true],['Grifo Menor','aggressive'],['Paladino Desviado','defensive',true],['Elemental da Aurora','magical'],['Guardião do Véu','strategic'] ],
 [ ['Cão do Nada','aggressive'],['Morcego Sem Rosto','wild'],['Aranha do Vazio','opportunist'],['Serpente Sem Sombra','wild'],['Sentinela Fraturada','defensive'],['Orbe Dissoluto','magical'],['Desertor do Fim','strategic',true],['Saqueador do Vazio','opportunist',true],['Predador Abissal','aggressive'],['Profeta Desfeito','magical',true],['Arauto da Ausência','magical'],['Colosso do Esquecimento','defensive'] ]
];
// Every region has exactly 12 baseline opponents and 3 uncommon specials.
const archetypeTuning={aggressive:{hp:.95,atk:1.12,def:.9},defensive:{hp:1.16,atk:.91,def:1.18},strategic:{hp:1,atk:1,def:1.04},opportunist:{hp:.93,atk:1.06,def:.96},magical:{hp:.88,atk:1.1,def:.92},wild:{hp:1,atk:1,def:1}};
const attackElements=['physical','fire','poison','lightning','dark','ice','dark','fire','holy','dark'];
export const REGION_SPECIES=Object.freeze(local.map((extra,r)=>Object.freeze([
 ...maps[r].slice(3,6).map((name,i)=>({id:`r${r}-original-${i}`,name,originalIndex:i,kind:'common',humanoid:i===2&&[1,2,4,6,7].includes(r),profile:SPECIES_PROFILES[name],hpFactor:1,atkFactor:1,defFactor:1,attackElement:attackElements[r]})),
 ...extra.map(([name,archetype,humanoid],i)=>{const tuning=archetypeTuning[archetype];const special=i>=9;return {id:`r${r}-${special?'special':'common'}-${i}`,name,originalIndex:i%3,kind:special?'special':'common',humanoid:!!humanoid,profile:{archetype,affinities: archetype==='magical'?{[attackElements[r]]:.85}:archetype==='defensive'?{physical:.9}:{}},hpFactor:+(tuning.hp*(special?1.12:1)*(1+((i%3)-1)*.025)).toFixed(3),atkFactor:+(tuning.atk*(special?1.08:1)*(1+((i%4)-1.5)*.022)).toFixed(3),defFactor:tuning.def,attackElement:attackElements[r]};})
])));
export function regionSpecies(region){return REGION_SPECIES[region]||[];}
export function pickRegionalSpecies(region,previous,random=Math.random){const list=regionSpecies(region);const special=random()<.08;let eligible=list.filter(e=>e.kind===(special?'special':'common')&&e.id!==previous);if(!eligible.length)eligible=list.filter(e=>e.id!==previous);return eligible[Math.min(eligible.length-1,Math.floor(random()*eligible.length))];}
// New ASCII silhouettes are shared by *type*, but every opponent has a distinct name,
// attributes and combat archetype. Original 30 artworks remain untouched.
const humanoidArt=String.raw`      .-======-.
     /  .--.  \\
    |  (o  o)  |
    |    /\    |
  __|___/||\___|__
 /__/  / || \  \__\\
      |  ||  |
      |__||__|
      /_/  \_\\`;
const beastArt=String.raw`   /\         /\
  /  \_______/  \\
 /    (o) (o)    \\
|   __  /\  __   |
 \_/  \____/  \_/
  /\   /||\   /\
 /  \_/ || \_/  \\
      __||__
     /_/  \_\\`;
const spiritArt=String.raw`      .-~~~~-.
    .'  o  o  '.
   /     /\     \\
  |   .-====-.   |
 /|  /  ||||  \  |\\
/ | /   ||||   \ | \\
  |/   /||||\   \|
      /_/  \_\\`;
const armoredArt=String.raw`      .========.
      | [o][o] |
    __|___||___|__
   /##/   ||   \##\\
  /__/  __||__  \__\\
     | |======| |
     |_|__||__|_|
     /___/  \___\\`;
export function regionalSpeciesArtwork(species){if(!species)return beastArt;return species.humanoid?humanoidArt:species.profile.archetype==='magical'?spiritArt:species.profile.archetype==='defensive'?armoredArt:beastArt;}
export const EXTENDED_ARTWORKS=Object.freeze(Object.fromEntries(REGION_SPECIES.flat().filter(s=>!s.id.includes('-original-')).map(s=>[s.name,regionalSpeciesArtwork(s)])));
