import {rt} from './runtime.js';
import {maps,classes} from './data.js';
import {mapId} from './utils.js';
import {makeItem} from './equipment.js';
import {save} from './storage.js';
import {render} from './ui.js';
import {statAdd} from './progression.js';

export const FORGE_MATERIALS=['Ferro Bruto','Cristal Escarlate','Essência Venenosa','Aço das Montanhas','Fragmento Antigo','Cristal Glacial','Essência Sombria','Núcleo Infernal','Fragmento Celestial','Matéria do Vazio'];
export const SETS=[
 ['Guardião Silvestre','defensive'],['Caçador Escarlate','critical'],['Alquimista do Pântano','magic'],['Bastião de Ferro','defensive'],['Legado das Ruínas','offensive'],['Coração Glacial','magic'],['Juramento Sombrio','critical'],['Fúria Infernal','offensive'],['Graça Celestial','defensive'],['Soberania do Vazio','magic']
].map(([name,style],region)=>({id:`set-${region}`,name,style,region}));
export const UPGRADE_BONUS=[0,.05,.10,.15,.20,.25,.32,.39,.46,.53,.60];
export const UPGRADE_CHANCE=[1,1,1,.95,.90,.80,.70,.60,.50,.40,.30];
const SLOTS=['weapon','head','body','hands','feet','ring','amulet'];
export function recipes(region){if(!Number.isInteger(region)||region<0||region>9)return [];const lv=region*10+3,mat=FORGE_MATERIALS[region],local=maps[region][6];return [
 ...['weapon','body','ring','elixir'].map((slot,i)=>({id:`forge-${region}-${slot}`,name:slot==='elixir'?'Elixir Especial':({weapon:'Arma Forjada',body:'Armadura Forjada',ring:'Anel Forjado'})[slot],slot,level:lv,region,materials:{[mat]:i===3?1:2+i,[local]:i===3?2:1},gold:(region+1)*(i===3?40:100+i*35),consumable:slot==='elixir'})),
 ...['head','body','hands','feet','weapon'].map((slot,i)=>({id:`set-${region}-${slot}`,name:`${SETS[region].name} (${slot})`,slot,level:lv+Math.min(5,i),region,setId:SETS[region].id,materials:{[mat]:3+i,[local]:2},gold:(region+1)*(160+i*45)}))
];}
export function canAfford(materials,gold){return Number.isFinite(gold)&&gold>=0&&rt.state.gold>=gold&&Object.entries(materials).every(([k,v])=>Number.isInteger(v)&&v>0&&(rt.state.materials[k]||0)>=v);}
function spend(materials,gold){rt.state.gold-=gold;statAdd('goldSpent',gold);for(const [k,v] of Object.entries(materials))rt.state.materials[k]-=v;}
export function craft(id){if(rt.state.combat)return false;const region=mapId(rt.area),recipe=recipes(region).find(x=>x.id===id);if(!recipe||rt.state.lv<recipe.level||!canAfford(recipe.materials,recipe.gold))return false;const item=recipe.consumable?null:makeItem(recipe.level,recipe.slot,rt.state.cls,recipe.setId?2:1,region);if(item&&recipe.setId)item.setId=recipe.setId;spend(recipe.materials,recipe.gold);if(item)rt.state.items.push(item);else rt.state.consumables.elixir=(rt.state.consumables.elixir||0)+1;rt.log=[`Fabricado: ${item?.name||recipe.name}.`,...rt.log].slice(0,30);save();render();return true;}
export function upgradeCost(item){const next=(item.upgrade||0)+1;if(next>10)return null;const region=Math.max(0,Math.min(9,item.region??mapId(item.lv)));return {next,chance:UPGRADE_CHANCE[next],bonus:UPGRADE_BONUS[next],gold:Math.ceil((item.lv*8+35)*next*next/3),materials:{[FORGE_MATERIALS[region]]:Math.ceil(next/2)}};}
export function enhance(uid,random=Math.random){if(rt.state.combat)return false;const item=rt.state.items.find(x=>x.uid===uid);if(!item||!SLOTS.includes(item.slot))return false;const cost=upgradeCost(item);if(!cost||!canAfford(cost.materials,cost.gold))return false;spend(cost.materials,cost.gold);const success=random()<cost.chance;if(success)item.upgrade=cost.next;rt.log=[success?`${item.name} aprimorado para +${item.upgrade}!`:`Falha no aprimoramento de ${item.name}.`,...rt.log].slice(0,30);save();render();return success;}
export function setBonuses(items){const count={};for(const it of items)if(it?.setId)count[it.setId]=(count[it.setId]||0)+1;const total={attack:0,magic:0,def:0,crit:0,vit:0,regen:0};const active=[];for(const set of SETS){const n=count[set.id]||0;if(n<2)continue;const factor=set.region+1,bonus={attack:0,magic:0,def:0,crit:0,vit:0,regen:0};if(n>=2)bonus[set.style==='defensive'?'def':set.style==='magic'?'magic':'attack']+=factor*3;if(n>=3)bonus.vit+=factor*2;if(n>=4)bonus[set.style==='critical'?'crit':set.style==='defensive'?'def':set.style==='magic'?'magic':'attack']+=factor*4;if(n>=5)bonus.regen+=factor;for(const k of Object.keys(total))total[k]+=bonus[k];active.push({set,n,bonus});}return {total,active};}
