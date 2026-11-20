import {CATALOG_BY_ID,createCatalogItem} from './equipment-catalog.js';
import {materialBuyOffer,materialSaleValue} from './artisan-economy.js';
import { statAdd } from './progression.js';
import { rt } from './runtime.js';
import { maps, classes, active, passiveLevels, passiveNames, art, A, N, KEY } from './data.js';
import { clamp, rand, escape, mapId, tier, xpNeed, bar } from './utils.js';
import { save } from './storage.js';
import { makeItem } from './equipment.js';
import {cityPrice,cityOffer,canBuyOffer,markOfferBought,forgeOrder,canForgeOrder,markForgeOrder} from './city-life.js';
import { render } from './ui.js';
export function buyItem(slot,lv,cls=rt.state?.cls){if(!rt.state||rt.state.combat||!['weapon','head','body','hands','feet','ring','amulet'].includes(slot)||!Number.isInteger(lv)||lv<1||lv>100||cls!==rt.state.cls)return false;let item=makeItem(lv,slot,cls,0);const price=rt.screen==='city'?cityPrice(rt.state,mapId(rt.area),item.price):item.price;if(rt.state.gold<price)return false;rt.state.gold-=price;statAdd('goldSpent',price);rt.state.items.push(item);save();render();return true;}

/** Compra exatamente o modelo anunciado, mantendo descontos e requisitos existentes. */
export function buyCatalogItem(catalogId){
 if(!rt.state||rt.state.combat||rt.screen!=='city')return false;
 const region=mapId(rt.area),model=CATALOG_BY_ID.get(catalogId);
 if(!model||model.region!==region||model.level>rt.state.lv||model.slot==='weapon'&&model.cls!==rt.state.cls)return false;
 const item=createCatalogItem(model);
 const price=cityPrice(rt.state,region,item.price);
 if(rt.state.gold<price)return false;
 rt.state.gold-=price;statAdd('goldSpent',price);
 rt.state.items.push(item);
 rt.cityFeedback=`Adquirido: ${item.name}, ${price} Ouro.`;
 save();render();return true;
}

export function buyPotion(type){if(!rt.state||rt.state.combat||!['hp','mp','elixir','antidote'].includes(type))return false;let price=rt.screen==='city'?cityPrice(rt.state,mapId(rt.area),potionPrice(type)):potionPrice(type);if(rt.state.gold<price)return false;rt.state.gold-=price;statAdd('goldSpent',price);rt.state.consumables[type]=(rt.state.consumables[type]||0)+1;save();render();return true;}

export function potionPrice(t){const base={hp:25,mp:25,elixir:110,antidote:20}[t];return Number.isFinite(base)?base*(mapId(rt.area)+1):null;}

export function sell(uid){if(!rt.state||rt.state.combat)return false;let i=rt.state.items.findIndex(x=>x.uid===uid);if(i<0||Object.values(rt.state.equip).includes(uid))return false;const price=rt.state.items[i].price;if(!Number.isFinite(price)||price<0)return false;const received=Math.floor(price*.45);rt.state.gold+=received;statAdd('goldEarned',received);rt.state.items.splice(i,1);save();render();return true;}

export function sellMaterial(name){
 if(!rt.state||rt.state.combat||!Number.isInteger(rt.state.materials[name])||rt.state.materials[name]<=0)return false;
 rt.state.materials[name]--;
 const received=materialSaleValue(name,mapId(rt.area));
 rt.state.gold+=received;statAdd('goldEarned',received);save();render();return true;
}
/** Só oferece os três insumos naturais da cidade atual. Preço coincide com o exibido. */
export function buyMaterial(name){
 if(!rt.state||rt.state.combat||rt.screen!=='city')return false;
 const region=mapId(rt.area),offer=materialBuyOffer(region,name);
 if(!offer)return false;
 const price=cityPrice(rt.state,region,offer.price);
 if(rt.state.gold<price)return false;
 rt.state.gold-=price;statAdd('goldSpent',price);
 rt.state.materials[name]=(rt.state.materials[name]||0)+1;
 rt.cityFeedback=`Insumo comprado: ${name} por ${price} ouro.`;
 save();render();return true;
}

/** Estoque especial limitado, com preço igual ao anunciado na interface. */
export function buyCityOffer(){if(!rt.state||rt.screen!=='city')return false;
 const region=mapId(rt.area);if(!canBuyOffer(rt.state,region))return false;
 const offer=cityOffer(rt.state,region),item=makeItem(offer.lv,offer.slot,rt.state.cls,offer.rarity,region);
 if(item.price!==offer.basePrice||!markOfferBought(rt.state,offer))return false;
 rt.state.gold-=offer.price;statAdd('goldSpent',offer.price);rt.state.items.push(item);rt.cityFeedback=`Estoque especial adquirido: ${item.name} por ${offer.price} ouro.`;save();render();return true;
}
/** Encomenda única regional que reutiliza o gerador de equipamentos existente. */
export function orderFromForge(){if(!rt.state||rt.screen!=='forge')return false;
 const region=mapId(rt.area);if(!canForgeOrder(rt.state,region))return false;
 const order=forgeOrder(rt.state,region);if(!markForgeOrder(rt.state,region))return false;
 const item=makeItem(order.level,order.slot,rt.state.cls,order.rarity,region);
 rt.state.gold-=order.gold;rt.state.materials[order.material]-=order.required;
 statAdd('goldSpent',order.gold);rt.state.items.push(item);
 rt.cityFeedback=`Encomenda concluída: ${item.name}.`;save();render();return true;
}
