/** Identidade específica para as 90 áreas comuns e para os 10 chefes regionais.
 * Preserva as dez artes e kits artesanais como base, variando técnicas,
 * apresentação e graduação por área sem criar uma segunda IA de combate.
 */
import {MINI_BOSSES,miniBossArtwork} from './mini-bosses.js';
import {maps} from './data.js';
import {isStageBossArea} from './exploration-challenge.js';
const epithets=['Guardião','Vigia','Caçador','Arauto','Sentinela','Devastador','Espectro','Campeão','Soberano'];
const personalNames=[
 ['Vesper','Lórien','Tharn','Brumor','Eldorn','Sylvar','Korven','Briar','Valther'],
 ['Safira','Kharis','Zahra','Sethar','Azir','Zulmir','Khoran','Drazir','Nefra'],
 ['Morghul','Gral','Umbrak','Murk','Gorun','Zoltar','Nerith','Drakor','Orrim'],
 ['Rothgar','Faldren','Brakor','Torvek','Durn','Haldor','Gorvek','Grun','Korad'],
 ['Eldric','Ravenar','Tyrnus','Orvel','Darrak','Galdor','Vorken','Ennar','Mortis'],
 ['Skadi','Frith','Nivorn','Kelda','Vinter','Glacis','Rimor','Iskar','Borh'],
 ['Noxara','Corvyn','Maleth','Nyx','Vorath','Akris','Velar','Dusk','Morrin'],
 ['Ignivar','Calder','Zarnak','Vulkor','Pyrr','Ignis','Volkar','Brasa','Magmar'],
 ['Auralis','Sirel','Ardyn','Kelmor','Varian','Erel','Teral','Orian','Lyrin'],
 ['Umbriel','Vorth','Kharon','Valis','Noctis','Aramor','Zarik','Veld','Xerun']
];
export const AREA_MINI_BOSSES=Object.freeze(Array.from({length:100},(_,i)=>{
 const area=i+1;if(isStageBossArea(area))return null;
 const region=Math.floor(i/10),variant=i%10,base=MINI_BOSSES[region];
 const name=variant===0?base.name:`${personalNames[region][variant]}, ${epithets[variant]} de ${base.biome}`;
 return Object.freeze({...base,id:`area-${area}-${base.id}`,area,region,name,
  intro:variant===0?base.intro:`Na área ${area}, ${name} emerge como uma ameaça que domina ${base.biome}. ${base.intro}`,
  defeat:variant===0?base.defeat:`${name} cai diante do aventureiro. O caminho fica livre.`,
  hp:base.hp*(1+(variant%3)*.015),atk:base.atk*(1+(variant%2)*.012),def:base.def*(1+(variant%4)*.01),
  passives:base.passives.map((p,j)=>({...p,id:`a${area}-${p.id}`,name:variant===0?p.name:`${p.name} ${variant+j+1}`})),
  skills:base.skills.map(([id,title,element,power,kind],j)=>[`a${area}-${id}`,variant===0?title:`${title}: ${epithets[(variant+j)%9]}`,element,power*(1+((variant+j)%3)*.015),kind])});
}));
export const miniBossForArea=area=>AREA_MINI_BOSSES[Number(area)-1]||null;
export function miniBossArtworkForArea(area){
 const kit=miniBossForArea(area);if(!kit)return '';
 const source=miniBossArtwork(kit.region);
 const n=Number(area),mark=`= AREA ${String(n).padStart(3,'0')} =`;
 const edge=Array.from({length:50},(_,i)=>'@%#*+-:.'[(i*n+Math.floor(i/3)+n)%8]).join('');
 const middle=Array.from({length:50},(_,i)=>'=.:-*#%@'[(i*3+n*7+Math.floor(i/5))%8]).join('');
 const label=mark.padStart(Math.floor((50+mark.length)/2),'=').padEnd(50,'=');
 return [edge,label,...source.split('\n').map((row,i)=>i%5===0?middle.slice(0,3)+row.slice(3,47)+middle.slice(47):row),edge].join('\n');
}
export function areaBossWarning(area,count){const name=miniBossForArea(area)?.name||maps[Math.floor((area-1)/10)]?.[2]||'o chefe';
 if(count===5)return `Você encontra sinais da passagem de ${name}.`;
 if(count===10)return `Marcas recentes anunciam que ${name} se aproxima.`;
 if(count===14)return `O ar fica pesado. ${name} observa seus movimentos.`;
 return '';
}
export function stageBossForArea(area){if(!isStageBossArea(area))return null;const region=area/10-1;
 return {area,name:maps[region][2],biome:maps[region][0],intro:`A última exploração do território desperta ${maps[region][2]}. A Fase ${region+1} chega ao seu confronto decisivo.`};}
