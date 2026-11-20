/**
 * Expansão Épica 7. Catálogo determinístico de receitas e mercado de insumos.
 * Não adiciona campos persistidos: os materiais são registrados no mapa existente.
 */
import {maps} from './data.js';
import {FORGE_MATERIALS} from './forge-materials.js';
import {catalogInRegion} from './equipment-catalog.js';

export const ARTISAN_CATALYSTS=Object.freeze([
 'Seiva Primordial','Âmbar Escarlate','Sal de Miasma','Carvão Rúnico',
 'Pó de Relicário','Orvalho Glacial','Tinta Maldita','Enxofre Vivo',
 'Luz Condensada','Éter do Eclipse'
]);
const validRegion=region=>Number.isInteger(region)&&region>=0&&region<10;
export function materialMarket(region){
 if(!validRegion(region))return [];
 const factor=region+1;
 return [
  {name:maps[region][6],type:'regional',region,price:45*factor,sell:9*factor,description:'Exploração e chefes'},
  {name:FORGE_MATERIALS[region],type:'forja',region,price:65*factor,sell:13*factor,description:'Criaturas e exploração'},
  {name:ARTISAN_CATALYSTS[region],type:'catalisador',region,price:140*factor,sell:25*factor,description:'Criaturas, chefes e refino'}
 ];
}
const marketIndex=new Map(Array.from({length:10},(_,region)=>materialMarket(region)).flat().map(entry=>[entry.name,entry]));
export function materialSaleValue(name,region){return marketIndex.get(name)?.sell||10*(region+1);}
export function materialBuyOffer(region,name){return materialMarket(region).find(entry=>entry.name===name)||null;}
export function refiningCost(region){
 if(!validRegion(region))return null;
 return {gold:35*(region+1),materials:{[FORGE_MATERIALS[region]]:2,[maps[region][6]]:1},result:ARTISAN_CATALYSTS[region]};
}

/** 8 modelos pré-definidos e uma preparação alquímica em cada região. */
export function artisanRecipes(region,cls){
 if(!validRegion(region)||!['guerreiro','mago','arqueiro','ladino'].includes(cls))return [];
 const models=catalogInRegion(region,null,cls);
 const weapons=models.filter(item=>item.category==='weapon');
 const armor=models.filter(item=>item.category==='armor');
 const accessories=models.filter(item=>item.category==='accessory');
 const chosen=[...weapons,...armor.filter(item=>item.slot==='body'),armor.find(item=>item.slot==='head'&&item.armor===3),accessories.find(item=>item.slot==='ring'&&item.style==='precision'),accessories.find(item=>item.slot==='amulet'&&item.style==='focus')];
 if(chosen.length!==8||chosen.some(item=>!item))throw Error('Catálogo de fabricação incompleto');
 const main=FORGE_MATERIALS[region],local=maps[region][6],catalyst=ARTISAN_CATALYSTS[region];
 const entries=chosen.map((model,i)=>({
  id:`ep7-${model.id}`,name:model.name,slot:model.slot,level:model.level,region,modelId:model.id,rarity:i>=6?2:1,
  category:'artesanal',materials:{[main]:2+Math.floor(i/2),[local]:1+i%2,[catalyst]:i>=6?2:1},
  gold:(region+1)*(90+i*25)
 }));
 entries.push({id:`ep7-r${region}-provisions`,name:'Kit de sobrevivência (2 Vida + 1 Mana)',
  slot:'provisions',level:region*10+3,region,category:'suprimentos',
  materials:{[main]:2,[local]:2},gold:(region+1)*65,consumable:true,yields:{hp:2,mp:1}});
 return entries;
}
